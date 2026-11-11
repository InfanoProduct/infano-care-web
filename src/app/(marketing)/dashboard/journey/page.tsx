'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { DaughterShell } from '@/features/daughter/DaughterShell';
import { useDaughterState } from '@/features/daughter/daughter-state';
import { Volume2, VolumeX, Lock, X, Play, Sparkles, CheckCircle2, Star } from 'lucide-react';
import { toast } from 'react-hot-toast';

const LESSONS = [
  ['1.1', 'The Menstrual Cycle', 'Build-a-Cycle Moon'],
  ['1.2', 'Menstruation and Puberty', 'Puberty Passport'],
  ['1.3', 'Flow and Irregularities', 'Flow Detective'],
  ['2.1', 'Importance of Hygiene', 'My Care Clock'],
  ['2.2', 'Menstrual Products & Sustainability', 'Product Matchmaker'],
  ['2.3', 'Usage and Disposal', 'Wrap It Right'],
  ['2.4', 'Hygiene in Public', 'School Day Surprise'],
  ['3.1', 'Understanding Discomfort', 'Comfort Toolbox'],
  ['3.2', 'Menstrual Disorders', 'Symptom Sorter'],
  ['3.3', 'Menstrual Infections', 'Germ Defender'],
  ['4.1', 'Safe School Environment', 'Upstander Choices'],
  ['4.2', 'Abuse and Touch', 'No, Go, Tell'],
  ['4.3', 'The POCSO Act', 'Know Your Rights'],
  ['4.4', 'Nurturing Positive Relationships', 'Green Flag, Red Flag'],
  ['4.5', 'Emotional Wellbeing', 'Mood Garden'],
] as const;

const WORLDS = [
  { name: 'Moon Meadow', bg: '#E3F0FA', cardBg: '#D8ECF8', col: '#8EBFE0', ink: '#2F6494', ch: 1 },
  { name: 'Care Cove', bg: '#E3F4EC', cardBg: '#D4EFE4', col: '#7FC3A3', ink: '#24735A', ch: 2 },
  { name: 'Comfort Hills', bg: '#FFEBDD', cardBg: '#FFE3CC', col: '#F0AF7E', ink: '#9A4A16', ch: 3 },
  { name: 'Brave Heart Valley', bg: '#EDE6F8', cardBg: '#E3DAF5', col: '#A992D6', ink: '#5A4385', ch: 4 },
];

const chOf = (i: number) => (i < 3 ? 0 : i < 7 ? 1 : i < 10 ? 2 : 3);
const COUNTS = [3, 4, 3, 5];
const STARTS = [0, 3, 7, 10];
const XS = [195, 300, 195, 90];

