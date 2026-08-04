'use client';

import React, { useState, useEffect, useRef } from 'react';
import { apiClient } from '@/lib/api-client';
import {
  Calendar, Search, Clock, Video,
  Link2, CheckCircle2, AlertCircle, Pencil, X, Loader2,
  ChevronDown, RefreshCw, CalendarCheck, Check
} from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';
import { toast } from 'react-hot-toast';

interface SessionUser {
  id?: string;
  username: string;
  role?: string;
  profile?: { displayName?: string };
}

interface SessionExpert {
  id?: string;
  username: string;
  profile?: { displayName?: string; specialisation?: string; consultationPrice?: number | null };
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
  programId?: string | null;
  createdAt: string;
  amount?: number | null;
  razorpayPaymentId?: string | null;
  razorpayOrderId?: string | null;
}

const STATUS_META: Record<string, { label: string; dot: string; pill: string }> = {
  SCHEDULED: {
    label: 'Scheduled',
    dot: 'bg-indigo-500 animate-pulse',
    pill: 'bg-indigo-50 text-indigo-750 border border-indigo-200/80',
  },
  RESCHEDULED: {
    label: 'Rescheduled',
    dot: 'bg-amber-500 animate-pulse',
    pill: 'bg-amber-50 text-amber-700 border border-amber-200/80',
  },
  COMPLETED: {
    label: 'Completed',
    dot: 'bg-emerald-500',
    pill: 'bg-emerald-50 text-emerald-700 border border-emerald-200/80',
  },
  CANCELLED: {
    label: 'Cancelled',
    dot: 'bg-rose-450',
    pill: 'bg-rose-50 text-rose-700 border border-rose-200/80',
  },
};

function Avatar({ name }: { name: string }) {
  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  return (
    <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-xs font-black shrink-0 bg-indigo-50 text-indigo-700 border border-indigo-100">
      {initials || '?'}
    </div>
  );
}

