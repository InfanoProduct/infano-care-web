"use client";

import { useState, useEffect } from 'react';
import { ExpertSessionBooking } from "@/features/parent/components/ExpertSessionBooking";
import { useAuthStore } from '@/store/auth-store';


export default function ExpertSessionsPage() {
  const { user } = useAuthStore();
  const [initialTab, setInitialTab] = useState<'browse' | 'sessions' | 'demos'>('browse');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab');
      if (tabParam === 'demos') {
        setInitialTab('demos');
      } else {
        setInitialTab(user?.role === 'TEEN' ? 'sessions' : 'browse');
      }
    }
  }, [user]);

  return (
    <div className="space-y-6 w-full max-w-[1280px] mx-auto pb-8 font-sans">
      <div className="admin-header">
        <h1 className="text-xl font-bold tracking-tight">Expert Sessions</h1>
        <p className="text-xs text-slate-505 mt-1">
          Browse verified experts and book 1:1 sessions for your daughter.
        </p>
      </div>

      <ExpertSessionBooking key={initialTab} initialTab={initialTab} />
    </div>
  );
}

