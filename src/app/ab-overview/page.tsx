'use client';

import DashboardLayout from '@/components/DashboardLayout';
import OverviewDashboard from '@/components/OverviewDashboard';
import { Grid2x2 } from 'lucide-react';

export default function ABOverviewPage() {
  return (
    <DashboardLayout>
      <div className="flex flex-col h-screen overflow-hidden">
        <div className="bg-gradient-to-r from-red-900/20 to-red-800/10 border-b border-white/10 px-8 py-6">
          <div className="flex items-center gap-3 mb-2">
            <Grid2x2 size={24} className="text-red-500" />
            <h1 className="text-2xl font-bold text-white">AB Overview</h1>
          </div>
          <p className="text-gray-400 text-sm">Performance consolidada de todos os canais e projetos</p>
        </div>
        <OverviewDashboard />
      </div>
    </DashboardLayout>
  );
}
