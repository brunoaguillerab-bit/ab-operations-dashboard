'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import PageHeader from '@/components/PageHeader';
import ABOverviewContent from '@/components/ABOverviewContent';
import { Grid2x2 } from 'lucide-react';
import { listDemandasCentral } from '@/services/demandasCentralService';
import { ClienteDemanda } from '@/types/demandasCentral';

export default function ABOverviewPage() {
  const [demandas, setDemandas] = useState<ClienteDemanda[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await listDemandasCentral();
        setDemandas(data);
      } catch (error) {
        console.error('Erro ao carregar demandas:', error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <DashboardLayout>
      <div className="flex flex-col h-screen overflow-hidden">
        <PageHeader
          icon={Grid2x2}
          iconColor="from-red-600 to-red-700"
          title="AB Overview"
          subtitle="Performance consolidada de todos os canais e projetos"
        />
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-red-600 border-t-transparent"></div>
          </div>
        ) : (
          <ABOverviewContent demandas={demandas} />
        )}
      </div>
    </DashboardLayout>
  );
}
