'use client';

import { ParentsHero } from '@/features/marketing/components/sections/parents/ParentsHero';
import { ParentsResponse } from '@/features/marketing/components/sections/parents/ParentsResponse';
import { DaughterExperience } from '@/features/marketing/components/sections/parents/DaughterExperience';
import { ParentDashboard } from '@/features/marketing/components/sections/parents/ParentDashboard';
import { AccessOptions } from '@/features/marketing/components/sections/parents/AccessOptions';
import { ParentsFAQ } from '@/features/marketing/components/sections/parents/ParentsFAQ';

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
