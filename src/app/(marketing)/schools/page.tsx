'use client';

import { SchoolHero } from '@/features/marketing/components/sections/schools/SchoolHero';
import { SchoolAdvantage } from '@/features/marketing/components/sections/schools/SchoolAdvantage';
import { PartnershipTiers } from '@/features/marketing/components/sections/schools/PartnershipTiers';
import { GovernanceSection } from '@/features/marketing/components/sections/schools/GovernanceSection';
import { PartnershipBanner } from '@/features/marketing/components/sections/PartnershipBanner';

export default function SchoolsPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <SchoolHero />
      <SchoolAdvantage />
      <PartnershipTiers />
      <GovernanceSection />
      <PartnershipBanner />
    </div>
  );
}
