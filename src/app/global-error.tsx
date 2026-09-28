'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[Global Error]:', error);
  }, [error]);

  return (
    <html>
      <body className="min-h-screen bg-[#FFFDFB] flex items-center justify-center p-6 font-sans">
        <div className="max-w-md w-full bg-white border border-slate-100 rounded-3xl p-8 shadow-xl text-center">
          <div className="w-16 h-16 rounded-3xl bg-rose-50 text-rose-500 border border-rose-100 flex items-center justify-center mx-auto mb-5 shadow-sm">
            <AlertTriangle size={32} />
          </div>

          <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight mb-2">
            Something went wrong
          </h2>

          <p className="text-sm font-semibold text-slate-500 mb-6 leading-relaxed">
            An unexpected error occurred. Please try reloading the application.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => reset()}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-rose-600 text-white font-bold text-xs shadow-md hover:bg-rose-700 transition-all active:scale-95 cursor-pointer"
            >
              <RotateCcw size={14} /> Reload App
            </button>

            <Link
              href="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all active:scale-95"
            >
              <Home size={14} /> Back to Home
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
