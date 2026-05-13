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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        console.log('Carregando demandas AB Overview...');
        const data = await listDemandasCentral();
        console.log('Demandas carregadas:', data);
        setDemandas(data || []);
        setError(null);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        console.error('Erro ao carregar demandas:', errorMsg);
        setError(errorMsg);
        setDemandas([]);
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
        ) : error ? (
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="text-center">
              <p className="text-red-400 font-semibold mb-2">Erro ao carregar dados</p>
              <p className="text-[#A1A1AA] text-sm">{error}</p>
            </div>
          </div>
        ) : (
          <ABOverviewContent demandas={demandas} />
        )}
      </div>
    </DashboardLayout>
  );
}
