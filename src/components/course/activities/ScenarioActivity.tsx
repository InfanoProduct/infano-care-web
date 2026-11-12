"use client";

import React, { useState } from "react";
import { User, Star, ArrowRight } from "lucide-react";
import { ActivityProps } from "./CycleMoonActivity";
import { ActivityResultCard } from "./ActivityResultCard";

export function ScenarioActivity({
  config,
  instructions,
  colors,
  petalsOnComplete,
  nextHref,
  onComplete,
}: ActivityProps) {
  const cases: Array<{
    id: string;
    who: string;
    scene: string;
    question: string;
    options: Array<{ id: string; text: string }>;
    correct_option_id: string;
    feedback: string;
  }> = config.cases || [];

  const [idx, setIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [results, setResults] = useState<Record<number, boolean>>({});
  const [reported, setReported] = useState(false);

  const total = cases.length;
  const finished = idx >= total && total > 0;
  const current = cases[Math.min(idx, Math.max(0, total - 1))];
  const answered = selectedOption !== null && !finished;
  const isRight = selectedOption === current?.correct_option_id;
  const rightCount = Object.values(results).filter(Boolean).length;

  const handlePick = (optId: string) => {
    if (selectedOption !== null || !current) return;
    setSelectedOption(optId);
    setResults((prev) => ({ ...prev, [idx]: optId === current.correct_option_id }));
  };

  const handleNext = () => {
    const nextIdx = idx + 1;
    setIdx(nextIdx);
    setSelectedOption(null);
    if (nextIdx >= total && !reported) {
      setReported(true);
      const finalRight = Object.values(results).filter(Boolean).length;
      const pct = total > 0 ? Math.round((finalRight / total) * 100) : 100;
      onComplete({ score: pct });
    }
  };

  const reset = () => {
    setIdx(0);
    setSelectedOption(null);
    setResults({});
  };

  if (finished) {
    return (
      <ActivityResultCard
        title={config.done_title || "Great choices!"}
        line={config.done_line || ""}
        scoreLine={`${rightCount} of ${total} ${config.score_unit || "badges"} earned`}
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
    <div className="flex flex-col gap-5 max-w-2xl mx-auto w-full">
      <p className="m-0 text-sm sm:text-base text-[#4A3A57]">
        {config.instructions || instructions}
      </p>

      {/* Star Progress Dots */}
      <div className="flex gap-2 justify-center">
        {cases.map((_, k) => {
          const r = results[k];
          return (
            <Star
              key={k}
              size={28}
              className={`transition-all ${
                r === undefined
                  ? k === idx
                    ? "text-[#3D2C4A] fill-white scale-110"
                    : "text-[#D9C8D3] fill-white"
                  : r
                  ? "text-[#D99B26] fill-[#FFE08A]"
                  : "text-[#C77D4E] fill-[#F6E2D0]"
              }`}
            />
          );
        })}
      </div>

      {/* Case Card */}
      {current && (
        <div className="bg-white rounded-[26px] overflow-hidden shadow-md border border-[#F1E4E8] animate-in fade-in duration-200">
          <div
            style={{ backgroundColor: colors.background }}
            className="px-5 py-4 flex items-center gap-3.5"
          >
            <span className="w-11 h-11 rounded-full bg-white grid place-items-center shrink-0">
              <User size={22} style={{ color: colors.ink }} />
            </span>
            <div>
              <div
                style={{ color: colors.ink }}
                className="text-xs font-bold tracking-wider uppercase"
              >
                {config.case_label || "CASE"} {idx + 1} OF {total}
              </div>
              <div className="font-['Baloo_2',sans-serif] font-bold text-xl text-[#3D2C4A] leading-tight">
                {current.who}
              </div>
            </div>
          </div>

          <div className="p-5 sm:p-6 flex flex-col gap-4">
            <p className="m-0 text-base sm:text-lg text-[#3D2C4A] leading-relaxed">
              {current.scene}
            </p>
            <h3 className="m-0 text-base sm:text-lg font-bold text-[#3D2C4A]">
              {current.question}
            </h3>

            <div className="flex flex-col gap-2.5">
              {current.options.map((opt) => {
                const isCorrectOpt = opt.id === current.correct_option_id;
                const isPicked = opt.id === selectedOption;
                let cls =
                  "bg-[#FBF8F6] border-[#E9DDE6] text-[#3D2C4A] hover:border-[#3D2C4A]/40";
                if (answered) {
                  if (isCorrectOpt) {
                    cls = "bg-[#EAF7F1] border-2 border-[#2F7F62] text-[#1F5A45]";
                  } else if (isPicked) {
                    cls = "bg-[#F6F1F4] border-[#E9DDE6] text-[#8A7896]";
                  } else {
                    cls = "bg-white border-[#F1E4E8] text-[#8A7896]";
                  }
                }
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handlePick(opt.id)}
                    className={`text-left min-h-[54px] px-4 py-3 rounded-2xl border font-semibold text-sm sm:text-base cursor-pointer transition-all ${cls}`}
                  >
                    {opt.text}
                  </button>
                );
              })}
            </div>

            {answered && (
              <div
                className={`rounded-2xl p-3.5 text-sm sm:text-base font-medium animate-in fade-in ${
                  isRight ? "bg-[#EAF7F1] text-[#1F5A45]" : "bg-[#FFF1E6] text-[#7A3F14]"
                }`}
              >
                <strong>{isRight ? "Spot on!" : "Good thinking, here's the best move:"}</strong>{" "}
                {current.feedback}
              </div>
            )}
          </div>
        </div>
      )}

      {answered && (
        <button
          type="button"
          onClick={handleNext}
          className="min-h-[54px] rounded-full bg-[#3D2C4A] hover:bg-[#2F213A] text-white font-bold text-base inline-flex items-center justify-center gap-2 cursor-pointer shadow-md transition-colors"
        >
          <span>{idx < total - 1 ? "Next" : "See my result"}</span>
          <ArrowRight size={18} />
        </button>
      )}
    </div>
  );
}

