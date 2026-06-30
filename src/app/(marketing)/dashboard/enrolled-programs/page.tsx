'use client';

import { useState, useEffect, useCallback } from 'react';
import { Layers, ChevronRight, Loader2, ArrowLeft, Calendar, Play, Sparkles } from 'lucide-react';
import { ProgramsService, ProgramEnrollment, ProgramSession } from '@/services/programs.service';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth-store';

const THEMES_MAP: Record<string, { accent: string; gradient: string; border: string; badge: string; pill: string }> = {
  'SPARK':       { accent: 'text-rose-600',    gradient: 'from-rose-500 to-pink-600',     border: 'border-rose-100',    badge: 'bg-rose-50 border-rose-100 text-rose-700',    pill: 'bg-rose-100 text-rose-600' },
  'RISE':        { accent: 'text-violet-600',  gradient: 'from-violet-500 to-indigo-600', border: 'border-violet-100',  badge: 'bg-violet-50 border-violet-100 text-violet-700', pill: 'bg-violet-100 text-violet-600' },
  'BLOOM':       { accent: 'text-emerald-600', gradient: 'from-emerald-500 to-teal-600',  border: 'border-emerald-100', badge: 'bg-emerald-50 border-emerald-100 text-emerald-700', pill: 'bg-emerald-100 text-emerald-600' },
  'IGNITE':      { accent: 'text-fuchsia-600', gradient: 'from-fuchsia-500 to-pink-600',  border: 'border-fuchsia-100', badge: 'bg-fuchsia-50 border-fuchsia-100 text-fuchsia-700', pill: 'bg-fuchsia-100 text-fuchsia-600' },
  'UNSTOPPABLE': { accent: 'text-amber-600',   gradient: 'from-amber-500 to-orange-600',  border: 'border-amber-100',   badge: 'bg-amber-50 border-amber-100 text-amber-700',   pill: 'bg-amber-100 text-amber-600' },
};
const DEFAULT_THEME = { accent: 'text-primary', gradient: 'from-primary to-accent', border: 'border-primary/20', badge: 'bg-primary/10 border-primary/20 text-primary', pill: 'bg-primary/10 text-primary' };

