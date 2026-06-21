'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import { ArrowLeft, Calendar, Video, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
import { ParentService } from '@/services/parent.service';
import { useAuthStore } from '@/store/auth-store';

const GoogleMeetIcon = ({ size = 14 }: { size?: number }) => {
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

export default function EnrollmentDetail({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = React.use(params);
  const router = useRouter();
  const { user } = useAuthStore();
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
        <Loader2 className="animate-spin text-primary" size={40} />
        <span className="font-bold text-slate-500 text-sm">Loading sessions...</span>
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
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-secondary/50 hover:bg-secondary transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-3xl font-black tracking-tight mb-1">
            {studentName}'s Sessions
          </h1>
          <p className="text-muted-foreground font-medium flex items-center gap-3 flex-wrap">
            <span>Program: <span className="font-semibold text-foreground">{enrollment.program.title}</span></span>
            {studentEmail && (
              <span className="text-xs bg-slate-100 px-2 py-0.5 rounded-full font-semibold text-slate-500">{studentEmail}</span>
            )}
          </p>
        </div>
      </div>

      {/* Sessions List */}
      <div className="grid grid-cols-1 gap-5">
        {sessionArray.map(sessionNum => {
          const existingSession = sessions.find((s: any) => s.sessionNumber === sessionNum);
          const isScheduling = schedulingSessionNum === sessionNum;
          const sessionDetails = enrollment.program.sessionsList?.[sessionNum - 1];
          const sessionTitle = sessionDetails?.title || `Session ${sessionNum}`;
          const sessionDesc = sessionDetails?.description || '';

          // Determine if previous session is completed (sequential gate)
          const prevSession = sessions.find((s: any) => s.sessionNumber === sessionNum - 1);
          const canSchedule = sessionNum === 1 || prevSession?.status === 'COMPLETED';

          // Status label and color
          let statusLabel = 'Not Scheduled';
          let statusColor = 'bg-slate-100 text-slate-500';
          if (existingSession?.status === 'COMPLETED') {
            statusLabel = 'Completed';
            statusColor = 'bg-green-100 text-green-700';
          } else if (existingSession?.status === 'SCHEDULED') {
            statusLabel = 'Scheduled';
            statusColor = 'bg-blue-100 text-blue-700';
          }

          return (
            <div
              key={sessionNum}
              className="bg-white rounded-3xl border border-border shadow-sm overflow-hidden"
            >
              <div className="flex flex-col md:flex-row gap-6 justify-between items-start p-6">
                {/* Left: Session info */}
                <div className="flex items-start gap-5">
                  {/* Session Number Badge */}
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary font-black text-xl flex items-center justify-center shrink-0">
                    {sessionNum}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="text-lg font-bold text-foreground">{sessionTitle}</h3>
                      <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${statusColor}`}>
                        {statusLabel}
                      </span>
                    </div>

                    {sessionDesc && (
                      <p className="text-sm text-muted-foreground leading-snug">{sessionDesc}</p>
                    )}

                    {existingSession ? (
                      <div className="text-sm space-y-1 pt-1">
                        <p className="text-muted-foreground font-medium flex items-center gap-2">
                          <Calendar size={13} />
                          {format(new Date(existingSession.scheduledAt), 'PPP p')}
                        </p>
                        {existingSession.meetLink && (
                          <a
                            href={existingSession.meetLink}
                            target="_blank"
                            rel="noreferrer"
                            className="text-primary hover:underline font-semibold flex items-center gap-1.5 text-xs"
                          >
                            <Video size={13} /> Join Virtual Meet
                          </a>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">Not scheduled yet</p>
                    )}
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="w-full md:w-auto md:min-w-[220px] shrink-0">
                  {/* Can schedule: session not yet created */}
                  {!existingSession && !isScheduling && canSchedule && (
                    <button
                      onClick={() => setSchedulingSessionNum(sessionNum)}
                      className="w-full px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-all shadow-md shadow-primary/20"
                    >
                      Schedule Session
                    </button>
                  )}

                  {/* Blocked: previous not completed */}
                  {!existingSession && !isScheduling && !canSchedule && (
                    <span className="block w-full text-center text-xs text-muted-foreground font-semibold px-4 py-3 bg-slate-50 rounded-xl border border-slate-200">
                      Complete Session {sessionNum - 1} first
                    </span>
                  )}

                  {/* Mark completed button */}
                  {existingSession?.status === 'SCHEDULED' && (
                    <div className="space-y-2">
                      <button
                        onClick={() => handleComplete(existingSession.id)}
                        disabled={completing === existingSession.id}
                        className="w-full px-6 py-3 bg-green-500 text-white rounded-xl font-bold hover:bg-green-600 transition-all shadow-md shadow-green-500/20 flex items-center justify-center gap-2 disabled:opacity-70"
                      >
                        {completing === existingSession.id
                          ? <Loader2 size={16} className="animate-spin" />
                          : 'Mark Completed'}
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
                          className="w-full px-6 py-3 bg-white text-primary border border-primary rounded-xl font-bold hover:bg-primary/5 transition-all shadow-sm flex items-center justify-center gap-2"
                        >
                          Reschedule Session
                        </button>
                      )}
                    </div>
                  )}

                  {/* Completed — no action needed */}
                  {existingSession?.status === 'COMPLETED' && (
                    <span className="block w-full text-center text-xs text-green-700 font-bold px-4 py-3 bg-green-50 rounded-xl border border-green-100">
                      Session Completed ✓
                    </span>
                  )}

                  {existingSession?.expert && (
                    <p className="text-[11px] text-muted-foreground text-center mt-2 font-medium">
                      Scheduled by: <span className="text-primary font-semibold">{existingSession.expert.profile?.displayName || existingSession.expert.username}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Inline scheduling form */}
              {isScheduling && (
                <div className="border-t border-border bg-slate-50/50 p-6">
                  <h4 className="font-bold text-sm text-muted-foreground uppercase tracking-wider mb-4">
                    {sessionNum < 0 ? 'Set Schedule for Free Consultation' : `Set Schedule for Session ${sessionNum}`}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <input
                      type="date"
                      min={getTomorrowDateString()}
                      className="w-full px-4 py-3 rounded-xl border border-border bg-white focus:ring-2 focus:ring-primary focus:outline-none font-medium"
                      value={scheduleDate}
                      onChange={e => setScheduleDate(e.target.value)}
                    />
                    <input
                      type="time"
                      className="w-full px-4 py-3 rounded-xl border border-border bg-white focus:ring-2 focus:ring-primary focus:outline-none font-medium"
                      value={scheduleTime}
                      onChange={e => setScheduleTime(e.target.value)}
                    />
                    <input
                      type="url"
                      placeholder="Meet Link (Google Meet URL)"
                      className="w-full px-4 py-3 rounded-xl border border-border bg-white focus:ring-2 focus:ring-primary focus:outline-none font-medium"
                      value={meetLink}
                      onChange={e => setMeetLink(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={() => handleSchedule(sessionNum)}
                      disabled={!scheduleDate || !scheduleTime || !meetLink || saving}
                      className="px-8 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                      {saving ? <Loader2 size={15} className="animate-spin" /> : null}
                      Save Schedule
                    </button>
                    <button
                      onClick={() => setSchedulingSessionNum(null)}
                      className="px-6 py-3 bg-white text-muted-foreground border border-border rounded-xl font-bold hover:bg-secondary transition-colors"
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

      {/* Free Consultations List */}
      <div className="mt-8 pt-8 border-t border-border">
        <h2 className="text-2xl font-black tracking-tight mb-4 flex items-center gap-2">
          <GoogleMeetIcon size={22} />
          Free Consultations
        </h2>

        <div className="grid grid-cols-1 gap-5">
          {enrollment.program?.consultations && enrollment.program.consultations.length > 0 ? (
            enrollment.program.consultations.map((consultation: any, idx: number) => {
              const sessionNum = -(idx + 1);
              const existingSession = sessions.find((s: any) => s.sessionNumber === sessionNum);
              const isScheduling = schedulingSessionNum === sessionNum;
              
              const expertObj = experts.find(e => e.id === consultation.expertId);
              const expertName = expertObj ? `${expertObj.displayName} (${expertObj.specialisation})` : 'Unassigned Expert';
              
              const isAssigned = user?.id === consultation.expertId;

              // Status label and color
              let statusLabel = 'Not Scheduled';
              let statusColor = 'bg-slate-100 text-slate-500';
              if (existingSession?.status === 'COMPLETED') {
                statusLabel = 'Completed';
                statusColor = 'bg-green-100 text-green-700';
              } else if (existingSession?.status === 'SCHEDULED') {
                statusLabel = 'Scheduled';
                statusColor = 'bg-blue-100 text-blue-700';
              }

              return (
                <div
                  key={sessionNum}
                  className="bg-white rounded-3xl border border-border shadow-sm overflow-hidden"
                >
                  <div className="flex flex-col md:flex-row gap-6 justify-between items-start p-6">
                    {/* Left: Consultation info */}
                    <div className="flex items-start gap-5">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 font-black text-xs flex flex-col items-center justify-center shrink-0 leading-none">
                        <span>FREE</span>
                        <span className="text-lg font-black mt-0.5">{idx + 1}</span>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-3 flex-wrap">
                          <h3 className="text-lg font-bold text-foreground">{consultation.title}</h3>
                          <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${statusColor}`}>
                            {statusLabel}
                          </span>
                        </div>

                        <p className="text-sm text-muted-foreground font-semibold">
                          Assigned Expert: <span className="text-primary">{expertName}</span>
                        </p>

                        {existingSession ? (
                          <div className="text-sm space-y-1 pt-1">
                            <p className="text-muted-foreground font-medium flex items-center gap-2">
                              <Calendar size={13} />
                              {format(new Date(existingSession.scheduledAt), 'PPP p')}
                            </p>
                            {existingSession.meetLink && (
                              <a
                                href={existingSession.meetLink}
                                target="_blank"
                                rel="noreferrer"
                                className="text-primary hover:underline font-semibold flex items-center gap-1.5 text-xs"
                              >
                                <Video size={13} /> Join Virtual Meet
                              </a>
                            )}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">Not scheduled yet</p>
                        )}
                      </div>
                    </div>

                    {/* Right: Actions (Only available if logged-in expert is the assigned expert) */}
                    <div className="w-full md:w-auto md:min-w-[220px] shrink-0">
                      {isAssigned ? (
                        <>
                          {/* Can schedule: session not yet created */}
                          {!existingSession && !isScheduling && (
                            <button
                              type="button"
                              onClick={() => {
                                setSchedulingSessionNum(sessionNum);
                                setScheduleDate('');
                                setScheduleTime('');
                                setMeetLink('');
                              }}
                              className="w-full px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-all shadow-md shadow-primary/20"
                            >
                              Schedule Session
                            </button>
                          )}

                          {/* Mark completed button */}
                          {existingSession?.status === 'SCHEDULED' && (
                            <div className="space-y-2">
                              <button
                                type="button"
                                onClick={() => handleComplete(existingSession.id)}
                                disabled={completing === existingSession.id}
                                className="w-full px-6 py-3 bg-green-500 text-white rounded-xl font-bold hover:bg-green-600 transition-all shadow-md shadow-green-500/20 flex items-center justify-center gap-2 disabled:opacity-70"
                              >
                                {completing === existingSession.id
                                  ? <Loader2 size={16} className="animate-spin" />
                                  : 'Mark Completed'}
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
                                  className="w-full px-6 py-3 bg-white text-primary border border-primary rounded-xl font-bold hover:bg-primary/5 transition-all shadow-sm flex items-center justify-center gap-2"
                                >
                                  Reschedule Session
                                </button>
                              )}
                            </div>
                          )}

                          {/* Completed */}
                          {existingSession?.status === 'COMPLETED' && (
                            <span className="block w-full text-center text-xs text-green-700 font-bold px-4 py-3 bg-green-50 rounded-xl border border-green-100">
                              Consultation Completed ✓
                            </span>
                          )}

                          {existingSession?.expert && (
                            <p className="text-[11px] text-muted-foreground text-center mt-2 font-medium">
                              Scheduled by: <span className="text-primary font-semibold">{existingSession.expert.profile?.displayName || existingSession.expert.username}</span>
                            </p>
                          )}
                        </>
                      ) : (
                        <span className="block w-full text-center text-xs text-muted-foreground font-semibold px-4 py-3 bg-slate-50 rounded-xl border border-slate-200">
                          Only assigned expert can schedule
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Inline scheduling form */}
                  {isScheduling && (
                    <div className="border-t border-border bg-slate-50/50 p-6">
                      <h4 className="font-bold text-sm text-muted-foreground uppercase tracking-wider mb-4">
                        Set Schedule for Free Consultation
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <input
                          type="date"
                          min={getTomorrowDateString()}
                          className="w-full px-4 py-3 rounded-xl border border-border bg-white focus:ring-2 focus:ring-primary focus:outline-none font-medium"
                          value={scheduleDate}
                          onChange={e => setScheduleDate(e.target.value)}
                        />
                        <input
                          type="time"
                          className="w-full px-4 py-3 rounded-xl border border-border bg-white focus:ring-2 focus:ring-primary focus:outline-none font-medium"
                          value={scheduleTime}
                          onChange={e => setScheduleTime(e.target.value)}
                        />
                        <input
                          type="url"
                          placeholder="Meet Link (Google Meet URL)"
                          className="w-full px-4 py-3 rounded-xl border border-border bg-white focus:ring-2 focus:ring-primary focus:outline-none font-medium"
                          value={meetLink}
                          onChange={e => setMeetLink(e.target.value)}
                        />
                      </div>
                      <div className="flex gap-3 mt-4">
                        <button
                          type="button"
                          onClick={() => handleSchedule(sessionNum)}
                          disabled={!scheduleDate || !scheduleTime || !meetLink || saving}
                          className="px-8 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
                        >
                          {saving ? <Loader2 size={15} className="animate-spin" /> : null}
                          Save Schedule
                        </button>
                        <button
                          type="button"
                          onClick={() => setSchedulingSessionNum(null)}
                          className="px-6 py-3 bg-white text-muted-foreground border border-border rounded-xl font-bold hover:bg-secondary transition-colors"
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
            <p className="text-sm text-muted-foreground italic font-semibold pl-2">
              No free consultations configured for this program.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
