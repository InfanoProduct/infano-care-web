"use client";

import React from "react";
import {
  Save,
  FileQuestion,
  Award,
  Plus,
  Trash2,
  Copy,
  ArrowLeft,
  Video,
  CheckCircle2,
  HelpCircle,
} from "lucide-react";
import ImageUploader from "@/components/upload/ImageUploader";

interface QuizQuestion {
  question: string;
  options: string[];
  correctOptionIndex: number;
  explanation?: string;
}

interface QuizLessonEditorProps {
  currentChapter: {
    id?: string;
    title: string;
    description: string;
    type: "VIDEO" | "ASSESSMENT";
    order: number;
    thumbnailUrl: string;
    passingScore?: number;
    assessmentQuestions?: QuizQuestion[];
  };
  setCurrentChapter: React.Dispatch<React.SetStateAction<any>>;
  onSave: (e: React.FormEvent) => void;
  onDelete: (id: string, title: string) => void;
  onBackToCourse: () => void;
  onSwitchType: (type: "VIDEO" | "ASSESSMENT") => void;
  isSubmitting: boolean;
}

export default function QuizLessonEditor({
  currentChapter,
  setCurrentChapter,
  onSave,
  onDelete,
  onBackToCourse,
  onSwitchType,
  isSubmitting,
}: QuizLessonEditorProps) {
  // Questions Handlers
  const handleAddQuestion = () => {
    setCurrentChapter((prev: any) => ({
      ...prev,
      assessmentQuestions: [
        ...(prev.assessmentQuestions || []),
        {
          question: "",
          options: ["", "", "", ""],
          correctOptionIndex: 0,
          explanation: "",
        },
      ],
    }));
  };

  const handleDuplicateQuestion = (qIdx: number) => {
    setCurrentChapter((prev: any) => {
      const arr = [...(prev.assessmentQuestions || [])];
      const target = arr[qIdx];
      arr.splice(qIdx + 1, 0, {
        question: `${target.question} (Copy)`,
        options: [...(target.options || ["", "", "", ""])],
        correctOptionIndex: target.correctOptionIndex || 0,
        explanation: target.explanation || "",
      });
      return { ...prev, assessmentQuestions: arr };
    });
  };

  const handleRemoveQuestion = (qIdx: number) => {
    setCurrentChapter((prev: any) => {
      const arr = [...(prev.assessmentQuestions || [])];
      arr.splice(qIdx, 1);
      return { ...prev, assessmentQuestions: arr };
    });
  };

  const handleQuestionTextChange = (qIdx: number, val: string) => {
    setCurrentChapter((prev: any) => {
      const arr = [...(prev.assessmentQuestions || [])];
      arr[qIdx] = { ...arr[qIdx], question: val };
      return { ...prev, assessmentQuestions: arr };
    });
  };

  const handleOptionChange = (qIdx: number, optIdx: number, val: string) => {
    setCurrentChapter((prev: any) => {
      const arr = [...(prev.assessmentQuestions || [])];
      const opts = [...(arr[qIdx].options || ["", "", "", ""])];
      opts[optIdx] = val;
      arr[qIdx] = { ...arr[qIdx], options: opts };
      return { ...prev, assessmentQuestions: arr };
    });
  };

  const handleCorrectAnswerChange = (qIdx: number, optIdx: number) => {
    setCurrentChapter((prev: any) => {
      const arr = [...(prev.assessmentQuestions || [])];
      arr[qIdx] = { ...arr[qIdx], correctOptionIndex: optIdx };
      return { ...prev, assessmentQuestions: arr };
    });
  };

  const handleExplanationChange = (qIdx: number, val: string) => {
    setCurrentChapter((prev: any) => {
      const arr = [...(prev.assessmentQuestions || [])];
      arr[qIdx] = { ...arr[qIdx], explanation: val };
      return { ...prev, assessmentQuestions: arr };
    });
  };

  const questions = currentChapter.assessmentQuestions || [];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-black">
            <FileQuestion size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-foreground">
                {currentChapter.id
                  ? `Quiz ${currentChapter.order}: ${currentChapter.title || "Untitled"}`
                  : "Create New Quiz Assessment"}
              </h2>
              <span className="text-[10px] font-bold bg-amber-500/10 text-amber-600 px-2 py-0.5 rounded">
                Quiz Assessment
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Configure multiple choice questions, answer options, and passing score criteria.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onBackToCourse}
            className="px-4 py-2 bg-muted hover:bg-muted/80 text-foreground font-bold text-xs rounded-xl transition-colors"
          >
            Back to Course
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 px-5 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl font-bold text-xs shadow-sm transition-all"
          >
            <Save size={14} /> {isSubmitting ? "Saving..." : "Save Quiz"}
          </button>
        </div>
      </div>

      <form onSubmit={onSave} className="space-y-6">
        {/* Format Switcher */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-muted/20 border border-border/60">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-muted-foreground uppercase">Format:</span>
            <span className="text-xs font-black text-amber-600 flex items-center gap-1">
              <FileQuestion size={14} /> Quiz Assessment
            </span>
          </div>
          <button
            type="button"
            onClick={() => onSwitchType("VIDEO")}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-500/10 hover:bg-blue-500/20 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <Video size={13} /> Convert to Video Lesson
          </button>
        </div>

        {/* Lesson Title & Sequence Order */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          <div className="md:col-span-3 space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Quiz Title <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              value={currentChapter.title || ""}
              onChange={(e) =>
                setCurrentChapter((prev: any) => ({ ...prev, title: e.target.value }))
              }
              required
              placeholder="e.g., Module 1 Mastery Quiz: Foundational Growth"
              className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-hidden text-sm font-bold text-foreground"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Sequence Order
            </label>
            <input
              type="number"
              value={currentChapter.order || 1}
              onChange={(e) =>
                setCurrentChapter((prev: any) => ({ ...prev, order: Number(e.target.value) }))
              }
              min={1}
              className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-hidden text-sm font-bold text-foreground"
            />
          </div>
        </div>

        {/* Description & Passing Score Threshold */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="md:col-span-2 space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Quiz Instructions & Overview
            </label>
            <input
              type="text"
              value={currentChapter.description || ""}
              onChange={(e) =>
                setCurrentChapter((prev: any) => ({ ...prev, description: e.target.value }))
              }
              placeholder="Test your comprehension of this module's core takeaways..."
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-hidden text-sm text-foreground"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
              <Award size={13} className="text-amber-600" /> Passing Score (%)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={50}
                max={100}
                step={5}
                value={currentChapter.passingScore || 80}
                onChange={(e) =>
                  setCurrentChapter((prev: any) => ({
                    ...prev,
                    passingScore: Number(e.target.value),
                  }))
                }
                className="flex-1 accent-amber-600 cursor-pointer"
              />
              <span className="w-12 text-center text-sm font-black text-amber-700 bg-amber-500/10 px-2 py-1 rounded-lg">
                {currentChapter.passingScore || 80}%
              </span>
            </div>
          </div>
        </div>

        {/* Quiz Poster Artwork via ImageUploader */}
        <div className="space-y-2">
          <ImageUploader
            label="Quiz Poster Artwork"
            description="Upload an illustration or badge representing this assessment."
            value={currentChapter.thumbnailUrl || ""}
            onUpload={(url) =>
              setCurrentChapter((prev: any) => ({ ...prev, thumbnailUrl: url }))
            }
            folder="lms/chapters"
            aspectRatio="video"
          />
        </div>

        {/* Interactive Questions Builder */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                <FileQuestion size={16} className="text-amber-600" /> Multiple Choice Questions ({questions.length})
              </h3>
              <p className="text-xs text-muted-foreground">
                Add questions, specify 4 options, and click the radio button to select the correct answer.
              </p>
            </div>
            <button
              type="button"
              onClick={handleAddQuestion}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 font-bold text-xs rounded-xl transition-colors shadow-2xs"
            >
              <Plus size={14} /> Add Question
            </button>
          </div>

          <div className="space-y-5">
            {questions.map((q: QuizQuestion, qIdx: number) => (
              <div
                key={qIdx}
                className="p-5 rounded-2xl border border-border bg-card space-y-4 shadow-xs"
              >
                {/* Question Header */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-700 flex items-center justify-center text-xs font-black">
                      {qIdx + 1}
                    </span>
                    <span className="text-xs font-bold text-foreground">Question #{qIdx + 1}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleDuplicateQuestion(qIdx)}
                      className="p-1.5 text-muted-foreground hover:text-foreground rounded transition-colors"
                      title="Duplicate question"
                    >
                      <Copy size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveQuestion(qIdx)}
                      className="p-1.5 text-muted-foreground hover:text-destructive rounded transition-colors"
                      title="Delete question"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                {/* Question Text */}
                <input
                  type="text"
                  value={q.question || ""}
                  onChange={(e) => handleQuestionTextChange(qIdx, e.target.value)}
                  placeholder="Enter the question text here..."
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-muted/20 text-sm font-semibold text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary outline-hidden"
                />

                {/* Options A, B, C, D */}
                <div className="space-y-2.5 pt-1">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    Options (Select the radio button next to the correct answer):
                  </p>
                  {(q.options || ["", "", "", ""]).map((opt, optIdx) => {
                    const isCorrect = q.correctOptionIndex === optIdx;
                    return (
                      <div
                        key={optIdx}
                        className={`flex items-center gap-3 p-2 rounded-xl border transition-all ${
                          isCorrect
                            ? "bg-emerald-500/10 border-emerald-500/50 ring-1 ring-emerald-500/20"
                            : "bg-background border-border"
                        }`}
                      >
                        <input
                          type="radio"
                          name={`quiz-correct-opt-${qIdx}`}
                          checked={isCorrect}
                          onChange={() => handleCorrectAnswerChange(qIdx, optIdx)}
                          className="w-4 h-4 text-emerald-600 accent-emerald-600 cursor-pointer ml-1"
                          title="Mark this option as correct"
                        />
                        <span className="w-5 text-xs font-bold text-muted-foreground">
                          {String.fromCharCode(65 + optIdx)}.
                        </span>
                        <input
                          type="text"
                          value={opt}
                          onChange={(e) => handleOptionChange(qIdx, optIdx, e.target.value)}
                          placeholder={`Option ${String.fromCharCode(65 + optIdx)}`}
                          className="flex-1 px-3 py-1.5 rounded-lg border border-border/50 bg-background text-xs font-medium outline-hidden"
                        />
                        {isCorrect && (
                          <span className="text-[10px] font-black text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-md mr-1 flex items-center gap-1">
                            <CheckCircle2 size={11} /> Correct
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Explanation */}
                <div className="pt-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
                    Student Explanation (Shown after quiz submission):
                  </label>
                  <input
                    type="text"
                    value={q.explanation || ""}
                    onChange={(e) => handleExplanationChange(qIdx, e.target.value)}
                    placeholder="Explanation why this answer is correct..."
                    className="w-full px-3.5 py-2 rounded-xl border border-border/60 bg-muted/10 text-xs text-muted-foreground italic"
                  />
                </div>
              </div>
            ))}

            {questions.length === 0 && (
              <div className="p-8 border border-dashed border-border rounded-2xl text-center space-y-3">
                <p className="text-xs text-muted-foreground">
                  No questions added to this quiz yet.
                </p>
                <button
                  type="button"
                  onClick={handleAddQuestion}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 font-bold text-xs rounded-xl transition-colors"
                >
                  <Plus size={14} /> Add First Question
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 flex items-center justify-between border-t border-border/60">
          {currentChapter.id ? (
            <button
              type="button"
              onClick={() => onDelete(currentChapter.id!, currentChapter.title)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 text-destructive hover:bg-destructive/10 rounded-xl font-bold text-xs transition-colors"
            >
              <Trash2 size={15} /> Delete Quiz
            </button>
          ) : <div />}

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBackToCourse}
              className="px-5 py-2.5 bg-muted text-foreground hover:bg-muted/80 rounded-xl font-bold text-xs transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl font-bold text-xs shadow-md shadow-primary/20 transition-all disabled:opacity-50"
            >
              <Save size={15} /> {isSubmitting ? "Saving..." : "Save Quiz"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
