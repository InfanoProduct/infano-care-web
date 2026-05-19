"use client";

import AboutHero from '@/features/marketing/components/sections/about/AboutHero';
import AboutStory from '@/features/marketing/components/sections/about/AboutStory';
import AboutMission from '@/features/marketing/components/sections/about/AboutMission';
import AboutExperts from '@/features/marketing/components/sections/about/AboutExperts';
import AboutApproach from '@/features/marketing/components/sections/about/AboutApproach';
import AboutCrew from '@/features/marketing/components/sections/about/AboutCrew';
import AboutCta from '@/features/marketing/components/sections/about/AboutCta';

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* 2.1 — Premium Hero */}
      <AboutHero />

      {/* 2.2 — Our Story (Editorial Layout) */}
      <AboutStory />

      {/* 2.3 — Mission & Values (Bento Grid) */}
      <AboutMission />

      {/* 2.4 — Meet Our Expert Council (Premium Single-Row Infinite Scroll) */}
      <AboutExperts />

      {/* 2.5 — Our Approach (Elegant Light Theme) */}
      <AboutApproach />

      {/* 2.6 — Crew Behind the Scene */}
      {/* <AboutCrew /> */}

      {/* 2.7 — Why Now? (Pastel CTA) */}
      <AboutCta />
    </div>
  );
}
