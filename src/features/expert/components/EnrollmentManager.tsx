import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import { Eye, Search, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';

export function EnrollmentManager() {
  const router = useRouter();
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchEnrollments = async () => {
      try {
        const data = await apiClient.request<any[]>('/expert/enrollments');
        setEnrollments(data);
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
    <div className="bg-white rounded-3xl shadow-sm border border-border p-6 md:p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold">Active Enrollments</h2>
          <p className="text-muted-foreground mt-1">Manage and schedule sessions for enrolled students.</p>
        </div>

        <div className="relative w-full md:w-72">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-muted-foreground" />
          </div>
          <input
            type="text"
            placeholder="Search students or programs..."
            className="pl-10 w-full py-2.5 bg-secondary/30 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:outline-none transition-all text-sm font-medium"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border text-xs font-bold uppercase tracking-wider text-muted-foreground">
              <th className="py-4 px-4">Student Name</th>
              <th className="py-4 px-4">Program</th>
              <th className="py-4 px-4">Format</th>
              <th className="py-4 px-4">Enrolled Date</th>
              <th className="py-4 px-4 text-right">Sessions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              [...Array(4)].map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td colSpan={5} className="py-5 px-4">
                    <div className="h-4 bg-slate-100 rounded w-full" />
                  </td>
                </tr>
              ))
            ) : filteredEnrollments.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-12 text-muted-foreground font-medium">
                  No active enrollments found.
                </td>
              </tr>
            ) : (
              filteredEnrollments.map((enrollment) => {
                // Prefer guestName (set at payment time) over profile display name
                const studentName = enrollment.guestName || enrollment.user?.profile?.displayName || enrollment.user?.username || 'Unknown';
                const studentInitial = studentName.charAt(0).toUpperCase();

                return (
                  <tr key={enrollment.id} className="hover:bg-secondary/10 transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary/10 text-primary font-black flex items-center justify-center text-sm shrink-0">
                          {studentInitial}
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">{studentName}</p>
                          {enrollment.guestEmail && (
                            <p className="text-xs text-muted-foreground">{enrollment.guestEmail}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <p className="font-semibold text-foreground">{enrollment.program?.title}</p>
                      <p className="text-xs text-muted-foreground">{enrollment.program?.sessions || 0} Sessions</p>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${enrollment.type === 'PRIVATE'
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-blue-100 text-blue-700'
                        }`}>
                        {enrollment.type === 'PRIVATE' ? '1:1 Private' : 'Group'}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-sm text-muted-foreground font-medium">
                      {format(new Date(enrollment.createdAt), 'MMM d, yyyy')}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <button
                        onClick={() => router.push(`/admin/expert/enrollments/${enrollment.id}`)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary/10 text-primary rounded-xl hover:bg-primary hover:text-white transition-colors font-bold text-xs"
                        title="Manage Sessions"
                      >
                        Manage <ArrowRight size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
