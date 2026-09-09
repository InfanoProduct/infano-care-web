"use client";

import React, { useState } from "react";
import {
  Eye,
  Video,
  FileQuestion,
  BookOpen,
  Layers,
  Sparkles,
  HelpCircle,
  CheckCircle2,
  Clock,
  IndianRupee,
  ChevronDown,
  Award,
  Play,
  RotateCcw,
} from "lucide-react";

interface StudentPreviewInspectorProps {
  activeView: "COURSE" | "MODULE" | "CHAPTER";
  courseData: any;
  currentModule: any;
  currentChapter: any;
}

export default function StudentPreviewInspector({
  activeView,
  courseData,
  currentModule,
  currentChapter,
}: StudentPreviewInspectorProps) {
  // Quiz Test-Runner state
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [isQuizSubmitted, setIsQuizSubmitted] = useState(false);
  const [expandedFaqIndex, setExpandedFaqIndex] = useState<number | null>(null);

  const handleSelectAnswer = (qIdx: number, optIdx: number) => {
    if (isQuizSubmitted) return;
    setSelectedAnswers((prev) => ({ ...prev, [qIdx]: optIdx }));
  };

  const handleResetQuiz = () => {
    setSelectedAnswers({});
    setIsQuizSubmitted(false);
  };

  // Calculate simulated score
  const quizQuestions = currentChapter?.assessmentQuestions || [];
  const correctCount = quizQuestions.reduce((acc: number, q: any, idx: number) => {
    return selectedAnswers[idx] === q.correctOptionIndex ? acc + 1 : acc;
  }, 0);
  const scorePercent =
    quizQuestions.length > 0 ? Math.round((correctCount / quizQuestions.length) * 100) : 0;
  const isPassed = scorePercent >= (currentChapter?.passingScore || 80);

  return (
    <div className="w-full flex flex-col bg-card rounded-2xl border border-border/70 shadow-xs overflow-hidden h-[calc(100vh-140px)] min-h-[640px] sticky top-20">
      {/* Inspector Header */}
      <div className="p-4 border-b border-border/60 bg-muted/20 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <Eye size={16} className="text-primary" />
          <span className="text-xs font-black uppercase tracking-wider text-foreground">
            Live Student View
          </span>
        </div>
        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Real-time
        </span>
      </div>

      {/* Inspector Content Canvas */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {/* VIEW 1: COURSE STUDENT CARD */}
        {activeView === "COURSE" && (
          <div className="space-y-4 animate-in fade-in">
            <div className="rounded-2xl border border-border/80 bg-background overflow-hidden shadow-sm">
              {/* Course Banner */}
              <div className="aspect-video w-full bg-muted relative overflow-hidden">
                {courseData.thumbnailUrl ? (
                  <img
                    src={courseData.thumbnailUrl}
                    alt={courseData.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground p-4 text-center">
                    <BookOpen size={24} className="opacity-40 mb-1" />
                    <span className="text-xs">No banner uploaded</span>
                  </div>
                )}
                <div className="absolute top-2.5 left-2.5 bg-background/90 backdrop-blur-md px-2.5 py-0.5 rounded-lg text-[10px] font-bold text-primary shadow-xs">
                  {courseData.category}
                </div>
              </div>

              <div className="p-4 space-y-3">
                <h3 className="font-bold text-sm text-foreground line-clamp-2">
                  {courseData.title || "Untitled Course"}
                </h3>
                <p className="text-xs text-muted-foreground line-clamp-3">
                  {courseData.description || "No description added yet."}
                </p>

                <div className="flex items-center justify-between pt-2 border-t border-border/60 text-xs">
                  <div className="flex items-center gap-1 font-black text-foreground">
                    {courseData.isFree ? (
                      <span className="text-emerald-600">FREE</span>
                    ) : (
                      <span>₹{courseData.price || 0}</span>
                    )}
                  </div>
                  <span className="text-muted-foreground flex items-center gap-1 text-[11px]">
                    <Clock size={12} /> {courseData.timeDuration || 0} mins
                  </span>
                </div>
              </div>
            </div>

            {/* Highlights preview */}
            <div className="p-4 rounded-xl bg-muted/20 border border-border/60 space-y-2">
              <span className="text-[11px] font-bold text-foreground flex items-center gap-1.5">
                <Sparkles size={13} className="text-primary" /> What Students Will Learn:
              </span>
              <ul className="space-y-1.5">
                {(courseData.highlights || []).map((h: string, i: number) => (
                  <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                    <CheckCircle2 size={13} className="text-emerald-500 shrink-0 mt-0.5" />
                    <span className="line-clamp-2">{h || "Highlight item"}</span>
                  </li>
                ))}
                {(courseData.highlights || []).length === 0 && (
                  <p className="text-[11px] text-muted-foreground italic">No highlights added.</p>
                )}
              </ul>
            </div>
          </div>
        )}

        {/* VIEW 2: MODULE CARD */}
        {activeView === "MODULE" && currentModule && (
          <div className="space-y-4 animate-in fade-in">
            <div className="rounded-2xl border border-border/80 bg-background overflow-hidden shadow-sm">
              <div className="aspect-video w-full bg-muted relative overflow-hidden">
                {currentModule.thumbnailUrl ? (
                  <img
                    src={currentModule.thumbnailUrl}
                    alt={currentModule.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground p-4 text-center">
                    <Layers size={24} className="opacity-40 mb-1" />
                    <span className="text-xs">No module cover</span>
                  </div>
                )}
                <div className="absolute top-2.5 left-2.5 bg-background/90 backdrop-blur-md px-2.5 py-0.5 rounded-lg text-[10px] font-bold text-primary shadow-xs">
                  Module {currentModule.order}
                </div>
              </div>

              <div className="p-4 space-y-2">
                <h3 className="font-bold text-sm text-foreground">
                  {currentModule.title || "Untitled Module"}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {currentModule.description || "No overview provided."}
                </p>
                <div className="pt-2 flex items-center justify-between text-xs text-muted-foreground border-t border-border/60">
                  <span className="flex items-center gap-1 text-[11px]">
                    <Clock size={12} /> {currentModule.timeDuration || 0} mins
                  </span>
                  <span className="text-[11px]">
                    {(currentModule.chapters || []).length} Lessons
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 3: CHAPTER VIDEO LESSON SIMULATOR */}
        {activeView === "CHAPTER" && currentChapter?.type === "VIDEO" && (
          <div className="space-y-4 animate-in fade-in">
            {/* Playable Video Player or Poster */}
            <div className="rounded-2xl border border-border/80 bg-slate-950 overflow-hidden shadow-sm aspect-video flex items-center justify-center relative group">
              {currentChapter.videoUrl ? (
                <video
                  src={currentChapter.videoUrl}
                  poster={currentChapter.thumbnailUrl}
                  controls
                  className="w-full h-full object-contain"
                />
              ) : currentChapter.thumbnailUrl ? (
                <img
                  src={currentChapter.thumbnailUrl}
                  alt={currentChapter.title}
                  className="w-full h-full object-cover opacity-80"
                />
              ) : (
                <div className="text-center p-4">
                  <Play size={28} className="text-white/40 mx-auto mb-1" />
                  <p className="text-xs text-white/60">No video stream URL</p>
                </div>
              )}
            </div>

            {/* Title & Duration */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-blue-600 bg-blue-500/10 px-2 py-0.5 rounded">
                Lesson {currentChapter.order} • {currentChapter.videoDuration || 0} mins
              </span>
              <h3 className="font-bold text-sm text-foreground">
                {currentChapter.title || "Untitled Lesson"}
              </h3>
              <p className="text-xs text-muted-foreground">
                {currentChapter.description || "No summary provided."}
              </p>
            </div>

            {/* Interactive Facts Preview */}
            <div className="p-3.5 rounded-xl bg-muted/20 border border-border/60 space-y-2">
              <span className="text-[11px] font-bold text-foreground flex items-center gap-1.5">
                <Sparkles size={13} className="text-primary" /> Key Takeaways
              </span>
              <div className="space-y-1.5">
                {(currentChapter.goodToKnowPoints || []).map((point: string, pIdx: number) => (
                  <div
                    key={pIdx}
                    className="p-2 rounded-lg bg-background border border-border/50 text-xs text-foreground flex items-start gap-2"
                  >
                    <span className="text-primary font-bold">•</span>
                    <span className="line-clamp-2">{point || "Takeaway item"}</span>
                  </div>
                ))}
                {(currentChapter.goodToKnowPoints || []).length === 0 && (
                  <p className="text-[11px] text-muted-foreground italic">No takeaway points.</p>
                )}
              </div>
            </div>

            {/* Interactive FAQs Accordion */}
            <div className="p-3.5 rounded-xl bg-muted/20 border border-border/60 space-y-2">
              <span className="text-[11px] font-bold text-foreground flex items-center gap-1.5">
                <HelpCircle size={13} className="text-primary" /> Interactive FAQs
              </span>
              <div className="space-y-1.5">
                {(currentChapter.faqs || []).map((faq: any, fIdx: number) => {
                  const isOpen = expandedFaqIndex === fIdx;
                  return (
                    <div
                      key={fIdx}
                      className="rounded-lg border border-border/60 bg-background overflow-hidden text-xs"
                    >
                      <button
                        type="button"
                        onClick={() => setExpandedFaqIndex(isOpen ? null : fIdx)}
                        className="w-full p-2.5 text-left font-bold flex items-center justify-between gap-2 hover:bg-muted/30"
                      >
                        <span className="line-clamp-1">{faq.question || `FAQ #${fIdx + 1}`}</span>
                        <ChevronDown
                          size={13}
                          className={`transition-transform duration-200 shrink-0 ${
                            isOpen ? "rotate-180 text-primary" : "text-muted-foreground"
                          }`}
                        />
                      </button>
                      {isOpen && (
                        <div className="p-2.5 pt-0 text-muted-foreground border-t border-border/30 bg-muted/10 leading-relaxed">
                          {faq.answer || "No answer provided yet."}
                        </div>
                      )}
                    </div>
                  );
                })}
                {(currentChapter.faqs || []).length === 0 && (
                  <p className="text-[11px] text-muted-foreground italic">No FAQs added.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* VIEW 4: CHAPTER QUIZ ASSESSMENT TEST-RUNNER SIMULATOR */}
        {activeView === "CHAPTER" && currentChapter?.type === "ASSESSMENT" && (
          <div className="space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <div className="flex items-center gap-1.5">
                <Award size={15} className="text-amber-700" />
                <span className="text-xs font-bold text-amber-900">Quiz Simulator</span>
              </div>
              <span className="text-[10px] font-bold text-amber-700">
                Passing: {currentChapter.passingScore || 80}%
              </span>
            </div>

            <div className="space-y-1">
              <h3 className="font-bold text-sm text-foreground">
                {currentChapter.title || "Untitled Quiz"}
              </h3>
              <p className="text-xs text-muted-foreground">
                {currentChapter.description || "Answer the questions below to test comprehension."}
              </p>
            </div>

            {/* Test Runner Questions */}
            <div className="space-y-4">
              {quizQuestions.map((q: any, qIdx: number) => {
                const userChoice = selectedAnswers[qIdx];
                return (
                  <div
                    key={qIdx}
                    className="p-3.5 rounded-xl border border-border bg-background space-y-2.5 shadow-2xs text-xs"
                  >
                    <p className="font-bold text-foreground">
                      {qIdx + 1}. {q.question || "Question Text"}
                    </p>

                    <div className="space-y-1.5">
                      {(q.options || []).map((opt: string, optIdx: number) => {
                        const isSelected = userChoice === optIdx;
                        const isCorrectOption = q.correctOptionIndex === optIdx;

                        let style = "border-border hover:bg-muted/40";
                        if (isQuizSubmitted) {
                          if (isCorrectOption) {
                            style = "bg-emerald-500/15 border-emerald-500 text-emerald-700 font-bold";
                          } else if (isSelected && !isCorrectOption) {
                            style = "bg-destructive/15 border-destructive text-destructive font-bold";
                          }
                        } else if (isSelected) {
                          style = "bg-primary/10 border-primary text-primary font-bold";
                        }

                        return (
                          <div
                            key={optIdx}
                            onClick={() => handleSelectAnswer(qIdx, optIdx)}
                            className={`p-2 rounded-lg border transition-all cursor-pointer flex items-center justify-between gap-2 ${style}`}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="font-bold text-muted-foreground w-4">
                                {String.fromCharCode(65 + optIdx)}.
                              </span>
                              <span className="truncate">{opt || `Option ${optIdx + 1}`}</span>
                            </div>
                            {isQuizSubmitted && isCorrectOption && (
                              <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {isQuizSubmitted && q.explanation && (
                      <div className="p-2 rounded-lg bg-muted/30 border border-border/50 text-[11px] text-muted-foreground italic">
                        💡 {q.explanation}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Submit / Reset Simulator Controls */}
            {quizQuestions.length > 0 && (
              <div className="pt-2 space-y-2">
                {!isQuizSubmitted ? (
                  <button
                    type="button"
                    onClick={() => setIsQuizSubmitted(true)}
                    className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold text-xs shadow-xs transition-colors"
                  >
                    Submit Test Quiz
                  </button>
                ) : (
                  <div className="p-3 rounded-xl border bg-card space-y-2 text-center animate-in zoom-in-95">
                    <p className="text-xs font-bold text-foreground">
                      Score: <span className={isPassed ? "text-emerald-600" : "text-destructive"}>{scorePercent}%</span> ({correctCount}/{quizQuestions.length})
                    </p>
                    <p className={`text-[11px] font-bold ${isPassed ? "text-emerald-600" : "text-destructive"}`}>
                      {isPassed ? "🎉 Passed!" : "Needs Review (< Passing Score)"}
                    </p>
                    <button
                      type="button"
                      onClick={handleResetQuiz}
                      className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline pt-1"
                    >
                      <RotateCcw size={12} /> Retake Quiz
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
