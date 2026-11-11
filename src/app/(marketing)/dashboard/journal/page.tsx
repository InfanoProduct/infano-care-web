'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { DaughterShell } from '@/features/daughter/DaughterShell';
import { useDaughterState } from '@/features/daughter/daughter-state';
import { Lock, MessageCircle, X, ArrowLeft, Shield, Heart, Sparkles, Pencil } from 'lucide-react';
import { toast } from 'react-hot-toast';

const STICKERS = [
  { name: 'Sun', bg: '#FFF4C7', icon: 'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM12 2v3M12 19v3M2 12h3M19 12h3' },
  { name: 'Heart', bg: '#F9D5D3', icon: 'M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10z' },
  { name: 'Star', bg: '#D8ECF8', icon: 'M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z' },
  { name: 'Moon', bg: '#E3DAF5', icon: 'M20 14A8 8 0 0 1 10 4a8 8 0 1 0 10 10z' },
  { name: 'Leaf', bg: '#D4EFE4', icon: 'M5 19C5 10 11 5 20 4c0 9-5 15-14 15zM5 19l8-8' },
  { name: 'Cloud', bg: '#FFE3CC', icon: 'M7 18h10a4 4 0 0 0 0-8 6 6 0 0 0-11.5 1.5A3.5 3.5 0 0 0 7 18z' },
];

const STARTERS = ['I smiled when…', 'Today my body felt…', 'I’m proud that…'];

