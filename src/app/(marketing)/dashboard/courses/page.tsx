"use client";

import React from "react";
import Link from "next/link";
import { DaughterShell } from "@/features/daughter/DaughterShell";
import { resolveResumeStepPath, useCourseCurriculum, useLearnerCourseState } from "@/hooks/use-course";
import { ArrowRight, Award, Check, Lock, Play, Sparkles, Compass, Loader2 } from "lucide-react";

export default function CourseHomePage() {
  const { data: curriculum, isLoading: loadingCur } = useCourseCurriculum();
  const { data: learnerState, isLoading: loadingState } = useLearnerCourseState();

  const chapters = curriculum?.course?.chapters || [];
  const completedSet = new Set(learnerState?.completedLessons || []);
  const unlockedChapters = new Set(learnerState?.unlockedChapters || ["ch1"]);
  const passedCheckins = new Set(learnerState?.passedCheckins || []);
  const pendingCheckinId = learnerState?.pendingCheckinId || null;
  const nextLessonId = learnerState?.nextLessonId || "l1-1";
  const nextLessonProg = learnerState?.lessonProgress?.[nextLessonId];
  const nextResume = resolveResumeStepPath(nextLessonId, nextLessonProg);
  const doneCount = completedSet.size;
  const totalLessons = curriculum?.course?.lessonCount || 15;
  const totalPetals = learnerState?.learner?.petalsCount ?? 0;

  let nextLessonTitle = "The Menstrual Cycle";
  let nextLessonCode = "1.1";
  let nextWorldName = "Moon Meadow";
  for (const ch of chapters) {
    const found = ch.lessons?.find((l) => l.id === nextLessonId);
    if (found) {
      nextLessonTitle = found.title;
      nextLessonCode = found.code;
      nextWorldName = ch.worldName;
      break;
    }
  }
  const pendingChapter = pendingCheckinId
    ? chapters.find((ch) => ch.checkinId === pendingCheckinId) || null
    : null;

  return (
    <DaughterShell gigiTip="Pick any open world to explore, or jump right back into your next lesson!">
      {/* Header */}
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-[#A8365A]">
            GIRLHOOD: HERNEXT
          </div>
          <h1 className="m-0 font-['Baloo_2',sans-serif] text-2xl sm:text-3xl font-extrabold text-[#3D2C4A]">
            Your Learning Worlds
          </h1>
          <p className="m-0 text-sm text-[#5E4B6B] font-medium">
            {doneCount} of {totalLessons} lessons completed · {passedCheckins.size} of 4 chapter check-ins passed
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/dashboard/journey"
            className="inline-flex items-center gap-2 min-h-[42px] px-4 rounded-full bg-white border border-[#F1E4E8] hover:border-[#C2456A] text-sm font-bold text-[#3D2C4A] shadow-2xs transition-colors"
          >
            <Compass size={16} className="text-[#C2456A]" />
            <span>Journey Map</span>
          </Link>
          <span className="inline-flex items-center gap-1.5 bg-white border border-[#F1E4E8] rounded-full px-3.5 py-2 text-sm font-bold text-[#3D2C4A] shadow-2xs">
            <svg width="14" height="18" viewBox="0 0 16 22" aria-hidden="true">
              <ellipse cx="8" cy="11" rx="6" ry="10" fill="#F4A3B4" />
            </svg>
            {totalPetals}
          </span>
        </div>
      </header>

      {loadingCur || loadingState ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={32} className="animate-spin text-[#C2456A]" />
        </div>
      ) : (
        <>
          {learnerState?.isEnrolled === false && (
            <section className="bg-[#FFF1E6] border border-[#F5DAC5] rounded-[24px] p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-xl bg-white text-[#9A4A16] grid place-items-center shrink-0">
                  <Lock size={18} />
                </span>
                <div>
                  <div className="text-sm font-bold text-[#3D2C4A]">
                    Free Preview Mode · Lesson 1.1 is unlocked
                  </div>
                  <div className="text-xs text-[#5E4B6B]">
                    Lessons 1.2–4.5 and check-ins open as soon as a parent unlocks the full course.
                  </div>
                </div>
              </div>
              <Link
                href="/course/checkout?plan=course"
                className="inline-flex items-center gap-1.5 min-h-[40px] px-4 rounded-full bg-[#C2456A] hover:bg-[#A8365A] text-white text-xs sm:text-sm font-bold transition-colors shrink-0"
              >
                <span>Unlock Full Course</span>
                <ArrowRight size={14} />
              </Link>
            </section>
          )}

          {/* Continue Learning Hero */}
          {pendingChapter && pendingCheckinId ? (
            <section className="bg-[#FFF4C7] rounded-[28px] p-5 sm:p-6 flex flex-wrap items-center justify-between gap-4 shadow-sm border border-[#F3E3A1]">
              <div className="flex flex-col gap-1.5">
                <span className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-[#8A6410]">
                  <Award size={14} />
                  CHAPTER {pendingChapter.number} CHECK-IN READY · {pendingChapter.worldName}
                </span>
                <h2 className="m-0 font-['Baloo_2',sans-serif] text-2xl sm:text-3xl font-bold text-[#3D2C4A]">
                  Unlock the next world!
                </h2>
                <p className="m-0 text-sm text-[#5E4B6B]">
                  All lessons in {pendingChapter.worldName} are done. Pass the check-in to earn your badge and open Chapter {pendingChapter.number + 1}.
                </p>
              </div>
              <Link
                href={`/dashboard/courses/checkin/${pendingCheckinId}`}
                className="inline-flex items-center gap-2 min-h-[52px] px-6 rounded-full bg-[#C2456A] hover:bg-[#A8365A] text-white font-bold text-base shadow-md transition-colors shrink-0"
              >
                <Award size={17} />
                <span>Take Check-in</span>
              </Link>
            </section>
          ) : (
            <section className="bg-[#FFE3CC] rounded-[28px] p-5 sm:p-6 flex flex-wrap items-center justify-between gap-4 shadow-sm">
              <div className="flex flex-col gap-1.5">
                <span className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-[#9A4A16]">
                  <Sparkles size={14} />
                  UP NEXT · {nextWorldName} · LESSON {nextLessonCode}
                </span>
                <h2 className="m-0 font-['Baloo_2',sans-serif] text-2xl sm:text-3xl font-bold text-[#3D2C4A]">
                  {nextLessonTitle}
                </h2>
                <p className="m-0 text-sm text-[#5E4B6B]">
                  Watch the expert video, play the interactive game, discover 3 quick cards, and reflect.
                </p>
              </div>
              <Link
                href={nextResume.href}
                className="inline-flex items-center gap-2 min-h-[52px] px-6 rounded-full bg-[#C2456A] hover:bg-[#A8365A] text-white font-bold text-base shadow-md transition-colors shrink-0"
              >
                <Play size={16} fill="currentColor" />
                <span>{nextResume.hasStarted ? nextResume.label : doneCount > 0 ? "Continue lesson" : "Start lesson"}</span>
              </Link>
            </section>
          )}

          {/* 4 Worlds Grid */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {chapters.map((ch) => {
              const isOpen = unlockedChapters.has(ch.id);
              const chDone = ch.lessons.filter((l) => completedSet.has(l.id)).length;
              const chTotal = ch.lessons.length;
              const chPassed = ch.checkinId ? passedCheckins.has(ch.checkinId) : false;
              const allLessonsDone = chDone === chTotal && chTotal > 0;

              return (
                <div
                  key={ch.id}
                  style={{ backgroundColor: isOpen ? ch.colors.soft : "#F6F1F4" }}
                  className="rounded-[28px] p-5 sm:p-6 border border-[#F1E4E8] shadow-xs flex flex-col gap-4 transition-all"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span
                        style={{ backgroundColor: ch.colors.background }}
                        className="w-12 h-12 rounded-2xl grid place-items-center shrink-0"
                      >
                        <svg
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke={ch.colors.ink}
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d={ch.iconSvgPath} />
                        </svg>
                      </span>
                      <div>
                        <div
                          style={{ color: ch.colors.ink }}
                          className="text-xs font-extrabold uppercase tracking-wider"
                        >
                          CHAPTER {ch.number} · {chTotal} LESSONS
                        </div>
                        <h3 className="m-0 font-['Baloo_2',sans-serif] text-xl sm:text-2xl font-bold text-[#3D2C4A] leading-tight">
                          {ch.worldName}
                        </h3>
                        <div className="text-xs font-semibold text-[#5E4B6B]">{ch.theme}</div>
                      </div>
                    </div>

                    {chPassed ? (
                      <span className="inline-flex items-center gap-1 bg-[#EAF7F1] text-[#24735A] text-xs font-bold px-3 py-1 rounded-full shrink-0">
                        <Check size={13} /> Done
                      </span>
                    ) : !isOpen ? (
                      <span className="inline-flex items-center gap-1 bg-white text-[#8A7896] text-xs font-bold px-3 py-1 rounded-full shrink-0">
                        <Lock size={13} /> Locked
                      </span>
                    ) : null}
                  </div>

                  {/* Lesson Pills */}
                  <div className="flex flex-col gap-2">
                    {ch.lessons.map((l) => {
                      const lDone = completedSet.has(l.id);
                      const lUnlocked = (learnerState?.unlockedLessons || ["l1-1"]).includes(l.id);
                      return (
                        <Link
                          key={l.id}
                          href={lUnlocked ? `/dashboard/courses/lesson/${l.id}` : "#"}
                          aria-disabled={!lUnlocked}
                          onClick={(e) => {
                            if (!lUnlocked) e.preventDefault();
                          }}
                          className={`flex items-center justify-between gap-3 rounded-2xl px-3.5 py-2.5 bg-white border border-[#F1E4E8] transition-all ${
                            lUnlocked
                              ? "hover:border-[#C2456A]/50 cursor-pointer"
                              : "opacity-65 cursor-not-allowed"
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span
                              style={{ backgroundColor: ch.colors.background, color: ch.colors.ink }}
                              className="w-8 h-8 rounded-xl grid place-items-center text-xs font-extrabold shrink-0"
                            >
                              {l.code}
                            </span>
                            <div className="min-w-0">
                              <div className="text-sm font-bold text-[#3D2C4A] truncate">{l.title}</div>
                              <div className="text-xs text-[#6E5B7A] truncate">
                                {l.video?.duration_label || "15 min"} · {l.activity?.name || "Activity"}
                              </div>
                            </div>
                          </div>
                          {lDone ? (
                            <Check size={16} className="text-[#24735A] shrink-0" />
                          ) : lUnlocked ? (
                            <ArrowRight size={16} className="text-[#C2456A] shrink-0" />
                          ) : (
                            <Lock size={14} className="text-[#8A7896] shrink-0" />
                          )}
                        </Link>
                      );
                    })}
                  </div>

                  {/* Chapter Footer Actions */}
                  <div className="flex flex-wrap gap-2.5 pt-1 mt-auto">
                    {isOpen && (
                      <Link
                        href={`/dashboard/courses/chapter/${ch.id}`}
                        className="flex-1 min-h-[44px] px-4 rounded-full bg-white border border-[#E9DDE6] hover:border-[#3D2C4A] text-[#3D2C4A] font-bold text-sm inline-flex items-center justify-center transition-colors"
                      >
                        World intro
                      </Link>
                    )}
                    {isOpen && ch.checkinId && (allLessonsDone || chPassed) && (
                      <Link
                        href={`/dashboard/courses/checkin/${ch.checkinId}`}
                        className="flex-1 min-h-[44px] px-4 rounded-full bg-[#3D2C4A] hover:bg-[#2F213A] text-white font-bold text-sm inline-flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Award size={15} />
                        <span>{chPassed ? "Retake check-in" : "Take check-in"}</span>
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </section>

          {/* Bloom Challenge Banner */}
          <section className="bg-[#FFF4C7] rounded-[28px] p-5 sm:p-6 flex flex-wrap items-center justify-between gap-4 border border-[#F3E3A1]">
            <div className="flex items-center gap-4">
              <span className="w-14 h-14 rounded-full bg-white grid place-items-center shrink-0 shadow-xs">
                <Award size={28} className="text-[#8A6410]" />
              </span>
              <div>
                <div className="text-xs font-extrabold uppercase tracking-wider text-[#7A5A0C]">
                  FINAL MILESTONE · CERTIFICATE OF CONFIDENCE
                </div>
                <h3 className="m-0 font-['Baloo_2',sans-serif] text-xl sm:text-2xl font-bold text-[#3D2C4A]">
                  The Bloom Challenge (12 questions)
                </h3>
                <p className="m-0 text-sm text-[#5E4B6B]">
                  Pass all 4 chapter check-ins to unlock the Bloom Challenge and earn your printable certificate!
                </p>
              </div>
            </div>

            {learnerState?.bloomChallengeUnlocked ? (
              <Link
                href="/dashboard/courses/checkin/bloom-challenge"
                className="min-h-[48px] px-6 rounded-full bg-[#C2456A] hover:bg-[#A8365A] text-white font-bold text-sm inline-flex items-center gap-2 shadow-sm transition-colors"
              >
                <span>Start Bloom Challenge</span>
                <ArrowRight size={16} />
              </Link>
            ) : (
              <span className="inline-flex items-center gap-1.5 bg-white/80 text-[#7A5A0C] font-bold text-xs px-4 py-2.5 rounded-full">
                <Lock size={14} />
                Unlocks after Chapter 4 check-in
              </span>
            )}
          </section>
        </>
      )}
    </DaughterShell>
  );
}
