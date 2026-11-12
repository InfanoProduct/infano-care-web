'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuthStore, LearnerProfile } from '@/store/auth-store';
import { OnboardingService } from '@/services/onboarding.service';
import { CourseService } from '@/services/course.service';
import { useQuery } from '@tanstack/react-query';
import {
  Lock, ArrowRight, Check, Download, Heart, MessageSquare, Phone,
  Mail, ChevronDown, Plus, Sparkles, ExternalLink, ShieldCheck, X, Loader2
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function ParentDashboardPage() {
  const router = useRouter();
  const {
    user,
    isAuthenticated,
    learners,
    setLearners,
    activeProfile,
    setActiveProfile,
    isParentPinUnlocked,
    setParentPinUnlocked
  } = useAuthStore();

  const [mounted, setMounted] = useState(false);
  const [activeLearnerIndex, setActiveLearnerIndex] = useState(0);

  // PIN guard modal state if accessed directly without PIN
  const [pinModalOpen, setPinModalOpen] = useState(false);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [pinVerifying, setPinVerifying] = useState(false);

  // Interactive states
  const [kttDone, setKttDone] = useState(false);
  const [selectedCardTab, setSelectedCardTab] = useState(0);
  const [talkedCards, setTalkedCards] = useState<Record<number, boolean>>({});
  const [bookHidden, setBookHidden] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Check auth & PIN guard
  useEffect(() => {
    if (!mounted) return;
    if (!isAuthenticated || !user?.id) {
      router.push('/login');
      return;
    }

    if (!isParentPinUnlocked) {
      setPinModalOpen(true);
    }
  }, [mounted, isAuthenticated, user?.id, isParentPinUnlocked, router]);

  // Refresh learners once per user session
  useEffect(() => {
    if (!mounted || !isAuthenticated || !user?.id) return;

    const fetchLearners = async () => {
      try {
        const res = await OnboardingService.getLearners();
        if (res.learners && Array.isArray(res.learners)) {
          setLearners(res.learners);
        }
      } catch (err) {
        console.warn('Failed to load learners:', err);
      }
    };
    fetchLearners();
  }, [mounted, isAuthenticated, user?.id, setLearners]);

  // Handle keyboard typing for PIN on desktop
  useEffect(() => {
    if (!pinModalOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') {
        handlePinPress(e.key);
      } else if (e.key === 'Backspace') {
        handlePinDelete();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pinModalOpen, pin]);

  const verifyPin = async (code: string) => {
    setPinVerifying(true);
    setPinError('');
    try {
      const res = await OnboardingService.verifyParentPin(code);
      if (res.verified) {
        setParentPinUnlocked(true);
        setActiveProfile({ type: 'PARENT' });
        setPinModalOpen(false);
        setPin('');
      } else {
        setPinError('Incorrect PIN. Please try again.');
        setPin('');
      }
    } catch (err: any) {
      setPinError(err.message || 'Incorrect PIN. Please try again.');
      setPin('');
    } finally {
      setPinVerifying(false);
    }
  };

  const handlePinPress = (digit: string) => {
    if (pin.length < 4) {
      const nextPin = pin + digit;
      setPin(nextPin);
      setPinError('');
      if (nextPin.length === 4) {
        verifyPin(nextPin);
      }
    }
  };

  const handlePinDelete = () => {
    setPin((prev) => prev.slice(0, -1));
    setPinError('');
  };

  const currentLearner: LearnerProfile = learners[activeLearnerIndex] || {
    id: 'default',
    name: 'Aanya',
    age: '11',
    periodStatus: 'Not yet',
    flowersCount: 0,
    petalsCount: 0,
    streakDays: 0
  };

  const { data: parentOverview } = useQuery({
    queryKey: ['parent-course-overview', currentLearner.id],
    queryFn: () => CourseService.getParentOverview(currentLearner.id),
    enabled: Boolean(mounted && isAuthenticated && currentLearner.id && currentLearner.id !== 'default'),
  });

  if (!mounted) return null;

  const parentName = user?.profile?.displayName || 'Priya';

  const metrics = parentOverview?.metrics || {
    completedLessons: currentLearner.flowersCount || 0,
    totalLessons: 15,
    percentComplete: Math.round(((currentLearner.flowersCount || 0) / 15) * 100),
    estimatedMinutesLearned: 0,
    earnedBadgesCount: 0,
    totalBadgesCount: 18,
  };

  const ringDash = `${((metrics.percentComplete / 100) * 301.6).toFixed(1)} 301.6`;

  const chapters = parentOverview?.chapters
    ? parentOverview.chapters.map((ch: any) => ({
        id: ch.id,
        n: ch.number,
        title: ch.worldName,
        bg: ch.colors?.soft || '#EAF4FB',
        bar: ch.colors?.accent || '#8EBFE0',
        pct: `${ch.percent}%`,
        lessons: `${ch.completedLessons} of ${ch.totalLessons} lessons`,
        check: ch.checkinPassed
          ? `Check-in ${ch.bestCheckinScore}/10`
          : ch.completedLessons === ch.totalLessons
          ? 'Ready for check-in'
          : ch.completedLessons > 0
          ? 'In progress'
          : ch.number === 1
          ? 'Up next'
          : 'Locked for her',
      }))
    : [
        { id: 'ch1', n: 1, title: 'Moon Meadow', bg: '#EAF4FB', bar: '#8EBFE0', pct: '0%', lessons: '0 of 3 lessons', check: 'Up next' },
        { id: 'ch2', n: 2, title: 'Care Cove', bg: '#EAF7F1', bar: '#7FC3A3', pct: '0%', lessons: '0 of 4 lessons', check: 'Locked for her' },
        { id: 'ch3', n: 3, title: 'Comfort Hills', bg: '#FFF1E6', bar: '#F0AF7E', pct: '0%', lessons: '0 of 3 lessons', check: 'Locked for her' },
        { id: 'ch4', n: 4, title: 'Brave Heart Valley', bg: '#F4F0FB', bar: '#A992D6', pct: '0%', lessons: '0 of 5 lessons', check: 'Locked for her' },
      ];

  const cardData = [
    {
      label: 'Chapter 1',
      bg: '#EAF4FB',
      unlocked: true,
      qs: [
        'What surprised you most about the menstrual cycle?',
        'What questions do you still have? No question is silly.',
        "What would you tell a friend who's nervous about her first period?"
      ]
    },
    {
      label: 'Chapter 2',
      bg: '#EAF7F1',
      unlocked: true,
      qs: [
        'Which period product would you like to try first, and why?',
        'What would you pack in your school pouch?',
        'If it started at school, who would you go to first?'
      ]
    },
    {
      label: 'Chapter 3',
      bg: '#FFF1E6',
      unlocked: false,
      qs: []
    },
    {
      label: 'Chapter 4',
      bg: '#F4F0FB',
      unlocked: false,
      qs: []
    }
  ];

  const activeCard = cardData[selectedCardTab];
  const isCardTalked = !!talkedCards[selectedCardTab];

  const guides = [
    { title: 'Chapter 1 · The Moon Inside Me', sub: 'Read before Lesson 1.1 · 8 pages', bg: '#D8ECF8', isNew: false },
    { title: 'Chapter 2 · My Care Kit', sub: 'Products, packing, school days · 10 pages', bg: '#D4EFE4', isNew: false },
    { title: 'Chapter 3 · Listening to My Body', sub: 'Cramps, disorders, when to see a doctor · 9 pages', bg: '#FFE3CC', isNew: true },
    { title: 'Chapter 4 · Safe, Strong & Me', sub: 'Talking about safety and POCSO gently · 12 pages', bg: '#E3DAF5', isNew: false }
  ];

  return (
    <div className="min-h-screen bg-[#FBF8F6] text-[#3D2C4A] font-['Noto_Sans',sans-serif]">
      {/* Top Navbar */}
      <header className="bg-white border-b border-[#F1E4E8] sticky top-0 z-20">
        <div className="max-w-[1180px] mx-auto px-5 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link href="/dashboard/parent" className="relative h-8 w-28 sm:w-32 block shrink-0 hover:opacity-90 transition-opacity">
              <Image
                src="/logo/infano-logo-for-light-bg.png"
                alt="Infano"
                fill
                className="object-contain object-left"
                priority
              />
            </Link>
            <span className="font-bold text-[18px] sm:text-[20px] text-[#3D2C4A] border-l border-[#F1E4E8] pl-3">Parent space</span>
            <span className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold text-[#5A4385] bg-[#F1ECFA] rounded-full px-2.5 py-0.5">
              <Lock size={12} className="stroke-[2.5]" />
              PIN protected
            </span>
          </div>

          <nav className="flex flex-wrap items-center gap-2 sm:gap-4 text-[14px] sm:text-[15px] font-semibold">
            <Link href="/dashboard/orders" className="inline-flex text-[#3D2C4A] hover:text-[#C2456A] px-2 py-1">
              Orders
            </Link>
            <Link href="/dashboard/settings" className="inline-flex text-[#3D2C4A] hover:text-[#C2456A] px-2 py-1">
              Settings
            </Link>
            <Link href="/dashboard/help" className="inline-flex text-[#3D2C4A] hover:text-[#C2456A] px-2 py-1">
              Help
            </Link>
            <Link
              href="/dashboard/picker"
              className="inline-flex items-center gap-1.5 text-[#3D2C4A] hover:text-[#C2456A] bg-[#FFFAF6] sm:bg-transparent border border-[#F1E4E8] sm:border-0 rounded-full px-3 py-1.5 text-sm"
            >
              Switch profile
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1180px] mx-auto px-5 py-6 sm:py-8 flex flex-col gap-6">
        {/* Top Hero Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-sm font-semibold text-[#6E5B7A]">Good evening, {parentName}</div>
            <h1 className="text-[26px] sm:text-[34px] font-bold leading-tight mt-0.5">
              {currentLearner.name} is blooming beautifully
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Learner Dropdown */}
            <div className="relative inline-flex items-center gap-2 min-h-[46px] px-3.5 rounded-full bg-white border border-[#E9DDE6] text-sm font-bold shadow-sm">
              <span className="text-xs font-semibold text-[#6E5B7A]">Viewing</span>
              <select
                aria-label="Choose learner"
                value={activeLearnerIndex}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === 'add') {
                    router.push('/dashboard/picker');
                  } else {
                    setActiveLearnerIndex(Number(val));
                  }
                }}
                className="bg-transparent text-sm font-bold text-[#3D2C4A] focus:outline-none cursor-pointer pr-1"
              >
                {learners.map((l, idx) => (
                  <option key={l.id} value={idx}>
                    {l.name}, {l.age}
                  </option>
                ))}
                <option value="add">+ Add her sister</option>
              </select>
            </div>

            {/* Open Garden Button */}
            <button
              type="button"
              onClick={() => {
                setActiveProfile({ type: 'DAUGHTER', learner: currentLearner });
                router.push('/dashboard');
              }}
              className="inline-flex items-center gap-2 min-h-[46px] px-5 rounded-full bg-[#C2456A] hover:bg-[#A8365A] text-white font-bold text-sm shadow-md transition-all cursor-pointer"
            >
              Open her garden
            </button>
          </div>
        </div>

        {/* Row 1: Her Progress & Kitchen Table Talk */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Her Progress */}
          <section aria-labelledby="prog-h" className="bg-white border border-[#F1E4E8] rounded-[26px] p-5 sm:p-6 flex flex-col gap-4 shadow-sm">
            <h2 id="prog-h" className="text-[17px] font-bold text-[#3D2C4A]">Her progress</h2>
            <div className="flex flex-wrap items-center gap-5">
              {/* Circular Progress Ring */}
              <div className="relative w-[130px] h-[130px] shrink-0">
                <svg width="130" height="130" viewBox="0 0 120 120" role="img" aria-label={`${metrics.percentComplete} percent complete`}>
                  <circle cx="60" cy="60" r="48" fill="none" stroke="#F3E9EE" strokeWidth="13" />
                  <circle
                    cx="60"
                    cy="60"
                    r="48"
                    fill="none"
                    stroke="#E8738A"
                    strokeWidth="13"
                    strokeLinecap="round"
                    strokeDasharray={ringDash}
                    transform="rotate(-90 60 60)"
                  />
                  <text x="60" y="58" textAnchor="middle" fontFamily="inherit" fontSize="27" fontWeight="700" fill="#3D2C4A">
                    {metrics.percentComplete}%
                  </text>
                  <text x="60" y="78" textAnchor="middle" fontFamily="inherit" fontSize="12" fontWeight="800" fill="#6E5B7A">
                    complete
                  </text>
                </svg>
              </div>

              {/* Progress Metrics */}
              <dl className="flex-1 grid grid-cols-2 gap-3 m-0 min-w-[200px]">
                <div className="bg-[#FBF8F6] rounded-2xl p-2.5 sm:p-3">
                  <dt className="text-xs font-semibold text-[#6E5B7A]">Lessons</dt>
                  <dd className="m-0 text-xl font-bold text-[#3D2C4A]">{metrics.completedLessons} of {metrics.totalLessons}</dd>
                </div>
                <div className="bg-[#FBF8F6] rounded-2xl p-2.5 sm:p-3">
                  <dt className="text-xs font-semibold text-[#6E5B7A]">Video watched</dt>
                  <dd className="m-0 text-xl font-bold text-[#3D2C4A]">{metrics.estimatedMinutesLearned} min</dd>
                </div>
                <div className="bg-[#FBF8F6] rounded-2xl p-2.5 sm:p-3">
                  <dt className="text-xs font-semibold text-[#6E5B7A]">Petals</dt>
                  <dd className="m-0 text-xl font-bold text-[#3D2C4A]">{parentOverview?.learner?.petalsCount ?? currentLearner.petalsCount ?? 0}</dd>
                </div>
                <div className="bg-[#FBF8F6] rounded-2xl p-2.5 sm:p-3">
                  <dt className="text-xs font-semibold text-[#6E5B7A]">Badges</dt>
                  <dd className="m-0 text-xl font-bold text-[#3D2C4A]">{metrics.earnedBadgesCount} of {metrics.totalBadgesCount}</dd>
                </div>
              </dl>
            </div>

            <div className="flex gap-2 items-start text-xs text-[#5E4B6B] border-t border-[#F3E9EE] pt-3">
              <Lock size={15} className="shrink-0 text-[#8A7896] mt-0.5" />
              <span>You see her progress, scores and badges. Her journal stays private to her.</span>
            </div>
          </section>

          {/* Kitchen Table Talk */}
          <section
            aria-labelledby="ktt-h"
            className="bg-[#FFF4C7] rounded-[26px] p-5 sm:p-6 flex flex-col justify-between gap-3 relative overflow-hidden shadow-sm"
          >
            <svg
              aria-hidden="true"
              width="140"
              height="140"
              viewBox="0 0 24 24"
              fill="#F7E7A4"
              className="absolute -right-6 -top-6 pointer-events-none opacity-80"
            >
              <path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10z" />
            </svg>

            <div className="relative z-10 space-y-2">
              <div className="text-[11px] font-bold tracking-wider text-[#7A5A0C] uppercase">
                THIS WEEK'S KITCHEN TABLE TALK · ABOUT 10 MIN
              </div>
              <h2 id="ktt-h" className="text-xl sm:text-2xl font-bold text-[#3D2C4A] leading-snug">
                Make a Comfort Kit list together
              </h2>
              <p className="text-sm text-[#3D2C4A] leading-relaxed">
                Before she starts Chapter 3, sit together and list 5 things that help when she feels crampy or low. Stick it on the fridge.
              </p>
              <div className="italic text-sm sm:text-[15px] font-semibold text-[#7A3F14]">
                Try asking: "What makes you feel cozy when you're tired?"
              </div>
            </div>

            <div className="relative z-10 pt-2">
              <button
                type="button"
                onClick={() => setKttDone(!kttDone)}
                className={`min-h-[44px] px-5 rounded-full font-bold text-sm transition-all cursor-pointer shadow-sm ${
                  kttDone
                    ? 'bg-[#2F7F62] text-white'
                    : 'bg-[#3D2C4A] hover:bg-[#2F213A] text-white'
                }`}
              >
                {kttDone ? '✓ Done together' : 'Mark as done'}
              </button>
            </div>
          </section>
        </div>

        {/* Row 2: Chapter by chapter */}
        <section aria-labelledby="ch-h" className="bg-white border border-[#F1E4E8] rounded-[26px] p-5 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
            <h2 id="ch-h" className="text-[17px] font-bold text-[#3D2C4A] m-0">Chapter by chapter</h2>
            <Link
              href="/dashboard/parent/preview"
              className="text-xs font-bold text-[#C2456A] hover:underline"
            >
              Preview full course →
            </Link>
          </div>
          <div className="flex flex-col gap-2.5">
            {chapters.map((c: any) => (
              <div
                key={c.n}
                style={{ backgroundColor: c.bg }}
                className="flex flex-wrap items-center gap-3 sm:gap-4 p-3 sm:p-3.5 rounded-2xl"
              >
                <span className="w-9 h-9 rounded-xl bg-white flex items-center justify-center font-bold text-sm text-[#3D2C4A] shadow-xs shrink-0">
                  {c.n}
                </span>
                <div className="flex-1 min-w-[180px]">
                  <div className="font-bold text-sm text-[#3D2C4A]">{c.title}</div>
                  <div className="h-2 rounded-full bg-white/80 mt-1.5 overflow-hidden">
                    <div
                      style={{ width: c.pct, backgroundColor: c.bar }}
                      className="h-full rounded-full transition-all duration-500"
                    />
                  </div>
                </div>
                <span className="text-xs font-semibold text-[#3D2C4A] shrink-0">{c.lessons}</span>
                <span className="text-xs font-bold bg-white text-[#3D2C4A] rounded-full px-2.5 py-1 shadow-xs shrink-0">
                  {c.check}
                </span>
                <Link
                  href={`/dashboard/parent/preview?chapter=${c.id}`}
                  className="text-xs font-bold text-[#C2456A] hover:underline cursor-pointer shrink-0"
                >
                  Preview chapter
                </Link>
              </div>
            ))}
          </div>
          <p className="text-xs text-[#5E4B6B] mt-3">
            Chapters open for her in order. You can preview all of them, including Chapter 4 on safety, anytime.
          </p>
        </section>

        {/* Row 3: Conversation Starters & Parent Companion Guides */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Conversation Starters */}
          <section aria-labelledby="cc-h" className="bg-white border border-[#F1E4E8] rounded-[26px] p-5 sm:p-6 flex flex-col gap-3 shadow-sm">
            <h2 id="cc-h" className="text-[17px] font-bold text-[#3D2C4A]">Conversation starters</h2>

            {/* Tabs */}
            <div className="flex flex-wrap gap-2">
              {cardData.map((tab, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedCardTab(idx)}
                  className={`min-h-[38px] px-3.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    selectedCardTab === idx
                      ? 'bg-[#3D2C4A] text-white'
                      : 'bg-white border border-[#E9DDE6] text-[#3D2C4A] hover:bg-[#FFFAF6]'
                  }`}
                >
                  {tab.label} {!tab.unlocked && '· locked'}
                </button>
              ))}
            </div>

            {/* Active Card Body */}
            {activeCard.unlocked ? (
              <div
                style={{ backgroundColor: activeCard.bg }}
                className="rounded-2xl p-4 sm:p-5 flex flex-col gap-3 transition-all animate-in fade-in"
              >
                <div className="text-[11px] font-bold tracking-wider text-[#3D2C4A] uppercase">
                  {activeCard.label} · ASK HER AFTER DINNER
                </div>
                <ol className="m-0 pl-5 space-y-2 text-sm sm:text-[15px] font-medium leading-snug">
                  {activeCard.qs.map((q, i) => (
                    <li key={i}>{q}</li>
                  ))}
                </ol>
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() =>
                      setTalkedCards({ ...talkedCards, [selectedCardTab]: !isCardTalked })
                    }
                    className={`min-h-[40px] px-4 rounded-full text-xs font-bold transition-all cursor-pointer ${
                      isCardTalked
                        ? 'bg-[#2F7F62] text-white'
                        : 'bg-white border-2 border-[#3D2C4A] text-[#3D2C4A] hover:bg-[#FFFAF6]'
                    }`}
                  >
                    {isCardTalked ? '✓ We talked about it' : 'We talked about it'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl p-5 bg-[#F6F1F4] text-xs sm:text-sm text-[#4A3A57] leading-relaxed">
                This card unlocks when {currentLearner.name} finishes {activeCard.label}. We'll send you a WhatsApp notification when it's ready.
              </div>
            )}
          </section>

          {/* Parent Companion Guides */}
          <section aria-labelledby="guides-h" className="bg-white border border-[#F1E4E8] rounded-[26px] p-5 sm:p-6 flex flex-col gap-2.5 shadow-sm">
            <h2 id="guides-h" className="text-[17px] font-bold text-[#3D2C4A]">Parent Companion Guides</h2>
            <div className="divide-y divide-[#F3E9EE]">
              {guides.map((g, idx) => (
                <div key={idx} className="flex items-center gap-3 py-2.5">
                  <span
                    style={{ backgroundColor: g.bg }}
                    className="w-10 h-11 rounded-lg flex items-center justify-center font-bold text-xs text-[#3D2C4A] shrink-0"
                  >
                    PDF
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-[#3D2C4A] truncate">{g.title}</span>
                      {g.isNew && (
                        <span className="text-[10px] font-extrabold bg-[#C2456A] text-white rounded-full px-2 py-0.5 shrink-0">
                          NEW
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-[#5E4B6B] block truncate">{g.sub}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => toast.success(`Downloading ${g.title}`)}
                    className="w-10 h-10 rounded-full border border-[#E9DDE6] hover:bg-[#FFFAF6] flex items-center justify-center text-[#3D2C4A] cursor-pointer shrink-0"
                    aria-label={`Download ${g.title}`}
                  >
                    <Download size={16} />
                  </button>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Row 4: Medical Guidance, Book Bundle & Support */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Medical guidance */}
          <section className="bg-[#EAF7F1] rounded-[26px] p-5 sm:p-6 flex flex-col gap-2.5 shadow-sm">
            <div className="flex items-center gap-2 text-[#24735A] font-bold text-base">
              <ShieldCheck size={20} />
              <span>When to see a doctor</span>
            </div>
            <ul className="text-xs sm:text-sm text-[#1F4A38] space-y-1.5 pl-4 list-disc">
              <li>No period by age 15</li>
              <li>Bleeding that lasts more than 7 days</li>
              <li>Soaking a pad every 1 to 2 hours</li>
              <li>Pain that stops her from daily activities</li>
            </ul>
            <div className="text-[11px] text-[#2E5A47] italic mt-1">
              Reviewed by our adolescent health panel.
            </div>
            <a href="#medical-guide" className="text-xs font-bold text-[#1F5A45] hover:underline mt-auto pt-2">
              Read the full guide →
            </a>
          </section>

          {/* Book order status */}
          <section className="bg-white border border-[#F1E4E8] rounded-[26px] p-5 sm:p-6 flex flex-col justify-between gap-3 shadow-sm">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-base text-[#3D2C4A]">Your Gigi book</h3>
              <span className="text-xs font-semibold text-[#6E5B7A]">Arrives Saturday</span>
            </div>
            <ol className="grid grid-cols-4 gap-1 text-center text-[11px] font-bold my-2">
              <li className="flex flex-col items-center gap-1.5">
                <span className="w-7 h-7 rounded-full bg-[#2F7F62] text-white flex items-center justify-center text-xs">✓</span>
                <span>Ordered</span>
              </li>
              <li className="flex flex-col items-center gap-1.5">
                <span className="w-7 h-7 rounded-full bg-[#2F7F62] text-white flex items-center justify-center text-xs">✓</span>
                <span>Shipped</span>
              </li>
              <li className="flex flex-col items-center gap-1.5">
                <span className="w-7 h-7 rounded-full bg-[#FFE3CC] border-2 border-[#F0AF7E] text-[#9A4A16] flex items-center justify-center text-xs">3</span>
                <span>On the way</span>
              </li>
              <li className="flex flex-col items-center gap-1.5 text-[#8A7896]">
                <span className="w-7 h-7 rounded-full bg-[#F6F1F4] flex items-center justify-center text-xs">4</span>
                <span>Delivered</span>
              </li>
            </ol>
            <Link href="/dashboard/orders" className="text-xs font-bold text-[#C2456A] hover:underline">
              Track delivery →
            </Link>
          </section>

          {/* Help & Support */}
          <section className="bg-white border border-[#F1E4E8] rounded-[26px] p-5 sm:p-6 flex flex-col gap-3 shadow-sm">
            <h3 className="font-bold text-base text-[#3D2C4A]">We're here for you</h3>
            <div className="flex flex-wrap gap-2">
              <a
                href="https://wa.me/919243019243"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 min-h-[42px] px-4 rounded-full bg-[#3D2C4A] hover:bg-[#2F213A] text-white text-xs font-bold shadow-sm"
              >
                <Phone size={14} />
                WhatsApp support
              </a>
              <a
                href="mailto:connect@infano.care"
                className="inline-flex items-center gap-1.5 min-h-[42px] px-4 rounded-full border-2 border-[#3D2C4A] text-[#3D2C4A] text-xs font-bold hover:bg-[#FFFAF6]"
              >
                <Mail size={14} />
                Email
              </a>
            </div>
            <div className="bg-[#F1ECFA] rounded-2xl p-3 text-xs text-[#3D2C4A] leading-relaxed mt-auto">
              <strong>Parent community, coming soon.</strong> Swap notes with other parents, moderated by our experts.{' '}
              <Link href="/dashboard/help#waitlist" className="text-[#5A4385] font-bold hover:underline">
                Join waitlist
              </Link>
            </div>
          </section>
        </div>
      </main>

      {/* PIN Unlock Guard Modal */}
      {pinModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#3D2C4A]/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-[390px] bg-white rounded-[32px] p-6 shadow-2xl flex flex-col gap-4 animate-in zoom-in-95">
            <div className="text-center space-y-1">
              <div className="w-12 h-12 rounded-full bg-[#F1ECFA] text-[#5A4385] flex items-center justify-center mx-auto mb-2">
                <Lock size={22} />
              </div>
              <h2 className="text-xl font-bold text-[#3D2C4A]">Parent Space is Locked</h2>
              <p className="text-xs text-[#6E5B7A]">
                Enter your 4-digit PIN to access parent tools and settings.
              </p>
            </div>

            {pinError && (
              <div className="text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-xl p-2 text-center font-semibold">
                {pinError}
              </div>
            )}

            {/* Dots */}
            <div className="flex justify-center gap-4 py-2">
              {[0, 1, 2, 3].map((i) => (
                <span
                  key={i}
                  className={`w-[18px] h-[18px] rounded-full transition-all ${
                    i < pin.length
                      ? 'bg-[#3D2C4A] scale-110'
                      : 'bg-white border-2 border-[#C9B9C9]'
                  }`}
                />
              ))}
            </div>

            {/* Keypad */}
            <div className="grid grid-cols-3 gap-2">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫'].map((k, idx) => {
                if (k === '') return <div key={idx} className="min-h-[52px]" />;
                if (k === '⌫') {
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={handlePinDelete}
                      className="min-h-[52px] rounded-2xl bg-transparent text-[#3D2C4A] font-semibold text-2xl flex items-center justify-center hover:bg-[#FFFAF6] cursor-pointer"
                    >
                      ⌫
                    </button>
                  );
                }
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handlePinPress(k)}
                    className="min-h-[52px] rounded-2xl bg-[#FFFAF6] hover:bg-[#F1E4E8] text-[#3D2C4A] font-semibold text-2xl flex items-center justify-center cursor-pointer active:scale-95 transition-all"
                  >
                    {k}
                  </button>
                );
              })}
            </div>

            <div className="flex justify-between items-center pt-2">
              <button
                type="button"
                onClick={() => router.push('/dashboard/picker')}
                className="text-xs font-bold text-[#6E5B7A] hover:underline cursor-pointer"
              >
                Back to profiles
              </button>
              <button
                type="button"
                onClick={() => toast('To reset your PIN, request an OTP from login.', { icon: '🔑' })}
                className="text-xs font-bold text-[#A8365A] hover:underline cursor-pointer"
              >
                Forgot PIN?
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
