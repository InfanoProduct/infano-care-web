'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  X, ChevronLeft, ChevronRight, Star, CheckCircle2, AlertCircle,
  BookOpen, HelpCircle, Sparkles, Trophy, Loader2, Info, ArrowRight,
  ShieldAlert, PenTool, Check, Bookmark, ArrowUpRight, Lock
} from 'lucide-react';
import { LearningService, Episode } from '@/services/learning.service';
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
  // Interactive (Teen) Format
  hook: { text: string };
  story: { pages: string[] };
  journal: { prompt: string };
  quiz: { questions: QuizQuestion[] };
  summary: { text: string };

  // Peer Training Format
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

  // Detect if it's Peer Training format
  if (parsed && typeof parsed === 'object' && !Array.isArray(parsed) && (parsed.overview || parsed.objectives || parsed.modules || parsed.check)) {
    return {
      ...DEFAULT_CONTENT,
      ...parsed,
    };
  }

  // If already in Interactive format
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

  // If legacy format (object with different keys)
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

interface EpisodePlayerModalProps {
  episodeId: string;
  category?: string | null;
  isOpen: boolean;
  onClose: () => void;
  onCompleted?: (pointsEarned: number) => void;
}

const CATEGORY_THEMES: Record<string, { accent: string; gradient: string; bg: string; border: string; iconBg: string; shadow: string; toClass: string }> = {
  'puberty': {
    accent: 'text-rose-600', gradient: 'from-rose-500 to-pink-500', bg: 'bg-rose-50/50',
    border: 'border-rose-100', iconBg: 'bg-rose-100/60', shadow: 'shadow-rose-100/20', toClass: 'to-rose-50/20'
  },
  'mental-health': {
    accent: 'text-teal-600', gradient: 'from-teal-500 to-emerald-500', bg: 'bg-teal-50/50',
    border: 'border-teal-100', iconBg: 'bg-teal-100/60', shadow: 'shadow-teal-100/20', toClass: 'to-teal-50/20'
  },
  'relationships': {
    accent: 'text-violet-600', gradient: 'from-violet-500 to-purple-500', bg: 'bg-violet-50/50',
    border: 'border-violet-100', iconBg: 'bg-violet-100/60', shadow: 'shadow-violet-100/20', toClass: 'to-violet-50/20'
  },
  'body': {
    accent: 'text-amber-600', gradient: 'from-amber-500 to-orange-500', bg: 'bg-amber-50/50',
    border: 'border-amber-100', iconBg: 'bg-amber-100/60', shadow: 'shadow-amber-100/20', toClass: 'to-amber-50/20'
  },
  'safety': {
    accent: 'text-blue-600', gradient: 'from-blue-500 to-indigo-500', bg: 'bg-blue-50/50',
    border: 'border-blue-100', iconBg: 'bg-blue-100/60', shadow: 'shadow-blue-100/20', toClass: 'to-blue-50/20'
  },
};

const DEFAULT_THEME = {
  accent: 'text-purple-600', gradient: 'from-purple-500 to-indigo-500', bg: 'bg-purple-50/50',
  border: 'border-purple-100', iconBg: 'bg-purple-100/60', shadow: 'shadow-purple-100/20', toClass: 'to-purple-50/20'
};

function getTheme(category: string | null | undefined) {
  if (!category) return DEFAULT_THEME;
  const key = category.toLowerCase().replace(/\s+/g, '-');
  return CATEGORY_THEMES[key] || DEFAULT_THEME;
}

