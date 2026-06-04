'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  BookOpen, Calendar, ShieldCheck, Star, Sparkles,
  ChevronRight, Play, Loader2, Award, Layers, Compass, X, Check, ArrowRight, User, Users, Bookmark, Heart
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
import Script from 'next/script';

// Same STYLES_MAP as ParentsPrograms.tsx for exact match
const STYLES_MAP: Record<string, any> = {
  'SPARK': {
    bg: 'bg-[#FFF0F2]', border: 'border-rose-100 hover:border-rose-250', text: 'text-rose-600',
    glow: 'rgba(244,63,94,0.06)', badge: 'bg-rose-50 border-rose-100 text-rose-700',
    btnBg: 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/10 hover:shadow-rose-600/25',
    bulletBg: 'bg-rose-100 text-rose-600', metaBg: 'bg-white border-rose-100/30', pricingBg: 'bg-white border-rose-100/30'
  },
  'RISE': {
    bg: 'bg-[#F5F2FF]', border: 'border-violet-100 hover:border-violet-250', text: 'text-violet-600',
    glow: 'rgba(124,58,237,0.06)', badge: 'bg-violet-50 border-violet-100 text-violet-700',
    btnBg: 'bg-violet-600 hover:bg-violet-700 shadow-violet-600/10 hover:shadow-violet-600/25',
    bulletBg: 'bg-violet-100 text-violet-600', metaBg: 'bg-white border-violet-100/30', pricingBg: 'bg-white border-violet-100/30'
  },
  'BLOOM': {
    bg: 'bg-[#ECFDF5]', border: 'border-emerald-100 hover:border-emerald-250', text: 'text-emerald-600',
    glow: 'rgba(5,150,105,0.06)', badge: 'bg-emerald-50 border-emerald-100 text-emerald-700',
    btnBg: 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/10 hover:shadow-emerald-600/25',
    bulletBg: 'bg-emerald-100 text-emerald-600', metaBg: 'bg-white border-emerald-100/30', pricingBg: 'bg-white border-emerald-100/30'
  },
  'IGNITE': {
    bg: 'bg-[#FDF2FF]', border: 'border-fuchsia-100 hover:border-fuchsia-250', text: 'text-primary',
    glow: 'rgba(192,38,211,0.06)', badge: 'bg-fuchsia-50 border-fuchsia-100 text-fuchsia-700',
    btnBg: 'bg-primary hover:bg-fuchsia-700 shadow-primary/10 hover:shadow-primary/25',
    bulletBg: 'bg-fuchsia-100 text-primary', metaBg: 'bg-white border-fuchsia-100/30', pricingBg: 'bg-white border-fuchsia-100/30'
  },
  'UNSTOPPABLE': {
    bg: 'bg-[#FFFDF0]', border: 'border-amber-100 hover:border-amber-250', text: 'text-amber-600',
    glow: 'rgba(217,119,6,0.06)', badge: 'bg-amber-50 border-amber-100 text-amber-700',
    btnBg: 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/10 hover:shadow-amber-600/25',
    bulletBg: 'bg-amber-100 text-amber-600', metaBg: 'bg-white border-amber-100/30', pricingBg: 'bg-white border-amber-100/30'
  },
};

const DEFAULT_STYLE = {
  bg: 'bg-slate-50', border: 'border-slate-200 hover:border-slate-350', text: 'text-slate-600',
  glow: 'rgba(71,85,105,0.04)', badge: 'bg-slate-50 border-slate-200 text-slate-700',
  btnBg: 'bg-slate-900 hover:bg-slate-800 shadow-slate-900/10 hover:shadow-slate-900/25',
  bulletBg: 'bg-slate-100 text-slate-600', metaBg: 'bg-white border-slate-100', pricingBg: 'bg-white border-slate-100'
};

const ENROLLED_THEMES: Record<string, { accent: string; gradient: string; border: string; badge: string; }> = {
  'SPARK': { accent: 'text-rose-600', gradient: 'from-rose-500 to-pink-600', border: 'border-rose-100', badge: 'bg-rose-50 border-rose-100 text-rose-700' },
  'RISE': { accent: 'text-violet-600', gradient: 'from-violet-500 to-indigo-600', border: 'border-violet-100', badge: 'bg-violet-50 border-violet-100 text-violet-700' },
  'BLOOM': { accent: 'text-emerald-600', gradient: 'from-emerald-500 to-teal-600', border: 'border-emerald-100', badge: 'bg-emerald-50 border-emerald-100 text-emerald-700' },
  'IGNITE': { accent: 'text-fuchsia-600', gradient: 'from-fuchsia-500 to-pink-600', border: 'border-fuchsia-100', badge: 'bg-fuchsia-50 border-fuchsia-100 text-fuchsia-700' },
  'UNSTOPPABLE': { accent: 'text-amber-600', gradient: 'from-amber-500 to-orange-600', border: 'border-amber-100', badge: 'bg-amber-50 border-amber-100 text-amber-700' },
};
const DEFAULT_ENROLLED_THEME = { accent: 'text-primary', gradient: 'from-primary to-accent', border: 'border-primary/20', badge: 'bg-primary/10 border-primary/20 text-primary' };


