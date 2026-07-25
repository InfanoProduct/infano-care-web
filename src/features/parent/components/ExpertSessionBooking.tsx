'use client';

import { useState, useEffect } from 'react';
import Script from 'next/script';
import { ParentService } from '@/services/parent.service';
import { useAuthStore } from '@/store/auth-store';
import { ProgramsService } from '@/services/programs.service';
import {
  Loader2, Search, Filter, Star, Clock, Video, Calendar,
  X, ChevronRight, ChevronLeft, AlertCircle, CheckCircle2, XCircle, RefreshCw, Sparkles, Info, Lock
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
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  
  // Calendar View State
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [bookingStep, setBookingStep] = useState<'slot' | 'confirm' | 'processing' | 'success'>('slot');
  const [bookingError, setBookingError] = useState('');
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [expertSettings, setExpertSettings] = useState<any>(null);

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
      setExperts(data || []);
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


  const openBookingModal = async (expert: Expert) => {
    setSelectedExpert({ ...expert, availableSlots: [] });
    setSelectedSlot(null);
    setSelectedDate(null);
    setCurrentMonth(new Date());
    setBookingStep('slot');
    setBookingError('');
    setExpertSettings(null);
    setSlotsLoading(true);
    try {
      const res = await ParentService.getExpertSlots(expert.id);
      setSelectedExpert({ ...expert, availableSlots: res.data?.availableSlots || res.availableSlots || [] });
      setExpertSettings(res.data?.settings || res.settings || null);
    } catch (err) {
      console.error(err);
    } finally {
      setSlotsLoading(false);
    }
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
    <div className="space-y-6 font-sans">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />

      {/* Tab Switcher - Redesigned to match premium UI */}
      <div className="flex border-b border-slate-100 no-print pb-1 gap-2">
        {[
          { id: 'consultations', label: 'Consultations', count: sessions.length },
          { id: 'browse', label: 'Browse Experts', count: experts.length },
          { id: 'demos', label: 'Demo Sessions', count: demoSessions.length }
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id as any)}
            className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all relative ${
              tab === t.id
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
            }`}
          >
            <span className="flex items-center gap-1.5">
              {t.label}
              <span className={`px-1.5 py-px text-[9px] rounded-full font-black ${
                tab === t.id ? 'bg-white/25 text-white' : 'bg-slate-100 text-slate-650'
              }`}>
                {t.count}
              </span>
            </span>
          </button>
        ))}
      </div>


      {/* ========== BROWSE EXPERTS TAB ========== */}
      {tab === 'browse' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Search and Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Search experts by name or specialisation..."
                className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-205 bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-semibold text-sm shadow-3xs text-slate-800"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {SPECIALISATION_FILTERS.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setActiveFilter(f.value)}
                  className={`px-4 py-2.5 rounded-full text-xs font-black border transition-all whitespace-nowrap ${activeFilter === f.value
                    ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                    : 'bg-white text-slate-600 border-slate-205 hover:border-slate-350 hover:text-slate-800'
                    }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Expert Cards Grid */}
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="animate-spin text-primary" size={36} />
            </div>
          ) : filteredExperts.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-slate-150 p-6 shadow-2xs">
              <div className="w-14 h-14 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-350">
                <Search size={22} />
              </div>
              <h4 className="font-extrabold text-slate-800 text-sm">No experts found</h4>
              <p className="text-slate-500 font-semibold text-xs mt-1">Try adjusting your search query or filters.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredExperts.map((expert) => (
                <div
                  key={expert.id}
                  className="group relative bg-white rounded-2xl border border-slate-205 p-6 shadow-2xs hover:shadow-sm hover:border-slate-300 hover:-translate-y-0.5 transition-all duration-300 overflow-hidden"
                >
                  {/* Decorative watermark icon */}
                  <div className="absolute -right-3 -bottom-3 text-slate-400/5 pointer-events-none transform rotate-12 scale-150 group-hover:scale-155 transition-all duration-500">
                    <Star size={80} />
                  </div>
                  
                  {/* Decorative gradient stripe */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-primary via-purple-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  <div className="flex items-start gap-4 mb-5">
                    <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-primary/10 to-indigo-100 flex items-center justify-center text-primary font-black text-lg border border-primary/20 shrink-0">
                      {getInitials(expert.displayName)}
                    </div>
                    <div className="min-w-0 space-y-1">
                      <h3 className="font-black text-slate-900 text-base truncate group-hover:text-primary transition-colors">{expert.displayName}</h3>
                      <p className="text-xs font-bold text-slate-500 leading-none">{expert.specialisation}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 mb-5">
                    <div className="flex items-center gap-1 bg-amber-50 text-amber-700 px-2.5 py-0.5 rounded-full border border-amber-200/60">
                      <Star size={11} fill="currentColor" className="text-amber-500" />
                      <span className="text-[9px] font-black uppercase tracking-wider">Verified</span>
                    </div>
                    <div className="flex items-center gap-1 text-slate-500 bg-slate-50 px-2.5 py-0.5 rounded-full border border-slate-150/60">
                      <Clock size={11} />
                      <span className="text-[9px] font-black uppercase tracking-wider">45 min session</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-150/60 z-10 relative">
                    <div>
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Per Session</span>
                      <span className="text-xl font-black text-slate-900">₹{expert.consultationPrice}</span>
                    </div>
                    <button
                      onClick={() => openBookingModal(expert)}
                      className="px-5 py-2.5 bg-primary text-white rounded-full font-extrabold text-xs hover:bg-primary/95 shadow-3xs flex items-center gap-1 transition-all duration-200 active:scale-95 cursor-pointer"
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
            <div className="flex justify-center py-20">
              <Loader2 className="animate-spin text-primary" size={36} />
            </div>
          ) : (() => {
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

            const paidSessions = sessions.filter(s => !s.programId).map(session => ({
              id: session.id,
              isFree: false,
              session,
              scheduledAt: session.scheduledAt,
              status: session.status,
              meetLink: session.meetLink || null
            }));

            const allConsultations = [...programConsultations, ...paidSessions];

            if (allConsultations.length === 0) {
              return (
                <div className="text-center py-16 bg-white rounded-2xl border border-slate-150 p-8 shadow-2xs">
                  <div className="w-14 h-14 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-350">
                    <Calendar size={22} />
                  </div>
                  <h4 className="font-extrabold text-slate-800 text-sm">No consultations found</h4>
                  <p className="text-slate-500 font-semibold text-xs mt-1">Assign or schedule a class session to begin.</p>
                </div>
              );
            }

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

            upcomingConsultations.sort((a, b) => {
              if (!a.scheduledAt && !b.scheduledAt) return 0;
              if (!a.scheduledAt) return 1;
              if (!b.scheduledAt) return -1;
              return new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime();
            });

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
                    <h3 className="text-xs font-black text-slate-450 uppercase tracking-widest pl-1 flex items-center gap-2">
                      <Sparkles size={14} className="text-violet-600 animate-pulse" />
                      Upcoming & Active Consultations
                    </h3>
                    <div className="grid gap-5">
                      {upcomingConsultations.map((c: any) => {
                        const isScheduled = !!c.scheduledAt;

                        if (isScheduled) {
                          return (
                            <div
                              key={c.id}
                              className="group/scheduled p-6 border border-purple-200 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col gap-5 relative overflow-hidden bg-linear-to-br from-purple-50/80 via-indigo-50/30 to-white/90"
                            >
                              {/* Decorative live watermark icon */}
                              <div className="absolute -right-4 -bottom-4 text-purple-650/5 pointer-events-none transform -rotate-12 scale-160 group-hover/scheduled:scale-170 group-hover/scheduled:rotate-0 transition-all duration-750">
                                <Video size={100} className="fill-current" />
                              </div>
                              <div className="absolute -right-16 -top-16 w-48 h-48 bg-purple-200/30 rounded-full blur-2xl pointer-events-none" />
                              
                              <div className="flex flex-col sm:flex-row sm:items-start gap-4.5 relative z-10">
                                <div className="w-10 h-10 bg-purple-600 text-white rounded-lg flex items-center justify-center shrink-0 shadow-md animate-pulse">
                                  <Video size={18} className="fill-white" />
                                </div>
                                <div className="space-y-1.5 flex-1 min-w-0">
                                  <div className="flex flex-wrap items-center gap-2">
                                    {c.isFree && (
                                      <span className="text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider border bg-violet-100 text-violet-750 border-violet-200">
                                        Free
                                      </span>
                                    )}
                                    <span className="text-[9px] font-black text-purple-750 bg-purple-100 px-2.5 py-0.5 rounded-full uppercase tracking-wider animate-pulse border border-purple-200">
                                      {c.isFree ? 'Upcoming Live' : 'Upcoming 1:1 Live'}
                                    </span>
                                    {c.status === 'RESCHEDULED' && (
                                      <span className="text-[9px] font-black text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-full uppercase tracking-wider border border-amber-200">
                                        Rescheduled
                                      </span>
                                    )}
                                    <span className="text-[11px] font-black text-indigo-700 flex items-center gap-1">
                                      <Calendar size={12} className="text-purple-500" /> {formatDate(c.scheduledAt!)} at {formatTime(c.scheduledAt!)}
                                    </span>
                                  </div>
                                  <h6 className="font-black text-lg text-slate-900 leading-tight">
                                    {c.isFree ? c.consultation.title : (c.session?.expert?.profile?.displayName || 'Expert')}
                                  </h6>
                                  <p className="text-xs text-slate-700 font-semibold leading-relaxed">
                                    {c.isFree ? `Program: ${c.enr.program.title}` : '1:1 Scheduled Consultation'}
                                  </p>
                                </div>
                              </div>
                              <div className="border-t border-purple-100/80 pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-1 relative z-10">
                                <div className="flex items-center gap-2 text-xs font-bold text-purple-900 bg-white border border-purple-200/50 shadow-2xs px-3.5 py-2 rounded-xl">
                                  <Info size={14} className="text-purple-655 shrink-0" /> Prepare your questions before class
                                </div>
                                <div className="flex items-center flex-wrap gap-2.5">
                                  {c.meetLink ? (
                                    <a
                                      href={c.meetLink}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="bg-linear-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-extrabold py-2.5 px-6 rounded-full flex items-center justify-center gap-1.5 text-xs shadow-[0_4px_14px_rgba(124,58,237,0.3)] hover:shadow-[0_6px_20px_rgba(124,58,237,0.45)] hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
                                    >
                                      Join Live Class <ChevronRight size={14} />
                                    </a>
                                  ) : (
                                    <span className="text-xs font-bold bg-white/95 px-3 py-2.5 rounded-full border border-slate-200 text-center text-slate-550 shadow-3xs">
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
                                        className="px-4.5 py-2 border border-slate-205 hover:border-slate-350 hover:bg-slate-50 text-slate-655 rounded-full text-xs font-extrabold transition-all flex items-center gap-1 cursor-pointer active:scale-95 shadow-3xs"
                                      >
                                        <RefreshCw size={12} /> Reschedule
                                      </button>
                                      <button
                                        onClick={() => handleCancel(c.session.id)}
                                        disabled={cancellingId === c.session.id}
                                        className="px-4.5 py-2 border border-rose-200 text-rose-650 hover:bg-rose-50 rounded-full text-xs font-extrabold transition-all flex items-center gap-1 disabled:opacity-50 cursor-pointer active:scale-95 shadow-3xs"
                                      >
                                        {cancellingId === c.session.id ? (
                                          <Loader2 size={12} className="animate-spin" />
                                        ) : (
                                          <XCircle size={12} />
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
                          // Unscheduled Free Consultation Card (redesigned like visual program cards)
                          return (
                            <div
                              key={c.id}
                              className="group/locked relative p-5.5 bg-white border border-slate-205 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-5 hover:border-slate-350 hover:shadow-[0_8px_20px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 transition-all duration-300 overflow-hidden"
                            >
                              {/* Decorative lock watermark icon */}
                              <div className="absolute -right-3 -bottom-3 text-slate-300/15 pointer-events-none transform rotate-12 scale-150 group-hover/locked:scale-155 group-hover/locked:rotate-6 transition-all duration-500">
                                <Lock size={80} />
                              </div>
                              
                              <div className="flex items-start gap-4.5 relative z-10 flex-1 min-w-0">
                                <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-violet-50 to-indigo-50 text-violet-655 border border-violet-150 font-black flex flex-col items-center justify-center shrink-0 leading-none shadow-3xs">
                                  <span className="text-[9px] tracking-wider font-black opacity-85 uppercase">FREE</span>
                                  <span className="text-xl font-black mt-0.5">{c.idx + 1}</span>
                                </div>
                                <div className="space-y-1.5 flex-1 min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider border bg-violet-50 text-violet-750 border-violet-200/60">
                                      Free Slot
                                    </span>
                                    <span className="text-[9px] font-black tracking-wider uppercase px-2.5 py-0.5 rounded-full border shadow-3xs bg-slate-100 text-slate-700 border-slate-200">
                                      Not Scheduled
                                    </span>
                                  </div>
                                  <h4 className="font-black text-slate-900 text-base truncate leading-snug">{c.consultation.title}</h4>
                                  <p className="text-xs text-slate-700 font-semibold leading-relaxed">
                                    Program: <span className="text-violet-650 font-extrabold">{c.enr.program.title}</span>
                                  </p>
                                </div>
                              </div>
                              <div className="shrink-0 z-10 flex items-center gap-2.5 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                                <span className="text-xs font-bold text-slate-500 italic">Expert will assign a slot soon</span>
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
                  <div className="space-y-4 pt-4 border-t border-slate-100">
                    <h3 className="text-xs font-black text-slate-450 uppercase tracking-widest pl-1 flex items-center gap-2">
                      <Star size={14} className="text-slate-450" />
                      Past Consultations
                    </h3>
                    <div className="grid gap-4">
                      {pastConsultations.map((c: any) => {
                        let statusColor = 'bg-slate-100 text-slate-600 border-slate-250';
                        if (c.status === 'COMPLETED') {
                          statusColor = 'bg-green-50 text-green-700 border-green-200/60';
                        } else if (c.status === 'CANCELLED') {
                          statusColor = 'bg-rose-50 text-rose-700 border-rose-200/60';
                        }

                        return (
                          <div
                            key={c.id}
                            className="group bg-slate-50/50 border border-slate-200/80 rounded-2xl p-5 hover:border-slate-350 hover:bg-slate-50 transition-all duration-300 flex flex-col sm:flex-row sm:items-center justify-between gap-5 relative overflow-hidden"
                          >
                            <div className="flex items-start gap-4.5 relative z-10 flex-1 min-w-0">
                              <div className="w-12 h-12 rounded-xl bg-white text-slate-450 border border-slate-150 flex items-center justify-center shrink-0 shadow-3xs">
                                <Clock size={18} className="stroke-[2.5]" />
                              </div>
                              <div className="space-y-1.5 flex-1 min-w-0">
                                <div className="flex items-center gap-2.5 flex-wrap">
                                  {c.isFree && (
                                    <span className="text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider border bg-violet-50 text-violet-750 border-violet-200/60">
                                      Free
                                    </span>
                                  )}
                                  <h4 className="font-black text-slate-800 text-base truncate leading-snug">
                                    {c.isFree ? c.consultation.title : (c.session?.expert?.profile?.displayName || 'Expert')}
                                  </h4>
                                </div>
                                <p className="text-xs text-slate-600 font-bold">
                                  {c.isFree ? `Program: ${c.enr.program.title}` : '1:1 Consultation History'}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-3 shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-150/40 z-10 relative">
                              {c.scheduledAt && (
                                <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full border border-slate-200 text-slate-600 text-xs font-bold shadow-3xs">
                                  <Calendar size={12} className="text-slate-400" />
                                  <span>{formatDate(c.scheduledAt!)}</span>
                                </div>
                              )}
                              <span className={`text-[9px] font-black tracking-wider uppercase px-3 py-1.5 rounded-full border shadow-3xs ${statusColor}`}>
                                {c.status}
                              </span>
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
        <div className="space-y-6 animate-in fade-in duration-300">
          {demosLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="animate-spin text-primary" size={36} />
            </div>
          ) : demoSessions.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-slate-150 p-8 shadow-2xs">
              <div className="w-14 h-14 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-350">
                <Calendar size={22} />
              </div>
              <h4 className="font-extrabold text-slate-800 text-sm">No demo sessions booked yet</h4>
              <p className="text-slate-505 font-semibold text-xs mt-1">Explore our programs and request a free demo session consultation.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {demoSessions.map((demo: any) => {
                const progName = demo.suggestedPrograms?.[0] || 'Program Demo';

                return (
                  <div
                    key={demo.id}
                    className="group bg-white border border-slate-205 rounded-2xl p-5.5 shadow-2xs hover:shadow-sm hover:border-slate-300 hover:-translate-y-0.5 transition-all duration-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative overflow-hidden"
                  >
                    {/* Decorative watermark icon */}
                    <div className="absolute -right-3 -bottom-3 text-slate-400/5 pointer-events-none transform rotate-12 scale-150 group-hover:scale-155 transition-all duration-500">
                      <Calendar size={80} />
                    </div>
                    
                    <div className="flex items-center gap-4.5 relative z-10 flex-1 min-w-0">
                      <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-650 flex items-center justify-center border border-purple-100/60 shadow-3xs shrink-0">
                        <Calendar size={20} />
                      </div>
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <h4 className="font-black text-slate-900 text-base truncate leading-snug group-hover:text-primary transition-colors">{progName}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs font-bold text-slate-500">{demo.slotDate || 'Date TBD'}</span>
                          <span className="w-1 h-1 rounded-full bg-slate-300" />
                          <span className="text-xs font-extrabold text-purple-600">{demo.slotTime || 'Time TBD'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 z-10">
                      {demo.status === 'SCHEDULED' && demo.meetLink && (
                        <a
                          href={demo.meetLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3.5 py-1.5 bg-purple-650 hover:bg-purple-750 text-white font-bold rounded-xl border border-purple-700 shadow-3xs transition-all text-[10px] uppercase tracking-wider flex items-center gap-1.5 cursor-pointer hover:scale-105 active:scale-95"
                        >
                          <Video size={12} />
                          Join Meet
                        </a>
                      )}
                      <span className={`text-[9px] font-black px-3 py-1.5 rounded-full border shadow-3xs uppercase tracking-wider ${
                        demo.status === 'PENDING' ? 'bg-amber-50 text-amber-700 border-amber-200/60' :
                        demo.status === 'CONTACTED' ? 'bg-teal-50 text-teal-700 border-teal-200/60' :
                        demo.status === 'SCHEDULED' ? 'bg-purple-50 text-purple-700 border-purple-200/60' :
                        demo.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60' :
                        'bg-rose-50 text-rose-700 border-rose-200/60'
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200" onClick={closeModal}>
          <div
            className="bg-white rounded-[28px] shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-300 border border-slate-100"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white rounded-t-[28px] z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-linear-to-br from-primary/10 to-purple-100 flex items-center justify-center text-primary font-black text-sm border border-primary/10 shrink-0 shadow-3xs">
                  {getInitials(selectedExpert.displayName)}
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-sm">{selectedExpert.displayName}</h3>
                  <p className="text-[11px] text-slate-500 font-bold">{selectedExpert.specialisation} · ₹{selectedExpert.consultationPrice}</p>
                </div>
              </div>
              <button onClick={closeModal} className="p-2 hover:bg-slate-50 rounded-xl transition-all">
                <X size={18} className="text-slate-400 hover:text-slate-600" />
              </button>
            </div>

            <div className="p-6">
              {/* Slot Selection */}
              {bookingStep === 'slot' && (
                <div className="space-y-5">
                  <h4 className="text-xs font-black text-slate-450 uppercase tracking-widest pl-0.5">Select a Time Slot</h4>

                  {expertSettings && (
                    <div className="bg-blue-50/50 p-3 rounded-xl border border-blue-100 flex flex-col gap-1 text-xs text-slate-600">
                      <div className="flex items-center gap-2"><Clock size={14} className="text-blue-500"/> <span><b>Reschedule Policy:</b> {expertSettings.reschedulePolicy}</span></div>
                      <div className="flex items-center gap-2"><Calendar size={14} className="text-blue-500"/> <span><b>Booking Period:</b> Up to {expertSettings.bookingPeriodMonths} months ahead</span></div>
                    </div>
                  )}

                  {slotsLoading ? (
                    <div className="flex items-center justify-center p-8 text-slate-400">
                      <Loader2 className="w-6 h-6 animate-spin" />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {selectedExpert.availableSlots.length === 0 ? (
                        <p className="text-sm text-slate-500 text-center py-4">No available slots found for this expert.</p>
                      ) : (
                        (() => {
                          const groupedSlots: Record<string, string[]> = {};
                          selectedExpert.availableSlots.forEach(slot => {
                            const localDate = new Date(slot);
                            const y = localDate.getFullYear();
                            const m = String(localDate.getMonth() + 1).padStart(2, '0');
                            const d = String(localDate.getDate()).padStart(2, '0');
                            const dateKey = `${y}-${m}-${d}`;
                            
                            if (!groupedSlots[dateKey]) groupedSlots[dateKey] = [];
                            groupedSlots[dateKey].push(slot);
                          });
                          const dates = Object.keys(groupedSlots).sort();
                          const activeDate = selectedDate || dates[0];
                          
                          // Calendar logic
                          const year = currentMonth.getFullYear();
                          const month = currentMonth.getMonth();
                          const firstDayOfMonth = new Date(year, month, 1).getDay();
                          const daysInMonth = new Date(year, month + 1, 0).getDate();
                          
                          const nextMonth = (e: React.MouseEvent) => {
                            e.preventDefault();
                            setCurrentMonth(new Date(year, month + 1, 1));
                          };
                          const prevMonth = (e: React.MouseEvent) => {
                            e.preventDefault();
                            setCurrentMonth(new Date(year, month - 1, 1));
                          };
                          
                          const days = [];
                          for (let i = 0; i < firstDayOfMonth; i++) days.push(null);
                          for (let i = 1; i <= daysInMonth; i++) days.push(new Date(year, month, i));
                          
                          return (
                            <>
                              <div className="bg-white rounded-2xl border border-slate-200 p-3 mb-2">
                                <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-100">
                                  <button onClick={prevMonth} className="p-1.5 hover:bg-slate-100 rounded-full text-slate-500 transition-colors"><ChevronLeft size={16}/></button>
                                  <span className="text-sm font-bold text-slate-800">{currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                                  <button onClick={nextMonth} className="p-1.5 hover:bg-slate-100 rounded-full text-slate-500 transition-colors"><ChevronRight size={16}/></button>
                                </div>
                                
                                <div className="grid grid-cols-7 gap-1 text-center mb-1">
                                  {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                                    <span key={day} className="text-[10px] font-bold text-slate-400 uppercase">{day}</span>
                                  ))}
                                  
                                  {days.map((dateObj, i) => {
                                    if (!dateObj) return <div key={`empty-${i}`} className="h-8"></div>;
                                    
                                    const y = dateObj.getFullYear();
                                    const m = String(dateObj.getMonth() + 1).padStart(2, '0');
                                    const d = String(dateObj.getDate()).padStart(2, '0');
                                    const key = `${y}-${m}-${d}`; 
                                    
                                    const hasSlots = !!groupedSlots[key];
                                    const isSelected = activeDate === key;
                                    
                                    return (
                                      <button
                                        key={i}
                                        disabled={!hasSlots}
                                        onClick={(e) => {
                                          e.preventDefault();
                                          if (hasSlots) {
                                            setSelectedDate(key);
                                            setSelectedSlot(null);
                                          }
                                        }}
                                        className={`h-8 w-8 mx-auto rounded-full text-xs font-bold transition-all flex items-center justify-center ${
                                          isSelected 
                                            ? 'bg-primary text-white shadow-md shadow-primary/30' 
                                            : hasSlots 
                                              ? 'bg-primary/10 text-primary hover:bg-primary/20 cursor-pointer' 
                                              : 'text-slate-300 cursor-not-allowed opacity-50 hover:bg-transparent'
                                        }`}
                                      >
                                        {dateObj.getDate()}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                              
                              {activeDate && (
                                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                                  {groupedSlots[activeDate].map(slot => {
                                    const time = formatTime(slot);
                                    const isSelected = selectedSlot === slot;
                                    return (
                                      <button
                                        key={slot}
                                        onClick={() => setSelectedSlot(slot)}
                                        className={`flex items-center justify-center py-3 px-4 rounded-xl border transition-all cursor-pointer text-sm font-bold ${isSelected ? 'border-primary bg-primary/10 text-primary shadow-sm' : 'border-slate-200 bg-white text-slate-700 hover:border-primary/30 hover:bg-slate-50'}`}
                                      >
                                        {time}
                                      </button>
                                    );
                                  })}
                                </div>
                              )}
                            </>
                          );
                        })()
                      )}
                    </div>
                  )}

                  <button
                    onClick={() => {
                      if (selectedSlot) setBookingStep('confirm');
                    }}
                    disabled={!selectedSlot}
                    className="w-full py-3.5 bg-primary text-white rounded-full font-extrabold text-sm shadow-md transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary/95"
                  >
                    Continue to Confirm
                  </button>
                </div>
              )}

              {/* Confirmation */}
              {bookingStep === 'confirm' && selectedSlot && (
                <div className="space-y-5">
                  <h4 className="text-xs font-black text-slate-450 uppercase tracking-widest pl-0.5">Confirm Your Booking</h4>

                  <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5 space-y-3 shadow-3xs">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500 font-bold">Expert</span>
                      <span className="font-extrabold text-slate-900">{selectedExpert.displayName}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500 font-bold">Date</span>
                      <span className="font-extrabold text-slate-900">{formatDate(selectedSlot)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500 font-bold">Time</span>
                      <span className="font-extrabold text-slate-900">{formatTime(selectedSlot)}</span>
                    </div>
                    <div className="flex justify-between text-sm pt-3 border-t border-slate-200/80">
                      <span className="text-slate-500 font-bold">Amount</span>
                      <span className="font-black text-lg text-primary">₹{selectedExpert.consultationPrice}</span>
                    </div>
                  </div>

                  {bookingError && (
                    <div className="flex items-center gap-2 p-3 bg-rose-50 text-rose-700 rounded-xl text-xs font-bold border border-rose-100">
                      <AlertCircle size={14} className="shrink-0" />
                      {bookingError}
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button
                      onClick={() => setBookingStep('slot')}
                      className="flex-1 py-3 border border-slate-205 text-slate-650 rounded-full font-extrabold text-sm hover:bg-slate-50 transition-all active:scale-98 cursor-pointer"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleBookSession}
                      className="flex-1 py-3 bg-primary text-white rounded-full font-extrabold text-sm shadow-md hover:bg-primary/95 transition-all active:scale-98 cursor-pointer"
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
                  <p className="text-sm font-black text-slate-655">Processing your booking...</p>
                </div>
              )}

              {/* Success */}
              {bookingStep === 'success' && (
                <div className="flex flex-col items-center py-10 gap-5">
                  <div className="w-16 h-16 bg-green-50 text-green-500 rounded-full flex items-center justify-center border border-green-100 shadow-xs">
                    <CheckCircle2 size={36} />
                  </div>
                  <div className="text-center space-y-1">
                    <h4 className="text-lg font-black text-slate-900 mb-1">Booking Confirmed! 🎉</h4>
                    <p className="text-sm text-slate-600 font-bold">Your session with {selectedExpert.displayName} has been booked.</p>
                  </div>
                  <button
                    onClick={() => { closeModal(); setTab('consultations'); }}
                    className="px-6 py-3 bg-primary text-white rounded-full font-extrabold text-sm hover:bg-primary/95 shadow-md transition-all cursor-pointer active:scale-95"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200" onClick={closeModal}>
          <div
            className="bg-white rounded-[28px] shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-300 border border-slate-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white rounded-t-[28px] z-10">
              <h3 className="font-black text-slate-900 text-sm">Reschedule Session</h3>
              <button onClick={closeModal} className="p-2 hover:bg-slate-50 rounded-xl transition-all">
                <X size={18} className="text-slate-400 hover:text-slate-600" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-slate-50 border border-slate-150 p-4.5 rounded-2xl text-xs font-bold text-slate-650 shadow-3xs">
                Current Time: <span className="text-slate-900 font-black">{formatDate(rescheduleSession.scheduledAt)} at {formatTime(rescheduleSession.scheduledAt)}</span>
              </div>
              <h4 className="text-xs font-black text-slate-450 uppercase tracking-widest pl-0.5">Pick a New Time</h4>
              
              <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                {generateSlots().map((slot) => {
                  const isSelected = rescheduleSlot === slot;
                  return (
                    <button
                      key={slot}
                      onClick={() => setRescheduleSlot(slot)}
                      className={`w-full flex items-center justify-between p-3.5 rounded-2xl border text-left text-sm transition-all cursor-pointer active:scale-99 ${isSelected 
                        ? 'border-primary bg-primary/5 shadow-2xs' 
                        : 'border-slate-200/80 hover:border-primary/30 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Calendar size={14} className={isSelected ? 'text-primary' : 'text-slate-450'} />
                        <div>
                          <span className="font-black text-slate-800 block leading-tight">{formatDate(slot)}</span>
                          <span className="text-xs text-slate-500 font-bold">{formatTime(slot)}</span>
                        </div>
                      </div>
                      {isSelected && <CheckCircle2 size={16} className="text-primary" />}
                    </button>
                  );
                })}
              </div>
              
              <button
                onClick={handleReschedule}
                disabled={!rescheduleSlot}
                className="w-full py-3.5 bg-primary text-white rounded-full font-extrabold text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary/95 shadow-md transition-all active:scale-95 cursor-pointer mt-3"
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
