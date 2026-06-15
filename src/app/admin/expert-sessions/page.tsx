'use client';

import React, { useState, useEffect, useRef } from 'react';
import { apiClient } from '@/lib/api-client';
import {
  Calendar, Search, Clock, Video,
  Link2, CheckCircle2, AlertCircle, Pencil, X, Loader2,
  ChevronDown, RefreshCw, Users, CalendarCheck
} from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';

interface SessionUser {
  id?: string;
  username: string;
  role?: string;
  profile?: { displayName?: string };
}

interface SessionExpert {
  id?: string;
  username: string;
  profile?: { displayName?: string; specialisation?: string };
}

interface ExpertSession {
  id: string;
  scheduledAt: string;
  status: string;
  meetLink?: string | null;
  sessionNumber?: number | null;
  user: SessionUser;
  expert?: SessionExpert;
  program?: { id: string; title: string } | null;
}

const STATUS_META: Record<string, { label: string; dot: string; pill: string }> = {
  SCHEDULED: {
    label: 'Scheduled',
    dot: 'bg-blue-500 animate-pulse',
    pill: 'bg-blue-50 text-blue-700 border border-blue-200',
  },
  COMPLETED: {
    label: 'Completed',
    dot: 'bg-emerald-500',
    pill: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  },
  CANCELLED: {
    label: 'Cancelled',
    dot: 'bg-rose-400',
    pill: 'bg-rose-50 text-rose-700 border border-rose-200',
  },
};