export default function JourneyMapPage() {
  const { doneCount, totalPetals, data, updateData } = useDaughterState();
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [sound, setSound] = useState(true);
  const [taps, setTaps] = useState(0);

  const currentIdx = Math.min(doneCount, LESSONS.length - 1);
  const currentChapter = chOf(currentIdx) + 1;

  // Compute SVG points for all 15 stepping stones
  const pts = LESSONS.map((_, i) => {
    const c = chOf(i);
    const k = i - STARTS[c];
    const n = COUNTS[c];
    const zoneBottom = 1640 - c * 410;
    const y = zoneBottom - 80 - k * (290 / (n - 1));
    return { x: XS[i % 4], y: Math.round(y) };
  });

  let pathD = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1];
    const b = pts[i];
    const my = Math.round((a.y + b.y) / 2);
    pathD += ` C ${a.x} ${my}, ${b.x} ${my}, ${b.x} ${b.y}`;
  }

  const cp = pts[currentIdx];
  const msgs = ["You're here!", 'Hee hee!', 'That tickles!', 'Keep going!', "Let's learn!"];
  const gigiSays = msgs[taps % msgs.length];

  const handleTapGigi = () => {
    const nextTaps = taps + 1;
    setTaps(nextTaps);
    if (nextTaps === 5 && !data.secretGigiBadgeFound) {
      updateData((prev) => ({
        ...prev,
        secretGigiBadgeFound: true,
        bonusPetals: prev.bonusPetals + 10,
      }));
      toast.success("Secret badge found: Gigi's Friend! +10 petals", { icon: '⭐' });
    }
  };

  const activeLesson =
    selectedIdx !== null
      ? (() => {
          const i = selectedIdx;
          const c = chOf(i);
          const done = i < currentIdx;
          const isCur = i === currentIdx;
          const locked = c === 3 && currentIdx < 10;
          const later = i > currentIdx && !locked;
          return {
            index: i,
            num: LESSONS[i][0],
            title: LESSONS[i][1],
            activity: LESSONS[i][2],
            world: WORLDS[c].name,
            bg: WORLDS[c].cardBg,
            ink: WORLDS[c].ink,
            done,
            isCur,
            isLocked: locked || later,
            canGo: !(locked || later),
            cta: done ? 'Watch again' : 'Start lesson',
          };
        })()
      : null;

  return (
    <DaughterShell gigiTip="Tap any glowing stepping stone to explore your lesson, or tap Gigi on the map for a surprise!">
      <style jsx global>{`
        @keyframes jmglow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(240, 175, 126, 0.7); }
          50% { box-shadow: 0 0 0 14px rgba(240, 175, 126, 0); }
        }
        @keyframes jmbob {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        .jm-glow { animation: jmglow 1.8s ease-in-out infinite; }
        .jm-bob { animation: jmbob 2.6s ease-in-out infinite; }
      `}</style>

      {/* Top Header */}
      <header className="flex flex-wrap items-center justify-between gap-3 bg-white/80 backdrop-blur-md rounded-3xl p-4 sm:p-5 border border-[#F1E4E8] shadow-xs sticky top-3 z-20">
        <div>
          <h1 className="m-0 font-['Baloo_2',sans-serif] text-2xl sm:text-3xl font-bold leading-tight text-[#3D2C4A]">
            My journey
          </h1>
          <div className="text-xs sm:text-sm font-semibold text-[#6E5B7A]">
            Chapter {currentChapter} of 4 · {doneCount} of {LESSONS.length} lessons completed
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/dashboard/badges/shop"
            className="inline-flex items-center gap-1.5 bg-[#FFFAF6] border border-[#F1E4E8] hover:border-[#C2456A] rounded-full px-3.5 py-1.5 font-bold text-sm shadow-2xs transition-colors"
          >
            <svg width="14" height="18" viewBox="0 0 16 22" aria-hidden="true">
              <ellipse cx="8" cy="11" rx="6" ry="10" fill="#F4A3B4" />
            </svg>
            <span>{totalPetals}</span>
          </Link>
          <button
            type="button"
            onClick={() => {
              setSound(!sound);
              toast(sound ? 'Map sounds muted' : 'Map sounds on!', { duration: 1500 });
            }}
            aria-pressed={sound}
            aria-label="Music and sounds"
            className="w-10 h-10 rounded-full border border-[#F1E4E8] bg-white hover:bg-[#FDEFF0] grid place-items-center text-[#3D2C4A] transition-colors cursor-pointer"
          >
            {sound ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>
        </div>
      </header>

      {/* Secret Badge Banner */}
      {data.secretGigiBadgeFound && (
        <div className="bg-[#3D2C4A] text-white rounded-2xl p-3.5 px-4 flex items-center gap-3 font-semibold text-sm shadow-md">
          <Star size={22} className="text-[#F2B544] fill-[#F2B544] shrink-0" />
          <span>Secret badge found: Gigi&apos;s Friend! (+10 petals added to your garden)</span>
        </div>
      )}

      {/* Quick Chapter Jump Bar */}
      <div className="flex flex-wrap gap-2">
        {WORLDS.map((w) => (
          <a
            key={w.ch}
            href={`#world-${w.ch}`}
            style={{ backgroundColor: w.cardBg, color: w.ink }}
            className="text-xs font-bold px-3.5 py-1.5 rounded-full hover:opacity-85 transition-opacity shadow-2xs"
          >
            {w.ch} · {w.name}
          </a>
        ))}
      </div>

      {/* Responsive Desktop Grid: Map (Left) + World Info & Selected Lesson Inspector (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Interactive Map Container (fluid width up to 540px on desktop) */}
        <div className="lg:col-span-7 flex justify-center">
          <div className="relative w-full max-w-[540px] h-[1640px] rounded-[34px] overflow-hidden shadow-lg border-2 border-[#F1E4E8] bg-[#FFFAF6]">
            {/* World Bands (Top: Chapter 4, Bottom: Chapter 1) */}
            <div id="world-4" className="absolute left-0 right-0 top-0 h-[410px] bg-[#EDE6F8]" />
            <div id="world-3" className="absolute left-0 right-0 top-[410px] h-[410px] bg-[#FFEBDD]" />
            <div id="world-2" className="absolute left-0 right-0 top-[820px] h-[410px] bg-[#E3F4EC]" />
            <div id="world-1" className="absolute left-0 right-0 top-[1230px] h-[410px] bg-[#E3F0FA]" />

            {/* Decorative Scenery + Curved Path SVG */}
            <svg
              aria-hidden="true"
              viewBox="0 0 390 1640"
              preserveAspectRatio="none"
              className="absolute inset-0 w-full h-full"
            >
              {/* Ch4 Valley */}
              <g opacity=".9">
                <circle cx="40" cy="80" r="26" fill="#D6C9F0" />
                <path d="M40 62c6-10 20-6 18 4-2 8-18 18-18 18s-16-10-18-18c-2-10 12-14 18-4z" fill="#C2B0E6" transform="translate(0 6)" />
                <rect x="38" y="104" width="4" height="40" fill="#B9A7DC" />
                <circle cx="350" cy="250" r="22" fill="#D6C9F0" />
                <rect x="348" y="268" width="4" height="34" fill="#B9A7DC" />
                <path d="M160 30 q35-30 70 0 v40 h-70z" fill="none" stroke="#C2B0E6" strokeWidth="6" />
              </g>
              {/* Ch3 Hills */}
              <path d="M0 760 C 80 700, 160 740, 220 720 S 340 690, 390 720 V820 H0z" fill="#FFDCC4" />
              <path d="M0 560 C 60 520, 120 560, 170 540 S 260 520, 300 540" stroke="#FFD2B3" strokeWidth="16" fill="none" strokeLinecap="round" />
              <g transform="translate(318 500)">
                <rect x="0" y="16" width="44" height="34" rx="4" fill="#FFF4C7" />
                <path d="M-6 18 L22 -4 L50 18z" fill="#F0AF7E" />
                <rect x="16" y="30" width="12" height="20" fill="#F7CDAA" />
              </g>
              {/* Ch2 Cove */}
              <path d="M0 1080 q30-14 60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0" stroke="#B9E1CF" strokeWidth="5" fill="none" />
              <path d="M0 1110 q30-14 60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0" stroke="#CDEBDD" strokeWidth="5" fill="none" />
              <g transform="translate(28 900)">
                <path d="M0 20 C 10 30, 40 30, 50 20 Z" fill="#7FC3A3" />
                <path d="M25 20 V0 L42 14z" fill="#FFFFFF" />
              </g>
              {/* Ch1 Meadow */}
              <path d="M330 1290a30 30 0 1 0 24 44 24 24 0 1 1-24-44z" fill="#FFF4C7" />
              <circle cx="60" cy="1300" r="3" fill="#FFFFFF" />
              <circle cx="110" cy="1270" r="2.5" fill="#FFFFFF" />
              <circle cx="270" cy="1420" r="3" fill="#FFFFFF" />
              <circle cx="40" cy="1500" r="2.5" fill="#FFFFFF" />

              {/* Chapter Gates */}
              <g transform="translate(167 1218)">
                <rect x="0" y="0" width="56" height="26" rx="6" fill="none" stroke="#7FB89A" strokeWidth="3" />
                <path d="M14 0v26M28 0v26M42 0v26" stroke="#7FB89A" strokeWidth="2" />
              </g>
              <g transform="translate(167 808)">
                <rect x="0" y="0" width="56" height="26" rx="6" fill="none" stroke="#7FB89A" strokeWidth="3" />
                <path d="M14 0v26M28 0v26M42 0v26" stroke="#7FB89A" strokeWidth="2" />
              </g>
              <g transform="translate(167 398)">
                <rect x="0" y="0" width="56" height="26" rx="6" fill="#F6F1F4" stroke="#C9B9C9" strokeWidth="3" />
                <path d="M14 0v26M28 0v26M42 0v26" stroke="#C9B9C9" strokeWidth="2" />
              </g>

              {/* Winding Path */}
              <path d={pathD} stroke="#FFFFFF" strokeWidth="22" fill="none" strokeLinecap="round" opacity=".9" />
              <path d={pathD} stroke="#E9DCC9" strokeWidth="3" fill="none" strokeDasharray="2 12" strokeLinecap="round" />

              {/* Festival Bloom at Top */}
              <g transform="translate(195 32)">
                <ellipse rx="10" ry="16" cy="-8" fill="#F4A3B4" />
                <ellipse rx="10" ry="16" cy="-8" fill="#E3DAF5" transform="rotate(72)" />
                <ellipse rx="10" ry="16" cy="-8" fill="#D4EFE4" transform="rotate(144)" />
                <ellipse rx="10" ry="16" cy="-8" fill="#FFE3CC" transform="rotate(216)" />
                <ellipse rx="10" ry="16" cy="-8" fill="#D8ECF8" transform="rotate(288)" />
                <circle r="6" fill="#E8738A" />
              </g>
            </svg>

            {/* World Labels */}
            <span className="absolute left-3.5 top-[1580px] text-[#2F6494] font-['Baloo_2',sans-serif] font-bold text-lg bg-white/80 rounded-full px-3 py-0.5 shadow-2xs">
              1 · Moon Meadow {currentIdx >= 3 ? '✓' : ''}
            </span>
            <span className="absolute left-3.5 top-[1170px] text-[#24735A] font-['Baloo_2',sans-serif] font-bold text-lg bg-white/80 rounded-full px-3 py-0.5 shadow-2xs">
              2 · Care Cove {currentIdx >= 7 ? '✓' : ''}
            </span>
            <span className="absolute left-3.5 top-[760px] text-[#9A4A16] font-['Baloo_2',sans-serif] font-bold text-lg bg-white rounded-full px-3 py-0.5 shadow-sm">
              3 · Comfort Hills {currentChapter === 3 ? '· now' : currentIdx >= 10 ? '✓' : ''}
            </span>
            <span className="absolute left-3.5 top-[350px] text-[#5A4385] font-['Baloo_2',sans-serif] font-bold text-lg bg-white/80 rounded-full px-3 py-0.5 shadow-2xs">
              4 · Brave Heart Valley
            </span>

            {/* Stepping Stones */}
            {LESSONS.map((l, i) => {
              const c = chOf(i);
              const done = i < currentIdx;
              const isCur = i === currentIdx;
              const locked = c === 3 && currentIdx < 10;
              const col = WORLDS[c].col;
              const isSelected = selectedIdx === i;

              return (
                <button
                  key={l[0]}
                  type="button"
                  onClick={() => setSelectedIdx(i)}
                  aria-label={`Lesson ${l[0]}: ${l[1]}`}
                  style={{
                    left: `calc(${((pts[i].x / 390) * 100).toFixed(2)}% - 29px)`,
                    top: `${pts[i].y - 29}px`,
                    borderColor: isSelected ? '#C2456A' : isCur ? '#F0AF7E' : done ? col : locked ? '#C9B9C9' : col,
                  }}
                  className={`absolute w-[58px] h-[58px] rounded-full grid place-items-center p-0 cursor-pointer transition-transform hover:scale-108 ${
                    done
                      ? 'bg-white border-[3px]'
                      : isCur
                      ? 'bg-[#FFF4C7] border-4 jm-glow'
                      : locked
                      ? 'bg-[#F6F1F4] border-2 border-dashed'
                      : 'bg-white border-[3px] border-dashed'
                  } ${isSelected ? 'ring-4 ring-[#C2456A]/25 scale-110' : ''}`}
                >
                  {done ? (
                    <svg width="34" height="34" viewBox="0 0 40 40" aria-hidden="true">
                      <g transform="translate(20 20)">
                        <ellipse rx="6" ry="10" cy="-8" fill={col} />
                        <ellipse rx="6" ry="10" cy="-8" fill={col} transform="rotate(72)" />
                        <ellipse rx="6" ry="10" cy="-8" fill={col} transform="rotate(144)" />
                        <ellipse rx="6" ry="10" cy="-8" fill={col} transform="rotate(216)" />
                        <ellipse rx="6" ry="10" cy="-8" fill={col} transform="rotate(288)" />
                        <circle r="5" fill="#FFE08A" />
                      </g>
                    </svg>
                  ) : locked ? (
                    <Lock size={18} className="text-[#8A7896]" />
                  ) : (
                    <span className="font-['Baloo_2',sans-serif] font-bold text-[17px] text-[#3D2C4A]">
                      {l[0]}
                    </span>
                  )}
                </button>
              );
            })}

            {/* Misty Lock Banner on Chapter 4 */}
            {currentIdx < 10 && (
              <>
                <div className="absolute left-0 right-0 top-[60px] h-[280px] bg-linear-to-b from-transparent to-white/45 pointer-events-none" />
                <div className="absolute left-1/2 top-[150px] -translate-x-1/2 bg-white/95 rounded-2xl px-3.5 py-2 text-xs font-bold text-[#5A4385] shadow-md whitespace-nowrap">
                  Opens after Comfort Hills
                </div>
              </>
            )}

            {/* Interactive Gigi Mascot */}
            <button
              type="button"
              onClick={handleTapGigi}
              aria-label="Tap Gigi"
              style={{ left: `calc(${((cp.x / 390) * 100).toFixed(2)}% + 34px)`, top: `${cp.y - 58}px` }}
              className="absolute jm-bob border-none bg-transparent p-0 cursor-pointer"
            >
              <svg width="62" height="70" viewBox="0 0 120 135" aria-hidden="true">
                <circle cx="60" cy="50" r="33" fill="#3D2C4A" />
                <circle cx="31" cy="26" r="11" fill="#3D2C4A" />
                <circle cx="89" cy="26" r="11" fill="#3D2C4A" />
                <circle cx="92" cy="20" r="5" fill="#F4A3B4" />
                <circle cx="60" cy="56" r="25" fill="#D9A07E" />
                <path d="M35 49 C 40 30, 80 30, 85 49 C 76 41, 46 41, 35 49z" fill="#3D2C4A" />
                <circle cx="51" cy="58" r="3" fill="#3D2C4A" />
                <circle cx="69" cy="58" r="3" fill="#3D2C4A" />
                <path d="M53 67 Q60 74 67 67" stroke="#3D2C4A" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                <path d="M30 135 C 32 98, 46 86, 60 86 C 74 86, 88 98, 90 135z" fill="#E3DAF5" />
              </svg>
            </button>
            <div
              style={{ left: `calc(${Math.min((cp.x / 390) * 100 + 23, 72).toFixed(2)}%)`, top: `${cp.y - 74}px` }}
              className="absolute bg-white rounded-2xl px-2.5 py-1 text-xs font-bold text-[#3D2C4A] shadow-md pointer-events-none"
            >
              {gigiSays}
            </div>
          </div>
        </div>

        {/* Desktop Right Side Inspector + Chapter Summary */}
        <div className="lg:col-span-5 flex flex-col gap-5 lg:sticky lg:top-28">
          {/* Active Lesson Inspector Card (Desktop + Inline) */}
          {activeLesson ? (
            <div className="bg-white rounded-[28px] p-6 border-2 border-[#C2456A]/20 shadow-lg flex flex-col gap-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <span
                  style={{ backgroundColor: activeLesson.bg, color: activeLesson.ink }}
                  className="rounded-full px-3.5 py-1 text-xs font-bold"
                >
                  Lesson {activeLesson.num} · {activeLesson.world}
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedIdx(null)}
                  aria-label="Close lesson preview"
                  className="w-8 h-8 rounded-full bg-[#FFFAF6] hover:bg-[#F1E4E8] grid place-items-center text-[#3D2C4A] cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <h2 className="m-0 font-['Baloo_2',sans-serif] font-bold text-2xl leading-tight text-[#3D2C4A]">
                {activeLesson.title}
              </h2>

              <div className="flex flex-wrap gap-2 text-xs font-semibold text-[#4A3A57]">
                <span className="bg-[#FBF8F6] border border-[#F1E4E8] rounded-xl px-3 py-1.5">
                  Video · about 15 min
                </span>
                <span className="bg-[#FBF8F6] border border-[#F1E4E8] rounded-xl px-3 py-1.5">
                  Play · {activeLesson.activity}
                </span>
              </div>

              {activeLesson.isLocked ? (
                <div className="bg-[#F6F1F4] rounded-2xl p-3.5 text-sm font-medium text-[#5E4B6B] flex items-start gap-2.5">
                  <Lock size={18} className="shrink-0 mt-0.5 text-[#8A7896]" />
                  <span>This one opens after you finish the lessons before it. You&apos;re doing great!</span>
                </div>
              ) : (
                <Link
                  href="/dashboard/learning-journeys"
                  className="flex justify-center items-center gap-2 min-h-[52px] rounded-full bg-[#C2456A] hover:bg-[#A8365A] text-white font-bold text-base shadow-md transition-colors"
                >
                  <Play size={16} fill="currentColor" />
                  <span>{activeLesson.cta}</span>
                </Link>
              )}
            </div>
          ) : (
            <div className="bg-[#FFE3CC] rounded-[28px] p-6 flex flex-col gap-3 shadow-xs">
              <div className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-[#9A4A16]">
                <Sparkles size={14} />
                <span>Next on your path</span>
              </div>
              <h2 className="font-['Baloo_2',sans-serif] font-bold text-2xl text-[#3D2C4A] m-0">
                {LESSONS[currentIdx][0]} · {LESSONS[currentIdx][1]}
              </h2>
              <p className="text-sm text-[#5E4B6B] m-0">
                Tap any stepping stone on the journey map to inspect its video and interactive game.
              </p>
              <button
                type="button"
                onClick={() => setSelectedIdx(currentIdx)}
                className="mt-1 self-start min-h-[44px] px-5 rounded-full bg-[#C2456A] hover:bg-[#A8365A] text-white font-bold text-sm cursor-pointer transition-colors"
              >
                Inspect Lesson {LESSONS[currentIdx][0]}
              </button>
            </div>
          )}

          {/* World Progress Cards */}
          <div className="bg-white rounded-[28px] p-5 border border-[#F1E4E8] shadow-xs flex flex-col gap-3">
            <h3 className="m-0 font-bold text-base text-[#3D2C4A]">Worlds on your map</h3>
            {WORLDS.map((w, idx) => {
              const start = STARTS[idx];
              const count = COUNTS[idx];
              const doneInWorld = Math.max(0, Math.min(count, currentIdx - start));
              const isDone = doneInWorld === count;
              const isCur = idx === currentChapter - 1;

              return (
                <div
                  key={w.name}
                  onClick={() => setSelectedIdx(start)}
                  className="flex items-center gap-3 p-3 rounded-2xl border border-[#F1E4E8] hover:border-[#C2456A]/40 cursor-pointer transition-all"
                >
                  <div
                    style={{ backgroundColor: w.cardBg, color: w.ink }}
                    className="w-10 h-10 rounded-full font-extrabold text-sm grid place-items-center shrink-0"
                  >
                    {w.ch}
                  </div>
                  <div className="flex-1 min-w-0">
                    <strong className="block text-sm font-bold text-[#3D2C4A]">{w.name}</strong>
                    <span className="text-xs text-[#6E5B7A]">
                      {doneInWorld} of {count} lessons
                    </span>
                  </div>
                  {isDone ? (
                    <span className="text-xs font-bold text-[#24735A] bg-[#D4EFE4] px-2.5 py-1 rounded-full inline-flex items-center gap-1">
                      <CheckCircle2 size={12} /> Done
                    </span>
                  ) : isCur ? (
                    <span className="text-xs font-bold text-[#9A4A16] bg-[#FFE3CC] px-2.5 py-1 rounded-full">
                      Active
                    </span>
                  ) : (
                    <Lock size={15} className="text-[#8A7896]" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Mobile Bottom Sheet when Lesson Selected */}
      {activeLesson && (
        <div className="lg:hidden fixed inset-0 z-40 flex items-end bg-[#3D2C4A]/35 backdrop-blur-xs">
          <div className="w-full bg-white rounded-t-[28px] p-5 pb-8 flex flex-col gap-3 shadow-2xl animate-in slide-in-from-bottom duration-200">
            <div className="flex justify-between items-center">
              <span
                style={{ backgroundColor: activeLesson.bg, color: activeLesson.ink }}
                className="rounded-full px-3 py-1 text-xs font-bold"
              >
                Lesson {activeLesson.num} · {activeLesson.world}
              </span>
              <button
                type="button"
                onClick={() => setSelectedIdx(null)}
                aria-label="Close"
                className="w-9 h-9 rounded-full bg-[#FFFAF6] grid place-items-center text-[#3D2C4A]"
              >
                <X size={16} />
              </button>
            </div>
            <h2 className="m-0 font-['Baloo_2',sans-serif] font-bold text-2xl text-[#3D2C4A]">
              {activeLesson.title}
            </h2>
            <div className="flex flex-wrap gap-2 text-xs font-semibold text-[#4A3A57]">
              <span className="bg-[#FBF8F6] rounded-xl px-2.5 py-1.5">Video · about 15 min</span>
              <span className="bg-[#FBF8F6] rounded-xl px-2.5 py-1.5">Play · {activeLesson.activity}</span>
            </div>
            {activeLesson.isLocked ? (
              <div className="bg-[#F6F1F4] rounded-2xl p-3 text-sm font-medium text-[#5E4B6B]">
                This one opens after you finish the lessons before it. You&apos;re doing great!
              </div>
            ) : (
              <Link
                href="/dashboard/learning-journeys"
                className="flex justify-center items-center min-h-[52px] rounded-full bg-[#C2456A] text-white font-bold text-base"
              >
                {activeLesson.cta}
              </Link>
            )}
          </div>
        </div>
      )}
    </DaughterShell>
  );
}

