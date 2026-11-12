"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { DaughterShell } from "@/features/daughter/DaughterShell";
import { useCourseCurriculum, useLearnerCourseState, useLessonDetail } from "@/hooks/use-course";
import { Star, Loader2 } from "lucide-react";

export default function LessonDonePage() {
  const { lessonId } = useParams<{ lessonId: string }>();
  const { data, isLoading } = useLessonDetail(lessonId);
  const { data: curriculum } = useCourseCurriculum();
  const { data: learnerState } = useLearnerCourseState();

  const [petalsDisplay, setPetalsDisplay] = useState(0);

  useEffect(() => {
    const startTimer = setTimeout(() => {
      const interval = setInterval(() => {
        setPetalsDisplay((n) => {
          if (n >= 60) {
            clearInterval(interval);
            return 60;
          }
          return Math.min(60, n + 3);
        });
      }, 35);
      return () => clearInterval(interval);
    }, 800);
    return () => clearTimeout(startTimer);
  }, []);

  if (isLoading || !data?.lesson) {
    return (
      <DaughterShell>
        <div className="flex items-center justify-center py-24">
          <Loader2 size={32} className="animate-spin text-[#C2456A]" />
        </div>
      </DaughterShell>
    );
  }

  const { lesson } = data;
  const chapter = lesson.chapter;
  const bg = chapter?.colors?.background || "#D8ECF8";
  const ink = chapter?.colors?.ink || "#2F6494";
  const c1 = chapter?.colors?.accent || "#8EBFE0";
  const c2 = chapter?.colors?.accent_light || "#B7D8EF";

  const chapterLessons =
    curriculum?.course?.chapters?.find((c) => c.id === chapter?.id)?.lessons || [];
  const completedSet = new Set(learnerState?.completedLessons || [lesson.id]);
  const doneInChapter = chapterLessons.filter((l) => completedSet.has(l.id)).length || lesson.orderInChapter;
  const totalInChapter = chapterLessons.length || 3;
  const chapterPct = Math.round((doneInChapter / totalInChapter) * 100);
  const remainCount = Math.max(0, totalInChapter - doneInChapter);

  const badgeId = lesson.completion?.badge_id;
  const earnedBadge = curriculum?.badges?.find((b) => b.id === badgeId);

  const nextObj = lesson.completion?.next;
  const nextHref =
    nextObj?.type === "checkin"
      ? `/dashboard/courses/checkin/${nextObj.id}`
      : nextObj?.id
      ? `/dashboard/courses/lesson/${nextObj.id}`
      : "/dashboard/journey";

  const nextLabel =
    nextObj?.type === "checkin"
      ? "Take the Chapter Check-in!"
      : data.nextLesson
      ? `Next lesson: ${data.nextLesson.title}`
      : "Continue journey";

  return (
    <DaughterShell gigiTip="Two lessons a day is plenty. Rest your eyes and celebrate your new flower!">
      <style jsx global>{`
        @keyframes ldseed {
          0% { transform: translateY(-130px); opacity: 0; }
          25% { opacity: 1; }
          100% { transform: translateY(0); opacity: 1; }
        }
        @keyframes ldstem {
          0% { transform: scaleY(0); }
          100% { transform: scaleY(1); }
        }
        @keyframes ldbloom {
          0% { transform: scale(0) rotate(-40deg); }
          100% { transform: scale(1) rotate(0deg); }
        }
        .ld-seed { animation: ldseed 0.8s cubic-bezier(0.5, 0, 0.8, 0.6) both; }
        .ld-stem { transform-box: fill-box; transform-origin: 50% 100%; animation: ldstem 0.6s ease-out 0.8s both; }
        .ld-bloom { transform-box: fill-box; transform-origin: center; animation: ldbloom 0.8s cubic-bezier(0.2, 1.5, 0.4, 1) 1.3s both; }
      `}</style>

      <div
        style={{ backgroundColor: bg }}
        className="rounded-[34px] p-6 sm:p-10 text-center flex flex-col items-center gap-4 max-w-2xl mx-auto w-full shadow-sm relative overflow-hidden"
      >
        <div style={{ color: ink }} className="text-xs sm:text-sm font-extrabold uppercase tracking-widest">
          LESSON {lesson.code} COMPLETE
        </div>

        {/* Animated Seed -> Stem -> Flower SVG */}
        <svg width="220" height="220" viewBox="0 0 200 200" role="img" aria-label="A new flower blooms in your garden">
          <ellipse cx="100" cy="176" rx="90" ry="18" fill="#FFFFFF" opacity="0.6" />
          <ellipse cx="100" cy="170" rx="34" ry="8" fill="#8A6A55" />
          <g className="ld-stem">
            <path d="M100 170 V 96" stroke="#5FA27F" strokeWidth="6" strokeLinecap="round" />
            <path d="M100 140 C 80 132, 70 118, 76 106 C 90 112, 98 124, 100 140z" fill="#7FB89A" />
            <path d="M100 128 C 120 120, 130 106, 124 94 C 110 100, 102 112, 100 128z" fill="#A8D8BE" />
          </g>
          <g className="ld-bloom">
            <g transform="translate(100 78)">
              <ellipse rx="14" ry="26" cy="-22" fill={c1} />
              <ellipse rx="14" ry="26" cy="-22" fill={c2} transform="rotate(72)" />
              <ellipse rx="14" ry="26" cy="-22" fill={c1} transform="rotate(144)" />
              <ellipse rx="14" ry="26" cy="-22" fill={c2} transform="rotate(216)" />
              <ellipse rx="14" ry="26" cy="-22" fill={c1} transform="rotate(288)" />
              <circle r="12" fill="#FFE08A" />
            </g>
          </g>
          <g className="ld-seed">
            <ellipse cx="100" cy="164" rx="6" ry="8" fill="#B98A62" />
          </g>
        </svg>

        <h1 className="m-0 font-['Baloo_2',sans-serif] font-bold text-3xl sm:text-4xl text-[#3D2C4A] leading-tight">
          A new flower bloomed!
        </h1>
        <p className="m-0 text-base text-[#3D2C4A]">
          <strong>{lesson.title}</strong> is now growing in your garden.
        </p>

        {/* Reward Pills */}
        <div className="flex gap-2.5 flex-wrap justify-center">
          <span className="inline-flex items-center gap-1.5 bg-white rounded-full px-4 py-2 font-bold text-sm text-[#3D2C4A] shadow-2xs">
            <svg width="14" height="18" viewBox="0 0 16 22" aria-hidden="true">
              <ellipse cx="8" cy="11" rx="6" ry="10" fill="#F4A3B4" />
            </svg>
            +{petalsDisplay} petals
          </span>
          {earnedBadge && (
            <span className="inline-flex items-center gap-1.5 bg-[#FFF4C7] rounded-full px-4 py-2 font-bold text-sm text-[#3D2C4A] shadow-2xs">
              <Star size={16} className="text-[#F2B544] fill-[#F2B544]" />
              Badge: {earnedBadge.name}
            </span>
          )}
        </div>

        {/* Chapter Progress Bar */}
        <div className="w-full max-w-md bg-white/80 rounded-2xl p-4 text-left">
          <div className="flex justify-between text-xs sm:text-sm font-bold text-[#3D2C4A]">
            <span>{chapter?.worldName}</span>
            <span>
              {doneInChapter} of {totalInChapter} lessons
            </span>
          </div>
          <div className="h-2.5 rounded-full bg-white mt-2 overflow-hidden">
            <div
              style={{ width: `${chapterPct}%`, backgroundColor: ink }}
              className="h-full rounded-full transition-all duration-500"
            />
          </div>
          <div className="text-xs text-[#4A3A57] mt-1.5">
            {remainCount > 0
              ? `${remainCount} more lesson${remainCount === 1 ? "" : "s"} to reach the chapter check-in.`
              : "All lessons in this chapter done! Time for your chapter check-in."}
          </div>
        </div>

        {/* CTAs */}
        <div className="w-full max-w-md flex flex-col gap-2.5 pt-2">
          <Link
            href={nextHref}
            className="min-h-[54px] rounded-full bg-[#C2456A] hover:bg-[#A8365A] text-white font-bold text-base flex items-center justify-center px-5 shadow-md transition-colors"
          >
            {nextLabel}
          </Link>
          <Link
            href="/dashboard"
            className="min-h-[48px] rounded-full border-2 border-[#3D2C4A] text-[#3D2C4A] hover:bg-white/60 font-bold text-sm flex items-center justify-center transition-colors"
          >
            Back to my garden
          </Link>
          <div className="text-xs text-[#4A3A57] pt-1">
            Gigi&apos;s tip: two lessons a day is plenty. Rest your eyes!
          </div>
        </div>
      </div>
    </DaughterShell>
  );
}

