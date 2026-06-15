import { Metadata } from 'next';
import AboutHero from '@/features/marketing/components/sections/about/AboutHero';
import AboutStory from '@/features/marketing/components/sections/about/AboutStory';
import AboutMission from '@/features/marketing/components/sections/about/AboutMission';
import AboutExperts from '@/features/marketing/components/sections/about/AboutExperts';
import AboutApproach from '@/features/marketing/components/sections/about/AboutApproach';
import AboutCta from '@/features/marketing/components/sections/about/AboutCta';

export const metadata: Metadata = {
  title: {
    absolute: 'About Us | Our Mission & Experts | Infano Care',
  },
  description: "Learn about Infano Care's journey, our mission to transform adolescent female healthcare and education in India, and the expert medical council guiding our puberty programs.",
  openGraph: {
    title: 'About Us | Our Mission & Experts | Infano Care',
    description: "Learn about Infano Care's journey, our mission to transform adolescent female healthcare and education in India, and the expert medical council guiding our puberty programs.",
    url: 'https://infano.care/about',
    images: [
      {
        url: '/og-images/about-og.png',
        width: 1200,
        height: 630,
        alt: 'About Infano Care',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About Us | Our Mission & Experts | Infano Care',
    description: "Learn about Infano Care's journey, our mission to transform adolescent female healthcare and education in India, and the expert medical council guiding our puberty programs.",
    images: ['/og-images/about-og.png'],
  },
};

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
