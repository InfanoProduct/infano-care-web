"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { CoursePlayerShell } from "@/components/course/CoursePlayerShell";
import { LessonLockedCard } from "@/components/course/LessonLockedCard";
import { useActiveLearnerId, useInvalidateCourse, useLessonDetail } from "@/hooks/use-course";
import { CourseService } from "@/services/course.service";
import { ArrowRight, Heart, Moon, Sparkles, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";

const CARD_STYLES: Record<string, { bg: string; ink: string; Icon: any }> = {
  fact: { bg: "#D8ECF8", ink: "#2F6494", Icon: Sparkles },
  myth: { bg: "#F9D5D3", ink: "#A8365A", Icon: Heart },
  gigi_wonders: { bg: "#E3DAF5", ink: "#5A4385", Icon: Moon },
};

export default function LessonDiscoverPage() {
  const { lessonId } = useParams<{ lessonId: string }>();
  const router = useRouter();
  const learnerId = useActiveLearnerId();
  const invalidateCourse = useInvalidateCourse();
  const { data, isLoading, isError } = useLessonDetail(lessonId);

  const [idx, setIdx] = useState(0);
  const [revealed, setRevealed] = useState<Record<number, boolean>>({});
  const [submitting, setSubmitting] = useState(false);

  if (isError) {
    return (
      <CoursePlayerShell backHref="/dashboard/journey" backLabel="Journey">
        <LessonLockedCard />
      </CoursePlayerShell>
    );
  }

  if (isLoading || !data?.lesson) {
    return (
      <CoursePlayerShell backHref={`/dashboard/courses/lesson/${lessonId}`} backLabel="Lesson Hub">
        <div className="flex items-center justify-center py-24">
          <Loader2 size={32} className="animate-spin text-[#C2456A]" />
        </div>
      </CoursePlayerShell>
    );
  }

  const { lesson } = data;
  const cards = lesson.discoverCards || [];
  const cur = cards[Math.min(idx, Math.max(0, cards.length - 1))];
  const isLast = idx >= cards.length - 1;
  const style = CARD_STYLES[cur?.kind] || CARD_STYLES.fact;
  const CardIcon = style.Icon;
  const isShown = !!revealed[idx];

  const handleFinishDiscover = async () => {
    setSubmitting(true);
    try {
      if (learnerId && learnerId !== "default") {
        const mythIds = cards
          .filter((c) => c.counts_as_myth_busted)
          .map((c) => `${lesson.id}:${c.id}`);
        const res: any = await CourseService.completeDiscover(learnerId, lesson.id, {
          bustedMythIds: mythIds,
        });
        await invalidateCourse();
        if (res?.petalsAwarded > 0) {
          toast.success(`Discover complete! +${res.petalsAwarded} petals ✨`);
        }
      }
    } catch {
      // allow navigation even if offline
    } finally {
      setSubmitting(false);
      router.push(`/dashboard/courses/lesson/${lesson.id}/reflect`);
    }
  };

  return (
    <CoursePlayerShell
      backHref={`/dashboard/courses/lesson/${lesson.id}`}
      backLabel="Lesson Hub"
      worldName={lesson.chapter?.worldName}
      lessonCode={lesson.code}
      lessonId={lesson.id}
      activeStep="discover"
      stepsDone={data?.progress?.stepsDone || []}
      colors={lesson.chapter?.colors}
      calmMode={Boolean(lesson.calmMode)}
      gigiTip="Tap to flip open each myth and curiosity card!"
      maxWidthClass="max-w-3xl"
    >
      <div className="bg-[#FFF8E1] rounded-[32px] p-5 sm:p-8 border border-[#F3E3A1] shadow-xs flex flex-col gap-6 w-full min-h-[70vh]">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <div className="text-xs font-extrabold uppercase tracking-wider text-[#8A6410]">
              STEP 3 · DISCOVER · LESSON {lesson.code}
            </div>
            <h1 className="m-0 font-['Baloo_2',sans-serif] font-bold text-2xl sm:text-3xl text-[#3D2C4A]">
              Did you know?
            </h1>
          </div>
          <span className="bg-white rounded-full px-3.5 py-1 text-xs sm:text-sm font-bold text-[#3D2C4A] shadow-2xs">
            {idx + 1}/{cards.length || 3}
          </span>
        </div>

        {/* Stacked Card Visual */}
        {cur && (
          <div className="relative flex-1 min-h-[420px] sm:min-h-[450px] my-1">
            <div className="hidden sm:block absolute left-6 right-6 top-6 bottom-0 rounded-[30px] bg-[#F3E3A1] rotate-2" />
            <div className="hidden sm:block absolute left-3 right-3 top-3 bottom-2 rounded-[30px] bg-[#F8EDB8] -rotate-1" />

            <div
              key={cur.id || idx}
              style={{ backgroundColor: style.bg }}
              className="relative h-full min-h-[400px] rounded-[30px] p-6 sm:p-8 flex flex-col gap-4 shadow-lg animate-in fade-in duration-300"
            >
              <span className="self-start bg-white/85 rounded-full px-3.5 py-1 text-xs font-extrabold tracking-wider text-[#3D2C4A]">
                {cur.label}
              </span>

              <div className="grid place-items-center py-4">
                <CardIcon size={96} style={{ color: style.ink }} strokeWidth={1.3} />
              </div>

              <div className="font-['Baloo_2',sans-serif] font-bold text-2xl sm:text-[28px] leading-snug text-[#3D2C4A]">
                {cur.front}
              </div>

              {cur.tap_to_reveal ? (
                !isShown ? (
                  <button
                    type="button"
                    onClick={() => setRevealed((r) => ({ ...r, [idx]: true }))}
                    className="self-start min-h-[48px] px-5 rounded-full bg-[#3D2C4A] hover:bg-[#2F213A] text-white font-bold text-sm cursor-pointer transition-colors"
                  >
                    {cur.kind === "myth" ? "Myth or fact? Tap to find out" : "Tap to see the answer"}
                  </button>
                ) : (
                  <div className="bg-white rounded-2xl p-4 text-sm sm:text-base font-medium text-[#3D2C4A] shadow-2xs animate-in fade-in">
                    {cur.verdict && (
                      <strong style={{ color: style.ink }} className="mr-1.5">
                        {cur.verdict}
                      </strong>
                    )}
                    {cur.back}
                  </div>
                )
              ) : (
                <div className="text-base text-[#4A3A57] font-medium leading-relaxed">
                  {cur.back}
                </div>
              )}

              <div className="mt-auto pt-3 text-xs text-[#6E5B7A]">
                Reviewed by our adolescent health panel
              </div>
            </div>
          </div>
        )}

        {/* Dots */}
        <div className="flex justify-center gap-2" aria-hidden="true">
          {cards.map((c, k) => (
            <span
              key={c.id || k}
              className={`h-2 rounded-full transition-all ${
                k === idx ? "w-6 bg-[#3D2C4A]" : "w-2 bg-[#E3D49A]"
              }`}
            />
          ))}
        </div>

        {/* Navigation Controls */}
        <div className="flex gap-3">
          {idx > 0 && (
            <button
              type="button"
              onClick={() => setIdx((i) => Math.max(0, i - 1))}
              className="min-h-[54px] px-6 rounded-full border-2 border-[#3D2C4A] bg-white hover:bg-[#FFFAF6] text-[#3D2C4A] font-bold text-base cursor-pointer"
            >
              Back
            </button>
          )}
          {!isLast ? (
            <button
              type="button"
              onClick={() => setIdx((i) => Math.min(cards.length - 1, i + 1))}
              className="flex-1 min-h-[54px] rounded-full bg-[#3D2C4A] hover:bg-[#2F213A] text-white font-bold text-base inline-flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              <span>Next card</span>
              <ArrowRight size={18} />
            </button>
          ) : (
            <button
              type="button"
              disabled={submitting}
              onClick={handleFinishDiscover}
              className="flex-1 min-h-[54px] rounded-full bg-[#C2456A] hover:bg-[#A8365A] text-white font-bold text-base inline-flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-60"
            >
              <span>{submitting ? "Saving..." : "Next: Reflect"}</span>
              <ArrowRight size={18} />
            </button>
          )}
        </div>
      </div>
    </CoursePlayerShell>
  );
}

