'use client';

import { useMemo } from 'react';
import { BarChart3, TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react';
import { ClienteDemanda } from '@/types/demandasCentral';

interface ABOverviewContentProps {
  demandas: ClienteDemanda[];
}

export default function ABOverviewContent({ demandas }: ABOverviewContentProps) {
  const stats = useMemo(() => {
    const total = demandas.length;
    const abertas = demandas.filter(d => d.status === 'A fazer').length;
    const andamento = demandas.filter(d => d.status === 'Em andamento').length;
    const concluidas = demandas.filter(d => d.status === 'Feito').length;
    const vencidas = demandas.filter(d => {
      const prazo = new Date(d.prazoEntrega);
      return prazo < new Date() && d.status !== 'Feito';
    }).length;

    const totalGasto = demandas.reduce((sum, d) => sum + (d.valorMensalidade || 0), 0);
    const googleGasto = demandas
      .filter(d => (d.midia as string) === 'Google' || d.midia === 'Google Ads' || d.midia === 'Google e Meta')
      .reduce((sum, d) => sum + (d.saldoContaGoogleAds || 0), 0);
    const metaGasto = demandas
      .filter(d => (d.midia as string) === 'Meta' || d.midia === 'Meta Ads' || d.midia === 'Google e Meta')
      .reduce((sum, d) => sum + (d.saldoContaMetaAds || 0), 0);

    return {
      total,
      abertas,
      andamento,
      concluidas,
      vencidas,
      totalGasto,
      googleGasto,
      metaGasto,
      taxaConclusao: total > 0 ? Math.round((concluidas / total) * 100) : 0,
    };
  }, [demandas]);

  const StatCard = ({ icon: Icon, label, value, unit = '', color = 'bg-blue-500/10' }: any) => (
    <div className={`rounded-xl border border-white/10 p-6 ${color} backdrop-blur-sm`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-[#A1A1AA] font-medium">{label}</p>
          <p className="text-3xl font-bold text-white mt-2">
            {typeof value === 'number' && value > 999 ? `${(value / 1000).toFixed(1)}k` : value}
            <span className="text-lg text-[#A1A1AA] ml-1">{unit}</span>
          </p>
        </div>
        <div className="p-3 rounded-lg bg-white/5">
          <Icon size={24} className="text-white" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      {/* KPIs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={BarChart3}
          label="Total de Demandas"
          value={stats.total}
          color="bg-blue-500/10"
        />
        <StatCard
          icon={TrendingUp}
          label="Em Andamento"
          value={stats.andamento}
          color="bg-purple-500/10"
        />
        <StatCard
          icon={CheckCircle2}
          label="Concluídas"
          value={stats.concluidas}
          color="bg-green-500/10"
        />
        <StatCard
          icon={AlertCircle}
          label="Vencidas"
          value={stats.vencidas}
          color="bg-red-500/10"
        />
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <StatCard
          icon={BarChart3}
          label="Taxa de Conclusão"
          value={stats.taxaConclusao}
          unit="%"
          color="bg-emerald-500/10"
        />
        <StatCard
          icon={TrendingUp}
          label="Valor Total de Mensalidades"
          value={stats.totalGasto}
          unit="R$"
          color="bg-amber-500/10"
        />
      </div>

      {/* Canais de Mídia */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Gasto por Canal</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-xl border border-white/10 p-6 bg-blue-500/5 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <h4 className="font-semibold text-white">Google Ads</h4>
            </div>
            <p className="text-2xl font-bold text-white">
              R$ {stats.googleGasto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-sm text-[#A1A1AA] mt-2">
              {((stats.googleGasto / stats.totalGasto) * 100 || 0).toFixed(1)}% do total
            </p>
          </div>

          <div className="rounded-xl border border-white/10 p-6 bg-blue-500/5 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-3 h-3 rounded-full bg-purple-500"></div>
              <h4 className="font-semibold text-white">Meta Ads</h4>
            </div>
            <p className="text-2xl font-bold text-white">
              R$ {stats.metaGasto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-sm text-[#A1A1AA] mt-2">
              {((stats.metaGasto / stats.totalGasto) * 100 || 0).toFixed(1)}% do total
            </p>
          </div>
        </div>
      </div>

      {/* Status Breakdown */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Distribuição por Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-xl border border-white/10 p-4 bg-white/5 backdrop-blur-sm">
            <p className="text-sm text-[#A1A1AA]">A Fazer</p>
            <p className="text-2xl font-bold text-yellow-400 mt-1">{stats.abertas}</p>
          </div>
          <div className="rounded-xl border border-white/10 p-4 bg-white/5 backdrop-blur-sm">
            <p className="text-sm text-[#A1A1AA]">Em Andamento</p>
            <p className="text-2xl font-bold text-blue-400 mt-1">{stats.andamento}</p>
          </div>
          <div className="rounded-xl border border-white/10 p-4 bg-white/5 backdrop-blur-sm">
            <p className="text-sm text-[#A1A1AA]">Concluído</p>
            <p className="text-2xl font-bold text-green-400 mt-1">{stats.concluidas}</p>
          </div>
          <div className="rounded-xl border border-white/10 p-4 bg-white/5 backdrop-blur-sm">
            <p className="text-sm text-[#A1A1AA]">Vencido</p>
            <p className="text-2xl font-bold text-red-400 mt-1">{stats.vencidas}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
