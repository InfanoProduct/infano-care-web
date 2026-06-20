'use client';

import React, { useState, useEffect, useRef } from 'react';
import { apiClient } from '@/lib/api-client';
import {
  Calendar, Search, Clock, Video,
  Link2, CheckCircle2, AlertCircle, Pencil, X, Loader2,
  ChevronDown, RefreshCw, Users, CalendarCheck, CreditCard,
  TrendingUp, Check, DollarSign
} from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';
import ManageExperts from '@/components/admin/experts/ManageExperts';

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
    dot: 'bg-blue-500 animate-pulse',
    pill: 'bg-blue-50 text-blue-700 border border-blue-200',
  },
  RESCHEDULED: {
    label: 'Rescheduled',
    dot: 'bg-amber-500 animate-pulse',
    pill: 'bg-amber-50 text-amber-700 border border-amber-200',
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

export default function ExpertConsultationsPage() {
  const [sessions, setSessions] = useState<ExpertSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<'sessions' | 'experts'>('sessions');
  
  // Date range filter
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [dateDropdownOpen, setDateDropdownOpen] = useState(false);
  const dateDropdownRef = useRef<HTMLDivElement>(null);
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  
  // Payment detail modal
  const [selectedPaymentSession, setSelectedPaymentSession] = useState<ExpertSession | null>(null);

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

  const isAdmin = user?.role === 'ADMIN';

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
      // Backend continues to serve at /admin/expert-sessions
      const endpoint = isAdmin ? '/admin/expert-sessions' : '/expert/sessions';
      const response = await apiClient.get<ExpertSession[]>(endpoint);
      const allFetched = Array.isArray(response) ? response : [];
      // Keep only paid 1:1 sessions (filter out program-benefit consultations)
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
      const endpoint = isAdmin 
        ? `/admin/expert-sessions/${sessionId}/status` 
        : `/expert/sessions/${sessionId}/status`;
      await apiClient.patch(endpoint, { status: newStatus });
      setSessions(prev => prev.map(s => s.id === sessionId ? { ...s, status: newStatus } : s));
    } catch (error: any) {
      alert(error.message || 'Failed to update status.');
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
      const endpoint = isAdmin
        ? `/admin/expert-sessions/${sessionId}/reschedule`
        : `/expert/sessions/${sessionId}/reschedule`;
      await apiClient.patch(endpoint, { scheduledAt: selectedDate.toISOString() });
      setSessions(prev => prev.map(s => s.id === sessionId ? { ...s, scheduledAt: selectedDate.toISOString(), status: 'RESCHEDULED' } : s));
      setRescheduleSuccess('Rescheduled!');
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

  // Date boundary check
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

  // Perform filtering (according to date of payment, i.e. createdAt)
  const dateFilteredSessions = sessions.filter(s => filterByDate(s.createdAt));

  const finalFilteredSessions = dateFilteredSessions.filter(s => {
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

  // Top Card stats calculated based on Date Filter
  const totalSessionsCount = dateFilteredSessions.length;
  const totalScheduled = dateFilteredSessions.filter(s => s.status === 'SCHEDULED' || s.status === 'RESCHEDULED').length;
  const missingLinks = dateFilteredSessions.filter(s => (s.status === 'SCHEDULED' || s.status === 'RESCHEDULED') && !s.meetLink).length;
  const linkCount = dateFilteredSessions.filter(s => s.meetLink).length;
  const totalRevenue = dateFilteredSessions.reduce((sum, s) => sum + (s.amount || s.expert?.profile?.consultationPrice || 500), 0);

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
    <div className="space-y-6">

      {/* ── Header ── */}
      <div className="flex flex-col gap-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          {isAdmin ? (
            <div className="flex bg-slate-100 p-1 rounded-xl self-start sm:self-auto">
              <button
                onClick={() => setActiveTab('sessions')}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                  activeTab === 'sessions' ? 'bg-white shadow-sm text-primary' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Consultations
              </button>
              <button
                onClick={() => setActiveTab('experts')}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                  activeTab === 'experts' ? 'bg-white shadow-sm text-primary' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Manage Experts
              </button>
            </div>
          ) : (
            <div />
          )}

          {activeTab === 'sessions' && (
            <div className="flex items-center gap-3 self-start sm:self-auto">
              {/* Date Filter Dropdown */}
              <div className="relative" ref={dateDropdownRef}>
                <button
                  onClick={() => setDateDropdownOpen(!dateDropdownOpen)}
                  className="flex items-center justify-between gap-2.5 px-4 py-2.5 rounded-xl border border-border bg-white hover:bg-slate-50 text-sm font-bold text-slate-700 transition-all shadow-sm"
                >
                  <Calendar size={15} className="text-slate-500" />
                  <span>{DATE_FILTER_LABELS[dateFilter] || 'Select Date'}</span>
                  <ChevronDown size={14} className={`transition-transform duration-200 ${dateDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {dateDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white border border-border rounded-2xl shadow-xl z-30 p-2 space-y-1 animate-in fade-in slide-in-from-top-3 duration-200">
                    {Object.entries(DATE_FILTER_LABELS).map(([key, label]) => (
                      <button
                        key={key}
                        onClick={() => {
                          setDateFilter(key);
                          if (key !== 'custom') {
                            setDateDropdownOpen(false);
                          }
                        }}
                        className={`w-full text-left px-3.5 py-2 rounded-xl text-sm font-semibold flex items-center justify-between transition-colors ${
                          dateFilter === key 
                            ? 'text-primary bg-primary/5' 
                            : 'text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <span>{label}</span>
                        {dateFilter === key && <Check size={14} className="text-primary" />}
                      </button>
                    ))}

                    {dateFilter === 'custom' && (
                      <div className="p-3 border-t border-slate-100 space-y-3.5 bg-slate-50/50 rounded-xl mt-1.5">
                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Start Date</label>
                          <input
                            type="date"
                            value={customStartDate}
                            onChange={e => setCustomStartDate(e.target.value)}
                            className="w-full px-3 py-1.5 rounded-lg border border-border text-xs bg-white outline-none focus:border-primary/50"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">End Date</label>
                          <input
                            type="date"
                            value={customEndDate}
                            onChange={e => setCustomEndDate(e.target.value)}
                            className="w-full px-3 py-1.5 rounded-lg border border-border text-xs bg-white outline-none focus:border-primary/50"
                          />
                        </div>
                        <button
                          onClick={() => setDateDropdownOpen(false)}
                          className="w-full py-1.5 bg-primary text-white rounded-lg text-xs font-black hover:bg-primary/95 transition-all shadow-sm"
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
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-white hover:bg-slate-50 text-sm font-semibold text-slate-600 transition-all shadow-sm"
              >
                <RefreshCw size={15} />
                Refresh
              </button>
            </div>
          )}
        </div>

        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2.5">
            <span className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
              {activeTab === 'experts' ? <Users size={22} className="text-primary" /> : <CalendarCheck size={22} className="text-primary" />}
            </span>
            {activeTab === 'experts' ? 'Manage Experts' : (isAdmin ? 'All Expert Consultations' : 'My Expert Consultations')}
          </h1>
          <p className="text-muted-foreground text-sm font-medium mt-1.5 ml-[52px]">
            {activeTab === 'experts' 
              ? 'Add, edit, or remove expert profiles and manage their details.'
              : (isAdmin ? 'View all booked consultations, view payments, and assign meeting links.' : 'Manage your booked 1:1 consultations and add meeting links.')}
          </p>
        </div>
      </div>

      {activeTab === 'experts' && isAdmin ? (
        <ManageExperts />
      ) : (
        <>
      {/* ── Stat Cards Block (with conditional admin revenue card) ── */}
      <div className={`grid gap-4 ${isAdmin ? 'grid-cols-2 sm:grid-cols-5' : 'grid-cols-2 sm:grid-cols-4'}`}>
        {/* Dynamic Admin Revenue Card */}
        {isAdmin && (
          <div className="bg-gradient-to-br from-violet-600 to-indigo-700 border-none rounded-3xl p-6 flex flex-col justify-between text-white shadow-lg shadow-indigo-600/10 min-h-[120px] relative overflow-hidden group">
            <div className="absolute right-0 bottom-0 translate-x-3 translate-y-3 opacity-10 group-hover:scale-110 transition-transform duration-500">
              <TrendingUp size={110} />
            </div>
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center shrink-0">
                <DollarSign size={20} className="text-white" />
              </div>
              <span className="text-[9px] font-black uppercase tracking-widest bg-white/20 px-2 py-0.5 rounded-full">
                Revenue
              </span>
            </div>
            <div>
              <div className="text-3xl font-black tracking-tight leading-none">
                ₹{totalRevenue.toLocaleString('en-IN')}
              </div>
              <div className="text-[10px] font-bold mt-1 text-indigo-100 uppercase tracking-widest">
                Total Earnings
              </div>
            </div>
          </div>
        )}

        {[
          { label: 'Total Consultations', value: totalSessionsCount, icon: Users, bg: 'bg-white border-border', val: 'text-foreground', sub: 'text-muted-foreground' },
          { label: 'Upcoming', value: totalScheduled, icon: Clock, bg: 'bg-blue-50 border-blue-200', val: 'text-blue-700', sub: 'text-blue-400' },
          { label: 'Need a Link', value: missingLinks, icon: Link2, bg: missingLinks > 0 ? 'bg-amber-50 border-amber-200' : 'bg-slate-50 border-slate-200', val: missingLinks > 0 ? 'text-amber-700' : 'text-slate-400', sub: missingLinks > 0 ? 'text-amber-400' : 'text-slate-400' },
          { label: 'Links Set', value: linkCount, icon: Video, bg: 'bg-emerald-50 border-emerald-200', val: 'text-emerald-700', sub: 'text-emerald-400' },
        ].map(({ label, value, icon: Icon, bg, val, sub }) => (
          <div key={label} className={`${bg} border rounded-3xl p-6 flex flex-col justify-between shadow-sm min-h-[120px]`}>
            <div className="flex items-center justify-between">
              <div className={`w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center border border-border shrink-0`}>
                <Icon size={20} className={val} />
              </div>
            </div>
            <div className="mt-4">
              <div className={`text-3xl font-black leading-none ${val}`}>{value}</div>
              <div className={`text-[10px] font-bold mt-1 uppercase tracking-widest ${sub}`}>{label}</div>
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
              {['', 'SCHEDULED', 'RESCHEDULED', 'COMPLETED', 'CANCELLED'].map(s => (
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

      {/* ── Table / Grid View ── */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-3xl border border-border p-6 animate-pulse">
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
      ) : finalFilteredSessions.length === 0 ? (
        <div className="bg-white rounded-3xl border border-border p-16 text-center shadow-sm">
          <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <Calendar size={24} className="text-slate-400" />
          </div>
          <p className="font-bold text-slate-600 text-base">No consultations found</p>
          <p className="text-sm text-muted-foreground mt-1.5">
            {searchTerm || statusFilter || dateFilter !== 'all' ? 'Try adjusting your filters or dates.' : 'No expert consultations have been booked yet.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Column Headers */}
          <div className="hidden lg:grid grid-cols-12 gap-4 px-5 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
            <div className="col-span-2">Date & Time</div>
            <div className={isAdmin ? "col-span-2" : "col-span-6"}>Client</div>
            {isAdmin && <div className="col-span-2">Expert</div>}
            {isAdmin && <div className="col-span-2">Payment</div>}
            <div className="col-span-2">Status</div>
            <div className="col-span-2">Meeting Link</div>
          </div>

          {finalFilteredSessions.map(session => {
            const { date, day, time } = fmt(session.scheduledAt);
            const isEditing = editingId === session.id;
            const clientName = session.user?.profile?.displayName || session.user?.username || 'Client';
            const expertName = session.expert?.profile?.displayName || session.expert?.username || 'Expert';
            const statusMeta = STATUS_META[session.status] || { label: session.status, dot: 'bg-slate-400', pill: 'bg-slate-100 text-slate-600 border border-slate-200' };
            const isPast = session.status !== 'SCHEDULED' && session.status !== 'RESCHEDULED';
            const isExpired = (session.status === 'SCHEDULED' || session.status === 'RESCHEDULED') && new Date(session.scheduledAt).getTime() < Date.now();
            
            // Payment display setup
            const isFree = !session.amount && session.programId;

            return (
              <div
                key={session.id}
                className={`bg-white rounded-3xl border transition-all duration-200 shadow-sm hover:shadow-md group ${isPast ? 'border-border opacity-80' : 'border-border hover:border-primary/20'}`}
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
                  <div className={`${isAdmin ? "lg:col-span-2" : "lg:col-span-6"} flex items-center gap-2.5 min-w-0`}>
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
                    <div className="lg:col-span-2 flex items-center gap-2.5 min-w-0">
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

                  {/* ── Payment Details Column ── */}
                  {isAdmin && (
                    <div className="lg:col-span-2 shrink-0">
                      <div className="lg:hidden text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Payment</div>
                      <button
                        onClick={() => setSelectedPaymentSession(session)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all border hover:scale-105 active:scale-95 shadow-sm bg-violet-50 text-violet-700 border-violet-200 hover:bg-violet-100 hover:shadow-violet-200/20"
                      >
                        <CreditCard size={12} />
                        ₹{session.amount || session.expert?.profile?.consultationPrice || 500}
                      </button>
                    </div>
                  )}

                  {/* ── Status select dropdown ── */}
                  <div className="lg:col-span-2 shrink-0">
                    <div className="lg:hidden text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Status</div>
                    {isExpired ? (
                      <div className="inline-flex items-center text-[11px] font-black px-4 py-1.5 rounded-full border bg-slate-100 text-slate-500 border-slate-200 uppercase">
                        Expired
                      </div>
                    ) : (
                      <div className="relative inline-flex items-center">
                        <span className={`absolute left-3 w-1.5 h-1.5 rounded-full pointer-events-none ${statusMeta.dot}`} />
                        <select
                          value={session.status}
                          onChange={e => handleUpdateStatus(session.id, e.target.value)}
                          className={`appearance-none inline-flex items-center text-[11px] font-black pl-6 pr-8 py-1.5 rounded-full cursor-pointer outline-none transition-all border ${statusMeta.pill}`}
                        >
                          <option value="SCHEDULED" className="bg-white text-blue-700 font-bold">Scheduled</option>
                          <option value="RESCHEDULED" className="bg-white text-amber-700 font-bold">Rescheduled</option>
                          <option value="COMPLETED" className="bg-white text-emerald-700 font-bold">Completed</option>
                          <option value="CANCELLED" className="bg-white text-rose-700 font-bold">Cancelled</option>
                        </select>
                        <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500" />
                      </div>
                    )}
                  </div>

                  {/* ── Meeting Link / Reschedule ── */}
                  <div className="lg:col-span-2 shrink-0 min-w-[200px]">
                    <div className="lg:hidden text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Meeting Link</div>
                    {reschedulingId === session.id ? (
                      <div className="flex flex-col gap-1.5 bg-slate-50/50 p-2.5 rounded-2xl border border-violet-100 shadow-inner">
                        <label className="text-[10px] font-black text-violet-500 uppercase tracking-widest">Select New Date</label>
                        <div className="flex items-center gap-1.5">
                          <input
                            autoFocus
                            type="datetime-local"
                            value={newScheduleInput}
                            onChange={e => { setNewScheduleInput(e.target.value); setRescheduleError(''); }}
                            onKeyDown={e => {
                              if (e.key === 'Enter') handleSaveReschedule(session.id);
                              if (e.key === 'Escape') cancelReschedule();
                            }}
                            className="flex-1 px-3 py-1.5 text-xs font-extrabold border border-violet-300 rounded-xl focus:ring-2 focus:ring-violet-200 focus:border-violet-500 outline-none bg-white text-slate-700 shadow-sm"
                          />
                          <button
                            onClick={() => handleSaveReschedule(session.id)}
                            disabled={rescheduleSaving}
                            className="p-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-all shadow-sm disabled:opacity-50 shrink-0 flex items-center justify-center hover:scale-105 active:scale-95"
                            title="Save"
                          >
                            {rescheduleSaving ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle2 size={13} />}
                          </button>
                          <button
                            onClick={cancelReschedule}
                            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-xl transition-all shrink-0 flex items-center justify-center hover:scale-105 active:scale-95"
                            title="Cancel"
                          >
                            <X size={13} />
                          </button>
                        </div>
                        {rescheduleError && (
                          <div className="flex items-center gap-1 text-rose-600 text-[10px] font-semibold">
                            <AlertCircle size={11} /> {rescheduleError}
                          </div>
                        )}
                        {rescheduleSuccess && (
                          <div className="flex items-center gap-1 text-emerald-600 text-[10px] font-semibold">
                            <CheckCircle2 size={11} /> {rescheduleSuccess}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2">
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
                        ) : isExpired ? null : session.meetLink ? (
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
                            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl border border-dashed border-primary/40 text-primary hover:bg-primary/5 transition-all font-bold text-xs w-fit"
                          >
                            <Link2 size={13} />
                            Add Meeting Link
                          </button>
                        )}

                        {isExpired && (
                          <button
                            onClick={() => startReschedule(session)}
                            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl border border-violet-200 text-violet-700 bg-violet-50 hover:bg-violet-100 hover:scale-105 active:scale-95 transition-all font-bold text-xs shadow-sm w-fit"
                            title="Reschedule expired consultation"
                          >
                            <Calendar size={13} />
                            Reschedule
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Footer count ── */}
      {!loading && finalFilteredSessions.length > 0 && (
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-semibold text-muted-foreground">
            {finalFilteredSessions.length} of {sessions.length} consultations
          </span>
          {missingLinks > 0 && (
            <div className="flex items-center gap-1.5 text-amber-600 text-xs font-bold">
              <AlertCircle size={13} />
              {missingLinks} upcoming consultation{missingLinks > 1 ? 's' : ''} without a meeting link
            </div>
          )}
        </div>
      )}

      {/* ── Premium Payment Detail Modal Popup ── */}
      {selectedPaymentSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-100 flex flex-col animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-5 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-violet-100 text-violet-700 flex items-center justify-center shrink-0">
                  <CreditCard size={16} />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-foreground">Consultation Payment</h3>
                  <p className="text-[10px] text-muted-foreground font-semibold">Reference ID: {selectedPaymentSession.id}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedPaymentSession(null)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 transition-colors flex items-center justify-center text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-5 flex-1 max-h-[75vh] overflow-y-auto">
              {/* Receipt Summary Card */}
              <div className="bg-gradient-to-br from-violet-50 to-indigo-50/50 border border-violet-100 rounded-2xl p-5 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Total Price</p>
                  <p className="text-3xl font-black text-violet-800 mt-1">
                    ₹{selectedPaymentSession.amount || selectedPaymentSession.expert?.profile?.consultationPrice || 500}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Payment Status</p>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black mt-2 shadow-sm bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    PAID SUCCESS
                  </span>
                </div>
              </div>

              {/* Detail Items */}
              <div className="space-y-4">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-1.5">Booking Information</h4>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Client</span>
                    <span className="font-extrabold text-slate-800">
                      {selectedPaymentSession.user?.profile?.displayName || selectedPaymentSession.user?.username || 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Expert</span>
                    <span className="font-extrabold text-slate-800">
                      {selectedPaymentSession.expert?.profile?.displayName || selectedPaymentSession.expert?.username || 'Unassigned'}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Schedule Date</span>
                    <span className="font-bold text-slate-700">
                      {new Date(selectedPaymentSession.scheduledAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Creation/Booking Date</span>
                    <span className="font-bold text-slate-700">
                      {new Date(selectedPaymentSession.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                    </span>
                  </div>
                </div>

                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-1.5 pt-2">Transaction Details</h4>

                <div className="space-y-3.5 text-xs">
                  <div className="flex justify-between items-center py-1">
                    <span className="font-bold text-slate-500 uppercase tracking-wide text-[10px]">Razorpay Payment ID</span>
                    <span className="font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                      {selectedPaymentSession.razorpayPaymentId || `pay_mock_${selectedPaymentSession.id.substring(0, 8)}`}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="font-bold text-slate-500 uppercase tracking-wide text-[10px]">Razorpay Order ID</span>
                    <span className="font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                      {selectedPaymentSession.razorpayOrderId || `order_mock_${selectedPaymentSession.id.substring(0, 8)}`}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="font-bold text-slate-500 uppercase tracking-wide text-[10px]">Method</span>
                    <span className="font-bold text-slate-700">
                      Online Razorpay Checkout
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedPaymentSession(null)}
                className="px-5 py-2.5 bg-slate-200 text-slate-700 hover:bg-slate-300 font-bold text-xs rounded-xl transition-all shadow-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      </>
      )}
    </div>
  );
}
