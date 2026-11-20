'use client';

import React from 'react';

/**
 * High-fidelity Skeleton loader for Course Detail Landing Page (/course/[slug])
 * Matches the exact anatomy, color scheme, and typography grid of the HerNext course landing.
 */
export function CourseDetailSkeleton() {
  return (
    <div className="min-h-screen bg-[#FFFAF6] text-[#3D2C4A] font-['Nunito',sans-serif] overflow-x-hidden" aria-hidden="true">
      {/* 1. ANNOUNCEMENT BAR SKELETON */}
      <div className="bg-[#FFF4C7]/80 border-b border-[#F3E3A1] py-2.5 px-4 flex flex-wrap items-center justify-center gap-4">
        <div className="h-4 w-52 rounded-full bg-[#EAD68C]/60 animate-pulse" />
        <div className="h-6 w-36 rounded-full bg-[#3D2C4A]/20 animate-pulse" />
        <div className="h-4 w-48 rounded-full bg-[#EAD68C]/60 animate-pulse hidden sm:block" />
      </div>

      {/* 2. HEADER SKELETON */}
      <header className="sticky top-0 z-50 bg-[#FFFAF6]/90 backdrop-blur-md border-b border-[#F1E4E8]">
        <div className="max-w-[1200px] mx-auto px-6 py-3 flex items-center justify-between gap-4">
          {/* Logo placeholder */}
          <div className="h-10 w-44 rounded-xl bg-[#F1E4E8] animate-pulse" />

          {/* Desktop Nav Links */}
          <div className="hidden lg:flex items-center gap-7">
            {[72, 84, 80, 56, 40].map((w, idx) => (
              <div
                key={idx}
                className="h-4 rounded-full bg-[#F1E4E8] animate-pulse"
                style={{ width: `${w}px` }}
              />
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <div className="h-5 w-14 rounded-full bg-[#F1E4E8] animate-pulse hidden sm:block" />
            <div className="h-11 w-32 rounded-full bg-[#C2456A]/30 animate-pulse" />
          </div>
        </div>
      </header>

      {/* 3. HERO SECTION SKELETON */}
      <section className="relative py-12 md:py-16 max-w-[1200px] mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Left Hero Content */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            {/* Category and Title Badges */}
            <div className="flex flex-wrap gap-2.5">
              <div className="h-7 w-40 rounded-full bg-[#FFFFFF] border border-[#F1D6DD] animate-pulse" />
              <div className="h-7 w-56 rounded-full bg-[#3D2C4A]/15 animate-pulse" />
            </div>

            {/* Headline */}
            <div className="space-y-3 pt-1">
              <div className="h-12 w-full max-w-xl rounded-2xl bg-[#F1E4E8] animate-pulse" />
              <div className="h-12 w-4/5 rounded-2xl bg-[#F1E4E8] animate-pulse" />
            </div>

            {/* Description */}
            <div className="space-y-2.5 max-w-xl pt-1">
              <div className="h-4 w-full rounded bg-[#EFE6E8] animate-pulse" />
              <div className="h-4 w-11/12 rounded bg-[#EFE6E8] animate-pulse" />
              <div className="h-4 w-3/4 rounded bg-[#EFE6E8] animate-pulse" />
            </div>

            {/* Feature Pills */}
            <div className="flex flex-wrap gap-2 pt-2">
              <div className="h-8 w-36 rounded-xl bg-[#D8ECF8]/70 animate-pulse" />
              <div className="h-8 w-40 rounded-xl bg-[#D4EFE4]/70 animate-pulse" />
              <div className="h-8 w-36 rounded-xl bg-[#FFE3CC]/70 animate-pulse" />
              <div className="h-8 w-28 rounded-xl bg-[#E3DAF5]/70 animate-pulse" />
            </div>

            {/* Rating & Social Proof */}
            <div className="flex items-center gap-3 pt-2">
              <div className="flex -space-x-2">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-[#F1E4E8] animate-pulse" />
                ))}
              </div>
              <div className="h-4 w-48 rounded bg-[#EFE6E8] animate-pulse" />
            </div>

            {/* Pricing Card & CTA Buttons */}
            <div className="pt-3 flex flex-wrap items-center gap-4">
              <div className="h-14 w-44 rounded-full bg-[#C2456A]/30 animate-pulse" />
              <div className="h-14 w-40 rounded-full bg-white border border-[#F1E4E8] animate-pulse" />
              <div className="h-4 w-36 rounded bg-[#EFE6E8] animate-pulse" />
            </div>
          </div>

          {/* Right Hero Video Card Preview */}
          <div className="lg:col-span-5">
            <div className="rounded-[32px] bg-white border border-[#F1E4E8] p-4 shadow-xl shadow-[#3D2C4A]/5 space-y-4">
              {/* Video Mock */}
              <div className="aspect-video w-full rounded-2xl bg-gradient-to-br from-[#F5E9EC] to-[#E9DCDE] relative flex items-center justify-center overflow-hidden">
                <div className="w-16 h-16 rounded-full bg-white/80 shadow-md flex items-center justify-center animate-pulse">
                  <div className="w-0 h-0 border-y-8 border-y-transparent border-l-14 border-l-[#C2456A] ml-1" />
                </div>
                <div className="absolute top-3 left-3 h-6 w-24 rounded-full bg-black/20" />
                <div className="absolute bottom-3 right-3 h-5 w-16 rounded bg-black/20" />
              </div>

              {/* Free Preview Tagline */}
              <div className="space-y-2 p-1">
                <div className="h-5 w-2/3 rounded-lg bg-[#F1E4E8] animate-pulse" />
                <div className="h-3.5 w-full rounded bg-[#EFE6E8] animate-pulse" />
              </div>

              {/* Quick Perks List */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#F1E4E8]">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-[#D4EFE4] shrink-0" />
                    <div className="h-3 w-20 rounded bg-[#EFE6E8] animate-pulse" />
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 4. STATS METRICS ROW */}
      <section className="border-y border-[#F1E4E8] bg-white/60 py-8">
        <div className="max-w-[1200px] mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="space-y-2 text-center flex flex-col items-center">
              <div className="h-8 w-24 rounded-xl bg-[#F1E4E8] animate-pulse" />
              <div className="h-3.5 w-32 rounded bg-[#EFE6E8] animate-pulse" />
            </div>
          ))}
        </div>
      </section>

      {/* 5. CURRICULUM MODULES SKELETON */}
      <section className="py-16 max-w-[1200px] mx-auto px-6 space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-3">
          <div className="h-4 w-32 rounded-full bg-[#F1E4E8] mx-auto animate-pulse" />
          <div className="h-9 w-72 rounded-2xl bg-[#F1E4E8] mx-auto animate-pulse" />
          <div className="h-4 w-96 rounded bg-[#EFE6E8] mx-auto animate-pulse" />
        </div>

        <div className="space-y-4 max-w-3xl mx-auto">
          {[
            { color: '#D8ECF8' },
            { color: '#D4EFE4' },
            { color: '#FFE3CC' },
            { color: '#E3DAF5' },
          ].map((item, idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-[#F1E4E8] bg-white overflow-hidden shadow-xs"
            >
              <div
                className="p-5 flex items-center justify-between gap-4"
                style={{ backgroundColor: `${item.color}50` }}
              >
                <div className="flex items-center gap-3 w-full">
                  <div className="w-8 h-8 rounded-full bg-white/80 shrink-0" />
                  <div className="space-y-1.5 w-full">
                    <div className="h-4 w-48 rounded bg-[#3D2C4A]/20 animate-pulse" />
                    <div className="h-3 w-32 rounded bg-[#3D2C4A]/10 animate-pulse" />
                  </div>
                </div>
                <div className="w-6 h-6 rounded-full bg-white/60 shrink-0" />
              </div>
            </div>
          ))}
        </div>
      </section>

      <div role="status" className="sr-only">Loading HerNext course details...</div>
    </div>
  );
}

export default CourseDetailSkeleton;
