"use client";

import { useEffect, useState } from "react";
import { Loader2, Calendar, BookOpen, Activity, HeartPulse } from "lucide-react";
import { apiClient } from "@/lib/api-client";

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
  if (!mood) return "bg-gray-200";
  const m = mood.toLowerCase();
  if (["happy", "joyful", "excited", "calm"].includes(m)) return "bg-green-500";
  if (["sad", "down", "tired"].includes(m)) return "bg-blue-400";
  if (["angry", "frustrated", "stressed"].includes(m)) return "bg-red-500";
  if (["anxious", "nervous"].includes(m)) return "bg-yellow-400";
  return "bg-purple-400"; // default vibrant color
};

export function DashboardSummary() {
  const [data, setData] = useState<DashboardSummaryData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSummary = async () => {
    try {
      const response = await apiClient.request<any>("/parent/dashboard-summary", {
        method: "GET",
      });
      if (response) {
        setData(response);
      }
    } catch (error) {
      console.error("Failed to fetch dashboard summary", error);
    } finally {
      setLoading(false);
    }
  };

  // Real-time refresh every 5 minutes and focus-refresh
  useEffect(() => {
    fetchSummary();

    const interval = setInterval(() => {
      fetchSummary();
    }, 5 * 60 * 1000); // 5 mins

    const onFocus = () => fetchSummary();
    window.addEventListener("focus", onFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", onFocus);
    };
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!data?.isLinked) {
    return null; // Don't show summary if not linked
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold tracking-tight">
        {data.daughterName}&apos;s Wellness
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Journey */}
        <div className="bg-white/50 backdrop-blur-sm border border-white/20 shadow-lg hover:shadow-xl transition-all rounded-xl overflow-hidden">
          <div className="p-4 pb-2">
            <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-pink-500" />
              Active Journey
            </h3>
          </div>
          <div className="p-4 pt-0">
            {data.activeJourney ? (
              <div className="space-y-2">
                <p className="font-semibold text-lg leading-tight truncate" title={data.activeJourney.name}>
                  {data.activeJourney.name}
                </p>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{data.activeJourney.percentComplete}% Complete</span>
                </div>
                <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all duration-500 ease-in-out" 
                    style={{ width: `${data.activeJourney.percentComplete}%` }}
                  />
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground mt-2">No active journey</p>
            )}
          </div>
        </div>

        {/* Mood Trend */}
        <div className="bg-white/50 backdrop-blur-sm border border-white/20 shadow-lg hover:shadow-xl transition-all rounded-xl overflow-hidden">
          <div className="p-4 pb-2">
            <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Activity className="h-4 w-4 text-purple-500" />
              Mood Trend (7 Days)
            </h3>
          </div>
          <div className="p-4 pt-0">
            {data.moodTrend && data.moodTrend.length > 0 ? (
              <div className="flex items-end h-12 gap-1 pt-2">
                {Array.from({ length: 7 }).map((_, i) => {
                  // Pad with empty days if less than 7 logs
                  const log = data.moodTrend[data.moodTrend.length - 1 - i];
                  const color = getMoodColor(log?.moodPrimary || null);
                  return (
                    <div 
                      key={i} 
                      className={`flex-1 rounded-sm ${color} transition-all hover:opacity-80`}
                      style={{ height: log ? '100%' : '20%' }}
                      title={log?.moodPrimary || "No data"}
                    />
                  );
                }).reverse()}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground mt-2">No recent mood logs</p>
            )}
          </div>
        </div>

        {/* Next Expert Session */}
        <div className="bg-white/50 backdrop-blur-sm border border-white/20 shadow-lg hover:shadow-xl transition-all rounded-xl overflow-hidden">
          <div className="p-4 pb-2">
            <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-500" />
              Next Expert Session
            </h3>
          </div>
          <div className="p-4 pt-0">
            {data.nextExpertSession ? (
              <div className="pt-1">
                <p className="font-semibold text-lg">
                  {new Date(data.nextExpertSession).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </p>
                <p className="text-sm text-muted-foreground">
                  {new Date(data.nextExpertSession).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground mt-2">None booked</p>
            )}
          </div>
        </div>

        {/* Programs */}
        <div className="bg-white/50 backdrop-blur-sm border border-white/20 shadow-lg hover:shadow-xl transition-all rounded-xl overflow-hidden">
          <div className="p-4 pb-2">
            <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <HeartPulse className="h-4 w-4 text-emerald-500" />
              Programs
            </h3>
          </div>
          <div className="p-4 pt-0">
            {data.programs && data.programs.length > 0 ? (
              <ul className="space-y-1 mt-1">
                {data.programs.slice(0, 2).map((prog, i) => (
                  <li key={i} className="text-sm font-medium truncate" title={prog}>
                    • {prog}
                  </li>
                ))}
                {data.programs.length > 2 && (
                  <li className="text-xs text-muted-foreground">
                    +{data.programs.length - 2} more
                  </li>
                )}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground mt-2">No active programs</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
