'use client';

import { useState, useEffect } from 'react';
import { 
  Heart, ShieldCheck, Lock, Unlock, Smile, Meh, Frown, 
  Activity, Moon, AlertTriangle, Sparkles, Info, ArrowUpRight 
} from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';
import { SchoolService, SchoolWellnessInsights, GradeWellnessInsight } from '@/services/school.service';
import { toast } from 'react-hot-toast';

export default function WellnessInsightsPage() {
  const { user } = useAuthStore();
  const [insights, setInsights] = useState<SchoolWellnessInsights | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedGradeTab, setSelectedGradeTab] = useState<string>('');

  useEffect(() => {
    if (!user?.schoolId) return;

    const fetchInsights = async () => {
      try {
        const data = await SchoolService.getWellnessInsights(user.schoolId!);
        setInsights(data);
        if (data.gradesInsights.length > 0) {
          setSelectedGradeTab(data.gradesInsights[0].grade);
        }
      } catch (err: any) {
        toast.error('Failed to load wellness insights telemetry.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchInsights();
  }, [user]);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest animate-pulse">Loading wellness telemetry...</p>
        </div>
      </div>
    );
  }

  if (!insights || insights.gradesInsights.length === 0) {
    return (
      <div className="bg-white border border-slate-100 rounded-3xl p-12 text-center shadow-xl shadow-slate-100/50">
        <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Heart size={32} />
        </div>
        <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">No Wellness Telemetry Found</h3>
        <p className="text-slate-400 text-xs mt-2 max-w-sm mx-auto">
          Wellness insights will populate automatically as your school program goes live and student accounts are activated.
        </p>
      </div>
    );
  }

  const activeGrade = insights.gradesInsights.find(g => g.grade === selectedGradeTab) || insights.gradesInsights[0];

  const getMoodColor = (mood: string) => {
    switch (mood) {
      case 'happy': return 'bg-emerald-500 text-emerald-500';
      case 'calm': return 'bg-cyan-500 text-cyan-500';
      case 'stressed': return 'bg-amber-500 text-amber-500';
      case 'anxious': return 'bg-indigo-500 text-indigo-500';
      case 'sad': return 'bg-rose-500 text-rose-500';
      default: return 'bg-slate-500 text-slate-500';
    }
  };

  const getMoodLabel = (mood: string) => {
    switch (mood) {
      case 'happy': return 'Joyful & Energized';
      case 'calm': return 'Calm & Focused';
      case 'stressed': return 'Stressed / Overwhelmed';
      case 'anxious': return 'Anxious / Restless';
      case 'sad': return 'Low Energy / Blue';
      default: return mood;
    }
  };

  return (
    <div className="space-y-8 pb-12">
      
      {/* Premium Header Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-primary-dark via-primary to-primary-light text-white rounded-3xl p-8 shadow-2xl shadow-primary/10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent_45%)]" />
        <div className="relative z-10 max-w-2xl space-y-3">
          <span className="bg-white/10 text-white border border-white/20 px-3 py-1 text-[9px] font-black rounded-full uppercase tracking-wider inline-flex items-center gap-1.5 backdrop-blur-md">
            <Sparkles size={10} className="animate-pulse" />
            Adolescent Wellness Telemetry
          </span>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight leading-none">
            Anonymized Wellness Insights
          </h1>
          <p className="text-white/80 text-xs md:text-sm font-medium leading-relaxed">
            Dynamic mental health & emotional wellbeing indexes aggregated across grade bands. Fully safety-guarded under the India DPDP Act 2023.
          </p>
        </div>
      </div>

      {/* DPDP Compliance Safe Notice */}
      <div className="bg-[#EDFBF7] border border-[#C6F3E6] rounded-3xl p-6 flex flex-col md:flex-row items-start gap-4 shadow-sm">
        <div className="w-10 h-10 shrink-0 bg-[#D4F7EC] text-[#00A175] rounded-2xl flex items-center justify-center font-bold">
          <ShieldCheck size={20} />
        </div>
        <div className="space-y-1">
          <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
            India DPDP Act 2023 Compliant Safe-Mode
            <span className="bg-[#00A175]/10 text-[#00A175] text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest">Active</span>
          </h4>
          <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
            To strictly guard student privacy and protect minors' personal data, all logs are aggregated and subject to the <strong>minimum group filter constraint (<span className="text-[#00A175]">N ≥ 10 active students</span> per grade)</strong>. Individual names, profiles, or specific session timings are entirely anonymized and never exposed to school administrators.
          </p>
        </div>
      </div>

      {/* Grade Select Tabs */}
      <div className="flex flex-wrap gap-2.5 pb-1 border-b border-slate-100">
        {insights.gradesInsights.map((g) => (
          <button
            key={g.grade}
            onClick={() => setSelectedGradeTab(g.grade)}
            className={`px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all duration-200 flex items-center gap-2 active:scale-95 border ${
              selectedGradeTab === g.grade
                ? 'bg-white border-primary text-primary shadow-md shadow-primary/5'
                : 'bg-slate-50/50 hover:bg-slate-50 border-slate-100 text-slate-400 hover:text-slate-700'
            }`}
          >
            {g.locked ? (
              <Lock size={12} className="text-slate-400 shrink-0" />
            ) : (
              <Unlock size={12} className="text-primary shrink-0" />
            )}
            {g.grade}
            <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${
              selectedGradeTab === g.grade
                ? 'bg-primary/10 text-primary'
                : 'bg-slate-200/50 text-slate-500'
            }`}>
              N={g.activeCount}
            </span>
          </button>
        ))}
      </div>

      {/* Dynamic Workspace based on Active Grade */}
      {activeGrade.locked ? (
        /* LOCKED STATE (DPDP Privacy Guard) */
        <div className="bg-white border border-slate-100 rounded-3xl p-12 text-center shadow-xl shadow-slate-200/20 space-y-6">
          <div className="w-16 h-16 bg-slate-50 text-slate-400 border border-slate-100 rounded-3xl flex items-center justify-center mx-auto shadow-sm">
            <Lock size={28} />
          </div>
          
          <div className="max-w-md mx-auto space-y-2">
            <span className="bg-rose-50 text-rose-600 text-[8px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest border border-rose-100">
              Metrics Restricted
            </span>
            <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight mt-3">
              Telemetry Locked for {activeGrade.grade}
            </h3>
            <p className="text-slate-400 text-xs leading-relaxed font-semibold">
              India DPDP 2023 regulations enforce a privacy threshold filter on adolescent mood tracking. A minimum of <strong>10 active students</strong> are required in this grade to display safety insights.
            </p>
          </div>

          {/* Activation Progress Tracker */}
          <div className="max-w-sm mx-auto bg-slate-50 border border-slate-100 rounded-2xl p-5 space-y-3">
            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400">
              <span>Activation Progress</span>
              <span className="text-slate-700">{activeGrade.activeCount} / 10 Students</span>
            </div>
            
            <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden shadow-inner">
              <div 
                className="h-full bg-gradient-to-r from-primary to-primary-light rounded-full transition-all duration-500" 
                style={{ width: `${Math.min((activeGrade.activeCount / 10) * 100, 100)}%` }}
              />
            </div>

            <p className="text-[10px] text-slate-400 leading-normal font-medium">
              We currently have {activeGrade.activeCount} registered teen app active sessions. Promote the onboarding app activations during physical classes to automatically unlock aggregate wellness graphs!
            </p>
          </div>
        </div>
      ) : (
        /* UNLOCKED STATE (Aggregated Wellness Metrics) */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Col 1: Mood Index Circular Graph */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xl shadow-slate-200/20 space-y-6 flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5 mb-5">
                <Smile size={14} className="text-primary" />
                Mood Distribution Index
              </h3>
              
              {/* Custom High-Fidelity Donut Chart via SVG */}
              <div className="relative w-44 h-44 mx-auto flex items-center justify-center my-6">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" fill="transparent" stroke="#f1f5f9" strokeWidth="12" />
                  
                  {/* Happy Section */}
                  <circle cx="50" cy="50" r="40" fill="transparent" stroke="#10b981" strokeWidth="12"
                    strokeDasharray={`${(activeGrade.moodDistribution?.happy || 0) * 2.51} 251`}
                    strokeDashoffset="0"
                  />
                  
                  {/* Calm Section */}
                  <circle cx="50" cy="50" r="40" fill="transparent" stroke="#06b6d4" strokeWidth="12"
                    strokeDasharray={`${(activeGrade.moodDistribution?.calm || 0) * 2.51} 251`}
                    strokeDashoffset={`-${(activeGrade.moodDistribution?.happy || 0) * 2.51}`}
                  />
                  
                  {/* Stressed Section */}
                  <circle cx="50" cy="50" r="40" fill="transparent" stroke="#f59e0b" strokeWidth="12"
                    strokeDasharray={`${(activeGrade.moodDistribution?.stressed || 0) * 2.51} 251`}
                    strokeDashoffset={`-${((activeGrade.moodDistribution?.happy || 0) + (activeGrade.moodDistribution?.calm || 0)) * 2.51}`}
                  />
                  
                  {/* Anxious Section */}
                  <circle cx="50" cy="50" r="40" fill="transparent" stroke="#6366f1" strokeWidth="12"
                    strokeDasharray={`${(activeGrade.moodDistribution?.anxious || 0) * 2.51} 251`}
                    strokeDashoffset={`-${((activeGrade.moodDistribution?.happy || 0) + (activeGrade.moodDistribution?.calm || 0) + (activeGrade.moodDistribution?.stressed || 0)) * 2.51}`}
                  />
                  
                  {/* Sad Section */}
                  <circle cx="50" cy="50" r="40" fill="transparent" stroke="#f43f5e" strokeWidth="12"
                    strokeDasharray={`${(activeGrade.moodDistribution?.sad || 0) * 2.51} 251`}
                    strokeDashoffset={`-${((activeGrade.moodDistribution?.happy || 0) + (activeGrade.moodDistribution?.calm || 0) + (activeGrade.moodDistribution?.stressed || 0) + (activeGrade.moodDistribution?.anxious || 0)) * 2.51}`}
                  />
                </svg>
                
                <div className="absolute flex flex-col items-center justify-center leading-none text-center">
                  <span className="text-3xl font-black text-slate-800">
                    {(activeGrade.moodDistribution?.happy || 0) + (activeGrade.moodDistribution?.calm || 0)}%
                  </span>
                  <span className="text-[8px] font-black uppercase text-emerald-600 tracking-wider mt-1">
                    Positive Mood
                  </span>
                </div>
              </div>
            </div>

            {/* Chart Legend */}
            <div className="space-y-2.5">
              {Object.entries(activeGrade.moodDistribution || {}).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between text-xs font-semibold text-slate-600">
                  <div className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-md shrink-0 ${getMoodColor(key).split(' ')[0]}`} />
                    <span>{getMoodLabel(key)}</span>
                  </div>
                  <span className="font-extrabold text-slate-800">{value}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Col 2: Energy, Sleep & Symptom Trends */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xl shadow-slate-200/20 space-y-6 lg:col-span-2">
            
            {/* Primary Indexes Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Energy Level Box */}
              <div className="bg-[#FFFBF9] border border-slate-100 rounded-2xl p-5 space-y-4">
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                  <span className="flex items-center gap-1">
                    <Activity size={12} className="text-primary animate-pulse" />
                    Average Energy Index
                  </span>
                  <span className="text-slate-800 font-extrabold">{activeGrade.averageEnergyLevel} / 10</span>
                </div>
                
                {/* Horizontal slider visualization */}
                <div className="relative pt-2">
                  <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-orange-400 to-primary rounded-full" 
                      style={{ width: `${(activeGrade.averageEnergyLevel || 0) * 10}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 font-bold block mt-2 text-right">
                    Active, high-stamina average
                  </span>
                </div>
              </div>

              {/* Sleep Hours Box */}
              <div className="bg-[#FAFBFD] border border-slate-100 rounded-2xl p-5 space-y-4">
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                  <span className="flex items-center gap-1">
                    <Moon size={12} className="text-indigo-500" />
                    Average Sleep Index
                  </span>
                  <span className="text-slate-800 font-extrabold">{activeGrade.averageSleepHours} hrs</span>
                </div>
                
                {/* Sleep Bar visualization */}
                <div className="relative pt-2">
                  <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-indigo-400 to-cyan-400 rounded-full" 
                      style={{ width: `${(activeGrade.averageSleepHours || 0) * 10}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 font-bold block mt-2 text-right">
                    Healthy restoration range
                  </span>
                </div>
              </div>
            </div>

            {/* Symptom Heatmap Matrix */}
            <div className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-1">
                <Info size={13} className="text-slate-400" />
                Physical & Emotional Symptoms Breakdown
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {activeGrade.topSymptoms?.map((symptom) => (
                  <div key={symptom.name} className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-2">
                    <div className="flex justify-between items-center text-[11px] font-extrabold text-slate-800">
                      <span>{symptom.name}</span>
                      <span className="text-[10px] bg-slate-200/60 px-1.5 py-0.5 rounded-md text-slate-700">{symptom.percentage}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary rounded-full transition-all duration-300"
                        style={{ width: `${symptom.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Col 2 Bottom: Weekly Mood Trend Line Graph Mock */}
            <div className="space-y-3 pt-2">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Last 7 Days Positivity Curve
              </h4>
              
              <div className="flex items-end justify-between h-28 pt-4 px-2 bg-slate-50 border border-slate-100 rounded-2xl overflow-hidden">
                {activeGrade.moodTrend?.map((trend, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center h-full group justify-end">
                    
                    {/* Visual Stacked Columns representing rates */}
                    <div className="w-6 md:w-8 flex flex-col rounded-t-md overflow-hidden h-full max-h-[80px] justify-end">
                      <div 
                        className="bg-emerald-400 hover:bg-emerald-500 transition-colors" 
                        style={{ height: `${trend.positiveRate}%` }} 
                        title={`Positivity: ${trend.positiveRate}%`}
                      />
                      <div 
                        className="bg-slate-200 hover:bg-slate-300 transition-colors" 
                        style={{ height: `${trend.negativeRate}%` }}
                        title={`Struggle Rate: ${trend.negativeRate}%`}
                      />
                    </div>

                    <span className="text-[9px] font-black text-slate-400 uppercase mt-2">{trend.day}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Counsellor Workshops triggers */}
          {activeGrade.lowMoodAlert && (
            <div className="lg:col-span-3 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-100 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center shrink-0">
                  <AlertTriangle size={24} />
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-black text-amber-800 uppercase tracking-wider">
                    Elevated Stress / Academic Anxiety Advisory Active
                  </h4>
                  <p className="text-[11px] text-amber-700 leading-relaxed font-semibold max-w-2xl">
                    Aggregated metrics indicate a elevated level of academic anxiety or stress during this cycle in {activeGrade.grade} (exceeding our 40% wellness benchmark). We recommend scheduling an additional group mindfulness or de-stress session to support balance.
                  </p>
                </div>
              </div>

              <a 
                href="/schools/dashboard/sessions"
                className="w-full md:w-auto px-5 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl text-xs font-black uppercase tracking-wider text-center flex items-center justify-center gap-1 shadow-sm transition-all duration-200 active:scale-95 shrink-0"
              >
                Schedule Wellness Session
                <ArrowUpRight size={14} />
              </a>
            </div>
          )}

        </div>
      )}

    </div>
  );
}
