"use client";

import React from "react";
import {
  Save,
  BookOpen,
  Clock,
  IndianRupee,
  Plus,
  Trash2,
  Sparkles,
  CheckCircle2,
  Eye,
  Tag,
} from "lucide-react";
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

interface CourseOverviewEditorProps {
  formData: {
    title: string;
    description: string;
    timeDuration: number;
    price: number;
    isFree: boolean;
    isActive: boolean;
    thumbnailUrl: string;
    category: string;
    highlights: string[];
  };
  setFormData: React.Dispatch<
    React.SetStateAction<{
      title: string;
      description: string;
      timeDuration: number;
      price: number;
      isFree: boolean;
      isActive: boolean;
      thumbnailUrl: string;
      category: string;
      highlights: string[];
    }>
  >;
  onSave: (e?: React.FormEvent) => void;
  isSubmitting: boolean;
}

export default function CourseOverviewEditor({
  formData,
  setFormData,
  onSave,
  isSubmitting,
}: CourseOverviewEditorProps) {
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      setFormData((prev) => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleAddHighlight = () => {
    setFormData((prev) => ({ ...prev, highlights: [...prev.highlights, ""] }));
  };

  const handleHighlightChange = (index: number, val: string) => {
    setFormData((prev) => {
      const arr = [...prev.highlights];
      arr[index] = val;
      return { ...prev, highlights: arr };
    });
  };

  const handleRemoveHighlight = (index: number) => {
    setFormData((prev) => {
      const arr = [...prev.highlights];
      arr.splice(index, 1);
      return { ...prev, highlights: arr };
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="flex items-center gap-3 border-b border-border/60 pb-5">
        <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-black shrink-0">
          <BookOpen size={20} />
        </div>
        <div>
          <h2 className="text-xl font-black text-foreground">Course Overview & Settings</h2>
          <p className="text-xs text-muted-foreground">
            Configure course metadata, category, pricing, banner, and student takeaways.
          </p>
        </div>
      </div>

      <form onSubmit={onSave} className="space-y-6">
        {/* Course Title */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Course Title <span className="text-destructive">*</span>
            </span>
            <span className="text-[11px] text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-md">
              displayed on course catalog
            </span>
          </div>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            placeholder="e.g., Confident Parenting: Surviving the Teen Years"
            className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-hidden text-sm font-bold text-foreground transition-all"
          />
        </div>

        {/* Category Picker Chips & Duration */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="md:col-span-2 space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Tag size={13} className="text-primary" /> Category
            </label>
            <div className="flex flex-wrap gap-2 pt-1">
              {CATEGORIES.map((cat) => {
                const isSelected = formData.category === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, category: cat }))}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      isSelected
                        ? "bg-primary text-primary-foreground shadow-xs ring-2 ring-primary/20"
                        : "bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Clock size={13} className="text-primary" /> Total Duration (mins)
            </label>
            <input
              type="number"
              name="timeDuration"
              value={formData.timeDuration}
              onChange={handleChange}
              min={0}
              placeholder="120"
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-hidden text-sm font-bold text-foreground transition-all"
            />
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Course Description & Student Value Proposition
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            placeholder="A comprehensive masterclass designed to equip modern parents with actionable frameworks..."
            className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-hidden text-sm text-foreground transition-all resize-y"
          />
        </div>

        {/* Course Banner Thumbnail via ImageUploader */}
        <div className="space-y-2">
          <ImageUploader
            label="Course Banner / Cover Artwork"
            description="Upload an engaging 16:9 banner image for the course catalog and landing card."
            value={formData.thumbnailUrl}
            onUpload={(url) => setFormData((prev) => ({ ...prev, thumbnailUrl: url }))}
            folder="lms/courses"
            aspectRatio="video"
          />
        </div>

        {/* Pricing & Visibility Card */}
        <div className="p-5 rounded-2xl bg-muted/20 border border-border/70 space-y-5">
          <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
            <IndianRupee size={16} className="text-primary" /> Pricing & Catalog Visibility
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Free vs Paid Toggle */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-foreground block">Free Course</span>
                  <span className="text-[11px] text-muted-foreground">
                    Grant free access to all registered users
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="isFree"
                    checked={formData.isFree}
                    onChange={handleChange}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-muted peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
              </div>

              {!formData.isFree && (
                <div className="space-y-1.5 animate-in fade-in">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Course Price (INR ₹)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground font-bold text-sm">
                      ₹
                    </span>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      min={0}
                      placeholder="999"
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-hidden text-sm font-bold text-foreground"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Published Toggle */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-foreground block">
                    Publish to Student Catalog
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    Live courses are visible in student discovery
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleChange}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-muted peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Key Highlights / Takeaways */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Sparkles size={14} className="text-primary" /> Key Learning Highlights
              </label>
              <p className="text-xs text-muted-foreground">
                Bullet points presented on the student enrollment landing card.
              </p>
            </div>
            <button
              type="button"
              onClick={handleAddHighlight}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary text-xs font-bold rounded-lg transition-colors"
            >
              <Plus size={13} /> Add Highlight
            </button>
          </div>

          <div className="space-y-2.5">
            {formData.highlights.map((highlight, index) => (
              <div key={index} className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                  {index + 1}
                </span>
                <input
                  type="text"
                  value={highlight}
                  onChange={(e) => handleHighlightChange(index, e.target.value)}
                  placeholder={`Highlight #${index + 1}`}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-hidden text-sm"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveHighlight(index)}
                  className="p-2 text-muted-foreground hover:text-destructive rounded-lg transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
            {formData.highlights.length === 0 && (
              <div className="p-4 border border-dashed border-border rounded-xl text-center">
                <p className="text-xs text-muted-foreground">
                  No highlights added. Click &quot;Add Highlight&quot; to describe student takeaways.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl font-bold text-sm shadow-md shadow-primary/20 transition-all disabled:opacity-50"
          >
            <Save size={16} /> {isSubmitting ? "Saving..." : "Save Course Settings"}
          </button>
        </div>
      </form>
    </div>
  );
}
