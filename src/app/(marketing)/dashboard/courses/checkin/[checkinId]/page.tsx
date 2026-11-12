"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { CoursePlayerShell } from "@/components/course/CoursePlayerShell";
import { LessonLockedCard } from "@/components/course/LessonLockedCard";
import { useActiveLearnerId, useCheckinDetail, useInvalidateCourse } from "@/hooks/use-course";
import { CourseService } from "@/services/course.service";
import { ArrowRight, Lightbulb, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";

// Map seed target_screen (e.g. "L11-Watch", "L12-Play") to Next.js routes
function resolveReviewTarget(targetScreen: string): string {
  const m = targetScreen.match(/^L(\d)(\d+)-(\w+)$/i);
  if (!m) return "/dashboard/journey";
  const lessonId = `l${m[1]}-${m[2]}`;
  const step = m[3].toLowerCase();
  if (step === "hub") return `/dashboard/courses/lesson/${lessonId}`;
  return `/dashboard/courses/lesson/${lessonId}/${step}`;
}

export default function CheckinQuizPage() {
  const { checkinId } = useParams<{ checkinId: string }>();
  const learnerId = useActiveLearnerId();
  const invalidateCourse = useInvalidateCourse();
  const { data, isLoading, isError } = useCheckinDetail(checkinId);

  const [qIdx, setQIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [hintsShown, setHintsShown] = useState<Record<string, boolean>>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverResult, setServerResult] = useState<{
    score: number;
    total: number;
    passMark: number;
    passed: boolean;
    knows: string[];
    petalsAwarded: number;
  } | null>(null);

  if (isError) {
    return (
      <CoursePlayerShell backHref="/dashboard/journey" backLabel="Journey">
        <LessonLockedCard
          title="Unlock HerNext to take chapter check-ins"
          description="Chapter check-ins and certificates unlock with full course enrollment. Lesson 1.1 remains free to try anytime."
        />
      </CoursePlayerShell>
    );
  }

  if (isLoading || !data?.checkin) {
    return (
      <CoursePlayerShell backHref="/dashboard/journey" backLabel="Journey">
        <div className="flex items-center justify-center py-24">
          <Loader2 size={32} className="animate-spin text-[#C2456A]" />
        </div>
      </CoursePlayerShell>
    );
  }

  const { checkin } = data;
  const chapter = checkin.chapter;
  const softBg = chapter?.colors?.soft || "#E3F0FA";
  const ink = chapter?.colors?.ink || "#2F6494";
  const accent = chapter?.colors?.accent || "#8EBFE0";
  const accentLight = chapter?.colors?.accent_light || "#B7D8EF";
  const bgChip = chapter?.colors?.background || "#D8ECF8";

  const questions = checkin.questions || [];
  const total = questions.length;
  const curQ = questions[Math.min(qIdx, Math.max(0, total - 1))];
  const pickedOpt = curQ ? answers[curQ.id] : undefined;
  const answered = pickedOpt !== undefined;
  const isRight = curQ && pickedOpt === curQ.correct_option_id;
  const letters = ["A", "B", "C", "D"];

  const handlePick = (optId: string) => {
    if (!curQ || answered) return;
    setAnswers((prev) => ({ ...prev, [curQ.id]: optId }));
  };

  const handleNext = async () => {
    if (qIdx < total - 1) {
      setQIdx((i) => i + 1);
      return;
    }

    // Submit check-in to backend
    setSubmitting(true);
    try {
      if (learnerId && learnerId !== "default") {
        const res = await CourseService.submitCheckin(learnerId, checkin.id, answers);
        await invalidateCourse();
        setServerResult(res);
        if (res.petalsAwarded > 0) {
          toast.success(`+${res.petalsAwarded} petals earned! 🌸`);
        }
      } else {
        // Offline / preview fallback calculation
        let score = 0;
        const knows: string[] = [];
        for (const q of questions) {
          if (answers[q.id] === q.correct_option_id) {
            score += 1;
            if (q.skill_tag && !knows.includes(q.skill_tag)) knows.push(q.skill_tag);
          }
        }
        setServerResult({
          score,
          total,
          passMark: checkin.passMark,
          passed: score >= checkin.passMark,
          knows,
          petalsAwarded: score >= checkin.passMark ? 50 : 0,
        });
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to submit quiz.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRetry = () => {
    setQIdx(0);
    setAnswers({});
    setHintsShown({});
    setServerResult(null);
  };

  const badgeId = checkin.badgeOnPass || chapter?.badgeId || "badge-cycle-explorer";

  return (
    <CoursePlayerShell
      backHref="/dashboard/journey"
      backLabel="Journey"
      worldName={chapter?.worldName || "Final Challenge"}
      activeStep="checkin"
      colors={chapter?.colors}
      gigiTip="No timer, and Gigi's hints are completely free! Take your time."
      maxWidthClass="max-w-3xl"
    >
      <div
        style={{ backgroundColor: softBg }}
        className="rounded-[32px] p-5 sm:p-8 border border-[#F1E4E8] shadow-xs flex flex-col gap-5 w-full min-h-[70vh]"
      >
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <div style={{ color: ink }} className="text-xs font-extrabold uppercase tracking-wider">
              {chapter ? `CHAPTER ${chapter.number} CHECK-IN` : "FINAL CHALLENGE"}
            </div>
            <h1 className="m-0 font-['Baloo_2',sans-serif] font-bold text-2xl sm:text-3xl text-[#3D2C4A]">
              {checkin.title}
            </h1>
          </div>
          <span className="text-xs font-semibold text-[#4A5F72] text-right hidden sm:block">
            No timer
            <br />
            Hints are free
          </span>
        </div>

        {/* Quiz Mode */}
        {!serverResult && curQ && (
          <>
            {/* Petal Progress Row */}
            <div className="flex gap-1.5 justify-between max-w-md mx-auto w-full">
              {questions.map((qq, k) => {
                const a = answers[qq.id];
                const fill =
                  a === undefined
                    ? "#FFFFFF"
                    : a === qq.correct_option_id
                    ? accent
                    : "#F7CDAA";
                const stroke = k === qIdx ? "#3D2C4A" : accentLight;
                return (
                  <svg key={qq.id} width="26" height="32" viewBox="0 0 16 22" aria-hidden="true">
                    <ellipse cx="8" cy="11" rx="6" ry="10" fill={fill} stroke={stroke} strokeWidth="1.2" />
                  </svg>
                );
              })}
            </div>

            {/* Question Card */}
            <div className="bg-white rounded-[28px] p-5 sm:p-7 flex flex-col gap-4 shadow-md animate-in fade-in duration-200">
              <div className="flex justify-between items-center">
                <span style={{ color: ink }} className="text-xs sm:text-sm font-bold">
                  Question {qIdx + 1} of {total}
                </span>
                <span
                  style={{ backgroundColor: bgChip }}
                  className="text-xs font-bold rounded-full px-3 py-1 text-[#3D2C4A]"
                >
                  {curQ.type === "true_false" ? "True or false" : "Pick one"}
                </span>
              </div>

              <h2 className="m-0 font-['Baloo_2',sans-serif] font-bold text-xl sm:text-2xl leading-snug text-[#3D2C4A]">
                {curQ.prompt}
              </h2>

              <div className="flex flex-col gap-2.5">
                {curQ.options.map((opt, k) => {
                  const isCorrectOpt = opt.id === curQ.correct_option_id;
                  const isPickedOpt = opt.id === pickedOpt;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => handlePick(opt.id)}
                      className={`text-left min-h-[54px] px-4 py-3 rounded-2xl border font-semibold text-sm sm:text-base flex items-center gap-3 cursor-pointer transition-all ${
                        !answered
                          ? "bg-[#FBF8F6] border-[#E9DDE6] text-[#3D2C4A] hover:border-[#3D2C4A]/40"
                          : isCorrectOpt
                          ? "bg-[#EAF7F1] border-2 border-[#2F7F62] text-[#1F5A45]"
                          : isPickedOpt
                          ? "bg-[#F6F1F4] border-[#E9DDE6] text-[#8A7896]"
                          : "bg-white border-[#F1E4E8] text-[#8A7896]"
                      }`}
                    >
                      <span
                        style={
                          !answered
                            ? { backgroundColor: bgChip, color: ink }
                            : isCorrectOpt
                            ? { backgroundColor: "#2F7F62", color: "#FFFFFF" }
                            : { backgroundColor: "#F1E4E8", color: "#8A7896" }
                        }
                        className="shrink-0 w-7 h-7 rounded-full grid place-items-center text-xs font-bold"
                      >
                        {letters[k]}
                      </span>
                      <span>{opt.text}</span>
                    </button>
                  );
                })}
              </div>

              {hintsShown[curQ.id] && !answered && curQ.hint && (
                <div className="flex gap-2.5 items-start bg-[#FFF4C7] rounded-2xl p-3.5 text-sm font-medium text-[#3D2C4A] animate-in fade-in">
                  <Lightbulb size={18} className="text-[#8A6410] shrink-0 mt-0.5" />
                  <span>
                    <strong>Gigi&apos;s hint:</strong> {curQ.hint}
                  </span>
                </div>
              )}

              {answered && (
                <div
                  className={`rounded-2xl p-3.5 text-sm font-medium text-[#3D2C4A] animate-in fade-in ${
                    isRight ? "bg-[#EAF7F1]" : "bg-[#FFF1E6]"
                  }`}
                >
                  <strong>{isRight ? "Yes!" : "Good try."}</strong> {curQ.explanation}
                </div>
              )}
            </div>

            {/* Action Bar */}
            <div className="flex gap-3">
              {!answered && !hintsShown[curQ.id] && curQ.hint && (
                <button
                  type="button"
                  onClick={() => setHintsShown((h) => ({ ...h, [curQ.id]: true }))}
                  className="min-h-[52px] px-5 rounded-full border-2 border-[#3D2C4A] bg-white hover:bg-[#FFFAF6] text-[#3D2C4A] font-bold text-sm cursor-pointer"
                >
                  Gigi&apos;s hint
                </button>
              )}
              {answered && (
                <button
                  type="button"
                  disabled={submitting}
                  onClick={handleNext}
                  className="flex-1 min-h-[54px] rounded-full bg-[#3D2C4A] hover:bg-[#2F213A] text-white font-bold text-base inline-flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-60"
                >
                  <span>
                    {submitting
                      ? "Grading..."
                      : qIdx < total - 1
                      ? "Next question"
                      : "See my result"}
                  </span>
                  <ArrowRight size={18} />
                </button>
              )}
            </div>
          </>
        )}

        {/* Results Screen */}
        {serverResult && (
          <div className="flex flex-col gap-5 animate-in zoom-in-95 duration-300">
            <div className="bg-white rounded-[28px] p-7 text-center flex flex-col items-center gap-3 shadow-md">
              <svg width="150" height="150" viewBox="0 0 120 120" role="img" aria-label={`${serverResult.score} out of ${serverResult.total}`}>
                <circle cx="60" cy="60" r="50" fill="none" stroke={bgChip} strokeWidth="12" />
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  fill="none"
                  stroke={serverResult.passed ? "#2F7F62" : "#F0AF7E"}
                  strokeWidth="12"
                  strokeLinecap="round"
                  strokeDasharray={`${(serverResult.score / Math.max(1, serverResult.total)) * 314} 314`}
                  transform="rotate(-90 60 60)"
                />
                <text
                  x="60"
                  y="66"
                  textAnchor="middle"
                  fontFamily="Baloo 2, sans-serif"
                  fontSize="28"
                  fontWeight="700"
                  fill="#3D2C4A"
                >
                  {serverResult.score}/{serverResult.total}
                </text>
              </svg>

              <h2 className="m-0 font-['Baloo_2',sans-serif] font-bold text-3xl text-[#3D2C4A]">
                {serverResult.passed
                  ? serverResult.score === serverResult.total
                    ? "Perfect! Quiz Whiz!"
                    : "You passed!"
                  : checkin.failTitle || "Almost there!"}
              </h2>
              <p className="m-0 text-sm sm:text-base text-[#4A3A57] max-w-md">
                {serverResult.passed
                  ? `You've mastered ${chapter?.worldName || "this challenge"}. Your badge is waiting!`
                  : `You need ${serverResult.passMark} to pass. A quick review and you'll have it. No rush.`}
              </p>
            </div>

            {serverResult.passed ? (
              <>
                {serverResult.knows.length > 0 && (
                  <div className="flex flex-wrap gap-2 justify-center">
                    {serverResult.knows.slice(0, 6).map((k) => (
                      <span
                        key={k}
                        className="bg-[#EAF7F1] text-[#1F5A45] rounded-full px-3.5 py-1.5 text-xs font-bold"
                      >
                        I know: {k}
                      </span>
                    ))}
                  </div>
                )}
                <Link
                  href={`/dashboard/courses/badge/${badgeId}`}
                  className="min-h-[56px] rounded-full bg-[#C2456A] hover:bg-[#A8365A] text-white font-bold text-base flex items-center justify-center shadow-lg transition-colors"
                >
                  Claim my badge ✨
                </Link>
              </>
            ) : (
              <>
                {checkin.reviewLinks && checkin.reviewLinks.length > 0 && (
                  <div className="bg-white rounded-[24px] p-5 flex flex-col gap-2.5 border border-[#F1E4E8]">
                    <strong className="text-base font-bold text-[#3D2C4A]">
                      Let&apos;s review a few ideas
                    </strong>
                    {checkin.reviewLinks.map((rl, idx) => (
                      <Link
                        key={idx}
                        href={resolveReviewTarget(rl.target_screen)}
                        className="flex justify-between items-center min-h-[44px] text-sm font-semibold text-[#A8365A] hover:underline border-b border-[#F3E9EE] last:border-b-0"
                      >
                        <span>{rl.label}</span>
                        <span>Review →</span>
                      </Link>
                    ))}
                  </div>
                )}
                <button
                  type="button"
                  onClick={handleRetry}
                  className="min-h-[54px] rounded-full bg-[#3D2C4A] hover:bg-[#2F213A] text-white font-bold text-base cursor-pointer shadow-md"
                >
                  Try the quiz again
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </CoursePlayerShell>
  );
}

