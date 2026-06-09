'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ProgramsService, DemoSession } from '@/services/programs.service';
import { 
  ArrowLeft, Calendar, Clock, Phone, Mail, Sliders, Check, Loader2, Award 
} from 'lucide-react';
import { toast } from 'react-hot-toast';

// Helper functions for human-friendly questionnaire labels
const getConfidenceLabel = (val: string) => {
  if (!val) return '';
  const map: Record<string, string> = {
    shy: 'quiet & observant',
    selective: 'thoughtful & selective',
    balanced: 'balanced & easygoing',
    outgoing: 'vibrant & expressive'
  };
  return val.split(',').map(v => map[v.trim()] || v.trim()).join(', ');
};

const getInterestsLabel = (val: string) => {
  const map: Record<string, string> = {
    puberty: 'puberty & body changes',
    emotional: 'emotional balance',
    relationships: 'social & friendships',
    identity: 'self-esteem & expression',
    digital: 'digital safety'
  };
  return map[val] || val;
};

const getHasMentorLabel = (val: string) => {
  const map: Record<string, string> = {
    yes: 'yes, she has a wonderful mentor',
    no_but_wanted: 'not yet, but she would highly benefit from one',
    family_focused: 'she primarily relies on close family support'
  };
  return map[val] || val;
};

const getChallengesLabel = (val: string) => {
  const map: Record<string, string> = {
    peer_pressure: 'peer pressure or feeling left out',
    body_image: 'body image concerns or self-doubt',
    studies: 'academic stress or exam anxiety',
    friendships: 'friendship drama or navigating social groups',
    career_confusion: 'career confusion or future worries',
    other: 'other personal growth challenges'
  };
  return map[val] || val;
};

const getLearningPrefLabel = (val: string) => {
  const map: Record<string, string> = {
    talking: 'empathetic discussion',
    doing: 'hands-on activities',
    reading: 'self-paced reading/watching',
    group: 'collaborative groups'
  };
  return map[val] || val;
};

const getParentInvolvementLabel = (val: string) => {
  const map: Record<string, string> = {
    weekly: 'weekly summary & insights',
    monthly: 'monthly milestones check-in',
    minimal: 'supportive & hands-off'
  };
  return map[val] || val;
};

const formatStatus = (status: string) => {
  if (!status) return '';
  return status.toLowerCase();
};

