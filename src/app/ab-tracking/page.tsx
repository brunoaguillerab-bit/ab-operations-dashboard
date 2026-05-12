'use client';

import { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import PageHeader from '@/components/PageHeader';
import { TrendingUp, AlertCircle, CheckCircle, AlertTriangle, RefreshCw, Zap } from 'lucide-react';

interface ClienteData {
  cliente: string;
  status: 'Crítico' | 'Atenção' | 'Bom';
  g_spend: number;
  g_conversions: number;
  g_cpa: number;
  m_spend: number;
  m_freq: number;
  m_results: number;
  delta_conv:  number | null;
  delta_cpa:   number | null;
  delta_freq:  number | null;
  delta_spend: number | null;
  plataformas: string;
  eur: boolean;
  insight: string;
  tags: string[];
}

interface APIResponse {
  data: ClienteData[];
  periodo: {
    atual:    { from: string; to: string };
    anterior: { from: string; to: string };
    dateFrom: string;
    dateTo:   string;
  };
  updatedAt?: string;
  error?: string;
}

const STATUS_CONFIG = {
  'Crítico': { bg: 'bg-red-900/20',    border: 'border-red-600/40',    text: 'text-red-400',    pill: 'bg-red-900/30 border-red-500',    icon: AlertCircle },
  'Atenção': { bg: 'bg-yellow-900/20', border: 'border-yellow-600/40', text: 'text-yellow-400', pill: 'bg-yellow-900/30 border-yellow-500', icon: AlertTriangle },
  'Bom':     { bg: 'bg-green-900/20',  border: 'border-green-600/40',  text: 'text-green-400',  pill: 'bg-green-900/30 border-green-500',  icon: CheckCircle },
} as const;

const FILTER_STYLES = {
  'Crítico':   { active: 'bg-red-900/30 border-red-500 text-red-400',         base: 'border-[#2A2F3A] text-[#A1A1AA]' },
  'Atenção':   { active: 'bg-yellow-900/30 border-yellow-500 text-yellow-400', base: 'border-[#2A2F3A] text-[#A1A1AA]' },
  'Destaques': { active: 'bg-purple-900/30 border-purple-500 text-purple-400', base: 'border-[#2A2F3A] text-[#A1A1AA]' },
};

export default function ABTrackingPage() {
  const [data, setData]             = useState<ClienteData[]>([]);
  const [periodo, setPeriodo]       = useState<APIResponse['periodo'] | null>(null);
  const [updatedAt, setUpdatedAt]   = useState<string | null>(null);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<keyof typeof FILTER_STYLES | null>(null);
  const [searchValue, setSearchValue] = useState('');
  const [n8nStatus, setN8nStatus] = useState<'idle' | 'loading' | 'ok' | 'error'>('idle');

  async function triggerN8n() {
    setN8nStatus('loading');
    try {
      const res  = await fetch('/api/n8n-trigger', { method: 'POST' });
      const json = await res.json();
      if (!res.ok || json.error) { setN8nStatus('error'); }
      else { setN8nStatus('ok'); setTimeout(() => setN8nStatus('idle'), 4000); }
    } catch { setN8nStatus('error'); }
  }

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/windsor');
      const json: APIResponse = await res.json();
      if (json.error) throw new Error(json.error);
      setData(json.data);
      setPeriodo(json.periodo);
      setUpdatedAt(json.updatedAt ?? null);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filtered = data.filter(item => {
    const matchStatus = !selectedFilter ||
      (selectedFilter === 'Destaques' ? item.status === 'Bom' : item.status === selectedFilter);
    const matchSearch = item.cliente.toLowerCase().includes(searchValue.toLowerCase());
    return matchStatus && matchSearch;
  });

  const counts = {
    Crítico:   data.filter(d => d.status === 'Crítico').length,
    Atenção:   data.filter(d => d.status === 'Atenção').length,
    Destaques: data.filter(d => d.status === 'Bom').length,
  };

  const horaAtualizado = updatedAt
    ? new Date(updatedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    : null;

  const subtitle = periodo
    ? `Atual: ${periodo.atual.from} → ${periodo.atual.to}  ·  Ant: ${periodo.anterior.from} → ${periodo.anterior.to}${horaAtualizado ? `  ·  atualizado às ${horaAtualizado}` : ''}`
    : 'Comparativo 7 dias vs 7 dias anteriores';

  return (
    <DashboardLayout>
      <div className="flex flex-col h-screen overflow-hidden">
        <PageHeader
          icon={TrendingUp}
          iconColor="from-amber-500 to-orange-600"
          title="Análise Diária de Desempenho"
          subtitle={subtitle}
        />

        <div className="flex-1 p-6 lg:p-10 overflow-y-auto">
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="flex flex-wrap gap-2">
              {(Object.keys(FILTER_STYLES) as (keyof typeof FILTER_STYLES)[]).map(f => {
                const isActive = selectedFilter === f;
                const style = FILTER_STYLES[f];
                return (
                  <button
                    key={f}
                    onClick={() => setSelectedFilter(isActive ? null : f)}
                    className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                      isActive ? style.active : `${style.base} hover:bg-white/5 hover:text-white`
                    }`}
                  >
                    {f} <span className="ml-1 opacity-70">({counts[f as keyof typeof counts]})</span>
                  </button>
                );
              })}
            </div>
            <div className="flex gap-2 sm:ml-auto">
              <input
                type="text"
                placeholder="Buscar cliente..."
                value={searchValue}
                onChange={e => setSearchValue(e.target.value)}
                className="px-4 py-2 bg-[#181C25] border border-[#2A2F3A] rounded-lg text-white placeholder-[#6B7280] text-sm focus:outline-none focus:border-[#EF4444] w-52"
              />
              <button
                onClick={fetchData}
                disabled={loading}
                className="p-2 rounded-lg bg-[#181C25] border border-[#2A2F3A] text-[#A1A1AA] hover:text-white hover:bg-white/5 transition-all disabled:opacity-40"
                title="Atualizar Windsor"
              >
                <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              </button>
              <button
                onClick={triggerN8n}
                disabled={n8nStatus === 'loading'}
                title="Disparar workflow n8n"
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-medium transition-all ${
                  n8nStatus === 'loading' ? 'bg-orange-900/20 border-orange-600/30 text-orange-400 cursor-not-allowed' :
                  n8nStatus === 'ok'      ? 'bg-green-900/20 border-green-600/30 text-green-400' :
                  n8nStatus === 'error'   ? 'bg-red-900/20 border-red-600/30 text-red-400' :
                  'bg-[#181C25] border-[#2A2F3A] text-[#A1A1AA] hover:text-orange-400 hover:border-orange-600/40'
                }`}
              >
                <Zap size={13} className={n8nStatus === 'loading' ? 'animate-pulse' : ''} />
                {n8nStatus === 'loading' ? 'Rodando…' : n8nStatus === 'ok' ? 'Disparado!' : n8nStatus === 'error' ? 'Erro n8n' : 'Rodar n8n'}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 p-4 bg-red-900/20 border border-red-600/40 rounded-lg text-red-400 text-sm">
              Erro ao buscar dados: {error}
            </div>
          )}

          {/* Skeleton loading */}
          {loading && !error && (
            <div className="grid gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="p-5 rounded-xl border border-[#2A2F3A] bg-[#181C25] animate-pulse">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-4 h-4 rounded-full bg-[#2A2F3A]" />
                    <div className="h-4 w-36 bg-[#2A2F3A] rounded" />
                    <div className="h-5 w-14 bg-[#2A2F3A] rounded-full" />
                  </div>
                  <div className="h-3 w-2/3 bg-[#2A2F3A] rounded mb-4" />
                  <div className="flex gap-3">
                    {Array.from({ length: 4 }).map((_, j) => (
                      <div key={j} className="bg-black/20 px-3 py-2 rounded-lg w-20 h-12" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Cards */}
          {!loading && filtered.length > 0 && (
            <div className="grid gap-3">
              {filtered.map((item, idx) => {
                const cfg = STATUS_CONFIG[item.status];
                const Icon = cfg.icon;
                const moeda = item.eur ? '€' : 'R$';

                return (
                  <div key={idx} className={`p-5 rounded-xl border ${cfg.bg} ${cfg.border}`}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <Icon size={18} className={`mt-0.5 flex-shrink-0 ${cfg.text}`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold text-white">{item.cliente}</h3>
                            <span className={`px-2 py-0.5 text-xs rounded-full border ${cfg.pill} ${cfg.text}`}>
                              {item.status}
                            </span>
                            {item.tags.map((tag, i) => (
                              <span key={i} className="px-2 py-0.5 text-xs rounded-full bg-purple-900/20 border border-purple-600/40 text-purple-400">
                                {tag}
                              </span>
                            ))}
                          </div>
                          <p className="text-sm text-[#A1A1AA] mt-1.5">{item.insight}</p>
                        </div>
                      </div>
                      <div className="text-xs text-[#6B7280] flex-shrink-0 capitalize">{item.plataformas}</div>
                    </div>

                    {/* Metrics */}
                    <div className="flex flex-wrap gap-3 mt-4">
                      {item.plataformas !== 'meta' && item.g_spend > 0 && (
                        <>
                          <Metric label="G Spend"    value={`${moeda}${item.g_spend.toFixed(2)}`} />
                          <Metric label="Conversões" value={String(item.g_conversions)}
                            delta={item.delta_conv} higherIsBetter />
                          <Metric label="CPA"        value={item.g_cpa > 0 ? `${moeda}${item.g_cpa.toFixed(2)}` : '—'}
                            delta={item.delta_cpa} higherIsBetter={false} />
                        </>
                      )}
                      {item.plataformas !== 'google' && item.m_spend > 0 && (
                        <>
                          <Metric label="M Spend"   value={`${moeda}${item.m_spend.toFixed(2)}`} />
                          <Metric label="Frequency" value={item.m_freq > 0 ? item.m_freq.toFixed(2) : '—'}
                            highlight={item.m_freq > 3.5}
                            delta={item.delta_freq} higherIsBetter={false} />
                          <Metric label="Results"   value={String(item.m_results)} />
                        </>
                      )}
                      {item.g_spend === 0 && item.m_spend === 0 && (
                        <span className="text-xs text-[#6B7280]">Sem dados no período</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Empty */}
          {!loading && !error && filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20">
              <p className="text-[#A1A1AA] text-lg font-medium">Nenhum cliente encontrado</p>
              <p className="text-[#6B7280] text-sm mt-1">
                {data.length === 0 ? 'Verifique a WINDSOR_API_KEY no .env.local' : 'Ajuste os filtros'}
              </p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

function Metric({
  label, value, highlight, delta, higherIsBetter,
}: {
  label: string;
  value: string;
  highlight?: boolean;
  delta?: number | null;
  higherIsBetter?: boolean;
}) {
  const showDelta = delta !== null && delta !== undefined && Math.abs(delta) >= 5;
  const isGood = showDelta ? (higherIsBetter ? delta! > 0 : delta! < 0) : false;

  return (
    <div className="bg-black/20 px-3 py-2 rounded-lg min-w-[80px]">
      <div className="text-[10px] text-[#6B7280] uppercase tracking-wider">{label}</div>
      <div className={`text-sm font-semibold mt-0.5 ${highlight ? 'text-orange-400' : 'text-white'}`}>
        {value}
      </div>
      {showDelta && (
        <div className={`text-[10px] mt-0.5 font-medium ${isGood ? 'text-green-400' : 'text-red-400'}`}>
          {delta! > 0 ? '↑' : '↓'}{Math.abs(delta!)}% vs ant.
        </div>
      )}
    </div>
  );
}
