'use client';

import { useState, useEffect, useCallback } from 'react';
import { Layers, ChevronRight, Loader2, ArrowLeft } from 'lucide-react';
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
          <h1 className="text-2xl font-extrabold text-slate-800 flex items-center gap-2"><Layers size={22} className="text-primary" /> Enrolled Programs</h1>
          <p className="text-xs font-semibold text-slate-400 mt-1">Your active program enrollments and session timeline</p>
        </div>
        <div className="bg-white border border-slate-100 rounded-2xl p-16 text-center shadow-sm space-y-4">
          <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto text-slate-300">
            <Layers size={30} />
          </div>
          <h3 className="font-extrabold text-slate-700">No enrollments yet</h3>
          <p className="text-xs font-semibold text-slate-400 max-w-xs mx-auto">You haven't enrolled in any programs. Explore our curated learning catalog and start today.</p>
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-xs font-extrabold text-primary hover:underline mt-2">
            <ArrowLeft size={13} /> Browse Programs
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-800 flex items-center gap-2"><Layers size={28} className="text-primary" /> Enrolled Programs</h1>
        <p className="text-sm font-semibold text-slate-500 mt-2">Click a program to view its full session timeline and details</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {enrollments.map(enr => {
          const theme = THEMES_MAP[enr.program.title?.toUpperCase()] || DEFAULT_THEME;
          const sessions: ProgramSession[] = (enr.program.sessionsList as ProgramSession[]) || Array.from({ length: enr.program.sessions || 8 }, (_, i) => ({ title: `Session ${i + 1}`, description: `Topic ${i + 1}` }));
          const dbSessions = enr.user?.scheduledSessions || [];
          const completed = dbSessions.filter((s: any) => s.status?.toLowerCase() === 'completed' && s.programId === enr.programId).length;
          const total = sessions.length;
          const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

          return (
            <Link
              key={enr.id}
              href={`/dashboard/enrolled-programs/${enr.id}`}
              className={`block w-full text-left p-6 rounded-3xl border-2 transition-all duration-300 bg-white border-slate-100 hover:border-slate-200 hover:shadow-xl hover:-translate-y-1`}
            >
              <div className={`h-1.5 w-full rounded-full bg-gradient-to-r ${theme.gradient} mb-5`} />
              <div className="flex items-center justify-between mb-2">
                <h3 className={`font-extrabold text-2xl ${theme.accent}`}>{enr.program.title}</h3>
                <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest ${theme.badge}`}>
                  {enr.type === 'PRIVATE' ? '1:1 Private' : 'Group'}
                </span>
              </div>
              <div className="flex items-center gap-2 mb-6">
                <p className="text-xs font-semibold text-slate-400">{enr.program.classRange} • {enr.program.sessions} Sessions</p>
                {enr.user?.id && user?.id && enr.user.id !== user.id && (
                  <>
                    <span className="text-[10px] text-slate-300 font-bold">•</span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider ${enr.user?.role === 'TEEN' ? 'bg-purple-50 text-purple-600 border-purple-200' : 'bg-blue-50 text-blue-600 border-blue-200'}`}>
                      By {enr.user?.role === 'TEEN' ? 'Daughter' : 'Parent'}
                    </span>
                  </>
                )}
              </div>
              
              <div className="space-y-2 mb-6">
                <div className="flex justify-between text-[11px] font-bold text-slate-500">
                  <span>{completed} of {total} completed</span>
                  <span className={theme.accent}>{pct}%</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full bg-gradient-to-r ${theme.gradient} transition-all duration-700`} style={{ width: `${pct}%` }} />
                </div>
              </div>

              <div className="flex items-center justify-end pt-4 border-t border-slate-100">
                <span className={`flex items-center gap-1.5 text-xs font-black ${theme.accent}`}>
                  View Details <ChevronRight size={14} />
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
