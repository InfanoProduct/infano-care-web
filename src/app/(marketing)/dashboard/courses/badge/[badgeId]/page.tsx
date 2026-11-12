"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { CoursePlayerShell } from "@/components/course/CoursePlayerShell";
import { useActiveLearnerId, useCourseCurriculum, useInvalidateCourse, useLearnerCourseState } from "@/hooks/use-course";
import { CourseService } from "@/services/course.service";
import { Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";

export default function BadgeUnlockPage() {
  const { badgeId } = useParams<{ badgeId: string }>();
  const learnerId = useActiveLearnerId();
  const invalidateCourse = useInvalidateCourse();
  const { data: curriculum, isLoading } = useCourseCurriculum();
  const { data: learnerState } = useLearnerCourseState();

  const [sharedLocal, setSharedLocal] = useState(false);

  if (isLoading || !curriculum) {
    return (
      <CoursePlayerShell darkTheme backHref="/dashboard/badges" backLabel="Badges">
        <div className="flex items-center justify-center py-24">
          <Loader2 size={32} className="animate-spin text-[#F4A3B4]" />
        </div>
      </CoursePlayerShell>
    );
  }

  const badge = curriculum.badges.find((b) => b.id === badgeId);
  const chapter = curriculum.course.chapters.find((c) => c.badgeId === badgeId);
  const nextChapter = chapter
    ? curriculum.course.chapters.find((c) => c.number === chapter.number + 1)
    : null;

  const awardRecord = learnerState?.earnedBadges?.find((a) => a.badgeId === badgeId);
  const isShared = sharedLocal || Boolean(awardRecord?.sharedWithParent);

  const bg = chapter?.colors?.background || "#D8ECF8";
  const ink = chapter?.colors?.ink || "#2F6494";
  const accent = chapter?.colors?.accent || "#8EBFE0";
  const iconPath =
    chapter?.iconSvgPath || "M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z";

  const handleShare = async () => {
    setSharedLocal(true);
    if (learnerId && learnerId !== "default") {
      try {
        await CourseService.shareBadge(learnerId, badgeId);
        invalidateCourse();
      } catch {
        // non-blocking
      }
    }
    toast.success("Badge shared with Mom/Dad's Parent space!");
  };

  return (
    <CoursePlayerShell
      darkTheme
      backHref="/dashboard/journey"
      backLabel="Journey"
      worldName={chapter?.worldName}
      activeStep="badge"
      colors={chapter?.colors}
      gigiTip="You earned this! Only your badge is shared if you choose — your journal stays private."
      maxWidthClass="max-w-3xl"
    >
      <style jsx global>{`
        @keyframes bwrot { to { transform: rotate(360deg); } }
        @keyframes bwin { 0% { transform: scale(0) rotate(-200deg); } 100% { transform: scale(1) rotate(0); } }
        .bw-rays { transform-box: fill-box; transform-origin: center; animation: bwrot 18s linear infinite; }
        .bw-medal { animation: bwin 0.9s cubic-bezier(0.2, 1.5, 0.4, 1) 0.15s both; }
      `}</style>

      <div className="bg-[#3D2C4A] text-white rounded-[34px] p-6 sm:p-10 text-center flex flex-col items-center gap-4 max-w-2xl mx-auto w-full shadow-xl relative overflow-hidden">
        <div className="text-xs sm:text-sm font-bold tracking-[0.14em] text-[#F9D5D3] uppercase">
          BADGE UNLOCKED
        </div>

        <div className="relative w-[240px] h-[240px] sm:w-[280px] sm:h-[280px]">
          <svg className="bw-rays absolute inset-0 w-full h-full" viewBox="0 0 300 300" aria-hidden="true">
            <g fill="#FFFFFF" opacity="0.07">
              {Array.from({ length: 12 }, (_, idx) => (
                <path key={idx} d="M150 150 L140 0 L160 0z" transform={`rotate(${idx * 30} 150 150)`} />
              ))}
            </g>
          </svg>
          <svg
            className="bw-medal absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[180px] h-[180px] sm:w-[200px] sm:h-[200px]"
            viewBox="0 0 200 200"
            role="img"
            aria-label={`${badge?.name || "Chapter"} badge`}
          >
            <circle cx="100" cy="100" r="92" fill={bg} />
            <circle cx="100" cy="100" r="92" fill="none" stroke="#FFFFFF" strokeWidth="8" strokeDasharray="4 10" />
            <circle cx="100" cy="100" r="70" fill="#FFFFFF" />
            <g transform="translate(52 52) scale(4)">
              <path d={iconPath} fill={accent} stroke={ink} strokeWidth="0.8" strokeLinejoin="round" />
            </g>
            <circle cx="62" cy="64" r="4" fill="#FFE08A" />
            <circle cx="140" cy="70" r="3" fill="#FFE08A" />
            <circle cx="128" cy="146" r="3" fill="#FFE08A" />
          </svg>
        </div>

        <h1 className="m-0 font-['Baloo_2',sans-serif] font-bold text-3xl sm:text-4xl text-white leading-tight">
          {badge?.name || "Chapter Badge"}
        </h1>
        <p className="m-0 text-sm sm:text-base text-[#EFE6F2] max-w-md">
          {badge?.description || "Amazing work completing this milestone!"}
          {chapter ? ` ${chapter.worldName} is complete!` : ""}
        </p>

        <div className="inline-flex items-center gap-2 bg-white/15 rounded-full px-4 py-2 text-sm font-bold">
          <svg width="14" height="18" viewBox="0 0 16 22" aria-hidden="true">
            <ellipse cx="8" cy="11" rx="6" ry="10" fill="#F4A3B4" />
          </svg>
          <span>
            +{badge?.petalsOnAward || 50} petals
            {nextChapter ? ` · ${nextChapter.worldName} is open` : ""}
          </span>
        </div>

        <div className="w-full max-w-sm flex flex-col gap-3 pt-3">
          {nextChapter ? (
            <Link
              href={`/dashboard/courses/chapter/${nextChapter.id}`}
              className="min-h-[54px] rounded-full bg-[#F4A3B4] hover:bg-[#F08FA6] text-[#3D2C4A] font-bold text-base flex items-center justify-center transition-colors shadow-md"
            >
              Start {nextChapter.worldName} →
            </Link>
          ) : (
            <Link
              href="/dashboard/courses"
              className="min-h-[54px] rounded-full bg-[#F4A3B4] hover:bg-[#F08FA6] text-[#3D2C4A] font-bold text-base flex items-center justify-center transition-colors shadow-md"
            >
              Back to my worlds
            </Link>
          )}

          <Link
            href="/dashboard/badges"
            className="min-h-[44px] font-bold text-sm text-[#FFE3CC] hover:underline flex items-center justify-center"
          >
            See it on my shelf
          </Link>

          <button
            type="button"
            onClick={handleShare}
            aria-pressed={isShared}
            className="min-h-[50px] rounded-full border-2 border-white text-white hover:bg-white/10 font-bold text-sm cursor-pointer transition-colors"
          >
            {isShared ? "✓ Sent to Mom/Dad's Parent space" : "Show Mom/Dad"}
          </button>

          <div className="text-xs text-[#CBBBD3]">
            Only your badge is shared, nothing else.
          </div>
        </div>
      </div>
    </CoursePlayerShell>
  );
}

