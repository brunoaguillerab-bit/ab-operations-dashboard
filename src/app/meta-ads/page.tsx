'use client';

import DashboardLayout from '@/components/DashboardLayout';
import MetaAdsDashboard from '@/components/MetaAdsDashboard';
import { Facebook } from 'lucide-react';

export default function MetaAdsPage() {
  return (
    <DashboardLayout>
      <div className="flex flex-col h-screen overflow-hidden">
        <div className="bg-gradient-to-r from-blue-900/20 to-blue-800/10 border-b border-white/10 px-8 py-6">
          <div className="flex items-center gap-3 mb-2">
            <Facebook size={24} className="text-blue-500" />
            <h1 className="text-2xl font-bold text-white">Meta Ads</h1>
          </div>
          <p className="text-gray-400 text-sm">Facebook & Instagram — campanhas, leads, criativos e performance</p>
        </div>
        <MetaAdsDashboard />
      </div>
    </DashboardLayout>
  );
}
