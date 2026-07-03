"use client";

import { useEffect, useState } from "react";
import { Loader2, Calendar, BookOpen, HeartPulse, ShieldCheck, TrendingUp, Info, ArrowRight } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import Link from "next/link";
import { useAuthStore } from "@/store/auth-store";

interface MoodTrend {
  date: string;
  moodPrimary: string | null;
}

interface DashboardSummaryData {
  isLinked: boolean;
  daughterName: string;
  activeJourney: { name: string; percentComplete: number; thumbnailUrl?: string } | null;
  moodTrend: MoodTrend[];
  nextExpertSession: string | null;
  nextExpertSessionStatus?: string | null;
  programs: string[];
}

interface DashboardSummaryProps {
  enrollments?: any[];
  demoSessions?: any[];
  learningJourneys?: any[];
  learningProgress?: any[];
}

const getMoodCategory = (mood: string | null): 'positive' | 'neutral' | 'low' | 'none' => {
  if (!mood) return 'none';
  const m = mood.toLowerCase();
  if (["happy", "joyful", "excited", "calm", "energetic", "content", "positive"].some(k => m.includes(k))) return 'positive';
  if (["sad", "down", "tired", "depressed", "lonely", "unhappy", "low", "angry", "frustrated", "stressed", "anxious", "nervous", "scared", "worried"].some(k => m.includes(k))) return 'low';
  return 'neutral';
};

