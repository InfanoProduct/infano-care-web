"use client";

import React, { useState } from "react";
import {
  Save,
  Video,
  Film,
  Sparkles,
  ListPlus,
  HelpCircle,
  Clock,
  Trash2,
  Plus,
  ArrowLeft,
  FileQuestion,
  ExternalLink,
  Layers,
} from "lucide-react";
import ImageUploader from "@/components/upload/ImageUploader";
import VideoUploader from "@/components/upload/VideoUploader";

interface FaqItem {
  question: string;
  answer: string;
}

interface VideoLessonEditorProps {
  currentChapter: {
    id?: string;
    title: string;
    description: string;
    type: "VIDEO" | "ASSESSMENT";
    order: number;
    thumbnailUrl: string;
    videoUrl?: string;
    videoDuration?: number;
    goodToKnowPoints?: string[];
    faqs?: FaqItem[];
  };
  setCurrentChapter: React.Dispatch<React.SetStateAction<any>>;
  onSave: (e: React.FormEvent) => void;
  onDelete: (id: string, title: string) => void;
  onBackToCourse: () => void;
  onSwitchType: (type: "VIDEO" | "ASSESSMENT") => void;
  isSubmitting: boolean;
}

export default function VideoLessonEditor({
  currentChapter,
  setCurrentChapter,
  onSave,
  onDelete,
  onBackToCourse,
  onSwitchType,
  isSubmitting,
}: VideoLessonEditorProps) {
  const [activeTab, setActiveTab] = useState<"MEDIA" | "FACTS" | "FAQS">("MEDIA");

  // Facts Handlers
  const handleAddFact = () => {
    setCurrentChapter((prev: any) => ({
      ...prev,
      goodToKnowPoints: [...(prev.goodToKnowPoints || []), ""],
    }));
  };

  const handleFactChange = (index: number, val: string) => {
    setCurrentChapter((prev: any) => {
      const arr = [...(prev.goodToKnowPoints || [])];
      arr[index] = val;
      return { ...prev, goodToKnowPoints: arr };
    });
  };

  const handleRemoveFact = (index: number) => {
    setCurrentChapter((prev: any) => {
      const arr = [...(prev.goodToKnowPoints || [])];
      arr.splice(index, 1);
      return { ...prev, goodToKnowPoints: arr };
    });
  };

  // FAQs Handlers
  const handleAddFaq = () => {
    setCurrentChapter((prev: any) => ({
      ...prev,
      faqs: [...(prev.faqs || []), { question: "", answer: "" }],
    }));
  };

  const handleFaqChange = (index: number, field: "question" | "answer", val: string) => {
    setCurrentChapter((prev: any) => {
      const arr = [...(prev.faqs || [])];
      arr[index] = { ...arr[index], [field]: val };
      return { ...prev, faqs: arr };
    });
  };

  const handleRemoveFaq = (index: number) => {
    setCurrentChapter((prev: any) => {
      const arr = [...(prev.faqs || [])];
      arr.splice(index, 1);
      return { ...prev, faqs: arr };
    });
  };

  const factsCount = currentChapter.goodToKnowPoints?.filter((f) => f.trim() !== "").length || 0;
  const faqsCount = currentChapter.faqs?.filter((f) => f.question?.trim() !== "").length || 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center font-black">
            <Video size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-foreground">
                {currentChapter.id
                  ? `Lesson ${currentChapter.order}: ${currentChapter.title || "Untitled"}`
                  : "Create New Video Lesson"}
              </h2>
              <span className="text-[10px] font-bold bg-blue-500/10 text-blue-600 px-2 py-0.5 rounded">
                Video Lesson
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Configure streaming video endpoints, scientific facts, and student FAQs.
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
            <Save size={14} /> {isSubmitting ? "Saving..." : "Save Lesson"}
          </button>
        </div>
      </div>

      <form onSubmit={onSave} className="space-y-6">
        {/* Format Switcher */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-muted/20 border border-border/60">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-muted-foreground uppercase">Format:</span>
            <span className="text-xs font-black text-blue-600 flex items-center gap-1">
              <Video size={14} /> Video Lesson
            </span>
          </div>
          <button
            type="button"
            onClick={() => onSwitchType("ASSESSMENT")}
            className="text-xs font-bold text-amber-600 hover:text-amber-700 bg-amber-500/10 hover:bg-amber-500/20 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <FileQuestion size={13} /> Convert to Quiz Assessment
          </button>
        </div>

        {/* Lesson Title & Sequence Order */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          <div className="md:col-span-3 space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Lesson Title <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              value={currentChapter.title || ""}
              onChange={(e) =>
                setCurrentChapter((prev: any) => ({ ...prev, title: e.target.value }))
              }
              required
              placeholder="e.g., Foundations of Growth - Part 1 (M1C1)"
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

        {/* Description */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Lesson Summary / Context
          </label>
          <textarea
            value={currentChapter.description || ""}
            onChange={(e) =>
              setCurrentChapter((prev: any) => ({ ...prev, description: e.target.value }))
            }
            rows={2}
            placeholder="Biological foundations and rapid physical development during adolescent growth spurts..."
            className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-hidden text-sm text-foreground"
          />
        </div>

        {/* Sub-Section Navigation Tabs */}
        <div className="flex border-b border-border/70 gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("MEDIA")}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === "MEDIA"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Film size={14} /> 1. Video & Media
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("FACTS")}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === "FACTS"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <ListPlus size={14} /> 2. Key Facts / Takeaways ({factsCount})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("FAQS")}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === "FAQS"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <HelpCircle size={14} /> 3. FAQs ({faqsCount})
          </button>
        </div>

        {/* TAB 1: VIDEO MEDIA */}
        {activeTab === "MEDIA" && (
          <div className="space-y-6 animate-in fade-in">
            <div className="p-5 rounded-2xl bg-blue-500/5 border border-blue-500/20 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="md:col-span-2 space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Direct Streaming MP4 / HLS Video URL
                  </label>
                  <input
                    type="text"
                    value={currentChapter.videoUrl || ""}
                    onChange={(e) =>
                      setCurrentChapter((prev: any) => ({ ...prev, videoUrl: e.target.value }))
                    }
                    placeholder="https://infano-prod.duckdns.org/videos/m1c1/1080p.mp4"
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-hidden text-xs font-mono"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                    <Clock size={12} /> Duration (mins)
                  </label>
                  <input
                    type="number"
                    value={currentChapter.videoDuration || 0}
                    onChange={(e) =>
                      setCurrentChapter((prev: any) => ({
                        ...prev,
                        videoDuration: Number(e.target.value),
                      }))
                    }
                    min={0}
                    placeholder="15"
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-hidden text-sm font-bold"
                  />
                </div>
              </div>

              <div className="pt-2">
                <VideoUploader
                  label="Or Upload Video directly"
                  value={currentChapter.videoUrl}
                  onUpload={(url) =>
                    setCurrentChapter((prev: any) => ({ ...prev, videoUrl: url }))
                  }
                  folder="lms/videos"
                />
              </div>
            </div>

            {/* Poster Thumbnail via ImageUploader */}
            <div className="space-y-2">
              <ImageUploader
                label="Lesson Poster Artwork"
                description="Upload an illustration or video thumbnail representing this specific lesson."
                value={currentChapter.thumbnailUrl || ""}
                onUpload={(url) =>
                  setCurrentChapter((prev: any) => ({ ...prev, thumbnailUrl: url }))
                }
                folder="lms/chapters"
                aspectRatio="video"
              />
            </div>
          </div>
        )}

        {/* TAB 2: KEY FACTS & TAKEAWAYS */}
        {activeTab === "FACTS" && (
          <div className="space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                  <Sparkles size={16} className="text-primary" /> Key Facts & Bullet Takeaways
                </h3>
                <p className="text-xs text-muted-foreground">
                  Scientific facts, rules of thumb, and actionable takeaways shown alongside the lesson.
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddFact}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary text-xs font-bold rounded-lg transition-colors"
              >
                <Plus size={13} /> Add Fact
              </button>
            </div>

            <div className="space-y-2.5">
              {(currentChapter.goodToKnowPoints || []).map((point: string, pIdx: number) => (
                <div key={pIdx} className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                    {pIdx + 1}
                  </span>
                  <input
                    type="text"
                    value={point}
                    onChange={(e) => handleFactChange(pIdx, e.target.value)}
                    placeholder={`Fact #${pIdx + 1}: e.g. Growth spurts typically start between ages 9 and 13.`}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-hidden text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveFact(pIdx)}
                    className="p-2 text-muted-foreground hover:text-destructive rounded-lg transition-colors"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}

              {(currentChapter.goodToKnowPoints || []).length === 0 && (
                <div className="p-6 border border-dashed border-border rounded-xl text-center">
                  <p className="text-xs text-muted-foreground">
                    No takeaway facts added yet. Click &quot;Add Fact&quot; above to add points.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: FAQS */}
        {activeTab === "FAQS" && (
          <div className="space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                  <HelpCircle size={16} className="text-primary" /> Frequently Asked Questions (FAQs)
                </h3>
                <p className="text-xs text-muted-foreground">
                  Common parent & adolescent doubts and expert guidance on this lesson&apos;s topic.
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddFaq}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary text-xs font-bold rounded-lg transition-colors"
              >
                <Plus size={13} /> Add FAQ
              </button>
            </div>

            <div className="space-y-3">
              {(currentChapter.faqs || []).map((faq: FaqItem, fIdx: number) => (
                <div
                  key={fIdx}
                  className="p-4 rounded-xl border border-border bg-muted/10 space-y-2.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-foreground">FAQ #{fIdx + 1}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveFaq(fIdx)}
                      className="p-1 text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <input
                    type="text"
                    value={faq.question}
                    onChange={(e) => handleFaqChange(fIdx, "question", e.target.value)}
                    placeholder="Question: e.g. Why do growth rates vary so widely among peers?"
                    className="w-full px-3.5 py-2 rounded-lg border border-border bg-background text-xs font-bold"
                  />
                  <textarea
                    value={faq.answer}
                    onChange={(e) => handleFaqChange(fIdx, "answer", e.target.value)}
                    rows={2}
                    placeholder="Answer: e.g. Pubertal timing is governed primarily by genetics and endocrine triggers..."
                    className="w-full px-3.5 py-2 rounded-lg border border-border bg-background text-xs"
                  />
                </div>
              ))}

              {(currentChapter.faqs || []).length === 0 && (
                <div className="p-6 border border-dashed border-border rounded-xl text-center">
                  <p className="text-xs text-muted-foreground">
                    No FAQs added yet. Click &quot;Add FAQ&quot; above to create interactive student Q&As.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="pt-4 flex items-center justify-between border-t border-border/60">
          {currentChapter.id ? (
            <button
              type="button"
              onClick={() => onDelete(currentChapter.id!, currentChapter.title)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 text-destructive hover:bg-destructive/10 rounded-xl font-bold text-xs transition-colors"
            >
              <Trash2 size={15} /> Delete Lesson
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
              <Save size={15} /> {isSubmitting ? "Saving..." : "Save Lesson"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
