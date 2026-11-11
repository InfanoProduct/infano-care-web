'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { DaughterShell } from '@/features/daughter/DaughterShell';
import { useDaughterState } from '@/features/daughter/daughter-state';
import { ArrowLeft, Camera } from 'lucide-react';
import { toast } from 'react-hot-toast';

const ICONS = {
  swing: 'M5 3v12M19 3v12M3 3h18M8 15h8M8 15v-3M16 15v-3',
  bath: 'M5 10h14a7 3 0 0 1-14 0zM12 13v7M8 20h8',
  lights: 'M3 6q9 6 18 0M6 8v2M10 10v2M14 10v2M18 8v2',
  lantern: 'M12 2v3M8 5h8v14a4 4 0 0 1-8 0zM14 10a2 2 0 1 1-2-2',
  butterfly:
    'M12 7v12M12 9C9 3 3 5 5 10c1 3 5 3 7 1M12 9c3-6 9-4 7 1-1 3-5 3-7 1M12 13c-3 0-6 2-4 5M12 13c3 0 6 2 4 5',
  bunny:
    'M9 10C7 4 8 2 9 2s2 3 1 8M15 10c2-6 1-8 0-8s-2 3-1 8M7 16a5 4 0 1 0 10 0 5 4 0 1 0-10 0',
  rainbow: 'M3 18a9 9 0 0 1 18 0M6 18a6 6 0 0 1 12 0M9 18a3 3 0 0 1 6 0',
  mat: 'M3 9l9-4 9 4-9 4zM3 9v6l9 4 9-4V9',
  pot: 'M6 10h12l-2 10H8zM5 7h14v3H5z',
  glasses: 'M3 12a3 3 0 1 0 6 0 3 3 0 1 0-6 0M15 12a3 3 0 1 0 6 0 3 3 0 1 0-6 0M9 12h6',
  clip: 'M12 8a2 2 0 1 0 0-.1M12 8c-3-4-7 0-3 3M12 8c3-4 7 0 3 3M6 16h12',
  hat: 'M4 16h16M7 16l1-7h8l1 7',
  scarf: 'M5 5q7 5 14 0v4q-7 5-14 0zM8 12v8M12 13v7',
};

interface ShopItem {
  id: string;
  name: string;
  price: number;
  icon: string;
  bg: string;
  ink: string;
  needsBadge?: string;
  unlockedByDoneCount?: number;
}

