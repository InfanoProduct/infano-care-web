"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCourseCurriculum } from "@/hooks/use-course";
import { useAuthStore } from "@/store/auth-store";
import { ArrowLeft, Play, Shield, Loader2 } from "lucide-react";

const CHAPTER_PARENT_NOTES: Record<string, { note: string; starter: string }> = {
  ch1: {
    note: "Covers the cycle, puberty changes and what a normal flow looks like. Lovely to watch together before her first period.",
    starter: "Ask: “What surprised you most about the cycle?” If you’re comfortable, share your own first-period story.",
  },
  ch2: {
    note: "Everyday care, choosing products (pads, cups, tampons, cloth pads, period underwear) and handling periods at school.",
    starter: "Pack her school pouch together this weekend, and show her where you keep spare pads at home.",
  },
  ch3: {
    note: "Cramps and comfort, signs that need a doctor (PCOS, endometriosis, very heavy or missing periods) and everyday infection care.",
    starter: "Tell her: “If pain ever stops you from doing things, tell me. We’ll see a doctor together.”",
  },
  ch4: {
    note: "Bullying, safe and unsafe touch, the POCSO Act, friendships and feelings, in calm, age-right language. We suggest you watch this chapter first.",
    starter: "Agree on a family code word she can text or say if she ever feels unsafe and wants you to come and get her.",
  },
};

