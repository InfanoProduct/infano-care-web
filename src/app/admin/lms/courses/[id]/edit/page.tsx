"use client";

import React, { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Plus, Trash2, Edit2, Video, FileText, ChevronDown, ChevronRight } from "lucide-react";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { apiClient } from "@/lib/api-client";
import ImageUploader from "@/components/upload/ImageUploader";
import VideoUploader from "@/components/upload/VideoUploader";

export default function EditCoursePage(props: { params: Promise<{ id: string }> }) {
  const params = use(props.params);
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

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

  // Layout State
  const [activeView, setActiveView] = useState<'COURSE' | 'MODULE' | 'CHAPTER'>('COURSE');

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
        isActive: course.isActive || false,
        thumbnailUrl: course.thumbnailUrl || "",
        category: course.category || "Parenting",
        highlights: course.highlights || [],
      });
      setModules(course.modules || []);

      const expandState: Record<string, boolean> = {};
      course.modules?.forEach((m: any) => { expandState[m.id] = true; });
      setExpandedModules(expandState);
    } catch (error) {
      toast.error("Failed to load course details");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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
    const cleanedFormData = { ...formData, highlights: formData.highlights.filter(h => h.trim() !== "") };

    try {
      await apiClient.put(`/lms/admin/courses/${params.id}`, cleanedFormData);
      toast.success("Course updated successfully!");
    } catch (error) {
      toast.error("Error updating course");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveModule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentModule.title) return toast.error("Title is required");
    setIsSubmitting(true);

    try {
      if (currentModule.id) {
        await apiClient.put(`/lms/admin/modules/${currentModule.id}`, currentModule);
        toast.success("Module updated");
      } else {
        await apiClient.post(`/lms/admin/courses/${params.id}/modules`, currentModule);
        toast.success("Module created");
      }
      await fetchCourseDetails();
      setActiveView('COURSE');
    } catch (error) {
      toast.error("Error saving module");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteModule = async (moduleId: string) => {
    if (!confirm("Delete this module and all its chapters?")) return;
    try {
      await apiClient.delete(`/lms/admin/modules/${moduleId}`);
      toast.success("Module deleted");
      if (currentModule?.id === moduleId) setActiveView('COURSE');
      fetchCourseDetails();
    } catch (error) {
      toast.error("Error deleting module");
    }
  };

  const handleSaveChapter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentChapter.title) return toast.error("Title is required");
    setIsSubmitting(true);

    try {
      if (currentChapter.id) {
        await apiClient.put(`/lms/admin/chapters/${currentChapter.id}`, currentChapter);
        toast.success("Chapter updated");
      } else {
        await apiClient.post(`/lms/admin/modules/${activeModuleIdForChapter}/chapters`, currentChapter);
        toast.success("Chapter created");
      }
      await fetchCourseDetails();
      setActiveView('COURSE');
    } catch (error) {
      toast.error("Error saving chapter");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteChapter = async (chapterId: string) => {
    if (!confirm("Delete this chapter?")) return;
    try {
      await apiClient.delete(`/lms/admin/chapters/${chapterId}`);
      toast.success("Chapter deleted");
      if (currentChapter?.id === chapterId) setActiveView('COURSE');
      fetchCourseDetails();
    } catch (error) {
      toast.error("Error deleting chapter");
    }
  };

  const toggleModuleExpand = (moduleId: string) => {
    setExpandedModules(prev => ({ ...prev, [moduleId]: !prev[moduleId] }));
  };

  if (isLoading) return <div className="p-10 text-center animate-pulse">Loading course details...</div>;

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 lg:px-8 pb-20">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/lms/courses" className="p-2 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors text-slate-500">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Course Builder</h1>
          <p className="text-slate-500 font-medium">Manage your course curriculum and details.</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">

        {/* Left Sidebar: Navigation & Curriculum */}
        <div className="w-full lg:w-[350px] shrink-0 space-y-4">
          <button
            onClick={() => setActiveView('COURSE')}
            className={`w-full text-left p-4 rounded-xl border transition-all flex items-center justify-between ${activeView === 'COURSE'
                ? 'bg-primary/5 border-primary shadow-sm'
                : 'bg-white border-slate-200 hover:border-primary/40'
              }`}
          >
            <div>
              <p className={`font-bold ${activeView === 'COURSE' ? 'text-primary' : 'text-slate-700'}`}>Course Details</p>
              <p className="text-xs text-slate-500 mt-1">Metadata, pricing, and settings</p>
            </div>
            <ChevronRight size={18} className={activeView === 'COURSE' ? 'text-primary' : 'text-slate-400'} />
          </button>

          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-bold text-slate-800">Curriculum</h3>
            </div>

            <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
              {modules.sort((a, b) => a.order - b.order).map((mod: any, mIdx: number) => {
                const isModExpanded = expandedModules[mod.id];
                const isModActive = activeView === 'MODULE' && currentModule?.id === mod.id;
                return (
                  <div key={mod.id}>
                    <div className={`flex items-center justify-between p-3 transition-colors ${isModActive ? 'bg-primary/5' : 'hover:bg-slate-50'}`}>
                      <button className="flex-1 text-left flex items-center gap-2" onClick={() => toggleModuleExpand(mod.id)}>
                        <ChevronDown size={16} className={`text-slate-400 transition-transform ${isModExpanded ? '' : '-rotate-90'}`} />
                        <span className={`text-sm font-bold ${isModActive ? 'text-primary' : 'text-slate-700'}`}>
                          Module {mod.order}: {mod.title}
                        </span>
                      </button>
                      <div className="flex items-center gap-1">
                        <button onClick={() => { setCurrentModule(mod); setActiveView('MODULE'); }} className={`p-1.5 rounded-md ${isModActive ? 'bg-primary text-white' : 'text-slate-400 hover:bg-slate-200'}`}><Edit2 size={14} /></button>
                        <button onClick={() => handleDeleteModule(mod.id)} className="p-1.5 text-slate-400 hover:text-red-500 rounded-md hover:bg-red-50"><Trash2 size={14} /></button>
                      </div>
                    </div>

                    {isModExpanded && (
                      <div className="bg-slate-50/50 pb-2 border-t border-slate-50">
                        {mod.chapters?.sort((a: any, b: any) => a.order - b.order).map((chap: any, cIdx: number) => {
                          const isChapActive = activeView === 'CHAPTER' && currentChapter?.id === chap.id;
                          return (
                            <div key={chap.id} className={`flex items-center justify-between pl-10 pr-3 py-2 transition-colors border-l-2 ${isChapActive ? 'border-primary bg-primary/5' : 'border-transparent hover:bg-slate-100'}`}>
                              <div className="flex-1 flex items-center gap-2">
                                {chap.type === 'VIDEO' ? <Video size={14} className={isChapActive ? 'text-primary' : 'text-slate-400'} /> : <FileText size={14} className={isChapActive ? 'text-primary' : 'text-slate-400'} />}
                                <span className={`text-sm font-medium ${isChapActive ? 'text-primary' : 'text-slate-600'}`}>{chap.title}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <button onClick={() => {
                                  setActiveModuleIdForChapter(mod.id);
                                  const vUrl = chap.video?.videoUrl || "";
                                  const vDur = chap.video?.duration || 0;
                                  const aQuestions = chap.assessment?.questions || [];
                                  setCurrentChapter({ ...chap, videoUrl: vUrl, videoDuration: vDur, goodToKnowPoints: chap.goodToKnowPoints || [], faqs: chap.faqs || [], assessmentQuestions: aQuestions });
                                  setActiveView('CHAPTER');
                                }} className={`p-1.5 rounded-md ${isChapActive ? 'bg-primary text-white' : 'text-slate-400 hover:bg-slate-200'}`}><Edit2 size={12} /></button>
                                <button onClick={() => handleDeleteChapter(chap.id)} className="p-1.5 text-slate-400 hover:text-red-500 rounded-md hover:bg-red-50"><Trash2 size={12} /></button>
                              </div>
                            </div>
                          )
                        })}

                        {/* Add Chapter Button */}
                        <button
                          onClick={() => {
                            setActiveModuleIdForChapter(mod.id);
                            setCurrentChapter({ title: "", type: "VIDEO", order: (mod.chapters?.length || 0) + 1, videoUrl: "", videoDuration: 0, goodToKnowPoints: [], faqs: [], assessmentQuestions: [] });
                            setActiveView('CHAPTER');
                            if (!expandedModules[mod.id]) toggleModuleExpand(mod.id);
                          }}
                          className="flex items-center gap-2 text-xs font-bold text-primary hover:text-primary-dark pl-10 py-2 mt-1 w-full text-left"
                        >
                          <Plus size={14} /> Add Chapter
                        </button>
                      </div>
                    )}
                  </div>
                )
              })}

              {modules.length === 0 && (
                <div className="p-6 text-center text-sm text-slate-400 font-medium">No modules yet.</div>
              )}
            </div>

            {/* Add Module Button */}
            <div className="p-3 bg-slate-50 border-t border-slate-200">
              <button
                onClick={() => {
                  setCurrentModule({ title: "", description: "", timeDuration: 0, order: modules.length + 1, thumbnailUrl: "" });
                  setActiveView('MODULE');
                }}
                className="w-full py-2 bg-white border border-slate-200 hover:border-primary text-slate-700 hover:text-primary rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-colors shadow-sm"
              >
                <Plus size={16} /> Add Module
              </button>
            </div>
          </div>
        </div>

        {/* Right Content Panel */}
        <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 lg:p-8 min-h-[600px] w-full">
          {activeView === 'COURSE' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-xl font-bold border-b pb-4 mb-6">Course Details</h2>
              <form onSubmit={handleSubmit} className="space-y-5 max-w-2xl">
                <div>
                  <label className="text-sm font-medium mb-1 block">Course Title</label>
                  <input type="text" name="title" value={formData.title || ""} onChange={handleChange} required className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/20 outline-none" />
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">Course Thumbnail</label>
                  <ImageUploader value={formData.thumbnailUrl} onUpload={(url) => setFormData(prev => ({ ...prev, thumbnailUrl: url }))} folder="lms/courses" />
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">Description</label>
                  <textarea name="description" value={formData.description} onChange={handleChange} required rows={4} className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/20 outline-none" />
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">Category</label>
                  <select name="category" value={formData.category} onChange={handleChange} className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/20 outline-none">
                    <option value="Parenting">Parenting</option>
                    <option value="Teen Health">Teen Health</option>
                    <option value="Nutrition">Nutrition</option>
                    <option value="Productivity">Productivity</option>
                    <option value="Wellbeing">Wellbeing</option>
                    <option value="Digital Life">Digital Life</option>
                    <option value="General">General</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Duration (min)</label>
                    <input type="number" name="timeDuration" value={formData.timeDuration ?? ""} onChange={handleChange} min="0" className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/20 outline-none" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Price (₹)</label>
                    <input type="number" name="price" value={formData.price ?? ""} onChange={handleChange} disabled={formData.isFree} min="0" className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/20 outline-none disabled:opacity-50" />
                  </div>
                </div>

                <div className="flex flex-col gap-3 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" name="isFree" checked={formData.isFree} onChange={handleChange} className="rounded text-primary focus:ring-primary h-4 w-4" />
                    <span className="text-sm font-medium">Is Free Course</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleChange} className="rounded text-primary focus:ring-primary h-4 w-4" />
                    <span className="text-sm font-medium">Is Active (Published)</span>
                  </label>
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">Highlights</label>
                  <div className="space-y-2">
                    {formData.highlights.map((highlight, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <input type="text" value={highlight} onChange={(e) => handleHighlightChange(index, e.target.value)} className="flex-1 px-3 py-1.5 rounded-lg border text-sm outline-none" />
                        <button type="button" onClick={() => handleRemoveHighlight(index)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={14} /></button>
                      </div>
                    ))}
                  </div>
                  <button type="button" onClick={handleAddHighlight} className="mt-2 text-xs font-medium text-primary hover:underline">+ Add Highlight</button>
                </div>

                <button type="submit" disabled={isSubmitting} className="w-full mt-4 inline-flex justify-center items-center gap-2 px-4 py-3 bg-primary text-white hover:bg-primary-dark rounded-lg font-bold transition-colors disabled:opacity-50">
                  <Save size={18} /> {isSubmitting ? "Saving..." : "Save Course Details"}
                </button>
              </form>
            </div>
          )}

          {activeView === 'MODULE' && currentModule && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-xl font-bold border-b pb-4 mb-6">{currentModule.id ? "Edit Module" : "Add New Module"}</h2>
              <form onSubmit={handleSaveModule} className="space-y-5 max-w-2xl">
                <div>
                  <label className="text-sm font-medium mb-1 block text-slate-700">Module Title</label>
                  <input type="text" value={currentModule.title || ""} onChange={e => setCurrentModule({ ...currentModule, title: e.target.value })} required className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-900 focus:ring-2 focus:ring-primary/20 outline-none" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block text-slate-700">Module Thumbnail (Optional)</label>
                  <ImageUploader value={currentModule.thumbnailUrl} onUpload={(url) => setCurrentModule({ ...currentModule, thumbnailUrl: url })} folder="lms/modules" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block text-slate-700">Description</label>
                  <textarea value={currentModule.description || ""} onChange={e => setCurrentModule({ ...currentModule, description: e.target.value })} rows={3} className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-900 focus:ring-2 focus:ring-primary/20 outline-none" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block text-slate-700">Duration (min)</label>
                    <input type="number" value={currentModule.timeDuration ?? ""} onChange={e => setCurrentModule({ ...currentModule, timeDuration: e.target.value === "" ? "" : Number(e.target.value) })} className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-900 focus:ring-2 focus:ring-primary/20 outline-none" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block text-slate-700">Order Index</label>
                    <input type="number" value={currentModule.order ?? ""} onChange={e => setCurrentModule({ ...currentModule, order: e.target.value === "" ? "" : Number(e.target.value) })} className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-900 focus:ring-2 focus:ring-primary/20 outline-none" />
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-6 border-t border-slate-100 mt-6">
                  <button type="button" onClick={() => setActiveView('COURSE')} className="px-6 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">Cancel</button>
                  <button type="submit" disabled={isSubmitting} className="px-6 py-2.5 text-sm font-bold text-white bg-primary hover:bg-primary-dark rounded-lg transition-colors inline-flex items-center gap-2">
                    <Save size={16} /> {isSubmitting ? "Saving..." : "Save Module"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeView === 'CHAPTER' && currentChapter && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-xl font-bold border-b pb-4 mb-6">{currentChapter.id ? "Edit Chapter" : "Add New Chapter"}</h2>
              <form onSubmit={handleSaveChapter} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block text-slate-700">Type</label>
                    <select value={currentChapter.type} onChange={e => setCurrentChapter({ ...currentChapter, type: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-900 focus:ring-2 focus:ring-primary/20 outline-none">
                      <option value="VIDEO">Video</option>
                      <option value="ASSESSMENT">Assessment (Quiz)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block text-slate-700">Order Index</label>
                    <input type="number" value={currentChapter.order ?? ""} onChange={e => setCurrentChapter({ ...currentChapter, order: e.target.value === "" ? "" : Number(e.target.value) })} className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-900 focus:ring-2 focus:ring-primary/20 outline-none" />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block text-slate-700">Title</label>
                  <input type="text" value={currentChapter.title || ""} onChange={e => setCurrentChapter({ ...currentChapter, title: e.target.value })} required className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-900 focus:ring-2 focus:ring-primary/20 outline-none" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block text-slate-700">Chapter Thumbnail (Optional)</label>
                  <ImageUploader value={currentChapter.thumbnailUrl} onUpload={(url) => setCurrentChapter({ ...currentChapter, thumbnailUrl: url })} folder="lms/chapters" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block text-slate-700">Description</label>
                  <textarea value={currentChapter.description || ""} onChange={e => setCurrentChapter({ ...currentChapter, description: e.target.value })} rows={3} className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-900 focus:ring-2 focus:ring-primary/20 outline-none" />
                </div>

                {currentChapter.type !== "ASSESSMENT" && (
                  <>
                    <div>
                      <label className="text-sm font-medium mb-1 block text-slate-700">Good to Know Points</label>
                      <div className="space-y-2">
                        {(currentChapter.goodToKnowPoints || []).map((point: string, index: number) => (
                          <div key={index} className="flex items-center gap-2">
                            <input type="text" value={point} onChange={(e) => {
                              const newPoints = [...(currentChapter.goodToKnowPoints || [])];
                              newPoints[index] = e.target.value;
                              setCurrentChapter({ ...currentChapter, goodToKnowPoints: newPoints });
                            }} className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none bg-white text-slate-900" />
                            <button type="button" onClick={() => {
                              const newPoints = [...(currentChapter.goodToKnowPoints || [])];
                              newPoints.splice(index, 1);
                              setCurrentChapter({ ...currentChapter, goodToKnowPoints: newPoints });
                            }} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
                          </div>
                        ))}
                      </div>
                      <button type="button" onClick={() => {
                        setCurrentChapter({ ...currentChapter, goodToKnowPoints: [...(currentChapter.goodToKnowPoints || []), ""] });
                      }} className="mt-2 text-sm font-bold text-primary hover:underline">+ Add Point</button>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-1 block text-slate-700">FAQs</label>
                      <div className="space-y-4">
                        {(currentChapter.faqs || []).map((faq: any, index: number) => (
                          <div key={index} className="flex gap-2 items-start bg-slate-50 p-4 rounded-xl border border-slate-200">
                            <div className="flex-1 space-y-3">
                              <input type="text" placeholder="Question" value={faq.question || ""} onChange={(e) => {
                                const newFaqs = [...(currentChapter.faqs || [])];
                                newFaqs[index] = { ...newFaqs[index], question: e.target.value };
                                setCurrentChapter({ ...currentChapter, faqs: newFaqs });
                              }} className="w-full px-3 py-2 rounded-md border border-slate-200 text-sm outline-none bg-white text-slate-900 font-medium" />
                              <textarea placeholder="Answer" value={faq.answer || ""} onChange={(e) => {
                                const newFaqs = [...(currentChapter.faqs || [])];
                                newFaqs[index] = { ...newFaqs[index], answer: e.target.value };
                                setCurrentChapter({ ...currentChapter, faqs: newFaqs });
                              }} rows={2} className="w-full px-3 py-2 rounded-md border border-slate-200 text-sm outline-none bg-white text-slate-900" />
                            </div>
                            <button type="button" onClick={() => {
                              const newFaqs = [...(currentChapter.faqs || [])];
                              newFaqs.splice(index, 1);
                              setCurrentChapter({ ...currentChapter, faqs: newFaqs });
                            }} className="p-2 text-red-500 hover:bg-red-50 rounded-lg mt-1"><Trash2 size={16} /></button>
                          </div>
                        ))}
                      </div>
                      <button type="button" onClick={() => {
                        setCurrentChapter({ ...currentChapter, faqs: [...(currentChapter.faqs || []), { question: "", answer: "" }] });
                      }} className="mt-3 text-sm font-bold text-primary hover:underline">+ Add FAQ</button>
                    </div>
                  </>
                )}

                {currentChapter.type === "VIDEO" && (
                  <div className="p-6 bg-slate-50 border border-slate-200 rounded-xl space-y-5 mt-4">
                    <h4 className="font-bold text-slate-800 border-b border-slate-200 pb-2">Video Settings</h4>
                    <div>
                      <label className="text-sm font-semibold mb-2 block text-slate-600">Video File or URL</label>
                      <VideoUploader
                        value={currentChapter.videoUrl}
                        onUpload={(url) => setCurrentChapter({ ...currentChapter, videoUrl: url })}
                        folder="lms/videos"
                      />
                      <div className="mt-4 flex items-center justify-between">
                        <span className="text-sm font-medium text-slate-500">Or paste external URL:</span>
                        <input type="text" value={currentChapter.videoUrl || ""} onChange={e => setCurrentChapter({ ...currentChapter, videoUrl: e.target.value })} className="w-2/3 px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white" placeholder="https://youtube.com/..." />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-semibold mb-2 block text-slate-600">Video Duration (seconds)</label>
                      <input type="number" value={currentChapter.videoDuration ?? ""} onChange={e => setCurrentChapter({ ...currentChapter, videoDuration: e.target.value === "" ? "" : Number(e.target.value) })} className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-900 focus:ring-2 focus:ring-primary/20 outline-none" />
                    </div>
                  </div>
                )}

                {currentChapter.type === "ASSESSMENT" && (
                  <div className="p-6 bg-slate-50 border border-slate-200 rounded-xl space-y-6 mt-4">
                    <h4 className="font-bold text-slate-800 border-b border-slate-200 pb-2">Quiz Builder</h4>

                    <div className="space-y-6">
                      {(currentChapter.assessmentQuestions || []).map((q: any, qIdx: number) => (
                        <div key={qIdx} className="p-5 bg-white border border-slate-200 rounded-xl shadow-sm space-y-4 relative">
                          <button type="button" onClick={() => {
                            const newQs = [...(currentChapter.assessmentQuestions || [])];
                            newQs.splice(qIdx, 1);
                            setCurrentChapter({ ...currentChapter, assessmentQuestions: newQs });
                          }} className="absolute top-4 right-4 text-red-500 hover:bg-red-50 p-2 rounded-lg"><Trash2 size={16} /></button>

                          <div>
                            <label className="text-sm font-bold text-slate-700 mb-1 block">Question {qIdx + 1}</label>
                            <input type="text" value={q.question || ""} onChange={(e) => {
                              const newQs = [...(currentChapter.assessmentQuestions || [])];
                              newQs[qIdx] = { ...newQs[qIdx], question: e.target.value };
                              setCurrentChapter({ ...currentChapter, assessmentQuestions: newQs });
                            }} className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary/20 outline-none text-slate-900 font-medium" placeholder="Enter question..." />
                          </div>

                          <div className="space-y-3 pl-4 border-l-2 border-slate-200">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Options (Select Correct Answer)</label>
                            {(q.options || []).map((opt: string, optIdx: number) => (
                              <div key={optIdx} className="flex items-center gap-3">
                                <input type="radio" name={`correct-${qIdx}`} checked={q.correctAnswerIndex === optIdx} onChange={() => {
                                  const newQs = [...(currentChapter.assessmentQuestions || [])];
                                  newQs[qIdx] = { ...newQs[qIdx], correctAnswerIndex: optIdx };
                                  setCurrentChapter({ ...currentChapter, assessmentQuestions: newQs });
                                }} className="text-primary w-5 h-5 cursor-pointer accent-primary" />
                                <input type="text" value={opt} onChange={(e) => {
                                  const newQs = [...(currentChapter.assessmentQuestions || [])];
                                  const newOpts = [...(newQs[qIdx].options || [])];
                                  newOpts[optIdx] = e.target.value;
                                  newQs[qIdx] = { ...newQs[qIdx], options: newOpts };
                                  setCurrentChapter({ ...currentChapter, assessmentQuestions: newQs });
                                }} className={`flex-1 px-3 py-2 text-sm rounded-lg border outline-none ${q.correctAnswerIndex === optIdx ? 'border-primary/50 bg-primary/5 text-primary-dark font-medium' : 'border-slate-200 text-slate-900 bg-white'}`} placeholder={`Option ${optIdx + 1}`} />
                                <button type="button" onClick={() => {
                                  const newQs = [...(currentChapter.assessmentQuestions || [])];
                                  const newOpts = [...(newQs[qIdx].options || [])];
                                  newOpts.splice(optIdx, 1);
                                  let newCorrectIdx = newQs[qIdx].correctAnswerIndex;
                                  if (newCorrectIdx === optIdx) newCorrectIdx = 0;
                                  else if (newCorrectIdx > optIdx) newCorrectIdx--;
                                  newQs[qIdx] = { ...newQs[qIdx], options: newOpts, correctAnswerIndex: newCorrectIdx };
                                  setCurrentChapter({ ...currentChapter, assessmentQuestions: newQs });
                                }} className="text-slate-400 hover:text-red-500 p-1"><Trash2 size={16} /></button>
                              </div>
                            ))}
                            <button type="button" onClick={() => {
                              const newQs = [...(currentChapter.assessmentQuestions || [])];
                              newQs[qIdx] = { ...newQs[qIdx], options: [...(newQs[qIdx].options || []), ""] };
                              setCurrentChapter({ ...currentChapter, assessmentQuestions: newQs });
                            }} className="text-sm font-bold text-primary hover:underline mt-2">+ Add Option</button>
                          </div>

                          <div className="pt-2">
                            <label className="text-sm font-bold text-slate-700 mb-1 block">Explanation (Optional)</label>
                            <textarea value={q.explanation || ""} onChange={(e) => {
                              const newQs = [...(currentChapter.assessmentQuestions || [])];
                              newQs[qIdx] = { ...newQs[qIdx], explanation: e.target.value };
                              setCurrentChapter({ ...currentChapter, assessmentQuestions: newQs });
                            }} rows={2} className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary/20 outline-none text-slate-900" placeholder="Explain why the answer is correct..."></textarea>
                          </div>
                        </div>
                      ))}
                    </div>

                    <button type="button" onClick={() => {
                      setCurrentChapter({ ...currentChapter, assessmentQuestions: [...(currentChapter.assessmentQuestions || []), { question: "", options: ["", ""], correctAnswerIndex: 0, explanation: "" }] });
                    }} className="w-full py-4 border-2 border-dashed border-slate-300 rounded-xl text-sm font-bold text-slate-500 hover:border-primary hover:text-primary hover:bg-primary/5 transition-all">
                      + Add New Question
                    </button>
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-6 border-t border-slate-100 mt-8">
                  <button type="button" onClick={() => setActiveView('COURSE')} className="px-6 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">Cancel</button>
                  <button type="submit" disabled={isSubmitting} className="px-6 py-2.5 text-sm font-bold text-white bg-primary hover:bg-primary-dark rounded-lg transition-colors inline-flex items-center gap-2">
                    <Save size={16} /> {isSubmitting ? "Saving..." : "Save Chapter"}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