export default function EnrolledProgramsPage() {
  const { user } = useAuthStore();
  const [enrollments, setEnrollments] = useState<ProgramEnrollment[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const res = await ProgramsService.getUserEnrollments().catch(() => ({ success: true, data: [] }));
      setEnrollments(res.data || []);
    } catch {
      toast.error('Failed to load enrolled programs.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <Loader2 className="animate-spin text-primary" size={40} />
        <span className="font-bold text-slate-500 text-sm">Loading your programs...</span>
      </div>
    );
  }

  if (enrollments.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2"><Layers size={18} className="text-primary" /> Enrolled Programs</h1>
          <p className="text-xs font-medium text-slate-400 mt-1">Your active program enrollments and session timeline</p>
        </div>
        <div className="bg-white border border-slate-100 rounded-xl p-10 text-center shadow-sm space-y-3.5">
          <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center mx-auto text-slate-300">
            <Layers size={22} />
          </div>
          <h3 className="font-bold text-slate-700">No enrollments yet</h3>
          <p className="text-xs font-medium text-slate-450 max-w-xs mx-auto">You haven't enrolled in any programs. Explore our curated learning catalog and start today.</p>
          <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline mt-2">
            <ArrowLeft size={13} /> Browse Programs
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 w-full max-w-[1280px] mx-auto pb-8">
      <div>
        <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2"><Layers size={20} className="text-primary" /> Enrolled Programs</h1>
        <p className="text-xs font-medium text-slate-505 mt-1">Click a program to view its full session timeline and details</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {enrollments.map(enr => {
          const theme = THEMES_MAP[enr.program.title?.toUpperCase()] || DEFAULT_THEME;
          const sessions: ProgramSession[] = (enr.program.curriculum && Array.isArray(enr.program.curriculum) && enr.program.curriculum.length > 0)
            ? (enr.program.curriculum as any[]).map((s: any) => ({
                title: s.title || `Session ${s.week || ''}`,
                description: s.description || '',
                thumbnailUrl: s.thumbnailUrl || enr.program.thumbnailUrl || undefined
              }))
            : (enr.program.sessionsList && enr.program.sessionsList.length > 0)
              ? (enr.program.sessionsList as ProgramSession[]).map((s: any) => ({
                  ...s,
                  thumbnailUrl: s.thumbnailUrl || enr.program.thumbnailUrl || undefined
                }))
              : Array.from({ length: 8 }, (_, i) => ({
                  title: `Session ${i + 1}`,
                  description: `Topic ${i + 1}`,
                  thumbnailUrl: enr.program.thumbnailUrl || undefined
                }));
          const dbSessions = enr.user?.scheduledSessions || [];
          const completed = dbSessions.filter((s: any) => s.status?.toLowerCase() === 'completed' && s.programId === enr.programId).length;
          const scheduled = dbSessions.find((s: any) => s.status?.toLowerCase() === 'scheduled' && s.programId === enr.programId);
          const total = sessions.length;
          const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

          return (
            <Link
              key={enr.id}
              href={`/dashboard/enrolled-programs/${enr.id}`}
              className="group relative block w-full text-left p-6 pt-8 rounded-[24px] border transition-all duration-300 bg-white border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:-translate-y-1.5 hover:shadow-[0_20px_40px_rgba(0,0,0,0.05)] hover:border-slate-200/80 overflow-hidden"
            >
              {/* Absolute top gradient border */}
              <div className={`absolute top-0 left-0 right-0 h-2 bg-gradient-to-r ${theme.gradient}`} />
              
              <div className="flex gap-4 mb-4.5">
                {enr.program.thumbnailUrl && (
                  <div className="relative w-16 h-16 rounded-[18px] overflow-hidden shrink-0 border border-slate-100 shadow-2xs">
                    <img 
                      src={enr.program.thumbnailUrl} 
                      alt={enr.program.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out" 
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className={`font-black text-lg ${theme.accent} leading-snug tracking-tight group-hover:text-opacity-90 transition-opacity truncate`} title={enr.program.title}>
                      {enr.program.title}
                    </h3>
                    <span className={`inline-flex items-center gap-1 text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider ${theme.badge} shrink-0 shadow-3xs`}>
                      1:1 Private
                    </span>
                  </div>
                  <div className="flex items-center flex-wrap gap-1.5 text-xs font-semibold text-slate-400">
                    <span>{enr.program.classRange}</span>
                    <span className="w-1 h-1 rounded-full bg-slate-200" />
                    <span>{enr.program.curriculum?.length || 8} Sessions</span>
                    {enr.user?.id && user?.id && enr.user.id !== user.id && (
                      <>
                        <span className="w-1 h-1 rounded-full bg-slate-200" />
                        <span className={`inline-flex items-center gap-0.5 text-[9px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${enr.user?.role === 'TEEN' ? 'bg-purple-50 text-purple-600 border-purple-200/60' : 'bg-blue-50 text-blue-600 border-blue-200/60'}`}>
                          By {enr.user?.role === 'TEEN' ? 'Daughter' : 'Parent'}
                        </span>
                      </>
                    )}
                  </div>
                  {enr.program.consultations && Array.isArray(enr.program.consultations) && enr.program.consultations.length > 0 && (
                    <div className="mt-2.5 flex items-center gap-1.5 bg-slate-50/60 border border-slate-100/50 p-2 rounded-xl">
                      <Sparkles size={11} className={`${theme.accent} animate-pulse shrink-0`} />
                      <span className="text-[10px] font-bold text-slate-500 leading-none truncate">
                        Free: <span className={`${theme.accent} font-extrabold`}>{enr.program.consultations.map((c: any) => c.title).join(', ')}</span>
                      </span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Progress Section */}
              <div className="space-y-2 mb-5 bg-slate-50/30 p-3 rounded-2xl border border-slate-100/40">
                <div className="flex justify-between items-center text-xs font-bold text-slate-500">
                  <span className="text-slate-600 font-semibold">{completed} of {total} completed</span>
                  <span className={`${theme.accent} font-black text-sm`}>{pct}%</span>
                </div>
                <div className="h-2 bg-slate-100/70 rounded-full overflow-hidden">
                  <div 
                    className={`h-full bg-gradient-to-r ${theme.gradient} transition-all duration-1000 ease-out rounded-full shadow-2xs`} 
                    style={{ width: `${pct}%` }} 
                  />
                </div>
              </div>

              {/* Upcoming Session Section */}
              {scheduled ? (
                <div className="mb-4 p-3 bg-slate-50/60 border border-slate-100/60 rounded-2xl flex items-center justify-between gap-3 shadow-3xs">
                  <div className="flex flex-col min-w-0">
                    <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mb-0.5">Upcoming Session</span>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 truncate">
                      <Calendar size={13} className={`${theme.accent} shrink-0`} />
                      <span className="truncate">
                        {new Date(scheduled.scheduledAt).toLocaleString('en-IN', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                  {scheduled.meetingLink && (
                    <button 
                      onClick={(e) => { 
                        e.preventDefault(); 
                        window.open(scheduled.meetingLink, '_blank'); 
                      }} 
                      className={`shrink-0 px-3.5 py-1.5 text-white text-[11px] font-extrabold rounded-full flex items-center gap-1 shadow-sm transition-all hover:scale-102 active:scale-95 hover:shadow-md bg-gradient-to-r ${theme.gradient}`}
                    >
                      <Play size={11} className="fill-current" /> Join Live
                    </button>
                  )}
                </div>
              ) : (
                <div className="mb-4 p-3 bg-slate-50/30 border border-dashed border-slate-100/80 rounded-2xl flex items-center justify-center gap-2">
                  <Calendar size={12} className="text-slate-300" />
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">No session scheduled</span>
                </div>
              )}

              {/* Footer action */}
              <div className="flex items-center justify-end pt-3 border-t border-slate-100/80">
                <span className={`inline-flex items-center gap-1.5 text-xs font-black tracking-tight ${theme.accent}`}>
                  View Details 
                  <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform duration-300 ease-out" />
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
