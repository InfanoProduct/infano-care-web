'use client';

import { useState, useEffect } from 'react';
import { Award, CheckCircle2, XCircle, Download, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { SchoolService, School } from '@/services/school.service';
import { useAuthStore } from '@/store/auth-store';
import { toast } from 'react-hot-toast';

export default function SchoolCoordinatorTeachersPage() {
  const { user } = useAuthStore();
  const [school, setSchool] = useState<School | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user?.schoolId) {
      setIsLoading(false);
      return;
    }

    const loadSchool = async () => {
      try {
        const data = await SchoolService.getSchoolById(user.schoolId!);
        setSchool(data);
      } catch (err: any) {
        toast.error('Failed to load teacher training data.');
      } finally {
        setIsLoading(false);
      }
    };

    loadSchool();
  }, [user]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-40 gap-3">
        <Loader2 className="animate-spin text-primary" size={32} />
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading Teacher Roster...</p>
      </div>
    );
  }

  if (!school) return null;

  const totalTeachers = school.teachers?.length || 0;
  const fullyTrainedCount = school.teachers?.filter(t => t.completedModules.length >= 6).length || 0;
  const fullyTrainedPercentage = totalTeachers > 0 ? Math.round((fullyTrainedCount / totalTeachers) * 100) : 0;

  const modulesList = [
    'Puberty Literacy',
    'Mental Health',
    'POCSO',
    'LGBTQ+',
    'Self-Harm',
    'Digital Safety',
  ];

  return (
    <div className="space-y-10 py-4 animate-in fade-in slide-in-from-bottom-4 duration-500 font-sans">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-slate-100 pb-6">
        <div>
          <span className="text-primary font-bold text-xs uppercase tracking-widest bg-primary/10 px-3 py-1 rounded-full">Teachers</span>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight mt-3">Teacher Professional Training</h1>
          <p className="text-sm font-semibold text-slate-400 mt-1">Deploy, audit, and generate certificates for educator training programs.</p>
        </div>

        <div className="flex gap-4 text-xs font-semibold bg-slate-50 border border-slate-100 p-4 rounded-2xl">
          <div>
            Trained Progress: <span className="text-slate-800 font-black">{fullyTrainedPercentage}% Fully Trained</span>
          </div>
          <div className="w-px h-4 bg-slate-200" />
          <div>
            Roster: <span className="text-slate-800 font-black">{totalTeachers} Educators</span>
          </div>
        </div>
      </div>

      {/* Checklist Grid */}
      {!school.teachers || school.teachers.length === 0 ? (
        <div className="bg-white border border-slate-100 rounded-3xl p-16 text-center space-y-4 shadow-sm">
          <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-400">
            <Award size={22} />
          </div>
          <h3 className="text-md font-black text-slate-700">No teachers registered</h3>
          <p className="text-xs font-semibold text-slate-400 max-w-sm mx-auto">
            Your teacher roster list is empty. Contact your Infano operations lead to enroll your school's educator cohorts!
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          
          {/* Matrix view grid */}
          <div className="bg-white border border-slate-100 rounded-[2.5rem] p-6 md:p-8 shadow-sm space-y-6">
            <h3 className="text-md font-black text-slate-800 flex items-center gap-2 pb-3 border-b border-slate-50">
              <Sparkles className="text-primary" size={18} />
              Module Completion Roster Matrix
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs">
                <thead className="bg-slate-50/70 border-b border-slate-100 text-[9px] font-black text-slate-400 uppercase tracking-widest sticky top-0">
                  <tr>
                    <th className="px-6 py-4">Educator Details</th>
                    {modulesList.map(mod => (
                      <th key={mod} className="px-4 py-4 max-w-[120px] text-center">{mod}</th>
                    ))}
                    <th className="px-6 py-4 text-center">Certificate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 font-semibold text-slate-700">
                  {school.teachers.map((teacher) => {
                    const isFullyTrained = teacher.completedModules.length >= 6;
                    
                    return (
                      <tr key={teacher.id} className="hover:bg-slate-50/30 transition-colors">
                        <td className="px-6 py-4">
                          <p className="text-slate-800 font-extrabold text-sm">{teacher.name}</p>
                          <p className="text-[10px] font-bold text-slate-400 mt-0.5">{teacher.designation || 'Educator'}</p>
                        </td>

                        {modulesList.map(mod => {
                          const isDone = teacher.completedModules.includes(mod);
                          return (
                            <td key={mod} className="px-4 py-4 text-center">
                              <div className="flex items-center justify-center">
                                {isDone ? (
                                  <CheckCircle2 className="text-emerald-500 fill-emerald-50" size={18} />
                                ) : (
                                  <XCircle className="text-slate-200" size={18} />
                                )}
                              </div>
                            </td>
                          );
                        })}

                        <td className="px-6 py-4 text-center">
                          {isFullyTrained ? (
                            <button 
                              onClick={() => {
                                toast.success(`Downloading high-resolution training certificate PDF for ${teacher.name}!`);
                              }}
                              className="inline-flex items-center gap-1 text-primary hover:text-primary-dark font-black uppercase tracking-wider text-[9px] hover:underline"
                            >
                              <Download size={12} />
                              Certificate
                            </button>
                          ) : (
                            <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
                              {teacher.completedModules.length}/6 modules
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
