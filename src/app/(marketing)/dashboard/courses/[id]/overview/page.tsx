"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { useAuthStore } from "@/store/auth-store";
import { apiClient } from "@/lib/api-client";
import {
  ArrowLeft, Play, CheckCircle2, Lock, BookOpen, Clock,
  Award, Star, Layers, ChevronRight, PlayCircle, FileText,
  Sparkles, Target, TrendingUp, User, Zap, BarChart2,
  GraduationCap, Trophy, Flame, ChevronDown, ChevronUp,
} from "lucide-react";

// ─── Circular progress ring (compact) ────────────────────────────────────────
const ProgressRing = ({
  pct, size = 96, stroke = 9,
}: { pct: number; size?: number; stroke?: number }) => {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (circ * Math.min(pct, 100)) / 100;
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="transparent" stroke="#ede9fe" strokeWidth={stroke} />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="transparent"
        stroke="url(#ringGrad)" strokeWidth={stroke} strokeLinecap="round"
        strokeDasharray={circ} strokeDashoffset={offset}
        style={{ transition: "stroke-dashoffset 1.2s ease-out" }}
      />
      <defs>
        <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#7c3aed" />
          <stop offset="100%" stopColor="#a855f7" />
        </linearGradient>
      </defs>
    </svg>
  );
};

