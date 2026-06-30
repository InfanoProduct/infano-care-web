'use client';

import { useState, useEffect, useCallback } from 'react';
import { Layers, CheckCircle2, Lock, Play, Calendar, ChevronRight, Loader2, Info, BookOpen, ArrowLeft } from 'lucide-react';
import { ProgramsService, ProgramEnrollment, ProgramSession } from '@/services/programs.service';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';

const THEMES_MAP: Record<string, { accent: string; gradient: string; badge: string }> = {
  'SPARK':       { accent: 'text-rose-600',    gradient: 'from-rose-500 to-pink-600',     badge: 'bg-rose-50 border-rose-100 text-rose-700' },
  'RISE':        { accent: 'text-violet-600',  gradient: 'from-violet-500 to-indigo-600', badge: 'bg-violet-50 border-violet-100 text-violet-700' },
  'BLOOM':       { accent: 'text-emerald-600', gradient: 'from-emerald-500 to-teal-600',  badge: 'bg-emerald-50 border-emerald-100 text-emerald-700' },
  'IGNITE':      { accent: 'text-fuchsia-600', gradient: 'from-fuchsia-500 to-pink-600',  badge: 'bg-fuchsia-50 border-fuchsia-100 text-fuchsia-700' },
  'UNSTOPPABLE': { accent: 'text-amber-600',   gradient: 'from-amber-500 to-orange-600',  badge: 'bg-amber-50 border-amber-100 text-amber-700' },
};
const DEFAULT_THEME = { accent: 'text-primary', gradient: 'from-primary to-accent', badge: 'bg-primary/10 border-primary/20 text-primary' };

const GRADIENT_STOPS: Record<string, { start: string; end: string }> = {
  'SPARK':       { start: '#f43f5e', end: '#ec4899' },
  'RISE':        { start: '#8b5cf6', end: '#6366f1' },
  'BLOOM':       { start: '#10b981', end: '#14b8a6' },
  'IGNITE':      { start: '#d946ef', end: '#ec4899' },
  'UNSTOPPABLE': { start: '#f59e0b', end: '#f97316' },
};
const DEFAULT_STOPS = { start: '#3b82f6', end: '#8b5cf6' };

