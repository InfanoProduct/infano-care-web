"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Lock, Play, Sparkles } from "lucide-react";

interface LessonLockedCardProps {
  title?: string;
  description?: string;
}

export function LessonLockedCard({
  title = "Unlock the full Girlhood: HerNext course",
  description = "Lesson 1.1 is always free to explore. Unlock all 4 chapters, 15 interactive lessons, activities, and parent guides to continue.",
}: LessonLockedCardProps) {
  return (
    <div className="max-w-xl mx-auto my-8 bg-white border border-[#E9DDE6] rounded-[28px] p-7 sm:p-9 text-center shadow-sm flex flex-col items-center gap-4">
      <div className="w-14 h-14 rounded-2xl bg-[#FFF1E6] text-[#C2456A] grid place-items-center">
        <Lock size={26} />
      </div>
      <span className="inline-flex items-center gap-1.5 bg-[#FFF4EB] text-[#9A4A16] text-xs font-extrabold uppercase tracking-wider px-3 py-1 rounded-full">
        <Sparkles size={12} /> Full Course Required
      </span>
      <h2 className="m-0 font-['Baloo_2',sans-serif] text-2xl sm:text-3xl font-bold text-[#3D2C4A] leading-tight">
        {title}
      </h2>
      <p className="m-0 text-sm sm:text-base text-[#5E4B6B] leading-relaxed">
        {description}
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
        <Link
          href="/course/checkout?plan=course"
          className="inline-flex items-center gap-2 min-h-[48px] px-6 rounded-full bg-[#C2456A] hover:bg-[#A8365A] text-white font-bold text-sm shadow-sm transition-colors"
        >
          <span>Unlock Full Course</span>
          <ArrowRight size={15} />
        </Link>
        <Link
          href="/dashboard/courses/lesson/l1-1"
          className="inline-flex items-center gap-2 min-h-[48px] px-5 rounded-full bg-[#EAF4FB] hover:bg-[#D8ECF8] text-[#2F6494] font-bold text-sm transition-colors"
        >
          <Play size={14} fill="currentColor" />
          <span>Try Free Lesson 1.1</span>
        </Link>
      </div>
    </div>
  );
}

