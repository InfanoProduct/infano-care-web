'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, User, Mail, Phone, Calendar, BookOpen, Clock, 
  CheckCircle, ShieldAlert, Award, FileText, ShoppingBag, 
  CalendarCheck, Loader2, Sparkles, Shield, Trash2, CheckCircle2, Link2
} from 'lucide-react';
import { UserApiService } from '@/features/users/services/user-api';
import { toast } from 'react-hot-toast';

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;

  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  async function loadData() {
    try {
      setIsLoading(true);
      setError(null);
      const overview = await UserApiService.fetchUserOverview(userId);
      setData(overview);
    } catch (err: any) {
      console.error('Failed to load user overview:', err);
      setError(err.message || 'Failed to fetch user overview');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (userId) {
      loadData();
    }
  }, [userId]);

  const handleUpdateStatus = async (newStatus: 'ACTIVE' | 'SUSPENDED') => {
    try {
      setIsUpdating(true);
      await UserApiService.updateUserStatus(userId, newStatus);
      toast.success(`User status updated to ${newStatus}`);
      loadData();
    } catch (err) {
      console.error('Failed to update user status', err);
      toast.error('Failed to update user status');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!confirm('Are you sure you want to delete this user? This will hide them from the admin panel.')) return;
    try {
      setIsUpdating(true);
      await UserApiService.deleteUser(userId);
      toast.success('User deleted successfully');
      router.push('/admin/users');
    } catch (err) {
      console.error('Failed to delete user', err);
      toast.error('Failed to delete user');
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center space-y-4 shadow-xl border border-slate-100 animate-pulse">
          <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto" />
          <p className="font-bold text-slate-700">Loading user overview dashboard...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center space-y-4 shadow-xl border border-slate-100">
          <ShieldAlert className="w-16 h-16 text-rose-500 mx-auto" />
          <h3 className="text-xl font-extrabold text-slate-800">Error Loading User</h3>
          <p className="text-muted-foreground font-medium">{error || 'Unable to retrieve user data.'}</p>
          <Link 
            href="/admin/users"
            className="w-full py-3.5 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-2xl shadow-lg shadow-rose-500/25 transition-all inline-block"
          >
            Back to Users List
          </Link>
        </div>
      </div>
    );
  }

  const { 
    user, profile, peerApplication, programEnrollments, 
    scheduledSessions, expertSessions, orders, journeys, enquiries, 
    linkedUser, linkedEnrollments, demoSessions 
  } = data;

  return (
    <div className="min-h-screen bg-slate-50/50 pb-16">
      
      {/* Top sticky header */}
      <div className="bg-white border-b border-slate-200/80 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <Link 
            href="/admin/users" 
            className="inline-flex items-center gap-2 text-xs font-black text-slate-400 hover:text-slate-600 uppercase tracking-wider mb-4 transition-colors"
          >
            <ArrowLeft size={16} />
            <span>Back to Users List</span>
          </Link>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/10 to-primary-light/5 flex items-center justify-center text-primary font-black text-3xl shadow-inner border border-primary/10 shrink-0">
                {profile?.avatarUrl ? (
                  <img src={profile.avatarUrl} alt="Avatar" className="w-full h-full rounded-2xl object-cover" />
                ) : (
                  profile?.displayName?.[0]?.toUpperCase() || user?.phone?.[0] || 'U'
                )}
              </div>
              <div>
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-2xl font-black text-slate-800 tracking-tight leading-tight">
                    {profile?.displayName || 'Community Member'}
                  </h1>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-wider uppercase border ${
                    user.accountStatus === 'ACTIVE' 
                      ? 'bg-green-50 text-green-600 border-green-200' 
                      : 'bg-amber-50 text-amber-600 border-amber-200'
                  }`}>
                    {user.accountStatus}
                  </span>
                  <span className="px-3 py-1 rounded-full text-[10px] font-black tracking-wider uppercase bg-indigo-50 text-indigo-600 border border-indigo-200">
                    {user.role}
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-bold mt-1">
                  ID: {user.id} • Registered on {new Date(user.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {user.accountStatus === 'ACTIVE' ? (
                <button
                  disabled={isUpdating}
                  onClick={() => handleUpdateStatus('SUSPENDED')}
                  className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-50"
                >
                  Suspend User
                </button>
              ) : (
                <button
                  disabled={isUpdating}
                  onClick={() => handleUpdateStatus('ACTIVE')}
                  className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-50"
                >
                  Activate User
                </button>
              )}
              <button
                disabled={isUpdating}
                onClick={handleDeleteUser}
                className="px-4 py-2.5 bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-50 flex items-center gap-1.5"
              >
                <Trash2 size={13} />
                <span>Delete User</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* BOX 1: LINKED USER & PROGRAM PROGRESS (if linked) */}
        {linkedUser && (
          <div className="bg-white border border-slate-200/80 p-8 rounded-[2rem] shadow-sm space-y-6">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-4">
              <Link2 size={22} className="text-indigo-600" />
              <div>
                <h3 className="text-base font-extrabold text-slate-800">Linked Account Progress</h3>
                <p className="text-xs text-slate-400 font-semibold mt-0.5">
                  Linked to {linkedUser.role.toLowerCase()} user: <span className="text-indigo-600 font-bold">{linkedUser.displayName}</span> ({linkedUser.phone})
                </p>
              </div>
            </div>

            {linkedEnrollments.length === 0 ? (
              <p className="text-xs font-bold text-slate-400">Linked user is not enrolled in any programs yet.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {linkedEnrollments.map((enr: any) => (
                  <Link 
                    key={enr.id} 
                    href={`/admin/programs/enrollments/${enr.id}`}
                    title="View linked program enrollment details"
                    className="p-4 bg-slate-50 border border-slate-200/40 rounded-2xl flex items-center justify-between gap-4 hover:border-indigo-500/30 hover:bg-slate-100/50 transition-all group cursor-pointer"
                  >
                    <div className="flex-1 space-y-2">
                      <h4 className="text-xs font-black text-slate-700 group-hover:text-indigo-600 transition-colors">{enr.program.title}</h4>
                      <div className="flex justify-between text-[10px] font-bold text-slate-400">
                        <span>{enr.completedSessionsCount}/{enr.totalSessions} sessions completed</span>
                        <span>{enr.progressPercentage}%</span>
                      </div>
                      <div className="h-2 bg-slate-200/70 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-600 rounded-full transition-all duration-500" style={{ width: `${enr.progressPercentage}%` }} />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* BOX 2: PERSONAL IDENTITY & PROFILE DETAILS */}
        <div className="bg-white border border-slate-200/80 p-8 rounded-[2rem] shadow-sm space-y-6">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-4">
            <User size={22} className="text-primary" />
            <div>
              <h3 className="text-base font-extrabold text-slate-800">Identity & Profile Info</h3>
              <p className="text-xs text-slate-400 font-semibold mt-0.5">Basic user information and bio statement</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-4">
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Bio / Profile Description</span>
              <p className="text-sm font-semibold text-slate-600 leading-relaxed italic bg-slate-50 p-4 rounded-2xl border border-slate-100">
                "{profile?.bio || 'No bio or profile description has been written yet.'}"
              </p>
            </div>

            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">Account Metrics</span>
              <div className="space-y-2.5 text-xs font-bold text-slate-600">
                <div className="flex justify-between pb-1.5 border-b border-slate-200/40">
                  <span>Bloom Level</span>
                  <span className="text-slate-800">{profile?.bloomLevel || 1}</span>
                </div>
                <div className="flex justify-between pb-1.5 border-b border-slate-200/40">
                  <span>Experience XP</span>
                  <span className="text-slate-800">{profile?.totalPoints || 0} XP</span>
                </div>
                <div className="flex justify-between">
                  <span>Phone Number</span>
                  <span className="text-slate-800">{user.phone || '-'}</span>
                </div>
              </div>
            </div>
          </div>

          <dl className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-slate-100">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <dt className="text-[10px] text-slate-400 font-bold uppercase">Display Name</dt>
              <dd className="text-sm font-bold text-slate-800 mt-0.5">{profile?.displayName || '-'}</dd>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <dt className="text-[10px] text-slate-400 font-bold uppercase">Username</dt>
              <dd className="text-sm font-bold text-slate-800 mt-0.5">{profile?.journeyName || '-'}</dd>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <dt className="text-[10px] text-slate-400 font-bold uppercase">Pronouns</dt>
              <dd className="text-sm font-bold text-slate-800 mt-0.5">{profile?.pronouns || '-'}</dd>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <dt className="text-[10px] text-slate-400 font-bold uppercase">Registered Email</dt>
              <dd className="text-sm font-bold text-slate-800 mt-0.5 truncate" title={user.email}>{user.email || '-'}</dd>
            </div>
          </dl>
        </div>

        {/* BOX 3: LEARNING PROGRAMS PROGRESS */}
        <div className="bg-white border border-slate-200/80 p-8 rounded-[2rem] shadow-sm space-y-6">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-4">
            <Award size={22} className="text-primary" />
            <div>
              <h3 className="text-base font-extrabold text-slate-800">Learning Programs</h3>
              <p className="text-xs text-slate-400 font-semibold mt-0.5">High-level session completions in booked mentoring programs</p>
            </div>
          </div>

          {programEnrollments.length === 0 ? (
            <p className="text-xs font-bold text-slate-400 text-center py-6">Not enrolled in any mentoring programs yet.</p>
          ) : (
            <div className="space-y-4">
              {programEnrollments.map((enr: any) => {
                const total = enr.totalSessions || 8;
                const completed = enr.completedSessionsCount || 0;
                const pct = enr.progressPercentage || 0;

                return (
                  <Link 
                    key={enr.id} 
                    href={`/admin/programs/enrollments/${enr.id}`}
                    title="Open enrollment details page"
                    className="p-5 bg-slate-50 border border-slate-200/40 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-6 hover:border-primary/30 hover:bg-slate-100/50 transition-all group cursor-pointer block"
                  >
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-3">
                        {enr.program.thumbnailUrl && (
                          <img src={enr.program.thumbnailUrl} alt={enr.program.title} className="w-10 h-10 rounded-xl object-cover shrink-0 border border-slate-200" />
                        )}
                        <div>
                          <h4 className="font-extrabold text-slate-800 text-sm group-hover:text-primary transition-colors">{enr.program.title}</h4>
                          <p className="text-[11px] text-slate-400 font-bold">{enr.program.classRange} • {enr.program.duration}</p>
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-[11px] font-bold text-slate-500">
                          <span>{completed} of {total} curriculum sessions completed</span>
                          <span>{pct}%</span>
                        </div>
                        <div className="h-2 bg-slate-200/50 rounded-full overflow-hidden">
                          <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    </div>
                    <div className="p-3 bg-white border border-slate-200/20 rounded-xl text-left sm:text-right shrink-0 min-w-32">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Cost Paid</span>
                      <span className="text-sm font-black text-slate-800">₹{enr.pricePaid.toLocaleString('en-IN')}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* BOX 4: DEMO SESSIONS BOOKED */}
        <div className="bg-white border border-slate-200/80 p-8 rounded-[2rem] shadow-sm space-y-6">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-4">
            <Sparkles size={22} className="text-amber-500" />
            <div>
              <h3 className="text-base font-extrabold text-slate-800">Demo Sessions</h3>
              <p className="text-xs text-slate-400 font-semibold mt-0.5">Booked initial parent demo sessions and follow-up status</p>
            </div>
          </div>

          {!demoSessions || demoSessions.length === 0 ? (
            <p className="text-xs font-bold text-slate-400 text-center py-6">No demo sessions scheduled.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {demoSessions.map((demo: any) => (
                <Link 
                  key={demo.id} 
                  href={`/admin/programs/demos/${demo.id}`}
                  title="Open demo session detail page"
                  className="p-5 bg-slate-50 border border-slate-200/40 rounded-2xl space-y-4 hover:border-amber-500/35 hover:bg-slate-100/50 transition-all group cursor-pointer block text-left"
                >
                  <div className="flex justify-between items-center border-b border-slate-200/30 pb-2.5">
                    <div>
                      <span className="text-xs font-black text-slate-700 block group-hover:text-amber-500 transition-colors">Demo Session Request</span>
                      <span className="text-[9px] font-bold text-slate-400">Class: {demo.classRange}</span>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-lg text-[9px] font-black tracking-wider uppercase border ${
                      demo.status === 'COMPLETED' ? 'bg-green-50 text-green-600 border-green-200' :
                      demo.status === 'PENDING' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                      'bg-blue-50 text-blue-600 border-blue-200'
                    }`}>
                      {demo.status}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-600 font-semibold">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Parent Name</span>
                      <span className="text-slate-800">{demo.parentName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Contact Phone</span>
                      <span className="text-slate-800">{demo.phone}</span>
                    </div>
                    {demo.slotDate && (
                      <div className="flex justify-between text-indigo-600">
                        <span>Preferred Slot</span>
                        <span>{demo.slotDate} @ {demo.slotTime || '-'}</span>
                      </div>
                    )}
                  </div>

                  {demo.comment && (
                    <div className="bg-white p-2.5 rounded-xl border border-slate-200/20 text-[11px] text-slate-500 font-semibold italic">
                      "{demo.comment}"
                    </div>
                  )}

                  {demo.isReadyToEnroll && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-lg text-[9px] font-black uppercase">
                      Ready to enroll
                    </span>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* BOX 5: LEARNING JOURNEYS PROGRESS */}
        <div className="bg-white border border-slate-200/80 p-8 rounded-[2rem] shadow-sm space-y-6">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-4">
            <BookOpen size={22} className="text-emerald-500" />
            <div>
              <h3 className="text-base font-extrabold text-slate-800">Learning Journeys</h3>
              <p className="text-xs text-slate-400 font-semibold mt-0.5">Chapters read and progress calculated across active journeys</p>
            </div>
          </div>

          {journeys.length === 0 ? (
            <p className="text-xs font-bold text-slate-400 text-center py-6">No journeys started or active.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {journeys.map((j: any) => (
                <Link 
                  key={j.id} 
                  href="/admin/learning"
                  title="Open Learning Journeys management tab"
                  className="p-5 bg-slate-50 border border-slate-200/40 rounded-2xl space-y-3 hover:border-emerald-500/30 hover:bg-slate-100/50 transition-all group cursor-pointer block"
                >
                  <div className="flex items-center gap-3">
                    {j.thumbnailUrl && (
                      <img src={j.thumbnailUrl} alt={j.title} className="w-10 h-10 rounded-xl object-cover shrink-0 border border-slate-200" />
                    )}
                    <div>
                      <h4 className="font-extrabold text-slate-800 text-sm group-hover:text-emerald-600 transition-colors">{j.title}</h4>
                      <p className="text-[10px] text-slate-400 font-medium line-clamp-1">{j.description}</p>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] font-bold text-slate-500">
                      <span>{j.completedEpisodesCount}/{j.totalEpisodes} chapters completed</span>
                      <span>{j.progressPercentage}%</span>
                    </div>
                    <div className="h-2 bg-slate-200/50 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${j.progressPercentage}%` }} />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* BOX 6: PEER ONBOARDING DETAILS */}
        {peerApplication && (
          <div className="bg-white border border-slate-200/80 p-8 rounded-[2rem] shadow-sm space-y-6">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-4">
              <Shield size={22} className="text-primary" />
              <div>
                <h3 className="text-base font-extrabold text-slate-800">Peer Onboarding Status</h3>
                <p className="text-xs text-slate-400 font-semibold mt-0.5">Mentoring score, personal statement, and scenario responses</p>
              </div>
            </div>

            <Link 
              href={`/admin/connect/peers/${userId}/application`}
              title="Open peer application details screen"
              className="grid grid-cols-1 sm:grid-cols-2 gap-4 cursor-pointer block group"
            >
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/40 hover:border-primary/45 hover:bg-slate-100/50 transition-all">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Application Status</span>
                <span className="text-sm font-black text-slate-800 mt-1 uppercase flex items-center gap-1 group-hover:text-primary transition-colors">
                  {peerApplication.status}
                  <span className="text-[9px] text-slate-400 lowercase font-medium">(click to view details)</span>
                </span>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/40 hover:border-primary/45 hover:bg-slate-100/50 transition-all">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Assessment Score</span>
                <span className="text-sm font-black text-primary mt-1">
                  {peerApplication.trainingScore !== null ? `${peerApplication.trainingScore} / 10` : 'Pending assessment'}
                </span>
              </div>
            </Link>

            <div className="space-y-2">
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Personal Statement</span>
              <p className="text-xs font-semibold text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100 italic">
                "{peerApplication.personalStatement}"
              </p>
            </div>

            {peerApplication.scenarioResponses && peerApplication.scenarioResponses.length > 0 && (
              <div className="space-y-4">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Scenario Test Cases</span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {peerApplication.scenarioResponses.map((resp: string, idx: number) => (
                    <div key={idx} className="p-4 bg-slate-50 border border-slate-200/30 rounded-2xl space-y-2">
                      <span className="text-[9px] font-black text-primary uppercase">Scenario Case #{idx + 1}</span>
                      <p className="text-xs font-semibold text-slate-600 leading-relaxed italic">"{resp}"</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* BOX 7: EXPERT 1:1 CONSULTATIONS */}
        <div className="bg-white border border-slate-200/80 p-8 rounded-[2rem] shadow-sm space-y-6">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-4">
            <CalendarCheck size={22} className="text-amber-500" />
            <div>
              <h3 className="text-base font-extrabold text-slate-800">Expert 1:1 Consultations</h3>
              <p className="text-xs text-slate-400 font-semibold mt-0.5">Scheduled paid consultations booked through parent/teen dashboard</p>
            </div>
          </div>

          {!expertSessions || expertSessions.length === 0 ? (
            <p className="text-xs font-bold text-slate-400 text-center py-6">No paid 1:1 session consultations booked.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {expertSessions.map((session: any) => (
                <Link 
                  key={session.id} 
                  href="/admin/expert-consultations"
                  title="Open Consultations tab calendar"
                  className="p-4 bg-slate-50 border border-slate-200/40 rounded-2xl flex justify-between items-center gap-4 hover:border-amber-500/30 hover:bg-slate-100/50 transition-all group cursor-pointer block"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-black text-slate-800 group-hover:text-amber-600 transition-colors">
                        {session.expert?.profile?.displayName || session.expert?.username || 'Expert'}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-black tracking-wider uppercase ${
                        session.status === 'COMPLETED' ? 'bg-green-50 text-green-600 border border-green-200' :
                        session.status === 'SCHEDULED' ? 'bg-blue-50 text-blue-600 border border-blue-200' :
                        'bg-rose-50 text-rose-600 border border-rose-200'
                      }`}>
                        {session.status}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                      <Clock size={12} />
                      {new Date(session.scheduledAt).toLocaleString('en-IN', {
                        day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <div className="text-right flex items-center gap-3">
                    {session.meetingLink && session.status === 'SCHEDULED' && (
                      <span className="px-3.5 py-1.5 bg-primary text-white text-[10px] font-black rounded-lg shadow-sm hover:scale-105 active:scale-95 transition-all">
                        Join Meeting
                      </span>
                    )}
                    <div className="p-2 bg-white border border-slate-200/10 rounded-lg">
                      <span className="text-[9px] font-black text-slate-400 block">Paid</span>
                      <span className="text-xs font-black text-slate-800">₹{session.amount}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* BOX 8: SHOP ORDERS */}
        <div className="bg-white border border-slate-200/80 p-8 rounded-[2rem] shadow-sm space-y-6">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-4">
            <ShoppingBag size={22} className="text-rose-500" />
            <div>
              <h3 className="text-base font-extrabold text-slate-800">Shop Purchase History</h3>
              <p className="text-xs text-slate-400 font-semibold mt-0.5">Purchases, pricing, line items, and delivery details</p>
            </div>
          </div>

          {orders.length === 0 ? (
            <p className="text-xs font-bold text-slate-400 text-center py-6">No store orders found.</p>
          ) : (
            <div className="space-y-4">
              {orders.map((order: any) => (
                <Link 
                  key={order.id} 
                  href={`/admin/orders/${order.id}`}
                  title="Open purchase order invoice details"
                  className="p-5 bg-slate-50 border border-slate-200/40 rounded-2xl space-y-4 hover:border-rose-500/30 hover:bg-slate-100/50 transition-all group cursor-pointer block text-left"
                >
                  <div className="flex justify-between items-center border-b border-slate-200/30 pb-2.5 flex-wrap gap-2">
                    <div>
                      <span className="text-xs font-black text-slate-700 block group-hover:text-rose-500 transition-colors">Order ID: {order.id}</span>
                      <span className="text-[9px] font-bold text-slate-400">{new Date(order.createdAt).toLocaleDateString('en-IN')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black tracking-wider uppercase border ${
                        order.orderStatus === 'DELIVERED' ? 'bg-green-50 text-green-600 border-green-200' :
                        order.orderStatus === 'SHIPPED' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                        'bg-amber-50 text-amber-600 border-amber-200'
                      }`}>
                        {order.orderStatus}
                      </span>
                      <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black tracking-wider uppercase border ${
                        order.paymentStatus === 'PAID' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                        'bg-rose-50 text-rose-600 border-rose-200'
                      }`}>
                        {order.paymentStatus}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {order.items?.map((item: any) => (
                      <div key={item.id} className="flex items-center gap-3 justify-between bg-white p-3 rounded-xl border border-slate-200/30">
                        <div className="flex items-center gap-2.5">
                          {item.book?.thumbnailUrl && (
                            <img src={item.book.thumbnailUrl} alt={item.book.title} className="w-8 h-8 rounded-lg object-cover shrink-0 border border-slate-100" />
                          )}
                          <div>
                            <span className="font-extrabold text-[11px] text-slate-700 block line-clamp-1">{item.book?.title || 'Book Item'}</span>
                            <span className="text-[9px] text-slate-400 font-bold">Quantity: {item.quantity}</span>
                          </div>
                        </div>
                        <span className="text-xs font-black text-slate-600">₹{(item.price || 0).toLocaleString('en-IN')}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 text-xs">
                    <span className="text-[10px] text-slate-400 font-bold">
                      Address: {order.shippingAddress}, {order.city}, {order.state} - {order.pincode}
                    </span>
                    <span className="font-black text-slate-800">
                      Total: ₹{order.totalAmount.toLocaleString('en-IN')}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* BOX 9: SUBMITTED NGO/SCHOOL ENQUIRIES */}
        <div className="bg-white border border-slate-200/80 p-8 rounded-[2rem] shadow-sm space-y-6">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-4">
            <FileText size={22} className="text-slate-500" />
            <div>
              <h3 className="text-base font-extrabold text-slate-800">Submitted Enquiries</h3>
              <p className="text-xs text-slate-400 font-semibold mt-0.5">School collaborations or program enquiries filed</p>
            </div>
          </div>

          {enquiries.length === 0 ? (
            <p className="text-xs font-bold text-slate-400 text-center py-6">No submitted inquiries found.</p>
          ) : (
            <div className="space-y-4">
              {enquiries.map((enq: any) => (
                <Link 
                  key={enq.id} 
                  href={`/admin/enquiries/${enq.id}`}
                  title="Open enquiry form details page"
                  className="p-5 bg-slate-50 border border-slate-200/40 rounded-2xl space-y-4 hover:border-indigo-500/30 hover:bg-slate-100/50 transition-all group cursor-pointer block text-left"
                >
                  <div className="flex justify-between items-center border-b border-slate-200/30 pb-2.5">
                    <div>
                      <span className="text-xs font-black text-slate-800 block group-hover:text-indigo-600 transition-colors">
                        {enq.type === 'ngo' ? 'NGO Enquiry' : 'School Collaboration'}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400">{new Date(enq.createdAt).toLocaleDateString('en-IN')}</span>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-600 text-[10px] font-black uppercase tracking-wider">
                      {enq.schoolType || 'Enquiry'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                    {enq.schoolName && (
                      <div>
                        <span className="text-[9px] text-slate-400 font-bold block uppercase">Institution</span>
                        <span className="font-bold text-slate-700 block mt-0.5">{enq.schoolName}</span>
                      </div>
                    )}
                    {enq.cityState && (
                      <div>
                        <span className="text-[9px] text-slate-400 font-bold block uppercase">Location</span>
                        <span className="font-bold text-slate-700 block mt-0.5">{enq.cityState}</span>
                      </div>
                    )}
                    {enq.totalGirls && (
                      <div>
                        <span className="text-[9px] text-slate-400 font-bold block uppercase">Girls Count</span>
                        <span className="font-bold text-slate-700 block mt-0.5">{enq.totalGirls}</span>
                      </div>
                    )}
                    {enq.contactName && (
                      <div>
                        <span className="text-[9px] text-slate-400 font-bold block uppercase">Representative</span>
                        <span className="font-bold text-slate-700 block mt-0.5">{enq.contactName}</span>
                      </div>
                    )}
                  </div>

                  {enq.details && (
                    <div className="bg-white p-3 rounded-xl border border-slate-200/20 text-xs text-slate-500 font-semibold leading-relaxed">
                      "{enq.details}"
                    </div>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
