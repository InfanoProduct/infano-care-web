"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, RotateCcw, GripVertical } from "lucide-react";

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

  // Drag and drop states
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [hoveredSlotId, setHoveredSlotId] = useState<string | null>(null);

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

  // Core placement logic
  const handlePlace = (petalId: string, slotId: string) => {
    if (!petalId || placed[slotId]) return;
    if (petalId === slotId) {
      const nextPlaced = { ...placed, [slotId]: true };
      setPlaced(nextPlaced);
      setSelectedId(null);
      setDraggedId(null);
      setHoveredSlotId(null);
      setWrongId(null);
      setLastPlacedId(slotId);
      if (Object.keys(nextPlaced).length === slotsConfig.length && !reported) {
        setReported(true);
        onComplete({ score: 100 });
      }
    } else {
      setWrongId(slotId);
      setSelectedId(petalId);
      setLastPlacedId(null);
    }
  };

  const handleSlotTap = (slotId: string) => {
    if (!selectedId || placed[slotId]) return;
    handlePlace(selectedId, slotId);
  };

  // Drag events (Mouse / Desktop)
  const handleDragStart = (e: React.DragEvent, cardId: string) => {
    e.dataTransfer.setData("text/plain", cardId);
    e.dataTransfer.effectAllowed = "move";
    setDraggedId(cardId);
    setSelectedId(cardId);
    setWrongId(null);
  };

  const handleDragEnd = () => {
    setDraggedId(null);
    setHoveredSlotId(null);
  };

  const handleDragOverSlot = (e: React.DragEvent, slotId: string) => {
    if (placed[slotId]) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (hoveredSlotId !== slotId) {
      setHoveredSlotId(slotId);
    }
  };

  const handleDragLeaveSlot = (e: React.DragEvent) => {
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setHoveredSlotId(null);
  };

  const handleDropOnSlot = (e: React.DragEvent, slotId: string) => {
    e.preventDefault();
    setHoveredSlotId(null);
    const droppedPetalId = e.dataTransfer.getData("text/plain") || draggedId || selectedId;
    if (droppedPetalId) {
      handlePlace(droppedPetalId, slotId);
    }
    setDraggedId(null);
  };

  // Touch drag events (Mobile / Tablet)
  const handleTouchStart = (cardId: string) => {
    setSelectedId(cardId);
    setDraggedId(cardId);
    setWrongId(null);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!draggedId) return;
    const touch = e.touches[0];
    if (!touch) return;
    const target = document.elementFromPoint(touch.clientX, touch.clientY);
    const slotEl = target?.closest("[data-slot-id]") as HTMLElement | null;
    const currentSlotId = slotEl?.dataset?.slotId || null;
    setHoveredSlotId(currentSlotId);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!draggedId) return;
    const touch = e.changedTouches[0];
    if (touch) {
      const target = document.elementFromPoint(touch.clientX, touch.clientY);
      const slotEl = target?.closest("[data-slot-id]") as HTMLElement | null;
      const dropSlotId = slotEl?.dataset?.slotId;
      if (dropSlotId) {
        handlePlace(draggedId, dropSlotId);
      }
    }
    setDraggedId(null);
    setHoveredSlotId(null);
  };

  const reset = () => {
    setSelectedId(null);
    setPlaced({});
    setWrongId(null);
    setLastPlacedId(null);
    setDraggedId(null);
    setHoveredSlotId(null);
  };

  const activeId = draggedId || selectedId;
  const activeSlot = slotsConfig.find((s) => s.id === activeId);
  const lastSlot = slotsConfig.find((s) => s.id === lastPlacedId);

  let feedback = "Drag a petal to the moon (or tap to place).";
  let fbBg = "bg-white";
  if (activeSlot && !wrongId) {
    feedback = `Drop or tap where "${activeSlot.label}" belongs on the moon.`;
  } else if (wrongId && activeSlot) {
    feedback = `Not quite! Hint: ${activeSlot.hint}`;
    fbBg = "bg-[#FFF1E6]";
  } else if (lastSlot && !activeSlot) {
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
              : "Drag a petal to its place on the moon, or tap to place!"}
          </div>
        </div>

        {/* Moon Wheel with Drop Targets */}
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
              const isHovered = hoveredSlotId === slot.id && !filled;
              const isDragActive = !!draggedId && !filled;

              return (
                <button
                  key={slot.id}
                  type="button"
                  data-slot-id={slot.id}
                  onClick={() => handleSlotTap(slot.id)}
                  onDragOver={(e) => handleDragOverSlot(e, slot.id)}
                  onDragLeave={handleDragLeaveSlot}
                  onDrop={(e) => handleDropOnSlot(e, slot.id)}
                  aria-label={filled ? `${slot.label}, ${slot.days}` : `Drop slot for ${slot.days}`}
                  style={{
                    backgroundColor: filled
                      ? slot.color
                      : isHovered
                      ? "rgba(194, 69, 106, 0.15)"
                      : "rgba(255,255,255,0.65)",
                  }}
                  className={`flex flex-col justify-center p-4 gap-0.5 text-[#3D2C4A] cursor-pointer transition-all ${shape} ${
                    filled
                      ? "border-[3px] border-white shadow-sm"
                      : isHovered
                      ? "border-[3px] border-[#C2456A] shadow-md scale-[1.02] bg-[#FDEFF0]"
                      : isDragActive
                      ? "border-[3px] border-dashed border-[#C2456A]/60 animate-pulse"
                      : "border-[3px] border-dashed border-[#B9D4EA] hover:border-[#2F6494]"
                  } ${isWrong ? "animate-pulse ring-2 ring-[#F0AF7E]" : ""}`}
                >
                  <span className="text-[11px] font-bold text-[#5E4B6B]">{slot.days}</span>
                  <span className="font-['Baloo_2',sans-serif] font-bold text-base sm:text-lg leading-tight">
                    {filled ? (
                      slot.label
                    ) : isHovered ? (
                      <span className="text-[#C2456A] text-sm">Drop here</span>
                    ) : (
                      "?"
                    )}
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

      {/* Right/Bottom: Feedback + Draggable Cards or Done Panel */}
      <div className="lg:col-span-6 flex flex-col gap-4 w-full max-w-lg mx-auto">
        <div className={`min-h-[76px] rounded-2xl p-4 text-sm sm:text-base font-medium text-[#3D2C4A] border border-[#F1E4E8] shadow-xs transition-colors ${fbBg}`}>
          {feedback}
        </div>

        {!done ? (
          <div className="grid grid-cols-2 gap-3">
            {remainingCards.map((card) => {
              const isSel = selectedId === card.id;
              const isDragging = draggedId === card.id;

              return (
                <div
                  key={card.id}
                  draggable={!done}
                  onDragStart={(e) => handleDragStart(e, card.id)}
                  onDragEnd={handleDragEnd}
                  onTouchStart={() => handleTouchStart(card.id)}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                  onClick={() => {
                    setSelectedId(card.id);
                    setWrongId(null);
                  }}
                  role="button"
                  tabIndex={0}
                  aria-pressed={isSel}
                  aria-grabbed={isDragging}
                  className={`min-h-[68px] rounded-2xl rounded-bl-md px-3.5 py-2.5 flex items-center justify-between gap-2 text-left font-bold text-sm sm:text-base text-[#3D2C4A] bg-white cursor-grab active:cursor-grabbing select-none transition-all ${
                    isDragging
                      ? "opacity-50 scale-95 border-2 border-dashed border-[#C2456A]"
                      : isSel
                      ? "border-[3px] border-[#C2456A] shadow-md scale-[1.02]"
                      : "border-2 border-white shadow-xs hover:border-[#C2456A]/40 hover:shadow-sm"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <svg width="26" height="30" viewBox="0 0 16 22" aria-hidden="true" className="shrink-0">
                      <ellipse cx="8" cy="11" rx="6" ry="10" fill={card.color} stroke="#3D2C4A" strokeWidth="0.8" />
                    </svg>
                    <span className="truncate">{card.label}</span>
                  </div>
                  <GripVertical size={16} className="text-[#A092A8] shrink-0 opacity-60 hover:opacity-100" />
                </div>
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
