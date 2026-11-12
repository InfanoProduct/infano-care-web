"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { CoursePlayerShell } from "@/components/course/CoursePlayerShell";
import { LessonLockedCard } from "@/components/course/LessonLockedCard";
import {
  HlsCourseVideoPlayer,
  HlsCourseVideoPlayerHandle,
} from "@/components/course/HlsCourseVideoPlayer";
import { useActiveLearnerId, useInvalidateCourse, useLessonDetail } from "@/hooks/use-course";
import { CourseService } from "@/services/course.service";
import {
  BookmarkCheck,
  CheckCircle2,
  Clock,
  Lightbulb,
  Loader2,
  Play,
  Sparkles,
} from "lucide-react";
import { toast } from "react-hot-toast";

const formatSec = (sec: number) => {
  const s = Math.max(0, Math.floor(sec));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
};

export default function LessonWatchPage() {
  const { lessonId } = useParams<{ lessonId: string }>();
  const learnerId = useActiveLearnerId();
  const invalidateCourse = useInvalidateCourse();
  const { data, isLoading, isError } = useLessonDetail(lessonId);

  const playerRef = useRef<HlsCourseVideoPlayerHandle | null>(null);
  const prevTimeRef = useRef(0);
  const [t, setT] = useState(0);
  const [maxWatched, setMaxWatched] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [cc, setCc] = useState(true);
  const [askingIdx, setAskingIdx] = useState<number | null>(null);
  const [askedMap, setAskedMap] = useState<Record<number, boolean>>({});
  const [selectedAns, setSelectedAns] = useState<string | null>(null);
  const [pauseAnswers, setPauseAnswers] = useState<Record<string, string>>({});
  const [initialized, setInitialized] = useState(false);

  const lesson = data?.lesson;
  const totalSec = lesson?.video?.duration_seconds || 900;
  const unlockSec = Math.round(totalSec * 0.8);
  const pauseQuestions = useMemo(() => lesson?.pauseAndThink || [], [lesson?.pauseAndThink]);
  const topics = useMemo(() => lesson?.topics || [], [lesson?.topics]);
  const hasRealVideo = Boolean(lesson?.video?.url && lesson.video.url.trim().length > 0);

  // Initialize from saved progress
  const lastSavedPctRef = useRef(0);
  const lastSavedPosRef = useRef(0);
  const [resumedFromSec, setResumedFromSec] = useState<number | null>(null);

  useEffect(() => {
    if (!data || initialized) return;
    const savedPos = data.progress?.watchPositionS || 0;
    const savedPct = data.progress?.watchPercent || 0;
    setT(savedPos);
    prevTimeRef.current = savedPos;
    lastSavedPctRef.current = savedPct;
    lastSavedPosRef.current = savedPos;
    if (savedPos > 5) {
      setResumedFromSec(savedPos);
    }
    setMaxWatched(Math.max(savedPos, Math.round((savedPct / 100) * totalSec)));
    if (data.progress?.pauseThinkAnswers) {
      setPauseAnswers(data.progress.pauseThinkAnswers);
      const answeredIndices: Record<number, boolean> = {};
      pauseQuestions.forEach((pq, idx) => {
        if (data.progress?.pauseThinkAnswers?.[pq.id] !== undefined) {
          answeredIndices[idx] = true;
        }
      });
      setAskedMap(answeredIndices);
    }
    setInitialized(true);
  }, [data, initialized, totalSec, pauseQuestions]);

  // Check for Pause & Think breakpoint crossing
  const checkPauseBreakpoint = useCallback(
    (prevSec: number, nextSec: number) => {
      if (nextSec <= prevSec) return false;
      const hitIdx = pauseQuestions.findIndex(
        (pq, idx) => !askedMap[idx] && prevSec < pq.at_seconds && nextSec >= pq.at_seconds
      );
      if (hitIdx >= 0) {
        playerRef.current?.pause();
        setPlaying(false);
        setAskingIdx(hitIdx);
        setSelectedAns(null);
        setAskedMap((am) => ({ ...am, [hitIdx]: true }));
        const stopAt = pauseQuestions[hitIdx].at_seconds;
        prevTimeRef.current = stopAt;
        setT(stopAt);
        return true;
      }
      return false;
    },
    [pauseQuestions, askedMap]
  );

  // Simulated playback when video.url is null (demo/seeded placeholder mode)
  useEffect(() => {
    if (!playing || hasRealVideo || !lesson) return;
    const interval = setInterval(() => {
      setT((prev) => {
        const next = Math.min(totalSec, prev + 4 * speed);
        setMaxWatched((m) => Math.max(m, next));
        const hitIdx = pauseQuestions.findIndex(
          (pq, idx) => !askedMap[idx] && prev < pq.at_seconds && next >= pq.at_seconds
        );
        if (hitIdx >= 0) {
          setPlaying(false);
          setAskingIdx(hitIdx);
          setSelectedAns(null);
          setAskedMap((am) => ({ ...am, [hitIdx]: true }));
          prevTimeRef.current = pauseQuestions[hitIdx].at_seconds;
          return pauseQuestions[hitIdx].at_seconds;
        }
        if (next >= totalSec) {
          setPlaying(false);
        }
        prevTimeRef.current = next;
        return next;
      });
    }, 100);
    return () => clearInterval(interval);
  }, [playing, hasRealVideo, lesson, totalSec, speed, pauseQuestions, askedMap]);

  // Handle real <video> timeupdate
  const handleRealTimeUpdate = useCallback(
    (curSec: number) => {
      const prevSec = prevTimeRef.current;
      // Only trigger breakpoint if playback advanced smoothly (< 3s jump)
      if (curSec > prevSec && curSec - prevSec < 3) {
        if (checkPauseBreakpoint(prevSec, curSec)) return;
      }
      prevTimeRef.current = curSec;
      setT(curSec);
      setMaxWatched((m) => Math.max(m, curSec));
    },
    [checkPauseBreakpoint]
  );

  const handleUserSeek = useCallback((targetSec: number) => {
    prevTimeRef.current = targetSec;
    setT(targetSec);
    setMaxWatched((m) => Math.max(m, targetSec));
  }, []);

  const persistCurrentSpot = useCallback(
    async (notifyUnlock = false) => {
      if (!learnerId || learnerId === "default" || !lesson || !initialized) return;
      const pct = Math.min(100, Math.round((Math.max(t, maxWatched) / totalSec) * 100));
      const crossedUnlock = pct >= 80 && lastSavedPctRef.current < 80;
      const posMoved = Math.abs(Math.round(t) - lastSavedPosRef.current) >= 5;
      if (!crossedUnlock && pct === lastSavedPctRef.current && !posMoved) return;

      lastSavedPctRef.current = pct;
      lastSavedPosRef.current = Math.round(t);
      try {
        const res: any = await CourseService.saveWatchProgress(learnerId, lesson.id, {
          watchPositionS: Math.round(t),
          watchPercent: pct,
          pauseThinkAnswers: pauseAnswers,
        });
        if (crossedUnlock || notifyUnlock) {
          await invalidateCourse();
          if (crossedUnlock && res?.petalsAwarded > 0) {
            toast.success(`Play unlocked! +${res.petalsAwarded} petals 🌸`);
          }
        }
      } catch {
        // ignore transient errors
      }
    },
    [learnerId, lesson, initialized, t, maxWatched, totalSec, pauseAnswers, invalidateCourse]
  );

  // Persist watch progress immediately at 80% unlock, every 15% progress, or every 15s of position change
  useEffect(() => {
    if (!learnerId || learnerId === "default" || !lesson || !initialized) return;
    const pct = Math.min(100, Math.round((Math.max(t, maxWatched) / totalSec) * 100));
    const crossedUnlock = pct >= 80 && lastSavedPctRef.current < 80;
    const pctDelta = pct - lastSavedPctRef.current >= 15;
    const posDelta = Math.abs(Math.round(t) - lastSavedPosRef.current) >= 15;
    if (crossedUnlock || pctDelta || posDelta) {
      persistCurrentSpot(crossedUnlock);
    }
  }, [t, maxWatched, totalSec, learnerId, lesson, initialized, persistCurrentSpot]);

  // Save latest position when pausing or leaving the Watch page
  const latestWatchRef = useRef({ t: 0, maxWatched: 0, totalSec: 900, pauseAnswers: {}, lessonId: "" });
  useEffect(() => {
    latestWatchRef.current = {
      t,
      maxWatched,
      totalSec,
      pauseAnswers,
      lessonId: lesson?.id || "",
    };
  }, [t, maxWatched, totalSec, pauseAnswers, lesson?.id]);

  useEffect(() => {
    if (!playing && initialized) {
      persistCurrentSpot(false);
    }
  }, [playing, initialized, persistCurrentSpot]);

  useEffect(() => {
    return () => {
      const snap = latestWatchRef.current;
      if (!learnerId || learnerId === "default" || !snap.lessonId) return;
      if (Math.abs(Math.round(snap.t) - lastSavedPosRef.current) < 4) return;
      const pct = Math.min(100, Math.round((Math.max(snap.t, snap.maxWatched) / Math.max(1, snap.totalSec)) * 100));
      CourseService.saveWatchProgress(learnerId, snap.lessonId, {
        watchPositionS: Math.round(snap.t),
        watchPercent: pct,
        pauseThinkAnswers: snap.pauseAnswers,
      }).catch(() => {});
    };
  }, [learnerId]);

  // Keyboard shortcuts for desktop video ergonomics
  useEffect(() => {
    if (!lesson || askingIdx !== null) return;
    const onKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "BUTTON") return;
      if (e.code === "Space") {
        e.preventDefault();
        if (playing) playerRef.current?.pause();
        else playerRef.current?.play();
      } else if (e.code === "ArrowLeft") {
        e.preventDefault();
        playerRef.current?.seekTo(Math.max(0, t - 10));
      } else if (e.code === "ArrowRight") {
        e.preventDefault();
        playerRef.current?.seekTo(Math.min(totalSec, t + 10));
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [lesson, askingIdx, playing, t, totalSec]);

  if (isError) {
    return (
      <CoursePlayerShell backHref="/dashboard/journey" backLabel="Journey">
        <LessonLockedCard />
      </CoursePlayerShell>
    );
  }

  if (isLoading || !lesson) {
    return (
      <CoursePlayerShell
        backHref={`/dashboard/courses/lesson/${lessonId}`}
        backLabel="Lesson Hub"
        maxWidthClass="max-w-[1480px]"
        headerMaxWidthClass="max-w-[1480px]"
      >
        <div className="flex items-center justify-center py-24">
          <Loader2 size={32} className="animate-spin text-[#C2456A]" />
        </div>
      </CoursePlayerShell>
    );
  }

  const chapter = lesson.chapter;
  const borderBg = chapter?.colors?.background || "#D8ECF8";
  const softBg = chapter?.colors?.soft || "#F0F7FC";
  const ink = chapter?.colors?.ink || "#2F6494";

  const currentTopicIdx = topics.reduce((acc, tp, i) => (t >= tp.start_seconds ? i : acc), 0);
  const currentCaption = topics[currentTopicIdx]?.caption || topics[currentTopicIdx]?.title || "";
  const effectiveWatched = Math.max(t, maxWatched);
  const watchPct = Math.min(100, Math.round((effectiveWatched / Math.max(1, totalSec)) * 100));
  const unlockProgressPct = Math.min(100, Math.round((watchPct / 80) * 100));
  const canPlay = effectiveWatched >= unlockSec || data?.progress?.stepsDone?.includes("watch");
  const toUnlock = formatSec(Math.max(0, unlockSec - effectiveWatched));

  const jumpToTopic = (sec: number) => {
    playerRef.current?.seekTo(sec);
    playerRef.current?.play();
  };

  const handleSaveSpot = async () => {
    playerRef.current?.pause();
    setPlaying(false);
    const pct = Math.min(100, Math.round((effectiveWatched / totalSec) * 100));
    if (learnerId && learnerId !== "default") {
      try {
        await CourseService.saveWatchProgress(learnerId, lesson.id, {
          watchPositionS: Math.round(t),
          watchPercent: pct,
          pauseThinkAnswers: pauseAnswers,
        });
        invalidateCourse();
      } catch {
        // ignore network blip
      }
    }
    toast.success(`Saved! Next time you'll start at ${formatSec(t)}.`);
  };

  const activePauseQ = askingIdx !== null ? pauseQuestions[askingIdx] : null;

  const handlePickPauseOption = (optId: string) => {
    if (!activePauseQ || selectedAns !== null) return;
    setSelectedAns(optId);
    const updated = { ...pauseAnswers, [activePauseQ.id]: optId };
    setPauseAnswers(updated);
    if (learnerId && learnerId !== "default") {
      const pct = Math.min(100, Math.round((effectiveWatched / totalSec) * 100));
      CourseService.saveWatchProgress(learnerId, lesson.id, {
        watchPositionS: Math.round(t),
        watchPercent: pct,
        pauseThinkAnswers: updated,
      }).catch(() => {});
    }
  };

  const resumeFromPause = () => {
    setAskingIdx(null);
    setSelectedAns(null);
    playerRef.current?.play();
    setPlaying(true);
  };

  return (
    <CoursePlayerShell
      backHref={`/dashboard/courses/lesson/${lesson.id}`}
      backLabel="Lesson Hub"
      worldName={chapter?.worldName}
      lessonCode={lesson.code}
      lessonId={lesson.id}
      activeStep="watch"
      stepsDone={data?.progress?.stepsDone || []}
      colors={chapter?.colors}
      calmMode={Boolean(lesson.calmMode)}
      gigiTip="Watch at least 80% of the video to unlock the interactive Play game!"
      maxWidthClass="max-w-[1480px]"
      headerMaxWidthClass="max-w-[1480px]"
    >
      <div className="w-full flex flex-col gap-5 relative">
        {/* Title Row */}
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <div style={{ color: ink }} className="text-xs font-extrabold uppercase tracking-wider">
              STEP 1 · WATCH · LESSON {lesson.code}
            </div>
            <h1 className="m-0 font-['Baloo_2',sans-serif] font-bold text-2xl sm:text-3xl text-[#3D2C4A] leading-tight">
              {lesson.title}
            </h1>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-[#5E4B6B] bg-white border border-[#F1E4E8] rounded-full px-3.5 py-1.5 shadow-2xs">
            <Clock size={14} style={{ color: ink }} />
            <span>{formatSec(totalSec)} lesson</span>
            {resumedFromSec !== null && (
              <>
                <span className="text-[#D5C6D4]">·</span>
                <span className="text-[#24735A] font-bold">
                  Resumed at {formatSec(resumedFromSec)}
                </span>
              </>
            )}
            <span className="text-[#D5C6D4]">·</span>
            <span>{canPlay ? "Play unlocked ✓" : `${watchPct}% / 80% to unlock Play`}</span>
          </div>
        </div>

        {/* Wide Desktop Theater Layout / Responsive Mobile Stack */}
        <div className="grid grid-cols-1 lg:grid-cols-12 xl:grid-cols-[minmax(0,1fr)_380px] gap-6 items-start">
          {/* Primary Column: Wide Video Player + Expert & Progress Card */}
          <div className="lg:col-span-8 xl:col-span-1 flex flex-col gap-4 min-w-0">
            <HlsCourseVideoPlayer
              ref={playerRef}
              src={lesson.video?.url}
              poster={lesson.video?.poster_image || undefined}
              initialTime={data?.progress?.watchPositionS || 0}
              totalDurationSec={totalSec}
              borderColor={borderBg}
              captionText={currentCaption}
              ccEnabled={cc}
              onToggleCc={() => setCc((c) => !c)}
              pauseCues={pauseQuestions.map((pq, idx) => ({
                id: pq.id,
                at_seconds: pq.at_seconds,
                asked: Boolean(askedMap[idx]),
              }))}
              speed={speed}
              onSpeedChange={setSpeed}
              isPlaying={playing}
              onPlayingChange={setPlaying}
              currentTime={t}
              onTimeUpdate={handleRealTimeUpdate}
              onUserSeek={handleUserSeek}
              blockedByModal={askingIdx !== null}
            />

            {/* Expert & Lesson Info Bar under video */}
            <div className="bg-white border border-[#F1E4E8] rounded-[24px] p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 shadow-2xs">
              <div className="flex items-center gap-3.5 min-w-0">
                <svg width="46" height="46" viewBox="0 0 104 104" aria-hidden="true" className="shrink-0">
                  <path d="M52 4c26 0 48 18 48 46s-20 50-48 50S4 80 4 52 26 4 52 4z" fill={borderBg} />
                  <circle cx="52" cy="44" r="18" fill="#C98B67" />
                  <path d="M33 44c0-14 9-22 19-22s19 8 19 22c-4-6-10-10-19-10s-15 4-19 10z" fill="#3D2C4A" />
                  <path d="M22 96c4-18 16-26 30-26s26 8 30 26z" fill="#FFFFFF" />
                </svg>
                <div className="min-w-0">
                  <div className="font-bold text-sm sm:text-base text-[#3D2C4A] truncate">
                    {(lesson.video?.expert?.name || chapter?.expert?.name || "Infano Expert").replace(" [placeholder]", "")}
                  </div>
                  <div className="text-xs sm:text-sm text-[#5E4B6B] truncate">
                    {lesson.video?.expert?.role || chapter?.expert?.role || "Specialist"} · Hinglish with English captions
                  </div>
                </div>
              </div>

              {/* Pause & Think Checkpoint Badges */}
              {pauseQuestions.length > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold text-[#6E5B7A] mr-0.5">
                    Pause &amp; think:
                  </span>
                  {pauseQuestions.map((pq, idx) => {
                    const done = Boolean(askedMap[idx]);
                    return (
                      <button
                        key={pq.id}
                        type="button"
                        onClick={() => {
                          playerRef.current?.pause();
                          setPlaying(false);
                          setAskingIdx(idx);
                          setSelectedAns(pauseAnswers[pq.id] ?? null);
                          setAskedMap((am) => ({ ...am, [idx]: true }));
                        }}
                        title={`Open Pause & Think ${idx + 1} (${formatSec(pq.at_seconds)})`}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold cursor-pointer transition-colors ${
                          done
                            ? "bg-[#EAF7F1] text-[#24735A]"
                            : "bg-[#FFF4C7] text-[#8A6410] hover:bg-[#FFE89E]"
                        }`}
                      >
                        <Lightbulb size={12} />
                        <span>{idx + 1}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right Companion Panel: Topics, Progress, Save Spot & Next CTA */}
          <aside className="lg:col-span-4 xl:col-span-1 flex flex-col gap-4 lg:sticky lg:top-24 min-w-0">
            {/* Progress toward unlocking Play */}
            <div className="bg-white border border-[#F1E4E8] rounded-[24px] p-4 shadow-2xs flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-[#3D2C4A] flex items-center gap-1.5">
                  {canPlay ? (
                    <CheckCircle2 size={15} className="text-[#24735A]" />
                  ) : (
                    <Sparkles size={14} className="text-[#C2456A]" />
                  )}
                  {canPlay ? "Step 2: Play is unlocked!" : "Watch progress to unlock Play"}
                </span>
                <span style={{ color: canPlay ? "#24735A" : ink }}>{watchPct}%</span>
              </div>
              <div className="h-2.5 rounded-full bg-[#F6F1F4] overflow-hidden relative">
                <div
                  style={{
                    width: `${unlockProgressPct}%`,
                    backgroundColor: canPlay ? "#2F7F62" : "#C2456A",
                  }}
                  className="h-full rounded-full transition-all duration-300"
                />
              </div>
              {!canPlay && (
                <div className="text-[11px] font-medium text-[#6E5B7A]">
                  About {toUnlock} more to reach 80% and unlock your interactive game.
                </div>
              )}
            </div>

            {/* Topics Jump Card */}
            <div className="bg-white border border-[#F1E4E8] rounded-[24px] p-3 shadow-2xs flex flex-col">
              <div className="px-2.5 pt-1 pb-2 text-xs font-extrabold uppercase tracking-wider text-[#6E5B7A]">
                In this video · {topics.length} topics
              </div>

              <div className="max-h-[380px] overflow-y-auto pr-0.5 flex flex-col gap-1">
                {topics.map((tp, i) => {
                  const isNow = i === currentTopicIdx;
                  const isPassed = t > tp.start_seconds && i < currentTopicIdx;
                  return (
                    <button
                      key={tp.id}
                      type="button"
                      onClick={() => jumpToTopic(tp.start_seconds + 0.5)}
                      style={isNow ? { backgroundColor: softBg } : undefined}
                      className={`w-full flex items-center gap-2.5 py-2.5 px-3 text-left cursor-pointer rounded-2xl transition-colors ${
                        isNow ? "" : "hover:bg-[#FFFAF6]"
                      }`}
                    >
                      <span
                        style={{ color: ink }}
                        className="shrink-0 w-10 text-xs font-extrabold tabular-nums"
                      >
                        {tp.start_label}
                      </span>
                      <span
                        className={`flex-1 text-sm leading-snug ${
                          isNow
                            ? "font-bold text-[#3D2C4A]"
                            : isPassed
                            ? "font-medium text-[#6E5B7A]"
                            : "font-medium text-[#4A3A57]"
                        }`}
                      >
                        {tp.title}
                      </span>
                      {isNow ? (
                        <span
                          style={{ backgroundColor: borderBg, color: ink }}
                          className="text-[11px] font-bold rounded-full px-2.5 py-0.5 shrink-0 inline-flex items-center gap-1"
                        >
                          <Play size={10} fill="currentColor" />
                          Now
                        </span>
                      ) : isPassed ? (
                        <CheckCircle2 size={15} className="text-[#2F7F62] shrink-0" />
                      ) : null}
                    </button>
                  );
                })}
              </div>

              <div className="mt-2 pt-2.5 px-2.5 pb-1 flex items-center gap-2.5 text-xs text-[#5E4B6B] border-t border-[#F3E9EE]">
                <span className="w-2.5 h-2.5 bg-[#FFE08A] rotate-45 rounded-[2px] shrink-0" />
                <span>{pauseQuestions.length} Pause &amp; think stops along the way</span>
              </div>
            </div>

            {/* Action Buttons */}
            <button
              type="button"
              onClick={handleSaveSpot}
              className="min-h-[48px] rounded-full border-2 border-[#3D2C4A] bg-white hover:bg-[#FFFAF6] text-[#3D2C4A] font-bold text-sm inline-flex items-center justify-center gap-2 cursor-pointer transition-colors"
            >
              <BookmarkCheck size={17} />
              <span>Take a break · save my spot</span>
            </button>

            {canPlay ? (
              <Link
                href={`/dashboard/courses/lesson/${lesson.id}/play`}
                className="min-h-[54px] rounded-full bg-[#C2456A] hover:bg-[#A8365A] text-white font-bold text-base flex items-center justify-center shadow-md transition-colors px-5 text-center"
              >
                Next: Play {lesson.activity?.name || "Activity"} →
              </Link>
            ) : (
              <div className="min-h-[54px] rounded-full bg-[#F6F1F4] text-[#6E5B7A] grid place-items-center font-semibold text-sm text-center px-4">
                Play opens at 80% ({toUnlock} to go)
              </div>
            )}
          </aside>
        </div>

        {/* Pause & Think Dialog */}
        {activePauseQ && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#3D2C4A]/45 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in">
            <div
              role="dialog"
              aria-label="Pause and think"
              className="w-full sm:max-w-lg bg-white rounded-t-[28px] sm:rounded-[28px] p-6 flex flex-col gap-3.5 shadow-2xl animate-in slide-in-from-bottom sm:zoom-in-95"
            >
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-xl bg-[#FFF4C7] grid place-items-center shrink-0">
                  <Lightbulb size={20} className="text-[#8A6410]" />
                </span>
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-[#8A6410]">
                    PAUSE &amp; THINK · {(askingIdx ?? 0) + 1} OF {pauseQuestions.length}
                  </div>
                  <div className="text-xs text-[#6E5B7A]">The video is paused for you</div>
                </div>
              </div>

              <h3 className="m-0 font-['Baloo_2',sans-serif] font-bold text-2xl leading-snug text-[#3D2C4A]">
                {activePauseQ.prompt}
              </h3>

              <div className="flex flex-col gap-2">
                {activePauseQ.options.map((opt) => {
                  const answered = selectedAns !== null;
                  const isCorrect = opt.id === activePauseQ.correct_option_id;
                  const isPicked = opt.id === selectedAns;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => handlePickPauseOption(opt.id)}
                      className={`text-left min-h-[50px] px-4 py-2.5 rounded-2xl border font-semibold text-sm sm:text-base cursor-pointer transition-all ${
                        !answered
                          ? "bg-[#FBF8F6] border-[#E9DDE6] text-[#3D2C4A] hover:border-[#3D2C4A]"
                          : isCorrect
                          ? "bg-[#2F7F62] border-[#2F7F62] text-white"
                          : isPicked
                          ? "bg-[#F6F1F4] border-[#E9DDE6] text-[#8A7896]"
                          : "bg-white border-[#F1E4E8] text-[#8A7896]"
                      }`}
                    >
                      {opt.text}
                    </button>
                  );
                })}
              </div>

              {selectedAns !== null && (
                <div className="bg-[#EAF7F1] rounded-2xl p-3.5 text-sm font-medium text-[#1F5A45] animate-in fade-in">
                  <strong>
                    {selectedAns === activePauseQ.correct_option_id ? "Yes!" : "Good guess!"}
                  </strong>{" "}
                  {activePauseQ.explanation}
                </div>
              )}

              <div className="flex gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={resumeFromPause}
                  className="flex-1 min-h-[50px] rounded-full bg-[#3D2C4A] hover:bg-[#2F213A] text-white font-bold text-sm sm:text-base cursor-pointer"
                >
                  {selectedAns === null ? "Continue video" : "Back to the video"}
                </button>
                {selectedAns === null && (
                  <button
                    type="button"
                    onClick={resumeFromPause}
                    className="min-h-[50px] px-4 rounded-full text-[#3D2C4A] font-semibold text-sm cursor-pointer hover:bg-[#F6F1F4]"
                  >
                    Skip
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </CoursePlayerShell>
  );
}
