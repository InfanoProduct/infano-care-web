'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { DaughterShell } from '@/features/daughter/DaughterShell';
import { useDaughterState } from '@/features/daughter/daughter-state';
import { X, Check, Lock, Sparkles, ArrowRight } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface BadgeDef {
  id: string;
  shelf: 'Journey' | 'Chapters' | 'Skills' | 'Secret';
  label: string;
  iconPath: string;
  bg: string;
  ink: string;
  state: 'earned' | 'secret' | string;
  progress: number;
  description: string;
  learned?: string[];
  quizScore?: string;
  unlockedItem?: { name: string; sub: string };
}

const ICONS = {
  sprout: 'M12 21v-9M12 12C12 8 9 5 5 5c0 4 3 7 7 7zM12 12c0-3 2-6 6-6 0 3-2 6-6 6',
  flower: 'M12 7a2 2 0 1 0 0-.1M12 7c-3-4-7 0-3 3M12 7c3-4 7 0 3 3M9 10c-4 1-3 6 2 4M15 10c4 1 3 6-2 4M12 14v7',
  half: 'M4 20h16M7 20v-5M12 20V9M17 20v-7',
  bouquet: 'M12 22l-4-8h8zM8 9a2 2 0 1 0 0-.1M16 9a2 2 0 1 0 0-.1M12 6a2 2 0 1 0 0-.1',
  moon: 'M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z',
  leaf: 'M5 19c0-8 6-14 14-14 0 8-6 14-14 14zM5 19l7-7',
  heart: 'M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10z',
  shield: 'M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z',
  bubble: 'M12 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM9 9l2 2M14 13l1 1M8 14l1-1',
  star: 'M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z',
  pouch: 'M4 8h16v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2zM9 8V6a3 3 0 0 1 6 0v2',
  breath: 'M12 21c-4-3-6-6-6-9a6 6 0 0 1 12 0c0 3-2 6-6 9zM3 8c2 0 3 1 3 3M21 8c-2 0-3 1-3 3',
  bulb: 'M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2V16h5v-.1c0-.8.4-1.5 1-2A6 6 0 0 0 12 3z',
  pencil: 'M4 20l4-1 11-11-3-3L5 16zM14 6l3 3',
  suns: 'M6 12a2 2 0 1 0 0-.1M12 12a2 2 0 1 0 0-.1M18 12a2 2 0 1 0 0-.1',
  gift: 'M3 9h18v4H3zM5 13h14v8H5zM12 9v12M12 9c-2-4-6-4-6-1s6 1 6 1zm0 0c2-4 6-4 6-1s-6 1-6 1z',
};

