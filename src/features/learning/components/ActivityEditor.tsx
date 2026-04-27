'use client';

import { useState } from 'react';
import { 
  X, Plus, Trash2, Type, ImageIcon, 
  MessageSquare, HelpCircle, Save, ArrowLeft, 
  BarChart3, ChevronRight, ChevronLeft,
  CheckCircle2, Info, Upload, Loader2
} from 'lucide-react';
import { LearningApiService } from '../services/learning-api';

interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
}

interface CurriculumContent {
  hook: { text: string };
  story: { pages: string[] };
  journal: { prompt: string };
  quiz: { questions: QuizQuestion[] };
  summary: { text: string };
}

interface ActivityEditorProps {
  episodeId: string;
  episodeTitle: string;
  initialContent: any;
  onSave: (content: CurriculumContent) => void;
  onBack: () => void;
}

const DEFAULT_CONTENT: CurriculumContent = {
  hook: { text: '' },
  story: { pages: [] },
  journal: { prompt: '' },
  quiz: { questions: [] },
  summary: { text: '' }
};

const normalizeContent = (content: any): CurriculumContent => {
  if (!content) return { ...DEFAULT_CONTENT };

  let parsed = content;
  if (typeof content === 'string') {
    try {
      parsed = JSON.parse(content);
    } catch (e) {
      console.error('Failed to parse content string:', e);
      return { ...DEFAULT_CONTENT };
    }
  }

  // If already in new format
  if (parsed && typeof parsed === 'object' && !Array.isArray(parsed) && (parsed.hook || parsed.story || parsed.quiz || parsed.journal || parsed.summary)) {
    return {
      hook: { text: '', ...(typeof parsed.hook === 'object' ? parsed.hook : { text: parsed.hook || '' }) },
      story: { pages: [], ...(typeof parsed.story === 'object' ? parsed.story : { pages: [] }) },
      journal: { prompt: '', ...(typeof (parsed.journal || parsed.reflection) === 'object' ? (parsed.journal || parsed.reflection) : { prompt: (parsed.journal || parsed.reflection) || '' }) },
      quiz: { questions: [], ...(typeof (parsed.quiz || parsed.knowledgeCheck) === 'object' ? (parsed.quiz || parsed.knowledgeCheck) : { questions: (parsed.quiz || parsed.knowledgeCheck) || [] }) },
      summary: { text: '', ...(typeof parsed.summary === 'object' ? parsed.summary : { text: parsed.summary || '' }) }
    };
  }

  // If legacy format (object with different keys)
  if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
    return {
      hook: { text: parsed.hook?.text || (typeof parsed.hook === 'string' ? parsed.hook : '') },
      story: { pages: parsed.story?.pages || (parsed.story?.url ? [parsed.story.url] : (typeof parsed.story === 'string' ? [parsed.story] : [])) },
      journal: { prompt: parsed.reflection?.prompt || parsed.journal?.prompt || (typeof parsed.reflection === 'string' ? parsed.reflection : '') },
      quiz: { questions: parsed.knowledgeCheck?.questions || parsed.quiz?.questions || [] },
      summary: { text: parsed.summary?.text || (typeof parsed.summary === 'string' ? parsed.summary : '') },
    };
  }

  // If array format
  if (Array.isArray(parsed)) {
    const result: CurriculumContent = JSON.parse(JSON.stringify(DEFAULT_CONTENT));
    parsed.forEach((item: any) => {
      const type = item.type?.toLowerCase();
      const itemContent = item.content;
      
      if (type === 'hook' || type === 'text') {
        if (!result.hook.text) result.hook.text = itemContent?.text || itemContent || '';
        else if (!result.summary.text) result.summary.text = itemContent?.text || itemContent || '';
      } else if (type === 'story' || type === 'image') {
        result.story.pages = itemContent?.pages || item.pages || (itemContent?.url ? [itemContent.url] : (typeof itemContent === 'string' ? [itemContent] : []));
      } else if (type === 'journal' || type === 'reflection') {
        result.journal.prompt = itemContent?.prompt || item.prompt || (typeof itemContent === 'string' ? itemContent : '');
      } else if (type === 'quiz' || type === 'knowledgecheck') {
        result.quiz.questions = itemContent?.questions || item.questions || [];
      } else if (type === 'summary') {
        result.summary.text = itemContent?.text || itemContent || '';
      }
    });
    return result;
  }

  return { ...DEFAULT_CONTENT };
};

