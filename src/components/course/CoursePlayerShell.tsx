"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  Gamepad2,
  Heart,
  Lightbulb,
  Play,
  Sparkles,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { useLearnerCourseState } from "@/hooks/use-course";

export type CoursePlayerStep =
  | "chapter"
  | "hub"
  | "watch"
  | "play"
  | "discover"
  | "reflect"
  | "done"
  | "checkin"
  | "badge";

interface CoursePlayerShellProps {
  children: React.ReactNode;
  backHref?: string;
  backLabel?: string;
  worldName?: string;
  lessonCode?: string;
  lessonId?: string;
  activeStep?: CoursePlayerStep;
  stepsDone?: string[];
  colors?: {
    background?: string;
    soft?: string;
    accent?: string;
    ink?: string;
  };
  gigiTip?: string;
  calmMode?: boolean;
  soundEnabled?: boolean;
  onToggleSound?: () => void;
  darkTheme?: boolean;
  maxWidthClass?: string;
  headerMaxWidthClass?: string;
}

const LESSON_STEPS = [
  { key: "watch", label: "Watch", Icon: Play },
  { key: "play", label: "Play", Icon: Gamepad2 },
  { key: "discover", label: "Discover", Icon: Lightbulb },
  { key: "reflect", label: "Reflect", Icon: Heart },
] as const;

