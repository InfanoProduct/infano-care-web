'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import { ArrowLeft, Calendar, Video, CheckCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';

export default function EnrollmentDetail({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = React.use(params);
  const router = useRouter();
  const [details, setDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // State for scheduling form
  const [schedulingSessionNum, setSchedulingSessionNum] = useState<number | null>(null);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [meetLink, setMeetLink] = useState('');

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

  useEffect(() => {
    fetchDetails();
  }, [resolvedParams.id]);

  const handleSchedule = async (sessionNumber: number) => {
    try {
      const scheduledAt = new Date(`${scheduleDate}T${scheduleTime}`).toISOString();

      await apiClient.post('/expert/sessions', {
        userId: details.enrollment.userId,
        programId: details.enrollment.programId,
        sessionNumber,
        scheduledAt,
        meetLink
      });
      
      // Reset form and refresh
      setSchedulingSessionNum(null);
      setScheduleDate('');
      setScheduleTime('');
      setMeetLink('');
      fetchDetails();
    } catch (error) {
      console.error(error);
      alert('Error scheduling session');
    }
  };

  const handleComplete = async (sessionId: string) => {
    if (!confirm('Are you sure you want to mark this session as completed?')) return;
    
    try {
      await apiClient.patch(`/expert/sessions/${sessionId}/complete`);
      
      fetchDetails();
    } catch (error) {
      console.error(error);
      alert('Error completing session');
    }
  };


  if (loading) {
    return <div className="p-8 text-center text-muted-foreground">Loading details...</div>;
  }

  if (!details) {
    return <div className="p-8 text-center text-rose-500">Enrollment not found.</div>;
  }

  const { enrollment, sessions } = details;
  const totalSessions = enrollment.program.sessions || 1;
  const sessionArray = Array.from({ length: totalSessions }, (_, i) => i + 1);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => router.back()}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-secondary/50 hover:bg-secondary transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-3xl font-black tracking-tight mb-1">
            {enrollment.user.profile?.displayName}'s Sessions
          </h1>
          <p className="text-muted-foreground font-medium">
            Program: <span className="font-semibold text-foreground">{enrollment.program.title}</span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {sessionArray.map(sessionNum => {
          const existingSession = sessions.find((s: any) => s.sessionNumber === sessionNum);
          const isScheduling = schedulingSessionNum === sessionNum;
          const sessionDetails = enrollment.program.sessionsList?.[sessionNum - 1];
          const sessionTitle = sessionDetails?.title || `Session ${sessionNum}`;
          const sessionDesc = sessionDetails?.description || '';

          return (
            <div key={sessionNum} className="bg-white p-6 rounded-3xl border border-border shadow-sm flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg ${
                  existingSession?.status === 'COMPLETED' ? 'bg-green-500 shadow-green-500/20' :
                  existingSession?.status === 'SCHEDULED' ? 'bg-primary shadow-primary/20' :
                  'bg-secondary shadow-none text-muted-foreground'
                }`}>
                  {existingSession?.status === 'COMPLETED' ? <CheckCircle size={24} /> :
                   existingSession?.status === 'SCHEDULED' ? <Calendar size={24} /> :
                   <Clock size={24} />}
                </div>
                
                <div>
                  <h3 className="text-xl font-bold">{sessionTitle}</h3>
                  {sessionDesc && <p className="text-sm text-muted-foreground leading-snug mt-0.5">{sessionDesc}</p>}
                  {existingSession ? (
                    <div className="text-sm mt-1 space-y-1">
                      <p className="text-muted-foreground font-medium flex items-center gap-2">
                        <Calendar size={14} /> {format(new Date(existingSession.scheduledAt), 'PPP p')}
                      </p>
                      {existingSession.meetLink && (
                        <a href={existingSession.meetLink} target="_blank" rel="noreferrer" className="text-primary hover:underline font-medium flex items-center gap-2">
                          <Video size={14} /> Join Virtual Meet
                        </a>
                      )}
                      <p className={`font-bold text-xs uppercase tracking-wider ${
                        existingSession.status === 'COMPLETED' ? 'text-green-600' : 'text-primary'
                      }`}>
                        Status: {existingSession.status}
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground font-medium">Not scheduled yet</p>
                  )}
                </div>
              </div>

              <div className="w-full md:w-auto">
                {!existingSession && !isScheduling && (
                  <button 
                    onClick={() => setSchedulingSessionNum(sessionNum)}
                    className="w-full md:w-auto px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
                  >
                    Schedule Session
                  </button>
                )}

                {existingSession?.status === 'SCHEDULED' && (
                  <button 
                    onClick={() => handleComplete(existingSession.id)}
                    className="w-full md:w-auto px-6 py-3 bg-green-500 text-white rounded-xl font-bold hover:bg-green-600 transition-all shadow-lg shadow-green-500/20"
                  >
                    Mark Completed
                  </button>
                )}

                {isScheduling && (
                  <div className="bg-secondary/30 p-4 rounded-2xl border border-border space-y-4 w-full md:w-80">
                    <h4 className="font-bold text-sm text-muted-foreground uppercase tracking-wider">Set Schedule</h4>
                    
                    <div className="space-y-2">
                      <input 
                        type="date" 
                        className="w-full px-4 py-2 rounded-xl border border-border focus:ring-2 focus:ring-primary focus:outline-none" 
                        value={scheduleDate}
                        onChange={e => setScheduleDate(e.target.value)}
                      />
                      <input 
                        type="time" 
                        className="w-full px-4 py-2 rounded-xl border border-border focus:ring-2 focus:ring-primary focus:outline-none" 
                        value={scheduleTime}
                        onChange={e => setScheduleTime(e.target.value)}
                      />
                      <input 
                        type="url" 
                        placeholder="Meet Link (e.g., Google Meet URL)"
                        className="w-full px-4 py-2 rounded-xl border border-border focus:ring-2 focus:ring-primary focus:outline-none" 
                        value={meetLink}
                        onChange={e => setMeetLink(e.target.value)}
                      />
                    </div>
                    
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleSchedule(sessionNum)}
                        disabled={!scheduleDate || !scheduleTime || !meetLink}
                        className="flex-1 bg-primary text-white py-2 rounded-xl font-bold hover:bg-primary/90 transition-colors disabled:opacity-50"
                      >
                        Save
                      </button>
                      <button 
                        onClick={() => setSchedulingSessionNum(null)}
                        className="flex-1 bg-white text-muted-foreground border border-border py-2 rounded-xl font-bold hover:bg-secondary transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
