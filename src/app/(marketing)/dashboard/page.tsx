'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  BookOpen, Calendar, ShieldCheck, Star, Sparkles,
  ChevronRight, Play, Loader2, Award, Layers, Compass, X, Check, ArrowRight, User, Users, Bookmark, Heart, GraduationCap
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


  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 w-full max-w-[1280px] mx-auto pb-8">

      {/* Demo Booking Modal */}
      {demoModalProg && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setDemoModalProg(null)} />
          <div className="relative w-full max-w-md bg-white rounded-xl shadow-xl overflow-hidden z-10 border border-slate-100 animate-in zoom-in-95">
            {(() => {
              const theme = ENROLLED_THEMES[demoModalProg.title?.toUpperCase()] || DEFAULT_ENROLLED_THEME;
              return (
                <>
                  <div className={`h-1.5 w-full bg-gradient-to-r ${theme.gradient}`} />
                  <div className="p-6">
                    <button onClick={() => setDemoModalProg(null)} className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-650 hover:bg-slate-50 rounded-lg transition-all">
                      <X size={16} />
                    </button>

                    {demoSuccess ? (
                      <div className="text-center py-4">
                        <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto mb-3 text-emerald-600 shadow-sm">
                          <Check size={24} strokeWidth={2.5} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-800 mb-1.5">Demo Booked Successfully!</h3>
                        <p className="text-slate-500 text-xs leading-relaxed mb-5 font-medium">
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
                          <p className="text-xs text-slate-500 font-medium mt-0.5">{demoModalProg.classRange} • {demoModalProg.sessions} Sessions • {demoModalProg.duration}</p>
                        </div>

                        <form onSubmit={handleDemoSubmit} className="space-y-3.5">
                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
                            <input
                              type="text"
                              required
                              value={demoName}
                              onChange={e => setDemoName(e.target.value)}
                              placeholder="Your full name"
                              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number *</label>
                            <input
                              type="tel"
                              required
                              value={demoPhone}
                              onChange={e => setDemoPhone(e.target.value)}
                              placeholder="Your phone number"
                              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address (Optional)</label>
                            <input
                              type="email"
                              value={demoEmail}
                              onChange={e => setDemoEmail(e.target.value)}
                              placeholder="Your email address"
                              className="w-full px-3.5 py-2.5 bg-[#FAFBFE] border border-slate-200 rounded-lg text-sm font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-3">
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
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer"
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-semibold text-slate-700 mb-1">Preferred Time *</label>
                              <select
                                required
                                value={demoSlotTime}
                                onChange={e => setDemoSlotTime(e.target.value)}
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer"
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
        </div>
      )}

      {/* Welcome Banner */}
      <div className="bg-slate-50 p-6 rounded-xl border border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden shadow-sm">
        <div className="space-y-2 relative z-10">
          <div className="flex items-center gap-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-white border border-primary/20 rounded-md text-[10px] font-bold text-primary shadow-sm">
              <Sparkles size={11} /> Welcome to Gigi's Circle
            </div>
            {isLinked && (
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-indigo-100 text-indigo-700 rounded-md text-[10px] font-bold shadow-sm border border-indigo-200">
                <Check size={11} /> {isTeen ? 'Parent Linked' : 'Teen Linked'}
              </div>
            )}
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">
            {isTeen ? 'Hey there, Champion! 🌟' : 'Empowering Her Journey 🤍'}
          </h1>
          <p className="text-xs font-semibold text-slate-500 max-w-lg leading-relaxed">
            {isTeen
              ? "Track your daily quests, active cohort sessions, and cycle insights — all in one place."
              : "Review your daughter's progress, session status, and explore new programs tailored for her."}
          </p>
        </div>
        {isTeen && enrollments.length > 0 && (
          <button className="bg-primary hover:bg-primary-dark text-white font-bold py-2.5 px-5 rounded-lg flex items-center gap-2 shadow-sm transition-all duration-200 active:scale-95 text-xs shrink-0">
            <Play size={14} className="fill-white" /> Join Active Cohort
          </button>
        )}
      </div>

      {!isTeen && <DashboardSummary />}

      <div className={showSidebar ? "grid grid-cols-1 lg:grid-cols-3 gap-6" : "space-y-6 w-full"}>
        <div className={showSidebar ? "lg:col-span-2 space-y-6" : "space-y-6 w-full"}>
          {/* DEMO SESSIONS GLIMPSE */}
          {demoSessions.length > 0 && (
            <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                    <Calendar className="text-primary" size={20} /> Booked Demo Sessions
                  </h3>
                  <p className="text-xs font-medium text-slate-400 mt-0.5">Status of your consultation slot bookings</p>
                </div>
                <Link href="/dashboard/expert-sessions?tab=demos" className="text-xs font-bold text-primary hover:underline flex items-center gap-0.5">
                  View Details <ChevronRight size={14} />
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {demoSessions.slice(0, 2).map((demo: any) => {
                  const progName = demo.suggestedPrograms?.[0] || 'Learning Program';
                  const theme = ENROLLED_THEMES[progName.toUpperCase()] || DEFAULT_ENROLLED_THEME;
                  return (
                    <div key={demo.id} className={`p-4 bg-white border ${theme.border} rounded-lg flex items-center justify-between gap-4 hover:shadow-sm transition-all`}>
                      <div className="space-y-1 min-w-0">
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md ${theme.badge} inline-block`}>
                          Demo Session
                        </span>
                        <h4 className={`font-bold text-sm truncate ${theme.accent}`}>{progName}</h4>
                        <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mt-1">
                          <Calendar size={11} className="text-slate-400" />
                          <span>{demo.slotDate}</span>
                          <span>·</span>
                          <span>{demo.slotTime}</span>
                        </div>
                      </div>

                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md border shrink-0 ${demo.status === 'PENDING' ? 'bg-amber-500/10 text-amber-600 border-amber-500/20' :
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
            <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
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
                  const theme = ENROLLED_THEMES[enr.program.title?.toUpperCase()] || DEFAULT_ENROLLED_THEME;
                  const total = enr.program.sessions || 8;
                  const dbSessions = enr.user?.scheduledSessions || [];
                  const completed = dbSessions.filter((s: any) => s.status?.toLowerCase() === 'completed' && s.programId === enr.programId).length;
                  const scheduled = dbSessions.find((s: any) => s.status?.toLowerCase() === 'scheduled' && s.programId === enr.programId);
                  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
                  const nextDate = scheduled ? new Date(scheduled.scheduledAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : null;

                  return (
                    <div key={enr.id} className={`p-4 bg-white border ${theme.border} rounded-lg flex flex-col sm:flex-row sm:items-center gap-4 hover:shadow-sm transition-all`}>
                      <div className="flex-1 space-y-2.5">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div>
                            <h4 className={`font-bold text-base ${theme.accent}`}>{enr.program.title}</h4>
                            <p className="text-xs font-medium text-slate-400">{enr.program.classRange} • {enr.type === 'PRIVATE' ? '1:1 Private' : 'Group Cohort'}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            {enr.user?.id && user?.id && enr.user.id !== user.id && (
                              <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded border ${enr.user?.role === 'TEEN' ? 'bg-purple-50 text-purple-600 border-purple-200' : 'bg-blue-50 text-blue-600 border-blue-200'}`}>
                                Enrolled by: {enr.user?.role === 'TEEN' ? 'Daughter' : 'Parent'}
                              </span>
                            )}
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md ${theme.badge}`}>
                              {pct === 100 ? 'Completed' : 'Active'}
                            </span>
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-[11px] font-medium text-slate-500">
                            <span>{completed}/{total} sessions done</span>
                            {nextDate && <span className="text-purple-600 flex items-center gap-1"><Calendar size={11} /> Next: {nextDate}</span>}
                            <span className={theme.accent}>{pct}%</span>
                          </div>
                          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div className={`h-full bg-gradient-to-r ${theme.gradient} transition-all duration-700 rounded-full`} style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      </div>
                      <Link href={`/dashboard/enrolled-programs/${enr.id}`} className={`shrink-0 text-xs font-bold ${theme.accent} hover:underline flex items-center gap-0.5 whitespace-nowrap bg-slate-50 px-3.5 py-1.5 rounded-lg border border-slate-100`}>
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
              <div className="bg-white border border-slate-100 rounded-3xl p-8 md:p-10 shadow-xl shadow-slate-200/40">
                <div className="flex items-center justify-between mb-8 border-b border-slate-100 pb-6">
                  <div>
                    <h3 className="text-2xl font-extrabold text-slate-800 flex items-center gap-2">
                      <GraduationCap className="text-purple-500" size={26} /> Learning Journeys
                    </h3>
                    <p className="text-sm font-semibold text-slate-400 mt-1">Interactive learning paths with episodes and XP</p>
                  </div>
                  <Link href="/dashboard/learning-journeys" className="text-sm font-extrabold text-primary hover:underline flex items-center gap-1">
                    View All <ChevronRight size={16} />
                  </Link>
                </div>

                <div className="space-y-4">
                  {journeyStats.slice(0, 3).map(({ journey, completedCount, totalCount, pct, isMastered }) => (
                    <Link
                      key={journey.id}
                      href={`/dashboard/learning-journeys/${journey.id}`}
                      className={`block p-5 bg-white border ${isMastered ? 'border-emerald-200' : 'border-slate-100'} rounded-2xl hover:shadow-md transition-all group`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl shrink-0 flex items-center justify-center ${isMastered ? 'bg-emerald-100' : 'bg-purple-100'
                          }`}>
                          {isMastered
                            ? <Check size={20} className="text-emerald-500" />
                            : <GraduationCap size={20} className="text-purple-500" />
                          }
                        </div>
                        <div className="flex-1 min-w-0 space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <h4 className="font-extrabold text-slate-800 truncate">{journey.title}</h4>
                            <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest shrink-0 ${isMastered
                                ? 'bg-emerald-50 border border-emerald-200 text-emerald-700'
                                : 'bg-purple-50 border border-purple-100 text-purple-700'
                              }`}>
                              {isMastered ? 'Mastered' : pct > 0 ? 'In Progress' : 'New'}
                            </span>
                          </div>
                          <div className="flex justify-between text-[11px] font-bold text-slate-500">
                            <span>{completedCount}/{totalCount} episodes</span>
                            <span className={isMastered ? 'text-emerald-600' : 'text-purple-600'}>{pct}%</span>
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
                <h3 className="text-base font-bold text-slate-800 flex items-center gap-2.5">
                  <Compass className="text-primary" size={22} /> Curated Learning Programs
                </h3>
                <p className="text-xs font-medium text-slate-500 mt-0.5">Enroll in specialized expert cohorts designed to empower her growth</p>
              </div>
              <div className={`grid grid-cols-1 md:grid-cols-2 ${showSidebar ? "" : "lg:grid-cols-3"} gap-5`}>
                {availablePrograms.map((program) => {
                  const styles = STYLES_MAP[program.title.toUpperCase()] || DEFAULT_STYLE;

                  return (
                    <div
                      key={program.id}
                      className={`p-5 rounded-xl border ${styles.bg} ${styles.border} shadow-sm hover:shadow-md transition-all duration-300 flex flex-col group relative`}
                    >
                      {/* Header: Title and Class Range */}
                      <div className="flex items-center justify-between mb-4 relative z-10">
                        <h3 className={`text-lg font-bold tracking-tight ${styles.text}`}>
                          {program.title}
                        </h3>
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${styles.badge}`}>
                          {program.classRange}
                        </span>
                      </div>

                      {/* Tagline */}
                      <p className="text-slate-700 font-semibold text-xs leading-relaxed mb-4 min-h-[36px] relative z-10">
                        "{program.tagline || program.description}"
                      </p>

                      {/* Session / Duration details bar */}
                      <div className={`flex items-center gap-3 py-2 px-3 ${styles.metaBg} rounded-lg border shadow-sm mb-4 text-slate-600 text-[10px] font-bold relative z-10`}>
                        <div className="flex items-center gap-1">
                          <BookOpen size={12} className={styles.text} />
                          <span>{program.sessions} Sessions</span>
                        </div>
                        <div className="h-3 w-[1px] bg-slate-200" />
                        <div className="flex items-center gap-1">
                          <Calendar size={12} className={styles.text} />
                          <span>{program.duration}</span>
                        </div>
                      </div>

                      {/* Topics covered block */}
                      <div className="mb-5 flex-1 relative z-10">
                        <h4 className="text-[9px] font-bold text-slate-400 mb-2.5">What she will cover:</h4>
                        <ul className="space-y-2">
                          {program.topics?.slice(0, 5).map((topic, topicIdx) => (
                            <li key={topicIdx} className="flex items-start gap-2 text-slate-600 text-xs font-medium leading-tight">
                              <span className={`w-4 h-4 shrink-0 rounded-md flex items-center justify-center text-[9px] font-bold ${styles.bulletBg} mt-0.5`}>
                                <Check size={9} strokeWidth={3} />
                              </span>
                              <span>{topic}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Book Demo CTA */}
                      <button
                        onClick={() => handleBookDemoClick(program)}
                        className={`w-full inline-flex items-center justify-center gap-1.5 py-3 px-4 rounded-lg text-white font-bold text-xs transition-all ${styles.btnBg} relative z-10 cursor-pointer`}
                      >
                        <span>Book Free Demo</span>
                        <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5 duration-300" />
                      </button>
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
            <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-50 pb-2">
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-rose-100 to-pink-100 flex items-center justify-center shrink-0">
                      <Heart size={14} className="text-rose-500 fill-rose-500" />
                    </div>
                    <h4 className="text-sm font-bold text-slate-800">Recommended by Parent</h4>
                  </div>
                  <p className="text-[11px] font-medium text-slate-400 ml-[36px]">Your parent bookmarked these articles for you</p>
                </div>
                <span className="text-[10px] font-bold bg-rose-50 text-rose-600 border border-rose-100 px-2 py-0.5 rounded-md">
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