const CATALOG: Record<'deco' | 'pots' | 'avatar', ShopItem[]> = {
  deco: [
    { id: 'swing', name: 'Wooden swing', price: 120, icon: ICONS.swing, bg: '#FFE3CC', ink: '#9A4A16' },
    { id: 'lantern', name: 'Moon lantern', price: 100, icon: ICONS.lantern, bg: '#FFF4C7', ink: '#8A6410', needsBadge: 'Cycle Explorer', unlockedByDoneCount: 3 },
    { id: 'bath', name: 'Bird bath', price: 90, icon: ICONS.bath, bg: '#D8ECF8', ink: '#2F6494' },
    { id: 'lights', name: 'Fairy lights', price: 80, icon: ICONS.lights, bg: '#FFF4C7', ink: '#8A6410' },
    { id: 'butterfly', name: 'Butterfly', price: 60, icon: ICONS.butterfly, bg: '#F9D5D3', ink: '#A8365A' },
    { id: 'bunny', name: 'Bunny friend', price: 110, icon: ICONS.bunny, bg: '#F1ECFA', ink: '#5A4385' },
    { id: 'mat', name: 'Picnic mat', price: 70, icon: ICONS.mat, bg: '#D4EFE4', ink: '#24735A' },
    { id: 'rainbow', name: 'Rainbow arch', price: 150, icon: ICONS.rainbow, bg: '#E3DAF5', ink: '#5A4385', needsBadge: 'Full Bloom', unlockedByDoneCount: 15 },
  ],
  pots: [
    { id: 'polka', name: 'Polka-dot pot', price: 30, icon: ICONS.pot, bg: '#F9D5D3', ink: '#A8365A' },
    { id: 'teacup', name: 'Teacup pot', price: 50, icon: ICONS.pot, bg: '#FFF4C7', ink: '#8A6410' },
    { id: 'rangoli', name: 'Rangoli pot', price: 60, icon: ICONS.pot, bg: '#FFE3CC', ink: '#9A4A16' },
    { id: 'cloud', name: 'Cloud pot', price: 40, icon: ICONS.pot, bg: '#D8ECF8', ink: '#2F6494' },
    { id: 'star', name: 'Star pot', price: 45, icon: ICONS.pot, bg: '#E3DAF5', ink: '#5A4385' },
    { id: 'lotus', name: 'Lotus pot', price: 60, icon: ICONS.pot, bg: '#D4EFE4', ink: '#24735A', needsBadge: 'Body Listener', unlockedByDoneCount: 10 },
  ],
  avatar: [
    { id: 'glasses', name: 'Round glasses', price: 40, icon: ICONS.glasses, bg: '#D8ECF8', ink: '#2F6494' },
    { id: 'clip', name: 'Flower hair clip', price: 40, icon: ICONS.clip, bg: '#F9D5D3', ink: '#A8365A' },
    { id: 'hat', name: 'Bucket hat', price: 60, icon: ICONS.hat, bg: '#FFF4C7', ink: '#8A6410' },
    { id: 'hijab', name: 'Lavender hijab', price: 50, icon: ICONS.scarf, bg: '#E3DAF5', ink: '#5A4385' },
    { id: 'dupatta', name: 'Pastel dupatta', price: 60, icon: ICONS.scarf, bg: '#F9D5D3', ink: '#A8365A' },
    { id: 'band', name: 'Headband', price: 40, icon: ICONS.hat, bg: '#D4EFE4', ink: '#24735A' },
  ],
};

const POSITIONS: Record<string, { left: string; top: string }> = {
  swing: { left: '8%', top: '26%' },
  lantern: { left: '80%', top: '18%' },
  bath: { left: '68%', top: '58%' },
  lights: { left: '42%', top: '6%' },
  butterfly: { left: '54%', top: '25%' },
  bunny: { left: '20%', top: '58%' },
  mat: { left: '42%', top: '64%' },
  rainbow: { left: '30%', top: '14%' },
};

