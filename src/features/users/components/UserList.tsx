'use client';

import { useUsers } from '../hooks/use-users';
import { useState } from 'react';
import { Search, MoreVertical, CheckCircle2, Clock, Eye, Trash2, Users, XCircle } from 'lucide-react';
import { UserApiService } from '../services/user-api';
import { toast } from 'react-hot-toast';
import Link from 'next/link';

export function UserList() {
  const [page, setPage] = useState(1);
  const [selectedRole, setSelectedRole] = useState<string | undefined>(undefined);
  const [selectedStatus, setSelectedStatus] = useState<string | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Fetch a larger batch size of users on initial mount to enable instant client-side search, filtering, and pagination
  const { data, isLoading, error, refetch } = useUsers(1, 1000);

  const [activeMenuUserId, setActiveMenuUserId] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdateStatus = async (userId: string, newStatus: 'ACTIVE' | 'SUSPENDED') => {
    try {
      setIsUpdating(true);
      await UserApiService.updateUserStatus(userId, newStatus);
      toast.success(`User status updated to ${newStatus}`);
      setActiveMenuUserId(null);
      refetch();
    } catch (err) {
      console.error('Failed to update user status', err);
      toast.error('Failed to update user status');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This will hide them from the admin panel.')) return;
    try {
      setIsUpdating(true);
      await UserApiService.deleteUser(userId);
      toast.success('User deleted successfully');
      setActiveMenuUserId(null);
      refetch();
    } catch (err) {
      console.error('Failed to delete user', err);
      toast.error('Failed to delete user');
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) return <div className="p-8 text-center font-bold">Loading users...</div>;
  if (error) return <div className="p-8 text-center text-red-500 font-bold">Error loading users</div>;

  const allUsers = data?.users || [];

  // Filter full list by date range first, to provide dynamic metrics inside the cards
  const dateFilteredUsers = allUsers.filter(u => {
    if (dateFrom || dateTo) {
      const createdDate = new Date(u.createdAt);
      createdDate.setHours(0, 0, 0, 0);

      if (dateFrom) {
        const from = new Date(dateFrom);
        from.setHours(0, 0, 0, 0);
        if (createdDate < from) return false;
      }

      if (dateTo) {
        const to = new Date(dateTo);
        to.setHours(0, 0, 0, 0);
        if (createdDate > to) return false;
      }
    }
    return true;
  });

  // Calculate segment counts client-side dynamically from the date-filtered dataset
  const counts = {
    all: dateFilteredUsers.length,
    active: dateFilteredUsers.filter(u => u.accountStatus === 'ACTIVE').length,
    inactive: dateFilteredUsers.filter(u => u.accountStatus === 'SUSPENDED').length,
    peer: dateFilteredUsers.filter(u => u.role === 'PEER').length,
    pending: dateFilteredUsers.filter(u => u.accountStatus === 'PENDING_SETUP').length
  };

  // Perform search and card selection filters instantly on the client side
  const filteredUsers = dateFilteredUsers.filter(u => {
    if (selectedRole && u.role !== selectedRole) return false;
    if (selectedStatus && u.accountStatus !== selectedStatus) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const displayName = (u.profile?.displayName || '').toLowerCase();
      const phone = u.phone || '';
      return displayName.includes(term) || phone.includes(term);
    }
    return true;
  });

  // Client-side pagination variables
  const limit = 15;
  const totalPages = Math.ceil(filteredUsers.length / limit) || 1;
  const paginatedUsers = filteredUsers.slice((page - 1) * limit, page * limit);

  return (
    <div className="space-y-10">
      
      {/* 1. Header Page Title Block with Date filter like Book orders */}
      <div className="admin-header flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground flex items-center gap-3">
            <Users className="text-primary" size={36} />
            User Management
          </h1>
          <p className="text-muted-foreground font-medium mt-2">Manage customer accounts, verify peer status, and control status.</p>
        </div>

        {/* Date Filter selector matching book orders style */}
        <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-border shadow-sm w-fit shrink-0 select-none">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-muted-foreground uppercase px-2">From</span>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
              className="text-sm font-medium border-none focus:ring-0 cursor-pointer outline-none px-2 py-1 bg-transparent text-slate-700"
            />
          </div>
          <div className="h-8 w-px bg-border"></div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-muted-foreground uppercase px-2">To</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
              className="text-sm font-medium border-none focus:ring-0 cursor-pointer outline-none px-2 py-1 bg-transparent text-slate-700"
            />
          </div>
          {(dateFrom || dateTo) && (
            <button
              onClick={() => { setDateFrom(''); setDateTo(''); setPage(1); }}
              className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-655 rounded-xl transition-colors ml-1 text-slate-600"
              title="Clear Filter"
            >
              <XCircle size={16} />
            </button>
          )}
        </div>
      </div>

      {/* 2. Overview Counts Cards Grid */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-border shadow-sm flex flex-col gap-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <span className="text-sm font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2 mb-1">
              <Users size={16} className="text-primary" /> Total Members
            </span>
            <div className="flex items-baseline gap-3">
              <span className="text-5xl font-black text-slate-900">
                {counts.all}
              </span>
              <span className="text-sm font-medium text-muted-foreground">All registered users</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 pt-6 border-t border-slate-100">
          
          <button
            onClick={() => {
              setSelectedRole(undefined);
              setSelectedStatus(undefined);
              setPage(1);
            }}
            className={`text-left rounded-2xl p-4 border flex flex-col gap-1 transition-all hover:scale-[1.02] active:scale-95 ${
              !selectedRole && !selectedStatus
                ? 'bg-slate-200 border-slate-400 shadow-sm ring-1 ring-slate-400'
                : 'bg-slate-50 border-slate-100 hover:border-slate-350'
            }`}
          >
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">All Members</span>
            <span className="text-2xl font-black text-slate-800">
              {counts.all}
            </span>
          </button>

          <button
            onClick={() => {
              setSelectedRole(undefined);
              setSelectedStatus('ACTIVE');
              setPage(1);
            }}
            className={`text-left rounded-2xl p-4 border flex flex-col gap-1 transition-all hover:scale-[1.02] active:scale-95 ${
              selectedStatus === 'ACTIVE'
                ? 'bg-emerald-100 border-emerald-400 shadow-sm ring-1 ring-emerald-400'
                : 'bg-slate-50 border-slate-100 hover:border-slate-350'
            }`}
          >
            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Active</span>
            <span className="text-2xl font-black text-emerald-700">{counts.active}</span>
          </button>

          <button
            onClick={() => {
              setSelectedRole(undefined);
              setSelectedStatus('SUSPENDED');
              setPage(1);
            }}
            className={`text-left rounded-2xl p-4 border flex flex-col gap-1 transition-all hover:scale-[1.02] active:scale-95 ${
              selectedStatus === 'SUSPENDED'
                ? 'bg-amber-100 border-amber-400 shadow-sm ring-1 ring-amber-400'
                : 'bg-slate-50 border-slate-100 hover:border-slate-350'
            }`}
          >
            <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">Inactive</span>
            <span className="text-2xl font-black text-amber-700">{counts.inactive}</span>
          </button>

          <button
            onClick={() => {
              setSelectedRole('PEER');
              setSelectedStatus(undefined);
              setPage(1);
            }}
            className={`text-left rounded-2xl p-4 border flex flex-col gap-1 transition-all hover:scale-[1.02] active:scale-95 ${
              selectedRole === 'PEER'
                ? 'bg-blue-100 border-blue-400 shadow-sm ring-1 ring-blue-400'
                : 'bg-slate-50 border-slate-100 hover:border-slate-350'
            }`}
          >
            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Peers</span>
            <span className="text-2xl font-black text-blue-700">{counts.peer}</span>
          </button>

          <button
            onClick={() => {
              setSelectedRole(undefined);
              setSelectedStatus('PENDING_SETUP');
              setPage(1);
            }}
            className={`text-left rounded-2xl p-4 border flex flex-col gap-1 transition-all hover:scale-[1.02] active:scale-95 ${
              selectedStatus === 'PENDING_SETUP'
                ? 'bg-indigo-100 border-indigo-400 shadow-sm ring-1 ring-indigo-400'
                : 'bg-slate-50 border-slate-100 hover:border-slate-350'
            }`}
          >
            <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">Pending Setup</span>
            <span className="text-2xl font-black text-indigo-700">{counts.pending}</span>
          </button>

        </div>
      </div>

      {/* 3. Table Card with Embedded Search Header */}
      {/* Remove overflow-hidden to allow absolute z-index dropdown overlays to display cleanly outside the container */}
      <div className="bg-white rounded-3xl shadow-sm border border-border relative z-10">
        
        {/* Search header built-in */}
        <div className="p-6 border-b border-border flex flex-col md:flex-row gap-4 justify-between items-center bg-slate-50/50">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <input 
              type="text" 
              placeholder="Search by name or phone..." 
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
              className="w-full pl-12 pr-4 py-3 rounded-2xl border border-border bg-white focus:ring-2 focus:ring-primary/20 outline-none transition-all font-medium"
            />
          </div>
        </div>

        {/* Table Body - Scrollable Container */}
        <div className="overflow-auto max-h-[600px] relative z-10">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-border sticky top-0 backdrop-blur-md z-20">
                <th className="px-8 py-5 text-[11px] uppercase tracking-[0.2em] font-black text-muted-foreground/80">User Identity</th>
                <th className="px-8 py-5 text-[11px] uppercase tracking-[0.2em] font-black text-muted-foreground/80">Contact Details</th>
                <th className="px-8 py-5 text-[11px] uppercase tracking-[0.2em] font-black text-muted-foreground/80">Platform Role</th>
                <th className="px-8 py-5 text-[11px] uppercase tracking-[0.2em] font-black text-muted-foreground/80">Account Status</th>
                <th className="px-8 py-5 text-[11px] uppercase tracking-[0.2em] font-black text-muted-foreground/80">Membership</th>
                <th className="px-8 py-5 text-[11px] uppercase tracking-[0.2em] font-black text-muted-foreground/80">Peer Onboarding</th>
                <th className="px-8 py-5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-8 py-10 text-center text-slate-400 font-bold text-sm">No members found.</td>
                </tr>
              ) : (
                paginatedUsers.map((user, index) => {
                  const isNearBottom = index >= paginatedUsers.length - 2;
                  return (
                    <tr key={user.id} className="hover:bg-primary/[0.01] transition-colors group">
                      
                      {/* User Identity without avatar badge */}
                      <td className="px-8 py-4">
                        <div>
                          <span className="font-bold text-slate-800 block leading-tight">{user.profile?.displayName || 'Unknown User'}</span>
                          <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">ID: {user.id.slice(0, 8)}</span>
                        </div>
                      </td>

                      {/* Contact details with email below phone */}
                      <td className="px-8 py-4">
                        <span className="text-sm font-bold text-slate-700 block leading-tight">{user.phone}</span>
                        {user.email && (
                          <span className="text-[10px] text-slate-400 font-semibold block mt-1">{user.email}</span>
                        )}
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
                        <div className="flex items-center justify-end gap-2 relative">
                          <Link 
                            href={`/admin/users/${user.id}`}
                            title="View user overview page"
                            className="p-2.5 bg-slate-50 hover:bg-primary/10 hover:text-primary text-slate-500 rounded-xl transition-all border border-slate-200/50 shadow-sm"
                          >
                            <Eye size={16} />
                          </Link>
                          <button 
                            onClick={() => setActiveMenuUserId(activeMenuUserId === user.id ? null : user.id)}
                            className="p-2.5 bg-slate-50 hover:bg-slate-100 hover:text-slate-700 text-slate-500 rounded-xl transition-all border border-slate-200/50 shadow-sm"
                          >
                            <MoreVertical size={16} />
                          </button>

                          {activeMenuUserId === user.id && (
                            <>
                              <div className="fixed inset-0 z-40" onClick={() => setActiveMenuUserId(null)} />
                              <div className={`absolute right-0 w-48 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 py-2 text-left animate-in fade-in duration-150 ${
                                isNearBottom ? 'bottom-full mb-1.5 slide-in-from-bottom-1' : 'top-full mt-1.5 slide-in-from-top-1'
                              }`}>
                                {user.accountStatus !== 'ACTIVE' && (
                                  <button
                                    disabled={isUpdating}
                                    onClick={() => handleUpdateStatus(user.id, 'ACTIVE')}
                                    className="w-full px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2 disabled:opacity-50"
                                  >
                                    <CheckCircle2 size={14} className="text-emerald-500" />
                                    <span>Mark Active</span>
                                  </button>
                                )}
                                {user.accountStatus === 'ACTIVE' && (
                                  <button
                                    disabled={isUpdating}
                                    onClick={() => handleUpdateStatus(user.id, 'SUSPENDED')}
                                    className="w-full px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2 disabled:opacity-50"
                                  >
                                    <Clock size={14} className="text-amber-500" />
                                    <span>Mark Inactive</span>
                                  </button>
                                )}
                                <div className="border-t border-slate-100 my-1" />
                                <button
                                  disabled={isUpdating}
                                  onClick={() => handleDeleteUser(user.id)}
                                  className="w-full px-4 py-2.5 text-xs font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-2 disabled:opacity-50"
                                >
                                  <Trash2 size={14} className="text-rose-500" />
                                  <span>Delete User</span>
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination bar */}
        <div className="px-8 py-5 bg-slate-50/80 backdrop-blur-md flex items-center justify-between border-t border-border">
          <p className="text-sm font-bold text-muted-foreground">
            Showing <span className="text-foreground">{paginatedUsers.length}</span> of <span className="text-foreground">{filteredUsers.length}</span> members
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
              disabled={page === totalPages}
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
