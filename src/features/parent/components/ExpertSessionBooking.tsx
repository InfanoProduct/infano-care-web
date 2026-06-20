'use client';

import { useState, useEffect } from 'react';
import Script from 'next/script';
import { ParentService } from '@/services/parent.service';
import { useAuthStore } from '@/store/auth-store';
import { ProgramsService } from '@/services/programs.service';
import {
  Loader2, Search, Filter, Star, Clock, Video, Calendar,
  X, ChevronRight, AlertCircle, CheckCircle2, XCircle, RefreshCw, Sparkles, Info
} from 'lucide-react';

const ENROLLED_THEMES: Record<string, { accent: string; gradient: string; border: string; badge: string; }> = {
  'SPARK': { accent: 'text-rose-600', gradient: 'from-rose-500 to-pink-600', border: 'border-rose-100', badge: 'bg-rose-50 border-rose-100 text-rose-700' },
  'RISE': { accent: 'text-violet-600', gradient: 'from-violet-500 to-indigo-600', border: 'border-violet-100', badge: 'bg-violet-50 border-violet-100 text-violet-700' },
  'BLOOM': { accent: 'text-emerald-600', gradient: 'from-emerald-500 to-teal-600', border: 'border-emerald-100', badge: 'bg-emerald-50 border-emerald-100 text-emerald-700' },
  'IGNITE': { accent: 'text-fuchsia-600', gradient: 'from-fuchsia-500 to-pink-600', border: 'border-fuchsia-100', badge: 'bg-fuchsia-50 border-fuchsia-100 text-fuchsia-700' },
  'UNSTOPPABLE': { accent: 'text-amber-600', gradient: 'from-amber-500 to-orange-600', border: 'border-amber-100', badge: 'bg-amber-50 border-amber-100 text-amber-700' },
};
const DEFAULT_ENROLLED_THEME = { accent: 'text-primary', gradient: 'from-primary to-accent', border: 'border-primary/20', badge: 'bg-primary/10 border-primary/20 text-primary' };


interface Expert {
  id: string;
  displayName: string;
  specialisation: string;
  consultationPrice: number;
  avatarUrl?: string;
  availableSlots: string[];
}

