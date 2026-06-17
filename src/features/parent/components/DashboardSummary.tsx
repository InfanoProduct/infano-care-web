"use client";

import { useEffect, useState } from "react";
import { Loader2, Calendar, BookOpen, HeartPulse, Sparkles, ShieldCheck, AlertCircle, TrendingUp, Info } from "lucide-react";
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

const getMoodColor = (mood: string | null) => {
  if (!mood) return "bg-gray-255";
  return "bg-purple-255";
};

const getMoodCategory = (mood: string | null): 'positive' | 'neutral' | 'low' | 'none' => {
  if (!mood) return 'none';
  const m = mood.toLowerCase();
  // Map positive states
  if (["happy", "joyful", "excited", "calm", "energetic", "content", "positive"].some(k => m.includes(k))) return 'positive';
  // Map low states
  if (["sad", "down", "tired", "depressed", "lonely", "unhappy", "low", "angry", "frustrated", "stressed", "anxious", "nervous", "scared", "worried"].some(k => m.includes(k))) return 'low';
  // Default to neutral
  return 'neutral';
};

export function DashboardSummary() {
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
      <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-500">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="text-xs font-bold text-slate-500">Syncing Family Data...</span>
      </div>
    );
  }

  if (!data?.isLinked) {
    return null; // Hide summary entirely if not linked
  }

  // Count actual valid mood entries logged by the daughter
  const validMoodLogs = (data.moodTrend || []).filter(l => l.moodPrimary !== null);
  const totalLoggedMoods = validMoodLogs.length;
  const isMoodLocked = totalLoggedMoods < 3;

  // Generate calendar days for the past N days
  const getPastDays = (numDays: number) => {
    const days = [];
    for (let i = numDays - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push(d);
    }
    return days;
  };

  // Normalize logged moods for comparison
  const normalizedLogs = validMoodLogs.map(log => ({
    dateStr: new Date(log.date).toDateString(),
    moodPrimary: log.moodPrimary
  }));

  // Build sequential list of days to plot
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

  // Calculate runs of 3+ consecutive low days
  const isRed = new Array(chartDays.length).fill(false);
  let consecutiveLowCount = 0;
  let startIdx = -1;

  for (let i = 0; i < chartDays.length; i++) {
    if (chartDays[i].category === 'low') {
      if (consecutiveLowCount === 0) {
        startIdx = i;
      }
      consecutiveLowCount++;
    } else if (chartDays[i].category === 'none') {
      // Missing log breaks the streak
      if (consecutiveLowCount >= 3) {
        for (let j = startIdx; j < i; j++) {
          if (chartDays[j].category === 'low') isRed[j] = true;
        }
      }
      consecutiveLowCount = 0;
      startIdx = -1;
    } else {
      // Positive/neutral breaks the streak
      if (consecutiveLowCount >= 3) {
        for (let j = startIdx; j < i; j++) {
          if (chartDays[j].category === 'low') isRed[j] = true;
        }
      }
      consecutiveLowCount = 0;
      startIdx = -1;
    }
  }

  // Handle run at the end of the array
  if (consecutiveLowCount >= 3) {
    for (let j = startIdx; j < chartDays.length; j++) {
      if (chartDays[j].category === 'low') isRed[j] = true;
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">

      {/* Daughter's Indicator Label */}
      <div className="flex items-center gap-2.5 px-1 select-none">
        <div className="h-2 w-2 rounded-full bg-pink-500 animate-pulse shrink-0" />
        <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">
          Showing updates of {data.daughterName}
        </span>
        <div className="h-px bg-slate-100 flex-1" />
      </div>

      {/* 4-Column Top Grid for Metrics & Insights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

        {/* Active Journey */}
        <div className="relative bg-white border border-pink-100 rounded-[2rem] p-6 shadow-[0_8px_30px_rgb(236,72,153,0.12)] flex flex-col justify-between min-h-[200px] overflow-hidden group hover:-translate-y-1 transition-all duration-300">
          <div className="absolute -right-6 -top-6 w-32 h-32 bg-pink-100/50 rounded-full blur-2xl group-hover:bg-pink-200/50 transition-colors" />
          <div className="absolute right-[-10%] top-[-10%] text-pink-50 opacity-20 transform rotate-12 scale-150">
            <BookOpen size={120} />
          </div>
          <div className="relative z-10 space-y-2">
            <h3 className="text-xs font-black uppercase tracking-widest text-pink-400 flex items-center gap-2">
              <div className="p-1.5 bg-pink-100 text-pink-500 rounded-lg"><BookOpen size={14} /></div>
              Learning Journey
            </h3>
            {data.activeJourney ? (
              <div className="flex items-center gap-3 mt-1">
                <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-pink-100 shadow-sm relative z-10 bg-pink-50 flex items-center justify-center text-pink-300">
                  {data.activeJourney.thumbnailUrl ? (
                    <img src={data.activeJourney.thumbnailUrl} alt={data.activeJourney.name} className="w-full h-full object-cover" />
                  ) : (
                    <BookOpen size={24} className="opacity-50" />
                  )}
                </div>
                <p className="font-extrabold text-xl text-slate-800 leading-tight">
                  {data.activeJourney.name}
                </p>
              </div>
            ) : (
              <p className="text-sm font-semibold text-slate-400 mt-2">No active journey</p>
            )}
          </div>
          {data.activeJourney && (
            <div className="relative z-10 space-y-2 pt-4">
              <div className="flex items-center justify-between text-[11px] font-black text-pink-600">
                <span>Progress</span>
                <span>{data.activeJourney.percentComplete}%</span>
              </div>
              <div className="h-2 w-full bg-pink-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-pink-400 to-rose-500 rounded-full relative"
                  style={{ width: `${data.activeJourney.percentComplete}%` }}
                >
                   <div className="absolute top-0 right-0 bottom-0 w-10 bg-white/20 blur-sm animate-pulse" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Next Expert Session */}
        <div className="relative bg-white border border-blue-100 rounded-[2rem] p-6 shadow-[0_8px_30px_rgb(59,130,246,0.12)] flex flex-col justify-between min-h-[200px] overflow-hidden group hover:-translate-y-1 transition-all duration-300">
          <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-blue-100/50 rounded-full blur-2xl group-hover:bg-blue-200/50 transition-colors" />
          <div className="absolute right-[-5%] bottom-[-10%] text-blue-50 opacity-30 transform -rotate-12 scale-150">
            <Calendar size={120} />
          </div>
          <div className="relative z-10 space-y-2">
            <h3 className="text-xs font-black uppercase tracking-widest text-blue-400 flex items-center gap-2">
              <div className="p-1.5 bg-blue-100 text-blue-500 rounded-lg"><Calendar size={14} /></div>
              Next Session
            </h3>
            {data.nextExpertSession ? (
              <div className="mt-2 space-y-1">
                <p className="font-extrabold text-2xl text-slate-800">
                  {new Date(data.nextExpertSession).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                </p>
                <p className="text-sm font-bold text-blue-600">
                  {new Date(data.nextExpertSession).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' })}
                </p>
              </div>
            ) : (
              <p className="text-sm font-semibold text-slate-400 mt-2">No sessions booked</p>
            )}
          </div>
          {data.nextExpertSession && (
            <div className="flex flex-wrap items-center gap-1.5 mt-4 relative z-10">
              <div className="text-[10px] font-black uppercase tracking-widest text-white bg-blue-500 px-3 py-2 rounded-xl inline-flex w-fit shadow-lg shadow-blue-500/30">
                Link activates on schedule
              </div>
              {data.nextExpertSessionStatus === 'RESCHEDULED' && (
                <div className="text-[10px] font-black uppercase tracking-widest text-amber-700 bg-amber-50 border border-amber-200 px-3 py-2 rounded-xl inline-flex w-fit shadow-sm">
                  Rescheduled
                </div>
              )}
            </div>
          )}
        </div>

        {/* Programs Catalog */}
        <div className="relative bg-white border border-emerald-100 rounded-[2rem] p-6 shadow-[0_8px_30px_rgb(16,185,129,0.12)] flex flex-col justify-between min-h-[200px] overflow-hidden group hover:-translate-y-1 transition-all duration-300">
          <div className="absolute -left-6 -top-6 w-32 h-32 bg-emerald-100/50 rounded-full blur-2xl group-hover:bg-emerald-200/50 transition-colors" />
          <div className="absolute left-[-10%] top-[-5%] text-emerald-50 opacity-30 transform rotate-45 scale-150">
            <HeartPulse size={120} />
          </div>
          <div className="relative z-10 space-y-2">
            <h3 className="text-xs font-black uppercase tracking-widest text-emerald-400 flex items-center gap-2">
              <div className="p-1.5 bg-emerald-100 text-emerald-500 rounded-lg"><HeartPulse size={14} /></div>
              Active Programs
            </h3>
            {data.programs && data.programs.length > 0 ? (
              <div className="mt-4 space-y-2">
                {data.programs.slice(0, 2).map((prog, i) => (
                  <div key={i} className="flex items-center gap-2 bg-emerald-50/80 border border-emerald-100/50 px-3 py-2 rounded-xl">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <p className="text-xs font-extrabold text-slate-700 truncate" title={prog}>
                      {prog}
                    </p>
                  </div>
                ))}
                {data.programs.length > 2 && (
                  <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500/70 text-center mt-2">
                    +{data.programs.length - 2} more programs
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm font-semibold text-slate-400 mt-2">No active programs</p>
            )}
          </div>
          <Link
            href="/dashboard/enrolled-programs"
            className="relative z-10 text-[11px] font-black text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-colors px-4 py-2 rounded-xl text-center mt-4 border border-emerald-100"
          >
            View All Programs &rarr;
          </Link>
        </div>

        {/* Daughter's Mood Insights */}
        <div className="relative bg-white border border-purple-100 rounded-[2rem] p-6 shadow-[0_8px_30px_rgb(168,85,247,0.12)] flex flex-col justify-between min-h-[200px] overflow-hidden group hover:-translate-y-1 transition-all duration-300 lg:col-span-1">
          <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-purple-100/50 rounded-full blur-3xl group-hover:bg-purple-200/50 transition-colors" />
          
          <div className="relative z-10 flex items-center justify-between">
            <h3 className="text-xs font-black uppercase tracking-widest text-purple-400 flex items-center gap-2">
              <div className="p-1.5 bg-purple-100 text-purple-500 rounded-lg"><TrendingUp size={14} /></div>
              Mood Insights
            </h3>
            <div className="flex items-center justify-end gap-1.5 shrink-0">
              {!isMoodLocked && (
                <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-200/60 w-fit shadow-inner">
                  <button
                    onClick={() => setDaysRange(7)}
                    className={`px-2 py-1 rounded-lg text-[9px] font-black transition-all ${daysRange === 7 ? 'bg-white text-purple-600 shadow-sm border border-slate-100' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    7D
                  </button>
                  <button
                    onClick={() => setDaysRange(30)}
                    className={`px-2 py-1 rounded-lg text-[9px] font-black transition-all ${daysRange === 30 ? 'bg-white text-purple-600 shadow-sm border border-slate-100' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    30D
                  </button>
                </div>
              )}
              {/* Privacy Shield Icon with Tooltip */}
              <div className="group/shield relative">
                <div className="p-1.5 bg-emerald-50 rounded-lg text-emerald-500 hover:bg-emerald-100 hover:text-emerald-600 transition-colors cursor-help">
                  <ShieldCheck size={14} />
                </div>
                <div className="absolute right-0 bottom-full mb-3 hidden group-hover/shield:block bg-slate-900 text-white text-[10px] font-medium p-3.5 rounded-xl shadow-xl w-56 z-50 pointer-events-none leading-relaxed border border-slate-700">
                  <p className="font-bold text-emerald-400 mb-1.5 uppercase tracking-wider flex items-center gap-1.5"><ShieldCheck size={12}/> Privacy Shield Active</p>
                  Only daily wellness aggregates are shared. Raw logs, symptoms, and written notes remain private.
                </div>
              </div>
            </div>
          </div>

          {/* Chart Viewport */}
          {isMoodLocked ? (
            <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center py-4 px-2 mt-2 bg-purple-50/50 rounded-2xl border border-purple-100/50">
              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-500 mb-2">
                <Info size={18} />
              </div>
              <h4 className="font-black text-slate-700 text-xs">Syncing Trend</h4>
              <p className="text-[10px] font-bold text-slate-400 mt-1 leading-relaxed max-w-[170px]">
                Unlocks after 3 entries. (Logged: {totalLoggedMoods}/3)
              </p>
            </div>
          ) : (
            <div className="relative z-10 flex-1 flex flex-col justify-end pt-4 mt-2">
              {/* Compact Bar Chart */}
              <div className="flex items-end justify-between gap-[3px] h-20 relative border-b-2 border-slate-100 pb-1 overflow-visible">
                {/* Horizontal reference lines */}
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none text-[8px] font-bold text-slate-100 select-none pb-5 pt-2">
                  <div className="border-t-2 border-slate-50 border-dashed w-full" />
                  <div className="border-t-2 border-slate-50 border-dashed w-full" />
                </div>

                {chartDays.map((day, idx) => {
                  let heightPercent = 15; // default fallback if no log
                  let colorClass = 'bg-slate-100 border-slate-200';
                  let statusText = 'No entry';

                  if (day.hasLog) {
                    if (day.category === 'positive') {
                      heightPercent = 90;
                      colorClass = 'bg-gradient-to-t from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 shadow-lg shadow-green-500/20';
                      statusText = 'Positive Mood';
                    } else if (day.category === 'neutral') {
                      heightPercent = 55;
                      colorClass = 'bg-gradient-to-t from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 shadow-lg shadow-amber-500/20';
                      statusText = 'Neutral Mood';
                    } else if (day.category === 'low') {
                      heightPercent = 25;
                      if (isRed[idx]) {
                        colorClass = 'bg-gradient-to-t from-rose-400 to-rose-500 hover:from-rose-500 hover:to-rose-600 shadow-lg shadow-rose-500/30 animate-pulse';
                        statusText = 'Low Mood (Sustained)';
                      } else {
                        colorClass = 'bg-gradient-to-t from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 shadow-lg shadow-amber-500/20';
                        statusText = 'Low Mood (Single Off-Day)';
                      }
                    }
                  }

                  return (
                    <div
                      key={idx}
                      className="group/bar relative flex flex-col items-center flex-1 h-full justify-end"
                    >
                      {/* Tooltip */}
                      <div className="absolute bottom-full mb-2 hidden group-hover/bar:flex flex-col bg-slate-800 text-white text-[9px] font-bold py-2 px-3 rounded-xl shadow-xl whitespace-nowrap z-50 pointer-events-none border border-slate-700">
                        <span className="text-purple-300 mb-0.5">{day.dateLabel}</span>
                        <span>{statusText}</span>
                      </div>

                      {/* Bar Pillar */}
                      <div
                        className={`w-full rounded-t-sm transition-all duration-500 cursor-pointer ${colorClass}`}
                        style={{
                          height: `${heightPercent}%`,
                          maxWidth: daysRange === 7 ? '14px' : '6px'
                        }}
                      />
                    </div>
                  );
                })}
              </div>

              {/* Timeline boundary labels */}
              <div className="flex justify-between items-center text-[9px] font-black text-slate-400 mt-2 px-1 uppercase tracking-wider">
                <span>{chartDays[0].date.getDate()} {chartDays[0].date.toLocaleDateString('en-IN', { month: 'short' })}</span>
                <span className="text-[8px] bg-purple-50 text-purple-600 border border-purple-100 px-2 py-0.5 rounded-md shadow-sm">
                  {daysRange}D Trend
                </span>
                <span>{chartDays[chartDays.length - 1].date.getDate()} {chartDays[chartDays.length - 1].date.toLocaleDateString('en-IN', { month: 'short' })}</span>
              </div>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