export function ActivityEditor({ episodeId, episodeTitle, initialContent, onSave, onBack }: ActivityEditorProps) {
  const [content, setContent] = useState<CurriculumContent>(normalizeContent(initialContent));
  const [activeTab, setActiveTab] = useState<keyof CurriculumContent>('hook');
  const [uploadingPages, setUploadingPages] = useState<Record<number, boolean>>({});

  const tabs: { id: keyof CurriculumContent; label: string; icon: any; color: string }[] = [
    { id: 'hook', label: 'Hook', icon: Type, color: 'blue' },
    { id: 'story', label: 'Story', icon: ImageIcon, color: 'purple' },
    { id: 'quiz', label: 'Quiz', icon: HelpCircle, color: 'emerald' },
    { id: 'journal', label: 'Journal', icon: MessageSquare, color: 'rose' },
    { id: 'summary', label: 'Summary', icon: BarChart3, color: 'slate' },
  ];

  const activeTabIndex = tabs.findIndex(t => t.id === activeTab);

  const updateSegment = (segment: keyof CurriculumContent, data: any) => {
    setContent(prev => ({ ...prev, [segment]: data }));
  };

  const isSegmentComplete = (id: keyof CurriculumContent) => {
    switch(id) {
      case 'hook': return (content.hook?.text?.length || 0) > 5;
      case 'story': return (content.story?.pages?.length || 0) > 0;
      case 'journal': return (content.journal?.prompt?.length || 0) > 5;
      case 'quiz': return (content.quiz?.questions?.length || 0) > 0;
      case 'summary': return (content.summary?.text?.length || 0) > 5;
      default: return false;
    }
  };

  const handleNext = () => {
    if (activeTabIndex < tabs.length - 1) {
      setActiveTab(tabs[activeTabIndex + 1].id);
    }
  };

  const handlePrev = () => {
    if (activeTabIndex > 0) {
      setActiveTab(tabs[activeTabIndex - 1].id);
    }
  };

  const handleImageUpload = async (index: number, file: File) => {
    try {
      setUploadingPages(prev => ({ ...prev, [index]: true }));
      const response = await LearningApiService.uploadFile(file);
      
      const newPages = [...content.story.pages];
      newPages[index] = response.url;
      updateSegment('story', { pages: newPages });
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setUploadingPages(prev => ({ ...prev, [index]: false }));
    }
  };

  return (
    <div className="flex flex-col h-full min-h-[600px] animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-3 bg-white border border-border rounded-2xl hover:bg-secondary transition-all shadow-sm group">
            <ArrowLeft size={24} className="text-muted-foreground group-hover:-translate-x-1 transition-transform" />
          </button>
          <div>
            <h2 className="text-3xl font-black text-slate-800">Content Builder</h2>
            <p className="text-muted-foreground font-medium">Episode: <span className="text-primary font-bold">{episodeTitle}</span></p>
          </div>
        </div>
        <button 
          onClick={() => onSave(content)} 
          className="btn-primary flex items-center gap-2 shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all py-3 px-6"
        >
          <Save size={20} /> Publish Curriculum
        </button>
      </div>

      <div className="flex flex-1 gap-8 overflow-hidden">
        {/* Sidebar Navigation */}
        <div className="w-64 space-y-2 flex flex-col">
          <div className="bg-white/50 backdrop-blur-sm border border-slate-200/60 rounded-[2rem] p-4 flex-1 overflow-y-auto">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6 px-4">Curriculum Path</p>
            {tabs.map((tab, index) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              const isDone = isSegmentComplete(tab.id);
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 p-4 rounded-2xl transition-all group relative mb-2 ${
                    isActive 
                      ? 'bg-primary text-white shadow-lg shadow-primary/20 translate-x-2' 
                      : 'hover:bg-slate-50 text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                    isActive ? 'bg-white/20' : 'bg-slate-100 text-slate-500'
                  }`}>
                    <Icon size={18} />
                  </div>
                  <div className="flex-1 text-left">
                    <p className={`text-[10px] font-black uppercase tracking-wider ${isActive ? 'text-white' : 'text-slate-700'}`}>
                      {tab.label}
                    </p>
                    <p className={`text-[10px] font-medium opacity-60 ${isActive ? 'text-white' : 'text-slate-400'}`}>
                      Step {index + 1}
                    </p>
                  </div>
                  {isDone && !isActive && <CheckCircle2 size={16} className="text-emerald-500" />}
                </button>
              );
            })}
          </div>

          <div className="bg-slate-800 rounded-3xl p-6 text-white overflow-hidden relative group shrink-0">
            <div className="relative z-10">
              <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-2">Completion</p>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black">{tabs.filter(t => isSegmentComplete(t.id)).length}</span>
                <span className="text-white/40 font-bold">/ {tabs.length}</span>
              </div>
              <div className="mt-4 h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-1000 ease-out"
                  style={{ width: `${(tabs.filter(t => isSegmentComplete(t.id)).length / tabs.length) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Editor Area */}
        <div className="flex-1 bg-white border border-slate-200/60 rounded-[2.5rem] flex flex-col overflow-hidden shadow-xl shadow-slate-200/50">
          <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                {(() => { const Icon = tabs[activeTabIndex].icon; return <Icon size={20} />; })()}
              </div>
              <div>
                <h3 className="font-black text-lg text-slate-800 uppercase tracking-tight">{tabs[activeTabIndex].label} Segment</h3>
                <p className="text-xs text-slate-400 font-medium">Configure the core content for this curriculum stage.</p>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
            {activeTab === 'hook' && (
              <div className="max-w-3xl space-y-6">
                <div className="p-6 bg-blue-50 border border-blue-100 rounded-3xl flex gap-4">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-blue-500 shadow-sm shrink-0">
                    <Info size={20} />
                  </div>
                  <p className="text-sm text-blue-700 leading-relaxed font-medium">
                    The <span className="font-black">Hook</span> is the first thing users see. It should be an engaging introduction that sets the narrative context for the episode.
                  </p>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">Introductory Narrative</label>
                  <textarea 
                    value={content.hook.text}
                    onChange={(e) => updateSegment('hook', { text: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-3xl p-8 min-h-[300px] outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/30 transition-all font-medium text-lg leading-relaxed text-slate-700 placeholder:text-slate-300"
                    placeholder="Once upon a time..."
                  />
                </div>
              </div>
            )}

            {activeTab === 'story' && (
              <div className="max-w-4xl space-y-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {content.story.pages.map((page, i) => (
                    <div key={i} className="group relative bg-slate-50 border border-slate-200 rounded-3xl p-4 transition-all hover:border-primary/30 hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 flex flex-col">
                      <div className="aspect-[3/4] rounded-2xl bg-slate-200 overflow-hidden mb-4 relative shadow-inner shrink-0">
                        {page ? (
                          <img src={page} alt={`Page ${i+1}`} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 p-6 text-center">
                            <ImageIcon size={32} className="mb-2 opacity-20" />
                            <p className="text-[10px] font-black uppercase tracking-tighter">No Preview</p>
                          </div>
                        )}
                        <div className="absolute top-3 left-3 w-8 h-8 rounded-lg bg-white/90 backdrop-blur-sm flex items-center justify-center text-xs font-black text-slate-600 shadow-sm">
                          {i + 1}
                        </div>
                        <div className="flex gap-1 absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => {
                              if (i === 0) return;
                              const newPages = [...content.story.pages];
                              [newPages[i-1], newPages[i]] = [newPages[i], newPages[i-1]];
                              updateSegment('story', { pages: newPages });
                            }}
                            className="p-1.5 rounded-lg bg-white/90 backdrop-blur-sm text-slate-400 hover:text-primary shadow-sm"
                            title="Move Up"
                          >
                            <ChevronLeft size={14} className="rotate-90" />
                          </button>
                          <button 
                            onClick={() => {
                              if (i === content.story.pages.length - 1) return;
                              const newPages = [...content.story.pages];
                              [newPages[i+1], newPages[i]] = [newPages[i], newPages[i+1]];
                              updateSegment('story', { pages: newPages });
                            }}
                            className="p-1.5 rounded-lg bg-white/90 backdrop-blur-sm text-slate-400 hover:text-primary shadow-sm"
                            title="Move Down"
                          >
                            <ChevronLeft size={14} className="-rotate-90" />
                          </button>
                          <button 
                            onClick={() => {
                              const newPages = [...content.story.pages];
                              newPages.splice(i, 1);
                              updateSegment('story', { pages: newPages });
                            }}
                            className="p-1.5 rounded-lg bg-rose-500 text-white hover:bg-rose-600 shadow-lg"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-auto">
                        <input 
                          type="text"
                          value={page}
                          onChange={(e) => {
                            const newPages = [...content.story.pages];
                            newPages[i] = e.target.value;
                            updateSegment('story', { pages: newPages });
                          }}
                          className="flex-1 min-w-0 bg-white border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-primary text-[10px] font-bold text-slate-500 placeholder:text-slate-300 transition-all shadow-sm"
                          placeholder="Image URL (https://...)"
                        />
                        <div className="relative">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleImageUpload(i, file);
                            }}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                            disabled={uploadingPages[i]}
                          />
                          <button 
                            className={`p-3 rounded-xl border border-slate-200 transition-all ${
                              uploadingPages[i] ? 'bg-slate-50 text-slate-400' : 'bg-white text-slate-500 hover:text-primary hover:border-primary/30'
                            }`}
                            disabled={uploadingPages[i]}
                          >
                            {uploadingPages[i] ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <button 
                    onClick={() => updateSegment('story', { pages: [...content.story.pages, ''] })}
                    className="h-full min-h-[300px] rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-4 text-slate-400 hover:text-primary hover:border-primary/40 hover:bg-primary/5 transition-all group"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Plus size={32} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest">Add Story Page</span>
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'journal' && (
              <div className="max-w-3xl space-y-6">
                <div className="p-6 bg-rose-50 border border-rose-100 rounded-3xl flex gap-4">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-rose-500 shadow-sm shrink-0">
                    <MessageSquare size={20} />
                  </div>
                  <p className="text-sm text-rose-700 leading-relaxed font-medium">
                    The <span className="font-black">Learning Journal</span> asks the user to reflect on what they've learned. Provide a thoughtful prompt.
                  </p>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">Reflection Prompt</label>
                  <textarea 
                    value={content.journal.prompt}
                    onChange={(e) => updateSegment('journal', { prompt: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-3xl p-8 min-h-[200px] outline-none focus:ring-4 focus:ring-rose-500/5 focus:border-rose-500/30 transition-all font-bold text-xl leading-relaxed text-rose-600 placeholder:text-rose-200"
                    placeholder="How did Meera's story make you feel about your own changes?"
                  />
                </div>
              </div>
            )}

            {activeTab === 'quiz' && (
              <div className="max-w-4xl space-y-6">
                <div className="space-y-6">
                  {content.quiz.questions.map((q, qIndex) => (
                    <div key={qIndex} className="bg-slate-50 border border-slate-200 rounded-[2.5rem] p-8 relative group/q transition-all hover:bg-white hover:border-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/5">
                      <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                          <span className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs font-black">
                            Q{qIndex + 1}
                          </span>
                          <h4 className="font-black text-slate-800 uppercase tracking-tight">Question Configuration</h4>
                        </div>
                        <button 
                          onClick={() => {
                            const newQuestions = [...content.quiz.questions];
                            newQuestions.splice(qIndex, 1);
                            updateSegment('quiz', { questions: newQuestions });
                          }}
                          className="p-2 text-rose-300 hover:text-rose-500 transition-colors"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                      
                      <div className="space-y-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">The Question</label>
                          <input 
                            type="text"
                            value={q.question}
                            onChange={(e) => {
                              const newQuestions = [...content.quiz.questions];
                              newQuestions[qIndex] = { ...q, question: e.target.value };
                              updateSegment('quiz', { questions: newQuestions });
                            }}
                            className="w-full bg-white border border-slate-200 rounded-2xl px-6 py-4 outline-none focus:border-emerald-500 font-bold text-slate-800 transition-all shadow-sm"
                            placeholder="e.g., What was the main reason for Meera's growth spurt?"
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {q.options.map((opt, optIndex) => (
                            <div key={optIndex} className={`flex items-center gap-3 p-2 rounded-2xl border transition-all ${
                              q.correctIndex === optIndex ? 'bg-emerald-50 border-emerald-500/30' : 'bg-white border-slate-100'
                            }`}>
                              <button 
                                onClick={() => {
                                  const newQuestions = [...content.quiz.questions];
                                  newQuestions[qIndex] = { ...q, correctIndex: optIndex };
                                  updateSegment('quiz', { questions: newQuestions });
                                }}
                                className={`w-8 h-8 rounded-xl border-2 flex items-center justify-center transition-all shrink-0 ${
                                  q.correctIndex === optIndex ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-white border-slate-200 hover:border-slate-300'
                                }`}
                              >
                                {q.correctIndex === optIndex ? <CheckCircle2 size={16} /> : <span className="text-[10px] font-black text-slate-400">{String.fromCharCode(65 + optIndex)}</span>}
                              </button>
                              <input 
                                type="text"
                                value={opt}
                                onChange={(e) => {
                                  const newQuestions = [...content.quiz.questions];
                                  const newOpts = [...q.options];
                                  newOpts[optIndex] = e.target.value;
                                  newQuestions[qIndex] = { ...q, options: newOpts };
                                  updateSegment('quiz', { questions: newQuestions });
                                }}
                                className="flex-1 bg-transparent border-none p-2 text-sm font-bold text-slate-600 outline-none placeholder:text-slate-300"
                                placeholder={`Option ${optIndex + 1}`}
                              />
                              {q.options.length > 2 && (
                                <button 
                                  onClick={() => {
                                    const newQuestions = [...content.quiz.questions];
                                    const newOpts = [...q.options];
                                    newOpts.splice(optIndex, 1);
                                    newQuestions[qIndex] = { ...q, options: newOpts, correctIndex: q.correctIndex >= newOpts.length ? 0 : q.correctIndex };
                                    updateSegment('quiz', { questions: newQuestions });
                                  }}
                                  className="p-2 text-slate-200 hover:text-rose-400 transition-colors"
                                >
                                  <X size={14} />
                                </button>
                              )}
                            </div>
                          ))}
                          {q.options.length < 4 && (
                            <button 
                              onClick={() => {
                                const newQuestions = [...content.quiz.questions];
                                newQuestions[qIndex] = { ...q, options: [...q.options, ''] };
                                updateSegment('quiz', { questions: newQuestions });
                              }}
                              className="p-4 border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center gap-2 text-slate-400 hover:text-emerald-500 hover:border-emerald-500/30 transition-all text-[10px] font-black uppercase tracking-widest"
                            >
                              <Plus size={14} /> Add Option
                            </button>
                          )}
                        </div>

                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Educational Explanation</label>
                          <textarea 
                            value={q.explanation}
                            onChange={(e) => {
                              const newQuestions = [...content.quiz.questions];
                              newQuestions[qIndex] = { ...q, explanation: e.target.value };
                              updateSegment('quiz', { questions: newQuestions });
                            }}
                            className="w-full bg-white border border-slate-200 rounded-2xl p-6 text-sm font-medium text-slate-600 outline-none focus:border-emerald-500 min-h-[100px] transition-all shadow-sm"
                            placeholder="Explain why the correct answer is right..."
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <button 
                    onClick={() => updateSegment('quiz', { questions: [...content.quiz.questions, { question: '', options: ['', ''], correctIndex: 0, explanation: '' }] })}
                    className="w-full py-8 border-2 border-dashed border-slate-200 rounded-[2.5rem] flex flex-col items-center justify-center gap-4 text-slate-400 hover:text-emerald-500 hover:border-emerald-500/30 hover:bg-emerald-500/5 transition-all group"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Plus size={32} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest">Add Quiz Question</span>
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'summary' && (
              <div className="max-w-3xl space-y-6">
                <div className="p-6 bg-slate-100 border border-slate-200 rounded-3xl flex gap-4">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-600 shadow-sm shrink-0">
                    <BarChart3 size={20} />
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed font-medium">
                    The <span className="font-black">Summary</span> wrap up the episode and reinforces the key takeaways for the user.
                  </p>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">Concluding Narrative</label>
                  <textarea 
                    value={content.summary.text}
                    onChange={(e) => updateSegment('summary', { text: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-3xl p-8 min-h-[300px] outline-none focus:ring-4 focus:ring-slate-500/5 focus:border-slate-500/30 transition-all font-medium text-lg leading-relaxed text-slate-700 placeholder:text-slate-300"
                    placeholder="In summary, remember that everyone grows at their own pace..."
                  />
                </div>
              </div>
            )}
          </div>

          {/* Footer Controls */}
          <div className="px-8 py-6 border-t border-slate-100 flex items-center justify-between bg-slate-50/30">
            <button 
              onClick={handlePrev}
              disabled={activeTabIndex === 0}
              className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${
                activeTabIndex === 0 ? 'text-slate-300' : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              <ChevronLeft size={18} /> Previous Step
            </button>
            <div className="flex gap-2">
              {tabs.map((tab, i) => (
                <div key={tab.id} className={`w-2 h-2 rounded-full transition-all duration-500 ${i === activeTabIndex ? 'w-8 bg-primary' : 'bg-slate-200'}`} />
              ))}
            </div>
            <button 
              onClick={handleNext}
              disabled={activeTabIndex === tabs.length - 1}
              className={`flex items-center gap-2 px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${
                activeTabIndex === tabs.length - 1 ? 'text-slate-300' : 'bg-white border border-slate-200 text-slate-800 hover:shadow-lg hover:shadow-slate-200/50 hover:-translate-y-0.5'
              }`}
            >
              Next Step <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
