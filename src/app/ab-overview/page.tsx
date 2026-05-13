'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import PageHeader from '@/components/PageHeader';
import ABOverviewContent from '@/components/ABOverviewContent';
import { ClienteDemanda } from '@/types/demandasCentral';
import { listDemandasCentral } from '@/services/demandasCentralService';
import { Grid2x2 } from 'lucide-react';

export default function ABOverviewPage() {
  const [demandas, setDemandas] = useState<ClienteDemanda[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDemandas = async () => {
      try {
        setIsLoading(true);
        const data = await listDemandasCentral();
        setDemandas(data);
      } catch (error) {
        console.error('Erro ao carregar demandas:', error);
        setDemandas([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadDemandas();
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
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <p className="text-[#A1A1AA]">Carregando...</p>
            </div>
          </div>
        ) : (
          <ABOverviewContent demandas={demandas} />
        )}
      </div>
    </DashboardLayout>
  );
}
