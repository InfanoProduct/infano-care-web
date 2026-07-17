'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function WebinarRedirectPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/webinar/webinar-decoding-silence');
  }, [router]);

  return null;
}