export function CoursePlayerShell({
  children,
  backHref = "/dashboard/journey",
  backLabel = "Journey",
  worldName,
  lessonCode,
  lessonId,
  activeStep = "hub",
  stepsDone = [],
  colors,
  gigiTip,
  calmMode = false,
  soundEnabled,
  onToggleSound,
  darkTheme = false,
  maxWidthClass = "max-w-5xl",
  headerMaxWidthClass = "max-w-[1160px]",
}: CoursePlayerShellProps) {
  const { data: learnerState } = useLearnerCourseState();
  const [tipOpen, setTipOpen] = useState(false);

  const worldBg = colors?.background || "#D8ECF8";
  const worldAccent = colors?.accent || "#8EBFE0";
  const worldInk = colors?.ink || "#2F6494";
  const petalsCount = learnerState?.learner?.petalsCount ?? 0;

  const doneSet = new Set(stepsDone);
  const stepOrder = ["watch", "play", "discover", "reflect"];
  const firstUndoneIdx = stepOrder.findIndex((s) => !doneSet.has(s));
  const activeStepIdx = firstUndoneIdx === -1 ? 4 : firstUndoneIdx;

  const showLessonStepper =
    Boolean(lessonId) &&
    ["hub", "watch", "play", "discover", "reflect", "done"].includes(activeStep);

  return (
    <div
      className={`min-h-screen relative overflow-x-hidden flex flex-col font-['Noto_Sans',sans-serif] transition-colors duration-500 ${
        darkTheme ? "bg-[#261A31] text-white" : "bg-[#FFFAF6] text-[#3D2C4A]"
      }`}
    >
      {/* Atmospheric World Backdrop Glows */}
      {!darkTheme && (
        <div
          aria-hidden="true"
          className="fixed inset-0 pointer-events-none overflow-hidden z-0"
        >
          <div
            style={{ backgroundColor: worldBg }}
            className="absolute -top-32 -right-24 w-[460px] h-[460px] rounded-full opacity-55 blur-3xl"
          />
          <div
            style={{ backgroundColor: worldAccent }}
            className="absolute -bottom-36 -left-24 w-[420px] h-[420px] rounded-full opacity-25 blur-3xl"
          />
        </div>
      )}

      {/* Focused Studio Top Chrome */}
      <header
        className={`sticky top-0 z-30 backdrop-blur-md border-b ${
          darkTheme
            ? "bg-[#261A31]/85 border-white/10"
            : "bg-white/85 border-[#F1E4E8]/90"
        }`}
      >
        <div className={`${headerMaxWidthClass} mx-auto px-4 sm:px-6 min-h-[64px] py-2 flex items-center justify-between gap-3`}>
          {/* Left: Exit / Back Pill + World Context */}
          <div className="flex items-center gap-2.5 min-w-0">
            <Link
              href={backHref}
              className={`inline-flex items-center gap-1.5 min-h-[40px] px-3.5 rounded-full font-bold text-xs sm:text-sm border transition-all shrink-0 ${
                darkTheme
                  ? "bg-white/10 border-white/15 text-white hover:bg-white/20"
                  : "bg-white border-[#E9DDE6] text-[#3D2C4A] hover:border-[#3D2C4A] shadow-2xs"
              }`}
            >
              <ArrowLeft size={16} />
              <span>{backLabel}</span>
            </Link>

            {worldName && (
              <span
                style={
                  darkTheme
                    ? { backgroundColor: "rgba(255,255,255,0.12)", color: "#F9D5D3" }
                    : { backgroundColor: worldBg, color: worldInk }
                }
                className="hidden sm:inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-extrabold tracking-wide truncate max-w-[230px]"
              >
                {worldName}
                {lessonCode ? ` · ${lessonCode}` : ""}
              </span>
            )}
          </div>

          {/* Center: 4-Step Lesson Studio Progress (Desktop) */}
          {showLessonStepper && lessonId && (
            <nav
              aria-label="Lesson steps"
              className="hidden md:flex items-center gap-1 bg-[#FFFAF6] border border-[#F1E4E8] rounded-full p-1"
            >
              {LESSON_STEPS.map((st, idx) => {
                const isDone = doneSet.has(st.key);
                const isCurrent = activeStep === st.key;
                const isUnlocked = isDone || idx <= activeStepIdx || isCurrent;
                const Icon = st.Icon;
                const href = `/dashboard/courses/lesson/${lessonId}/${st.key}`;

                if (!isUnlocked) {
                  return (
                    <span
                      key={st.key}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-[#9C8BA7] cursor-not-allowed"
                    >
                      <Icon size={13} />
                      <span>{st.label}</span>
                    </span>
                  );
                }

                return (
                  <Link
                    key={st.key}
                    href={href}
                    aria-current={isCurrent ? "step" : undefined}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                      isCurrent
                        ? "bg-[#C2456A] text-white shadow-xs"
                        : isDone
                        ? "bg-[#EAF7F1] text-[#24735A] hover:bg-[#D4EFE4]"
                        : "text-[#3D2C4A] hover:bg-white"
                    }`}
                  >
                    {isDone && !isCurrent ? (
                      <Check size={13} strokeWidth={3} />
                    ) : (
                      <Icon size={13} />
                    )}
                    <span>{st.label}</span>
                  </Link>
                );
              })}
            </nav>
          )}

          {/* Right: Sound, Gigi Tip, Calm Pause & Petals */}
          <div className="flex items-center gap-2 shrink-0">
            {calmMode && (
              <Link
                href="/dashboard/journal?tab=worry"
                className="hidden sm:inline-flex items-center gap-1 min-h-[38px] px-3 rounded-full bg-[#F1ECFA] text-[#5A4385] hover:bg-[#E3DAF5] text-xs font-bold transition-colors"
              >
                Need a pause?
              </Link>
            )}

            {onToggleSound && (
              <button
                type="button"
                onClick={onToggleSound}
                aria-pressed={soundEnabled}
                aria-label="Music and sounds"
                className="w-10 h-10 rounded-full border border-[#E9DDE6] bg-white hover:bg-[#FDEFF0] grid place-items-center text-[#3D2C4A] cursor-pointer transition-colors"
              >
                {soundEnabled ? <Volume2 size={17} /> : <VolumeX size={17} />}
              </button>
            )}

            {gigiTip && (
              <button
                type="button"
                onClick={() => setTipOpen((v) => !v)}
                aria-expanded={tipOpen}
                aria-label="Gigi's tip"
                className={`inline-flex items-center gap-1.5 min-h-[38px] px-3 rounded-full text-xs font-bold border transition-all cursor-pointer ${
                  tipOpen
                    ? "bg-[#FFE08A] border-[#E8C55A] text-[#5E4105]"
                    : darkTheme
                    ? "bg-white/10 border-white/15 text-[#FFF4C7] hover:bg-white/20"
                    : "bg-[#FFF4C7] border-[#F2DC94] text-[#7A5A0C] hover:bg-[#FFEAA3]"
                }`}
              >
                <Sparkles size={14} />
                <span className="hidden sm:inline">Gigi&apos;s tip</span>
              </button>
            )}

            <span
              title="Your petals"
              className={`inline-flex items-center gap-1.5 min-h-[38px] px-3 rounded-full text-xs sm:text-sm font-bold border ${
                darkTheme
                  ? "bg-white/10 border-white/15 text-white"
                  : "bg-white border-[#F1E4E8] text-[#3D2C4A] shadow-2xs"
              }`}
            >
              <svg width="13" height="17" viewBox="0 0 16 22" aria-hidden="true">
                <ellipse cx="8" cy="11" rx="6" ry="10" fill="#F4A3B4" />
              </svg>
              <span>{petalsCount}</span>
            </span>
          </div>
        </div>

        {/* Mobile Compact Lesson Stepper */}
        {showLessonStepper && lessonId && (
          <div className="md:hidden border-t border-[#F1E4E8]/70 px-3 py-1.5 flex items-center justify-center gap-1 overflow-x-auto bg-white/75">
            {LESSON_STEPS.map((st, idx) => {
              const isDone = doneSet.has(st.key);
              const isCurrent = activeStep === st.key;
              const isUnlocked = isDone || idx <= activeStepIdx || isCurrent;
              const href = `/dashboard/courses/lesson/${lessonId}/${st.key}`;

              if (!isUnlocked) {
                return (
                  <span
                    key={st.key}
                    className="px-2.5 py-1 rounded-full text-[11px] font-semibold text-[#9C8BA7] whitespace-nowrap"
                  >
                    {idx + 1}. {st.label}
                  </span>
                );
              }

              return (
                <Link
                  key={st.key}
                  href={href}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-bold whitespace-nowrap transition-colors ${
                    isCurrent
                      ? "bg-[#C2456A] text-white"
                      : isDone
                      ? "bg-[#EAF7F1] text-[#24735A]"
                      : "text-[#3D2C4A]"
                  }`}
                >
                  {isDone && !isCurrent ? "✓ " : `${idx + 1}. `}
                  {st.label}
                </Link>
              );
            })}
          </div>
        )}

        {/* Collapsible Gigi Whisper Banner */}
        {gigiTip && tipOpen && (
          <div className="bg-[#FFF4C7] border-t border-[#F2DC94] px-4 py-2.5">
            <div className="max-w-[960px] mx-auto flex items-center justify-between gap-3 text-xs sm:text-sm text-[#3D2C4A]">
              <div className="flex items-center gap-2 font-medium">
                <Sparkles size={15} className="text-[#8A6410] shrink-0" />
                <span>
                  <strong className="text-[#7A5A0C]">Gigi says:</strong> {gigiTip}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setTipOpen(false)}
                aria-label="Close tip"
                className="p-1 rounded-full hover:bg-black/5 text-[#7A5A0C] cursor-pointer"
              >
                <X size={15} />
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Main Centered Studio Stage */}
      <main
        className={`relative z-10 flex-1 w-full ${maxWidthClass} mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8 flex flex-col`}
      >
        {children}
      </main>
    </div>
  );
}

