"use client";

import { EcosystemHero } from '@/features/marketing/components/sections/ecosystem/EcosystemHero';
import { LearningPillar } from '@/features/marketing/components/sections/ecosystem/LearningPillar';
import { WellnessPillar } from '@/features/marketing/components/sections/ecosystem/WellnessPillar';
import { EducationPillar } from '@/features/marketing/components/sections/ecosystem/EducationPillar';
import { SupportPillar } from '@/features/marketing/components/sections/ecosystem/SupportPillar';
import { CommunityPillar } from '@/features/marketing/components/sections/ecosystem/CommunityPillar';
import { BookPillar } from '@/features/marketing/components/sections/ecosystem/BookPillar';
import { EcosystemFaq } from '@/features/marketing/components/sections/ecosystem/EcosystemFaq';

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
