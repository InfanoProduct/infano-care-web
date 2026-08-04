'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import { ArrowLeft, Calendar, Video, Loader2, CheckCircle2, Clock, Sparkles } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
import { ParentService } from '@/services/parent.service';
import { useAuthStore } from '@/store/auth-store';

const GoogleMeetIcon = ({ size = 18 }: { size?: number }) => {
  const width = Math.round(size * 1.215);
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 87.5 72"
      width={width}
      height={size}
    >
      <path fill="#00832d" d="M49.5 36l8.53 9.75 11.47 7.33 2-17.02-2-16.64-11.69 6.44z" />
      <path fill="#0066da" d="M0 51.5V66c0 3.315 2.685 6 6 6h14.5l3-10.96-3-9.54-9.95-3z" />
      <path fill="#e94235" d="M20.5 0L0 20.5l10.55 3 9.95-3 2.95-9.41z" />
      <path fill="#2684fc" d="M20.5 20.5H0v31h20.5z" />
      <path fill="#00ac47" d="M82.6 8.68L69.5 19.42v33.66l13.16 10.79c1.97 1.54 4.85.135 4.85-2.37V11c0-2.535-2.945-3.925-4.91-2.32zM49.5 36v15.5h-29V72h43c3.315 0 6-2.685 6-6V53.08z" />
      <path fill="#ffba00" d="M63.5 0h-43v20.5h29V36l20-16.57V6c0-3.315-2.685-6-6-6z" />
    </svg>
  );
};



