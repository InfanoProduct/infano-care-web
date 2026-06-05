'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft, ChevronLeft, ChevronRight, Star, CheckCircle2, AlertCircle,
  BookOpen, HelpCircle, Sparkles, Trophy, Loader2, Info, Check, Lock,
  ShieldAlert, PenTool, Bookmark, Menu
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { LearningService, Episode } from '@/services/learning.service';
import { useAuthStore } from '@/store/auth-store';
import { toast } from 'react-hot-toast';

interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
}

interface PeerModule {
  id: string;
  title: string;
  detail: string;
}

interface SafeStep {
  step: string;
  action: string;
  example: string;
}

interface CurriculumContent {
  hook: { text: string };
  story: { pages: string[] };
  journal: { prompt: string };
  quiz: { questions: QuizQuestion[] };
  summary: { text: string };

  overview?: string;
  objectives?: string[];
  modules?: PeerModule[];
  reflection?: { title: string; prompt: string; isPrivate: boolean };
  check?: string[];
  nonNegotiable?: string;
  safeProtocol?: SafeStep[];
  practice?: { title: string; prompt: string };
  activity?: { title: string; fields: string[] };
}

const DEFAULT_CONTENT: CurriculumContent = {
  hook: { text: '' },
  story: { pages: [] },
  journal: { prompt: '' },
  quiz: { questions: [] },
  summary: { text: '' },

  overview: '',
  objectives: [],
  modules: [],
  reflection: { title: '', prompt: '', isPrivate: true },
  check: [],
  nonNegotiable: '',
  safeProtocol: [],
  practice: { title: '', prompt: '' },
  activity: { title: '', fields: [] }
};

const STEP_META: Record<string, { label: string; icon: any; color: string }> = {
  'hook': { label: 'Hook', icon: Sparkles, color: 'blue' },
  'story': { label: 'Story', icon: BookOpen, color: 'purple' },
  'quiz': { label: 'Quiz', icon: HelpCircle, color: 'emerald' },
  'journal': { label: 'Journal', icon: PenTool, color: 'rose' },
  'summary': { label: 'Summary', icon: Trophy, color: 'slate' },

  // Peer Flow
  'overview': { label: 'Overview', icon: BookOpen, color: 'blue' },
  'non-negotiable': { label: 'Guidelines', icon: ShieldAlert, color: 'rose' },
  'modules': { label: 'Modules', icon: BookOpen, color: 'purple' },
  'safe-protocol': { label: 'SAFE Protocol', icon: ShieldAlert, color: 'rose' },
  'practice': { label: 'Practice', icon: HelpCircle, color: 'amber' },
  'reflection': { label: 'Reflection', icon: PenTool, color: 'rose' },
  'knowledge-check': { label: 'Assessment', icon: HelpCircle, color: 'emerald' },
  'complete': { label: 'Complete', icon: Trophy, color: 'yellow' },
};

const getStepMeta = (stepName: string) => {
  return STEP_META[stepName] || { label: stepName, icon: BookOpen, color: 'purple' };
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

  // Detect Peer Training format
  if (parsed && typeof parsed === 'object' && !Array.isArray(parsed) && (parsed.overview || parsed.objectives || parsed.modules || parsed.check)) {
    return {
      ...DEFAULT_CONTENT,
      ...parsed,
    };
  }

  // Interactive format
  if (parsed && typeof parsed === 'object' && !Array.isArray(parsed) && (parsed.hook || parsed.story || parsed.quiz || parsed.journal || parsed.summary)) {
    return {
      ...DEFAULT_CONTENT,
      hook: { text: '', ...(typeof parsed.hook === 'object' ? parsed.hook : { text: parsed.hook || '' }) },
      story: { pages: [], ...(typeof parsed.story === 'object' ? parsed.story : { pages: [] }) },
      journal: { prompt: '', ...(typeof (parsed.journal || parsed.reflection) === 'object' ? (parsed.journal || parsed.reflection) : { prompt: (parsed.journal || parsed.reflection) || '' }) },
      quiz: { questions: [], ...(typeof (parsed.quiz || parsed.knowledgeCheck) === 'object' ? (parsed.quiz || parsed.knowledgeCheck) : { questions: (parsed.quiz || parsed.knowledgeCheck) || [] }) },
      summary: { text: '', ...(typeof parsed.summary === 'object' ? parsed.summary : { text: parsed.summary || '' }) }
    };
  }

  // Legacy format
  if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
    return {
      ...DEFAULT_CONTENT,
      hook: { text: parsed.hook?.text || (typeof parsed.hook === 'string' ? parsed.hook : '') },
      story: { pages: parsed.story?.pages || (parsed.story?.url ? [parsed.story.url] : (typeof parsed.story === 'string' ? [parsed.story] : [])) },
      journal: { prompt: parsed.reflection?.prompt || parsed.journal?.prompt || (typeof parsed.reflection === 'string' ? parsed.reflection : '') },
      quiz: { questions: parsed.knowledgeCheck?.questions || parsed.quiz?.questions || [] },
      summary: { text: parsed.summary?.text || (typeof parsed.summary === 'string' ? parsed.summary : '') },
    };
  }

  // Array format
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

