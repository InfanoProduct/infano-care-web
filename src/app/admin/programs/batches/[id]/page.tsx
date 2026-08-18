'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ProgramsService } from '@/services/programs.service';
import {
  ArrowLeft, Users, Phone, Mail, Award, Calendar, Loader2,
  ShieldAlert, Plus, Edit, Trash2, Video, CheckCircle2, Clock, ExternalLink,
  UserPlus, UserMinus, Search, Eye, X, Check
} from 'lucide-react';
import { toast } from 'react-hot-toast';
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

export default function BatchDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = React.use(params);
  const router = useRouter();
  const batchId = resolvedParams.id;

  const [batch, setBatch] = useState<any | null>(null);
  const [allEnrollments, setAllEnrollments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Active Tab
  const [activeTab, setActiveTab] = useState<'students' | 'sessions'>('students');

  // Search
  const [studentSearch, setStudentSearch] = useState('');

  // Add/Assign Student Modal State
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [selectedStudentEnrollmentId, setSelectedStudentEnrollmentId] = useState('');
  const [assigningStudent, setAssigningStudent] = useState(false);

  // Schedule Session Modal State
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [sessionModalMode, setSessionModalMode] = useState<'create' | 'edit'>('create');
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [sessionFormNumber, setSessionFormNumber] = useState<number>(1);
  const [sessionFormDate, setSessionFormDate] = useState('');
  const [sessionFormTime, setSessionFormTime] = useState('10:00');
  const [sessionFormMeetLink, setSessionFormMeetLink] = useState('');
  const [sessionFormStatus, setSessionFormStatus] = useState('SCHEDULED');
  const [sessionSubmitting, setSessionSubmitting] = useState(false);

  // Quick action states
  const [unassigningId, setUnassigningId] = useState<string | null>(null);
  const [updatingSessionStatusId, setUpdatingSessionStatusId] = useState<string | null>(null);

  const fetchBatchDetails = async () => {
    try {
      const [batchRes, enrollmentsRes] = await Promise.all([
        ProgramsService.getBatchById(batchId),
        ProgramsService.getAdminEnrollments().catch(() => [])
      ]);
      if (batchRes.data) {
        setBatch(batchRes.data);
      } else {
        toast.error('Batch details not found');
      }
      setAllEnrollments(Array.isArray(enrollmentsRes) ? enrollmentsRes : []);
    } catch (error) {
      console.error('Failed to load batch details:', error);
      toast.error('Failed to load batch details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBatchDetails();
  }, [batchId]);

  // Unassign student from batch
  const handleUnassignStudent = async (enrollmentId: string) => {
    if (!confirm('Are you sure you want to remove this student from this batch?')) return;
    setUnassigningId(enrollmentId);
    try {
      await ProgramsService.updateEnrollment(enrollmentId, { batchId: null });
      toast.success('Student unassigned from batch');
      fetchBatchDetails();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to unassign student');
    } finally {
      setUnassigningId(null);
    }
  };

  // Assign existing student to this batch
  const handleAssignStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentEnrollmentId) return;
    setAssigningStudent(true);
    try {
      await ProgramsService.updateEnrollment(selectedStudentEnrollmentId, { batchId: batch.id });
      toast.success('Student assigned to this batch successfully!');
      setShowAddStudentModal(false);
      setSelectedStudentEnrollmentId('');
      fetchBatchDetails();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to assign student');
    } finally {
      setAssigningStudent(false);
    }
  };

  // Open schedule session modal for a predefined curriculum session
  const handleOpenScheduleSessionModal = (sessionNumber: number, existingSession?: any) => {
    setSessionFormNumber(sessionNumber);
    if (existingSession) {
      setSessionModalMode('edit');
      setEditingSessionId(existingSession.id);
      if (existingSession.scheduledAt) {
        const d = new Date(existingSession.scheduledAt);
        setSessionFormDate(d.toISOString().split('T')[0]);
        setSessionFormTime(d.toTimeString().slice(0, 5));
      }
      setSessionFormMeetLink(existingSession.meetLink || '');
      setSessionFormStatus(existingSession.status || 'SCHEDULED');
    } else {
      setSessionModalMode('create');
      setEditingSessionId(null);
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setSessionFormDate(tomorrow.toISOString().split('T')[0]);
      setSessionFormTime('10:00');
      setSessionFormMeetLink('');
      setSessionFormStatus('SCHEDULED');
    }
    setShowSessionModal(true);
  };

  // Submit session schedule form
  const handleSessionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionFormDate || !sessionFormTime) {
      toast.error('Please select both date and time');
      return;
    }
    const scheduledDateTime = new Date(`${sessionFormDate}T${sessionFormTime}:00`);

    setSessionSubmitting(true);
    try {
      if (sessionModalMode === 'create') {
        await ProgramsService.scheduleBatchSession(batch.id, {
          scheduledAt: scheduledDateTime.toISOString(),
          sessionNumber: sessionFormNumber,
          meetLink: sessionFormMeetLink,
          expertId: batch.expertId || undefined
        });
        toast.success('Session scheduled successfully!');
      } else if (editingSessionId) {
        await ProgramsService.updateBatchSession(batch.id, editingSessionId, {
          scheduledAt: scheduledDateTime.toISOString(),
          sessionNumber: sessionFormNumber,
          meetLink: sessionFormMeetLink,
          status: sessionFormStatus
        });
        toast.success('Session updated successfully!');
      }
      setShowSessionModal(false);
      fetchBatchDetails();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save session');
    } finally {
      setSessionSubmitting(false);
    }
  };

  // Toggle session completion or cancellation status
  const handleQuickUpdateSessionStatus = async (sessionId: string, newStatus: string) => {
    setUpdatingSessionStatusId(sessionId);
    try {
      await ProgramsService.updateBatchSession(batch.id, sessionId, { status: newStatus });
      toast.success(`Session marked as ${newStatus.toLowerCase()}`);
      fetchBatchDetails();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update session status');
    } finally {
      setUpdatingSessionStatusId(null);
    }
  };

  // Delete session
  const handleDeleteSession = async (sessionId: string) => {
    if (!confirm('Are you sure you want to remove this scheduled session?')) return;
    try {
      await ProgramsService.deleteBatchSession(batch.id, sessionId);
      toast.success('Session deleted successfully');
      fetchBatchDetails();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete session');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[65vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-primary" size={48} />
        <p className="font-bold text-muted-foreground text-sm">Loading batch details...</p>
      </div>
    );
  }

  if (!batch) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center p-8 gap-4">
        <ShieldAlert className="text-rose-500" size={48} />
        <p className="font-extrabold text-slate-700 text-lg">Batch not found</p>
        <button
          onClick={() => router.push('/admin/programs?tab=batches')}
          className="btn-primary px-5 py-2.5 rounded-xl text-white bg-primary text-xs font-bold transition-all"
        >
          Back to Batches
        </button>
      </div>
    );
  }

  const assignedStudents = (batch.enrollments || []).filter((e: any) => {
    if (!studentSearch.trim()) return true;
    const q = studentSearch.toLowerCase();
    const name = (e.user?.profile?.displayName || e.user?.username || '').toLowerCase();
    const phone = (e.user?.phone || '').toLowerCase();
    const email = (e.user?.email || e.user?.parentEmail || '').toLowerCase();
    return name.includes(q) || phone.includes(q) || email.includes(q);
  });

  const enrolledCount = batch.enrollments?.length || 0;
  const capacityPercent = Math.min(Math.round((enrolledCount / (batch.maxCapacity || 1)) * 100), 100);

  // Unassigned students who enrolled in this program but have no batch yet
  const unassignedStudents = allEnrollments.filter((e: any) => {
    const matchesProgram = e.programId === batch.programId || e.program?.id === batch.programId || e.program?.title === batch.program?.title;
    const isUnassigned = !e.batchId || e.batchId !== batch.id;
    return matchesProgram && isUnassigned;
  });

  const curriculumList: any[] = Array.isArray(batch.program?.curriculum) ? batch.program.curriculum : [];
  const scheduledSessions: any[] = batch.expertSessions || [];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 w-full pb-12">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/20 pb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/admin/programs?tab=batches')}
            className="w-11 h-11 flex items-center justify-center rounded-2xl bg-white hover:bg-slate-100 border border-border/50 shadow-sm transition-all hover:scale-105 active:scale-95 text-slate-700"
            title="Back to Batches"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-black uppercase tracking-widest bg-primary/10 text-primary px-3 py-1 rounded-full border border-primary/20">
                {batch.program?.title || 'Learning Program'}
              </span>
              <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${
                batch.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                batch.status === 'COMPLETED' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                'bg-amber-50 text-amber-700 border-amber-200'
              }`}>
                {batch.status}
              </span>
            </div>
            <h1 className="text-3xl font-black tracking-tight text-slate-800 mt-1">
              {batch.name}
            </h1>
            {batch.description && (
              <p className="text-xs text-muted-foreground font-semibold mt-0.5">{batch.description}</p>
            )}
          </div>
        </div>

        {/* Top Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddStudentModal(true)}
            className="px-5 py-2.5 bg-primary text-white text-xs font-black rounded-xl shadow-md hover:shadow-lg transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
          >
            <UserPlus size={15} />
            <span>Add / Assign Student</span>
          </button>
        </div>
      </div>

      {/* KPI / Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Enrolled Students Card */}
        <div className="bg-white rounded-3xl p-6 border border-border/40 shadow-sm hover:shadow-md transition-all space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Capacity & Enrolled</span>
            <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Users size={16} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-800">{enrolledCount}</span>
            <span className="text-xs font-bold text-slate-400">/ {batch.maxCapacity} Max</span>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                capacityPercent >= 100 ? 'bg-rose-500' : capacityPercent >= 80 ? 'bg-amber-500' : 'bg-primary'
              }`}
              style={{ width: `${capacityPercent}%` }}
            />
          </div>
          <p className="text-[11px] font-bold text-muted-foreground">
            {batch.maxCapacity - enrolledCount > 0
              ? `${batch.maxCapacity - enrolledCount} slot(s) remaining`
              : 'Batch is full'}
          </p>
        </div>

        {/* Assigned Mentor Card */}
        <div className="bg-white rounded-3xl p-6 border border-border/40 shadow-sm hover:shadow-md transition-all space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Assigned Mentor</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Award size={16} />
            </div>
          </div>
          <div>
            <p className="text-base font-extrabold text-slate-800 truncate">
              {batch.expert?.profile?.displayName || batch.expert?.username || 'No Expert Assigned'}
            </p>
            <p className="text-xs font-bold text-purple-600 truncate mt-0.5">
              {batch.expert?.profile?.specialisation || 'Cohort Expert'}
            </p>
          </div>
          {batch.expert?.email && (
            <p className="text-[11px] font-semibold text-muted-foreground truncate">{batch.expert.email}</p>
          )}
        </div>

        {/* Timeline Card */}
        <div className="bg-white rounded-3xl p-6 border border-border/40 shadow-sm hover:shadow-md transition-all space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Batch Timeline</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Calendar size={16} />
            </div>
          </div>
          <div className="space-y-1 text-xs font-bold text-slate-700">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-semibold text-[11px]">Starts:</span>
              <span>{batch.startDate ? new Date(batch.startDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Not set'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-semibold text-[11px]">Ends:</span>
              <span>{batch.endDate ? new Date(batch.endDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Not set'}</span>
            </div>
          </div>
        </div>

        {/* Sessions Summary Card */}
        <div className="bg-white rounded-3xl p-6 border border-border/40 shadow-sm hover:shadow-md transition-all space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Curriculum & Schedule</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Video size={16} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-800">{scheduledSessions.length}</span>
            <span className="text-xs font-bold text-slate-400">/ {curriculumList.length} Scheduled</span>
          </div>
          <div className="flex items-center gap-3 text-[11px] font-bold">
            <span className="text-emerald-600 flex items-center gap-1">
              <CheckCircle2 size={12} /> {scheduledSessions.filter((s: any) => s.status === 'COMPLETED').length} Done
            </span>
            <span className="text-amber-600 flex items-center gap-1">
              <Clock size={12} /> {Math.max(curriculumList.length - scheduledSessions.length, 0)} Pending
            </span>
          </div>
        </div>
      </div>

      {/* Main Content Tabs */}
      <div className="bg-white rounded-[2.5rem] border border-border/40 shadow-xl overflow-hidden">
        {/* Tab Navigation Header */}
        <div className="p-6 border-b border-border/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
          <div className="flex items-center gap-2 p-1.5 bg-slate-200/50 rounded-2xl w-max">
            <button
              onClick={() => setActiveTab('students')}
              className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
                activeTab === 'students'
                  ? 'bg-white text-slate-800 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Users size={15} />
              <span>Assigned Enrolled Students ({enrolledCount})</span>
            </button>

            <button
              onClick={() => setActiveTab('sessions')}
              className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
                activeTab === 'sessions'
                  ? 'bg-white text-slate-800 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Video size={15} />
              <span>Predefined Curriculum Sessions ({scheduledSessions.length}/{curriculumList.length})</span>
            </button>
          </div>

          {activeTab === 'students' && (
            <div className="relative min-w-[240px]">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
              <input
                type="text"
                placeholder="Search students in batch..."
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white border border-border/60 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-xs"
              />
            </div>
          )}
        </div>

        {/* TAB 1: Assigned Enrolled Students */}
        {activeTab === 'students' && (
          <div className="p-0">
            {assignedStudents.length === 0 ? (
              <div className="p-12 text-center space-y-4">
                <div className="w-14 h-14 bg-indigo-50 text-indigo-500 rounded-3xl flex items-center justify-center mx-auto shadow-sm">
                  <Users size={28} />
                </div>
                <div className="max-w-md mx-auto">
                  <h3 className="text-lg font-extrabold text-slate-800">No students assigned to this batch yet</h3>
                  <p className="text-xs text-muted-foreground font-semibold mt-1">
                    Assign existing enrolled students into this cohort or add manual enrollments.
                  </p>
                </div>
                <button
                  onClick={() => setShowAddStudentModal(true)}
                  className="px-5 py-2.5 bg-primary text-white text-xs font-bold rounded-xl shadow-md transition-all hover:scale-105 active:scale-95 inline-flex items-center gap-2"
                >
                  <UserPlus size={15} />
                  <span>Assign Students Now</span>
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-primary/5 border-b border-border/30 text-xs font-black uppercase tracking-widest text-muted-foreground/80">
                      <th className="p-6">Student Information</th>
                      <th className="p-6">Account Role</th>
                      <th className="p-6">Date Enrolled</th>
                      <th className="p-6">Status</th>
                      <th className="p-6">Fee Paid</th>
                      <th className="p-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30">
                    {assignedStudents.map((enrollment: any) => (
                      <tr key={enrollment.id} className="hover:bg-primary/[0.01] transition-all group">
                        {/* Student Info */}
                        <td className="p-6">
                          <div className="flex items-center gap-4">
                            <div className="w-11 h-11 rounded-full overflow-hidden flex items-center justify-center bg-primary/10 text-primary font-black text-lg shrink-0">
                              {enrollment.user?.profile?.avatarUrl ? (
                                <img
                                  src={enrollment.user.profile.avatarUrl}
                                  alt={enrollment.user.profile.displayName || 'Avatar'}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                (enrollment.user?.profile?.displayName?.[0] || enrollment.user?.username?.[0] || 'S').toUpperCase()
                              )}
                            </div>
                            <div>
                              <p className="font-extrabold text-base tracking-tight text-foreground group-hover:text-primary transition-colors">
                                {enrollment.user?.profile?.displayName || enrollment.user?.username || 'Student'}
                              </p>
                              <div className="flex flex-col gap-1 mt-1 text-xs text-muted-foreground font-semibold">
                                <span className="flex items-center gap-1.5">
                                  <Phone size={12} className="text-muted-foreground/60" />
                                  {enrollment.user?.phone || 'No phone'}
                                </span>
                                {(enrollment.user?.email || enrollment.user?.parentEmail) && (
                                  <span className="flex items-center gap-1.5">
                                    <Mail size={12} className="text-muted-foreground/60" />
                                    {enrollment.user?.email || enrollment.user?.parentEmail}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Role */}
                        <td className="p-6">
                          <span className="text-[10px] font-bold px-2.5 py-1 bg-slate-100 text-slate-700 border border-slate-200 rounded-md">
                            {enrollment.user?.role || 'STUDENT'}
                          </span>
                        </td>

                        {/* Date Enrolled */}
                        <td className="p-6">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
                            <Calendar size={14} className="text-muted-foreground/70" />
                            {new Date(enrollment.createdAt).toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </div>
                        </td>

                        {/* Status */}
                        <td className="p-6">
                          <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full inline-flex items-center gap-1.5 border shadow-sm ${
                            enrollment.status === 'ACTIVE'
                              ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                              : enrollment.status === 'SUSPENDED'
                                ? 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                                : 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20'
                          }`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${
                              enrollment.status === 'ACTIVE' ? 'bg-emerald-500 animate-pulse' :
                              enrollment.status === 'SUSPENDED' ? 'bg-amber-500' : 'bg-indigo-500'
                            }`} />
                            {enrollment.status}
                          </span>
                        </td>

                        {/* Fee Paid */}
                        <td className="p-6">
                          <span className="font-extrabold text-sm text-slate-800">
                            ₹{Number(enrollment.pricePaid || 0).toLocaleString()}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="p-6 text-right">
                          <div className="flex justify-end items-center gap-2">
                            <button
                              onClick={() => router.push(`/admin/programs/enrollments/${enrollment.id}`)}
                              title="View Student Full Profile & Enrollment"
                              className="p-2.5 bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200 rounded-xl transition-all shadow-xs"
                            >
                              <Eye size={14} className="stroke-[2.5px]" />
                            </button>
                            <button
                              disabled={unassigningId === enrollment.id}
                              onClick={() => handleUnassignStudent(enrollment.id)}
                              title="Remove / Unassign student from this batch"
                              className="p-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-xl transition-all shadow-xs"
                            >
                              {unassigningId === enrollment.id ? (
                                <Loader2 size={14} className="animate-spin" />
                              ) : (
                                <UserMinus size={14} />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: Sessions & Live Schedule */}
        {activeTab === 'sessions' && (
          <div className="p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h3 className="text-lg font-black text-slate-800">Predefined Curriculum & Live Schedules</h3>
                <p className="text-xs text-muted-foreground font-semibold mt-0.5">
                  Predefined sessions for <span className="font-bold text-slate-700">{batch.program?.title}</span>. Schedule each session date, time, and Google Meet link.
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs font-bold text-slate-500 bg-slate-100 px-3.5 py-2 rounded-xl">
                <span>{scheduledSessions.length} of {curriculumList.length} Sessions Scheduled</span>
              </div>
            </div>

            {curriculumList.length === 0 ? (
              <div className="p-12 text-center space-y-4 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-3xl flex items-center justify-center mx-auto shadow-sm">
                  <Video size={28} />
                </div>
                <div className="max-w-md mx-auto">
                  <h4 className="text-base font-extrabold text-slate-800">No curriculum sessions found</h4>
                  <p className="text-xs text-muted-foreground font-semibold mt-1">
                    Please configure curriculum sessions for this program in the Learning Programs manager.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {curriculumList.map((curriculumSession: any, index: number) => {
                  const sessionNumber = index + 1;
                  const scheduledSession = scheduledSessions.find(
                    (s: any) => s.sessionNumber === sessionNumber
                  );
                  const isScheduled = !!scheduledSession;
                  const isCompleted = scheduledSession?.status === 'COMPLETED';
                  const isCancelled = scheduledSession?.status === 'CANCELLED';
                  const isPast = scheduledSession?.scheduledAt && new Date(scheduledSession.scheduledAt).getTime() < Date.now();

                  return (
                    <div
                      key={sessionNumber}
                      className={`p-6 rounded-3xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xs hover:shadow-md ${
                        isCompleted
                          ? 'bg-emerald-50/40 border-emerald-200'
                          : isCancelled
                            ? 'bg-rose-50/40 border-rose-200'
                            : isScheduled
                              ? 'bg-indigo-50/20 border-indigo-200'
                              : 'bg-white border-border/50 hover:border-primary/30'
                      }`}
                    >
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-black px-3 py-1 bg-primary/10 text-primary rounded-xl">
                            Session {sessionNumber}
                          </span>

                          {isScheduled ? (
                            <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                              isCompleted ? 'bg-emerald-100 text-emerald-800 border-emerald-300' :
                              isCancelled ? 'bg-rose-100 text-rose-800 border-rose-300' :
                              'bg-indigo-100 text-indigo-800 border-indigo-300'
                            }`}>
                              {scheduledSession.status}
                            </span>
                          ) : (
                            <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200">
                              Not Scheduled
                            </span>
                          )}

                          {isPast && isScheduled && !isCompleted && !isCancelled && (
                            <span className="text-[10px] font-extrabold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                              Past Scheduled Time
                            </span>
                          )}
                        </div>

                        <h4 className="text-base font-extrabold text-slate-800">
                          {curriculumSession.title || `Session ${sessionNumber}`}
                        </h4>
                        {curriculumSession.description && (
                          <p className="text-xs text-muted-foreground font-medium line-clamp-2 max-w-3xl">
                            {curriculumSession.description}
                          </p>
                        )}

                        {isScheduled && (
                          <div className="flex items-center gap-4 text-xs font-bold text-slate-600 flex-wrap pt-1.5">
                            <span className="flex items-center gap-1.5">
                              <Calendar size={14} className="text-primary" />
                              {new Date(scheduledSession.scheduledAt).toLocaleDateString('en-IN', {
                                weekday: 'short',
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric'
                              })}
                            </span>
                            <span className="flex items-center gap-1.5">
                              <Clock size={14} className="text-primary" />
                              {new Date(scheduledSession.scheduledAt).toLocaleTimeString('en-IN', {
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: true
                              })}
                            </span>
                            {scheduledSession.expert && (
                              <span className="flex items-center gap-1.5 text-purple-700 font-extrabold">
                                <Award size={14} />
                                Mentor: {scheduledSession.expert.profile?.displayName || scheduledSession.expert.username}
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Action Controls */}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 shrink-0">
                        {isScheduled ? (
                          <>
                            {scheduledSession.meetLink ? (
                              <a
                                href={scheduledSession.meetLink.startsWith('http') ? scheduledSession.meetLink : `https://${scheduledSession.meetLink}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-extrabold rounded-xl border border-indigo-200 text-xs shadow-xs transition-all flex items-center gap-1.5"
                              >
                                <GoogleMeetIcon size={14} />
                                <span>Join Meet</span>
                                <ExternalLink size={12} />
                              </a>
                            ) : (
                              <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200">
                                No Meet Link
                              </span>
                            )}

                            {scheduledSession.status === 'SCHEDULED' ? (
                              <button
                                disabled={updatingSessionStatusId === scheduledSession.id}
                                onClick={() => handleQuickUpdateSessionStatus(scheduledSession.id, 'COMPLETED')}
                                className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded-xl border border-emerald-200 text-xs transition-all flex items-center gap-1 cursor-pointer"
                                title="Mark as completed"
                              >
                                <Check size={14} />
                                <span>Done</span>
                              </button>
                            ) : (
                              <button
                                disabled={updatingSessionStatusId === scheduledSession.id}
                                onClick={() => handleQuickUpdateSessionStatus(scheduledSession.id, 'SCHEDULED')}
                                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl border border-slate-300 text-xs transition-all cursor-pointer"
                                title="Re-open session"
                              >
                                Reopen
                              </button>
                            )}

                            <button
                              onClick={() => handleOpenScheduleSessionModal(sessionNumber, scheduledSession)}
                              className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl border border-slate-200 transition-all cursor-pointer"
                              title="Reschedule / Edit Meet Link"
                            >
                              <Edit size={14} />
                            </button>

                            <button
                              onClick={() => handleDeleteSession(scheduledSession.id)}
                              className="p-2 bg-slate-50 hover:bg-rose-50 hover:text-rose-600 text-slate-500 rounded-xl border border-slate-200 transition-all cursor-pointer"
                              title="Unschedule Session"
                            >
                              <Trash2 size={14} />
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => handleOpenScheduleSessionModal(sessionNumber)}
                            className="px-4 py-2.5 bg-primary text-white text-xs font-bold rounded-xl shadow-md transition-all hover:scale-105 active:scale-95 flex items-center gap-1.5 cursor-pointer"
                          >
                            <Calendar size={14} />
                            <span>Schedule Session</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* MODAL 1: Assign Student to this Batch */}
      {showAddStudentModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-border/40 animate-in zoom-in-95 duration-200 space-y-6">
            <div className="flex items-center justify-between border-b border-border/20 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                  <UserPlus size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-800">Add Student to {batch.name}</h3>
                  <p className="text-xs text-muted-foreground font-semibold">Assign an enrolled student into this cohort</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddStudentModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-all"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAssignStudent} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Select Enrolled Student *
                </label>
                {unassignedStudents.length === 0 ? (
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-500 text-center">
                    All currently enrolled students in this program are already assigned to batches.
                  </div>
                ) : (
                  <select
                    required
                    value={selectedStudentEnrollmentId}
                    onChange={(e) => setSelectedStudentEnrollmentId(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer"
                  >
                    <option value="">-- Choose Student to Assign --</option>
                    {unassignedStudents.map((enr: any) => {
                      const name = enr.user?.profile?.displayName || enr.user?.username || 'Student';
                      const phone = enr.user?.phone || '';
                      return (
                        <option key={enr.id} value={enr.id}>
                          {name} ({phone}) - {enr.status}
                        </option>
                      );
                    })}
                  </select>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border/20">
                <button
                  type="button"
                  onClick={() => setShowAddStudentModal(false)}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl text-xs transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={assigningStudent || !selectedStudentEnrollmentId || unassignedStudents.length === 0}
                  className="px-5 py-2.5 bg-primary text-white font-bold rounded-xl text-xs shadow-md transition-all hover:scale-105 active:scale-95 disabled:opacity-50 flex items-center gap-1.5"
                >
                  {assigningStudent && <Loader2 className="animate-spin" size={14} />}
                  <span>Assign to Batch</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Schedule / Edit Predefined Session */}
      {showSessionModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-border/40 animate-in zoom-in-95 duration-200 space-y-6">
            <div className="flex items-center justify-between border-b border-border/20 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                  <Video size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-800">
                    {sessionModalMode === 'create' ? `Schedule Session ${sessionFormNumber}` : `Edit Session ${sessionFormNumber}`}
                  </h3>
                  <p className="text-xs text-primary font-bold">
                    {curriculumList[sessionFormNumber - 1]?.title || `Session ${sessionFormNumber}`}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowSessionModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-all"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSessionSubmit} className="space-y-4">
              {curriculumList[sessionFormNumber - 1]?.description && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                    Curriculum Topic
                  </span>
                  <p className="text-xs text-slate-600 font-medium">
                    {curriculumList[sessionFormNumber - 1].description}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Date *</label>
                  <input
                    type="date"
                    required
                    value={sessionFormDate}
                    onChange={(e) => setSessionFormDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Time *</label>
                  <input
                    type="time"
                    required
                    value={sessionFormTime}
                    onChange={(e) => setSessionFormTime(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Session Status *</label>
                <select
                  value={sessionFormStatus}
                  onChange={(e) => setSessionFormStatus(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
                >
                  <option value="SCHEDULED">Scheduled</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Google Meet Link / Meeting URL (Optional)
                </label>
                <input
                  type="url"
                  placeholder="https://meet.google.com/xyz-abcd-efg"
                  value={sessionFormMeetLink}
                  onChange={(e) => setSessionFormMeetLink(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border/20">
                <button
                  type="button"
                  onClick={() => setShowSessionModal(false)}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl text-xs transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sessionSubmitting}
                  className="px-5 py-2.5 bg-primary text-white font-bold rounded-xl text-xs shadow-md transition-all hover:scale-105 active:scale-95 disabled:opacity-50 flex items-center gap-1.5"
                >
                  {sessionSubmitting && <Loader2 className="animate-spin" size={14} />}
                  <span>{sessionModalMode === 'create' ? 'Save Schedule' : 'Save Changes'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
