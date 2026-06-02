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
        router.push('/dashboard/enrolled-programs');
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
  const sessions: ProgramSession[] = (enrollment.program.sessionsList as ProgramSession[]) || Array.from({ length: enrollment.program.sessions || 8 }, (_, i): ProgramSession => ({ title: `Session ${i + 1}: Live Interaction`, description: `Dynamic developmental topic course lesson ${i + 1} led by verified guides.` }));
  const dbSessions = enrollment.user?.scheduledSessions || [];
  
  const sessionsWithStatus = sessions.map((session: ProgramSession, index: number) => {
    const sessionNum = index + 1;
    const dbSession = dbSessions.find((s: any) => s.sessionNumber === sessionNum && s.programId === enrollment.programId);
    let status: 'completed' | 'scheduled' | 'not-scheduled' = 'not-scheduled';
    let formattedDate = 'TBD';
    let formattedTime = 'TBD';
    let meetLink = '';
    if (dbSession) {
      status = dbSession.status?.toLowerCase() as any;
      const t = new Date(dbSession.scheduledAt).getTime();
      formattedDate = new Date(t).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
      formattedTime = new Date(t).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' });
      meetLink = dbSession.meetLink || '';
    }
    return { ...session, status, formattedDate, formattedTime, meetLink };
  });

  const completed = sessionsWithStatus.filter(s => s.status === 'completed').length;
  const total = sessions.length;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Link href="/dashboard/enrolled-programs" className="inline-flex items-center gap-2 text-sm font-extrabold text-slate-500 hover:text-primary transition-colors">
        <ArrowLeft size={16} /> Back to Enrolled Programs
      </Link>

      <div className="bg-white border border-slate-100 rounded-2xl shadow-xl shadow-slate-200/30 overflow-hidden">
        {/* Program Header */}
        <div className={`h-2 w-full bg-gradient-to-r ${theme.gradient}`} />
        <div className="p-8 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full ${theme.badge}`}>Live Program Active</span>
              {enrollment.user?.id && user?.id && enrollment.user.id !== user.id && (
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${enrollment.user?.role === 'TEEN' ? 'bg-purple-50 text-purple-600 border-purple-200' : 'bg-blue-50 text-blue-600 border-blue-200'}`}>
                  Enrolled by: {enrollment.user?.role === 'TEEN' ? 'Daughter' : 'Parent'}
                </span>
              )}
            </div>
            <h2 className={`text-3xl font-extrabold mt-2 ${theme.accent}`}>{enrollment.program.title} Program</h2>
            <p className="text-sm font-semibold text-slate-500 mt-1">
              {enrollment.program.classRange} • Enrolled {new Date(enrollment.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} • {enrollment.type === 'PRIVATE' ? '1:1 Private Mentoring' : 'Group Cohort'}
            </p>
          </div>
          <div className="flex items-center gap-4 shrink-0 bg-slate-50 px-6 py-4 rounded-2xl border border-slate-100">
            <div className="text-right">
              <span className="text-3xl font-black text-slate-800">{pct}%</span>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Completed</p>
            </div>
            <div className="w-14 h-14 bg-white border border-slate-100 rounded-xl flex items-center justify-center font-black text-lg text-slate-700 shadow-sm">
              {completed}/{total}
            </div>
          </div>
        </div>

        {/* Sessions grid */}
        <div className="p-8 bg-slate-50/30">
          <h4 className="text-sm font-black uppercase tracking-widest text-slate-500 mb-6 flex items-center gap-2"><BookOpen size={16} className="text-slate-400" /> Session Timeline</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {sessionsWithStatus.map((session: any, index: number) => {
              if (session.status === 'completed') return (
                <div key={index} className="p-5 bg-white border border-slate-200/60 rounded-2xl shadow-sm hover:shadow-md transition-shadow flex items-start gap-4 relative overflow-hidden">
                  <div className="absolute top-0 left-0 h-full w-1 bg-green-500" />
                  <div className="w-10 h-10 bg-green-50 text-green-600 border border-green-100 rounded-xl flex items-center justify-center shrink-0">
                    <CheckCircle2 size={20} className="fill-green-100" />
                  </div>
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-black text-green-700 bg-green-100 px-2 py-0.5 rounded-full uppercase tracking-wider">Completed</span>
                      <span className="text-[11px] text-slate-500 font-bold">{session.formattedDate}</span>
                    </div>
                    <h6 className="font-extrabold text-base text-slate-800 leading-tight truncate">{session.title}</h6>
                    <p className="text-xs text-slate-500 font-semibold leading-relaxed line-clamp-2">{session.description}</p>
                  </div>
                </div>
              );

              if (session.status === 'scheduled') return (
                <div key={index} id="upcoming-session" className="p-5 bg-gradient-to-br from-purple-50 to-indigo-50/50 border-2 border-purple-200 rounded-2xl shadow-lg flex flex-col gap-4 relative overflow-hidden sm:col-span-2">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-purple-600 text-white rounded-xl flex items-center justify-center shrink-0 shadow-md animate-bounce shadow-purple-600/20">
                      <Play size={20} className="fill-white translate-x-0.5" />
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-black text-purple-700 bg-purple-100 px-2.5 py-0.5 rounded-full uppercase tracking-widest animate-pulse border border-purple-200">Upcoming Live</span>
                        <span className="text-[11px] font-extrabold text-indigo-600 flex items-center gap-1"><Calendar size={12} /> {session.formattedDate} at {session.formattedTime}</span>
                      </div>
                      <h6 className="font-extrabold text-lg text-slate-900 leading-tight">{session.title}</h6>
                      <p className="text-xs text-slate-600 font-semibold leading-relaxed max-w-2xl">{session.description}</p>
                    </div>
                  </div>
                  <div className="border-t border-purple-200/60 pt-4 flex items-center justify-between gap-4 mt-2">
                    <div className="flex items-center gap-2 text-sm font-bold text-purple-800 bg-purple-100/50 px-4 py-2 rounded-xl"><Info size={16} /> Prepare your workbook before class</div>
                    {session.meetLink ? (
                      <a href={session.meetLink} target="_blank" rel="noopener noreferrer" className="bg-purple-600 hover:bg-purple-700 text-white font-extrabold py-3 px-6 rounded-xl flex items-center gap-2 text-sm transition-all active:scale-95 shadow-md shadow-purple-600/20">
                        Join Live Class <ChevronRight size={16} />
                      </a>
                    ) : (
                      <span className="text-sm text-purple-700 font-extrabold bg-purple-100 px-4 py-2.5 rounded-xl border border-purple-200">Link coming soon</span>
                    )}
                  </div>
                </div>
              );

              return (
                <div key={index} className="p-5 bg-slate-50 border border-slate-200/60 rounded-2xl flex items-start gap-4 hover:border-slate-300 transition-colors">
                  <div className="w-10 h-10 bg-white text-slate-400 border border-slate-200 rounded-xl flex items-center justify-center shrink-0 shadow-sm">
                    <Lock size={18} />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black text-slate-500 bg-slate-200/60 px-2 py-0.5 rounded-full uppercase tracking-wider">Not Scheduled</span>
                    </div>
                    <h6 className="font-extrabold text-base text-slate-600 leading-tight">{session.title}</h6>
                    <p className="text-xs text-slate-500 font-semibold leading-relaxed">{session.description}</p>
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
