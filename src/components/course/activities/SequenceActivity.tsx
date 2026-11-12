"use client";

import React, { useState } from "react";
import { ArrowRight } from "lucide-react";
import { ActivityProps } from "./CycleMoonActivity";
import { ActivityResultCard } from "./ActivityResultCard";

export function SequenceActivity({
  config,
  instructions,
  colors,
  petalsOnComplete,
  nextHref,
  onComplete,
}: ActivityProps) {
  const rounds: Array<{
    id: string;
    name: string;
    steps_in_order: string[];
    display_order: number[];
  }> = config.rounds || [];

  const [roundIdx, setRoundIdx] = useState(0);
  const [placedCount, setPlacedCount] = useState(0);
  const [wrongIdx, setWrongIdx] = useState<number | null>(null);
  const [tries, setTries] = useState(0);
  const [finished, setFinished] = useState(false);
  const [reported, setReported] = useState(false);

  const round = rounds[Math.min(roundIdx, Math.max(0, rounds.length - 1))];
  const steps = round?.steps_in_order || [];
  const displayOrder = round?.display_order || steps.map((_, i) => i);
  const roundDone = placedCount >= steps.length && steps.length > 0;
  const isLastRound = roundIdx >= rounds.length - 1;

  const remainingTiles = displayOrder.filter((stepIndex) => stepIndex >= placedCount);

  const handlePickTile = (stepIndex: number) => {
    if (stepIndex === placedCount) {
      setPlacedCount((p) => p + 1);
      setWrongIdx(null);
    } else {
      setWrongIdx(stepIndex);
      setTries((t) => t + 1);
    }
  };

  const handleNextRound = () => {
    if (isLastRound) {
      setFinished(true);
      if (!reported) {
        setReported(true);
        const totalSteps = rounds.reduce((s, r) => s + r.steps_in_order.length, 0);
        const pct = Math.max(60, Math.round(((totalSteps - Math.min(tries, totalSteps)) / Math.max(1, totalSteps)) * 100));
        onComplete({ score: pct });
      }
    } else {
      setRoundIdx((r) => r + 1);
      setPlacedCount(0);
      setWrongIdx(null);
    }
  };

  const reset = () => {
    setRoundIdx(0);
    setPlacedCount(0);
    setWrongIdx(null);
    setTries(0);
    setFinished(false);
  };

  if (finished) {
    return (
      <ActivityResultCard
        title={config.done_title || "All in order!"}
        line={config.done_line || ""}
        scoreLine={
          tries === 0
            ? "Perfect order, no mix-ups!"
            : `Done with ${tries} mix-up${tries === 1 ? "" : "s"}. That's how we learn!`
        }
        bg={colors.background}
        ink={colors.ink}
        accent={colors.accent}
        petalsAwarded={petalsOnComplete}
        nextHref={nextHref}
        onReplay={reset}
      />
    );
  }

  return (
    <div className="flex flex-col gap-5 max-w-3xl mx-auto w-full">
      <p className="m-0 text-sm sm:text-base text-[#4A3A57]">
        {config.instructions || instructions}
      </p>

      {/* Round Tabs */}
      <div className="flex gap-2">
        {rounds.map((r, k) => (
          <div
            key={r.id || k}
            style={
              k === roundIdx
                ? { backgroundColor: colors.ink, color: "#FFFFFF" }
                : k < roundIdx
                ? { backgroundColor: colors.background, color: colors.ink }
                : { backgroundColor: "#FFFFFF", color: "#6E5B7A" }
            }
            className="flex-1 text-center rounded-full py-2 px-3 text-xs sm:text-sm font-bold border border-[#F1E4E8]"
          >
            Round {k + 1} · {r.name}
          </div>
        ))}
      </div>

      {/* Responsive Desktop Split: Slots (Left) + Available Tiles (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        <section className="lg:col-span-6 bg-white rounded-[24px] p-5 border border-[#F1E4E8] shadow-xs flex flex-col gap-3">
          <h2 className="m-0 font-['Baloo_2',sans-serif] font-bold text-xl text-[#3D2C4A]">
            {round?.name}
          </h2>
          <ol className="list-none m-0 p-0 flex flex-col gap-2">
            {steps.map((text, k) => {
              const filled = k < placedCount;
              const isNextSlot = k === placedCount;
              return (
                <li
                  key={k}
                  style={filled ? { backgroundColor: colors.background } : undefined}
                  className={`flex items-center gap-3 min-h-[46px] rounded-2xl px-3.5 py-2 text-sm sm:text-base font-semibold transition-all ${
                    filled
                      ? "text-[#3D2C4A]"
                      : "border-2 border-dashed border-[#E3D3DD] text-[#8A7896]"
                  }`}
                >
                  <span
                    style={filled ? { color: colors.ink } : undefined}
                    className={`shrink-0 w-7 h-7 rounded-full grid place-items-center text-xs font-bold ${
                      filled ? "bg-white" : "bg-[#F6F1F4] text-[#8A7896]"
                    }`}
                  >
                    {k + 1}
                  </span>
                  <span>{filled ? text : isNextSlot ? "What comes next?" : ""}</span>
                </li>
              );
            })}
          </ol>
        </section>

        <div className="lg:col-span-6 flex flex-col gap-3">
          {roundDone ? (
            <div className="flex flex-col gap-3 bg-white rounded-[24px] p-5 border border-[#F1E4E8] shadow-sm animate-in fade-in">
              <div className="bg-[#EAF7F1] text-[#1F5A45] rounded-2xl p-4 font-semibold text-sm sm:text-base">
                All in order! Nicely done.
              </div>
              <button
                type="button"
                onClick={handleNextRound}
                className="min-h-[54px] rounded-full bg-[#3D2C4A] hover:bg-[#2F213A] text-white font-bold text-base inline-flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <span>{isLastRound ? "See my result" : "Next round"}</span>
                <ArrowRight size={18} />
              </button>
            </div>
          ) : (
            <div className="bg-white/80 rounded-[24px] p-5 border border-[#F1E4E8] flex flex-col gap-3">
              <div className="text-sm font-semibold text-[#4A3A57]">
                {wrongIdx === null
                  ? "Tap the step that comes next."
                  : config.wrong_hint || "Not yet! Think about what has to happen before that."}
              </div>
              <div className="flex flex-col gap-2.5">
                {remainingTiles.map((stepIndex) => {
                  const isWrong = wrongIdx === stepIndex;
                  return (
                    <button
                      key={stepIndex}
                      type="button"
                      onClick={() => handlePickTile(stepIndex)}
                      className={`text-left min-h-[52px] px-4 py-2.5 rounded-2xl border-2 bg-white text-[#3D2C4A] font-semibold text-sm sm:text-base cursor-pointer transition-all hover:border-[#3D2C4A]/40 ${
                        isWrong ? "border-[#F0AF7E] bg-[#FFF1E6]" : "border-[#E9DDE6]"
                      }`}
                    >
                      {steps[stepIndex]}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

