'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function MarketingRedirectInner() {
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

export default function MarketingRedirect() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0F1117] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-red-600 border-t-transparent" />
      </div>
    }>
      <MarketingRedirectInner />
    </Suspense>
  );
}
