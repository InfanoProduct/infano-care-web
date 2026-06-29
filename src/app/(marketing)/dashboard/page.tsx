'use client';

import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  BookOpen, Calendar, ShieldCheck, Star, Sparkles,
  ChevronRight, Play, Loader2, Award, Layers, Compass, X, Check, ArrowRight, User, Users, Bookmark, Heart, GraduationCap,
  Package, ShoppingBag, Truck
} from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';
import { ProgramsService, Program, ProgramEnrollment } from '@/services/programs.service';
import { toast } from 'react-hot-toast';
import { ParentService } from '@/services/parent.service';
import { DashboardSummary } from "@/features/parent/components/DashboardSummary";
import { ResourceCard } from '@/features/parent/components/ResourceCard';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ShopService } from '@/services/shop.service';
import { LearningService, LearningJourney, UserProgress } from '@/services/learning.service';
import Script from 'next/script';

// Same STYLES_MAP as ParentsPrograms.tsx for exact match
const STYLES_MAP: Record<string, any> = {
  'SPARK': {
    bg: 'bg-[#FFF0F2]', border: 'border-rose-200/80 hover:border-rose-300', text: 'text-rose-600',
    glow: 'rgba(244,63,94,0.15)', badge: 'bg-rose-50 border-rose-200 text-rose-700',
    btnBg: 'bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 shadow-rose-500/20 hover:shadow-rose-500/35',
    bulletBg: 'bg-rose-100/80 text-rose-600', metaBg: 'bg-white/90 border-rose-100', pricingBg: 'bg-white border-rose-100'
  },
  'RISE': {
    bg: 'bg-[#F5F2FF]', border: 'border-violet-200/80 hover:border-violet-300', text: 'text-violet-600',
    glow: 'rgba(124,58,237,0.15)', badge: 'bg-violet-50 border-violet-200 text-violet-700',
    btnBg: 'bg-gradient-to-r from-violet-500 to-violet-600 hover:from-violet-600 hover:to-violet-700 shadow-violet-500/20 hover:shadow-violet-500/35',
    bulletBg: 'bg-violet-100/80 text-violet-600', metaBg: 'bg-white/90 border-violet-100', pricingBg: 'bg-white border-violet-100'
  },
  'BLOOM': {
    bg: 'bg-[#ECFDF5]', border: 'border-emerald-200/80 hover:border-emerald-300', text: 'text-emerald-600',
    glow: 'rgba(5,150,105,0.15)', badge: 'bg-emerald-50 border-emerald-200 text-emerald-700',
    btnBg: 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 shadow-emerald-500/20 hover:shadow-emerald-500/35',
    bulletBg: 'bg-emerald-100/80 text-emerald-600', metaBg: 'bg-white/90 border-emerald-100', pricingBg: 'bg-white border-emerald-100'
  },
  'IGNITE': {
    bg: 'bg-[#FDF2FF]', border: 'border-fuchsia-200/80 hover:border-fuchsia-300', text: 'text-fuchsia-600',
    glow: 'rgba(192,38,211,0.15)', badge: 'bg-fuchsia-50 border-fuchsia-200 text-fuchsia-700',
    btnBg: 'bg-gradient-to-r from-fuchsia-500 to-fuchsia-600 hover:from-fuchsia-600 hover:to-fuchsia-700 shadow-fuchsia-500/20 hover:shadow-fuchsia-500/35',
    bulletBg: 'bg-fuchsia-100/80 text-fuchsia-600', metaBg: 'bg-white/90 border-fuchsia-100', pricingBg: 'bg-white border-fuchsia-100'
  },
  'UNSTOPPABLE': {
    bg: 'bg-[#FFFDF0]', border: 'border-amber-200/80 hover:border-amber-300', text: 'text-amber-600',
    glow: 'rgba(217,119,6,0.15)', badge: 'bg-amber-50 border-amber-200 text-amber-700',
    btnBg: 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 shadow-amber-500/20 hover:shadow-amber-500/35',
    bulletBg: 'bg-amber-100/80 text-amber-600', metaBg: 'bg-white/90 border-amber-100', pricingBg: 'bg-white border-amber-100'
  },
};

const DEFAULT_STYLE = {
  bg: 'bg-slate-50', border: 'border-slate-200 hover:border-slate-300', text: 'text-slate-700',
  glow: 'rgba(71,85,105,0.06)', badge: 'bg-slate-100 border-slate-200 text-slate-700',
  btnBg: 'bg-slate-900 hover:bg-slate-800 shadow-slate-900/10 hover:shadow-slate-900/25',
  bulletBg: 'bg-slate-200/80 text-slate-700', metaBg: 'bg-white border-slate-100', pricingBg: 'bg-white border-slate-100'
};

