"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { ArrowLeft, PlayCircle, FileText, CheckCircle2, ChevronDown, Award, Info, HelpCircle, Lock } from "lucide-react";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { apiClient } from "@/lib/api-client";
import dynamic from "next/dynamic";
import { VideoPlayer } from "@/components/video/VideoPlayer";

const ReactPlayer = dynamic(() => import("react-player"), { ssr: false });

export default function CoursePlayerPage() {
  const { id } = useParams();
  const router = useRouter();
  const { token } = useAuthStore();
  const [course, setCourse] = useState<any>(null);
  const [activeChapter, setActiveChapter] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});
  const [progress, setProgress] = useState<any[]>([]);

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

  useEffect(() => {
    if (activeChapter) {
      const chapterProgress = progress.find(p => p.chapterId === activeChapter.id);
      if (chapterProgress?.isCompleted) {
        setQuizState({
          currentQuestionIndex: 0,
          selectedOptionIndex: -1,
          isSubmitted: false,
          score: chapterProgress.score || 0,
          isCompleted: true,
          answers: chapterProgress.answers || [],
          isReviewMode: false,
        });
      } else {
        setQuizState({
          currentQuestionIndex: 0,
          selectedOptionIndex: -1,
          isSubmitted: false,
          score: 0,
          isCompleted: false,
          answers: [],
          isReviewMode: false,
        });
      }
    }
  }, [activeChapter, progress]);

  useEffect(() => {
    if (token && id) {
      fetchCourseDetails();
    }
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
        const chapters = [];
        for (const module of modules) {
          if (module.chapters) {
            chapters.push(...[...module.chapters].sort((a, b) => (a.order || 0) - (b.order || 0)));
          }
        }

        let targetChapter = null;
        for (let i = 0; i < chapters.length; i++) {
          const ch = chapters[i];
          const isCompleted = userProgress.some((p: any) => p.chapterId === ch.id && p.isCompleted);
          if (!isCompleted) {
            targetChapter = ch;
            break;
          }
        }

        if (!targetChapter && chapters.length > 0) targetChapter = chapters[chapters.length - 1];

        if (targetChapter) {
          setActiveChapter(targetChapter);
          if (targetChapter.moduleId) {
            setExpandedModules({ [targetChapter.moduleId]: true });
          }
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
    if (!course || !course.modules) return [];
    const modules = [...course.modules].sort((a, b) => (a.order || 0) - (b.order || 0));
    const chapters = [];
    for (const module of modules) {
      if (!module.chapters) continue;
      const sortedChapters = [...module.chapters].sort((a, b) => (a.order || 0) - (b.order || 0));
      chapters.push(...sortedChapters);
    }
    return chapters;
  }, [course]);

  const isChapterUnlocked = (chapterId: string) => {
    const index = flatChapters.findIndex(c => c.id === chapterId);
    if (index <= 0) return true;
    const prevChapter = flatChapters[index - 1];
    return progress.some(p => p.chapterId === prevChapter.id && p.isCompleted);
  };

  const isChapterCompleted = (chapterId: string) => {
    return progress.some(p => p.chapterId === chapterId && p.isCompleted);
  };

  const handleMarkComplete = async (score?: number, answers?: number[]) => {
    if (!activeChapter) return;
    try {
      await apiClient.post(`/lms/${id}/chapters/${activeChapter.id}/complete`, { score, answers });
      toast.success("Chapter completed!");

      let newProgress = [...progress];
      try {
        const progRes = await apiClient.get<any>(`/lms/${id}/progress`);
        newProgress = progRes?.progress || [];
        setProgress(newProgress);
      } catch (e) { }

      const currentIndex = flatChapters.findIndex(c => c.id === activeChapter.id);
      if (currentIndex >= 0 && currentIndex < flatChapters.length - 1) {
        const nextChapter = flatChapters[currentIndex + 1];
        setActiveChapter(nextChapter);
        if (nextChapter.moduleId) {
          setExpandedModules(prev => ({ ...prev, [nextChapter.moduleId]: true }));
        }
      } else {
        toast.success("Course Completed! 🎉", { icon: "🏆" });
      }
    } catch (error) {
      toast.error("Failed to update progress");
    }
  };

  const toggleModule = (moduleId: string) => {
    setExpandedModules(prev => ({ ...prev, [moduleId]: !prev[moduleId] }));
  };

  if (isLoading) {
    return (
      <div className="h-[100dvh] flex flex-col items-center justify-center gap-4 bg-gradient-to-br from-indigo-50/50 via-white to-purple-50/50">
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-purple-500 animate-pulse shadow-[0_0_30px_rgba(147,51,234,0.3)]" />
          <div className="absolute inset-0 w-16 h-16 rounded-2xl bg-white/20 animate-ping" />
        </div>
        <p className="font-black text-slate-400 tracking-wider text-sm uppercase animate-pulse">Loading Course...</p>
      </div>
    );
  }

  if (!course) return null;

  // Compute flat chapter position for "Lesson X of Y" label
  const activeChapterIndex = flatChapters.findIndex(c => c.id === activeChapter?.id);
  const videoChapters = flatChapters.filter(c => c.type === 'VIDEO');
  const activeVideoIndex = videoChapters.findIndex(c => c.id === activeChapter?.id);
  const activeModuleIndex = course?.modules ? [...course.modules].sort((a: any, b: any) => (a.order || 0) - (b.order || 0)).findIndex((m: any) => m.id === activeChapter?.moduleId) : 0;

  return (
    <div className="flex flex-col h-[100dvh] bg-[#f5f0ff] overflow-hidden relative">
      {/* Decorative background blurs */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-purple-200/30 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-200/20 blur-[100px] rounded-full pointer-events-none" />

      {/* Floating sparkles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[{ t: '12%', l: '8%', s: 16, o: .4 }, { t: '25%', l: '65%', s: 10, o: .3 }, { t: '60%', l: '15%', s: 12, o: .35 }, { t: '75%', l: '75%', s: 8, o: .25 }, { t: '40%', l: '90%', s: 14, o: .3 }, { t: '85%', l: '40%', s: 10, o: .2 }].map((star, i) => (
          <svg key={i} style={{ position: 'absolute', top: star.t, left: star.l, opacity: star.o, animation: `pulse ${2 + i * 0.4}s ease-in-out infinite alternate` }} width={star.s} height={star.s} viewBox="0 0 24 24" fill="#a855f7">
            <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
          </svg>
        ))}
      </div>

      {/* Course Header */}
      <header className="h-16 shrink-0 bg-white/80 backdrop-blur-md border-b border-purple-100/50 px-4 md:px-6 flex items-center justify-between shadow-[0_2px_16px_-6px_rgba(147,51,234,0.1)] z-10 relative">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/my-courses" className="p-2 -ml-2 rounded-full hover:bg-purple-50 text-slate-500 hover:text-primary transition-all flex items-center gap-2 font-semibold text-sm" title="Back to Dashboard">
            <ArrowLeft size={18} />
            <span className="hidden sm:inline text-slate-600">Back</span>
          </Link>
          <div className="h-6 w-px bg-purple-200/60 hidden md:block"></div>
          <h1 className="font-black text-slate-800 text-lg md:text-xl line-clamp-1 flex items-center gap-2">
            {course.title}
            <span className="text-xl">🌿</span>
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 bg-green-50 px-3 py-1.5 rounded-full border border-green-200/60">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            <span className="text-xs font-bold text-green-700 uppercase tracking-wider">Active Session</span>
          </div>
          <span className="text-xs font-bold text-white bg-gradient-to-r from-purple-500 to-violet-600 px-4 py-1.5 rounded-full shadow-md shadow-purple-300/30 max-w-[200px] truncate">
            {activeChapter?.title || "Loading..."}
          </span>
        </div>
      </header>

      {/* Main Layout Area */}
      <div className="flex-1 flex flex-col md:flex-row p-3 md:p-5 gap-4 overflow-hidden relative z-10">
        {/* Main Content Area */}
        <div className="flex-1 bg-white rounded-[1.5rem] border border-purple-100/60 shadow-[0_4px_24px_rgba(147,51,234,0.06)] overflow-y-auto custom-scrollbar flex flex-col relative">
          {activeChapter ? (
            <>
              <div className={`w-full relative shrink-0 overflow-hidden ${activeChapter.type === "VIDEO"
                ? "h-[55vh] md:h-[65vh] lg:h-[72vh] bg-black"
                : "flex flex-col min-h-[60vh] bg-gradient-to-b from-slate-900 to-slate-950"
                }`}>
                {activeChapter.type === "VIDEO" ? (
                  activeChapter.video ? (
                    <div className="w-full h-full">
                      {activeChapter.video.videoUrl.includes('youtu') ? (
                        <ReactPlayer
                          url={activeChapter.video.videoUrl}
                          controls
                          width="100%"
                          height="100%"
                          light={activeChapter.thumbnailUrl || true}
                          config={{
                            youtube: {
                              playerVars: {
                                origin: typeof window !== 'undefined' ? window.location.origin : ''
                              }
                            } as any
                          }}
                        />
                      ) : (
                        <VideoPlayer
                          src={activeChapter.video.videoUrl}
                          poster={activeChapter.thumbnailUrl || undefined}
                          autoPlay
                        />
                      )}
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-500 bg-purple-50">
                      <div className="text-center">
                        <div className="text-6xl mb-4">🎬</div>
                        <p className="text-slate-400 font-semibold">Video not found</p>
                      </div>
                    </div>
                  )
                ) : (
                  <div className="w-full flex flex-col flex-1 text-white bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 p-6 md:p-10 relative overflow-hidden">
                    {/* Decorative blurs in quiz bg */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[300px] bg-primary/10 blur-[80px] rounded-full pointer-events-none" />
                    {activeChapter.assessment?.questions && activeChapter.assessment.questions.length > 0 ? (
                      quizState.isCompleted ? (
                        // ── SUCCESS SCREEN ──
                        <div className="flex-1 flex flex-col items-center justify-center text-center py-10 px-4 w-full relative z-10">
                          {/* Score Ring */}
                          <div className="relative mb-6 shrink-0">
                            <div className="w-28 h-28 rounded-full bg-gradient-to-br from-yellow-400/20 to-orange-500/20 border border-yellow-400/30 flex items-center justify-center shadow-[0_0_40px_rgba(250,204,21,0.25)]">
                              <Award size={56} className="text-yellow-400 drop-shadow-[0_0_12px_rgba(250,204,21,0.8)]" />
                            </div>
                            <div className="absolute -top-1 -right-1 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-lg border-2 border-slate-900">
                              <CheckCircle2 size={16} className="text-white" />
                            </div>
                          </div>

                          <h2 className="text-4xl font-black mb-2 shrink-0 bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">Quiz Complete! 🎉</h2>
                          <p className="text-slate-400 mb-3 shrink-0 text-lg">You scored</p>
                          <div className="flex items-end gap-2 mb-6 shrink-0">
                            <span className="text-7xl font-black text-white leading-none">{quizState.score}</span>
                            <span className="text-3xl font-black text-slate-500 mb-2">/ {activeChapter.assessment.questions.length}</span>
                          </div>

                          {/* Score badge */}
                          <div className={`mb-8 px-5 py-2 rounded-full font-bold text-sm shrink-0 border ${quizState.score === activeChapter.assessment.questions.length
                            ? 'bg-yellow-500/20 border-yellow-400/40 text-yellow-300'
                            : quizState.score >= activeChapter.assessment.questions.length / 2
                              ? 'bg-green-500/20 border-green-400/40 text-green-300'
                              : 'bg-red-500/20 border-red-400/40 text-red-300'
                            }`}>
                            {quizState.score === activeChapter.assessment.questions.length ? '⭐ Perfect Score!'
                              : quizState.score >= activeChapter.assessment.questions.length / 2 ? '✓ Well Done!'
                                : '📚 Keep Practicing'}
                          </div>

                          {/* Action buttons */}
                          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
                            <button
                              onClick={() => handleMarkComplete(quizState.score, quizState.answers)}
                              disabled={isChapterCompleted(activeChapter.id)}
                              className="px-8 py-3.5 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-2xl font-black shadow-[0_0_30px_rgba(16,185,129,0.3)] transition-all flex items-center gap-2 hover:shadow-[0_0_40px_rgba(16,185,129,0.4)] hover:-translate-y-0.5"
                            >
                              <CheckCircle2 size={18} /> {isChapterCompleted(activeChapter.id) ? 'Chapter Completed' : 'Mark Complete'}
                            </button>

                            {/* Review Answers button — starts one-by-one review mode */}
                            <button
                              onClick={() => setQuizState({
                                ...quizState,
                                isCompleted: false,
                                isReviewMode: true,
                                currentQuestionIndex: 0,
                                selectedOptionIndex: quizState.answers[0] ?? -1,
                                isSubmitted: true,
                              })}
                              className="px-8 py-3.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-2xl font-black transition-all flex items-center gap-2 hover:-translate-y-0.5"
                            >
                              <FileText size={18} /> Review Answers
                            </button>
                          </div>
                        </div>
                      ) : (

                        // ── ACTIVE QUIZ ──
                        <div className="max-w-2xl mx-auto w-full flex flex-col flex-1 relative z-10">
                          {/* Progress Header */}
                          <div className="flex justify-between items-center mb-8">
                            <div className="flex flex-col gap-1">
                              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Question</span>
                              <span className="text-2xl font-black text-white">
                                {quizState.currentQuestionIndex + 1} <span className="text-slate-600">/ {activeChapter.assessment.questions.length}</span>
                              </span>
                            </div>
                            <div className="flex gap-1.5 items-center">
                              {activeChapter.assessment.questions.map((_: any, idx: number) => (
                                <div key={idx} className={`rounded-full transition-all duration-300 ${idx === quizState.currentQuestionIndex
                                  ? 'w-5 h-2.5 bg-primary shadow-[0_0_8px_rgba(147,51,234,0.7)]'
                                  : idx < quizState.currentQuestionIndex
                                    ? 'w-2.5 h-2.5 bg-green-400 shadow-[0_0_6px_rgba(74,222,128,0.5)]'
                                    : 'w-2.5 h-2.5 bg-slate-700'
                                  }`} />
                              ))}
                            </div>
                          </div>

                          {/* Progress Bar */}
                          <div className="w-full h-1 bg-slate-800 rounded-full mb-8 overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-primary to-purple-400 rounded-full transition-all duration-500 ease-out shadow-[0_0_10px_rgba(147,51,234,0.6)]"
                              style={{ width: `${((quizState.currentQuestionIndex) / activeChapter.assessment.questions.length) * 100}%` }}
                            />
                          </div>

                          <h3 className="text-2xl md:text-3xl font-black leading-tight mb-8 text-white">
                            {activeChapter.assessment.questions[quizState.currentQuestionIndex]?.question}
                          </h3>

                          <div className="space-y-3 flex-1">
                            {activeChapter.assessment.questions[quizState.currentQuestionIndex]?.options?.map((opt: string, idx: number) => {
                              const isCorrect = idx === activeChapter.assessment.questions[quizState.currentQuestionIndex]?.correctAnswerIndex;
                              const isSelected = idx === quizState.selectedOptionIndex;

                              let btnClass = "w-full text-left p-4 rounded-2xl border transition-all font-semibold text-base flex items-center gap-4 group ";
                              if (!quizState.isSubmitted) {
                                btnClass += isSelected
                                  ? "border-primary bg-primary/15 text-white shadow-[0_0_20px_rgba(147,51,234,0.2)] scale-[1.01]"
                                  : "border-slate-700/50 bg-slate-800/40 text-slate-300 hover:border-slate-500 hover:bg-slate-800/70 hover:text-white";
                              } else {
                                if (isCorrect) btnClass += "border-green-500 bg-green-500/15 text-white shadow-[0_0_20px_rgba(34,197,94,0.2)]";
                                else if (isSelected && !isCorrect) btnClass += "border-red-500 bg-red-500/15 text-red-200";
                                else btnClass += "border-slate-800/50 bg-slate-900/30 text-slate-600 opacity-40";
                              }

                              return (
                                <button
                                  key={idx}
                                  disabled={quizState.isSubmitted}
                                  onClick={() => setQuizState({ ...quizState, selectedOptionIndex: idx })}
                                  className={btnClass}
                                >
                                  <div className={`w-7 h-7 rounded-xl border-2 flex items-center justify-center shrink-0 font-black text-xs transition-all ${quizState.isSubmitted && isCorrect
                                    ? 'border-green-400 bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.4)]'
                                    : quizState.isSubmitted && isSelected && !isCorrect
                                      ? 'border-red-400 bg-red-500'
                                      : isSelected
                                        ? 'border-primary bg-primary shadow-[0_0_10px_rgba(147,51,234,0.4)]'
                                        : 'border-slate-600 bg-slate-800 group-hover:border-slate-400'
                                    }`}>
                                    {quizState.isSubmitted && isCorrect
                                      ? <CheckCircle2 size={14} className="text-white" />
                                      : quizState.isSubmitted && isSelected && !isCorrect
                                        ? <span className="text-white">✕</span>
                                        : <span className={isSelected ? 'text-white' : 'text-slate-500'}>{String.fromCharCode(65 + idx)}</span>
                                    }
                                  </div>
                                  <span className="flex-1">{opt}</span>
                                </button>
                              );
                            })}
                          </div>

                          {quizState.isSubmitted && activeChapter.assessment.questions[quizState.currentQuestionIndex]?.explanation && (
                            <div className="mt-6 p-5 rounded-2xl bg-primary/10 border border-primary/25 backdrop-blur-sm">
                              <h4 className="font-black text-white mb-2 flex items-center gap-2">
                                <span className="text-primary">💡</span> Explanation
                              </h4>
                              <p className="text-slate-300 leading-relaxed">{activeChapter.assessment.questions[quizState.currentQuestionIndex].explanation}</p>
                            </div>
                          )}

                          <div className="mt-8 pt-6 border-t border-slate-800/70 flex justify-between items-center">
                            <div className={`text-sm font-bold px-3 py-1.5 rounded-lg transition-all ${quizState.isSubmitted && Number(quizState.selectedOptionIndex) === Number(activeChapter.assessment.questions[quizState.currentQuestionIndex]?.correctAnswerIndex)
                                ? 'text-green-400 bg-green-500/10'
                                : 'opacity-0'
                              }`}>
                              {quizState.isSubmitted && Number(quizState.selectedOptionIndex) === Number(activeChapter.assessment.questions[quizState.currentQuestionIndex]?.correctAnswerIndex)
                                ? '✓ Correct!'
                                : ''}
                            </div>
                            {!quizState.isSubmitted ? (
                              <button
                                disabled={quizState.selectedOptionIndex === -1}
                                onClick={() => {
                                  const isCorrect = quizState.selectedOptionIndex === activeChapter.assessment.questions[quizState.currentQuestionIndex]?.correctAnswerIndex;
                                  setQuizState({
                                    ...quizState,
                                    isSubmitted: true,
                                    score: isCorrect ? quizState.score + 1 : quizState.score,
                                    answers: [...quizState.answers, quizState.selectedOptionIndex]
                                  });
                                }}
                                className="px-8 py-3.5 bg-gradient-to-r from-primary to-purple-500 text-white rounded-2xl font-black shadow-[0_8px_20px_-6px_rgba(147,51,234,0.5)] hover:shadow-[0_8px_25px_-4px_rgba(147,51,234,0.6)] hover:-translate-y-0.5 transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:transform-none"
                              >
                                Submit Answer
                              </button>
                            ) : (
                              <button
                                onClick={() => {
                                  const nextIndex = quizState.currentQuestionIndex + 1;
                                  if (nextIndex < activeChapter.assessment.questions.length) {
                                    setQuizState({
                                      ...quizState,
                                      currentQuestionIndex: nextIndex,
                                      selectedOptionIndex: quizState.isReviewMode ? quizState.answers[nextIndex] : -1,
                                      isSubmitted: quizState.isReviewMode
                                    });
                                  } else {
                                    setQuizState({ ...quizState, isCompleted: true, isReviewMode: false });
                                  }
                                }}
                                className="px-8 py-3.5 bg-white text-slate-900 rounded-2xl font-black shadow-lg hover:bg-slate-100 hover:-translate-y-0.5 transition-all flex items-center gap-2"
                              >
                                {quizState.currentQuestionIndex + 1 < activeChapter.assessment.questions.length ? 'Next Question →' : (quizState.isReviewMode ? 'Finish Review' : 'Finish Quiz 🎉')}
                              </button>
                            )}
                          </div>
                        </div>
                      )
                    ) : (
                      <div className="flex-1 flex flex-col items-center justify-center text-slate-500 relative z-10">
                        <div className="p-6 rounded-2xl bg-slate-800/50 border border-slate-700 text-center">
                          <FileText size={48} className="mb-4 opacity-30 mx-auto" />
                          <p className="text-slate-400">No questions have been added to this assessment yet.</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
              {/* Below-video content area */}
              <div className="p-5 md:p-7">
                {/* Two-column: title+desc left, Did you know? right */}
                <div className="flex flex-col md:flex-row gap-5 mb-7">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">✨</span>
                      <h2 className="text-2xl font-black text-slate-800 tracking-tight">{activeChapter.title}</h2>
                    </div>
                    {activeChapter.description && (
                      <p className="text-slate-500 leading-relaxed">{activeChapter.description}</p>
                    )}
                  </div>
                  {/* Did You Know card */}
                  {activeChapter.goodToKnowPoints && activeChapter.goodToKnowPoints.length > 0 && (
                    <div className="md:w-64 shrink-0 p-4 bg-gradient-to-br from-purple-50 to-violet-50 rounded-2xl border border-purple-100 shadow-sm relative overflow-hidden">
                      <div className="absolute -top-3 -right-3 text-5xl opacity-20">💡</div>
                      <p className="text-xs font-black text-purple-500 uppercase tracking-wider mb-2">💡 Did you know?</p>
                      <p className="text-slate-700 text-sm leading-relaxed font-medium">{activeChapter.goodToKnowPoints[0]}</p>
                    </div>
                  )}
                </div>

                {/* More Good To Know points */}
                {activeChapter.goodToKnowPoints && activeChapter.goodToKnowPoints.length > 1 && (
                  <div className="mb-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {activeChapter.goodToKnowPoints.slice(1).map((point: string, idx: number) => (
                      <div key={idx} className="flex items-start gap-3 p-4 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100/60">
                        <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0 mt-0.5">
                          <CheckCircle2 size={14} />
                        </div>
                        <p className="text-indigo-800 text-sm leading-relaxed">{point}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* FAQs */}
                {activeChapter.faqs && activeChapter.faqs.length > 0 && (
                  <div className="mb-8">
                    <h3 className="font-black text-slate-700 mb-5 flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center">
                        <HelpCircle size={16} />
                      </div>
                      Frequently Asked Questions
                    </h3>
                    <div className="space-y-3">
                      {activeChapter.faqs.map((faq: any, idx: number) => (
                        <div key={idx} className="p-5 rounded-2xl border border-purple-100/60 bg-purple-50/30 hover:bg-purple-50/60 transition-colors group cursor-default">
                          <h4 className="font-bold text-slate-800 mb-1.5 group-hover:text-purple-700 transition-colors text-sm">{faq.question}</h4>
                          <p className="text-slate-500 text-sm leading-relaxed">{faq.answer}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-8 pt-6 border-t border-purple-100/50 flex justify-end">
                  <button
                    onClick={() => handleMarkComplete()}
                    disabled={isChapterCompleted(activeChapter.id)}
                    className="px-8 py-3.5 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-2xl font-black shadow-[0_8px_24px_-6px_rgba(139,92,246,0.5)] transition-all flex items-center gap-3 hover:-translate-y-0.5 active:translate-y-0 disabled:transform-none text-sm"
                  >
                    <CheckCircle2 size={20} className={isChapterCompleted(activeChapter.id) ? "" : "animate-pulse"} />
                    {isChapterCompleted(activeChapter.id) ? "✓ Completed" : "Mark as Complete"}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-400 flex-col gap-4">
              <PlayCircle size={48} className="opacity-20" />
              <p>Select a chapter from the sidebar to begin.</p>
            </div>
          )}
        </div>

        {/* Sidebar Navigation */}
        <div className="w-full md:w-72 lg:w-80 bg-white rounded-[1.5rem] border border-purple-100/60 shadow-[0_4px_24px_rgba(147,51,234,0.06)] overflow-hidden flex flex-col z-10">
          {/* Sidebar header with course thumbnail */}
          <div className="p-4 border-b border-purple-100/50 bg-gradient-to-b from-purple-50/80 to-white relative overflow-hidden">
            {/* Decorative sparkles */}
            <div className="absolute top-2 right-16 w-1.5 h-1.5 bg-purple-300 rounded-full" />
            <div className="absolute top-6 right-8 w-1 h-1 bg-violet-300 rounded-full" />
            <div className="absolute bottom-4 left-16 w-1.5 h-1.5 bg-indigo-300 rounded-full" />

            <Link href="/dashboard/courses" className="text-purple-500 hover:text-purple-700 mb-3 inline-flex items-center gap-1.5 text-xs font-bold transition-all hover:-translate-x-0.5">
              <ArrowLeft size={14} /> Back to Courses
            </Link>

            <div className="flex items-start justify-between gap-3 mt-1">
              <h3 className="font-black text-slate-800 text-base leading-snug flex-1">{course.title}</h3>
              {/* Course thumbnail illustration */}
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-100 to-violet-200 flex items-center justify-center text-3xl shrink-0 shadow-md border border-purple-200/50">
                🧠
              </div>
            </div>

            <div className="mt-4">
              <div className="flex justify-between items-end mb-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Progress</span>
                <span className="text-xs font-black text-purple-600">
                  {flatChapters.length > 0 ? Math.round((progress.filter(p => p.isCompleted).length / flatChapters.length) * 100) : 0}% Complete
                </span>
              </div>
              <div className="bg-purple-100 h-2 rounded-full overflow-hidden relative">
                <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-violet-500 to-purple-400 rounded-full transition-all duration-1000 ease-out shadow-[0_0_8px_rgba(139,92,246,0.4)]"
                  style={{ width: `${flatChapters.length > 0 ? Math.round((progress.filter(p => p.isCompleted).length / flatChapters.length) * 100) : 0}%` }}>
                </div>
              </div>
            </div>
          </div>

          {/* Module list */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
            {course.modules?.map((module: any, idx: number) => (
              <div key={module.id} className="rounded-2xl border border-purple-100/60 bg-white overflow-hidden shadow-sm">
                <button
                  onClick={() => toggleModule(module.id)}
                  className="w-full p-3.5 flex items-center justify-between text-left group"
                >
                  <div>
                    <p className="text-[9px] font-extrabold text-purple-400 uppercase tracking-widest mb-0.5">MODULE {idx + 1}</p>
                    <h4 className="font-bold text-slate-700 text-sm group-hover:text-purple-600 transition-colors">{module.title}</h4>
                  </div>
                  <div className={`p-1 rounded-full transition-all duration-300 ${expandedModules[module.id] ? 'bg-purple-100 text-purple-500 rotate-180' : 'bg-slate-50 text-slate-400 group-hover:bg-purple-50'
                    }`}>
                    <ChevronDown size={15} />
                  </div>
                </button>

                <div className={`transition-all duration-300 ease-in-out ${expandedModules[module.id] ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                  <div className="pb-3 px-2.5 space-y-1">
                    {module.chapters?.map((chapter: any, cIdx: number) => {
                      const isActive = activeChapter?.id === chapter.id;
                      const isUnlocked = isChapterUnlocked(chapter.id);
                      const isCompleted = isChapterCompleted(chapter.id);
                      return (
                        <button
                          key={chapter.id}
                          onClick={() => { if (isUnlocked) setActiveChapter(chapter); }}
                          disabled={!isUnlocked}
                          className={`w-full p-2.5 flex items-center gap-3 text-left transition-all rounded-xl ${isActive
                            ? 'bg-gradient-to-r from-violet-500/10 via-purple-500/5 to-transparent border border-purple-200/60 shadow-sm'
                            : isUnlocked
                              ? 'hover:bg-purple-50/60'
                              : 'opacity-40 cursor-not-allowed'
                            }`}
                        >
                          <div className="shrink-0">
                            {isCompleted ? (
                              <div className="w-6 h-6 rounded-full bg-green-100 text-green-500 flex items-center justify-center"><CheckCircle2 size={13} /></div>
                            ) : !isUnlocked ? (
                              <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-300 flex items-center justify-center"><Lock size={12} /></div>
                            ) : chapter.type === "VIDEO" ? (
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${isActive ? 'bg-purple-500 text-white shadow-md shadow-purple-300/40' : 'bg-purple-100 text-purple-500'
                                }`}><PlayCircle size={13} /></div>
                            ) : (
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${isActive ? 'bg-purple-500 text-white shadow-md shadow-purple-300/40' : 'bg-purple-100 text-purple-500'
                                }`}><FileText size={13} /></div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-bold truncate ${isActive ? 'text-purple-700' : isUnlocked ? 'text-slate-700' : 'text-slate-400'
                              }`}>{cIdx + 1}. {chapter.title}</p>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                              {chapter.type === "VIDEO"
                                ? (chapter.video?.duration ? `${Math.round(chapter.video.duration / 60)} min` : 'Video')
                                : 'Assessment'}
                            </span>
                          </div>
                        </button>
                      )
                    })}
                    {(!module.chapters || module.chapters.length === 0) && (
                      <div className="p-3 text-xs text-slate-400 font-medium text-center">No chapters yet.</div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Motivational card at bottom */}
          <div className="p-3 border-t border-purple-100/50">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-violet-100 to-purple-50 border border-purple-200/50 flex items-center gap-3 relative overflow-hidden">
              <div className="absolute -right-2 -bottom-2 text-5xl opacity-20">🌟</div>
              <div className="text-3xl shrink-0">🧘</div>
              <p className="text-xs font-bold text-purple-800 leading-snug relative z-10">Practice a little every day for a healthier mind!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
