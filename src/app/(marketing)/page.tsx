import { Metadata } from 'next';
import { HeroSection } from '@/features/marketing/components/sections/HeroSection';
import { ProblemSection } from '@/features/marketing/components/sections/ProblemSection';
import { EcosystemSection } from '@/features/marketing/components/sections/EcosystemSection';
import { AudienceSection } from '@/features/marketing/components/sections/AudienceSection';
import { ImpactSection } from '@/features/marketing/components/sections/ImpactSection';
import { BookSection } from '@/features/marketing/components/sections/BookSection';
import { PartnershipBanner } from '@/features/marketing/components/sections/PartnershipBanner';

export const metadata: Metadata = {
  title: 'Empowering Adolescent Girls & Families',
  description: "India's first holistic platform supporting adolescent girls and their parents through puberty education, mental wellness programs, and digital healthcare resources.",
  openGraph: {
    title: 'Infano Care - Adolescent Health & Puberty Education Solutions',
    description: "India's first holistic platform supporting adolescent girls and their parents through puberty education, mental wellness programs, and digital healthcare resources.",
    url: 'https://infano.care',
  },
};

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <HeroSection />
      <ProblemSection />
      <EcosystemSection />
      <AudienceSection />
      <ImpactSection />
      <BookSection />
      <PartnershipBanner />
    </div>
  );
}

