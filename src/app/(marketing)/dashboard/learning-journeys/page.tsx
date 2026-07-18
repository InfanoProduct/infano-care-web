'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  GraduationCap, Star, BookOpen, ChevronRight, Loader2,
  CheckCircle2, Sparkles, Trophy, ArrowRight, AlertCircle
} from 'lucide-react';
import { LearningService, LearningJourney, UserProgress } from '@/services/learning.service';
import { useAuthStore } from '@/store/auth-store';
import Link from 'next/link';

// Journey category color themes
const CATEGORY_THEMES: Record<string, { accent: string; gradient: string; bg: string; border: string; badge: string; glow: string }> = {
  'puberty': {
    accent: 'text-rose-600', gradient: 'from-rose-500 to-pink-500', bg: 'bg-rose-50',
    border: 'border-rose-100', badge: 'bg-rose-50 border-rose-100 text-rose-700', glow: 'rgba(244,63,94,0.08)'
  },
  'mental-health': {
    accent: 'text-teal-600', gradient: 'from-teal-500 to-emerald-500', bg: 'bg-teal-50',
    border: 'border-teal-100', badge: 'bg-teal-50 border-teal-100 text-teal-700', glow: 'rgba(20,184,166,0.08)'
  },
  'relationships': {
    accent: 'text-violet-600', gradient: 'from-violet-500 to-purple-500', bg: 'bg-violet-50',
    border: 'border-violet-100', badge: 'bg-violet-50 border-violet-100 text-violet-700', glow: 'rgba(139,92,246,0.08)'
  },
  'body': {
    accent: 'text-amber-600', gradient: 'from-amber-500 to-orange-500', bg: 'bg-amber-50',
    border: 'border-amber-100', badge: 'bg-amber-50 border-amber-100 text-amber-700', glow: 'rgba(245,158,11,0.08)'
  },
  'safety': {
    accent: 'text-blue-600', gradient: 'from-blue-500 to-indigo-500', bg: 'bg-blue-50',
    border: 'border-blue-100', badge: 'bg-blue-50 border-blue-100 text-blue-700', glow: 'rgba(59,130,246,0.08)'
  },
};

const DEFAULT_THEME = {
  accent: 'text-purple-600', gradient: 'from-purple-500 to-indigo-500', bg: 'bg-purple-50',
  border: 'border-purple-100', badge: 'bg-purple-50 border-purple-100 text-purple-700', glow: 'rgba(139,92,246,0.08)'
};

function getTheme(category: string | null) {
  if (!category) return DEFAULT_THEME;
  const key = category.toLowerCase().replace(/\s+/g, '-');
  return CATEGORY_THEMES[key] || DEFAULT_THEME;
}