export default function EnrolledProgramDetailsPage() {
  const { user } = useAuthStore();
  const params = useParams();
  const router = useRouter();
  const [enrollment, setEnrollment] = useState<ProgramEnrollment | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const res = await ProgramsService.getUserEnrollments().catch(() => ({ success: true, data: [] }));
      const data = res.data || [];
      const found = data.find(e => e.id === params.id);
      if (found) {
        setEnrollment(found);
      } else {
        toast.error('Enrollment not found');
        setTimeout(() => {
          router.push('/dashboard/enrolled-programs');
        }, 100);
      }
    } catch {
      toast.error('Failed to load details.');
    } finally {
      setLoading(false);
    }
  }, [params.id, router]);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <Loader2 className="animate-spin text-primary" size={40} />
        <span className="font-bold text-slate-500 text-sm">Loading session details...</span>
      </div>
    );
  }

  if (!enrollment) return null;

  const theme = THEMES_MAP[enrollment.program.title?.toUpperCase()] || DEFAULT_THEME;
  const stops = GRADIENT_STOPS[enrollment.program.title?.toUpperCase()] || DEFAULT_STOPS;
  const sessions: ProgramSession[] = (enrollment.program.curriculum && Array.isArray(enrollment.program.curriculum) && enrollment.program.curriculum.length > 0)
    ? (enrollment.program.curriculum as any[]).map((s: any) => ({
        title: s.title || `Session ${s.week || ''}`,
        description: s.description || '',
        thumbnailUrl: s.thumbnailUrl || enrollment.program.thumbnailUrl || undefined
      }))
    : (enrollment.program.sessionsList && enrollment.program.sessionsList.length > 0)
      ? (enrollment.program.sessionsList as ProgramSession[]).map((s: any) => ({
          ...s,
          thumbnailUrl: s.thumbnailUrl || enrollment.program.thumbnailUrl || undefined
        }))
      : Array.from({ length: 8 }, (_, i): ProgramSession => ({
          title: `Session ${i + 1}: Live Interaction`,
          description: `Dynamic developmental topic course lesson ${i + 1} led by verified guides.`,
          thumbnailUrl: enrollment.program.thumbnailUrl || undefined
        }));
  const dbSessions = enrollment.user?.scheduledSessions || [];
  
  const sessionsWithStatus = sessions.map((session: ProgramSession, index: number) => {
    const sessionNum = index + 1;
    const dbSession = dbSessions.find((s: any) => s.sessionNumber === sessionNum && s.programId === enrollment.programId);
    let status: 'completed' | 'scheduled' | 'not-scheduled' = 'not-scheduled';
    let formattedDate = 'TBD';
    let formattedTime = 'TBD';
    let meetLink = '';
    let isExpired = false;
    if (dbSession) {
      status = dbSession.status?.toLowerCase() as any;
      const t = new Date(dbSession.scheduledAt).getTime();
      formattedDate = new Date(t).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
      formattedTime = new Date(t).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' });
      meetLink = dbSession.meetLink || '';
      // Consider session expired if 2 hours have passed since the scheduled time
      isExpired = Date.now() > t + 2 * 60 * 60 * 1000;
    }
    return { ...session, status, formattedDate, formattedTime, meetLink, isExpired };
  });

  const completed = sessionsWithStatus.filter(s => s.status === 'completed').length;
  const total = sessions.length;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 w-full max-w-[1280px] mx-auto pb-8 px-4 sm:px-6">
      <Link 
        href="/dashboard/enrolled-programs" 
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-primary transition-colors group mb-2"
      >
        <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform duration-300" /> 
        Back to Enrolled Programs
      </Link>

      <div className="bg-white border border-slate-100 rounded-[28px] shadow-[0_8px_30px_rgb(0,0,0,0.02)] overflow-hidden">
        {/* Header background with subtle gradient, grids & abstract elements */}
        <div className="relative p-6 sm:p-8 border-b border-slate-150/50 bg-gradient-to-br from-white via-slate-50/40 to-slate-100/10 overflow-hidden">
          {/* Decorative Grid Mesh Graphics Element */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] bg-[size:2.5rem_2.5rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_80%,transparent_100%)] opacity-60 pointer-events-none" />
          <div className="absolute -right-16 -top-16 w-48 h-48 bg-gradient-to-br from-slate-200/30 to-slate-100/15 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              {enrollment.program.thumbnailUrl && (
                <div className="relative w-20 h-20 rounded-2xl overflow-hidden shrink-0 border border-slate-205 shadow-sm bg-white">
                  <img src={enrollment.program.thumbnailUrl} alt={enrollment.program.title} className="w-full h-full object-cover" />
                </div>
              )}
              
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full border ${theme.badge} shadow-3xs`}>
                    Live Program Active
                  </span>
                  {enrollment.user?.id && user?.id && enrollment.user.id !== user.id && (
                    <span className={`text-[9px] font-bold px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${
                      enrollment.user?.role === 'TEEN' 
                        ? 'bg-purple-50 text-purple-655 border-purple-200/60' 
                        : 'bg-blue-50 text-blue-600 border-blue-200/60'
                    }`}>
                      Enrolled by: {enrollment.user?.role === 'TEEN' ? 'Daughter' : 'Parent'}
                    </span>
                  )}
                </div>
                <h2 className={`text-2xl font-black mt-2 tracking-tight text-slate-900`}>{enrollment.program.title} Program</h2>
                <p className="text-xs font-bold text-slate-650 mt-1 flex flex-wrap items-center gap-1.5">
                  <span>{enrollment.program.classRange}</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                  <span>Enrolled {new Date(enrollment.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                  <span>1:1 Private Mentoring</span>
                </p>
              </div>
            </div>

            {/* Circular Progress Wheel with glowing back-orb */}
            <div className="relative flex items-center gap-4 bg-white/95 backdrop-blur-md p-4 rounded-2xl border border-slate-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
              <div className={`absolute -inset-1 rounded-[18px] bg-gradient-to-br ${theme.gradient} opacity-5 blur-xl pointer-events-none`} />
              <div className="text-left hidden sm:block relative z-10">
                <p className="text-slate-900 font-black text-sm">Your Progress</p>
                <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mt-0.5">Sessions completed</p>
              </div>
              
              <div className="relative flex items-center justify-center shrink-0 z-10">
                <svg className="w-14 h-14 transform -rotate-90">
                  <circle
                    cx="28"
                    cy="28"
                    r="24"
                    strokeWidth="4"
                    stroke="#F1F5F9"
                    fill="transparent"
                  />
                  <circle
                    cx="28"
                    cy="28"
                    r="24"
                    strokeWidth="4"
                    stroke="url(#headerProgressGradient)"
                    strokeDasharray={2 * Math.PI * 24}
                    strokeDashoffset={2 * Math.PI * 24 * (1 - pct / 100)}
                    strokeLinecap="round"
                    fill="transparent"
                  />
                  <defs>
                    <linearGradient id="headerProgressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor={stops.start} />
                      <stop offset="100%" stopColor={stops.end} />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute flex flex-col items-center justify-center text-center">
                  <span className="text-xs font-black text-slate-900 leading-none">{pct}%</span>
                  <span className="text-[7.5px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{completed}/{total}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sessions timeline */}
        <div className="p-6 sm:p-8 bg-gradient-to-b from-slate-50/50 via-slate-50/20 to-white">
          <h4 className="text-xs font-extrabold uppercase tracking-widest text-slate-450 mb-6 flex items-center gap-2">
            <BookOpen size={14} className="text-slate-400" /> Session Timeline
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {sessionsWithStatus.map((session: any, index: number) => {
              if (session.status === 'completed') return (
                <div
                  key={index}
                  className="group relative p-5 bg-white border border-slate-200/80 rounded-2xl shadow-2xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex items-start gap-4 overflow-hidden"
                >
                  <div className="absolute top-0 left-0 bottom-0 w-1 bg-gradient-to-b from-emerald-400 to-teal-500" />
                  
                  {/* Decorative success watermark icon */}
                  <div className="absolute -right-2 -bottom-2 text-emerald-500/5 pointer-events-none transform rotate-12 scale-150 group-hover:scale-160 group-hover:rotate-6 transition-all duration-500">
                    <CheckCircle2 size={80} />
                  </div>

                  {session.thumbnailUrl ? (
                    <div className="relative w-14 h-14 rounded-xl overflow-hidden shrink-0 border border-slate-205 shadow-3xs hidden sm:block">
                      <img src={session.thumbnailUrl} alt={session.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute inset-0 bg-emerald-500/10" />
                    </div>
                  ) : (
                    <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shrink-0 border border-emerald-100 shadow-3xs hidden sm:block">
                      <CheckCircle2 size={22} className="fill-emerald-100" />
                    </div>
                  )}

                  <div className="space-y-1.5 min-w-0 relative z-10 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="inline-flex items-center gap-1 text-[9px] font-black text-emerald-700 bg-emerald-50 border border-emerald-100/60 px-2 py-0.5 rounded-full uppercase tracking-wider">
                        <CheckCircle2 size={10} className="fill-current text-white" /> Completed
                      </span>
                      <span className="text-[11px] text-slate-500 font-bold">{session.formattedDate}</span>
                    </div>
                    <h6 className="font-black text-sm text-slate-900 leading-tight group-hover:text-emerald-700 transition-colors truncate">{session.title}</h6>
                    <p className="text-xs text-slate-600 font-bold leading-relaxed line-clamp-2">{session.description}</p>
                  </div>
                </div>
              );

              if (session.status === 'scheduled') return (
                <div
                  key={index}
                  id="upcoming-session"
                  className="group/scheduled p-6 border border-purple-200 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col gap-5 relative overflow-hidden sm:col-span-2 bg-gradient-to-br from-purple-50/80 via-indigo-50/30 to-white/90"
                >
                  {/* Decorative live watermark icon */}
                  <div className="absolute -right-4 -bottom-4 text-purple-650/5 pointer-events-none transform -rotate-12 scale-160 group-hover/scheduled:scale-170 group-hover/scheduled:rotate-0 transition-all duration-750">
                    <Play size={110} className="fill-current" />
                  </div>
                  <div className="absolute -right-16 -top-16 w-48 h-48 bg-purple-200/30 rounded-full blur-2xl pointer-events-none group-hover/scheduled:scale-105 transition-transform duration-500" />
                  
                  <div className="flex flex-col sm:flex-row sm:items-start gap-4.5 relative z-10">
                    {session.thumbnailUrl ? (
                      <div className="relative w-18 h-18 rounded-2xl overflow-hidden shrink-0 border border-purple-100 shadow-sm bg-white">
                        <img src={session.thumbnailUrl} alt={session.title} className="w-full h-full object-cover group-hover/scheduled:scale-105 transition-transform duration-500" />
                        <div className="absolute inset-0 bg-gradient-to-t from-purple-900/10 to-transparent" />
                      </div>
                    ) : (
                      <div className="w-18 h-18 bg-purple-650 text-white rounded-2xl flex items-center justify-center shrink-0 shadow-md animate-pulse">
                        <Play size={22} className="fill-white translate-x-0.5" />
                      </div>
                    )}
                    
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 text-[9px] font-black text-purple-750 bg-purple-100 border border-purple-200 px-2.5 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
                          <span className="w-1.5 h-1.5 rounded-full bg-purple-600 animate-ping" /> Upcoming Live Class
                        </span>
                        <span className="text-[11px] font-black text-indigo-700 flex items-center gap-1">
                          <Calendar size={12} className="text-purple-500" /> {session.formattedDate} at {session.formattedTime}
                        </span>
                      </div>
                      <h6 className="font-black text-lg text-slate-900 leading-snug tracking-tight">{session.title}</h6>
                      <p className="text-xs text-slate-700 font-bold leading-relaxed max-w-3xl">{session.description}</p>
                    </div>
                  </div>
                  
                  <div className="border-t border-purple-100/80 pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-1 relative z-10">
                    <div className="flex items-center gap-2 text-xs font-bold text-purple-900 bg-white border border-purple-200/50 shadow-2xs px-3.5 py-2 rounded-xl">
                      <Info size={14} className="text-purple-600 shrink-0" /> 
                      <span>Prepare your workbook before class</span>
                    </div>
                    
                    <div className="flex flex-col sm:items-end gap-1 shrink-0">
                      {session.meetLink ? (
                        session.isExpired ? (
                          <>
                            <button disabled className="bg-slate-205 text-slate-400 font-bold py-2.5 px-5 rounded-full flex items-center justify-center gap-1.5 text-xs cursor-not-allowed opacity-70 border border-slate-350">
                              Class Ended <ChevronRight size={14} />
                            </button>
                            <span className="text-[10px] text-red-500 font-bold mt-1">Expert will reschedule it</span>
                          </>
                        ) : (
                          <a 
                            href={session.meetLink} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-extrabold py-2.5 px-6 rounded-full flex items-center justify-center gap-1.5 text-xs shadow-[0_4px_14px_rgba(124,58,237,0.3)] hover:shadow-[0_6px_20px_rgba(124,58,237,0.45)] hover:-translate-y-0.5 active:scale-95 transition-all duration-200 cursor-pointer"
                          >
                            Join Live Class <ChevronRight size={14} className="group-hover/scheduled:translate-x-0.5 transition-transform" />
                          </a>
                        )
                      ) : (
                        <span className="text-xs text-purple-750 font-extrabold bg-purple-50 border border-purple-200 px-4 py-2 rounded-full flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" /> Meeting link coming soon
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );

              return (
                <div
                  key={index}
                  className="group/locked relative p-5.5 bg-white border border-slate-205 rounded-2xl flex items-start gap-4.5 hover:border-slate-350 hover:shadow-[0_8px_20px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 transition-all duration-300 overflow-hidden"
                >
                  {/* Decorative lock watermark icon */}
                  <div className="absolute -right-3 -bottom-3 text-slate-300/15 pointer-events-none transform rotate-12 scale-150 group-hover/locked:scale-155 group-hover/locked:rotate-6 transition-all duration-500">
                    <Lock size={80} />
                  </div>
                  
                  <div className="w-12 h-12 bg-slate-50 text-slate-500 border border-slate-200 rounded-xl flex items-center justify-center shrink-0 shadow-3xs relative z-10 group-hover/locked:bg-slate-100 group-hover/locked:text-slate-700 group-hover/locked:border-slate-300 transition-all duration-350">
                    <Lock size={18} className="transition-transform group-hover/locked:scale-105" />
                  </div>
                  <div className="space-y-2 relative z-10 flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 text-[9px] font-black text-slate-750 bg-slate-100 border border-slate-250 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                        Not Scheduled
                      </span>
                    </div>
                    <h6 className="font-extrabold text-sm text-slate-900 leading-tight group-hover/locked:text-slate-950 transition-colors truncate">{session.title}</h6>
                    <p className="text-xs text-slate-700 font-semibold leading-relaxed line-clamp-2">{session.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
