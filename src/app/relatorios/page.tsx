'use client';

import DashboardLayout from '@/components/DashboardLayout';
import PageHeader from '@/components/PageHeader';
import { FileText } from 'lucide-react';

export default function RelatoriosPage() {
  return (
    <DashboardLayout>
      <div className="flex flex-col h-screen overflow-hidden">
        <PageHeader
          icon={FileText}
          iconColor="from-violet-600 to-violet-700"
          title="Relatórios"
          subtitle="Geração e histórico de relatórios de performance"
        />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <FileText size={48} className="text-[#2A2F3A] mx-auto mb-4" />
            <p className="text-white font-semibold text-lg">Relatórios</p>
            <p className="text-[#A1A1AA] text-sm mt-2">Em desenvolvimento. Disponível em breve.</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
