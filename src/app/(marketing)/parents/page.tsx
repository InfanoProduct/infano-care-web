import { Metadata } from 'next';
import { ParentsHero } from '@/features/marketing/components/sections/parents/ParentsHero';
import { ParentsResponse } from '@/features/marketing/components/sections/parents/ParentsResponse';
import { DaughterExperience } from '@/features/marketing/components/sections/parents/DaughterExperience';
import { ParentDashboard } from '@/features/marketing/components/sections/parents/ParentDashboard';
import { AccessOptions } from '@/features/marketing/components/sections/parents/AccessOptions';
import { ParentsFAQ } from '@/features/marketing/components/sections/parents/ParentsFAQ';

export const metadata: Metadata = {
  title: {
    absolute: 'Parents Programme | Support Your Daughter Through Puberty | Infano Care',
  },
  description: 'Empower your daughter during female puberty with clinical guidance, parent tracking, and empathetic resources built for modern families.',
  openGraph: {
    title: 'Parents Programme | Support Your Daughter Through Puberty | Infano Care',
    description: 'Empower your daughter during female puberty with clinical guidance, parent tracking, and empathetic resources built for modern families.',
    url: 'https://infano.care/parents',
    images: [
      {
        url: '/api/og?title=Parents+Programme&category=Parents&author=Infano+Care',
        width: 1200,
        height: 630,
        alt: 'Infano Parents Programme',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Parents Programme | Support Your Daughter Through Puberty | Infano Care',
    description: 'Empower your daughter during female puberty with clinical guidance, parent tracking, and empathetic resources built for modern families.',
    images: ['/api/og?title=Parents+Programme&category=Parents&author=Infano+Care'],
  },
};

export default function ParentsPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <ParentsHero />
      <ParentsResponse />
      <DaughterExperience />
      <ParentDashboard />
      <AccessOptions />
      <ParentsFAQ />
    </div>
  );
}
