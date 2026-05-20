"use client";

import { useState, useEffect, useCallback } from 'react';
import { 
  Activity, Star, MessageSquare, Gift, TrendingUp, Clock, Users, Calendar, Zap, 
  BookOpen, Trophy, ArrowRight, Loader2
} from 'lucide-react';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth-store';
import { apiClient } from '@/lib/api-client';

export default function MentorDashboardOverview() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<any>(null);
  const [trainingStatus, setTrainingStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    try {
      const [statsRes, trainingRes]: [any, any] = await Promise.all([
        apiClient.get('/peerline/mentor/stats').catch(() => ({})),
        apiClient.get('/peerline/training/status').catch(() => ({})),
      ]);
      setStats(statsRes);
      setTrainingStatus(trainingRes);
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4 text-purple-500">
        <Loader2 className="animate-spin" size={40} />
        <span className="font-bold text-xl">Loading Workspace...</span>
      </div>
    );
  }

  const isCertified = user?.role === 'PEER' || user?.role === 'ADMIN' || user?.role === 'EXPERT';
  const completedCount = trainingStatus?.completedEpisodes?.length || 0;
  const progressPercentage = Math.round((completedCount / 4) * 100); 

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-end mb-4">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Workspace Overview</h1>
          <p className="text-slate-500">
            {isCertified 
              ? "Welcome back. Your impact today is being tracked." 
              : "Complete your training to unlock full platform features."}
          </p>
        </div>
        {isCertified && (
          <button className="bg-purple-600 hover:bg-purple-700 text-white py-3 px-6 rounded-2xl flex items-center gap-2 shadow-lg shadow-purple-200 transition-all active:scale-95">
            <MessageSquare size={20} /> Active Sessions
          </button>
        )}
      </div>

      {/* Certification Progress for Trainees */}
      {!isCertified && (
        <div className="bg-gradient-to-br from-purple-600 to-violet-700 p-10 rounded-[3rem] text-white shadow-2xl shadow-purple-200/50 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 blur-3xl rounded-full translate-x-1/3 -translate-y-1/3" />
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 rounded-full text-[10px] font-black tracking-widest uppercase mb-4 backdrop-blur-sm">
                <BookOpen size={12} /> Certification In Progress
              </div>
              <h2 className="text-4xl font-black mb-4">Unlock Your Potential</h2>
              <p className="text-purple-100 text-lg mb-8 leading-relaxed">
                You've completed <span className="font-black text-white">{completedCount} of 4</span> episodes. 
                Finish the journey to start supporting mentees and earning rewards.
              </p>
              <Link 
                href="/peerline/dashboard/training"
                className="bg-white text-purple-700 px-8 py-4 rounded-2xl font-black flex items-center gap-3 w-fit shadow-2xl hover:scale-105 transition-all"
              >
                Continue Training <ArrowRight size={20} />
              </Link>
            </div>
            <div className="flex flex-col items-center">
              <div className="relative w-48 h-48 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="96"
                    cy="96"
                    r="88"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="transparent"
                    className="text-white/10"
                  />
                  <circle
                    cx="96"
                    cy="96"
                    r="88"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="transparent"
                    strokeDasharray={552.92}
                    strokeDashoffset={552.92 - (552.92 * progressPercentage) / 100}
                    className="text-white transition-all duration-1000 ease-out"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-5xl font-black">{progressPercentage}%</span>
                  <span className="text-[10px] font-bold tracking-[0.2em] text-white/70 uppercase">Journey</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid for Certified Mentors */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50">
          <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mb-6">
            <Activity size={24} />
          </div>
          <div className="text-4xl font-black text-slate-900 mb-1">{stats?.activeSessions || 0}</div>
          <div className="text-sm font-bold text-slate-500 uppercase tracking-widest">Active Chats</div>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50">
          <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center mb-6">
            <Star size={24} />
          </div>
          <div className="text-4xl font-black text-slate-900 mb-1">{stats?.rating || '0.0'}</div>
          <div className="text-sm font-bold text-slate-500 uppercase tracking-widest">Avg Rating</div>
        </div>
        <div className="bg-gradient-to-br from-purple-600 to-indigo-700 p-6 rounded-[2rem] text-white shadow-xl shadow-purple-200/40 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-2xl rounded-full translate-x-1/2 -translate-y-1/2" />
          <div className="flex justify-between items-start mb-6 relative z-10">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-white backdrop-blur-sm">
              <Gift size={24} />
            </div>
            <span className="text-[10px] font-black tracking-widest px-3 py-1 bg-white text-purple-700 rounded-full">REWARDS</span>
          </div>
          <div className="text-4xl font-black mb-1 relative z-10">{(stats?.points || 0).toLocaleString()}</div>
          <div className="text-sm font-bold text-white/80 uppercase tracking-widest relative z-10">Available Pts</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {isCertified && (
            <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <TrendingUp size={20} className="text-purple-600" /> Goal Tracking
              </h3>
              <div className="flex justify-between text-sm font-bold mb-2">
                <span>{(stats?.points || 0).toLocaleString()} pts</span>
                <span>12,000 pts</span>
              </div>
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-purple-600 transition-all duration-1000" 
                  style={{ width: `${Math.min(100, Math.round(((stats?.points || 0) / 12000) * 100))}%` }} 
                />
              </div>
              <p className="text-xs text-slate-500 mt-4 italic font-medium">
                {stats?.points >= 12000 ? "You've reached the top tier! Keep it up." : `Earn ${(12000 - (stats?.points || 0)).toLocaleString()} more points to reach the next tier.`}
              </p>
            </div>
          )}

          <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50">
            <h3 className="text-xl font-bold mb-6">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-4">
              <Link href="/the-support-circle" className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-transparent hover:border-purple-200 hover:bg-white transition-all text-left group">
                <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform"><Users size={20} /></div>
                <span className="font-bold text-slate-900 text-sm">Community</span>
              </Link>
              <button className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-transparent hover:border-purple-200 hover:bg-white transition-all text-left group">
                <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform"><Calendar size={20} /></div>
                <span className="font-bold text-slate-900 text-sm">Schedule</span>
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2"><Clock size={18} className="text-slate-400" /> Recent Activity</h3>
            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-1 before:-translate-x-px before:h-full before:w-0.5 before:bg-slate-100">
              {(stats?.recentActivity || [
                { title: 'Training Started', time: 'Recently', bonus: 'Progress' }
              ]).map((activity: any, i: number) => (
                <div key={i} className="relative flex gap-4 pl-4">
                  <div className="w-2.5 h-2.5 rounded-full bg-purple-600 absolute -left-1.5 top-1.5 ring-4 ring-white" />
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-sm font-bold text-slate-900">{activity.title}</span>
                      {activity.bonus && <span className="text-[10px] font-black text-purple-600">{activity.bonus}</span>}
                    </div>
                    <div className="text-xs text-slate-400 font-medium">{activity.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
