'use client';

import { useState, useEffect } from 'react';
import { ParentService, ParentLink } from '@/services/parent.service';
import { useAuthStore } from '@/store/auth-store';
import { Loader2, Plus, User, Trash2 } from 'lucide-react';

export function ParentLinkManager() {
  const { user } = useAuthStore();
  const [links, setLinks] = useState<ParentLink[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [phone, setPhone] = useState('');
  const [isInviting, setIsInviting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const isTeen = user?.role === 'TEEN';
  const label = isTeen ? 'Parent' : 'Daughter';

  useEffect(() => {
    fetchLinks();
  }, []);

  const fetchLinks = async () => {
    try {
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
      const newLink = await ParentService.invite(phone);
      setSuccess(`Invitation sent successfully to ${phone}`);
      setPhone('');
      fetchLinks();
    } catch (err: any) {
      setError(err?.response?.data?.error || err.message || 'Failed to send invite');
    } finally {
      setIsInviting(false);
    }
  };

  const handleCancel = async (id: string) => {
    try {
      await ParentService.cancelInvite(id);
      fetchLinks();
    } catch (err: any) {
      setError(err?.response?.data?.error || err.message || 'Failed to cancel invite');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="animate-spin text-primary w-8 h-8" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="glass-card p-8 rounded-2xl">
        <h2 className="text-xl font-bold mb-4">Link {label}</h2>
        <p className="text-muted-foreground mb-6 text-sm">
          Enter your {label.toLowerCase()}'s registered phone number to link accounts and monitor wellness journeys.
        </p>
        
        <form onSubmit={handleInvite} className="flex gap-4">
          <input 
            type="text" 
            placeholder="e.g. 1234567890" 
            className="flex-1 px-4 py-2 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <button 
            type="submit"
            disabled={isInviting || !phone}
            className="px-6 py-2 bg-primary text-white rounded-xl font-semibold flex items-center gap-2 hover:bg-primary-dark transition-colors disabled:opacity-50"
          >
            {isInviting ? <Loader2 className="animate-spin w-4 h-4" /> : <Plus className="w-4 h-4" />}
            Send Invite
          </button>
        </form>

        {error && <p className="mt-4 text-sm text-rose-500 bg-rose-50 p-3 rounded-xl">{error}</p>}
        {success && <p className="mt-4 text-sm text-emerald-500 bg-emerald-50 p-3 rounded-xl">{success}</p>}
      </div>

      {links.length > 0 && (
        <div className="glass-card p-8 rounded-2xl">
          <h3 className="text-lg font-bold mb-4">Linked Accounts</h3>
          <div className="space-y-4">
            {links.map((link) => {
              const otherUser = isTeen ? link.parent : link.teen;
              const displayName = otherUser?.profile?.displayName || link.receiverPhone;

              return (
                <div key={link.id} className="flex items-center justify-between p-4 border border-border rounded-xl">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                      <User size={20} />
                    </div>
                    <div>
                      <p className="font-semibold">{displayName}</p>
                      <p className="text-xs text-muted-foreground">Status: <span className={`font-bold ${link.status === 'LINKED' ? 'text-emerald-500' : 'text-amber-500'}`}>{link.status}</span></p>
                    </div>
                  </div>

                  {link.status === 'PENDING' && link.senderId === user?.id && (
                    <button 
                      onClick={() => handleCancel(link.id)}
                      className="text-xs text-rose-500 hover:bg-rose-50 px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors border border-rose-100"
                    >
                      <Trash2 size={14} /> Cancel Invite
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
