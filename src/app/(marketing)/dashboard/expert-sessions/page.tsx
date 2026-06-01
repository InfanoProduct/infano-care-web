"use client";

import { ExpertSessionBooking } from "@/features/parent/components/ExpertSessionBooking";
import { useAuthStore } from '@/store/auth-store';

export default function ExpertSessionsPage() {
  const { user } = useAuthStore();
  const initialTab = user?.role === 'TEEN' ? 'sessions' : 'browse';

  return (
    <div className="space-y-8">
      <div className="admin-header">
        <h1 className="text-3xl font-bold tracking-tight">Expert Sessions</h1>
        <p className="text-muted-foreground mt-1">
          Browse verified experts and book 1:1 sessions for your daughter.
        </p>
      </div>

      <ExpertSessionBooking initialTab={initialTab} />
    </div>
  );
}
