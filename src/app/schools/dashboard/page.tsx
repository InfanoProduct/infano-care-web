'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Award, Calendar, Users, AlertCircle, ArrowRight, 
  Sparkles, CheckCircle2, Shield, CalendarDays, Loader2 
} from 'lucide-react';
import { SchoolService, School } from '@/services/school.service';
import { useAuthStore } from '@/store/auth-store';
import { toast } from 'react-hot-toast';

export default function SchoolCoordinatorDashboardPage() {
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
        toast.error('Failed to load dashboard workspace metrics.');
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
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading Overview Metrics...</p>
      </div>
    );
  }

  if (!school) {
    return (
      <div className="bg-white border border-slate-100 p-16 text-center space-y-4 rounded-3xl">
        <AlertCircle className="text-rose-500 mx-auto" size={32} />
        <h3 className="text-lg font-black text-slate-700">No school metadata found</h3>
        <p className="text-xs font-semibold text-slate-400 max-w-sm mx-auto">
          Please check with your Infano operations lead to ensure your account profile mapping is active.
        </p>
      </div>
    );
  }

  // Calculate dynamic stats
  const totalSessions = school.sessions?.length || 0;
  const completedSessions = school.sessions?.filter(s => s.status === 'COMPLETED').length || 0;
  
  const enrolledStudents = school._count?.students || 0;
  const contractedStudents = school.programConfig?.totalStudentsContracted || 0;
  
  const totalTeachers = school.teachers?.length || 0;
  const fullyTrainedTeachers = school.teachers?.filter(t => t.completedModules.length >= 6).length || 0;

  const kitCount = school.kitDispatches?.reduce((sum, kit) => sum + kit.quantity, 0) || 0;

  // Calculate total programme completion %
  const sessionProgress = totalSessions > 0 ? (completedSessions / totalSessions) * 50 : 0;
  const teacherProgress = totalTeachers > 0 ? (fullyTrainedTeachers / totalTeachers) * 30 : 0;
  const studentActivationProgress = contractedStudents > 0 ? (enrolledStudents / contractedStudents) * 20 : 0;
  const totalProgress = Math.round(sessionProgress + teacherProgress + studentActivationProgress);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Executive Header Band */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-[2.5rem] p-8 md:p-12 text-white relative overflow-hidden shadow-xl shadow-slate-900/10">
        <div className="absolute right-0 bottom-0 top-0 w-1/3 bg-radial-gradient from-primary/10 to-transparent pointer-events-none" />
        
        <div className="space-y-6 relative z-10">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-[10px] font-black uppercase tracking-widest bg-primary px-3 py-1 rounded-full text-white">
              Infano Certified School
            </span>
            <span className="text-[10px] font-black uppercase tracking-widest bg-white/10 px-3 py-1 rounded-full text-white/90">
              MOU Year: {new Date(school.mouValidityStart).getFullYear()}
            </span>
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-black tracking-tight">{school.name}</h1>
            <p className="text-sm font-semibold text-slate-300">Welcome to your operational partnership dashboard portal.</p>
          </div>

          <div className="flex flex-wrap items-center gap-x-8 gap-y-4 pt-4 border-t border-white/10 text-xs font-semibold text-slate-300">
            <div>
              City: <span className="text-white font-black">{school.city}</span>
            </div>
            <div>
              Board: <span className="text-white font-black">{school.board}</span>
            </div>
            <div>
              Validity: <span className="text-white font-black">
                {new Date(school.mouValidityStart).toLocaleDateString()} - {new Date(school.mouValidityEnd).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Prompts Banner */}
      <div className="bg-primary/5 border border-primary/10 rounded-3xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-primary/10 text-primary rounded-2xl shrink-0 mt-0.5">
            <Sparkles size={20} className="animate-spin animate-duration-3000" />
          </div>
          <div>
            <h4 className="text-sm font-black text-slate-800">Dynamic Action Prompt</h4>
            <p className="text-xs font-semibold text-slate-500 mt-1 leading-relaxed">
              {enrolledStudents === 0 ? (
                "Your student roster is empty! Upload your class CSV roll in the Student Funnel tab to begin student app activations."
              ) : totalSessions === 0 ? (
                "Let's schedule your first physical physical curriculum session in the Sessions Schedule tab!"
              ) : (
                `Roster uploaded! We have scheduled ${totalSessions} sessions so far, with ${completedSessions} completed. Explore details in your dashboard.`
              )}
            </p>
          </div>
        </div>

        <Link
          href={enrolledStudents === 0 ? "/schools/dashboard/students" : "/schools/dashboard/programme"}
          className="inline-flex items-center gap-1 bg-white hover:bg-slate-50 border border-slate-200 text-xs font-black text-slate-700 px-5 py-3 rounded-2xl shadow-sm transition-all active:scale-95 uppercase tracking-wider whitespace-nowrap"
        >
          Resolve Now
          <ArrowRight size={14} />
        </Link>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        
        {/* Progress Ring Card */}
        <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-xl shadow-slate-200/30 flex flex-col items-center justify-center text-center space-y-4">
          <div className="relative w-20 h-20 flex items-center justify-center">
            {/* SVG circle progress */}
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="40" cy="40" r="34" className="stroke-slate-100" strokeWidth="6" fill="transparent" />
              <circle cx="40" cy="40" r="34" className="stroke-primary transition-all duration-1000" strokeWidth="6" fill="transparent"
                strokeDasharray="213.6"
                strokeDashoffset={213.6 - (213.6 * totalProgress) / 100}
              />
            </svg>
            <span className="absolute text-md font-black text-slate-800">{totalProgress}%</span>
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Total Progress</p>
            <p className="text-xs font-bold text-slate-500 mt-1">Programme complete</p>
          </div>
        </div>

        {/* Sessions Card */}
        <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-xl shadow-slate-200/30 space-y-4">
          <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
            <Calendar size={20} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Sessions</p>
            <p className="text-2xl font-black text-slate-800 mt-1">{completedSessions} / {totalSessions}</p>
            <p className="text-xs font-bold text-slate-400 mt-0.5">Physical Sessions</p>
          </div>
        </div>

        {/* Students Card */}
        <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-xl shadow-slate-200/30 space-y-4">
          <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center">
            <Users size={20} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Enrolled Girls</p>
            <p className="text-2xl font-black text-slate-800 mt-1">{enrolledStudents} / {contractedStudents}</p>
            <p className="text-xs font-bold text-slate-400 mt-0.5">Active activations</p>
          </div>
        </div>

        {/* Teachers Card */}
        <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-xl shadow-slate-200/30 space-y-4">
          <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center">
            <Award size={20} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Teachers Trained</p>
            <p className="text-2xl font-black text-slate-800 mt-1">{fullyTrainedTeachers} / {totalTeachers}</p>
            <p className="text-xs font-bold text-slate-400 mt-0.5">Trained / Total</p>
          </div>
        </div>

        {/* Kits Card */}
        <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-xl shadow-slate-200/30 space-y-4">
          <div className="w-10 h-10 bg-teal-50 text-teal-600 rounded-2xl flex items-center justify-center">
            <Shield size={20} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Parent Welcome Kits</p>
            <p className="text-2xl font-black text-slate-800 mt-1">{kitCount}</p>
            <p className="text-xs font-bold text-slate-400 mt-0.5">Kits dispatched</p>
          </div>
        </div>

      </div>

      {/* Upcoming Session Roster Summary */}
      <div className="bg-white border border-slate-100 rounded-[2rem] p-6 md:p-8 shadow-sm space-y-6">
        <h3 className="text-md font-black text-slate-800 flex items-center gap-2 pb-3 border-b border-slate-50">
          <CalendarDays className="text-primary" size={18} />
          Upcoming Physical Session slots
        </h3>

        {!school.sessions || school.sessions.filter(s => s.status !== 'COMPLETED').length === 0 ? (
          <div className="py-8 text-center text-xs font-bold text-slate-400 uppercase tracking-widest">
            🎉 All scheduled sessions completed! Great job.
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {school.sessions
              .filter(s => s.status !== 'COMPLETED')
              .slice(0, 3)
              .map((session) => (
                <div key={session.id} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-6 text-sm font-semibold text-slate-700">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{session.grade}</span>
                    <p className="text-slate-800 font-extrabold">{session.curriculumModule}</p>
                  </div>

                  <div className="text-right space-y-1">
                    <p className="text-slate-800 font-bold">{new Date(session.proposedDate).toLocaleDateString()}</p>
                    <p className="text-[10px] font-bold text-slate-400">{session.proposedTime || 'Time TBD'}</p>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

    </div>
  );
}
