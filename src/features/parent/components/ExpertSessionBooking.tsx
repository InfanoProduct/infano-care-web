'use client';

import { useState, useEffect } from 'react';
import Script from 'next/script';
import { ParentService } from '@/services/parent.service';
import { useAuthStore } from '@/store/auth-store';
import {
  Loader2, Search, Filter, Star, Clock, Video, Calendar,
  X, ChevronRight, AlertCircle, CheckCircle2, XCircle, RefreshCw
} from 'lucide-react';

interface Expert {
  id: string;
  displayName: string;
  specialisation: string;
  sessionPrice: number;
  avatarUrl?: string;
  availableSlots: string[];
}

interface Session {
  id: string;
  scheduledAt: string;
  status: string;
  meetLink?: string;
  expert?: {
    profile?: {
      displayName: string;
      specialisation?: string;
    };
  };
}

const SPECIALISATION_FILTERS = [
  { label: 'All Experts', value: '' },
  { label: 'Gynecologist', value: 'Gynecologist' },
  { label: 'Psychologist', value: 'Psychologist' },
  { label: 'Educator', value: 'Educator' },
];

// Generate realistic time slots for the next 7 days
function generateSlots(): string[] {
  const slots: string[] = [];
  const now = new Date();
  for (let dayOffset = 1; dayOffset <= 7; dayOffset++) {
    const date = new Date(now);
    date.setDate(date.getDate() + dayOffset);
    // Morning slot at 10:00
    const morning = new Date(date);
    morning.setHours(10, 0, 0, 0);
    slots.push(morning.toISOString());
    // Afternoon slot at 14:00
    const afternoon = new Date(date);
    afternoon.setHours(14, 0, 0, 0);
    slots.push(afternoon.toISOString());
    // Evening slot at 17:00
    const evening = new Date(date);
    evening.setHours(17, 0, 0, 0);
    slots.push(evening.toISOString());
  }
  return slots;
}

