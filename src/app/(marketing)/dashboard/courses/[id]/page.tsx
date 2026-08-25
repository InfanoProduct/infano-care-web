"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import {
  ArrowLeft, PlayCircle, FileText, CheckCircle2, ChevronDown,
  Award, HelpCircle, Lock, User, MessageCircle, Send, ThumbsUp,
  BookOpen, Sparkles, Play, Layers, Clock, Heart, Share2,
  Eye, Calendar,
} from "lucide-react";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { apiClient } from "@/lib/api-client";
import dynamic from "next/dynamic";
import { VideoPlayer } from "@/components/video/VideoPlayer";

const ReactPlayer = dynamic(() => import("react-player"), { ssr: false }) as any;

// ─── Types ────────────────────────────────────────────────────────────────────
interface Comment {
  id: string;
  chapterId: string;
  authorName: string;
  authorInitials: string;
  text: string;
  timestamp: Date;
  likes: number;
  liked: boolean;
}

type TabId = "description" | "goodtoknow" | "faq" | "expert";

// ─── Tiny helpers ─────────────────────────────────────────────────────────────
const scrollbarHide = { scrollbarWidth: "none", msOverflowStyle: "none" } as React.CSSProperties;

export default function CoursePlayerPage() {
  const { id } = useParams();
  const router = useRouter();
  const { token, user } = useAuthStore();

  // ── Recalculate score from stored answers when score=null (fixes old data) ──
  const computeScoreFromAnswers = (questions: any[], answers: any): number | null => {
    if (!Array.isArray(answers) || !Array.isArray(questions) || answers.length === 0) return null;
    return answers.reduce((sc: number, ans: any, idx: number) => {
      return Number(ans) === Number(questions[idx]?.correctAnswerIndex) ? sc + 1 : sc;
    }, 0);
  };
  const [course, setCourse] = useState<any>(null);
  const [activeChapter, setActiveChapter] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});
  const [progress, setProgress] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<TabId>("description");
  const [showQuizIntroModal, setShowQuizIntroModal] = useState(false);
  const [seenQuizIntro, setSeenQuizIntro] = useState<Record<string, boolean>>({});

  // Comments
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState("");
  const commentsEndRef = useRef<HTMLDivElement>(null);

  // Video like / share — per-chapter state
  const [activeChapterLikes, setActiveChapterLikes] = useState<{ liked: boolean; count: number }>({ liked: false, count: 128 });
  const [shareCopied, setShareCopied] = useState(false);

  const fetchChapterLikes = async (chapterId: string) => {
    try {
      const res = await apiClient.get<any>(`/lms/chapters/${chapterId}/likes`);
      if (res) {
        setActiveChapterLikes({ liked: res.liked, count: res.likesCount });
      }
    } catch (e) {
      console.warn("Failed to load chapter likes");
    }
  };

  const handleVideoLike = async (chapterId: string) => {
    try {
      const res = await apiClient.post<any>(`/lms/chapters/${chapterId}/toggle-like`);
      if (res) {
        setActiveChapterLikes({ liked: res.liked, count: res.likesCount });
      }
    } catch (e) {
      toast.error("Failed to update like");
    }
  };

  const handleVideoShare = () => {
    navigator.clipboard?.writeText(window.location.href).catch(() => { });
    setShareCopied(true);
    setTimeout(() => setShareCopied(false), 2000);
  };

  const [quizState, setQuizState] = useState<{
    currentQuestionIndex: number;
    selectedOptionIndex: number;
    isSubmitted: boolean;
    score: number;
    isCompleted: boolean;
    answers: number[];
    isReviewMode: boolean;
  }>({
    currentQuestionIndex: 0,
    selectedOptionIndex: -1,
    isSubmitted: false,
    score: 0,
    isCompleted: false,
    answers: [],
    isReviewMode: false,
  });

  // Reset quiz when chapter changes
  useEffect(() => {
    if (activeChapter) {
      const chapterProgress = progress.find(p => p.chapterId === activeChapter.id);
      const isCompleted = chapterProgress?.isCompleted || false;

      if (isCompleted) {
        // If score is null/undefined, recalculate from stored answers
        let savedScore = chapterProgress.score as number | null;
        if ((savedScore === null || savedScore === undefined) && chapterProgress.answers && activeChapter.assessment?.questions) {
          savedScore = computeScoreFromAnswers(activeChapter.assessment.questions, chapterProgress.answers);
        }
        setQuizState({ currentQuestionIndex: 0, selectedOptionIndex: -1, isSubmitted: false, score: savedScore ?? 0, isCompleted: true, answers: chapterProgress.answers || [], isReviewMode: false });
      } else {
        setQuizState({ currentQuestionIndex: 0, selectedOptionIndex: -1, isSubmitted: false, score: 0, isCompleted: false, answers: [], isReviewMode: false });

        // Show introductory quiz modal on first attempt (never on review or completed state)
        if (activeChapter.type === "ASSESSMENT" && !isCompleted && !seenQuizIntro[activeChapter.id]) {
          setShowQuizIntroModal(true);
          setSeenQuizIntro(prev => ({ ...prev, [activeChapter.id]: true }));
        }
      }
      // Reset tab to description on chapter change
      setActiveTab("description");

      if (token) {
        fetchChapterLikes(activeChapter.id);
      }
    }
  }, [activeChapter?.id, token]);

  useEffect(() => {
    if (token && id) fetchCourseDetails();
  }, [token, id]);

  const fetchCourseDetails = async () => {
    try {
      const data = await apiClient.get<any>(`/lms/${id}`);
      if (!data) throw new Error("Failed to load course");
      setCourse(data);

      let userProgress: any[] = [];
      try {
        const progRes = await apiClient.get<any>(`/lms/${id}/progress`);
        userProgress = progRes?.progress || [];
        setProgress(userProgress);
      } catch (e) { console.warn("Failed to load progress"); }

      if (data.modules?.length > 0) {
        const modules = [...data.modules].sort((a, b) => (a.order || 0) - (b.order || 0));
        const chapters: any[] = [];
        for (const module of modules) {
          if (module.chapters) chapters.push(...[...module.chapters].sort((a, b) => (a.order || 0) - (b.order || 0)));
        }
        let targetChapter = chapters.find(ch => !userProgress.some((p: any) => p.chapterId === ch.id && p.isCompleted)) || chapters[chapters.length - 1] || null;
        if (targetChapter) {
          setActiveChapter(targetChapter);
          if (targetChapter.moduleId) setExpandedModules({ [targetChapter.moduleId]: true });
        }
      }
    } catch (error) {
      toast.error("Error loading course");
      router.push("/dashboard/courses");
    } finally {
      setIsLoading(false);
    }
  };

  const flatChapters = React.useMemo(() => {
    if (!course?.modules) return [];
    return [...course.modules]
      .sort((a, b) => (a.order || 0) - (b.order || 0))
      .flatMap((m: any) => [...(m.chapters || [])].sort((a, b) => (a.order || 0) - (b.order || 0)));
  }, [course]);

  const completedCount = progress.filter(p => p.isCompleted).length;
  const totalChapters = flatChapters.length;
  const progressPct = totalChapters > 0 ? Math.round((completedCount / totalChapters) * 100) : 0;
  const remainingCount = totalChapters - completedCount;

  const currentMilestone = (() => {
    if (progressPct === 100) return { emoji: "🏆", label: "Champion" };
    if (progressPct >= 50) return { emoji: "⚡", label: "Halfway Hero" };
    if (completedCount >= 1) return { emoji: "🚀", label: "First Step" };
    return null;
  })();

  const isChapterUnlocked = (chapterId: string) => {
    const index = flatChapters.findIndex(c => c.id === chapterId);
    if (index <= 0) return true;
    return progress.some(p => p.chapterId === flatChapters[index - 1].id && p.isCompleted);
  };
  const isChapterCompleted = (chapterId: string) => progress.some(p => p.chapterId === chapterId && p.isCompleted);

  const getModuleProgress = (module: any) => {
    const chs = module.chapters || [];
    const done = chs.filter((c: any) => isChapterCompleted(c.id)).length;
    return { done, total: chs.length };
  };

  const handleMarkComplete = async (score?: number, answers?: number[]) => {
    if (!activeChapter) return;
    try {
      await apiClient.post(`/lms/${id}/chapters/${activeChapter.id}/complete`, { score, answers });

      const prevCompletedCount = progress.filter(p => p.isCompleted).length;
      const prevPct = totalChapters > 0 ? Math.round((prevCompletedCount / totalChapters) * 100) : 0;

      // Construct and sync newProgress state locally to avoid network delays / race conditions for module checks
      const wasCompleted = progress.some(p => p.chapterId === activeChapter.id && p.isCompleted);
      const newProgress = wasCompleted
        ? [...progress]
        : [
            ...progress.filter(p => p.chapterId !== activeChapter.id),
            { chapterId: activeChapter.id, isCompleted: true, score: score !== undefined ? score : null, answers: answers || null }
          ];
      setProgress(newProgress);

      const newCompletedCount = newProgress.filter(p => p.isCompleted).length;
      const newPct = totalChapters > 0 ? Math.round((newCompletedCount / totalChapters) * 100) : 0;

      if (newPct >= 25 && prevPct < 25) {
        toast.success("🎉 Milestone Reached: 25% of the course completed! Keep it up!", { icon: "🚀", duration: 5000 });
      } else if (newPct >= 50 && prevPct < 50) {
        toast.success("🌟 Milestone Reached: Halfway there! 50% completed!", { icon: "💪", duration: 5000 });
      } else if (newPct >= 75 && prevPct < 75) {
        toast.success("🏆 Milestone Reached: 75% completed! Almost at the finish line!", { icon: "✨", duration: 5000 });
      } else if (newPct >= 100 && prevPct < 100) {
        toast.success("🎓 Milestone Reached: 100% Complete! You've mastered this course!", { icon: "👑", duration: 6000 });
      } else {
        toast.success("Chapter completed!");
      }

      if (course?.modules) {
        for (const mod of course.modules) {
          const chs = mod.chapters || [];
          if (chs.length === 0) continue;
          const wasModComplete = chs.every((c: any) => progress.some(p => String(p.chapterId) === String(c.id) && p.isCompleted));
          const isModCompleteNow = chs.every((c: any) => newProgress.some(p => String(p.chapterId) === String(c.id) && p.isCompleted));
          if (isModCompleteNow && !wasModComplete) {
            toast.success(`👏 Module Completed: "${mod.title}"! Excellent job!`, { icon: "📚", duration: 5000 });
          }
        }
      }

      const currentIndex = flatChapters.findIndex(c => c.id === activeChapter.id);
      if (currentIndex >= 0 && currentIndex < flatChapters.length - 1) {
        const nextChapter = flatChapters[currentIndex + 1];
        setActiveChapter(nextChapter);
        if (nextChapter.moduleId) setExpandedModules(prev => ({ ...prev, [nextChapter.moduleId]: true }));
      } else {
        toast.success("🏆 Course Completed!", { icon: "🎉" });
      }
    } catch (error) {
      toast.error("Failed to update progress");
    }
  };

  const toggleModule = (moduleId: string) => setExpandedModules(prev => ({ ...prev, [moduleId]: !prev[moduleId] }));

  // ── Comments ────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (activeChapter?.id && token) {
      fetchComments(activeChapter.id);
    }
  }, [activeChapter?.id, token]);

  const fetchComments = async (chapterId: string) => {
    try {
      const res = await apiClient.get<any[]>(`/lms/chapters/${chapterId}/comments`);
      if (Array.isArray(res)) {
        const mapped = res.map((c: any) => ({
          ...c,
          timestamp: new Date(c.timestamp)
        }));
        setComments(mapped);
      }
    } catch (e) {
      console.warn("Failed to load comments");
    }
  };

  const postComment = async () => {
    if (!commentText.trim() || !activeChapter?.id) return;
    try {
      const res = await apiClient.post<any>(`/lms/chapters/${activeChapter.id}/comments`, {
        text: commentText.trim()
      });
      if (res) {
        const newComment: Comment = {
          ...res,
          timestamp: new Date(res.timestamp)
        };
        setComments(prev => [newComment, ...prev]);
        setCommentText("");
        setTimeout(() => commentsEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
      }
    } catch (e) {
      toast.error("Failed to post comment");
    }
  };

  const toggleLike = async (commentId: string) => {
    try {
      const res = await apiClient.post<any>(`/lms/comments/${commentId}/toggle-like`);
      if (res) {
        setComments(prev => prev.map(c =>
          c.id === commentId
            ? { ...c, likes: res.likes, liked: res.liked }
            : c
        ));
      }
    } catch (e) {
      toast.error("Failed to like comment");
    }
  };

  const chapterComments = comments.filter(c => c.chapterId === activeChapter?.id);

  const formatTime = (dateInput: Date | string) => {
    const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
    if (!date || isNaN(date.getTime())) return "just now";
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diff < 60) return "just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return date.toLocaleDateString("en-IN", { month: "short", day: "numeric" }) + " " + date.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" });
  };

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="h-[100dvh] flex flex-col items-center justify-center gap-4 bg-[#f5f0ff]">
        <div className="w-12 h-12 rounded-full border-4 border-violet-200 border-t-violet-600 animate-spin" />
        <p className="font-black text-slate-400 tracking-wider text-xs uppercase animate-pulse">Loading Course...</p>
      </div>
    );
  }

  if (!course) return null;

  const sortedModules = [...(course.modules || [])].sort((a: any, b: any) => (a.order || 0) - (b.order || 0));

  // Tab definitions
  const TABS: { id: TabId; label: string; icon: string }[] = [
    { id: "description", label: "Description", icon: "📄" },
    { id: "goodtoknow", label: "Good to Know", icon: "💡" },
    { id: "faq", label: "FAQ", icon: "❓" },
    { id: "expert", label: "Expert", icon: "👩‍⚕️" },
  ];

  return (
    <div className="flex flex-col h-[100dvh] bg-[#f5f0ff] overflow-hidden relative font-sans">
      {/* Background blurs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-200/25 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[350px] h-[350px] bg-indigo-200/20 blur-[80px] rounded-full pointer-events-none" />

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="h-14 shrink-0 bg-white/85 backdrop-blur-md border-b border-purple-100/60 px-4 md:px-6 flex items-center justify-between shadow-sm z-20 relative">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href="/dashboard/my-courses"
            className="p-2 -ml-2 rounded-xl hover:bg-violet-50 text-slate-400 hover:text-violet-600 transition-all flex items-center gap-1.5 text-xs font-bold shrink-0"
          >
            <ArrowLeft size={16} /> <span className="hidden sm:inline">Back</span>
          </Link>
          <div className="h-5 w-px bg-slate-200 hidden md:block" />
          <h1 className="font-extrabold text-slate-800 text-sm md:text-base line-clamp-1 hidden md:block">{course.title}</h1>
          {currentMilestone && (
            <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-purple-50 border border-purple-100 text-purple-700 uppercase tracking-wider hidden md:flex items-center gap-1 shrink-0">
              <span>{currentMilestone.emoji}</span>
              <span>{currentMilestone.label}</span>
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {/* Overall progress chip */}
          <div className="hidden sm:flex items-center gap-2 bg-violet-50 border border-violet-200/70 px-3 py-1.5 rounded-full">
            <div className="w-20 h-1.5 bg-violet-100 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-violet-500 to-purple-400 rounded-full transition-all duration-700" style={{ width: `${progressPct}%` }} />
            </div>
            <span className="text-[11px] font-black text-violet-700">{progressPct}%</span>
          </div>
          <span className="text-[11px] font-black text-white bg-gradient-to-r from-violet-500 to-purple-600 px-3 py-1.5 rounded-full shadow-sm max-w-[180px] truncate hidden sm:block">
            {activeChapter?.title || "—"}
          </span>
        </div>
      </header>

      {/* ── Main Layout ────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col md:flex-row p-3 md:p-4 gap-4 overflow-hidden relative z-10">

        {/* ── Main content ── */}
        <div
          className="flex-1 bg-white rounded-[22px] border border-purple-100/50 shadow-[0_4px_20px_rgba(147,51,234,0.05)] overflow-y-auto flex flex-col"
          style={scrollbarHide}
        >
          {activeChapter ? (
            <>
              {/* Video / Quiz area — Increased Height */}
              <div className={`w-full relative shrink-0 overflow-hidden ${activeChapter.type === "VIDEO"
                ? "bg-black"
                : "bg-gradient-to-b from-[#FDFDFF] via-[#F6F4FF] to-[#ECE9FF] border-b border-[#E1DAFF] flex flex-col"
                }`}
                style={{ height: activeChapter.type === "VIDEO" ? "clamp(340px, 65vh, 720px)" : "auto", minHeight: activeChapter.type !== "VIDEO" ? "60vh" : undefined }}
              >
                {activeChapter.type === "VIDEO" ? (
                  activeChapter.video ? (
                    <div className="w-full h-full">
                      {activeChapter.video.videoUrl.includes("youtu") ? (
                        <ReactPlayer
                          url={activeChapter.video.videoUrl}
                          controls width="100%" height="100%"
                          light={activeChapter.thumbnailUrl || true}
                          config={{ youtube: { playerVars: { origin: typeof window !== "undefined" ? window.location.origin : "" } } } as any}
                        />
                      ) : (
                        <VideoPlayer src={activeChapter.video.videoUrl} poster={activeChapter.thumbnailUrl || undefined} autoPlay />
                      )}
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-violet-50">
                      <div className="text-center"><div className="text-6xl mb-3">🎬</div><p className="text-slate-400 font-semibold text-sm">Video not found</p></div>
                    </div>
                  )
                ) : (
                  /* ── Quiz ── */
                  <div className="w-full flex flex-col flex-1 text-slate-850 p-6 md:p-10 relative overflow-hidden">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[300px] bg-[#7c4fb6]/5 blur-[80px] rounded-full pointer-events-none" />
                    {activeChapter.assessment?.questions?.length > 0 ? (
                      quizState.isCompleted ? (
                        /* SUCCESS */
                        <div className="flex-1 flex flex-col items-center justify-center text-center py-10 px-4 relative z-10 animate-in fade-in duration-350">
                          <div className="w-24 h-24 rounded-full bg-amber-100 border border-amber-250 flex items-center justify-center shadow-lg shadow-amber-500/10 mb-5 animate-bounce">
                            <Award size={48} className="text-amber-500" />
                          </div>
                          <h2 className="text-3xl font-black mb-2 text-slate-850">Quiz Complete! 🎉</h2>
                          <p className="text-slate-500 font-semibold mb-3">You scored</p>
                          <div className="flex items-end gap-2 mb-5">
                            <span className="text-6xl font-black text-slate-850 leading-none">{quizState.score}</span>
                            <span className="text-2xl font-black text-slate-400 mb-1">/ {activeChapter.assessment.questions.length}</span>
                          </div>
                          <div className={`mb-7 px-4 py-1.5 rounded-full font-bold text-sm border ${quizState.score === activeChapter.assessment.questions.length ? "bg-yellow-500/20 border-yellow-400/40 text-yellow-800" : quizState.score >= activeChapter.assessment.questions.length / 2 ? "bg-green-500/10 border-green-400/30 text-green-700" : "bg-red-500/10 border-red-400/30 text-red-700"}`}>
                            {quizState.score === activeChapter.assessment.questions.length ? "⭐ Perfect Score!" : quizState.score >= activeChapter.assessment.questions.length / 2 ? "✓ Well Done!" : "📚 Keep Practicing"}
                          </div>

                          <div className="flex flex-col sm:flex-row gap-3">
                            {!isChapterCompleted(activeChapter.id) ? (
                              <button
                                onClick={() => handleMarkComplete(quizState.score, quizState.answers)}
                                className="px-7 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white rounded-2xl font-black shadow-[0_4px_15px_rgba(16,185,129,0.2)] hover:shadow-[0_4px_20px_rgba(16,185,129,0.3)] transition-all flex items-center gap-2 hover:-translate-y-0.5 cursor-pointer"
                              >
                                <CheckCircle2 size={17} /> Complete & Continue
                              </button>
                            ) : (
                              <button
                                onClick={() => {
                                  const currentIndex = flatChapters.findIndex(c => c.id === activeChapter.id);
                                  if (currentIndex >= 0 && currentIndex < flatChapters.length - 1) {
                                    const nextChapter = flatChapters[currentIndex + 1];
                                    setActiveChapter(nextChapter);
                                    if (nextChapter.moduleId) setExpandedModules(prev => ({ ...prev, [nextChapter.moduleId]: true }));
                                  }
                                }}
                                className="px-7 py-3 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white rounded-2xl font-black shadow-[0_4px_15px_rgba(109,40,217,0.3)] transition-all flex items-center gap-2 hover:-translate-y-0.5 cursor-pointer"
                              >
                                Next Chapter →
                              </button>
                            )}
                            <button
                              onClick={() => setQuizState(prev => ({
                                ...prev,
                                isCompleted: false,
                                isReviewMode: true,
                                currentQuestionIndex: 0,
                                selectedOptionIndex: prev.answers[0] ?? -1,
                                isSubmitted: true
                              }))}
                              className="px-7 py-3 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 rounded-2xl font-black transition-all flex items-center gap-2 hover:-translate-y-0.5 cursor-pointer"
                            >
                              <FileText size={17} /> Review Answers
                            </button>
                            <button
                              onClick={() => setQuizState({
                                currentQuestionIndex: 0,
                                selectedOptionIndex: -1,
                                isSubmitted: false,
                                score: 0,
                                isCompleted: false,
                                answers: [],
                                isReviewMode: false,
                              })}
                              className="px-5 py-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 rounded-2xl font-bold text-xs transition-all flex items-center gap-1.5 hover:-translate-y-0.5 cursor-pointer"
                            >
                              ↺ Retake Quiz
                            </button>
                          </div>
                        </div>
                      ) : (
                        /* ACTIVE QUIZ */
                        <div className="max-w-2xl mx-auto w-full flex flex-col flex-1 relative z-10 animate-in fade-in duration-200">
                          <div className="flex justify-between items-center mb-6">
                            <div><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Question</span><span className="text-2xl font-black text-slate-850 block">{quizState.currentQuestionIndex + 1}<span className="text-slate-400 text-lg"> / {activeChapter.assessment.questions.length}</span></span></div>
                            <div className="flex gap-1.5">{activeChapter.assessment.questions.map((_: any, idx: number) => (<div key={idx} className={`rounded-full transition-all ${idx === quizState.currentQuestionIndex ? "w-5 h-2.5 bg-primary shadow-[0_0_8px_rgba(147,51,234,0.2)]" : idx < quizState.currentQuestionIndex ? "w-2.5 h-2.5 bg-emerald-500" : "w-2.5 h-2.5 bg-slate-200"}`} />))}</div>
                          </div>
                          <div className="w-full h-1.5 bg-slate-100 rounded-full mb-6 overflow-hidden"><div className="h-full bg-gradient-to-r from-primary to-[#B29DFF] rounded-full transition-all" style={{ width: `${(quizState.currentQuestionIndex / activeChapter.assessment.questions.length) * 100}%` }} /></div>
                          <h3 className="text-xl md:text-2xl font-extrabold leading-tight mb-6 text-slate-800">{activeChapter.assessment.questions[quizState.currentQuestionIndex]?.question}</h3>
                          <div className="space-y-3.5 flex-1">
                            {activeChapter.assessment.questions[quizState.currentQuestionIndex]?.options?.map((opt: string, idx: number) => {
                              const isCorrect = Number(idx) === Number(activeChapter.assessment.questions[quizState.currentQuestionIndex]?.correctAnswerIndex);
                              const isSelected = idx === quizState.selectedOptionIndex;
                              
                              let btnClass = "w-full text-left p-4 sm:p-5 rounded-2xl border transition-all font-semibold text-sm sm:text-base flex items-center gap-4 group hover:-translate-y-0.5 duration-200 cursor-pointer ";
                              if (!quizState.isSubmitted) {
                                btnClass += isSelected 
                                  ? "border-[#B29DFF] bg-[#F3F0FF] text-[#4a1e7f] shadow-md shadow-[#B29DFF]/10 scale-[1.01]" 
                                  : "border-[#EBE6FF] bg-white hover:border-[#B29DFF] hover:bg-[#F7F5FF] text-slate-700 shadow-sm";
                              } else {
                                if (isCorrect) {
                                  btnClass += "border-emerald-500 bg-emerald-50/70 text-emerald-950 shadow-sm";
                                } else if (isSelected) {
                                  btnClass += "border-rose-400 bg-rose-50/75 text-rose-955";
                                } else {
                                  btnClass += "border-slate-100 bg-white/40 text-slate-400 opacity-40";
                                }
                              }

                              return (
                                <button key={idx} disabled={quizState.isSubmitted} onClick={() => setQuizState({ ...quizState, selectedOptionIndex: idx })} className={btnClass}>
                                  <div className={`w-8 h-8 rounded-xl border flex items-center justify-center shrink-0 font-extrabold text-xs transition-all ${
                                    quizState.isSubmitted && isCorrect 
                                      ? "border-emerald-500 bg-emerald-500 text-white" 
                                      : quizState.isSubmitted && isSelected && !isCorrect 
                                        ? "border-rose-500 bg-rose-500 text-white" 
                                        : isSelected 
                                          ? "border-primary bg-primary text-white" 
                                          : "border-slate-200 bg-slate-50 text-slate-500 group-hover:border-[#B29DFF] group-hover:bg-[#F3F0FF] group-hover:text-[#7c4fb6]"
                                  }`}>
                                    {quizState.isSubmitted && isCorrect ? <CheckCircle2 size={13} className="text-white" /> : quizState.isSubmitted && isSelected && !isCorrect ? <span className="text-white">✕</span> : <span className="text-inherit">{String.fromCharCode(65 + idx)}</span>}
                                  </div>
                                  <span className="flex-1 leading-snug">{opt}</span>
                                </button>
                              );
                            })}
                          </div>
                          {quizState.isSubmitted && activeChapter.assessment.questions[quizState.currentQuestionIndex]?.explanation && (
                            <div className="mt-5 p-5 rounded-2xl bg-amber-50/50 border border-amber-150/60 shadow-sm animate-in slide-in-from-top-2 duration-300">
                              <h4 className="font-extrabold text-amber-850 mb-1.5 flex items-center gap-2">
                                <span className="text-amber-500">💡</span> Explanation
                              </h4>
                              <p className="text-slate-655 text-xs sm:text-sm leading-relaxed">
                                {activeChapter.assessment.questions[quizState.currentQuestionIndex].explanation}
                              </p>
                            </div>
                          )}
                          <div className="mt-7 pt-5 border-t border-slate-200/60 flex justify-between items-center">
                            <span className={`text-sm font-bold px-3 py-1.5 rounded-lg transition-all ${quizState.isSubmitted && Number(quizState.selectedOptionIndex) === Number(activeChapter.assessment.questions[quizState.currentQuestionIndex]?.correctAnswerIndex) ? "text-emerald-700 bg-emerald-50/80 border border-emerald-100" : "opacity-0"}`}>✓ Correct!</span>
                            {!quizState.isSubmitted ? (
                              <button
                                disabled={quizState.selectedOptionIndex === -1}
                                onClick={() => {
                                  const correct = Number(quizState.selectedOptionIndex) === Number(activeChapter.assessment.questions[quizState.currentQuestionIndex]?.correctAnswerIndex);
                                  setQuizState(prev => ({
                                    ...prev,
                                    isSubmitted: true,
                                    score: correct ? prev.score + 1 : prev.score,
                                    answers: [...prev.answers, prev.selectedOptionIndex],
                                  }));
                                }}
                                className="px-7 py-3 bg-gradient-to-r from-primary to-purple-500 text-white rounded-2xl font-black shadow-[0_8px_20px_-6px_rgba(147,51,234,0.5)] hover:-translate-y-0.5 transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:transform-none cursor-pointer"
                              >
                                Submit Answer
                              </button>
                            ) : (
                              <button
                                onClick={() => {
                                  const next = quizState.currentQuestionIndex + 1;
                                  if (next < activeChapter.assessment.questions.length) {
                                    setQuizState(prev => ({
                                      ...prev,
                                      currentQuestionIndex: next,
                                      selectedOptionIndex: prev.isReviewMode ? prev.answers[next] : -1,
                                      isSubmitted: prev.isReviewMode,
                                    }));
                                  } else {
                                    // Finished quiz: auto-complete and save progress
                                    if (!quizState.isReviewMode) {
                                      handleMarkComplete(quizState.score, quizState.answers);
                                    }
                                    setQuizState(prev => ({ ...prev, isCompleted: true, isReviewMode: false }));
                                  }
                                }}
                                className="px-7 py-3 bg-slate-900 text-white hover:bg-slate-800 rounded-2xl font-black shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer"
                              >
                                {quizState.currentQuestionIndex + 1 < activeChapter.assessment.questions.length ? "Next →" : quizState.isReviewMode ? "Finish Review" : "Finish Quiz 🎉"}
                              </button>
                            )}
                          </div>
                        </div>
                      )
                    ) : (
                      <div className="flex-1 flex items-center justify-center"><div className="p-6 rounded-2xl bg-slate-50 border border-slate-150 text-center"><FileText size={40} className="mb-3 opacity-30 mx-auto text-slate-400" /><p className="text-slate-400 text-sm">No questions added yet.</p></div></div>
                    )}
                  </div>
                )}
              </div>

              {/* ══ Below-Video Info Block ══════════════════════════════════════ */}
              <div className="px-5 md:px-7 pt-5 pb-4 border-b border-slate-100">

                {/* Row 1: Chapter title */}
                <h2 className="font-extrabold text-slate-800 text-[18px] leading-snug mb-3">
                  {activeChapter.title}
                </h2>

                {/* Row 2: Action icons — like · dislike · bookmark · share · mark complete */}
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Like / count — per-chapter */}
                  {activeChapter.type === "VIDEO" && (
                    <>
                      <button
                        onClick={() => handleVideoLike(activeChapter.id)}
                        className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[12px] font-bold border transition-all ${activeChapterLikes.liked
                            ? "bg-violet-600 border-violet-600 text-white shadow-[0_4px_12px_rgba(109,40,217,0.3)]"
                            : "bg-white border-slate-200 text-slate-600 hover:border-violet-300 hover:text-violet-600"
                          }`}
                      >
                        <ThumbsUp size={13} className={activeChapterLikes.liked ? "fill-white" : ""} />
                        <span>{activeChapterLikes.count}</span>
                      </button>
                      <button
                        onClick={handleVideoShare}
                        className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[12px] font-bold border transition-all ${shareCopied
                            ? "bg-emerald-50 border-emerald-300 text-emerald-600"
                            : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                          }`}
                      >
                        <Share2 size={13} />
                        <span>{shareCopied ? "Copied!" : "Share"}</span>
                      </button>
                    </>
                  )}

                  {/* Mark complete button */}
                  {activeChapter.type === "ASSESSMENT" ? (
                    isChapterCompleted(activeChapter.id) ? (
                      <div className="ml-auto flex items-center gap-2 px-5 py-2 rounded-full text-[12px] font-extrabold bg-emerald-50 border border-emerald-200 text-emerald-700 cursor-default">
                        <CheckCircle2 size={13} />
                        <span>✓ Quiz Completed (Score: {quizState.score}/{activeChapter.assessment?.questions?.length || 0})</span>
                      </div>
                    ) : quizState.isCompleted ? (
                      <button
                        onClick={() => handleMarkComplete(quizState.score, quizState.answers)}
                        className="ml-auto flex items-center gap-2 px-5 py-2 rounded-full text-[12px] font-extrabold transition-all border bg-gradient-to-r from-emerald-500 to-green-600 border-transparent text-white shadow-sm hover:from-emerald-600 hover:to-green-700 active:scale-95 cursor-pointer"
                      >
                        <CheckCircle2 size={13} className="animate-pulse" />
                        <span>Complete & Save Quiz</span>
                      </button>
                    ) : (
                      <div
                        title="You must answer all quiz questions above before marking this chapter as complete."
                        className="ml-auto flex items-center gap-2 px-4 py-2 rounded-full text-[12px] font-bold bg-slate-100 border border-slate-200 text-slate-400 cursor-not-allowed select-none"
                      >
                        <Lock size={13} />
                        <span>Complete Quiz to Finish</span>
                      </div>
                    )
                  ) : (
                    <button
                      onClick={() => handleMarkComplete()}
                      disabled={isChapterCompleted(activeChapter.id)}
                      className={`ml-auto flex items-center gap-2 px-5 py-2 rounded-full text-[12px] font-extrabold transition-all border ${isChapterCompleted(activeChapter.id)
                          ? "bg-emerald-50 border-emerald-200 text-emerald-700 cursor-default"
                          : "bg-gradient-to-r from-violet-500 to-purple-600 border-transparent text-white shadow-sm hover:from-violet-600 hover:to-purple-700 active:scale-95"
                        }`}
                    >
                      <CheckCircle2 size={13} className={!isChapterCompleted(activeChapter.id) ? "animate-pulse" : ""} />
                      {isChapterCompleted(activeChapter.id) ? "✓ Completed" : "Mark Complete"}
                    </button>
                  )}
                </div>
              </div>

              {/* ══ Instructor and Lesson Info Section ═════════════════════════ */}
              {(() => {
                const expert = {
                  name: "Dr. Isha Kapoor",
                  designation: "Gynaecologist & Adolescent Health Expert",
                  experience: "Course mentor · Lead Expert",
                  avatarUrl: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=256&q=80",
                  bio: activeChapter.description || "In this lesson, you'll learn about key aspects of adolescent health and menstrual wellness. We cover hormonal changes, cycle regularity, nutrition, and strategies for overall wellbeing.",
                };
                const count = activeChapterLikes.count;

                // Format a readable date from activeChapter or course
                const getFormattedDate = () => {
                  const rawDate = activeChapter.createdAt || course.createdAt;
                  if (!rawDate) return "Aug 13, 2026";
                  try {
                    const d = new Date(rawDate);
                    if (isNaN(d.getTime())) return "Aug 13, 2026";
                    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
                  } catch {
                    return "Aug 13, 2026";
                  }
                };

                return (
                  <div className="mx-5 md:mx-7 mt-4 flex flex-col md:flex-row gap-4 items-stretch">
                    {/* Left: Expert Card (Simple & Premium) */}
                    <div className="flex-1 md:max-w-[260px] border border-violet-100 bg-gradient-to-br from-violet-50/50 to-purple-50/30 rounded-2xl p-4 shadow-[0_2px_12px_rgba(109,40,217,0.02)] flex items-center gap-3.5">
                      <div className="relative shrink-0">
                        <img
                          src={expert.avatarUrl}
                          alt={expert.name}
                          className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                          onError={(e) => {
                            const el = e.target as HTMLImageElement;
                            el.style.display = "none";
                            const fallback = el.nextElementSibling as HTMLElement;
                            if (fallback) fallback.style.display = "flex";
                          }}
                        />
                        <div className="hidden w-12 h-12 rounded-full bg-gradient-to-br from-violet-400 to-purple-600 items-center justify-center text-white font-black text-lg border-2 border-white">
                          {expert.name?.charAt(0) ?? "D"}
                        </div>
                        <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center shadow-xs">
                          <span className="text-[7px] text-white font-black">✓</span>
                        </span>
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-extrabold text-slate-800 text-[13px] leading-tight truncate">{expert.name}</h4>
                        <p className="text-[10px] font-semibold text-slate-400 mt-0.5 truncate">{expert.experience}</p>
                      </div>
                    </div>

                    {/* Right: Lesson Info & Stats */}
                    <div className="flex-[2] border border-slate-100 bg-[#FAF9FF]/40 rounded-2xl p-4 shadow-[0_2px_12px_rgba(0,0,0,0.01)] flex flex-col justify-between">
                      <div>
                        {/* Stats header */}
                        <div className="flex items-center gap-3.5 mb-2.5 flex-wrap border-b border-slate-100 pb-2">
                          <span className="inline-flex items-center gap-1.5 bg-rose-50 border border-rose-100 text-rose-600 px-3 py-1 rounded-full text-[11px] font-bold shadow-xs">
                            <ThumbsUp size={11} className="fill-rose-500/10 text-rose-500" />
                            <span>{count} likes</span>
                          </span>
                          <span className="inline-flex items-center gap-1.5 bg-violet-50 border border-violet-100 text-violet-600 px-3 py-1 rounded-full text-[11px] font-bold shadow-xs">
                            <Calendar size={11} className="text-violet-500" />
                            <span>{getFormattedDate()}</span>
                          </span>
                        </div>
                        {/* Bio / Description */}
                        <p className="text-[12px] text-slate-600 leading-relaxed font-semibold">
                          {expert.bio}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* ══ Tab Row ══════════════════════════════════════════════════════ */}
              <div className="px-5 md:px-7 pt-5">
                <div className="flex items-center gap-2 overflow-x-auto border-b border-slate-100 pb-2" style={scrollbarHide}>
                  {TABS.map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as TabId)}
                      className={`flex items-center gap-1.5 px-4 py-2 text-[12px] font-extrabold whitespace-nowrap transition-all rounded-xl border ${activeTab === tab.id
                          ? "bg-violet-600 border-violet-600 text-white shadow-[0_2px_8px_rgba(109,40,217,0.25)]"
                          : "bg-white border-slate-200 text-slate-500 hover:text-slate-700 hover:border-slate-300"
                        }`}
                    >
                      <span>{tab.icon}</span>
                      <span>{tab.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* ══ Tab Content ══════════════════════════════════════════════════ */}
              <div className="px-5 md:px-7 py-5">
                {activeTab === "description" && (
                  <div>
                    {activeChapter.description ? (
                      <p className="text-slate-600 leading-relaxed text-sm font-medium">{activeChapter.description}</p>
                    ) : (
                      <p className="text-slate-400 text-sm font-medium italic">No description available for this chapter.</p>
                    )}
                  </div>
                )}

                {activeTab === "goodtoknow" && (() => {
                  const points: string[] = activeChapter.goodToKnowPoints?.length > 0
                    ? activeChapter.goodToKnowPoints
                    : [
                      "Hormonal changes during adolescence are completely normal and vary for every individual.",
                      "It typically takes 2–5 years for the menstrual cycle to become regular after the first period.",
                      "Physical activity and a balanced diet significantly support hormonal health.",
                      "Open conversations with a trusted adult can greatly ease the transition through puberty.",
                      "Emotional mood swings are linked to fluctuating estrogen and progesterone levels.",
                    ];
                  return (
                    <div className="space-y-2.5">
                      {points.map((point: string, idx: number) => (
                        <div key={idx} className="flex items-start gap-3 p-3.5 bg-emerald-50/70 rounded-2xl border border-emerald-100">
                          <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-white shrink-0 mt-0.5 shadow-sm">
                            <CheckCircle2 size={11} />
                          </div>
                          <p className="text-slate-700 text-sm font-semibold leading-snug">{point}</p>
                        </div>
                      ))}
                    </div>
                  );
                })()}

                {activeTab === "faq" && (() => {
                  const faqs: { question: string; answer: string }[] = activeChapter.faqs?.length > 0
                    ? activeChapter.faqs
                    : [
                      { question: "Is it normal to feel bloated before my period?", answer: "Yes, bloating is very common and is caused by hormonal changes that lead to water retention. Staying hydrated and reducing salt intake can help." },
                      { question: "Can stress affect my menstrual cycle?", answer: "Absolutely. High stress levels can disrupt the hormonal balance and cause your period to be late, irregular, or even temporarily absent." },
                      { question: "When should I see a doctor about period pain?", answer: "Mild cramps are normal, but if pain is severe enough to disrupt daily activities or doesn't respond to over-the-counter medication, consult a gynaecologist." },
                      { question: "What foods help with PMS symptoms?", answer: "Foods rich in magnesium (like dark chocolate and leafy greens), omega-3 fatty acids, and complex carbohydrates can help ease PMS symptoms." },
                    ];
                  return (
                    <div className="space-y-2.5">
                      {faqs.map((faq: any, idx: number) => (
                        <div key={idx} className="rounded-2xl bg-violet-50/70 border border-violet-100 overflow-hidden">
                          <div className="px-4 py-3 flex items-start gap-2">
                            <span className="text-[11px] font-black text-violet-600 bg-violet-100 rounded-full px-2 py-0.5 shrink-0 mt-0.5">Q{idx + 1}</span>
                            <p className="font-bold text-slate-800 text-sm">{faq.question}</p>
                          </div>
                          <div className="px-4 py-3 bg-white/70 border-t border-violet-100">
                            <p className="text-slate-500 text-sm leading-relaxed">{faq.answer}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}

                {activeTab === "expert" && (() => {
                  const expert = {
                    name: "Dr. Isha Kapoor",
                    designation: "Gynaecologist & Adolescent Health Expert",
                    experience: "12+ Years Experience",
                    avatarUrl: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=256&q=80",
                    bio: "Dr. Isha Kapoor is a leading gynaecologist specialising in adolescent health, menstrual wellness, and reproductive medicine. She has guided thousands of young women through understanding their bodies.",
                    specializations: ["Adolescent Health", "Menstrual Wellness", "PCOS", "Reproductive Medicine"],
                  };
                  return (
                    <div className="bg-emerald-50/40 border border-emerald-100 rounded-2xl p-5">
                      <div className="flex items-center gap-4 mb-4">
                        <img
                          src={expert.avatarUrl}
                          alt={expert.name}
                          className="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-200 shadow-sm"
                          onError={(e) => {
                            const el = e.target as HTMLImageElement;
                            el.style.display = "none";
                            const fallback = el.nextElementSibling as HTMLElement;
                            if (fallback) fallback.style.display = "flex";
                          }}
                        />
                        <div className="hidden w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 items-center justify-center text-white font-black text-xl border-2 border-emerald-200">
                          {expert.name?.charAt(0) ?? "D"}
                        </div>
                        <div>
                          <h3 className="font-extrabold text-slate-800 text-base">{expert.name}</h3>
                          <p className="text-[13px] text-emerald-700 font-bold">{expert.designation}</p>
                          <p className="text-[12px] text-slate-400 font-semibold">{expert.experience}</p>
                        </div>
                      </div>
                      <p className="text-slate-600 text-sm leading-relaxed font-medium border-t border-emerald-100/50 pt-3">
                        {expert.bio}
                      </p>
                      {expert.specializations?.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {expert.specializations.map((s: string, i: number) => (
                            <span key={i} className="px-2.5 py-1 bg-white border border-emerald-100 text-emerald-700 text-[11px] font-bold rounded-full shadow-xs">{s}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>

              {/* ══ Comments ═════════════════════════════════════════════════════ */}
              <div className="px-5 md:px-7 pb-7">
                <div className="border-t border-slate-100 pt-5">
                  <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-2 mb-4">
                    <MessageCircle size={15} className="text-violet-500" />
                    Discussion
                    {chapterComments.length > 0 && (
                      <span className="text-[11px] font-black text-violet-600 bg-violet-50 border border-violet-200 px-2 py-0.5 rounded-full">{chapterComments.length}</span>
                    )}
                  </h3>

                  {/* Input row */}
                  <div className="flex gap-3 mb-5">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-xs font-black shrink-0">
                      {((user as any)?.profile?.displayName || (user as any)?.username || "U").slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 relative">
                      <textarea
                        value={commentText}
                        onChange={e => setCommentText(e.target.value)}
                        onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); postComment(); } }}
                        placeholder="Share your thoughts on this chapter..."
                        rows={2}
                        className="w-full px-4 py-2.5 pr-20 text-sm font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-2xl resize-none focus:outline-none focus:border-violet-400 focus:ring-1 focus:ring-violet-200 transition-all placeholder:text-slate-400"
                      />
                      <button
                        onClick={postComment}
                        disabled={!commentText.trim()}
                        className="absolute bottom-2.5 right-2.5 px-3 py-1.5 bg-violet-600 hover:bg-violet-700 disabled:opacity-40 text-white rounded-xl font-bold text-[11px] transition-all active:scale-95 flex items-center gap-1 shrink-0"
                      >
                        <Send size={11} /> Post
                      </button>
                    </div>
                  </div>

                  {/* Comment list */}
                  {chapterComments.length > 0 ? (
                    <div className="space-y-4">
                      {chapterComments.map(comment => (
                        <div key={comment.id} className="flex gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-400 to-slate-600 flex items-center justify-center text-white text-[11px] font-black shrink-0">
                            {comment.authorInitials}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-[13px] font-extrabold text-slate-800">@{comment.authorName.replace(/\s/g, "").toLowerCase()}</span>
                              <span className="text-[11px] font-medium text-slate-400">{formatTime(comment.timestamp)}</span>
                            </div>
                            <p className="text-sm text-slate-600 font-medium leading-relaxed">{comment.text}</p>
                            <div className="flex items-center gap-3 mt-1.5">
                              <button
                                onClick={() => toggleLike(comment.id)}
                                className={`flex items-center gap-1 text-[11px] font-bold transition-colors ${comment.liked ? "text-violet-600" : "text-slate-400 hover:text-violet-500"}`}
                              >
                                <ThumbsUp size={11} /> {comment.likes > 0 && comment.likes}
                              </button>
                              <span className="text-[11px] font-bold text-slate-400 cursor-pointer hover:text-slate-600 transition-colors">Reply</span>
                            </div>
                          </div>
                        </div>
                      ))}
                      <div ref={commentsEndRef} />
                    </div>
                  ) : (
                    <div className="text-center py-10 bg-slate-50 rounded-2xl border border-slate-100">
                      <MessageCircle size={28} className="mx-auto mb-2 text-slate-300" />
                      <p className="text-sm font-semibold text-slate-400">No comments yet. Be the first!</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-400 flex-col gap-4">
              <PlayCircle size={48} className="opacity-20" />
              <p className="text-sm font-semibold">Select a chapter from the sidebar to begin.</p>
            </div>
          )}
        </div>

        {/* ── Sidebar ──────────────────────────────────────────────────────── */}
        <div className="w-full md:w-80 lg:w-96 bg-white rounded-[22px] border border-purple-100/50 shadow-[0_4px_20px_rgba(147,51,234,0.05)] overflow-hidden flex flex-col z-10 shrink-0">

          {/* Sidebar header with beautiful progress card */}
          <div className="p-5 border-b border-slate-100 bg-gradient-to-b from-violet-50/60 to-white shrink-0">
            <Link href={`/dashboard/courses/${id}/overview`} className="text-violet-500 hover:text-violet-700 mb-3 inline-flex items-center gap-1 text-xs font-bold transition-all hover:-translate-x-0.5">
              <ArrowLeft size={13} /> Back to Overview
            </Link>
            <h3 className="font-extrabold text-slate-800 text-[15px] leading-snug line-clamp-2 mb-4">{course.title}</h3>

            {/* Premium Progress Card */}
            {(() => {
              const getMilestoneLabel = () => {
                if (progressPct >= 100) return { label: "👑 Course Mastered", color: "bg-amber-50 text-amber-700 border-amber-200" };
                if (progressPct >= 75) return { label: "✨ Course Champion", color: "bg-indigo-50 text-indigo-700 border-indigo-200" };
                if (progressPct >= 50) return { label: "💪 Course Achiever", color: "bg-emerald-50 text-emerald-700 border-emerald-200" };
                if (progressPct >= 25) return { label: "🚀 Course Explorer", color: "bg-blue-50 text-blue-700 border-blue-200" };
                return { label: "🌱 Course Beginner", color: "bg-slate-50 text-slate-600 border-slate-200" };
              };
              const milestone = getMilestoneLabel();
              return (
                <div className="bg-[#FAF5FF] border border-purple-200/50 rounded-2xl p-4 shadow-[0_2px_12px_rgba(147,51,234,0.03)]">
                  {/* Milestone Badge Row */}
                  <div className="flex items-center justify-between mb-3 border-b border-purple-100/30 pb-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Milestone</span>
                    <span className={`text-[9px] font-black px-2.5 py-1 rounded-full border uppercase tracking-wider ${milestone.color}`}>
                      {milestone.label}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-black text-violet-700 bg-violet-100/80 px-2.5 py-1 rounded-full uppercase tracking-wider">{progressPct}% Complete</span>
                    <span className="text-[12px] font-black text-slate-600">{completedCount}/{totalChapters} Lessons</span>
                  </div>
                  <div className="h-2.5 bg-purple-100 rounded-full overflow-hidden relative">
                    <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-violet-500 to-purple-400 rounded-full transition-all duration-700 shadow-[0_0_8px_rgba(139,92,246,0.4)]" style={{ width: `${progressPct}%` }} />
                  </div>
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 mt-2.5">
                    <span className="flex items-center gap-1.5"><CheckCircle2 size={12} className="text-emerald-500" /> {completedCount} Completed</span>
                    <span className="flex items-center gap-1.5 text-violet-500"><Clock size={12} /> {remainingCount} Remaining</span>
                  </div>
                </div>
              );
            })()}

          </div>

          {/* Module List — Styled exactly as the reference Dribbble image (clean cards with shadow and margins) */}
          <div className="flex-1 overflow-y-auto p-4 bg-[#f8f6fc] space-y-3.5" style={scrollbarHide}>
            {sortedModules.map((module: any, modIdx: number) => {
              const { done, total } = getModuleProgress(module);
              const allDone = done === total && total > 0;
              const inProgress = done > 0 && !allDone;
              const isOpen = !!expandedModules[module.id];
              const sortedChapters = [...(module.chapters || [])].sort((a: any, b: any) => (a.order || 0) - (b.order || 0));

              return (
                <div
                  key={module.id}
                  className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] overflow-hidden transition-all duration-200"
                >
                  {/* Module header card */}
                  <button
                    onClick={() => toggleModule(module.id)}
                    className={`w-full p-4 flex items-center justify-between text-left transition-colors ${isOpen ? "bg-slate-50/50" : "hover:bg-slate-50/20"}`}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {/* Left side: Circular percentage/status indicator inspired by the picture */}
                      <div className="shrink-0">
                        {allDone ? (
                          <div className="w-8 h-8 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center">
                            <CheckCircle2 size={16} />
                          </div>
                        ) : inProgress ? (
                          <div className="w-8 h-8 rounded-full border-2 border-violet-500 text-violet-600 bg-violet-50/50 flex items-center justify-center text-[10px] font-black">
                            {Math.round((done / total) * 100)}%
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-slate-50 border border-slate-200 text-slate-400 flex items-center justify-center text-xs font-bold">
                            {modIdx + 1}
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className="font-extrabold text-slate-700 text-[13px] leading-snug truncate">
                          {module.title}
                        </h4>
                        <p className="text-[10px] font-bold text-slate-400 mt-0.5">
                          {done}/{total} Lessons Completed
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 ml-2">
                      {module.timeDuration && (
                        <span className="text-[11px] font-bold text-slate-400 whitespace-nowrap">
                          {module.timeDuration} min
                        </span>
                      )}
                      <div className={`transition-transform duration-200 text-slate-400 ${isOpen ? "rotate-180" : ""}`}>
                        <ChevronDown size={14} />
                      </div>
                    </div>
                  </button>

                  {/* Chapter items inside active module container */}
                  {isOpen && (
                    <div className="bg-slate-50/40 pb-3 pl-8 pr-3 border-t border-slate-100/50 space-y-1.5 pt-2">
                      {sortedChapters.map((chapter: any, cIdx: number) => {
                        const isActive = activeChapter?.id === chapter.id;
                        const isUnlocked = isChapterUnlocked(chapter.id);
                        const isCompleted = isChapterCompleted(chapter.id);

                        const chProg = chapter.type === "ASSESSMENT" ? progress.find((p) => p.chapterId === chapter.id) : null;
                        // Recalculate score from answers if score is null (fixes old data)
                        let effectiveScore: number | null = chProg?.score ?? null;
                        if (effectiveScore === null && chProg?.answers && chapter.assessment?.questions) {
                          effectiveScore = computeScoreFromAnswers(chapter.assessment.questions, chProg.answers);
                        }
                        const quizScore = chProg && effectiveScore !== null ? `${effectiveScore}/${chapter.assessment?.questions?.length || 0}` : null;

                        if (isActive) {
                          return (
                            <button
                              key={chapter.id}
                              onClick={() => { if (isUnlocked) setActiveChapter(chapter); }}
                              className="w-full p-3 flex items-center gap-3 text-left bg-violet-600 rounded-xl shadow-[0_4px_14px_rgba(109,40,217,0.35)] transition-all relative shrink-0"
                            >
                              {/* Vivid violet circle with play icon */}
                              <div className="shrink-0 w-6 h-6 rounded-full bg-white/20 border-2 border-white/40 flex items-center justify-center shadow-inner">
                                <svg className="w-3 h-3 fill-white translate-x-[0.5px]" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <p className="text-[12px] font-extrabold truncate text-white leading-snug">
                                    {chapter.title}
                                  </p>
                                  {quizScore && (
                                    <span className="text-[9px] font-black text-white bg-white/20 border border-white/30 px-1.5 py-0.5 rounded-md shrink-0">
                                      {quizScore}
                                    </span>
                                  )}
                                </div>
                                <span className="text-[9px] font-black text-violet-200 uppercase tracking-widest flex items-center gap-0.5 mt-0.5">
                                  <Play size={7} className="fill-violet-200" /> Now Playing
                                </span>
                              </div>
                              {chapter.video?.duration && (
                                <span className="text-[10px] font-bold text-violet-200 shrink-0 self-start mt-0.5">
                                  {Math.round(chapter.video.duration / 60)} min
                                </span>
                              )}
                            </button>
                          );
                        }

                        return (
                          <button
                            key={chapter.id}
                            onClick={() => { if (isUnlocked) setActiveChapter(chapter); }}
                            disabled={!isUnlocked}
                            className={`w-full p-3 flex items-center gap-3 text-left transition-all rounded-xl ${isUnlocked ? "hover:bg-slate-100/60 bg-white/50" : "opacity-40 cursor-not-allowed"}`}
                          >
                            <div className="shrink-0">
                              {isCompleted ? (
                                /* Bold green filled circle with white checkmark */
                                <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center shadow-[0_0_6px_rgba(16,185,129,0.4)]">
                                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M5 13l4 4L19 7" />
                                  </svg>
                                </div>
                              ) : !isUnlocked ? (
                                <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-300 flex items-center justify-center">
                                  <Lock size={10} />
                                </div>
                              ) : (
                                <div className="w-6 h-6 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center">
                                  {chapter.type === "VIDEO" ? <PlayCircle size={11} /> : <FileText size={11} />}
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="text-[12px] font-bold truncate text-slate-700 leading-snug">
                                  {chapter.title}
                                </p>
                                {quizScore && (
                                  <span className="text-[9px] font-black text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-md shrink-0">
                                    Score: {quizScore}
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] font-semibold text-slate-400 block mt-0.5">
                                {chapter.type === "VIDEO" ? "Video" : "Assessment"}
                              </span>
                            </div>
                            {chapter.video?.duration && (
                              <span className="text-[10px] font-medium text-slate-400 shrink-0 self-start mt-0.5">
                                {Math.round(chapter.video.duration / 60)} min
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Sidebar footer motivation */}
          <div className="p-3 border-t border-slate-100 shrink-0">
            <div className="p-3 rounded-2xl bg-gradient-to-r from-violet-50 to-purple-50 border border-violet-100 flex items-center gap-3">
              <span className="text-2xl shrink-0">🧘</span>
              <p className="text-[11px] font-bold text-purple-800 leading-snug">Practice a little every day for a healthier mind!</p>
            </div>
          </div>
        </div>
      </div>

      {showQuizIntroModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="relative w-full max-w-md bg-white border border-[#E1DAFF] rounded-[28px] p-6 shadow-2xl animate-in zoom-in-95 duration-350 flex flex-col items-center text-center overflow-hidden">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#7c4fb6]/5 rounded-full blur-xl pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-primary/5 rounded-full blur-xl pointer-events-none" />
            
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary via-[#7c4fb6] to-[#B29DFF] flex items-center justify-center text-white shadow-lg shadow-primary/20 mb-5">
              <BookOpen size={32} className="animate-pulse" />
            </div>

            <h3 className="text-xl font-extrabold text-slate-800 tracking-tight mb-2">Ready for a Challenge? 🧠</h3>
            <p className="text-slate-500 text-sm leading-relaxed mb-6">
              You are about to start the quiz for <span className="font-bold text-primary">"{activeChapter?.title}"</span>. Answer the questions to test your understanding and lock in your learnings!
            </p>

            <button
              onClick={() => setShowQuizIntroModal(false)}
              className="w-full py-3.5 bg-gradient-to-r from-primary to-[#7c4fb6] hover:from-primary-dark hover:to-[#6b3fa6] text-white rounded-2xl font-black shadow-lg shadow-primary/10 hover:shadow-primary/25 active:scale-[0.98] transition-all duration-200 cursor-pointer text-sm tracking-wide uppercase"
            >
              Start Attempt
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
