'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Calendar, Search, Filter, ShieldCheck, MapPin, Clock, 
  User, CheckCircle2, AlertCircle, Loader2, ArrowLeft,
  CalendarDays, Settings2, Sparkles, Send, X, ClipboardList 
} from 'lucide-react';
import { SchoolService, SchoolSession } from '@/services/school.service';
import { toast } from 'react-hot-toast';

export default function CentralSessionsCalendarPage() {
  const [sessions, setSessions] = useState<SchoolSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Search & Filter controls
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [gradeFilter, setGradeFilter] = useState('');
  
  // Selected Session Modal details
  const [selectedSession, setSelectedSession] = useState<SchoolSession | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Modal Update states
  const [status, setStatus] = useState<any>('SCHEDULED');
  const [proposedDate, setProposedDate] = useState('');
  const [proposedTime, setProposedTime] = useState('');
  const [venue, setVenue] = useState('');
  const [facilitatorId, setFacilitatorId] = useState('');
  
  // Completion states (for marking session COMPLETED)
  const [actualDate, setActualDate] = useState('');
  const [studentHeadcount, setStudentHeadcount] = useState('');
  const [attendanceRate, setAttendanceRate] = useState('');
  const [facilitatorNotes, setFacilitatorNotes] = useState('');
  const [publicNotes, setPublicNotes] = useState('');

  const loadSessions = async () => {
    setIsLoading(true);
    try {
      const data = await SchoolService.getAllSessions({
        search: search || undefined,
        status: statusFilter || undefined,
        grade: gradeFilter || undefined
      });
      setSessions(data);
    } catch (err: any) {
      toast.error('Failed to load Central Sessions agenda.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSessions();
  }, [statusFilter, gradeFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadSessions();
  };

  // Open details / edit modal
  const handleOpenModal = (session: SchoolSession) => {
    setSelectedSession(session);
    setStatus(session.status);
    
    // Set reschedule default values
    const dateObj = new Date(session.proposedDate);
    const dateStr = dateObj.toISOString().split('T')[0];
    setProposedDate(dateStr);
    setProposedTime(session.proposedTime || '');
    setVenue(session.venue || '');
    setFacilitatorId(session.facilitatorId || '');

    // Set complete defaults
    setActualDate(session.actualDate ? new Date(session.actualDate).toISOString().split('T')[0] : dateStr);
    setStudentHeadcount(session.studentHeadcount?.toString() || '');
    setAttendanceRate(session.attendanceRate?.toString() || '');
    setFacilitatorNotes(session.facilitatorNotes || '');
    setPublicNotes(session.publicNotes || '');

    setShowModal(true);
  };

  // Handle standard session rescheduling / detail update
  const handleUpdateDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSession) return;
    setIsUpdating(true);
    try {
      await SchoolService.updateSession(selectedSession.id, {
        status,
        proposedDate: new Date(proposedDate).toISOString(),
        proposedTime: proposedTime || null,
        venue: venue || null,
        facilitatorId: facilitatorId || null
      });
      toast.success('Session parameters updated successfully!');
      setShowModal(false);
      loadSessions();
    } catch (err: any) {
      toast.error(err.response?.data?.error || err.message || 'Failed to update reschedule details.');
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle session completion & attendance capture
  const handleCompleteSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSession) return;
    
    if (!actualDate || !studentHeadcount || !attendanceRate) {
      toast.error('Please enter Actual Completion Date, Headcount, and Attendance percentage.');
      return;
    }

    setIsUpdating(true);
    try {
      await SchoolService.completeSession(selectedSession.id, {
        actualDate: new Date(actualDate).toISOString(),
        studentHeadcount: parseInt(studentHeadcount),
        attendanceRate: parseFloat(attendanceRate),
        facilitatorNotes: facilitatorNotes || null,
        publicNotes: publicNotes || null
      });
      toast.success('Session successfully marked as COMPLETED and metrics captured!');
      setShowModal(false);
      loadSessions();
    } catch (err: any) {
      toast.error(err.response?.data?.error || err.message || 'Failed to complete session.');
    } finally {
      setIsUpdating(false);
    }
  };

  // Stats calculations
  const totalCount = sessions.length;
  const completedCount = sessions.filter(s => s.status === 'COMPLETED').length;
  const confirmedCount = sessions.filter(s => s.status === 'CONFIRMED').length;
  const scheduledCount = sessions.filter(s => s.status === 'SCHEDULED').length;

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
      
      {/* Premium Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-100 pb-8">
        <div>
          <div className="flex items-center gap-2">
            <Link 
              href="/admin/schools"
              className="p-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 rounded-xl transition-all shadow-sm active:scale-95 shrink-0"
              title="Go back to School partnerships"
            >
              <ArrowLeft size={14} />
            </Link>
            <span className="text-primary font-bold text-xs uppercase tracking-widest bg-primary/10 px-3 py-1 rounded-full">Operations Central</span>
          </div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight mt-3">Scheduled Sessions Agenda</h1>
          <p className="text-sm font-semibold text-slate-400 mt-1">Cross-school physical workshop calendar, facilitator tracking, and attendance logs.</p>
        </div>
      </div>

      {/* Roster Summary Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white border border-slate-100 p-5 rounded-3xl shadow-xl shadow-slate-200/20 flex items-center gap-4">
          <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary shrink-0">
            <CalendarDays size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Total Workshops</p>
            <p className="text-2xl font-black text-slate-800 mt-0.5">{totalCount}</p>
          </div>
        </div>

        <div className="bg-white border border-slate-100 p-5 rounded-3xl shadow-xl shadow-slate-200/20 flex items-center gap-4">
          <div className="w-12 h-12 bg-teal-50 rounded-2xl flex items-center justify-center text-teal-600 shrink-0">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Completed Sessions</p>
            <p className="text-2xl font-black text-slate-800 mt-0.5">{completedCount}</p>
          </div>
        </div>

        <div className="bg-white border border-slate-100 p-5 rounded-3xl shadow-xl shadow-slate-200/20 flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 shrink-0">
            <ShieldCheck size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Confirmed Slots</p>
            <p className="text-2xl font-black text-slate-800 mt-0.5">{confirmedCount}</p>
          </div>
        </div>

        <div className="bg-white border border-slate-100 p-5 rounded-3xl shadow-xl shadow-slate-200/20 flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shrink-0">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Scheduled Slots</p>
            <p className="text-2xl font-black text-slate-800 mt-0.5">{scheduledCount}</p>
          </div>
        </div>
      </div>

      {/* Advanced Filters Bar */}
      <div className="bg-slate-50/50 border border-slate-100 p-6 rounded-3xl space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text"
              placeholder="Search by school name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-2xl py-3.5 pl-12 pr-4 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/50 text-sm font-semibold transition-all text-slate-700"
            />
          </div>

          <div className="flex flex-wrap gap-4">
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-white border border-slate-200 rounded-2xl px-4 py-3 text-xs font-bold text-slate-600 focus:outline-none focus:ring-4 focus:ring-primary/10"
            >
              <option value="">All Statuses</option>
              <option value="SCHEDULED">Scheduled</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="COMPLETED">Completed</option>
              <option value="RESCHEDULED">Rescheduled</option>
              <option value="CANCELLED">Cancelled</option>
            </select>

            <select 
              value={gradeFilter}
              onChange={(e) => setGradeFilter(e.target.value)}
              className="bg-white border border-slate-200 rounded-2xl px-4 py-3 text-xs font-bold text-slate-600 focus:outline-none focus:ring-4 focus:ring-primary/10"
            >
              <option value="">All Grades</option>
              <option value="Grade 5">Grade 5</option>
              <option value="Grade 6">Grade 6</option>
              <option value="Grade 7">Grade 7</option>
              <option value="Grade 8">Grade 8</option>
              <option value="Grade 9">Grade 9</option>
            </select>

            <button 
              type="submit"
              className="bg-slate-800 hover:bg-slate-900 text-white font-extrabold px-6 py-3 rounded-2xl transition-all active:scale-95 text-xs uppercase tracking-wider"
            >
              Filter
            </button>
          </div>
        </form>
      </div>

      {/* Main Agenda list */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="animate-spin text-primary" size={32} />
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Compiling Central Agenda...</p>
        </div>
      ) : sessions.length === 0 ? (
        <div className="bg-white border border-slate-100 rounded-3xl p-16 text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-400">
            <Calendar size={28} />
          </div>
          <h3 className="text-lg font-black text-slate-700">No scheduled sessions found</h3>
          <p className="text-xs font-semibold text-slate-400 max-w-sm mx-auto">
            Try adjusting your search criteria, or schedule physical workshops within individual school profile portals.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 animate-in fade-in duration-300">
          {sessions.map((session) => (
            <div 
              key={session.id}
              onClick={() => handleOpenModal(session)}
              className="bg-white border border-slate-100 hover:border-primary/20 rounded-[2rem] p-6 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 cursor-pointer flex flex-col justify-between group relative overflow-hidden"
            >
              <div className="space-y-4">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <span className="text-[9px] font-black text-primary bg-primary/10 px-2.5 py-0.5 rounded-full uppercase tracking-wider">{session.grade}</span>
                    <h3 className="text-base font-extrabold text-slate-800 group-hover:text-primary transition-colors line-clamp-1 mt-2.5">{session.curriculumModule}</h3>
                  </div>
                  
                  <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${getStatusColor(session.status)}`}>
                    {session.status}
                  </span>
                </div>

                <p className="text-xs font-extrabold text-slate-700 line-clamp-1">{session.school?.name || 'Partner School'}</p>

                <div className="space-y-2 text-xs font-semibold text-slate-500 pt-1">
                  <div className="flex items-center gap-2">
                    <MapPin size={14} className="text-slate-400 shrink-0" />
                    <span>{session.school?.city || 'Location'} {session.venue ? `(${session.venue})` : ''}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Calendar size={14} className="text-slate-400 shrink-0" />
                    <span>Proposed: {new Date(session.proposedDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} at {session.proposedTime || 'TBD'}</span>
                  </div>

                  {session.facilitator && (
                    <div className="flex items-center gap-2">
                      <User size={14} className="text-slate-400 shrink-0" />
                      <span>Facilitator: {session.facilitator.profile?.displayName || 'Assigned Lead'}</span>
                    </div>
                  )}
                </div>
              </div>

              {session.status === 'COMPLETED' && (
                <div className="pt-4 mt-4 border-t border-slate-50 flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-slate-400">
                  <span>Attendance captured</span>
                  <span className="text-teal-600 font-extrabold">{session.attendanceRate}% ({session.studentHeadcount} Girls)</span>
                </div>
              )}

              {session.status !== 'COMPLETED' && (
                <div className="pt-4 mt-4 border-t border-slate-50 flex items-center justify-end text-[10px] font-black uppercase tracking-widest text-primary hover:underline">
                  <span>Manage Session slot →</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Details, Edit & Completion Modal */}
      {showModal && selectedSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative space-y-6">
            
            {/* Close handle */}
            <button 
              onClick={() => setShowModal(false)}
              className="absolute top-6 right-6 p-2 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full transition-all active:scale-95"
            >
              <X size={16} />
            </button>

            <div className="space-y-1">
              <span className="bg-primary/10 text-primary px-3 py-0.5 text-[9px] font-black rounded-full uppercase tracking-wider inline-block">
                {selectedSession.grade} Core Workshop
              </span>
              <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">{selectedSession.curriculumModule}</h2>
              <p className="text-xs text-slate-400 font-bold">{selectedSession.school?.name}</p>
            </div>

            {/* Split View: Left (Reschedule / Edit parameters), Right (Complete session logs) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-slate-100 pt-6">
              
              {/* Form 1: Standard Rescheduling parameters */}
              <form onSubmit={handleUpdateDetails} className="space-y-4 border-r border-slate-100 md:pr-8">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 pb-2 border-b border-slate-50">
                  <Settings2 size={13} className="text-primary" />
                  Reschedule Parameters
                </h3>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Session Status</label>
                  <select 
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 focus:outline-none focus:ring-4 focus:ring-primary/10 text-xs font-bold text-slate-700"
                  >
                    <option value="SCHEDULED">SCHEDULED</option>
                    <option value="CONFIRMED">CONFIRMED</option>
                    <option value="RESCHEDULED">RESCHEDULED</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Proposed Date *</label>
                  <input 
                    type="date"
                    required
                    value={proposedDate}
                    onChange={(e) => setProposedDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 focus:outline-none focus:ring-4 focus:ring-primary/10 text-xs font-bold text-slate-700"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Proposed Time</label>
                  <input 
                    type="text"
                    value={proposedTime}
                    onChange={(e) => setProposedTime(e.target.value)}
                    placeholder="e.g. 11:30 AM"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 focus:outline-none text-xs font-bold text-slate-700"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Venue</label>
                  <input 
                    type="text"
                    value={venue}
                    onChange={(e) => setVenue(e.target.value)}
                    placeholder="Auditorium / Library"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 focus:outline-none text-xs font-bold text-slate-700"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Facilitator ID</label>
                  <input 
                    type="text"
                    value={facilitatorId}
                    onChange={(e) => setFacilitatorId(e.target.value)}
                    placeholder="User UUID (Optional)"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 focus:outline-none text-xs font-bold text-slate-700"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isUpdating}
                  className="w-full py-3 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all active:scale-95 shadow-sm flex items-center justify-center gap-1.5"
                >
                  {isUpdating ? <Loader2 className="animate-spin" size={12} /> : <Send size={12} />}
                  Save Reschedule Details
                </button>
              </form>

              {/* Form 2: Mark completed metrics & logs */}
              <form onSubmit={handleCompleteSession} className="space-y-4">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 pb-2 border-b border-slate-50">
                  <ClipboardList size={13} className="text-primary" />
                  Mark Completed Logs
                </h3>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Actual Date *</label>
                  <input 
                    type="date"
                    required
                    value={actualDate}
                    onChange={(e) => setActualDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 focus:outline-none text-xs font-bold text-slate-700"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Student Headcount *</label>
                  <input 
                    type="number"
                    required
                    value={studentHeadcount}
                    onChange={(e) => setStudentHeadcount(e.target.value)}
                    placeholder="e.g. 45"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 focus:outline-none text-xs font-bold text-slate-700"
                    min={0}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Attendance Percentage (%) *</label>
                  <input 
                    type="number"
                    required
                    value={attendanceRate}
                    onChange={(e) => setAttendanceRate(e.target.value)}
                    placeholder="e.g. 92.5"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 focus:outline-none text-xs font-bold text-slate-700"
                    step="0.1"
                    min={0}
                    max={100}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Facilitator Internal Notes</label>
                  <textarea 
                    rows={2}
                    value={facilitatorNotes}
                    onChange={(e) => setFacilitatorNotes(e.target.value)}
                    placeholder="Comments on workshop interactions..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 focus:outline-none text-xs font-semibold text-slate-700"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Public Notes (Visible to School)</label>
                  <textarea 
                    rows={2}
                    value={publicNotes}
                    onChange={(e) => setPublicNotes(e.target.value)}
                    placeholder="General report details for school coordinator..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 focus:outline-none text-xs font-semibold text-slate-700"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isUpdating}
                  className="w-full py-3 bg-primary hover:bg-primary-dark text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all active:scale-95 shadow-md flex items-center justify-center gap-1.5"
                >
                  {isUpdating ? <Loader2 className="animate-spin" size={12} /> : <CheckCircle2 size={12} />}
                  Mark Completed & Log
                </button>
              </form>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
