'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import PageHeader from '@/components/PageHeader';
import MetaAdsContent from '@/components/MetaAdsContent';
import { ClienteDemanda } from '@/types/demandasCentral';
import { listDemandasCentral } from '@/services/demandasCentralService';

const MetaLogo = ({ size = 22, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 36 36" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M30.68 15.35c-3.15-2.45-6.84-2.86-9.5-1.07-1.55 1.04-2.9 2.92-3.8 4.41-.83-1.48-2.09-3.26-3.51-4.32-2.64-1.97-6.55-1.74-9.84.66-4.59 3.33-5.22 10.1-.81 13.9 3.14 2.68 6.91 3.1 9.61 1.35 1.57-1.01 2.9-2.85 3.73-4.33.82 1.48 2.07 3.25 3.5 4.33 2.65 1.99 6.55 1.76 9.87-.66 4.54-3.32 5.15-10.13.75-14.27zm-1.89 10.97c-2.15 1.58-4.66 1.45-6.24.27-.85-.63-1.66-1.74-2.58-3.41 1.02-1.78 2-3.19 2.98-3.88 1.58-1.12 3.94-1 6.07.56 2.88 2.11 2.45 5.09-.23 6.46zm-17.78-.17c-1.63 1.05-3.93.93-5.94-.52-2.9-2.11-2.45-6.31.25-8.29 2.13-1.57 4.63-1.42 6.2.29.84.62 1.63 1.7 2.52 3.32-1 1.71-1.97 3.09-2.92 3.82z" fill="#FFFFFF"/>
  </svg>
);

export default function MetaAdsPage() {
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
          icon={MetaLogo}
          iconColor="from-[#2563EB] to-[#1D4ED8]"
          title="Meta Ads"
          subtitle="Facebook & Instagram — campanhas, leads, criativos e performance"
        />
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <p className="text-[#A1A1AA]">Carregando...</p>
            </div>
          </div>
        ) : (
          <MetaAdsContent demandas={demandas} />
        )}
      </div>
    </DashboardLayout>
  );
}
