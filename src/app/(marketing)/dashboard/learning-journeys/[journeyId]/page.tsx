'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import {
  ArrowLeft, Star, BookOpen, Loader2, Lock,
  CheckCircle2, Play, GraduationCap, Sparkles, Trophy
} from 'lucide-react';
import { LearningService, LearningJourney, UserProgress } from '@/services/learning.service';
import { useAuthStore } from '@/store/auth-store';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import EpisodePlayerModal from '@/components/learning/EpisodePlayerModal';

// Category color themes
const CATEGORY_THEMES: Record<string, { accent: string; gradient: string; bg: string; border: string; iconBg: string }> = {
  'puberty': {
    accent: 'text-rose-600', gradient: 'from-rose-500 to-pink-500', bg: 'bg-rose-50',
    border: 'border-rose-200', iconBg: 'bg-rose-100'
  },
  'mental-health': {
    accent: 'text-teal-600', gradient: 'from-teal-500 to-emerald-500', bg: 'bg-teal-50',
    border: 'border-teal-200', iconBg: 'bg-teal-100'
  },
  'relationships': {
    accent: 'text-violet-600', gradient: 'from-violet-500 to-purple-500', bg: 'bg-violet-50',
    border: 'border-violet-200', iconBg: 'bg-violet-100'
  },
  'body': {
    accent: 'text-amber-600', gradient: 'from-amber-500 to-orange-500', bg: 'bg-amber-50',
    border: 'border-amber-200', iconBg: 'bg-amber-100'
  },
  'safety': {
    accent: 'text-blue-600', gradient: 'from-blue-500 to-indigo-500', bg: 'bg-blue-50',
    border: 'border-blue-200', iconBg: 'bg-blue-100'
  },
};

const DEFAULT_THEME = {
  accent: 'text-purple-600', gradient: 'from-purple-500 to-indigo-500', bg: 'bg-purple-50',
  border: 'border-purple-200', iconBg: 'bg-purple-100'
};

function getTheme(category: string | null) {
  if (!category) return DEFAULT_THEME;
  const key = category.toLowerCase().replace(/\s+/g, '-');
  return CATEGORY_THEMES[key] || DEFAULT_THEME;
}

