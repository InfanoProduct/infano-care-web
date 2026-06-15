'use client';

import { useState, useEffect } from 'react';
import { BookOpen, CheckCircle2, AlertCircle, Calendar, Users, Award, Shield, Loader2 } from 'lucide-react';
import { SchoolService, School } from '@/services/school.service';
import { useAuthStore } from '@/store/auth-store';
import { toast } from 'react-hot-toast';

export default function SchoolMOUProgrammePage() {
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
        toast.error('Failed to load MOU deliverables details.');
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
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading Programme Deliverables...</p>
      </div>
    );
  }

  if (!school) return null;

  const totalSessions = school.sessions?.length || 0;
  const completedSessions = school.sessions?.filter(s => s.status === 'COMPLETED').length || 0;

  const getModuleTitle = (grade: string) => {
    switch (grade) {
      case 'Grade 5': return 'My Body My Story';
      case 'Grade 6': return 'Emotions Are My Superpower';
      case 'Grade 7': return 'My Relationships My Rules';
      case 'Grade 8': return 'I Know Who I Am';
      case 'Grade 9': return 'Ready for the World';
      default: return 'Adolescent Wellness Modules';
    }
  };

  const getModuleDescription = (grade: string) => {
    switch (grade) {
      case 'Grade 5': return 'Body mapping, body changes growth, biologically shame-free puberty guides.';
      case 'Grade 6': return 'Emotional tides mapping, mental health destigmatizing, screen safety.';
      case 'Grade 7': return 'Setting emotional/physical zones boundary limits, healthy peer relationships.';
      case 'Grade 8': return 'Self identity building, peer pressure verbal assertion scripts.';
      case 'Grade 9': return 'CV blueprint building, rental financial basics, safe travel survival.';
      default: return '';
    }
  };

  // Compile list of committed deliverables based on MOU
  const deliverables = [
    {
      name: 'Physical Curriculum Sessions',
      desc: 'In-school wellness cohort training for enrolled grades.',
      status: completedSessions >= totalSessions && totalSessions > 0 ? 'COMPLETED' : 'IN_PROGRESS',
      value: `${completedSessions} of ${totalSessions} Completed`,
      icon: Calendar,
    },
    {
      name: 'Teacher Professional Development',
      desc: 'Publishing specialized training sessions covering POCSO and self-harm.',
      status: school.teachers && school.teachers.length > 0 ? 'COMPLETED' : 'IN_PROGRESS',
      value: `${school.teachers?.length || 0} Registered Teachers`,
      icon: Award,
    },
    {
      name: 'Parent Welcome Kits',
      desc: 'Interactive guides and toolkits delivered to parent layers.',
      status: school.programConfig?.parentWelcomeKit ? 'COMPLETED' : 'NOT_APPLICABLE',
      value: school.programConfig?.parentWelcomeKit 
        ? `${school.programConfig.parentWelcomeKitQuantity} Kits Contracted` 
        : 'Not Contracted',
      icon: Shield,
    },
    {
      name: 'Program Evaluation Reports',
      desc: 'Anonymized wellness feedback reports provided to school board.',
      status: school.reports && school.reports.length > 0 ? 'COMPLETED' : 'IN_PROGRESS',
      value: `${school.programConfig?.reportingFrequency || 'QUARTERLY'} Schedule`,
      icon: BookOpen,
    },
  ];

  return (
    <div className="space-y-10 py-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Title */}
      <div>
        <span className="text-primary font-bold text-xs uppercase tracking-widest bg-primary/10 px-3 py-1 rounded-full">Deliverables</span>
        <h1 className="text-3xl font-black text-slate-800 tracking-tight mt-3">MOU Program Commitments</h1>
        <p className="text-sm font-semibold text-slate-400 mt-1">Review the real-time fulfillment status of all committed MOU deliverables.</p>
      </div>

      {/* Deliverables Checklist Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {deliverables.map((item, index) => {
          const isComplete = item.status === 'COMPLETED';
          const isNa = item.status === 'NOT_APPLICABLE';
          
          return (
            <div 
              key={index}
              className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex items-start gap-4"
            >
              <div className={`p-3 rounded-2xl shrink-0 mt-0.5 ${
                isComplete ? 'bg-emerald-50 text-emerald-600' : isNa ? 'bg-slate-50 text-slate-400' : 'bg-primary/5 text-primary'
              }`}>
                <item.icon size={20} />
              </div>

              <div className="space-y-1 flex-1 min-w-0">
                <div className="flex justify-between items-center gap-4">
                  <h3 className="text-sm font-black text-slate-800">{item.name}</h3>
                  <span className={`px-2 py-0.5 text-[8px] font-black uppercase rounded tracking-wider border ${
                    isComplete 
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                      : isNa 
                        ? 'bg-slate-50 text-slate-400 border-slate-100'
                        : 'bg-primary/5 text-primary border-primary/10 animate-pulse'
                  }`}>
                    {item.status.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-[11px] font-bold text-slate-400 leading-normal">{item.desc}</p>
                <p className="text-xs font-extrabold text-slate-600 pt-2">{item.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Curriculum Mapping Section */}
      <div className="bg-white border border-slate-100 rounded-[2.5rem] p-6 md:p-8 shadow-sm space-y-6">
        <h3 className="text-md font-black text-slate-800 flex items-center gap-2 pb-3 border-b border-slate-50">
          <BookOpen className="text-primary" size={18} />
          Grade-wise Curriculum Map
        </h3>

        {!school.programConfig?.gradesEnrolled || school.programConfig.gradesEnrolled.length === 0 ? (
          <div className="py-8 text-center text-xs font-bold text-slate-400 uppercase tracking-widest">
            No grades mapped in B2B program config.
          </div>
        ) : (
          <div className="space-y-6">
            {school.programConfig.gradesEnrolled.map((grade) => (
              <div 
                key={grade}
                className="bg-slate-50 border border-slate-100 p-6 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-6 hover:border-primary/10 transition-colors"
              >
                <div className="space-y-2 max-w-lg">
                  <span className="text-[10px] font-black text-primary uppercase tracking-widest bg-primary/10 px-2.5 py-0.5 rounded-full">
                    {grade}
                  </span>
                  <h4 className="text-md font-extrabold text-slate-800 mt-1">{getModuleTitle(grade)}</h4>
                  <p className="text-xs font-bold text-slate-400 leading-relaxed">{getModuleDescription(grade)}</p>
                </div>

                <div className="flex items-center gap-3 shrink-0 bg-white border border-slate-200/60 p-4 rounded-2xl shadow-sm self-start sm:self-auto">
                  <div className="w-10 h-10 bg-primary/5 rounded-xl flex items-center justify-center text-primary">
                    <Calendar size={18} />
                  </div>
                  <div>
                    <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block">Deliverables</span>
                    <span className="text-xs font-extrabold text-slate-700">
                      {school.programConfig?.sessionsPerGrade ?? 3} Physical Sessions
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
