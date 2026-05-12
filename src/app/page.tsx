'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.push('/dashboard');
  }, [router]);

  return (
    <div className="min-h-screen bg-[#0F1117] flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center mx-auto mb-4">
          <span className="text-white font-bold text-2xl">AB</span>
        </div>
        <h1 className="text-2xl font-bold text-white">AB Tracking</h1>
        <p className="text-[#A1A1AA] mt-2">Carregando dashboard...</p>
        <div className="mt-8 flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-red-600 border-t-transparent"></div>
        </div>
      </div>
    </div>
  );
}
