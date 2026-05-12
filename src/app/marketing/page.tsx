'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

/**
 * Legacy route — redirects old /marketing?tab= links to the new direct routes.
 */
export default function MarketingRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const tab = searchParams.get('tab');
    const map: Record<string, string> = {
      overview: '/ab-overview',
      meta:     '/meta-ads',
      google:   '/google-ads',
    };
    router.replace(map[tab ?? ''] ?? '/ab-overview');
  }, [router, searchParams]);

  return (
    <div className="min-h-screen bg-[#0F1117] flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-2 border-red-600 border-t-transparent" />
    </div>
  );
}
