'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuthStore, LearnerProfile } from '@/store/auth-store';

export interface DiaryEntry {
  dateKey: string; // YYYY-MM-DD
  mood: string | null;
  energy: string | null;
  flow: 'none' | 'spot' | 'light' | 'medium' | 'heavy';
  bodyNotes: string[];
  note: string;
}

export interface PeriodLog {
  startDate: string;
  endDate?: string;
  days: number[]; // 0: none, 1: light, 2: medium, 3: heavy
  products: string[];
}

export interface JournalEntry {
  id: string;
  chapterTitle: string;
  chapterColor: string;
  meta: string;
  text: string;
  stickerIndex: number; // 0..5
  createdAt: string;
}

export interface DaughterLocalData {
  bonusPetals: number;
  spentPetals: number;
  ownedShopItems: Record<string, boolean>;
  placedGardenItems: Record<string, boolean>;
  sharedBadges: Record<string, boolean>;
  secretGigiBadgeFound: boolean;
  diaryEntries: Record<string, DiaryEntry>;
  periodLogs: PeriodLog[];
  journalEntries: JournalEntry[];
  worryJarCount: number;
  worriesList: string[];
}

const DEFAULT_DATA: DaughterLocalData = {
  bonusPetals: 0,
  spentPetals: 0,
  ownedShopItems: { polka: true },
  placedGardenItems: {},
  sharedBadges: {},
  secretGigiBadgeFound: false,
  diaryEntries: {
    '2026-10-06': { dateKey: '2026-10-06', mood: 'happy', energy: 'okay', flow: 'medium', bodyNotes: ['Cramps'], note: '' },
    '2026-10-07': { dateKey: '2026-10-07', mood: 'calm', energy: 'low', flow: 'heavy', bodyNotes: ['Tired'], note: '' },
    '2026-10-08': { dateKey: '2026-10-08', mood: 'tired', energy: 'low', flow: 'heavy', bodyNotes: [], note: '' },
    '2026-10-09': { dateKey: '2026-10-09', mood: 'calm', energy: 'okay', flow: 'medium', bodyNotes: [], note: '' },
    '2026-10-10': { dateKey: '2026-10-10', mood: 'happy', energy: 'full', flow: 'light', bodyNotes: [], note: '' },
    '2026-11-01': { dateKey: '2026-11-01', mood: 'crampy', energy: 'low', flow: 'medium', bodyNotes: ['Cramps'], note: 'Started today morning' },
    '2026-11-02': { dateKey: '2026-11-02', mood: 'tired', energy: 'okay', flow: 'heavy', bodyNotes: [], note: '' },
  },
  periodLogs: [],
  journalEntries: [
    {
      id: 'seed-1',
      chapterTitle: 'CARE COVE',
      chapterColor: '#24735A',
      meta: '2.4 · 30 Oct',
      text: "If it happens at school, I'll ask Ms. Kapoor. And I packed my pouch!",
      stickerIndex: 0,
      createdAt: '2026-10-30T10:00:00Z',
    },
    {
      id: 'seed-2',
      chapterTitle: 'CARE COVE',
      chapterColor: '#24735A',
      meta: '2.2 · 27 Oct',
      text: "I think I'd like to try period underwear because I play badminton.",
      stickerIndex: 2,
      createdAt: '2026-10-27T10:00:00Z',
    },
    {
      id: 'seed-3',
      chapterTitle: 'MOON MEADOW',
      chapterColor: '#2F6494',
      meta: '1.1 · 20 Oct',
      text: "Before today I thought periods were scary. Now I know it's just my body's cycle, like the moon.",
      stickerIndex: 1,
      createdAt: '2026-10-20T10:00:00Z',
    },
  ],
  worryJarCount: 5,
  worriesList: [],
};

export function useDaughterState() {
  const { activeProfile, learners } = useAuthStore();

  const currentLearner: LearnerProfile =
    (activeProfile && activeProfile.type === 'DAUGHTER' ? activeProfile.learner : null) ||
    (learners && learners.length > 0
      ? learners[0]
      : {
          id: 'default',
          name: 'Aanya',
          age: '11',
          flowersCount: 7,
          petalsCount: 340,
          streakDays: 3,
        });

  const storageKey = `infano_daughter_state_${currentLearner.id || 'default'}`;

  const [data, setData] = useState<DaughterLocalData>(DEFAULT_DATA);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        setData({ ...DEFAULT_DATA, ...parsed });
      } else {
        setData(DEFAULT_DATA);
      }
    } catch {
      setData(DEFAULT_DATA);
    } finally {
      setHydrated(true);
    }
  }, [storageKey]);

  const updateData = useCallback(
    (updater: (prev: DaughterLocalData) => DaughterLocalData) => {
      setData((prev) => {
        const next = updater(prev);
        try {
          localStorage.setItem(storageKey, JSON.stringify(next));
        } catch {
          // ignore storage quota errors
        }
        return next;
      });
    },
    [storageKey]
  );

  const basePetals = currentLearner.petalsCount ?? 340;
  const totalPetals = Math.max(0, basePetals + data.bonusPetals - data.spentPetals);
  const doneCount = currentLearner.flowersCount ?? 7;

  return {
    currentLearner,
    data,
    hydrated,
    totalPetals,
    doneCount,
    updateData,
  };
}