function ParentPreviewContent() {
  const searchParams = useSearchParams();
  const { learners } = useAuthStore();
  const { data: curriculum, isLoading } = useCourseCurriculum();

  const chapters = curriculum?.course?.chapters || [];
  const initialChapter = searchParams.get("chapter") || "ch1";
  const [selectedChapterId, setSelectedChapterId] = useState(initialChapter);

  useEffect(() => {
    const chParam = searchParams.get("chapter");
    if (chParam) setSelectedChapterId(chParam);
  }, [searchParams]);

  const learnerName = learners?.[0]?.name || "your daughter";
  const totalSeconds = chapters.reduce(
    (sum, ch) => sum + ch.lessons.reduce((ls, l) => ls + (l.video?.duration_seconds || 900), 0),
    0
  );
  const totalHours = Math.floor(totalSeconds / 3600);
  const totalRemMins = Math.round((totalSeconds % 3600) / 60);
  const totalTimeLabel = `${totalHours}h ${totalRemMins}m`;

  const activeChapter = chapters.find((c) => c.id === selectedChapterId) || chapters[0];
  const chapterMeta = activeChapter ? CHAPTER_PARENT_NOTES[activeChapter.id] : null;
  const chapterBadge = curriculum?.badges?.find((b) => b.id === activeChapter?.badgeId);
  const chapterMins = activeChapter
    ? Math.round(
        activeChapter.lessons.reduce((s, l) => s + (l.video?.duration_seconds || 900), 0) / 60
      )
    : 45;

  return (
    <div className="min-h-screen bg-[#FBF8F6] text-[#3D2C4A] font-['Noto_Sans',sans-serif]">
      {/* Header */}
      <header className="bg-white border-b border-[#F1E4E8] sticky top-0 z-20">
        <div className="max-w-[1180px] mx-auto px-4 sm:px-6 py-3 flex items-center gap-3">
          <Link
            href="/dashboard/parent"
            aria-label="Back to parent space"
            className="w-11 h-11 rounded-full border border-[#F1E4E8] hover:border-[#3D2C4A] grid place-items-center text-[#3D2C4A] shrink-0 transition-colors"
          >
            <ArrowLeft size={20} />
          </Link>
          <svg width="28" height="28" viewBox="0 0 40 40" aria-hidden="true" className="shrink-0">
            <g transform="translate(20 20)">
              <ellipse rx="6" ry="11" cy="-8" fill="#F4A3B4" />
              <ellipse rx="6" ry="11" cy="-8" fill="#E3DAF5" transform="rotate(72)" />
              <ellipse rx="6" ry="11" cy="-8" fill="#D4EFE4" transform="rotate(144)" />
              <ellipse rx="6" ry="11" cy="-8" fill="#FFE3CC" transform="rotate(216)" />
              <ellipse rx="6" ry="11" cy="-8" fill="#D8ECF8" transform="rotate(288)" />
              <circle r="5" fill="#E8738A" />
            </g>
          </svg>
          <span className="font-bold text-lg sm:text-xl text-[#3D2C4A]">Preview the course</span>
        </div>
      </header>

      <main className="max-w-[1180px] mx-auto px-4 sm:px-6 py-6 sm:py-8 flex flex-col gap-6">
        {isLoading || !activeChapter ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 size={32} className="animate-spin text-[#C2456A]" />
          </div>
        ) : (
          <>
            {/* Intro Hero */}
            <section className="bg-white border border-[#F1E4E8] rounded-[26px] p-5 sm:p-7 flex flex-wrap gap-5 items-center shadow-2xs">
              <div className="flex-1 min-w-[260px]">
                <h1 className="m-0 font-['Baloo_2',sans-serif] text-2xl sm:text-4xl font-bold text-[#3D2C4A] leading-tight">
                  See everything {learnerName} will see
                </h1>
                <p className="mt-2 mb-0 text-sm sm:text-base text-[#4A3A57]">
                  Watch any video and open any activity, in any order. Nothing you open here changes her progress, petals or badges.
                </p>
              </div>
              <div className="grid grid-cols-3 gap-2.5 text-center w-full sm:w-[300px] shrink-0">
                <div className="bg-[#FBF8F6] rounded-2xl p-3">
                  <div className="text-2xl font-bold text-[#3D2C4A]">
                    {curriculum?.course?.lessonCount || 15}
                  </div>
                  <div className="text-xs font-semibold text-[#6E5B7A]">lessons</div>
                </div>
                <div className="bg-[#FBF8F6] rounded-2xl p-3">
                  <div className="text-2xl font-bold text-[#3D2C4A]">{totalTimeLabel}</div>
                  <div className="text-xs font-semibold text-[#6E5B7A]">of video</div>
                </div>
                <div className="bg-[#FBF8F6] rounded-2xl p-3">
                  <div className="text-2xl font-bold text-[#3D2C4A]">
                    {chapters.length}
                  </div>
                  <div className="text-xs font-semibold text-[#6E5B7A]">badges</div>
                </div>
              </div>
            </section>

            {/* Chapter Tabs */}
            <div role="tablist" aria-label="Chapters" className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {chapters.map((ch) => {
                const selected = ch.id === activeChapter.id;
                return (
                  <button
                    key={ch.id}
                    type="button"
                    role="tab"
                    aria-selected={selected}
                    onClick={() => setSelectedChapterId(ch.id)}
                    style={
                      selected
                        ? { backgroundColor: ch.colors.background, borderColor: ch.colors.ink }
                        : { backgroundColor: "#FFFFFF", borderColor: "#F1E4E8" }
                    }
                    className="text-left min-h-[68px] rounded-[20px] px-4 py-3 border-2 font-bold text-[#3D2C4A] cursor-pointer transition-all hover:scale-[1.01]"
                  >
                    <span
                      style={{ color: ch.colors.ink }}
                      className="block text-[11px] font-extrabold tracking-wider uppercase"
                    >
                      CHAPTER {ch.number}
                    </span>
                    <span className="text-sm sm:text-base">{ch.worldName}</span>
                  </button>
                );
              })}
            </div>

            {/* Chapter Details + Lessons */}
            <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left: Chapter Info */}
              <div className="lg:col-span-5 flex flex-col gap-4">
                <div
                  style={{ backgroundColor: activeChapter.colors.background }}
                  className="rounded-[24px] p-5 sm:p-6"
                >
                  <div
                    style={{ color: activeChapter.colors.ink }}
                    className="text-xs font-extrabold uppercase tracking-wider"
                  >
                    CHAPTER {activeChapter.number} · {activeChapter.lessons.length} LESSONS · ABOUT {chapterMins} MIN
                  </div>
                  <h2 className="mt-1 mb-2 font-['Baloo_2',sans-serif] text-2xl sm:text-3xl font-bold text-[#3D2C4A] leading-tight">
                    {activeChapter.worldName}: {activeChapter.theme}
                  </h2>
                  <p className="m-0 text-sm sm:text-base text-[#3D2C4A]">
                    {chapterMeta?.note}
                  </p>
                  <div className="mt-3 text-xs sm:text-sm font-semibold text-[#3D2C4A]">
                    Expert: {(activeChapter.expert?.name || "").replace(" [placeholder]", "")} ({activeChapter.expert?.role}) · Badge: {chapterBadge?.name}
                  </div>
                </div>

                {activeChapter.calmMode && (
                  <div className="bg-white border-2 border-[#A992D6] rounded-[20px] p-4 flex gap-3 items-start">
                    <Shield size={22} className="text-[#5A4385] shrink-0 mt-0.5" />
                    <div className="text-sm text-[#4A3A57]">
                      <strong className="block text-[#3D2C4A] mb-0.5">
                        Watch this chapter before she reaches it
                      </strong>
                      It&apos;s about {chapterMins} minutes. Knowing what she&apos;s learned makes it easier for her to come to you.
                    </div>
                  </div>
                )}

                {chapterMeta?.starter && (
                  <div className="bg-[#FFF4C7] rounded-[20px] p-4">
                    <strong className="block text-xs font-extrabold tracking-wider text-[#7A5A0C] uppercase mb-1">
                      TALK ABOUT IT
                    </strong>
                    <span className="text-sm text-[#3D2C4A]">{chapterMeta.starter}</span>
                  </div>
                )}
              </div>

              {/* Right: Lessons List */}
              <ol className="lg:col-span-7 list-none m-0 p-0 flex flex-col gap-3">
                {activeChapter.lessons.map((l) => (
                  <li
                    key={l.id}
                    className="bg-white border border-[#F1E4E8] rounded-[22px] p-4 sm:p-5 flex flex-col gap-2.5 shadow-2xs"
                  >
                    <div className="flex gap-3 items-start">
                      <span
                        style={{
                          backgroundColor: activeChapter.colors.background,
                          color: activeChapter.colors.ink,
                        }}
                        className="shrink-0 w-11 h-11 rounded-2xl grid place-items-center font-bold text-sm"
                      >
                        {l.code}
                      </span>
                      <div className="flex-1 min-w-0">
                        <h3 className="m-0 text-base sm:text-lg font-bold text-[#3D2C4A]">
                          {l.title}
                        </h3>
                        <div className="text-xs sm:text-sm text-[#5E4B6B]">
                          {Math.round((l.video?.duration_seconds || 900) / 60)} min video · Play: {l.activity?.name}
                        </div>
                      </div>
                    </div>

                    <p className="m-0 text-xs sm:text-sm text-[#4A3A57]">
                      {(l.topics || []).map((tp) => tp.title).join(" · ")}
                    </p>

                    <Link
                      href={`/dashboard/parent/preview/${l.id}`}
                      className="self-start min-h-[42px] px-4 rounded-full border-2 border-[#3D2C4A] hover:bg-[#3D2C4A] text-[#3D2C4A] hover:text-white font-bold text-xs sm:text-sm inline-flex items-center gap-2 transition-colors"
                    >
                      <Play size={14} fill="currentColor" />
                      <span>Preview lesson</span>
                    </Link>
                  </li>
                ))}
              </ol>
            </section>

            <p className="m-0 text-xs sm:text-sm text-[#6E5B7A] text-center">
              Her journal, diary and Worry Jar are never part of the preview. Those stay private to her.
            </p>
          </>
        )}
      </main>
    </div>
  );
}

export default function ParentPreviewPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FBF8F6] flex items-center justify-center">
          <Loader2 size={32} className="animate-spin text-[#C2456A]" />
        </div>
      }
    >
      <ParentPreviewContent />
    </Suspense>
  );
}

