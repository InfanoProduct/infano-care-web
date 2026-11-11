'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { DaughterShell } from '@/features/daughter/DaughterShell';
import { useDaughterState, DiaryEntry } from '@/features/daughter/daughter-state';
import { Calendar, Lock, X, ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react';
import { toast } from 'react-hot-toast';

const MOODS = [
  { id: 'happy', label: 'Happy', c: '#FFE08A', mouth: 'M-6 5 Q0 11 6 5' },
  { id: 'calm', label: 'Calm', c: '#A8D8BE', mouth: 'M-5 6 Q0 8 5 6' },
  { id: 'tired', label: 'Tired', c: '#C2B0E6', mouth: 'M-5 7 L5 7' },
  { id: 'crampy', label: 'Crampy', c: '#F7CDAA', mouth: 'M-5 8 Q0 4 5 8' },
  { id: 'worried', label: 'Worried', c: '#B7D8EF', mouth: 'M-5 8 Q0 5 5 8' },
  { id: 'grumpy', label: 'Grumpy', c: '#F4A3B4', mouth: 'M-6 9 Q0 3 6 9' },
] as const;

const FLOWS: Array<{ id: DiaryEntry['flow']; label: string; size: number }> = [
  { id: 'none', label: 'Not today', size: 0 },
  { id: 'spot', label: 'Spotting', size: 10 },
  { id: 'light', label: 'Light', size: 13 },
  { id: 'medium', label: 'Medium', size: 16 },
  { id: 'heavy', label: 'Heavy', size: 20 },
];

const BODY_NOTES = ['Cramps', 'Headache', 'Bloating', 'Acne', 'Tender chest', 'Back ache', 'None'];
const PRODUCTS = ['Pads', 'Cloth pads', 'Cup', 'Period underwear', 'Tampons'];

export default function DiaryPage() {
  const { currentLearner, data, updateData } = useDaughterState();
  const [view, setView] = useState<'today' | 'month'>('today');

  // Today key formatted cleanly
  const todayObj = useMemo(() => new Date(), []);
  const todayKey = useMemo(() => {
    const y = todayObj.getFullYear();
    const m = String(todayObj.getMonth() + 1).padStart(2, '0');
    const d = String(todayObj.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }, [todayObj]);

  const todayDisplay = useMemo(
    () =>
      todayObj.toLocaleDateString('en-IN', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      }),
    [todayObj]
  );

  const existingToday = data.diaryEntries[todayKey];

  const [mood, setMood] = useState<string | null>(existingToday?.mood || null);
  const [energy, setEnergy] = useState<string | null>(existingToday?.energy || null);
  const [flow, setFlow] = useState<DiaryEntry['flow']>(existingToday?.flow || 'none');
  const [bodyNotes, setBodyNotes] = useState<string[]>(existingToday?.bodyNotes || []);
  const [note, setNote] = useState<string>(existingToday?.note || '');
  const [savedToday, setSavedToday] = useState<boolean>(Boolean(existingToday));

  // DI3 Log Period Sheet
  const [logOpen, setLogOpen] = useState(false);
  const [startDate, setStartDate] = useState(todayKey);
  const [endDate, setEndDate] = useState('');
  const [flowDays, setFlowDays] = useState<number[]>([2, 3, 2, 1, 0]);
  const [selectedProducts, setSelectedProducts] = useState<string[]>(['Pads']);

  // DI2 Calendar State
  const [calMonth, setCalMonth] = useState<'oct' | 'nov'>('nov');
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const toggleBodyNote = (item: string) => {
    setSavedToday(false);
    setBodyNotes((prev) =>
      prev.includes(item) ? prev.filter((x) => x !== item) : [...prev, item]
    );
  };

  const handleSaveToday = () => {
    const alreadySavedBefore = Boolean(data.diaryEntries[todayKey]);
    updateData((prev) => ({
      ...prev,
      bonusPetals: alreadySavedBefore ? prev.bonusPetals : prev.bonusPetals + 5,
      diaryEntries: {
        ...prev.diaryEntries,
        [todayKey]: {
          dateKey: todayKey,
          mood,
          energy,
          flow,
          bodyNotes,
          note,
        },
      },
    }));
    setSavedToday(true);
    toast.success(alreadySavedBefore ? 'Diary updated!' : 'Saved today! +5 petals 🌸');
  };

  const handleSavePeriodLog = () => {
    updateData((prev) => ({
      ...prev,
      periodLogs: [
        ...prev.periodLogs,
        { startDate, endDate, days: flowDays, products: selectedProducts },
      ],
    }));
    setLogOpen(false);
    toast.success('Period details saved privately!');
  };

  const showSupport = mood === 'worried' || mood === 'grumpy';

  // Calendar generation
  const calConfig =
    calMonth === 'oct'
      ? { name: 'October 2026', year: 2026, monthNum: 10, offset: 4, days: 31 }
      : { name: 'November 2026', year: 2026, monthNum: 11, offset: 0, days: 30 };

  const moodColors: Record<string, string> = {
    happy: '#FFE08A',
    calm: '#A8D8BE',
    tired: '#C2B0E6',
    crampy: '#F7CDAA',
    worried: '#B7D8EF',
    grumpy: '#F4A3B4',
  };

  const flowSizeMap: Record<string, number> = {
    none: 0,
    spot: 9,
    light: 11,
    medium: 13,
    heavy: 16,
  };

  return (
    <DaughterShell gigiTip="Only you can see your diary and cycle calendar. Logging takes just 20 seconds!">
      {/* Header */}
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {view === 'month' && (
            <button
              type="button"
              onClick={() => setView('today')}
              aria-label="Back to today"
              className="w-10 h-10 rounded-full bg-white border border-[#F1E4E8] grid place-items-center text-[#3D2C4A] hover:bg-[#FDEFF0] cursor-pointer"
            >
              <ArrowLeft size={18} />
            </button>
          )}
          <div>
            <h1 className="m-0 font-['Baloo_2',sans-serif] font-bold text-3xl text-[#3D2C4A] leading-tight">
              {view === 'today' ? 'My diary' : 'My month'}
            </h1>
            <div className="text-xs sm:text-sm font-semibold text-[#6E5B7A]">
              {view === 'today' ? todayDisplay : calConfig.name}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setView(view === 'today' ? 'month' : 'today')}
          className="min-h-[42px] px-4 rounded-full bg-white border border-[#F1E4E8] hover:border-[#C2456A] inline-flex items-center gap-2 font-bold text-sm text-[#3D2C4A] shadow-2xs cursor-pointer transition-colors"
        >
          <Calendar size={16} />
          <span>{view === 'today' ? 'My month' : 'Today'}</span>
        </button>
      </header>

      {view === 'today' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Left Column: Mood, Energy & Period */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            {/* Gigi Greeting */}
            <div className="flex gap-3 items-center bg-[#FFF4C7] rounded-2xl p-3.5 px-4 shadow-2xs">
              <svg width="40" height="45" viewBox="0 0 120 135" aria-hidden="true" className="shrink-0">
                <circle cx="60" cy="50" r="33" fill="#3D2C4A" />
                <circle cx="31" cy="26" r="11" fill="#3D2C4A" />
                <circle cx="89" cy="26" r="11" fill="#3D2C4A" />
                <circle cx="60" cy="56" r="25" fill="#D9A07E" />
                <path d="M35 49 C 40 30, 80 30, 85 49 C 76 41, 46 41, 35 49z" fill="#3D2C4A" />
                <circle cx="51" cy="58" r="3" fill="#3D2C4A" />
                <circle cx="69" cy="58" r="3" fill="#3D2C4A" />
                <path d="M53 67 Q60 74 67 67" stroke="#3D2C4A" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                <path d="M30 135 C 32 98, 46 86, 60 86 C 74 86, 88 98, 90 135z" fill="#E3DAF5" />
              </svg>
              <span className="font-['Baloo_2',sans-serif] font-semibold text-lg text-[#3D2C4A] leading-snug">
                Hi {currentLearner.name}! How&apos;s today? It takes 20 seconds.
              </span>
            </div>

            {/* Mood */}
            <section className="bg-white border border-[#F1E4E8] rounded-3xl p-4 sm:p-5 shadow-2xs">
              <h2 className="m-0 mb-3 text-sm font-bold text-[#3D2C4A]">Mood</h2>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {MOODS.map((m) => {
                  const active = mood === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => {
                        setMood(m.id);
                        setSavedToday(false);
                      }}
                      aria-pressed={active}
                      className={`py-2 px-1 flex flex-col items-center gap-1 rounded-2xl transition-all cursor-pointer ${
                        active ? 'bg-[#FDEFF0] ring-2 ring-[#C2456A] scale-104' : 'hover:bg-[#FFFAF6]'
                      }`}
                    >
                      <svg width="44" height="44" viewBox="0 0 80 80" aria-hidden="true">
                        <g transform="translate(40 40)">
                          {[0, 72, 144, 216, 288].map((deg) => (
                            <ellipse key={deg} rx="11" ry="18" cy="-18" fill={m.c} transform={`rotate(${deg})`} />
                          ))}
                          <circle r="15" fill="#FFF4C7" />
                          <circle cx="-5" cy="-2" r="1.8" fill="#3D2C4A" />
                          <circle cx="5" cy="-2" r="1.8" fill="#3D2C4A" />
                          <path d={m.mouth} stroke="#3D2C4A" strokeWidth="1.8" fill="none" strokeLinecap="round" />
                        </g>
                      </svg>
                      <span className="text-xs font-semibold text-[#3D2C4A]">{m.label}</span>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Energy */}
            <section className="bg-white border border-[#F1E4E8] rounded-3xl p-4 sm:p-5 shadow-2xs">
              <h2 className="m-0 mb-3 text-sm font-bold text-[#3D2C4A]">Energy</h2>
              <div className="grid grid-cols-3 gap-2.5">
                {[
                  { id: 'low', label: 'Low', bars: 1 },
                  { id: 'okay', label: 'Okay', bars: 2 },
                  { id: 'full', label: 'Full', bars: 3 },
                ].map((e) => {
                  const on = energy === e.id;
                  return (
                    <button
                      key={e.id}
                      type="button"
                      onClick={() => {
                        setEnergy(e.id);
                        setSavedToday(false);
                      }}
                      aria-pressed={on}
                      className={`min-h-[52px] rounded-2xl flex items-center justify-center gap-2 font-semibold text-sm border transition-all cursor-pointer ${
                        on
                          ? 'bg-[#3D2C4A] text-white border-[#3D2C4A]'
                          : 'bg-[#FBF8F6] text-[#3D2C4A] border-[#E9DDE6] hover:border-[#3D2C4A]/30'
                      }`}
                    >
                      <span className="inline-flex gap-0.5 border-2 border-current rounded px-0.5 py-0.5">
                        {[1, 2, 3].map((k) => (
                          <span
                            key={k}
                            className={`w-1.5 h-3 rounded-[1px] ${
                              k <= e.bars ? (on ? 'bg-white' : 'bg-[#7FC3A3]') : 'bg-transparent'
                            }`}
                          />
                        ))}
                      </span>
                      <span>{e.label}</span>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Period Today */}
            <section className="bg-white border border-[#F1E4E8] rounded-3xl p-4 sm:p-5 flex flex-col gap-3 shadow-2xs">
              <h2 className="m-0 text-sm font-bold text-[#3D2C4A]">Period today?</h2>
              <div className="flex flex-wrap gap-2">
                {FLOWS.map((f) => {
                  const on = flow === f.id;
                  return (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => {
                        setFlow(f.id);
                        setSavedToday(false);
                      }}
                      className={`min-h-[42px] px-3.5 rounded-full inline-flex items-center gap-1.5 font-semibold text-xs sm:text-sm transition-all cursor-pointer ${
                        on
                          ? 'bg-[#FDEFF0] text-[#3D2C4A] border-2 border-[#E8738A]'
                          : 'bg-[#FBF8F6] text-[#3D2C4A] border border-[#E9DDE6]'
                      }`}
                    >
                      {f.size > 0 && (
                        <svg width={f.size} height={f.size} viewBox="0 0 24 24" fill="#E8738A" aria-hidden="true">
                          <path d="M12 3c3 5 6 8 6 11a6 6 0 0 1-12 0c0-3 3-6 6-11z" />
                        </svg>
                      )}
                      <span>{f.label}</span>
                    </button>
                  );
                })}
              </div>
              <button
                type="button"
                onClick={() => setLogOpen(true)}
                className="self-start text-sm font-bold text-[#A8365A] hover:underline cursor-pointer"
              >
                Log period details →
              </button>
            </section>
          </div>

          {/* Right Column: Body Notes, Support Card & Save */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <section className="bg-white border border-[#F1E4E8] rounded-3xl p-4 sm:p-5 flex flex-col gap-3 shadow-2xs">
              <h2 className="m-0 text-sm font-bold text-[#3D2C4A]">Body notes</h2>
              <div className="flex flex-wrap gap-2">
                {BODY_NOTES.map((b) => {
                  const on = bodyNotes.includes(b);
                  return (
                    <button
                      key={b}
                      type="button"
                      onClick={() => toggleBodyNote(b)}
                      className={`min-h-[38px] px-3 rounded-full font-semibold text-xs sm:text-sm transition-all cursor-pointer ${
                        on
                          ? 'bg-[#FFE3CC] text-[#3D2C4A] border border-[#F0AF7E]'
                          : 'bg-[#FBF8F6] text-[#3D2C4A] border border-[#E9DDE6]'
                      }`}
                    >
                      {b}
                    </button>
                  );
                })}
              </div>

              <label className="flex flex-col gap-1.5 text-xs font-bold text-[#3D2C4A] pt-1">
                <span>A little note (optional)</span>
                <input
                  type="text"
                  maxLength={120}
                  value={note}
                  onChange={(e) => {
                    setNote(e.target.value);
                    setSavedToday(false);
                  }}
                  placeholder="Anything you'd like to remember"
                  className="min-h-[46px] rounded-xl border border-[#E9DDE6] px-3.5 text-sm font-normal text-[#3D2C4A] focus:outline-none focus:border-[#C2456A]"
                />
              </label>
            </section>

            {showSupport && (
              <div className="bg-[#F1ECFA] rounded-3xl p-5 flex flex-col gap-3 animate-in fade-in">
                <strong className="font-['Baloo_2',sans-serif] font-bold text-lg text-[#3D2C4A]">
                  Want something that might help?
                </strong>
                <div className="flex flex-wrap gap-2">
                  <Link
                    href="/dashboard/journal?tab=worry"
                    className="min-h-[40px] px-4 rounded-full bg-white inline-flex items-center font-bold text-xs text-[#3D2C4A] shadow-2xs"
                  >
                    Worry Jar
                  </Link>
                  <Link
                    href="/dashboard/journal"
                    className="min-h-[40px] px-4 rounded-full bg-[#3D2C4A] inline-flex items-center font-bold text-xs text-white shadow-2xs"
                  >
                    Talk to someone
                  </Link>
                </div>
              </div>
            )}

            {!savedToday ? (
              <button
                type="button"
                onClick={handleSaveToday}
                className="min-h-[54px] rounded-full bg-[#C2456A] hover:bg-[#A8365A] text-white font-bold text-base shadow-md cursor-pointer transition-colors"
              >
                Save today
              </button>
            ) : (
              <div className="min-h-[54px] rounded-full bg-[#EAF7F1] text-[#1F5A45] flex items-center justify-center gap-2 font-bold text-sm border border-[#7FC3A3]/40">
                <svg width="14" height="18" viewBox="0 0 16 22" aria-hidden="true">
                  <ellipse cx="8" cy="11" rx="6" ry="10" fill="#F4A3B4" />
                </svg>
                <span>Saved for today · +5 petals</span>
              </div>
            )}

            <div className="flex items-center justify-center gap-2 text-xs text-[#5E4B6B] pt-1">
              <Lock size={13} />
              <span>Your diary is only for you. It&apos;s never shown to anyone.</span>
            </div>
          </div>
        </div>
      ) : (
        /* ── DI2: MY MONTH CALENDAR VIEW ── */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          <section className="lg:col-span-7 bg-white border border-[#F1E4E8] rounded-3xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <button
                type="button"
                onClick={() => {
                  setCalMonth('oct');
                  setSelectedDay(null);
                }}
                aria-label="Previous month"
                className="w-10 h-10 rounded-full bg-[#FBF8F6] hover:bg-[#F1E4E8] grid place-items-center cursor-pointer"
              >
                <ChevronLeft size={18} />
              </button>
              <strong className="font-['Baloo_2',sans-serif] font-bold text-xl text-[#3D2C4A]">
                {calConfig.name}
              </strong>
              <button
                type="button"
                onClick={() => {
                  setCalMonth('nov');
                  setSelectedDay(null);
                }}
                aria-label="Next month"
                className="w-10 h-10 rounded-full bg-[#FBF8F6] hover:bg-[#F1E4E8] grid place-items-center cursor-pointer"
              >
                <ChevronRight size={18} />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-[#6E5B7A] mb-1.5">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                <span key={i}>{d}</span>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1.5">
              {Array.from({ length: calConfig.offset }).map((_, i) => (
                <span key={`b-${i}`} />
              ))}
              {Array.from({ length: calConfig.days }, (_, idx) => {
                const day = idx + 1;
                const key = `${calConfig.year}-${String(calConfig.monthNum).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const entry = data.diaryEntries[key];
                const isSel = selectedDay === day;
                const isTodayCell = key === todayKey;
                const flowSz = entry?.flow ? flowSizeMap[entry.flow] || 0 : 0;
                const moodCol = entry?.mood ? moodColors[entry.mood] : null;

                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => setSelectedDay(day)}
                    className={`h-14 rounded-2xl p-1 flex flex-col items-center justify-between text-xs font-bold cursor-pointer transition-all ${
                      isSel
                        ? 'bg-[#3D2C4A] text-white'
                        : isTodayCell
                        ? 'bg-white border-2 border-[#C2456A] text-[#3D2C4A]'
                        : flowSz > 0
                        ? 'bg-[#FDEFF0] text-[#3D2C4A]'
                        : 'bg-[#FBF8F6] text-[#3D2C4A] hover:bg-[#F6EEF2]'
                    }`}
                  >
                    <span>{day}</span>
                    <span className="flex items-center gap-0.5 h-4">
                      {flowSz > 0 && (
                        <svg width={flowSz} height={flowSz} viewBox="0 0 24 24" fill="#E8738A" aria-hidden="true">
                          <path d="M12 3c3 5 6 8 6 11a6 6 0 0 1-12 0c0-3 3-6 6-11z" />
                        </svg>
                      )}
                      {moodCol && (
                        <svg width="9" height="12" viewBox="0 0 16 22" aria-hidden="true">
                          <ellipse cx="8" cy="11" rx="6" ry="10" fill={moodCol} />
                        </svg>
                      )}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="flex flex-wrap gap-4 mt-4 text-xs font-semibold text-[#5E4B6B]">
              <span className="inline-flex items-center gap-1.5">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="#E8738A" aria-hidden="true">
                  <path d="M12 3c3 5 6 8 6 11a6 6 0 0 1-12 0c0-3 3-6 6-11z" />
                </svg>
                Period (size = flow)
              </span>
              <span className="inline-flex items-center gap-1.5">
                <svg width="9" height="12" viewBox="0 0 16 22" aria-hidden="true">
                  <ellipse cx="8" cy="11" rx="6" ry="10" fill="#A8D8BE" />
                </svg>
                Mood
              </span>
            </div>
          </section>

          {/* Gentle Insights + Selected Day Card */}
          <div className="lg:col-span-5 flex flex-col gap-3.5">
            {selectedDay && (() => {
              const key = `${calConfig.year}-${String(calConfig.monthNum).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`;
              const entry = data.diaryEntries[key];
              return (
                <div className="bg-white border-2 border-[#C2456A]/25 rounded-3xl p-4 shadow-sm animate-in fade-in">
                  <strong className="block text-sm font-bold text-[#3D2C4A]">
                    {selectedDay} {calConfig.name}
                  </strong>
                  <span className="text-xs sm:text-sm text-[#4A3A57] block mt-1">
                    {entry
                      ? `Mood: ${entry.mood || 'not logged'} · Flow: ${entry.flow}${entry.note ? ` · "${entry.note}"` : ''}`
                      : 'Nothing logged for this day.'}
                  </span>
                </div>
              );
            })()}

            <div className="bg-[#FDEFF0] rounded-3xl p-4 flex items-center gap-3.5">
              <span className="w-14 h-14 rounded-full bg-white grid place-items-center font-['Baloo_2',sans-serif] font-bold text-2xl text-[#A8365A] shrink-0">
                26
              </span>
              <div>
                <strong className="block text-sm font-bold text-[#3D2C4A]">days in your last cycle</strong>
                <span className="text-xs text-[#4A3A57]">
                  From 6 Oct to 1 Nov. Every cycle helps you notice your own pattern.
                </span>
              </div>
            </div>

            <div className="bg-[#D8ECF8] rounded-3xl p-4 text-sm text-[#3D2C4A]">
              <strong>Did you know?</strong> In the first year or two, cycles can change a lot from month to month. That&apos;s completely normal.
            </div>

            <div className="bg-[#FFF8E1] rounded-3xl p-4 text-sm text-[#3D2C4A]">
              <strong>When to tell a grown-up:</strong> if a period lasts more than 7 days, feels very heavy for 3 days in a row, or stops for 3 months.
            </div>
          </div>
        </div>
      )}

      {/* DI3: Log Period Modal */}
      {logOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#3D2C4A]/40 backdrop-blur-xs animate-in fade-in"
          onClick={() => setLogOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[440px] sm:max-w-[540px] bg-white rounded-t-[32px] sm:rounded-[32px] p-6 sm:p-7 shadow-2xl flex flex-col gap-4 animate-in slide-in-from-bottom sm:zoom-in-95 duration-200"
          >
            <div className="flex justify-between items-center">
              <strong className="font-['Baloo_2',sans-serif] font-bold text-2xl text-[#3D2C4A]">
                Log my period
              </strong>
              <button
                type="button"
                onClick={() => setLogOpen(false)}
                aria-label="Close"
                className="w-9 h-9 rounded-full bg-[#FFFAF6] grid place-items-center text-[#3D2C4A] cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <label className="flex flex-col gap-1 text-xs font-bold text-[#3D2C4A]">
                Started
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="min-h-[42px] rounded-xl border border-[#E9DDE6] px-2.5 text-sm text-[#3D2C4A]"
                />
              </label>
              <label className="flex flex-col gap-1 text-xs font-bold text-[#3D2C4A]">
                Ended
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="min-h-[42px] rounded-xl border border-[#E9DDE6] px-2.5 text-sm text-[#3D2C4A]"
                />
              </label>
            </div>

            <div>
              <div className="text-xs font-bold text-[#3D2C4A] mb-2">Flow each day (tap to change)</div>
              <div className="grid grid-cols-5 gap-2">
                {flowDays.map((v, i) => {
                  const sizes = [14, 16, 20, 24];
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        const next = [...flowDays];
                        next[i] = (next[i] + 1) % 4;
                        setFlowDays(next);
                      }}
                      className="min-h-[64px] rounded-2xl border border-[#F1E4E8] bg-[#FFFAF6] flex flex-col items-center justify-center gap-1 cursor-pointer"
                    >
                      <span className="text-[11px] font-bold text-[#3D2C4A]">Day {i + 1}</span>
                      <svg
                        width={sizes[v]}
                        height={sizes[v]}
                        viewBox="0 0 24 24"
                        fill={v === 0 ? '#E9DDE6' : '#E8738A'}
                        aria-hidden="true"
                      >
                        <path d="M12 3c3 5 6 8 6 11a6 6 0 0 1-12 0c0-3 3-6 6-11z" />
                      </svg>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <div className="text-xs font-bold text-[#3D2C4A] mb-2">What did you use?</div>
              <div className="flex flex-wrap gap-1.5">
                {PRODUCTS.map((p) => {
                  const on = selectedProducts.includes(p);
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() =>
                        setSelectedProducts((prev) =>
                          prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]
                        )
                      }
                      className={`min-h-[36px] px-3 rounded-full text-xs font-semibold cursor-pointer ${
                        on
                          ? 'bg-[#D4EFE4] text-[#1F5A45] border border-[#7FC3A3]'
                          : 'bg-[#FBF8F6] text-[#3D2C4A] border border-[#E9DDE6]'
                      }`}
                    >
                      {p}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="bg-[#FFF8E1] rounded-2xl p-3 text-xs text-[#3D2C4A]">
              If a period lasts more than 7 days, or feels very heavy, it&apos;s a good idea to tell a grown-up you trust.
            </div>

            <button
              type="button"
              onClick={handleSavePeriodLog}
              className="min-h-[50px] rounded-full bg-[#C2456A] hover:bg-[#A8365A] text-white font-bold text-sm cursor-pointer shadow-md"
            >
              Save period
            </button>
          </div>
        </div>
      )}
    </DaughterShell>
  );
}

