'use client';

import { useState, useEffect } from 'react';
import { Calendar, CheckCircle2, CalendarDays, Loader2, ArrowUpRight, MapPin, Eye } from 'lucide-react';
import { SchoolService, School, SchoolSession } from '@/services/school.service';
import { useAuthStore } from '@/store/auth-store';
import { toast } from 'react-hot-toast';

export default function SchoolCoordinatorSessionsPage() {
  const { user } = useAuthStore();
  const [school, setSchool] = useState<School | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState<SchoolSession | null>(null);

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
        toast.error('Failed to load sessions schedule.');
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
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading Session Schedules...</p>
      </div>
    );
  }

  if (!school) return null;

  const totalSessions = school.sessions?.length || 0;
  const completedSessions = school.sessions?.filter(s => s.status === 'COMPLETED').length || 0;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'bg-teal-50 text-teal-700 border-teal-100';
      case 'CONFIRMED': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'SCHEDULED': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'RESCHEDULED': return 'bg-amber-50 text-amber-600 border-amber-100';
      default: return 'bg-rose-50 text-rose-600 border-rose-100';
    }
  };

  return (
    <div className="space-y-10 py-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-slate-100 pb-6">
        <div>
          <span className="text-primary font-bold text-xs uppercase tracking-widest bg-primary/10 px-3 py-1 rounded-full">Schedule</span>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight mt-3">Sessions & Attendance</h1>
          <p className="text-sm font-semibold text-slate-400 mt-1">Deploy, track, and verify physical in-school curriculum slots.</p>
        </div>

        <div className="flex gap-4 text-xs font-semibold bg-slate-50 border border-slate-100 p-4 rounded-2xl">
          <div>
            Scheduled: <span className="text-slate-800 font-black">{totalSessions} Slots</span>
          </div>
          <div className="w-px h-4 bg-slate-200" />
          <div>
            Completed: <span className="text-slate-800 font-black">{completedSessions} Sessions</span>
          </div>
        </div>
      </div>

      {/* Sessions Grid */}
      {!school.sessions || school.sessions.length === 0 ? (
        <div className="bg-white border border-slate-100 rounded-3xl p-16 text-center space-y-4 shadow-sm">
          <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-400">
            <CalendarDays size={22} />
          </div>
          <h3 className="text-md font-black text-slate-700">No scheduled sessions</h3>
          <p className="text-xs font-semibold text-slate-400 max-w-sm mx-auto">
            Contact your Infano Program Lead to schedule your first physical physical curriculum session slot!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Sessions List */}
          <div className="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm lg:col-span-2 space-y-6">
            <h3 className="text-md font-black text-slate-800 flex items-center gap-2 pb-3 border-b border-slate-50">
              <Calendar className="text-primary" size={18} />
              Chronological Session Calendar List
            </h3>

            <div className="divide-y divide-slate-100">
              {school.sessions.map((session) => (
                <div 
                  key={session.id}
                  onClick={() => setSelectedSession(session)}
                  className={`py-5 first:pt-0 last:pb-0 flex items-center justify-between gap-6 cursor-pointer group hover:bg-slate-50/50 px-3 rounded-2xl transition-colors ${
                    selectedSession?.id === session.id ? 'bg-primary/5 hover:bg-primary/5' : ''
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2.5">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">{session.grade}</span>
                      <span className={`px-2 py-0.2 border text-[8px] font-black rounded uppercase tracking-wider ${getStatusColor(session.status)}`}>
                        {session.status}
                      </span>
                    </div>
                    <h4 className="text-sm font-extrabold text-slate-800 group-hover:text-primary transition-colors">{session.curriculumModule}</h4>
                    <p className="text-[11px] font-bold text-slate-400">
                      Date: {new Date(session.proposedDate).toLocaleDateString()} at {session.proposedTime || 'TBD'}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 text-slate-400 group-hover:text-primary transition-colors shrink-0">
                    {session.status === 'COMPLETED' ? (
                      <span className="text-xs font-black text-teal-700 bg-teal-50 px-2.5 py-1 rounded-xl border border-teal-100">
                        {session.attendanceRate}% Attendance
                      </span>
                    ) : (
                      <Eye size={16} />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Dynamic Selection Details Card */}
          <div className="space-y-6">
            <div className="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm sticky top-24 min-h-[300px]">
              {selectedSession ? (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <div className="border-b border-slate-50 pb-4">
                    <span className="text-[10px] font-black text-primary uppercase tracking-widest bg-primary/10 px-2.5 py-0.5 rounded-full">
                      {selectedSession.grade}
                    </span>
                    <h3 className="text-lg font-black text-slate-800 tracking-tight mt-2.5">{selectedSession.curriculumModule}</h3>
                  </div>

                  <div className="space-y-4 text-xs font-semibold text-slate-500">
                    <div className="flex items-center gap-2.5">
                      <CalendarDays size={16} className="text-slate-400 shrink-0" />
                      <div>
                        <span className="text-[9px] font-black uppercase text-slate-400 block tracking-wider">Scheduled Date</span>
                        <span className="text-slate-800 font-extrabold">{new Date(selectedSession.proposedDate).toLocaleDateString()} ({selectedSession.proposedTime || 'TBD'})</span>
                      </div>
                    </div>

                    {selectedSession.venue && (
                      <div className="flex items-center gap-2.5">
                        <MapPin size={16} className="text-slate-400 shrink-0" />
                        <div>
                          <span className="text-[9px] font-black uppercase text-slate-400 block tracking-wider">Session Venue</span>
                          <span className="text-slate-800 font-extrabold">{selectedSession.venue}</span>
                        </div>
                      </div>
                    )}

                    {selectedSession.status === 'COMPLETED' && (
                      <div className="bg-teal-50/50 border border-teal-100 rounded-2xl p-4 space-y-3">
                        <h4 className="text-[10px] font-black uppercase tracking-wider text-teal-800 flex items-center gap-1.5">
                          <CheckCircle2 size={12} />
                          Execution Summary Report
                        </h4>
                        
                        <div className="grid grid-cols-2 gap-4 text-slate-600">
                          <div>
                            <span className="text-[9px] font-bold uppercase text-slate-400 block">Attendance Rate</span>
                            <span className="text-teal-800 font-black text-sm">{selectedSession.attendanceRate}%</span>
                          </div>
                          <div>
                            <span className="text-[9px] font-bold uppercase text-slate-400 block">Headcount</span>
                            <span className="text-teal-800 font-black text-sm">{selectedSession.studentHeadcount} Girls</span>
                          </div>
                        </div>

                        {selectedSession.publicNotes && (
                          <div className="pt-2 border-t border-teal-100/50 text-[11px] font-medium text-slate-500 leading-relaxed">
                            <span className="font-bold text-slate-700 block mb-0.5">Facilitator Remarks:</span>
                            "{selectedSession.publicNotes}"
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center space-y-3 text-slate-400">
                  <Eye size={28} />
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400 max-w-[160px]">
                    Select a session from the list to view scheduling details.
                  </p>
                </div>
              )}
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
