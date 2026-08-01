'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { useAuthStore } from '@/store/auth-store';
import { MessageSquare, Clock, User, Loader2, Power, Sparkles, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';

export default function MyChatsPage() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [isAvailable, setIsAvailable] = useState(false);
  const [sessions, setSessions] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statusRes, sessionsRes]: [any, any] = await Promise.all([
        apiClient.get('/peerline/mentor/status'),
        apiClient.get('/peerline/sessions?role=mentor')
      ]);
      
      setIsAvailable(statusRes.isAvailable);
      setSessions(sessionsRes.sessions || []);
    } catch (error) {
      console.error('Failed to fetch data', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleAvailability = async () => {
    try {
      const newStatus = !isAvailable;
      setIsAvailable(newStatus);
      await apiClient.patch('/peerline/mentor/availability', { isAvailable: newStatus });
      toast.success(newStatus ? 'You are now online & visible!' : 'You are now offline.');
    } catch (error) {
      setIsAvailable(!isAvailable);
      toast.error('Failed to update availability');
    }
  };

  const pendingRequests = sessions.filter(s => s.status === 'REQUESTED' || s.status === 'PENDING');
  const activeSessions = sessions.filter(s => s.status === 'ACTIVE' || s.status === 'ONGOING');
  const pastSessions = sessions.filter(s => s.status === 'COMPLETED' || s.status === 'CANCELLED');

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-[#431872]" />
        <p className="text-sm font-extrabold text-slate-400 animate-pulse tracking-widest uppercase">Loading workspace...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-purple-100 text-purple-700 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest flex items-center gap-1.5 shadow-sm">
              <Sparkles size={12} className="text-purple-500" />
              Peer Mentor Area
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">My PeerLine Chats</h1>
          <p className="text-sm text-slate-500 mt-2 font-medium">Manage your availability, active sessions, and chat history.</p>
        </div>
      </div>

      {/* Hero Availability Card */}
      <div className={`relative overflow-hidden rounded-[2rem] p-6 md:p-8 shadow-sm border transition-all duration-500 ${
        isAvailable 
          ? 'bg-linear-to-br from-emerald-50 via-teal-50/50 to-emerald-100/80 border-emerald-200/60 shadow-emerald-900/5' 
          : 'bg-linear-to-br from-slate-50 to-slate-100/90 border-slate-200/80'
      }`}>
        {/* Decorative Background Elements */}
        {isAvailable && (
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-emerald-400/10 rounded-full blur-3xl" />
        )}

        <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-500 shadow-sm ${
              isAvailable 
                ? 'bg-emerald-500 text-white shadow-emerald-500/30 rotate-0 scale-100' 
                : 'bg-white text-slate-400 border border-slate-200 -rotate-12 scale-95'
            }`}>
              <Power size={26} className={isAvailable ? 'animate-pulse' : ''} />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-xl tracking-tight">Chat Availability</h3>
              <p className={`text-sm mt-1 font-semibold ${isAvailable ? 'text-emerald-700' : 'text-slate-500'}`}>
                {isAvailable 
                  ? 'You are currently online and ready to accept chat requests.' 
                  : 'You are offline. Toggle to start accepting new chats.'}
              </p>
            </div>
          </div>

          {/* Sleek Custom Toggle */}
          <button
            onClick={toggleAvailability}
            className={`relative inline-flex h-10 w-20 shrink-0 items-center rounded-full transition-all duration-300 shadow-inner outline-none ${
              isAvailable ? 'bg-emerald-500 shadow-emerald-600/50' : 'bg-slate-300 shadow-slate-400/50'
            } active:scale-95`}
          >
            <span
              className={`inline-block h-8 w-8 transform rounded-full bg-white shadow-md transition-transform duration-300 ease-spring ${
                isAvailable ? 'translate-x-11 shadow-emerald-900/20' : 'translate-x-1 shadow-slate-900/10'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Content Columns */}
      <div className="grid md:grid-cols-12 gap-8">
        
        {/* Left Column: Active & Requests */}
        <div className="md:col-span-7 space-y-6">
          <div className="flex items-center justify-between px-1">
            <h3 className="font-extrabold text-slate-800 text-lg flex items-center gap-2.5">
              <MessageSquare size={20} className="text-[#431872]" />
              Active & Requests
            </h3>
            <span className="bg-[#431872]/10 text-[#431872] text-xs font-black px-2.5 py-1 rounded-lg">
              {activeSessions.length + pendingRequests.length}
            </span>
          </div>

          <div className="space-y-4">
            {activeSessions.length === 0 && pendingRequests.length === 0 ? (
              <div className="bg-white rounded-[2rem] border border-slate-100/80 shadow-2xs p-10 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 mb-4 shadow-inner">
                  <MessageSquare size={32} />
                </div>
                <h4 className="font-extrabold text-slate-700 text-lg">No active chats</h4>
                <p className="text-sm text-slate-500 mt-2 font-medium max-w-[200px]">
                  {isAvailable ? "We'll notify you when a new request comes in." : "Turn on your availability to start accepting requests."}
                </p>
              </div>
            ) : (
              <>
                {/* Active Sessions */}
                {activeSessions.map(session => (
                  <div key={session.id} className="group bg-white rounded-[1.5rem] p-5 border border-[#431872]/10 shadow-sm hover:shadow-md hover:border-[#431872]/30 transition-all duration-300 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-[#431872]" />
                    
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3.5">
                        <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-black text-sm shadow-inner border border-purple-100/50">
                          <User size={20} />
                        </div>
                        <div>
                          <p className="text-base font-extrabold text-slate-900 tracking-tight">Active Chat</p>
                          <p className="text-xs font-semibold text-slate-400 flex items-center gap-1.5 mt-0.5">
                            <Clock size={12} /> {format(new Date(session.createdAt), 'h:mm a')}
                          </p>
                        </div>
                      </div>
                      <span className="bg-emerald-100 text-emerald-700 text-[9px] font-black px-2.5 py-1 rounded-lg uppercase tracking-widest shadow-xs">
                        Ongoing
                      </span>
                    </div>

                    <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-100/80 mb-4">
                      <p className="text-sm text-slate-700 font-medium line-clamp-2 leading-relaxed">
                        <span className="font-bold text-slate-900 mr-2">Topic:</span>
                        {session.topic || 'General Support'}
                      </p>
                    </div>

                    <button 
                      className="w-full flex items-center justify-center gap-2 py-3 bg-[#431872] hover:bg-[#3B1C71] text-white rounded-xl text-sm font-extrabold transition-all active:scale-95 shadow-md shadow-purple-900/20 group-hover:shadow-purple-900/30"
                      onClick={() => window.location.href = `/dashboard/chat/${session.id}`}
                    >
                      Enter Chat <ChevronRight size={16} />
                    </button>
                  </div>
                ))}

                {/* Pending Requests */}
                {pendingRequests.map(session => (
                  <div key={session.id} className="group bg-white rounded-[1.5rem] p-5 border border-amber-200/60 shadow-sm hover:shadow-md hover:border-amber-400/50 transition-all duration-300 relative overflow-hidden bg-linear-to-br from-white to-amber-50/30">
                    <div className="absolute top-0 left-0 w-1 h-full bg-amber-400" />
                    
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3.5">
                        <div className="w-11 h-11 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center font-black text-sm shadow-inner border border-amber-200/50 animate-pulse">
                          <User size={20} />
                        </div>
                        <div>
                          <p className="text-base font-extrabold text-slate-900 tracking-tight">New Request</p>
                          <p className="text-xs font-semibold text-slate-400 flex items-center gap-1.5 mt-0.5">
                            <Clock size={12} /> {format(new Date(session.createdAt), 'h:mm a')}
                          </p>
                        </div>
                      </div>
                      <span className="bg-amber-100 text-amber-700 text-[9px] font-black px-2.5 py-1 rounded-lg uppercase tracking-widest shadow-xs">
                        Waiting
                      </span>
                    </div>

                    <div className="bg-white rounded-xl p-3.5 border border-amber-100 mb-4 shadow-2xs">
                      <p className="text-sm text-slate-700 font-medium line-clamp-2 leading-relaxed">
                        <span className="font-bold text-slate-900 mr-2">Topic:</span>
                        {session.topic || 'General Support'}
                      </p>
                    </div>

                    <div className="flex gap-3">
                      <button 
                        className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-extrabold transition-all active:scale-95 shadow-md shadow-emerald-600/20" 
                        onClick={async () => {
                          try {
                            await apiClient.post(`/peerline/mentor/sessions/${session.id}/accept`);
                            toast.success('Chat request accepted!');
                            fetchData();
                          } catch (err) {
                            toast.error('Failed to accept request');
                          }
                        }}
                      >
                        Accept Request
                      </button>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>

        {/* Right Column: Past Chats */}
        <div className="md:col-span-5 space-y-6">
          <div className="flex items-center justify-between px-1">
            <h3 className="font-extrabold text-slate-800 text-lg flex items-center gap-2.5">
              <Clock size={20} className="text-slate-400" />
              History
            </h3>
          </div>

          <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100/80 overflow-hidden flex flex-col h-[500px]">
            <div className="p-4 flex-1 overflow-y-auto custom-scrollbar">
              {pastSessions.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6">
                  <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 mb-3 shadow-inner">
                    <Clock size={24} />
                  </div>
                  <p className="text-sm font-bold text-slate-400">No past chats yet.</p>
                </div>
              ) : (
                <div className="space-y-3 pr-1">
                  {pastSessions.map(session => (
                    <div key={session.id} className="p-4 rounded-[1.25rem] border border-slate-100/80 bg-slate-50/50 hover:bg-slate-50 transition-colors group">
                      <div className="flex justify-between items-start mb-2.5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 text-slate-400 flex items-center justify-center font-bold text-xs shadow-xs group-hover:scale-105 transition-transform">
                            <User size={14} />
                          </div>
                          <div>
                            <p className="text-sm font-extrabold text-slate-700">Chat Session</p>
                            <p className="text-[11px] font-semibold text-slate-400">
                              {format(new Date(session.createdAt), 'MMM d, yyyy')}
                            </p>
                          </div>
                        </div>
                        <span className={`text-[9px] font-black px-2 py-1 rounded-lg uppercase tracking-widest shadow-xs ${
                          session.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-slate-100 text-slate-500 border border-slate-200'
                        }`}>
                          {session.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 line-clamp-1 font-medium bg-white p-2.5 rounded-lg border border-slate-100">
                        {session.topic || 'General Support'}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {pastSessions.length > 0 && (
              <div className="p-4 border-t border-slate-100 bg-slate-50/50 text-center">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Showing {pastSessions.length} total sessions
                </p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
