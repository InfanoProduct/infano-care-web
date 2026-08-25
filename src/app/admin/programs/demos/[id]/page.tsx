'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ProgramsService, DemoSession } from '@/services/programs.service';
import { ArrowLeft, Users, Phone, Mail, Award, Calendar, Clock, Loader2, AlertCircle, Sparkles, Check, ShieldAlert, Video, CreditCard, CheckCircle2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

// Helper functions for human-friendly questionnaire labels
const getConfidenceLabel = (val: string) => {
  if (!val) return '';
  const map: Record<string, string> = {
    shy: 'Quiet & Observant',
    selective: 'Thoughtful & Selective',
    balanced: 'Balanced & Easygoing',
    outgoing: 'Vibrant & Expressive'
  };
  return val.split(',').map(v => map[v.trim()] || v.trim()).join(', ');
};

const getInterestsLabel = (val: string) => {
  const map: Record<string, string> = {
    puberty: 'Puberty & Body Changes',
    emotional: 'Emotional Balance',
    relationships: 'Social & Friendships',
    identity: 'Self-Esteem & Expression',
    digital: 'Digital Safety'
  };
  return map[val] || val;
};

const getHasMentorLabel = (val: string) => {
  const map: Record<string, string> = {
    yes: 'Yes, she has a wonderful mentor',
    no_but_wanted: 'Not yet, but she would highly benefit from one',
    family_focused: 'She primarily relies on close family support'
  };
  return map[val] || val;
};

const getChallengesLabel = (val: string) => {
  const map: Record<string, string> = {
    peer_pressure: 'Peer pressure or feeling left out',
    body_image: 'Body image concerns or self-doubt',
    studies: 'Academic stress or exam anxiety',
    friendships: 'Friendship drama or navigating social groups',
    career_confusion: 'Career confusion or future worries',
    other: 'Other personal growth challenges'
  };
  return map[val] || val;
};

const getLearningPrefLabel = (val: string) => {
  const map: Record<string, string> = {
    talking: 'Empathetic Discussion',
    doing: 'Hands-on Activities',
    reading: 'Self-paced Reading/Watching',
    group: 'Collaborative Groups'
  };
  return map[val] || val;
};

const getParentInvolvementLabel = (val: string) => {
  const map: Record<string, string> = {
    weekly: 'Weekly Summary & Insights',
    monthly: 'Monthly Milestones Check-in',
    minimal: 'Supportive & Hands-off'
  };
  return map[val] || val;
};

export default function DemoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = React.use(params);
  const router = useRouter();
  const [demo, setDemo] = useState<DemoSession | null>(null);
  const [loading, setLoading] = useState(true);

  // Fields to update
  const [currentStatus, setCurrentStatus] = useState<string>('PENDING');
  const [readyToEnroll, setReadyToEnroll] = useState<boolean>(false);
  const [comment, setComment] = useState<string>('');
  const [saving, setSaving] = useState(false);

  // Scheduling fields
  const [meetLink, setMeetLink] = useState<string>('');
  const [slotDate, setSlotDate] = useState<string>('');
  const [slotTime, setSlotTime] = useState<string>('');
  const [savingSchedule, setSavingSchedule] = useState(false);

  const fetchDemo = async () => {
    try {
      const data = await ProgramsService.getAdminDemo(resolvedParams.id);
      if (data) {
        setDemo(data);
        setCurrentStatus(data.status);
        setReadyToEnroll(data.isReadyToEnroll || false);
        setComment(data.comment || '');
        setMeetLink(data.meetLink || '');
        setSlotDate(data.slotDate || '');
        setSlotTime(data.slotTime || '');
      } else {
        toast.error('Demo booking not found');
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to load demo session details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDemo();
  }, [resolvedParams.id]);

  const handleUpdateStatus = async (statusOption: string) => {
    if (!demo) return;
    try {
      const updated = await ProgramsService.updateDemoStatus(demo.id, { status: statusOption });
      setCurrentStatus(statusOption);
      setDemo(updated);
      toast.success(`Demo status updated to ${statusOption.toLowerCase()}`);
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleUpdatePaymentStatus = async (newPaymentStatus: string) => {
    if (!demo) return;
    try {
      const updated = await ProgramsService.updateDemoStatus(demo.id, { paymentStatus: newPaymentStatus });
      setDemo(updated);
      toast.success(`Payment status updated to ${newPaymentStatus}`);
    } catch (error) {
      toast.error('Failed to update payment status');
    }
  };

  const handleSaveReadiness = async () => {
    if (!demo) return;
    setSaving(true);
    try {
      const updated = await ProgramsService.updateDemoStatus(demo.id, {
        isReadyToEnroll: readyToEnroll,
        comment: comment
      });
      setDemo(updated);
      toast.success('Enrollment readiness status and comments saved');
    } catch (error) {
      toast.error('Failed to save readiness details');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!demo) return;
    setSavingSchedule(true);
    try {
      let targetStatus = currentStatus;
      if (meetLink.trim() && currentStatus === 'PENDING') {
        targetStatus = 'SCHEDULED';
      }
      const updated = await ProgramsService.updateDemoStatus(demo.id, {
        meetLink,
        slotDate,
        slotTime,
        status: targetStatus
      });
      setDemo(updated);
      setCurrentStatus(targetStatus);
      toast.success('Meeting scheduled successfully!');
    } catch (error) {
      toast.error('Failed to save meeting schedule');
    } finally {
      setSavingSchedule(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-primary" size={48} />
        <p className="font-normal text-muted-foreground/80">Loading demo details...</p>
      </div>
    );
  }

  if (!demo) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center p-8 gap-4">
        <ShieldAlert className="text-rose-500" size={48} />
        <p className="font-medium text-slate-600 text-lg">Demo session booking not found</p>
        <button
          onClick={() => router.push('/admin/programs?tab=demos')}
          className="btn-primary px-5 py-2.5 rounded-xl text-white bg-primary text-xs font-medium transition-all cursor-pointer"
        >
          Back to demos
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-750 w-full">
      {/* Header with Back button */}
      <div className="flex items-center gap-4 border-b border-border/10 pb-6">
        <button
          onClick={() => router.push('/admin/programs?tab=demos')}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-secondary/50 hover:bg-secondary border border-border/50 shadow-sm transition-all hover:scale-105"
        >
          <ArrowLeft size={20} className="text-slate-600" />
        </button>
        <div>
          <span className="inline-flex items-center gap-1 bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-medium mb-1">
            <Award size={12} />
            Demo session details
          </span>
          <h1 className="text-3xl font-medium tracking-tight text-slate-700">
            {demo.parentName}
          </h1>
          <p className="text-sm font-normal text-muted-foreground/80 mt-0.5">
            Requested on {new Date(demo.createdAt).toLocaleDateString('en-IN', {
              day: '2-digit',
              month: 'long',
              year: 'numeric'
            })} at {new Date(demo.createdAt).toLocaleTimeString('en-IN', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: true
            })}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Parent & Slot Details Card */}
        <div className="bg-white border border-border/30 rounded-[2.5rem] shadow-xl p-8 space-y-6">
          <h2 className="text-lg font-medium text-slate-600 border-b border-border/30 pb-3 flex items-center gap-2">
            <Users size={20} className="text-primary/80" />
            Parent contact & slot details
          </h2>

          <div className="space-y-4 font-normal text-sm">
            <div className="flex flex-col gap-1 p-3 bg-secondary/30 rounded-2xl border border-border/20">
              <span className="text-xs text-muted-foreground/80 font-normal">Parent / contact name</span>
              <span className="text-slate-600 font-medium">{demo.parentName}</span>
            </div>

            <div className="flex flex-col gap-1 p-3 bg-secondary/30 rounded-2xl border border-border/20">
              <span className="text-xs text-muted-foreground/80 font-normal">Phone number</span>
              <a href={`tel:${demo.phone}`} className="text-primary hover:underline font-medium">{demo.phone}</a>
            </div>

            <div className="flex flex-col gap-1 p-3 bg-secondary/30 rounded-2xl border border-border/20">
              <span className="text-xs text-muted-foreground/80 font-normal">Email address</span>
              <span className="text-slate-600 font-medium truncate">{demo.email || 'Not provided'}</span>
            </div>

            <div className="flex flex-col gap-1 p-3 bg-secondary/30 rounded-2xl border border-border/20">
              <span className="text-xs text-muted-foreground/80 font-normal">Target class cohort</span>
              <span className="text-slate-600 font-medium">{demo.classRange}</span>
            </div>

            <div className="flex flex-col gap-1 p-3 bg-secondary/30 rounded-2xl border border-border/20">
              <span className="text-xs text-muted-foreground/80 font-normal">Requested slot date & time</span>
              {demo.slotDate && demo.slotTime ? (
                <span className="text-slate-600 font-medium">
                  {new Date(demo.slotDate).toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric'
                  })} at {demo.slotTime}
                </span>
              ) : (
                <span className="text-muted-foreground/60 font-medium">No slot requested</span>
              )}
            </div>
          </div>
        </div>

        {/* Payment & Transaction Information Card */}
        <div className="bg-white border border-border/30 rounded-[2.5rem] shadow-xl p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-border/30 pb-3">
            <h2 className="text-lg font-medium text-slate-600 flex items-center gap-2">
              <CreditCard size={20} className="text-primary/80" />
              Payment & Fee Details
            </h2>
            <span className={`text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full border ${
              demo.paymentStatus === 'COMPLETED'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-amber-50 text-amber-700 border-amber-200'
            }`}>
              {demo.paymentStatus === 'COMPLETED' ? 'PAID' : 'PENDING'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1 p-3 bg-secondary/30 rounded-2xl border border-border/20">
              <span className="text-xs text-muted-foreground/80 font-normal">Demo Fee Amount</span>
              <span className="text-base font-extrabold text-slate-800">₹{demo.amount || 29} INR</span>
            </div>

            <div className="flex flex-col gap-1 p-3 bg-secondary/30 rounded-2xl border border-border/20">
              <span className="text-xs text-muted-foreground/80 font-normal">Payment Method</span>
              <span className="text-slate-600 font-medium">{demo.paymentMethod || 'ONLINE (Razorpay)'}</span>
            </div>

            {demo.razorpayOrderId && (
              <div className="flex flex-col gap-1 p-3 bg-secondary/30 rounded-2xl border border-border/20">
                <span className="text-xs text-muted-foreground/80 font-normal">Razorpay Order ID</span>
                <span className="font-mono text-xs text-slate-700 truncate" title={demo.razorpayOrderId}>
                  {demo.razorpayOrderId}
                </span>
              </div>
            )}

            {demo.razorpayPaymentId && (
              <div className="flex flex-col gap-1 p-3 bg-secondary/30 rounded-2xl border border-border/20">
                <span className="text-xs text-muted-foreground/80 font-normal">Razorpay Payment ID</span>
                <span className="font-mono text-xs text-slate-700 truncate" title={demo.razorpayPaymentId}>
                  {demo.razorpayPaymentId}
                </span>
              </div>
            )}
          </div>

          {/* Admin Override Payment Status */}
          <div className="pt-2 flex items-center justify-between gap-3 border-t border-border/20">
            <span className="text-xs text-muted-foreground font-medium">Quick Override Payment Status:</span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleUpdatePaymentStatus('COMPLETED')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  demo.paymentStatus === 'COMPLETED'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200'
                }`}
              >
                Mark Paid
              </button>
              <button
                type="button"
                onClick={() => handleUpdatePaymentStatus('PENDING')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  demo.paymentStatus === 'PENDING'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200'
                }`}
              >
                Mark Pending
              </button>
            </div>
          </div>
        </div>

        {/* Schedule Demo Meeting Card */}
        <div className="bg-white border border-border/30 rounded-[2.5rem] shadow-xl p-8 space-y-6">
          <h2 className="text-lg font-medium text-slate-600 border-b border-border/30 pb-3 flex items-center gap-2">
            <Video size={20} className="text-primary/80" />
            Schedule Demo Meeting
          </h2>

          <form onSubmit={handleSaveSchedule} className="space-y-4 font-normal text-sm">
            <div className="flex flex-col gap-1 p-3 bg-secondary/30 rounded-2xl border border-border/20">
              <span className="text-xs text-muted-foreground/80 font-normal">Meet Link (Google Meet / Zoom)</span>
              <input
                type="url"
                required
                placeholder="https://meet.google.com/abc-defg-hij"
                value={meetLink}
                onChange={(e) => setMeetLink(e.target.value)}
                className="w-full bg-white border border-border/20 rounded-xl px-3 py-2 text-xs font-normal text-slate-600 placeholder:text-slate-400 outline-none focus:border-primary/50 transition-all leading-relaxed"
              />
            </div>

            <div className="flex flex-col gap-1 p-3 bg-secondary/30 rounded-2xl border border-border/20">
              <span className="text-xs text-muted-foreground/80 font-normal">Scheduled Date</span>
              <input
                type="date"
                required
                value={slotDate}
                onChange={(e) => setSlotDate(e.target.value)}
                className="w-full bg-white border border-border/20 rounded-xl px-3 py-2 text-xs font-normal text-slate-600 outline-none focus:border-primary/50 transition-all cursor-pointer leading-relaxed"
              />
            </div>

            <div className="flex flex-col gap-1 p-3 bg-secondary/30 rounded-2xl border border-border/20">
              <span className="text-xs text-muted-foreground/80 font-normal">Scheduled Time Slot</span>
              <select
                required
                value={slotTime}
                onChange={(e) => setSlotTime(e.target.value)}
                className="w-full bg-white border border-border/20 rounded-xl px-3 py-2 text-xs font-normal text-slate-650 outline-none focus:border-primary/50 transition-all cursor-pointer leading-relaxed"
              >
                <option value="">Select Time</option>
                <option value="09:00 AM - 09:30 AM">09:00 AM - 09:30 AM</option>
                <option value="09:30 AM - 10:00 AM">09:30 AM - 10:00 AM</option>
                <option value="10:00 AM - 10:30 AM">10:00 AM - 10:30 AM</option>
                <option value="10:30 AM - 11:00 AM">10:30 AM - 11:00 AM</option>
                <option value="11:00 AM - 11:30 AM">11:00 AM - 11:30 AM</option>
                <option value="11:30 AM - 12:00 PM">11:30 AM - 12:00 PM</option>
                <option value="12:00 PM - 12:30 PM">12:00 PM - 12:30 PM</option>
                <option value="12:30 PM - 01:00 PM">12:30 PM - 01:00 PM</option>
                <option value="02:00 PM - 02:30 PM">02:00 PM - 02:30 PM</option>
                <option value="02:30 PM - 03:00 PM">02:30 PM - 03:00 PM</option>
                <option value="03:00 PM - 03:30 PM">03:00 PM - 03:30 PM</option>
                <option value="03:30 PM - 04:00 PM">03:30 PM - 04:00 PM</option>
                <option value="04:00 PM - 04:30 PM">04:00 PM - 04:30 PM</option>
                <option value="04:30 PM - 05:00 PM">04:30 PM - 05:00 PM</option>
                <option value="05:00 PM - 05:30 PM">05:00 PM - 05:30 PM</option>
                <option value="05:30 PM - 06:00 PM">05:30 PM - 06:00 PM</option>
                <option value="06:00 PM - 06:30 PM">06:00 PM - 06:30 PM</option>
                <option value="06:30 PM - 07:00 PM">06:30 PM - 07:00 PM</option>
              </select>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={savingSchedule}
                className="w-full justify-center px-5 py-2.5 bg-primary text-white font-medium rounded-xl shadow-md shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2 text-xs cursor-pointer disabled:opacity-50"
              >
                {savingSchedule && <Loader2 className="animate-spin" size={12} />}
                <span>{savingSchedule ? 'Scheduling...' : 'Save Schedule'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Booking Status & Enrollment Readiness Card */}
        <div className="bg-white border border-border/30 rounded-[2.5rem] shadow-xl p-8 space-y-6">
          <h2 className="text-lg font-medium text-slate-600 border-b border-border/30 pb-3 flex items-center gap-2">
            <AlertCircle size={20} className="text-primary/80" />
            Booking status & enrollment readiness
          </h2>

          <div className="space-y-4 font-normal text-sm">
            {/* Booking status picker */}
            <div className="space-y-2">
              <span className="text-xs text-muted-foreground/80 font-normal block">Booking status</span>
              <div className="grid grid-cols-2 gap-2">
                {(['PENDING', 'CONTACTED', 'SCHEDULED', 'COMPLETED', 'CANCELLED'] as const).map((statusOption) => {
                  const isCurrent = currentStatus === statusOption;
                  return (
                    <button
                      key={statusOption}
                      type="button"
                      onClick={() => handleUpdateStatus(statusOption)}
                      className={`text-left px-3 py-2 rounded-xl border text-[11px] font-medium transition-all flex items-center justify-between cursor-pointer ${
                        statusOption === 'PENDING' ? 'hover:bg-amber-50 border-amber-500/20 ' + (isCurrent ? 'bg-amber-500/10 text-amber-600 border-amber-500/30' : 'text-slate-600 bg-white') :
                        statusOption === 'CONTACTED' ? 'hover:bg-teal-50 border-teal-500/20 ' + (isCurrent ? 'bg-teal-500/10 text-teal-600 border-teal-500/30' : 'text-slate-600 bg-white') :
                        statusOption === 'SCHEDULED' ? 'hover:bg-purple-50 border-purple-500/20 ' + (isCurrent ? 'bg-purple-500/10 text-purple-600 border-purple-500/30' : 'text-slate-600 bg-white') :
                        statusOption === 'COMPLETED' ? 'hover:bg-emerald-50 border-emerald-500/20 ' + (isCurrent ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30' : 'text-slate-600 bg-white') :
                        'hover:bg-rose-50 border-rose-500/20 ' + (isCurrent ? 'bg-rose-500/10 text-rose-600 border-rose-500/30' : 'text-slate-600 bg-white')
                      }`}
                    >
                      <span>{statusOption.charAt(0) + statusOption.slice(1).toLowerCase()}</span>
                      {isCurrent && <Check size={12} className="stroke-[2px]" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Is Ready to Enroll Premium Radio Selector */}
            <div className="flex flex-col gap-2 p-3 bg-secondary/30 rounded-2xl border border-border/20">
              <span className="text-xs text-muted-foreground/80 font-normal">Is this student ready for enrollment?</span>
              <div className="grid grid-cols-2 gap-3 mt-1">
                {/* Option 1: Yes */}
                <button
                  type="button"
                  onClick={() => setReadyToEnroll(true)}
                  className={`flex items-center justify-between p-3 rounded-xl border text-xs font-medium transition-all duration-200 cursor-pointer text-left hover:scale-[1.01] active:scale-[0.99] ${
                    readyToEnroll === true
                      ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30 ring-1 ring-emerald-500/20'
                      : 'bg-white border-border/20 text-slate-500 hover:border-slate-300'
                  }`}
                >
                  <span>Yes, ready to enroll</span>
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${
                    readyToEnroll === true ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-slate-300 bg-white'
                  }`}>
                    {readyToEnroll === true && <Check size={10} className="stroke-[3px]" />}
                  </div>
                </button>

                {/* Option 2: No */}
                <button
                  type="button"
                  onClick={() => setReadyToEnroll(false)}
                  className={`flex items-center justify-between p-3 rounded-xl border text-xs font-medium transition-all duration-200 cursor-pointer text-left hover:scale-[1.01] active:scale-[0.99] ${
                    readyToEnroll === false
                      ? 'bg-amber-500/10 text-amber-600 border-amber-500/30 ring-1 ring-amber-500/20'
                      : 'bg-white border-border/20 text-slate-500 hover:border-slate-300'
                  }`}
                >
                  <span>Not yet</span>
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${
                    readyToEnroll === false ? 'border-amber-500 bg-amber-500 text-white' : 'border-slate-300 bg-white'
                  }`}>
                    {readyToEnroll === false && <Check size={10} className="stroke-[3px]" />}
                  </div>
                </button>
              </div>
            </div>

            {/* Comment Box */}
            <div className="flex flex-col gap-2 p-3 bg-secondary/30 rounded-2xl border border-border/20">
              <label className="text-xs text-muted-foreground/80 font-normal">Admin notes / comments</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Add notes about this demo session, observations..."
                rows={3}
                className="w-full bg-white border border-border/20 rounded-xl px-3 py-2 text-xs font-normal text-slate-600 placeholder:text-slate-400 outline-none focus:border-primary/50 transition-all resize-none leading-relaxed"
              />
            </div>

            {/* Save Button */}
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={handleSaveReadiness}
                disabled={saving}
                className="px-5 py-2.5 bg-primary text-white font-medium rounded-xl shadow-md shadow-primary/20 transition-all hover:scale-105 active:scale-95 flex items-center gap-2 text-xs cursor-pointer disabled:opacity-50"
              >
                {saving && <Loader2 className="animate-spin" size={12} />}
                <span>{saving ? 'Saving...' : 'Save details'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
