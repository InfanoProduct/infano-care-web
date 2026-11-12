"use client";

import React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useLessonDetail } from "@/hooks/use-course";
import { useAuthStore } from "@/store/auth-store";
import { ArrowLeft, Eye, Lock, Play, Loader2 } from "lucide-react";

const CHAPTER_STARTERS: Record<string, string> = {
  ch1: "Ask: “What surprised you most about the cycle?” If you’re comfortable, share your own first-period story.",
  ch2: "Pack her school pouch together this weekend, and show her where you keep spare pads at home.",
  ch3: "Tell her: “If pain ever stops you from doing things, tell me. We’ll see a doctor together.”",
  ch4: "Agree on a family code word she can text or say if she ever feels unsafe and wants you to come and get her.",
};

export default function ParentLessonPreviewPage() {
  const { lessonId } = useParams<{ lessonId: string }>();
  const { learners } = useAuthStore();
  const { data, isLoading } = useLessonDetail(lessonId);

  const learnerName = learners?.[0]?.name || "your daughter";

  if (isLoading || !data?.lesson) {
    return (
      <div className="min-h-screen bg-[#FBF8F6] flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-[#C2456A]" />
      </div>
    );
  }

  const { lesson, prevLesson, nextLesson } = data;
  const chapter = lesson.chapter;
  const bg = chapter?.colors?.background || "#D8ECF8";
  const ink = chapter?.colors?.ink || "#2F6494";
  const totalSec = lesson.video?.duration_seconds || 900;

  return (
    <div className="min-h-screen bg-[#FBF8F6] text-[#3D2C4A] font-['Noto_Sans',sans-serif]">
      <header className="bg-white border-b border-[#F1E4E8] sticky top-0 z-20">
        <div className="max-w-[1180px] mx-auto px-4 sm:px-6 py-3 flex items-center gap-3">
          <Link
            href={`/dashboard/parent/preview?chapter=${chapter?.id || "ch1"}`}
            aria-label="Back to course preview"
            className="w-11 h-11 rounded-full border border-[#F1E4E8] hover:border-[#3D2C4A] grid place-items-center text-[#3D2C4A] shrink-0"
          >
            <ArrowLeft size={20} />
          </Link>
          <span className="font-bold text-lg sm:text-xl text-[#3D2C4A]">Lesson preview</span>
        </div>
      </header>

      <main className="max-w-[1180px] mx-auto px-4 sm:px-6 py-6 sm:py-8 flex flex-col gap-5">
        {/* Preview Status Banner */}
        <div role="status" className="bg-[#F1ECFA] rounded-2xl px-4 py-3 text-sm font-semibold text-[#3D2C4A] flex items-center gap-2.5">
          <Eye size={18} className="text-[#5A4385] shrink-0" />
          <span>Preview mode: nothing here changes {learnerName}&apos;s progress, petals or badges.</span>
        </div>

        {/* Title */}
        <div>
          <div style={{ color: ink }} className="text-xs font-extrabold uppercase tracking-wider">
            CHAPTER {chapter?.number} · {chapter?.worldName} · LESSON {lesson.code}
          </div>
          <h1 className="m-0 mt-1 font-['Baloo_2',sans-serif] text-2xl sm:text-4xl font-bold text-[#3D2C4A]">
            {lesson.title}
          </h1>
          <div className="text-sm sm:text-base font-semibold text-[#5E4B6B]">{lesson.tagline}</div>
        </div>

        {/* Two Column Desktop Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left: Video + Topics + Talk Starter */}
          <section className="lg:col-span-6 flex flex-col gap-4">
            <div style={{ borderColor: bg }} className="rounded-[22px] overflow-hidden bg-[#3D2C4A] border-[5px] shadow-md">
              <div className="relative aspect-video bg-[#23182D] grid place-items-center">
                {lesson.video?.url ? (
                  <video src={lesson.video.url} controls className="w-full h-full object-cover" />
                ) : (
                  <>
                    <span className="absolute left-3 top-3 bg-white/15 text-white rounded-full px-3 py-1 text-xs font-semibold">
                      Expert video · {lesson.video?.duration_label || "15:00"}
                    </span>
                    <div className="w-16 h-16 rounded-full bg-white/90 grid place-items-center text-[#3D2C4A]">
                      <Play size={26} fill="currentColor" className="ml-0.5" />
                    </div>
                  </>
                )}
              </div>
              <div className="relative h-5 mx-3 my-2">
                <div className="absolute left-0 right-0 top-2 h-1.5 rounded-full bg-white/20" />
                {(lesson.pauseAndThink || []).map((pq) => (
                  <span
                    key={pq.id}
                    title={`Pause & think at ${pq.at_label || ""}`}
                    style={{ left: `${(pq.at_seconds / totalSec) * 100}%` }}
                    className="absolute top-1 w-3 h-3 -translate-x-1.5 rotate-45 rounded-[3px] bg-[#FFE08A]"
                  />
                ))}
              </div>
            </div>

            <div className="text-xs sm:text-sm text-[#5E4B6B]">
              {(lesson.video?.expert?.name || chapter?.expert?.name || "").replace(" [placeholder]", "")} ({lesson.video?.expert?.role || chapter?.expert?.role}) · Hinglish with English captions
            </div>

            <ol className="list-none m-0 px-4 py-1.5 bg-white border border-[#F1E4E8] rounded-[20px]">
              {(lesson.topics || []).map((tp) => (
                <li key={tp.id} className="flex gap-3 py-2.5 border-b border-[#F3E9EE] last:border-b-0 text-sm">
                  <span style={{ color: ink }} className="shrink-0 w-11 font-bold tabular-nums">
                    {tp.start_label}
                  </span>
                  <span>{tp.title}</span>
                </li>
              ))}
            </ol>

            {chapter?.id && CHAPTER_STARTERS[chapter.id] && (
              <div className="bg-[#FFF4C7] rounded-[20px] p-4">
                <strong className="block text-xs font-extrabold tracking-wider text-[#7A5A0C] uppercase mb-1">
                  TALK ABOUT IT
                </strong>
                <span className="text-sm text-[#3D2C4A]">{CHAPTER_STARTERS[chapter.id]}</span>
              </div>
            )}

            {lesson.calmMode && (
              <div className="bg-white border-2 border-[#A992D6] rounded-[18px] p-4 text-sm text-[#3D2C4A]">
                If {learnerName} ever tells you something worrying, stay calm, believe her and thank her for telling you. Child Helpline 1098 and 112 can help you too.
              </div>
            )}
          </section>

          {/* Right: Her 4 Steps Breakdown */}
          <section className="lg:col-span-6 flex flex-col gap-3.5">
            <h2 className="m-0 text-xl font-bold text-[#3D2C4A]">Her 4 steps</h2>

            <div className="bg-white border border-[#F1E4E8] rounded-[20px] p-4 sm:p-5">
              <div className="font-bold text-base">
                <span className="text-[#2F6494]">1 · Watch</span> with {lesson.pauseAndThink?.length || 3} Pause &amp; think questions
              </div>
              <ul className="mt-2.5 mb-0 p-0 list-none flex flex-col gap-2 text-sm">
                {(lesson.pauseAndThink || []).map((pq) => {
                  const ans = pq.options.find((o) => o.id === pq.correct_option_id)?.text;
                  return (
                    <li key={pq.id}>
                      <strong>{pq.at_label || ""}</strong> {pq.prompt}{" "}
                      <span className="text-[#24735A] font-semibold">Answer: {ans}</span>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="bg-white border border-[#F1E4E8] rounded-[20px] p-4 sm:p-5">
              <div className="font-bold text-base">
                <span className="text-[#24735A]">2 · Play</span> {lesson.activity?.name} · about {lesson.activity?.estMinutes || 3} min
              </div>
              <p className="mt-1.5 mb-0 text-sm text-[#4A3A57]">{lesson.activity?.instructions}</p>
            </div>

            <div className="bg-white border border-[#F1E4E8] rounded-[20px] p-4 sm:p-5">
              <div className="font-bold text-base">
                <span className="text-[#8A6410]">3 · Discover</span> {lesson.discoverCards?.length || 3} quick cards
              </div>
              <ul className="mt-2.5 mb-0 p-0 list-none flex flex-col gap-2.5 text-sm">
                {(lesson.discoverCards || []).map((c) => (
                  <li key={c.id}>
                    <span className="block text-[11px] font-bold tracking-wider text-[#6E5B7A] uppercase">
                      {c.label}
                    </span>
                    <strong>{c.front}</strong> {c.back}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white border border-[#F1E4E8] rounded-[20px] p-4 sm:p-5">
              <div className="font-bold text-base">
                <span className="text-[#5A4385]">4 · Reflect</span> journal prompt + {lesson.reflect?.quick_check?.length || 3} quick questions
              </div>
              <p className="mt-2 mb-0 text-sm sm:text-base">&ldquo;{lesson.reflect?.journal_prompt}&rdquo;</p>
              <p className="mt-2 mb-0 text-xs text-[#6E5B7A] flex items-center gap-1.5">
                <Lock size={12} />
                Her answers stay private. You won&apos;t see what she writes.
              </p>
            </div>
          </section>
        </div>

        {/* Bottom Prev/Next Nav */}
        <nav aria-label="Lessons" className="flex flex-wrap gap-3 justify-between pt-2">
          {prevLesson ? (
            <Link
              href={`/dashboard/parent/preview/${prevLesson.id}`}
              className="min-h-[48px] px-5 rounded-full border-2 border-[#3D2C4A] bg-white text-[#3D2C4A] font-bold text-sm inline-flex items-center"
            >
              ← {prevLesson.code} {prevLesson.title}
            </Link>
          ) : (
            <Link
              href="/dashboard/parent/preview"
              className="min-h-[48px] px-5 rounded-full border-2 border-[#3D2C4A] bg-white text-[#3D2C4A] font-bold text-sm inline-flex items-center"
            >
              ← Course preview
            </Link>
          )}

          {nextLesson ? (
            <Link
              href={`/dashboard/parent/preview/${nextLesson.id}`}
              className="min-h-[48px] px-5 rounded-full bg-[#C2456A] hover:bg-[#A8365A] text-white font-bold text-sm inline-flex items-center"
            >
              {nextLesson.code} {nextLesson.title} →
            </Link>
          ) : (
            <Link
              href="/dashboard/parent/preview"
              className="min-h-[48px] px-5 rounded-full bg-[#C2456A] hover:bg-[#A8365A] text-white font-bold text-sm inline-flex items-center"
            >
              Back to course preview
            </Link>
          )}
        </nav>
      </main>
    </div>
  );
}

