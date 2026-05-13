'use client';

import { useState, useEffect, useMemo } from 'react';
import { TrendingUp, RefreshCw, AlertTriangle, BarChart2 } from 'lucide-react';

interface PerformanceData {
  name: string;
  datasource: string;
  spend: number;
  clicks: number;
  conversions: number;
  cpa: number;
  roas: number;
}

export default function OverviewDashboard() {
  const [data, setData] = useState<PerformanceData[]>([]);
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
      const processed = processWindsorData(rawData);
      setData(processed);
    } catch (error) {
      console.error('Erro ao carregar Windsor data:', error);
      setData([]);
    } finally {
      setIsLoading(false);
    }
  };

  const processWindsorData = (rawData: any[]): PerformanceData[] => {
    const grouped: Record<string, any> = {};

    rawData.forEach((row: any) => {
      const key = `${row.account_name || 'Direto'}-${row.datasource || 'Outros'}`;

      if (!grouped[key]) {
        grouped[key] = {
          name: row.account_name || 'Sem campanha',
          datasource: row.datasource || 'Outros',
          spend: 0,
          clicks: 0,
          conversions: 0,
          value: 0,
        };
      }

      grouped[key].spend += parseFloat(row.spend || 0);
      grouped[key].clicks += parseInt(row.clicks || 0);
      grouped[key].conversions += parseInt(row.conversions || 0);
      grouped[key].value += parseFloat(row.conversions_value || 0);
    });

    return Object.values(grouped).map((item) => ({
      ...item,
      cpa: item.conversions > 0 ? item.spend / item.conversions : 0,
      roas: item.spend > 0 ? item.value / item.spend : 0,
    }));
  };

  const stats = useMemo(() => {
    const totalSpend = data.reduce((sum, row) => sum + row.spend, 0);
    const totalClicks = data.reduce((sum, row) => sum + row.clicks, 0);
    const totalConv = data.reduce((sum, row) => sum + row.conversions, 0);
    const avgCPA = totalConv > 0 ? totalSpend / totalConv : 0;

    return { totalSpend, totalClicks, totalConv, avgCPA };
  }, [data]);

  const getDateParams = (range: string) => {
    const today = new Date();
    const from = new Date(today);
    const to = new Date(today);

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
      to: to.toISOString().split('T')[0],
    };
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      {/* Header com controles */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <BarChart2 size={28} className="text-amber-500" />
          AB Overview
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
            title="Atualizar dados"
          >
            <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          label="Investimento Total"
          value={`R$ ${stats.totalSpend.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}`}
          icon={<TrendingUp size={20} className="text-blue-400" />}
          color="bg-blue-500/5"
        />
        <KPICard
          label="Cliques"
          value={stats.totalClicks.toLocaleString('pt-BR')}
          icon={<TrendingUp size={20} className="text-purple-400" />}
          color="bg-purple-500/5"
        />
        <KPICard
          label="Conversões"
          value={stats.totalConv.toLocaleString('pt-BR')}
          icon={<TrendingUp size={20} className="text-green-400" />}
          color="bg-green-500/5"
        />
        <KPICard
          label="CPA Médio"
          value={`R$ ${stats.avgCPA.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}`}
          icon={<TrendingUp size={20} className="text-orange-400" />}
          color="bg-orange-500/5"
        />
      </div>

      {/* Tabela de Performance */}
      <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden backdrop-blur-sm">
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <BarChart2 size={20} className="text-red-500" />
            Performance por Projeto
          </h3>
          {isLoading && <div className="animate-spin"><RefreshCw size={18} className="text-gray-400" /></div>}
        </div>

        {isLoading ? (
          <div className="p-8 text-center">
            <p className="text-gray-400">Carregando dados...</p>
          </div>
        ) : data.length === 0 ? (
          <div className="p-8 text-center text-gray-400 flex flex-col items-center gap-2">
            <AlertTriangle size={32} />
            <p>Nenhum dado disponível para o período selecionado</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5 text-gray-400 text-xs font-semibold uppercase">
                  <th className="px-6 py-4 text-left">Projeto</th>
                  <th className="px-6 py-4 text-left">Canal</th>
                  <th className="px-6 py-4 text-center">Investimento</th>
                  <th className="px-6 py-4 text-center">Cliques</th>
                  <th className="px-6 py-4 text-center">Conversões</th>
                  <th className="px-6 py-4 text-center">CPA</th>
                  <th className="px-6 py-4 text-center">ROAS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {data.map((row, idx) => (
                  <tr key={idx} className="hover:bg-white/5 transition">
                    <td className="px-6 py-4 text-white font-medium">{row.name}</td>
                    <td className="px-6 py-4 text-gray-400 text-xs">
                      <span className="bg-white/10 px-2 py-1 rounded">{row.datasource}</span>
                    </td>
                    <td className="px-6 py-4 text-right text-white">
                      R$ {row.spend.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 text-right text-white">
                      {row.clicks.toLocaleString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 text-right text-white">
                      {row.conversions.toLocaleString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 text-right text-white">
                      R$ {row.cpa.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 text-right text-white font-semibold">
                      {row.roas.toFixed(2)}x
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
  icon,
  color,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <div className={`${color} border border-white/10 rounded-xl p-4 backdrop-blur-sm hover:border-white/20 transition`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-400 text-xs font-medium">{label}</p>
          <p className="text-2xl font-bold text-white mt-2">{value}</p>
        </div>
        <div className="p-2 bg-white/5 rounded-lg">{icon}</div>
      </div>
    </div>
  );
}
