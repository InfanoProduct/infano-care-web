"use client";

import React from "react";
import {
  Save,
  Layers,
  Clock,
  Trash2,
  Plus,
  ArrowLeft,
  Video,
  FileQuestion,
} from "lucide-react";
import ImageUploader from "@/components/upload/ImageUploader";

interface ModuleEditorProps {
  currentModule: {
    id?: string;
    title: string;
    description: string;
    timeDuration: number;
    order: number;
    thumbnailUrl: string;
    chapters?: any[];
  };
  setCurrentModule: React.Dispatch<React.SetStateAction<any>>;
  onSave: (e: React.FormEvent) => void;
  onDelete: (id: string, title: string) => void;
  onBackToCourse: () => void;
  onOpenChapter: (moduleId: string, chap?: any) => void;
  isSubmitting: boolean;
}

export default function ModuleEditor({
  currentModule,
  setCurrentModule,
  onSave,
  onDelete,
  onBackToCourse,
  onOpenChapter,
  isSubmitting,
}: ModuleEditorProps) {
  const chapters = currentModule.chapters || [];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-black">
            <Layers size={20} />
          </div>
          <div>
            <h2 className="text-xl font-black text-foreground">
              {currentModule.id
                ? `Module ${currentModule.order}: ${currentModule.title || "Untitled"}`
                : "Create New Module"}
            </h2>
            <p className="text-xs text-muted-foreground">
              Configure module title, learning milestones, and cover artwork.
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
            <Save size={14} /> {isSubmitting ? "Saving..." : "Save Module"}
          </button>
        </div>
      </div>

      <form onSubmit={onSave} className="space-y-6">
        {/* Module Title & Order */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          <div className="md:col-span-3 space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Module Title <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              value={currentModule.title || ""}
              onChange={(e) =>
                setCurrentModule((prev: any) => ({ ...prev, title: e.target.value }))
              }
              required
              placeholder="e.g., Module 1: Foundational Growth"
              className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-hidden text-sm font-bold text-foreground"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Sequence Order
            </label>
            <input
              type="number"
              value={currentModule.order || 1}
              onChange={(e) =>
                setCurrentModule((prev: any) => ({ ...prev, order: Number(e.target.value) }))
              }
              min={1}
              className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-hidden text-sm font-bold text-foreground"
            />
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Module Overview & Competencies
          </label>
          <textarea
            value={currentModule.description || ""}
            onChange={(e) =>
              setCurrentModule((prev: any) => ({ ...prev, description: e.target.value }))
            }
            rows={3}
            placeholder="Briefly describe the key developmental skills unlocked in this module..."
            className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-hidden text-sm text-foreground"
          />
        </div>

        {/* Estimated Duration */}
        <div className="space-y-2 max-w-xs">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Clock size={13} className="text-primary" /> Estimated Duration (minutes)
          </label>
          <input
            type="number"
            value={currentModule.timeDuration || 0}
            onChange={(e) =>
              setCurrentModule((prev: any) => ({ ...prev, timeDuration: Number(e.target.value) }))
            }
            min={0}
            placeholder="45"
            className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-hidden text-sm font-bold text-foreground"
          />
        </div>

        {/* Module Cover Image via ImageUploader */}
        <div className="space-y-2">
          <ImageUploader
            label="Module Cover Artwork"
            description="Upload an illustration or poster representing this module."
            value={currentModule.thumbnailUrl || ""}
            onUpload={(url) =>
              setCurrentModule((prev: any) => ({ ...prev, thumbnailUrl: url }))
            }
            folder="lms/modules"
            aspectRatio="video"
          />
        </div>

        {/* Lessons in this module overview list */}
        {currentModule.id && (
          <div className="p-5 rounded-2xl bg-muted/20 border border-border/70 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-foreground">
                  Lessons in this Module ({chapters.length})
                </h3>
                <p className="text-xs text-muted-foreground">
                  Quickly jump into editing any lesson in this module.
                </p>
              </div>
              <button
                type="button"
                onClick={() => onOpenChapter(currentModule.id!)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary text-xs font-bold rounded-lg transition-colors"
              >
                <Plus size={13} /> Add Lesson
              </button>
            </div>

            <div className="divide-y divide-border/40 border border-border/40 rounded-xl overflow-hidden bg-background">
              {chapters.map((chap: any, idx: number) => (
                <div
                  key={chap.id}
                  onClick={() => onOpenChapter(currentModule.id!, chap)}
                  className="p-3 flex items-center justify-between hover:bg-muted/40 cursor-pointer transition-colors text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    {chap.type === "VIDEO" ? (
                      <Video size={14} className="text-blue-500" />
                    ) : (
                      <FileQuestion size={14} className="text-amber-500" />
                    )}
                    <span className="font-bold">
                      {idx + 1}. {chap.title}
                    </span>
                  </div>
                  <span className="text-[11px] text-muted-foreground bg-muted px-2 py-0.5 rounded">
                    {chap.type === "VIDEO" ? "Video Lesson" : "Quiz Assessment"}
                  </span>
                </div>
              ))}
              {chapters.length === 0 && (
                <p className="p-4 text-center text-xs text-muted-foreground">
                  No lessons in this module yet.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="pt-4 flex items-center justify-between border-t border-border/60">
          {currentModule.id ? (
            <button
              type="button"
              onClick={() => onDelete(currentModule.id!, currentModule.title)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 text-destructive hover:bg-destructive/10 rounded-xl font-bold text-xs transition-colors"
            >
              <Trash2 size={15} /> Delete Module
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
              <Save size={15} /> {isSubmitting ? "Saving..." : "Save Module"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
