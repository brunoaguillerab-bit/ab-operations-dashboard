'use client';

import { useState, useEffect } from 'react';
import { Facebook, RefreshCw, AlertTriangle } from 'lucide-react';

interface MetaMetrics {
  spend: number;
  leads: number;
  cpl: number;
  purchases: number;
  cpc: number;
  impressions: number;
  clicks: number;
  ctr: number;
}

interface MetaCampaign {
  campaign: string;
  spend: number;
  leads: number;
  cpl: number;
  clicks: number;
  impressions: number;
}

export default function MetaAdsDashboard() {
  const [metrics, setMetrics] = useState<MetaMetrics>({
    spend: 0,
    leads: 0,
    cpl: 0,
    purchases: 0,
    cpc: 0,
    impressions: 0,
    clicks: 0,
    ctr: 0,
  });
  const [campaigns, setCampaigns] = useState<MetaCampaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState('last_30d');

  useEffect(() => {
    loadData();
  }, [dateRange]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const dateParams = getDateParams(dateRange);

      const response = await fetch(
        `/api/windsor?date_from=${dateParams.from}&date_to=${dateParams.to}`
      );

      if (!response.ok) throw new Error('Erro ao carregar dados');

      const rawData = await response.json();
      const processed = processMetaData(rawData);
      setMetrics(processed.metrics);
      setCampaigns(processed.campaigns);
    } catch (error) {
      console.error('Erro ao carregar Meta Ads data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const processMetaData = (rawData: any[]) => {
    const metaData = rawData.filter((row) =>
      ['facebook', 'instagram', 'meta'].some((source) =>
        (row.datasource || '').toLowerCase().includes(source)
      )
    );

    let totals = {
      spend: 0,
      leads: 0,
      clicks: 0,
      impressions: 0,
      conversions: 0,
      value: 0,
    };

    const campaignMap: Record<string, MetaCampaign> = {};

    metaData.forEach((row: any) => {
      const campaign = row.campaign || row.ad_name || 'Campanha sem nome';

      totals.spend += parseFloat(row.spend || 0);
      totals.leads += parseInt(row.actions_lead || 0);
      totals.clicks += parseInt(row.clicks || 0);
      totals.impressions += parseInt(row.impressions || 0);
      totals.conversions += parseInt(row.conversions || 0);
      totals.value += parseFloat(row.conversions_value || 0);

      if (!campaignMap[campaign]) {
        campaignMap[campaign] = {
          campaign,
          spend: 0,
          leads: 0,
          cpl: 0,
          clicks: 0,
          impressions: 0,
        };
      }

      campaignMap[campaign].spend += parseFloat(row.spend || 0);
      campaignMap[campaign].leads += parseInt(row.actions_lead || 0);
      campaignMap[campaign].clicks += parseInt(row.clicks || 0);
      campaignMap[campaign].impressions += parseInt(row.impressions || 0);
    });

    const processedCampaigns = Object.values(campaignMap).map((camp) => ({
      ...camp,
      cpl: camp.leads > 0 ? camp.spend / camp.leads : 0,
    }));

    return {
      metrics: {
        spend: totals.spend,
        leads: totals.leads,
        cpl: totals.leads > 0 ? totals.spend / totals.leads : 0,
        purchases: totals.conversions,
        cpc: totals.clicks > 0 ? totals.spend / totals.clicks : 0,
        impressions: totals.impressions,
        clicks: totals.clicks,
        ctr: totals.impressions > 0 ? (totals.clicks / totals.impressions) * 100 : 0,
      },
      campaigns: processedCampaigns,
    };
  };

  const getDateParams = (range: string) => {
    const today = new Date();
    const from = new Date(today);

    switch (range) {
      case 'today':
        from.setHours(0, 0, 0, 0);
        break;
      case 'last_7d':
        from.setDate(from.getDate() - 7);
        break;
      case 'last_30d':
        from.setDate(from.getDate() - 30);
        break;
      default:
        from.setDate(from.getDate() - 30);
    }

    return {
      from: from.toISOString().split('T')[0],
      to: today.toISOString().split('T')[0],
    };
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <Facebook size={28} className="text-blue-500" />
          Meta Ads
        </h1>
        <div className="flex gap-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="bg-white/5 border border-white/10 text-white px-4 py-2 rounded-lg text-sm hover:border-white/20 transition"
          >
            <option value="today">Hoje</option>
            <option value="last_7d">Últimos 7 dias</option>
            <option value="last_30d">Últimos 30 dias</option>
          </select>
          <button
            onClick={loadData}
            disabled={isLoading}
            className="bg-red-500/10 border border-red-500/30 text-red-400 hover:text-red-300 p-2 rounded-lg transition disabled:opacity-50"
          >
            <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          label="Investimento"
          value={`R$ ${metrics.spend.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}`}
          color="bg-blue-500/5"
        />
        <KPICard
          label="Leads"
          value={metrics.leads.toLocaleString('pt-BR')}
          color="bg-green-500/5"
        />
        <KPICard
          label="CPL"
          value={`R$ ${metrics.cpl.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}`}
          color="bg-orange-500/5"
        />
        <KPICard
          label="Compras"
          value={metrics.purchases.toLocaleString('pt-BR')}
          color="bg-red-500/5"
        />
      </div>

      {/* Campanhas */}
      <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden backdrop-blur-sm">
        <div className="p-6 border-b border-white/5">
          <h3 className="text-lg font-bold text-white">Campanhas Meta Ads</h3>
        </div>

        {isLoading ? (
          <div className="p-8 text-center">
            <p className="text-gray-400">Carregando dados...</p>
          </div>
        ) : campaigns.length === 0 ? (
          <div className="p-8 text-center text-gray-400 flex flex-col items-center gap-2">
            <AlertTriangle size={32} />
            <p>Nenhuma campanha Meta Ads encontrada</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5 text-gray-400 text-xs font-semibold uppercase">
                  <th className="px-6 py-4 text-left">Campanha</th>
                  <th className="px-6 py-4 text-center">Investimento</th>
                  <th className="px-6 py-4 text-center">Cliques</th>
                  <th className="px-6 py-4 text-center">Impressões</th>
                  <th className="px-6 py-4 text-center">Leads</th>
                  <th className="px-6 py-4 text-center">CPL</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {campaigns.slice(0, 10).map((camp, idx) => (
                  <tr key={idx} className="hover:bg-white/5 transition">
                    <td className="px-6 py-4 text-white font-medium">{camp.campaign}</td>
                    <td className="px-6 py-4 text-right text-white">
                      R$ {camp.spend.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 text-right text-white">
                      {camp.clicks.toLocaleString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 text-right text-white">
                      {camp.impressions.toLocaleString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 text-right text-white">
                      {camp.leads.toLocaleString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 text-right text-white">
                      R$ {camp.cpl.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function KPICard({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className={`${color} border border-white/10 rounded-xl p-4 backdrop-blur-sm hover:border-white/20 transition`}>
      <p className="text-gray-400 text-xs font-medium">{label}</p>
      <p className="text-2xl font-bold text-white mt-2">{value}</p>
    </div>
  );
}
