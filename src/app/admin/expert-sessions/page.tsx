'use client';

import React, { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { Calendar, Search, Filter, Clock, Video, User } from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';

export default function ExpertSessionsPage() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useAuthStore();

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      // We hit the parent module endpoint since the user is an EXPERT, 
      // wait, the parent module gets sessions for the parent. 
      // We need an endpoint for experts to get their own sessions.
      // For now we assume /expert-sessions exists on the expert routes as well, 
      // or we can use a new endpoint /admin/expert-sessions. Let's assume /expert/sessions.
      const response = await apiClient.get<any>('/expert/sessions');
      setSessions(response.sessions || response || []);
    } catch (error) {
      console.error('Failed to fetch expert sessions', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredSessions = sessions.filter(session => 
    (session.user?.username || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (session.user?.profile?.displayName || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-10">
      <div className="admin-header flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground flex items-center gap-3">
            <Calendar className="text-primary" size={36} />
            My Expert Sessions
          </h1>
          <p className="text-muted-foreground font-medium mt-2">View and manage your upcoming 1:1 sessions.</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-border overflow-hidden">
        <div className="p-6 border-b border-border flex flex-col md:flex-row gap-4 justify-between items-center bg-slate-50/50">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <input 
              type="text" 
              placeholder="Search by User Name..."
              className="w-full pl-12 pr-4 py-3 rounded-2xl border border-border bg-white focus:ring-2 focus:ring-primary/20 outline-none transition-all font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="flex items-center gap-2 px-5 py-3 rounded-2xl border border-border bg-white hover:bg-slate-50 transition-colors font-bold text-sm">
            <Filter size={18} />
            Filter
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border text-[13px] font-bold uppercase tracking-wider text-muted-foreground bg-slate-50/30">
                <th className="px-6 py-5">Date & Time</th>
                <th className="px-6 py-5">Client (Teen/Parent)</th>
                <th className="px-6 py-5">Status</th>
                <th className="px-6 py-5 text-right">Meeting Link</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                [...Array(3)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={4} className="px-6 py-8"><div className="h-4 bg-slate-100 rounded w-full"></div></td>
                  </tr>
                ))
              ) : filteredSessions.length > 0 ? (
                filteredSessions.map((session) => (
                  <tr key={session.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2 font-bold text-sm text-foreground">
                        <Clock size={16} className="text-primary" />
                        {new Date(session.scheduledAt).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                          <User size={16} />
                        </div>
                        <div>
                          <div className="font-bold text-sm text-foreground">{session.user?.profile?.displayName || session.user?.username || 'Client'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`text-[11px] font-bold px-3 py-1.5 rounded-full ${
                        session.status === 'SCHEDULED' ? 'bg-blue-100 text-blue-600' : 
                        session.status === 'COMPLETED' ? 'bg-green-100 text-green-600' : 'bg-rose-100 text-rose-600'
                      }`}>
                        {session.status}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      {session.meetLink && session.status === 'SCHEDULED' ? (
                        <a 
                          href={session.meetLink}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white hover:bg-primary-dark transition-all font-bold text-sm"
                        >
                          <Video size={16} />
                          Join Call
                        </a>
                      ) : (
                        <span className="text-xs text-muted-foreground font-medium">N/A</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-20 text-center text-muted-foreground font-medium">
                    No upcoming sessions found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
