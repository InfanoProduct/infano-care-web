'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useUsers } from '@/features/users/hooks/use-users';
import { UserApiService } from '@/features/users/services/user-api';
import {
  UserCheck, Loader2, Search, MoreVertical,
  CheckCircle2, Clock, Eye, AlertCircle, Trophy, X
} from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

export default function PeerManagement() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [approvingPeer, setApprovingPeer] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [revoking, setRevoking] = useState<string | null>(null);
  const { data, isLoading, error, refetch } = useUsers(page, 20, true);
  const menuRef = useRef<HTMLDivElement | null>(null);

  // Helper to update local cache instantly
  const updateLocalUser = (userId: string, patch: any) => {
    queryClient.setQueryData(['users', page, 20, true], (old: any) => {
      if (!old) return old;
      return {
        ...old,
        users: old.users.map((u: any) => {
          if (u.id !== userId) return u;
          // Merge top level and peerApplication specifically
          const newPeerApp = patch.peerApplication 
            ? { ...u.peerApplication, ...patch.peerApplication }
            : u.peerApplication;
          return { ...u, ...patch, peerApplication: newPeerApp };
        })
      };
    });
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleApprovePeer = async (userId: string) => {
    setApprovingPeer(userId);
    try {
      await UserApiService.approvePeer(userId);
      // Optimistic update
      updateLocalUser(userId, { peerApplication: { status: 'approved' } });
      refetch();
    } catch (err: any) {
      alert(err.message || 'Failed to approve peer');
    } finally {
      setApprovingPeer(null);
    }
  };

  const handleRevoke = async (userId: string) => {
    if (!confirm('This will completely revoke peer status (application, training, and role). Continue?')) return;
    setRevoking(userId);
    setOpenMenuId(null);
    try {
      await UserApiService.revokePeer(userId);
      // Optimistic update: Role becomes TEEN, status uncertified
      updateLocalUser(userId, { 
        role: 'TEEN', 
        peerApplication: { certificationStatus: 'uncertified', status: 'pending' } 
      });
      refetch();
    } catch (err: any) {
      alert(err.message || 'Action failed');
    } finally {
      setRevoking(null);
    }
  };

  const handleUnapproveAssessment = async (userId: string) => {
    if (!confirm('This will unapprove the training/assessment part only. The candidate will need to re-do the assessment. Continue?')) return;
    setRevoking(userId);
    setOpenMenuId(null);
    try {
      await UserApiService.unapproveAssessment(userId);
      // Optimistic update: Role becomes TEEN, status unapproved
      updateLocalUser(userId, { 
        role: 'TEEN', 
        peerApplication: { certificationStatus: 'unapproved' } 
      });
      refetch();
    } catch (err: any) {
      alert(err.message || 'Action failed');
    } finally {
      setRevoking(null);
    }
  };

  const certBadge = (status: string) => {
    switch (status) {
      case 'certified':
        return <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-xl text-[10px] font-black border border-purple-200"><CheckCircle2 size={11} /> Certified</span>;
      case 'submitted':
        return <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-50 text-amber-700 rounded-xl text-[10px] font-black border border-amber-200"><Trophy size={11} /> Submitted</span>;
      case 'pending_conduct':
        return <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-600 rounded-xl text-[10px] font-black border border-blue-200"><Clock size={11} /> Conduct Pending</span>;
      case 'uncertified':
        return <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-50 text-red-600 rounded-xl text-[10px] font-black border border-red-200"><X size={11} /> Uncertified</span>;
      case 'unapproved':
        return <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-700 rounded-xl text-[10px] font-black border border-amber-200"><AlertCircle size={11} /> Unapproved</span>;
      case 'pending_training':
      default:
        return <span className="inline-flex items-center gap-1 px-3 py-1 bg-slate-100 text-slate-500 rounded-xl text-[10px] font-black"><Clock size={11} /> Training</span>;
    }
  };

  if (isLoading) return (
    <div className="p-16 flex flex-col items-center justify-center gap-4">
      <Loader2 className="animate-spin text-primary" size={40} />
      <p className="text-muted-foreground font-bold">Loading peer applications...</p>
    </div>
  );

  if (error) return (
    <div className="p-12 text-center text-red-500 bg-red-50 rounded-[2.5rem] border border-red-100">
      <p className="font-bold">Error loading peer applications</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Page Header */}
      <div className="admin-header flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Peer <span className="text-primary">Management</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Oversee peer mentors, onboarding applications, and certifications</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={18} />
            <input
              type="text"
              placeholder="Search applications..."
              className="pl-11 pr-5 py-2.5 bg-white border border-border rounded-xl focus:ring-2 focus:ring-primary/10 focus:border-primary/30 outline-none w-full md:w-72 shadow-sm transition-all text-sm font-medium"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="glass-card rounded-2xl overflow-hidden border-white/40 shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-border">
                <th className="px-6 py-4 text-[11px] uppercase tracking-[0.15em] font-semibold text-muted-foreground">User Identity</th>
                <th className="px-6 py-4 text-[11px] uppercase tracking-[0.15em] font-semibold text-muted-foreground">Contact Details</th>
                <th className="px-6 py-4 text-[11px] uppercase tracking-[0.15em] font-semibold text-muted-foreground">Platform Role</th>
                <th className="px-6 py-4 text-[11px] uppercase tracking-[0.15em] font-semibold text-muted-foreground">Certification</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-white/40">
              {data?.users.map((user: any) => (
                <tr key={user.id} className="hover:bg-primary/[0.02] transition-colors group">
                  {/* Identity */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary/10 to-primary-light/5 flex items-center justify-center text-primary font-bold text-sm shadow-sm border border-primary/10 group-hover:scale-110 transition-transform shrink-0">
                        {user.profile?.displayName?.[0] || 'U'}
                      </div>
                      <div>
                        <span className="text-sm font-semibold text-slate-800 block leading-tight">{user.profile?.displayName || 'Unknown User'}</span>
                        <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">ID: {user.id.slice(0, 8)}</span>
                      </div>
                    </div>
                  </td>

                  {/* Contact */}
                  <td className="px-6 py-4">
                    <div className="space-y-0.5">
                      <span className="text-sm font-medium text-slate-600 block">{user.peerApplication?.email || '—'}</span>
                      <span className="text-xs text-muted-foreground">{user.phone}</span>
                    </div>
                  </td>

                  {/* Role */}
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold tracking-wide uppercase ${
                      user.role === 'ADMIN' ? 'bg-indigo-500/10 text-indigo-600 border border-indigo-500/20' :
                      user.role === 'PEER' ? 'bg-purple-500/10 text-purple-600 border border-purple-500/20' :
                      'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                    }`}>
                      {user.role}
                    </span>
                  </td>

                  {/* Certification & Application */}
                  <td className="px-6 py-4">
                    {user.peerApplication ? (
                      <div className="flex flex-col gap-2">
                        {certBadge(user.peerApplication.certificationStatus || 'pending_training')}
                        
                        <div className="flex flex-col gap-1 mt-1">
                          <button
                            onClick={() => router.push(`/admin/connect/peers/${user.id}/assessment`)}
                            className="text-xs text-muted-foreground hover:text-purple-600 flex items-center gap-1 w-fit transition-colors"
                          >
                            <Eye size={12} /> Review Full Details
                          </button>
                        </div>

                        {user.peerApplication.status === 'pending' && (
                          <button
                            disabled={approvingPeer === user.id}
                            onClick={() => handleApprovePeer(user.id)}
                            className="mt-1 text-xs font-semibold bg-primary text-white px-3 py-1.5 rounded-lg hover:shadow-md hover:shadow-primary/20 transition-all active:scale-95 flex items-center gap-1.5 w-fit disabled:opacity-50"
                          >
                            {approvingPeer === user.id ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle2 size={12} />}
                            Approve Peer
                          </button>
                        )}

                        {user.peerApplication.certificateId && (
                          <div className="mt-1 inline-flex items-center gap-1 px-1.5 py-0.5 bg-slate-50 text-slate-400 border border-slate-100 rounded text-[9px] font-bold uppercase tracking-tighter w-fit">
                            ID: {user.peerApplication.certificateId}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </td>

                  {/* Actions 3-dot */}
                  <td className="px-6 py-4 text-right">
                    {(user.role === 'PEER' || user.peerApplication?.certificationStatus === 'certified' || user.peerApplication?.status === 'approved') && (
                      <div className="relative inline-block" ref={openMenuId === user.id ? menuRef : null}>
                        <button
                          onClick={() => setOpenMenuId(openMenuId === user.id ? null : user.id)}
                          className="p-2 hover:bg-slate-100 rounded-xl transition-all text-muted-foreground hover:text-slate-700"
                        >
                          {revoking === user.id
                            ? <Loader2 size={18} className="animate-spin" />
                            : <MoreVertical size={18} />
                          }
                        </button>

                        {openMenuId === user.id && (
                          <div className="absolute right-0 top-10 bg-white shadow-xl border border-slate-100 rounded-2xl overflow-hidden w-52 z-50 animate-in fade-in zoom-in-95 duration-150">
                            {(user.peerApplication?.certificationStatus === 'certified' || user.peerApplication?.certificationStatus === 'submitted') && (
                              <button
                                onClick={() => handleUnapproveAssessment(user.id)}
                                className="w-full text-left px-4 py-3 text-sm text-amber-600 hover:bg-amber-50 transition-colors flex items-center gap-2.5 font-medium border-b border-slate-50"
                              >
                                <Clock size={15} className="text-amber-500 shrink-0" />
                                Unapprove Assessment
                              </button>
                            )}
                            <button
                              onClick={() => handleRevoke(user.id)}
                              className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2.5 font-medium"
                            >
                              <AlertCircle size={15} className="text-red-500 shrink-0" />
                              Uncertify User
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))}

              {data?.users.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-8 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center">
                        <UserCheck size={22} className="text-slate-300" />
                      </div>
                      <p className="text-sm text-muted-foreground font-medium">No peer applications found.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 bg-slate-50/80 backdrop-blur-md flex items-center justify-between border-t border-border">
          <p className="text-sm text-muted-foreground">
            Showing <span className="font-semibold text-foreground">{data?.users.length}</span> of <span className="font-semibold text-foreground">{data?.pagination.total}</span> candidates
          </p>
          <div className="flex items-center gap-3">
            <button
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              className="px-5 py-2 bg-white border border-border rounded-xl text-sm font-medium shadow-sm transition-all hover:bg-secondary disabled:opacity-40"
            >
              Previous
            </button>
            <span className="px-3 py-2 text-sm font-semibold text-foreground">
              {page} / {data?.pagination.pages || 1}
            </span>
            <button
              disabled={page === data?.pagination.pages}
              onClick={() => setPage(p => p + 1)}
              className="px-5 py-2 bg-primary text-white rounded-xl text-sm font-medium shadow-md shadow-primary/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
