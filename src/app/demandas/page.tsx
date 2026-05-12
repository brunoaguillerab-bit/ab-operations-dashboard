'use client';

import DashboardLayout from '@/components/DashboardLayout';
import PageHeader from '@/components/PageHeader';
import DemandasCentral from '@/components/demandas/DemandasCentral';
import { mockDemandasCentral } from '@/data/mockDemandasCentral';
import { CheckSquare } from 'lucide-react';

export default function DemandasPage() {
  return (
    <DashboardLayout>
      <div className="flex flex-col h-screen overflow-hidden">
        <PageHeader
          icon={CheckSquare}
          iconColor="from-emerald-600 to-emerald-700"
          title="Demandas"
          subtitle="Central de gestao premium para clientes, operacao e entregas"
        />

        <div className="flex-1 overflow-hidden p-6 lg:p-8 flex flex-col min-h-0">
          <DemandasCentral data={mockDemandasCentral} />
        </div>
      </div>
    </DashboardLayout>
  );
}
