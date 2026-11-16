'use client';

import React from 'react';

/**
 * Skeleton loader for the main Customer Dashboard Overview page (/dashboard)
 */
export function DashboardPageSkeleton() {
  return (
    <div className="min-h-screen bg-[#FBF8F6] text-[#3D2C4A] font-['Noto_Sans',sans-serif]" aria-hidden="true">
      {/* Header bar placeholder */}
      <header className="bg-white border-b border-[#F1E4E8]">
        <div className="max-w-[1180px] mx-auto px-5 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-8 w-28 rounded-lg bg-[#F1E4E8] animate-pulse" />
            <div className="h-5 w-24 rounded bg-[#F1E4E8] animate-pulse border-l border-[#F1E4E8] pl-3" />
          </div>
          <div className="flex items-center gap-3">
            <div className="h-9 w-24 rounded-full bg-[#F1E4E8] animate-pulse" />
            <div className="h-9 w-9 rounded-full bg-[#F1E4E8] animate-pulse" />
          </div>
        </div>
      </header>

      <main className="max-w-[1180px] mx-auto px-4 sm:px-6 py-6 sm:py-8 flex flex-col gap-6">
        {/* Welcome Banner Skeleton */}
        <section className="rounded-[28px] border border-[#F1E4E8] bg-white p-6 sm:p-8 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-3">
              <div className="h-5 w-28 rounded-full bg-[#FDEFF0] animate-pulse" />
              <div className="h-8 w-64 sm:w-80 rounded-xl bg-[#F1E4E8] animate-pulse" />
              <div className="h-4 w-48 sm:w-96 rounded-md bg-[#F1E4E8] animate-pulse" />
            </div>
            <div className="h-11 w-36 rounded-full bg-[#FDEFF0] animate-pulse shrink-0" />
          </div>
        </section>

        {/* Hero Lesson / Action Highlight Card */}
        <section className="rounded-[28px] border border-[#B7D8EF]/60 bg-gradient-to-br from-[#EAF4FB] to-[#D5EAF7] p-6 sm:p-8 shadow-xs">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-3 max-w-xl w-full">
              <div className="h-6 w-28 rounded-full bg-white/80 animate-pulse" />
              <div className="h-8 w-72 rounded-xl bg-white/70 animate-pulse" />
              <div className="h-4 w-full rounded-md bg-white/60 animate-pulse" />
              <div className="h-4 w-3/4 rounded-md bg-white/60 animate-pulse" />
            </div>
            <div className="h-12 w-44 rounded-full bg-white/80 animate-pulse shrink-0" />
          </div>
        </section>

        {/* Feature Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="rounded-[26px] border border-[#F1E4E8] bg-white p-6 shadow-xs flex flex-col justify-between min-h-[220px]"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="h-6 w-20 rounded-full bg-[#FDEFF0] animate-pulse" />
                  <div className="h-5 w-16 rounded-md bg-[#F1E4E8] animate-pulse" />
                </div>
                <div className="h-6 w-44 rounded-lg bg-[#F1E4E8] animate-pulse" />
                <div className="space-y-2 pt-1">
                  <div className="h-3.5 w-full rounded bg-[#FBF8F6] animate-pulse" />
                  <div className="h-3.5 w-4/5 rounded bg-[#FBF8F6] animate-pulse" />
                </div>
              </div>
              <div className="mt-5 pt-4 border-t border-[#F1E4E8]/60 flex items-center justify-between">
                <div className="h-4 w-24 rounded bg-[#F1E4E8] animate-pulse" />
                <div className="h-9 w-24 rounded-full bg-[#F1E4E8] animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </main>
      <div role="status" className="sr-only">Loading dashboard...</div>
    </div>
  );
}

/**
 * Skeleton loader for Profile Picker page (/dashboard/picker)
 */
export function ProfilePickerSkeleton() {
  return (
    <div
      className="min-h-screen bg-[#FFFAF6] text-[#3D2C4A] font-['Noto_Sans',sans-serif] flex flex-col items-center justify-center p-4 sm:p-8 md:p-12 relative overflow-hidden"
      aria-hidden="true"
    >
      <div className="w-full max-w-[880px] flex flex-col items-center gap-7">
        {/* Header Title Skeleton */}
        <div className="text-center space-y-3 w-full max-w-md mx-auto">
          <div className="h-6 w-36 mx-auto rounded-full bg-[#FDEFF0] animate-pulse" />
          <div className="h-10 sm:h-12 w-72 sm:w-80 mx-auto rounded-2xl bg-[#F1E4E8] animate-pulse" />
          <div className="h-4 w-64 mx-auto rounded-md bg-[#F1E4E8] animate-pulse" />
        </div>

        {/* Profile Grid Skeleton */}
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-5 md:gap-6 max-w-2xl mx-auto">
          {/* Learner Card Skeleton */}
          <div className="bg-white border-2 border-[#F1E4E8] rounded-[32px] p-6 sm:p-7 flex flex-col items-center justify-between gap-4 min-h-[250px] shadow-xs">
            <div className="w-24 h-24 rounded-full bg-[#FDEFF0] animate-pulse" />
            <div className="space-y-2 text-center w-full flex flex-col items-center">
              <div className="h-6 w-32 rounded-lg bg-[#F1E4E8] animate-pulse" />
              <div className="h-4 w-16 rounded-md bg-[#F1E4E8] animate-pulse" />
            </div>
            <div className="h-7 w-28 rounded-full bg-[#EAF7F1] animate-pulse" />
          </div>

          {/* Parent Space Card Skeleton */}
          <div className="bg-white border-2 border-[#F1E4E8] rounded-[32px] p-6 sm:p-7 flex flex-col items-center justify-between gap-4 min-h-[250px] shadow-xs">
            <div className="w-24 h-24 rounded-full bg-[#E3DAF5] animate-pulse" />
            <div className="space-y-2 text-center w-full flex flex-col items-center">
              <div className="h-6 w-32 rounded-lg bg-[#F1E4E8] animate-pulse" />
              <div className="h-4 w-28 rounded-md bg-[#F1E4E8] animate-pulse" />
            </div>
            <div className="h-7 w-28 rounded-full bg-[#F1ECFA] animate-pulse" />
          </div>
        </div>

        {/* Footer Skeleton */}
        <div className="h-4 w-48 rounded-md bg-[#F1E4E8] animate-pulse mt-4" />
      </div>
      <div role="status" className="sr-only">Loading profile picker...</div>
    </div>
  );
}

/**
 * Skeleton loader for Courses grid (/dashboard/courses)
 */
export function CoursesGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 py-6" aria-hidden="true">
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="rounded-[24px] border border-[#F1E4E8] bg-white p-5 shadow-xs space-y-4">
          <div className="h-36 w-full rounded-2xl bg-[#FDEFF0] animate-pulse" />
          <div className="space-y-2">
            <div className="h-4 w-20 rounded-full bg-[#F1E4E8] animate-pulse" />
            <div className="h-6 w-3/4 rounded-lg bg-[#F1E4E8] animate-pulse" />
            <div className="h-3.5 w-full rounded bg-[#FBF8F6] animate-pulse" />
          </div>
          <div className="pt-3 border-t border-[#F1E4E8]/60 flex items-center justify-between">
            <div className="h-4 w-24 rounded bg-[#F1E4E8] animate-pulse" />
            <div className="h-8 w-20 rounded-full bg-[#F1E4E8] animate-pulse" />
          </div>
        </div>
      ))}
      <div role="status" className="sr-only">Loading courses...</div>
    </div>
  );
}