const ENROLLED_THEMES: Record<string, { accent: string; gradient: string; border: string; badge: string; }> = {
  'SPARK': { accent: 'text-rose-600', gradient: 'from-rose-500 to-pink-600', border: 'border-rose-100', badge: 'bg-rose-50 border-rose-100 text-rose-700' },
  'RISE': { accent: 'text-violet-600', gradient: 'from-violet-500 to-indigo-600', border: 'border-violet-100', badge: 'bg-violet-50 border-violet-100 text-violet-700' },
  'BLOOM': { accent: 'text-emerald-600', gradient: 'from-emerald-500 to-teal-600', border: 'border-emerald-100', badge: 'bg-emerald-50 border-emerald-100 text-emerald-700' },
  'IGNITE': { accent: 'text-fuchsia-600', gradient: 'from-fuchsia-500 to-pink-600', border: 'border-fuchsia-100', badge: 'bg-fuchsia-50 border-fuchsia-100 text-fuchsia-700' },
  'UNSTOPPABLE': { accent: 'text-amber-600', gradient: 'from-amber-500 to-orange-600', border: 'border-amber-100', badge: 'bg-amber-50 border-amber-100 text-amber-700' },
};
const DEFAULT_ENROLLED_THEME = { accent: 'text-primary', gradient: 'from-primary to-accent', border: 'border-primary/20', badge: 'bg-primary/10 border-primary/20 text-primary' };

const getProgramStyles = (program: any, index: number) => {
  const titleUpper = (program?.title || '').toUpperCase();
  const metaTheme = program?.metadata?.themeColor || program?.themeColor || program?.metadata?.theme;
  if (metaTheme && typeof metaTheme === 'string') {
    const key = metaTheme.toUpperCase();
    if (STYLES_MAP[key]) return STYLES_MAP[key];
  }
  if (titleUpper.includes('SPARK')) return STYLES_MAP['SPARK'];
  if (titleUpper.includes('RISE')) return STYLES_MAP['RISE'];
  if (titleUpper.includes('BLOOM')) return STYLES_MAP['BLOOM'];
  if (titleUpper.includes('IGNITE')) return STYLES_MAP['IGNITE'];
  if (titleUpper.includes('UNSTOPPABLE')) return STYLES_MAP['UNSTOPPABLE'];

  const themeKeys = Object.keys(STYLES_MAP);
  return STYLES_MAP[themeKeys[index % themeKeys.length]] || DEFAULT_STYLE;
};

const getEnrolledTheme = (title: string = '') => {
  const tUpper = title.toUpperCase();
  if (tUpper.includes('SPARK')) return ENROLLED_THEMES['SPARK'];
  if (tUpper.includes('RISE')) return ENROLLED_THEMES['RISE'];
  if (tUpper.includes('BLOOM')) return ENROLLED_THEMES['BLOOM'];
  if (tUpper.includes('IGNITE')) return ENROLLED_THEMES['IGNITE'];
  if (tUpper.includes('UNSTOPPABLE')) return ENROLLED_THEMES['UNSTOPPABLE'];
  return DEFAULT_ENROLLED_THEME;
};


