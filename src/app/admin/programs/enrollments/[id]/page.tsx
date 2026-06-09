'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ProgramsService, ProgramEnrollment } from '@/services/programs.service';
import { ArrowLeft, Users, Phone, Mail, Award, CreditCard, Calendar, Loader2, AlertCircle, ShieldAlert } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function EnrollmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = React.use(params);
  const router = useRouter();
  const [enrollment, setEnrollment] = useState<ProgramEnrollment | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const fetchEnrollment = async () => {
    try {
      const enrollments = await ProgramsService.getAdminEnrollments();
      const match = enrollments.find(e => e.id === resolvedParams.id);
      if (match) {
        setEnrollment(match);
      } else {
        toast.error('Enrollment not found');
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to load enrollment details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnrollment();
  }, [resolvedParams.id]);

  const handleUpdateStatus = async (newStatus: string) => {
    if (!enrollment) return;
    setUpdating(true);
    try {
      await ProgramsService.updateEnrollmentStatus(enrollment.id, newStatus);
      toast.success(`Enrollment status updated to ${newStatus.toLowerCase()}`);
      fetchEnrollment();
    } catch (error) {
      toast.error('Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const getFriendlyStatus = (status: string) => {
    if (!status) return '';
    return status.charAt(0) + status.slice(1).toLowerCase();
  };

  const getFriendlyRole = (role: string) => {
    if (!role) return 'Parent';
    return role.charAt(0) + role.slice(1).toLowerCase();
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-primary" size={48} />
        <p className="font-normal text-muted-foreground/80">Loading enrollment details...</p>
      </div>
    );
  }

  if (!enrollment) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center p-8 gap-4">
        <ShieldAlert className="text-rose-500" size={48} />
        <p className="font-medium text-slate-600 text-lg">Enrollment not found</p>
        <button
          onClick={() => router.push('/admin/programs?tab=enrollments')}
          className="btn-primary px-5 py-2.5 rounded-xl text-white bg-primary text-xs font-medium transition-all cursor-pointer"
        >
          Back to enrollments
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-750 w-full">
      {/* Header with Back button */}
      <div className="flex items-center gap-4 border-b border-border/10 pb-6">
        <button
          onClick={() => router.push('/admin/programs?tab=enrollments')}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-secondary/50 hover:bg-secondary border border-border/50 shadow-sm transition-all hover:scale-105"
        >
          <ArrowLeft size={20} className="text-slate-600" />
        </button>
        <div>
          <span className="inline-flex items-center gap-1 bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-medium mb-1">
            <Award size={12} />
            Student enrollment detail
          </span>
          <h1 className="text-3xl font-medium tracking-tight text-slate-700">
            {enrollment.guestName || enrollment.user.profile?.displayName || enrollment.user.username || 'Anonymous Student'}
          </h1>
          <p className="text-sm font-normal text-muted-foreground/80 mt-0.5">
            Enrolled on {new Date(enrollment.createdAt).toLocaleDateString('en-IN', {
              day: '2-digit',
              month: 'long',
              year: 'numeric'
            })} at {new Date(enrollment.createdAt).toLocaleTimeString('en-IN', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: true
            })}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Profile Details Card */}
        <div className="bg-white border border-border/30 rounded-[2.5rem] shadow-xl p-8 space-y-6">
          <h2 className="text-lg font-medium text-slate-600 border-b border-border/30 pb-3 flex items-center gap-2">
            <Users size={20} className="text-primary/80" />
            Student profile details
          </h2>

          <div className="space-y-4 font-normal text-sm">
            <div className="flex flex-col gap-1 p-3 bg-secondary/30 rounded-2xl border border-border/20">
              <span className="text-xs text-muted-foreground/80 font-normal">Username / ID</span>
              <span className="text-slate-600 font-medium">{enrollment.user.username || 'n/a'}</span>
            </div>

            <div className="flex flex-col gap-1 p-3 bg-secondary/30 rounded-2xl border border-border/20">
              <span className="text-xs text-muted-foreground/80 font-normal">Phone number</span>
              <span className="text-slate-600 font-medium">{enrollment.user.phone}</span>
            </div>

            <div className="flex flex-col gap-1 p-3 bg-secondary/30 rounded-2xl border border-border/20">
              <span className="text-xs text-muted-foreground/80 font-normal">Parent email</span>
              <span className="text-slate-600 font-medium truncate">{enrollment.guestEmail || enrollment.user.parentEmail || 'Not provided'}</span>
            </div>

            <div className="flex flex-col gap-1 p-3 bg-secondary/30 rounded-2xl border border-border/20">
              <span className="text-xs text-muted-foreground/80 font-normal">Account role</span>
              <span className="text-slate-600 font-medium text-xs inline-block bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md w-max">
                {getFriendlyRole(enrollment.user.role || 'PARENT')}
              </span>
            </div>
          </div>
        </div>

        {/* Program Details Card */}
        <div className="bg-white border border-border/30 rounded-[2.5rem] shadow-xl p-8 space-y-6">
          <h2 className="text-lg font-medium text-slate-600 border-b border-border/30 pb-3 flex items-center gap-2">
            <CreditCard size={20} className="text-primary/80" />
            Enrolled program details
          </h2>

          <div className="space-y-4 font-normal text-sm">
            <div className="flex flex-col gap-1 p-3 bg-secondary/30 rounded-2xl border border-border/20">
              <span className="text-xs text-muted-foreground/80 font-normal">Program title</span>
              <span className="text-slate-600 font-medium">{enrollment.program.title}</span>
            </div>

            <div className="flex flex-col gap-1 p-3 bg-secondary/30 rounded-2xl border border-border/20">
              <span className="text-xs text-muted-foreground/80 font-normal">Target cohort</span>
              <span className="text-slate-600 font-medium">{enrollment.program.classRange}</span>
            </div>

            <div className="flex flex-col gap-1 p-3 bg-secondary/30 rounded-2xl border border-border/20">
              <span className="text-xs text-muted-foreground/80 font-normal">Program publishing status</span>
              <span className={`text-[10px] font-medium px-2.5 py-0.5 rounded-md border w-max ${enrollment.program.isActive
                ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/10'
                : 'bg-amber-500/10 text-amber-600 border-amber-500/10'
                }`}>
                {enrollment.program.isActive ? 'Active (published)' : 'Draft'}
              </span>
            </div>

            <div className="flex flex-col gap-1 p-3 bg-secondary/30 rounded-2xl border border-border/20">
              <span className="text-xs text-muted-foreground/80 font-normal">Pricing format & fee paid</span>
              <span className="text-slate-600 font-medium flex items-center gap-2">
                <span>{enrollment.type === 'PRIVATE' ? '1:1 Private' : 'Group Cohort'}</span>
                <span>•</span>
                <span className="text-primary/90">₹{enrollment.pricePaid.toLocaleString()}</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Status & Suspend/Reactivate Management Panel */}
      <div className="bg-white border border-border/30 rounded-[2.5rem] shadow-xl p-8 space-y-6">
        <h2 className="text-lg font-medium text-slate-600 border-b border-border/30 pb-3 flex items-center gap-2">
          <AlertCircle size={20} className="text-primary/80" />
          Enrollment status & lifecycle management
        </h2>

        <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-slate-50 border border-slate-200/50 p-6 rounded-3xl">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-slate-500">Current enrollment status:</span>
            <span className={`text-xs font-medium px-4 py-2 rounded-full inline-flex items-center gap-2 border shadow-sm ${enrollment.status === 'ACTIVE'
              ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
              : enrollment.status === 'SUSPENDED'
                ? 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                : enrollment.status === 'COMPLETED'
                  ? 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20'
                  : 'bg-rose-500/10 text-rose-600 border-rose-500/20'
              }`}>
              <div className={`w-2 h-2 rounded-full ${enrollment.status === 'ACTIVE' ? 'bg-emerald-500 animate-pulse' :
                enrollment.status === 'SUSPENDED' ? 'bg-amber-500' :
                  enrollment.status === 'COMPLETED' ? 'bg-indigo-500' : 'bg-rose-500'
                }`} />
              {getFriendlyStatus(enrollment.status)}
            </span>
          </div>

          <div className="flex flex-wrap gap-2.5 w-full md:w-auto justify-end">
            {enrollment.status === 'ACTIVE' ? (
              <button
                disabled={updating}
                onClick={() => handleUpdateStatus('SUSPENDED')}
                className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-medium transition-all shadow-md shadow-amber-500/20 flex items-center justify-center gap-2 text-xs cursor-pointer"
              >
                {updating ? <Loader2 className="animate-spin" size={14} /> : null}
                Suspend enrollment
              </button>
            ) : (
              <button
                disabled={updating}
                onClick={() => handleUpdateStatus('ACTIVE')}
                className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-medium transition-all shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2 text-xs cursor-pointer"
              >
                {updating ? <Loader2 className="animate-spin" size={14} /> : null}
                Reactivate enrollment
              </button>
            )}

            {enrollment.status === 'ACTIVE' && (
              <>
                <button
                  disabled={updating}
                  onClick={() => handleUpdateStatus('COMPLETED')}
                  className="px-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-medium transition-all shadow-md shadow-indigo-500/20 flex items-center justify-center gap-2 text-xs cursor-pointer"
                >
                  Mark completed
                </button>
                <button
                  disabled={updating}
                  onClick={() => handleUpdateStatus('CANCELLED')}
                  className="px-6 py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-medium transition-all shadow-md shadow-rose-500/20 flex items-center justify-center gap-2 text-xs cursor-pointer"
                >
                  Cancel enrollment
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
