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
  const [learningJourneys, setLearningJourneys] = useState<LearningJourney[]>([]);
  const [learningProgress, setLearningProgress] = useState<UserProgress[]>([]);

  // Enrollment modal state
  const [enrollModalProg, setEnrollModalProg] = useState<Program | null>(null);
  const [enrollName, setEnrollName] = useState(user?.profile?.displayName || user?.username || '');
  const [enrollEmail, setEnrollEmail] = useState(user?.email || '');
  const [enrollFormat, setEnrollFormat] = useState<'GROUP' | 'PRIVATE'>('GROUP');
  const [enrollSubmitting, setEnrollSubmitting] = useState(false);

  const isTeen = user?.role === 'TEEN';

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const [enrollRes, programsRes, linksRes] = await Promise.all([
        ProgramsService.getUserEnrollments().catch(() => ({ success: true, data: [] })),
        ProgramsService.getPrograms().catch(() => []),
        ParentService.getLinks().catch(() => [])
      ]);
      setEnrollments(enrollRes.data || []);
      setAllPrograms(programsRes);
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
  }, []);

  useEffect(() => { loadDashboardData(); }, [loadDashboardData]);

  const handleEnrollSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!enrollModalProg) return;
    if (!enrollName.trim() || !enrollEmail.trim()) {
      toast.error('Please fill in your name and email.');
      return;
    }
    setEnrollSubmitting(true);

    try {
      const prog = enrollModalProg;
      const bookId = `${prog.title.toLowerCase()}-${enrollFormat === 'PRIVATE' ? 'private' : 'group'}`;

      const orderData = {
        guestName: enrollName,
        guestEmail: enrollEmail,
        guestPhone: user?.phone || '0000000000',
        shippingAddress: "Virtual Enrollment",
        city: "Online",
        state: "Online",
        pincode: "000000",
        paymentMethod: "ONLINE" as const,
        userId: user?.id,
        items: [{ bookId: bookId, quantity: 1 }],
      };

      const order = await ShopService.createOrder(orderData);

      if (order.razorpayOrderId) {
        if (typeof (window as any).Razorpay === 'undefined') {
          toast.error('Payment gateway is loading. Try again in a few seconds.');
          setEnrollSubmitting(false);
          return;
        }
        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          amount: order.totalAmount * 100,
          currency: 'INR',
          name: 'Infano.care',
          description: `Enrollment: ${prog.title}`,
          order_id: order.razorpayOrderId,
          handler: async function (response: any) {
            try {
              await ShopService.verifyPayment({
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              });
              toast.success('Successfully Enrolled!');
              setEnrollModalProg(null);
              loadDashboardData();
            } catch (err) {
              toast.error('Payment verification failed.');
            } finally {
              setEnrollSubmitting(false);
            }
          },
          prefill: {
            name: enrollName,
            email: enrollEmail,
            contact: user?.phone || '',
          },
          modal: { ondismiss: () => setEnrollSubmitting(false) }
        };
        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      } else {
        toast.success('Successfully Enrolled!');
        setEnrollModalProg(null);
        loadDashboardData();
        setEnrollSubmitting(false);
      }
    } catch (err: any) {
      toast.error(err.message || 'Enrollment failed');
      setEnrollSubmitting(false);
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

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto">

      {/* Enrollment Detail Modal */}
      {enrollModalProg && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => { setEnrollModalProg(null); setEnrollName(user?.profile?.displayName || user?.username || ''); setEnrollEmail(user?.email || ''); }} />
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden z-10">
            {(() => {
              const theme = ENROLLED_THEMES[enrollModalProg.title?.toUpperCase()] || DEFAULT_ENROLLED_THEME;
              return (
                <>
                  <div className={`h-2 w-full bg-gradient-to-r ${theme.gradient}`} />
                  <div className="p-8">
                    <button onClick={() => { setEnrollModalProg(null); setEnrollName(user?.profile?.displayName || user?.username || ''); setEnrollEmail(user?.email || ''); }} className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all">
                      <X size={18} />
                    </button>
                    <div className="mb-6">
                      <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${theme.badge}`}>Enrolling Now</span>
                      <h3 className={`text-2xl font-extrabold mt-2 ${theme.accent}`}>{enrollModalProg.title} Program</h3>
                      <p className="text-xs text-slate-500 font-semibold mt-1">{enrollModalProg.classRange} • {enrollModalProg.sessions} Sessions • {enrollModalProg.duration}</p>
                    </div>

                    <form onSubmit={handleEnrollSubmit} className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">Full Name *</label>
                        <input
                          type="text"
                          required
                          value={enrollName}
                          onChange={e => setEnrollName(e.target.value)}
                          placeholder="e.g. Anjali Sharma"
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">Email Address *</label>
                        <input
                          type="email"
                          required
                          value={enrollEmail}
                          onChange={e => setEnrollEmail(e.target.value)}
                          placeholder="e.g. parent@email.com"
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">Learning Format</label>
                        <div className="grid grid-cols-2 gap-3">
                          {(['GROUP', 'PRIVATE'] as const).map(fmt => (
                            <button
                              key={fmt}
                              type="button"
                              onClick={() => setEnrollFormat(fmt)}
                              className={`py-2.5 px-3 rounded-xl border-2 text-xs font-extrabold uppercase tracking-wider transition-all ${enrollFormat === fmt ? `${theme.border} ${theme.accent} bg-white shadow-sm` : 'border-slate-100 text-slate-400 hover:border-slate-200'}`}
                            >
                              {fmt === 'GROUP' ? `Group — ₹${enrollModalProg.priceGroup?.toLocaleString()}` : `1:1 Private — ₹${enrollModalProg.pricePrivate?.toLocaleString()}`}
                            </button>
                          ))}
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={enrollSubmitting}
                        className={`w-full bg-slate-900 hover:bg-slate-800 text-white font-extrabold py-4 rounded-2xl shadow-md flex items-center justify-center gap-2 text-sm transition-all active:scale-95 disabled:opacity-70 mt-2`}
                      >
                        {enrollSubmitting ? <Loader2 size={18} className="animate-spin" /> : <><ArrowRight size={16} /> Proceed to Checkout</>}
                      </button>
                    </form>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}

      {/* Razorpay Script */}
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />

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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-12">
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
                      <div className={`w-12 h-12 rounded-xl shrink-0 flex items-center justify-center ${
                        isMastered ? 'bg-emerald-100' : 'bg-purple-100'
                      }`}>
                        {isMastered
                          ? <Check size={20} className="text-emerald-500" />
                          : <GraduationCap size={20} className="text-purple-500" />
                        }
                      </div>
                      <div className="flex-1 min-w-0 space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="font-extrabold text-slate-800 truncate">{journey.title}</h4>
                          <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest shrink-0 ${
                            isMastered
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
          <div className="space-y-8">
            <div className="mb-6">
              <h3 className="text-3xl font-extrabold text-slate-800 flex items-center gap-3">
                <Compass className="text-primary" size={28} /> Curated Learning Programs
              </h3>
              <p className="text-sm font-semibold text-slate-500 mt-2">Enroll in specialized expert cohorts designed to empower her growth</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
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

                    {/* Direct Link CTA */}
                    <button
                      onClick={() => { setEnrollModalProg(program); setEnrollName(user?.profile?.displayName || user?.username || ''); setEnrollEmail(user?.email || ''); setEnrollFormat('GROUP'); }}
                      className={`w-full inline-flex items-center justify-center gap-2 py-4 px-6 rounded-2xl text-white font-bold text-sm uppercase tracking-widest transition-all ${styles.btnBg} relative z-10`}
                    >
                      <span>Enroll Now</span>
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
        <div className="space-y-0">
          {isTeen && parentBookmarks.length > 0 && (
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
          )}
        </div>
      </div>
    </div>
  );
}