export function DashboardSummary({ enrollments = [], demoSessions = [], learningJourneys = [], learningProgress = [] }: DashboardSummaryProps) {
  const { isAuthenticated, user } = useAuthStore();
  const [data, setData] = useState<DashboardSummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [daysRange, setDaysRange] = useState<7 | 30>(7);

  const fetchSummary = async () => {
    try {
      const response = await apiClient.get<any>("/parent/dashboard-summary");
      if (response) {
        setData(response);
      }
    } catch (error: any) {
      if (error?.message !== 'Unauthorized') {
        console.error("Failed to fetch dashboard summary", error);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated || !user) return;
    fetchSummary();
  }, [isAuthenticated, user]);

  if (!isAuthenticated || !user) return null;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3 text-slate-500">
        <Loader2 className="h-7 w-7 animate-spin text-primary" />
        <span className="text-xs font-bold text-slate-400">Loading metrics...</span>
      </div>
    );
  }

  // Derive display data merging API response and passed props
  const daughterName = data?.daughterName || (user?.role === 'TEEN' ? (user.profile?.displayName || user.username || 'You') : 'Daughter');

  // Active Journey fallback
  let displayActiveJourney = data?.activeJourney || null;
  if (!displayActiveJourney && learningJourneys.length > 0) {
    const activeJ = learningJourneys.find(j => {
      const epIds = new Set(j.episodes?.map((e: any) => e.id) || []);
      const completed = learningProgress.filter((p: any) => epIds.has(p.episodeId) && p.completed).length;
      return completed > 0 && completed < (j.episodes?.length || 0);
    }) || learningJourneys[0];
    if (activeJ) {
      const epIds = new Set(activeJ.episodes?.map((e: any) => e.id) || []);
      const completed = learningProgress.filter((p: any) => epIds.has(p.episodeId) && p.completed).length;
      const total = activeJ.episodes?.length || 1;
      displayActiveJourney = {
        name: activeJ.title,
        percentComplete: Math.round((completed / total) * 100),
        thumbnailUrl: activeJ.thumbnailUrl
      };
    }
  }

  // Next Session fallback
  let displayNextSession = data?.nextExpertSession || null;
  if (!displayNextSession) {
    if (demoSessions.length > 0) {
      const upcomingDemo = demoSessions.find((d: any) => d.slotDate);
      if (upcomingDemo) displayNextSession = upcomingDemo.slotDate;
    } else if (enrollments.length > 0) {
      for (const enr of enrollments) {
        const sched = enr.user?.scheduledSessions?.find((s: any) => s.status?.toLowerCase() === 'scheduled');
        if (sched?.scheduledAt) {
          displayNextSession = sched.scheduledAt;
          break;
        }
      }
    }
  }

  // Programs fallback
  let displayPrograms = data?.programs || [];
  if (displayPrograms.length === 0 && enrollments.length > 0) {
    displayPrograms = enrollments.map(e => e.program?.title).filter(Boolean);
  }

  // Mood logs
  const validMoodLogs = (data?.moodTrend || []).filter(l => l.moodPrimary !== null);
  const totalLoggedMoods = validMoodLogs.length;
  const isMoodLocked = totalLoggedMoods < 3;

  const getPastDays = (numDays: number) => {
    const days = [];
    for (let i = numDays - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push(d);
    }
    return days;
  };

  const normalizedLogs = validMoodLogs.map(log => ({
    dateStr: new Date(log.date).toDateString(),
    moodPrimary: log.moodPrimary
  }));

  const chartDays = getPastDays(daysRange).map(d => {
    const log = normalizedLogs.find(log => log.dateStr === d.toDateString());
    const category = getMoodCategory(log?.moodPrimary || null);
    return {
      date: d,
      dateLabel: d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
      category,
      mood: log?.moodPrimary || null,
      hasLog: !!log
    };
  });

  const isRed = new Array(chartDays.length).fill(false);
  let consecutiveLowCount = 0;
  let startIdx = -1;

  for (let i = 0; i < chartDays.length; i++) {
    if (chartDays[i].category === 'low') {
      if (consecutiveLowCount === 0) startIdx = i;
      consecutiveLowCount++;
    } else {
      if (consecutiveLowCount >= 3) {
        for (let j = startIdx; j < i; j++) {
          if (chartDays[j].category === 'low') isRed[j] = true;
        }
      }
      consecutiveLowCount = 0;
      startIdx = -1;
    }
  }
  if (consecutiveLowCount >= 3) {
    for (let j = startIdx; j < chartDays.length; j++) {
      if (chartDays[j].category === 'low') isRed[j] = true;
    }
  }

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* 4-Column Metric Cards Grid with pastel themes & graphic background elements */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        
        {/* CARD 1: LEARNING JOURNEY */}
        <div className="bg-[#FFF4F6] border border-rose-200/70 rounded-[26px] p-5 sm:p-6 shadow-[0_4px_20px_rgba(244,63,94,0.06)] hover:shadow-lg transition-all duration-300 flex flex-col justify-between min-h-47.5 relative overflow-hidden group">


          <div className="flex items-center gap-2.5 relative z-10">
            <div className="w-8 h-8 rounded-xl bg-white/90 border border-rose-200 flex items-center justify-center text-rose-500 shrink-0 shadow-2xs">
              <BookOpen size={16} />
            </div>
            <span className="text-[11px] font-extrabold text-rose-600 tracking-wider uppercase">
              LEARNING JOURNEY
            </span>
          </div>

          <div className="my-auto py-3 relative z-10">
            {displayActiveJourney ? (
              <div className="space-y-2">
                <p className="font-extrabold text-base text-slate-800 line-clamp-2 leading-tight">
                  {displayActiveJourney.name}
                </p>
                <div className="space-y-1 pt-1">
                  <div className="flex justify-between text-[10px] font-bold text-rose-600">
                    <span>Progress</span>
                    <span>{displayActiveJourney.percentComplete}%</span>
                  </div>
                  <div className="h-2 w-full bg-white/80 rounded-full overflow-hidden border border-rose-100">
                    <div
                      className="h-full bg-linear-to-r from-rose-400 to-pink-500 rounded-full transition-all duration-500"
                      style={{ width: `${displayActiveJourney.percentComplete}%` }}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm font-semibold text-slate-500">No active journey</p>
            )}
          </div>
        </div>

        {/* CARD 2: NEXT SESSION */}
        <div className="bg-[#F0F7FF] border border-blue-200/70 rounded-[26px] p-5 sm:p-6 shadow-[0_4px_20px_rgba(59,130,246,0.06)] hover:shadow-lg transition-all duration-300 flex flex-col justify-between min-h-47.5 relative overflow-hidden group">


          <div className="flex items-center gap-2.5 relative z-10">
            <div className="w-8 h-8 rounded-xl bg-white/90 border border-blue-200 flex items-center justify-center text-blue-500 shrink-0 shadow-2xs">
              <Calendar size={16} />
            </div>
            <span className="text-[11px] font-extrabold text-blue-600 tracking-wider uppercase">
              NEXT SESSION
            </span>
          </div>

          <div className="my-auto py-3 relative z-10">
            {displayNextSession ? (
              <div className="space-y-1">
                <p className="font-extrabold text-lg text-slate-800">
                  {new Date(displayNextSession).toString() !== 'Invalid Date'
                    ? new Date(displayNextSession).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', weekday: 'short' })
                    : displayNextSession}
                </p>
                {new Date(displayNextSession).toString() !== 'Invalid Date' && (
                  <p className="text-xs font-bold text-blue-600">
                    {new Date(displayNextSession).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' })}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm font-semibold text-slate-500">No sessions booked</p>
            )}
          </div>
        </div>

        {/* CARD 3: ACTIVE PROGRAMS */}
        <div className="bg-[#F0FDF4] border border-emerald-200/70 rounded-[26px] p-5 sm:p-6 shadow-[0_4px_20px_rgba(16,185,129,0.06)] hover:shadow-lg transition-all duration-300 flex flex-col justify-between min-h-47.5 relative overflow-hidden group">


          <div className="flex items-center gap-2.5 relative z-10">
            <div className="w-8 h-8 rounded-xl bg-white/90 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0 shadow-2xs">
              <HeartPulse size={16} />
            </div>
            <span className="text-[11px] font-extrabold text-emerald-600 tracking-wider uppercase">
              ACTIVE PROGRAMS
            </span>
          </div>

          <div className="my-auto py-2.5 space-y-1.5 relative z-10">
            {displayPrograms.length > 0 ? (
              displayPrograms.slice(0, 2).map((prog, i) => (
                <div key={i} className="flex items-center gap-2 bg-white/90 border border-emerald-200/80 px-3.5 py-1.5 rounded-full shadow-2xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                  <span className="text-xs font-bold text-slate-800 truncate" title={prog}>
                    {prog}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm font-semibold text-slate-500">No active programs</p>
            )}
          </div>

          <Link
            href="/dashboard/enrolled-programs"
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs py-2.5 rounded-full text-center block transition-all relative z-10 mt-1 shadow-xs active:scale-95"
          >
            View All Programs &rarr;
          </Link>
        </div>

        {/* CARD 4: MOOD INSIGHTS */}
        <div className="bg-[#FAF5FF] border border-purple-200/70 rounded-[26px] p-5 sm:p-6 shadow-[0_4px_20px_rgba(168,85,247,0.06)] hover:shadow-lg transition-all duration-300 flex flex-col justify-between min-h-47.5 relative overflow-hidden group">


          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-white/90 border border-purple-200 flex items-center justify-center text-purple-600 shrink-0 shadow-2xs">
                <TrendingUp size={16} />
              </div>
              <span className="text-[11px] font-extrabold text-purple-600 tracking-wider uppercase">
                MOOD INSIGHTS
              </span>
            </div>
            <div className="w-7 h-7 rounded-lg bg-emerald-100/80 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0 shadow-2xs">
              <ShieldCheck size={15} />
            </div>
          </div>

          {isMoodLocked ? (
            <div className="my-auto py-2 w-full bg-white/90 border border-purple-200/60 rounded-2xl p-3.5 flex flex-col items-center justify-center text-center relative z-10 shadow-2xs">
              <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center mb-1 shadow-2xs">
                <Info size={16} />
              </div>
              <h4 className="font-extrabold text-slate-800 text-xs">Syncing Trend</h4>
              <p className="text-[10px] font-semibold text-slate-500 mt-0.5 leading-tight">
                Unlocks after 3 entries. (Logged: {totalLoggedMoods}/3)
              </p>
            </div>
          ) : (
            <div className="my-auto pt-2 relative z-10">
              <div className="flex items-end justify-between gap-1 h-14 border-b border-purple-200/60 pb-1">
                {chartDays.map((day, idx) => {
                  let heightPercent = 15;
                  let colorClass = 'bg-slate-200';
                  if (day.hasLog) {
                    if (day.category === 'positive') {
                      heightPercent = 90;
                      colorClass = 'bg-emerald-400';
                    } else if (day.category === 'neutral') {
                      heightPercent = 55;
                      colorClass = 'bg-amber-400';
                    } else if (day.category === 'low') {
                      heightPercent = 30;
                      colorClass = isRed[idx] ? 'bg-rose-500' : 'bg-amber-400';
                    }
                  }
                  return (
                    <div key={idx} className="flex-1 flex items-end justify-center h-full">
                      <div
                        className={`w-2.5 rounded-t-sm transition-all duration-300 ${colorClass}`}
                        style={{ height: `${heightPercent}%` }}
                        title={`${day.dateLabel}: ${day.mood || 'No entry'}`}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