const CATEGORY_THEMES: Record<string, { accent: string; gradient: string; bg: string; border: string; iconBg: string; shadow: string; toClass: string }> = {
  'puberty': {
    accent: 'text-rose-600', gradient: 'from-rose-500 to-pink-500', bg: 'bg-rose-50/50',
    border: 'border-rose-100', iconBg: 'bg-rose-100/60', shadow: 'shadow-rose-105/20', toClass: 'to-rose-50/10'
  },
  'mental-health': {
    accent: 'text-teal-650', gradient: 'from-teal-500 to-emerald-500', bg: 'bg-teal-50/50',
    border: 'border-teal-100', iconBg: 'bg-teal-100/60', shadow: 'shadow-teal-105/20', toClass: 'to-teal-50/10'
  },
  'relationships': {
    accent: 'text-violet-650', gradient: 'from-violet-500 to-purple-500', bg: 'bg-violet-50/50',
    border: 'border-violet-100', iconBg: 'bg-violet-100/60', shadow: 'shadow-violet-105/20', toClass: 'to-violet-50/10'
  },
  'body': {
    accent: 'text-amber-650', gradient: 'from-amber-500 to-orange-500', bg: 'bg-amber-50/50',
    border: 'border-amber-100', iconBg: 'bg-amber-100/60', shadow: 'shadow-amber-105/20', toClass: 'to-amber-50/10'
  },
  'safety': {
    accent: 'text-blue-650', gradient: 'from-blue-500 to-indigo-500', bg: 'bg-blue-50/50',
    border: 'border-blue-100', iconBg: 'bg-blue-100/60', shadow: 'shadow-blue-105/20', toClass: 'to-blue-50/10'
  },
};

const DEFAULT_THEME = {
  accent: 'text-purple-605', gradient: 'from-purple-500 to-indigo-500', bg: 'bg-purple-50/50',
  border: 'border-purple-100', iconBg: 'bg-purple-100/60', shadow: 'shadow-purple-105/20', toClass: 'to-purple-50/10'
};

function getTheme(category: string | null | undefined) {
  if (!category) return DEFAULT_THEME;
  const key = category.toLowerCase().replace(/\s+/g, '-');
  return CATEGORY_THEMES[key] || DEFAULT_THEME;
}