function Avatar({ name, color = 'slate' }: { name: string; color?: 'slate' | 'indigo' | 'violet' }) {
  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const colors = {
    slate: 'bg-slate-100 text-slate-600',
    indigo: 'bg-indigo-100 text-indigo-700',
    violet: 'bg-violet-100 text-violet-700',
  };
  return (
    <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black shrink-0 ${colors[color]}`}>
      {initials || '?'}
    </div>
  );
}

export default function ExpertSessionsPage() {
  const [sessions, setSessions] = useState<ExpertSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);
  const { user } = useAuthStore();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [linkInput, setLinkInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState('');

  const isAdmin = user?.role === 'ADMIN';

  useEffect(() => { fetchSessions(); }, [user]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) setFilterOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const fetchSessions = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const endpoint = isAdmin ? '/admin/expert-sessions' : '/expert/sessions';
      const response = await apiClient.get<ExpertSession[]>(endpoint);
      setSessions(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error('Failed to fetch expert sessions', error);
      setSessions([]);
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (session: ExpertSession) => {
    setEditingId(session.id);
    setLinkInput(session.meetLink || '');
    setSaveError('');
    setSaveSuccess('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setLinkInput('');
    setSaveError('');
    setSaveSuccess('');
  };

  const handleSaveMeetLink = async (sessionId: string) => {
    const trimmed = linkInput.trim();
    if (!trimmed) { setSaveError('Please enter a meeting link.'); return; }
    try { new URL(trimmed); } catch { setSaveError('Please enter a valid URL.'); return; }

    setSaving(true);
    setSaveError('');
    try {
      const endpoint = isAdmin
        ? `/admin/expert-sessions/${sessionId}/meet-link`
        : `/expert/sessions/${sessionId}/meet-link`;
      await apiClient.patch(endpoint, { meetLink: trimmed });
      setSessions(prev => prev.map(s => s.id === sessionId ? { ...s, meetLink: trimmed } : s));
      setSaveSuccess('Saved!');
      setTimeout(() => { setEditingId(null); setSaveSuccess(''); }, 1000);
    } catch (err: any) {
      setSaveError(err.message || 'Failed to save.');
    } finally {
      setSaving(false);
    }
  };

  const filteredSessions = sessions.filter(s => {
    const client = s.user?.profile?.displayName || s.user?.username || '';
    const expert = s.expert?.profile?.displayName || s.expert?.username || '';
    const q = searchTerm.toLowerCase();
    const matchSearch = !q || client.toLowerCase().includes(q) || expert.toLowerCase().includes(q);
    const matchStatus = !statusFilter || s.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const fmt = (iso: string) => {
    const d = new Date(iso);
    return {
      date: d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
      day: d.toLocaleDateString('en-IN', { weekday: 'short' }),
      time: d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
    };
  };

  const totalScheduled = sessions.filter(s => s.status === 'SCHEDULED').length;
  const missingLinks = sessions.filter(s => s.status === 'SCHEDULED' && !s.meetLink).length;
  const linkCount = sessions.filter(s => s.meetLink).length;

  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2.5">
            <span className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
              <CalendarCheck size={22} className="text-primary" />
            </span>
            {isAdmin ? 'All Expert Sessions' : 'My Expert Sessions'}
          </h1>
          <p className="text-muted-foreground text-sm font-medium mt-1.5 ml-[52px]">
            {isAdmin ? 'View all booked sessions and assign meeting links.' : 'Manage your booked 1:1 sessions and add meeting links.'}
          </p>
        </div>

        <button
          onClick={fetchSessions}
          className="self-start sm:self-auto flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-white hover:bg-slate-50 text-sm font-semibold text-slate-600 transition-all shadow-sm"
        >
          <RefreshCw size={15} />
          Refresh
        </button>
      </div>

      {/* ── Stat Pills ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Sessions', value: sessions.length, icon: Users, bg: 'bg-white border-border', val: 'text-foreground', sub: 'text-muted-foreground' },
          { label: 'Upcoming', value: totalScheduled, icon: Clock, bg: 'bg-blue-50 border-blue-200', val: 'text-blue-700', sub: 'text-blue-400' },
          { label: 'Need a Link', value: missingLinks, icon: Link2, bg: missingLinks > 0 ? 'bg-amber-50 border-amber-200' : 'bg-slate-50 border-slate-200', val: missingLinks > 0 ? 'text-amber-700' : 'text-slate-400', sub: missingLinks > 0 ? 'text-amber-400' : 'text-slate-400' },
          { label: 'Links Set', value: linkCount, icon: Video, bg: 'bg-emerald-50 border-emerald-200', val: 'text-emerald-700', sub: 'text-emerald-400' },
        ].map(({ label, value, icon: Icon, bg, val, sub }) => (
          <div key={label} className={`${bg} border rounded-2xl px-5 py-4 flex items-center gap-4 shadow-sm`}>
            <Icon size={20} className={val} />
            <div>
              <div className={`text-2xl font-black leading-none ${val}`}>{value}</div>
              <div className={`text-[11px] font-semibold mt-0.5 ${sub}`}>{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Toolbar ── */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder={isAdmin ? 'Search by client or expert name…' : 'Search by client name…'}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary/40 outline-none text-sm font-medium transition-all"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="relative" ref={filterRef}>
          <button
            onClick={() => setFilterOpen(!filterOpen)}
            className="w-full sm:w-auto flex items-center justify-between gap-2 px-4 py-2.5 rounded-xl border border-border bg-white hover:bg-slate-50 text-sm font-semibold text-slate-700 transition-all"
          >
            <span className="flex items-center gap-2">
              {statusFilter ? (
                <span className={`w-2 h-2 rounded-full ${STATUS_META[statusFilter]?.dot || 'bg-slate-400'}`} />
              ) : (
                <span className="w-2 h-2 rounded-full bg-slate-300" />
              )}
              {statusFilter ? STATUS_META[statusFilter]?.label : 'All Statuses'}
            </span>
            <ChevronDown size={15} className={`transition-transform ${filterOpen ? 'rotate-180' : ''}`} />
          </button>
          {filterOpen && (
            <div className="absolute right-0 mt-1.5 w-44 bg-white border border-border rounded-xl shadow-xl z-20 overflow-hidden py-1">
              {['', 'SCHEDULED', 'COMPLETED', 'CANCELLED'].map(s => (
                <button
                  key={s}
                  onClick={() => { setStatusFilter(s); setFilterOpen(false); }}
                  className={`w-full text-left px-4 py-2 text-sm font-semibold flex items-center gap-2.5 hover:bg-slate-50 transition-colors ${statusFilter === s ? 'text-primary' : 'text-slate-600'}`}
                >
                  <span className={`w-2 h-2 rounded-full ${s ? STATUS_META[s]?.dot : 'bg-slate-300'}`} />
                  {s ? STATUS_META[s]?.label : 'All Statuses'}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Session Cards ── */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-border p-5 animate-pulse">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 shrink-0" />
                  <div className="space-y-2 flex-1">
                    <div className="h-3.5 bg-slate-100 rounded-full w-1/3" />
                    <div className="h-3 bg-slate-100 rounded-full w-1/4" />
                  </div>
                </div>
                <div className="h-8 bg-slate-100 rounded-xl w-28" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredSessions.length === 0 ? (
        <div className="bg-white rounded-2xl border border-border p-16 text-center shadow-sm">
          <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <Calendar size={24} className="text-slate-400" />
          </div>
          <p className="font-bold text-slate-600 text-base">No sessions found</p>
          <p className="text-sm text-muted-foreground mt-1.5">
            {searchTerm || statusFilter ? 'Try adjusting your search or filter.' : 'No expert sessions have been booked yet.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Column Headers */}
          <div className="hidden lg:grid grid-cols-12 gap-4 px-5 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
            <div className="col-span-2">Date & Time</div>
            <div className={isAdmin ? "col-span-3" : "col-span-6"}>Client</div>
            {isAdmin && <div className="col-span-3">Expert</div>}
            <div className="col-span-2">Status</div>
            <div className="col-span-2">Meeting Link</div>
          </div>

          {filteredSessions.map(session => {
            const { date, day, time } = fmt(session.scheduledAt);
            const isEditing = editingId === session.id;
            const clientName = session.user?.profile?.displayName || session.user?.username || 'Client';
            const expertName = session.expert?.profile?.displayName || session.expert?.username || 'Expert';
            const statusMeta = STATUS_META[session.status] || { label: session.status, dot: 'bg-slate-400', pill: 'bg-slate-100 text-slate-600 border border-slate-200' };
            const isPast = session.status !== 'SCHEDULED';

            return (
              <div
                key={session.id}
                className={`bg-white rounded-2xl border transition-all duration-200 shadow-sm hover:shadow-md group ${isPast ? 'border-border opacity-80' : 'border-border hover:border-primary/20'}`}
              >
                <div className="p-5 flex flex-col lg:grid lg:grid-cols-12 lg:items-center gap-5">

                  {/* ── Date block ── */}
                  <div className="lg:col-span-2 flex items-center gap-4 shrink-0">
                    <div className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center shrink-0 ${isPast ? 'bg-slate-100' : 'bg-primary/10'}`}>
                      <span className={`text-[10px] font-black uppercase tracking-wider ${isPast ? 'text-slate-400' : 'text-primary/70'}`}>{day}</span>
                      <span className={`text-xl font-black leading-tight ${isPast ? 'text-slate-500' : 'text-primary'}`}>
                        {new Date(session.scheduledAt).getDate()}
                      </span>
                    </div>
                    <div>
                      <div className="font-bold text-sm text-foreground">{date}</div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <Clock size={12} className="text-muted-foreground" />
                        <span className="text-xs font-semibold text-muted-foreground">{time}</span>
                      </div>
                    </div>
                  </div>

                  {/* ── Client column ── */}
                  <div className={`${isAdmin ? "lg:col-span-3" : "lg:col-span-6"} flex items-center gap-2.5 min-w-0`}>
                    <Avatar name={clientName} color="slate" />
                    <div className="min-w-0">
                      <div className="lg:hidden text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5">Client</div>
                      <div className="font-bold text-sm text-foreground truncate">{clientName}</div>
                      {session.user?.role && (
                        <div className="text-[11px] text-muted-foreground font-medium capitalize">{session.user.role.toLowerCase()}</div>
                      )}
                    </div>
                  </div>

                  {/* ── Expert column ── */}
                  {isAdmin && (
                    <div className="lg:col-span-3 flex items-center gap-2.5 min-w-0">
                      {session.expert ? (
                        <>
                          <Avatar name={expertName} color="indigo" />
                          <div className="min-w-0">
                            <div className="lg:hidden text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5">Expert</div>
                            <div className="font-bold text-sm text-foreground truncate">{expertName}</div>
                            {session.expert?.profile?.specialisation && (
                              <div className="text-[11px] text-muted-foreground font-medium truncate">{session.expert.profile.specialisation}</div>
                            )}
                          </div>
                        </>
                      ) : (
                        <span className="text-xs text-slate-400 font-semibold italic">Unassigned</span>
                      )}
                    </div>
                  )}

                  {/* ── Status pill ── */}
                  <div className="lg:col-span-2 shrink-0">
                    <div className="lg:hidden text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Status</div>
                    <span className={`inline-flex items-center gap-1.5 text-[11px] font-black px-3 py-1.5 rounded-full ${statusMeta.pill}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${statusMeta.dot}`} />
                      {statusMeta.label}
                    </span>
                  </div>

                  {/* ── Meeting Link ── */}
                  <div className="lg:col-span-2 shrink-0 min-w-[220px]">
                    <div className="lg:hidden text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Meeting Link</div>
                    {isEditing ? (
                      <div className="space-y-2">
                        <div className="flex items-center gap-1.5">
                          <div className="relative flex-1">
                            <Link2 className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={13} />
                            <input
                              autoFocus
                              type="url"
                              placeholder="https://meet.google.com/…"
                              value={linkInput}
                              onChange={e => { setLinkInput(e.target.value); setSaveError(''); }}
                              onKeyDown={e => {
                                if (e.key === 'Enter') handleSaveMeetLink(session.id);
                                if (e.key === 'Escape') cancelEdit();
                              }}
                              className="w-full pl-8 pr-2 py-1.5 text-xs font-medium border border-primary/40 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none bg-white"
                            />
                          </div>
                          <button
                            onClick={() => handleSaveMeetLink(session.id)}
                            disabled={saving}
                            className="p-1.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                            title="Save"
                          >
                            {saving ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="p-1.5 bg-slate-100 text-slate-500 rounded-lg hover:bg-slate-200 transition-colors"
                          >
                            <X size={14} />
                          </button>
                        </div>
                        {saveError && (
                          <div className="flex items-center gap-1 text-rose-600 text-[10px] font-semibold">
                            <AlertCircle size={11} /> {saveError}
                          </div>
                        )}
                        {saveSuccess && (
                          <div className="flex items-center gap-1 text-emerald-600 text-[10px] font-semibold">
                            <CheckCircle2 size={11} /> {saveSuccess}
                          </div>
                        )}
                      </div>
                    ) : session.meetLink ? (
                      <div className="flex items-center gap-2">
                        <a
                          href={session.meetLink}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary text-white hover:bg-primary/90 transition-all font-bold text-xs shadow-sm"
                        >
                          <Video size={13} />
                          Join Meeting
                        </a>
                        <button
                          onClick={() => startEdit(session)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-primary hover:bg-primary/5 transition-all opacity-0 group-hover:opacity-100"
                          title="Edit link"
                        >
                          <Pencil size={13} />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => startEdit(session)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-dashed border-primary/40 text-primary hover:bg-primary/5 transition-all font-bold text-xs"
                      >
                        <Link2 size={13} />
                        Add Meeting Link
                      </button>
                    )}
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Footer count ── */}
      {!loading && filteredSessions.length > 0 && (
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-semibold text-muted-foreground">
            {filteredSessions.length} of {sessions.length} sessions
          </span>
          {missingLinks > 0 && (
            <div className="flex items-center gap-1.5 text-amber-600 text-xs font-bold">
              <AlertCircle size={13} />
              {missingLinks} upcoming session{missingLinks > 1 ? 's' : ''} without a meeting link
            </div>
          )}
        </div>
      )}
    </div>
  );
}