function JournalPageContent() {
  const searchParams = useSearchParams();
  const { currentLearner, data, updateData } = useDaughterState();

  const [mode, setMode] = useState<'home' | 'write' | 'worry'>('home');
  const [helpOpen, setHelpOpen] = useState(false);

  // JR2 Write state
  const [writeText, setWriteText] = useState('');
  const [stickerIdx, setStickerIdx] = useState(1);
  const [writeSaved, setWriteSaved] = useState(false);

  // JR3 Worry Jar state
  const [worryStep, setWorryStep] = useState<'write' | 'choose' | 'released' | 'helping'>('write');
  const [worryText, setWorryText] = useState('');

  useEffect(() => {
    const t = searchParams.get('tab');
    if (t === 'worry') setMode('worry');
    else if (t === 'write') setMode('write');
  }, [searchParams]);

  const wordCount = writeText.trim() ? writeText.trim().split(/\s+/).length : 0;

  const handleSaveEntry = () => {
    if (!writeText.trim()) {
      toast.error('Write a few words first!');
      return;
    }
    const todayStr = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    updateData((prev) => ({
      ...prev,
      bonusPetals: prev.bonusPetals + 5,
      journalEntries: [
        {
          id: `jr-${Date.now()}`,
          chapterTitle: 'MY REFLECTIONS',
          chapterColor: '#A8365A',
          meta: `Today · ${todayStr}`,
          text: writeText.trim(),
          stickerIndex: stickerIdx,
          createdAt: new Date().toISOString(),
        },
        ...prev.journalEntries,
      ],
    }));
    setWriteSaved(true);
    toast.success('Saved & locked! +5 petals 💜');
  };

  const handleFoldWorry = () => {
    if (!worryText.trim()) {
      toast.error("Write what's on your mind first");
      return;
    }
    updateData((prev) => ({
      ...prev,
      worryJarCount: prev.worryJarCount + 1,
      worriesList: [worryText.trim(), ...prev.worriesList],
    }));
    setWorryStep('choose');
  };

  // Group journal entries
  const groupedEntries = data.journalEntries.reduce<Record<string, { color: string; items: typeof data.journalEntries }>>(
    (acc, item) => {
      if (!acc[item.chapterTitle]) {
        acc[item.chapterTitle] = { color: item.chapterColor, items: [] };
      }
      acc[item.chapterTitle].items.push(item);
      return acc;
    },
    {}
  );

  // Worry Jar Slips colors
  const slipColors = ['#FFF4C7', '#F9D5D3', '#D4EFE4', '#E3DAF5', '#FFE3CC', '#D8ECF8'];
  const visibleSlips = Math.min(data.worryJarCount, 10);

  return (
    <DaughterShell gigiTip="Only you can read your journal and Worry Jar. Not even Mom or Dad.">
      {mode === 'home' && (
        <>
          {/* Journal Cover Hero */}
          <div className="relative rounded-l-lg rounded-r-[28px] bg-[#E3DAF5] overflow-hidden shadow-md p-6 sm:p-8 flex flex-wrap items-center justify-between gap-4 border border-[#D4C4F0]">
            <div className="absolute left-0 top-0 bottom-0 w-4 bg-[#C9B6EC]" />
            <div className="pl-4 relative z-10">
              <div className="text-[11px] font-extrabold tracking-[0.14em] text-[#5A4385] uppercase">
                PRIVATE
              </div>
              <h1 className="m-0 font-['Baloo_2',sans-serif] font-bold text-3xl sm:text-4xl text-[#3D2C4A] leading-tight">
                {currentLearner.name}&apos;s Journal
              </h1>
              <div className="inline-flex items-center gap-1.5 mt-2 bg-white/85 rounded-full px-3 py-1 text-xs font-bold text-[#3D2C4A]">
                <Lock size={12} />
                <span>Locked with your secret code</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setHelpOpen(true)}
              className="relative z-10 min-h-[42px] px-4 rounded-full bg-[#3D2C4A] hover:bg-[#2F213A] text-white font-bold text-xs sm:text-sm inline-flex items-center gap-2 cursor-pointer shadow-sm transition-colors"
            >
              <MessageCircle size={15} />
              <span>Talk to someone</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* Left: Prompt + Quick Tools */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              <button
                type="button"
                onClick={() => {
                  setWriteText('');
                  setWriteSaved(false);
                  setMode('write');
                }}
                className="text-left flex flex-col gap-2 bg-[#FFF4C7] hover:bg-[#FCEBA8] rounded-[26px] p-5 transition-colors cursor-pointer shadow-xs"
              >
                <span className="text-[11px] font-extrabold tracking-wider text-[#8A6410] uppercase">
                  GIGI&apos;S PROMPT OF THE DAY
                </span>
                <span className="font-['Baloo_2',sans-serif] font-bold text-xl leading-snug text-[#3D2C4A]">
                  What&apos;s one thing that made you smile this week?
                </span>
                <span className="font-bold text-sm text-[#A8365A]">Write now →</span>
              </button>

              <div className="grid grid-cols-2 gap-3.5">
                <button
                  type="button"
                  onClick={() => {
                    setWorryStep('write');
                    setWorryText('');
                    setMode('worry');
                  }}
                  className="text-left bg-[#D8ECF8] hover:bg-[#CBE4F4] rounded-[24px] p-4 flex flex-col gap-2 transition-colors cursor-pointer shadow-2xs"
                >
                  <svg width="38" height="42" viewBox="0 0 40 44" aria-hidden="true">
                    <rect x="10" y="2" width="20" height="6" rx="2" fill="#C49A6C" />
                    <path d="M8 10h24v26a6 6 0 0 1-6 6H14a6 6 0 0 1-6-6z" fill="#FFFFFF" stroke="#8EBFE0" strokeWidth="2" />
                    <rect x="14" y="26" width="8" height="5" rx="1" fill="#FFE08A" />
                    <rect x="20" y="31" width="8" height="5" rx="1" fill="#F4A3B4" />
                  </svg>
                  <strong className="font-bold text-sm text-[#3D2C4A]">Worry Jar</strong>
                  <span className="text-xs text-[#2F4A63]">{data.worryJarCount} worries let go</span>
                </button>

                <div className="bg-[#F1ECFA] rounded-[24px] p-4 flex flex-col gap-2 shadow-2xs">
                  <Shield size={36} className="text-[#5A4385]" />
                  <strong className="font-bold text-sm text-[#3D2C4A]">My Safe Circle</strong>
                  <span className="text-xs text-[#4A3A57]">You&apos;ll build it in Chapter 4</span>
                </div>
              </div>
            </div>

            {/* Right: My Entries List */}
            <section className="lg:col-span-7 flex flex-col gap-3.5">
              <div className="flex justify-between items-baseline">
                <h2 className="m-0 font-['Baloo_2',sans-serif] font-bold text-2xl text-[#3D2C4A]">
                  My entries
                </h2>
                <span className="text-xs font-semibold text-[#6E5B7A]">
                  {data.journalEntries.length} written · Reflective Writer {Math.min(5, data.journalEntries.length)}/5
                </span>
              </div>

              {Object.entries(groupedEntries).map(([groupTitle, grp]) => (
                <div key={groupTitle} className="flex flex-col gap-2">
                  <div style={{ color: grp.color }} className="text-xs font-extrabold tracking-wider uppercase">
                    {groupTitle}
                  </div>
                  {grp.items.map((entry) => {
                    const sticker = STICKERS[entry.stickerIndex % STICKERS.length];
                    return (
                      <div
                        key={entry.id}
                        className="flex gap-3 items-start bg-white border border-[#F1E4E8] rounded-2xl p-3.5 shadow-2xs"
                      >
                        <span
                          style={{ backgroundColor: sticker.bg }}
                          className="w-10 h-10 rounded-full grid place-items-center shrink-0"
                        >
                          <svg
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="#3D2C4A"
                            strokeWidth="2"
                            strokeLinecap="round"
                            aria-hidden="true"
                          >
                            <path d={sticker.icon} />
                          </svg>
                        </span>
                        <div className="flex-1 min-w-0">
                          <span className="block text-xs font-bold text-[#6E5B7A]">{entry.meta}</span>
                          <p className="m-0 mt-0.5 text-sm font-medium text-[#3D2C4A] leading-relaxed">
                            {entry.text}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}

              {/* Unwritten prompt placeholder */}
              <button
                type="button"
                onClick={() => {
                  setWriteText('');
                  setWriteSaved(false);
                  setMode('write');
                }}
                className="flex gap-3 items-center border border-dashed border-[#D9C3CF] bg-[#FFFAF6] hover:bg-white rounded-2xl p-3.5 text-left transition-colors cursor-pointer"
              >
                <span className="w-10 h-10 rounded-full bg-[#F6F1F4] grid place-items-center shrink-0 text-[#6E5B7A]">
                  <Pencil size={16} />
                </span>
                <div>
                  <span className="block text-xs font-bold text-[#6E5B7A]">NEW REFLECTION</span>
                  <span className="text-sm font-semibold text-[#A8365A]">
                    Write anytime — earn +5 petals for your garden!
                  </span>
                </div>
              </button>
            </section>
          </div>

          <div className="flex items-center justify-center gap-2 text-xs text-[#5E4B6B] pt-2">
            <Lock size={13} />
            <span>Only you can read your journal. Not even Mom or Dad.</span>
          </div>
        </>
      )}

      {/* ── JR2: WRITE AN ENTRY (Full Desktop 2-Col Studio) ── */}
      {mode === 'write' && (
        <div className="w-full flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setMode('home')}
              className="w-10 h-10 rounded-full bg-white border border-[#F1E4E8] grid place-items-center text-[#3D2C4A] hover:bg-[#FDEFF0] cursor-pointer"
              aria-label="Back to journal"
            >
              <ArrowLeft size={18} />
            </button>
            <span className="text-xs sm:text-sm font-semibold text-[#6E5B7A]">
              {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' })}
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#5A4385] bg-[#E3DAF5] rounded-full px-3 py-1">
              <Lock size={12} /> Private
            </span>
          </div>

          {!writeSaved ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left: Prompt & Lined Paper (8 cols) */}
              <div className="lg:col-span-8 flex flex-col gap-4">
                <div className="bg-[#FFF4C7] rounded-3xl p-5 sm:p-6">
                  <div className="text-[11px] font-extrabold tracking-wider text-[#8A6410] uppercase">
                    GIGI ASKS
                  </div>
                  <h1 className="m-0 mt-1 font-['Baloo_2',sans-serif] font-bold text-2xl sm:text-3xl text-[#3D2C4A]">
                    What&apos;s one thing that made you smile this week?
                  </h1>
                </div>

                {/* Lined Paper Textarea */}
                <div
                  style={{
                    backgroundImage: 'repeating-linear-gradient(#FFFFFF 0 31px, #F6E9EE 31px 32px)',
                  }}
                  className="relative bg-white border border-[#E9DDE6] rounded-3xl p-4 shadow-xs"
                >
                  <textarea
                    value={writeText}
                    onChange={(e) => setWriteText(e.target.value)}
                    placeholder="Write anything. Spelling doesn't count here."
                    rows={10}
                    className="w-full border-none bg-transparent resize-none text-base leading-[32px] px-2 text-[#3D2C4A] focus:outline-none"
                  />
                  <div
                    style={{ backgroundColor: STICKERS[stickerIdx].bg }}
                    className="w-13 h-13 rounded-full grid place-items-center absolute right-4 bottom-4 rotate-12 shadow-xs"
                  >
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#3D2C4A"
                      strokeWidth="2"
                      strokeLinecap="round"
                      aria-hidden="true"
                    >
                      <path d={STICKERS[stickerIdx].icon} />
                    </svg>
                  </div>
                </div>
                <div className="text-right text-xs font-semibold text-[#6E5B7A]">{wordCount} words</div>
              </div>

              {/* Right: Starters, Stickers & Save (4 cols) */}
              <div className="lg:col-span-4 flex flex-col gap-4 bg-white border border-[#F1E4E8] rounded-3xl p-5 shadow-xs lg:sticky lg:top-6">
                {/* Starters */}
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-bold text-[#3D2C4A]">Stuck? Start with:</span>
                  <div className="flex flex-wrap gap-2">
                    {STARTERS.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() =>
                          setWriteText((prev) => (prev ? prev + ' ' : '') + s.replace('…', ' '))
                        }
                        className="min-h-[38px] px-3.5 rounded-full border border-[#E9DDE6] bg-[#FFFAF6] hover:bg-[#FDEFF0] text-xs font-semibold text-[#3D2C4A] cursor-pointer transition-colors text-left"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sticker Selector */}
                <div className="flex flex-col gap-2 pt-2 border-t border-[#F1E4E8]">
                  <span className="text-xs font-bold text-[#3D2C4A]">Add a sticker</span>
                  <div className="grid grid-cols-3 gap-2.5">
                    {STICKERS.map((st, idx) => (
                      <button
                        key={st.name}
                        type="button"
                        onClick={() => setStickerIdx(idx)}
                        style={{ backgroundColor: st.bg }}
                        aria-label={st.name}
                        className={`h-12 rounded-2xl flex items-center justify-center gap-1.5 cursor-pointer transition-transform ${
                          stickerIdx === idx ? 'ring-2 ring-[#C2456A] scale-105' : 'hover:scale-103'
                        }`}
                      >
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#3D2C4A"
                          strokeWidth="2"
                          strokeLinecap="round"
                          aria-hidden="true"
                        >
                          <path d={st.icon} />
                        </svg>
                        <span className="text-[11px] font-bold text-[#3D2C4A]">{st.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSaveEntry}
                  className="min-h-[52px] rounded-full bg-[#C2456A] hover:bg-[#A8365A] text-white font-bold text-base cursor-pointer shadow-md transition-colors mt-2"
                >
                  Save to my journal
                </button>
                <p className="text-center text-xs text-[#5E4B6B] m-0">
                  Only you can read this. It&apos;s never shown to Mom or Dad.
                </p>
              </div>
            </div>
          ) : (
            <div className="max-w-[560px] mx-auto w-full bg-white border border-[#F1E4E8] rounded-3xl p-8 text-center flex flex-col items-center gap-4 shadow-sm">
              <svg width="150" height="130" viewBox="0 0 160 140" aria-hidden="true">
                <rect x="22" y="22" width="116" height="100" rx="10" fill="#E3DAF5" />
                <rect x="30" y="28" width="100" height="88" rx="6" fill="#FFFFFF" />
                <path d="M44 50h72M44 66h72M44 82h50" stroke="#F1E4E8" strokeWidth="4" strokeLinecap="round" />
                <circle cx="118" cy="98" r="16" fill="#FFF4C7" />
                <path d="M111 98l5 5 9-10" fill="none" stroke="#8A6410" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <h2 className="m-0 font-['Baloo_2',sans-serif] font-bold text-3xl text-[#3D2C4A]">
                Saved and locked
              </h2>
              <p className="m-0 text-sm text-[#4A3A57]">
                +5 petals for writing! You have {data.journalEntries.length} entries in your private journal.
              </p>
              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setMode('home')}
                  className="min-h-[48px] px-7 rounded-full bg-[#C2456A] hover:bg-[#A8365A] text-white font-bold text-sm cursor-pointer shadow-md"
                >
                  Back to my journal
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setWriteText('');
                    setWriteSaved(false);
                  }}
                  className="min-h-[48px] px-6 rounded-full border-2 border-[#3D2C4A] text-[#3D2C4A] font-bold text-sm cursor-pointer"
                >
                  Write another
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── JR3: WORRY JAR (Full Desktop 2-Col Studio) ── */}
      {mode === 'worry' && (
        <div className="w-full bg-[#EAF4FB] rounded-[34px] p-5 sm:p-8 flex flex-col gap-6 border border-[#D4E8F6]">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMode('home')}
              className="w-10 h-10 rounded-full bg-white grid place-items-center text-[#3D2C4A] cursor-pointer shadow-2xs"
              aria-label="Back to journal"
            >
              <ArrowLeft size={18} />
            </button>
            <h1 className="m-0 font-['Baloo_2',sans-serif] font-bold text-2xl sm:text-3xl text-[#3D2C4A]">
              Worry Jar
            </h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Left: Illustrated Glass Jar (5 cols) */}
            <div className="lg:col-span-5 flex flex-col items-center gap-3 py-4">
              <svg width="210" height="260" viewBox="0 0 200 250" aria-label={`Jar holding ${data.worryJarCount} folded worries`}>
                <rect x="58" y="8" width="84" height="26" rx="8" fill="#C49A6C" />
                <rect x="58" y="22" width="84" height="6" fill="#A8805A" />
                <path
                  d="M48 40h104a6 6 0 0 1 6 6v2c14 10 22 26 22 44v120a26 26 0 0 1-26 26H46a26 26 0 0 1-26-26V92c0-18 8-34 22-44v-2a6 6 0 0 1 6-6z"
                  fill="#FFFFFF"
                  fillOpacity=".8"
                  stroke="#8EBFE0"
                  strokeWidth="3"
                />
                {Array.from({ length: visibleSlips }, (_, i) => {
                  const x = 40 + (i % 3) * 42 + (Math.floor(i / 3) % 2) * 18;
                  const y = 206 - Math.floor(i / 3) * 22;
                  const rot = ((i * 37) % 30) - 15;
                  return (
                    <rect
                      key={i}
                      x={x}
                      y={y}
                      width="34"
                      height="20"
                      rx="4"
                      fill={slipColors[i % slipColors.length]}
                      transform={`rotate(${rot} ${x + 17} ${y + 10})`}
                    />
                  );
                })}
                <path d="M40 100c0-14 6-26 16-34" stroke="#FFFFFF" strokeWidth="6" strokeLinecap="round" fill="none" />
              </svg>
              <div className="font-bold text-sm sm:text-base text-[#2F6494] bg-white/70 px-4 py-1.5 rounded-full">
                {data.worryJarCount} worries let go so far
              </div>
            </div>

            {/* Right: Interactive White Card (7 cols) */}
            <div className="lg:col-span-7 bg-white rounded-3xl p-5 sm:p-7 flex flex-col gap-4 shadow-sm">
            {worryStep === 'write' && (
              <>
                <p className="m-0 text-sm sm:text-base text-[#3D2C4A]">
                  Write down what&apos;s bothering you. Then fold it up and pop it in the jar. Worries feel smaller once they&apos;re outside your head.
                </p>
                <label className="text-xs font-bold text-[#5E4B6B] flex flex-col gap-1.5">
                  <span>My worry</span>
                  <textarea
                    value={worryText}
                    onChange={(e) => setWorryText(e.target.value)}
                    rows={4}
                    placeholder="What if my period starts during the sports day race?"
                    className="w-full border border-[#E9DDE6] rounded-2xl p-3.5 text-sm sm:text-base bg-[#FFF4C7] resize-none text-[#3D2C4A] focus:outline-none focus:ring-2 focus:ring-[#C2456A]"
                  />
                </label>
                <button
                  type="button"
                  onClick={handleFoldWorry}
                  className="min-h-[52px] rounded-full bg-[#C2456A] hover:bg-[#A8365A] text-white font-bold text-base cursor-pointer shadow-md"
                >
                  Fold it into the jar
                </button>
              </>
            )}

            {worryStep === 'choose' && (
              <div className="flex flex-col gap-3 animate-in fade-in">
                <h2 className="m-0 font-['Baloo_2',sans-serif] font-bold text-2xl text-[#3D2C4A]">
                  It&apos;s in the jar. What now?
                </h2>
                <button
                  type="button"
                  onClick={() => setWorryStep('released')}
                  className="flex items-center gap-3 text-left rounded-2xl bg-[#D4EFE4] hover:bg-[#C3E6D6] p-4 cursor-pointer transition-colors"
                >
                  <Sparkles size={24} className="text-[#24735A] shrink-0" />
                  <div>
                    <strong className="block font-bold text-[#3D2C4A]">Let it go</strong>
                    <span className="text-xs sm:text-sm text-[#2C5A4A]">Feels a bit lighter already</span>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setWorryStep('helping')}
                  className="flex items-center gap-3 text-left rounded-2xl bg-[#FDEFF0] hover:bg-[#FCE0E3] p-4 cursor-pointer transition-colors"
                >
                  <MessageCircle size={24} className="text-[#A8365A] shrink-0" />
                  <div>
                    <strong className="block font-bold text-[#3D2C4A]">I want help with this</strong>
                    <span className="text-xs sm:text-sm text-[#6E3A4E]">Talk to someone you trust</span>
                  </div>
                </button>
              </div>
            )}

            {worryStep === 'released' && (
              <div className="flex flex-col gap-3 text-center items-center py-2 animate-in fade-in">
                <h2 className="m-0 font-['Baloo_2',sans-serif] font-bold text-2xl text-[#3D2C4A]">
                  Let go. Well done.
                </h2>
                <p className="m-0 text-sm text-[#4A3A57]">
                  Take one slow breath with Gigi. If the worry comes back, that&apos;s okay. You can always talk to someone.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setWorryText('');
                    setWorryStep('write');
                  }}
                  className="w-full min-h-[48px] rounded-full border-2 border-[#3D2C4A] text-[#3D2C4A] font-bold text-sm cursor-pointer mt-2"
                >
                  Add another worry
                </button>
                <button
                  type="button"
                  onClick={() => setMode('home')}
                  className="w-full min-h-[48px] rounded-full bg-[#C2456A] text-white font-bold text-sm cursor-pointer"
                >
                  Back to my journal
                </button>
              </div>
            )}

            {worryStep === 'helping' && (
              <div className="flex flex-col gap-3 animate-in fade-in">
                <h2 className="m-0 font-['Baloo_2',sans-serif] font-bold text-2xl text-[#3D2C4A]">
                  Asking for help is brave
                </h2>
                <div className="bg-[#FDEFF0] rounded-2xl p-3.5 text-sm">
                  <strong className="block font-bold text-[#3D2C4A]">Tell Mom in person</strong>
                  <span className="text-xs text-[#4A3A57]">
                    Find a quiet moment and say: &ldquo;Mom, can we talk? Something&apos;s on my mind.&rdquo;
                  </span>
                </div>
                <a
                  href="tel:1098"
                  className="flex items-center gap-3 bg-[#FFF4C7] rounded-2xl p-3.5 text-[#3D2C4A]"
                >
                  <span className="w-10 h-10 rounded-full bg-white grid place-items-center font-bold text-xs shrink-0">
                    1098
                  </span>
                  <div>
                    <strong className="block text-sm font-bold">Child Helpline 1098</strong>
                    <span className="text-xs">Free, day and night, for children</span>
                  </div>
                </a>
                <a
                  href="tel:112"
                  className="flex items-center gap-3 bg-[#FFE3CC] rounded-2xl p-3.5 text-[#3D2C4A]"
                >
                  <span className="w-10 h-10 rounded-full bg-white grid place-items-center font-bold text-xs shrink-0">
                    112
                  </span>
                  <div>
                    <strong className="block text-sm font-bold">112 Emergency</strong>
                    <span className="text-xs">If you are in danger right now</span>
                  </div>
                </a>
                <button
                  type="button"
                  onClick={() => {
                    toast.success("Note sent privately to Infano's counsellor.");
                    setMode('home');
                  }}
                  className="min-h-[48px] rounded-full border-2 border-[#3D2C4A] bg-white text-[#3D2C4A] font-bold text-sm cursor-pointer"
                >
                  Send a private note to Infano&apos;s counsellor
                </button>
                <button
                  type="button"
                  onClick={() => setWorryStep('write')}
                  className="text-sm font-bold text-[#A8365A] cursor-pointer py-1"
                >
                  Back to the jar
                </button>
              </div>
            )}

            <p className="text-center text-xs text-[#5E4B6B] m-0 pt-1">
              Your worries stay private. Nobody else sees them.
            </p>
          </div>
          </div>
        </div>
      )}

      {/* Talk to Someone Sheet Modal */}
      {helpOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#3D2C4A]/40 backdrop-blur-xs animate-in fade-in"
          onClick={() => setHelpOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[440px] sm:max-w-[520px] bg-white rounded-t-[32px] sm:rounded-[32px] p-6 sm:p-7 shadow-2xl flex flex-col gap-3 animate-in slide-in-from-bottom sm:zoom-in-95 duration-200"
          >
            <div className="flex justify-between items-center">
              <strong className="font-['Baloo_2',sans-serif] font-bold text-2xl text-[#3D2C4A]">
                You&apos;re not alone
              </strong>
              <button
                type="button"
                onClick={() => setHelpOpen(false)}
                aria-label="Close"
                className="w-9 h-9 rounded-full bg-[#FFFAF6] grid place-items-center text-[#3D2C4A] cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>
            <p className="m-0 text-sm text-[#4A3A57]">
              Talking to someone you trust can make any feeling lighter. Who would you like to reach?
            </p>

            <div className="flex items-center gap-3 bg-[#FDEFF0] rounded-2xl p-3.5 text-[#3D2C4A]">
              <span className="w-10 h-10 rounded-full bg-white grid place-items-center text-[#A8365A] shrink-0">
                <Heart size={18} />
              </span>
              <div>
                <strong className="block text-sm font-bold">Tell Mom in person</strong>
                <span className="text-xs">
                  Find a quiet moment and say: &ldquo;Mom, can we talk? Something&apos;s on my mind.&rdquo;
                </span>
              </div>
            </div>

            <div className="bg-[#F1ECFA] rounded-2xl p-3.5 text-xs text-[#3D2C4A]">
              Add teachers, grandparents and other trusted adults to your Safe Circle in Chapter 4.
            </div>

            <a
              href="tel:1098"
              className="flex items-center gap-3 bg-[#FFF4C7] rounded-2xl p-3.5 text-[#3D2C4A]"
            >
              <span className="w-10 h-10 rounded-full bg-white grid place-items-center font-bold text-xs shrink-0">
                1098
              </span>
              <div>
                <strong className="block text-sm font-bold">Child Helpline 1098</strong>
                <span className="text-xs">Free, day and night, for children</span>
              </div>
            </a>

            <a
              href="tel:112"
              className="flex items-center gap-3 bg-[#FFE3CC] rounded-2xl p-3.5 text-[#3D2C4A]"
            >
              <span className="w-10 h-10 rounded-full bg-white grid place-items-center font-bold text-xs shrink-0">
                112
              </span>
              <div>
                <strong className="block text-sm font-bold">Emergency</strong>
                <span className="text-xs">If you are in danger right now</span>
              </div>
            </a>

            <button
              type="button"
              onClick={() => {
                toast.success("Private note sent to Infano's counsellor.");
                setHelpOpen(false);
              }}
              className="min-h-[48px] rounded-full border-2 border-[#3D2C4A] bg-white hover:bg-[#3D2C4A] hover:text-white text-[#3D2C4A] font-bold text-sm cursor-pointer transition-colors"
            >
              Send a private note to Infano&apos;s counsellor
            </button>
          </div>
        </div>
      )}
    </DaughterShell>
  );
}

export default function JournalPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FFFAF6] flex items-center justify-center text-[#A8365A] font-bold">
          Loading journal...
        </div>
      }
    >
      <JournalPageContent />
    </Suspense>
  );
}

