'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import { Search, ArrowRight, Layers, Loader2, User, BookOpen } from 'lucide-react';
import { format } from 'date-fns';

export default function ExpertProgramSessionsPage() {
  const router = useRouter();
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchEnrollments = async () => {
      try {
        const data = await apiClient.request<any[]>('/expert/enrollments');
        setEnrollments(data || []);
      } catch (error) {
        console.error('Error fetching enrollments:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchEnrollments();
  }, []);

  const filteredEnrollments = enrollments.filter(env => {
    const name = env.guestName || env.user?.profile?.displayName || env.user?.username || '';
    return (
      name.toLowerCase().includes(search.toLowerCase()) ||
      env.program?.title?.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 w-full max-w-7xl mx-auto pb-8 font-sans">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 bg-white p-6 md:p-8 rounded-[2rem] border border-slate-100 shadow-2xs">
        <div>
          <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-slate-800 flex items-center gap-2.5">
            <span className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center shrink-0 border border-indigo-100">
              <Layers size={20} className="text-indigo-600" />
            </span>
            Program Sessions Workspace
          </h1>
          <p className="text-slate-500 text-xs md:text-sm font-semibold mt-1">
            Manage learning program curriculums, schedule 1:1 sessions, and set meet links per teen/parent student.
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
          <input
            type="text"
            placeholder="Search student or program..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50/80 border border-slate-200/80 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500/30 outline-none text-xs font-semibold transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Enrollments Table / Card List */}
      <div className="bg-white border border-slate-100 rounded-[2rem] shadow-2xs overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <Loader2 className="animate-spin text-indigo-600" size={32} />
            <p className="text-slate-400 text-xs font-bold">Loading active program enrollments...</p>
          </div>
        ) : filteredEnrollments.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-14 h-14 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-4 border border-slate-100">
              <Layers className="text-slate-400" size={22} />
            </div>
            <h4 className="font-bold text-slate-700">No active program enrollments</h4>
            <p className="text-xs text-slate-400 mt-1.5 max-w-sm mx-auto font-medium">
              {search ? 'No students match your search filter.' : 'When students enroll in 1:1 programs, they will appear in this workspace.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <th className="py-4 px-6">Student Name</th>
                  <th className="py-4 px-6">Enrolled Program</th>
                  <th className="py-4 px-6">Format</th>
                  <th className="py-4 px-6">Enrolled Date</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                {filteredEnrollments.map((enrollment) => {
                  const studentName = enrollment.guestName || enrollment.user?.profile?.displayName || enrollment.user?.username || 'Student';
                  const initial = studentName.charAt(0).toUpperCase();

                  return (
                    <tr key={enrollment.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-5 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-700 font-extrabold flex items-center justify-center text-sm shrink-0 border border-indigo-100">
                            {initial}
                          </div>
                          <div>
                            <p className="font-extrabold text-slate-800 text-sm">{studentName}</p>
                            {enrollment.guestEmail && (
                              <p className="text-[11px] text-slate-400 font-medium">{enrollment.guestEmail}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-5 px-6">
                        <p className="font-extrabold text-slate-800">{enrollment.program?.title}</p>
                        <p className="text-[11px] text-slate-400 font-medium">{enrollment.program?.curriculum?.length || 8} Curriculum Sessions</p>
                      </td>
                      <td className="py-5 px-6">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-50 text-purple-700 border border-purple-200/80">
                          1:1 Private
                        </span>
                      </td>
                      <td className="py-5 px-6 text-slate-500 font-medium">
                        {format(new Date(enrollment.createdAt), 'MMM d, yyyy')}
                      </td>
                      <td className="py-5 px-6 text-right">
                        <button
                          onClick={() => router.push(`/dashboard/program-sessions/${enrollment.id}`)}
                          className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all font-bold text-xs shadow-2xs active:scale-95"
                        >
                          Manage Sessions <ArrowRight size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
