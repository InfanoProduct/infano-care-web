"use client";

import React, { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ChevronRight,
  Eye,
  EyeOff,
  Save,
  BookOpen,
  Layers,
  Video,
  FileQuestion,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { apiClient } from "@/lib/api-client";
import CurriculumSidebar from "@/components/admin/lms/CurriculumSidebar";
import CourseOverviewEditor from "@/components/admin/lms/CourseOverviewEditor";
import ModuleEditor from "@/components/admin/lms/ModuleEditor";
import VideoLessonEditor from "@/components/admin/lms/VideoLessonEditor";
import QuizLessonEditor from "@/components/admin/lms/QuizLessonEditor";
import StudentPreviewInspector from "@/components/admin/lms/StudentPreviewInspector";

export default function EditCoursePage(props: { params: Promise<{ id: string }> }) {
  const params = use(props.params);
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreviewInspector, setShowPreviewInspector] = useState(true);

  // Master Course Form State
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    timeDuration: 0,
    price: 0,
    isFree: true,
    isActive: true,
    thumbnailUrl: "",
    category: "Parenting",
    highlights: [] as string[],
  });

  const [modules, setModules] = useState<any[]>([]);

  // Active View & Selection State
  const [activeView, setActiveView] = useState<"COURSE" | "MODULE" | "CHAPTER">("COURSE");
  const [currentModule, setCurrentModule] = useState<any>(null);
  const [currentChapter, setCurrentChapter] = useState<any>(null);
  const [activeModuleIdForChapter, setActiveModuleIdForChapter] = useState<string | null>(null);

  useEffect(() => {
    fetchCourseDetails();
  }, [params.id]);

  const fetchCourseDetails = async () => {
    try {
      const course = await apiClient.get<any>(`/lms/${params.id}`);
      setFormData({
        title: course.title || "",
        description: course.description || "",
        timeDuration: course.timeDuration || 0,
        price: course.price || 0,
        isFree: course.isFree || false,
        isActive: course.isActive ?? true,
        thumbnailUrl: course.thumbnailUrl || "",
        category: course.category || "Parenting",
        highlights: course.highlights || [],
      });
      setModules(course.modules || []);
    } catch (error) {
      toast.error("Failed to load course details");
    } finally {
      setIsLoading(false);
    }
  };

  // Save Course Settings
  const handleSaveCourse = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!formData.title?.trim()) {
      toast.error("Course title is required");
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
      await apiClient.put(`/lms/admin/courses/${params.id}`, cleanedFormData);
      toast.success("Course settings saved successfully!");
      fetchCourseDetails();
    } catch (error) {
      toast.error("Error updating course");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Module Actions
  const handleSelectModule = (mod: any) => {
    setCurrentModule({
      id: mod.id,
      title: mod.title || "",
      description: mod.description || "",
      timeDuration: mod.timeDuration || 0,
      order: mod.order || 1,
      thumbnailUrl: mod.thumbnailUrl || "",
      chapters: mod.chapters || [],
    });
    setActiveView("MODULE");
  };

  const handleAddModule = () => {
    setCurrentModule({
      id: undefined,
      title: "",
      description: "",
      timeDuration: 0,
      order: (modules.length || 0) + 1,
      thumbnailUrl: "",
      chapters: [],
    });
    setActiveView("MODULE");
  };

  const handleSaveModule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentModule.title?.trim()) return toast.error("Module title is required");
    setIsSubmitting(true);

    try {
      const payload = {
        title: currentModule.title,
        description: currentModule.description || "",
        timeDuration: Number(currentModule.timeDuration) || 0,
        order: Number(currentModule.order) || 1,
        thumbnailUrl: currentModule.thumbnailUrl || "",
      };

      if (currentModule.id) {
        await apiClient.put(`/lms/admin/modules/${currentModule.id}`, payload);
        toast.success("Module updated successfully");
      } else {
        await apiClient.post(`/lms/admin/courses/${params.id}/modules`, payload);
        toast.success("Module created successfully");
      }
      await fetchCourseDetails();
      setActiveView("COURSE");
    } catch (error) {
      toast.error("Error saving module");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteModule = async (moduleId: string, title: string) => {
    if (!confirm(`Are you sure you want to delete module "${title}" and all its lessons?`)) return;
    try {
      await apiClient.delete(`/lms/admin/modules/${moduleId}`);
      toast.success("Module deleted");
      if (currentModule?.id === moduleId) setActiveView("COURSE");
      fetchCourseDetails();
    } catch (error) {
      toast.error("Error deleting module");
    }
  };

  // Chapter Actions
  const handleSelectChapter = (moduleId: string, chap: any) => {
    setActiveModuleIdForChapter(moduleId);
    setCurrentChapter({
      id: chap.id,
      title: chap.title || "",
      description: chap.description || "",
      type: chap.type || "VIDEO",
      order: chap.order || 1,
      thumbnailUrl: chap.thumbnailUrl || "",
      videoUrl: chap.video?.videoUrl || "",
      videoDuration: chap.video?.duration || 0,
      passingScore: chap.assessment?.passingScore || 80,
      assessmentQuestions: chap.assessment?.questions || [
        {
          question: "",
          options: ["", "", "", ""],
          correctOptionIndex: 0,
          explanation: "",
        },
      ],
      goodToKnowPoints: chap.goodToKnowPoints?.length ? chap.goodToKnowPoints : [""],
      faqs: chap.faqs?.length ? chap.faqs : [{ question: "", answer: "" }],
    });
    setActiveView("CHAPTER");
  };

  const handleAddChapter = (moduleId: string) => {
    setActiveModuleIdForChapter(moduleId);
    const parentMod = modules.find((m) => m.id === moduleId);
    setCurrentChapter({
      id: undefined,
      title: "",
      description: "",
      type: "VIDEO",
      order: (parentMod?.chapters?.length || 0) + 1,
      thumbnailUrl: "",
      videoUrl: "",
      videoDuration: 15,
      passingScore: 80,
      assessmentQuestions: [
        {
          question: "",
          options: ["", "", "", ""],
          correctOptionIndex: 0,
          explanation: "",
        },
      ],
      goodToKnowPoints: [""],
      faqs: [{ question: "", answer: "" }],
    });
    setActiveView("CHAPTER");
  };

  const handleSaveChapter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentChapter.title?.trim()) return toast.error("Lesson title is required");
    if (!activeModuleIdForChapter) return toast.error("Parent module not found");
    setIsSubmitting(true);

    try {
      const payload = {
        title: currentChapter.title,
        description: currentChapter.description || "",
        type: currentChapter.type,
        order: Number(currentChapter.order) || 1,
        thumbnailUrl: currentChapter.thumbnailUrl || "",
        videoUrl: currentChapter.type === "VIDEO" ? currentChapter.videoUrl || "" : undefined,
        videoDuration:
          currentChapter.type === "VIDEO" ? Number(currentChapter.videoDuration) || 0 : undefined,
        passingScore:
          currentChapter.type === "ASSESSMENT"
            ? Number(currentChapter.passingScore) || 80
            : undefined,
        assessmentQuestions:
          currentChapter.type === "ASSESSMENT"
            ? (currentChapter.assessmentQuestions || []).filter((q: any) => q.question?.trim() !== "")
            : undefined,
        goodToKnowPoints: (currentChapter.goodToKnowPoints || []).filter(
          (p: string) => p.trim() !== ""
        ),
        faqs: (currentChapter.faqs || []).filter(
          (f: any) => f.question?.trim() || f.answer?.trim()
        ),
      };

      if (currentChapter.id) {
        await apiClient.put(`/lms/admin/chapters/${currentChapter.id}`, payload);
        toast.success("Lesson updated successfully");
      } else {
        await apiClient.post(`/lms/admin/modules/${activeModuleIdForChapter}/chapters`, payload);
        toast.success("Lesson created successfully");
      }
      await fetchCourseDetails();
    } catch (error) {
      toast.error("Error saving lesson");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteChapter = async (chapterId: string, title: string) => {
    if (!confirm(`Are you sure you want to delete lesson "${title}"?`)) return;
    try {
      await apiClient.delete(`/lms/admin/chapters/${chapterId}`);
      toast.success("Lesson deleted");
      if (currentChapter?.id === chapterId) setActiveView("COURSE");
      fetchCourseDetails();
    } catch (error) {
      toast.error("Error deleting lesson");
    }
  };

  // Reordering Actions
  const handleMoveModule = async (index: number, direction: "UP" | "DOWN", e: React.MouseEvent) => {
    e.stopPropagation();
    const sorted = [...modules].sort((a, b) => a.order - b.order);
    const targetIndex = direction === "UP" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sorted.length) return;

    const current = sorted[index];
    const target = sorted[targetIndex];

    try {
      await Promise.all([
        apiClient.put(`/lms/admin/modules/${current.id}`, { ...current, order: target.order }),
        apiClient.put(`/lms/admin/modules/${target.id}`, { ...target, order: current.order }),
      ]);
      fetchCourseDetails();
      toast.success("Module order updated");
    } catch (err) {
      toast.error("Failed to reorder modules");
    }
  };

  const handleMoveChapter = async (
    mod: any,
    chapterIndex: number,
    direction: "UP" | "DOWN",
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    const sorted = [...(mod.chapters || [])].sort((a: any, b: any) => a.order - b.order);
    const targetIndex = direction === "UP" ? chapterIndex - 1 : chapterIndex + 1;
    if (targetIndex < 0 || targetIndex >= sorted.length) return;

    const current = sorted[chapterIndex];
    const target = sorted[targetIndex];

    try {
      await Promise.all([
        apiClient.put(`/lms/admin/chapters/${current.id}`, { ...current, order: target.order }),
        apiClient.put(`/lms/admin/chapters/${target.id}`, { ...target, order: current.order }),
      ]);
      fetchCourseDetails();
      toast.success("Lesson order updated");
    } catch (err) {
      toast.error("Failed to reorder lessons");
    }
  };

  // Find active module for breadcrumbs
  const activeModule = modules.find(
    (m) =>
      (activeView === "MODULE" && m.id === currentModule?.id) ||
      (activeView === "CHAPTER" && m.id === activeModuleIdForChapter)
  );

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-semibold text-muted-foreground">
          Opening LMS Curriculum Studio...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto space-y-5 pb-16 animate-in fade-in duration-500 px-2 sm:px-4">
      {/* Top Sticky Studio Control Bar */}
      <div className="bg-card rounded-2xl border border-border/70 p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-2 z-20 backdrop-blur-md bg-card/95">
        {/* Left: Back Link & Breadcrumbs */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <Link
            href="/admin/lms/courses"
            className="p-2 bg-muted/60 hover:bg-muted rounded-xl transition-colors text-muted-foreground hover:text-foreground shrink-0"
            title="Back to all courses"
          >
            <ArrowLeft size={18} />
          </Link>

          {/* Interactive Breadcrumbs */}
          <div className="flex items-center gap-1.5 text-xs min-w-0 overflow-x-auto whitespace-nowrap">
            <button
              type="button"
              onClick={() => setActiveView("COURSE")}
              className={`font-black hover:text-primary transition-colors truncate max-w-[200px] ${
                activeView === "COURSE" ? "text-primary" : "text-foreground"
              }`}
            >
              {formData.title || "Course Studio"}
            </button>

            {activeModule && (
              <>
                <ChevronRight size={13} className="text-muted-foreground shrink-0" />
                <button
                  type="button"
                  onClick={() => handleSelectModule(activeModule)}
                  className={`font-bold hover:text-primary transition-colors truncate max-w-[180px] ${
                    activeView === "MODULE" ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  M{activeModule.order}: {activeModule.title}
                </button>
              </>
            )}

            {activeView === "CHAPTER" && currentChapter && (
              <>
                <ChevronRight size={13} className="text-muted-foreground shrink-0" />
                <span className="font-bold text-primary truncate max-w-[200px]">
                  {currentChapter.title || "New Lesson"}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Right: Toggle Preview & Global Save */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => setShowPreviewInspector((prev) => !prev)}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all ${
              showPreviewInspector
                ? "bg-primary/10 border-primary/40 text-primary"
                : "bg-muted/60 border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            {showPreviewInspector ? <Eye size={14} /> : <EyeOff size={14} />}
            <span className="hidden sm:inline">
              {showPreviewInspector ? "Inspector On" : "Inspector Off"}
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleSaveCourse()}
            disabled={isSubmitting}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl font-bold text-xs shadow-sm shadow-primary/20 transition-all disabled:opacity-50"
          >
            <Save size={14} /> {isSubmitting ? "Saving..." : "Save Course"}
          </button>
        </div>
      </div>

      {/* 3-Zone Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Zone 1: Curriculum Hierarchy Tree (3 cols on large screen) */}
        <div className="lg:col-span-3">
          <CurriculumSidebar
            courseTitle={formData.title}
            modules={modules}
            activeView={activeView}
            currentModuleId={currentModule?.id || null}
            currentChapterId={currentChapter?.id || null}
            onSelectCourse={() => setActiveView("COURSE")}
            onSelectModule={handleSelectModule}
            onSelectChapter={handleSelectChapter}
            onAddModule={handleAddModule}
            onAddChapter={handleAddChapter}
            onDeleteModule={handleDeleteModule}
            onDeleteChapter={handleDeleteChapter}
            onMoveModule={handleMoveModule}
            onMoveChapter={handleMoveChapter}
          />
        </div>

        {/* Zone 2: Focused Workspace Canvas (6 cols if preview is on, 9 cols if preview is off) */}
        <div
          className={`${
            showPreviewInspector ? "lg:col-span-6" : "lg:col-span-9"
          } bg-card rounded-2xl border border-border/70 shadow-xs p-6 sm:p-8 min-h-[640px]`}
        >
          {activeView === "COURSE" && (
            <CourseOverviewEditor
              formData={formData}
              setFormData={setFormData}
              onSave={handleSaveCourse}
              isSubmitting={isSubmitting}
            />
          )}

          {activeView === "MODULE" && currentModule && (
            <ModuleEditor
              currentModule={currentModule}
              setCurrentModule={setCurrentModule}
              onSave={handleSaveModule}
              onDelete={handleDeleteModule}
              onBackToCourse={() => setActiveView("COURSE")}
              onOpenChapter={(mId, chap) =>
                chap ? handleSelectChapter(mId, chap) : handleAddChapter(mId)
              }
              isSubmitting={isSubmitting}
            />
          )}

          {activeView === "CHAPTER" &&
            currentChapter &&
            currentChapter.type === "VIDEO" && (
              <VideoLessonEditor
                currentChapter={currentChapter}
                setCurrentChapter={setCurrentChapter}
                onSave={handleSaveChapter}
                onDelete={handleDeleteChapter}
                onBackToCourse={() => setActiveView("COURSE")}
                onSwitchType={(type) =>
                  setCurrentChapter((prev: any) => ({ ...prev, type }))
                }
                isSubmitting={isSubmitting}
              />
            )}

          {activeView === "CHAPTER" &&
            currentChapter &&
            currentChapter.type === "ASSESSMENT" && (
              <QuizLessonEditor
                currentChapter={currentChapter}
                setCurrentChapter={setCurrentChapter}
                onSave={handleSaveChapter}
                onDelete={handleDeleteChapter}
                onBackToCourse={() => setActiveView("COURSE")}
                onSwitchType={(type) =>
                  setCurrentChapter((prev: any) => ({ ...prev, type }))
                }
                isSubmitting={isSubmitting}
              />
            )}
        </div>

        {/* Zone 3: Live Student Preview & Inspector (3 cols, toggleable) */}
        {showPreviewInspector && (
          <div className="lg:col-span-3">
            <StudentPreviewInspector
              activeView={activeView}
              courseData={formData}
              currentModule={currentModule}
              currentChapter={currentChapter}
            />
          </div>
        )}
      </div>
    </div>
  );
}
