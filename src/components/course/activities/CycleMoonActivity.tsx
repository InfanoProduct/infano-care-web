"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, RotateCcw } from "lucide-react";

export interface ActivityProps {
  config: any;
  instructions: string;
  colors: { background: string; ink: string; accent: string; soft: string };
  petalsOnComplete: number;
  nextHref: string;
  onComplete: (result: { score: number; flags?: string[] }) => void;
}

export function CycleMoonActivity({
  config,
  colors,
  petalsOnComplete,
  nextHref,
  onComplete,
}: ActivityProps) {
  const slotsConfig: Array<{
    id: string;
    label: string;
    days: string;
    color: string;
    position: string;
    fact: string;
    hint: string;
  }> = config.slots || [];

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [placed, setPlaced] = useState<Record<string, boolean>>({});
  const [wrongId, setWrongId] = useState<string | null>(null);
  const [lastPlacedId, setLastPlacedId] = useState<string | null>(null);
  const [reported, setReported] = useState(false);

  const byPosition: Record<string, any> = {};
  for (const sl of slotsConfig) {
    byPosition[sl.position] = sl;
  }

  // Grid display order: top-left, top-right, bottom-left, bottom-right
  const gridSlots = [
    { slot: byPosition["top_left"] || slotsConfig[3], shape: "rounded-tl-[140px] rounded-tr-md rounded-bl-md rounded-br-md" },
    { slot: byPosition["top_right"] || slotsConfig[0], shape: "rounded-tr-[140px] rounded-tl-md rounded-bl-md rounded-br-md" },
    { slot: byPosition["bottom_left"] || slotsConfig[2], shape: "rounded-bl-[140px] rounded-tl-md rounded-tr-md rounded-br-md" },
    { slot: byPosition["bottom_right"] || slotsConfig[1], shape: "rounded-br-[140px] rounded-tl-md rounded-tr-md rounded-bl-md" },
  ];

  const placedCount = Object.keys(placed).length;
  const done = placedCount === slotsConfig.length && slotsConfig.length > 0;

  // Card display order matches template: release, period, wait, grow
  const cardOrder = ["release", "period", "wait", "grow"];
  const remainingCards = slotsConfig
    .slice()
    .sort((a, b) => cardOrder.indexOf(a.id) - cardOrder.indexOf(b.id))
    .filter((s) => !placed[s.id]);

  const handleSlotTap = (slotId: string) => {
    if (!selectedId || placed[slotId]) return;
    if (selectedId === slotId) {
      const nextPlaced = { ...placed, [slotId]: true };
      setPlaced(nextPlaced);
      setSelectedId(null);
      setWrongId(null);
      setLastPlacedId(slotId);
      if (Object.keys(nextPlaced).length === slotsConfig.length && !reported) {
        setReported(true);
        onComplete({ score: 100 });
      }
    } else {
      setWrongId(slotId);
      setLastPlacedId(null);
    }
  };

  const reset = () => {
    setSelectedId(null);
    setPlaced({});
    setWrongId(null);
    setLastPlacedId(null);
  };

  const selectedSlot = slotsConfig.find((s) => s.id === selectedId);
  const lastSlot = slotsConfig.find((s) => s.id === lastPlacedId);

  let feedback = "Pick a petal to begin.";
  let fbBg = "bg-white";
  if (selectedSlot && !wrongId) {
    feedback = `Now tap where "${selectedSlot.label}" belongs on the moon.`;
  } else if (wrongId && selectedSlot) {
    feedback = `Not quite! Hint: ${selectedSlot.hint}`;
    fbBg = "bg-[#FFF1E6]";
  } else if (lastSlot && !selectedSlot) {
    feedback = lastSlot.fact;
    fbBg = "bg-[#EAF7F1]";
  }
  if (done) {
    feedback = "Period, egg growing, egg released, lining waiting… and round again!";
    fbBg = "bg-[#EAF7F1]";
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
      {/* Left/Top: Gigi Bubble + Moon Wheel */}
      <div className="lg:col-span-6 flex flex-col items-center gap-4">
        <div className="flex gap-3 items-start w-full max-w-md">
          <svg width="46" height="52" viewBox="0 0 120 135" aria-hidden="true" className="shrink-0">
            <circle cx="60" cy="50" r="33" fill="#3D2C4A" />
            <circle cx="31" cy="26" r="11" fill="#3D2C4A" />
            <circle cx="89" cy="26" r="11" fill="#3D2C4A" />
            <circle cx="60" cy="56" r="25" fill="#D9A07E" />
            <path d="M35 49 C 40 30, 80 30, 85 49 C 76 41, 46 41, 35 49z" fill="#3D2C4A" />
            <circle cx="51" cy="58" r="3" fill="#3D2C4A" />
            <circle cx="69" cy="58" r="3" fill="#3D2C4A" />
            <path d="M53 67 Q60 74 67 67" stroke="#3D2C4A" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <path d="M30 135 C 32 98, 46 86, 60 86 C 74 86, 88 98, 90 135z" fill="#E3DAF5" />
          </svg>
          <div className="bg-white rounded-tr-2xl rounded-br-2xl rounded-bl-2xl rounded-tl-xs px-4 py-2.5 font-['Baloo_2',sans-serif] font-semibold text-base sm:text-lg leading-snug text-[#3D2C4A] shadow-xs">
            {done
              ? "Wow! You know your cycle now!"
              : "Tap a petal, then tap its place on the moon. Start at the top right and go round!"}
          </div>
        </div>

        {/* Moon Wheel */}
        <div
          className={`relative w-[292px] h-[292px] sm:w-[320px] sm:h-[320px] transition-transform duration-1000 ${
            done ? "rotate-[360deg]" : ""
          }`}
        >
          <div className="grid grid-cols-2 gap-1.5 w-full h-full">
            {gridSlots.map(({ slot, shape }) => {
              if (!slot) return null;
              const filled = !!placed[slot.id];
              const isWrong = wrongId === slot.id;
              return (
                <button
                  key={slot.id}
                  type="button"
                  onClick={() => handleSlotTap(slot.id)}
                  aria-label={filled ? `${slot.label}, ${slot.days}` : `Empty slot, ${slot.days}`}
                  style={{
                    backgroundColor: filled ? slot.color : "rgba(255,255,255,0.65)",
                  }}
                  className={`flex flex-col justify-center p-4 gap-0.5 text-[#3D2C4A] cursor-pointer transition-all ${shape} ${
                    filled
                      ? "border-[3px] border-white shadow-sm"
                      : "border-[3px] border-dashed border-[#B9D4EA] hover:border-[#2F6494]"
                  } ${isWrong ? "animate-pulse ring-2 ring-[#F0AF7E]" : ""}`}
                >
                  <span className="text-[11px] font-bold text-[#5E4B6B]">{slot.days}</span>
                  <span className="font-['Baloo_2',sans-serif] font-bold text-base sm:text-lg leading-tight">
                    {filled ? slot.label : "?"}
                  </span>
                </button>
              );
            })}
          </div>

          <div
            style={{
              backgroundColor: done ? "#FFF4C7" : "#FFFFFF",
              boxShadow: `0 0 0 6px ${colors.soft || "#E3F0FA"}`,
            }}
            className="absolute left-1/2 top-1/2 w-24 h-24 -translate-x-1/2 -translate-y-1/2 rounded-full grid place-items-center pointer-events-none transition-colors"
          >
            <svg width="44" height="44" viewBox="0 0 24 24" fill={done ? "#F2B544" : "#C9D9E8"} aria-hidden="true">
              <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z" />
            </svg>
          </div>
        </div>

        <p className="text-xs text-[#4A5F72] text-center m-0">
          {config.footnote || "Days shown for a 28-day cycle. Every body has its own rhythm."}
        </p>
      </div>

      {/* Right/Bottom: Feedback + Cards or Done Panel */}
      <div className="lg:col-span-6 flex flex-col gap-4 w-full max-w-lg mx-auto">
        <div className={`min-h-[76px] rounded-2xl p-4 text-sm sm:text-base font-medium text-[#3D2C4A] border border-[#F1E4E8] shadow-xs transition-colors ${fbBg}`}>
          {feedback}
        </div>

        {!done ? (
          <div className="grid grid-cols-2 gap-3">
            {remainingCards.map((card) => {
              const isSel = selectedId === card.id;
              return (
                <button
                  key={card.id}
                  type="button"
                  onClick={() => {
                    setSelectedId(card.id);
                    setWrongId(null);
                  }}
                  aria-pressed={isSel}
                  className={`min-h-[68px] rounded-2xl rounded-bl-md px-3.5 py-2.5 flex items-center gap-2.5 text-left font-bold text-sm sm:text-base text-[#3D2C4A] bg-white cursor-pointer transition-all ${
                    isSel
                      ? "border-[3px] border-[#C2456A] shadow-md scale-[1.02]"
                      : "border-2 border-white shadow-xs hover:border-[#C2456A]/40"
                  }`}
                >
                  <svg width="26" height="30" viewBox="0 0 16 22" aria-hidden="true" className="shrink-0">
                    <ellipse cx="8" cy="11" rx="6" ry="10" fill={card.color} stroke="#3D2C4A" strokeWidth="0.8" />
                  </svg>
                  <span>{card.label}</span>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="bg-[#3D2C4A] text-white rounded-3xl p-6 flex flex-col gap-3 text-center shadow-lg animate-in zoom-in-95">
            <div className="font-['Baloo_2',sans-serif] font-bold text-2xl sm:text-3xl">
              {config.done_title || "You built the cycle!"}
            </div>
            <div className="text-sm sm:text-base text-[#EFE6F2]">
              {config.done_line} · +{petalsOnComplete} petals
            </div>
            <Link
              href={nextHref}
              className="mt-1 min-h-[52px] rounded-full bg-[#F4A3B4] hover:bg-[#F08FA6] text-[#3D2C4A] font-bold text-base flex items-center justify-center gap-2 transition-colors"
            >
              <span>Next: Discover</span>
              <ArrowRight size={18} />
            </Link>
            <button
              type="button"
              onClick={reset}
              className="min-h-[40px] text-sm font-semibold text-white/90 hover:text-white underline cursor-pointer inline-flex items-center justify-center gap-1.5"
            >
              <RotateCcw size={14} />
              <span>Play again</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