export default function EpisodePlayerModal({
  episodeId,
  category,
  isOpen,
  onClose,
  onCompleted
}: EpisodePlayerModalProps) {
  const theme = getTheme(category);
  const [episode, setEpisode] = useState<Episode | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Normalised contents
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

  // Load episode content & user progress
  useEffect(() => {
    if (!isOpen || !episodeId) return;

    const fetchEpisode = async () => {
      try {
        setLoading(true);
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
        let answers: Record<number, number> = {};
        let locked: Record<number, boolean> = {};
        let incorrect: Record<number, number> = {};

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
                // Verify that the step to resume is unlocked
                const isUnlocked = resumeIdx === 0 || doneSteps.includes(slides[resumeIdx - 1]);
                if (isUnlocked) {
                  initialStepIndex = resumeIdx;
                }
              }
            }

            // Restore history: answers, locked, incorrect attempts
            if (epProgress.history) {
              let historyObj = epProgress.history;
              if (typeof historyObj === 'string') {
                try {
                  historyObj = JSON.parse(historyObj);
                } catch (e) {
                  console.error("Failed to parse history JSON string:", e);
                }
              }
              if (historyObj && typeof historyObj === 'object') {
                if (historyObj.quizAnswers) answers = historyObj.quizAnswers;
                if (historyObj.quizLocked) locked = historyObj.quizLocked;
                if (historyObj.incorrectAttempts) incorrect = historyObj.incorrectAttempts;
              }
            }
          }
        } catch (err) {
          console.error("Failed to load user progress:", err);
        }

        setCompletedSteps(doneSteps);
        setCurrentStepIndex(initialStepIndex);
        setCurrentStoryPage(0);
        setQuizAnswers(answers);
        setQuizLocked(locked);
        setIncorrectAttempts(incorrect);
        setReflectionText('');
        setReflectionMode('private');
      } catch (err) {
        toast.error('Failed to load episode details.');
        onClose();
      } finally {
        setLoading(false);
      }
    };

    fetchEpisode();
  }, [isOpen, episodeId, onClose]);

  const currentStep = steps[currentStepIndex];

  // Helper validation to proceed to next slide
  const canProceed = useCallback(() => {
    if (!currentStep) return false;

    if (!isPeerTraining) {
      if (currentStep === 'story' && content.story?.pages) {
        // Must read all story pages
        return currentStoryPage >= content.story.pages.length - 1;
      }
      if (currentStep === 'quiz' && content.quiz?.questions) {
        // Must answer all quiz questions correctly to proceed
        return content.quiz.questions.every((_, idx) => quizLocked[idx] && quizAnswers[idx] === _.correctIndex);
      }
      if (currentStep === 'journal') {
        // Prompt is present, user must write a reflection
        return reflectionText.trim().length >= 20;
      }
    } else {
      // Peer training requirements
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

    // Any step prior to the nextStepIndex is considered completed
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
        lastViewedItemId: nextStepName,
        history: {
          quizAnswers,
          quizLocked,
          incorrectAttempts
        }
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

  // Handle sidebar curriculum path clicks
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
  };

  // Handle QUIZ option selection
  const handleQuizSelect = (qIdx: number, optIdx: number, correctIdx: number) => {
    if (quizLocked[qIdx]) return; // already locked

    const updatedAnswers = { ...quizAnswers, [qIdx]: optIdx };
    const updatedLocked = { ...quizLocked };
    const updatedIncorrect = { ...incorrectAttempts };

    if (optIdx === correctIdx) {
      updatedLocked[qIdx] = true;
      setQuizLocked(prev => ({ ...prev, [qIdx]: true }));
      toast.success('Correct answer!');
    } else {
      updatedIncorrect[qIdx] = (incorrectAttempts[qIdx] || 0) + 1;
      setIncorrectAttempts(prev => ({ ...prev, [qIdx]: (prev[qIdx] || 0) + 1 }));
      toast.error('Incorrect. Try again!');
    }

    setQuizAnswers(prev => ({ ...prev, [qIdx]: optIdx }));

    // Save history immediately to backend
    if (episode) {
      LearningService.updateEpisodeProgress(episode.id, {
        completedItems: completedSteps,
        lastViewedItemId: steps[currentStepIndex],
        history: {
          quizAnswers: updatedAnswers,
          quizLocked: updatedLocked,
          incorrectAttempts: updatedIncorrect
        }
      }).catch(err => console.error("Failed to update progress history:", err));
    }
  };

  // Handle completion submission
  const handleComplete = async () => {
    if (!episode) return;
    setIsSubmitting(true);

    // Calculate accuracy (0 = worst, 3 = perfect for typical mobile check)
    // Map fraction of first-try correct questions to standard 0-3 scale
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
      // Mark all steps as complete in user progress
      await LearningService.updateEpisodeProgress(episode.id, {
        completedItems: steps,
        lastViewedItemId: steps[steps.length - 1],
        history: {
          quizAnswers,
          quizLocked,
          incorrectAttempts
        }
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

      if (onCompleted) {
        onCompleted(res.pointsEarned);
      }
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to submit episode completion.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] bg-white overflow-hidden flex flex-col animate-in fade-in duration-200">

      {/* Modal Container */}
      <div className="relative w-full h-full bg-white flex flex-col overflow-hidden">

        {/* Top Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-sm bg-purple-50 flex items-center justify-center text-purple-600 shrink-0">
              <BookOpen size={16} />
            </div>
            <div>
              <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">
                {episode?.description ? 'Activity Playback' : 'Interactive Lesson'}
              </p>
              <h3 className="font-semibold text-xs text-slate-800 leading-tight truncate max-w-[200px] sm:max-w-[400px]">
                {episode?.title || 'Loading Episode...'}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-650 hover:bg-slate-50 rounded-sm transition-all"
            title="Quit Player"
          >
            <X size={16} />
          </button>
        </div>

        {/* Loading and Main Split Body */}
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-2 p-6">
            <Loader2 className="animate-spin text-purple-600" size={32} />
            <span className="font-semibold text-xs text-slate-500 tracking-wide">Loading episode contents...</span>
          </div>
        ) : (
          <div className="flex-1 flex overflow-hidden">
            {/* Left Main Player Area */}
            <div className="flex-1 flex flex-col overflow-hidden bg-white">
              {/* Player Body Content */}
              <div className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar">

                {/* WIZARD SCREENS */}

                {/* ---------------- INTERACTIVE (TEEN) FLOW ---------------- */}

                {/* 1. HOOK SCREEN */}
                {currentStep === 'hook' && (
                  <div className="max-w-2xl mx-auto space-y-4 py-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
                    <div className="flex justify-center">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 bg-white border ${theme.border} rounded text-[9px] font-semibold tracking-wider ${theme.accent} uppercase shadow-sm`}>
                        <Sparkles size={10} /> The Story Begins
                      </span>
                    </div>
                    <h1 className="text-xs sm:text-sm font-semibold text-slate-800 text-center tracking-tight leading-tight">
                      Let's set the stage...
                    </h1>
                    {/* Hook Content Card */}
                    <div className={`p-4 bg-gradient-to-br from-white ${theme.toClass} border ${theme.border} rounded-lg shadow-sm relative overflow-hidden`}>
                      <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${theme.gradient} opacity-5 blur-xl rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none`} />
                      <p className="text-xs text-slate-700 font-medium leading-relaxed whitespace-pre-line select-none relative z-10">
                        {content.hook.text}
                      </p>
                    </div>
                  </div>
                )}

                {/* 2. STORY SCREEN */}
                {currentStep === 'story' && content.story?.pages && (
                  <div className="max-w-xl mx-auto space-y-4 py-2 animate-in fade-in duration-200 flex flex-col items-center">
                    <div className="text-center space-y-1">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-50 border border-purple-150 rounded text-[9px] font-semibold tracking-wider text-purple-605 uppercase shadow-sm mb-1">
                        <BookOpen size={10} /> Story Flipbook
                      </span>
                      <h2 className="text-xs sm:text-sm font-semibold text-slate-800 tracking-tight">Flip through the story cards</h2>
                      <p className="text-[10px] font-medium text-slate-400">Page {currentStoryPage + 1} of {content.story.pages.length}</p>
                    </div>

                    {/* Story Card Display */}
                    <div className={`w-full max-w-xs aspect-[3/4] ${theme.bg} rounded-lg overflow-hidden shadow-sm relative border border-slate-100 transition-all duration-200`}>
                      {content.story.pages[currentStoryPage] ? (
                        <img
                          src={content.story.pages[currentStoryPage]}
                          alt={`Story Page ${currentStoryPage + 1}`}
                          className="w-full h-full object-cover select-none"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 p-6 text-center bg-slate-50">
                          <BookOpen size={24} className="opacity-20 mb-2" />
                          <p className="text-xs font-semibold">Image URL not specified.</p>
                        </div>
                      )}

                      {/* Navigation inside Flipbook overlay */}
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-3 flex justify-between items-center">
                        <button
                          onClick={() => currentStoryPage > 0 && setCurrentStoryPage(p => p - 1)}
                          disabled={currentStoryPage === 0}
                          className={`p-1.5 rounded bg-white/90 backdrop-blur-sm shadow-sm transition-all ${currentStoryPage === 0 ? 'opacity-30 cursor-not-allowed' : 'hover:scale-105 active:scale-95'
                            }`}
                        >
                          <ChevronLeft size={14} className="text-slate-700" />
                        </button>

                        <div className="flex gap-1">
                          {content.story.pages.map((_, i) => (
                            <div
                              key={i}
                              className={`h-1 rounded transition-all duration-200 ${i === currentStoryPage ? 'w-4 bg-white' : 'w-1 bg-white/50'
                                }`}
                            />
                          ))}
                        </div>

                        <button
                          onClick={() => currentStoryPage < content.story.pages.length - 1 && setCurrentStoryPage(p => p + 1)}
                          disabled={currentStoryPage === content.story.pages.length - 1}
                          className={`p-1.5 rounded bg-white/90 backdrop-blur-sm shadow-sm transition-all ${currentStoryPage === content.story.pages.length - 1 ? 'opacity-30 cursor-not-allowed' : 'hover:scale-105 active:scale-95'
                            }`}
                        >
                          <ChevronRight size={14} className="text-slate-700" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. QUIZ SCREEN */}
                {currentStep === 'quiz' && content.quiz?.questions && (
                  <div className="max-w-2xl mx-auto space-y-4 py-2 animate-in fade-in duration-200">
                    <div className="text-center">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 border border-emerald-150 rounded text-[9px] font-semibold tracking-wider text-emerald-605 uppercase shadow-sm">
                        <HelpCircle size={10} /> Knowledge Check
                      </span>
                      <h2 className="text-xs sm:text-sm font-semibold text-slate-800 tracking-tight mt-1.5">Interactive Quiz</h2>
                      <p className="text-[10px] font-medium text-slate-400 mt-0.5">Answer all questions correctly to test your understanding</p>
                    </div>

                    <div className="space-y-4 mt-4">
                      {content.quiz.questions.map((q, qIdx) => {
                        const isCorrect = quizLocked[qIdx] && quizAnswers[qIdx] === q.correctIndex;
                        const hasSelected = quizAnswers[qIdx] !== undefined;
                        const hasIncorrectAttempts = incorrectAttempts[qIdx] > 0;

                        return (
                          <div key={qIdx} className={`p-4 bg-white border ${isCorrect ? 'border-emerald-150 bg-emerald-50/20' : 'border-slate-100'} rounded-lg transition-all shadow-sm duration-200 space-y-3`}>
                            <div className="flex items-start gap-2.5">
                              <span className={`w-6 h-6 rounded flex items-center justify-center shrink-0 text-[10px] font-semibold uppercase ${isCorrect ? 'bg-emerald-100 text-emerald-600' : 'bg-purple-100 text-purple-600'
                                }`}>
                                Q{qIdx + 1}
                              </span>
                              <h4 className="text-xs sm:text-sm font-semibold text-slate-800 leading-tight">
                                {q.question}
                              </h4>
                            </div>

                            <div className="grid grid-cols-1 gap-2 pt-1">
                              {q.options.map((opt, optIndex) => {
                                const isSelected = quizAnswers[qIdx] === optIndex;
                                const isOptionCorrect = optIndex === q.correctIndex;
                                const isOptionWrong = isSelected && !isOptionCorrect;

                                let btnClass = 'border-slate-150 bg-white hover:border-purple-200 hover:bg-purple-50/5 text-slate-700';
                                if (quizLocked[qIdx]) {
                                  if (isOptionCorrect) {
                                    btnClass = 'border-emerald-400 bg-emerald-50 text-emerald-800 shadow-sm';
                                  } else if (isSelected) {
                                    btnClass = 'border-rose-200 bg-rose-50/50 text-rose-800 opacity-60';
                                  } else {
                                    btnClass = 'border-slate-100 bg-white opacity-40';
                                  }
                                } else if (isSelected) {
                                  if (isOptionWrong) {
                                    btnClass = 'border-rose-450 bg-rose-50/30 text-rose-800 ring-1 ring-rose-100';
                                  }
                                }

                                return (
                                  <button
                                    key={optIndex}
                                    onClick={() => handleQuizSelect(qIdx, optIndex, q.correctIndex)}
                                    disabled={quizLocked[qIdx]}
                                    className={`w-full flex items-center gap-2 p-3 rounded-lg border font-semibold text-left text-xs transition-all ${btnClass}`}
                                  >
                                    <div className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-semibold border uppercase shrink-0 ${isSelected
                                      ? 'bg-current text-white border-transparent'
                                      : 'bg-slate-50 border-slate-200 text-slate-400'
                                      }`}>
                                      {String.fromCharCode(65 + optIndex)}
                                    </div>
                                    <span className="flex-1 leading-tight">{opt}</span>
                                    {quizLocked[qIdx] && isOptionCorrect && <CheckCircle2 size={12} className="text-emerald-600 shrink-0" />}
                                  </button>
                                );
                              })}
                            </div>

                            {/* Quiz Explanation Card */}
                            {quizLocked[qIdx] && q.explanation && (
                              <div className="p-3 bg-emerald-50/50 border border-emerald-100 rounded-lg flex gap-2 text-emerald-800 text-[11px] font-medium animate-in slide-in-from-top-1 duration-200">
                                <Info size={14} className="shrink-0 text-emerald-600" />
                                <p className="leading-relaxed">{q.explanation}</p>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 4. JOURNAL SCREEN */}
                {currentStep === 'journal' && (
                  <div className="max-w-2xl mx-auto space-y-4 py-2 animate-in fade-in duration-200">
                    <div className="text-center">
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-rose-50 border border-rose-150 rounded text-[9px] font-semibold tracking-wider text-rose-605 uppercase shadow-sm">
                        <PenTool size={10} /> Self-Reflection
                      </span>
                      <h2 className="text-xs sm:text-sm font-semibold text-slate-800 tracking-tight mt-1.5">Write in your Learning Journal</h2>
                      <p className="text-[10px] font-medium text-slate-405 mt-0.5">Reflect on what you've read to lock in your learnings</p>
                    </div>

                    <div className="bg-rose-50/20 border border-rose-100 rounded-lg p-4 space-y-3">
                      <div className="space-y-1">
                        <h4 className="text-xs font-semibold text-rose-500 uppercase tracking-widest">Journal Prompt</h4>
                        <p className="text-xs font-semibold text-slate-850 leading-tight">
                          {content.journal.prompt}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <textarea
                          value={reflectionText}
                          onChange={(e) => setReflectionText(e.target.value)}
                          placeholder="Type your reflection here (minimum 20 characters)..."
                          className="w-full p-4 bg-white border border-slate-205 rounded-lg text-xs font-medium text-slate-755 placeholder:text-slate-300 min-h-[120px] outline-none focus:border-rose-300 focus:ring-1 focus:ring-rose-300/10 transition-all shadow-sm"
                        />
                        <div className="flex justify-between items-center text-[10px] font-semibold">
                          <span className={reflectionText.trim().length >= 20 ? 'text-emerald-600' : 'text-slate-450'}>
                            Characters: {reflectionText.length} / 20 min
                          </span>

                          <div className="flex gap-1.5">
                            <button
                              type="button"
                              onClick={() => setReflectionMode('private')}
                              className={`px-2 py-0.5 rounded border text-[9px] font-semibold uppercase tracking-wider transition-all ${reflectionMode === 'private'
                                ? 'bg-slate-900 border-slate-900 text-white shadow-sm'
                                : 'border-slate-100 text-slate-400 hover:border-slate-200'
                                }`}
                            >
                              Private
                            </button>
                            <button
                              type="button"
                              onClick={() => setReflectionMode('community')}
                              className={`px-2 py-0.5 rounded border text-[9px] font-semibold uppercase tracking-wider transition-all ${reflectionMode === 'community'
                                ? 'bg-slate-900 border-slate-900 text-white shadow-sm'
                                : 'border-slate-100 text-slate-400 hover:border-slate-200'
                                }`}
                            >
                              Community
                            </button>
                          </div>
                        </div>
                        <p className="text-[9px] text-slate-400 leading-normal mt-1 font-medium">
                          {reflectionMode === 'private'
                            ? '🔒 Private: Only you can view this journal entry in your dashboard.'
                            : '👥 Community: Anonymous peer reflection shared in Gigis Circle feed.'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* 5. SUMMARY SCREEN */}
                {currentStep === 'summary' && (
                  <div className="max-w-xl mx-auto space-y-4 py-2 animate-in fade-in duration-200 text-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-lg flex items-center justify-center mx-auto text-white shadow-sm">
                      <Trophy size={24} className="fill-white/10" />
                    </div>
                    <div className="space-y-1">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-yellow-50 border border-yellow-250 rounded text-[9px] font-semibold tracking-wider text-amber-600 uppercase shadow-sm">
                        <Star size={10} fill="currentColor" /> Activity Complete
                      </span>
                      <h1 className="text-xs sm:text-sm font-semibold text-slate-800 tracking-tight leading-tight mt-1">
                        Fantastic work!
                      </h1>
                      <p className="text-[10px] font-medium text-slate-400">You've completed all segments of this activity.</p>
                    </div>

                    <div className={`p-4 bg-gradient-to-br from-white ${theme.toClass} border ${theme.border} rounded-lg shadow-sm relative overflow-hidden max-w-md mx-auto`}>
                      <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${theme.gradient} opacity-5 blur-xl rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none`} />
                      <p className="text-xs text-slate-700 font-medium leading-relaxed relative z-10">
                        {content.summary.text}
                      </p>
                    </div>

                    <div className="flex flex-col items-center pt-2">
                      <button
                        onClick={handleComplete}
                        disabled={isSubmitting}
                        className="btn-primary py-2 px-4 rounded-lg flex items-center gap-1 transition-all font-semibold text-[11px] uppercase tracking-wider shadow-sm disabled:opacity-50"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="animate-spin" size={12} /> Submitting...
                          </>
                        ) : (
                          <>
                            Complete Episode <Trophy size={12} />
                          </>
                        )}
                      </button>
                      <p className="text-[9px] text-slate-400 mt-2 font-medium">
                        Earn +{episode?.points || 75} XP points for your profile status.
                      </p>
                    </div>
                  </div>
                )}


                {/* ---------------- PEER TRAINING (MENTOR) FLOW ---------------- */}

                {/* A. OVERVIEW / OBJECTIVES */}
                {currentStep === 'overview' && (
                  <div className="max-w-2xl mx-auto space-y-4 py-2 animate-in fade-in duration-200">
                    <div className="text-center">
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-purple-50 border border-purple-150 rounded text-[9px] font-semibold tracking-wider text-purple-605 uppercase shadow-sm">
                        <Bookmark size={10} /> Certification Module
                      </span>
                      <h2 className="text-xs sm:text-sm font-semibold text-slate-800 mt-1.5 tracking-tight">Overview & Objectives</h2>
                    </div>

                    {content.overview && (
                      <div className={`p-4 bg-gradient-to-br from-white ${theme.toClass} border ${theme.border} rounded-lg shadow-sm relative overflow-hidden`}>
                        <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${theme.gradient} opacity-5 blur-xl rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none`} />
                        <h4 className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest mb-1 relative z-10">Curriculum Overview</h4>
                        <p className="text-xs text-slate-650 font-medium leading-relaxed whitespace-pre-line relative z-10">
                          {content.overview}
                        </p>
                      </div>
                    )}

                    {content.objectives && content.objectives.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest pl-1">What you will learn:</h4>
                        <div className="grid grid-cols-1 gap-2">
                          {content.objectives.map((obj, idx) => (
                            <div key={idx} className="flex items-start gap-2 p-3 bg-white border border-slate-100 rounded-lg shadow-sm">
                              <span className="w-5 h-5 rounded bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-semibold">
                                ✓
                              </span>
                              <span className="text-xs font-medium text-slate-600 leading-normal">{obj}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* B. NON NEGOTIABLE WARNING */}
                {currentStep === 'non-negotiable' && content.nonNegotiable && (
                  <div className="max-w-xl mx-auto space-y-4 py-4 animate-in fade-in duration-200 text-center">
                    <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-lg flex items-center justify-center mx-auto shadow-sm">
                      <ShieldAlert size={24} />
                    </div>
                    <div className="space-y-1">
                      <span className="inline-flex items-center gap-1 bg-rose-50 border border-rose-200 rounded px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-rose-700 shadow-sm">
                        Non-Negotiable Policy
                      </span>
                      <h2 className="text-xs sm:text-sm font-semibold text-slate-800 tracking-tight">Crucial Mentor Guidelines</h2>
                    </div>
                    <div className="bg-rose-50/20 border border-dashed border-rose-200 rounded-lg p-5 text-left relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-20 h-20 bg-rose-100/10 blur-xl rounded-full translate-x-1/3 -translate-y-1/3 pointer-events-none" />
                      <p className="text-xs text-rose-950 font-medium leading-relaxed relative z-10 select-none">
                        {content.nonNegotiable}
                      </p>
                    </div>
                  </div>
                )}

                {/* C. MODULES SCREEN */}
                {currentStep === 'modules' && content.modules && (
                  <div className="max-w-3xl mx-auto space-y-4 py-2 animate-in fade-in duration-200">
                    <div className="text-center">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-50 border border-purple-150 rounded text-[9px] font-semibold tracking-wider text-purple-605 uppercase shadow-sm">
                        <BookOpen size={10} /> Training Modules
                      </span>
                      <h2 className="text-xs sm:text-sm font-semibold text-slate-800 tracking-tight mt-1.5">Study the learning modules below</h2>
                      <p className="text-[10px] font-medium text-slate-400 mt-0.5">Review the foundational concepts and methodologies</p>
                    </div>

                    <div className="grid grid-cols-1 gap-3 mt-4">
                      {content.modules.map((m, idx) => (
                        <div key={idx} className="p-4 bg-white border border-slate-100 hover:border-purple-200/55 rounded-lg shadow-sm transition-all duration-200 group">
                          <div className="flex items-start gap-3">
                            <span className="w-7 h-7 rounded bg-purple-100 text-purple-605 font-semibold text-xs flex items-center justify-center shrink-0">
                              {m.id}
                            </span>
                            <div className="space-y-1 flex-1 min-w-0">
                              <h4 className="text-xs font-semibold text-slate-800 leading-tight">
                                {m.title}
                              </h4>
                              <p className="text-xs font-medium text-slate-500 leading-relaxed select-text">
                                {m.detail}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* D. SAFE PROTOCOL SCREEN */}
                {currentStep === 'safe-protocol' && content.safeProtocol && (
                  <div className="max-w-3xl mx-auto space-y-4 py-2 animate-in fade-in duration-200">
                    <div className="text-center">
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-rose-50 border border-rose-150 rounded text-[9px] font-semibold tracking-wider text-rose-600 uppercase shadow-sm">
                        <ShieldAlert size={10} /> Safety Standards
                      </span>
                      <h2 className="text-xs sm:text-sm font-semibold text-slate-800 mt-1.5 tracking-tight">The SAFE Protocol</h2>
                      <p className="text-[10px] font-medium text-slate-400 mt-0.5">Four steps of critical crisis containment protocol</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      {content.safeProtocol.map((sp, idx) => (
                        <div key={idx} className="bg-white border border-slate-150 rounded-lg p-4 shadow-sm flex flex-col relative overflow-hidden">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[9px] font-semibold uppercase tracking-wider bg-rose-50 text-rose-600 border border-rose-100 self-start mb-2">
                            {sp.step}
                          </span>
                          <h4 className="text-xs font-semibold text-slate-800 leading-snug">{sp.action}</h4>
                          <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 mt-3 flex-1">
                            <span className="text-[8px] font-semibold text-slate-400 uppercase tracking-widest block mb-0.5">Example script:</span>
                            <p className="text-xs font-medium text-slate-500 leading-normal">
                              {sp.example}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* E. PRACTICE SCENARIO */}
                {currentStep === 'practice' && content.practice && (
                  <div className="max-w-2xl mx-auto space-y-4 py-2 animate-in fade-in duration-200">
                    <div className="text-center">
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-amber-50 border border-amber-150 rounded text-[9px] font-semibold tracking-wider text-amber-600 uppercase shadow-sm">
                        <HelpCircle size={10} /> Practical Case Study
                      </span>
                      <h2 className="text-xs sm:text-sm font-semibold text-slate-800 tracking-tight mt-1.5">{content.practice.title}</h2>
                      <p className="text-[10px] font-medium text-slate-400 mt-0.5">Review the case details below and contemplate the response layout</p>
                    </div>

                    <div className="p-4 md:p-5 bg-amber-50/20 border border-amber-200 rounded-lg space-y-3">
                      <h4 className="text-[10px] font-semibold text-amber-600 uppercase tracking-widest">User Message / Case Scenario</h4>
                      <p className="text-xs sm:text-sm font-semibold text-slate-800 leading-relaxed select-none">
                        "{content.practice.prompt}"
                      </p>
                    </div>
                    <div className={`p-4 ${theme.bg} border ${theme.border} rounded-lg flex gap-2.5 text-slate-650 text-xs font-medium`}>
                      <Info size={14} className={`${theme.accent} shrink-0`} />
                      <p>Think about validating their emotions first before offering boundaries or resources. Avoid rescue language.</p>
                    </div>
                  </div>
                )}

                {/* F. PEER REFLECTION EDITOR */}
                {currentStep === 'reflection' && (
                  <div className="max-w-2xl mx-auto space-y-4 py-2 animate-in fade-in duration-200">
                    <div className="text-center">
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-rose-50 border border-rose-150 rounded text-[9px] font-semibold tracking-wider text-rose-600 uppercase shadow-sm">
                        <PenTool size={10} /> Mentor Reflection
                      </span>
                      <h2 className="text-xs sm:text-sm font-semibold text-slate-800 tracking-tight mt-1.5">
                        {content.reflection?.title || content.activity?.title || 'Certification Reflection'}
                      </h2>
                      <p className="text-[10px] font-medium text-slate-400 mt-0.5">Submit your reflection write-up to complete this certification block</p>
                    </div>

                    <div className="bg-rose-50/20 border border-rose-100 rounded-lg p-4 space-y-4">
                      <div className="space-y-1">
                        <h4 className="text-[10px] font-semibold text-rose-500 uppercase tracking-widest">Question prompt</h4>
                        <p className="text-xs font-semibold text-slate-800 leading-snug select-text">
                          {content.reflection?.prompt || content.activity?.fields?.join(', ') || 'Write a brief summary of how you would apply this lesson.'}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <textarea
                          value={reflectionText}
                          onChange={(e) => setReflectionText(e.target.value)}
                          placeholder="Type your reflection here (minimum 30 characters)..."
                          className="w-full p-4 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700 placeholder:text-slate-300 min-h-[140px] outline-none focus:border-rose-350 focus:ring-1 focus:ring-rose-350/5 transition-all shadow-sm"
                        />
                        <div className="flex justify-between items-center text-[10px] font-semibold">
                          <span className={reflectionText.trim().length >= 30 ? 'text-emerald-600' : 'text-slate-400'}>
                            Characters: {reflectionText.length} / 30 min
                          </span>

                          <span className="px-2 py-0.5 bg-slate-100 text-slate-505 border border-slate-200 rounded text-[9px] font-semibold uppercase tracking-wider">
                            Private Submission
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* G. KNOWLEDGE CHECK (PEER LIST) */}
                {currentStep === 'knowledge-check' && content.check && (
                  <div className="max-w-2xl mx-auto space-y-4 py-2 animate-in fade-in duration-200">
                    <div className="text-center">
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-emerald-50 border border-emerald-150 rounded text-[9px] font-semibold tracking-wider text-emerald-600 uppercase shadow-sm">
                        <HelpCircle size={10} /> Core Summary Check
                      </span>
                      <h2 className="text-xs sm:text-sm font-semibold text-slate-800 tracking-tight mt-1.5">Self-Assessment Questionnaire</h2>
                      <p className="text-[10px] font-medium text-slate-405 mt-0.5">Read and answer these check-in prompts mentally to verify your mastery</p>
                    </div>

                    <div className="space-y-2.5 mt-4">
                      {content.check.map((item, idx) => (
                        <div key={idx} className="flex gap-3 p-4 bg-white border border-slate-100 rounded-lg items-start shadow-sm">
                          <span className="w-6 h-6 rounded bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5 text-xs font-semibold">
                            Q{idx + 1}
                          </span>
                          <p className="text-xs font-medium text-slate-700 leading-snug flex-1 select-text">
                            {item}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* H. PEER COMPLETE SCREEN */}
                {currentStep === 'complete' && (
                  <div className="max-w-2xl mx-auto space-y-4 py-2 animate-in fade-in duration-200 text-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-650 rounded-lg flex items-center justify-center mx-auto text-white shadow-sm">
                      <Trophy size={24} className="fill-white/10" />
                    </div>
                    <div className="space-y-1">
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-purple-50 border border-purple-250 rounded text-[9px] font-semibold tracking-wider text-purple-650 uppercase shadow-sm">
                        <Star size={10} fill="currentColor" /> Certification Segment Complete
                      </span>
                      <h1 className="text-xs sm:text-sm font-semibold text-slate-800 tracking-tight leading-tight mt-1">
                        Training Block Concluded!
                      </h1>
                    </div>

                    <div className={`p-4 bg-gradient-to-br from-white ${theme.toClass} border ${theme.border} rounded-lg shadow-sm max-w-md mx-auto`}>
                      <p className="text-xs text-slate-600 font-medium leading-relaxed">
                        You have reviewed all the training materials and submitted your reflection. Click below to save your progress.
                      </p>
                    </div>

                    <div className="flex flex-col items-center pt-2">
                      <button
                        onClick={handleComplete}
                        disabled={isSubmitting}
                        className="btn-primary py-2 px-4 rounded-lg flex items-center gap-1 transition-all font-semibold text-[11px] uppercase tracking-wider shadow-sm disabled:opacity-50"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="animate-spin" size={12} /> Submitting...
                          </>
                        ) : (
                          <>
                            Save & Complete Training <Trophy size={12} />
                          </>
                        )}
                      </button>
                      <p className="text-[9px] text-slate-400 mt-2 font-medium">
                        Your progress will be logged towards your mentor certification.
                      </p>
                    </div>
                  </div>
                )}

              </div>

              {/* Bottom Footer Controls */}
              <div className="px-4 py-3 border-t border-slate-100 bg-white flex items-center justify-between">

                {/* Back Button */}
                <button
                  onClick={handlePrev}
                  disabled={currentStepIndex === 0 && currentStoryPage === 0}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded border text-[10px] font-semibold uppercase tracking-wider transition-all ${currentStepIndex === 0 && currentStoryPage === 0
                    ? 'border-slate-100 text-slate-350 bg-slate-50/20 cursor-not-allowed'
                    : 'border-slate-205 text-slate-600 bg-white hover:bg-slate-50 hover:shadow-sm'
                    }`}
                >
                  <ChevronLeft size={14} /> Back
                </button>

                {/* Progress Steps Indicator */}
                <div className="hidden sm:flex gap-1">
                  {steps.map((s, idx) => (
                    <div
                      key={idx}
                      className={`h-1.5 rounded transition-all duration-300 ${idx === currentStepIndex
                        ? 'w-6 bg-purple-650'
                        : idx < currentStepIndex
                          ? 'w-1.5 bg-emerald-505'
                          : 'w-1.5 bg-slate-200'
                        }`}
                      title={`Step ${idx + 1}`}
                    />
                  ))}
                </div>

                {/* Next/Complete Button */}
                {currentStepIndex === steps.length - 1 ? (
                  <button
                    onClick={handleComplete}
                    disabled={isSubmitting || !canProceed()}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded text-[10px] font-semibold uppercase tracking-wider transition-all text-white bg-slate-900 shadow-sm ${!canProceed() || isSubmitting
                      ? 'opacity-40 cursor-not-allowed bg-slate-300 shadow-none'
                      : 'hover:scale-[1.01] hover:bg-purple-700'
                      }`}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="animate-spin" size={12} /> Saving
                      </>
                    ) : (
                      <>
                        Complete <Check size={12} />
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    onClick={handleNext}
                    disabled={!canProceed()}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded text-[10px] font-semibold uppercase tracking-wider transition-all text-white bg-purple-600 shadow-sm ${!canProceed()
                      ? 'opacity-40 cursor-not-allowed bg-slate-300 shadow-none'
                      : 'hover:scale-[1.01] hover:bg-purple-700'
                      }`}
                  >
                    Next <ChevronRight size={14} />
                  </button>
                )}
              </div>
            </div>

            {/* Right Sidebar - Curriculum Path */}
            <div className="hidden md:flex w-56 border-l border-slate-100 flex-col bg-slate-50/50 p-3 overflow-y-auto">
              <p className="text-[9px] font-medium uppercase tracking-[0.1em] text-slate-400 mb-4 px-1">Curriculum Path</p>
              <div className="space-y-1">
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
                      className={`w-full flex items-center gap-2.5 p-2 rounded-none transition-all group relative ${isCurrent
                        ? 'bg-purple-600 text-white shadow-sm'
                        : isUnlocked
                          ? 'hover:bg-slate-200 text-slate-600 hover:text-slate-900'
                          : 'opacity-50 cursor-not-allowed text-slate-400'
                        }`}
                    >
                      <div className={`w-6 h-6 rounded-none flex items-center justify-center transition-colors ${isCurrent ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-500'
                        }`}>
                        {isUnlocked ? <Icon size={12} /> : <Lock size={10} />}
                      </div>
                      <div className="flex-1 text-left min-w-0">
                        <p className={`text-[11px] font-normal truncate ${isCurrent ? 'text-white' : 'text-slate-700'}`}>
                          {meta.label}
                        </p>
                        <p className={`text-[9px] font-normal opacity-60 ${isCurrent ? 'text-white' : 'text-slate-400'}`}>
                          Step {idx + 1}
                        </p>
                      </div>
                      {isCompleted && !isCurrent && (
                        <CheckCircle2 size={12} className="text-emerald-500 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
