"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { DaughterShell } from "@/features/daughter/DaughterShell";
import { useActiveLearnerId, useInvalidateCourse, useLessonDetail } from "@/hooks/use-course";
import { CourseService } from "@/services/course.service";
import { ArrowLeft, Lock, Sparkles, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";

export default function LessonReflectPage() {
  const { lessonId } = useParams<{ lessonId: string }>();
  const router = useRouter();
  const learnerId = useActiveLearnerId();
  const invalidateCourse = useInvalidateCourse();
  const { data, isLoading } = useLessonDetail(lessonId);

  const [journalText, setJournalText] = useState("");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  if (isLoading || !data?.lesson) {
    return (
      <DaughterShell>
        <div className="flex items-center justify-center py-24">
          <Loader2 size={32} className="animate-spin text-[#C2456A]" />
        </div>
      </DaughterShell>
    );
  }

  const { lesson } = data;
  const reflect = lesson.reflect;
  const questions = reflect?.quick_check || [];
  const starters = reflect?.sentence_starters || [];
  const answeredCount = Object.keys(answers).length;
  const allDone = answeredCount === questions.length && questions.length > 0;

  const handleAddStarter = (starter: string) => {
    setJournalText((prev) => `${prev ? `${prev}\n` : ""}${starter} `);
  };

  const handlePickOption = (qId: string, optId: string) => {
    if (answers[qId] !== undefined) return;
    setAnswers((prev) => ({ ...prev, [qId]: optId }));
  };

  const handleCompleteLesson = async () => {
    setSubmitting(true);
    try {
      if (learnerId && learnerId !== "default") {
        const res = await CourseService.completeReflect(learnerId, lesson.id, {
          journalText,
          quickCheckAnswers: answers,
        });
        invalidateCourse();
        if (res.petalsAwarded > 0) {
          toast.success(`Flower bloomed! +${res.petalsAwarded} petals 🌸`);
        }
        if (Array.isArray(res.badgesEarned)) {
          res.badgesEarned.forEach((b) => {
            toast.success(`New badge: ${b.name}! ⭐`);
          });
        }
      }
      router.push(`/dashboard/courses/lesson/${lesson.id}/done`);
    } catch (err: any) {
      toast.error(err?.message || "Could not save reflection. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DaughterShell gigiTip="Your journal entries are 100% private — only you can ever read them.">
      <div className="max-w-5xl mx-auto w-full flex flex-col gap-5">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Link
            href={`/dashboard/courses/lesson/${lesson.id}`}
            aria-label="Back to lesson"
            className="w-11 h-11 rounded-full bg-white border border-[#F1E4E8] hover:border-[#3D2C4A] grid place-items-center text-[#3D2C4A] shrink-0"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <div className="text-xs font-extrabold uppercase tracking-wider text-[#5A4385]">
              STEP 4 · REFLECT · LESSON {lesson.code}
            </div>
            <h1 className="m-0 font-['Baloo_2',sans-serif] font-bold text-2xl sm:text-3xl text-[#3D2C4A]">
              Your thoughts
            </h1>
          </div>
        </div>

        {/* Desktop 2-Col / Mobile Stack */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Private Journal Card */}
          <section
            aria-labelledby="jr-h"
            className="lg:col-span-6 relative bg-[#F1ECFA] rounded-[28px] p-5 sm:p-6 pl-8 sm:pl-9 flex flex-col gap-3.5 overflow-hidden shadow-xs"
          >
            <div
              aria-hidden="true"
              className="absolute left-3 top-0 bottom-0 w-1.5"
              style={{
                background: "repeating-linear-gradient(#D6C9F0 0 10px, transparent 10px 18px)",
              }}
            />

            <div className="flex justify-between items-center gap-2">
              <span className="text-xs font-extrabold tracking-wider text-[#5A4385] uppercase">
                MY JOURNAL
              </span>
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#5A4385]">
                <Lock size={12} />
                Only you can read this
              </span>
            </div>

            <h2 id="jr-h" className="m-0 font-['Baloo_2',sans-serif] font-bold text-xl sm:text-2xl leading-snug text-[#3D2C4A]">
              {reflect?.journal_prompt}
            </h2>

            {starters.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {starters.map((st, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleAddStarter(st)}
                    className="min-h-[34px] px-3 rounded-full border border-[#D6C9F0] bg-white hover:bg-[#FFFAF6] text-[#3D2C4A] text-xs font-semibold cursor-pointer transition-colors"
                  >
                    + {st}
                  </button>
                ))}
              </div>
            )}

            <label className="sr-only" htmlFor="rf-text">
              Your journal entry
            </label>
            <textarea
              id="rf-text"
              rows={6}
              value={journalText}
              onChange={(e) => setJournalText(e.target.value)}
              placeholder="Write anything. There are no wrong answers."
              className="w-full rounded-2xl border-none p-3.5 text-base leading-relaxed resize-none bg-white text-[#3D2C4A] focus:outline-none focus:ring-2 focus:ring-[#A992D6]"
              style={{
                backgroundImage: "repeating-linear-gradient(transparent 0 25px, #F1ECFA 25px 26px)",
              }}
            />

            <div className="text-xs font-medium text-[#5A4385]">
              {journalText.trim()
                ? "Will be saved privately to your journal ✓"
                : "Optional, but it's nice to look back on later."}
            </div>
          </section>

          {/* Quick Check Questions */}
          <section aria-labelledby="qc-h" className="lg:col-span-6 flex flex-col gap-3.5">
            <div className="flex justify-between items-baseline">
              <h2 id="qc-h" className="m-0 font-['Baloo_2',sans-serif] font-bold text-xl sm:text-2xl text-[#3D2C4A]">
                Quick check
              </h2>
              <span className="text-xs sm:text-sm font-bold text-[#6E5B7A]">
                {answeredCount} of {questions.length}
              </span>
            </div>

            {questions.map((q, qIdx) => {
              const picked = answers[q.id];
              const done = picked !== undefined;
              const isRight = picked === q.correct_option_id;
              return (
                <div
                  key={q.id}
                  className="bg-white border border-[#F1E4E8] rounded-[22px] p-4 sm:p-5 flex flex-col gap-2.5 shadow-2xs"
                >
                  <div className="font-bold text-sm sm:text-base text-[#3D2C4A]">
                    {qIdx + 1}. {q.prompt}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {q.options.map((opt) => {
                      const isCorrectOpt = opt.id === q.correct_option_id;
                      const isPickedOpt = opt.id === picked;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => handlePickOption(q.id, opt.id)}
                          className={`min-h-[44px] px-3.5 py-2 rounded-xl border font-semibold text-sm cursor-pointer transition-all ${
                            !done
                              ? "bg-[#FBF8F6] border-[#E9DDE6] text-[#3D2C4A] hover:border-[#3D2C4A]"
                              : isCorrectOpt
                              ? "bg-[#2F7F62] border-[#2F7F62] text-white"
                              : isPickedOpt
                              ? "bg-[#F6F1F4] border-[#E9DDE6] text-[#8A7896]"
                              : "bg-white border-[#F1E4E8] text-[#8A7896]"
                          }`}
                        >
                          {opt.text}
                        </button>
                      );
                    })}
                  </div>
                  {done && (
                    <div className="text-xs sm:text-sm font-medium text-[#24533F] pt-0.5 animate-in fade-in">
                      {isRight ? q.explanation : `Almost! ${q.explanation}`}
                    </div>
                  )}
                </div>
              );
            })}

            {allDone ? (
              <div className="flex flex-col gap-3 pt-1 animate-in fade-in">
                {reflect?.summary_line && (
                  <div className="bg-[#EAF7F1] text-[#1F5A45] rounded-2xl p-4 text-sm font-semibold">
                    3 things you know now: {reflect.summary_line}
                  </div>
                )}
                <button
                  type="button"
                  disabled={submitting}
                  onClick={handleCompleteLesson}
                  className="min-h-[56px] rounded-full bg-[#C2456A] hover:bg-[#A8365A] text-white font-bold text-base inline-flex items-center justify-center gap-2 cursor-pointer shadow-lg disabled:opacity-60 transition-colors"
                >
                  <Sparkles size={18} />
                  <span>{submitting ? "Blooming..." : "Bloom my flower"}</span>
                </button>
              </div>
            ) : (
              <div className="min-h-[56px] rounded-full bg-[#F6F1F4] text-[#6E5B7A] grid place-items-center font-semibold text-sm">
                Answer the {questions.length} questions to finish
              </div>
            )}
          </section>
        </div>
      </div>
    </DaughterShell>
  );
}

