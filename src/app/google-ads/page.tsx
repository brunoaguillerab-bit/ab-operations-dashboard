'use client';

import DashboardLayout from '@/components/DashboardLayout';
import GoogleAdsDashboard from '@/components/GoogleAdsDashboard';
import { Search } from 'lucide-react';

export default function GoogleAdsPage() {
  return (
    <DashboardLayout>
      <div className="flex flex-col h-screen overflow-hidden">
        <div className="bg-gradient-to-r from-yellow-900/20 to-yellow-800/10 border-b border-white/10 px-8 py-6">
          <div className="flex items-center gap-3 mb-2">
            <Search size={24} className="text-yellow-500" />
            <h1 className="text-2xl font-bold text-white">Google Ads</h1>
          </div>
          <p className="text-gray-400 text-sm">Search, PMax, Display — campanhas, termos de pesquisa e ROAS</p>
        </div>
        <GoogleAdsDashboard />
      </div>
    </DashboardLayout>
  );
}
