'use client';

import { useUsers } from '../hooks/use-users';
import { useState } from 'react';
import { 
  Search, MoreVertical, CheckCircle2, Clock, Eye, Trash2, Users, 
  XCircle, UserPlus, Sparkles, AlertTriangle, RefreshCw, Copy, Check, RotateCcw, GraduationCap 
} from 'lucide-react';
import { UserApiService, User } from '../services/user-api';
import { toast } from 'react-hot-toast';
import Link from 'next/link';

export function UserList() {
  const [page, setPage] = useState(1);
  const [selectedRole, setSelectedRole] = useState<string | undefined>(undefined);
  const [selectedStatus, setSelectedStatus] = useState<string | undefined>(undefined);
  const [selectedLearnerStatus, setSelectedLearnerStatus] = useState<'CREATED' | 'NOT_CREATED' | undefined>(undefined);
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
    learnerCreated: dateFilteredUsers.filter(u => u.learners && u.learners.length > 0).length,
    learnerNotCreated: dateFilteredUsers.filter(u => !u.learners || u.learners.length === 0).length,
    pending: dateFilteredUsers.filter(u => u.accountStatus === 'PENDING_SETUP').length,
    test: dateFilteredUsers.filter(u => u.isTestNumber).length,
  };

  // Perform search and card selection filters instantly on the client side
  const filteredUsers = dateFilteredUsers.filter(u => {
    if (filterTestOnly && !u.isTestNumber) return false;
    if (selectedRole && u.role !== selectedRole) return false;
    if (selectedStatus && u.accountStatus !== selectedStatus) return false;
    if (selectedLearnerStatus === 'CREATED' && (!u.learners || u.learners.length === 0)) return false;
    if (selectedLearnerStatus === 'NOT_CREATED' && (u.learners && u.learners.length > 0)) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const displayName = (u.profile?.displayName || '').toLowerCase();
      const phone = u.phone || '';
      const learnerNames = (u.learners || []).map(l => l.name.toLowerCase()).join(' ');
      return displayName.includes(term) || phone.includes(term) || learnerNames.includes(term);
    }
    return true;
  });

  // Client-side pagination variables
  const limit = 15;
  const totalPages = Math.ceil(filteredUsers.length / limit) || 1;
  const paginatedUsers = filteredUsers.slice((page - 1) * limit, page * limit);

  return (
    <div className="space-y-6">
      
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
      <div className="bg-white rounded-2xl p-5 border border-border shadow-sm flex flex-col gap-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
          <div>
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 mb-0.5">
              <Users size={15} className="text-primary" /> Total Members
            </span>
            <div className="flex items-baseline gap-2.5">
              <span className="text-3xl font-black text-slate-900 leading-none">
                {counts.all}
              </span>
              <span className="text-xs font-medium text-muted-foreground">All registered users</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-3 border-t border-slate-100">
          
          <button
            onClick={() => {
              setSelectedRole(undefined);
              setSelectedStatus(undefined);
              setSelectedLearnerStatus(undefined);
              setFilterTestOnly(false);
              setPage(1);
            }}
            className={`text-left rounded-xl p-3 border flex flex-col gap-0.5 transition-all hover:scale-[1.02] active:scale-95 ${
              !selectedRole && !selectedStatus && !selectedLearnerStatus && !filterTestOnly
                ? 'bg-slate-200 border-slate-400 shadow-sm ring-1 ring-slate-400'
                : 'bg-slate-50 border-slate-200/70 hover:border-slate-300'
            }`}
          >
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">All Members</span>
            <span className="text-xl font-bold text-slate-800">
              {counts.all}
            </span>
          </button>

          <button
            onClick={() => {
              setSelectedRole(undefined);
              setSelectedStatus('ACTIVE');
              setSelectedLearnerStatus(undefined);
              setFilterTestOnly(false);
              setPage(1);
            }}
            className={`text-left rounded-xl p-3 border flex flex-col gap-0.5 transition-all hover:scale-[1.02] active:scale-95 ${
              selectedStatus === 'ACTIVE' && !filterTestOnly
                ? 'bg-emerald-100 border-emerald-400 shadow-sm ring-1 ring-emerald-400'
                : 'bg-slate-50 border-slate-200/70 hover:border-slate-300'
            }`}
          >
            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Active</span>
            <span className="text-xl font-bold text-emerald-700">{counts.active}</span>
          </button>

          <button
            onClick={() => {
              setSelectedRole(undefined);
              setSelectedStatus(undefined);
              setSelectedLearnerStatus(selectedLearnerStatus === 'CREATED' ? undefined : 'CREATED');
              setFilterTestOnly(false);
              setPage(1);
            }}
            className={`text-left rounded-xl p-3 border flex flex-col gap-0.5 transition-all hover:scale-[1.02] active:scale-95 ${
              selectedLearnerStatus === 'CREATED' && !filterTestOnly
                ? 'bg-teal-100 border-teal-400 shadow-sm ring-1 ring-teal-400'
                : 'bg-slate-50 border-slate-200/70 hover:border-slate-300'
            }`}
          >
            <span className="text-[10px] font-bold text-teal-700 uppercase tracking-wider flex items-center gap-1">
              <GraduationCap size={12} /> Learner Created
            </span>
            <span className="text-xl font-bold text-teal-800">{counts.learnerCreated}</span>
          </button>

          <button
            onClick={() => {
              setSelectedRole(undefined);
              setSelectedStatus(undefined);
              setSelectedLearnerStatus(selectedLearnerStatus === 'NOT_CREATED' ? undefined : 'NOT_CREATED');
              setFilterTestOnly(false);
              setPage(1);
            }}
            className={`text-left rounded-xl p-3 border flex flex-col gap-0.5 transition-all hover:scale-[1.02] active:scale-95 ${
              selectedLearnerStatus === 'NOT_CREATED' && !filterTestOnly
                ? 'bg-amber-100 border-amber-400 shadow-sm ring-1 ring-amber-400'
                : 'bg-slate-50 border-slate-200/70 hover:border-slate-300'
            }`}
          >
            <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">No Learner</span>
            <span className="text-xl font-bold text-amber-800">{counts.learnerNotCreated}</span>
          </button>

          <button
            onClick={() => {
              setSelectedRole(undefined);
              setSelectedStatus('PENDING_SETUP');
              setSelectedLearnerStatus(undefined);
              setFilterTestOnly(false);
              setPage(1);
            }}
            className={`text-left rounded-xl p-3 border flex flex-col gap-0.5 transition-all hover:scale-[1.02] active:scale-95 ${
              selectedStatus === 'PENDING_SETUP' && !filterTestOnly
                ? 'bg-indigo-100 border-indigo-400 shadow-sm ring-1 ring-indigo-400'
                : 'bg-slate-50 border-slate-200/70 hover:border-slate-300'
            }`}
          >
            <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">Pending Setup</span>
            <span className="text-xl font-bold text-indigo-700">{counts.pending}</span>
          </button>

          <button
            onClick={() => {
              setSelectedRole(undefined);
              setSelectedStatus(undefined);
              setSelectedLearnerStatus(undefined);
              setFilterTestOnly(!filterTestOnly);
              setPage(1);
            }}
            className={`text-left rounded-xl p-3 border flex flex-col gap-0.5 transition-all hover:scale-[1.02] active:scale-95 ${
              filterTestOnly
                ? 'bg-purple-100 border-purple-400 shadow-sm ring-1 ring-purple-400'
                : 'bg-slate-50 border-slate-200/70 hover:border-slate-300'
            }`}
          >
            <span className="text-[10px] font-bold text-purple-600 uppercase tracking-wider flex items-center gap-1">
              <Sparkles size={12} /> Test Users
            </span>
            <span className="text-xl font-bold text-purple-700">{counts.test}</span>
          </button>

        </div>
      </div>

      {/* 3. Table Card with Embedded Search Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-border relative z-10 overflow-hidden">
        
        {/* Search header built-in */}
        <div className="p-4 sm:p-5 border-b border-border flex flex-col md:flex-row gap-4 justify-between items-center bg-slate-50/50">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" size={17} />
            <input 
              type="text" 
              placeholder="Search by name or phone..." 
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-white focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm font-medium"
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {selectedLearnerStatus && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-teal-50 text-teal-700 border border-teal-200 rounded-xl text-xs font-bold">
                <GraduationCap size={14} />
                <span>{selectedLearnerStatus === 'CREATED' ? 'Learner created' : 'No learner created'}</span>
                <button 
                  onClick={() => setSelectedLearnerStatus(undefined)}
                  className="ml-1 text-teal-400 hover:text-teal-700"
                >
                  <XCircle size={14} />
                </button>
              </div>
            )}
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
        </div>

        {/* Table Body - Scrollable Container */}
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse table-auto min-w-[960px]">
            <thead>
              <tr className="bg-slate-50/75 border-b border-border sticky top-0 backdrop-blur-md z-20">
                <th className="px-5 py-3.5 text-[11px] uppercase tracking-wider font-bold text-slate-500 min-w-[190px]">User Identity</th>
                <th className="px-5 py-3.5 text-[11px] uppercase tracking-wider font-bold text-slate-500 min-w-[140px]">Contact Details</th>
                <th className="px-5 py-3.5 text-[11px] uppercase tracking-wider font-bold text-slate-500 min-w-[130px]">Learner Profile</th>
                <th className="px-5 py-3.5 text-[11px] uppercase tracking-wider font-bold text-slate-500 min-w-[120px]">Account Status</th>
                <th className="px-5 py-3.5 text-[11px] uppercase tracking-wider font-bold text-slate-500 min-w-[140px]">Membership</th>
                <th className="px-5 py-3.5 text-right text-[11px] uppercase tracking-wider font-bold text-slate-500 min-w-[140px]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-slate-400 font-semibold text-sm">No members found.</td>
                </tr>
              ) : (
                paginatedUsers.map((user, index) => {
                  const isNearBottom = index >= paginatedUsers.length - 2;
                  return (
                    <tr key={user.id} className="hover:bg-slate-50/75 transition-colors group">
                      
                      {/* User Identity */}
                      <td className="px-5 py-3.5 align-middle">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5 whitespace-nowrap">
                            <span className="font-semibold text-slate-800 text-sm leading-tight whitespace-nowrap">{user.profile?.displayName || 'Unknown User'}</span>
                            {user.isTestNumber && (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-purple-100 text-purple-700 border border-purple-200">
                                TEST
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400 font-medium font-mono leading-none">ID: {user.id.slice(0, 8)}</p>
                        </div>
                      </td>

                      {/* Contact details */}
                      <td className="px-5 py-3.5 align-middle">
                        <div className="space-y-0.5">
                          <span className="text-sm font-semibold text-slate-700 block whitespace-nowrap leading-tight">{user.phone}</span>
                          {user.email && (
                            <span className="text-[11px] text-slate-400 font-normal block truncate max-w-[150px] leading-none" title={user.email}>{user.email}</span>
                          )}
                        </div>
                      </td>

                      {/* Learner Profile Status */}
                      <td className="px-5 py-3.5 align-middle whitespace-nowrap">
                        {user.learners && user.learners.length > 0 ? (
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1.5 whitespace-nowrap">
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <CheckCircle2 size={12} className="text-emerald-600" />
                                {user.learners[0].name}
                              </span>
                              {user.learners.length > 1 && (
                                <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200" title={user.learners.map(l => l.name).join(', ')}>
                                  +{user.learners.length - 1}
                                </span>
                              )}
                            </div>
                            {user.learners[0]?.age && (
                              <p className="text-[11px] text-slate-400 font-medium pl-0.5 leading-none">
                                Age: {user.learners[0].age} yrs
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-500 border border-slate-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                            Not Created
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-3.5 align-middle whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${
                          user.accountStatus === 'ACTIVE' 
                            ? 'bg-green-50 text-green-700 border-green-200' 
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            user.accountStatus === 'ACTIVE' ? 'bg-green-500' : 'bg-amber-500'
                          }`} />
                          {user.accountStatus}
                        </span>
                      </td>

                      <td className="px-5 py-3.5 align-middle whitespace-nowrap">
                        <p className="text-sm font-semibold text-slate-700 whitespace-nowrap leading-tight">{new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                        <p className="text-[11px] text-slate-400 whitespace-nowrap mt-0.5 leading-none">Joined at {new Date(user.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                      </td>

                      <td className="px-5 py-3.5 align-middle text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5 relative">
                          <Link 
                            href={`/admin/users/${user.id}`}
                            title="View user overview page"
                            className="p-2 bg-slate-50 hover:bg-primary/10 hover:text-primary text-slate-600 rounded-lg transition-all border border-slate-200 shadow-sm"
                          >
                            <Eye size={15} />
                          </Link>

                          <button 
                            onClick={() => setActiveMenuUserId(activeMenuUserId === user.id ? null : user.id)}
                            className="p-2 bg-slate-50 hover:bg-slate-100 hover:text-slate-800 text-slate-600 rounded-lg transition-all border border-slate-200 shadow-sm"
                          >
                            <MoreVertical size={15} />
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
        <div className="px-6 py-4 bg-slate-50/80 backdrop-blur-md flex items-center justify-between border-t border-border">
          <p className="text-sm font-semibold text-muted-foreground">
            Showing <span className="text-foreground font-bold">{paginatedUsers.length}</span> of <span className="text-foreground font-bold">{filteredUsers.length}</span> members
          </p>
          <div className="flex items-center gap-3">
            <button 
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              className="px-5 py-2 bg-white border border-border rounded-xl text-sm font-semibold shadow-sm transition-all hover:bg-secondary disabled:opacity-40 disabled:hover:bg-white"
            >
              Previous
            </button>
            <button 
              disabled={page === totalPages}
              onClick={() => setPage(p => p + 1)}
              className="px-5 py-2 bg-primary text-white rounded-xl text-sm font-semibold shadow-md shadow-primary/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-40"
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