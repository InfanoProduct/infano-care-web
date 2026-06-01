import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import { Eye, Search, User } from 'lucide-react';
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

  const filteredEnrollments = enrollments.filter(env => 
    env.user?.profile?.displayName?.toLowerCase().includes(search.toLowerCase()) ||
    env.program?.title?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-border p-6 md:p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold">Active Enrollments</h2>
          <p className="text-muted-foreground mt-1">Manage scheduled sessions for students in programs.</p>
        </div>
        
        <div className="relative w-full md:w-64">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-muted-foreground" />
          </div>
          <input
            type="text"
            placeholder="Search students..."
            className="pl-10 w-full py-2 bg-secondary/30 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:outline-none transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border">
              <th className="py-4 px-4 font-semibold text-muted-foreground">Student</th>
              <th className="py-4 px-4 font-semibold text-muted-foreground">Program</th>
              <th className="py-4 px-4 font-semibold text-muted-foreground">Status</th>
              <th className="py-4 px-4 font-semibold text-muted-foreground">Enrolled Date</th>
              <th className="py-4 px-4 font-semibold text-muted-foreground text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="text-center py-8 text-muted-foreground">Loading enrollments...</td>
              </tr>
            ) : filteredEnrollments.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-8 text-muted-foreground">No active enrollments found.</td>
              </tr>
            ) : (
              filteredEnrollments.map((enrollment) => (
                <tr key={enrollment.id} className="border-b border-border hover:bg-secondary/10 transition-colors">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <User size={18} />
                      </div>
                      <div>
                        <p className="font-semibold">{enrollment.user?.profile?.displayName || 'Unknown User'}</p>
                        <p className="text-xs text-muted-foreground">{enrollment.user?.username}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <p className="font-medium">{enrollment.program?.title}</p>
                    <p className="text-xs text-muted-foreground">{enrollment.program?.sessions || 0} Sessions Total</p>
                  </td>
                  <td className="py-4 px-4">
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                      {enrollment.status}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-sm">
                    {format(new Date(enrollment.createdAt), 'MMM d, yyyy')}
                  </td>
                  <td className="py-4 px-4 text-right">
                    <button 
                      onClick={() => router.push(`/admin/expert/enrollments/${enrollment.id}`)}
                      className="p-2 bg-primary/10 text-primary rounded-xl hover:bg-primary hover:text-white transition-colors inline-flex"
                      title="View Details"
                    >
                      <Eye size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