export default function ExpertProgramSessionDetail({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = React.use(params);
  const router = useRouter();
  const { user } = useAuthStore();
  const isExpert = user?.role === 'EXPERT' || user?.role === 'ADMIN';

  const [details, setDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [experts, setExperts] = useState<any[]>([]);

  // Scheduling form state
  const [schedulingSessionNum, setSchedulingSessionNum] = useState<number | null>(null);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [meetLink, setMeetLink] = useState('');
  const [saving, setSaving] = useState(false);
  const [completing, setCompleting] = useState<string | null>(null);

  const getTomorrowDateString = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const yyyy = tomorrow.getFullYear();
    const mm = String(tomorrow.getMonth() + 1).padStart(2, '0');
    const dd = String(tomorrow.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const fetchDetails = async () => {
    try {
      const data = await apiClient.request<any>(`/expert/enrollments/${resolvedParams.id}`);
      setDetails(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadExperts = async () => {
    try {
      const data = await ParentService.getExperts();
      setExperts(data);
    } catch (error) {
      console.error('Failed to load experts:', error);
    }
  };

  useEffect(() => {
    fetchDetails();
    loadExperts();
  }, [resolvedParams.id]);

  const handleSchedule = async (sessionNumber: number) => {
    const tomorrowStr = getTomorrowDateString();
    if (scheduleDate < tomorrowStr) {
      toast.error('Schedule date must be next day onward');
      return;
    }
    setSaving(true);
    try {
      const scheduledAt = new Date(`${scheduleDate}T${scheduleTime}`).toISOString();
      await apiClient.post('/expert/sessions', {
        userId: details.enrollment.userId,
        programId: details.enrollment.programId,
        sessionNumber,
        scheduledAt,
        meetLink,
      });
      if (sessionNumber < 0) {
        toast.success('Consultation scheduled!');
      } else {
        toast.success(`Session ${sessionNumber} scheduled!`);
      }
      setSchedulingSessionNum(null);
      setScheduleDate('');
      setScheduleTime('');
      setMeetLink('');
      fetchDetails();
    } catch (error) {
      toast.error('Error scheduling session');
    } finally {
      setSaving(false);
    }
  };

  const handleComplete = async (sessionId: string) => {
    setCompleting(sessionId);
    try {
      await apiClient.patch(`/expert/sessions/${sessionId}/complete`);
      toast.success('Session marked as completed!');
      fetchDetails();
    } catch (error) {
      toast.error('Error completing session');
    } finally {
      setCompleting(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <Loader2 className="animate-spin text-indigo-600" size={40} />
        <span className="font-bold text-slate-500 text-sm">Loading session details...</span>
      </div>
    );
  }

  if (!details) {
    return <div className="p-8 text-center text-rose-500 font-bold">Enrollment not found.</div>;
  }

  const { enrollment, sessions } = details;
  const studentName = enrollment.guestName || enrollment.user?.profile?.displayName || enrollment.user?.username || 'Student';
  const studentEmail = enrollment.guestEmail || '';
  const totalSessions = enrollment.program.curriculum?.length || 1;
  const sessionArray = Array.from({ length: totalSessions }, (_, i) => i + 1);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 w-full max-w-7xl mx-auto pb-8 font-sans">
      {/* Header */}
      <div className="flex items-center gap-4 bg-white p-6 rounded-[2rem] border border-slate-100 shadow-2xs">
        <button
          onClick={() => router.push('/dashboard/program-sessions')}
          className="w-10 h-10 flex items-center justify-center rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-slate-600 transition-all cursor-pointer"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-800">
            {studentName}'s Sessions
          </h1>
          <p className="text-slate-500 text-xs font-semibold mt-0.5 flex items-center gap-3 flex-wrap">
            <span>Program: <span className="font-extrabold text-indigo-600">{enrollment.program.title}</span></span>
            {studentEmail && (
              <span className="text-[11px] bg-slate-100 px-2.5 py-0.5 rounded-full font-bold text-slate-500">{studentEmail}</span>
            )}
          </p>
        </div>
      </div>

      {/* Curriculum Sessions List */}
      <div className="space-y-4">
        <h2 className="text-lg font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
          <span>Curriculum Session Timeline</span>
          <span className="text-xs bg-indigo-50 border border-indigo-100 text-indigo-700 px-2.5 py-0.5 rounded-full font-bold">
            {totalSessions} Sessions
          </span>
        </h2>

        <div className="grid grid-cols-1 gap-4">
          {sessionArray.map(sessionNum => {
            const existingSession = sessions.find((s: any) => s.sessionNumber === sessionNum);
            const isScheduling = schedulingSessionNum === sessionNum;
            const sessionsList = (enrollment.program.curriculum && Array.isArray(enrollment.program.curriculum) && enrollment.program.curriculum.length > 0)
              ? (enrollment.program.curriculum as any[])
              : (enrollment.program.sessionsList && enrollment.program.sessionsList.length > 0)
                ? enrollment.program.sessionsList
                : [];
            const sessionDetails = sessionsList?.[sessionNum - 1];
            const sessionTitle = sessionDetails?.title || `Session ${sessionNum}`;
            const sessionDesc = sessionDetails?.description || '';

            const prevSession = sessions.find((s: any) => s.sessionNumber === sessionNum - 1);
            const canSchedule = sessionNum === 1 || prevSession?.status === 'COMPLETED';

            let statusLabel = 'Not Scheduled';
            let statusColor = 'bg-slate-100 text-slate-500 border-slate-200';
            if (existingSession?.status === 'COMPLETED') {
              statusLabel = 'Completed';
              statusColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';
            } else if (existingSession?.status === 'SCHEDULED') {
              statusLabel = 'Scheduled';
              statusColor = 'bg-indigo-50 text-indigo-700 border-indigo-200';
            }

            return (
              <div
                key={sessionNum}
                className="bg-white rounded-3xl border border-slate-100 shadow-2xs overflow-hidden hover:shadow-xs transition-shadow"
              >
                <div className="flex flex-col md:flex-row gap-6 justify-between items-start p-6">
                  {/* Left: Session info */}
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-700 font-black text-lg flex items-center justify-center shrink-0 border border-indigo-100">
                      {sessionNum}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <h3 className="text-base font-extrabold text-slate-800">{sessionTitle}</h3>
                        <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider border ${statusColor}`}>
                          {statusLabel}
                        </span>
                      </div>

                      {sessionDesc && (
                        <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-xl">{sessionDesc}</p>
                      )}

                      {existingSession ? (
                        <div className="text-xs space-y-1 pt-1.5">
                          <p className="text-slate-600 font-semibold flex items-center gap-1.5">
                            <Calendar size={13} className="text-indigo-500" />
                            {format(new Date(existingSession.scheduledAt), 'EEE, d MMM yyyy • hh:mm a')}
                          </p>
                          {existingSession.meetLink && (
                            <a
                              href={existingSession.meetLink}
                              target="_blank"
                              rel="noreferrer"
                              className="text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1.5 text-xs hover:underline"
                            >
                              <Video size={13} /> {existingSession.meetLink}
                            </a>
                          )}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400 font-medium italic pt-0.5">Not scheduled yet</p>
                      )}
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="w-full md:w-auto md:min-w-[200px] shrink-0">
                    {!existingSession && !isScheduling && (
                      isExpert ? (
                        canSchedule ? (
                          <button
                            onClick={() => setSchedulingSessionNum(sessionNum)}
                            className="w-full px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-xs hover:bg-indigo-700 transition-all shadow-2xs cursor-pointer active:scale-95"
                          >
                            Schedule Session
                          </button>
                        ) : (
                          <span className="block w-full text-center text-[11px] text-slate-400 font-semibold px-4 py-2.5 bg-slate-50 rounded-xl border border-slate-200/80">
                            Complete Session {sessionNum - 1} first
                          </span>
                        )
                      ) : (
                        <span className="block w-full text-center text-[11px] text-slate-400 font-semibold px-4 py-2.5 bg-slate-50 rounded-xl border border-slate-200/80">
                          Not Scheduled
                        </span>
                      )
                    )}

                    {existingSession?.status === 'SCHEDULED' && (
                      <div className="space-y-2">
                        {isExpert ? (
                          <>
                            <button
                              onClick={() => handleComplete(existingSession.id)}
                              disabled={completing === existingSession.id}
                              className="w-full px-5 py-2.5 bg-emerald-600 text-white rounded-xl font-bold text-xs hover:bg-emerald-700 transition-all shadow-2xs flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-70"
                            >
                              {completing === existingSession.id
                                ? <Loader2 size={14} className="animate-spin" />
                                : 'Mark Completed ✓'}
                            </button>

                            {new Date(existingSession.scheduledAt) < new Date() && (
                              <button
                                onClick={() => {
                                  setSchedulingSessionNum(sessionNum);
                                  const d = new Date(existingSession.scheduledAt);
                                  setScheduleDate(d.toISOString().split('T')[0]);
                                  setScheduleTime(d.toTimeString().slice(0, 5));
                                  setMeetLink(existingSession.meetLink || '');
                                }}
                                className="w-full px-4 py-2 bg-white text-indigo-600 border border-indigo-200 rounded-xl font-bold text-xs hover:bg-indigo-50 transition-all cursor-pointer"
                              >
                                Reschedule Session
                              </button>
                            )}
                          </>
                        ) : (
                          <span className="block w-full text-center text-[11px] text-slate-400 font-semibold px-4 py-2.5 bg-slate-50 rounded-xl border border-slate-200/80">
                            Scheduled
                          </span>
                        )}
                      </div>
                    )}

                    {existingSession?.status === 'COMPLETED' && (
                      <span className="block w-full text-center text-xs text-emerald-700 font-black px-4 py-2.5 bg-emerald-50 rounded-xl border border-emerald-100">
                        Completed ✓
                      </span>
                    )}
                  </div>
                </div>

                {/* Inline scheduling form */}
                {isScheduling && (
                  <div className="border-t border-slate-100 bg-slate-50/60 p-5 space-y-3">
                    <h4 className="font-extrabold text-xs text-slate-500 uppercase tracking-wider">
                      {sessionNum < 0 ? 'Set Schedule for Free Consultation' : `Set Schedule for Session ${sessionNum}`}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Date</label>
                        <input
                          type="date"
                          min={getTomorrowDateString()}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-semibold text-xs text-slate-800 outline-none focus:border-indigo-400"
                          value={scheduleDate}
                          onChange={e => setScheduleDate(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Time</label>
                        <input
                          type="time"
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-semibold text-xs text-slate-800 outline-none focus:border-indigo-400"
                          value={scheduleTime}
                          onChange={e => setScheduleTime(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Meeting Link</label>
                        <input
                          type="url"
                          placeholder="Google Meet or Zoom URL"
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-semibold text-xs text-slate-800 outline-none focus:border-indigo-400"
                          value={meetLink}
                          onChange={e => setMeetLink(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => handleSchedule(sessionNum)}
                        disabled={!scheduleDate || !scheduleTime || !meetLink || saving}
                        className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold text-xs hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center gap-1.5 cursor-pointer shadow-2xs"
                      >
                        {saving ? <Loader2 size={13} className="animate-spin" /> : null}
                        Save Schedule
                      </button>
                      <button
                        onClick={() => setSchedulingSessionNum(null)}
                        className="px-4 py-2 bg-white text-slate-600 border border-slate-200 rounded-xl font-bold text-xs hover:bg-slate-50 transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Free Consultations List */}
      <div className="space-y-4 pt-4 border-t border-slate-100">
        <h2 className="text-lg font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
          <GoogleMeetIcon size={20} />
          <span>Included Free Consultations</span>
        </h2>

        <div className="grid grid-cols-1 gap-4">
          {enrollment.program?.consultations && enrollment.program.consultations.length > 0 ? (
            enrollment.program.consultations.map((consultation: any, idx: number) => {
              const sessionNum = -(idx + 1);
              const existingSession = sessions.find((s: any) => s.sessionNumber === sessionNum);
              const isScheduling = schedulingSessionNum === sessionNum;

              const expertObj = experts.find(e => e.id === consultation.expertId);
              const expertName = expertObj ? `${expertObj.displayName} (${expertObj.specialisation})` : 'Unassigned Expert';
              const isAssigned = user?.id === consultation.expertId;

              let statusLabel = 'Not Scheduled';
              let statusColor = 'bg-slate-100 text-slate-500 border-slate-200';
              if (existingSession?.status === 'COMPLETED') {
                statusLabel = 'Completed';
                statusColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';
              } else if (existingSession?.status === 'SCHEDULED') {
                statusLabel = 'Scheduled';
                statusColor = 'bg-indigo-50 text-indigo-700 border-indigo-200';
              }

              return (
                <div
                  key={sessionNum}
                  className="bg-white rounded-3xl border border-slate-100 shadow-2xs overflow-hidden"
                >
                  <div className="flex flex-col md:flex-row gap-6 justify-between items-start p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-700 border border-indigo-100 font-black text-xs flex flex-col items-center justify-center shrink-0 leading-none">
                        <span>FREE</span>
                        <span className="text-sm font-black mt-0.5">{idx + 1}</span>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <h3 className="text-base font-extrabold text-slate-800">{consultation.title}</h3>
                          <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider border ${statusColor}`}>
                            {statusLabel}
                          </span>
                        </div>

                        <p className="text-xs text-slate-500 font-semibold">
                          Assigned Expert: <span className="text-indigo-600 font-extrabold">{expertName}</span>
                        </p>

                        {existingSession ? (
                          <div className="text-xs space-y-1 pt-1">
                            <p className="text-slate-600 font-semibold flex items-center gap-1.5">
                              <Calendar size={13} className="text-indigo-500" />
                              {format(new Date(existingSession.scheduledAt), 'EEE, d MMM yyyy • hh:mm a')}
                            </p>
                            {existingSession.meetLink && (
                              <a
                                href={existingSession.meetLink}
                                target="_blank"
                                rel="noreferrer"
                                className="text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1.5 text-xs hover:underline"
                              >
                                <Video size={13} /> {existingSession.meetLink}
                              </a>
                            )}
                          </div>
                        ) : (
                          <p className="text-xs text-slate-400 font-medium italic">Not scheduled yet</p>
                        )}
                      </div>
                    </div>

                    <div className="w-full md:w-auto md:min-w-[200px] shrink-0">
                      {isAssigned ? (
                        <>
                          {!existingSession && !isScheduling && (
                            <button
                              type="button"
                              onClick={() => {
                                setSchedulingSessionNum(sessionNum);
                                setScheduleDate('');
                                setScheduleTime('');
                                setMeetLink('');
                              }}
                              className="w-full px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-xs hover:bg-indigo-700 transition-all shadow-2xs cursor-pointer active:scale-95"
                            >
                              Schedule Session
                            </button>
                          )}

                          {existingSession?.status === 'SCHEDULED' && (
                            <div className="space-y-2">
                              <button
                                type="button"
                                onClick={() => handleComplete(existingSession.id)}
                                disabled={completing === existingSession.id}
                                className="w-full px-5 py-2.5 bg-emerald-600 text-white rounded-xl font-bold text-xs hover:bg-emerald-700 transition-all shadow-2xs flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-70"
                              >
                                {completing === existingSession.id
                                  ? <Loader2 size={14} className="animate-spin" />
                                  : 'Mark Completed ✓'}
                              </button>

                              {new Date(existingSession.scheduledAt) < new Date() && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSchedulingSessionNum(sessionNum);
                                    const d = new Date(existingSession.scheduledAt);
                                    setScheduleDate(d.toISOString().split('T')[0]);
                                    setScheduleTime(d.toTimeString().slice(0, 5));
                                    setMeetLink(existingSession.meetLink || '');
                                  }}
                                  className="w-full px-4 py-2 bg-white text-indigo-600 border border-indigo-200 rounded-xl font-bold text-xs hover:bg-indigo-50 transition-all cursor-pointer"
                                >
                                  Reschedule Session
                                </button>
                              )}
                            </div>
                          )}

                          {existingSession?.status === 'COMPLETED' && (
                            <span className="block w-full text-center text-xs text-emerald-700 font-black px-4 py-2.5 bg-emerald-50 rounded-xl border border-emerald-100">
                              Completed ✓
                            </span>
                          )}
                        </>
                      ) : (
                        <span className="block w-full text-center text-[11px] text-slate-400 font-semibold px-4 py-2.5 bg-slate-50 rounded-xl border border-slate-200/80">
                          Assigned to {expertName.split(' ')[0]}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Inline scheduling form */}
                  {isScheduling && (
                    <div className="border-t border-slate-100 bg-slate-50/60 p-5 space-y-3">
                      <h4 className="font-extrabold text-xs text-slate-500 uppercase tracking-wider">
                        Set Schedule for Free Consultation
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Date</label>
                          <input
                            type="date"
                            min={getTomorrowDateString()}
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-semibold text-xs text-slate-800 outline-none focus:border-indigo-400"
                            value={scheduleDate}
                            onChange={e => setScheduleDate(e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Time</label>
                          <input
                            type="time"
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-semibold text-xs text-slate-800 outline-none focus:border-indigo-400"
                            value={scheduleTime}
                            onChange={e => setScheduleTime(e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Meeting Link</label>
                          <input
                            type="url"
                            placeholder="Google Meet or Zoom URL"
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-semibold text-xs text-slate-800 outline-none focus:border-indigo-400"
                            value={meetLink}
                            onChange={e => setMeetLink(e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="flex gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => handleSchedule(sessionNum)}
                          disabled={!scheduleDate || !scheduleTime || !meetLink || saving}
                          className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold text-xs hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center gap-1.5 cursor-pointer shadow-2xs"
                        >
                          {saving ? <Loader2 size={13} className="animate-spin" /> : null}
                          Save Schedule
                        </button>
                        <button
                          type="button"
                          onClick={() => setSchedulingSessionNum(null)}
                          className="px-4 py-2 bg-white text-slate-600 border border-slate-200 rounded-xl font-bold text-xs hover:bg-slate-50 transition-colors cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <p className="text-xs text-slate-400 font-semibold italic pl-2">
              No free consultations configured for this program.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
