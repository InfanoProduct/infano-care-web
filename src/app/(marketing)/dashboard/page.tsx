'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  BookOpen, Calendar, ShieldCheck, Heart, Star, Sparkles, 
  ChevronRight, Play, Lock, CheckCircle2, Loader2, MessageCircle, 
  HelpCircle, User, Award, Layers, Zap, Info, ShieldAlert, Compass
} from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';
import { ProgramsService, Program, ProgramEnrollment, ProgramSession } from '@/services/programs.service';
import { toast } from 'react-hot-toast';
import { ParentService } from '@/services/parent.service';
import { DashboardSummary } from "@/features/parent/components/DashboardSummary";
import Link from 'next/link';

export default function CustomerDashboardOverview() {
  const { user } = useAuthStore();
  const [enrollments, setEnrollments] = useState<ProgramEnrollment[]>([]);
  const [allPrograms, setAllPrograms] = useState<Program[]>([]);
  const [parentBookmarks, setParentBookmarks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrollingId, setEnrollingId] = useState<string | null>(null);
  const [enrollType, setEnrollType] = useState<'PRIVATE' | 'GROUP'>('GROUP');
  const [activeEnrollmentTab, setActiveEnrollmentTab] = useState<string | null>(null);

  const isTeen = user?.role === 'TEEN';

  // Load dashboard data
  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const [enrollRes, programsRes, bookmarksRes] = await Promise.all([
        ProgramsService.getUserEnrollments().catch(() => ({ success: true, data: [] })),
        ProgramsService.getPrograms().catch(() => []),
        isTeen ? ParentService.getTeenParentBookmarks().catch(() => []) : Promise.resolve([])
      ]);

      const activeEnrollments = enrollRes.data || [];
      setEnrollments(activeEnrollments);
      setAllPrograms(programsRes);
      setParentBookmarks(bookmarksRes);

      if (activeEnrollments.length > 0) {
        setActiveEnrollmentTab(activeEnrollments[0].id);
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      toast.error('Failed to update workspace data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const selectedEnrollment = enrollments.find(e => e.id === activeEnrollmentTab);

  // Handle program enrollment trigger
  const handleEnroll = async (programId: string) => {
    setEnrollingId(programId);
    try {
      const response = await ProgramsService.enrollInProgram(programId, enrollType);
      if (response.success) {
        toast.success(`Successfully enrolled in program!`);
        await loadDashboardData();
      }
    } catch (err: any) {
      toast.error(err.message || 'Enrollment failed. Please try again.');
    } finally {
      setEnrollingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4 text-primary">
        <Loader2 className="animate-spin text-primary" size={44} />
        <span className="font-extrabold text-lg text-slate-600 tracking-wide">Assembling Workspace...</span>
      </div>
    );
  }

  // Filter out programs user is already enrolled in
  const enrolledProgramIds = enrollments.map(e => e.programId);
  const availablePrograms = allPrograms.filter(p => !enrolledProgramIds.includes(p.id));

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Dynamic Welcomer Banner */}
      <div className="bg-gradient-to-r from-primary/10 via-accent/5 to-white p-8 rounded-2xl border border-primary/10 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden shadow-sm">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-3xl rounded-full translate-x-1/3 -translate-y-1/3 pointer-events-none" />
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-primary/20 rounded-full text-[10px] font-black tracking-widest text-primary uppercase shadow-sm">
            <Sparkles size={11} /> Welcome to Gigi's Circle
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-800 tracking-tight leading-none">
            {isTeen ? 'Hey there, Champion! 🌟' : 'Empowering Her Journey 🤍'}
          </h1>
          <p className="text-sm font-semibold text-slate-500 max-w-lg leading-relaxed">
            {isTeen 
              ? "Complete your daily quests, track your cycles, and join your active cohort class to stay on top of your learning." 
              : "Review your daughter's developmental achievements, booked mock session slot statuses, and view helpful conversation starters below."}
          </p>
        </div>

        {isTeen && enrollments.length > 0 && (
          <button 
            onClick={() => {
              const activeUpcoming = document.getElementById('upcoming-session');
              if (activeUpcoming) {
                activeUpcoming.scrollIntoView({ behavior: 'smooth' });
              } else {
                toast.success('Your live sessions are currently scheduled!');
              }
            }}
            className="bg-primary hover:bg-primary-dark text-white font-extrabold py-3.5 px-7 rounded-2xl flex items-center gap-2 shadow-lg shadow-primary/20 hover:shadow-primary/35 transition-all duration-200 active:scale-95 text-sm shrink-0"
          >
            <Play size={16} className="fill-white" /> Join Active Cohort
          </button>
        )}
      </div>

      {!isTeen && (
        <DashboardSummary />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT TWO-THIRDS PANEL (lg:col-span-8) */}
        <div className="lg:col-span-8 space-y-8">

          {/* ACTIVE ENROLLMENTS & COHORT SESSIONS SECTION */}
          <div className="bg-white border border-slate-100 rounded-2xl p-8 shadow-xl shadow-slate-200/40">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-slate-100 pb-5">
              <div>
                <h3 className="text-xl font-extrabold text-slate-800 flex items-center gap-2">
                  <Award className="text-primary" size={22} /> Enrolled Live Programs
                </h3>
                <p className="text-xs font-semibold text-slate-400 mt-1">
                  Track dynamic interactive sessions led by real expert guides
                </p>
              </div>

              {/* Enrollment Tab Switcher */}
              {enrollments.length > 1 && (
                <div className="flex gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold uppercase tracking-wider select-none">
                  {enrollments.map((enr) => (
                    <button
                      key={enr.id}
                      onClick={() => setActiveEnrollmentTab(enr.id)}
                      className={`px-3 py-1.5 rounded-lg transition-all ${
                        activeEnrollmentTab === enr.id
                          ? 'bg-white text-primary shadow-sm font-semibold'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      {enr.program.title}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {enrollments.length === 0 ? (
              <div className="text-center py-12 space-y-4">
                <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center mx-auto text-slate-300">
                  <Layers size={28} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800">No active program enrollments</h4>
                  <p className="text-xs text-slate-400 font-semibold mt-1">
                    Select a curated developmental curriculum below to start her active live program
                  </p>
                </div>
              </div>
            ) : selectedEnrollment ? (() => {
              const sessions: ProgramSession[] = (selectedEnrollment.program.sessionsList as ProgramSession[]) || Array.from({ length: selectedEnrollment.program.sessions || 8 }, (_, i: number): ProgramSession => ({
                title: `Session ${i + 1}: Live Interaction`,
                description: `Dynamic developmental topic course lesson ${i + 1} led by verified guides.`
              }));
              const totalSessions = sessions.length;
              
              const dbSessions = selectedEnrollment.user?.scheduledSessions || [];
              const sessionsWithStatus = sessions.map((session: ProgramSession, index: number) => {
                const sessionNum = index + 1;
                const dbSession = dbSessions.find((s: any) => s.sessionNumber === sessionNum && s.programId === selectedEnrollment.programId);

                let status: 'completed' | 'scheduled' | 'not-scheduled' = 'not-scheduled';
                let sessionTime = 0;
                let formattedDate = 'TBD';
                let formattedTime = 'TBD';
                let meetLink = '';

                if (dbSession) {
                  status = dbSession.status.toLowerCase() as 'completed' | 'scheduled';
                  sessionTime = new Date(dbSession.scheduledAt).getTime();
                  formattedDate = new Date(sessionTime).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  });
                  formattedTime = new Date(sessionTime).toLocaleTimeString('en-IN', {
                    hour: 'numeric',
                    minute: '2-digit'
                  });
                  meetLink = dbSession.meetLink || '';
                }

                return {
                  ...session,
                  status,
                  sessionTime,
                  formattedDate,
                  formattedTime,
                  meetLink
                };
              });

              const completedCount = sessionsWithStatus.filter((s: any) => s.status === 'completed').length;
              const progressPercent = totalSessions > 0 ? Math.round((completedCount / totalSessions) * 100) : 0;

              return (
                <div className="space-y-8 animate-in fade-in duration-300">
                  
                  {/* Enrollment Card Stats Header */}
                  <div className="bg-slate-50/50 p-6 border border-slate-100 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <span className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/10 px-2.5 py-0.5 rounded-full">
                        Live Program Active
                      </span>
                      <h4 className="text-lg font-extrabold text-slate-800">
                        {selectedEnrollment.program.title} • {selectedEnrollment.program.classRange} Curriculum
                      </h4>
                      <p className="text-xs text-slate-400 font-semibold">
                        Enrolled: {new Date(selectedEnrollment.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} • Format: {selectedEnrollment.type === 'PRIVATE' ? '1:1 Private' : 'Group Cohort'}
                      </p>
                    </div>
                    
                    {/* Visual Progress percentage */}
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right leading-none">
                        <span className="text-2xl font-black text-slate-800">{progressPercent}%</span>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Completed</p>
                      </div>
                      <div className="w-12 h-12 bg-white rounded-xl border border-slate-100 flex items-center justify-center text-primary font-black text-sm shadow-sm">
                        {completedCount}/{totalSessions}
                      </div>
                    </div>
                  </div>

                  {/* DYNAMIC SESSIONS GRID LIST */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h5 className="text-xs font-black uppercase tracking-widest text-slate-400">Live Cohort Course Timeline</h5>
                      <span className="text-[10px] font-bold text-slate-400 italic">Determined by Mentor</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      
                      {sessionsWithStatus.map((session: any, index: number) => {
                        const status = session.status;

                        if (status === 'completed') {
                          return (
                            <div key={index} className="p-5 bg-white border border-slate-100 rounded-2xl shadow-sm flex items-start gap-4 hover:shadow-md transition-shadow relative overflow-hidden group">
                              <div className="absolute top-0 left-0 h-full w-1.5 bg-green-500" />
                              <div className="w-10 h-10 bg-green-50 text-green-600 border border-green-100 rounded-xl flex items-center justify-center shrink-0 shadow-sm">
                                <CheckCircle2 size={20} className="fill-green-100" />
                              </div>
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-[9px] font-black text-green-600 bg-green-50 px-2 py-0.5 rounded-full uppercase tracking-wider">Completed</span>
                                  <span className="text-[10px] text-slate-400 font-semibold">Attended on {session.formattedDate}</span>
                                </div>
                                <h6 className="font-extrabold text-sm text-slate-700 leading-tight">{session.title}</h6>
                                <p className="text-[11px] text-slate-400 leading-normal font-semibold">
                                  {session.description}
                                </p>
                              </div>
                            </div>
                          );
                        }

                        if (status === 'scheduled') {
                          return (
                            <div 
                              key={index}
                              id="upcoming-session"
                              className="p-5 bg-gradient-to-br from-purple-50/90 to-indigo-50/30 border-2 border-purple-200 rounded-2xl shadow-md shadow-purple-50/20 flex flex-col gap-3.5 relative overflow-hidden sm:col-span-2 group"
                            >
                              <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 blur-2xl rounded-full" />
                              
                              <div className="flex items-start gap-4">
                                <div className="w-10 h-10 bg-purple-600 text-white rounded-xl flex items-center justify-center shrink-0 shadow-md shadow-purple-200 animate-bounce">
                                  <Play size={18} className="fill-white translate-x-0.5" />
                                </div>
                                <div className="space-y-1">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <span className="text-[9px] font-black text-purple-700 bg-purple-100 px-2.5 py-0.5 rounded-full uppercase tracking-widest animate-pulse">
                                      UPCOMING LIVE CLASS
                                    </span>
                                    <span className="text-[10px] font-bold text-indigo-500 flex items-center gap-1">
                                      <Calendar size={11} /> {session.formattedDate} at {session.formattedTime}
                                    </span>
                                  </div>
                                  <h6 className="font-extrabold text-base text-slate-800 leading-tight">
                                    {session.title}
                                  </h6>
                                  <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                                    {session.description}
                                  </p>
                                </div>
                              </div>

                              <div className="border-t border-purple-100 pt-3 flex flex-col sm:flex-row items-center justify-between gap-3">
                                <div className="flex items-center gap-2 text-xs font-bold text-purple-700">
                                  <Info size={14} />
                                  <span>Required: Interactive Journal (Workbook p.12-16)</span>
                                </div>
                                
                                <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 z-10">
                                  {session.meetLink ? (
                                    <a 
                                      href={session.meetLink} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-white font-extrabold py-2.5 px-6 rounded-xl flex items-center justify-center gap-2 shadow-md shadow-purple-100 hover:shadow-purple-300 transition-all text-xs active:scale-95 text-center"
                                    >
                                      Join Virtual Class <ChevronRight size={14} />
                                    </a>
                                  ) : (
                                    <span className="text-xs text-purple-700 font-bold bg-purple-100 px-3 py-1.5 rounded-lg">Link will be updated soon</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        }

                        // not-scheduled status
                        return (
                          <div key={index} className="p-5 bg-slate-50/50 border border-slate-100 rounded-2xl flex items-start gap-4 relative overflow-hidden group select-none">
                            <div className="w-10 h-10 bg-slate-100 text-slate-400 border border-slate-200/60 rounded-xl flex items-center justify-center shrink-0">
                              <Lock size={18} />
                            </div>
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="text-[9px] font-black text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full uppercase tracking-wider">Not Scheduled</span>
                                <span className="text-[9px] font-bold text-slate-400 italic">Pending expert setup</span>
                              </div>
                              <h6 className="font-extrabold text-sm text-slate-500 leading-tight">{session.title}</h6>
                              <p className="text-[11px] text-slate-400 leading-normal font-semibold">
                                {session.description}
                              </p>
                            </div>
                          </div>
                        );
                      })}

                    </div>
                  </div>

                </div>
              );
            })()
            : null}
          </div>

          {/* ACTIVE PROGRAMS ENROLLMENT CATALOG */}
          {availablePrograms.length > 0 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-extrabold text-slate-800 flex items-center gap-2">
                  <Compass className="text-primary" size={22} /> Curated Learning Programs
                </h3>
                <p className="text-xs font-semibold text-slate-400 mt-1">
                  Enrol in specialized expert cohorts designed to empower her growth
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {availablePrograms.map((prog) => (
                  <div 
                    key={prog.id} 
                    className="bg-white border border-slate-100 p-6 rounded-2xl shadow-xl shadow-slate-200/30 flex flex-col justify-between gap-6 relative overflow-hidden group border-t-4 border-t-primary"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-primary bg-primary/10 px-2.5 py-0.5 rounded-full uppercase tracking-widest">
                          Class {prog.minClass + 5}-{prog.maxClass + 5}
                        </span>
                        <span className="text-xs font-bold text-slate-400">
                          {prog.duration} • {prog.sessions} Sessions
                        </span>
                      </div>
                      <h4 className="text-lg font-black text-slate-800">{prog.title} Program</h4>
                      <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                        {prog.description || prog.tagline}
                      </p>

                      <div className="pt-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">Topics Cover:</span>
                        <div className="flex flex-wrap gap-1">
                          {prog.topics.slice(0, 4).map((topic, i) => (
                            <span key={i} className="text-[10px] font-bold bg-slate-50 text-slate-600 border border-slate-100 px-2 py-0.5 rounded-md">
                              {topic}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-4">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 block uppercase">Group Price</span>
                        <span className="text-sm font-black text-slate-700">₹{prog.priceGroup.toLocaleString()}<span className="text-[10px] text-slate-400 font-normal">/mo</span></span>
                      </div>
                      <button
                        onClick={() => handleEnroll(prog.id)}
                        disabled={enrollingId === prog.id}
                        className="bg-primary hover:bg-primary-dark disabled:bg-slate-300 text-white font-extrabold text-xs py-3 px-5 rounded-xl shadow-md shadow-primary/10 hover:shadow-primary/20 transition-all duration-200 active:scale-95 flex items-center gap-1.5 group"
                      >
                        {enrollingId === prog.id ? (
                          <Loader2 className="animate-spin" size={14} />
                        ) : (
                          <>
                            Enroll Now <ChevronRight className="group-hover:translate-x-0.5 transition-transform" size={14} />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* RIGHT ONE-THIRD SIDE PANEL (lg:col-span-4) */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* TEEN WORKSPACE: Cycle Tracker or Quests Summary */}
          {isTeen ? (
            <>
            <div className="bg-gradient-to-br from-purple-600 to-indigo-700 text-white p-8 rounded-2xl shadow-xl shadow-purple-900/10 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-2xl rounded-full translate-x-1/2 -translate-y-1/2" />
              <div className="space-y-6 relative z-10">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-white backdrop-blur-sm">
                    <Layers size={20} />
                  </div>
                  <span className="text-[10px] font-black tracking-widest px-3 py-1 bg-white text-purple-700 rounded-full">ACTIVE TRACKER</span>
                </div>
                
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-purple-200 tracking-wider uppercase">Cycle Status</span>
                  <h4 className="text-3xl font-black">Day 14 • Luteal Phase</h4>
                  <p className="text-xs text-purple-100 font-medium">Your next cycle starts in approximately <span className="font-bold text-white">12 days</span>.</p>
                </div>

                <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
                  <div className="h-full bg-white transition-all duration-500" style={{ width: '55%' }} />
                </div>

                <div className="pt-2 flex items-center justify-between text-[11px] text-purple-100 font-bold">
                  <span>Day 1: Menstruation</span>
                  <span>Day 28: Cycle End</span>
                </div>
              </div>
            </div>
            
            {/* NEW: Parent Recommended Reads (Bookmarks) */}
            {parentBookmarks.length > 0 && (
              <div className="bg-white border border-slate-100 p-8 rounded-2xl shadow-xl shadow-slate-200/40 space-y-6">
                <div>
                  <h4 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
                    <BookOpen className="text-indigo-500" size={18} /> Recommended Reads
                  </h4>
                  <p className="text-xs font-semibold text-slate-400 mt-1">Articles bookmarked by your parent</p>
                </div>

                <div className="space-y-4">
                  {parentBookmarks.slice(0, 3).map((bookmark, idx) => (
                    <Link key={idx} href={`/blog/${bookmark.slug || bookmark.id}`} className="flex gap-4 items-start p-4 bg-indigo-50/50 border border-indigo-50 rounded-xl hover:shadow-sm hover:bg-indigo-50 transition-all group">
                      <div className="w-12 h-12 bg-white rounded-lg overflow-hidden shrink-0 border border-slate-100">
                        {bookmark.thumbnailUrl ? (
                          <img src={bookmark.thumbnailUrl} alt={bookmark.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        ) : (
                          <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-300">
                            <BookOpen size={16} />
                          </div>
                        )}
                      </div>
                      <div>
                        <h5 className="text-sm font-extrabold text-slate-800 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                          {bookmark.title}
                        </h5>
                        <p className="text-[10px] text-slate-500 font-semibold mt-1">
                          {bookmark.readTime || 5} min read • By {bookmark.author?.name || 'Infano'}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
            </>
          ) : (
            /* PARENT WORKSPACE: Booked Demo Session Status & Progress Overview */
            <div className="bg-white border border-slate-100 p-8 rounded-2xl shadow-xl shadow-slate-200/40 space-y-6">
              <div>
                <h4 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
                  <Calendar className="text-primary" size={18} /> Booked Demo Sessions
                </h4>
                <p className="text-xs font-semibold text-slate-400 mt-1">Review live complimentary session details</p>
              </div>

              {/* Mock Demo Booking Detail (since booking is done by parents) */}
              <div className="bg-slate-50 border border-slate-100 p-5 rounded-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-black text-primary bg-primary/10 px-2 py-0.5 rounded-full uppercase tracking-wider">
                    Scheduled
                  </span>
                  <span className="text-[10px] font-bold text-slate-400">Class 5 Demo</span>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-extrabold text-slate-800">Complimentary 15m live demo</p>
                  <div className="text-xs font-semibold text-slate-500 space-y-1">
                    <p className="flex items-center gap-1.5"><Star size={12} className="text-slate-400 shrink-0" /> Target Program: SPARK</p>
                    <p className="flex items-center gap-1.5"><Calendar size={12} className="text-slate-400 shrink-0" /> Date: May 30, 2026</p>
                    <p className="flex items-center gap-1.5"><Play size={12} className="text-slate-400 shrink-0" /> Time slot: 10:30 AM</p>
                  </div>
                </div>

                <div className="bg-white p-3 rounded-xl border border-slate-100 text-[10px] text-slate-400 font-semibold leading-relaxed">
                  Our coordinator will reach out via mobile to verify connectivity details.
                </div>
              </div>
            </div>
          )}

          {/* DYNAMIC PARENT EMPATHY STARTERS: Table Conversation Starters */}
          {!isTeen && (
            <div className="bg-gradient-to-br from-rose-50 to-orange-50/40 p-8 rounded-2xl border border-rose-100/50 space-y-6 shadow-sm">
              <div className="space-y-1">
                <span className="inline-flex items-center gap-1 bg-rose-100 text-rose-700 px-2.5 py-0.5 rounded-full text-[9px] font-black tracking-widest uppercase">
                  <MessageCircle size={10} /> Empathetic Parenting
                </span>
                <h4 className="text-lg font-black text-slate-800">Dinner Table Starter 🍽️</h4>
                <p className="text-xs font-semibold text-slate-400 leading-normal">
                  Customized prompts to build strong communication bridges with your daughter.
                </p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-rose-100 shadow-sm space-y-3 relative">
                <span className="absolute top-4 right-4 text-3xl font-serif text-rose-200 select-none">"</span>
                <p className="text-xs font-semibold text-rose-600 uppercase tracking-widest">Active Focus: SPARK (Puberty Transitions)</p>
                <p className="text-sm font-extrabold text-slate-700 italic leading-relaxed">
                  "If you had to describe your body's shifts this month like a seasons transition (spring blooming, summer heat, fall winds), which one feels closest and why?"
                </p>
              </div>

              <div className="text-[10px] text-slate-400 leading-relaxed font-semibold">
                Tips: Keep it supportive, listen deeply without instantly offering advice, and acknowledge her feelings with empathy.
              </div>
            </div>
          )}

          {/* CO-CURRICULAR LOGICAL CARD: System Health or Support Circles */}
          <div className="bg-white border border-slate-100 p-8 rounded-2xl shadow-xl shadow-slate-200/40 space-y-6">
            <div>
              <h4 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
                <ShieldCheck className="text-green-500" size={18} /> Safety & Support Circle
              </h4>
              <p className="text-xs font-semibold text-slate-400 mt-1">Non-intrusive safety layers</p>
            </div>

            <div className="space-y-3.5">
              <div className="flex gap-3 items-start">
                <div className="w-8 h-8 rounded-lg bg-green-50 text-green-500 flex items-center justify-center shrink-0 border border-green-100">
                  <ShieldCheck size={16} />
                </div>
                <div>
                  <h5 className="text-xs font-extrabold text-slate-800">Verified Guides Only</h5>
                  <p className="text-[10px] text-slate-400 font-semibold leading-relaxed mt-0.5">
                    Every live program session is hosted strictly by background-verified female experts.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 items-start">
                <div className="w-8 h-8 rounded-lg bg-green-50 text-green-500 flex items-center justify-center shrink-0 border border-green-100">
                  <ShieldAlert size={16} className="text-emerald-600" />
                </div>
                <div>
                  <h5 className="text-xs font-extrabold text-slate-800">Wellness Safeguards</h5>
                  <p className="text-[10px] text-slate-400 font-semibold leading-relaxed mt-0.5">
                    Our AI models and experts monitor distress in self-learning quests, notifying parents immediately under urgent flags.
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