export default function CustomerDashboardOverview() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [enrollments, setEnrollments] = useState<ProgramEnrollment[]>([]);
  const [allPrograms, setAllPrograms] = useState<Program[]>([]);
  const [isLinked, setIsLinked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [parentBookmarks, setParentBookmarks] = useState<any[]>([]);
  const [demoSessions, setDemoSessions] = useState<any[]>([]);
  const [demosLoading, setDemosLoading] = useState(false);

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
      const [enrollRes, programsRes, linksRes, demosRes] = await Promise.all([
        ProgramsService.getUserEnrollments().catch(() => ({ success: true, data: [] })),
        ProgramsService.getPrograms().catch(() => []),
        ParentService.getLinks().catch(() => []),
        ProgramsService.getUserDemos().catch(() => ({ success: true, data: [] }))
      ]);
      setEnrollments(enrollRes.data || []);
      setAllPrograms(programsRes);
      setDemoSessions(demosRes.data || []);
      const linked = linksRes.some((link: any) => link.status === 'LINKED');
      setIsLinked(linked);

      // If teen user is linked, fetch parent's bookmarked articles
      if (user?.role === 'TEEN' && linked) {
        ParentService.getTeenParentBookmarks()
          .then(data => setParentBookmarks(data || []))
          .catch(() => setParentBookmarks([]));
      }
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


  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto">

      {/* Demo Booking Modal */}
      {demoModalProg && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setDemoModalProg(null)} />
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden z-10">
            {(() => {
              const theme = ENROLLED_THEMES[demoModalProg.title?.toUpperCase()] || DEFAULT_ENROLLED_THEME;
              return (
                <>
                  <div className={`h-2 w-full bg-gradient-to-r ${theme.gradient}`} />
                  <div className="p-8">
                    <button onClick={() => setDemoModalProg(null)} className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all">
                      <X size={18} />
                    </button>
                    
                    {demoSuccess ? (
                      <div className="text-center py-4">
                        <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto mb-4 text-emerald-600 shadow-md">
                          <Check size={32} strokeWidth={2.5} />
                        </div>
                        <h3 className="text-xl font-extrabold text-slate-800 mb-2">Demo Booked Successfully!</h3>
                        <p className="text-slate-500 text-xs leading-relaxed mb-6 font-semibold">
                          Your demo session for <strong className={theme.accent}>{demoModalProg.title} Program</strong> is requested for <strong className="text-slate-800">{demoSlotDate}</strong> at <strong className="text-slate-800">{demoSlotTime}</strong>. A guide will call you at <strong className="text-slate-800">{demoPhone}</strong>.
                        </p>
                        <button
                          onClick={() => setDemoModalProg(null)}
                          className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs uppercase tracking-widest rounded-2xl transition-all shadow-md active:scale-95 animate-in fade-in"
                        >
                          Close Window
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="mb-5">
                          <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${theme.badge}`}>Book Demo Session</span>
                          <h3 className={`text-2xl font-extrabold mt-2 ${theme.accent}`}>{demoModalProg.title} Program</h3>
                          <p className="text-xs text-slate-500 font-semibold mt-1">{demoModalProg.classRange} • {demoModalProg.sessions} Sessions • {demoModalProg.duration}</p>
                        </div>

                        <form onSubmit={handleDemoSubmit} className="space-y-4">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1.5 font-heading">Full Name *</label>
                            <input
                              type="text"
                              required
                              value={demoName}
                              onChange={e => setDemoName(e.target.value)}
                              placeholder="Your full name"
                              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-850 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1.5 font-heading">Phone Number *</label>
                            <input
                              type="tel"
                              required
                              value={demoPhone}
                              onChange={e => setDemoPhone(e.target.value)}
                              placeholder="Your phone number"
                              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-850 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1.5 font-heading">Email Address (Optional)</label>
                            <input
                              type="email"
                              value={demoEmail}
                              onChange={e => setDemoEmail(e.target.value)}
                              placeholder="Your email address"
                              className="w-full px-4 py-3 bg-[#FAFBFE] border border-slate-200 rounded-xl text-sm font-semibold text-slate-850 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-bold text-slate-700 mb-1.5 font-heading">Preferred Date *</label>
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
                                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-750 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm cursor-pointer"
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-bold text-slate-700 mb-1.5 font-heading">Preferred Time *</label>
                              <select
                                required
                                value={demoSlotTime}
                                onChange={e => setDemoSlotTime(e.target.value)}
                                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-750 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm cursor-pointer"
                              >
                                <option value="">Select Time</option>
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
                            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-extrabold py-4 rounded-2xl shadow-lg shadow-slate-900/10 flex items-center justify-center gap-2 text-sm transition-all active:scale-95 disabled:opacity-70 mt-4 cursor-pointer"
                          >
                            {demoSubmitting ? <Loader2 size={18} className="animate-spin" /> : <><ArrowRight size={16} /> Book Free Demo</>}
                          </button>
                        </form>
                      </>
                    )}
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}

      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-primary/10 via-accent/5 to-white p-8 rounded-2xl border border-primary/10 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden shadow-sm">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-3xl rounded-full translate-x-1/3 -translate-y-1/3 pointer-events-none" />
        <div className="space-y-2 relative z-10">
          <div className="flex items-center gap-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-primary/20 rounded-full text-[10px] font-black tracking-widest text-primary uppercase shadow-sm">
              <Sparkles size={11} /> Welcome to Gigi's Circle
            </div>
            {isLinked && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-[10px] font-black tracking-widest uppercase shadow-sm border border-indigo-200">
                <Check size={11} /> {isTeen ? 'Parent Linked' : 'Teen Linked'}
              </div>
            )}
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-800 tracking-tight leading-none">
            {isTeen ? 'Hey there, Champion! 🌟' : 'Empowering Her Journey 🤍'}
          </h1>
          <p className="text-sm font-semibold text-slate-500 max-w-lg leading-relaxed">
            {isTeen
              ? "Track your daily quests, active cohort sessions, and cycle insights — all in one place."
              : "Review your daughter's progress, session status, and explore new programs tailored for her."}
          </p>
        </div>
        {isTeen && enrollments.length > 0 && (
          <button className="bg-primary hover:bg-primary-dark text-white font-extrabold py-3.5 px-7 rounded-2xl flex items-center gap-2 shadow-lg shadow-primary/20 transition-all duration-200 active:scale-95 text-sm shrink-0">
            <Play size={16} className="fill-white" /> Join Active Cohort
          </button>
        )}
      </div>

      {!isTeen && <DashboardSummary />}

      <div className={showSidebar ? "grid grid-cols-1 lg:grid-cols-3 gap-6" : "space-y-12 w-full"}>
        <div className={showSidebar ? "lg:col-span-2 space-y-12" : "space-y-12 w-full"}>
          {/* DEMO SESSIONS GLIMPSE */}
          {demoSessions.length > 0 && (
            <div className="bg-white border border-slate-100 rounded-3xl p-8 md:p-10 shadow-xl shadow-slate-200/40 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-5">
                <div>
                  <h3 className="text-2xl font-extrabold text-slate-800 flex items-center gap-2">
                    <Calendar className="text-primary" size={26} /> Booked Demo Sessions
                  </h3>
                  <p className="text-sm font-semibold text-slate-400 mt-1">Status of your consultation slot bookings</p>
                </div>
                <Link href="/dashboard/expert-sessions?tab=demos" className="text-sm font-extrabold text-primary hover:underline flex items-center gap-1">
                  View Details <ChevronRight size={16} />
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {demoSessions.slice(0, 2).map((demo: any) => {
                  const progName = demo.suggestedPrograms?.[0] || 'Learning Program';
                  const theme = ENROLLED_THEMES[progName.toUpperCase()] || DEFAULT_ENROLLED_THEME;
                  return (
                    <div key={demo.id} className={`p-5 bg-white border ${theme.border} rounded-2xl flex items-center justify-between gap-4 hover:shadow-sm transition-all`}>
                      <div className="space-y-1.5 min-w-0">
                        <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${theme.badge} inline-block`}>
                          Demo Session
                        </span>
                        <h4 className={`font-extrabold text-base truncate ${theme.accent}`}>{progName}</h4>
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-500 mt-1">
                          <Calendar size={12} className="text-slate-400" />
                          <span>{demo.slotDate}</span>
                          <span>·</span>
                          <span>{demo.slotTime}</span>
                        </div>
                      </div>
                      
                      <span className={`text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border shrink-0 ${
                        demo.status === 'PENDING' ? 'bg-amber-500/10 text-amber-600 border-amber-500/20' :
                        demo.status === 'CONTACTED' ? 'bg-teal-500/10 text-teal-600 border-teal-500/20' :
                        demo.status === 'SCHEDULED' ? 'bg-purple-500/10 text-purple-600 border-purple-500/20' :
                        demo.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' :
                        'bg-rose-500/10 text-rose-600 border-rose-500/20'
                      }`}>
                        {demo.status}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* COMPACT PROGRAM PROGRESS OVERVIEW */}
          {enrollments.length > 0 && (
          <div className="bg-white border border-slate-100 rounded-3xl p-8 md:p-10 shadow-xl shadow-slate-200/40">
            <div className="flex items-center justify-between mb-8 border-b border-slate-100 pb-6">
              <div>
                <h3 className="text-2xl font-extrabold text-slate-800 flex items-center gap-2">
                  <Award className="text-primary" size={26} /> Program Progress
                </h3>
                <p className="text-sm font-semibold text-slate-400 mt-1">High-level status of your active enrollments</p>
              </div>
              <Link href="/dashboard/enrolled-programs" className="text-sm font-extrabold text-primary hover:underline flex items-center gap-1">
                View All Sessions <ChevronRight size={16} />
              </Link>
            </div>

            <div className="space-y-4">
              {enrollments.map(enr => {
                const theme = ENROLLED_THEMES[enr.program.title?.toUpperCase()] || DEFAULT_ENROLLED_THEME;
                const total = enr.program.sessions || 8;
                const dbSessions = enr.user?.scheduledSessions || [];
                const completed = dbSessions.filter((s: any) => s.status?.toLowerCase() === 'completed' && s.programId === enr.programId).length;
                const scheduled = dbSessions.find((s: any) => s.status?.toLowerCase() === 'scheduled' && s.programId === enr.programId);
                const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
                const nextDate = scheduled ? new Date(scheduled.scheduledAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : null;

                return (
                  <div key={enr.id} className={`p-6 bg-white border ${theme.border} rounded-2xl flex flex-col sm:flex-row sm:items-center gap-6 hover:shadow-md transition-all`}>
                    <div className={`h-16 w-2 rounded-full bg-gradient-to-b ${theme.gradient} shrink-0 hidden sm:block`} />
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div>
                          <h4 className={`font-extrabold text-xl ${theme.accent}`}>{enr.program.title}</h4>
                          <p className="text-xs font-semibold text-slate-400">{enr.program.classRange} • {enr.type === 'PRIVATE' ? '1:1 Private' : 'Group Cohort'}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {enr.user?.id && user?.id && enr.user.id !== user.id && (
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${enr.user?.role === 'TEEN' ? 'bg-purple-50 text-purple-600 border-purple-200' : 'bg-blue-50 text-blue-600 border-blue-200'}`}>
                              Enrolled by: {enr.user?.role === 'TEEN' ? 'Daughter' : 'Parent'}
                            </span>
                          )}
                          <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${theme.badge}`}>
                            {pct === 100 ? 'Completed' : 'Active'}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-[11px] font-bold text-slate-500">
                          <span>{completed}/{total} sessions done</span>
                          {nextDate && <span className="text-purple-600 flex items-center gap-1"><Calendar size={12} /> Next: {nextDate}</span>}
                          <span className={theme.accent}>{pct}%</span>
                        </div>
                        <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className={`h-full bg-gradient-to-r ${theme.gradient} transition-all duration-700 rounded-full`} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    </div>
                    <Link href={`/dashboard/enrolled-programs/${enr.id}`} className={`shrink-0 text-sm font-extrabold ${theme.accent} hover:underline flex items-center gap-1 whitespace-nowrap bg-slate-50 px-4 py-2 rounded-xl`}>
                      Timeline <ChevronRight size={16} />
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* AVAILABLE PROGRAMS CATALOG */}
        {availablePrograms.length > 0 && (
          <div className="space-y-8">
            <div className="mb-6">
              <h3 className="text-3xl font-extrabold text-slate-800 flex items-center gap-3">
                <Compass className="text-primary" size={28} /> Curated Learning Programs
              </h3>
              <p className="text-sm font-semibold text-slate-500 mt-2">Enroll in specialized expert cohorts designed to empower her growth</p>
            </div>
            <div className={`grid grid-cols-1 md:grid-cols-2 ${showSidebar ? "" : "lg:grid-cols-3"} gap-8 lg:gap-10`}>
              {availablePrograms.map((program) => {
                const styles = STYLES_MAP[program.title.toUpperCase()] || DEFAULT_STYLE;
                const formattedPricePrivate = program.pricePrivate?.toLocaleString('en-IN') || 0;
                const formattedPriceGroup = program.priceGroup?.toLocaleString('en-IN') || 0;

                return (
                  <motion.div
                    key={program.id}
                    className={`p-8 md:p-9 rounded-3xl border ${styles.bg} ${styles.border} shadow-xl hover:shadow-2xl transition-all duration-500 flex flex-col group relative`}
                    style={{ boxShadow: `0 20px 40px -15px ${styles.glow}` }}
                  >
                    {/* Decorative glow circle */}
                    <div
                      className="absolute -top-12 -right-12 w-28 h-28 rounded-full blur-[40px] pointer-events-none opacity-40 transition-all group-hover:scale-125 duration-500"
                      style={{ backgroundColor: styles.glow.replace('0.06', '0.2') }}
                    />

                    {/* Header: Title and Class Range */}
                    <div className="flex items-center justify-between mb-5 relative z-10">
                      <h3 className={`text-3xl font-bold tracking-tight ${styles.text}`}>
                        {program.title}
                      </h3>
                      <span className={`px-4 py-1.5 rounded-full text-xs font-bold border uppercase tracking-wider ${styles.badge}`}>
                        {program.classRange}
                      </span>
                    </div>

                    {/* Tagline */}
                    <p className="text-slate-800 font-semibold italic text-base leading-relaxed mb-6 min-h-[48px] relative z-10">
                      "{program.tagline || program.description}"
                    </p>

                    {/* Session / Duration details bar */}
                    <div className={`flex items-center gap-4 py-3 px-4 ${styles.metaBg} rounded-2xl border shadow-sm mb-6 text-slate-600 text-xs font-bold relative z-10`}>
                      <div className="flex items-center gap-1.5">
                        <BookOpen size={14} className={styles.text} />
                        <span>{program.sessions} Sessions</span>
                      </div>
                      <div className="h-3 w-[1px] bg-slate-200" />
                      <div className="flex items-center gap-1.5">
                        <Calendar size={14} className={styles.text} />
                        <span>{program.duration}</span>
                      </div>
                    </div>

                    {/* Topics covered block */}
                    <div className="mb-8 flex-1 relative z-10">
                      <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">What she will cover:</h4>
                      <ul className="space-y-2.5">
                        {program.topics?.slice(0, 5).map((topic, topicIdx) => (
                          <li key={topicIdx} className="flex items-start gap-2.5 text-slate-600 text-sm font-medium leading-tight">
                            <span className={`w-5 h-5 shrink-0 rounded-full flex items-center justify-center text-[10px] font-bold ${styles.bulletBg} mt-0.5`}>
                              <Check size={10} strokeWidth={3} />
                            </span>
                            <span>{topic}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Book Demo CTA */}
                    <button
                      onClick={() => handleBookDemoClick(program)}
                      className={`w-full inline-flex items-center justify-center gap-2 py-4 px-6 rounded-2xl text-white font-bold text-sm uppercase tracking-widest transition-all ${styles.btnBg} relative z-10`}
                    >
                      <span>Book Free Demo</span>
                      <ArrowRight size={16} className="transition-transform group-hover:translate-x-1 duration-300" />
                    </button>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}




        </div>
        {/* RIGHT SIDEBAR: PARENT BOOKMARKS FOR TEEN */}
        {showSidebar && (
          <div className="space-y-0">
            <div className="bg-white border border-slate-100 rounded-3xl p-4 md:p-6 shadow-xl shadow-slate-200/30">
              <div className="flex items-center justify-between mb-4 pb-2">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-rose-100 to-pink-100 flex items-center justify-center">
                      <Heart size={18} className="text-rose-500 fill-rose-500" />
                    </div>
                    <h4 className="text-lg font-extrabold text-slate-800">Recommended by Parent</h4>
                  </div>
                  <p className="text-xs font-semibold text-slate-400 ml-[44px]">Your parent bookmarked these articles for you</p>
                </div>
                <span className="text-[10px] font-black bg-rose-50 text-rose-600 border border-rose-100 px-2.5 py-1 rounded-full uppercase tracking-widest">
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
                <div className="text-center mt-4 pt-4 border-t border-slate-100">
                  <Link
                    href="/dashboard/resources"
                    className="inline-flex items-center gap-2 text-sm font-extrabold text-primary hover:underline"
                  >
                    View All {parentBookmarks.length} Articles <ChevronRight size={16} />
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