export default function CourseOverviewPage() {
  const { id } = useParams();
  const router = useRouter();
  const { token } = useAuthStore();

  const [course, setCourse] = useState<any>(null);
  const [progress, setProgress] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});

  // ── Recalculate score from stored answers when score=null (fixes old data) ──
  const computeScoreFromAnswers = (questions: any[], answers: any): number | null => {
    if (!Array.isArray(answers) || !Array.isArray(questions) || answers.length === 0) return null;
    return answers.reduce((sc: number, ans: any, idx: number) => {
      return Number(ans) === Number(questions[idx]?.correctAnswerIndex) ? sc + 1 : sc;
    }, 0);
  };

  useEffect(() => {
    if (token && id) fetchData();
  }, [token, id]);

  const fetchData = async () => {
    try {
      const [courseData, progressRes] = await Promise.all([
        apiClient.get<any>(`/lms/${id}`),
        apiClient.get<any>(`/lms/${id}/progress`).catch(() => null),
      ]);
      if (!courseData) throw new Error("Not found");
      setCourse(courseData);
      const prog = progressRes?.progress || [];
      setProgress(prog);

      // Auto-expand the first in-progress module
      const mods = [...(courseData.modules || [])].sort((a: any, b: any) => (a.order || 0) - (b.order || 0));
      const expanded: Record<string, boolean> = {};
      for (const mod of mods) {
        const chapters = mod.chapters || [];
        const anyDone = chapters.some((c: any) =>
          prog.some((p: any) => p.chapterId === c.id && p.isCompleted)
        );
        const anyNotDone = chapters.some((c: any) =>
          !prog.some((p: any) => p.chapterId === c.id && p.isCompleted)
        );
        if (anyDone && anyNotDone) { expanded[mod.id] = true; break; }
      }
      if (Object.keys(expanded).length === 0 && mods.length > 0) {
        expanded[mods[0].id] = true;
      }
      setExpandedModules(expanded);
    } catch {
      toast.error("Failed to load course details");
      router.push("/dashboard/my-courses");
    } finally {
      setIsLoading(false);
    }
  };

  // ── Derived stats ──────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    if (!course) return { flatChapters: [], totalChapters: 0, completedChapters: 0, progressPct: 0, nextChapter: null, totalScore: 0, maxScore: 0, sortedModules: [] };

    const sortedModules = [...(course.modules || [])].sort((a: any, b: any) => (a.order || 0) - (b.order || 0));
    const flat: any[] = [];
    for (const mod of sortedModules) {
      flat.push(...[...(mod.chapters || [])].sort((a: any, b: any) => (a.order || 0) - (b.order || 0)));
    }

    const completedList = flat.filter((c) => progress.some((p) => p.chapterId === c.id && p.isCompleted));
    const pct = flat.length > 0 ? Math.round((completedList.length / flat.length) * 100) : 0;

    let nextChapter: any = null;
    for (const ch of flat) {
      if (!progress.some((p) => p.chapterId === ch.id && p.isCompleted)) { nextChapter = ch; break; }
    }
    if (!nextChapter && flat.length > 0) nextChapter = flat[flat.length - 1];

    let totalScore = 0, maxScore = 0;
    for (const ch of flat) {
      if (ch.type === "ASSESSMENT" && ch.assessment?.questions) {
        maxScore += ch.assessment.questions.length;
        const chProg = progress.find((p) => p.chapterId === ch.id);
        if (chProg?.isCompleted) {
          let savedScore = chProg.score as number | null;
          if ((savedScore === null || savedScore === undefined) && chProg.answers) {
            savedScore = computeScoreFromAnswers(ch.assessment.questions, chProg.answers);
          }
          totalScore += savedScore || 0;
        }
      }
    }

    return { flatChapters: flat, totalChapters: flat.length, completedChapters: completedList.length, progressPct: pct, nextChapter, totalScore, maxScore, sortedModules };
  }, [course, progress]);

  const { flatChapters, totalChapters, completedChapters, progressPct, nextChapter, totalScore, maxScore, sortedModules } = stats;

  const isChapterCompleted = (id: string) => progress.some((p) => p.chapterId === id && p.isCompleted);
  const isChapterUnlocked = (chId: string) => {
    const idx = flatChapters.findIndex((c) => c.id === chId);
    if (idx <= 0) return true;
    return progress.some((p) => p.chapterId === flatChapters[idx - 1].id && p.isCompleted);
  };
  const getModuleStats = (mod: any) => {
    const chs = mod.chapters || [];
    const done = chs.filter((c: any) => isChapterCompleted(c.id)).length;
    return { done, total: chs.length, pct: chs.length > 0 ? Math.round((done / chs.length) * 100) : 0 };
  };
  const toggleModule = (modId: string) => setExpandedModules(p => ({ ...p, [modId]: !p[modId] }));

  // ── Loading ────────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-12 h-12 rounded-full border-4 border-violet-200 border-t-violet-600 animate-spin" />
        <p className="text-xs font-black text-slate-400 uppercase tracking-widest animate-pulse">Loading course...</p>
      </div>
    );
  }

  if (!course) return null;

  const remainingChapters = totalChapters - completedChapters;
  const scoreAccuracy = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : null;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 w-full max-w-7xl mx-auto pb-10 font-sans">

      {/* ── Back nav ── */}
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard/my-courses"
          className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-800 font-semibold text-sm transition-colors bg-white px-4 py-2.5 rounded-2xl border border-slate-200 shadow-sm hover:border-slate-300"
        >
          <ArrowLeft size={15} />
          My Courses
        </Link>
        {course.category && (
          <span className="px-3 py-1 bg-violet-50 border border-violet-200/70 text-violet-700 text-[11px] font-black rounded-full uppercase tracking-wider">
            {course.category}
          </span>
        )}
      </div>

      {/* ── Welcome / Hero Banner — matching dashboard purple gradient welcome ── */}
      <div className="bg-linear-to-r from-purple-200 via-purple-100 to-purple-50/80 p-6 sm:p-8 rounded-[26px] border border-purple-200/60 shadow-[0_4px_25px_rgba(124,58,237,0.08)] flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute top-[-30%] right-[-5%] w-[40%] h-[150%] bg-violet-300/20 rounded-full blur-[60px] pointer-events-none" />
        <div className="absolute bottom-[-30%] left-[-5%] w-[25%] h-[80%] bg-purple-200/20 rounded-full blur-[50px] pointer-events-none" />

        <div className="space-y-2 relative z-10 flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/90 border border-violet-200 rounded-full text-[10px] font-extrabold text-violet-600 shadow-sm">
              <Sparkles size={11} className="text-violet-500" /> Enrolled Course
            </div>
            {progressPct === 100 && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-full text-[10px] font-extrabold shadow-sm">
                <CheckCircle2 size={11} /> Completed!
              </div>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight line-clamp-2">{course.title}</h1>
          {course.description && (
            <p className="text-xs sm:text-sm font-semibold text-slate-600 max-w-xl leading-relaxed line-clamp-2">{course.description}</p>
          )}
          <div className="flex flex-wrap gap-3 pt-1">
            {course.timeDuration && (
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-slate-500 bg-white/80 px-3 py-1.5 rounded-xl border border-purple-100 shadow-sm">
                <Clock size={12} className="text-violet-500" /> {course.timeDuration} mins
              </span>
            )}
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-slate-500 bg-white/80 px-3 py-1.5 rounded-xl border border-purple-100 shadow-sm">
              <Layers size={12} className="text-violet-500" /> {sortedModules.length} Modules
            </span>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-slate-500 bg-white/80 px-3 py-1.5 rounded-xl border border-purple-100 shadow-sm">
              <PlayCircle size={12} className="text-violet-500" /> {totalChapters} Chapters
            </span>
          </div>
        </div>

        <button
          onClick={() => router.push(`/dashboard/courses/${id}`)}
          className="bg-linear-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-extrabold py-3.5 px-7 rounded-full flex items-center gap-2 shadow-md transition-all duration-200 active:scale-95 text-sm shrink-0 relative z-10 shadow-violet-500/20"
        >
          <Play size={16} className="fill-white" />
          {completedChapters > 0 ? "Resume Course" : "Start Learning"}
        </button>
      </div>

      {/* ── 4-Card Stats Row — exact dashboard pastel style ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">

        {/* CARD 1: OVERALL PROGRESS — Rose */}
        <div className="bg-[#FFF4F6] border border-rose-200/70 rounded-[26px] p-5 sm:p-6 shadow-[0_4px_20px_rgba(244,63,94,0.06)] hover:shadow-lg transition-all duration-300 flex flex-col justify-between min-h-[190px] relative overflow-hidden group">
          <div className="flex items-center gap-2.5 relative z-10">
            <div className="w-8 h-8 rounded-xl bg-white/90 border border-rose-200 flex items-center justify-center text-rose-500 shrink-0 shadow-sm">
              <BarChart2 size={16} />
            </div>
            <span className="text-[11px] font-extrabold text-rose-600 tracking-wider uppercase">OVERALL PROGRESS</span>
          </div>
          <div className="my-auto py-3 relative z-10 flex items-center gap-4">
            <div className="relative flex items-center justify-center shrink-0">
              <ProgressRing pct={progressPct} size={80} stroke={8} />
              <div className="absolute flex flex-col items-center">
                <span className="text-lg font-black text-slate-800 leading-none">{progressPct}%</span>
              </div>
            </div>
            <div>
              <p className="font-extrabold text-base text-slate-800 leading-tight">{completedChapters}/{totalChapters}</p>
              <p className="text-xs font-semibold text-rose-600 mt-0.5">chapters done</p>
              <div className="h-1.5 w-full bg-rose-100 rounded-full overflow-hidden border border-rose-100 mt-2">
                <div className="h-full bg-linear-to-r from-rose-400 to-pink-500 rounded-full transition-all duration-700" style={{ width: `${progressPct}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* CARD 2: REMAINING — Blue */}
        <div className="bg-[#F0F7FF] border border-blue-200/70 rounded-[26px] p-5 sm:p-6 shadow-[0_4px_20px_rgba(59,130,246,0.06)] hover:shadow-lg transition-all duration-300 flex flex-col justify-between min-h-[190px] relative overflow-hidden group">
          <div className="flex items-center gap-2.5 relative z-10">
            <div className="w-8 h-8 rounded-xl bg-white/90 border border-blue-200 flex items-center justify-center text-blue-500 shrink-0 shadow-sm">
              <Target size={16} />
            </div>
            <span className="text-[11px] font-extrabold text-blue-600 tracking-wider uppercase">REMAINING</span>
          </div>
          <div className="my-auto py-3 relative z-10">
            <p className="font-extrabold text-4xl text-slate-800 leading-none">{remainingChapters}</p>
            <p className="text-sm font-bold text-blue-600 mt-1">chapter{remainingChapters !== 1 ? 's' : ''} left</p>
            {nextChapter && remainingChapters > 0 && (
              <p className="text-[11px] font-semibold text-slate-500 mt-2 line-clamp-1">
                Next: {nextChapter.title}
              </p>
            )}
            {remainingChapters === 0 && (
              <p className="text-[11px] font-bold text-emerald-600 mt-2 flex items-center gap-1">
                <CheckCircle2 size={12} /> All chapters done!
              </p>
            )}
          </div>
        </div>

        {/* CARD 3: QUIZ SCORE — Green */}
        <div className="bg-[#F0FDF4] border border-emerald-200/70 rounded-[26px] p-5 sm:p-6 shadow-[0_4px_20px_rgba(16,185,129,0.06)] hover:shadow-lg transition-all duration-300 flex flex-col justify-between min-h-[190px] relative overflow-hidden group">
          <div className="flex items-center gap-2.5 relative z-10">
            <div className="w-8 h-8 rounded-xl bg-white/90 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0 shadow-sm">
              <Star size={16} />
            </div>
            <span className="text-[11px] font-extrabold text-emerald-600 tracking-wider uppercase">QUIZ SCORE</span>
          </div>
          <div className="my-auto py-3 relative z-10">
            {maxScore > 0 ? (
              <>
                <p className="font-extrabold text-4xl text-slate-800 leading-none">{totalScore}<span className="text-xl text-slate-400">/{maxScore}</span></p>
                <p className="text-sm font-bold text-emerald-600 mt-1">{scoreAccuracy}% accuracy</p>
                <div className="h-1.5 w-full bg-emerald-100 rounded-full overflow-hidden border border-emerald-100 mt-2">
                  <div className="h-full bg-linear-to-r from-emerald-400 to-teal-500 rounded-full transition-all duration-700" style={{ width: `${scoreAccuracy}%` }} />
                </div>
              </>
            ) : (
              <>
                <p className="font-extrabold text-2xl text-slate-800">—</p>
                <p className="text-sm font-semibold text-slate-500 mt-1">No quizzes yet</p>
              </>
            )}
          </div>
        </div>

        {/* CARD 4: MILESTONES — Purple */}
        <div className="bg-[#FAF5FF] border border-purple-200/70 rounded-[26px] p-5 sm:p-6 shadow-[0_4px_20px_rgba(168,85,247,0.06)] hover:shadow-lg transition-all duration-300 flex flex-col justify-between min-h-[190px] relative overflow-hidden group">
          <div className="flex items-center gap-2.5 relative z-10">
            <div className="w-8 h-8 rounded-xl bg-white/90 border border-purple-200 flex items-center justify-center text-purple-600 shrink-0 shadow-sm">
              <Trophy size={16} />
            </div>
            <span className="text-[11px] font-extrabold text-purple-600 tracking-wider uppercase">MILESTONES</span>
          </div>
          <div className="my-auto py-2.5 space-y-2 relative z-10">
            {[
              { emoji: "🚀", label: "First Step", desc: "1st chapter done", unlocked: completedChapters >= 1 },
              { emoji: "⚡", label: "Halfway Hero", desc: "50% complete", unlocked: progressPct >= 50 },
              { emoji: "🏆", label: "Champion", desc: "Course complete", unlocked: progressPct === 100 },
            ].map((m, i) => (
              <div key={i} className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold border shadow-sm transition-all ${m.unlocked ? 'bg-white/90 border-purple-200/80 text-slate-800' : 'bg-white/50 border-purple-100/60 text-slate-400 opacity-60'}`}>
                <span className="text-sm">{m.emoji}</span>
                <span className="flex-1 truncate">{m.label}</span>
                {m.unlocked && <CheckCircle2 size={11} className="text-purple-500 shrink-0" />}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Resume / Next Up Banner — amber pastel matching dashboard's booked demo style ── */}
      {nextChapter && progressPct < 100 && (
        <div className="bg-[#FFFDF5] border border-amber-200/70 rounded-[26px] p-6 shadow-[0_4px_25px_rgba(245,158,11,0.06)] hover:shadow-lg transition-all duration-300 flex flex-col md:flex-row md:items-center justify-between gap-5 relative overflow-hidden">
          <div className="absolute top-[-20%] right-[-5%] w-[35%] h-[140%] bg-amber-100/40 rounded-full blur-[50px] pointer-events-none" />

          <div className="flex items-start gap-4 relative z-10">
            <div className="p-3 rounded-2xl bg-white/90 border border-amber-200 text-amber-600 shadow-sm shrink-0">
              {nextChapter.type === "VIDEO" ? <PlayCircle size={22} /> : <FileText size={22} />}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                  {completedChapters > 0 ? "📍 Resume Here" : "🚀 Start Here"}
                </span>
              </div>
              <h3 className="font-extrabold text-slate-800 text-base leading-snug">{nextChapter.title}</h3>
              <p className="text-xs font-semibold text-slate-500 mt-0.5">
                {nextChapter.type === "VIDEO"
                  ? nextChapter.video?.duration ? `${Math.round(nextChapter.video.duration / 60)} min video lesson` : "Video lesson"
                  : "Quiz assessment"}
                {" · "}{completedChapters} of {totalChapters} chapters completed
              </p>
            </div>
          </div>

          <div className="relative z-10 flex flex-col items-start md:items-end gap-3 shrink-0">
            {/* Inline mini progress */}
            <div className="w-full md:w-44">
              <div className="flex justify-between text-[10px] font-bold text-amber-600 uppercase tracking-wider mb-1.5">
                <span>Progress</span><span>{progressPct}%</span>
              </div>
              <div className="h-2 w-full bg-amber-100 rounded-full overflow-hidden border border-amber-200/60">
                <div className="h-full bg-linear-to-r from-amber-400 to-orange-400 rounded-full transition-all duration-700" style={{ width: `${progressPct}%` }} />
              </div>
            </div>
            <button
              onClick={() => router.push(`/dashboard/courses/${id}`)}
              className="w-full md:w-auto text-center px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs rounded-full flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95"
            >
              <Play size={14} className="fill-white" />
              {completedChapters > 0 ? "Resume Course" : "Start Course"} →
            </button>
          </div>
        </div>
      )}

      {/* Course Completed Banner */}
      {progressPct === 100 && (
        <div className="bg-[#F0FDF4] border border-emerald-200/70 rounded-[26px] p-6 shadow-[0_4px_25px_rgba(16,185,129,0.08)] flex flex-col md:flex-row items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 border border-emerald-200 flex items-center justify-center text-3xl shrink-0">🎉</div>
            <div>
              <h3 className="font-extrabold text-slate-800 text-lg">Course Complete!</h3>
              <p className="text-sm font-semibold text-slate-500 mt-0.5">You've mastered every chapter. Amazing work!</p>
            </div>
          </div>
          <button
            onClick={() => router.push(`/dashboard/courses/${id}`)}
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-full flex items-center gap-2 shadow-sm transition-all active:scale-95"
          >
            <PlayCircle size={14} /> Review Course
          </button>
        </div>
      )}

      {/* ── Main grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Module Breakdown — 2 cols */}
        <div className="lg:col-span-2 bg-white border border-slate-100 rounded-[26px] shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:shadow-lg transition-all duration-300 overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-violet-50 border border-violet-200 flex items-center justify-center text-violet-600 shadow-sm">
                <Layers size={17} />
              </div>
              <div>
                <h2 className="font-extrabold text-slate-800 text-sm uppercase tracking-wide">Course Modules</h2>
                <p className="text-[11px] font-semibold text-slate-400 mt-0.5">{sortedModules.length} modules · {totalChapters} chapters total</p>
              </div>
            </div>
            <span className="text-[10px] font-black text-violet-700 bg-violet-50 border border-violet-200 px-3 py-1 rounded-full">
              {completedChapters}/{totalChapters} done
            </span>
          </div>

          <div className="divide-y divide-slate-50">
            {sortedModules.map((mod: any, modIdx: number) => {
              const { done, total, pct } = getModuleStats(mod);
              const isDone = done === total && total > 0;
              const isStarted = done > 0 && !isDone;
              const isOpen = !!expandedModules[mod.id];

              return (
                <div key={mod.id}>
                  {/* Module header — clickable */}
                  <button
                    onClick={() => toggleModule(mod.id)}
                    className="w-full px-6 py-4 flex items-start justify-between gap-4 hover:bg-slate-50/50 transition-colors text-left"
                  >
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-black mt-0.5 border ${isDone ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : isStarted ? 'bg-violet-50 text-violet-700 border-violet-200' : 'bg-slate-50 text-slate-400 border-slate-200'}`}>
                        {isDone ? <CheckCircle2 size={14} /> : modIdx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Module {modIdx + 1}</p>
                        <h3 className="font-bold text-slate-800 text-sm leading-snug truncate">{mod.title}</h3>
                        {/* Mini progress bar always visible */}
                        <div className="flex items-center gap-2 mt-2">
                          <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full transition-all duration-700 ${isDone ? 'bg-linear-to-r from-emerald-400 to-teal-500' : 'bg-linear-to-r from-violet-500 to-purple-400'}`} style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-[10px] font-bold text-slate-400 shrink-0">{done}/{total}</span>
                        </div>
                      </div>
                    </div>
                    <div className={`shrink-0 mt-1 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''} text-slate-400`}>
                      <ChevronDown size={16} />
                    </div>
                  </button>

                  {/* Expanded chapter list */}
                  {isOpen && (
                    <div className="px-6 pb-4 space-y-1.5 bg-slate-50/30">
                      {[...(mod.chapters || [])].sort((a: any, b: any) => (a.order || 0) - (b.order || 0)).map((ch: any, cIdx: number) => {
                        const done = isChapterCompleted(ch.id);
                        const unlocked = isChapterUnlocked(ch.id);
                        return (
                          <div
                            key={ch.id}
                            onClick={() => { if (unlocked) router.push(`/dashboard/courses/${id}`); }}
                            className={`flex items-center gap-3 py-2.5 px-4 rounded-2xl text-[13px] font-semibold transition-all border ${done ? 'bg-emerald-50 border-emerald-100 text-emerald-700 cursor-pointer' : unlocked ? 'bg-white border-slate-100 text-slate-600 hover:border-violet-200 hover:bg-violet-50/40 cursor-pointer' : 'bg-white border-slate-100 text-slate-300 cursor-not-allowed'}`}
                          >
                            <div className="shrink-0">
                              {done ? <CheckCircle2 size={15} className="text-emerald-500" /> : !unlocked ? <Lock size={13} className="text-slate-300" /> : ch.type === "VIDEO" ? <PlayCircle size={15} className="text-violet-400" /> : <FileText size={15} className="text-violet-400" />}
                            </div>
                            <span className="flex-1 truncate">{cIdx + 1}. {ch.title}</span>
                            {ch.type === "VIDEO" && ch.video?.duration && (
                              <span className="text-[11px] font-bold text-slate-400 shrink-0">{Math.round(ch.video.duration / 60)}m</span>
                            )}
                            {ch.type === "ASSESSMENT" && (
                              <div className="flex items-center gap-1.5 shrink-0">
                                <span className="text-[10px] font-black text-violet-600 bg-violet-50 border border-violet-100 px-2 py-0.5 rounded-full">Quiz</span>
                                {done && (() => {
                                  const chProg = progress.find((p) => p.chapterId === ch.id);
                                  let effectiveScore = chProg?.score as number | null;
                                  if ((effectiveScore === null || effectiveScore === undefined) && chProg?.answers && ch.assessment?.questions) {
                                    effectiveScore = computeScoreFromAnswers(ch.assessment.questions, chProg.answers);
                                  }
                                  if (chProg && effectiveScore !== null) {
                                    return (
                                      <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">
                                        Score: {effectiveScore}/{ch.assessment?.questions?.length || 0}
                                      </span>
                                    );
                                  }
                                  return null;
                                })()}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}

            {sortedModules.length === 0 && (
              <div className="py-16 text-center text-slate-400">
                <BookOpen size={28} className="mx-auto mb-3 opacity-30" />
                <p className="text-sm font-semibold">No modules yet.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-5">

          {/* Expert Card — green pastel style */}
          {course.instructor ? (
            <div className="bg-[#F0FDF4] border border-emerald-200/70 rounded-[26px] p-5 shadow-[0_4px_20px_rgba(16,185,129,0.06)] hover:shadow-lg transition-all duration-300 overflow-hidden">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 rounded-xl bg-white/90 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0 shadow-sm">
                  <Award size={16} />
                </div>
                <span className="text-[11px] font-extrabold text-emerald-600 tracking-wider uppercase">YOUR EXPERT</span>
              </div>
              <div className="flex items-center gap-3 mb-3">
                <div className="relative shrink-0">
                  {course.instructor.avatarUrl ? (
                    <img src={course.instructor.avatarUrl} alt={course.instructor.name} className="w-14 h-14 rounded-2xl object-cover border-2 border-emerald-200 shadow-sm" />
                  ) : (
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center border-2 border-emerald-200 shadow-sm">
                      <User size={24} className="text-white" />
                    </div>
                  )}
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center">
                    <span className="text-[8px] text-white font-black">✓</span>
                  </div>
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-800 text-sm">{course.instructor.name}</h3>
                  {course.instructor.designation && <p className="text-[12px] text-emerald-700 font-bold mt-0.5">{course.instructor.designation}</p>}
                  {course.instructor.experience && <p className="text-[11px] text-slate-400 font-semibold">{course.instructor.experience}</p>}
                </div>
              </div>
              {course.instructor.bio && (
                <p className="text-[12px] text-slate-600 leading-relaxed font-medium border-t border-emerald-100 pt-3">{course.instructor.bio}</p>
              )}
              {course.instructor.specializations?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {course.instructor.specializations.map((s: string, i: number) => (
                    <span key={i} className="px-2.5 py-1 bg-white/90 border border-emerald-200/80 text-emerald-700 text-[11px] font-bold rounded-full">{s}</span>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* Expert fallback — blue pastel */
            <div className="bg-[#F0F7FF] border border-blue-200/70 rounded-[26px] p-5 shadow-[0_4px_20px_rgba(59,130,246,0.06)] hover:shadow-lg transition-all duration-300 text-center">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 rounded-xl bg-white/90 border border-blue-200 flex items-center justify-center text-blue-500 shrink-0 shadow-sm">
                  <GraduationCap size={16} />
                </div>
                <span className="text-[11px] font-extrabold text-blue-600 tracking-wider uppercase">EXPERT-LED</span>
              </div>
              <p className="text-sm font-semibold text-slate-600 leading-relaxed">
                This course is crafted and reviewed by certified wellness & parenting experts at Infano.
              </p>
            </div>
          )}

          {/* Course Highlights — purple pastel */}
          {course.highlights?.length > 0 && (
            <div className="bg-[#FAF5FF] border border-purple-200/70 rounded-[26px] p-5 shadow-[0_4px_20px_rgba(168,85,247,0.06)] hover:shadow-lg transition-all duration-300">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 rounded-xl bg-white/90 border border-purple-200 flex items-center justify-center text-purple-600 shrink-0 shadow-sm">
                  <Zap size={16} />
                </div>
                <span className="text-[11px] font-extrabold text-purple-600 tracking-wider uppercase">WHAT YOU'LL LEARN</span>
              </div>
              <div className="space-y-2.5">
                {course.highlights.map((h: string, i: number) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-white/90 border border-purple-200 flex items-center justify-center text-purple-600 shrink-0 mt-0.5 shadow-sm">
                      <CheckCircle2 size={12} />
                    </div>
                    <span className="text-[13px] text-slate-600 font-semibold leading-snug">{h}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bottom CTA — rose pastel */}
          <div className="bg-[#FFF4F6] border border-rose-200/70 rounded-[26px] p-5 shadow-[0_4px_20px_rgba(244,63,94,0.06)] hover:shadow-lg transition-all duration-300">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-xl bg-white/90 border border-rose-200 flex items-center justify-center text-rose-500 shrink-0 shadow-sm">
                <Flame size={16} />
              </div>
              <span className="text-[11px] font-extrabold text-rose-600 tracking-wider uppercase">KEEP GOING</span>
            </div>
            <p className="text-sm font-semibold text-slate-600 leading-relaxed mb-4">
              {completedChapters > 0
                ? `${remainingChapters} chapter${remainingChapters !== 1 ? 's' : ''} remaining — you're doing great!`
                : `Start your journey — ${totalChapters} chapters await.`}
            </p>
            <button
              onClick={() => router.push(`/dashboard/courses/${id}`)}
              className="w-full bg-rose-500 hover:bg-rose-600 text-white font-extrabold text-xs py-3 rounded-full block text-center transition-all active:scale-95 shadow-sm flex items-center justify-center gap-2"
            >
              <Play size={13} className="fill-white" />
              {completedChapters > 0 ? "Resume Course" : "Start Learning"} →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
