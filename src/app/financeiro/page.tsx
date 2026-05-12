'use client';

import DashboardLayout from '@/components/DashboardLayout';
import PageHeader from '@/components/PageHeader';
import { DollarSign } from 'lucide-react';

export default function FinanceiroPage() {
  return (
    <DashboardLayout>
      <div className="flex flex-col h-screen overflow-hidden">
        <PageHeader
          icon={DollarSign}
          iconColor="from-emerald-600 to-emerald-700"
          title="Financeiro"
          subtitle="Receitas, custos e gestão financeira da agência"
        />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <DollarSign size={48} className="text-[#2A2F3A] mx-auto mb-4" />
            <p className="text-white font-semibold text-lg">Financeiro</p>
            <p className="text-[#A1A1AA] text-sm mt-2">Em desenvolvimento. Disponível em breve.</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
