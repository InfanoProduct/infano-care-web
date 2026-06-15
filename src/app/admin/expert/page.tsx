'use client';

import { EnrollmentManager } from '@/features/expert/components/EnrollmentManager';

export default function ExpertDashboardPage() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black tracking-tight mb-2">Expert Sessions Dashboard</h1>
          <p className="text-muted-foreground text-lg font-medium">
            Manage your schedule and student sessions here.
          </p>
        </div>
      </div>

      <EnrollmentManager />
    </div>
  );
}
