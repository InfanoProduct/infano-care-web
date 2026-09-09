"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  BookOpen,
  Clock,
  Sparkles,
  Layers,
  IndianRupee,
  CheckCircle2,
  Tag,
  Eye,
  Info,
} from "lucide-react";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { apiClient } from "@/lib/api-client";
import ImageUploader from "@/components/upload/ImageUploader";

const CATEGORIES = [
  "Parenting",
  "Teen Health",
  "Nutrition",
  "Productivity",
  "Wellbeing",
  "Digital Life",
  "Mindset",
  "General",
];

const PRESET_HIGHLIGHTS = [
  "10+ structured video lessons",
  "Downloadable worksheets & cheat sheets",
  "Interactive quizzes with explanations",
  "Expert-guided parenting frameworks",
  "Lifetime access & updates",
];

export default function CreateCoursePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    timeDuration: 60,
    price: 0,
    isFree: true,
    thumbnailUrl: "",
    category: "Parenting",
    highlights: ["Interactive video lessons", "Actionable exercises"] as string[],
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      setFormData((prev) => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleAddHighlight = (text: string = "") => {
    setFormData((prev) => ({ ...prev, highlights: [...prev.highlights, text] }));
  };

  const handleHighlightChange = (index: number, value: string) => {
    setFormData((prev) => {
      const newHighlights = [...prev.highlights];
      newHighlights[index] = value;
      return { ...prev, highlights: newHighlights };
    });
  };

  const handleRemoveHighlight = (index: number) => {
    setFormData((prev) => {
      const newHighlights = [...prev.highlights];
      newHighlights.splice(index, 1);
      return { ...prev, highlights: newHighlights };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error("Please provide a course title");
      return;
    }

    setIsSubmitting(true);

    const cleanedFormData = {
      ...formData,
      timeDuration: Number(formData.timeDuration) || 0,
      price: formData.isFree ? 0 : Number(formData.price) || 0,
      highlights: formData.highlights.filter((h) => h.trim() !== ""),
    };

    try {
      const course = await apiClient.post<any>("/lms/admin/courses", cleanedFormData);
      toast.success("Course created! Redirecting to Curriculum Builder...");
      router.push(`/admin/lms/courses/${course.id}/edit`);
    } catch (error) {
      toast.error("Error creating course");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Header Bar */}
      <div className="flex items-center justify-between border-b border-border/40 pb-5">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/lms/courses"
            className="p-2.5 bg-muted/60 hover:bg-muted rounded-xl transition-all text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-foreground">Create New Course</h1>
            <p className="text-sm font-medium text-muted-foreground mt-0.5">
              Set basic details and thumbnail. You will add modules and video lessons next.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/lms/courses"
            className="px-4 py-2.5 text-sm font-bold text-muted-foreground hover:text-foreground transition-colors"
          >
            Cancel
          </Link>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl font-bold text-sm shadow-md shadow-primary/20 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
          >
            {isSubmitting ? (
              "Saving..."
            ) : (
              <>
                <Save size={16} /> Save & Open Curriculum
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Grid: Form + Live Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left 2 Columns: Main Details Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card: Course Identity & Content */}
          <div className="bg-card rounded-2xl border border-border/60 shadow-xs p-6 sm:p-8 space-y-6">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2 pb-3 border-b border-border/40">
              <BookOpen size={18} className="text-primary" /> Basic Information
            </h2>

            {/* Course Title */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Course Title <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-foreground font-semibold"
                placeholder="e.g. Navigating Teenage Emotions & Communication"
              />
            </div>

            {/* Category Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Category
              </label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, category: cat }))}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      formData.category === cat
                        ? "bg-primary text-primary-foreground shadow-xs scale-105"
                        : "bg-muted/60 text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Full Description <span className="text-destructive">*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={5}
                className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm leading-relaxed"
                placeholder="Describe what parents will learn, what challenges this course resolves, and what actionable outcomes they will achieve..."
              />
            </div>

            {/* Course Thumbnail Image Upload */}
            <div className="space-y-2 pt-2">
              <ImageUploader
                label="Course Thumbnail Image"
                value={formData.thumbnailUrl}
                onUpload={(url) => setFormData((prev) => ({ ...prev, thumbnailUrl: url }))}
                folder="lms/courses"
                helperText="Upload 16:9 banner image (PNG, JPG, WebP) or paste image URL"
                aspectRatio="video"
              />
            </div>
          </div>

          {/* Card: Highlights & Key Points */}
          <div className="bg-card rounded-2xl border border-border/60 shadow-xs p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-border/40">
              <div>
                <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <Sparkles size={18} className="text-primary" /> Key Takeaways & Highlights
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Bullet points displayed on the course landing page and catalog.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleAddHighlight("")}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-primary bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors"
              >
                <Plus size={14} /> Add Point
              </button>
            </div>

            {/* Active Highlights list */}
            <div className="space-y-2.5">
              {formData.highlights.map((highlight, index) => (
                <div key={index} className="flex items-center gap-2 group">
                  <div className="w-6 h-6 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">
                    {index + 1}
                  </div>
                  <input
                    type="text"
                    value={highlight}
                    onChange={(e) => handleHighlightChange(index, e.target.value)}
                    className="flex-1 px-3.5 py-2 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm transition-all font-medium"
                    placeholder="e.g. 10 hours of bite-sized video guidance"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveHighlight(index)}
                    className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                    title="Remove item"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}

              {formData.highlights.length === 0 && (
                <p className="text-xs text-muted-foreground italic py-2">
                  No highlights added yet. Click &quot;Add Point&quot; or pick from suggestions below.
                </p>
              )}
            </div>

            {/* Quick Suggestion Chips */}
            <div className="pt-3 border-t border-border/40">
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
                Quick Suggestions:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_HIGHLIGHTS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => {
                      if (!formData.highlights.includes(preset)) {
                        handleAddHighlight(preset);
                      }
                    }}
                    className="px-2.5 py-1 rounded-lg text-xs font-medium bg-muted hover:bg-primary/10 hover:text-primary transition-all border border-border/60"
                  >
                    + {preset}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Column: Settings, Pricing & Live Card Preview */}
        <div className="space-y-6">
          {/* Card: Pricing & Duration */}
          <div className="bg-card rounded-2xl border border-border/60 shadow-xs p-6 space-y-5">
            <h3 className="font-bold text-foreground text-sm uppercase tracking-wider pb-2 border-b border-border/40">
              Pricing & Access
            </h3>

            {/* Free vs Paid Toggle */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-muted/40 border border-border/60">
              <div>
                <p className="font-bold text-sm text-foreground">Free Course</p>
                <p className="text-xs text-muted-foreground">Available to all registered parents</p>
              </div>
              <input
                type="checkbox"
                id="isFree"
                name="isFree"
                checked={formData.isFree}
                onChange={handleChange}
                className="w-5 h-5 accent-primary cursor-pointer rounded"
              />
            </div>

            {!formData.isFree && (
              <div className="space-y-1.5 animate-in fade-in duration-200">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Price (INR ₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-muted-foreground">
                    ₹
                  </span>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    min="0"
                    className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-bold text-foreground"
                    placeholder="999"
                  />
                </div>
              </div>
            )}

            {/* Duration */}
            <div className="space-y-1.5 pt-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Total Duration (Minutes)
              </label>
              <div className="relative">
                <Clock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="number"
                  name="timeDuration"
                  value={formData.timeDuration}
                  onChange={handleChange}
                  min="0"
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-semibold"
                />
              </div>
              <p className="text-[11px] text-muted-foreground">
                Rough estimate: {Math.floor((Number(formData.timeDuration) || 0) / 60)}h {(Number(formData.timeDuration) || 0) % 60}m
              </p>
            </div>
          </div>

          {/* Live Student-Facing Card Preview */}
          <div className="bg-card rounded-2xl border border-border/60 shadow-xs p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-border/40">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Eye size={14} className="text-primary" /> Live Card Preview
              </span>
              <span className="text-[10px] bg-primary/10 text-primary font-bold px-2 py-0.5 rounded-md">
                Catalog View
              </span>
            </div>

            {/* Preview Card */}
            <div className="bg-background rounded-2xl border border-border/80 overflow-hidden shadow-sm">
              <div className="relative aspect-video bg-muted/50 overflow-hidden">
                {formData.thumbnailUrl ? (
                  <img
                    src={formData.thumbnailUrl}
                    alt="Course Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = "none";
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground/40">
                    <BookOpen size={32} className="mb-1" />
                    <span className="text-[11px] font-semibold">Thumbnail preview</span>
                  </div>
                )}
                <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-black/60 backdrop-blur-md text-white">
                  {formData.category}
                </span>
                {Number(formData.timeDuration) > 0 && (
                  <span className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-md text-[10px] font-bold bg-black/70 backdrop-blur-md text-white flex items-center gap-1">
                    <Clock size={11} /> {formData.timeDuration}m
                  </span>
                )}
              </div>

              <div className="p-4 space-y-3">
                <h4 className="font-bold text-sm text-foreground line-clamp-1">
                  {formData.title || "Your Course Title"}
                </h4>
                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                  {formData.description || "Course description will appear here..."}
                </p>

                <div className="pt-2 border-t border-border/40 flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted-foreground">0 Modules</span>
                  <span
                    className={`font-black text-xs px-2 py-0.5 rounded-md ${
                      formData.isFree
                        ? "bg-emerald-500/10 text-emerald-600"
                        : "bg-purple-500/10 text-purple-600"
                    }`}
                  >
                    {formData.isFree ? "FREE" : `₹${formData.price}`}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
