'use client';

import DashboardLayout from '@/components/DashboardLayout';
import PageHeader from '@/components/PageHeader';
import { Zap } from 'lucide-react';

export default function AutomacaoPage() {
  return (
    <DashboardLayout>
      <div className="flex flex-col h-screen overflow-hidden">
        <PageHeader
          icon={Zap}
          iconColor="from-yellow-600 to-yellow-700"
          title="Automação IA"
          subtitle="Automações inteligentes, análise preditiva e otimizações automáticas"
        />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Zap size={48} className="text-[#2A2F3A] mx-auto mb-4" />
            <p className="text-white font-semibold text-lg">Automação IA</p>
            <p className="text-[#A1A1AA] text-sm mt-2">Em desenvolvimento. Disponível em breve.</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
