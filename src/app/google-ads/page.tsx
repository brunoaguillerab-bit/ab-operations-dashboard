'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import PageHeader from '@/components/PageHeader';
import GoogleAdsContent from '@/components/GoogleAdsContent';
import { listDemandasCentral } from '@/services/demandasCentralService';
import { ClienteDemanda } from '@/types/demandasCentral';

const GoogleLogo = ({ size = 22, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#FFFFFF"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#FFFFFF"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FFFFFF"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#FFFFFF"/>
  </svg>
);

export default function GoogleAdsPage() {
  const [demandas, setDemandas] = useState<ClienteDemanda[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        console.log('Carregando demandas Google Ads...');
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
          icon={GoogleLogo}
          iconColor="from-[#16A34A] to-[#15803D]"
          title="Google Ads"
          subtitle="Search, PMax, Display — campanhas, termos de pesquisa e ROAS"
        />
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-green-600 border-t-transparent"></div>
          </div>
        ) : error ? (
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="text-center">
              <p className="text-red-400 font-semibold mb-2">Erro ao carregar dados</p>
              <p className="text-[#A1A1AA] text-sm">{error}</p>
            </div>
          </div>
        ) : (
          <GoogleAdsContent demandas={demandas} />
        )}
      </div>
    </DashboardLayout>
  );
}
