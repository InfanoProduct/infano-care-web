"use client";

import React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { CoursePlayerShell } from "@/components/course/CoursePlayerShell";
import { useCourseCurriculum, useLearnerCourseState } from "@/hooks/use-course";
import { Check, Heart, Lock, Play, Award, Loader2 } from "lucide-react";

const CHAPTER_HOOKS: Record<string, { hook: string; outcomes: string[] }> = {
  ch1: {
    hook: "Your body has been preparing for this all along. Let's find out how.",
    outcomes: [
      "Explain the menstrual cycle in your own words",
      "Connect periods to the bigger changes of puberty",
      "Know a normal flow, and when to tell a grown-up",
    ],
  },
  ch2: {
    hook: "Caring for yourself is a superpower. Let's pack your kit.",
    outcomes: [
      "Build a simple daily care routine",
      "Choose period products that suit you",
      "Handle your period at school and outside",
    ],
  },
  ch3: {
    hook: "Cramps on sports day? Let's learn what your body is saying, and when to ask for help.",
    outcomes: [
      "Ease cramps with heat, movement and rest",
      "Know which signs mean it's time to see a doctor",
      "Keep germs away with everyday habits",
    ],
  },
  ch4: {
    hook: "Your body belongs to you, your voice matters, and every feeling is welcome.",
    outcomes: [
      "Spot bullying and be a safe upstander",
      "Know safe and unsafe touch, your rights and who can help",
      "Build healthy friendships and calm big feelings",
    ],
  },
};