/**
 * Skeleton loader for Enrolled Programs list (/dashboard/enrolled-programs)
 */
export function ProgramsListSkeleton() {
  return (
    <div className="space-y-4 py-4" aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="rounded-[24px] border border-slate-100 bg-white p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 animate-pulse shrink-0" />
            <div className="space-y-2">
              <div className="h-5 w-48 rounded-lg bg-slate-100 animate-pulse" />
              <div className="h-3.5 w-32 rounded-md bg-slate-100 animate-pulse" />
            </div>
          </div>
          <div className="h-9 w-28 rounded-xl bg-slate-100 animate-pulse shrink-0" />
        </div>
      ))}
      <div role="status" className="sr-only">Loading programs...</div>
    </div>
  );
}

/**
 * Skeleton loader for Ledger/Payments page (/dashboard/payments)
 */
export function LedgerSkeleton() {
  return (
    <div className="space-y-6 py-4" aria-hidden="true">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[0, 1, 2].map((i) => (
          <div key={i} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xs space-y-3">
            <div className="h-4 w-20 rounded bg-slate-100 animate-pulse" />
            <div className="h-8 w-32 rounded-lg bg-slate-100 animate-pulse" />
          </div>
        ))}
      </div>
      <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-xs space-y-4">
        <div className="h-5 w-40 rounded bg-slate-100 animate-pulse" />
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-12 w-full rounded-xl bg-slate-50 animate-pulse" />
        ))}
      </div>
      <div role="status" className="sr-only">Loading ledger...</div>
    </div>
  );
}

/**
 * Skeleton loader for Resources page (/dashboard/resources)
 */
export function ResourcesGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 py-4" aria-hidden="true">
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
        <div key={i} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-xs space-y-3">
          <div className="h-36 w-full rounded-xl bg-slate-100 animate-pulse" />
          <div className="h-3.5 w-16 rounded bg-slate-100 animate-pulse" />
          <div className="h-5 w-3/4 rounded bg-slate-100 animate-pulse" />
          <div className="h-3 w-full rounded bg-slate-50 animate-pulse" />
        </div>
      ))}
      <div role="status" className="sr-only">Loading resources...</div>
    </div>
  );
}