export default function ExpertConsultationsPage() {
  const [sessions, setSessions] = useState<ExpertSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);
  
  // Date range filter
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [dateDropdownOpen, setDateDropdownOpen] = useState(false);
  const dateDropdownRef = useRef<HTMLDivElement>(null);
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  const { user } = useAuthStore();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [linkInput, setLinkInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState('');

  // Reschedule states
  const [reschedulingId, setReschedulingId] = useState<string | null>(null);
  const [newScheduleInput, setNewScheduleInput] = useState('');
  const [rescheduleSaving, setRescheduleSaving] = useState(false);
  const [rescheduleError, setRescheduleError] = useState('');
  const [rescheduleSuccess, setRescheduleSuccess] = useState('');

  useEffect(() => { fetchSessions(); }, [user]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) setFilterOpen(false);
      if (dateDropdownRef.current && !dateDropdownRef.current.contains(e.target as Node)) setDateDropdownOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const fetchSessions = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const response = await apiClient.get<ExpertSession[]>('/expert/sessions');
      const allFetched = Array.isArray(response) ? response : [];
      // Keep only paid 1:1 sessions (exclude program-benefit consultations)
      const directPaidSessions = allFetched.filter(s => !s.programId);
      setSessions(directPaidSessions);
    } catch (error) {
      console.error('Failed to fetch expert sessions', error);
      setSessions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (sessionId: string, newStatus: string) => {
    try {
      await apiClient.patch(`/expert/sessions/${sessionId}/status`, { status: newStatus });
      setSessions(prev => prev.map(s => s.id === sessionId ? { ...s, status: newStatus } : s));
      toast.success(`Session status updated to ${newStatus}`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update status.');
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
      await apiClient.patch(`/expert/sessions/${sessionId}/meet-link`, { meetLink: trimmed });
      setSessions(prev => prev.map(s => s.id === sessionId ? { ...s, meetLink: trimmed } : s));
      setSaveSuccess('Saved!');
      toast.success("Meeting link saved successfully!");
      setTimeout(() => { setEditingId(null); setSaveSuccess(''); }, 1000);
    } catch (err: any) {
      setSaveError(err.message || 'Failed to save.');
    } finally {
      setSaving(false);
    }
  };

  const formatForDatetimeLocal = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    } catch {
      return '';
    }
  };

  const startReschedule = (session: ExpertSession) => {
    setReschedulingId(session.id);
    setNewScheduleInput(formatForDatetimeLocal(session.scheduledAt));
    setRescheduleError('');
    setRescheduleSuccess('');
  };

  const cancelReschedule = () => {
    setReschedulingId(null);
    setNewScheduleInput('');
    setRescheduleError('');
    setRescheduleSuccess('');
  };

  const handleSaveReschedule = async (sessionId: string) => {
    if (!newScheduleInput) {
      setRescheduleError('Please select a date and time.');
      return;
    }
    const selectedDate = new Date(newScheduleInput);
    if (isNaN(selectedDate.getTime())) {
      setRescheduleError('Invalid date or time.');
      return;
    }

    setRescheduleSaving(true);
    setRescheduleError('');
    try {
      await apiClient.patch(`/expert/sessions/${sessionId}/reschedule`, { scheduledAt: selectedDate.toISOString() });
      setSessions(prev => prev.map(s => s.id === sessionId ? { ...s, scheduledAt: selectedDate.toISOString(), status: 'RESCHEDULED' } : s));
      setRescheduleSuccess('Rescheduled!');
      toast.success("Session rescheduled successfully!");
      setTimeout(() => {
        setReschedulingId(null);
        setRescheduleSuccess('');
      }, 1000);
    } catch (err: any) {
      setRescheduleError(err.message || 'Failed to reschedule.');
    } finally {
      setRescheduleSaving(false);
    }
  };

  const filterByDate = (sessionDateStr: string) => {
    const sessionDate = new Date(sessionDateStr);
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    
    switch (dateFilter) {
      case 'today':
        return sessionDate >= startOfToday && sessionDate <= endOfToday;
      case 'yesterday': {
        const startOfYesterday = new Date(startOfToday);
        startOfYesterday.setDate(startOfYesterday.getDate() - 1);
        const endOfYesterday = new Date(endOfToday);
        endOfYesterday.setDate(endOfYesterday.getDate() - 1);
        return sessionDate >= startOfYesterday && sessionDate <= endOfYesterday;
      }
      case '7days': {
        const sevenDaysAgo = new Date(startOfToday);
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        return sessionDate >= sevenDaysAgo;
      }
      case '30days': {
        const thirtyDaysAgo = new Date(startOfToday);
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return sessionDate >= thirtyDaysAgo;
      }
      case 'thisMonth': {
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        return sessionDate >= startOfMonth;
      }
      case 'custom': {
        let match = true;
        if (customStartDate) {
          const start = new Date(customStartDate);
          start.setHours(0, 0, 0, 0);
          match = match && sessionDate >= start;
        }
        if (customEndDate) {
          const end = new Date(customEndDate);
          end.setHours(23, 59, 59, 999);
          match = match && sessionDate <= end;
        }
        return match;
      }
      case 'all':
      default:
        return true;
    }
  };

  const dateFilteredSessions = sessions.filter(s => filterByDate(s.createdAt));

  const finalFilteredSessions = dateFilteredSessions.filter(s => {
    const clientName = s.user?.profile?.displayName || s.user?.username || '';
    const q = searchTerm.toLowerCase();
    const matchSearch = !q || clientName.toLowerCase().includes(q);
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

  // Top Card stats calculated based on Date Filter
  const totalSessionsCount = dateFilteredSessions.length;
  const totalScheduled = dateFilteredSessions.filter(s => s.status === 'SCHEDULED' || s.status === 'RESCHEDULED').length;
  const missingLinks = dateFilteredSessions.filter(s => (s.status === 'SCHEDULED' || s.status === 'RESCHEDULED') && !s.meetLink).length;
  const linkCount = dateFilteredSessions.filter(s => s.meetLink).length;

  const DATE_FILTER_LABELS: Record<string, string> = {
    all: 'All Time',
    today: 'Today',
    yesterday: 'Yesterday',
    '7days': 'Last 7 Days',
    '30days': 'Last 30 Days',
    thisMonth: 'This Month',
    custom: 'Custom Range'
  };

  return (
    <div className="space-y-6 w-full max-w-7xl mx-auto pb-8 font-sans">

      {/* Header */}
      <div className="flex flex-col bg-white p-6 rounded-[2rem] border border-slate-100 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-slate-800 flex items-center gap-2.5">
              <span className="w-9 h-9 rounded-2xl bg-indigo-50 flex items-center justify-center shrink-0 border border-indigo-100">
                <CalendarCheck size={18} className="text-indigo-600" />
              </span>
              My Consultations
            </h1>
            <p className="text-slate-500 text-xs font-semibold mt-1">
              Manage your booked 1:1 client consultations, set video links, and review session statuses.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-auto">
            {/* Date Filter Dropdown */}
            <div className="relative" ref={dateDropdownRef}>
              <button
                onClick={() => setDateDropdownOpen(!dateDropdownOpen)}
                className="flex items-center justify-between gap-2.5 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition-all shadow-sm cursor-pointer"
              >
                <Calendar size={14} className="text-slate-500" />
                <span>{DATE_FILTER_LABELS[dateFilter] || 'Select Date'}</span>
                <ChevronDown size={14} className={`transition-transform duration-200 ${dateDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {dateDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-100 rounded-2xl shadow-xl z-30 p-2 space-y-1 animate-in fade-in slide-in-from-top-3 duration-200">
                  {Object.entries(DATE_FILTER_LABELS).map(([key, label]) => (
                    <button
                      key={key}
                      onClick={() => {
                        setDateFilter(key);
                        if (key !== 'custom') {
                          setDateDropdownOpen(false);
                        }
                      }}
                      className={`w-full text-left px-3.5 py-2 rounded-xl text-xs font-bold flex items-center justify-between transition-colors ${
                        dateFilter === key 
                          ? 'text-indigo-600 bg-indigo-50/50' 
                          : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span>{label}</span>
                      {dateFilter === key && <Check size={14} className="text-indigo-600" />}
                    </button>
                  ))}

                  {dateFilter === 'custom' && (
                    <div className="p-3 border-t border-slate-100 space-y-3 bg-slate-50/50 rounded-xl mt-1.5">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Start Date</label>
                        <input
                          type="date"
                          value={customStartDate}
                          onChange={e => setCustomStartDate(e.target.value)}
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white outline-none focus:border-indigo-400"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">End Date</label>
                        <input
                          type="date"
                          value={customEndDate}
                          onChange={e => setCustomEndDate(e.target.value)}
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white outline-none focus:border-indigo-400"
                        />
                      </div>
                      <button
                        onClick={() => setDateDropdownOpen(false)}
                        className="w-full py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-black hover:bg-indigo-700 transition-all shadow-sm cursor-pointer"
                      >
                        Apply Filter
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Refresh Button */}
            <button
              onClick={fetchSessions}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-600 transition-all shadow-sm cursor-pointer"
            >
              <RefreshCw size={14} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Stat Cards Block */}
      <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
        {[
          { label: 'Total Consultations', value: totalSessionsCount, icon: CalendarCheck, color: 'text-slate-600 bg-slate-50 border-slate-100' },
          { label: 'Upcoming', value: totalScheduled, icon: Clock, color: 'text-indigo-600 bg-indigo-50 border-indigo-100' },
          { label: 'Need a Link', value: missingLinks, icon: Link2, color: missingLinks > 0 ? 'text-amber-600 bg-amber-50 border-amber-100' : 'text-slate-400 bg-slate-50 border-slate-100' },
          { label: 'Linked Meetings', value: linkCount, icon: Video, color: 'text-emerald-600 bg-emerald-50 border-emerald-100' }
        ].map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="bg-white border border-slate-100 rounded-3xl p-5 shadow-2xs hover:shadow-sm transition-shadow relative overflow-hidden group">
              <div className="flex items-center justify-between">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border ${stat.color}`}>
                  <Icon size={18} />
                </div>
              </div>
              <div className="mt-4">
                <div className="text-2xl font-black text-slate-800 tracking-tight leading-none">
                  {stat.value}
                </div>
                <div className="text-[10px] font-bold mt-1.5 text-slate-400 uppercase tracking-widest">
                  {stat.label}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Consultations List */}
      <div className="bg-white border border-slate-100 rounded-[2rem] shadow-2xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center">
          {/* Search bar */}
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input
              type="text"
              placeholder="Search by client name..."
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500/30 outline-none text-xs font-semibold transition-all"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Status filter pillbox */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <button
              onClick={() => setStatusFilter('')}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                statusFilter === '' 
                  ? 'bg-slate-900 text-white shadow-xs' 
                  : 'bg-slate-55 border border-slate-200/60 text-slate-655 hover:bg-slate-100'
              }`}
            >
              All Statuses
            </button>
            {Object.entries(STATUS_META).map(([key, meta]) => (
              <button
                key={key}
                onClick={() => setStatusFilter(key)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  statusFilter === key 
                    ? 'bg-indigo-600 text-white shadow-xs' 
                    : 'bg-slate-50 border border-slate-200/60 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {meta.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="animate-spin text-indigo-600" size={32} />
            <p className="text-slate-400 text-xs font-bold">Fetching sessions list...</p>
          </div>
        ) : finalFilteredSessions.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-14 h-14 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-4 border border-slate-100">
              <CalendarCheck className="text-slate-400" size={22} />
            </div>
            <h4 className="font-bold text-slate-700">No consultations found</h4>
            <p className="text-xs text-slate-400 mt-1.5 max-w-sm mx-auto font-medium">
              {searchTerm || statusFilter 
                ? 'Try clearing search keywords or filters to see all bookings.' 
                : 'When clients book slots, they will appear in this consultations workspace.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <th className="py-4 px-6">Client / Booking</th>
                  <th className="py-4 px-6">Date & Time</th>
                  <th className="py-4 px-6">Video Meeting Link</th>
                  <th className="py-4 px-6 text-center">Status</th>
                  <th className="py-4 px-6 text-right">Quick Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/80 text-xs font-semibold text-slate-700">
                {finalFilteredSessions.map(session => {
                  const clientName = session.user?.profile?.displayName || session.user?.username || 'Client';
                  const isEditing = editingId === session.id;
                  const isRescheduling = reschedulingId === session.id;
                  const isUpcoming = session.status === 'SCHEDULED' || session.status === 'RESCHEDULED';
                  const dateFmt = fmt(session.scheduledAt);
                  const meta = STATUS_META[session.status] || { label: session.status, dot: 'bg-slate-400', pill: 'bg-slate-50 text-slate-500' };

                  return (
                    <tr key={session.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-5 px-6">
                        <div className="flex items-center gap-3">
                          <Avatar name={clientName} />
                          <div>
                            <div className="font-extrabold text-slate-800 text-sm">{clientName}</div>
                            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Booking ID: {session.id.slice(-8).toUpperCase()}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-5 px-6">
                        {isRescheduling ? (
                          <div className="flex flex-col gap-2 max-w-44">
                            <input
                              type="datetime-local"
                              value={newScheduleInput}
                              onChange={e => setNewScheduleInput(e.target.value)}
                              className="px-2 py-1 border border-slate-200 rounded-lg outline-none text-xs"
                            />
                            {rescheduleError && <span className="text-[10px] text-rose-500 font-bold leading-tight">{rescheduleError}</span>}
                            {rescheduleSuccess && <span className="text-[10px] text-emerald-500 font-bold leading-tight">{rescheduleSuccess}</span>}
                            <div className="flex gap-1.5">
                              <button
                                onClick={() => handleSaveReschedule(session.id)}
                                disabled={rescheduleSaving}
                                className="flex-1 py-1 bg-indigo-600 text-white rounded-md text-[10px] font-black hover:bg-indigo-700 cursor-pointer"
                              >
                                {rescheduleSaving ? '...' : 'Save'}
                              </button>
                              <button
                                onClick={cancelReschedule}
                                className="flex-1 py-1 border border-slate-200 rounded-md text-[10px] font-black hover:bg-slate-50 text-slate-600 cursor-pointer"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 font-extrabold text-slate-800">
                              <span>{dateFmt.date}</span>
                              <span className="text-[10px] text-slate-400 font-black tracking-wider uppercase bg-slate-50 px-1.5 py-0.5 rounded-sm">
                                {dateFmt.day}
                              </span>
                            </div>
                            <div className="flex items-center gap-1 text-slate-400 text-[11px] font-bold">
                              <Clock size={11} /> {dateFmt.time}
                            </div>
                          </div>
                        )}
                      </td>
                      <td className="py-5 px-6">
                        {isEditing ? (
                          <div className="flex flex-col gap-2 max-w-xs">
                            <input
                              type="text"
                              value={linkInput}
                              onChange={e => setLinkInput(e.target.value)}
                              placeholder="Enter Zoom or Meet link"
                              className="px-3 py-1.5 border border-slate-200 rounded-lg outline-none text-xs focus:border-indigo-400"
                            />
                            {saveError && <span className="text-[10px] text-rose-500 font-bold leading-tight">{saveError}</span>}
                            {saveSuccess && <span className="text-[10px] text-emerald-500 font-bold leading-tight">{saveSuccess}</span>}
                            <div className="flex gap-1.5">
                              <button
                                onClick={() => handleSaveMeetLink(session.id)}
                                disabled={saving}
                                className="flex-1 py-1.5 bg-indigo-600 text-white rounded-md text-[10px] font-black hover:bg-indigo-700 cursor-pointer"
                              >
                                {saving ? 'Saving...' : 'Save'}
                              </button>
                              <button
                                onClick={cancelEdit}
                                className="flex-1 py-1.5 border border-slate-200 rounded-md text-[10px] font-black hover:bg-slate-50 text-slate-600 cursor-pointer"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            {session.meetLink ? (
                              <a
                                href={session.meetLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 text-indigo-600 hover:text-indigo-800 font-bold hover:underline"
                              >
                                <Video size={13} className="shrink-0" />
                                <span className="max-w-[160px] truncate">{session.meetLink}</span>
                              </a>
                            ) : (
                              <span className="text-slate-400 flex items-center gap-1 italic">
                                <Link2 size={13} /> Link not added
                              </span>
                            )}
                            {isUpcoming && (
                              <button
                                onClick={() => startEdit(session)}
                                className="p-1 text-slate-400 hover:text-indigo-600 rounded-md hover:bg-slate-55 transition-colors cursor-pointer"
                                title="Edit meeting link"
                              >
                                <Pencil size={12} />
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="py-5 px-6 text-center">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${meta.pill}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
                          {meta.label}
                        </span>
                      </td>
                      <td className="py-5 px-6 text-right">
                        {isUpcoming ? (
                          <div className="flex items-center justify-end gap-2.5">
                            <button
                              onClick={() => startReschedule(session)}
                              className="px-2.5 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-slate-800 rounded-lg transition-colors cursor-pointer text-[10px] font-black"
                            >
                              Reschedule
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(session.id, 'COMPLETED')}
                              className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors cursor-pointer text-[10px] font-black shadow-2xs"
                            >
                              Complete
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(session.id, 'CANCELLED')}
                              className="px-2.5 py-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 hover:text-rose-700 rounded-lg transition-colors cursor-pointer text-[10px] font-black"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider pr-2 select-none">No actions</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
