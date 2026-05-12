'use client';

import DashboardLayout from '@/components/DashboardLayout';
import PageHeader from '@/components/PageHeader';
import { Settings } from 'lucide-react';

export default function ConfiguracoesPage() {
  return (
    <DashboardLayout>
      <div className="flex flex-col h-screen overflow-hidden">
        <PageHeader
          icon={Settings}
          iconColor="from-zinc-600 to-zinc-700"
          title="Configurações"
          subtitle="Preferências, integrações e configurações do sistema"
        />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Settings size={48} className="text-[#2A2F3A] mx-auto mb-4" />
            <p className="text-white font-semibold text-lg">Configurações</p>
            <p className="text-[#A1A1AA] text-sm mt-2">Em desenvolvimento. Disponível em breve.</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