export default function EpisodePlayerPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  
  const journeyId = params.journeyId as string;
  const episodeId = params.episodeId as string;

  const [episode, setEpisode] = useState<Episode | null>(null);
  const [journeyCategory, setJourneyCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Normalized contents
  const [content, setContent] = useState<CurriculumContent>(DEFAULT_CONTENT);
  const [isPeerTraining, setIsPeerTraining] = useState(false);

  // Navigation steps
  const [steps, setSteps] = useState<string[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);

  // Story state (internal sub-carousel if rendering multiple pages)
  const [currentStoryPage, setCurrentStoryPage] = useState(0);

  // Quiz interactive state
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizLocked, setQuizLocked] = useState<Record<number, boolean>>({}); // locked after answering
  const [incorrectAttempts, setIncorrectAttempts] = useState<Record<number, number>>({});

  // Journal/Reflection state
  const [reflectionText, setReflectionText] = useState('');
  const [reflectionMode, setReflectionMode] = useState<'private' | 'community'>('private');

  const theme = getTheme(journeyCategory || episode?.description);

  // Load episode content & user progress
  useEffect(() => {
    if (!episodeId) return;

    const fetchEpisode = async () => {
      try {
        setLoading(true);
        
        // Fetch learning journey to get category
        try {
          const journeyData = await LearningService.getJourney(journeyId);
          if (journeyData) {
            setJourneyCategory(journeyData.category);
          }
        } catch (e) {
          console.error("Failed to load journey category:", e);
        }

        const data = await LearningService.getEpisode(episodeId);
        setEpisode(data);

        const norm = normalizeContent(data.content);
        setContent(norm);

        // Detect format
        const rawContent = typeof data.content === 'string' ? JSON.parse(data.content) : data.content;
        const isPeer = rawContent && typeof rawContent === 'object' && !Array.isArray(rawContent) &&
          (rawContent.overview || rawContent.objectives || rawContent.modules || rawContent.check);
        setIsPeerTraining(isPeer);

        // Build player wizard slides
        const slides: string[] = [];
        if (isPeer) {
          if (norm.overview || (norm.objectives && norm.objectives.length > 0)) slides.push('overview');
          if (norm.nonNegotiable) slides.push('non-negotiable');
          if (norm.modules && norm.modules.length > 0) slides.push('modules');
          if (norm.safeProtocol && norm.safeProtocol.length > 0) slides.push('safe-protocol');
          if (norm.practice) slides.push('practice');
          if (norm.reflection || norm.activity) slides.push('reflection');
          if (norm.check && norm.check.length > 0) slides.push('knowledge-check');
          slides.push('complete');
        } else {
          if (norm.hook?.text) slides.push('hook');
          if (norm.story?.pages && norm.story.pages.length > 0) slides.push('story');
          if (norm.quiz?.questions && norm.quiz.questions.length > 0) slides.push('quiz');
          if (norm.journal?.prompt) slides.push('journal');
          if (norm.summary?.text) slides.push('summary');
        }
        setSteps(slides);

        // Fetch user progress for this episode to resume
        let initialStepIndex = 0;
        let doneSteps: string[] = [];
        try {
          const progressList = await LearningService.getMyProgress();
          const epProgress = progressList.find(p => p.episodeId === episodeId);
          if (epProgress) {
            if (epProgress.completedItems) {
              doneSteps = typeof epProgress.completedItems === 'string'
                ? JSON.parse(epProgress.completedItems)
                : epProgress.completedItems;
            }
            if (epProgress.lastViewedItemId) {
              const resumeIdx = slides.indexOf(epProgress.lastViewedItemId);
              if (resumeIdx !== -1) {
                const isUnlocked = resumeIdx === 0 || doneSteps.includes(slides[resumeIdx - 1]);
                if (isUnlocked) {
                  initialStepIndex = resumeIdx;
                }
              }
            }
          }
        } catch (err) {
          console.error("Failed to load user progress:", err);
        }

        setCompletedSteps(doneSteps);
        setCurrentStepIndex(initialStepIndex);
        setCurrentStoryPage(0);
        setQuizAnswers({});
        setQuizLocked({});
        setIncorrectAttempts({});
        setReflectionText('');
        setReflectionMode('private');
      } catch (err) {
        toast.error('Failed to load episode details.');
        router.push(`/dashboard/learning-journeys/${journeyId}`);
      } finally {
        setLoading(false);
      }
    };

    fetchEpisode();
  }, [episodeId, journeyId, router]);

  const currentStep = steps[currentStepIndex];

  // Helper validation to proceed to next slide
  const canProceed = useCallback(() => {
    if (!currentStep) return false;

    if (!isPeerTraining) {
      if (currentStep === 'story' && content.story?.pages) {
        return currentStoryPage >= content.story.pages.length - 1;
      }
      if (currentStep === 'quiz' && content.quiz?.questions) {
        return content.quiz.questions.every((_, idx) => quizLocked[idx] && quizAnswers[idx] === _.correctIndex);
      }
      if (currentStep === 'journal') {
        return reflectionText.trim().length >= 20;
      }
    } else {
      if (currentStep === 'reflection') {
        return reflectionText.trim().length >= 30;
      }
    }
    return true;
  }, [currentStep, isPeerTraining, content, currentStoryPage, quizAnswers, quizLocked, reflectionText]);

  // Sync current progress in database
  const saveProgress = async (nextStepIndex: number) => {
    if (!episode || nextStepIndex < 0 || nextStepIndex >= steps.length) return;

    const nextStepName = steps[nextStepIndex];
    const newCompleted = [...completedSteps];
    for (let i = 0; i < nextStepIndex; i++) {
      const stepName = steps[i];
      if (!newCompleted.includes(stepName)) {
        newCompleted.push(stepName);
      }
    }

    setCompletedSteps(newCompleted);

    try {
      await LearningService.updateEpisodeProgress(episode.id, {
        completedItems: newCompleted,
        lastViewedItemId: nextStepName
      });
    } catch (err) {
      console.error("Failed to save episode progress:", err);
    }
  };

  // Handle NEXT action
  const handleNext = () => {
    if (currentStep === 'story' && content.story?.pages && currentStoryPage < content.story.pages.length - 1) {
      setCurrentStoryPage(prev => prev + 1);
      return;
    }

    if (currentStepIndex < steps.length - 1) {
      const nextIdx = currentStepIndex + 1;
      setCurrentStepIndex(nextIdx);
      saveProgress(nextIdx);
    }
  };

  // Handle PREVIOUS action
  const handlePrev = () => {
    if (currentStep === 'story' && currentStoryPage > 0) {
      setCurrentStoryPage(prev => prev - 1);
      return;
    }

    if (currentStepIndex > 0) {
      const prevIdx = currentStepIndex - 1;
      setCurrentStepIndex(prevIdx);
      saveProgress(prevIdx);
    }
  };

  // Handle sidebar clicks
  const handleSidebarClick = (index: number) => {
    const isUnlocked = index === 0 || completedSteps.includes(steps[index - 1]);
    if (!isUnlocked) {
      toast.error('This step is locked. Complete the previous steps first!');
      return;
    }
    setCurrentStepIndex(index);
    if (steps[index] === 'story') {
      setCurrentStoryPage(0);
    }
    saveProgress(index);
    setSidebarOpen(false); // Close sidebar drawer on mobile
  };

  // Handle QUIZ option selection
  const handleQuizSelect = (qIdx: number, optIdx: number, correctIdx: number) => {
    if (quizLocked[qIdx]) return;

    setQuizAnswers(prev => ({ ...prev, [qIdx]: optIdx }));

    if (optIdx === correctIdx) {
      setQuizLocked(prev => ({ ...prev, [qIdx]: true }));
      toast.success('Correct answer!');
    } else {
      setIncorrectAttempts(prev => ({ ...prev, [qIdx]: (prev[qIdx] || 0) + 1 }));
      toast.error('Incorrect. Try again!');
    }
  };

  // Handle completion submission
  const handleComplete = async () => {
    if (!episode) return;
    setIsSubmitting(true);

    let firstTryCount = 0;
    const questionsCount = content.quiz?.questions?.length || 0;
    if (questionsCount > 0) {
      content.quiz.questions.forEach((_, idx) => {
        if (!incorrectAttempts[idx]) {
          firstTryCount++;
        }
      });
    }
    const accuracyScore = questionsCount > 0 ? Math.round((firstTryCount / questionsCount) * 3) : 3;

    try {
      await LearningService.updateEpisodeProgress(episode.id, {
        completedItems: steps,
        lastViewedItemId: steps[steps.length - 1]
      });

      const res = await LearningService.completeEpisode(episode.id, {
        knowledgeCheckAccuracy: accuracyScore,
        reflectionMode: reflectionMode,
        reflectionContent: reflectionText || undefined
      });

      toast.success(`Episode completed! +${res.pointsEarned} XP Earned 🎉`, {
        duration: 4000,
        icon: '🏆'
      });

      router.push(`/dashboard/learning-journeys/${journeyId}`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to submit episode completion.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[#FFFCFA]">
        <Loader2 className="animate-spin text-primary" size={48} />
        <span className="font-extrabold text-lg text-slate-500 tracking-wide">Preparing your interactive lesson...</span>
      </div>
    );
  }

  // Active step metadata
  const activeStepMeta = getStepMeta(currentStep);

  return (
    <div className="min-h-screen bg-[#FFFCFA] text-slate-900 flex flex-col relative overflow-hidden font-sans">
      {/* Dynamic Background Blobs */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className={`absolute top-[-10%] left-[-15%] w-[45vw] h-[45vw] bg-gradient-to-br ${theme.gradient} opacity-[0.04] rounded-full blur-[100px] animate-blob-slow`} />
        <div className={`absolute bottom-[-10%] right-[-15%] w-[40vw] h-[40vw] bg-gradient-to-tr ${theme.gradient} opacity-[0.03] rounded-full blur-[120px] animate-blob-slow animation-delay-2000`} />
      </div>

      {/* Modern Fixed Header */}
      <header className="sticky top-0 z-40 bg-white/70 backdrop-blur-xl border-b border-slate-100/80 px-4 md:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4 min-w-0">
          <button
            onClick={() => router.push(`/dashboard/learning-journeys/${journeyId}`)}
            className="p-2.5 rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-all active:scale-90 shrink-0"
            title="Back to Journey"
          >
            <ArrowLeft size={18} />
          </button>
          
          <div className="min-w-0">
            <span className={`text-[9px] font-black uppercase tracking-widest ${theme.accent} flex items-center gap-1`}>
              <Sparkles size={10} className="fill-current" /> Interactive Player
            </span>
            <h1 className="font-extrabold text-sm sm:text-base text-slate-800 leading-tight truncate max-w-[180px] sm:max-w-md">
              {episode?.title}
            </h1>
          </div>
        </div>

        {/* Global Progress Bar */}
        <div className="hidden md:flex items-center gap-3 w-48 shrink-0">
          <div className="h-2 bg-slate-100 rounded-full flex-1 overflow-hidden">
            <div 
              className={`h-full bg-gradient-to-r ${theme.gradient} transition-all duration-500`} 
              style={{ width: `${((currentStepIndex + 1) / steps.length) * 100}%` }}
            />
          </div>
          <span className="text-[11px] font-black text-slate-400 shrink-0">
            {currentStepIndex + 1} / {steps.length}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Mobile Path Toggle */}
          <button
            onClick={() => setSidebarOpen(prev => !prev)}
            className="p-2.5 rounded-xl border border-slate-100 bg-white hover:bg-slate-55 text-slate-500 hover:text-slate-800 transition-all md:hidden active:scale-95 shadow-sm"
          >
            <Menu size={18} />
          </button>
        </div>
      </header>

      {/* Main Core Layout */}
      <div className="flex-1 flex overflow-hidden relative z-10">
        
        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto px-4 py-8 md:p-12 flex flex-col justify-between items-center custom-scrollbar">
          
          <div className="w-full max-w-3xl flex-1 flex flex-col justify-center items-center">
            
            {/* Step Sub-Header */}
            <div className="text-center mb-6 max-w-xl">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 bg-white border ${theme.border} rounded-full text-[10px] font-black tracking-widest ${theme.accent} uppercase shadow-sm`}>
                {activeStepMeta.label}
              </span>
            </div>

            {/* Centered Glassmorphic View Canvas */}
            <div className="w-full bg-white/70 backdrop-blur-xl border border-slate-100 shadow-premium rounded-3xl p-6 sm:p-10 flex flex-col items-center justify-center relative overflow-hidden transition-all duration-300">
              
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep + '-' + currentStoryPage}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                  className="w-full flex flex-col justify-center"
                >
                  
                  {/* ==================== TEEN (INTERACTIVE) FLOW ==================== */}

                  {/* 1. HOOK */}
                  {currentStep === 'hook' && (
                    <div className="space-y-6 text-center">
                      <h2 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight leading-snug">
                        Let's set the stage...
                      </h2>
                      <div className="p-6 bg-slate-50/50 rounded-2xl border border-slate-100 text-left relative overflow-hidden">
                        <p className="text-sm text-slate-700 font-medium leading-relaxed whitespace-pre-line select-none relative z-10">
                          {content.hook.text}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* 2. STORY */}
                  {currentStep === 'story' && content.story?.pages && (
                    <div className="space-y-6 flex flex-col items-center">
                      <div className="text-center">
                        <h2 className="text-xl font-black text-slate-850 tracking-tight">Flip through the story cards</h2>
                        <p className="text-xs font-semibold text-slate-400 mt-1">Page {currentStoryPage + 1} of {content.story.pages.length}</p>
                      </div>

                      {/* Premium Story Frame */}
                      <div className="relative w-full max-w-sm aspect-[3/4] bg-white rounded-3xl overflow-hidden shadow-premium border border-slate-100 group transition-all duration-300 hover:shadow-glow">
                        {content.story.pages[currentStoryPage] ? (
                          <img
                            src={content.story.pages[currentStoryPage]}
                            alt={`Story Page ${currentStoryPage + 1}`}
                            className="w-full h-full object-cover select-none pointer-events-none"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-slate-350 p-8 text-center bg-slate-50">
                            <BookOpen size={48} className="opacity-10 mb-3" />
                            <p className="text-sm font-bold">Image URL not specified.</p>
                          </div>
                        )}
                        
                        {/* Slide Flip Overlay navigation overlay */}
                        <div className="absolute inset-0 flex justify-between p-4 items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                          <button
                            onClick={(e) => { e.stopPropagation(); currentStoryPage > 0 && setCurrentStoryPage(p => p - 1); }}
                            disabled={currentStoryPage === 0}
                            className={`p-2.5 rounded-full bg-white/95 backdrop-blur-sm shadow-md transition-all pointer-events-auto ${
                              currentStoryPage === 0 ? 'opacity-30 cursor-not-allowed' : 'hover:scale-110 hover:bg-white active:scale-90'
                            }`}
                          >
                            <ChevronLeft size={16} className="text-slate-800" />
                          </button>

                          <button
                            onClick={(e) => { e.stopPropagation(); currentStoryPage < content.story.pages.length - 1 && setCurrentStoryPage(p => p + 1); }}
                            disabled={currentStoryPage === content.story.pages.length - 1}
                            className={`p-2.5 rounded-full bg-white/95 backdrop-blur-sm shadow-md transition-all pointer-events-auto ${
                              currentStoryPage === content.story.pages.length - 1 ? 'opacity-30 cursor-not-allowed' : 'hover:scale-110 hover:bg-white active:scale-90'
                            }`}
                          >
                            <ChevronRight size={16} className="text-slate-800" />
                          </button>
                        </div>

                        {/* Pagination slider dots */}
                        <div className="absolute inset-x-0 bottom-4 flex justify-center gap-1.5 z-10 pointer-events-none">
                          {content.story.pages.map((_, i) => (
                            <div
                              key={i}
                              className={`h-1.5 rounded-full transition-all duration-300 ${
                                i === currentStoryPage ? 'w-5 bg-white shadow-sm' : 'w-1.5 bg-white/60'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 3. QUIZ */}
                  {currentStep === 'quiz' && content.quiz?.questions && (
                    <div className="space-y-6">
                      <div className="text-center">
                        <h2 className="text-xl font-black text-slate-850 tracking-tight">Interactive Quiz</h2>
                        <p className="text-xs font-semibold text-slate-400 mt-1">Answer correctly to lock in your mastery</p>
                      </div>

                      <div className="space-y-6 mt-4">
                        {content.quiz.questions.map((q, qIdx) => {
                          const isCorrect = quizLocked[qIdx] && quizAnswers[qIdx] === q.correctIndex;
                          const hasSelected = quizAnswers[qIdx] !== undefined;

                          return (
                            <div key={qIdx} className={`p-5 bg-white border ${isCorrect ? 'border-emerald-200 bg-emerald-50/10' : 'border-slate-100'} rounded-2xl transition-all shadow-sm duration-300 space-y-4`}>
                              <div className="flex items-start gap-3">
                                <span className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-black uppercase ${
                                  isCorrect ? 'bg-emerald-100 text-emerald-700' : 'bg-primary/10 text-primary'
                                }`}>
                                  Q{qIdx + 1}
                                </span>
                                <h4 className="text-sm sm:text-base font-bold text-slate-800 leading-snug">
                                  {q.question}
                                </h4>
                              </div>

                              <div className="grid grid-cols-1 gap-2.5 pt-1">
                                {q.options.map((opt, optIndex) => {
                                  const isSelected = quizAnswers[qIdx] === optIndex;
                                  const isOptionCorrect = optIndex === q.correctIndex;
                                  const isOptionWrong = isSelected && !isOptionCorrect;
                                  
                                  let btnClass = 'border-slate-100 bg-slate-50/40 hover:border-primary/20 hover:bg-primary/5 text-slate-700';
                                  if (quizLocked[qIdx]) {
                                    if (isOptionCorrect) {
                                      btnClass = 'border-emerald-300 bg-emerald-50 text-emerald-800 shadow-sm';
                                    } else if (isSelected) {
                                      btnClass = 'border-rose-200 bg-rose-50/50 text-rose-800 opacity-60';
                                    } else {
                                      btnClass = 'border-slate-100 bg-white opacity-40';
                                    }
                                  } else if (isSelected && isOptionWrong) {
                                    btnClass = 'border-rose-300 bg-rose-50/30 text-rose-800';
                                  }

                                  return (
                                    <button
                                      key={optIndex}
                                      onClick={() => handleQuizSelect(qIdx, optIndex, q.correctIndex)}
                                      disabled={quizLocked[qIdx]}
                                      className={`w-full flex items-center gap-3 p-3.5 rounded-xl border font-bold text-left text-xs sm:text-sm transition-all active:scale-[0.99] hover:shadow-sm ${btnClass}`}
                                    >
                                      <div className={`w-5.5 h-5.5 rounded-md flex items-center justify-center text-[10px] font-black border uppercase shrink-0 ${
                                        isSelected
                                          ? 'bg-current text-white border-transparent'
                                          : 'bg-white border-slate-200 text-slate-400'
                                      }`}>
                                        {String.fromCharCode(65 + optIndex)}
                                      </div>
                                      <span className="flex-1 leading-snug">{opt}</span>
                                      {quizLocked[qIdx] && isOptionCorrect && <CheckCircle2 size={14} className="text-emerald-605 shrink-0" />}
                                    </button>
                                  );
                                })}
                              </div>

                              {/* Quiz Explanation */}
                              {quizLocked[qIdx] && q.explanation && (
                                <div className="p-4 bg-emerald-50/30 border border-emerald-100 rounded-xl flex gap-3 text-emerald-850 text-xs font-semibold animate-in slide-in-from-top-2 duration-300">
                                  <Info size={16} className="shrink-0 text-emerald-600 mt-0.5" />
                                  <p className="leading-relaxed">{q.explanation}</p>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* 4. JOURNAL */}
                  {currentStep === 'journal' && (
                    <div className="space-y-6">
                      <div className="text-center">
                        <h2 className="text-xl font-black text-slate-850 tracking-tight">Learning Journal</h2>
                        <p className="text-xs font-semibold text-slate-400 mt-1">Reflect on what you've learned to lock in your knowledge</p>
                      </div>

                      <div className="bg-rose-50/10 border border-rose-100 rounded-2xl p-5 space-y-4">
                        <div className="space-y-1.5">
                          <h4 className="text-[10px] font-black text-rose-500 uppercase tracking-widest">Journal Prompt</h4>
                          <p className="text-sm font-bold text-slate-800 leading-snug">
                            {content.journal.prompt}
                          </p>
                        </div>

                        <div className="space-y-3">
                          <textarea
                            value={reflectionText}
                            onChange={(e) => setReflectionText(e.target.value)}
                            placeholder="Type your reflection here (minimum 20 characters)..."
                            className="w-full p-4 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-700 placeholder:text-slate-300 min-h-[140px] outline-none focus:border-rose-350 focus:ring-4 focus:ring-rose-350/5 transition-all shadow-sm"
                          />
                          
                          <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
                            <span className={`text-xs font-bold ${reflectionText.trim().length >= 20 ? 'text-emerald-600' : 'text-slate-450'}`}>
                              Characters: {reflectionText.length} / 20 min
                            </span>
                            
                            <div className="flex gap-1.5">
                              <button
                                type="button"
                                onClick={() => setReflectionMode('private')}
                                className={`px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest transition-all ${
                                  reflectionMode === 'private'
                                    ? 'bg-slate-900 border-slate-900 text-white shadow-sm'
                                    : 'border-slate-200 text-slate-400 hover:border-slate-300'
                                }`}
                              >
                                Private
                              </button>
                              <button
                                type="button"
                                onClick={() => setReflectionMode('community')}
                                className={`px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest transition-all ${
                                  reflectionMode === 'community'
                                    ? 'bg-slate-900 border-slate-900 text-white shadow-sm'
                                    : 'border-slate-200 text-slate-400 hover:border-slate-300'
                                }`}
                              >
                                Community
                              </button>
                            </div>
                          </div>
                          <p className="text-[10px] text-slate-400 leading-relaxed font-medium pt-2 border-t border-slate-100/60">
                            {reflectionMode === 'private' 
                              ? '🔒 Private: Only you can view this journal entry in your dashboard.' 
                              : '👥 Community: Anonymous peer reflection shared in Gigis Circle feed.'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 5. SUMMARY */}
                  {currentStep === 'summary' && (
                    <div className="space-y-6 text-center py-4 flex flex-col items-center">
                      <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-amber-500/10 animate-float">
                        <Trophy size={32} className="fill-white/10" />
                      </div>
                      
                      <div className="space-y-1">
                        <h2 className="text-xl sm:text-2xl font-black text-slate-850 tracking-tight leading-tight">
                          Fantastic work!
                        </h2>
                        <p className="text-xs font-semibold text-slate-400">Activity completed successfully</p>
                      </div>

                      <div className="p-6 bg-slate-50/50 rounded-2xl border border-slate-100 max-w-md w-full">
                        <p className="text-xs sm:text-sm text-slate-650 font-medium leading-relaxed">
                          {content.summary.text}
                        </p>
                      </div>

                      <div className="pt-4 flex flex-col items-center w-full">
                        <button
                          onClick={handleComplete}
                          disabled={isSubmitting}
                          className="btn-primary w-full max-w-xs py-3.5 rounded-2xl flex items-center justify-center gap-2 transition-all font-black text-xs sm:text-sm uppercase tracking-widest shadow-md disabled:opacity-50"
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="animate-spin" size={16} /> Submitting...
                            </>
                          ) : (
                            <>
                              Complete Episode <Trophy size={16} />
                            </>
                          )}
                        </button>
                        <p className="text-[10px] text-slate-400 mt-3 font-semibold">
                          Earn +{episode?.points || 75} XP points for your profile.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* ==================== PEER TRAINING (MENTOR) FLOW ==================== */}

                  {/* A. OVERVIEW / OBJECTIVES */}
                  {currentStep === 'overview' && (
                    <div className="space-y-6">
                      <div className="text-center">
                        <h2 className="text-xl font-black text-slate-850 tracking-tight">Overview & Objectives</h2>
                        <p className="text-xs font-semibold text-slate-400 mt-1">Foundational training overview</p>
                      </div>

                      {content.overview && (
                        <div className="p-5 bg-slate-50/50 rounded-2xl border border-slate-100 text-left">
                          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Overview</h4>
                          <p className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed whitespace-pre-line select-none">
                            {content.overview}
                          </p>
                        </div>
                      )}

                      {content.objectives && content.objectives.length > 0 && (
                        <div className="space-y-3">
                          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Key Objectives</h4>
                          <div className="grid grid-cols-1 gap-2.5">
                            {content.objectives.map((obj, idx) => (
                              <div key={idx} className="flex items-start gap-3 p-4 bg-white border border-slate-100 rounded-xl shadow-sm">
                                <span className="w-5.5 h-5.5 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
                                  ✓
                                </span>
                                <span className="text-xs sm:text-sm font-bold text-slate-650 leading-relaxed">{obj}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* B. NON NEGOTIABLE WARNING */}
                  {currentStep === 'non-negotiable' && content.nonNegotiable && (
                    <div className="space-y-6 text-center py-4 flex flex-col items-center">
                      <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center shadow-lg shadow-rose-500/5 animate-float">
                        <ShieldAlert size={32} />
                      </div>
                      
                      <div className="space-y-1">
                        <h2 className="text-xl sm:text-2xl font-black text-slate-850 tracking-tight">Crucial Mentor Guidelines</h2>
                        <p className="text-xs font-semibold text-slate-400">Safety & boundaries check</p>
                      </div>

                      <div className="bg-rose-50/20 border border-dashed border-rose-200 rounded-2xl p-6 text-left max-w-lg w-full relative">
                        <p className="text-xs sm:text-sm text-rose-950 font-bold leading-relaxed relative z-10 select-none">
                          {content.nonNegotiable}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* C. MODULES */}
                  {currentStep === 'modules' && content.modules && (
                    <div className="space-y-6">
                      <div className="text-center">
                        <h2 className="text-xl font-black text-slate-850 tracking-tight">Training Modules</h2>
                        <p className="text-xs font-semibold text-slate-400 mt-1">Review the core concepts before proceeding</p>
                      </div>

                      <div className="grid grid-cols-1 gap-3 mt-4">
                        {content.modules.map((m, idx) => (
                          <div key={idx} className="p-5 bg-white border border-slate-100 hover:border-primary/20 rounded-2xl shadow-sm transition-all duration-300 group">
                            <div className="flex items-start gap-4">
                              <span className="w-8 h-8 rounded-lg bg-primary/10 text-primary font-black text-sm flex items-center justify-center shrink-0">
                                {m.id}
                              </span>
                              <div className="space-y-1 flex-1 min-w-0">
                                <h4 className="text-sm sm:text-base font-black text-slate-800 leading-snug">
                                  {m.title}
                                </h4>
                                <p className="text-xs sm:text-sm font-semibold text-slate-500 leading-relaxed select-text">
                                  {m.detail}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* D. SAFE PROTOCOL */}
                  {currentStep === 'safe-protocol' && content.safeProtocol && (
                    <div className="space-y-6">
                      <div className="text-center">
                        <h2 className="text-xl font-black text-slate-850 tracking-tight">The SAFE Protocol</h2>
                        <p className="text-xs font-semibold text-slate-400 mt-1">Critical crisis recognition containment protocol</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        {content.safeProtocol.map((sp, idx) => (
                          <div key={idx} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex flex-col relative overflow-hidden">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-rose-50 text-rose-600 border border-rose-100 self-start mb-3">
                              {sp.step}
                            </span>
                            <h4 className="text-xs sm:text-sm font-black text-slate-800 leading-snug">{sp.action}</h4>
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mt-4 flex-1">
                              <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-1">Example script:</span>
                              <p className="text-xs font-semibold text-slate-505 leading-relaxed italic">
                                "{sp.example}"
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* E. PRACTICE SCENARIO */}
                  {currentStep === 'practice' && content.practice && (
                    <div className="space-y-6">
                      <div className="text-center">
                        <h2 className="text-xl font-black text-slate-850 tracking-tight">{content.practice.title}</h2>
                        <p className="text-xs font-semibold text-slate-400 mt-1">Review the case details and prepare your response mentally</p>
                      </div>

                      <div className="p-5 bg-amber-50/10 border border-amber-200 rounded-2xl space-y-3">
                        <h4 className="text-[10px] font-black text-amber-600 uppercase tracking-widest">Case Scenario</h4>
                        <p className="text-sm sm:text-base font-bold text-slate-800 leading-relaxed select-none italic">
                          "{content.practice.prompt}"
                        </p>
                      </div>
                      <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex gap-3 text-slate-505 text-xs font-semibold">
                        <Info size={16} className={`${theme.accent} shrink-0`} />
                        <p>Consider how you would set emotional boundaries while validating their distress. Avoid rescue language.</p>
                      </div>
                    </div>
                  )}

                  {/* F. PEER REFLECTION */}
                  {currentStep === 'reflection' && (
                    <div className="space-y-6">
                      <div className="text-center">
                        <h2 className="text-xl font-black text-slate-855 tracking-tight">
                          {content.reflection?.title || content.activity?.title || 'Certification Reflection'}
                        </h2>
                        <p className="text-xs font-semibold text-slate-400 mt-1">Submit your reflection write-up to complete this block</p>
                      </div>

                      <div className="bg-rose-50/10 border border-rose-100 rounded-2xl p-5 space-y-4">
                        <div className="space-y-1.5">
                          <h4 className="text-[10px] font-black text-rose-500 uppercase tracking-widest">Question prompt</h4>
                          <p className="text-sm font-bold text-slate-800 leading-relaxed select-text">
                            {content.reflection?.prompt || content.activity?.fields?.join(', ') || 'Write a brief summary of how you would apply this lesson.'}
                          </p>
                        </div>

                        <div className="space-y-3">
                          <textarea
                            value={reflectionText}
                            onChange={(e) => setReflectionText(e.target.value)}
                            placeholder="Type your reflection here (minimum 30 characters)..."
                            className="w-full p-4 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-700 placeholder:text-slate-300 min-h-[140px] outline-none focus:border-rose-350 focus:ring-4 focus:ring-rose-350/5 transition-all shadow-sm"
                          />
                          <div className="flex justify-between items-center text-xs font-bold">
                            <span className={reflectionText.trim().length >= 30 ? 'text-emerald-600' : 'text-slate-400'}>
                              Characters: {reflectionText.length} / 30 min
                            </span>
                            
                            <span className="px-3 py-1 bg-slate-100 text-slate-500 border border-slate-200 rounded-full text-[9px] font-black uppercase tracking-widest">
                              Private Submission
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* G. KNOWLEDGE CHECK */}
                  {currentStep === 'knowledge-check' && content.check && (
                    <div className="space-y-6">
                      <div className="text-center">
                        <h2 className="text-xl font-black text-slate-850 tracking-tight">Self-Assessment Questionnaire</h2>
                        <p className="text-xs font-semibold text-slate-400 mt-1">Read and answer these prompts mentally to test your understanding</p>
                      </div>

                      <div className="space-y-3 mt-4">
                        {content.check.map((item, idx) => (
                          <div key={idx} className="flex gap-4 p-5 bg-white border border-slate-100 rounded-2xl items-start shadow-sm">
                            <span className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5 text-xs font-black">
                              Q{idx + 1}
                            </span>
                            <p className="text-xs sm:text-sm font-bold text-slate-700 leading-relaxed flex-1 select-text">
                              {item}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* H. PEER COMPLETE */}
                  {currentStep === 'complete' && (
                    <div className="space-y-6 text-center py-4 flex flex-col items-center">
                      <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-650 rounded-2xl flex items-center justify-center text-white shadow-lg animate-float">
                        <Trophy size={32} className="fill-white/10" />
                      </div>
                      
                      <div className="space-y-1">
                        <h2 className="text-xl sm:text-2xl font-black text-slate-850 tracking-tight leading-tight">
                          Training Block Complete!
                        </h2>
                        <p className="text-xs font-semibold text-slate-400">Certification requirements completed</p>
                      </div>

                      <div className="p-6 bg-slate-50/50 rounded-2xl border border-slate-100 max-w-md w-full">
                        <p className="text-xs sm:text-sm text-slate-605 font-medium leading-relaxed">
                          You have reviewed all the training materials and submitted your reflection. Click below to save your progress.
                        </p>
                      </div>

                      <div className="pt-4 flex flex-col items-center w-full">
                        <button
                          onClick={handleComplete}
                          disabled={isSubmitting}
                          className="btn-primary w-full max-w-xs py-3.5 rounded-2xl flex items-center justify-center gap-2 transition-all font-black text-xs sm:text-sm uppercase tracking-widest shadow-md disabled:opacity-50"
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="animate-spin" size={16} /> Submitting...
                            </>
                          ) : (
                            <>
                              Save & Complete Training <Trophy size={16} />
                            </>
                          )}
                        </button>
                        <p className="text-[10px] text-slate-400 mt-3 font-semibold">
                          Your progress will be logged towards your mentor certification.
                        </p>
                      </div>
                    </div>
                  )}

                </motion.div>
              </AnimatePresence>

            </div>

          </div>

          {/* Footer Controls Slat */}
          <footer className="w-full max-w-3xl mt-8 pt-4 border-t border-slate-100/60 flex items-center justify-between">
            {/* Back Button */}
            <button
              onClick={handlePrev}
              disabled={currentStepIndex === 0 && currentStoryPage === 0}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl border text-xs font-black uppercase tracking-widest transition-all ${
                currentStepIndex === 0 && currentStoryPage === 0
                  ? 'border-slate-100 text-slate-300 bg-slate-50/20 cursor-not-allowed'
                  : 'border-slate-200 text-slate-650 bg-white hover:bg-slate-50 hover:shadow-sm active:scale-95'
              }`}
            >
              <ChevronLeft size={16} /> Back
            </button>

            {/* Stepper Dots (centered desktop representation) */}
            <div className="hidden sm:flex items-center gap-1.5">
              {steps.map((s, idx) => (
                <div
                  key={idx}
                  onClick={() => handleSidebarClick(idx)}
                  className={`h-2 rounded-full cursor-pointer transition-all duration-300 ${
                    idx === currentStepIndex
                      ? `w-8 bg-gradient-to-r ${theme.gradient} shadow-sm`
                      : idx < currentStepIndex
                      ? 'w-2 bg-emerald-500'
                      : 'w-2 bg-slate-200 hover:bg-slate-300'
                  }`}
                  title={`Go to step ${idx + 1}`}
                />
              ))}
            </div>

            {/* Next / Complete Button */}
            {currentStepIndex === steps.length - 1 ? (
              <button
                onClick={handleComplete}
                disabled={isSubmitting || !canProceed()}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all text-white bg-slate-900 shadow-sm ${
                  !canProceed() || isSubmitting
                    ? 'opacity-40 cursor-not-allowed bg-slate-300 shadow-none'
                    : 'hover:scale-[1.02] hover:bg-purple-700 active:scale-[0.98]'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="animate-spin" size={14} /> Saving
                  </>
                ) : (
                  <>
                    Complete <Check size={14} />
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={handleNext}
                disabled={!canProceed()}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all text-white bg-purple-650 shadow-sm ${
                  !canProceed()
                    ? 'opacity-40 cursor-not-allowed bg-slate-300 shadow-none'
                    : 'hover:scale-[1.02] hover:bg-purple-700 active:scale-[0.98]'
                }`}
              >
                Next <ChevronRight size={16} />
              </button>
            )}
          </footer>

        </main>

        {/* Right Sidebar Checklist Panel (Desktop fixed) */}
        <aside className="hidden md:flex w-64 border-l border-slate-100 flex-col bg-slate-50/30 p-5 overflow-y-auto z-10">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-5 px-1">Curriculum Path</p>
          <div className="space-y-1.5">
            {steps.map((stepName, idx) => {
              const meta = getStepMeta(stepName);
              const Icon = meta.icon;
              const isCurrent = idx === currentStepIndex;
              const isCompleted = completedSteps.includes(stepName);
              const isUnlocked = idx === 0 || completedSteps.includes(steps[idx - 1]);
              
              return (
                <button
                  key={stepName}
                  onClick={() => handleSidebarClick(idx)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all group relative border ${
                    isCurrent
                      ? `bg-gradient-to-r ${theme.gradient} text-white border-transparent shadow-md`
                      : isUnlocked
                      ? 'bg-white hover:bg-slate-100 border-slate-100 text-slate-650 hover:text-slate-900 hover:shadow-sm'
                      : 'opacity-50 cursor-not-allowed text-slate-400 bg-slate-50/40 border-slate-100'
                  }`}
                >
                  <div className={`w-6.5 h-6.5 rounded-lg flex items-center justify-center transition-colors ${
                    isCurrent ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {isUnlocked ? <Icon size={14} /> : <Lock size={12} />}
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <p className={`text-[12px] font-bold truncate ${isCurrent ? 'text-white' : 'text-slate-700'}`}>
                      {meta.label}
                    </p>
                    <p className={`text-[9px] font-semibold opacity-60 ${isCurrent ? 'text-white' : 'text-slate-400'}`}>
                      Step {idx + 1}
                    </p>
                  </div>
                  {isCompleted && !isCurrent && (
                    <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </aside>

        {/* Mobile Sidebar Drawer Overlay */}
        <AnimatePresence>
          {sidebarOpen && (
            <>
              {/* Backdrop */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.4 }}
                exit={{ opacity: 0 }}
                onClick={() => setSidebarOpen(false)}
                className="fixed inset-0 z-50 bg-black md:hidden"
              />
              {/* Drawer */}
              <motion.aside
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed right-0 top-0 bottom-0 z-50 w-72 bg-white p-6 shadow-2xl flex flex-col overflow-y-auto md:hidden"
              >
                <div className="flex items-center justify-between mb-6">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Curriculum Path</p>
                  <button 
                    onClick={() => setSidebarOpen(false)}
                    className="text-slate-400 hover:text-slate-700 p-1 rounded-full hover:bg-slate-50 transition-colors"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>

                <div className="space-y-2">
                  {steps.map((stepName, idx) => {
                    const meta = getStepMeta(stepName);
                    const Icon = meta.icon;
                    const isCurrent = idx === currentStepIndex;
                    const isCompleted = completedSteps.includes(stepName);
                    const isUnlocked = idx === 0 || completedSteps.includes(steps[idx - 1]);
                    
                    return (
                      <button
                        key={stepName}
                        onClick={() => handleSidebarClick(idx)}
                        className={`w-full flex items-center gap-3.5 p-3 rounded-xl transition-all border ${
                          isCurrent
                            ? `bg-gradient-to-r ${theme.gradient} text-white border-transparent shadow-md`
                            : isUnlocked
                            ? 'bg-slate-50/50 hover:bg-slate-100 border-slate-100 text-slate-650 hover:text-slate-900'
                            : 'opacity-50 cursor-not-allowed text-slate-400 bg-slate-50/10 border-slate-100'
                        }`}
                      >
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                          isCurrent ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {isUnlocked ? <Icon size={14} /> : <Lock size={12} />}
                        </div>
                        <div className="flex-1 text-left min-w-0">
                          <p className={`text-[13px] font-bold truncate ${isCurrent ? 'text-white' : 'text-slate-700'}`}>
                            {meta.label}
                          </p>
                          <p className={`text-[10px] font-semibold opacity-60 ${isCurrent ? 'text-white' : 'text-slate-400'}`}>
                            Step {idx + 1}
                          </p>
                        </div>
                        {isCompleted && !isCurrent && (
                          <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