export default function CustomerDashboardOverview() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  const { user } = useAuthStore();
  const [enrollments, setEnrollments] = useState<ProgramEnrollment[]>([]);
  const [allPrograms, setAllPrograms] = useState<Program[]>([]);
  const [isLinked, setIsLinked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [parentBookmarks, setParentBookmarks] = useState<any[]>([]);
  const [demoSessions, setDemoSessions] = useState<any[]>([]);
  const [demosLoading, setDemosLoading] = useState(false);
  const [learningJourneys, setLearningJourneys] = useState<LearningJourney[]>([]);
  const [learningProgress, setLearningProgress] = useState<UserProgress[]>([]);
  const [orders, setOrders] = useState<any[]>([]);

  // Demo booking modal state
  const [demoModalProg, setDemoModalProg] = useState<Program | null>(null);
  const [demoName, setDemoName] = useState(user?.profile?.displayName || user?.username || '');
  const [demoEmail, setDemoEmail] = useState(user?.email || '');
  const [demoPhone, setDemoPhone] = useState(user?.phone || '');
  const [demoSlotDate, setDemoSlotDate] = useState('');
  const [demoSlotTime, setDemoSlotTime] = useState('');
  const [demoSubmitting, setDemoSubmitting] = useState(false);
  const [demoSuccess, setDemoSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      setDemoName(user.profile?.displayName || user.username || '');
      setDemoEmail(user.email || '');
      setDemoPhone(user.phone || '');
    }
  }, [user]);

  const isTeen = user?.role === 'TEEN';

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const [enrollRes, programsRes, linksRes, demosRes, ordersRes] = await Promise.all([
        ProgramsService.getUserEnrollments().catch(() => ({ success: true, data: [] })),
        ProgramsService.getPrograms().catch(() => []),
        ParentService.getLinks().catch(() => []),
        ProgramsService.getUserDemos().catch(() => ({ success: true, data: [] })),
        ShopService.getUserOrders().catch(() => [])
      ]);
      setEnrollments(enrollRes.data || []);
      setAllPrograms(programsRes);
      setDemoSessions(demosRes.data || []);
      setOrders(ordersRes || []);
      const linked = linksRes.some((link: any) => link.status === 'LINKED');
      setIsLinked(linked);

      // If teen user is linked, fetch parent's bookmarked articles
      if (user?.role === 'TEEN' && linked) {
        ParentService.getTeenParentBookmarks()
          .then(data => setParentBookmarks(data || []))
          .catch(() => setParentBookmarks([]));
      }
      // Fetch learning data
      const [learningJourneysRes, learningProgressRes] = await Promise.all([
        LearningService.getJourneys().catch(() => []),
        LearningService.getMyProgress().catch(() => []),
      ]);
      // Exclude peerline certification from main user dashboard
      const userJourneys = learningJourneysRes.filter(
        journey => journey.slug !== 'peerline-mentor-certification'
      );
      setLearningJourneys(userJourneys);
      setLearningProgress(learningProgressRes);
    } catch {
      toast.error('Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { loadDashboardData(); }, [loadDashboardData]);

  const handleBookDemoClick = (program: Program) => {
    setDemoModalProg(program);
    setDemoName(user?.profile?.displayName || user?.username || '');
    setDemoEmail(user?.email || '');
    setDemoPhone(user?.phone || '');
    setDemoSlotDate('');
    setDemoSlotTime('');
    setDemoSuccess(false);
  };

  const handleDemoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!demoModalProg) return;
    if (!demoName.trim()) {
      toast.error('Please enter your name.');
      return;
    }
    if (!demoPhone.trim()) {
      toast.error('Please enter your phone number.');
      return;
    }
    if (!demoSlotDate) {
      toast.error('Please select a date for your demo.');
      return;
    }
    if (!demoSlotTime) {
      toast.error('Please select a time slot.');
      return;
    }

    setDemoSubmitting(true);
    try {
      const bookingData = {
        parentName: demoName,
        phone: demoPhone,
        email: demoEmail || null,
        classRange: demoModalProg.classRange,
        confidence: "",
        interests: [],
        hasMentor: "",
        challenges: [],
        learningPref: "1:1 Private Mentoring",
        parentInvolvement: "",
        suggestedPrograms: [demoModalProg.title],
        slotDate: demoSlotDate,
        slotTime: demoSlotTime
      };

      const result = await ProgramsService.bookDemoSession(bookingData);
      if (result.success) {
        setDemoSuccess(true);
        toast.success('Demo session booked successfully!');
        loadDashboardData();
      } else {
        throw new Error('Booking failed');
      }

    } catch (err: any) {
      toast.error(err.message || 'Failed to book demo session.');
    } finally {
      setDemoSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4 text-primary">
        <Loader2 className="animate-spin text-primary" size={44} />
        <span className="font-extrabold text-lg text-slate-600 tracking-wide">Assembling Workspace...</span>
      </div>
    );
  }

  const enrolledProgramIds = enrollments.map(e => e.programId);
  const availablePrograms = allPrograms.filter(p => !enrolledProgramIds.includes(p.id));
  const showSidebar = isTeen && parentBookmarks.length > 0;

  const isProgramItem = (it: any) => {
    const book = it.book || {};
    const bookId = (it.bookId || '').toLowerCase();
    const bookTitle = (book.title || it.bookTitle || '').toLowerCase();
    if ((book as any).curriculum?.length || book.classRange || book.duration) return true;
    if (bookId.includes('program') || bookId.includes('private') || bookId.includes('group') || bookId.includes('cohort')) return true;
    if (bookTitle.includes('program') || bookTitle.includes('mentoring') || bookTitle.includes('cohort')) return true;
    return false;
  };
  const productOrders = orders.filter((o: any) => (o.items || []).some((it: any) => !isProgramItem(it)));


  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 w-full max-w-[1280px] mx-auto pb-8">

      {/* Demo Booking Modal */}
      {mounted && demoModalProg && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setDemoModalProg(null)} />
          <div className="relative w-full max-w-md bg-white rounded-xl shadow-xl overflow-hidden z-[10000] border border-slate-100 animate-in zoom-in-95">
            {(() => {
              const theme = ENROLLED_THEMES[demoModalProg.title?.toUpperCase()] || DEFAULT_ENROLLED_THEME;
              return (
                <>
                  <div className={`h-1.5 w-full bg-gradient-to-r ${theme.gradient}`} />
                  <div className="p-6">
                    <button onClick={() => setDemoModalProg(null)} className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-655 hover:bg-slate-50 rounded-lg transition-all z-20">
                      <X size={16} />
                    </button>

                    {demoSuccess ? (
                      <div className="text-center py-4">
                        <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto mb-3 text-emerald-600 shadow-sm">
                          <Check size={24} strokeWidth={2.5} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-800 mb-1.5">Demo Booked Successfully!</h3>
                        <p className="text-slate-505 text-xs leading-relaxed mb-5 font-medium">
                          Your demo session for <strong className={theme.accent}>{demoModalProg.title} Program</strong> is requested for <strong className="text-slate-800">{demoSlotDate}</strong> at <strong className="text-slate-800">{demoSlotTime}</strong>. A guide will call you at <strong className="text-slate-800">{demoPhone}</strong>.
                        </p>
                        <button
                          onClick={() => setDemoModalProg(null)}
                          className="w-full py-2.5 bg-slate-900 hover:bg-slate-855 text-white font-bold text-xs rounded-lg transition-all active:scale-95 animate-in fade-in"
                        >
                          Close Window
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="mb-4">
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md ${theme.badge}`}>Book Demo Session</span>
                          <h3 className={`text-xl font-bold mt-1.5 ${theme.accent}`}>{demoModalProg.title} Program</h3>
                          <p className="text-xs text-slate-505 font-medium mt-0.5">{demoModalProg.classRange} • {demoModalProg.curriculum?.length || 8} Sessions • {demoModalProg.duration}</p>
                        </div>

                        <div className="bg-slate-50 border border-slate-100 rounded-lg p-3 text-xs text-slate-600 mb-4">
                          <span className="font-bold text-slate-700 block mb-0.5">Booking Profile Details:</span>
                          <span className="font-semibold text-slate-800">{demoName}</span> • <span className="font-medium">{demoPhone}</span>{demoEmail && <span className="font-medium"> • {demoEmail}</span>}
                        </div>

                        <form onSubmit={handleDemoSubmit} className="space-y-3.5">
                          <div className="grid grid-cols-2 gap-3.5">
                            <div>
                              <label className="block text-xs font-semibold text-slate-700 mb-1">Preferred Date *</label>
                              <input
                                type="date"
                                required
                                min={(() => {
                                  const today = new Date();
                                  const tomorrow = new Date(today);
                                  tomorrow.setDate(today.getDate() + 1);
                                  return tomorrow.toISOString().split('T')[0];
                                })()}
                                value={demoSlotDate}
                                onChange={e => setDemoSlotDate(e.target.value)}
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-205 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer"
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-semibold text-slate-700 mb-1">Preferred Time *</label>
                              <select
                                required
                                value={demoSlotTime}
                                onChange={e => setDemoSlotTime(e.target.value)}
                                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-205 rounded-lg text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer"
                              >
                                <option value="">Select Time</option>
                                <option value="09:00 AM - 10:00 AM">09:00 AM - 10:00 AM</option>
                                <option value="10:00 AM - 11:00 AM">10:00 AM - 11:00 AM</option>
                                <option value="11:00 AM - 12:00 PM">11:00 AM - 12:00 PM</option>
                                <option value="12:00 PM - 01:00 PM">12:00 PM - 01:00 PM</option>
                                <option value="02:00 PM - 03:00 PM">02:00 PM - 03:00 PM</option>
                                <option value="03:00 PM - 04:00 PM">03:00 PM - 04:00 PM</option>
                                <option value="04:00 PM - 05:00 PM">04:00 PM - 05:00 PM</option>
                                <option value="05:00 PM - 06:00 PM">05:00 PM - 06:00 PM</option>
                                <option value="06:00 PM - 07:00 PM">06:00 PM - 07:00 PM</option>
                              </select>
                            </div>
                          </div>

                          <button
                            type="submit"
                            disabled={demoSubmitting}
                            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-lg shadow-sm flex items-center justify-center gap-2 text-xs transition-all active:scale-95 disabled:opacity-70 mt-3 cursor-pointer"
                          >
                            {demoSubmitting ? <Loader2 size={16} className="animate-spin" /> : <><ArrowRight size={14} /> Book Free Demo</>}
                          </button>
                        </form>
                      </>
                    )}
                  </div>
                </>
              );
            })()}
          </div>
        </div>,
        document.body
      )}

      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-rose-50/90 via-pink-50/70 to-purple-50/80 p-6 sm:p-7 rounded-[26px] border border-rose-100/80 shadow-[0_4px_25px_rgba(244,63,94,0.06)] flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden group">
        <div className="absolute -right-16 -top-16 w-72 h-72 bg-gradient-to-br from-rose-200/50 via-pink-200/40 to-purple-200/30 rounded-full blur-3xl pointer-events-none group-hover:scale-110 transition-transform duration-500" />
        <div className="absolute -right-4 -bottom-4 text-rose-500/10 pointer-events-none transform rotate-12 scale-150 group-hover:rotate-6 transition-transform duration-500">
          <Sparkles size={160} />
        </div>
        <div className="space-y-2 relative z-10">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/90 border border-rose-200 rounded-full text-[10px] font-extrabold text-rose-600 shadow-2xs">
              <Sparkles size={12} className="text-rose-500" /> Welcome to Gigi's Circle
            </div>
            {isLinked && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/90 text-indigo-700 rounded-full text-[10px] font-extrabold shadow-2xs border border-indigo-200">
                <Check size={12} /> {isTeen ? 'Parent Linked' : 'Teen Linked'}
              </div>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">
            {isTeen ? 'Hey there, Champion! 🌟' : 'Empowering Her Journey 🤍'}
          </h1>
          <p className="text-xs sm:text-sm font-semibold text-slate-600 max-w-xl leading-relaxed">
            {isTeen
              ? "Track your daily quests, active cohort sessions, and cycle insights — all in one place."
              : "Review your daughter's progress, session status, and explore new programs tailored for her."}
          </p>
        </div>
        {isTeen && enrollments.length > 0 && (
          <button className="bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-extrabold py-3 px-6 rounded-full flex items-center gap-2 shadow-md transition-all duration-200 active:scale-95 text-xs shrink-0 relative z-10">
            <Play size={14} className="fill-white" /> Join Active Cohort
          </button>
        )}
      </div>

      {/* 4-Card Overview Summary matching reference design */}
      <DashboardSummary
        enrollments={enrollments}
        demoSessions={demoSessions}
        learningJourneys={learningJourneys}
        learningProgress={learningProgress}
      />

      <div className={showSidebar ? "grid grid-cols-1 lg:grid-cols-3 gap-6" : "space-y-6 w-full"}>
        <div className={showSidebar ? "lg:col-span-2 space-y-6" : "space-y-6 w-full"}>
          {/* DEMO SESSIONS & LATEST ORDERS GLIMPSE (ALIGNED IN A ROW WITH PASTEL THEMES & GRAPHICS) */}
          {(demoSessions.length > 0 || productOrders.length > 0) && (
            <div className={`grid grid-cols-1 ${demoSessions.length > 0 && productOrders.length > 0 ? 'md:grid-cols-2' : ''} gap-6`}>
              {/* DEMO SESSIONS GLIMPSE */}
              {demoSessions.length > 0 && (
                <div className="bg-[#FFFDF5] border border-amber-200/70 rounded-[26px] p-6 shadow-[0_4px_25px_rgba(245,158,11,0.06)] hover:shadow-lg transition-all duration-300 flex flex-col justify-between relative overflow-hidden group">
                  <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-amber-200/40 rounded-full blur-2xl group-hover:scale-125 transition-all duration-500 pointer-events-none" />
                  <div className="absolute -right-2 -bottom-2 text-amber-500/10 pointer-events-none transform rotate-12 scale-150 group-hover:rotate-6 transition-transform duration-500">
                    <Calendar size={110} />
                  </div>

                  <div className="space-y-4 relative z-10">
                    <div className="flex items-center justify-between border-b border-amber-200/60 pb-4">
                      <div>
                        <h3 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
                          <div className="p-1.5 rounded-lg bg-white/90 border border-amber-200 text-amber-600 shadow-2xs">
                            <Calendar size={16} />
                          </div>
                          Booked Demo Sessions
                        </h3>
                        <p className="text-xs font-semibold text-slate-500 mt-1">Status of consultation slot bookings</p>
                      </div>
                      <Link href="/dashboard/expert-sessions?tab=demos" className="text-xs font-extrabold text-amber-600 hover:underline flex items-center gap-0.5 shrink-0">
                        View Details <ChevronRight size={14} />
                      </Link>
                    </div>

                    <div className="space-y-3">
                      {demoSessions.slice(0, 2).map((demo: any) => {
                        const progName = demo.suggestedPrograms?.[0] || 'Learning Program';
                        const theme = getEnrolledTheme(progName);
                        return (
                          <div key={demo.id} className="p-4 bg-white/90 border border-amber-200/80 rounded-2xl flex items-center justify-between gap-3 shadow-2xs hover:shadow-md transition-all">
                            <div className="space-y-1 min-w-0">
                              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${theme.badge} inline-block`}>
                                Demo Session
                              </span>
                              <h4 className={`font-extrabold text-sm truncate ${theme.accent}`}>{progName}</h4>
                              <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 mt-1">
                                <Calendar size={11} className="text-amber-500" />
                                <span>{demo.slotDate}</span>
                                <span>·</span>
                                <span>{demo.slotTime}</span>
                              </div>
                            </div>

                            <span className={`text-[9px] font-bold px-2.5 py-1 rounded-full border shrink-0 ${demo.status === 'PENDING' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                                demo.status === 'CONTACTED' ? 'bg-teal-50 text-teal-600 border-teal-200' :
                                  demo.status === 'SCHEDULED' ? 'bg-purple-50 text-purple-600 border-purple-200' :
                                    demo.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                                      'bg-rose-50 text-rose-600 border-rose-200'
                              }`}>
                              {demo.status}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* LATEST ORDER DETAILS GLIMPSE */}
              {productOrders.length > 0 && (
                <div className="bg-[#F0F4FF] border border-indigo-200/70 rounded-[26px] p-6 shadow-[0_4px_25px_rgba(99,102,241,0.06)] hover:shadow-lg transition-all duration-300 flex flex-col justify-between relative overflow-hidden group">
                  <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-indigo-200/40 rounded-full blur-2xl group-hover:scale-125 transition-all duration-500 pointer-events-none" />
                  <div className="absolute -right-2 -bottom-2 text-indigo-500/10 pointer-events-none transform -rotate-12 scale-150 group-hover:rotate-0 transition-transform duration-500">
                    <ShoppingBag size={110} />
                  </div>

                  <div className="space-y-4 relative z-10">
                    <div className="flex items-center justify-between border-b border-indigo-200/60 pb-4">
                      <div>
                        <h3 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
                          <div className="p-1.5 rounded-lg bg-white/90 border border-indigo-200 text-indigo-600 shadow-2xs">
                            <ShoppingBag size={16} />
                          </div>
                          Latest Order Details
                        </h3>
                        <p className="text-xs font-semibold text-slate-500 mt-1">Physical product delivery updates</p>
                      </div>
                      <Link href="/dashboard/orders" className="text-xs font-extrabold text-indigo-600 hover:underline flex items-center gap-0.5 shrink-0">
                        View All Orders <ChevronRight size={14} />
                      </Link>
                    </div>

                    {(() => {
                      const latest = productOrders[0];
                      const item = latest.items?.find((it: any) => !isProgramItem(it)) || latest.items?.[0];
                      const book = item?.book || {};
                      const title = book.title || item?.bookTitle || item?.name || 'Book Order';
                      const quantity = item?.quantity || 1;

                      return (
                        <div className="p-4 bg-white/90 border border-indigo-200/80 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs hover:shadow-md transition-all">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-12 h-14 rounded-xl overflow-hidden bg-white shrink-0 border border-indigo-100 shadow-2xs flex items-center justify-center">
                              {book.imageUrl ? (
                                <img src={book.imageUrl} alt={title} className="w-full h-full object-cover" />
                              ) : (
                                <Package size={22} className="text-indigo-400" />
                              )}
                            </div>
                            <div className="space-y-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="text-[9px] font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md border border-indigo-200">
                                  #{latest.id.slice(0, 8)}
                                </span>
                                <span className="text-[10px] font-semibold text-slate-500 flex items-center gap-1">
                                  <Calendar size={11} />
                                  {new Date(latest.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                </span>
                              </div>
                              <h4 className="font-extrabold text-sm text-slate-800 truncate">{title} <span className="text-slate-400 text-xs font-medium">(x{quantity})</span></h4>
                              <p className="text-xs font-extrabold text-indigo-700">Total: ₹{latest.totalAmount?.toLocaleString()}</p>
                            </div>
                          </div>

                          <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0 border-t sm:border-t-0 border-slate-200/60 pt-3 sm:pt-0">
                            <div className="flex items-center gap-2">
                              <span className={`text-[9px] font-extrabold px-3 py-1 rounded-full border ${
                                latest.orderStatus === 'DELIVERED' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                                latest.orderStatus === 'SHIPPED' ? 'bg-indigo-50 text-indigo-600 border-indigo-200' :
                                latest.orderStatus === 'PROCESSING' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                                'bg-amber-50 text-amber-600 border-amber-200'
                              }`}>
                                {latest.orderStatus}
                              </span>
                            </div>
                            <Link
                              href={`/dashboard/orders/${latest.id}`}
                              className="inline-flex items-center gap-1 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-2xs transition-all active:scale-95"
                            >
                              Details <ArrowRight size={12} />
                            </Link>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* COMPACT PROGRAM PROGRESS OVERVIEW */}
          {enrollments.length > 0 && (
            <div className="bg-white border border-slate-100 rounded-[26px] p-6 shadow-[0_4px_25px_rgba(0,0,0,0.03)] space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
                    <Award className="text-primary" size={20} /> Program Progress
                  </h3>
                  <p className="text-xs font-medium text-slate-400 mt-0.5">High-level status of your active enrollments</p>
                </div>
                <Link href="/dashboard/enrolled-programs" className="text-xs font-bold text-primary hover:underline flex items-center gap-0.5">
                  View All Sessions <ChevronRight size={14} />
                </Link>
              </div>

              <div className="space-y-3.5">
                {enrollments.map(enr => {
                  const theme = getEnrolledTheme(enr.program.title);
                  const total = enr.program.curriculum?.length || 8;
                  const dbSessions = enr.user?.scheduledSessions || [];
                  const completed = dbSessions.filter((s: any) => s.status?.toLowerCase() === 'completed' && s.programId === enr.programId).length;
                  const scheduled = dbSessions.find((s: any) => s.status?.toLowerCase() === 'scheduled' && s.programId === enr.programId);
                  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
                  const nextDate = scheduled ? new Date(scheduled.scheduledAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : null;

                  return (
                    <div key={enr.id} className={`p-4.5 bg-white border ${theme.border} rounded-2xl flex flex-col sm:flex-row sm:items-center gap-4 hover:shadow-md transition-all`}>
                      <div className="flex-1 space-y-2.5">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div className="flex items-center gap-3">
                            {enr.program.thumbnailUrl && (
                              <img src={enr.program.thumbnailUrl} alt={enr.program.title} className="w-10 h-10 rounded-xl object-cover shrink-0 border border-slate-200" />
                            )}
                            <div>
                              <h4 className={`font-extrabold text-base ${theme.accent}`}>{enr.program.title}</h4>
                              <p className="text-xs font-medium text-slate-400">{enr.program.classRange} • 1:1 Private Mentoring</p>
                              {enr.program.consultations && Array.isArray(enr.program.consultations) && enr.program.consultations.length > 0 && (
                                <p className="text-[10px] font-semibold text-purple-600 mt-1 flex items-center gap-1">
                                  <Sparkles size={11} className="animate-pulse" /> Included: {enr.program.consultations.map((c: any) => c.title).join(', ')}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {enr.user?.id && user?.id && enr.user.id !== user.id && (
                              <span className={`text-[9px] font-medium px-2 py-0.5 rounded-full border ${enr.user?.role === 'TEEN' ? 'bg-purple-50 text-purple-600 border-purple-200' : 'bg-blue-50 text-blue-600 border-blue-200'}`}>
                                Enrolled by: {enr.user?.role === 'TEEN' ? 'Daughter' : 'Parent'}
                              </span>
                            )}
                            <span className={`text-[9px] font-extrabold px-2.5 py-0.5 rounded-full ${theme.badge}`}>
                              {pct === 100 ? 'Completed' : 'Active'}
                            </span>
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-[11px] font-semibold text-slate-500">
                            <span>{completed}/{total} sessions done</span>
                            {nextDate && <span className="text-purple-600 flex items-center gap-1 font-bold"><Calendar size={11} /> Next: {nextDate}</span>}
                            <span className={theme.accent}>{pct}%</span>
                          </div>
                          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div className={`h-full bg-gradient-to-r ${theme.gradient} transition-all duration-700 rounded-full`} style={{ width: `${pct}%` }} />
                          </div>
                        </div>

                        {scheduled && (
                          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                            <div className="flex flex-col">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Upcoming Session</span>
                              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                                <Calendar size={13} className={theme.accent} />
                                {new Date(scheduled.scheduledAt).toLocaleString('en-IN', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                              </div>
                            </div>
                            {scheduled.meetingLink && (
                              <a href={scheduled.meetingLink} target="_blank" className={`px-4 py-2 text-white text-xs font-bold rounded-full flex items-center gap-1.5 shadow-sm transition-all active:scale-95 hover:shadow-md bg-gradient-to-r ${theme.gradient}`}>
                                <Play size={12} className="fill-current" /> Join Live
                              </a>
                            )}
                          </div>
                        )}
                      </div>
                      <Link href={`/dashboard/enrolled-programs/${enr.id}`} className={`shrink-0 text-xs font-extrabold ${theme.accent} hover:underline flex items-center gap-0.5 whitespace-nowrap bg-slate-50 px-4 py-2 rounded-full border border-slate-100`}>
                        Timeline <ChevronRight size={14} />
                      </Link>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* AVAILABLE PROGRAMS CATALOG */}

          {/* LEARNING JOURNEYS COMPACT PROGRESS */}
          {learningJourneys.length > 0 && (() => {
            const journeyStats = learningJourneys.map(journey => {
              const episodeIds = new Set(journey.episodes?.map(e => e.id) || []);
              const completedCount = learningProgress.filter(p => episodeIds.has(p.episodeId) && p.completed).length;
              const totalCount = journey.episodes?.length || 0;
              const pct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
              const isMastered = totalCount > 0 && completedCount === totalCount;
              return { journey, completedCount, totalCount, pct, isMastered };
            });

            return (
              <div className="bg-white border border-slate-100 rounded-[26px] p-6 sm:p-8 shadow-[0_4px_25px_rgba(0,0,0,0.03)]">
                <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-5">
                  <div>
                    <h3 className="text-xl font-extrabold text-slate-800 flex items-center gap-2">
                      <GraduationCap className="text-purple-500" size={24} /> Learning Journeys
                    </h3>
                    <p className="text-xs font-semibold text-slate-400 mt-1">Interactive learning paths with episodes and XP</p>
                  </div>
                  <Link href="/dashboard/learning-journeys" className="text-xs font-extrabold text-primary hover:underline flex items-center gap-1">
                    View All <ChevronRight size={14} />
                  </Link>
                </div>

                <div className="space-y-4">
                  {journeyStats.slice(0, 3).map(({ journey, completedCount, totalCount, pct, isMastered }) => (
                    <Link
                      key={journey.id}
                      href={`/dashboard/learning-journeys/${journey.id}`}
                      className={`block p-4.5 bg-white border ${isMastered ? 'border-emerald-200' : 'border-slate-100'} rounded-2xl hover:shadow-md transition-all group`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-11 h-11 rounded-xl shrink-0 flex items-center justify-center ${isMastered ? 'bg-emerald-100' : 'bg-purple-100'
                          }`}>
                          {isMastered
                            ? <Check size={18} className="text-emerald-500" />
                            : <GraduationCap size={18} className="text-purple-500" />
                          }
                        </div>
                        <div className="flex-1 min-w-0 space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <h4 className="font-extrabold text-slate-800 truncate text-sm">{journey.title}</h4>
                            <span className={`text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider shrink-0 ${isMastered
                                ? 'bg-emerald-50 border border-emerald-200 text-emerald-700'
                                : 'bg-purple-50 border border-purple-100 text-purple-700'
                              }`}>
                              {isMastered ? 'Mastered' : pct > 0 ? 'In Progress' : 'New'}
                            </span>
                          </div>
                          <div className="flex justify-between text-[11px] font-semibold text-slate-500">
                            <span>{completedCount}/{totalCount} episodes</span>
                            <span className={isMastered ? 'text-emerald-600 font-bold' : 'text-purple-600 font-bold'}>{pct}%</span>
                          </div>
                          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${isMastered ? 'bg-gradient-to-r from-emerald-400 to-emerald-500' : 'bg-gradient-to-r from-purple-400 to-indigo-500'} transition-all duration-700 rounded-full`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                        <ChevronRight size={16} className="text-slate-300 shrink-0 group-hover:text-primary transition-colors" />
                      </div>
                    </Link>
                  ))}
                </div>

                {journeyStats.length > 3 && (
                  <div className="text-center mt-4 pt-4 border-t border-slate-100">
                    <Link href="/dashboard/learning-journeys" className="inline-flex items-center gap-2 text-xs font-extrabold text-primary hover:underline">
                      View All {journeyStats.length} Journeys <ChevronRight size={14} />
                    </Link>
                  </div>
                )}
              </div>
            );
          })()}

          {availablePrograms.length > 0 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-extrabold text-slate-800 flex items-center gap-2.5">
                  <Compass className="text-primary" size={22} /> Curated Learning Programs
                </h3>
                <p className="text-xs font-medium text-slate-500 mt-0.5">Enroll in specialized expert cohorts designed to empower her growth</p>
              </div>
              <div className={`grid grid-cols-1 md:grid-cols-2 ${showSidebar ? "" : "lg:grid-cols-3"} gap-5`}>
                {availablePrograms.map((program, index) => {
                  const styles = getProgramStyles(program, index);

                  return (
                    <div
                      key={program.id}
                      className={`rounded-[26px] border ${styles.bg} ${styles.border} shadow-[0_4px_25px_rgba(0,0,0,0.03)] hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col group relative overflow-hidden`}
                      style={{
                        boxShadow: `0 10px 30px -10px ${styles.glow}`,
                      }}
                    >
                      {/* Dynamic Background Soft Orb */}
                      <div
                        className="absolute -top-12 -right-12 w-32 h-32 rounded-full blur-[40px] pointer-events-none opacity-40 group-hover:scale-125 transition-all duration-500 z-0"
                        style={{ backgroundColor: styles.glow.replace('0.15', '0.3') }}
                      />

                      {program.thumbnailUrl && (
                        <div className="w-full h-40 sm:h-44 relative overflow-hidden shrink-0 border-b border-white/40">
                          <img src={program.thumbnailUrl} alt={program.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                          <div className="absolute top-3 right-3 z-10">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${styles.badge} shadow-sm backdrop-blur-md border border-white/50`}>
                              {program.classRange}
                            </span>
                          </div>
                        </div>
                      )}
                      
                      <div className="p-6 flex flex-col flex-1 relative z-10">
                        <div className="mb-3">
                          <h3 className={`text-xl font-extrabold tracking-tight ${styles.text} leading-snug`}>
                            {program.title}
                          </h3>
                          <p className="text-slate-700 font-semibold text-xs leading-relaxed mt-2 italic">
                            "{program.tagline || program.description}"
                          </p>
                        </div>

                        <div className={`flex flex-wrap items-center justify-between gap-2 py-2.5 px-3.5 ${styles.metaBg} rounded-2xl border shadow-2xs mb-5 text-slate-700 text-[11px] font-extrabold relative z-10`}>
                          <div className="flex items-center gap-1.5">
                            <BookOpen size={13} className={styles.text} />
                            <span>{program.curriculum?.length || 8} Sessions</span>
                          </div>
                          <div className="h-3 w-[1px] bg-slate-200" />
                          <div className="flex items-center gap-1.5">
                            <Calendar size={13} className={styles.text} />
                            <span>{program.duration}</span>
                          </div>
                          {program.consultations && Array.isArray(program.consultations) && program.consultations.length > 0 && (
                            <>
                              <div className="h-3 w-[1px] bg-slate-200" />
                              <div className="flex items-center gap-1.5 text-purple-600">
                                <Sparkles size={13} className="text-purple-500 shrink-0 animate-pulse" />
                                <span>{program.consultations.length} {program.consultations.length === 1 ? 'Free Consultation' : 'Free Consultations'}</span>
                              </div>
                            </>
                          )}
                        </div>

                        <div className="mb-6 flex-1 relative z-10">
                          <h4 className="text-[10px] font-extrabold text-slate-400 mb-3 uppercase tracking-widest">What she will cover:</h4>
                          <ul className="space-y-2.5">
                            {program.topics?.slice(0, 5).map((topic, topicIdx) => (
                               <li key={topicIdx} className="flex items-start gap-2.5 text-slate-700 text-xs font-semibold leading-snug">
                                <span className={`w-4 h-4 shrink-0 rounded-full flex items-center justify-center text-[9px] font-black ${styles.bulletBg} shadow-2xs mt-0.5`}>
                                  <Check size={10} strokeWidth={3} />
                                </span>
                                <span>{topic}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <button
                          onClick={() => handleBookDemoClick(program)}
                          className={`w-full inline-flex items-center justify-center gap-2 py-3.5 px-5 rounded-full text-white font-extrabold text-xs transition-all ${styles.btnBg} relative z-10 cursor-pointer active:scale-95 shadow-md`}
                        >
                          <span>Book Free Demo</span>
                          <ArrowRight size={14} className="transition-transform group-hover:translate-x-1 duration-300" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}




        </div>
        {/* RIGHT SIDEBAR: PARENT BOOKMARKS FOR TEEN */}
        {showSidebar && (
          <div className="space-y-0">
            <div className="bg-white border border-slate-100 rounded-[26px] p-5 shadow-[0_4px_25px_rgba(0,0,0,0.03)] space-y-4">
              <div className="flex items-center justify-between border-b border-slate-50 pb-3">
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-rose-100 to-pink-100 flex items-center justify-center shrink-0">
                      <Heart size={14} className="text-rose-500 fill-rose-500" />
                    </div>
                    <h4 className="text-sm font-extrabold text-slate-800">Recommended by Parent</h4>
                  </div>
                  <p className="text-[11px] font-medium text-slate-400 ml-[36px]">Your parent bookmarked these articles for you</p>
                </div>
                <span className="text-[10px] font-extrabold bg-rose-50 text-rose-600 border border-rose-100 px-2.5 py-0.5 rounded-full">
                  {parentBookmarks.length}
                </span>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {parentBookmarks.slice(0, 6).map((post: any) => (
                  <ResourceCard
                    key={post.id}
                    post={post}
                    isBookmarkedInitial={false}
                    hideBookmark={true}
                    compact={true}
                  />
                ))}
              </div>

              {parentBookmarks.length > 6 && (
                <div className="text-center mt-3 pt-3 border-t border-slate-100">
                  <Link
                    href="/dashboard/resources"
                    className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline"
                  >
                    View All {parentBookmarks.length} Articles <ChevronRight size={14} />
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
