'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShopService } from '@/services/shop.service';
import { Loader2, AlertCircle } from 'lucide-react';

export default function WebinarRedirectPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    ShopService.getWebinarBySlug('active')
      .then((webinar) => {
        if (webinar && webinar.slug) {
          router.replace(`/webinar/${webinar.slug}`);
        } else {
          setError('No active webinar found at this moment.');
        }
      })
      .catch((err) => {
        if (err.message === 'Webinar not found') {
          console.warn('No active webinar found in database.');
        } else {
          console.error(err);
        }
        setError('Failed to load webinar details. Please try again later.');
      });
  }, [router]);

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FFFCFA] p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-rose-50 flex items-center justify-center text-rose-500 mb-4">
          <AlertCircle size={28} />
        </div>
        <h3 className="text-xl font-bold text-slate-900 font-heading">Webinar Not Found</h3>
        <p className="mt-2 text-sm text-slate-500 max-w-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#FFFCFA]">
      <Loader2 className="w-10 h-10 animate-spin text-primary" />
      <p className="mt-4 text-xs font-extrabold text-slate-500 uppercase tracking-widest text-center">
        Redirecting to active webinar...
      </p>
    </div>
  );
}