export default function DemoSessionDetail({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = React.use(params);
  const router = useRouter();
  const [demo, setDemo] = useState<DemoSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const fetchDemo = async () => {
    try {
      const data = await ProgramsService.getAdminDemo(resolvedParams.id);
      setDemo(data);
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

  const handleUpdateStatus = async (status: string) => {
    if (!demo) return;
    setUpdating(true);
    try {
      await ProgramsService.updateDemoStatus(demo.id, { status });
      toast.success(`Booking status updated to ${formatStatus(status)}`);
      fetchDemo();
    } catch (error) {
      console.error(error);
      toast.error('Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <Loader2 className="animate-spin text-primary" size={40} />
        <span className="font-semibold text-slate-500 text-sm">loading details...</span>
      </div>
    );
  }

  if (!demo) {
    return <div className="p-8 text-center text-rose-500 font-bold">demo session booking not found.</div>;
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12 w-full">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-secondary/50 hover:bg-secondary transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1 bg-primary/10 text-primary px-3 py-0.5 rounded-full text-xs font-semibold">
              <Award size={10} />
              demo session request
            </span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-800 mt-1 mb-1">
            {demo.parentName.toLowerCase()}
          </h1>
          <p className="text-muted-foreground text-xs font-medium">
            requested on {new Date(demo.createdAt).toLocaleDateString('en-IN', {
              day: '2-digit',
              month: 'long',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left Column: Quick Contact & Status Update */}
        <div className="md:col-span-1 space-y-6">
          
          <div className="bg-white border border-border/30 rounded-3xl p-6 shadow-sm space-y-6">
            <div>
              <h3 className="text-xs font-semibold text-muted-foreground mb-3">parent contact</h3>
              <div className="space-y-3 font-semibold text-sm">
                <a 
                  href={`tel:${demo.phone}`}
                  className="flex items-center gap-2.5 p-3 rounded-xl bg-secondary/50 border border-border/50 hover:border-primary/30 hover:text-primary transition-all text-foreground"
                >
                  <Phone size={16} className="text-primary shrink-0" />
                  <span className="break-all font-semibold">{demo.phone}</span>
                </a>
                
                {demo.email ? (
                  <a 
                    href={`mailto:${demo.email}`}
                    className="flex items-center gap-2.5 p-3 rounded-xl bg-secondary/50 border border-border/50 hover:border-primary/30 hover:text-primary transition-all text-foreground"
                  >
                    <Mail size={16} className="text-primary shrink-0" />
                    <span className="break-all text-xs font-semibold">{demo.email}</span>
                  </a>
                ) : (
                  <div className="flex items-center gap-2.5 p-3 rounded-xl bg-secondary/30 border border-border/30 text-muted-foreground text-xs">
                    <Mail size={16} className="shrink-0 text-muted-foreground/60" />
                    <span>no email provided</span>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-xs font-semibold text-muted-foreground">class cohort</h3>
              <div className="px-4 py-3 bg-primary/5 text-primary border border-primary/10 rounded-2xl text-center">
                <span className="text-sm font-semibold">{demo.classRange}</span>
              </div>
            </div>

            {/* Requested Slot */}
            <div className="space-y-3">
              <h3 className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                <Clock size={12} className="text-primary shrink-0" /> requested slot
              </h3>
              {demo.slotDate && demo.slotTime ? (
                <div className="p-4 bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20 rounded-2xl flex flex-col gap-2 shadow-sm">
                  <div className="flex items-center gap-2 text-primary">
                    <Calendar size={14} className="shrink-0" />
                    <span className="text-xs font-semibold">
                      {new Date(demo.slotDate).toLocaleDateString('en-IN', {
                        weekday: 'short',
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-primary">
                    <Clock size={14} className="shrink-0" />
                    <span className="text-xs font-semibold">{demo.slotTime}</span>
                  </div>
                </div>
              ) : (
                <div className="px-4 py-3 bg-slate-50 text-slate-400 border border-slate-100 rounded-2xl text-center text-xs font-semibold">
                  no slot requested
                </div>
              )}
            </div>

            <div className="space-y-3">
              <h3 className="text-xs font-semibold text-muted-foreground">booking status</h3>
              
              {/* Status Picker Selector */}
              <div className="space-y-2">
                {(['PENDING', 'CONTACTED', 'SCHEDULED', 'COMPLETED', 'CANCELLED'] as const).map((status) => {
                  const isCurrent = demo.status === status;
                  return (
                    <button
                      key={status}
                      disabled={updating}
                      onClick={() => handleUpdateStatus(status)}
                      className={`w-full text-left px-4 py-2.5 rounded-xl border text-xs font-semibold transition-all flex items-center justify-between ${
                        status === 'PENDING' ? 'hover:bg-amber-50 border-amber-500/20 ' + (isCurrent ? 'bg-amber-500/10 text-amber-600 border-amber-500/30 ring-1 ring-amber-500/20 font-semibold' : 'text-slate-650') :
                        status === 'CONTACTED' ? 'hover:bg-teal-50 border-teal-500/20 ' + (isCurrent ? 'bg-teal-500/10 text-teal-600 border-teal-500/30 ring-1 ring-teal-500/20 font-semibold' : 'text-slate-650') :
                        status === 'SCHEDULED' ? 'hover:bg-purple-50 border-purple-500/20 ' + (isCurrent ? 'bg-purple-500/10 text-purple-600 border-purple-500/30 ring-1 ring-purple-500/20 font-semibold' : 'text-slate-650') :
                        status === 'COMPLETED' ? 'hover:bg-emerald-50 border-emerald-500/20 ' + (isCurrent ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30 ring-1 ring-emerald-500/20 font-semibold' : 'text-slate-650') :
                        'hover:bg-rose-50 border-rose-500/20 ' + (isCurrent ? 'bg-rose-500/10 text-rose-600 border-rose-500/30 ring-1 ring-rose-500/20 font-semibold' : 'text-slate-650')
                      }`}
                    >
                      <span>{formatStatus(status)}</span>
                      {isCurrent && <Check size={14} className="stroke-[3px]" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Empathetic Assessment Profile */}
        <div className="md:col-span-2 space-y-6">
          
          <div className="bg-white border border-border/30 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
            <h3 className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5 border-b border-slate-100 pb-3">
              <Sliders size={16} className="text-primary" />
              empathetic child assessment profile
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Social Confidence */}
              <div className="bg-secondary/40 border border-border/40 rounded-2xl p-4 space-y-1">
                <p className="text-xs font-medium text-muted-foreground">social confidence</p>
                <p className="text-xs font-semibold text-slate-700">{getConfidenceLabel(demo.confidence)}</p>
              </div>

              {/* Primary Interests */}
              <div className="bg-secondary/40 border border-border/40 rounded-2xl p-4 space-y-1">
                <p className="text-xs font-medium text-muted-foreground">primary development focus</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {demo.interests && demo.interests.map((interest, i) => (
                    <span key={i} className="text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded animate-none">
                      {getInterestsLabel(interest)}
                    </span>
                  ))}
                </div>
              </div>

              {/* Mentorship Support */}
              <div className="bg-secondary/40 border border-border/40 rounded-2xl p-4 space-y-1">
                <p className="text-xs font-medium text-muted-foreground">mentorship status</p>
                <p className="text-xs font-semibold text-slate-700">{getHasMentorLabel(demo.hasMentor)}</p>
              </div>

              {/* Learning Preference */}
              <div className="bg-secondary/40 border border-border/40 rounded-2xl p-4 space-y-1">
                <p className="text-xs font-medium text-muted-foreground">learning preference</p>
                <p className="text-xs font-semibold text-slate-700">{getLearningPrefLabel(demo.learningPref)}</p>
              </div>

              {/* Parental Involvement */}
              <div className="bg-secondary/40 border border-border/40 rounded-2xl p-4 space-y-1 sm:col-span-2">
                <p className="text-xs font-medium text-muted-foreground">parent involvement level</p>
                <p className="text-xs font-semibold text-slate-700">{getParentInvolvementLabel(demo.parentInvolvement)}</p>
              </div>
            </div>

            {/* Challenges Faced Checklist */}
            <div className="space-y-3">
              <p className="text-xs font-semibold text-muted-foreground">growth challenges in past year</p>
              {demo.challenges && demo.challenges.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {demo.challenges.map((challenge: string, idx: number) => (
                    <span 
                      key={idx}
                      className="text-xs font-medium bg-rose-500/5 text-rose-500 border border-rose-500/10 px-3 py-1.5 rounded-xl flex items-center gap-1.5"
                    >
                      <span className="w-1.5 h-1.5 bg-rose-500 rounded-full shrink-0" />
                      {getChallengesLabel(challenge)}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground/65 font-medium">no challenges specified</p>
              )}
            </div>

            {/* Recommended Programs & Tiers */}
            <div className="border-t border-border/30 pt-6 space-y-3">
              <p className="text-xs font-semibold text-muted-foreground">recommended program formats</p>
              <div className="flex flex-wrap gap-2">
                {demo.suggestedPrograms && demo.suggestedPrograms.map((prog: string, idx: number) => (
                  <span 
                    key={idx} 
                    className="text-xs font-semibold bg-primary/10 text-primary border border-primary/20 px-3.5 py-2 rounded-2xl shadow-sm inline-flex items-center gap-2"
                  >
                    <span className="w-2 h-2 bg-primary rounded-full shrink-0" />
                    {prog.toLowerCase()}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