export default function LearningJourneysPage() {
  const { user } = useAuthStore();
  const [journeys, setJourneys] = useState<LearningJourney[]>([]);
  const [progress, setProgress] = useState<UserProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isTeen = user?.role === 'TEEN' || (user?.role === 'PEER' && user?.contentTier && user?.contentTier !== 'ADULT');

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [journeysRes, progressRes] = await Promise.all([
        LearningService.getJourneys(),
        LearningService.getMyProgress(),
      ]);
      // Exclude peerline certification from main user learning journeys list
      const userJourneys = journeysRes.filter(
        journey => journey.slug !== 'peerline-mentor-certification'
      );
      setJourneys(userJourneys);
      setProgress(progressRes);
    } catch {
      setError('Failed to load learning journeys.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-3">
        <Loader2 className="animate-spin text-primary" size={32} />
        <span className="font-semibold text-sm text-slate-500 tracking-wide">Loading Learning Journeys...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 w-full max-w-[1280px] mx-auto pb-8 font-sans">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <GraduationCap size={18} className="text-primary" /> Learning Journeys
          </h1>
          <p className="text-xs font-normal text-slate-400 mt-1">Interactive learning paths to explore and grow</p>
        </div>
        <div className="bg-red-50/50 border border-red-100 rounded-lg p-12 text-center shadow-sm space-y-4 max-w-xl mx-auto mt-8">
          <div className="w-12 h-12 bg-red-100/50 rounded-lg flex items-center justify-center mx-auto text-red-650 border border-red-200">
            <AlertCircle size={24} />
          </div>
          <h3 className="font-semibold text-sm text-red-700">{error}</h3>
          <p className="text-xs font-normal text-slate-500 max-w-xs mx-auto">
            Please check your connection and try again.
          </p>
          <button
            onClick={loadData}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-sm"
          >
            Retry Loading
          </button>
        </div>
      </div>
    );
  }

  if (journeys.length === 0) {
    return (
      <div className="space-y-6 w-full max-w-[1280px] mx-auto pb-8 font-sans">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <GraduationCap size={18} className="text-primary" /> Learning Journeys
          </h1>
          <p className="text-xs font-normal text-slate-400 mt-1">Interactive learning paths to explore and grow</p>
        </div>
        <div className="bg-white border border-slate-100 rounded-lg p-12 text-center shadow-sm space-y-4">
          <div className="w-12 h-12 bg-slate-50 rounded-lg flex items-center justify-center mx-auto text-slate-300 border border-slate-100">
            <GraduationCap size={24} />
          </div>
          <h3 className="font-semibold text-sm text-slate-700">No learning journeys available yet</h3>
          <p className="text-xs font-normal text-slate-400 max-w-xs mx-auto">
            New learning journeys are being curated. Check back soon for interactive episodes and activities.
          </p>
        </div>
      </div>
    );
  }

  // Calculate per-journey stats
  const journeyStats = journeys.map(journey => {
    const episodeIds = new Set(journey.episodes.map(e => e.id));
    const completedCount = progress.filter(p => episodeIds.has(p.episodeId) && p.completed).length;
    const totalCount = journey.episodes.length;
    const pct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
    const isMastered = totalCount > 0 && completedCount === totalCount;
    return { journey, completedCount, totalCount, pct, isMastered };
  });

  // Summary stats
  const totalJourneys = journeys.length;
  const masteredCount = journeyStats.filter(j => j.isMastered).length;
  const totalEpisodesCompleted = progress.filter(p => p.completed).length;
  const totalXPEarned = journeyStats.reduce((sum, j) => {
    if (j.completedCount > 0) {
      const xpPerEpisode = j.journey.totalXP / Math.max(j.totalCount, 1);
      return sum + Math.round(xpPerEpisode * j.completedCount);
    }
    return sum;
  }, 0);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 w-full max-w-[1280px] mx-auto pb-8 font-sans">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-50 via-indigo-50/50 to-white p-5 rounded-lg border border-purple-100/60 relative overflow-hidden shadow-sm">
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-100/30 blur-3xl rounded-full translate-x-1/3 -translate-y-1/3 pointer-events-none" />
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-white border border-purple-200/60 rounded text-[9px] font-semibold tracking-widest text-purple-600 uppercase shadow-sm">
            <Sparkles size={10} /> Learning Hub
          </div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight leading-none">
            {isTeen ? 'Your Learning Journeys 🚀' : 'Learning Journeys 📚'}
          </h1>
          <p className="text-xs font-normal text-slate-500 max-w-lg leading-relaxed mt-1">
            {isTeen
              ? 'Explore interactive journeys, earn XP, and level up your knowledge one episode at a time.'
              : "Track your daughter's learning progress across curated educational journeys."}
          </p>
        </div>

        {/* Stats bar */}
        {(totalEpisodesCompleted > 0 || masteredCount > 0) && (
          <div className="relative z-10 flex flex-wrap gap-3 mt-4">
            <div className="flex items-center gap-2 bg-white border border-purple-100/60 rounded-lg px-3 py-2 shadow-sm">
              <Trophy size={14} className="text-amber-500" />
              <div>
                <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">Mastered</p>
                <p className="text-sm font-semibold text-slate-800 leading-none">{masteredCount}/{totalJourneys}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-white border border-purple-100/60 rounded-lg px-3 py-2 shadow-sm">
              <BookOpen size={14} className="text-purple-500" />
              <div>
                <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">Episodes Done</p>
                <p className="text-sm font-semibold text-slate-800 leading-none">{totalEpisodesCompleted}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-white border border-purple-100/60 rounded-lg px-3 py-2 shadow-sm">
              <Star size={14} className="text-amber-400 fill-amber-400" />
              <div>
                <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">XP Earned</p>
                <p className="text-sm font-semibold text-slate-800 leading-none">{totalXPEarned.toLocaleString()}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Journey Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {journeyStats.map(({ journey, completedCount, totalCount, pct, isMastered }) => {
          const theme = getTheme(journey.category);

          return (
            <Link
              key={journey.id}
              href={`/dashboard/learning-journeys/${journey.id}`}
              className="group block"
            >
              <div
                className={`relative bg-white border ${isMastered ? 'border-emerald-200 bg-emerald-50/5' : 'border-slate-200/80'} rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300`}
              >
                {/* Thumbnail / Banner */}
                <div className="relative h-36 bg-gradient-to-br from-slate-100 to-slate-50 overflow-hidden">
                  {journey.thumbnailUrl || journey.bannerImage ? (
                    <img
                      src={journey.bannerImage || journey.thumbnailUrl!}
                      alt={journey.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className={`w-full h-full bg-gradient-to-br ${theme.gradient} flex items-center justify-center`}>
                      <GraduationCap size={36} className="text-white/60" />
                    </div>
                  )}

                  {/* Overlay gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

                  {/* Mastered badge */}
                  {isMastered && (
                    <div className="absolute top-3 right-3 flex items-center gap-1 bg-emerald-500/90 backdrop-blur-sm text-white px-2 py-0.5 rounded text-[9px] font-semibold uppercase tracking-wider shadow-sm">
                      <CheckCircle2 size={11} />
                      Mastered
                    </div>
                  )}

                  {/* Category badge */}
                  {journey.category && (
                    <div className="absolute top-3 left-3">
                      <span className="bg-white/80 backdrop-blur-sm text-slate-700 text-[9px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded border border-slate-200/50">
                        {journey.category}
                      </span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4 space-y-3">
                  <h3 className="text-sm font-semibold text-slate-800 leading-tight tracking-tight line-clamp-1">
                    {journey.title}
                  </h3>

                  {/* Description */}
                  <p className="text-xs font-normal text-slate-500 leading-relaxed line-clamp-2">
                    {journey.description}
                  </p>

                  {/* Meta row */}
                  <div className="flex items-center gap-3 text-[11px] font-semibold text-slate-500">
                    <div className="flex items-center gap-1">
                      <Star size={12} className="text-amber-400 fill-amber-400" />
                      <span>{journey.totalXP} XP</span>
                    </div>
                    <div className="h-2.5 w-px bg-slate-200" />
                    <div className="flex items-center gap-1">
                      <BookOpen size={12} className={theme.accent} />
                      <span className={theme.accent}>{completedCount}/{totalCount} Episodes</span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[10px] font-semibold text-slate-500">
                      <span>Progress</span>
                      <span className={theme.accent}>{pct}%</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r ${isMastered ? 'from-emerald-400 to-emerald-500' : theme.gradient} transition-all duration-700 rounded-full`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>

                  {/* CTA */}
                  <div className="flex items-center justify-end pt-2 border-t border-slate-100">
                    <span className={`flex items-center gap-1 text-[11px] font-semibold ${theme.accent} group-hover:gap-1.5 transition-all duration-300`}>
                      {isMastered ? 'Review Journey' : completedCount > 0 ? 'Continue Learning' : 'Start Journey'}
                      <ArrowRight size={12} className="transition-transform group-hover:translate-x-0.5 duration-300" />
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
