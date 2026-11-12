'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { DaughterShell } from './DaughterShell';
import { useDaughterState } from './daughter-state';
import { useCourseCurriculum, useLearnerCourseState, useInvalidateCourse } from '@/hooks/use-course';
import { CourseService } from '@/services/course.service';
import {
  Play, Check, Lock, Sparkles, Heart, Award
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export function HerBloomGarden() {
  const { currentLearner, totalPetals: localPetals, doneCount: localDoneCount } = useDaughterState();
  const { data: curriculum } = useCourseCurriculum();
  const { data: learnerState } = useLearnerCourseState();
  const invalidateCourse = useInvalidateCourse();

  const [mythOpen, setMythOpen] = useState(false);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);

  const completedLessons = learnerState?.completedLessons || [];
  const doneCount = learnerState ? completedLessons.length : localDoneCount;
  const totalPetals = learnerState ? learnerState.learner.petalsCount : localPetals;

  const backendChapters = curriculum?.course?.chapters || [];
  const unlockedChapters = new Set(learnerState?.unlockedChapters || ['ch1']);
  const passedCheckins = new Set(learnerState?.passedCheckins || []);
  const nextLessonId = learnerState?.nextLessonId || 'l1-1';

  // Resolve next lesson metadata dynamically
  let nextLesson = {
    id: nextLessonId,
    code: '1.1',
    title: 'The Menstrual Cycle',
    chapterNumber: 1,
    chapterColor: '#D8ECF8',
    chapterInk: '#2F6494',
    durationMins: 15,
  };
  for (const ch of backendChapters) {
    const found = ch.lessons?.find((l) => l.id === nextLessonId);
    if (found) {
      nextLesson = {
        id: found.id,
        code: found.code,
        title: found.title,
        chapterNumber: ch.number,
        chapterColor: ch.colors?.background || '#FFE3CC',
        chapterInk: ch.colors?.ink || '#9A4A16',
        durationMins: Math.round((found.video?.duration_seconds || 900) / 60),
      };
      break;
    }
  }

  const totalPlots = 15;
  const passedCount = passedCheckins.size;

  const chapterColors = ['#8EBFE0', '#7FC3A3', '#F0AF7E', '#A992D6'];
  const getChapterIndex = (k: number) => (k < 3 ? 0 : k < 7 ? 1 : k < 10 ? 2 : 3);

  // 15 plots
  const plots = Array.from({ length: totalPlots }, (_, k) => ({
    flower: k < doneCount,
    sprout: k === doneCount,
    empty: k > doneCount,
    color: chapterColors[getChapterIndex(k)],
    title: k < doneCount ? `Lesson ${k + 1} done` : k === doneCount ? `Lesson ${k + 1} up next` : `Lesson ${k + 1}`
  }));

  const chapters = backendChapters.length > 0
    ? backendChapters.map((ch) => {
        const chDone = ch.lessons.filter((l) => completedLessons.includes(l.id)).length;
        const chTotal = ch.lessons.length;
        const isDone = ch.checkinId ? passedCheckins.has(ch.checkinId) : chDone === chTotal;
        const isOpen = unlockedChapters.has(ch.id);
        const isCurrent = isOpen && !isDone;
        return {
          id: ch.id,
          n: ch.number,
          title: ch.worldName,
          bg: isOpen ? ch.colors.background : '#F6F1F4',
          ink: isOpen ? ch.colors.ink : '#8A7896',
          status: isDone ? 'DONE ✓' : isCurrent ? 'NOW' : 'LOCKED',
          meta: isDone
            ? `${chDone} of ${chTotal} lessons · badge earned`
            : isCurrent
            ? `${chDone} of ${chTotal} lessons`
            : `Opens after Chapter ${ch.number - 1}`,
          isDone,
          isCurrent,
          isOpen,
        };
      })
    : [
        { id: 'ch1', n: 1, title: 'Moon Meadow', bg: '#D8ECF8', ink: '#2F6494', status: 'NOW', meta: '0 of 3 lessons', isDone: false, isCurrent: true, isOpen: true },
        { id: 'ch2', n: 2, title: 'Care Cove', bg: '#F6F1F4', ink: '#8A7896', status: 'LOCKED', meta: 'Opens after Chapter 1', isDone: false, isCurrent: false, isOpen: false },
        { id: 'ch3', n: 3, title: 'Comfort Hills', bg: '#F6F1F4', ink: '#8A7896', status: 'LOCKED', meta: 'Opens after Chapter 2', isDone: false, isCurrent: false, isOpen: false },
        { id: 'ch4', n: 4, title: 'Brave Heart Valley', bg: '#F6F1F4', ink: '#8A7896', status: 'LOCKED', meta: 'Opens after Chapter 3', isDone: false, isCurrent: false, isOpen: false },
      ];

  // Dynamic myth of the day from seeded pool
  const mythPool = curriculum?.pools?.app_copy?.myth_of_the_day || [];
  const todayMyth = mythPool.length > 0
    ? mythPool[new Date().getDate() % mythPool.length]
    : {
        statement: "You can't wash your hair during your period.",
        verdict: "Myth!",
        explanation: "A warm bath or hair wash is safe and can even ease cramps.",
      };

  const handleFlipMyth = async () => {
    const nextOpen = !mythOpen;
    setMythOpen(nextOpen);
    if (nextOpen && currentLearner.id && currentLearner.id !== 'default') {
      try {
        const res = await CourseService.recordMythAnswered(currentLearner.id);
        if (res.petalsAwarded > 0) {
          invalidateCourse();
          toast.success(`+${res.petalsAwarded} petals for myth busting! 🌸`);
        }
      } catch {
        // non-blocking
      }
    }
  };

  const earnedBadgeIds = new Set((learnerState?.earnedBadges || []).map((b) => b.badgeId));
  const previewBadges = (curriculum?.badges || []).slice(0, 8).map((b) => ({
    label: b.name,
    earned: earnedBadgeIds.has(b.id),
    bg: earnedBadgeIds.has(b.id) ? '#D4EFE4' : '#F6F1F4',
    ink: earnedBadgeIds.has(b.id) ? '#24735A' : '#8A7896',
  }));

  const moods = [
    { label: 'Happy', bg: '#FFF4C7', reply: 'Love that! Keep shining.' },
    { label: 'Tired', bg: '#E3DAF5', reply: 'Rest is part of growing. Be kind to yourself today.' },
    { label: 'Crampy', bg: '#FFE3CC', reply: 'Try a warm water bottle and the 2-minute stretch in Chapter 3.' },
    { label: 'Worried', bg: '#D8ECF8', reply: "That's okay. Want to write about it in your private journal?" }
  ];

  const badges = previewBadges.length > 0 ? previewBadges : [
    { label: 'Seedling', earned: true, bg: '#D4EFE4', ink: '#24735A' },
    { label: 'First Bloom', earned: false, bg: '#F6F1F4', ink: '#8A7896' },
    { label: 'Cycle Explorer', earned: false, bg: '#F6F1F4', ink: '#8A7896' },
    { label: 'Care Captain', earned: false, bg: '#F6F1F4', ink: '#8A7896' },
    { label: 'Myth Buster', earned: false, bg: '#F6F1F4', ink: '#8A7896' },
    { label: 'Body Listener', earned: false, bg: '#F6F1F4', ink: '#8A7896' },
    { label: 'Brave Heart', earned: false, bg: '#F6F1F4', ink: '#8A7896' },
    { label: 'Kit Packer', earned: false, bg: '#F6F1F4', ink: '#8A7896' }
  ];

  const moodHit = moods.find((m) => m.label === selectedMood);

  return (
    <DaughterShell>
      <style jsx global>{`
        @keyframes hgsway {
          0%, 100% { transform: rotate(-3deg); }
          50% { transform: rotate(3deg); }
        }
        @keyframes hgpulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(194, 69, 106, 0.4); }
          50% { box-shadow: 0 0 0 10px rgba(194, 69, 106, 0); }
        }
        .sway-flower {
          transform-box: fill-box;
          transform-origin: 50% 100%;
          animation: hgsway 4s ease-in-out infinite;
        }
        .pulse-btn {
          animation: hgpulse 2s ease-in-out infinite;
        }
      `}</style>

          {/* Header */}
          <header className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-xl sm:text-2xl font-bold text-[#A8365A] leading-tight font-['Baloo_2',sans-serif]">
                Good evening,
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-[#3D2C4A] leading-tight font-['Baloo_2',sans-serif]">
                {currentLearner.name}
              </h1>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              {/* Petals -> Links to Garden Shop */}
              <Link
                href="/dashboard/badges/shop"
                className="inline-flex items-center gap-1.5 bg-white border border-[#F1E4E8] hover:border-[#C2456A] rounded-full px-3.5 py-1.5 font-bold text-sm shadow-xs transition-colors"
              >
                <svg width="18" height="18" viewBox="0 0 16 22" aria-hidden="true">
                  <ellipse cx="8" cy="11" rx="6" ry="10" fill="#F4A3B4" />
                </svg>
                {totalPetals} petals
              </Link>

              {/* Streak */}
              <span className="inline-flex items-center gap-2 bg-white border border-[#F1E4E8] rounded-full px-3.5 py-1.5 text-xs font-semibold shadow-xs">
                <span className="inline-flex gap-1">
                  {[true, false, true, false, false, true, false].map((active, i) => (
                    <span
                      key={i}
                      className={`w-2 h-2 rounded-full ${active ? 'bg-[#E8738A]' : 'bg-[#EADDE4]'}`}
                    />
                  ))}
                </span>
                <span>{currentLearner.streakDays || 3} days this week</span>
              </span>

              {/* Switch Profile Avatar */}
              <Link
                href="/dashboard/picker"
                title="Switch profile"
                className="w-11 h-11 rounded-full overflow-hidden hover:scale-105 transition-transform shrink-0"
              >
                <svg width="44" height="44" viewBox="0 0 80 80" aria-hidden="true">
                  <circle cx="40" cy="40" r="40" fill="#F9D5D3" />
                  <circle cx="40" cy="36" r="22" fill="#3D2C4A" />
                  <circle cx="21" cy="20" r="8" fill="#3D2C4A" />
                  <circle cx="59" cy="20" r="8" fill="#3D2C4A" />
                  <circle cx="40" cy="42" r="16" fill="#D9A07E" />
                  <circle cx="34" cy="42" r="2" fill="#3D2C4A" />
                  <circle cx="46" cy="42" r="2" fill="#3D2C4A" />
                  <path d="M35 49 Q40 53 45 49" stroke="#3D2C4A" strokeWidth="2" fill="none" strokeLinecap="round" />
                </svg>
              </Link>
            </div>
          </header>

          {/* Continue Learning Hero Card */}
          <section
            aria-label="Continue learning"
            style={{ backgroundColor: nextLesson.chapterColor }}
            className="rounded-[30px] p-5 sm:p-6 flex flex-wrap gap-5 items-center relative overflow-hidden shadow-sm"
          >
            {/* Thumbnail */}
            <div className="w-full sm:w-[220px] aspect-16/10 rounded-2xl bg-white flex items-center justify-center relative shrink-0 shadow-xs">
              <Heart size={64} style={{ color: nextLesson.chapterInk }} className="stroke-[1.4]" />
              <span className="absolute left-2.5 bottom-2.5 bg-[#3D2C4A] text-white rounded-full px-2.5 py-0.5 text-xs font-semibold">
                {nextLesson.durationMins} min video + 3 steps
              </span>
            </div>

            {/* Meta */}
            <div className="flex-1 min-w-[240px] flex flex-col gap-2">
              <span style={{ color: nextLesson.chapterInk }} className="text-xs font-bold tracking-wider uppercase">
                UP NEXT · CHAPTER {nextLesson.chapterNumber} · LESSON {nextLesson.code}
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-[#3D2C4A] font-['Baloo_2',sans-serif] leading-tight m-0">
                {nextLesson.title}
              </h2>
              <div className="flex flex-wrap gap-1.5 py-0.5">
                {['Watch', 'Play', 'Discover', 'Reflect'].map((step) => (
                  <span
                    key={step}
                    className="bg-white/80 rounded-full px-2.5 py-0.5 text-xs font-bold text-[#3D2C4A]"
                  >
                    {step}
                  </span>
                ))}
              </div>
              <div className="pt-1 flex flex-wrap gap-2.5">
                <Link
                  href={`/dashboard/courses/lesson/${nextLesson.id}`}
                  className="pulse-btn inline-flex items-center gap-2 min-h-[48px] px-6 rounded-full bg-[#C2456A] hover:bg-[#A8365A] text-white font-bold text-sm shadow-md transition-all"
                >
                  <Play size={16} fill="currentColor" />
                  Start lesson
                </Link>
                <Link
                  href="/dashboard/courses"
                  className="inline-flex items-center gap-2 min-h-[48px] px-5 rounded-full bg-white/85 hover:bg-white text-[#3D2C4A] font-bold text-sm shadow-2xs transition-all"
                >
                  All worlds
                </Link>
              </div>
            </div>
          </section>

          {/* Garden & Certificate Row */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Garden Plots (8 cols) */}
            <section
              aria-labelledby="garden-h"
              className="lg:col-span-7 xl:col-span-8 bg-[#D4EFE4] rounded-[30px] p-5 pb-0 overflow-hidden flex flex-col shadow-sm"
            >
              <div className="flex justify-between items-baseline gap-2 flex-wrap">
                <h2 id="garden-h" className="font-bold text-xl sm:text-2xl text-[#3D2C4A] font-['Baloo_2',sans-serif] m-0">
                  My Bloom Garden
                </h2>
                <span className="font-bold text-xs sm:text-sm text-[#24533F]">
                  {doneCount} of 15 flowers · Chapter {nextLesson.chapterNumber} is next
                </span>
              </div>

              {/* Garden Plot Grid */}
              <div className="mt-3 grid grid-cols-5 gap-x-2 gap-y-1 bg-[#A8D8BE] rounded-t-[26px] p-3 sm:p-4">
                {plots.map((pl, idx) => (
                  <div
                    key={idx}
                    className="h-[72px] flex items-end justify-center"
                    title={pl.title}
                  >
                    {pl.flower && (
                      <svg className="sway-flower" width="44" height="66" viewBox="0 0 40 60" aria-hidden="true">
                        <path d="M20 58 V 26" stroke="#4E9572" strokeWidth="3" />
                        <path d="M20 44 C 12 42, 8 36, 10 32 C 16 34, 19 38, 20 44z" fill="#6FB592" />
                        <g transform="translate(20 18)">
                          <ellipse rx="5" ry="9" cy="-7" fill={pl.color} />
                          <ellipse rx="5" ry="9" cy="-7" fill={pl.color} transform="rotate(72)" />
                          <ellipse rx="5" ry="9" cy="-7" fill={pl.color} transform="rotate(144)" />
                          <ellipse rx="5" ry="9" cy="-7" fill={pl.color} transform="rotate(216)" />
                          <ellipse rx="5" ry="9" cy="-7" fill={pl.color} transform="rotate(288)" />
                          <circle r="4.5" fill="#FFE08A" />
                        </g>
                      </svg>
                    )}
                    {pl.sprout && (
                      <svg width="34" height="42" viewBox="0 0 34 40" aria-hidden="true">
                        <path d="M17 38 V 18" stroke="#4E9572" strokeWidth="3" />
                        <path d="M17 26 C 9 24, 5 16, 8 10 C 14 14, 16 20, 17 26z" fill="#6FB592" />
                        <path d="M17 22 C 25 20, 29 12, 26 6 C 20 10, 18 16, 17 22z" fill="#8FC7A8" />
                        <ellipse cx="17" cy="38" rx="12" ry="3" fill="#7A5A44" />
                      </svg>
                    )}
                    {pl.empty && (
                      <svg width="40" height="14" viewBox="0 0 40 14" aria-hidden="true">
                        <ellipse cx="20" cy="9" rx="17" ry="5" fill="#8FC7A8" />
                      </svg>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {/* Certificate (4 cols) */}
            <section
              aria-labelledby="cert-h"
              className="lg:col-span-5 xl:col-span-4 bg-white border border-[#F1E4E8] rounded-[30px] p-5 flex flex-col justify-between gap-3 shadow-sm"
            >
              <h2 id="cert-h" className="font-bold text-base text-[#3D2C4A] m-0">My certificate</h2>
              <div className="border-4 border-double border-[#F4C3CC] rounded-2xl p-4 text-center bg-[#FFFAF6]">
                <div className="text-[10px] font-extrabold tracking-widest text-[#A8365A] uppercase">
                  CERTIFICATE OF CONFIDENCE
                </div>
                <div className="font-bold text-2xl text-[#3D2C4A] font-['Baloo_2',sans-serif] mt-1">
                  {currentLearner.name}
                </div>
                <div className="flex justify-center gap-2 mt-2.5">
                  {[0, 1, 2, 3].map((i) => (
                    <span
                      key={i}
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                        i < passedCount
                          ? 'bg-[#2F7F62] text-white'
                          : 'bg-[#F6F1F4] text-[#6E5B7A]'
                      }`}
                    >
                      {i < passedCount ? '✓' : i + 1}
                    </span>
                  ))}
                </div>
              </div>
              <div className="text-xs font-bold text-[#3D2C4A]">{passedCount} of 4 check-ins done</div>
              <div className="text-xs text-[#5E4B6B]">Each chapter check-in fills one seal.</div>
            </section>
          </div>

          {/* Journey Section */}
          <section aria-labelledby="journey-h" className="bg-white border border-[#F1E4E8] rounded-[30px] p-5 sm:p-6 shadow-sm">
            <h2 id="journey-h" className="text-xl sm:text-2xl font-bold text-[#3D2C4A] font-['Baloo_2',sans-serif] mb-3">
              My journey
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {chapters.map((ch) => (
                <Link
                  key={ch.n}
                  href={ch.isOpen ? `/dashboard/courses/chapter/${ch.id}` : '#'}
                  onClick={(e) => { if (!ch.isOpen) e.preventDefault(); }}
                  style={{ backgroundColor: ch.bg }}
                  className={`rounded-2xl p-4 flex flex-col gap-2 transition-all ${
                    ch.isCurrent ? 'ring-2 ring-[#9A4A16] shadow-sm' : ''
                  } ${ch.isOpen ? 'hover:scale-[1.02] cursor-pointer' : 'opacity-80 cursor-not-allowed'}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="w-9 h-9 rounded-full bg-white flex items-center justify-center shadow-xs">
                      {ch.isDone ? (
                        <Check size={18} className="text-[#24735A]" />
                      ) : ch.isCurrent ? (
                        <Heart size={18} className="text-[#9A4A16]" />
                      ) : (
                        <Lock size={16} className="text-[#8A7896]" />
                      )}
                    </span>
                    <span className="text-[11px] font-extrabold text-[#4A3A57]">{ch.status}</span>
                  </div>
                  <div className="text-[10px] font-bold text-[#4A3A57] uppercase tracking-wider">
                    CHAPTER {ch.n}
                  </div>
                  <div className="font-bold text-base font-['Baloo_2',sans-serif] text-[#3D2C4A] leading-tight">
                    {ch.title}
                  </div>
                  <div className="text-xs font-semibold text-[#4A3A57] mt-auto pt-1">{ch.meta}</div>
                </Link>
              ))}
            </div>
          </section>

          {/* Today's Sparks (Myth of Day, Mood Tracker, Gigi Quote) */}
          <section aria-label="Today's sparks" className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Myth of the Day */}
            <button
              type="button"
              onClick={handleFlipMyth}
              className={`text-left rounded-[26px] p-5 min-h-[170px] flex flex-col justify-between transition-all cursor-pointer shadow-sm ${
                mythOpen ? 'bg-[#3D2C4A] text-[#FFFAF6]' : 'bg-[#F9D5D3] text-[#3D2C4A]'
              }`}
            >
              <span className="text-[11px] font-bold tracking-wider uppercase">MYTH OF THE DAY</span>
              {!mythOpen ? (
                <>
                  <span className="font-bold text-lg leading-snug font-['Baloo_2',sans-serif]">
                    &ldquo;{todayMyth.statement}&rdquo;
                  </span>
                  <span className="text-xs font-bold text-[#A8365A] mt-auto">
                    Myth or fact? Tap to see →
                  </span>
                </>
              ) : (
                <>
                  <span className="font-bold text-xl text-[#FFE3CC] font-['Baloo_2',sans-serif]">
                    {todayMyth.verdict || 'Myth!'}
                  </span>
                  <span className="text-xs leading-relaxed">
                    {todayMyth.explanation} +5 petals!
                  </span>
                  <span className="text-[11px] font-semibold text-[#F9D5D3] mt-auto">
                    Tap to flip back
                  </span>
                </>
              )}
            </button>

            {/* How are you feeling */}
            <div className="bg-white border border-[#F1E4E8] rounded-[26px] p-5 flex flex-col justify-between gap-3 shadow-sm">
              <span className="text-[11px] font-bold tracking-wider text-[#3D2C4A] uppercase">
                HOW ARE YOU FEELING?
              </span>
              <div className="flex flex-wrap gap-2">
                {moods.map((md) => (
                  <button
                    key={md.label}
                    type="button"
                    onClick={() => setSelectedMood(md.label)}
                    style={{ backgroundColor: md.bg }}
                    className={`min-h-[38px] px-3.5 rounded-full text-xs font-bold text-[#3D2C4A] transition-all cursor-pointer ${
                      selectedMood === md.label ? 'ring-2 ring-[#3D2C4A] scale-105' : 'hover:opacity-90'
                    }`}
                  >
                    {md.label}
                  </button>
                ))}
              </div>
              <div className="text-xs text-[#5E4B6B] min-h-[32px] italic">
                {moodHit ? `${moodHit.reply} (Saved to your diary)` : 'Tap one. It goes to your private diary.'}
              </div>
            </div>

            {/* Gigi quote */}
            <div className="bg-[#FFF4C7] rounded-[26px] p-5 flex flex-col justify-between gap-2 shadow-sm">
              <span className="text-[11px] font-bold tracking-wider text-[#7A5A0C] uppercase">
                GIGI SAYS
              </span>
              <p className="font-bold text-base leading-snug text-[#3D2C4A] font-['Baloo_2',sans-serif] m-0">
                "Cramps aaye toh ek garam paani ki bottle aur thoda stretch. Try karke dekho!"
              </p>
              <span className="text-xs text-[#7A5A0C] leading-relaxed">
                A warm water bottle and a little stretch can help with cramps.
              </span>
            </div>
          </section>

          {/* Badges Section */}
          <section
            id="badges-h"
            aria-labelledby="badges-heading"
            className="bg-white border border-[#F1E4E8] rounded-[30px] p-5 sm:p-6 shadow-sm"
          >
            <div className="flex justify-between items-baseline mb-3">
              <h2 id="badges-heading" className="text-xl sm:text-2xl font-bold text-[#3D2C4A] font-['Baloo_2',sans-serif] m-0">
                My badges
              </h2>
              <Link href="/dashboard/badges" className="text-xs font-bold text-[#C2456A] hover:underline">
                View all badges →
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2.5">
              {badges.map((b, idx) => (
                <Link
                  key={idx}
                  href="/dashboard/badges"
                  style={{ backgroundColor: b.bg }}
                  className="rounded-2xl p-3 text-center flex flex-col items-center gap-1.5 transition-all shadow-xs hover:scale-103"
                >
                  <div className="w-8 h-8 rounded-full flex items-center justify-center">
                    {b.earned ? (
                      <Award size={22} style={{ color: b.ink }} />
                    ) : (
                      <Lock size={18} className="text-[#8A7896]" />
                    )}
                  </div>
                  <span className="text-[11px] font-bold text-[#3D2C4A] leading-tight">
                    {b.label}
                  </span>
                </Link>
              ))}
            </div>
          </section>
    </DaughterShell>
  );
}