export default function JourneyDetailPage() {
  const params = useParams();
  const journeyId = params.journeyId as string;
  const { user } = useAuthStore();

  const [journey, setJourney] = useState<LearningJourney | null>(null);
  const [progress, setProgress] = useState<UserProgress[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [selectedEpisodeId, setSelectedEpisodeId] = useState<string | null>(null);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);

  const isTeen = user?.role === 'TEEN';

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [journeyRes, progressRes] = await Promise.all([
        LearningService.getJourney(journeyId),
        LearningService.getMyProgress().catch(() => []),
      ]);
      setJourney(journeyRes);
      setProgress(progressRes);
    } catch {
      toast.error('Failed to load journey details.');
    } finally {
      setLoading(false);
    }
  }, [journeyId]);

  useEffect(() => { loadData(); }, [loadData]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <Loader2 className="animate-spin text-primary" size={44} />
        <span className="font-extrabold text-lg text-slate-600 tracking-wide">Loading Journey...</span>
      </div>
    );
  }

  if (!journey) {
    return (
      <div className="space-y-6">
        <Link
          href="/dashboard/learning-journeys"
          className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-primary transition-colors"
        >
          <ArrowLeft size={16} /> Back to Journeys
        </Link>
        <div className="bg-white border border-slate-100 rounded-2xl p-16 text-center shadow-sm space-y-4">
          <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto text-slate-300">
            <GraduationCap size={30} />
          </div>
          <h3 className="font-extrabold text-slate-700">Journey not found</h3>
          <p className="text-xs font-semibold text-slate-400 max-w-xs mx-auto">
            This journey may have been removed or is not available yet.
          </p>
        </div>
      </div>
    );
  }

  const theme = getTheme(journey.category);
  const episodes = journey.episodes || [];
  const completedIds = new Set(
    progress.filter(p => episodes.some(e => e.id === p.episodeId) && p.completed).map(p => p.episodeId)
  );
  const completedCount = completedIds.size;
  const totalCount = episodes.length;
  const pct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const isMastered = totalCount > 0 && completedCount === totalCount;

  // XP earned estimate
  const xpPerEpisode = totalCount > 0 ? Math.round(journey.totalXP / totalCount) : 0;
  const xpEarned = xpPerEpisode * completedCount;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
      {/* Back link */}
      <Link
        href="/dashboard/learning-journeys"
        className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-primary transition-colors group"
      >
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Learning Journeys
      </Link>

      {/* Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden shadow-xl">
        {/* Background image or gradient */}
        <div className="h-56 sm:h-72 relative">
          {journey.bannerImage || journey.thumbnailUrl ? (
            <img
              src={journey.bannerImage || journey.thumbnailUrl!}
              alt={journey.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className={`w-full h-full bg-gradient-to-br ${theme.gradient}`} />
          )}

          {/* Dark overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/10" />

          {/* Content overlaid */}
          <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 space-y-4">
            <div className="flex items-center gap-3 flex-wrap">
              {journey.category && (
                <span className="bg-white/20 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full border border-white/20">
                  {journey.category}
                </span>
              )}
              {isMastered && (
                <span className="flex items-center gap-1.5 bg-emerald-500/90 backdrop-blur-sm text-white text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-lg">
                  <CheckCircle2 size={12} /> Mastered
                </span>
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight drop-shadow-lg leading-tight">
              {journey.title}
            </h1>

            {/* Progress bar */}
            <div className="max-w-md space-y-2">
              <div className="flex justify-between text-xs font-bold text-white/80">
                <span>{completedCount} of {totalCount} completed</span>
                <span>{pct}%</span>
              </div>
              <div className="h-2.5 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
                <div
                  className={`h-full ${isMastered ? 'bg-emerald-400' : 'bg-white'} transition-all duration-700 rounded-full`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Journey Info + Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="sm:col-span-2 bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-3">
          <h2 className="text-lg font-extrabold text-slate-800">About This Journey</h2>
          <p className="text-sm text-slate-500 leading-relaxed font-medium">{journey.description}</p>
          {journey.topics && journey.topics.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2">
              {journey.topics.map((topic, i) => (
                <span key={i} className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${theme.bg} ${theme.border} ${theme.accent}`}>
                  {topic}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Stats</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl ${theme.iconBg} flex items-center justify-center`}>
                <BookOpen size={16} className={theme.accent} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400">Episodes</p>
                <p className="text-lg font-extrabold text-slate-800 leading-none">{totalCount}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center">
                <Star size={16} className="text-amber-500 fill-amber-500" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400">Total XP</p>
                <p className="text-lg font-extrabold text-slate-800 leading-none">{journey.totalXP}</p>
              </div>
            </div>
            {completedCount > 0 && (
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center">
                  <Trophy size={16} className="text-emerald-500" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400">XP Earned</p>
                  <p className="text-lg font-extrabold text-emerald-600 leading-none">{xpEarned}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Path to Mastery — Episode List */}
      <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/40">
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-100">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-800 flex items-center gap-2">
              <Sparkles className="text-purple-500" size={22} /> Path to Mastery
            </h2>
            <p className="text-sm font-semibold text-slate-400 mt-1">Complete each activity in order to unlock the next</p>
          </div>
          <span className={`text-sm font-extrabold ${theme.accent}`}>
            {completedCount}/{totalCount} Done
          </span>
        </div>

        <div className="space-y-4">
          {episodes.map((episode, index) => {
            const isCompleted = completedIds.has(episode.id);
            const isFirst = index === 0;
            const prevCompleted = index > 0 && completedIds.has(episodes[index - 1].id);
            const isUnlocked = isFirst || prevCompleted || isCompleted;

            return (
              <div
                key={episode.id}
                onClick={() => {
                  if (isUnlocked) {
                    setSelectedEpisodeId(episode.id);
                    setIsPlayerOpen(true);
                  } else {
                    toast.error('This activity is locked. Complete the previous activities to unlock it!');
                  }
                }}
                className={`relative p-5 rounded-2xl border-2 transition-all duration-305 ${
                  isCompleted
                    ? 'bg-emerald-50/50 border-emerald-200 shadow-sm cursor-pointer hover:border-emerald-300'
                    : isUnlocked
                    ? 'bg-white border-slate-100 hover:border-purple-200 hover:shadow-md cursor-pointer'
                    : 'bg-slate-50/50 border-slate-100 opacity-60'
                }`}
              >
                <div className="flex items-center gap-4">
                  {/* Status circle */}
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                      isCompleted
                        ? 'bg-emerald-100'
                        : isUnlocked
                        ? theme.iconBg
                        : 'bg-slate-100'
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 size={22} className="text-emerald-500" />
                    ) : isUnlocked ? (
                      <span className={`text-lg font-extrabold ${theme.accent}`}>{index + 1}</span>
                    ) : (
                      <Lock size={18} className="text-slate-400" />
                    )}
                  </div>

                  {/* Episode info */}
                  <div className="flex-1 min-w-0">
                    <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${
                      isCompleted ? 'text-emerald-500' : isUnlocked ? theme.accent : 'text-slate-400'
                    }`}>
                      Activity {index + 1}
                    </p>
                    <h4 className={`text-base font-extrabold leading-tight ${
                      isUnlocked ? 'text-slate-800' : 'text-slate-400'
                    }`}>
                      {episode.title}
                    </h4>
                    {isUnlocked && (
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <Star size={12} className="text-amber-400 fill-amber-400" />
                        <span className="text-xs font-bold text-slate-400">{episode.points} Points</span>
                      </div>
                    )}
                  </div>

                  {/* Action icon */}
                  <div className="shrink-0">
                    {isCompleted ? (
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                        <CheckCircle2 size={20} className="text-emerald-500" />
                      </div>
                    ) : isUnlocked ? (
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${theme.gradient} flex items-center justify-center shadow-md`}>
                        <Play size={18} className="text-white fill-white ml-0.5" />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                        <Lock size={16} className="text-slate-300" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Connector line to next episode */}
                {index < episodes.length - 1 && (
                  <div className="absolute left-[2.85rem] -bottom-4 w-0.5 h-4 bg-slate-200 z-10" />
                )}
              </div>
            );
          })}
        </div>

        {/* Mastered celebration */}
        {isMastered && (
          <div className="mt-8 p-6 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl text-center space-y-2">
            <div className="text-4xl">🎉</div>
            <h3 className="text-xl font-extrabold text-emerald-700">Journey Mastered!</h3>
            <p className="text-sm font-semibold text-emerald-600/70">
              {isTeen
                ? `Amazing work! You've completed all ${totalCount} activities and earned ${xpEarned} XP.`
                : `All ${totalCount} activities completed. ${xpEarned} XP earned!`}
            </p>
          </div>
        )}
      </div>

      {/* Episode Player Modal */}
      {selectedEpisodeId && (
        <EpisodePlayerModal
          episodeId={selectedEpisodeId}
          category={journey?.category}
          isOpen={isPlayerOpen}
          onClose={() => {
            setIsPlayerOpen(false);
            setSelectedEpisodeId(null);
          }}
          onCompleted={() => {
            loadData(); // reload progress details
          }}
        />
      )}
    </div>
  );
}
