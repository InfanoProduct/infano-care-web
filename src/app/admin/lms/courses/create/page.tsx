"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Plus } from "lucide-react";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { apiClient } from "@/lib/api-client";

export default function CreateCoursePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    timeDuration: 0,
    price: 0,
    isFree: true,
    thumbnailUrl: "",
    category: "Parenting",
    highlights: [] as string[],
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      setFormData(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleAddHighlight = () => {
    setFormData(prev => ({ ...prev, highlights: [...prev.highlights, ""] }));
  };

  const handleHighlightChange = (index: number, value: string) => {
    setFormData(prev => {
      const newHighlights = [...prev.highlights];
      newHighlights[index] = value;
      return { ...prev, highlights: newHighlights };
    });
  };

  const handleRemoveHighlight = (index: number) => {
    setFormData(prev => {
      const newHighlights = [...prev.highlights];
      newHighlights.splice(index, 1);
      return { ...prev, highlights: newHighlights };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Filter out empty highlights before submitting
    const cleanedFormData = {
      ...formData,
      highlights: formData.highlights.filter(h => h.trim() !== "")
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
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/admin/lms/courses" className="p-2 hover:bg-muted rounded-full transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Create New Course</h1>
          <p className="text-muted-foreground">Define basic details first. You can add modules and video chapters on the next screen.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-card rounded-xl border border-border shadow-sm p-6 space-y-6">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Course Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
              placeholder="e.g. Advanced Mathematics"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Thumbnail Image URL</label>
            <input
              type="text"
              name="thumbnailUrl"
              value={formData.thumbnailUrl}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
              placeholder="https://images.unsplash.com/..."
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={4}
              className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
              placeholder="Brief description of what this course covers..."
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
              className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
            >
              <option value="Parenting">Parenting</option>
              <option value="Teen Health">Teen Health</option>
              <option value="Nutrition">Nutrition</option>
              <option value="Productivity">Productivity</option>
              <option value="Wellbeing">Wellbeing</option>
              <option value="Digital Life">Digital Life</option>
              <option value="General">General</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Course Highlights / Key Points</label>
            <p className="text-xs text-muted-foreground mb-3">Add key points that will be displayed on the course detail page.</p>
            <div className="space-y-2">
              {formData.highlights.map((highlight, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={highlight}
                    onChange={(e) => handleHighlightChange(index, e.target.value)}
                    className="flex-1 px-4 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    placeholder="e.g. 10 hours of on-demand video"
                  />
                  <button 
                    type="button" 
                    onClick={() => handleRemoveHighlight(index)}
                    className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
            <button 
              type="button"
              onClick={handleAddHighlight}
              className="mt-3 flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-primary bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors"
            >
              <Plus size={16} /> Add Highlight
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Duration (minutes)</label>
              <input
                type="number"
                name="timeDuration"
                value={formData.timeDuration}
                onChange={handleChange}
                min="0"
                className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
              />
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center h-full pt-6 gap-2">
                <input
                  type="checkbox"
                  id="isFree"
                  name="isFree"
                  checked={formData.isFree}
                  onChange={handleChange}
                  className="rounded text-primary focus:ring-primary h-4 w-4"
                />
                <label htmlFor="isFree" className="text-sm font-medium">This course is Free</label>
              </div>
            </div>
          </div>

          {!formData.isFree && (
            <div>
              <label className="text-sm font-medium mb-1 block">Price (₹)</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                min="0"
                className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all max-w-[200px]"
              />
            </div>
          )}
        </div>

        <div className="pt-4 border-t border-border flex justify-end gap-3">
          <Link
            href="/admin/lms/courses"
            className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-md font-medium transition-colors disabled:opacity-50"
          >
            {isSubmitting ? (
              "Saving..."
            ) : (
              <>
                <Save size={16} />
                Save Course
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