export default function ChapterIntroPage() {
  const { chapterId } = useParams<{ chapterId: string }>();
  const { data: curriculum, isLoading } = useCourseCurriculum();
  const { data: learnerState } = useLearnerCourseState();

  const chapter = curriculum?.course?.chapters?.find((c) => c.id === chapterId);
  const badge = curriculum?.badges?.find((b) => b.id === chapter?.badgeId);
  const completedSet = new Set(learnerState?.completedLessons || []);
  const unlockedLessons = new Set(learnerState?.unlockedLessons || ["l1-1"]);

  if (isLoading || !chapter) {
    return (
      <CoursePlayerShell backHref="/dashboard/journey" backLabel="Journey">
        <div className="flex items-center justify-center py-24">
          <Loader2 size={32} className="animate-spin text-[#C2456A]" />
        </div>
      </CoursePlayerShell>
    );
  }

  const meta = CHAPTER_HOOKS[chapter.id] || { hook: chapter.theme, outcomes: [] };
  const firstOpenLesson =
    chapter.lessons.find((l) => !completedSet.has(l.id) && unlockedLessons.has(l.id)) ||
    chapter.lessons[0];

  return (
    <CoursePlayerShell
      backHref="/dashboard/journey"
      backLabel="Journey"
      worldName={chapter.worldName}
      activeStep="chapter"
      colors={chapter.colors}
      calmMode={chapter.number === 4}
      gigiTip={`Welcome to ${chapter.worldName}! Take each lesson at your own pace.`}
      maxWidthClass="max-w-5xl"
    >
      <div className="w-full flex flex-col gap-6">
        {/* Top Hero Splash */}
        <section
          style={{ backgroundColor: chapter.colors.background }}
          className="relative rounded-[32px] p-6 sm:p-8 overflow-hidden shadow-sm"
        >
          <div className="relative z-10 flex items-center justify-end mb-4">
            <span
              style={{ color: chapter.colors.ink }}
              className="bg-white/85 rounded-full px-3.5 py-1 text-xs font-extrabold uppercase tracking-wider"
            >
              CHAPTER {chapter.number} OF 4
            </span>
          </div>

          <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            <div className="md:col-span-7 flex flex-col gap-2.5">
              <h1 className="m-0 font-['Baloo_2',sans-serif] font-extrabold text-3xl sm:text-4xl text-[#3D2C4A] leading-tight">
                Welcome to {chapter.worldName}
              </h1>
              <p className="m-0 text-base sm:text-lg text-[#4A3A57] font-medium">
                {meta.hook}
              </p>
              <div className="pt-2 flex flex-wrap gap-3">
                {firstOpenLesson && (
                  <Link
                    href={`/dashboard/courses/lesson/${firstOpenLesson.id}`}
                    className="inline-flex items-center gap-2 min-h-[54px] px-7 rounded-full bg-[#C2456A] hover:bg-[#A8365A] text-white font-bold text-base shadow-lg transition-colors"
                  >
                    <Play size={17} fill="currentColor" />
                    <span>Let&apos;s go!</span>
                  </Link>
                )}
              </div>
            </div>

            {/* World Illustration + Gigi */}
            <div className="md:col-span-5 flex justify-center">
              <div className="relative w-48 h-48 sm:w-52 sm:h-52">
                <div className="absolute inset-0 rounded-full bg-white/70" />
                <svg
                  width="110"
                  height="110"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke={chapter.colors.ink}
                  strokeWidth="1.3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                >
                  <path d={chapter.iconSvgPath} />
                </svg>
                <svg
                  width="92"
                  height="104"
                  viewBox="0 0 120 135"
                  aria-hidden="true"
                  className="absolute -right-2 -bottom-2 animate-bounce"
                  style={{ animationDuration: "3s" }}
                >
                  <circle cx="60" cy="50" r="33" fill="#3D2C4A" />
                  <circle cx="31" cy="26" r="11" fill="#3D2C4A" />
                  <circle cx="89" cy="26" r="11" fill="#3D2C4A" />
                  <circle cx="92" cy="20" r="5" fill="#F4A3B4" />
                  <circle cx="60" cy="56" r="25" fill="#D9A07E" />
                  <path d="M35 49 C 40 30, 80 30, 85 49 C 76 41, 46 41, 35 49z" fill="#3D2C4A" />
                  <circle cx="51" cy="58" r="3" fill="#3D2C4A" />
                  <circle cx="69" cy="58" r="3" fill="#3D2C4A" />
                  <path d="M51 66 Q60 76 69 66" stroke="#3D2C4A" strokeWidth="2.5" fill="#FFFFFF" strokeLinecap="round" />
                  <path d="M30 135 C 32 98, 46 86, 60 86 C 74 86, 88 98, 90 135z" fill="#FFFFFF" />
                </svg>
              </div>
            </div>
          </div>
        </section>

        {/* Calm Mode Notice (Chapter 4) */}
        {chapter.calmMode && (
          <div className="bg-[#F1ECFA] rounded-2xl p-4 flex gap-3 items-start text-sm sm:text-base font-medium text-[#3D2C4A]">
            <Heart size={22} className="text-[#5A4385] shrink-0 mt-0.5" />
            <span>
              This chapter is about feeling safe. You can pause anytime, and talk to someone you trust.
            </span>
          </div>
        )}

        {/* Two-column Desktop Content: Outcomes + Badge (Left) | Lessons (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-5 flex flex-col gap-5">
            {/* Learning Outcomes */}
            <section className="bg-white border border-[#F1E4E8] rounded-[26px] p-5 sm:p-6 shadow-xs">
              <h2 className="m-0 mb-3 text-base font-bold text-[#3D2C4A]">
                In this chapter you&apos;ll…
              </h2>
              <ul className="m-0 p-0 list-none flex flex-col gap-3">
                {meta.outcomes.map((o, idx) => (
                  <li key={idx} className="flex gap-3 items-start text-sm sm:text-base text-[#3D2C4A]">
                    <span
                      style={{ backgroundColor: chapter.colors.background }}
                      className="shrink-0 w-6 h-6 rounded-full grid place-items-center mt-0.5"
                    >
                      <Check size={13} style={{ color: chapter.colors.ink }} strokeWidth={3} />
                    </span>
                    <span>{o}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* Badge to Earn */}
            <div className="bg-[#FFF4C7] rounded-[26px] p-5 flex items-center gap-4 shadow-xs">
              <span className="shrink-0 w-14 h-14 rounded-full bg-white border-[3px] border-dashed border-[#E8C55A] grid place-items-center">
                <Award size={26} className="text-[#B89A3A]" />
              </span>
              <div>
                <span className="block text-[11px] font-extrabold tracking-wider text-[#7A5A0C] uppercase">
                  BADGE TO EARN
                </span>
                <span className="block font-['Baloo_2',sans-serif] font-bold text-xl text-[#3D2C4A]">
                  {badge?.name || "Chapter Badge"}
                </span>
                <span className="text-xs sm:text-sm text-[#5E4B6B]">
                  Pass the chapter check-in to unlock it
                </span>
              </div>
            </div>
          </div>

          {/* Lessons List */}
          <section className="lg:col-span-7 flex flex-col gap-3">
            <h2 className="m-0 text-base font-bold text-[#3D2C4A]">
              {chapter.lessons.length} lessons
            </h2>
            {chapter.lessons.map((l) => {
              const isDone = completedSet.has(l.id);
              const isUnlocked = unlockedLessons.has(l.id);
              return (
                <Link
                  key={l.id}
                  href={isUnlocked ? `/dashboard/courses/lesson/${l.id}` : "#"}
                  onClick={(e) => {
                    if (!isUnlocked) e.preventDefault();
                  }}
                  className={`flex items-center gap-3.5 bg-white border border-[#F1E4E8] rounded-[22px] p-4 shadow-2xs transition-all ${
                    isUnlocked
                      ? "hover:border-[#C2456A]/50 cursor-pointer"
                      : "opacity-65 cursor-not-allowed"
                  }`}
                >
                  <span
                    style={{ backgroundColor: chapter.colors.background, color: chapter.colors.ink }}
                    className="shrink-0 w-11 h-11 rounded-2xl grid place-items-center font-['Baloo_2',sans-serif] font-bold text-base"
                  >
                    {l.code}
                  </span>
                  <div className="flex-1 min-w-0">
                    <span className="block font-bold text-base text-[#3D2C4A]">{l.title}</span>
                    <span className="block text-xs sm:text-sm text-[#6E5B7A]">
                      {l.video?.duration_label || "15 min"} video · {l.activity?.name || "Activity"}
                    </span>
                  </div>
                  {isDone ? (
                    <span className="text-xs font-bold bg-[#EAF7F1] text-[#24735A] px-3 py-1 rounded-full shrink-0">
                      Done ✓
                    </span>
                  ) : isUnlocked ? (
                    <span className="text-xs font-bold bg-[#FDEFF0] text-[#A8365A] px-3 py-1 rounded-full shrink-0">
                      Open →
                    </span>
                  ) : (
                    <Lock size={16} className="text-[#8A7896] shrink-0" />
                  )}
                </Link>
              );
            })}
          </section>
        </div>
      </div>
    </CoursePlayerShell>
  );
}

