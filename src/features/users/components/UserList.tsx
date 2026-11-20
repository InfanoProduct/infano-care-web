'use client';

import { useUsers } from '../hooks/use-users';
import { useState } from 'react';
import { 
  Search, MoreVertical, CheckCircle2, Clock, Eye, Trash2, Users, 
  XCircle, UserPlus, Sparkles, AlertTriangle, RefreshCw, Copy, Check, RotateCcw 
} from 'lucide-react';
import { UserApiService, User } from '../services/user-api';
import { toast } from 'react-hot-toast';
import Link from 'next/link';

export function UserList() {
  const [page, setPage] = useState(1);
  const [selectedRole, setSelectedRole] = useState<string | undefined>(undefined);
  const [selectedStatus, setSelectedStatus] = useState<string | undefined>(undefined);
  const [filterTestOnly, setFilterTestOnly] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Fetch a larger batch size of users on initial mount to enable instant client-side search, filtering, and pagination
  const { data, isLoading, error, refetch } = useUsers(1, 1000);

  const [activeMenuUserId, setActiveMenuUserId] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Delete modal state
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Reset modal state
  const [userToReset, setUserToReset] = useState<User | null>(null);
  const [isResetting, setIsResetting] = useState(false);

  // Create test user modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [testPhoneInput, setTestPhoneInput] = useState('');
  const [testRole] = useState<'PARENT'>('PARENT');
  const [overwriteIfExists, setOverwriteIfExists] = useState(true);
  const [isSubmittingTestUser, setIsSubmittingTestUser] = useState(false);
  const [createdTestUserResult, setCreatedTestUserResult] = useState<any>(null);
  const [isFetchingNextPhone, setIsFetchingNextPhone] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

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

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    try {
      setIsDeleting(true);
      await UserApiService.deleteUser(userToDelete.id);
      toast.success(`User ${userToDelete.phone} permanently deleted`);
      setUserToDelete(null);
      setActiveMenuUserId(null);
      refetch();
    } catch (err: any) {
      console.error('Failed to delete user', err);
      toast.error(err?.response?.data?.message || err?.message || 'Failed to delete user');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleConfirmReset = async () => {
    if (!userToReset) return;
    try {
      setIsResetting(true);
      const res = await UserApiService.resetUserData(userToReset.id);
      toast.success(res?.message || `User ${userToReset.phone} reset to fresh onboarding state`);
      setUserToReset(null);
      setActiveMenuUserId(null);
      refetch();
    } catch (err: any) {
      console.error('Failed to reset user data', err);
      toast.error(err?.response?.data?.message || err.message || 'Failed to reset user data');
    } finally {
      setIsResetting(false);
    }
  };

  const openCreateTestUserModal = async () => {
    setIsCreateModalOpen(true);
    setCreatedTestUserResult(null);
    setCopiedField(null);
    setIsFetchingNextPhone(true);
    try {
      const res = await UserApiService.getNextTestPhone();
      if (res?.suggestedPhone) {
        setTestPhoneInput(res.suggestedPhone);
      } else {
        setTestPhoneInput('9000000004');
      }
    } catch {
      setTestPhoneInput('9000000004');
    } finally {
      setIsFetchingNextPhone(false);
    }
  };

  const handleSuggestNext = async () => {
    setIsFetchingNextPhone(true);
    try {
      const res = await UserApiService.getNextTestPhone();
      if (res?.suggestedPhone) {
        setTestPhoneInput(res.suggestedPhone);
      }
    } catch {
      toast.error('Failed to fetch next test number');
    } finally {
      setIsFetchingNextPhone(false);
    }
  };

  const handleCreateTestUser = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanDigits = testPhoneInput.replace(/\D/g, '');
    if (cleanDigits.length !== 10) {
      toast.error('Please enter a valid 10-digit mobile number');
      return;
    }

    try {
      setIsSubmittingTestUser(true);
      const res = await UserApiService.createTestUser({
        phone: cleanDigits,
        role: testRole,
        overwriteIfExists
      });
      setCreatedTestUserResult(res);
      toast.success(res.message || 'Fresh test user created successfully!');
      refetch();
    } catch (err: any) {
      console.error('Failed to create test user', err);
      toast.error(err?.response?.data?.message || err?.message || 'Failed to create test user');
    } finally {
      setIsSubmittingTestUser(false);
    }
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.success(`Copied ${field} to clipboard`);
    setTimeout(() => setCopiedField(null), 2000);
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
    pending: dateFilteredUsers.filter(u => u.accountStatus === 'PENDING_SETUP').length,
    test: dateFilteredUsers.filter(u => u.isTestNumber).length,
  };

  // Perform search and card selection filters instantly on the client side
  const filteredUsers = dateFilteredUsers.filter(u => {
    if (filterTestOnly && !u.isTestNumber) return false;
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
      
      {/* 1. Header Page Title Block with Actions & Date filter */}
      <div className="admin-header flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground flex items-center gap-3">
            <Users className="text-primary" size={36} />
            User Management
          </h1>
          <p className="text-muted-foreground font-medium mt-2">Manage customer accounts, create fresh test users, and control status.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Create Test User Button */}
          <button
            onClick={openCreateTestUserModal}
            className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-2xl font-bold shadow-md shadow-indigo-200 transition-all active:scale-95 text-sm shrink-0"
          >
            <UserPlus size={18} />
            <span>Create Test User</span>
          </button>

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

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 pt-6 border-t border-slate-100">
          
          <button
            onClick={() => {
              setSelectedRole(undefined);
              setSelectedStatus(undefined);
              setFilterTestOnly(false);
              setPage(1);
            }}
            className={`text-left rounded-2xl p-4 border flex flex-col gap-1 transition-all hover:scale-[1.02] active:scale-95 ${
              !selectedRole && !selectedStatus && !filterTestOnly
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
              setFilterTestOnly(false);
              setPage(1);
            }}
            className={`text-left rounded-2xl p-4 border flex flex-col gap-1 transition-all hover:scale-[1.02] active:scale-95 ${
              selectedStatus === 'ACTIVE' && !filterTestOnly
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
              setFilterTestOnly(false);
              setPage(1);
            }}
            className={`text-left rounded-2xl p-4 border flex flex-col gap-1 transition-all hover:scale-[1.02] active:scale-95 ${
              selectedStatus === 'SUSPENDED' && !filterTestOnly
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
              setFilterTestOnly(false);
              setPage(1);
            }}
            className={`text-left rounded-2xl p-4 border flex flex-col gap-1 transition-all hover:scale-[1.02] active:scale-95 ${
              selectedRole === 'PEER' && !filterTestOnly
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
              setFilterTestOnly(false);
              setPage(1);
            }}
            className={`text-left rounded-2xl p-4 border flex flex-col gap-1 transition-all hover:scale-[1.02] active:scale-95 ${
              selectedStatus === 'PENDING_SETUP' && !filterTestOnly
                ? 'bg-indigo-100 border-indigo-400 shadow-sm ring-1 ring-indigo-400'
                : 'bg-slate-50 border-slate-100 hover:border-slate-350'
            }`}
          >
            <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">Pending Setup</span>
            <span className="text-2xl font-black text-indigo-700">{counts.pending}</span>
          </button>

          <button
            onClick={() => {
              setSelectedRole(undefined);
              setSelectedStatus(undefined);
              setFilterTestOnly(!filterTestOnly);
              setPage(1);
            }}
            className={`text-left rounded-2xl p-4 border flex flex-col gap-1 transition-all hover:scale-[1.02] active:scale-95 ${
              filterTestOnly
                ? 'bg-purple-100 border-purple-400 shadow-sm ring-1 ring-purple-400'
                : 'bg-slate-50 border-slate-100 hover:border-slate-350'
            }`}
          >
            <span className="text-[10px] font-bold text-purple-600 uppercase tracking-wider flex items-center gap-1">
              <Sparkles size={12} /> Test Users
            </span>
            <span className="text-2xl font-black text-purple-700">{counts.test}</span>
          </button>

        </div>
      </div>

      {/* 3. Table Card with Embedded Search Header */}
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
          {filterTestOnly && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-50 text-purple-700 border border-purple-200 rounded-xl text-xs font-bold">
              <Sparkles size={14} />
              <span>Showing test accounts only</span>
              <button 
                onClick={() => setFilterTestOnly(false)}
                className="ml-1 text-purple-400 hover:text-purple-700"
              >
                <XCircle size={14} />
              </button>
            </div>
          )}
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
                <th className="px-8 py-5 text-right text-[11px] uppercase tracking-[0.2em] font-black text-muted-foreground/80">Actions</th>
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
                      
                      {/* User Identity */}
                      <td className="px-8 py-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-800 block leading-tight">{user.profile?.displayName || 'Unknown User'}</span>
                            {user.isTestNumber && (
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-purple-100 text-purple-700 border border-purple-200">
                                TEST
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">ID: {user.id.slice(0, 8)}</span>
                        </div>
                      </td>

                      {/* Contact details */}
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

                          {/* Direct reset data button */}
                          <button
                            onClick={() => setUserToReset(user)}
                            title="Reset user data (wipes learner profiles & progress back to step 0)"
                            className="p-2.5 bg-slate-50 hover:bg-amber-50 hover:text-amber-600 text-slate-400 rounded-xl transition-all border border-slate-200/50 shadow-sm"
                          >
                            <RotateCcw size={16} />
                          </button>

                          {/* Direct delete button */}
                          <button
                            onClick={() => setUserToDelete(user)}
                            title="Delete user permanently"
                            className="p-2.5 bg-slate-50 hover:bg-rose-50 hover:text-rose-600 text-slate-400 rounded-xl transition-all border border-slate-200/50 shadow-sm"
                          >
                            <Trash2 size={16} />
                          </button>

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
                                  onClick={() => {
                                    setActiveMenuUserId(null);
                                    setUserToReset(user);
                                  }}
                                  className="w-full px-4 py-2.5 text-xs font-bold text-amber-600 hover:bg-amber-50 flex items-center gap-2 disabled:opacity-50"
                                >
                                  <RotateCcw size={14} className="text-amber-500" />
                                  <span>Reset User Data</span>
                                </button>
                                <button
                                  disabled={isUpdating}
                                  onClick={() => {
                                    setActiveMenuUserId(null);
                                    setUserToDelete(user);
                                  }}
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

      {/* Create Test User Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative space-y-6">
            
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center">
                  <UserPlus size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900">Create Fresh Test User</h3>
                  <p className="text-xs text-muted-foreground font-medium mt-0.5">Creates a brand new user with no data for clean testing.</p>
                </div>
              </div>
              <button 
                onClick={() => setIsCreateModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                <XCircle size={20} />
              </button>
            </div>

            {createdTestUserResult ? (
              <div className="space-y-5 py-2">
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-3">
                  <div className="flex items-center gap-2 text-emerald-700 font-black text-sm">
                    <CheckCircle2 size={18} />
                    <span>Fresh Test User Ready!</span>
                  </div>
                  <p className="text-xs text-emerald-700 font-medium leading-relaxed">
                    This account is completely fresh (no profile, no learners, no enrollments). SMS send is bypassed.
                  </p>
                  
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="bg-white p-3 rounded-xl border border-emerald-100">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Login Phone</span>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-sm font-black text-slate-800">
                          {createdTestUserResult.user.phone.replace(/^\+91/, '')}
                        </span>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(createdTestUserResult.user.phone.replace(/^\+91/, ''), 'phone')}
                          className="p-1 hover:bg-slate-100 rounded text-slate-500"
                          title="Copy phone"
                        >
                          {copiedField === 'phone' ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                        </button>
                      </div>
                    </div>

                    <div className="bg-white p-3 rounded-xl border border-emerald-100">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">OTP</span>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-sm font-black text-slate-800">0000</span>
                        <button
                          type="button"
                          onClick={() => copyToClipboard('0000', 'otp')}
                          className="p-1 hover:bg-slate-100 rounded text-slate-500"
                          title="Copy OTP"
                        >
                          {copiedField === 'otp' ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setCreatedTestUserResult(null);
                      handleSuggestNext();
                    }}
                    className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-bold text-sm transition-all"
                  >
                    Create Another
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="flex-1 py-3 bg-primary text-white rounded-2xl font-bold text-sm shadow-md shadow-primary/20 hover:opacity-95 transition-all"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleCreateTestUser} className="space-y-5">
                {/* Phone Number Input */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-black text-slate-700 uppercase tracking-wider">
                      Mobile Number
                    </label>
                    <button
                      type="button"
                      onClick={handleSuggestNext}
                      disabled={isFetchingNextPhone}
                      className="text-xs font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1 disabled:opacity-50"
                    >
                      <RefreshCw size={12} className={isFetchingNextPhone ? 'animate-spin' : ''} />
                      <span>Suggest Available Number</span>
                    </button>
                  </div>

                  <div className="flex items-center rounded-2xl border border-slate-200 bg-slate-50/50 overflow-hidden focus-within:ring-2 focus-within:ring-purple-400 focus-within:bg-white transition-all">
                    <span className="px-4 py-3 text-sm font-bold text-slate-500 bg-slate-100/70 border-r border-slate-200">
                      +91
                    </span>
                    <input
                      type="text"
                      maxLength={10}
                      value={testPhoneInput}
                      onChange={(e) => setTestPhoneInput(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      placeholder="9000000004"
                      required
                      className="w-full px-4 py-3 bg-transparent text-sm font-bold text-slate-800 outline-none"
                    />
                  </div>
                  <p className="text-[11px] text-muted-foreground font-medium">
                    Numbers like 9000000001–9000000099 look like valid 10-digit Indian numbers and bypass SMS.
                  </p>
                </div>

                {/* Account role note */}
                <div className="p-3 bg-purple-50/60 border border-purple-200/80 rounded-2xl flex items-center justify-between text-xs">
                  <div>
                    <span className="font-black text-purple-900 block">Account Role: PARENT</span>
                    <span className="text-purple-700 text-[11px] block mt-0.5">Daughters are managed directly as Learner Profiles under this parent account.</span>
                  </div>
                  <span className="px-2.5 py-1 bg-purple-200/70 text-purple-800 rounded-lg font-black text-[10px] uppercase tracking-wider">
                    Default
                  </span>
                </div>

                {/* Overwrite Checkbox */}
                <label className="flex items-start gap-3 p-3 bg-amber-50/70 border border-amber-200/80 rounded-2xl cursor-pointer">
                  <input
                    type="checkbox"
                    checked={overwriteIfExists}
                    onChange={(e) => setOverwriteIfExists(e.target.checked)}
                    className="mt-0.5 rounded text-purple-600 focus:ring-purple-400"
                  />
                  <div className="text-xs">
                    <span className="font-bold text-amber-900 block">Wipe and reset if number already exists</span>
                    <span className="text-amber-700 text-[11px] block mt-0.5">
                      If this number has old testing data, it will be wiped completely to give you a 100% fresh start.
                    </span>
                  </div>
                </label>

                {/* Info block */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center gap-2.5 text-xs text-slate-600 font-medium">
                  <Sparkles size={16} className="text-purple-600 shrink-0" />
                  <span>Use OTP <strong className="text-slate-900">0000</strong> to log in. No SMS gateway balance is used.</span>
                </div>

                {/* Modal actions */}
                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-bold text-sm transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingTestUser}
                    className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-2xl font-bold text-sm shadow-md shadow-indigo-200 transition-all disabled:opacity-50"
                  >
                    {isSubmittingTestUser ? 'Creating...' : 'Create Fresh User'}
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}

      {/* Delete User Confirmation Modal */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-6">
            
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <Trash2 size={24} />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900">Delete User Permanently</h3>
                <p className="text-xs text-muted-foreground font-medium mt-0.5">This action cannot be undone.</p>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-bold uppercase">Name</span>
                <span className="font-bold text-slate-800">{userToDelete.profile?.displayName || 'Unknown User'}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-bold uppercase">Phone</span>
                <span className="font-bold text-slate-800">{userToDelete.phone}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-bold uppercase">Role</span>
                <span className="font-bold text-slate-800">{userToDelete.role}</span>
              </div>
              {userToDelete.isTestNumber && (
                <div className="flex justify-between items-center text-xs">
                  <span className="text-purple-600 font-bold uppercase">Account Type</span>
                  <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded font-black text-[10px]">TEST USER</span>
                </div>
              )}
            </div>

            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3">
              <AlertTriangle size={18} className="text-rose-600 shrink-0 mt-0.5" />
              <p className="text-xs text-rose-800 font-medium leading-relaxed">
                Permanently wipes this user and all associated data (learner profiles, course progress, orders, enrollments, and OTP cache). The phone number will be freed for a fresh start.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setUserToDelete(null)}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-bold text-sm transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl font-bold text-sm shadow-md shadow-rose-200 transition-all disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Delete Permanently'}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Reset User Data Confirmation Modal */}
      {userToReset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-6">
            
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                <RotateCcw size={24} />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900">Reset User Data</h3>
                <p className="text-xs text-muted-foreground font-medium mt-0.5">Wipe data back to step 0 for fresh testing.</p>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-bold uppercase">Name</span>
                <span className="font-bold text-slate-800">{userToReset.profile?.displayName || 'Unknown User'}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-bold uppercase">Phone</span>
                <span className="font-bold text-slate-800">{userToReset.phone}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-bold uppercase">Current Step</span>
                <span className="font-bold text-slate-800">Step {userToReset.onboardingStep ?? 0} ({userToReset.accountStatus})</span>
              </div>
            </div>

            <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3">
              <AlertTriangle size={18} className="text-amber-600 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-800 font-medium leading-relaxed">
                This will wipe all daughter profiles, lesson progress, orders, enrollments, and journals. The account will be preserved and reset to <strong>Step 0 (PENDING_SETUP)</strong>, ready to test full onboarding again.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                disabled={isResetting}
                onClick={() => setUserToReset(null)}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-bold text-sm transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isResetting}
                onClick={handleConfirmReset}
                className="flex-1 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-2xl font-bold text-sm shadow-md shadow-amber-200 transition-all disabled:opacity-50"
              >
                {isResetting ? 'Resetting...' : 'Reset to Step 0'}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}