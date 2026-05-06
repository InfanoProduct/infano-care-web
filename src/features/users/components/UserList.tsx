'use client';

import { useUsers } from '../hooks/use-users';
import { useState } from 'react';
import { Search, MoreVertical, CheckCircle2, Clock } from 'lucide-react';

export function UserList() {
  const [page, setPage] = useState(1);
  const { data, isLoading, error } = useUsers(page);

  if (isLoading) return <div className="p-8 text-center">Loading users...</div>;
  if (error) return <div className="p-8 text-center text-red-500">Error loading users</div>;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-extrabold tracking-tight premium-gradient-text">User Management</h2>
          <p className="text-muted-foreground mt-2 font-medium">Manage and monitor your community members</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={20} />
            <input 
              type="text" 
              placeholder="Search by name or phone..." 
              className="pl-12 pr-6 py-3.5 bg-white border border-border rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary/30 outline-none w-full md:w-96 shadow-sm transition-all font-medium"
            />
          </div>
          <button className="p-3.5 bg-white border border-border rounded-2xl hover:bg-secondary transition-all shadow-sm">
             <MoreVertical size={20} className="text-muted-foreground" />
          </button>
        </div>
      </div>

      <div className="glass-card rounded-[2rem] overflow-hidden border-white/40 shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-border">
                <th className="px-8 py-5 text-[11px] uppercase tracking-[0.2em] font-black text-muted-foreground/80">User Identity</th>
                <th className="px-8 py-5 text-[11px] uppercase tracking-[0.2em] font-black text-muted-foreground/80">Contact Details</th>
                <th className="px-8 py-5 text-[11px] uppercase tracking-[0.2em] font-black text-muted-foreground/80">Platform Role</th>
                <th className="px-8 py-5 text-[11px] uppercase tracking-[0.2em] font-black text-muted-foreground/80">Account Status</th>
                <th className="px-8 py-5 text-[11px] uppercase tracking-[0.2em] font-black text-muted-foreground/80">Membership</th>
                <th className="px-8 py-5 text-[11px] uppercase tracking-[0.2em] font-black text-muted-foreground/80">Peer Onboarding</th>
                <th className="px-8 py-5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/50 bg-white/40">
              {data?.users.map((user) => (
                <tr key={user.id} className="hover:bg-primary/[0.02] transition-colors group">
                  <td className="px-8 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary/10 to-primary-light/5 flex items-center justify-center text-primary font-black text-lg shadow-sm border border-primary/10 group-hover:scale-110 transition-transform">
                        {user.profile?.displayName?.[0] || 'U'}
                      </div>
                      <div>
                        <span className="font-bold text-slate-800 block leading-tight">{user.profile?.displayName || 'Unknown User'}</span>
                        <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">ID: {user.id.slice(0, 8)}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-4">
                    <span className="text-sm font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-xl border border-slate-200/50">
                      {user.phone}
                    </span>
                  </td>
                  <td className="px-8 py-4">
                    <span className={`inline-flex items-center px-4 py-1 rounded-full text-[11px] font-black tracking-wider uppercase ${
                      user.role === 'ADMIN' ? 'bg-indigo-500/10 text-indigo-600 border border-indigo-500/20' : 
                      user.role === 'PEER' ? 'bg-blue-500/10 text-blue-600 border border-blue-500/20' : 
                      'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-8 py-4">
                    <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-xl text-xs font-bold border ${
                      user.accountStatus === 'ACTIVE' 
                        ? 'bg-green-50 text-green-600 border-green-200' 
                        : 'bg-amber-50 text-amber-600 border-amber-200'
                    }`}>
                      <div className={`w-2 h-2 rounded-full animate-pulse ${
                        user.accountStatus === 'ACTIVE' ? 'bg-green-500' : 'bg-amber-500'
                      }`} />
                      {user.accountStatus}
                    </span>
                  </td>
                  <td className="px-8 py-4">
                    <p className="text-sm font-bold text-slate-700">{new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                    <p className="text-[10px] text-muted-foreground font-semibold">Joined at {new Date(user.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  </td>
                  <td className="px-8 py-4">
                    {user.peerOnboarding ? (
                      user.role === 'PEER' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-600 rounded-lg text-xs font-bold border border-green-200">
                          <CheckCircle2 size={14} /> Approved
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold border border-blue-200">
                          <Clock size={14} /> Applied
                        </span>
                      )
                    ) : (
                      <span className="text-xs text-muted-foreground">-</span>
                    )}
                  </td>
                  <td className="px-8 py-4 text-right">
                    <button className="p-3 hover:bg-primary/10 hover:text-primary rounded-2xl transition-all text-muted-foreground/60">
                      <MoreVertical size={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-8 py-5 bg-slate-50/80 backdrop-blur-md flex items-center justify-between border-t border-border">
          <p className="text-sm font-bold text-muted-foreground">
            Showing <span className="text-foreground">{data?.users.length}</span> of <span className="text-foreground">{data?.pagination.total}</span> members
          </p>
          <div className="flex items-center gap-3">
            <button 
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              className="px-6 py-2.5 bg-white border border-border rounded-xl text-sm font-bold shadow-sm transition-all hover:bg-secondary disabled:opacity-40 disabled:hover:bg-white"
            >
              Previous
            </button>
            <button 
              disabled={page === data?.pagination.pages}
              onClick={() => setPage(p => p + 1)}
              className="px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-bold shadow-md shadow-primary/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
