"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ActivityProps } from "./CycleMoonActivity";

const MOUTH_PATHS: Record<string, string> = {
  happy: "M-6 5 Q0 11 6 5",
  calm: "M-5 6 Q0 8 5 6",
  tired: "M-5 7 L5 7",
  crampy: "M-5 8 Q0 4 5 8",
  worried: "M-5 8 Q0 5 5 8",
  grumpy: "M-6 9 Q0 3 6 9",
};

export function MoodGardenActivity({
  config,
  petalsOnComplete,
  nextHref,
  onComplete,
}: ActivityProps) {
  const moods: Array<{
    id: string;
    label: string;
    color: string;
    line: string;
    tools: string[];
  }> = config.moods || [];

  const breathingCfg = config.breathing || { inhale_seconds: 4, exhale_seconds: 6, rounds: 5 };
  const totalSecondsPerRound = (breathingCfg.inhale_seconds || 4) + (breathingCfg.exhale_seconds || 6);
  const totalRounds = breathingCfg.rounds || 5;

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedMoodId, setSelectedMoodId] = useState<string | null>(null);
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const [t, setT] = useState(0);
  const [round, setRound] = useState(0);
  const [reported, setReported] = useState(false);

  const breathDone = round >= totalRounds;

  useEffect(() => {
    if (!running) return;
    const interval = setInterval(() => {
      setT((prevT) => {
        const nextT = prevT + 0.1;
        if (nextT >= totalSecondsPerRound) {
          setRound((prevR) => {
            const nextR = prevR + 1;
            if (nextR >= totalRounds) {
              setRunning(false);
              if (!reported) {
                setReported(true);
                onComplete({ score: 100 });
              }
            }
            return nextR;
          });
          return 0;
        }
        return nextT;
      });
    }, 100);
    return () => clearInterval(interval);
  }, [running, totalSecondsPerRound, totalRounds, reported, onComplete]);

  const currentMood = moods.find((m) => m.id === selectedMoodId) || moods[0];
  const inhale = t < (breathingCfg.inhale_seconds || 4);
  const prog = inhale
    ? t / (breathingCfg.inhale_seconds || 4)
    : 1 - (t - (breathingCfg.inhale_seconds || 4)) / (breathingCfg.exhale_seconds || 6);
  const scale = (0.55 + 0.45 * (running || breathDone ? prog : 0.6)).toFixed(3);

  const phaseText = breathDone
    ? "Well done"
    : !running
    ? "Ready?"
    : inhale
    ? `Breathe in… ${Math.ceil((breathingCfg.inhale_seconds || 4) - t)}`
    : `Breathe out… ${Math.ceil(totalSecondsPerRound - t)}`;

  return (
    <div className="flex flex-col gap-5 max-w-2xl mx-auto w-full">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold bg-white rounded-full px-3 py-1 border border-[#F1E4E8] text-[#5A4385]">
          Step {step} of 3
        </span>
      </div>

      {/* Step 1: Pick Mood Flower */}
      {step === 1 && (
        <div className="flex flex-col gap-4 animate-in fade-in">
          <div className="font-['Baloo_2',sans-serif] font-bold text-2xl sm:text-3xl text-[#3D2C4A] leading-tight">
            Which flower feels like you right now?
          </div>
          <p className="m-0 text-sm text-[#4A3A57]">
            Every feeling is welcome here. Naming it is the first step to calming it.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {moods.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => {
                  setSelectedMoodId(m.id);
                  setSelectedTool(null);
                  setStep(2);
                }}
                className="rounded-[22px] border-2 border-white hover:border-[#A992D6] bg-white p-4 flex flex-col items-center gap-2 text-[#3D2C4A] cursor-pointer shadow-xs transition-all hover:scale-[1.02]"
              >
                <svg width="70" height="70" viewBox="0 0 80 80" aria-hidden="true">
                  <g transform="translate(40 40)">
                    <ellipse rx="11" ry="18" cy="-18" fill={m.color} />
                    <ellipse rx="11" ry="18" cy="-18" fill={m.color} transform="rotate(72)" />
                    <ellipse rx="11" ry="18" cy="-18" fill={m.color} transform="rotate(144)" />
                    <ellipse rx="11" ry="18" cy="-18" fill={m.color} transform="rotate(216)" />
                    <ellipse rx="11" ry="18" cy="-18" fill={m.color} transform="rotate(288)" />
                    <circle r="15" fill="#FFF4C7" />
                    <circle cx="-5" cy="-2" r="1.8" fill="#3D2C4A" />
                    <circle cx="5" cy="-2" r="1.8" fill="#3D2C4A" />
                    <path
                      d={MOUTH_PATHS[m.id] || MOUTH_PATHS.calm}
                      stroke="#3D2C4A"
                      strokeWidth="1.8"
                      fill="none"
                      strokeLinecap="round"
                    />
                  </g>
                </svg>
                <span className="font-bold text-sm">{m.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Coping Tool */}
      {step === 2 && currentMood && (
        <div className="flex flex-col gap-4 animate-in fade-in">
          <div className="bg-white rounded-[22px] p-4 flex items-center gap-3.5 border border-[#F1E4E8]">
            <span
              style={{ backgroundColor: currentMood.color }}
              className="w-12 h-12 rounded-full shrink-0"
            />
            <div>
              <div className="text-xs font-semibold text-[#6E5B7A]">You feel</div>
              <div className="font-['Baloo_2',sans-serif] font-bold text-2xl text-[#3D2C4A]">
                {currentMood.label}
              </div>
            </div>
          </div>

          <div className="font-['Baloo_2',sans-serif] font-bold text-xl sm:text-2xl text-[#3D2C4A]">
            {currentMood.line}
          </div>
          <div className="text-sm text-[#4A3A57]">Pick one thing that could help:</div>

          <div className="flex flex-col gap-2.5">
            {currentMood.tools.map((tool) => {
              const on = selectedTool === tool;
              return (
                <button
                  key={tool}
                  type="button"
                  onClick={() => setSelectedTool(tool)}
                  aria-pressed={on}
                  className={`text-left min-h-[54px] px-4 py-3 rounded-2xl font-semibold text-base cursor-pointer border-2 transition-all ${
                    on
                      ? "bg-[#3D2C4A] text-white border-[#3D2C4A]"
                      : "bg-white text-[#3D2C4A] border-white hover:border-[#A992D6]"
                  }`}
                >
                  {tool}
                </button>
              );
            })}
          </div>

          {selectedTool && (
            <button
              type="button"
              onClick={() => {
                setStep(3);
                setRunning(false);
                setT(0);
                setRound(0);
              }}
              className="min-h-[54px] rounded-full bg-[#3D2C4A] hover:bg-[#2F213A] text-white font-bold text-base cursor-pointer shadow-md"
            >
              Now let&apos;s breathe together
            </button>
          )}
        </div>
      )}

      {/* Step 3: Breathing Flower */}
      {step === 3 && (
        <div className="flex flex-col items-center gap-4 text-center animate-in fade-in">
          <div className="font-['Baloo_2',sans-serif] font-bold text-2xl sm:text-3xl text-[#3D2C4A]">
            The Breathing Flower
          </div>
          <p className="m-0 text-sm text-[#4A3A57]">
            Breathe in as the flower opens ({breathingCfg.inhale_seconds}s), out as it closes ({breathingCfg.exhale_seconds}s).
          </p>

          <div className="relative w-[280px] h-[280px] sm:w-[300px] sm:h-[300px] rounded-full bg-white grid place-items-center shadow-sm">
            <div style={{ transform: `scale(${scale})` }} className="w-[240px] h-[240px] transition-transform duration-100 ease-linear">
              <svg width="240" height="240" viewBox="0 0 200 200" aria-hidden="true">
                <g transform="translate(100 100)">
                  <ellipse rx="22" ry="44" cy="-46" fill="#E3DAF5" />
                  <ellipse rx="22" ry="44" cy="-46" fill="#D6C9F0" transform="rotate(45)" />
                  <ellipse rx="22" ry="44" cy="-46" fill="#E3DAF5" transform="rotate(90)" />
                  <ellipse rx="22" ry="44" cy="-46" fill="#D6C9F0" transform="rotate(135)" />
                  <ellipse rx="22" ry="44" cy="-46" fill="#E3DAF5" transform="rotate(180)" />
                  <ellipse rx="22" ry="44" cy="-46" fill="#D6C9F0" transform="rotate(225)" />
                  <ellipse rx="22" ry="44" cy="-46" fill="#E3DAF5" transform="rotate(270)" />
                  <ellipse rx="22" ry="44" cy="-46" fill="#D6C9F0" transform="rotate(315)" />
                  <circle r="28" fill="#FFE08A" />
                </g>
              </svg>
            </div>
            <div className="absolute font-['Baloo_2',sans-serif] font-bold text-2xl text-[#3D2C4A]" aria-live="polite">
              {phaseText}
            </div>
          </div>

          <div className="flex gap-2">
            {Array.from({ length: totalRounds }, (_, k) => (
              <span
                key={k}
                className={`w-3.5 h-3.5 rounded-full transition-colors ${
                  k < round
                    ? "bg-[#8E6FC9]"
                    : k === round && running
                    ? "bg-[#D6C9F0] border-2 border-[#8E6FC9]"
                    : "bg-white"
                }`}
              />
            ))}
          </div>

          {!breathDone ? (
            <button
              type="button"
              onClick={() => setRunning((r) => !r)}
              className="min-w-[200px] min-h-[54px] rounded-full bg-[#3D2C4A] hover:bg-[#2F213A] text-white font-bold text-base cursor-pointer shadow-md"
            >
              {running ? "Pause" : round > 0 ? "Keep going" : "Start"}
            </button>
          ) : (
            <div className="w-full bg-[#3D2C4A] text-white rounded-[24px] p-6 flex flex-col gap-3 shadow-lg animate-in zoom-in-95">
              <div className="font-['Baloo_2',sans-serif] font-bold text-2xl sm:text-3xl">
                {config.done_title || "Beautifully done."}
              </div>
              <div className="text-sm sm:text-base text-[#EFE6F2]">
                {config.done_line} · +{petalsOnComplete} petals
              </div>
              <Link
                href={nextHref}
                className="min-h-[52px] rounded-full bg-[#D6C9F0] hover:bg-[#C9B6EC] text-[#3D2C4A] font-bold text-base inline-flex items-center justify-center gap-2 transition-colors"
              >
                <span>Next: Discover</span>
                <ArrowRight size={18} />
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Calm Support Banner */}
      <div className="bg-white rounded-2xl px-4 py-3 flex items-center justify-between gap-3 text-sm border border-[#F1E4E8]">
        <span className="text-[#3D2C4A]">Feeling really low or unsafe?</span>
        <Link
          href="/dashboard/journal?tab=worry"
          className="shrink-0 min-h-[38px] px-4 rounded-full bg-[#F1ECFA] hover:bg-[#E3DAF5] inline-flex items-center font-bold text-[#3D2C4A] transition-colors"
        >
          Talk to someone
        </Link>
      </div>
    </div>
  );
}

