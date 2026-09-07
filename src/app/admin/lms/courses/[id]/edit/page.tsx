"use client";

import React, { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  Edit2,
  Video,
  FileQuestion,
  ChevronDown,
  ChevronRight,
  Layers,
  Sparkles,
  BookOpen,
  HelpCircle,
  PlayCircle,
  ArrowUp,
  ArrowDown,
  Clock,
  IndianRupee,
  CheckCircle2,
  Eye,
  AlertCircle,
  Film,
  Award,
  ListPlus,
  HelpCircle as FaqIcon,
  X,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { apiClient } from "@/lib/api-client";
import ImageUploader from "@/components/upload/ImageUploader";
import VideoUploader from "@/components/upload/VideoUploader";

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

interface QuizQuestion {
  question: string;
  options: string[];
  correctOptionIndex: number;
  explanation?: string;
}

interface FaqItem {
  question: string;
  answer: string;
}

export default function EditCoursePage(props: { params: Promise<{ id: string }> }) {
  const params = use(props.params);
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Course level state
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

  // Navigation & View state
  const [activeView, setActiveView] = useState<"COURSE" | "MODULE" | "CHAPTER">("COURSE");
  const [currentModule, setCurrentModule] = useState<any>(null);
  const [currentChapter, setCurrentChapter] = useState<any>(null);
  const [activeModuleIdForChapter, setActiveModuleIdForChapter] = useState<string | null>(null);
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});

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

      const expandState: Record<string, boolean> = {};
      course.modules?.forEach((m: any) => {
        expandState[m.id] = true;
      });
      setExpandedModules((prev) => ({ ...expandState, ...prev }));
    } catch (error) {
      toast.error("Failed to load course details");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCourseChange = (
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
      toast.success("Course details saved successfully!");
      fetchCourseDetails();
    } catch (error) {
      toast.error("Error updating course");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Module Actions
  const handleOpenModuleEditor = (mod?: any) => {
    if (mod) {
      setCurrentModule({
        id: mod.id,
        title: mod.title || "",
        description: mod.description || "",
        timeDuration: mod.timeDuration || 0,
        order: mod.order || 1,
        thumbnailUrl: mod.thumbnailUrl || "",
        chapters: mod.chapters || [],
      });
    } else {
      setCurrentModule({
        id: undefined,
        title: "",
        description: "",
        timeDuration: 0,
        order: (modules.length || 0) + 1,
        thumbnailUrl: "",
        chapters: [],
      });
    }
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
  const handleOpenChapterEditor = (moduleId: string, chap?: any) => {
    setActiveModuleIdForChapter(moduleId);
    const parentMod = modules.find((m) => m.id === moduleId);
    if (chap) {
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
    } else {
      setCurrentChapter({
        id: undefined,
        title: "",
        description: "",
        type: "VIDEO",
        order: (parentMod?.chapters?.length || 0) + 1,
        thumbnailUrl: "",
        videoUrl: "",
        videoDuration: 0,
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
    }
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
        videoDuration: currentChapter.type === "VIDEO" ? Number(currentChapter.videoDuration) || 0 : undefined,
        passingScore: currentChapter.type === "ASSESSMENT" ? Number(currentChapter.passingScore) || 80 : undefined,
        assessmentQuestions:
          currentChapter.type === "ASSESSMENT"
            ? (currentChapter.assessmentQuestions || []).filter((q: QuizQuestion) => q.question?.trim() !== "")
            : undefined,
        goodToKnowPoints: (currentChapter.goodToKnowPoints || []).filter((p: string) => p.trim() !== ""),
        faqs: (currentChapter.faqs || []).filter((f: FaqItem) => f.question?.trim() || f.answer?.trim()),
      };

      if (currentChapter.id) {
        await apiClient.put(`/lms/admin/chapters/${currentChapter.id}`, payload);
        toast.success("Lesson updated successfully");
      } else {
        await apiClient.post(`/lms/admin/modules/${activeModuleIdForChapter}/chapters`, payload);
        toast.success("Lesson created successfully");
      }
      await fetchCourseDetails();
      setActiveView("COURSE");
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

  const toggleModuleExpand = (moduleId: string) => {
    setExpandedModules((prev) => ({ ...prev, [moduleId]: !prev[moduleId] }));
  };

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

  // Chapter Sub-item Handlers
  const handleAddGoodToKnow = () => {
    setCurrentChapter((prev: any) => ({
      ...prev,
      goodToKnowPoints: [...(prev.goodToKnowPoints || []), ""],
    }));
  };

  const handleGoodToKnowChange = (index: number, val: string) => {
    setCurrentChapter((prev: any) => {
      const arr = [...(prev.goodToKnowPoints || [])];
      arr[index] = val;
      return { ...prev, goodToKnowPoints: arr };
    });
  };

  const handleRemoveGoodToKnow = (index: number) => {
    setCurrentChapter((prev: any) => {
      const arr = [...(prev.goodToKnowPoints || [])];
      arr.splice(index, 1);
      return { ...prev, goodToKnowPoints: arr };
    });
  };

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

  // Quiz Question Builder Handlers
  const handleAddQuizQuestion = () => {
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

  const handleRemoveQuizQuestion = (qIdx: number) => {
    setCurrentChapter((prev: any) => {
      const arr = [...(prev.assessmentQuestions || [])];
      arr.splice(qIdx, 1);
      return { ...prev, assessmentQuestions: arr };
    });
  };

  const handleQuizQuestionTextChange = (qIdx: number, val: string) => {
    setCurrentChapter((prev: any) => {
      const arr = [...(prev.assessmentQuestions || [])];
      arr[qIdx] = { ...arr[qIdx], question: val };
      return { ...prev, assessmentQuestions: arr };
    });
  };

  const handleQuizOptionChange = (qIdx: number, optIdx: number, val: string) => {
    setCurrentChapter((prev: any) => {
      const arr = [...(prev.assessmentQuestions || [])];
      const opts = [...(arr[qIdx].options || ["", "", "", ""])];
      opts[optIdx] = val;
      arr[qIdx] = { ...arr[qIdx], options: opts };
      return { ...prev, assessmentQuestions: arr };
    });
  };

  const handleQuizCorrectAnswerChange = (qIdx: number, optIdx: number) => {
    setCurrentChapter((prev: any) => {
      const arr = [...(prev.assessmentQuestions || [])];
      arr[qIdx] = { ...arr[qIdx], correctOptionIndex: optIdx };
      return { ...prev, assessmentQuestions: arr };
    });
  };

  const handleQuizExplanationChange = (qIdx: number, val: string) => {
    setCurrentChapter((prev: any) => {
      const arr = [...(prev.assessmentQuestions || [])];
      arr[qIdx] = { ...arr[qIdx], explanation: val };
      return { ...prev, assessmentQuestions: arr };
    });
  };

  const totalModulesCount = modules.length;
  const totalVideoLessons = modules.reduce(
    (sum, m) => sum + (m.chapters?.filter((c: any) => c.type === "VIDEO")?.length || 0),
    0
  );
  const totalQuizzes = modules.reduce(
    (sum, m) => sum + (m.chapters?.filter((c: any) => c.type === "ASSESSMENT")?.length || 0),
    0
  );

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-semibold text-muted-foreground">Loading Course Curriculum Studio...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-24 animate-in fade-in duration-500">
      {/* Top Sticky Header */}
      <div className="bg-card rounded-2xl border border-border/60 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/lms/courses"
            className="p-2.5 bg-muted/60 hover:bg-muted rounded-xl transition-colors text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-black text-foreground tracking-tight">
                {formData.title || "Untitled Course"}
              </h1>
              <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-primary/10 text-primary">
                {formData.category}
              </span>
              <span
                className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${
                  formData.isActive ? "bg-emerald-500/10 text-emerald-600" : "bg-amber-500/10 text-amber-600"
                }`}
              >
                {formData.isActive ? "Published" : "Draft"}
              </span>
            </div>
            <p className="text-xs text-muted-foreground font-medium mt-1 flex items-center gap-3">
              <span>{totalModulesCount} Modules</span>
              <span>•</span>
              <span>{totalVideoLessons} Video Lessons</span>
              <span>•</span>
              <span>{totalQuizzes} Quizzes</span>
              <span>•</span>
              <span>{formData.timeDuration} mins total</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => handleSaveCourse()}
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl font-bold text-sm shadow-md shadow-primary/20 transition-all disabled:opacity-50"
          >
            <Save size={16} /> {isSubmitting ? "Saving..." : "Save Course Settings"}
          </button>
        </div>
      </div>

      {/* Main Studio 2-Column Split: Sidebar Curriculum Tree + Main Working Canvas */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* LEFT COLUMN: Curriculum Hierarchy Tree */}
        <div className="w-full lg:w-[380px] shrink-0 space-y-4">
          {/* Main Course Info Selector */}
          <button
            type="button"
            onClick={() => setActiveView("COURSE")}
            className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center justify-between shadow-xs ${
              activeView === "COURSE"
                ? "bg-primary/10 border-primary text-primary ring-2 ring-primary/20"
                : "bg-card border-border/70 hover:border-primary/50 text-foreground"
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm ${
                  activeView === "COURSE"
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                <BookOpen size={18} />
              </div>
              <div>
                <p className="font-bold text-sm">Course Overview & Settings</p>
                <p className="text-xs text-muted-foreground">General, pricing & thumbnail</p>
              </div>
            </div>
            <ChevronRight size={16} className={activeView === "COURSE" ? "text-primary" : "text-muted-foreground"} />
          </button>

          {/* Curriculum Tree Accordion Card */}
          <div className="bg-card border border-border/60 rounded-2xl overflow-hidden shadow-xs">
            <div className="p-4 bg-muted/40 border-b border-border/60 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-foreground">Curriculum Outline</h3>
                <p className="text-[11px] text-muted-foreground">
                  {modules.length} {modules.length === 1 ? "Module" : "Modules"} organized
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleOpenModuleEditor()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary text-xs font-bold rounded-lg transition-colors"
              >
                <Plus size={14} /> Add Module
              </button>
            </div>

            {modules.length === 0 ? (
              <div className="p-8 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center mx-auto text-muted-foreground">
                  <Layers size={22} />
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">No modules yet</p>
                  <p className="text-xs text-muted-foreground">
                    Start by creating your first course module below
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleOpenModuleEditor()}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-xs font-bold"
                >
                  <Plus size={14} /> Create First Module
                </button>
              </div>
            ) : (
              <div className="divide-y divide-border/60 max-h-[640px] overflow-y-auto">
                {modules
                  .sort((a, b) => a.order - b.order)
                  .map((mod: any, mIdx: number) => {
                    const isModExpanded = expandedModules[mod.id] ?? true;
                    const isModActive = activeView === "MODULE" && currentModule?.id === mod.id;
                    const chaptersCount = mod.chapters?.length || 0;

                    return (
                      <div key={mod.id} className="group/mod">
                        {/* Module Header Row */}
                        <div
                          className={`flex items-center justify-between p-3.5 transition-colors ${
                            isModActive
                              ? "bg-primary/10 border-l-4 border-primary"
                              : "hover:bg-muted/30"
                          }`}
                        >
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <button
                              type="button"
                              onClick={() => toggleModuleExpand(mod.id)}
                              className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground"
                            >
                              <ChevronDown
                                size={15}
                                className={`transition-transform duration-200 ${
                                  isModExpanded ? "" : "-rotate-90"
                                }`}
                              />
                            </button>
                            <div
                              onClick={() => handleOpenModuleEditor(mod)}
                              className="cursor-pointer flex-1 min-w-0"
                            >
                              <div className="flex items-center gap-1.5">
                                <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                                  MOD {mod.order || mIdx + 1}
                                </span>
                                <span className="text-[11px] font-medium text-muted-foreground">
                                  ({chaptersCount} {chaptersCount === 1 ? "lesson" : "lessons"})
                                </span>
                              </div>
                              <p
                                className={`text-xs font-bold truncate ${
                                  isModActive ? "text-primary font-black" : "text-foreground"
                                }`}
                              >
                                {mod.title || "Untitled Module"}
                              </p>
                            </div>
                          </div>

                          {/* Module Quick Actions */}
                          <div className="flex items-center gap-1 shrink-0 ml-2">
                            <div className="flex flex-col">
                              <button
                                type="button"
                                disabled={mIdx === 0}
                                onClick={(e) => handleMoveModule(mIdx, "UP", e)}
                                className="p-0.5 text-muted-foreground hover:text-foreground disabled:opacity-20"
                                title="Move Module Up"
                              >
                                <ArrowUp size={11} />
                              </button>
                              <button
                                type="button"
                                disabled={mIdx === modules.length - 1}
                                onClick={(e) => handleMoveModule(mIdx, "DOWN", e)}
                                className="p-0.5 text-muted-foreground hover:text-foreground disabled:opacity-20"
                                title="Move Module Down"
                              >
                                <ArrowDown size={11} />
                              </button>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleDeleteModule(mod.id, mod.title)}
                              className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                              title="Delete Module"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>

                        {/* Module Sub-Chapters List */}
                        {isModExpanded && (
                          <div className="bg-muted/15 pb-2 border-t border-border/30">
                            {mod.chapters?.length === 0 ? (
                              <p className="text-[11px] text-muted-foreground/70 italic px-8 py-2">
                                No lessons in this module yet
                              </p>
                            ) : (
                              mod.chapters
                                ?.sort((a: any, b: any) => a.order - b.order)
                                .map((chap: any, cIdx: number) => {
                                  const isChapActive =
                                    activeView === "CHAPTER" && currentChapter?.id === chap.id;
                                  return (
                                    <div
                                      key={chap.id}
                                      className={`flex items-center justify-between pl-8 pr-3 py-2 text-xs transition-colors ${
                                        isChapActive
                                          ? "bg-primary/15 border-l-4 border-primary text-primary font-bold"
                                          : "hover:bg-muted/40 text-muted-foreground hover:text-foreground"
                                      }`}
                                    >
                                      <div
                                        onClick={() => handleOpenChapterEditor(mod.id, chap)}
                                        className="flex-1 flex items-center gap-2 min-w-0 cursor-pointer"
                                      >
                                        {chap.type === "VIDEO" ? (
                                          <Video
                                            size={13}
                                            className={
                                              isChapActive ? "text-primary shrink-0" : "text-blue-500 shrink-0"
                                            }
                                          />
                                        ) : (
                                          <FileQuestion
                                            size={13}
                                            className={
                                              isChapActive
                                                ? "text-primary shrink-0"
                                                : "text-amber-500 shrink-0"
                                            }
                                          />
                                        )}
                                        <span className="truncate">{chap.title || "Untitled Lesson"}</span>
                                      </div>

                                      <div className="flex items-center gap-1 shrink-0 ml-1.5">
                                        <button
                                          type="button"
                                          disabled={cIdx === 0}
                                          onClick={(e) => handleMoveChapter(mod, cIdx, "UP", e)}
                                          className="p-0.5 text-muted-foreground hover:text-foreground disabled:opacity-20"
                                        >
                                          <ArrowUp size={10} />
                                        </button>
                                        <button
                                          type="button"
                                          disabled={cIdx === (mod.chapters?.length || 0) - 1}
                                          onClick={(e) => handleMoveChapter(mod, cIdx, "DOWN", e)}
                                          className="p-0.5 text-muted-foreground hover:text-foreground disabled:opacity-20"
                                        >
                                          <ArrowDown size={10} />
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => handleDeleteChapter(chap.id, chap.title)}
                                          className="p-1 text-muted-foreground hover:text-destructive rounded transition-colors"
                                        >
                                          <Trash2 size={11} />
                                        </button>
                                      </div>
                                    </div>
                                  );
                                })
                            )}

                            {/* Add Lesson Button for this Module */}
                            <div className="px-8 pt-1">
                              <button
                                type="button"
                                onClick={() => handleOpenChapterEditor(mod.id)}
                                className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:text-primary/80 py-1"
                              >
                                <Plus size={13} /> Add Lesson / Quiz
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            )}

            <div className="p-3 bg-muted/30 border-t border-border/60">
              <button
                type="button"
                onClick={() => handleOpenModuleEditor()}
                className="w-full py-2.5 bg-background hover:bg-muted border border-dashed border-border hover:border-primary/50 text-foreground rounded-xl font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <Plus size={14} /> Add Another Module
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Interactive Work Canvas */}
        <div className="flex-1 bg-card rounded-2xl border border-border/60 shadow-xs p-6 sm:p-8 min-h-[640px] w-full">
          {/* VIEW 1: COURSE OVERVIEW & SETTINGS */}
          {activeView === "COURSE" && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-5">
                <div>
                  <h2 className="text-xl font-black text-foreground">Course Overview & Settings</h2>
                  <p className="text-xs text-muted-foreground">
                    Configure high-level metadata, pricing, category, and student-facing details.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleSaveCourse()}
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl font-bold text-xs shadow-sm transition-all"
                >
                  <Save size={14} /> {isSubmitting ? "Saving..." : "Save Course"}
                </button>
              </div>

              <form onSubmit={handleSaveCourse} className="space-y-6">
                {/* Course Title */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Course Title <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleCourseChange}
                    required
                    placeholder="e.g., Confident Parenting: Surviving the Teen Years"
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-hidden text-sm font-semibold text-foreground transition-all"
                  />
                </div>

                {/* Category & Status */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Category
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleCourseChange}
                      className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-hidden text-sm font-medium text-foreground transition-all"
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Estimated Duration (minutes)
                    </label>
                    <div className="relative">
                      <Clock
                        size={16}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
                      />
                      <input
                        type="number"
                        name="timeDuration"
                        value={formData.timeDuration}
                        onChange={handleCourseChange}
                        min={0}
                        placeholder="120"
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-hidden text-sm font-semibold text-foreground transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Course Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleCourseChange}
                    rows={4}
                    placeholder="A comprehensive guide designed to equip modern parents with actionable frameworks..."
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-hidden text-sm font-normal text-foreground transition-all resize-y"
                  />
                </div>

                {/* Course Thumbnail via ImageUploader */}
                <div className="space-y-2">
                  <ImageUploader
                    label="Course Banner / Thumbnail"
                    description="Upload an engaging 16:9 banner image for the course catalog and landing card."
                    value={formData.thumbnailUrl}
                    onUpload={(url) => setFormData((prev) => ({ ...prev, thumbnailUrl: url }))}
                    folder="lms/courses"
                    aspectRatio="video"
                  />
                </div>

                {/* Pricing & Publication Status Box */}
                <div className="p-5 rounded-2xl bg-muted/30 border border-border/70 space-y-5">
                  <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                    <IndianRupee size={16} className="text-primary" /> Pricing & Visibility
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Free vs Paid Toggle */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-foreground">Free Course</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            name="isFree"
                            checked={formData.isFree}
                            onChange={handleCourseChange}
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
                              onChange={handleCourseChange}
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
                            Publish to Catalog
                          </span>
                          <span className="text-[11px] text-muted-foreground">
                            Make this course visible to students
                          </span>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            name="isActive"
                            checked={formData.isActive}
                            onChange={handleCourseChange}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-muted peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Key Takeaways / Highlights */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Key Course Highlights
                      </label>
                      <p className="text-xs text-muted-foreground">
                        Bullet points shown to students on the course overview page.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddHighlight}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary text-xs font-bold rounded-lg transition-colors"
                    >
                      <Plus size={13} /> Add Point
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
                          placeholder={`Key takeaway #${index + 1}`}
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
                          No highlights added. Click &quot;Add Point&quot; to list what students will learn.
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
          )}

          {/* VIEW 2: MODULE EDITOR */}
          {activeView === "MODULE" && currentModule && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-black text-sm">
                    <Layers size={20} />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-foreground">
                      {currentModule.id ? `Edit Module: ${currentModule.title || "Untitled"}` : "Create New Module"}
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      Organize your curriculum into structured milestones and learning units.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveView("COURSE")}
                    className="px-4 py-2 bg-muted hover:bg-muted/80 text-foreground font-bold text-xs rounded-xl transition-colors"
                  >
                    Back to Course
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveModule}
                    disabled={isSubmitting}
                    className="inline-flex items-center gap-2 px-5 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl font-bold text-xs shadow-sm transition-all"
                  >
                    <Save size={14} /> {isSubmitting ? "Saving..." : "Save Module"}
                  </button>
                </div>
              </div>

              <form onSubmit={handleSaveModule} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                  <div className="md:col-span-3 space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Module Title <span className="text-destructive">*</span>
                    </label>
                    <input
                      type="text"
                      value={currentModule.title || ""}
                      onChange={(e) =>
                        setCurrentModule({ ...currentModule, title: e.target.value })
                      }
                      required
                      placeholder="e.g., Module 1: Foundations of Emotional Intelligence"
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
                        setCurrentModule({ ...currentModule, order: Number(e.target.value) })
                      }
                      min={1}
                      className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-hidden text-sm font-bold text-foreground"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Module Description / Overview
                  </label>
                  <textarea
                    value={currentModule.description || ""}
                    onChange={(e) =>
                      setCurrentModule({ ...currentModule, description: e.target.value })
                    }
                    rows={3}
                    placeholder="Briefly describe what competencies students will unlock in this module..."
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-hidden text-sm text-foreground"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Estimated Duration (minutes)
                    </label>
                    <input
                      type="number"
                      value={currentModule.timeDuration || 0}
                      onChange={(e) =>
                        setCurrentModule({ ...currentModule, timeDuration: Number(e.target.value) })
                      }
                      min={0}
                      placeholder="45"
                      className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-hidden text-sm font-bold text-foreground"
                    />
                  </div>
                </div>

                {/* Module Thumbnail via ImageUploader */}
                <div className="space-y-2">
                  <ImageUploader
                    label="Module Cover Image (Optional)"
                    description="Upload an image or illustration representing this module's topic."
                    value={currentModule.thumbnailUrl || ""}
                    onUpload={(url) =>
                      setCurrentModule((prev: any) => ({ ...prev, thumbnailUrl: url }))
                    }
                    folder="lms/modules"
                    aspectRatio="video"
                  />
                </div>

                <div className="pt-4 flex items-center justify-between border-t border-border/60">
                  {currentModule.id ? (
                    <button
                      type="button"
                      onClick={() => handleDeleteModule(currentModule.id, currentModule.title)}
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 text-destructive hover:bg-destructive/10 rounded-xl font-bold text-xs transition-colors"
                    >
                      <Trash2 size={15} /> Delete Module
                    </button>
                  ) : <div />}

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setActiveView("COURSE")}
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
          )}

          {/* VIEW 3: CHAPTER / LESSON / QUIZ EDITOR */}
          {activeView === "CHAPTER" && currentChapter && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-5">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm ${
                      currentChapter.type === "VIDEO"
                        ? "bg-blue-500/10 text-blue-600"
                        : "bg-amber-500/10 text-amber-600"
                    }`}
                  >
                    {currentChapter.type === "VIDEO" ? <Video size={20} /> : <FileQuestion size={20} />}
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-foreground">
                      {currentChapter.id ? `Edit Lesson: ${currentChapter.title || "Untitled"}` : "Create New Lesson"}
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      Configure lesson media, takeaways, FAQs, or interactive quiz questions.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveView("COURSE")}
                    className="px-4 py-2 bg-muted hover:bg-muted/80 text-foreground font-bold text-xs rounded-xl transition-colors"
                  >
                    Back to Course
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveChapter}
                    disabled={isSubmitting}
                    className="inline-flex items-center gap-2 px-5 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl font-bold text-xs shadow-sm transition-all"
                  >
                    <Save size={14} /> {isSubmitting ? "Saving..." : "Save Lesson"}
                  </button>
                </div>
              </div>

              <form onSubmit={handleSaveChapter} className="space-y-7">
                {/* Lesson Type Switcher Tabs */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Lesson Format
                  </label>
                  <div className="grid grid-cols-2 gap-4 max-w-md">
                    <button
                      type="button"
                      onClick={() => setCurrentChapter({ ...currentChapter, type: "VIDEO" })}
                      className={`p-3.5 rounded-xl border flex items-center gap-3 transition-all ${
                        currentChapter.type === "VIDEO"
                          ? "bg-blue-500/10 border-blue-500 text-blue-700 ring-2 ring-blue-500/20"
                          : "bg-card border-border hover:bg-muted/50 text-muted-foreground"
                      }`}
                    >
                      <Video size={18} />
                      <div className="text-left">
                        <p className="font-bold text-xs">Video Lesson</p>
                        <p className="text-[10px] text-muted-foreground">Video player & notes</p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setCurrentChapter({ ...currentChapter, type: "ASSESSMENT" })}
                      className={`p-3.5 rounded-xl border flex items-center gap-3 transition-all ${
                        currentChapter.type === "ASSESSMENT"
                          ? "bg-amber-500/10 border-amber-500 text-amber-700 ring-2 ring-amber-500/20"
                          : "bg-card border-border hover:bg-muted/50 text-muted-foreground"
                      }`}
                    >
                      <FileQuestion size={18} />
                      <div className="text-left">
                        <p className="font-bold text-xs">Quiz / Assessment</p>
                        <p className="text-[10px] text-muted-foreground">Multiple choice tests</p>
                      </div>
                    </button>
                  </div>
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
                        setCurrentChapter({ ...currentChapter, title: e.target.value })
                      }
                      required
                      placeholder="e.g., Understanding Teenage Brain Chemistry"
                      className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-hidden text-sm font-bold text-foreground"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Lesson Order
                    </label>
                    <input
                      type="number"
                      value={currentChapter.order || 1}
                      onChange={(e) =>
                        setCurrentChapter({ ...currentChapter, order: Number(e.target.value) })
                      }
                      min={1}
                      className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-hidden text-sm font-bold text-foreground"
                    />
                  </div>
                </div>

                {/* Lesson Description */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Lesson Description / Summary
                  </label>
                  <textarea
                    value={currentChapter.description || ""}
                    onChange={(e) =>
                      setCurrentChapter({ ...currentChapter, description: e.target.value })
                    }
                    rows={3}
                    placeholder="Provide context or instructions for this specific lesson..."
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-hidden text-sm text-foreground"
                  />
                </div>

                {/* Chapter Thumbnail via ImageUploader */}
                <div className="space-y-2">
                  <ImageUploader
                    label="Lesson Poster / Thumbnail"
                    description="Upload an image thumbnail representing this video or quiz lesson."
                    value={currentChapter.thumbnailUrl || ""}
                    onUpload={(url) =>
                      setCurrentChapter((prev: any) => ({ ...prev, thumbnailUrl: url }))
                    }
                    folder="lms/chapters"
                    aspectRatio="video"
                  />
                </div>

                {/* CONDITIONAL: VIDEO LESSON FIELDS */}
                {currentChapter.type === "VIDEO" && (
                  <div className="space-y-6 p-5 rounded-2xl bg-blue-500/5 border border-blue-500/20">
                    <h3 className="font-bold text-sm text-blue-700 flex items-center gap-2">
                      <Film size={17} /> Video Media & Content Settings
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-end">
                      <div className="md:col-span-2 space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                          Direct Video URL (or Upload Video Below)
                        </label>
                        <input
                          type="text"
                          value={currentChapter.videoUrl || ""}
                          onChange={(e) =>
                            setCurrentChapter({ ...currentChapter, videoUrl: e.target.value })
                          }
                          placeholder="https://commondatastorage.googleapis.com/.../video.mp4"
                          className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-hidden text-xs font-mono"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                          Video Duration (minutes)
                        </label>
                        <input
                          type="number"
                          value={currentChapter.videoDuration || 0}
                          onChange={(e) =>
                            setCurrentChapter({
                              ...currentChapter,
                              videoDuration: Number(e.target.value),
                            })
                          }
                          min={0}
                          placeholder="15"
                          className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-hidden text-sm font-bold"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <VideoUploader
                        label="Upload Video File directly"
                        value={currentChapter.videoUrl}
                        onUpload={(url) =>
                          setCurrentChapter((prev: any) => ({ ...prev, videoUrl: url }))
                        }
                        folder="lms/videos"
                      />
                    </div>
                  </div>
                )}

                {/* CONDITIONAL: ASSESSMENT / QUIZ FIELDS */}
                {currentChapter.type === "ASSESSMENT" && (
                  <div className="space-y-6 p-5 rounded-2xl bg-amber-500/5 border border-amber-500/20">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <h3 className="font-bold text-sm text-amber-800 flex items-center gap-2">
                          <Award size={17} /> Quiz & Assessment Questions
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          Create questions to test the learner&apos;s comprehension.
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <label className="text-xs font-bold text-foreground">Passing Score (%):</label>
                        <input
                          type="number"
                          value={currentChapter.passingScore || 80}
                          onChange={(e) =>
                            setCurrentChapter({
                              ...currentChapter,
                              passingScore: Number(e.target.value),
                            })
                          }
                          min={1}
                          max={100}
                          className="w-20 px-3 py-1.5 rounded-xl border border-border bg-background text-sm font-bold text-center"
                        />
                      </div>
                    </div>

                    {/* Questions Builder */}
                    <div className="space-y-5">
                      {(currentChapter.assessmentQuestions || []).map(
                        (q: QuizQuestion, qIdx: number) => (
                          <div
                            key={qIdx}
                            className="p-4 rounded-xl border border-border bg-background space-y-3 shadow-2xs"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                                <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-700 flex items-center justify-center text-[11px] font-black">
                                  {qIdx + 1}
                                </span>
                                Question #{qIdx + 1}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleRemoveQuizQuestion(qIdx)}
                                className="p-1 text-muted-foreground hover:text-destructive rounded transition-colors"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>

                            <input
                              type="text"
                              value={q.question || ""}
                              onChange={(e) => handleQuizQuestionTextChange(qIdx, e.target.value)}
                              placeholder="Enter the question text here..."
                              className="w-full px-3.5 py-2 rounded-lg border border-border bg-muted/20 text-sm font-medium"
                            />

                            {/* Options A, B, C, D */}
                            <div className="space-y-2 pt-1">
                              <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                                Answer Choices (Select the radio button for the correct option)
                              </p>
                              {(q.options || ["", "", "", ""]).map((opt, optIdx) => (
                                <div key={optIdx} className="flex items-center gap-2.5">
                                  <input
                                    type="radio"
                                    name={`correct-opt-${qIdx}`}
                                    checked={q.correctOptionIndex === optIdx}
                                    onChange={() => handleQuizCorrectAnswerChange(qIdx, optIdx)}
                                    className="w-4 h-4 text-primary accent-primary cursor-pointer"
                                    title="Mark as correct answer"
                                  />
                                  <span className="w-5 text-xs font-bold text-muted-foreground">
                                    {String.fromCharCode(65 + optIdx)}.
                                  </span>
                                  <input
                                    type="text"
                                    value={opt}
                                    onChange={(e) =>
                                      handleQuizOptionChange(qIdx, optIdx, e.target.value)
                                    }
                                    placeholder={`Choice ${String.fromCharCode(65 + optIdx)}`}
                                    className={`flex-1 px-3 py-1.5 rounded-lg border text-xs ${
                                      q.correctOptionIndex === optIdx
                                        ? "border-emerald-500 bg-emerald-500/5 font-semibold"
                                        : "border-border bg-background"
                                    }`}
                                  />
                                </div>
                              ))}
                            </div>

                            {/* Explanation */}
                            <div className="pt-1">
                              <input
                                type="text"
                                value={q.explanation || ""}
                                onChange={(e) =>
                                  handleQuizExplanationChange(qIdx, e.target.value)
                                }
                                placeholder="Optional explanation why this answer is correct..."
                                className="w-full px-3 py-1.5 rounded-lg border border-border/70 bg-muted/10 text-xs text-muted-foreground italic"
                              />
                            </div>
                          </div>
                        )
                      )}

                      <button
                        type="button"
                        onClick={handleAddQuizQuestion}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 font-bold text-xs rounded-xl transition-colors"
                      >
                        <Plus size={14} /> Add Another Question
                      </button>
                    </div>
                  </div>
                )}

                {/* Good to Know / Key Takeaways for this lesson */}
                <div className="space-y-3 p-5 rounded-2xl bg-muted/20 border border-border/70">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                        <ListPlus size={16} className="text-primary" /> Key Takeaways / &quot;Good to Know&quot;
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        Summarized bullet points presented alongside the lesson.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddGoodToKnow}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary/10 hover:bg-primary/20 text-primary text-xs font-bold rounded-lg transition-colors"
                    >
                      <Plus size={13} /> Add Point
                    </button>
                  </div>

                  <div className="space-y-2">
                    {(currentChapter.goodToKnowPoints || []).map((point: string, pIdx: number) => (
                      <div key={pIdx} className="flex items-center gap-2">
                        <span className="text-xs font-bold text-primary">•</span>
                        <input
                          type="text"
                          value={point}
                          onChange={(e) => handleGoodToKnowChange(pIdx, e.target.value)}
                          placeholder="Key point for this lesson..."
                          className="flex-1 px-3.5 py-2 rounded-lg border border-border bg-background text-xs"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveGoodToKnow(pIdx)}
                          className="p-1.5 text-muted-foreground hover:text-destructive rounded transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                    {(currentChapter.goodToKnowPoints || []).length === 0 && (
                      <p className="text-xs text-muted-foreground italic">No takeaway points added.</p>
                    )}
                  </div>
                </div>

                {/* FAQs for this lesson */}
                <div className="space-y-3 p-5 rounded-2xl bg-muted/20 border border-border/70">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                        <FaqIcon size={16} className="text-primary" /> Frequently Asked Questions (FAQs)
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        Common student doubts and clarifying answers for this topic.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddFaq}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary/10 hover:bg-primary/20 text-primary text-xs font-bold rounded-lg transition-colors"
                    >
                      <Plus size={13} /> Add FAQ
                    </button>
                  </div>

                  <div className="space-y-3">
                    {(currentChapter.faqs || []).map((faq: FaqItem, fIdx: number) => (
                      <div
                        key={fIdx}
                        className="p-3 rounded-xl border border-border bg-background space-y-2"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <input
                            type="text"
                            value={faq.question}
                            onChange={(e) => handleFaqChange(fIdx, "question", e.target.value)}
                            placeholder="Question: e.g. How often should we practice this exercise?"
                            className="flex-1 px-3 py-1.5 rounded-lg border border-border bg-muted/20 text-xs font-bold"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveFaq(fIdx)}
                            className="p-1 text-muted-foreground hover:text-destructive rounded transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                        <textarea
                          value={faq.answer}
                          onChange={(e) => handleFaqChange(fIdx, "answer", e.target.value)}
                          rows={2}
                          placeholder="Answer: e.g. We recommend 5-10 minutes daily before bedtime..."
                          className="w-full px-3 py-1.5 rounded-lg border border-border bg-background text-xs"
                        />
                      </div>
                    ))}
                    {(currentChapter.faqs || []).length === 0 && (
                      <p className="text-xs text-muted-foreground italic">No FAQs added for this lesson.</p>
                    )}
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="pt-4 flex items-center justify-between border-t border-border/60">
                  {currentChapter.id ? (
                    <button
                      type="button"
                      onClick={() => handleDeleteChapter(currentChapter.id, currentChapter.title)}
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 text-destructive hover:bg-destructive/10 rounded-xl font-bold text-xs transition-colors"
                    >
                      <Trash2 size={15} /> Delete Lesson
                    </button>
                  ) : <div />}

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setActiveView("COURSE")}
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
          )}
        </div>
      </div>
    </div>
  );
}
