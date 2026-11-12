"use client";

import React, { useState } from "react";
import { Lightbulb, Check, X } from "lucide-react";
import { ActivityProps } from "./CycleMoonActivity";
import { ActivityResultCard } from "./ActivityResultCard";

export function FlipCollectActivity({
  config,
  instructions,
  colors,
  petalsOnComplete,
  nextHref,
  onComplete,
}: ActivityProps) {
  const cards: Array<{
    id: string;
    name: string;
    icon_svg_path: string;
    back: string;
    tip: string;
  }> = config.cards || [];
  const collectUnit: string = config.collect_unit || "cards";

  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const [collected, setCollected] = useState<Record<number, boolean>>({});
  const [reported, setReported] = useState(false);

  const gotCount = Object.keys(collected).length;
  const total = cards.length;
  const finished = gotCount === total && total > 0 && openIdx === null;
  const pct = total > 0 ? Math.round((gotCount / total) * 100) : 0;

  const handleCollect = () => {
    if (openIdx === null) return;
    const next = { ...collected, [openIdx]: true };
    setCollected(next);
    setOpenIdx(null);
    if (Object.keys(next).length === total && !reported) {
      setReported(true);
      onComplete({ score: 100 });
    }
  };

  const reset = () => {
    setOpenIdx(null);
    setCollected({});
  };

  const currentCard = openIdx !== null ? cards[openIdx] : null;

  return (
    <div className="flex flex-col gap-5 max-w-3xl mx-auto w-full">
      <p className="m-0 text-sm sm:text-base text-[#4A3A57]">
        {config.instructions || instructions}
      </p>

      {/* Progress Bar */}
      <div className="bg-white rounded-2xl px-4 py-3 flex items-center gap-3 border border-[#F1E4E8] shadow-2xs">
        <span className="font-bold text-sm text-[#3D2C4A] shrink-0">
          {gotCount} of {total} {collectUnit}
        </span>
        <div className="flex-1 h-2.5 rounded-full bg-[#F6F1F4] overflow-hidden">
          <div
            style={{ width: `${pct}%`, backgroundColor: colors.ink }}
            className="h-full rounded-full transition-all duration-300"
          />
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {cards.map((c, idx) => {
          const got = !!collected[idx];
          return (
            <button
              key={c.id || idx}
              type="button"
              onClick={() => setOpenIdx(idx)}
              className={`relative min-h-[126px] rounded-[22px] p-4 flex flex-col items-center justify-center gap-2.5 font-bold text-sm text-[#3D2C4A] bg-white cursor-pointer transition-all hover:scale-[1.02] shadow-xs ${
                got ? "border-2" : "border-2 border-dashed border-[#E3D3DD]"
              }`}
              style={got ? { borderColor: colors.ink } : undefined}
            >
              <span
                style={{ backgroundColor: got ? colors.background : "#FBF8F6" }}
                className="w-12 h-12 rounded-full grid place-items-center"
              >
                <svg
                  width="26"
                  height="26"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke={colors.ink}
                  strokeWidth="1.9"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d={c.icon_svg_path} />
                </svg>
              </span>
              <span className="text-center leading-tight">{c.name}</span>
              {got && (
                <span
                  style={{ borderColor: colors.ink, color: colors.ink }}
                  className="absolute right-2 top-2 w-7 h-7 rounded-full border-2 border-dashed grid place-items-center -rotate-12 text-xs font-extrabold"
                >
                  <Check size={14} />
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Completion Panel */}
      {finished && (
        <ActivityResultCard
          title={config.done_title || "Complete!"}
          line={config.done_line || ""}
          scoreLine={`${total} of ${total} ${collectUnit} collected`}
          bg={colors.background}
          ink={colors.ink}
          accent={colors.accent}
          petalsAwarded={petalsOnComplete}
          nextHref={nextHref}
          onReplay={reset}
        />
      )}

      {/* Detail Modal / Sheet */}
      {currentCard && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#3D2C4A]/40 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in"
          onClick={() => setOpenIdx(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full sm:max-w-md bg-white rounded-t-[28px] sm:rounded-[28px] p-6 flex flex-col gap-4 shadow-2xl animate-in slide-in-from-bottom sm:zoom-in-95"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span
                  style={{ backgroundColor: colors.background }}
                  className="w-14 h-14 rounded-full grid place-items-center shrink-0"
                >
                  <svg
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke={colors.ink}
                    strokeWidth="1.9"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d={currentCard.icon_svg_path} />
                  </svg>
                </span>
                <h3 className="m-0 font-['Baloo_2',sans-serif] font-bold text-2xl text-[#3D2C4A]">
                  {currentCard.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setOpenIdx(null)}
                aria-label="Close"
                className="w-9 h-9 rounded-full bg-[#FFFAF6] hover:bg-[#F1E4E8] grid place-items-center text-[#3D2C4A] cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <p className="m-0 text-base text-[#3D2C4A] leading-relaxed">{currentCard.back}</p>

            {currentCard.tip && (
              <div className="flex gap-2.5 items-start bg-[#FFF4C7] rounded-2xl p-3 text-sm font-medium text-[#3D2C4A]">
                <Lightbulb size={18} className="text-[#8A6410] shrink-0 mt-0.5" />
                <span>
                  <strong>Gigi&apos;s tip:</strong> {currentCard.tip}
                </span>
              </div>
            )}

            <button
              type="button"
              onClick={handleCollect}
              className="min-h-[52px] rounded-full bg-[#C2456A] hover:bg-[#A8365A] text-white font-bold text-base cursor-pointer transition-colors"
            >
              {openIdx !== null && collected[openIdx] ? "Close" : "Collect it"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

