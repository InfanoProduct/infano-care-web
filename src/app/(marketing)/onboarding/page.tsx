  'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import Image from 'next/image';
import { useAuthStore } from '@/store/auth-store';
import { OnboardingService } from '@/services/onboarding.service';
import { hasActiveCourseEnrollment, ParentSpaceService } from '@/services/parent-space.service';
import {
  ArrowLeft, Shield, Check, Play, Lock, ChevronRight,
  Loader2, Bell, Heart, Sparkles, FileText, Download, CheckCircle2,
  ShieldCheck, HelpCircle, Eye, EyeOff
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { dashboardLearnersQueryKey } from '@/hooks/use-dashboard-data';

const AGES = ['9', '10', '11', '12', '13', '14', '15+'];
const PERIOD_STATUSES = ['Yes', 'Not yet', 'Not sure', 'Prefer not to say'];
const WORRIES = [
  'First period at school',
  'Cramps',
  'Body changes',
  'Friendships',
  'Moods',
  'Online safety'
];

const LEARNING_STYLES = [
  {
    id: 'side_by_side',
    title: 'Together · Side by side',
    sub: 'Watch and talk together. Recommended for younger girls.',
    rec: true
  },
  {
    id: 'she_learns_first',
    title: 'She learns first · You follow',
    sub: 'She explores on her own. You catch up with conversation cards.',
    rec: false
  },
  {
    id: 'independent',
    title: 'Independent · You check in',
    sub: 'She learns at her pace. You get weekly progress summaries.',
    rec: false
  }
];

const NUDGE_TIMES = ['5:30 PM', '6:30 PM', '7:30 PM', 'Weekends only'];

function OnboardingWizard() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, isAuthenticated, setAuth, setActiveProfile, setLearners } = useAuthStore();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Step 1: Consent
  const parentName = user?.profile?.displayName || 'Priya';
  const [consentGuardian, setConsentGuardian] = useState(false);
  const [consentChildData, setConsentChildData] = useState(false);
  const [consentAnalytics, setConsentAnalytics] = useState(false);

  // Step 2: Daughter profile
  const [daughterName, setDaughterName] = useState('Aanya');
  const [daughterAge, setDaughterAge] = useState('11');
  const [periodStatus, setPeriodStatus] = useState<string | null>(null);
  const [selectedWorries, setSelectedWorries] = useState<string[]>([]);
  const [sisterName, setSisterName] = useState('');
  const [showAddSister, setShowAddSister] = useState(false);

  // Step 3: Parent space
  const [parentPin, setParentPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const pinInputRef = useRef<HTMLInputElement>(null);
  const [learningStyle, setLearningStyle] = useState('side_by_side');
  const [weeklySummary, setWeeklySummary] = useState(true);
  const [lessonNudge, setLessonNudge] = useState(true);
  const [nudgeTime, setNudgeTime] = useState('6:30 PM');

  // Auto-focus PIN input when navigating to step 3
  useEffect(() => {
    if (step === 3) {
      const timer = setTimeout(() => {
        pinInputRef.current?.focus();
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [step]);

  // Load existing data from backend and resume exact step (once per session mount)
  const statusFetchedRef = useRef(false);
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (statusFetchedRef.current) {
      setLoadingStatus(false);
      return;
    }
    statusFetchedRef.current = true;

    let isMounted = true;

    const fetchStatusAndResume = async () => {
      let ordersSummary;
      try {
        ordersSummary = await ParentSpaceService.getOrdersSummary();
      } catch {
        if (isMounted) {
          toast.error('We couldn’t verify course access. Please continue from your dashboard.');
          router.replace('/dashboard');
        }
        return;
      }

      if (!hasActiveCourseEnrollment(ordersSummary)) {
        router.replace('/dashboard');
        return;
      }

      try {
        const res = await OnboardingService.getStatus();
        if (!isMounted) return;

        // If user is already fully onboarded, navigate to profile picker
        if (res.isOnboardingCompleted) {
          router.push('/dashboard/picker');
          return;
        }

        // Resume step from backend (1, 2, 3, or 4)
        if (res.onboardingStep >= 1 && res.onboardingStep <= 4) {
          setStep(res.onboardingStep as 1 | 2 | 3 | 4);
        }

        // Populate previously saved consent
        if (res.parentConsent) {
          setConsentGuardian(true);
          setConsentChildData(true);
        }

        // Populate previously saved daughter profile
        if (res.learners && res.learners.length > 0) {
          const first = res.learners[0];
          if (first.name) setDaughterName(first.name);
          if (first.age) setDaughterAge(first.age);
          if (first.periodStatus) setPeriodStatus(first.periodStatus);
          if (first.worries && first.worries.length > 0) setSelectedWorries(first.worries);
          setLearners(res.learners);
          queryClient.setQueryData(dashboardLearnersQueryKey(user?.id), res.learners);
        }

        // Populate previously saved parent preferences
        if (res.learningStyle) setLearningStyle(res.learningStyle);
        if (typeof res.whatsappWeeklySummary === 'boolean') setWeeklySummary(res.whatsappWeeklySummary);
        if (typeof res.whatsappLessonNudge === 'boolean') setLessonNudge(res.whatsappLessonNudge);
        if (res.whatsappNudgeTime) setNudgeTime(res.whatsappNudgeTime);
      } catch {
        // Fallback to local auth store if backend status check encounters network issue
        const latestUser = useAuthStore.getState().user;
        if (latestUser?.onboardingStep && latestUser.onboardingStep >= 1 && latestUser.onboardingStep <= 4) {
          setStep(latestUser.onboardingStep as 1 | 2 | 3 | 4);
        }
        if (latestUser?.learners && latestUser.learners.length > 0) {
          const first = latestUser.learners[0];
          if (first.name) setDaughterName(first.name);
          if (first.age) setDaughterAge(first.age);
          if (first.periodStatus) setPeriodStatus(first.periodStatus);
          if (first.worries) setSelectedWorries(first.worries);
        }
      } finally {
        if (isMounted) setLoadingStatus(false);
      }
    };

    fetchStatusAndResume();

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, user?.id, router, setLearners, queryClient]);

  const toggleWorry = (item: string) => {
    setSelectedWorries((prev) =>
      prev.includes(item) ? prev.filter((w) => w !== item) : [...prev, item]
    );
  };

  // Step 1 Submit: Save Consent
  const handleConsentSubmit = async () => {
    if (!consentGuardian || !consentChildData) return;
    setSubmitting(true);
    try {
      await OnboardingService.saveParentConsent({
        consentGuardian,
        consentChildData,
        consentAnalytics,
        parentName
      });
      // Update local auth store so it remains synchronized
      if (user) {
        setAuth(
          useAuthStore.getState().accessToken || '',
          useAuthStore.getState().refreshToken || '',
          {
            ...user,
            onboardingStep: 2,
            parentConsent: true
          }
        );
      }
      setStep(2);
    } catch (err: any) {
      toast.error(err.message || 'Failed to save consent.');
    } finally {
      setSubmitting(false);
    }
  };

  // Step 2 Submit: Save Daughter Profile
  const handleDaughterSubmit = async () => {
    if (!daughterName.trim()) {
      toast.error("Please enter your daughter's name.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await OnboardingService.saveDaughterProfile({
        name: daughterName.trim(),
        age: daughterAge,
        periodStatus: periodStatus || undefined,
        worries: selectedWorries
      });

      const updatedLearners = res.learner ? [res.learner] : user?.learners || [];
      if (res.learner) {
        queryClient.setQueryData(dashboardLearnersQueryKey(user?.id), updatedLearners);
        setLearners(updatedLearners);
      }

      // If sister added as well
      if (showAddSister && sisterName.trim()) {
        try {
          const sisterRes = await OnboardingService.addLearner({
            name: sisterName.trim(),
            age: '11',
            worries: []
          });
          if (sisterRes.learner) {
            updatedLearners.push(sisterRes.learner);
            queryClient.setQueryData(dashboardLearnersQueryKey(user?.id), [...updatedLearners]);
            setLearners([...updatedLearners]);
          }
        } catch {
          // non-blocking
        }
      }

      // Update local auth store
      if (user) {
        setAuth(
          useAuthStore.getState().accessToken || '',
          useAuthStore.getState().refreshToken || '',
          {
            ...user,
            onboardingStep: 3,
            learners: updatedLearners
          }
        );
      }

      setStep(3);
    } catch (err: any) {
      toast.error(err.message || 'Failed to save her profile.');
    } finally {
      setSubmitting(false);
    }
  };

  // Step 3 Submit: Save Parent Space
  const handleParentSpaceSubmit = async () => {
    if (parentPin.length !== 4) {
      toast.error('Please enter a 4-digit PIN.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await OnboardingService.saveParentSpace({
        parentPin,
        learningStyle,
        whatsappWeeklySummary: weeklySummary,
        whatsappLessonNudge: lessonNudge,
        whatsappNudgeTime: nudgeTime
      });

      if (res.user) {
        setAuth(
          useAuthStore.getState().accessToken || '',
          useAuthStore.getState().refreshToken || '',
          {
            ...user!,
            onboardingStep: 4,
            onboardingCompletedAt: new Date().toISOString(),
            isOnboardingCompleted: true,
            hasParentPin: true,
            learningStyle,
            learners: res.user?.learners || user?.learners || []
          }
        );
      }

      setStep(4);
    } catch (err: any) {
      toast.error(err.message || 'Failed to finalize parent space.');
    } finally {
      setSubmitting(false);
    }
  };

  // Finish: Pass the phone
  const handleGoToDaughterGarden = () => {
    if (user?.learners && user.learners.length > 0) {
      setActiveProfile({ type: 'DAUGHTER', learner: user.learners[0] });
    }
    router.push('/dashboard');
  };

  const handleGoToParentSpace = () => {
    setActiveProfile({ type: 'PARENT' });
    router.push('/dashboard/parent');
  };

  const stepTitles = ['Welcome & Consent', 'Her Profile', 'Your Parent Space'];

  if (loadingStatus) {
    return (
      <div className="min-h-screen bg-[#FFFAF6] text-[#3D2C4A] font-['Noto_Sans',system-ui,sans-serif] flex justify-center items-center py-12 px-4">
        <div className="flex flex-col items-center gap-3.5">
          <Image
            src="/logo/infano-logo-for-light-bg.png"
            alt="Infano"
            width={120}
            height={36}
            className="h-9 w-auto object-contain opacity-90"
          />
          <div className="flex items-center gap-2 text-sm font-semibold text-[#6E5B7A]">
            <Loader2 size={18} className="animate-spin text-[#C2456A]" />
            <span>Resuming your onboarding...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFAF6] text-[#3D2C4A] font-['Noto_Sans',system-ui,sans-serif] flex justify-center items-center py-4 sm:py-8 md:py-12 px-3 sm:px-6 relative overflow-hidden">
      {/* Background ambient gradient glow for desktop */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-[#F9D5D3]/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-[#E3DAF5]/20 rounded-full blur-3xl pointer-events-none" />

      <div
        className={`w-full transition-all duration-300 z-10 ${
          step === 4
            ? 'max-w-[440px] md:max-w-[880px]'
            : 'max-w-[440px] md:max-w-[900px] lg:max-w-[1040px] bg-white rounded-[32px] md:rounded-[40px] border border-[#F1E4E8] shadow-xl md:shadow-2xl overflow-hidden flex flex-col p-5 sm:p-8 md:p-10'
        }`}
      >
        {/* Top Navigation Row (Steps 1, 2, 3) */}
        {step < 4 && (
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#F1E4E8]/60">
            <button
              type="button"
              onClick={() => setStep((s) => (s > 1 ? ((s - 1) as any) : s))}
              disabled={step === 1}
              className="w-10 h-10 rounded-full border border-[#F1E4E8] bg-white flex items-center justify-center text-[#3D2C4A] disabled:opacity-0 hover:bg-[#FFFAF6] transition-all cursor-pointer shadow-2xs"
            >
              <ArrowLeft size={18} />
            </button>

            {/* Perfect Circular Step Indicators with Labels */}
            <div className="flex items-center gap-2 sm:gap-3 md:gap-4" aria-label={`Step ${step} of 3`}>
              {[1, 2, 3].map((s) => {
                const isDone = s < step;
                const isCur = s === step;
                return (
                  <div key={s} className="flex items-center gap-2">
                    <div
                      className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm shrink-0 transition-all duration-300 ${
                        isDone
                          ? 'bg-[#2F7F62] text-white shadow-xs'
                          : isCur
                          ? 'bg-[#C2456A] text-white shadow-sm ring-4 ring-[#C2456A]/15 scale-105'
                          : 'bg-white border-2 border-[#E9DDE6] text-[#8A7896]'
                      }`}
                    >
                      {isDone ? <Check size={14} className="stroke-[3]" /> : s}
                    </div>
                    <span
                      className={`hidden md:inline text-xs sm:text-sm font-bold transition-colors ${
                        isCur
                          ? 'text-[#C2456A]'
                          : isDone
                          ? 'text-[#3D2C4A]'
                          : 'text-[#8A7896]'
                      }`}
                    >
                      {stepTitles[s - 1]}
                    </span>
                    {s < 3 && (
                      <span className="hidden md:inline text-[#D9C3CF] text-xs font-semibold mx-1">
                        ›
                      </span>
                    )}
                  </div>
                );
              })}
              <span className="md:hidden text-xs font-bold text-[#6E5B7A] ml-1">
                Step {step} of 3
              </span>
            </div>

            {/* Real Infano Logo */}
            <Link
              href="/"
              className="relative h-8 sm:h-9 w-28 sm:w-36 block shrink-0 hover:opacity-90 transition-opacity"
            >
              <Image
                src="/logo/infano-logo-for-light-bg.png"
                alt="Infano"
                fill
                sizes="(max-width: 640px) 112px, 144px"
                className="object-contain object-right"
                priority
              />
            </Link>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════
            STEP 1: Welcome & Consent (Responsive Desktop 2-Column)
        ══════════════════════════════════════════════════════════════════════ */}
        {step === 1 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 items-start">
            {/* Left Column: Greeting, Video & Medical Credentials */}
            <div className="flex flex-col gap-4">
              <div>
                <div className="font-bold italic text-lg sm:text-xl text-[#A8365A]">
                  Hi {parentName},
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold leading-tight text-[#3D2C4A] m-0 mt-0.5">
                  Thank you for starting this journey with her.
                </h1>
              </div>

              {/* Video preview card */}
              <div className="bg-white border border-[#F1E4E8] rounded-2xl overflow-hidden shadow-sm">
                <div className="relative aspect-video bg-[#D8ECF8] flex items-center justify-center">
                  <svg width="100" height="100" viewBox="0 0 104 104" aria-hidden="true">
                    <path d="M52 4c26 0 48 18 48 46s-20 50-48 50S4 80 4 52 26 4 52 4z" fill="#FFFFFF" />
                    <circle cx="34" cy="38" r="10" fill="#3D2C4A" />
                    <circle cx="70" cy="38" r="10" fill="#3D2C4A" />
                    <circle cx="52" cy="30" r="12" fill="#3D2C4A" />
                    <circle cx="52" cy="46" r="17" fill="#B9785A" />
                    <path d="M22 96c4-18 16-26 30-26s26 8 30 26z" fill="#E8738A" />
                  </svg>
                  <button
                    type="button"
                    aria-label="Play welcome video"
                    onClick={() => toast.success('Playing 0:40 welcome message for parents...')}
                    className="absolute right-4 bottom-4 w-12 h-12 rounded-full bg-[#C2456A] text-white flex items-center justify-center hover:bg-[#A8365A] transition-transform hover:scale-105 cursor-pointer shadow-md"
                  >
                    <Play size={20} className="fill-white ml-0.5" />
                  </button>
                  <span className="absolute left-3.5 top-3.5 bg-white/95 rounded-full px-3 py-1 text-xs font-bold text-[#3D2C4A] shadow-xs">
                    0:40 · A hello for parents
                  </span>
                </div>
                <div className="p-4 text-xs sm:text-sm">
                  <strong className="text-[#3D2C4A] text-sm">Riya Kapoor</strong>{' '}
                  <span className="text-[#6E5B7A]">· Adolescent Health Educator</span>
                  <p className="text-xs text-[#5E4B6B] mt-0.5 m-0 leading-relaxed">
                    How to make the most of HerNext as a family.
                  </p>
                </div>
              </div>

              {/* Trust signals */}
              <div className="hidden md:flex flex-col gap-2 bg-[#FFFAF6] p-4 rounded-2xl border border-[#F1E4E8]">
                <div className="flex items-center gap-2 text-xs font-bold text-[#24735A]">
                  <ShieldCheck size={16} />
                  <span>Curated with leading pediatricians & gynaecologists</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-[#5A4385]">
                  <Sparkles size={16} />
                  <span>100% ad-free, age-appropriate, private learning space</span>
                </div>
              </div>
            </div>

            {/* Right Column: Consent Card & CTA */}
            <div className="flex flex-col gap-4">
              <section aria-labelledby="consent-h" className="bg-[#EAF7F1] rounded-3xl p-5 sm:p-6 flex flex-col gap-3.5 shadow-sm">
                <h2 id="consent-h" className="text-base sm:text-lg font-bold text-[#24533F] flex items-center gap-2 m-0">
                  <Shield size={20} className="text-[#2F7F62]" />
                  <span>Your consent, for her safety</span>
                </h2>

                <label className="flex gap-3.5 items-start bg-white rounded-2xl p-3.5 sm:p-4 text-xs sm:text-sm text-[#3D2C4A] cursor-pointer shadow-2xs hover:border-[#2F7F62]/40 border border-transparent transition-colors">
                  <input
                    type="checkbox"
                    checked={consentGuardian}
                    onChange={(e) => setConsentGuardian(e.target.checked)}
                    className="w-5 h-5 rounded accent-[#2F7F62] shrink-0 mt-0.5 cursor-pointer"
                  />
                  <span>
                    I am the parent or legal guardian of the child who will use this course, and I am 18 or older.{' '}
                    <strong className="text-[#A8365A] block sm:inline font-bold">Required</strong>
                  </span>
                </label>

                <label className="flex gap-3.5 items-start bg-white rounded-2xl p-3.5 sm:p-4 text-xs sm:text-sm text-[#3D2C4A] cursor-pointer shadow-2xs hover:border-[#2F7F62]/40 border border-transparent transition-colors">
                  <input
                    type="checkbox"
                    checked={consentChildData}
                    onChange={(e) => setConsentChildData(e.target.checked)}
                    className="w-5 h-5 rounded accent-[#2F7F62] shrink-0 mt-0.5 cursor-pointer"
                  />
                  <span>
                    I consent to Infano using my child's first name, age, learning activity and any optional health details I share, only to run this course and show her progress to me.{' '}
                    <strong className="text-[#A8365A] block sm:inline font-bold">Required</strong>
                  </span>
                </label>

                <label className="flex gap-3.5 items-start bg-white rounded-2xl p-3.5 sm:p-4 text-xs sm:text-sm text-[#3D2C4A] cursor-pointer shadow-2xs hover:border-[#2F7F62]/40 border border-transparent transition-colors">
                  <input
                    type="checkbox"
                    checked={consentAnalytics}
                    onChange={(e) => setConsentAnalytics(e.target.checked)}
                    className="w-5 h-5 rounded accent-[#2F7F62] shrink-0 mt-0.5 cursor-pointer"
                  />
                  <span>
                    Use anonymised, combined quiz results to improve the course. I can turn this off anytime.{' '}
                    <span className="text-[#6E5B7A] font-bold">Optional</span>
                  </span>
                </label>

                <p className="text-xs text-[#24533F] leading-relaxed m-0 pt-1">
                  We never sell data, show ads, or track her on other sites. Her journal stays private to her. You can view, download or delete her data anytime in Parent space settings.
                </p>
              </section>

              {/* Continue Button */}
              <div className="pt-2 flex flex-col gap-2">
                <button
                  type="button"
                  disabled={!consentGuardian || !consentChildData || submitting}
                  onClick={handleConsentSubmit}
                  className="w-full min-h-[56px] rounded-full bg-[#C2456A] hover:bg-[#A8365A] active:scale-[0.99] text-white font-bold text-base sm:text-lg flex items-center justify-center gap-2 cursor-pointer transition-all disabled:bg-[#EADDE4] disabled:text-[#6E5B7A] disabled:cursor-not-allowed shadow-md"
                >
                  {submitting ? <Loader2 size={20} className="animate-spin" /> : 'Continue'}
                </button>
                {(!consentGuardian || !consentChildData) && (
                  <div className="text-center text-xs font-semibold text-[#6E5B7A]">
                    Tick the two required boxes to continue
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════
            STEP 2: Add Her Profile (Responsive Desktop 12-Col Layout)
        ══════════════════════════════════════════════════════════════════════ */}
        {step === 2 && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-10 items-start">
            {/* Left Column: Live Interactive Garden Preview (5 cols) */}
            <div className="md:col-span-5 flex flex-col gap-4">
              <div className="relative bg-[#D4EFE4] rounded-3xl p-5 pb-3 overflow-hidden shadow-sm flex flex-col justify-between min-h-[260px] md:min-h-[360px]">
                <div>
                  <div className="text-[11px] font-extrabold tracking-wider text-[#24533F] uppercase">
                    LIVE GARDEN PREVIEW
                  </div>
                  <div className="font-extrabold text-2xl text-[#3D2C4A] font-['Baloo_2',sans-serif] mt-0.5">
                    {daughterName.trim() ? `${daughterName.trim()}'s Garden` : "Her Garden"}
                  </div>
                  <div className="text-xs font-semibold text-[#24533F] mt-0.5">
                    Age {daughterAge} · {periodStatus || 'Exploring body changes'}
                  </div>
                </div>

                {/* Gigi smiling illustration in preview */}
                <svg
                  width="80"
                  height="96"
                  viewBox="0 0 120 140"
                  aria-hidden="true"
                  className="absolute right-3 top-3 md:w-[90px] md:h-[110px]"
                >
                  <circle cx="60" cy="50" r="33" fill="#3D2C4A" />
                  <circle cx="60" cy="56" r="25" fill="#D9A07E" />
                  <path d="M35 49 C 40 30, 80 30, 85 49 C 76 41, 46 41, 35 49z" fill="#3D2C4A" />
                  <circle cx="51" cy="58" r="3" fill="#3D2C4A" />
                  <circle cx="69" cy="58" r="3" fill="#3D2C4A" />
                  <circle cx="45" cy="66" r="4" fill="#F08FA6" opacity="0.6" />
                  <circle cx="75" cy="66" r="4" fill="#F08FA6" opacity="0.6" />
                  <path d="M53 68 Q60 75 67 68" stroke="#3D2C4A" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                  <path d="M30 140 C 32 98, 46 86, 60 86 C 74 86, 88 98, 90 140z" fill="#E3DAF5" />
                </svg>

                {/* Rolling Green Hills & Sprout */}
                <svg viewBox="0 0 360 110" width="100%" height="96" aria-hidden="true" className="block mt-auto">
                  <path d="M0 60 C 80 44, 160 74, 240 56 S 330 48, 360 56 V110 H0z" fill="#A8D8BE" />
                  <g transform="translate(60 55)">
                    <path d="M0 16 V0" stroke="#5FA27F" strokeWidth="3" />
                    <path d="M0 0 C -8 -4, -10 -10, -6 -14 C -2 -10, 0 -6, 0 0z" fill="#7FB89A" />
                    <path d="M0 0 C 8 -4, 10 -10, 6 -14 C 2 -10, 0 -6, 0 0z" fill="#7FB89A" />
                  </g>
                  <g transform="translate(140 66)"><ellipse rx="8" ry="3.5" fill="#8FC7A8" /></g>
                  <g transform="translate(210 62)"><ellipse rx="8" ry="3.5" fill="#8FC7A8" /></g>
                  <g transform="translate(280 64)"><ellipse rx="8" ry="3.5" fill="#8FC7A8" /></g>
                </svg>
              </div>

              <div className="hidden md:block p-4 rounded-2xl bg-[#FFFAF6] border border-[#F1E4E8] text-xs text-[#5E4B6B] leading-relaxed">
                <strong className="block text-[#3D2C4A] font-bold mb-1">Personalized with care:</strong>
                Gigi will address her by name and tailor video chapters, interactive quizzes, and care kit tips to her age bracket.
              </div>
            </div>

            {/* Right Column: Setup Form (7 cols) */}
            <div className="md:col-span-7 flex flex-col gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold leading-tight text-[#3D2C4A] m-0">
                  Tell us a little about her
                </h1>
                <p className="text-xs sm:text-sm text-[#5E4B6B] mt-1 m-0">
                  A few quick details so her learning experience feels just right.
                </p>
              </div>

              {/* Field: First name */}
              <label className="flex flex-col gap-1.5 text-sm font-bold text-[#3D2C4A]">
                Her first name or nickname
                <input
                  type="text"
                  value={daughterName}
                  onChange={(e) => setDaughterName(e.target.value)}
                  placeholder="e.g. Aanya"
                  className="min-h-[52px] rounded-2xl border-[1.5px] border-[#E9DDE6] px-4 text-base font-bold text-[#3D2C4A] focus:outline-none focus:border-[#C2456A] transition-colors shadow-2xs"
                />
              </label>

              {/* Field: Age Pills */}
              <fieldset className="border-none p-0 m-0 flex flex-col gap-2">
                <legend className="text-sm font-bold text-[#3D2C4A]">How old is she?</legend>
                <div className="grid grid-cols-7 gap-1.5">
                  {AGES.map((a) => (
                    <button
                      key={a}
                      type="button"
                      onClick={() => setDaughterAge(a)}
                      className={`min-h-[46px] rounded-xl font-bold text-sm transition-all cursor-pointer ${
                        daughterAge === a
                          ? 'bg-[#3D2C4A] text-white border-2 border-[#3D2C4A] shadow-xs scale-102'
                          : 'bg-white text-[#3D2C4A] border-[1.5px] border-[#E9DDE6] hover:border-[#C2456A]/50'
                      }`}
                    >
                      {a}
                    </button>
                  ))}
                </div>
              </fieldset>

              {/* Field: Period Status */}
              <fieldset className="border border-[#F1E4E8] bg-white rounded-2xl p-4 m-0 flex flex-col gap-2.5">
                <legend className="text-sm font-bold text-[#3D2C4A] px-2">Has she started her periods?</legend>
                <div className="text-xs text-[#6E5B7A] font-semibold flex items-center gap-1.5 -mt-1">
                  <Lock size={13} />
                  <span>Optional and private. Used only to personalise tips and pacing.</span>
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  {PERIOD_STATUSES.map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPeriodStatus(periodStatus === p ? null : p)}
                      className={`min-h-[42px] px-4 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                        periodStatus === p
                          ? 'bg-[#E3DAF5] text-[#3D2C4A] border-2 border-[#A992D6] font-bold shadow-xs'
                          : 'bg-[#FFFAF6] text-[#3D2C4A] border border-[#E9DDE6] hover:border-[#A992D6]'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </fieldset>

              {/* Field: Worries Pills */}
              <fieldset className="border-none p-0 m-0 flex flex-col gap-2">
                <legend className="text-sm font-bold text-[#3D2C4A]">
                  Anything on her mind? <span className="font-semibold text-xs text-[#6E5B7A]">(pick any)</span>
                </legend>
                <div className="flex flex-wrap gap-2">
                  {WORRIES.map((w) => {
                    const on = selectedWorries.includes(w);
                    return (
                      <button
                        key={w}
                        type="button"
                        onClick={() => toggleWorry(w)}
                        className={`min-h-[42px] px-4 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                          on
                            ? 'bg-[#FFE3CC] text-[#3D2C4A] border-2 border-[#F0AF7E] font-bold shadow-xs'
                            : 'bg-white text-[#3D2C4A] border border-[#E9DDE6] hover:border-[#F0AF7E]'
                        }`}
                      >
                        {w}
                      </button>
                    );
                  })}
                </div>
              </fieldset>

              {/* Add sister toggle */}
              {!showAddSister ? (
                <button
                  type="button"
                  onClick={() => setShowAddSister(true)}
                  className="text-xs font-bold text-[#A8365A] hover:underline self-start inline-flex items-center gap-1.5 min-h-[36px] cursor-pointer"
                >
                  <span className="w-5 h-5 rounded-full bg-[#FDEFF0] flex items-center justify-center text-sm font-bold">+</span>
                  Add her sister too (no extra cost)
                </button>
              ) : (
                <div className="bg-[#FFF8F8] border border-[#F1E4E8] rounded-2xl p-4 flex flex-col gap-2">
                  <label className="text-xs font-bold text-[#3D2C4A]">
                    Sister's name:
                    <input
                      type="text"
                      value={sisterName}
                      onChange={(e) => setSisterName(e.target.value)}
                      placeholder="e.g. Meera"
                      className="w-full mt-1.5 min-h-[44px] rounded-xl border border-[#E9DDE6] px-3.5 text-sm font-semibold text-[#3D2C4A] bg-white focus:outline-none focus:border-[#C2456A]"
                    />
                  </label>
                </div>
              )}

              {/* Continue Button */}
              <div className="pt-2">
                <button
                  type="button"
                  disabled={!daughterName.trim() || submitting}
                  onClick={handleDaughterSubmit}
                  className="w-full min-h-[56px] rounded-full bg-[#C2456A] hover:bg-[#A8365A] active:scale-[0.99] text-white font-bold text-base sm:text-lg flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-40 shadow-md"
                >
                  {submitting ? <Loader2 size={20} className="animate-spin" /> : 'Continue to parent space'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════
            STEP 3: Your Parent Space (Responsive Desktop 12-Col Layout)
        ══════════════════════════════════════════════════════════════════════ */}
        {step === 3 && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-10 items-start">
            {/* Left Column: PIN Card & WhatsApp Notifications (5 cols) */}
            <div className="md:col-span-5 flex flex-col gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold leading-tight text-[#3D2C4A] m-0">
                  Your parent space
                </h1>
                <p className="text-xs sm:text-sm text-[#5E4B6B] mt-1 m-0">
                  Set your PIN and WhatsApp preferences.
                </p>
              </div>

              {/* 4-Digit Parent PIN Card */}
              <section aria-labelledby="pin-h" className="bg-[#F1ECFA] rounded-3xl p-5 sm:p-6 flex flex-col gap-4 shadow-sm border border-[#E4DAF5]">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 id="pin-h" className="text-base font-bold text-[#3D2C4A] flex items-center gap-2 m-0">
                      <Lock size={18} className="text-[#6B4FA0]" />
                      <span>Set a 4-digit parent PIN</span>
                    </h2>
                    <p className="text-xs text-[#5E4B6B] m-0 mt-1 leading-relaxed">
                      Keeps conversation cards, settings, and billing private to you.
                    </p>
                  </div>
                  {parentPin.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setShowPin(!showPin)}
                      className="p-1.5 rounded-xl text-[#6B4FA0] hover:bg-[#E3DAF5] transition-colors cursor-pointer shrink-0 inline-flex items-center gap-1 text-xs font-semibold"
                      title={showPin ? 'Hide PIN digits' : 'Show PIN digits'}
                      aria-label={showPin ? 'Hide PIN digits' : 'Show PIN digits'}
                    >
                      {showPin ? <EyeOff size={16} /> : <Eye size={16} />}
                      <span className="hidden sm:inline">{showPin ? 'Hide' : 'Show'}</span>
                    </button>
                  )}
                </div>

                {/* Single Unified Interactive 4-Digit PIN Input */}
                <div className="flex flex-col items-center gap-2 pt-1">
                  <div
                    className="grid grid-cols-4 gap-3 w-full max-w-[280px] relative cursor-pointer"
                    onClick={() => pinInputRef.current?.focus()}
                  >
                    {[0, 1, 2, 3].map((i) => {
                      const isFilled = i < parentPin.length;
                      const isCurrent = i === parentPin.length;
                      const digit = parentPin[i];

                      return (
                        <div
                          key={i}
                          className={`h-16 rounded-2xl bg-white flex items-center justify-center transition-all ${
                            isCurrent
                              ? 'border-2 border-[#6B4FA0] ring-4 ring-[#6B4FA0]/20 shadow-sm scale-102'
                              : isFilled
                              ? 'border-2 border-[#6B4FA0] shadow-xs'
                              : 'border-[1.5px] border-[#D3C6EE] hover:border-[#A992D6]'
                          }`}
                        >
                          {isFilled ? (
                            showPin ? (
                              <span className="text-2xl font-extrabold text-[#3D2C4A] animate-in zoom-in-75 duration-150">
                                {digit}
                              </span>
                            ) : (
                              <span className="w-3.5 h-3.5 rounded-full bg-[#3D2C4A] animate-in zoom-in-50 duration-150 shadow-xs" />
                            )
                          ) : isCurrent ? (
                            <span className="w-2 h-2 rounded-full bg-[#6B4FA0]/70 animate-pulse" />
                          ) : (
                            <span className="w-2.5 h-2.5 rounded-full bg-[#E5DCF5]" />
                          )}
                        </div>
                      );
                    })}

                    {/* Hidden Real Input for Native Keyboard & Mobile Numpad */}
                    <input
                      ref={pinInputRef}
                      type="password"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      autoComplete="new-password"
                      maxLength={4}
                      value={parentPin}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '').slice(0, 4);
                        setParentPin(val);
                      }}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full text-transparent"
                      aria-label="Enter 4-digit parent PIN"
                    />
                  </div>

                  {/* Contextual PIN Guidance & Clear Action */}
                  {parentPin.length === 4 ? (
                    <div className="text-xs font-bold text-[#2F7F62] flex items-center gap-1.5 pt-1 animate-in fade-in duration-200">
                      <CheckCircle2 size={16} />
                      <span>PIN ready! You'll use this to unlock Parent space.</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between w-full max-w-[280px] px-1 text-[11px] text-[#6E5B7A] pt-0.5">
                      <span className="text-[#6B4FA0] font-medium">
                        {parentPin.length === 0
                          ? 'Tap boxes to enter 4 digits'
                          : `${4 - parentPin.length} more digit${4 - parentPin.length > 1 ? 's' : ''} needed`}
                      </span>
                      {parentPin.length > 0 && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setParentPin('');
                            pinInputRef.current?.focus();
                          }}
                          className="font-bold text-[#A8365A] hover:underline cursor-pointer"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </section>

              {/* Reminders on WhatsApp */}
              <section className="bg-white border border-[#F1E4E8] rounded-3xl p-5 flex flex-col gap-3 shadow-xs">
                <h2 className="text-sm font-bold text-[#3D2C4A] m-0">Reminders on WhatsApp</h2>

                <div className="flex items-center justify-between gap-3 pb-3 border-b border-[#F3E9EE]">
                  <div>
                    <strong className="block text-xs sm:text-sm font-bold text-[#3D2C4A]">Weekly progress summary</strong>
                    <span className="text-xs text-[#5E4B6B]">Sundays, to your registered phone</span>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={weeklySummary}
                    onClick={() => setWeeklySummary(!weeklySummary)}
                    className={`w-12 h-7 rounded-full p-0.5 transition-colors cursor-pointer flex items-center ${
                      weeklySummary ? 'bg-[#2F7F62] justify-end' : 'bg-[#E9DDE6] justify-start'
                    }`}
                  >
                    <span className="w-6 h-6 rounded-full bg-white shadow-sm" />
                  </button>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <div>
                    <strong className="block text-xs sm:text-sm font-bold text-[#3D2C4A]">Gentle lesson nudge for her</strong>
                    <span className="text-xs text-[#5E4B6B]">Sent to your phone</span>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={lessonNudge}
                    onClick={() => setLessonNudge(!lessonNudge)}
                    className={`w-12 h-7 rounded-full p-0.5 transition-colors cursor-pointer flex items-center ${
                      lessonNudge ? 'bg-[#2F7F62] justify-end' : 'bg-[#E9DDE6] justify-start'
                    }`}
                  >
                    <span className="w-6 h-6 rounded-full bg-white shadow-sm" />
                  </button>
                </div>

                {lessonNudge && (
                  <div className="flex gap-1.5 flex-wrap pt-1">
                    {NUDGE_TIMES.map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setNudgeTime(t)}
                        className={`min-h-[34px] px-3.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                          nudgeTime === t
                            ? 'bg-[#3D2C4A] text-white font-bold'
                            : 'bg-[#FFFAF6] text-[#3D2C4A] border border-[#E9DDE6]'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                )}
              </section>
            </div>

            {/* Right Column: Learning Style & Companion Guide (7 cols) */}
            <div className="md:col-span-7 flex flex-col gap-4">
              {/* How will you learn? */}
              <fieldset className="border-none p-0 m-0 flex flex-col gap-2.5">
                <legend className="text-base font-bold text-[#3D2C4A] mb-1">How will you learn?</legend>
                <div className="flex flex-col gap-2.5">
                  {LEARNING_STYLES.map((st) => {
                    const on = learningStyle === st.id;
                    return (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => setLearningStyle(st.id)}
                        className={`text-left rounded-2xl p-4 flex gap-3.5 items-center transition-all cursor-pointer ${
                          on
                            ? 'border-2 border-[#C2456A] bg-[#FDEFF0] shadow-2xs'
                            : 'border-[1.5px] border-[#E9DDE6] bg-white hover:border-[#C2456A]/40'
                        }`}
                      >
                        <span
                          className={`w-5 h-5 rounded-full border-2 grid place-items-center shrink-0 ${
                            on ? 'border-[#C2456A]' : 'border-[#C9B9C9]'
                          }`}
                        >
                          {on && <span className="w-2.5 h-2.5 rounded-full bg-[#C2456A]" />}
                        </span>
                        <span className="flex-1 min-w-0">
                          <strong className="block text-sm sm:text-base font-bold text-[#3D2C4A]">
                            {st.title}
                          </strong>
                          <span className="text-xs text-[#5E4B6B] block leading-snug mt-0.5">
                            {st.sub}
                          </span>
                        </span>
                        {st.rec && (
                          <span className="bg-[#FFF4C7] text-[#7A5A0C] rounded-full px-2.5 py-0.5 text-[10px] font-extrabold shrink-0">
                            RECOMMENDED
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </fieldset>

              {/* Parent Guide Download Card */}
              <div className="bg-[#FFF4C7] rounded-2xl p-4 flex items-center gap-3.5 shadow-2xs">
                <FileText size={26} className="text-[#A87910] shrink-0" />
                <div className="flex-1 min-w-0">
                  <strong className="block text-xs sm:text-sm font-bold text-[#3D2C4A]">
                    Parent Companion Guide · Chapter 1
                  </strong>
                  <span className="text-xs text-[#5E4B6B]">Read before you watch together. PDF, [2 MB]</span>
                </div>
                <button
                  type="button"
                  onClick={() => toast.success('Saving Companion Guide PDF...')}
                  className="px-4 py-2 rounded-full border-2 border-[#3D2C4A] bg-white text-xs font-bold text-[#3D2C4A] hover:bg-[#3D2C4A] hover:text-white transition-colors cursor-pointer shrink-0"
                >
                  Save PDF
                </button>
              </div>

              {/* Finish Setup Button */}
              <div className="pt-2 flex flex-col gap-1.5">
                <button
                  type="button"
                  disabled={parentPin.length !== 4 || submitting}
                  onClick={handleParentSpaceSubmit}
                  className="w-full min-h-[56px] rounded-full bg-[#C2456A] hover:bg-[#A8365A] active:scale-[0.99] text-white font-bold text-base sm:text-lg flex items-center justify-center gap-2 cursor-pointer transition-all disabled:bg-[#EADDE4] disabled:text-[#6E5B7A] disabled:cursor-not-allowed shadow-md"
                >
                  {submitting ? <Loader2 size={20} className="animate-spin" /> : 'Finish setup'}
                </button>
                {parentPin.length !== 4 && (
                  <div className="text-center text-xs font-semibold text-[#6E5B7A]">
                    Set your 4-digit PIN to finish
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════
            STEP 4: Pass The Phone (Desktop Celebration Screen)
        ══════════════════════════════════════════════════════════════════════ */}
        {step === 4 && (
          <div className="bg-[#E3DAF5] rounded-[36px] md:rounded-[44px] p-6 sm:p-10 md:p-14 flex flex-col md:flex-row items-center justify-between gap-8 md:gap-12 shadow-2xl relative overflow-hidden">
            {/* Left Side: Gigi holding phone Illustration */}
            <div className="flex flex-col items-center shrink-0">
              <svg
                width="220"
                height="260"
                viewBox="0 0 160 190"
                role="img"
                aria-label="Gigi holding phone"
                className="md:w-[260px] md:h-[300px]"
              >
                <circle cx="80" cy="52" r="34" fill="#3D2C4A" />
                <circle cx="50" cy="28" r="11" fill="#3D2C4A" />
                <circle cx="110" cy="28" r="11" fill="#3D2C4A" />
                <circle cx="113" cy="22" r="5" fill="#F4A3B4" />
                <circle cx="80" cy="58" r="25" fill="#D9A07E" />
                <path d="M55 51 C 60 32, 100 32, 105 51 C 96 43, 66 43, 55 51z" fill="#3D2C4A" />
                <path d="M68 59 Q71 56 74 59" stroke="#3D2C4A" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                <path d="M86 59 Q89 56 92 59" stroke="#3D2C4A" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                <circle cx="64" cy="67" r="4" fill="#F08FA6" opacity="0.6" />
                <circle cx="96" cy="67" r="4" fill="#F08FA6" opacity="0.6" />
                <path d="M72 69 Q80 78 88 69" stroke="#3D2C4A" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                <path d="M48 190 C 50 112, 64 90, 80 90 C 96 90, 110 112, 112 190z" fill="#F9D5D3" />
                <path d="M56 116 C 60 132, 66 140, 72 144" stroke="#D9A07E" strokeWidth="9" fill="none" strokeLinecap="round" />
                <path d="M104 116 C 100 132, 94 140, 88 144" stroke="#D9A07E" strokeWidth="9" fill="none" strokeLinecap="round" />
                <rect x="62" y="118" width="36" height="58" rx="7" fill="#3D2C4A" />
                <rect x="66" y="123" width="28" height="46" rx="4" fill="#FFFAF6" />
                <circle cx="72" cy="146" r="6" fill="#D9A07E" />
                <circle cx="88" cy="146" r="6" fill="#D9A07E" />
              </svg>
            </div>

            {/* Right Side: Welcome Message & Actions */}
            <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left gap-4">
              <span className="text-xs sm:text-sm font-bold tracking-widest text-[#5A4385] uppercase bg-white/70 px-3.5 py-1 rounded-full">
                ALL SET, {parentName}!
              </span>

              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#3D2C4A] leading-tight font-['Baloo_2',sans-serif] m-0">
                Pass the screen to {daughterName}!
              </h1>

              <p className="text-sm sm:text-base text-[#4E396E] leading-relaxed max-w-md m-0">
                Her personalized Bloom Garden is ready. Let her take the screen to meet Gigi and plant her very first sprout. You can check her progress anytime in Parent Space.
              </p>

              {/* Action Buttons */}
              <div className="w-full max-w-md flex flex-col gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleGoToDaughterGarden}
                  className="w-full min-h-[58px] rounded-full bg-[#3D2C4A] hover:bg-[#251A2E] text-white font-bold text-base sm:text-lg flex items-center justify-center gap-2 cursor-pointer shadow-lg transition-transform hover:scale-[1.01] active:scale-[0.99]"
                >
                  <span>{daughterName} is here, let's go!</span>
                  <ChevronRight size={20} />
                </button>

                <button
                  type="button"
                  onClick={handleGoToParentSpace}
                  className="w-full min-h-[46px] text-sm font-bold text-[#4E396E] hover:text-[#3D2C4A] hover:underline cursor-pointer"
                >
                  She'll start later · Open Parent Space
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FFFAF6] flex items-center justify-center">
          <Loader2 className="animate-spin text-[#C2456A]" size={36} />
        </div>
      }
    >
      <OnboardingWizard />
    </Suspense>
  );
}
