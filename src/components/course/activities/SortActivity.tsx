"use client";

import React, { useState } from "react";
import { ArrowRight } from "lucide-react";
import { ActivityProps } from "./CycleMoonActivity";
import { ActivityResultCard } from "./ActivityResultCard";

export function SortActivity({
  config,
  instructions,
  colors,
  petalsOnComplete,
  nextHref,
  onComplete,
}: ActivityProps) {
  const buckets: Array<{
    id: string;
    name: string;
    bg: string;
    ink: string;
    icon_svg_path: string;
  }> = config.buckets || [];

  const items: Array<{
    id: string;
    text: string;
    correct_bucket_id: string;
    explanation: string;
  }> = config.items || [];

  const outroSteps: string[] = config.outro_steps || [];

  const [idx, setIdx] = useState(0);
  const [pickedBucketId, setPickedBucketId] = useState<string | null>(null);
  const [rightCount, setRightCount] = useState(0);
  const [reported, setReported] = useState(false);

  const total = items.length;
  const finished = idx >= total && total > 0;
  const current = items[Math.min(idx, Math.max(0, total - 1))];
  const answered = pickedBucketId !== null && !finished;
  const isRight = pickedBucketId === current?.correct_bucket_id;

  // Tally of items sorted so far into each bucket
  const placedSlice = items.slice(0, finished ? total : idx + (pickedBucketId !== null ? 1 : 0));

  const handlePick = (bucketId: string) => {
    if (pickedBucketId !== null || !current) return;
    setPickedBucketId(bucketId);
    if (bucketId === current.correct_bucket_id) {
      setRightCount((c) => c + 1);
    }
  };

  const handleNext = () => {
    const nextIdx = idx + 1;
    setIdx(nextIdx);
    setPickedBucketId(null);
    if (nextIdx >= total && !reported) {
      setReported(true);
      const pct = total > 0 ? Math.round((rightCount / total) * 100) : 100;
      onComplete({ score: pct });
    }
  };

  const reset = () => {
    setIdx(0);
    setPickedBucketId(null);
    setRightCount(0);
  };

  if (finished) {
    return (
      <ActivityResultCard
        title={config.done_title || "All sorted!"}
        line={config.done_line || ""}
        scoreLine={`${rightCount} of ${total} sorted right first time`}
        bg={colors.background}
        ink={colors.ink}
        accent={colors.accent}
        outroSteps={outroSteps}
        petalsAwarded={petalsOnComplete}
        nextHref={nextHref}
        onReplay={reset}
      />
    );
  }

  const gridColsClass =
    buckets.length <= 2
      ? "grid-cols-2"
      : buckets.length === 3
      ? "grid-cols-3"
      : "grid-cols-2 sm:grid-cols-4";

  const correctBucket = buckets.find((b) => b.id === current?.correct_bucket_id);

  return (
    <div className="flex flex-col gap-5 max-w-2xl mx-auto w-full">
      <p className="m-0 text-sm sm:text-base text-[#4A3A57]">
        {config.instructions || instructions}
      </p>

      {/* Bucket Tally Header */}
      <div className={`grid ${gridColsClass} gap-2.5`}>
        {buckets.map((b) => {
          const count = placedSlice.filter((it) => it.correct_bucket_id === b.id).length;
          return (
            <div
              key={b.id}
              style={{ backgroundColor: b.bg }}
              className="rounded-2xl px-2.5 py-2.5 flex flex-col items-center text-center gap-0.5 shadow-2xs"
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke={b.ink}
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d={b.icon_svg_path} />
              </svg>
              <span style={{ color: b.ink }} className="text-xs font-bold leading-tight">
                {b.name}
              </span>
              <span className="font-['Baloo_2',sans-serif] font-bold text-xl text-[#3D2C4A]">
                {count}
              </span>
            </div>
          );
        })}
      </div>

      {/* Active Card */}
      {current && (
        <div className="relative bg-white rounded-[28px] px-6 py-8 min-h-[180px] flex flex-col justify-center items-center text-center gap-2 shadow-md border border-[#F1E4E8] animate-in fade-in duration-200">
          <span
            style={{ color: colors.ink }}
            className="text-xs font-bold tracking-wider uppercase"
          >
            CARD {idx + 1} OF {total}
          </span>
          <div className="font-['Baloo_2',sans-serif] font-bold text-2xl sm:text-[26px] leading-snug text-[#3D2C4A]">
            {current.text}
          </div>
        </div>
      )}

      {/* Bucket Choice Buttons */}
      <div role="group" aria-label="Choose where it goes" className={`grid ${gridColsClass} gap-2.5`}>
        {buckets.map((b) => {
          const isTarget = b.id === current?.correct_bucket_id;
          return (
            <button
              key={b.id}
              type="button"
              onClick={() => handlePick(b.id)}
              style={
                !answered
                  ? { borderColor: b.ink, backgroundColor: "#FFFFFF", color: b.ink }
                  : isTarget
                  ? { borderColor: b.ink, backgroundColor: b.ink, color: "#FFFFFF" }
                  : { borderColor: "#E9DDE6", backgroundColor: "#FBF8F6", color: "#8A7896" }
              }
              className="min-h-[68px] rounded-2xl border-2 px-3 py-2 font-bold text-sm flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-all hover:scale-[1.02] shadow-2xs"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d={b.icon_svg_path} />
              </svg>
              <span className="leading-tight text-center">{b.name}</span>
            </button>
          );
        })}
      </div>

      {/* Feedback & Next */}
      {answered && current && (
        <div className="flex flex-col gap-3 animate-in fade-in">
          <div
            className={`rounded-2xl p-4 text-sm sm:text-base font-medium text-[#3D2C4A] ${
              isRight ? "bg-[#EAF7F1]" : "bg-[#FFF1E6]"
            }`}
          >
            <strong>
              {isRight ? "Yes!" : `Good try. It goes in "${correctBucket?.name}".`}
            </strong>{" "}
            {current.explanation}
          </div>
          <button
            type="button"
            onClick={handleNext}
            className="min-h-[54px] rounded-full bg-[#3D2C4A] hover:bg-[#2F213A] text-white font-bold text-base inline-flex items-center justify-center gap-2 cursor-pointer shadow-md transition-colors"
          >
            <span>{idx < total - 1 ? "Next card" : "See my result"}</span>
            <ArrowRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
}

