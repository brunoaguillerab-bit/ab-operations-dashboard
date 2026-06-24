'use client';

import DashboardLayout from '@/components/DashboardLayout';
import PageHeader from '@/components/PageHeader';
import EmbedFrame from '@/components/EmbedFrame';
import { BrainCircuit } from 'lucide-react';

export default function IACentralPage() {
  return (
    <DashboardLayout>
      <div className="flex flex-col h-screen overflow-hidden">
        <PageHeader
          icon={BrainCircuit}
          iconColor="from-purple-600 to-purple-700"
          title="IA Central"
          subtitle="Central de Inteligência IA — alertas, previsões e diagnósticos em tempo real"
        />
        <EmbedFrame
          baseUrl="/dashboard-static.html"
          hash="ia-central"
          title="IA Central"
        />
      </div>
    </DashboardLayout>
  );
}