interface Session {
  id: string;
  scheduledAt: string;
  status: string;
  meetLink?: string;
  programId?: string | null;
  sessionNumber?: number | null;
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

export function ExpertSessionBooking({ initialTab }: { initialTab?: 'browse' | 'consultations' | 'demos' } = {}) {
  const { user } = useAuthStore();
  const [experts, setExperts] = useState<Expert[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [demoSessions, setDemoSessions] = useState<any[]>([]);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [demosLoading, setDemosLoading] = useState(false);
  const [enrollmentsLoading, setEnrollmentsLoading] = useState(true);
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

  const [tab, setTab] = useState<'browse' | 'consultations' | 'demos'>(initialTab || 'consultations');


  useEffect(() => {
    fetchExperts();
    fetchSessions();
    fetchDemoSessions();
    fetchEnrollments();
  }, []);

  useEffect(() => {
    fetchExperts();
  }, [activeFilter]);

  const fetchEnrollments = async () => {
    try {
      setEnrollmentsLoading(true);
      const res = await ProgramsService.getUserEnrollments();
      setEnrollments(res.data || []);
    } catch (err) {
      console.error('Failed to fetch enrollments:', err);
    } finally {
      setEnrollmentsLoading(false);
    }
  };

  const fetchDemoSessions = async () => {
    try {
      setDemosLoading(true);
      const res = await ProgramsService.getUserDemos();
      setDemoSessions(res.data || []);
    } catch (err) {
      console.error('Failed to fetch user demo sessions', err);
    } finally {
      setDemosLoading(false);
    }
  };

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
    <div className="space-y-6">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />

      {/* Tab Switcher */}
      <div className="flex gap-2 bg-slate-100 p-1.5 rounded-lg w-fit">
        <button
          onClick={() => setTab('consultations')}
          className={`px-5 py-2.5 rounded-md text-xs font-bold uppercase tracking-wider transition-all ${tab === 'consultations'
            ? 'bg-white text-primary shadow-sm'
            : 'text-slate-500 hover:text-slate-700'
            }`}
        >
          Consultations
        </button>
        <button
          onClick={() => setTab('browse')}
          className={`px-5 py-2.5 rounded-md text-xs font-bold uppercase tracking-wider transition-all ${tab === 'browse'
            ? 'bg-white text-primary shadow-sm'
            : 'text-slate-500 hover:text-slate-700'
            }`}
        >
          Browse Experts
        </button>
        <button
          onClick={() => setTab('demos')}
          className={`px-5 py-2.5 rounded-md text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${tab === 'demos'
            ? 'bg-white text-primary shadow-sm'
            : 'text-slate-500 hover:text-slate-700'
            }`}
        >
          Demo Sessions
          {demoSessions.length > 0 && (
            <span className="w-5 h-5 bg-primary text-white rounded-full text-[10px] font-bold flex items-center justify-center">
              {demoSessions.length}
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
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary/40 outline-none transition-all font-medium text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {SPECIALISATION_FILTERS.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setActiveFilter(f.value)}
                  className={`px-4 py-2.5 rounded-lg text-xs font-bold border transition-all whitespace-nowrap ${activeFilter === f.value
                    ? 'bg-primary text-white border-primary shadow-sm'
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
            <div className="text-center py-16 bg-white rounded-xl border border-slate-100">
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
                  className="bg-white rounded-xl border border-slate-100 p-6 shadow-sm hover:shadow-md transition-all duration-300 group relative overflow-hidden"
                >
                  {/* Decorative gradient stripe */}
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary via-purple-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  <div className="flex items-start gap-4 mb-5">
                    <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-primary/10 to-purple-100 flex items-center justify-center text-primary font-bold text-lg border border-primary/10 shrink-0">
                      {getInitials(expert.displayName)}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-slate-800 text-base truncate">{expert.displayName}</h3>
                      <p className="text-xs font-semibold text-slate-505 mt-0.5">{expert.specialisation}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 mb-5">
                    <div className="flex items-center gap-1.5 bg-amber-50 text-amber-600 px-2.5 py-1 rounded-md border border-amber-100">
                      <Star size={12} fill="currentColor" />
                      <span className="text-[10px] font-semibold">Verified</span>
                    </div>
                    <div className="flex items-center gap-1 text-slate-400">
                      <Clock size={12} />
                      <span className="text-[10px] font-bold">45 min session</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Per Session</span>
                      <span className="text-xl font-bold text-slate-800">₹{expert.consultationPrice}</span>
                    </div>
                    <button
                      onClick={() => openBookingModal(expert)}
                      className="px-5 py-2.5 bg-primary text-white rounded-lg font-bold text-xs hover:bg-primary/90 transition-all shadow-sm flex items-center gap-1.5"
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
      {/* ========== CONSULTATIONS TAB ========== */}
      {tab === 'consultations' && (
        <div className="space-y-8 animate-in fade-in duration-300">
          {enrollmentsLoading || sessionsLoading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="animate-spin text-primary" size={32} />
            </div>
          ) : (() => {
            // 1. Gather free consultations
            const programConsultations = enrollments.flatMap(enr => {
              const consultations = enr.program.consultations || [];
              if (!Array.isArray(consultations) || consultations.length === 0) return [];
              
              return consultations.map((consultation: any, idx: number) => {
                const sessionNum = -(idx + 1);
                const existingSession = sessions.find(s => s.programId === enr.programId && s.sessionNumber === sessionNum);
                return {
                  id: existingSession?.id || `free-${enr.id}-${idx}`,
                  isFree: true,
                  enr,
                  consultation,
                  idx,
                  existingSession,
                  scheduledAt: existingSession?.scheduledAt || null,
                  status: existingSession?.status || 'NOT_SCHEDULED',
                  meetLink: existingSession?.meetLink || null
                };
              });
            });

            // 2. Gather paid sessions
            const paidSessions = sessions.filter(s => !s.programId).map(session => ({
              id: session.id,
              isFree: false,
              session,
              scheduledAt: session.scheduledAt,
              status: session.status,
              meetLink: session.meetLink || null
            }));

            // Combine them
            const allConsultations = [...programConsultations, ...paidSessions];

            if (allConsultations.length === 0) {
              return (
                <div className="text-center py-16 bg-white rounded-xl border border-slate-100 p-8 shadow-sm">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Calendar size={24} className="text-slate-400" />
                  </div>
                  <p className="text-slate-500 font-semibold text-sm">No consultations found.</p>
                </div>
              );
            }

            // Separate into Upcoming (including unscheduled) and Past
            const upcomingConsultations = allConsultations.filter(c => {
              if (c.status === 'COMPLETED' || c.status === 'CANCELLED') return false;
              if (c.scheduledAt && new Date(c.scheduledAt) <= new Date()) return false;
              return true;
            });

            const pastConsultations = allConsultations.filter(c => {
              if (c.status === 'COMPLETED' || c.status === 'CANCELLED') return true;
              if (c.scheduledAt && new Date(c.scheduledAt) <= new Date()) return true;
              return false;
            });

            // Sort upcoming: scheduled ones sorted ascending by date (soonest first), unscheduled at the end
            upcomingConsultations.sort((a, b) => {
              if (!a.scheduledAt && !b.scheduledAt) return 0;
              if (!a.scheduledAt) return 1;
              if (!b.scheduledAt) return -1;
              return new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime();
            });

            // Sort past: descending by date (most recent first)
            pastConsultations.sort((a, b) => {
              if (!a.scheduledAt && !b.scheduledAt) return 0;
              if (!a.scheduledAt) return 1;
              if (!b.scheduledAt) return -1;
              return new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime();
            });

            return (
              <div className="space-y-8">
                {/* Upcoming & Active Section */}
                {upcomingConsultations.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                      <Sparkles size={16} className="text-violet-600" />
                      Upcoming & Active Consultations
                    </h3>
                    <div className="grid gap-4">                      {upcomingConsultations.map((c: any) => {
                        const isScheduled = !!c.scheduledAt;

                        if (isScheduled) {
                          // Scheduled Consultation Card (using violet shade color for both free and paid)
                          return (
                            <div
                              key={c.id}
                              className="p-5 border border-purple-200 rounded-lg shadow-md flex flex-col gap-3.5 relative overflow-hidden transition-all duration-300"
                              style={{ backgroundColor: '#F3E8FF', backgroundImage: 'linear-gradient(to bottom right, #FAF5FF, #EEF2F6)' }}
                            >
                              <div className="flex items-start gap-3.5 relative z-10">
                                <div className="w-10 h-10 bg-purple-600 text-white rounded-lg flex items-center justify-center shrink-0 shadow-md animate-pulse">
                                  <Video size={18} className="fill-white" />
                                </div>
                                <div className="space-y-1">
                                  <div className="flex flex-wrap items-center gap-2">
                                    {c.isFree && (
                                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider border bg-violet-100 text-violet-700 border-violet-200">
                                        Free
                                      </span>
                                    )}
                                    <span className="text-[10px] font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-md uppercase tracking-wider animate-pulse border border-purple-200">
                                      {c.isFree ? 'Upcoming Live' : 'Upcoming 1:1 Live'}
                                    </span>
                                    {c.status === 'RESCHEDULED' && (
                                      <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md uppercase tracking-wider border border-amber-200">
                                        Rescheduled
                                      </span>
                                    )}
                                    <span className="text-[11px] font-semibold text-slate-655 flex items-center gap-1">
                                      <Calendar size={11} /> {formatDate(c.scheduledAt!)} at {formatTime(c.scheduledAt!)}
                                    </span>
                                  </div>
                                  <h6 className="font-bold text-base text-slate-900 leading-tight">
                                    {c.isFree ? c.consultation.title : (c.session?.expert?.profile?.displayName || 'Expert')}
                                  </h6>
                                  <p className="text-xs text-slate-505 font-medium leading-relaxed">
                                    {c.isFree ? `Program: ${c.enr.program.title}` : '1:1 Scheduled Consultation'}
                                  </p>
                                </div>
                              </div>
                              <div className="border-t border-purple-200/50 pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-1 relative z-10">
                                <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 bg-white/40 px-3 py-1.5 rounded-lg border border-slate-200/10">
                                  <Info size={14} className="text-slate-400" /> Prepare your questions before class
                                </div>
                                <div className="flex items-center flex-wrap gap-2.5">
                                  {c.meetLink ? (
                                    <a
                                      href={c.meetLink}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center gap-1.5 text-xs transition-all active:scale-95 shadow-sm"
                                    >
                                      Join Live Class <ChevronRight size={14} />
                                    </a>
                                  ) : (
                                    <span className="text-xs font-bold bg-white/80 px-3 py-2 rounded-lg border border-slate-200 text-center text-slate-555">
                                      Link coming soon
                                    </span>
                                  )}
                                  {!c.isFree && (
                                    <>
                                      <button
                                        onClick={() => {
                                          setRescheduleSession(c.session);
                                          setRescheduleSlot(null);
                                        }}
                                        className="px-4 py-2 border border-primary/20 text-primary bg-white hover:bg-primary hover:text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs hover:shadow-sm cursor-pointer"
                                      >
                                        <RefreshCw size={13} /> Reschedule
                                      </button>
                                      <button
                                        onClick={() => handleCancel(c.session.id)}
                                        disabled={cancellingId === c.session.id}
                                        className="px-4 py-2 border border-rose-200 text-rose-600 bg-white hover:bg-rose-600 hover:text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 disabled:opacity-50 shadow-xs hover:shadow-sm cursor-pointer"
                                      >
                                        {cancellingId === c.session.id ? (
                                          <Loader2 size={13} className="animate-spin" />
                                        ) : (
                                          <XCircle size={13} />
                                        )}
                                        Cancel
                                      </button>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        } else {
                          // Unscheduled Free Consultation Card (using violet border/accenting styling)
                          return (
                            <div
                              key={c.id}
                              className="bg-white rounded-lg border border-violet-200/50 p-8 min-h-[120px] shadow-sm hover:shadow-md hover:border-violet-300 transition-all duration-300 flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative overflow-hidden group"
                            >
                              <div className="absolute inset-0 bg-gradient-to-r from-indigo-50/5 to-violet-50/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                              
                              <div className="flex items-start gap-5 relative z-10">
                                <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-violet-50 to-indigo-50 text-violet-650 border border-violet-100 font-black flex flex-col items-center justify-center shrink-0 leading-none shadow-xs">
                                  <span className="text-[10px] tracking-wider font-extrabold opacity-85">FREE</span>
                                  <span className="text-2xl font-black mt-0.5">{c.idx + 1}</span>
                                </div>
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2.5 flex-wrap">
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider border bg-violet-100 text-violet-700 border-violet-200">
                                      Free
                                    </span>
                                    <h4 className="font-extrabold text-slate-800 text-base">{c.consultation.title}</h4>
                                    <span className="text-[10px] font-black tracking-wider uppercase px-3 py-1 rounded-full border shadow-xs bg-slate-100 text-slate-500 border-slate-200">
                                      Not Scheduled
                                    </span>
                                  </div>
                                  <p className="text-xs text-slate-505 font-bold">
                                    Program: <span className="text-violet-600 font-semibold">{c.enr.program.title}</span>
                                  </p>
                                  <p className="text-xs text-slate-450 font-medium italic mt-2">
                                    Status: Not scheduled yet by assigned expert
                                  </p>
                                </div>
                              </div>
                            </div>
                          );
                        }
                      })}
                    </div>
                  </div>
                )}

                {/* Past Consultations Section */}
                {pastConsultations.length > 0 && (
                  <div className="space-y-4 pt-4 border-t border-slate-100/60">
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                      <Star size={16} className="text-slate-400" />
                      Past Consultations
                    </h3>
                    <div className="grid gap-4">
                      {pastConsultations.map((c: any) => {
                        let statusColor = 'bg-slate-200 text-slate-655 border-slate-300/55';
                        if (c.status === 'COMPLETED') {
                          statusColor = 'bg-green-100 text-green-700 border-green-200/55';
                        } else if (c.status === 'CANCELLED') {
                          statusColor = 'bg-rose-100 text-rose-700 border-rose-200/55';
                        }

                        return (
                          <div
                            key={c.id}
                            className="bg-violet-50/20 border border-violet-100/70 rounded-lg p-8 min-h-[120px] flex flex-col sm:flex-row sm:items-center justify-between gap-6 opacity-75 relative overflow-hidden"
                          >
                            <div className="flex items-start gap-5 relative z-10">
                              <div className="w-14 h-14 rounded-lg bg-slate-150 flex items-center justify-center text-slate-450 shrink-0 shadow-xs">
                                <Clock size={22} className="stroke-[2.5]" />
                              </div>
                              <div className="space-y-1">
                                <div className="flex items-center gap-2.5 flex-wrap">
                                  {c.isFree && (
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider border bg-violet-100/60 text-violet-700 border-violet-200/50">
                                      Free
                                    </span>
                                  )}
                                  <h4 className="font-extrabold text-slate-705 text-base">
                                    {c.isFree ? c.consultation.title : (c.session?.expert?.profile?.displayName || 'Expert')}
                                  </h4>
                                  <span className={`text-[10px] font-black tracking-wider uppercase px-3 py-1 rounded-full border shadow-xs ${statusColor}`}>
                                    {c.status}
                                  </span>
                                </div>
                                <p className="text-xs text-slate-450 font-bold">
                                  {c.isFree ? `Program: ${c.enr.program.title}` : '1:1 Consultation History'}
                                </p>
                                {c.scheduledAt && (
                                  <div className="flex items-center gap-2 mt-2 bg-white/60 px-3 py-1.5 rounded-xl border border-violet-100/50 w-fit">
                                    <Calendar size={13} className="text-slate-400" />
                                    <span className="text-xs font-bold text-slate-500">{formatDate(c.scheduledAt!)}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      )}

      {/* ========== DEMO SESSIONS TAB ========== */}
      {tab === 'demos' && (
        <div className="space-y-6">
          {demosLoading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="animate-spin text-primary" size={32} />
            </div>
          ) : demoSessions.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl border border-slate-100 p-8 shadow-sm">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar size={24} className="text-slate-400" />
              </div>
              <p className="text-slate-500 font-semibold text-sm">No demo sessions booked yet.</p>
              <p className="text-slate-400 text-xs mt-1">Explore our programs and book a free demo consultation!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {demoSessions.map((demo: any) => {
                const progName = demo.suggestedPrograms?.[0] || 'Program Demo';

                return (
                  <div
                    key={demo.id}
                    className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-violet-100 flex items-center justify-center text-violet-600 shrink-0">
                        <Calendar size={20} />
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 text-sm">{progName}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs font-semibold text-slate-500">{demo.slotDate || 'Date TBD'}</span>
                          <span className="text-slate-300">·</span>
                          <span className="text-xs font-semibold text-violet-600">{demo.slotTime || 'Time TBD'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-3 py-1.5 rounded-full border shadow-sm ${
                        demo.status === 'PENDING' ? 'bg-amber-100 text-amber-600 border-amber-200' :
                        demo.status === 'CONTACTED' ? 'bg-teal-100 text-teal-600 border-teal-200' :
                        demo.status === 'SCHEDULED' ? 'bg-purple-100 text-purple-600 border-purple-200' :
                        demo.status === 'COMPLETED' ? 'bg-green-100 text-green-600 border-green-200' :
                        'bg-rose-100 text-rose-600 border-rose-200'
                      }`}>
                        {demo.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}


      {/* ========== BOOKING MODAL ========== */}
      {selectedExpert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={closeModal}>
          <div
            className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white rounded-t-xl z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/10 to-purple-100 flex items-center justify-center text-primary font-bold text-sm border border-primary/10 shrink-0">
                  {getInitials(selectedExpert.displayName)}
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">{selectedExpert.displayName}</h3>
                  <p className="text-[11px] text-slate-500 font-semibold">{selectedExpert.specialisation} · ₹{selectedExpert.consultationPrice}</p>
                </div>
              </div>
              <button onClick={closeModal} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                <X size={18} className="text-slate-400" />
              </button>
            </div>

            <div className="p-6">
              {/* Slot Selection */}
              {bookingStep === 'slot' && (
                <div className="space-y-5">
                  <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider">Select a Time Slot</h4>

                  <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                    {selectedExpert.availableSlots.map((slot) => {
                      const date = formatDate(slot);
                      const time = formatTime(slot);
                      const isSelected = selectedSlot === slot;
                      return (
                        <button
                          key={slot}
                          onClick={() => setSelectedSlot(slot)}
                          className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all text-left ${isSelected
                            ? 'border-primary bg-primary/5 shadow-sm'
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
                    className="w-full py-3 bg-primary text-white rounded-lg font-bold text-sm shadow-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Continue to Confirm
                  </button>
                </div>
              )}

              {/* Confirmation */}
              {bookingStep === 'confirm' && selectedSlot && (
                <div className="space-y-5">
                  <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider">Confirm Your Booking</h4>

                  <div className="bg-slate-50 rounded-xl border border-slate-100 p-5 space-y-3">
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
                      <span className="font-bold text-lg text-primary">₹{selectedExpert.consultationPrice}</span>
                    </div>
                  </div>

                  {bookingError && (
                    <div className="flex items-center gap-2 p-3 bg-rose-50 text-rose-600 rounded-lg text-xs font-semibold border border-rose-100">
                      <AlertCircle size={14} />
                      {bookingError}
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button
                      onClick={() => setBookingStep('slot')}
                      className="flex-1 py-3 border border-slate-200 text-slate-600 rounded-lg font-bold text-sm hover:bg-slate-50 transition-all"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleBookSession}
                      className="flex-1 py-3 bg-primary text-white rounded-lg font-bold text-sm shadow-sm transition-all"
                    >
                      Pay ₹{selectedExpert.consultationPrice}
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
                    <h4 className="text-lg font-bold text-slate-800 mb-1">Booking Confirmed! 🎉</h4>
                    <p className="text-sm text-slate-500 font-medium">Your session with {selectedExpert.displayName} has been booked.</p>
                  </div>
                  <button
                    onClick={() => { closeModal(); setTab('consultations'); }}
                    className="px-6 py-3 bg-primary text-white rounded-lg font-bold text-sm hover:bg-primary/90 transition-all"
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
            className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-sm">Reschedule Session</h3>
              <button onClick={closeModal} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                <X size={18} className="text-slate-400" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-xs text-slate-500 font-semibold">
                Current: {formatDate(rescheduleSession.scheduledAt)} at {formatTime(rescheduleSession.scheduledAt)}
              </p>
              <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider">Pick a New Time</h4>
              <div className="space-y-2 max-h-52 overflow-y-auto">
                {generateSlots().map((slot) => (
                  <button
                    key={slot}
                    onClick={() => setRescheduleSlot(slot)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg border text-left text-sm transition-all ${rescheduleSlot === slot ? 'border-primary bg-primary/5' : 'border-slate-100 hover:border-primary/30'
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
                className="w-full py-3 bg-primary text-white rounded-lg font-bold text-sm disabled:opacity-40 transition-all"
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
