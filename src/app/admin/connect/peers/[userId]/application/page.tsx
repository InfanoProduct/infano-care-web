'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import { UserApiService } from '@/features/users/services/user-api';
import { ONBOARDING_SCENARIOS } from '@/lib/peerline-constants';
import {
  ArrowLeft, Shield, MessageCircle, Loader2,
  CheckCircle2, Clock, User, Mail, Phone, FileText
} from 'lucide-react';

export default function PeerApplicationPage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = use(params);
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState(false);

  useEffect(() => {
    apiClient.get(`/admin/users/${userId}`)
      .then((res: any) => setUser(res))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [userId]);

  const handleApprove = async () => {
    setApproving(true);
    try {
      await UserApiService.approvePeer(userId);
      router.push('/admin/connect/peers');
    } catch (err: any) {
      alert(err.message || 'Failed to approve');
    } finally {
      setApproving(false);
    }
  };

  if (loading) return (
    <div className="p-16 flex flex-col items-center justify-center gap-4">
      <Loader2 className="animate-spin text-primary" size={40} />
      <p className="text-muted-foreground font-bold">Loading application...</p>
    </div>
  );

  if (!user || !user.peerApplication) return (
    <div className="p-16 text-center">
      <p className="text-muted-foreground font-bold">Application not found.</p>
    </div>
  );

  const app = user.peerApplication;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="admin-header flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-2 bg-white border border-border rounded-xl hover:bg-secondary transition-all shadow-sm"
        >
          <ArrowLeft size={18} className="text-muted-foreground" />
        </button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Peer <span className="text-primary">Application</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Detailed candidate review</p>
        </div>
        <div className="ml-auto flex gap-3">
          {app.status !== 'approved' && (
            <button
              disabled={approving}
              onClick={handleApprove}
              className="px-5 py-2.5 bg-primary text-white font-semibold text-sm rounded-xl transition-all shadow-md shadow-primary/20 active:scale-95 flex items-center gap-2 disabled:opacity-50 hover:shadow-lg"
            >
              {approving ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
              Approve Application
            </button>
          )}
        </div>
      </div>

      {/* Identity Card */}
      <div className="glass-card rounded-2xl overflow-hidden border-white/40 shadow-xl">
        <div className="bg-slate-50/50 p-6 border-b border-border">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary-light/10 flex items-center justify-center text-primary font-bold text-2xl shadow-lg border border-primary/10">
              {user.profile?.displayName?.[0] || 'U'}
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">{user.profile?.displayName || app.name || 'Unknown'}</h2>
              <p className="text-xs text-muted-foreground mt-0.5">ID: {user.id}</p>
            </div>
            <div className="ml-auto">
              {app.status === 'approved'
                ? <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 rounded-xl text-xs font-semibold border border-green-200"><CheckCircle2 size={14} /> Approved</span>
                : <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-700 rounded-xl text-xs font-semibold border border-amber-200"><Clock size={14} /> Pending Review</span>
              }
            </div>
          </div>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 bg-primary/10 rounded-lg flex items-center justify-center">
                <User size={14} className="text-primary" />
              </div>
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Full Name</p>
            </div>
            <p className="font-semibold text-slate-800">{app.name || 'N/A'}</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 bg-primary/10 rounded-lg flex items-center justify-center">
                <Mail size={14} className="text-primary" />
              </div>
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Email Address</p>
            </div>
            <p className="font-semibold text-slate-800">{app.email || 'N/A'}</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 bg-primary/10 rounded-lg flex items-center justify-center">
                <Phone size={14} className="text-primary" />
              </div>
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Phone Number</p>
            </div>
            <p className="font-semibold text-slate-800">{app.phone || user.phone || 'N/A'}</p>
          </div>
        </div>
      </div>

      {/* Personal Statement */}
      <div className="glass-card rounded-2xl overflow-hidden border-white/40 shadow-xl">
        <div className="p-6 border-b border-border bg-slate-50/30">
          <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
            <FileText size={18} className="text-primary" />
            Personal Statement
          </h3>
        </div>
        <div className="p-6">
          <div className="p-6 bg-white border border-slate-100 rounded-2xl text-sm text-slate-600 leading-relaxed relative">
            <div className="absolute top-3 left-5 text-5xl text-primary/10 font-bold leading-none">&ldquo;</div>
            <p className="relative z-10">{app.personalStatement || 'No statement provided.'}</p>
          </div>
        </div>
      </div>

      {/* Onboarding Scenarios */}
      {app.scenarioResponses && Array.isArray(app.scenarioResponses) && (
        <div className="glass-card rounded-2xl overflow-hidden border-white/40 shadow-xl">
          <div className="p-6 border-b border-border bg-slate-50/30">
            <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
              <MessageCircle size={18} className="text-primary" />
              Onboarding Scenarios
            </h3>
          </div>
          <div className="p-6 space-y-4">
            {app.scenarioResponses.map((resp: string, idx: number) => (
              <div key={idx} className="rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
                <div className="bg-primary/5 px-5 py-3 border-b border-primary/10">
                  <p className="text-[10px] font-semibold text-primary uppercase tracking-wider mb-1">Scenario {idx + 1}</p>
                  <p className="text-sm font-medium text-slate-700 leading-relaxed">
                    {ONBOARDING_SCENARIOS[idx] || 'Candidate Scenario Response'}
                  </p>
                </div>
                <div className="p-5 bg-white">
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {resp || 'No response provided.'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