export default function GardenShopPage() {
  const { currentLearner, totalPetals, doneCount, data, updateData } = useDaughterState();
  const [tab, setTab] = useState<'deco' | 'pots' | 'avatar'>('deco');
  const [decorate, setDecorate] = useState(false);

  const placedItems = CATALOG.deco.filter((d) => data.placedGardenItems[d.id] && POSITIONS[d.id]);

  const handleBuyOrToggle = (item: ShopItem) => {
    const owned = !!data.ownedShopItems[item.id];
    const isDeco = tab === 'deco';

    if (owned) {
      if (isDeco) {
        const nextPlaced = !data.placedGardenItems[item.id];
        updateData((prev) => ({
          ...prev,
          placedGardenItems: { ...prev.placedGardenItems, [item.id]: nextPlaced },
        }));
        toast(nextPlaced ? `${item.name} placed in your garden!` : `${item.name} put away.`);
      }
      return;
    }

    if (totalPetals < item.price) {
      toast.error(`You need ${item.price - totalPetals} more petals for ${item.name}!`);
      return;
    }

    updateData((prev) => ({
      ...prev,
      spentPetals: prev.spentPetals + item.price,
      ownedShopItems: { ...prev.ownedShopItems, [item.id]: true },
      placedGardenItems: isDeco ? { ...prev.placedGardenItems, [item.id]: true } : prev.placedGardenItems,
    }));
    toast.success(`Unlocked ${item.name}!`, { icon: '🌸' });
  };

  return (
    <DaughterShell gigiTip="Petals come from learning, never from money! Decorate your garden however you like.">
      <style jsx global>{`
        @keyframes gspop { 0% { transform: scale(0.4); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
        @keyframes gssway { 0%,100% { transform: rotate(-3deg); } 50% { transform: rotate(3deg); } }
        .gs-pop { animation: gspop 0.45s cubic-bezier(0.2, 1.5, 0.4, 1); }
        .gs-sway { transform-box: fill-box; transform-origin: 50% 100%; animation: gssway 4s ease-in-out infinite; }
      `}</style>

      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard/badges"
          aria-label="Back to badges"
          className="w-11 h-11 rounded-full bg-white border border-[#F1E4E8] hover:bg-[#FDEFF0] grid place-items-center text-[#3D2C4A] transition-colors shrink-0"
        >
          <ArrowLeft size={20} />
        </Link>
        <h1 className="flex-1 m-0 font-['Baloo_2',sans-serif] font-bold text-2xl sm:text-3xl text-[#3D2C4A]">
          Garden shop
        </h1>
        <span
          aria-live="polite"
          className="inline-flex items-center gap-1.5 bg-[#FDEFF0] rounded-full px-4 py-1.5 font-bold text-base text-[#3D2C4A] shadow-2xs"
        >
          <svg width="14" height="18" viewBox="0 0 16 22" aria-hidden="true">
            <ellipse cx="8" cy="11" rx="6" ry="10" fill="#F4A3B4" />
          </svg>
          {totalPetals}
        </span>
      </div>

      {/* Responsive Desktop 2-Col Studio Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Sticky Garden Preview & Controls (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4 lg:sticky lg:top-6">
          <section
            aria-label="My garden preview"
            className="relative h-[220px] sm:h-[260px] lg:h-[300px] rounded-[28px] overflow-hidden bg-[#D8ECF8] border border-[#C8E0F0] shadow-sm"
          >
            <svg viewBox="0 0 700 260" preserveAspectRatio="none" aria-hidden="true" className="w-full h-full">
              <path d="M0 150 C 160 120, 380 170, 700 135 V260 H0z" fill="#A8D8BE" />
              {[80, 160, 240, 340, 430, 520, 610].map((cx, i) => (
                <g key={cx} transform={`translate(${cx} ${205 + (i % 2) * 10})`}>
                  <path d="M0 0V-42" stroke="#4E9572" strokeWidth="4" />
                  <circle cy="-46" r="12" fill={i < 3 ? '#8EBFE0' : '#7FC3A3'} />
                </g>
              ))}
            </svg>

            {/* Placed Decorations */}
            {placedItems.map((p) => {
              const pos = POSITIONS[p.id];
              return (
                <span
                  key={p.id}
                  style={{ left: pos.left, top: pos.top }}
                  className="gs-pop absolute w-13 h-13 rounded-2xl bg-white/80 backdrop-blur-xs grid place-items-center shadow-sm"
                  title={p.name}
                >
                  <svg
                    className="gs-sway"
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke={p.ink}
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d={p.icon} />
                  </svg>
                </span>
              );
            })}

            <span className="absolute left-3.5 top-3 bg-white/85 rounded-full px-3 py-1 text-xs font-bold text-[#3D2C4A] shadow-2xs">
              {currentLearner.name}&apos;s Bloom Garden
            </span>
            {decorate && (
              <span className="absolute right-3.5 top-3 bg-[#3D2C4A] text-white rounded-full px-3 py-1 text-xs font-bold shadow-xs">
                Decorating
              </span>
            )}
          </section>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2.5">
            <button
              type="button"
              onClick={() => {
                setDecorate(!decorate);
                setTab('deco');
              }}
              className={`flex-1 min-h-[48px] rounded-full font-bold text-sm transition-colors cursor-pointer ${
                decorate ? 'bg-[#3D2C4A] text-white' : 'bg-[#D4EFE4] hover:bg-[#C3E6D6] text-[#1F4A38]'
              }`}
            >
              {decorate ? 'Done decorating' : 'Decorate my garden'}
            </button>
            <button
              type="button"
              onClick={() => toast.success(`Snapshot saved to ${currentLearner.name}'s memories! 📸`)}
              className="min-h-[48px] px-5 rounded-full border-2 border-[#3D2C4A] bg-white hover:bg-[#3D2C4A] hover:text-white text-[#3D2C4A] font-bold text-sm inline-flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Camera size={16} />
              <span>Take a photo</span>
            </button>
          </div>

          <p className="text-xs text-[#6E5B7A] m-0 bg-white border border-[#F1E4E8] rounded-2xl p-3.5 text-center">
            Petals come from learning, never from money. Some items unlock with badges.
          </p>
        </div>

        {/* Right Catalog & Tabs (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          {/* Category Tabs */}
          <div
            role="tablist"
            aria-label="Shop sections"
            className="flex gap-1.5 bg-white border border-[#F1E4E8] rounded-full p-1.5 max-w-md w-full"
          >
            {(
              [
                ['deco', 'Garden'],
                ['pots', 'Pots'],
                ['avatar', 'My look'],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={tab === key}
                onClick={() => setTab(key)}
                className={`flex-1 min-h-[40px] rounded-full font-bold text-sm transition-colors cursor-pointer ${
                  tab === key ? 'bg-[#3D2C4A] text-white' : 'bg-transparent text-[#3D2C4A] hover:bg-[#FFFAF6]'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Shop Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
        {CATALOG[tab].map((item) => {
          const owned = !!data.ownedShopItems[item.id];
          const isLocked =
            item.unlockedByDoneCount !== undefined && doneCount < item.unlockedByDoneCount;
          const canAfford = totalPetals >= item.price;
          const isPlaced = !!data.placedGardenItems[item.id];
          const isDeco = tab === 'deco';

          let btnLabel = `${item.price} petals`;
          let btnCls = 'bg-[#C2456A] hover:bg-[#A8365A] text-white';
          let disabled = false;

          if (isLocked) {
            btnLabel = `Needs ${item.needsBadge}`;
            btnCls = 'bg-[#F6F1F4] text-[#6E5B7A]';
            disabled = true;
          } else if (owned) {
            if (isDeco) {
              btnLabel = isPlaced ? 'In my garden ✓' : 'Place in garden';
              btnCls = isPlaced
                ? 'bg-[#EAF7F1] text-[#1F5A45]'
                : 'bg-white border-2 border-[#3D2C4A] text-[#3D2C4A] hover:bg-[#3D2C4A] hover:text-white';
            } else {
              btnLabel = 'Owned ✓';
              btnCls = 'bg-[#EAF7F1] text-[#1F5A45]';
              disabled = true;
            }
          } else if (!canAfford) {
            btnLabel = `${item.price} petals · need more`;
            btnCls = 'bg-[#F6F1F4] text-[#6E5B7A]';
            disabled = true;
          } else if (item.needsBadge) {
            btnLabel = `${item.price} petals · unlocked!`;
          }

          return (
            <div
              key={item.id}
              className={`bg-white border border-[#F1E4E8] rounded-2xl p-3.5 flex flex-col gap-2.5 shadow-2xs transition-opacity ${
                isLocked ? 'opacity-70' : ''
              }`}
            >
              <div
                style={{ backgroundColor: item.bg }}
                className="h-20 rounded-xl grid place-items-center"
              >
                <svg
                  width="42"
                  height="42"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke={item.ink}
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d={item.icon} />
                </svg>
              </div>
              <div className="font-bold text-sm text-[#3D2C4A] leading-tight">{item.name}</div>
              <button
                type="button"
                disabled={disabled}
                onClick={() => handleBuyOrToggle(item)}
                className={`mt-auto min-h-[40px] rounded-full text-xs font-bold px-3 transition-colors ${
                  disabled ? 'cursor-not-allowed' : 'cursor-pointer'
                } ${btnCls}`}
              >
                {btnLabel}
              </button>
            </div>
          );
        })}
          </div>
        </div>
      </div>
    </DaughterShell>
  );
}

