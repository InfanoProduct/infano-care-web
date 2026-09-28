'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[Dashboard Error Boundary]:', error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-3xl bg-rose-50 text-rose-500 border border-rose-100 flex items-center justify-center mb-5 shadow-sm">
        <AlertTriangle size={32} />
      </div>

      <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight mb-2">
        Unable to Load Dashboard
      </h2>

      <p className="text-sm font-semibold text-slate-500 max-w-md mx-auto mb-6 leading-relaxed">
        We encountered an issue while assembling your dashboard workspace. Please try reloading or returning to the home page.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={() => reset()}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-white font-bold text-xs shadow-md hover:bg-primary/95 transition-all active:scale-95 cursor-pointer"
        >
          <RotateCcw size={14} /> Try Again
        </button>

        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all active:scale-95"
        >
          <Home size={14} /> Back to Home
        </Link>
      </div>
    </div>
  );
}
