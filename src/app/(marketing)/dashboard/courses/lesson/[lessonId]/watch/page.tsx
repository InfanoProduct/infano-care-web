"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { DaughterShell } from "@/features/daughter/DaughterShell";
import { useActiveLearnerId, useInvalidateCourse, useLessonDetail } from "@/hooks/use-course";
import { CourseService } from "@/services/course.service";
import { ArrowLeft, BookmarkCheck, Lightbulb, Pause, Play, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";

const formatSec = (sec: number) => {
  const s = Math.max(0, Math.floor(sec));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
};

export default function LessonWatchPage() {
  const { lessonId } = useParams<{ lessonId: string }>();
  const learnerId = useActiveLearnerId();
  const invalidateCourse = useInvalidateCourse();
  const { data, isLoading } = useLessonDetail(lessonId);

  const videoRef = useRef<HTMLVideoElement | null>(null);
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
  const pauseQuestions = lesson?.pauseAndThink || [];
  const topics = lesson?.topics || [];

  // Initialize from saved progress
  useEffect(() => {
    if (!data || initialized) return;
    const savedPos = data.progress?.watchPositionS || 0;
    const savedPct = data.progress?.watchPercent || 0;
    setT(savedPos);
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

  // Simulated playback when video.url is null (demo/seeded placeholder mode)
  const hasRealVideo = Boolean(lesson?.video?.url);

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
          return pauseQuestions[hitIdx].at_seconds;
        }
        if (next >= totalSec) {
          setPlaying(false);
        }
        return next;
      });
    }, 100);
    return () => clearInterval(interval);
  }, [playing, hasRealVideo, lesson, totalSec, speed, pauseQuestions, askedMap]);

  // Persist watch progress when reaching 80% or periodically
  const lastSavedPctRef = useRef(0);
  useEffect(() => {
    if (!learnerId || learnerId === "default" || !lesson) return;
    const pct = Math.min(100, Math.round((Math.max(t, maxWatched) / totalSec) * 100));
    const crossedUnlock = pct >= 80 && lastSavedPctRef.current < 80;
    if (crossedUnlock || pct - lastSavedPctRef.current >= 20) {
      lastSavedPctRef.current = pct;
      CourseService.saveWatchProgress(learnerId, lesson.id, {
        watchPositionS: Math.round(t),
        watchPercent: pct,
        pauseThinkAnswers: pauseAnswers,
      })
        .then((res: any) => {
          if (crossedUnlock) {
            invalidateCourse();
            if (res?.petalsAwarded > 0) {
              toast.success(`Play unlocked! +${res.petalsAwarded} petals 🌸`);
            }
          }
        })
        .catch(() => {});
    }
  }, [t, maxWatched, totalSec, learnerId, lesson, pauseAnswers, invalidateCourse]);

  if (isLoading || !lesson) {
    return (
      <DaughterShell>
        <div className="flex items-center justify-center py-24">
          <Loader2 size={32} className="animate-spin text-[#C2456A]" />
        </div>
      </DaughterShell>
    );
  }

  const chapter = lesson.chapter;
  const borderBg = chapter?.colors?.background || "#D8ECF8";
  const ink = chapter?.colors?.ink || "#2F6494";

  const currentTopicIdx = topics.reduce((acc, tp, i) => (t >= tp.start_seconds ? i : acc), 0);
  const currentCaption = topics[currentTopicIdx]?.caption || topics[currentTopicIdx]?.title || "";
  const effectiveWatched = Math.max(t, maxWatched);
  const canPlay = effectiveWatched >= unlockSec || data?.progress?.stepsDone?.includes("watch");
  const toUnlock = formatSec(Math.max(0, unlockSec - effectiveWatched));

  const togglePlay = () => {
    if (hasRealVideo && videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        setPlaying(true);
      } else {
        videoRef.current.pause();
        setPlaying(false);
      }
    } else {
      if (t >= totalSec) setT(0);
      setPlaying((p) => !p);
    }
  };

  const jumpTo = (sec: number) => {
    const target = Math.min(totalSec, Math.max(0, sec));
    setT(target);
    setMaxWatched((m) => Math.max(m, target));
    if (hasRealVideo && videoRef.current) {
      videoRef.current.currentTime = target;
      videoRef.current.play();
    }
    setPlaying(true);
  };

  const cycleSpeed = () => {
    const speeds = [0.75, 1, 1.25, 1.5];
    const next = speeds[(speeds.indexOf(speed) + 1) % speeds.length];
    setSpeed(next);
    if (hasRealVideo && videoRef.current) {
      videoRef.current.playbackRate = next;
    }
  };

  const handleSaveSpot = async () => {
    setPlaying(false);
    if (hasRealVideo && videoRef.current) videoRef.current.pause();
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
    setPlaying(true);
    if (hasRealVideo && videoRef.current) videoRef.current.play();
  };

  return (
    <DaughterShell gigiTip="Watch at least 80% of the video to unlock the interactive Play game!">
      <div className="max-w-6xl mx-auto w-full flex flex-col gap-5 relative">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Link
            href={`/dashboard/courses/lesson/${lesson.id}`}
            aria-label="Back to lesson"
            className="w-11 h-11 rounded-full bg-white border border-[#F1E4E8] hover:border-[#3D2C4A] grid place-items-center text-[#3D2C4A] shrink-0"
          >
            <ArrowLeft size={20} />
          </Link>
          <div className="flex-1 min-w-0">
            <div style={{ color: ink }} className="text-xs font-extrabold uppercase tracking-wider">
              STEP 1 · WATCH · LESSON {lesson.code}
            </div>
            <h1 className="m-0 font-['Baloo_2',sans-serif] font-bold text-xl sm:text-2xl text-[#3D2C4A] truncate">
              {lesson.title}
            </h1>
          </div>
        </div>

        {/* Desktop 2-Col / Mobile Stack */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left: Video Player + Expert Card */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            <div
              style={{ borderColor: borderBg }}
              className="rounded-[24px] overflow-hidden bg-[#3D2C4A] border-[5px] shadow-lg"
            >
              <div className="relative aspect-video bg-[#23182D] grid place-items-center">
                {hasRealVideo ? (
                  <video
                    ref={videoRef}
                    src={lesson.video.url || undefined}
                    className="w-full h-full object-cover"
                    onTimeUpdate={(e) => {
                      const cur = e.currentTarget.currentTime;
                      setT(cur);
                      setMaxWatched((m) => Math.max(m, cur));
                    }}
                  />
                ) : (
                  <>
                    <svg width="120" height="110" viewBox="0 0 104 96" aria-hidden="true">
                      <circle cx="52" cy="40" r="40" fill="#3A2A47" />
                      <circle cx="34" cy="34" r="10" fill="#1F1428" />
                      <circle cx="70" cy="34" r="10" fill="#1F1428" />
                      <circle cx="52" cy="26" r="12" fill="#1F1428" />
                      <circle cx="52" cy="42" r="17" fill="#B9785A" />
                      <path d="M22 96c4-18 16-26 30-26s26 8 30 26z" fill="#E8738A" />
                    </svg>
                    <span className="absolute left-3 top-3 bg-white/15 text-white rounded-full px-3 py-1 text-xs font-semibold">
                      {playing ? "Playing expert lesson..." : "Expert video plays here"}
                    </span>
                  </>
                )}

                {cc && currentCaption && (
                  <div className="absolute left-3 right-3 bottom-3 text-center pointer-events-none">
                    <span className="inline-block bg-black/70 text-white rounded-lg px-3 py-1 text-xs sm:text-sm font-medium">
                      {currentCaption}
                    </span>
                  </div>
                )}

                {!playing && askingIdx === null && (
                  <button
                    type="button"
                    onClick={togglePlay}
                    aria-label="Play video"
                    className="absolute w-16 h-16 rounded-full bg-white/95 hover:scale-105 grid place-items-center text-[#3D2C4A] shadow-xl cursor-pointer transition-transform"
                  >
                    <Play size={26} fill="currentColor" className="ml-0.5" />
                  </button>
                )}
              </div>

              {/* Scrubber & Controls */}
              <div className="px-3.5 py-3 bg-[#3D2C4A] text-white">
                <div
                  className="relative h-6 cursor-pointer"
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                    jumpTo(pct * totalSec);
                  }}
                >
                  <div className="absolute left-0 right-0 top-2.5 h-1.5 rounded-full bg-white/20" />
                  <div
                    style={{ width: `${Math.min(100, (t / totalSec) * 100)}%` }}
                    className="absolute left-0 top-2.5 h-1.5 rounded-full bg-[#F4A3B4]"
                  />
                  {pauseQuestions.map((pq, i) => (
                    <span
                      key={pq.id}
                      title={`Pause & think ${i + 1}`}
                      style={{ left: `${(pq.at_seconds / totalSec) * 100}%` }}
                      className={`absolute top-1.5 w-3 h-3 -translate-x-1.5 rotate-45 rounded-[3px] ${
                        askedMap[i] ? "bg-[#FFE08A]" : "bg-white"
                      }`}
                    />
                  ))}
                  <span
                    title="Play unlocks here (80%)"
                    style={{ left: "80%" }}
                    className="absolute top-0.5 w-0.5 h-4 bg-[#A8D8BE]"
                  />
                </div>

                <div className="flex items-center gap-2 mt-1">
                  <button
                    type="button"
                    onClick={togglePlay}
                    aria-label={playing ? "Pause" : "Play"}
                    className="w-10 h-10 rounded-full bg-white/15 hover:bg-white/25 grid place-items-center cursor-pointer"
                  >
                    {playing ? <Pause size={18} /> : <Play size={18} fill="currentColor" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => jumpTo(t - 10)}
                    className="h-9 px-3 rounded-full bg-white/15 hover:bg-white/25 text-xs font-bold cursor-pointer"
                  >
                    −10s
                  </button>
                  <span className="text-xs sm:text-sm font-semibold tabular-nums">
                    {formatSec(t)} / {formatSec(totalSec)}
                  </span>
                  <span className="flex-1" />
                  <button
                    type="button"
                    onClick={cycleSpeed}
                    className="h-8 px-2.5 rounded-full bg-white/15 hover:bg-white/25 text-xs font-bold cursor-pointer"
                  >
                    {speed}x
                  </button>
                  <button
                    type="button"
                    onClick={() => setCc((c) => !c)}
                    aria-pressed={cc}
                    className={`h-8 px-2.5 rounded-full text-xs font-bold cursor-pointer ${
                      cc ? "bg-white text-[#3D2C4A]" : "bg-white/15 text-white"
                    }`}
                  >
                    CC
                  </button>
                </div>
              </div>
            </div>

            {/* Expert Row */}
            <div className="flex items-center gap-3 bg-white rounded-2xl p-3.5 border border-[#F1E4E8]">
              <svg width="44" height="44" viewBox="0 0 104 104" aria-hidden="true" className="shrink-0">
                <path d="M52 4c26 0 48 18 48 46s-20 50-48 50S4 80 4 52 26 4 52 4z" fill="#D8ECF8" />
                <circle cx="52" cy="44" r="18" fill="#C98B67" />
                <path d="M33 44c0-14 9-22 19-22s19 8 19 22c-4-6-10-10-19-10s-15 4-19 10z" fill="#3D2C4A" />
                <path d="M22 96c4-18 16-26 30-26s26 8 30 26z" fill="#FFFFFF" />
              </svg>
              <div>
                <div className="font-bold text-sm sm:text-base text-[#3D2C4A]">
                  {(lesson.video?.expert?.name || chapter?.expert?.name || "Infano Expert").replace(" [placeholder]", "")}
                </div>
                <div className="text-xs text-[#5E4B6B]">
                  {lesson.video?.expert?.role || chapter?.expert?.role || "Specialist"} · Hinglish with English captions
                </div>
              </div>
            </div>
          </div>

          {/* Right: Topic Jumps + Save Spot + Play Unlock CTA */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <div className="bg-white border border-[#F1E4E8] rounded-[24px] px-4 py-2 shadow-2xs">
              {topics.map((tp, i) => {
                const isNow = i === currentTopicIdx;
                return (
                  <button
                    key={tp.id}
                    type="button"
                    onClick={() => jumpTo(tp.start_seconds + 1)}
                    className="w-full flex items-center gap-3 py-3 border-b border-[#F3E9EE] last:border-b-0 text-left cursor-pointer hover:bg-[#FFFAF6] transition-colors rounded-xl px-2"
                  >
                    <span
                      style={{ color: ink }}
                      className="shrink-0 w-11 text-xs sm:text-sm font-bold tabular-nums"
                    >
                      {tp.start_label}
                    </span>
                    <span className={`flex-1 text-sm ${isNow ? "font-bold text-[#3D2C4A]" : "font-medium text-[#4A3A57]"}`}>
                      {tp.title}
                    </span>
                    {isNow && (
                      <span
                        style={{ backgroundColor: borderBg, color: ink }}
                        className="text-[11px] font-bold rounded-full px-2.5 py-0.5 shrink-0"
                      >
                        Now
                      </span>
                    )}
                  </button>
                );
              })}

              <div className="flex items-center gap-2.5 py-3 px-2 text-xs text-[#5E4B6B] border-t border-[#F3E9EE]">
                <span className="w-3 h-3 bg-[#FFE08A] rotate-45 rounded-[2px] shrink-0" />
                <span>{pauseQuestions.length} Pause &amp; think stops along the way</span>
              </div>
            </div>

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
                className="min-h-[56px] rounded-full bg-[#C2456A] hover:bg-[#A8365A] text-white font-bold text-base flex items-center justify-center shadow-md transition-colors"
              >
                Next: Play {lesson.activity?.name || "Activity"} →
              </Link>
            ) : (
              <div className="min-h-[56px] rounded-full bg-[#F6F1F4] text-[#6E5B7A] grid place-items-center font-semibold text-sm text-center px-4">
                Play opens at 80% of the video ({toUnlock} to go)
              </div>
            )}
          </div>
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
    </DaughterShell>
  );
}

