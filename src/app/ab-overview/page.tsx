'use client';

import DashboardLayout from '@/components/DashboardLayout';
import PageHeader from '@/components/PageHeader';
import EmbedFrame from '@/components/EmbedFrame';
import { Grid2x2 } from 'lucide-react';

export default function ABOverviewPage() {
  return (
    <DashboardLayout>
      <div className="flex flex-col h-screen overflow-hidden">
        <PageHeader
          icon={Grid2x2}
          iconColor="from-red-600 to-red-700"
          title="AB Overview"
          subtitle="Performance consolidada de todos os canais e projetos"
        />
        <EmbedFrame
          baseUrl="/dashboard-static.html"
          hash="overview"
          title="AB Overview"
        />
      </div>
    </DashboardLayout>
  );
}