export function ExpertSessionBooking({ initialTab }: { initialTab?: 'browse' | 'sessions' } = {}) {
  const { user } = useAuthStore();
  const [experts, setExperts] = useState<Expert[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Booking modal state
  const [selectedExpert, setSelectedExpert] = useState<Expert | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [bookingStep, setBookingStep] = useState<'slot' | 'confirm' | 'processing' | 'success'>('slot');
  const [bookingError, setBookingError] = useState('');

  // Cancel/Reschedule state
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [rescheduleSession, setRescheduleSession] = useState<Session | null>(null);
  const [rescheduleSlot, setRescheduleSlot] = useState<string | null>(null);

  const [tab, setTab] = useState<'browse' | 'sessions'>(initialTab || 'browse');

  useEffect(() => {
    fetchExperts();
    fetchSessions();
  }, []);

  useEffect(() => {
    fetchExperts();
  }, [activeFilter]);

  const fetchExperts = async () => {
    try {
      setLoading(true);
      const data = await ParentService.getExperts(activeFilter || undefined);
      // Enrich with generated slots
      const enriched = (data || []).map((e: any) => ({
        ...e,
        availableSlots: generateSlots()
      }));
      setExperts(enriched);
    } catch (err) {
      console.error('Failed to fetch experts', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSessions = async () => {
    try {
      setSessionsLoading(true);
      const data = await (user?.role === 'TEEN' ? ParentService.getTeenExpertSessions() : ParentService.getExpertSessions());
      setSessions(data || []);
    } catch (err) {
      console.error('Failed to fetch sessions', err);
    } finally {
      setSessionsLoading(false);
    }
  };

  const openBookingModal = (expert: Expert) => {
    setSelectedExpert(expert);
    setSelectedSlot(null);
    setBookingStep('slot');
    setBookingError('');
  };

  const closeModal = () => {
    setSelectedExpert(null);
    setSelectedSlot(null);
    setBookingStep('slot');
    setBookingError('');
    setRescheduleSession(null);
    setRescheduleSlot(null);
  };

  const handleBookSession = async () => {
    if (!selectedExpert || !selectedSlot) return;
    setBookingStep('processing');
    setBookingError('');

    try {
      const order = await ParentService.bookExpertSession(selectedExpert.id, selectedSlot);

      if (order.razorpayOrderId) {
        if (typeof (window as any).Razorpay === 'undefined') {
          setBookingError('Payment gateway is still loading. Please wait a moment and try again.');
          setBookingStep('confirm');
          return;
        }

        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          amount: order.amount,
          currency: order.currency,
          name: 'Infano.care',
          description: `Expert Session: ${selectedExpert.displayName}`,
          order_id: order.razorpayOrderId,
          handler: async function (response: any) {
            try {
              await ParentService.verifyExpertSessionPayment({
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
                expertId: selectedExpert.id,
                scheduledAt: selectedSlot
              });
              setBookingStep('success');
              fetchSessions();
            } catch {
              setBookingError('Payment verification failed. Please contact support.');
              setBookingStep('confirm');
            }
          },
          prefill: {
            name: user?.username || '',
            contact: user?.phone || '',
          },
          modal: {
            ondismiss: () => {
              setBookingStep('confirm');
            }
          }
        };
        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      }
    } catch (err: any) {
      setBookingError(err.message || 'Failed to initiate booking');
      setBookingStep('confirm');
    }
  };

  const handleCancel = async (sessionId: string) => {
    setCancellingId(sessionId);
    try {
      await ParentService.cancelExpertSession(sessionId);
      fetchSessions();
    } catch (err: any) {
      alert(err.message || 'Failed to cancel session');
    } finally {
      setCancellingId(null);
    }
  };

  const handleReschedule = async () => {
    if (!rescheduleSession || !rescheduleSlot) return;
    try {
      await ParentService.rescheduleExpertSession(rescheduleSession.id, rescheduleSlot);
      fetchSessions();
      closeModal();
    } catch (err: any) {
      alert(err.message || 'Failed to reschedule session');
    }
  };

  const filteredExperts = experts.filter(e =>
    e.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.specialisation.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const upcomingSessions = sessions.filter(s => s.status === 'SCHEDULED' && new Date(s.scheduledAt) > new Date());
  const pastSessions = sessions.filter(s => s.status !== 'SCHEDULED' || new Date(s.scheduledAt) <= new Date());

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  };

  return (
    <div className="space-y-8">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />

      {/* Tab Switcher */}
      <div className="flex gap-2 bg-slate-100 p-1.5 rounded-2xl w-fit">
        <button
          onClick={() => setTab('browse')}
          className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
            tab === 'browse'
              ? 'bg-white text-primary shadow-sm'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Browse Experts
        </button>
        <button
          onClick={() => setTab('sessions')}
          className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 ${
            tab === 'sessions'
              ? 'bg-white text-primary shadow-sm'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          My Sessions
          {upcomingSessions.length > 0 && (
            <span className="w-5 h-5 bg-primary text-white rounded-full text-[10px] font-black flex items-center justify-center">
              {upcomingSessions.length}
            </span>
          )}
        </button>
      </div>

      {/* ========== BROWSE EXPERTS TAB ========== */}
      {tab === 'browse' && (
        <div className="space-y-6">
          {/* Search and Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Search experts by name or specialisation..."
                className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary/40 outline-none transition-all font-medium text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {SPECIALISATION_FILTERS.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setActiveFilter(f.value)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition-all whitespace-nowrap ${
                    activeFilter === f.value
                      ? 'bg-primary text-white border-primary shadow-md shadow-primary/20'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-primary/40 hover:text-primary'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Expert Cards Grid */}
          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="animate-spin text-primary" size={32} />
            </div>
          ) : filteredExperts.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-slate-100">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search size={24} className="text-slate-400" />
              </div>
              <p className="text-slate-500 font-semibold text-sm">No experts found matching your criteria.</p>
              <p className="text-slate-400 text-xs mt-1">Try adjusting your search or filter.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredExperts.map((expert) => (
                <div
                  key={expert.id}
                  className="bg-white rounded-3xl border border-slate-100 p-6 shadow-lg shadow-slate-200/20 hover:shadow-xl hover:shadow-slate-200/40 transition-all duration-300 group relative overflow-hidden"
                >
                  {/* Decorative gradient stripe */}
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary via-purple-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  <div className="flex items-start gap-4 mb-5">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/10 to-purple-100 flex items-center justify-center text-primary font-black text-lg border border-primary/10 shrink-0">
                      {getInitials(expert.displayName)}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-black text-slate-800 text-base truncate">{expert.displayName}</h3>
                      <p className="text-xs font-semibold text-slate-500 mt-0.5">{expert.specialisation}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 mb-5">
                    <div className="flex items-center gap-1.5 bg-amber-50 text-amber-600 px-2.5 py-1 rounded-lg border border-amber-100">
                      <Star size={12} fill="currentColor" />
                      <span className="text-[10px] font-black">Verified</span>
                    </div>
                    <div className="flex items-center gap-1 text-slate-400">
                      <Clock size={12} />
                      <span className="text-[10px] font-bold">45 min session</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Per Session</span>
                      <span className="text-xl font-black text-slate-800">₹{expert.sessionPrice}</span>
                    </div>
                    <button
                      onClick={() => openBookingModal(expert)}
                      className="px-5 py-2.5 bg-primary text-white rounded-xl font-bold text-xs hover:bg-primary/90 transition-all shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 active:scale-95 flex items-center gap-1.5"
                    >
                      Book Now
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========== MY SESSIONS TAB ========== */}
      {tab === 'sessions' && (
        <div className="space-y-6">
          {sessionsLoading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="animate-spin text-primary" size={32} />
            </div>
          ) : sessions.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-slate-100">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar size={24} className="text-slate-400" />
              </div>
              <p className="text-slate-500 font-semibold text-sm">No sessions booked yet.</p>
              <p className="text-slate-400 text-xs mt-1">Browse experts and book your first session!</p>
              <button onClick={() => setTab('browse')} className="mt-4 px-5 py-2 bg-primary text-white rounded-xl text-xs font-bold hover:bg-primary/90 transition-all">
                Browse Experts
              </button>
            </div>
          ) : (
            <>
              {/* Upcoming Sessions */}
              {upcomingSessions.length > 0 && (
                <div>
                  <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    Upcoming Sessions ({upcomingSessions.length})
                  </h3>
                  <div className="space-y-3">
                    {upcomingSessions.map((session) => (
                      <div key={session.id} className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                            <Video size={20} />
                          </div>
                          <div>
                            <p className="font-bold text-slate-800 text-sm">{session.expert?.profile?.displayName || 'Expert'}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs font-semibold text-slate-500">{formatDate(session.scheduledAt)}</span>
                              <span className="text-slate-300">·</span>
                              <span className="text-xs font-semibold text-primary">{formatTime(session.scheduledAt)}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 ml-16 sm:ml-0">
                          {session.meetLink && (
                            <a
                              href={session.meetLink}
                              target="_blank"
                              rel="noreferrer"
                              className="px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold hover:bg-primary/90 transition-all flex items-center gap-1.5"
                            >
                              <Video size={14} /> Join
                            </a>
                          )}
                          <button
                            onClick={() => {
                              setRescheduleSession(session);
                              setRescheduleSlot(null);
                            }}
                            className="p-2 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-xl transition-all"
                            title="Reschedule"
                          >
                            <RefreshCw size={16} />
                          </button>
                          <button
                            onClick={() => handleCancel(session.id)}
                            disabled={cancellingId === session.id}
                            className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all disabled:opacity-50"
                            title="Cancel"
                          >
                            {cancellingId === session.id ? <Loader2 size={16} className="animate-spin" /> : <XCircle size={16} />}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Past Sessions */}
              {pastSessions.length > 0 && (
                <div>
                  <h3 className="text-sm font-black text-slate-600 uppercase tracking-wider mb-3">Past Sessions</h3>
                  <div className="space-y-3">
                    {pastSessions.map((session) => (
                      <div key={session.id} className="bg-slate-50 rounded-2xl border border-slate-100 p-5 flex items-center gap-4 opacity-70">
                        <div className="w-10 h-10 rounded-xl bg-slate-200 flex items-center justify-center text-slate-400 shrink-0">
                          <Clock size={18} />
                        </div>
                        <div>
                          <p className="font-bold text-slate-600 text-sm">{session.expert?.profile?.displayName || 'Expert'}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs text-slate-400">{formatDate(session.scheduledAt)}</span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              session.status === 'COMPLETED' ? 'bg-green-100 text-green-600' :
                              session.status === 'CANCELLED' ? 'bg-rose-100 text-rose-600' : 'bg-slate-200 text-slate-500'
                            }`}>
                              {session.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ========== BOOKING MODAL ========== */}
      {selectedExpert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={closeModal}>
          <div
            className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white rounded-t-3xl z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/10 to-purple-100 flex items-center justify-center text-primary font-black text-sm">
                  {getInitials(selectedExpert.displayName)}
                </div>
                <div>
                  <h3 className="font-black text-slate-800 text-sm">{selectedExpert.displayName}</h3>
                  <p className="text-[11px] text-slate-500 font-semibold">{selectedExpert.specialisation} · ₹{selectedExpert.sessionPrice}</p>
                </div>
              </div>
              <button onClick={closeModal} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                <X size={18} className="text-slate-400" />
              </button>
            </div>

            <div className="p-6">
              {/* Slot Selection */}
              {bookingStep === 'slot' && (
                <div className="space-y-5">
                  <h4 className="text-xs font-black text-slate-600 uppercase tracking-wider">Select a Time Slot</h4>

                  <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                    {selectedExpert.availableSlots.map((slot) => {
                      const date = formatDate(slot);
                      const time = formatTime(slot);
                      const isSelected = selectedSlot === slot;
                      return (
                        <button
                          key={slot}
                          onClick={() => setSelectedSlot(slot)}
                          className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all text-left ${
                            isSelected
                              ? 'border-primary bg-primary/5 shadow-md shadow-primary/10'
                              : 'border-slate-100 hover:border-primary/30 hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isSelected ? 'bg-primary text-white' : 'bg-slate-100 text-slate-500'}`}>
                              <Calendar size={14} />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-800">{date}</p>
                              <p className="text-xs text-slate-500 font-semibold">{time}</p>
                            </div>
                          </div>
                          {isSelected && <CheckCircle2 size={18} className="text-primary" />}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => {
                      if (selectedSlot) setBookingStep('confirm');
                    }}
                    disabled={!selectedSlot}
                    className="w-full py-3.5 bg-primary text-white rounded-2xl font-bold text-sm shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Continue to Confirm
                  </button>
                </div>
              )}

              {/* Confirmation */}
              {bookingStep === 'confirm' && selectedSlot && (
                <div className="space-y-5">
                  <h4 className="text-xs font-black text-slate-600 uppercase tracking-wider">Confirm Your Booking</h4>

                  <div className="bg-slate-50 rounded-2xl border border-slate-100 p-5 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500 font-medium">Expert</span>
                      <span className="font-bold text-slate-800">{selectedExpert.displayName}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500 font-medium">Date</span>
                      <span className="font-bold text-slate-800">{formatDate(selectedSlot)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500 font-medium">Time</span>
                      <span className="font-bold text-slate-800">{formatTime(selectedSlot)}</span>
                    </div>
                    <div className="flex justify-between text-sm pt-2 border-t border-slate-200">
                      <span className="text-slate-500 font-medium">Amount</span>
                      <span className="font-black text-lg text-primary">₹{selectedExpert.sessionPrice}</span>
                    </div>
                  </div>

                  {bookingError && (
                    <div className="flex items-center gap-2 p-3 bg-rose-50 text-rose-600 rounded-xl text-xs font-semibold border border-rose-100">
                      <AlertCircle size={14} />
                      {bookingError}
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button
                      onClick={() => setBookingStep('slot')}
                      className="flex-1 py-3 border border-slate-200 text-slate-600 rounded-2xl font-bold text-sm hover:bg-slate-50 transition-all"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleBookSession}
                      className="flex-1 py-3 bg-primary text-white rounded-2xl font-bold text-sm shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all"
                    >
                      Pay ₹{selectedExpert.sessionPrice}
                    </button>
                  </div>
                </div>
              )}

              {/* Processing */}
              {bookingStep === 'processing' && (
                <div className="flex flex-col items-center py-12 gap-4">
                  <Loader2 className="animate-spin text-primary" size={36} />
                  <p className="text-sm font-bold text-slate-600">Processing your booking...</p>
                </div>
              )}

              {/* Success */}
              {bookingStep === 'success' && (
                <div className="flex flex-col items-center py-10 gap-5">
                  <div className="w-16 h-16 bg-green-50 text-green-500 rounded-full flex items-center justify-center border border-green-100">
                    <CheckCircle2 size={36} />
                  </div>
                  <div className="text-center">
                    <h4 className="text-lg font-black text-slate-800 mb-1">Booking Confirmed! 🎉</h4>
                    <p className="text-sm text-slate-500 font-medium">Your session with {selectedExpert.displayName} has been booked.</p>
                  </div>
                  <button
                    onClick={() => { closeModal(); setTab('sessions'); }}
                    className="px-6 py-3 bg-primary text-white rounded-2xl font-bold text-sm hover:bg-primary/90 transition-all"
                  >
                    View My Sessions
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========== RESCHEDULE MODAL ========== */}
      {rescheduleSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={closeModal}>
          <div
            className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-black text-slate-800 text-sm">Reschedule Session</h3>
              <button onClick={closeModal} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                <X size={18} className="text-slate-400" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-xs text-slate-500 font-semibold">
                Current: {formatDate(rescheduleSession.scheduledAt)} at {formatTime(rescheduleSession.scheduledAt)}
              </p>
              <h4 className="text-xs font-black text-slate-600 uppercase tracking-wider">Pick a New Time</h4>
              <div className="space-y-2 max-h-52 overflow-y-auto">
                {generateSlots().map((slot) => (
                  <button
                    key={slot}
                    onClick={() => setRescheduleSlot(slot)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left text-sm transition-all ${
                      rescheduleSlot === slot ? 'border-primary bg-primary/5' : 'border-slate-100 hover:border-primary/30'
                    }`}
                  >
                    <Calendar size={14} className={rescheduleSlot === slot ? 'text-primary' : 'text-slate-400'} />
                    <span className="font-bold text-slate-800">{formatDate(slot)}</span>
                    <span className="text-slate-500 font-medium">{formatTime(slot)}</span>
                  </button>
                ))}
              </div>
              <button
                onClick={handleReschedule}
                disabled={!rescheduleSlot}
                className="w-full py-3 bg-primary text-white rounded-2xl font-bold text-sm disabled:opacity-40 transition-all"
              >
                Confirm Reschedule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
