import { Metadata } from 'next';
import { SchoolHero } from '@/features/marketing/components/sections/schools/SchoolHero';
import { SituationSection } from '@/features/marketing/components/sections/schools/SituationSection';
import { RealitySection } from '@/features/marketing/components/sections/schools/RealitySection';
import { GapSection } from '@/features/marketing/components/sections/schools/GapSection';
import { IntroductionSection } from '@/features/marketing/components/sections/schools/IntroductionSection';
import { JourneySection } from '@/features/marketing/components/sections/schools/JourneySection';
import { SessionSection } from '@/features/marketing/components/sections/schools/SessionSection';
import { DigitalPlatformSection } from '@/features/marketing/components/sections/schools/DigitalPlatformSection';
import { TeacherTrainingSection } from '@/features/marketing/components/sections/schools/TeacherTrainingSection';
import { ParentLayerSection } from '@/features/marketing/components/sections/schools/ParentLayerSection';
import { ImpactSection } from '@/features/marketing/components/sections/schools/ImpactSection';
import { SchoolBeyondSection } from '@/features/marketing/components/sections/schools/SchoolBeyondSection';
import { SchoolAdvantage } from '@/features/marketing/components/sections/schools/SchoolAdvantage';
import { PartnershipTiers } from '@/features/marketing/components/sections/schools/PartnershipTiers';
import { FoundingSchoolsSection } from '@/features/marketing/components/sections/schools/FoundingSchoolsSection';
import { PartnershipBanner } from '@/features/marketing/components/sections/PartnershipBanner';

export const metadata: Metadata = {
  title: 'School Partnerships | Puberty & Wellness Programmes',
  description: "Bring Infano's NEP-aligned puberty and wellness curriculum to your school. Comprehensive teacher training, expert workshops, and secure student platforms.",
  openGraph: {
    title: 'School Partnerships | Puberty & Wellness Curriculum',
    description: "Bring Infano's NEP-aligned puberty and wellness curriculum to your school. Comprehensive teacher training, expert workshops, and secure student platforms.",
    url: 'https://infano.care/schools',
    images: [
      {
        url: '/api/og?title=School+Partnerships&category=Schools&author=Infano+Care',
        width: 1200,
        height: 630,
        alt: 'Infano School Partnerships',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'School Partnerships | Puberty & Wellness Curriculum',
    description: "Bring Infano's NEP-aligned puberty and wellness curriculum to your school.",
    images: ['/api/og?title=School+Partnerships&category=Schools&author=Infano+Care'],
  },
};

export default function SchoolsPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <SchoolHero />
      <SituationSection />
      <RealitySection />
      <GapSection />
      <IntroductionSection />
      <JourneySection />
      <SessionSection />
      <DigitalPlatformSection />
      <TeacherTrainingSection />
      <ParentLayerSection />
      <ImpactSection />
      <SchoolBeyondSection />
      <PartnershipTiers />
      <FoundingSchoolsSection />
      <PartnershipBanner />
    </div>
  );
}
