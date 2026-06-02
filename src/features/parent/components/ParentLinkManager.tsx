'use client';

import { useState, useEffect } from 'react';
import { ParentService, ParentLink } from '@/services/parent.service';
import { useAuthStore } from '@/store/auth-store';
import { useRouter } from 'next/navigation';
import { Loader2, Plus, User, Unlink, Link2, AlertTriangle, CheckCircle2, Clock, X } from 'lucide-react';
import { toast } from 'react-hot-toast';

export function ParentLinkManager() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [links, setLinks] = useState<ParentLink[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [phone, setPhone] = useState('');
  const [isInviting, setIsInviting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [unlinkingId, setUnlinkingId] = useState<string | null>(null);
  const [showUnlinkConfirm, setShowUnlinkConfirm] = useState<string | null>(null);

  const isTeen = user?.role === 'TEEN';
  const label = isTeen ? 'Parent' : 'Daughter';

  useEffect(() => {
    fetchLinks();
  }, []);

  const fetchLinks = async () => {
    try {
      setIsLoading(true);
      const data = await ParentService.getLinks();
      setLinks(data);
    } catch (err) {
      console.error('Failed to fetch links', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) return;

    setIsInviting(true);
    setError('');
    setSuccess('');

    try {
      await ParentService.invite(phone);
      setSuccess(`Invitation sent to ${phone}! They will see it in their Family Settings.`);
      setPhone('');
      fetchLinks();
    } catch (err: any) {
      setError(err?.response?.data?.error || err.message || 'Failed to send invite');
    } finally {
      setIsInviting(false);
    }
  };

  const handleUnlink = async (id: string) => {
    setUnlinkingId(id);
    setShowUnlinkConfirm(null);
    try {
      await ParentService.cancelInvite(id);
      toast.success('Successfully unlinked. Refreshing your dashboard...');
      // Redirect to dashboard so all cached linked-user data (enrollments, etc.) refreshes
      setTimeout(() => {
        router.push('/dashboard');
        router.refresh();
      }, 1000);
    } catch (err: any) {
      toast.error(err?.response?.data?.error || err.message || 'Failed to unlink');
      setUnlinkingId(null);
    }
  };

  const handleCancelInvite = async (id: string) => {
    try {
      await ParentService.cancelInvite(id);
      toast.success('Invite cancelled.');
      fetchLinks();
    } catch (err: any) {
      toast.error(err?.response?.data?.error || err.message || 'Failed to cancel invite');
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <Loader2 className="animate-spin text-primary" size={40} />
        <span className="font-bold text-slate-500 text-sm">Loading family connections...</span>
      </div>
    );
  }

  const linkedAccounts = links.filter(l => l.status === 'LINKED');
  const pendingInvites = links.filter(l => l.status === 'PENDING');

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Unlink Confirmation Modal */}
      {showUnlinkConfirm && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setShowUnlinkConfirm(null)} />
          <div className="relative bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full z-10 animate-in zoom-in duration-200">
            <div className="w-14 h-14 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <AlertTriangle size={26} />
            </div>
            <h3 className="text-xl font-extrabold text-slate-800 text-center mb-2">Unlink Account?</h3>
            <p className="text-sm font-semibold text-slate-500 text-center leading-relaxed mb-6">
              After unlinking, you will no longer see each other's enrolled programs, sessions, or progress. This cannot be undone without sending a new invite.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowUnlinkConfirm(null)}
                className="flex-1 py-3 border border-slate-200 rounded-2xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => handleUnlink(showUnlinkConfirm)}
                disabled={!!unlinkingId}
                className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl text-sm font-extrabold flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-70"
              >
                {unlinkingId ? <Loader2 size={16} className="animate-spin" /> : <Unlink size={16} />}
                Unlink Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-gradient-to-r from-primary/10 via-accent/5 to-white p-8 rounded-2xl border border-primary/10 relative overflow-hidden shadow-sm">
        <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 blur-3xl rounded-full translate-x-1/3 -translate-y-1/3 pointer-events-none" />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-primary/20 rounded-full text-[10px] font-black tracking-widest text-primary uppercase shadow-sm mb-3">
            <Link2 size={11} /> Family Settings
          </div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
            {isTeen ? 'Connect with Parent' : 'Connect with Daughter'}
          </h1>
          <p className="text-sm font-semibold text-slate-500 mt-2 max-w-md leading-relaxed">
            {isTeen
              ? 'Link your parent\'s account to share progress, sessions, and enrolled program details with them.'
              : 'Link your daughter\'s account to monitor her wellness journey, sessions, and program progress together.'}
          </p>
        </div>
      </div>

      {/* Active Linked Accounts */}
      {linkedAccounts.length > 0 && (
        <div className="bg-white border border-slate-100 rounded-2xl p-8 shadow-xl shadow-slate-200/20 space-y-5">
          <h2 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
            <CheckCircle2 size={18} className="text-emerald-500" />
            Linked {label} Account{linkedAccounts.length > 1 ? 's' : ''}
          </h2>
          <div className="space-y-4">
            {linkedAccounts.map((link) => {
              const otherUser = isTeen ? link.parent : link.teen;
              const displayName = otherUser?.profile?.displayName || link.receiverPhone || 'Linked Account';
              return (
                <div key={link.id} className="flex items-center justify-between p-5 bg-emerald-50/50 border border-emerald-100 rounded-2xl">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center font-black text-lg shadow-sm">
                      {displayName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-extrabold text-slate-800">{displayName}</p>
                      <p className="text-xs font-semibold text-emerald-600 flex items-center gap-1 mt-0.5">
                        <CheckCircle2 size={11} /> Actively Linked
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowUnlinkConfirm(link.id)}
                    disabled={unlinkingId === link.id}
                    className="flex items-center gap-1.5 text-xs font-extrabold text-rose-600 hover:bg-rose-50 px-4 py-2 rounded-xl border border-rose-100 transition-all active:scale-95 disabled:opacity-50"
                  >
                    {unlinkingId === link.id
                      ? <Loader2 size={14} className="animate-spin" />
                      : <Unlink size={14} />
                    }
                    Unlink
                  </button>
                </div>
              );
            })}
          </div>
          <p className="text-xs font-semibold text-slate-400 bg-slate-50 rounded-xl p-3 border border-slate-100">
            ⚠️ Unlinking will immediately remove shared access to each other's enrolled programs, sessions, and progress from your dashboards.
          </p>
        </div>
      )}

      {/* Pending Invites */}
      {pendingInvites.length > 0 && (
        <div className="bg-white border border-slate-100 rounded-2xl p-8 shadow-xl shadow-slate-200/20 space-y-4">
          <h2 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
            <Clock size={18} className="text-amber-500" />
            Pending Invitations
          </h2>
          <div className="space-y-3">
            {pendingInvites.map((link) => {
              const isSender = link.senderId === user?.id;
              return (
                <div key={link.id} className="flex items-center justify-between p-4 bg-amber-50/50 border border-amber-100 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center">
                      <User size={18} />
                    </div>
                    <div>
                      <p className="font-bold text-slate-700 text-sm">{link.receiverPhone}</p>
                      <p className="text-[11px] font-semibold text-amber-600">
                        {isSender ? 'Waiting for them to accept…' : 'Invite waiting for your acceptance'}
                      </p>
                    </div>
                  </div>
                  {isSender && (
                    <button
                      onClick={() => handleCancelInvite(link.id)}
                      className="flex items-center gap-1 text-xs font-extrabold text-slate-500 hover:text-rose-600 hover:bg-rose-50 px-3 py-2 rounded-xl transition-all border border-slate-200"
                    >
                      <X size={13} /> Cancel
                    </button>
                  )}
                  {!isSender && (
                    <span className="text-[10px] font-black text-amber-700 bg-amber-100 px-3 py-1.5 rounded-full uppercase tracking-wider border border-amber-200">
                      Pending
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Send New Invite */}
      <div className="bg-white border border-slate-100 rounded-2xl p-8 shadow-xl shadow-slate-200/20 space-y-5">
        <div>
          <h2 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
            <Plus size={18} className="text-primary" />
            {linkedAccounts.length > 0 ? `Add Another ${label}` : `Link a ${label}`}
          </h2>
          <p className="text-xs font-semibold text-slate-400 mt-1">
            Enter their registered phone number to send a link invitation.
          </p>
        </div>

        <form onSubmit={handleInvite} className="flex gap-3">
          <input
            type="text"
            placeholder={`${label}'s phone number (e.g. 9876543210)`}
            className="flex-1 px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <button
            type="submit"
            disabled={isInviting || !phone}
            className="px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-xl font-extrabold text-sm flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50 shadow-md shadow-primary/20 whitespace-nowrap"
          >
            {isInviting ? <Loader2 className="animate-spin w-4 h-4" /> : <Plus className="w-4 h-4" />}
            Send Invite
          </button>
        </form>

        {error && (
          <div className="flex items-start gap-2 text-sm text-rose-700 bg-rose-50 p-4 rounded-xl border border-rose-100 font-semibold">
            <AlertTriangle size={16} className="shrink-0 mt-0.5" /> {error}
          </div>
        )}
        {success && (
          <div className="flex items-start gap-2 text-sm text-emerald-700 bg-emerald-50 p-4 rounded-xl border border-emerald-100 font-semibold">
            <CheckCircle2 size={16} className="shrink-0 mt-0.5" /> {success}
          </div>
        )}
      </div>
    </div>
  );
}
