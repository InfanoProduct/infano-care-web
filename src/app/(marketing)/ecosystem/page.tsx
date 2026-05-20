import { Metadata } from 'next';
import { EcosystemHero } from '@/features/marketing/components/sections/ecosystem/EcosystemHero';
import { LearningPillar } from '@/features/marketing/components/sections/ecosystem/LearningPillar';
import { WellnessPillar } from '@/features/marketing/components/sections/ecosystem/WellnessPillar';
import { EducationPillar } from '@/features/marketing/components/sections/ecosystem/EducationPillar';
import { SupportPillar } from '@/features/marketing/components/sections/ecosystem/SupportPillar';
import { CommunityPillar } from '@/features/marketing/components/sections/ecosystem/CommunityPillar';
import { BookPillar } from '@/features/marketing/components/sections/ecosystem/BookPillar';
import { EcosystemFaq } from '@/features/marketing/components/sections/ecosystem/EcosystemFaq';

export const metadata: Metadata = {
  title: 'Our Ecosystem | Puberty Education, Wellness & Care',
  description: "Explore the Infano Care Ecosystem — combining book guides, digital physical tracking, clinical expert support, and moderated communities for a safe puberty transition.",
  openGraph: {
    title: 'The Infano Care Ecosystem | A Safe Puberty Journey',
    description: "Explore the Infano Care Ecosystem — combining book guides, digital physical tracking, clinical expert support, and moderated communities for a safe puberty transition.",
    url: 'https://infano.care/ecosystem',
    images: [
      {
        url: '/api/og?title=Our+Ecosystem&category=Ecosystem&author=Infano+Care',
        width: 1200,
        height: 630,
        alt: 'Infano Care Ecosystem',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'The Infano Care Ecosystem | A Safe Puberty Journey',
    description: 'Explore our multi-layered physical and digital support network for girls and parents.',
    images: ['/api/og?title=Our+Ecosystem&category=Ecosystem&author=Infano+Care'],
  },
};

export default function EcosystemPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <EcosystemHero />

      <div id="pillars" className="space-y-0">
        <LearningPillar />
        <WellnessPillar />
        <EducationPillar />
        <SupportPillar />
        <CommunityPillar />
        <BookPillar />
        <EcosystemFaq />
      </div>
    </div>
  );
}
