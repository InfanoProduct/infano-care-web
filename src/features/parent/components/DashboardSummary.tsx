"use client";

import { useEffect, useState } from "react";
import { Loader2, Calendar, BookOpen, HeartPulse, Sparkles, ShieldCheck, AlertCircle, TrendingUp, Info } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import Link from "next/link";

interface MoodTrend {
  date: string;
  moodPrimary: string | null;
}

interface DashboardSummaryData {
  isLinked: boolean;
  daughterName: string;
  activeJourney: { name: string; percentComplete: number } | null;
  moodTrend: MoodTrend[];
  nextExpertSession: string | null;
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
  const [data, setData] = useState<DashboardSummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [daysRange, setDaysRange] = useState<7 | 30>(7);

  const fetchSummary = async () => {
    try {
      const response = await apiClient.get<any>("/parent/dashboard-summary");
      if (response) {
        setData(response);
      }
    } catch (error) {
      console.error("Failed to fetch dashboard summary", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

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
      
      {/* 4-Column Top Grid for Metrics & Insights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Active Journey */}
        <div className="bg-white border border-slate-100 rounded-xl p-4.5 shadow-sm flex flex-col justify-between min-h-[185px]">
          <div className="space-y-1.5">
            <h3 className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5">
              <BookOpen className="h-3.5 w-3.5 text-pink-500" />
              Learning Journey
            </h3>
            {data.activeJourney ? (
              <p className="font-bold text-sm text-slate-800 leading-snug truncate" title={data.activeJourney.name}>
                {data.activeJourney.name}
              </p>
            ) : (
              <p className="text-xs font-semibold text-slate-400 mt-1">No active journey</p>
            )}
          </div>
          {data.activeJourney && (
            <div className="space-y-1 pt-2">
              <div className="flex items-center justify-between text-[10px] font-bold text-slate-500">
                <span>{data.activeJourney.percentComplete}% Complete</span>
              </div>
              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-pink-500 transition-all duration-500" 
                  style={{ width: `${data.activeJourney.percentComplete}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Next Expert Session */}
        <div className="bg-white border border-slate-100 rounded-xl p-4.5 shadow-sm flex flex-col justify-between min-h-[185px]">
          <div className="space-y-1.5">
            <h3 className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-blue-500" />
              Next Session
            </h3>
            {data.nextExpertSession ? (
              <div className="mt-1 space-y-0.5">
                <p className="font-bold text-sm text-slate-800">
                  {new Date(data.nextExpertSession).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
                </p>
                <p className="text-xs font-medium text-slate-500">
                  {new Date(data.nextExpertSession).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' })}
                </p>
              </div>
            ) : (
              <p className="text-xs font-semibold text-slate-400 mt-1">No sessions booked</p>
            )}
          </div>
          {data.nextExpertSession && (
            <div className="text-[9px] font-bold text-blue-600">
              Link activates on schedule
            </div>
          )}
        </div>

        {/* Programs Catalog */}
        <div className="bg-white border border-slate-100 rounded-xl p-4.5 shadow-sm flex flex-col justify-between min-h-[185px]">
          <div className="space-y-1.5">
            <h3 className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5">
              <HeartPulse className="h-3.5 w-3.5 text-emerald-500" />
              Active Programs
            </h3>
            {data.programs && data.programs.length > 0 ? (
              <div className="mt-1 space-y-1">
                {data.programs.slice(0, 2).map((prog, i) => (
                  <p key={i} className="text-xs font-semibold text-slate-700 truncate" title={prog}>
                    ✓ {prog}
                  </p>
                ))}
                {data.programs.length > 2 && (
                  <p className="text-[9px] font-medium text-slate-400 mt-0.5">
                    +{data.programs.length - 2} more programs
                  </p>
                )}
              </div>
            ) : (
              <p className="text-xs font-semibold text-slate-400 mt-1">No active programs</p>
            )}
          </div>
          <Link 
            href="/dashboard/enrolled-programs" 
            className="text-[10px] font-bold text-emerald-600 hover:underline block pt-2"
          >
            View Programs &rarr;
          </Link>
        </div>

        {/* Daughter's Mood Insights */}
        <div className="bg-white border border-slate-100 rounded-xl p-4.5 shadow-sm flex flex-col justify-between min-h-[185px] relative overflow-visible">
          <div className="flex items-center justify-between">
            <h3 className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5">
              <TrendingUp className="h-3.5 w-3.5 text-purple-500" />
              Mood Insights
            </h3>
            <div className="flex items-center gap-1.5">
              {!isMoodLocked && (
                <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200/60 w-fit select-none">
                  <button
                    onClick={() => setDaysRange(7)}
                    className={`px-1.5 py-0.5 rounded text-[8px] font-bold transition-all ${daysRange === 7 ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                  >
                    7D
                  </button>
                  <button
                    onClick={() => setDaysRange(30)}
                    className={`px-1.5 py-0.5 rounded text-[8px] font-bold transition-all ${daysRange === 30 ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                  >
                    30D
                  </button>
                </div>
              )}
              {/* Privacy Shield Icon with Tooltip */}
              <div className="group relative">
                <ShieldCheck className="h-4.5 w-4.5 text-emerald-500 cursor-help hover:text-emerald-600 transition-colors" />
                <div className="absolute right-0 bottom-full mb-2 hidden group-hover:block bg-slate-900 text-white text-[10px] font-medium p-3 rounded-lg shadow-md w-56 z-50 pointer-events-none leading-normal">
                  <p className="font-bold text-emerald-400 mb-1">Privacy Shield Active</p>
                  Only daily wellness aggregates are shared. Raw logs, symptoms, and written notes remain private.
                </div>
              </div>
            </div>
          </div>

          {/* Chart Viewport */}
          {isMoodLocked ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-2 px-1">
              <Info size={14} className="text-slate-400 mb-1" />
              <h4 className="font-bold text-slate-800 text-[10px]">Syncing Trend</h4>
              <p className="text-[9px] font-semibold text-slate-400 mt-0.5 leading-normal max-w-[170px]">
                Unlocks after 3 entries. (Logged: {totalLoggedMoods}/3)
              </p>
            </div>
          ) : (
            <div className="flex-1 flex flex-col justify-end pt-3">
              {/* Compact Bar Chart */}
              <div className="flex items-end justify-between gap-[2px] h-20 relative border-b border-slate-200/60 pb-0.5 overflow-visible">
                {/* Horizontal reference lines */}
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none text-[8px] font-bold text-slate-100 select-none pb-4 pt-2">
                  <div className="border-t border-slate-100 w-full" />
                  <div className="border-t border-slate-100 w-full" />
                </div>

                {chartDays.map((day, idx) => {
                  let heightPercent = 15; // default fallback if no log
                  let colorClass = 'bg-slate-100 border-slate-200';
                  let statusText = 'No entry';

                  if (day.hasLog) {
                    if (day.category === 'positive') {
                      heightPercent = 90;
                      colorClass = 'bg-green-500 hover:bg-green-600 shadow-sm shadow-green-500/10';
                      statusText = 'Positive Mood';
                    } else if (day.category === 'neutral') {
                      heightPercent = 55;
                      colorClass = 'bg-amber-500 hover:bg-amber-600 shadow-sm shadow-amber-500/10';
                      statusText = 'Neutral Mood';
                    } else if (day.category === 'low') {
                      heightPercent = 25;
                      if (isRed[idx]) {
                        colorClass = 'bg-red-500 hover:bg-red-600 shadow-sm shadow-red-500/10 animate-pulse';
                        statusText = 'Low Mood (Sustained)';
                      } else {
                        colorClass = 'bg-amber-500 hover:bg-amber-600 shadow-sm shadow-amber-500/10';
                        statusText = 'Low Mood (Single Off-Day)';
                      }
                    }
                  }

                  return (
                    <div 
                      key={idx} 
                      className="group relative flex flex-col items-center flex-1 h-full justify-end"
                    >
                      {/* Tooltip */}
                      <div className="absolute bottom-full mb-1.5 hidden group-hover:flex flex-col bg-slate-900 text-white text-[9px] font-bold py-1.5 px-2 rounded-lg shadow-xl whitespace-nowrap z-50 pointer-events-none">
                        <span className="text-slate-400">{day.dateLabel}</span>
                        <span className="mt-0.5">{statusText}</span>
                      </div>
                      
                      {/* Bar Pillar */}
                      <div 
                        className={`w-full rounded-t-[2px] transition-all duration-500 cursor-pointer ${colorClass}`}
                        style={{ 
                          height: `${heightPercent}%`,
                          maxWidth: daysRange === 7 ? '12px' : '4px'
                        }}
                      />
                    </div>
                  );
                })}
              </div>
              
              {/* Timeline boundary labels */}
              <div className="flex justify-between items-center text-[8px] font-bold text-slate-400 mt-1.5 px-0.5">
                <span>{chartDays[0].date.getDate()} {chartDays[0].date.toLocaleDateString('en-IN', { month: 'short' })}</span>
                <span className="text-[7px] bg-slate-50 border border-slate-100 px-1 py-0.5 rounded text-slate-505">
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
