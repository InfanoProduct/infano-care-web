"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { CoursePlayerShell } from "@/components/course/CoursePlayerShell";
import { LessonLockedCard } from "@/components/course/LessonLockedCard";
import { resolveResumeStepPath, useLessonDetail } from "@/hooks/use-course";
import { Gamepad2, Heart, Lightbulb, Lock, Play, Loader2 } from "lucide-react";

const formatSec = (sec: number) => {
  const s = Math.max(0, Math.floor(sec));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
};

export default function LessonHubPage() {
  const { lessonId } = useParams<{ lessonId: string }>();
  const { data, isLoading, isError } = useLessonDetail(lessonId);
  const [sound, setSound] = useState(true);

  if (isError) {
    return (
      <CoursePlayerShell backHref="/dashboard/journey" backLabel="Journey">
        <LessonLockedCard />
      </CoursePlayerShell>
    );
  }

  if (isLoading || !data?.lesson) {
    return (
      <CoursePlayerShell backHref="/dashboard/journey" backLabel="Journey">
        <div className="flex items-center justify-center py-24">
          <Loader2 size={32} className="animate-spin text-[#C2456A]" />
        </div>
      </CoursePlayerShell>
    );
  }

  const { lesson, progress } = data;
  const chapter = lesson.chapter;
  const bg = chapter?.colors?.background || "#D8ECF8";
  const ink = chapter?.colors?.ink || "#2F6494";
  const col = chapter?.colors?.accent || "#8EBFE0";

  const stepsDone = new Set(progress?.stepsDone || []);
  const stepOrder = ["watch", "play", "discover", "reflect"] as const;
  const doneCount = stepOrder.filter((s) => stepsDone.has(s)).length;

  const stepDefs = [
    {
      key: "watch",
      n: 1,
      title: "Watch",
      sub: `Expert video · ${Math.round((lesson.video?.duration_seconds || 900) / 60)} min · ${lesson.pauseAndThink?.length || 3} Pause & think stops`,
      href: `/dashboard/courses/lesson/${lesson.id}/watch`,
      bg: "#D8ECF8",
      ink: "#2F6494",
      Icon: Play,
    },
    {
      key: "play",
      n: 2,
      title: "Play",
      sub: `${lesson.activity?.name || "Activity"} · about ${lesson.activity?.estMinutes || 3} min`,
      href: `/dashboard/courses/lesson/${lesson.id}/play`,
      bg: "#D4EFE4",
      ink: "#24735A",
      Icon: Gamepad2,
    },
    {
      key: "discover",
      n: 3,
      title: "Discover",
      sub: "A fact, a myth-buster and a Gigi wonders card",
      href: `/dashboard/courses/lesson/${lesson.id}/discover`,
      bg: "#FFF4C7",
      ink: "#8A6410",
      Icon: Lightbulb,
    },
    {
      key: "reflect",
      n: 4,
      title: "Reflect",
      sub: "Your private journal + 3 quick questions",
      href: `/dashboard/courses/lesson/${lesson.id}/reflect`,
      bg: "#E3DAF5",
      ink: "#5A4385",
      Icon: Heart,
    },
  ];

  // Sequential step unlocking inside the lesson
  const firstUndoneIdx = stepOrder.findIndex((s) => !stepsDone.has(s));
  const activeStepIdx = firstUndoneIdx === -1 ? 4 : firstUndoneIdx;
  const resumeInfo = resolveResumeStepPath(lesson.id, progress);
  const watchPositionS = progress?.watchPositionS || 0;
  const watchPercent = progress?.watchPercent || 0;

  const flowerLines = [
    "Four steps, four petals. Start with the video!",
    "One petal coloured. Time to play!",
    "Halfway there!",
    "One more petal to bloom!",
    "Your flower bloomed!",
  ];

  return (
    <CoursePlayerShell
      backHref="/dashboard/journey"
      backLabel="Journey"
      worldName={chapter?.worldName || "World"}
      lessonCode={lesson.code}
      lessonId={lesson.id}
      activeStep="hub"
      stepsDone={progress?.stepsDone || []}
      colors={chapter?.colors}
      soundEnabled={sound}
      onToggleSound={() => setSound((s) => !s)}
      calmMode={Boolean(lesson.calmMode)}
      gigiTip="Complete all 4 petals to make your lesson flower bloom!"
      maxWidthClass="max-w-5xl"
    >
      <div className="w-full flex flex-col gap-5">
        {/* Desktop 2-Col Layout / Mobile Stack */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Splash + Title + 4-Petal Flower + Topics */}
          <div className="lg:col-span-5 flex flex-col gap-5">
            {/* Hero Illustration Card */}
            <div
              style={{ backgroundColor: bg }}
              className="relative h-40 sm:h-44 rounded-[28px] overflow-hidden shadow-xs"
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 350 150"
                preserveAspectRatio="none"
                className="absolute inset-0 w-full h-full"
              >
                <circle cx="300" cy="30" r="60" fill="#FFFFFF" opacity="0.45" />
                <circle cx="40" cy="140" r="70" fill="#FFFFFF" opacity="0.35" />
                <path d="M0 120 C 80 90, 160 140, 350 100 V150 H0z" fill={col} opacity="0.55" />
                <circle cx="175" cy="70" r="36" fill="#FFFFFF" opacity="0.7" />
              </svg>
              <span
                style={{ color: ink }}
                className="absolute left-4 bottom-3 bg-white/90 rounded-full px-3 py-1 text-xs font-bold"
              >
                Lesson {lesson.code}
              </span>
            </div>

            <div className="text-center lg:text-left">
              <h1 className="m-0 font-['Baloo_2',sans-serif] font-bold text-3xl sm:text-4xl text-[#3D2C4A] leading-tight">
                {lesson.title}
              </h1>
              <div style={{ color: ink }} className="mt-1 text-sm sm:text-base font-semibold">
                {lesson.tagline}
              </div>
            </div>

            {/* 4-Petal Flower Meter */}
            <div className="flex items-center gap-4 bg-white rounded-[24px] p-4 border border-[#F1E4E8] shadow-2xs">
              <svg
                width="104"
                height="104"
                viewBox="0 0 200 200"
                role="img"
                aria-label={`${doneCount} of 4 petals coloured`}
                className="shrink-0"
              >
                <circle cx="100" cy="100" r="96" fill="#FFFAF6" />
                <g transform="translate(100 100)">
                  <ellipse
                    rx="26"
                    ry="44"
                    cy="-46"
                    fill={stepsDone.has("watch") ? stepDefs[0].bg : "#FBF8F6"}
                    stroke="#E6DCE3"
                    strokeWidth="2"
                  />
                  <ellipse
                    rx="26"
                    ry="44"
                    cy="-46"
                    fill={stepsDone.has("play") ? stepDefs[1].bg : "#FBF8F6"}
                    stroke="#E6DCE3"
                    strokeWidth="2"
                    transform="rotate(90)"
                  />
                  <ellipse
                    rx="26"
                    ry="44"
                    cy="-46"
                    fill={stepsDone.has("discover") ? stepDefs[2].bg : "#FBF8F6"}
                    stroke="#E6DCE3"
                    strokeWidth="2"
                    transform="rotate(180)"
                  />
                  <ellipse
                    rx="26"
                    ry="44"
                    cy="-46"
                    fill={stepsDone.has("reflect") ? stepDefs[3].bg : "#FBF8F6"}
                    stroke="#E6DCE3"
                    strokeWidth="2"
                    transform="rotate(270)"
                  />
                  <circle r="24" fill="#FFE08A" />
                  <text
                    y="8"
                    textAnchor="middle"
                    fontFamily="Baloo 2, sans-serif"
                    fontSize="22"
                    fontWeight="700"
                    fill="#3D2C4A"
                  >
                    {doneCount}/4
                  </text>
                </g>
              </svg>
              <p className="m-0 text-sm sm:text-base font-medium text-[#5E4B6B]">
                {flowerLines[doneCount]}
              </p>
            </div>

            {/* In This Lesson Topics */}
            <section className="bg-white border border-[#F1E4E8] rounded-[24px] p-5 shadow-2xs">
              <h2 className="m-0 mb-3 text-sm font-bold uppercase tracking-wider text-[#3D2C4A]">
                In this lesson
              </h2>
              <ul className="m-0 p-0 list-none flex flex-col gap-2">
                {(lesson.topics || []).map((tp) => (
                  <li key={tp.id} className="flex gap-2.5 text-sm text-[#3D2C4A]">
                    <span
                      style={{ backgroundColor: col }}
                      className="shrink-0 w-2 h-2 mt-2 rounded-full"
                    />
                    <span>{tp.title}</span>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          {/* Right Column: 4 Interactive Steps + Calm Banner */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            {doneCount < 4 && (
              <Link
                href={resumeInfo.href}
                className="min-h-[54px] rounded-full bg-[#C2456A] hover:bg-[#A8365A] text-white font-bold text-base flex items-center justify-center gap-2 shadow-md transition-colors px-6"
              >
                <Play size={16} fill="currentColor" />
                <span>{resumeInfo.label}</span>
              </Link>
            )}

            <ol className="list-none m-0 p-0 flex flex-col gap-3">
              {stepDefs.map((st, i) => {
                const isDone = stepsDone.has(st.key);
                const isNext = i === activeStepIdx;
                const isOpen = isDone || isNext;
                const Icon = st.Icon;
                const isWatchResumable = st.key === "watch" && !isDone && watchPositionS > 5;
                const stepSub = isWatchResumable
                  ? `Paused at ${formatSec(watchPositionS)} · ${watchPercent}% watched`
                  : st.sub;

                if (!isOpen) {
                  return (
                    <li
                      key={st.key}
                      aria-disabled="true"
                      className="flex items-center gap-3.5 rounded-[24px] p-4 bg-[#F6F1F4] text-[#6E5B7A]"
                    >
                      <span className="shrink-0 w-12 h-12 rounded-2xl bg-white grid place-items-center">
                        <Lock size={20} className="text-[#8A7896]" />
                      </span>
                      <div className="flex-1 min-w-0">
                        <span className="block font-bold text-base">
                          {st.n} · {st.title}
                        </span>
                        <span className="block text-xs sm:text-sm">{stepSub}</span>
                      </div>
                    </li>
                  );
                }

                return (
                  <li key={st.key}>
                    <Link
                      href={st.href}
                      className={`flex items-center gap-3.5 rounded-[24px] p-4 sm:p-5 bg-white text-[#3D2C4A] transition-all hover:scale-[1.01] ${
                        isNext
                          ? "border-[2.5px] border-[#C2456A] shadow-[0_10px_24px_rgba(194,69,106,0.14)]"
                          : "border border-[#F1E4E8] shadow-2xs"
                      }`}
                    >
                      <span
                        style={{ backgroundColor: st.bg, color: st.ink }}
                        className="shrink-0 w-12 h-12 rounded-2xl grid place-items-center"
                      >
                        <Icon size={22} />
                      </span>
                      <div className="flex-1 min-w-0">
                        <span className="block font-bold text-base sm:text-lg">
                          {st.n} · {st.title}
                        </span>
                        <span className="block text-xs sm:text-sm text-[#5E4B6B]">{stepSub}</span>
                      </div>
                      <span
                        className={`shrink-0 text-xs font-bold rounded-full px-3 py-1.5 ${
                          isDone
                            ? "bg-[#EAF7F1] text-[#24735A]"
                            : "bg-[#C2456A] text-white"
                        }`}
                      >
                        {isDone ? "Done ✓" : isWatchResumable ? "Resume" : "Up next"}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ol>

            {doneCount === 4 && (
              <Link
                href={`/dashboard/courses/lesson/${lesson.id}/done`}
                className="min-h-[54px] rounded-full bg-[#3D2C4A] hover:bg-[#2F213A] text-white font-bold text-base flex items-center justify-center shadow-md transition-colors"
              >
                See my blooming flower ✨
              </Link>
            )}

            {lesson.calmMode && (
              <div className="bg-[#F1ECFA] rounded-2xl p-4 flex gap-3 items-center text-sm font-medium text-[#3D2C4A]">
                <span className="flex-1">
                  You can pause anytime. If anything feels heavy, talk to someone you trust.
                </span>
                <Link href="/dashboard/journal?tab=worry" className="font-bold text-[#A8365A] hover:underline shrink-0">
                  Talk
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </CoursePlayerShell>
  );
}