export default function BadgesShelfPage() {
  const { doneCount, totalPetals, data, updateData } = useDaughterState();
  const [selectedBadge, setSelectedBadge] = useState<BadgeDef | null>(null);

  const journalCount = data.journalEntries.length;

  const ALL_BADGES: BadgeDef[] = [
    // Journey
    {
      id: 'seedling',
      shelf: 'Journey',
      label: 'Seedling',
      iconPath: ICONS.sprout,
      bg: '#D4EFE4',
      ink: '#24735A',
      state: doneCount >= 1 ? 'earned' : '0 of 1',
      progress: Math.min(1, doneCount / 1),
      description: 'You planted your very first sprout in Infano!',
      learned: ['Completed your first puberty lesson', 'Started growing your Bloom Garden'],
    },
    {
      id: 'first-bloom',
      shelf: 'Journey',
      label: 'First Bloom',
      iconPath: ICONS.flower,
      bg: '#F9D5D3',
      ink: '#A8365A',
      state: doneCount >= 3 ? 'earned' : `${doneCount} of 3`,
      progress: Math.min(1, doneCount / 3),
      description: 'Your first full chapter blossomed into a bright meadow flower!',
      learned: ['Finished all Moon Meadow lessons', 'Built confidence about body changes'],
    },
    {
      id: 'half-garden',
      shelf: 'Journey',
      label: 'Half Garden',
      iconPath: ICONS.half,
      bg: '#D4EFE4',
      ink: '#24735A',
      state: doneCount >= 8 ? 'earned' : `${doneCount} of 8`,
      progress: Math.min(1, doneCount / 8),
      description: 'Over halfway through the 15-lesson Confidence Journey!',
      learned: ['8 lessons completed across chapters'],
    },
    {
      id: 'full-bloom',
      shelf: 'Journey',
      label: 'Full Bloom',
      iconPath: ICONS.bouquet,
      bg: '#FFE3CC',
      ink: '#9A4A16',
      state: doneCount >= 15 ? 'earned' : `${doneCount} of 15`,
      progress: Math.min(1, doneCount / 15),
      description: 'All 15 flowers blooming in your garden. You earned your Certificate of Confidence!',
      learned: ['Completed all 4 chapters of Infano Care'],
    },
    // Chapters
    {
      id: 'cycle-explorer',
      shelf: 'Chapters',
      label: 'Cycle Explorer',
      iconPath: ICONS.moon,
      bg: '#D8ECF8',
      ink: '#2F6494',
      state: doneCount >= 3 ? 'earned' : `${Math.min(doneCount, 3)} of 3`,
      progress: Math.min(1, doneCount / 3),
      description:
        "You passed the Moon Quiz and can explain the menstrual cycle in your own words. That's a big deal!",
      learned: [
        'The 4 phases of the cycle',
        'How periods fit into puberty',
        "What's normal, and when to tell a grown-up",
      ],
      quizScore: '9/10',
      unlockedItem: { name: 'Moon lantern', sub: 'A glowing decoration for your garden, in the shop' },
    },
    {
      id: 'care-captain',
      shelf: 'Chapters',
      label: 'Care Captain',
      iconPath: ICONS.leaf,
      bg: '#D4EFE4',
      ink: '#24735A',
      state: doneCount >= 7 ? 'earned' : `${Math.max(0, Math.min(4, doneCount - 3))} of 4`,
      progress: Math.max(0, Math.min(1, (doneCount - 3) / 4)),
      description: 'Mastered menstrual hygiene, product choices, and caring for yourself at school!',
      learned: ['How often to change products', 'Eco-friendly choices', 'School preparedness checklist'],
      quizScore: '10/10',
    },
    {
      id: 'body-listener',
      shelf: 'Chapters',
      label: 'Body Listener',
      iconPath: ICONS.heart,
      bg: '#FFE3CC',
      ink: '#9A4A16',
      state: doneCount >= 10 ? 'earned' : `${Math.max(0, doneCount - 7)} of 3`,
      progress: Math.max(0.02, Math.min(1, (doneCount - 7) / 3)),
      description: 'Finish Comfort Hills (Chapter 3) to unlock this badge and the Lotus pot.',
      learned: ['Managing cramps & discomfort', 'Understanding cycle patterns'],
    },
    {
      id: 'brave-heart',
      shelf: 'Chapters',
      label: 'Brave Heart',
      iconPath: ICONS.shield,
      bg: '#E3DAF5',
      ink: '#5A4385',
      state: doneCount >= 15 ? 'earned' : 'Chapter 4',
      progress: Math.max(0, Math.min(1, (doneCount - 10) / 5)),
      description: 'Finish Brave Heart Valley (Chapter 4) to unlock this badge and build your Safe Circle.',
      learned: ['Setting safe boundaries', 'Knowing your rights', 'Emotional wellbeing'],
    },
    // Skills
    {
      id: 'myth-buster',
      shelf: 'Skills',
      label: 'Myth Buster',
      iconPath: ICONS.bubble,
      bg: '#F9D5D3',
      ink: '#A8365A',
      state: 'earned',
      progress: 1,
      description: 'Flipped through Myth of the Day cards and separated science from myths!',
    },
    {
      id: 'kit-packer',
      shelf: 'Skills',
      label: 'Kit Packer',
      iconPath: ICONS.pouch,
      bg: '#FFE3CC',
      ink: '#9A4A16',
      state: 'earned',
      progress: 1,
      description: 'Completed the Care Cove school pouch readiness challenge.',
    },
    {
      id: 'steady-learner',
      shelf: 'Skills',
      label: 'Steady Learner',
      iconPath: ICONS.suns,
      bg: '#FFF4C7',
      ink: '#8A6410',
      state: 'earned',
      progress: 1,
      description: 'Showed up for learning across multiple days this week!',
    },
    {
      id: 'quiz-whiz',
      shelf: 'Skills',
      label: 'Quiz Whiz',
      iconPath: ICONS.star,
      bg: '#FFF4C7',
      ink: '#8A6410',
      state: 'Score 10/10',
      progress: 0.5,
      description: 'Get 10 out of 10 on any chapter check-in quiz.',
    },
    {
      id: 'reflective-writer',
      shelf: 'Skills',
      label: 'Reflective Writer',
      iconPath: ICONS.pencil,
      bg: '#E3DAF5',
      ink: '#5A4385',
      state: journalCount >= 5 ? 'earned' : `${journalCount} of 5`,
      progress: Math.min(1, journalCount / 5),
      description: 'Write 5 reflections in your private journal.',
    },
    {
      id: 'deep-thinker',
      shelf: 'Skills',
      label: 'Deep Thinker',
      iconPath: ICONS.bulb,
      bg: '#D8ECF8',
      ink: '#2F6494',
      state: '6 of 9',
      progress: 6 / 9,
      description: 'Explore Discover cards across 9 lessons.',
    },
    {
      id: 'calm-breather',
      shelf: 'Skills',
      label: 'Calm Breather',
      iconPath: ICONS.breath,
      bg: '#E3DAF5',
      ink: '#5A4385',
      state: '0 of 5',
      progress: 0,
      description: 'Use the Breathing Flower calm exercise 5 times.',
    },
    // Secret
    {
      id: 'gigi-friend',
      shelf: 'Secret',
      label: data.secretGigiBadgeFound ? "Gigi's Friend" : 'Secret',
      iconPath: data.secretGigiBadgeFound ? ICONS.star : ICONS.gift,
      bg: '#FFF4C7',
      ink: '#8A6410',
      state: data.secretGigiBadgeFound ? 'earned' : 'secret',
      progress: data.secretGigiBadgeFound ? 1 : 0,
      description: data.secretGigiBadgeFound
        ? 'You tapped Gigi on your journey map and made her giggle!'
        : 'Hint: Look closely at Gigi on your Journey Map and give her a few taps!',
    },
    {
      id: 'secret-2',
      shelf: 'Secret',
      label: 'Secret',
      iconPath: ICONS.gift,
      bg: '#FFF4C7',
      ink: '#8A6410',
      state: 'secret',
      progress: 0,
      description: 'Keep exploring Infano to discover this hidden surprise badge!',
    },
    {
      id: 'secret-3',
      shelf: 'Secret',
      label: 'Secret',
      iconPath: ICONS.gift,
      bg: '#FFF4C7',
      ink: '#8A6410',
      state: 'secret',
      progress: 0,
      description: 'Keep exploring Infano to discover this hidden surprise badge!',
    },
  ];

  const earnedTotal = ALL_BADGES.filter((b) => b.state === 'earned').length;
  const shelves: Array<'Journey' | 'Chapters' | 'Skills' | 'Secret'> = ['Journey', 'Chapters', 'Skills', 'Secret'];
  const C = 2 * Math.PI * 35;

  const toggleShowParents = (badgeId: string) => {
    const nextState = !data.sharedBadges[badgeId];
    updateData((prev) => ({
      ...prev,
      sharedBadges: { ...prev.sharedBadges, [badgeId]: nextState },
    }));
    if (nextState) {
      toast.success('Added to Mom/Dad highlight shelf!', { icon: '💜' });
    }
  };

  return (
    <DaughterShell gigiTip="Badges celebrate everything you explore! Tap any badge to see what you learned or visit the Garden Shop.">
      <style jsx global>{`
        @keyframes bsshine { 0%,100% { filter: brightness(1); } 50% { filter: brightness(1.08); } }
        @keyframes bswig { 0%,80%,100% { transform: rotate(0); } 85% { transform: rotate(-6deg); } 90% { transform: rotate(6deg); } }
        @keyframes bdfloat { 0%,100% { transform: translateY(0) rotate(-3deg); } 50% { transform: translateY(-8px) rotate(3deg); } }
        .bs-shine { animation: bsshine 3s ease-in-out infinite; }
        .bs-wig { transform-box: fill-box; transform-origin: 50% 100%; animation: bswig 2.6s ease-in-out infinite; }
        .bd-float { animation: bdfloat 4s ease-in-out infinite; }
      `}</style>

      {/* Header */}
      <header className="flex flex-col gap-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="m-0 font-['Baloo_2',sans-serif] font-bold text-3xl sm:text-4xl leading-tight text-[#3D2C4A]">
              My badges
            </h1>
            <div className="text-sm font-semibold text-[#6E5B7A]">
              {earnedTotal} of {ALL_BADGES.length} collected
            </div>
          </div>

          <svg width="64" height="64" viewBox="0 0 120 135" aria-hidden="true" className="shrink-0">
            <circle cx="60" cy="50" r="33" fill="#3D2C4A" />
            <circle cx="31" cy="26" r="11" fill="#3D2C4A" />
            <circle cx="89" cy="26" r="11" fill="#3D2C4A" />
            <circle cx="60" cy="56" r="25" fill="#D9A07E" />
            <path d="M35 49 C 40 30, 80 30, 85 49 C 76 41, 46 41, 35 49z" fill="#3D2C4A" />
            <circle cx="51" cy="58" r="3" fill="#3D2C4A" />
            <circle cx="69" cy="58" r="3" fill="#3D2C4A" />
            <path d="M51 66 Q60 76 69 66" stroke="#3D2C4A" strokeWidth="2.5" fill="#FFFFFF" strokeLinecap="round" />
            <path d="M30 135 C 32 98, 46 86, 60 86 C 74 86, 88 98, 90 135z" fill="#FFF4C7" />
          </svg>
        </div>

        {/* Garden Shop Banner */}
        <Link
          href="/dashboard/badges/shop"
          className="flex items-center gap-3 sm:gap-4 bg-[#FDEFF0] hover:bg-[#FCE2E5] border border-[#F1E4E8] rounded-[24px] p-4 sm:p-5 text-[#3D2C4A] transition-colors shadow-xs"
        >
          <svg width="34" height="40" viewBox="0 0 16 22" aria-hidden="true" className="shrink-0">
            <ellipse cx="8" cy="11" rx="6" ry="10" fill="#F4A3B4" />
          </svg>
          <div className="flex-1 min-w-0">
            <span className="block font-['Baloo_2',sans-serif] font-bold text-2xl leading-none text-[#3D2C4A]">
              {totalPetals} petals
            </span>
            <span className="text-xs sm:text-sm text-[#5E4B6B] block mt-1">
              Spend them to decorate your garden and unlock looks
            </span>
          </div>
          <span className="bg-[#C2456A] text-white rounded-full px-4 py-2 font-bold text-xs sm:text-sm shrink-0 shadow-xs">
            Garden shop
          </span>
        </Link>
      </header>

      {/* Badge Shelves */}
      <div className="flex flex-col gap-6">
        {shelves.map((shelfName) => {
          const items = ALL_BADGES.filter((b) => b.shelf === shelfName);
          const earnedCount = items.filter((b) => b.state === 'earned').length;

          return (
            <section key={shelfName} className="bg-white border border-[#F1E4E8] rounded-[28px] p-5 shadow-xs">
              <h2 className="m-0 mb-4 text-base sm:text-lg font-bold flex justify-between items-baseline text-[#3D2C4A]">
                <span>{shelfName}</span>
                <span className="text-xs font-semibold text-[#6E5B7A]">
                  {earnedCount} of {items.length}
                </span>
              </h2>

              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {items.map((b) => {
                  const earned = b.state === 'earned';
                  const secret = b.state === 'secret';
                  const p = earned ? 1 : b.progress;
                  const fill = earned ? b.bg : secret ? '#FFF4C7' : '#F6F1F4';
                  const ink = earned ? b.ink : secret ? '#B89A3A' : '#8A7896';
                  const rim = earned ? '#FFFFFF' : secret ? '#E8C55A' : '#C2456A';
                  const dash = secret ? '4 6' : `${(p * C).toFixed(1)} ${C.toFixed(1)}`;
                  const statusLabel = earned ? 'Earned' : secret ? 'Keep exploring!' : b.state;

                  return (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => setSelectedBadge(b)}
                      className="flex flex-col items-center gap-1.5 text-center pb-3 border-b-8 border-[#E8C9AE] rounded-b-md hover:-translate-y-1 transition-transform cursor-pointer group bg-transparent"
                    >
                      <span
                        className={`relative w-[78px] h-[78px] grid place-items-center ${
                          earned ? 'bs-shine' : secret ? 'bs-wig' : ''
                        }`}
                      >
                        <svg width="78" height="78" viewBox="0 0 80 80" aria-hidden="true" className="absolute inset-0">
                          <circle cx="40" cy="40" r="35" fill={fill} />
                          <circle
                            cx="40"
                            cy="40"
                            r="35"
                            fill="none"
                            stroke={rim}
                            strokeWidth="4"
                            strokeDasharray={dash}
                            transform="rotate(-90 40 40)"
                            strokeLinecap="round"
                          />
                        </svg>
                        <svg
                          width="34"
                          height="34"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke={ink}
                          strokeWidth="1.9"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                          className="relative"
                        >
                          <path d={b.iconPath} />
                        </svg>
                      </span>
                      <span className="text-xs font-bold text-[#3D2C4A] leading-tight group-hover:text-[#A8365A]">
                        {b.label}
                      </span>
                      <span className="text-[11px] font-semibold text-[#6E5B7A]">{statusLabel}</span>
                    </button>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>

      {/* Privacy Notice */}
      <div className="bg-[#F1ECFA] rounded-2xl p-4 text-sm text-[#3D2C4A] text-center font-medium">
        Badges celebrate what you learn. No one else can see your shelf unless you tap &ldquo;Show Mom/Dad&rdquo;.
      </div>

      {/* B2 Badge Detail Modal */}
      {selectedBadge && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#3D2C4A]/45 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in"
          onClick={() => setSelectedBadge(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[440px] md:max-w-[740px] max-h-[90vh] overflow-y-auto bg-[#FFFAF6] rounded-t-[36px] sm:rounded-[36px] shadow-2xl flex flex-col md:flex-row animate-in slide-in-from-bottom sm:zoom-in-95 duration-200"
          >
            {/* Header Artwork */}
            <div
              style={{ backgroundColor: selectedBadge.bg }}
              className="p-5 pb-7 md:p-7 md:w-[270px] shrink-0 rounded-b-[40px] md:rounded-b-none md:rounded-r-[40px] flex flex-col items-center justify-center text-center gap-2 relative"
            >
              <button
                type="button"
                onClick={() => setSelectedBadge(null)}
                aria-label="Back to badges"
                className="self-start md:absolute md:top-5 md:left-5 w-10 h-10 rounded-full bg-white/85 grid place-items-center text-[#3D2C4A] hover:bg-white cursor-pointer"
              >
                <X size={18} />
              </button>

              <div className="bd-float w-32 h-32 md:w-36 md:h-36 rounded-full bg-white/90 border-4 border-white shadow-md grid place-items-center md:mt-6">
                <svg
                  width="64"
                  height="64"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke={selectedBadge.ink}
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d={selectedBadge.iconPath} />
                </svg>
              </div>

              <h2 className="m-0 font-['Baloo_2',sans-serif] font-bold text-3xl text-[#3D2C4A] leading-tight mt-1">
                {selectedBadge.label}
              </h2>
              <div style={{ color: selectedBadge.ink }} className="text-xs font-bold">
                {selectedBadge.shelf} badge ·{' '}
                {selectedBadge.state === 'earned'
                  ? 'Earned ✓'
                  : selectedBadge.state === 'secret'
                  ? 'Hidden surprise'
                  : selectedBadge.state}
              </div>
            </div>

            {/* Body */}
            <div className="p-5 sm:p-6 md:p-7 flex-1 flex flex-col justify-between gap-4">
              <p className="m-0 text-sm sm:text-base text-[#3D2C4A] leading-relaxed">
                {selectedBadge.description}
              </p>

              {selectedBadge.learned && selectedBadge.learned.length > 0 && (
                <section className="bg-white border border-[#F1E4E8] rounded-2xl p-4">
                  <h3 className="m-0 mb-2.5 text-sm font-bold text-[#3D2C4A]">What you learned</h3>
                  <ul className="m-0 p-0 list-none flex flex-col gap-2 text-sm">
                    {selectedBadge.learned.map((line) => (
                      <li key={line} className="flex items-center gap-2.5">
                        <span
                          style={{ backgroundColor: selectedBadge.bg, color: selectedBadge.ink }}
                          className="w-5 h-5 rounded-full grid place-items-center text-xs font-bold shrink-0"
                        >
                          <Check size={12} />
                        </span>
                        <span>{line}</span>
                      </li>
                    ))}
                  </ul>
                  {selectedBadge.quizScore && (
                    <div style={{ color: selectedBadge.ink }} className="mt-3 text-xs font-bold">
                      Quiz score: {selectedBadge.quizScore}
                    </div>
                  )}
                </section>
              )}

              {selectedBadge.unlockedItem && (
                <Link
                  href="/dashboard/badges/shop"
                  className="flex items-center gap-3 bg-[#FFF4C7] hover:bg-[#FCEBA8] rounded-2xl p-3.5 text-[#3D2C4A] transition-colors"
                >
                  <Sparkles size={24} className="text-[#8A6410] shrink-0" />
                  <div className="flex-1">
                    <strong className="block text-sm font-bold">Unlocked: {selectedBadge.unlockedItem.name}</strong>
                    <span className="text-xs text-[#5E4B6B]">{selectedBadge.unlockedItem.sub}</span>
                  </div>
                  <ArrowRight size={18} />
                </Link>
              )}

              {selectedBadge.state === 'earned' ? (
                <button
                  type="button"
                  onClick={() => toggleShowParents(selectedBadge.id)}
                  className={`min-h-[50px] rounded-full font-bold text-sm border-2 transition-all cursor-pointer ${
                    data.sharedBadges[selectedBadge.id]
                      ? 'bg-[#EAF7F1] border-[#24735A] text-[#24735A]'
                      : 'bg-white border-[#3D2C4A] text-[#3D2C4A] hover:bg-[#3D2C4A] hover:text-white'
                  }`}
                >
                  {data.sharedBadges[selectedBadge.id] ? '✓ Shown to Mom/Dad' : 'Show Mom/Dad'}
                </button>
              ) : (
                <Link
                  href="/dashboard/journey"
                  className="flex justify-center items-center min-h-[50px] rounded-full bg-[#C2456A] hover:bg-[#A8365A] text-white font-bold text-sm shadow-md"
                >
                  Explore Journey to unlock
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </DaughterShell>
  );
}

