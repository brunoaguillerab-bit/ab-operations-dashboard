'use client';

import { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import PageHeader from '@/components/PageHeader';
import { Bell, AlertCircle, AlertTriangle, CheckCircle, RefreshCw, Zap, HelpCircle } from 'lucide-react';

interface ClienteSaldo {
  cliente:     string;
  account_id: string;
  account_name: string;
  orcamento:   number;
  gasto:       number;
  saldo:       number;
  pct_gasto:   number;
  status:      'CRÍTICO' | 'ATENÇÃO' | 'OK' | 'Sem orçamento';
  plataformas: string;
  eur:         boolean;
  g_spend:     number;
  m_spend:     number;
  media_diaria: number;
  dias_restantes: number | null;
  responsavel: string;
  insight: string;
}

interface APIResponse {
  data:     ClienteSaldo[];
  resumo:   { criticos: number; atencao: number; ok: number; semOrc: number; total: number };
  periodo:  { dateFrom: string; dateTo: string; diasNoMes: number; totalDias: number };
  sheetName?: string;
  updatedAt?: string;
  error?:   string;
}

const FLOW_NAME = '03 Agent - Monitor de Saldo AB';

const STATUS_CONFIG = {
  'CRÍTICO':       { bg: 'bg-red-900/20',    border: 'border-red-600/40',    text: 'text-red-400',    pill: 'bg-red-900/40 border-red-500',      icon: AlertCircle,   bar: 'bg-red-500' },
  'ATENÇÃO':       { bg: 'bg-yellow-900/20', border: 'border-yellow-600/40', text: 'text-yellow-400', pill: 'bg-yellow-900/40 border-yellow-500', icon: AlertTriangle, bar: 'bg-yellow-400' },
  'OK':            { bg: 'bg-green-900/10',  border: 'border-green-600/30',  text: 'text-green-400',  pill: 'bg-green-900/30 border-green-500',   icon: CheckCircle,   bar: 'bg-green-500' },
  'Sem orçamento': { bg: 'bg-[#181C25]',     border: 'border-[#2A2F3A]',     text: 'text-[#6B7280]',  pill: 'bg-[#1E2230] border-[#3A3F4A]',     icon: HelpCircle,    bar: 'bg-[#3A3F4A]' },
} as const;

type FilterType = 'CRÍTICO' | 'ATENÇÃO' | 'OK' | 'Sem orçamento' | null;

export default function AlertasSaldosPage() {
  const [data, setData]         = useState<ClienteSaldo[]>([]);
  const [resumo, setResumo]     = useState<APIResponse['resumo'] | null>(null);
  const [periodo, setPeriodo]   = useState<APIResponse['periodo'] | null>(null);
  const [sheetName, setSheetName] = useState(FLOW_NAME);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);
  const [filter, setFilter]     = useState<FilterType>(null);
  const [search, setSearch]     = useState('');
  const [n8nStatus, setN8nStatus] = useState<'idle' | 'loading' | 'ok' | 'error'>('idle');

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res  = await fetch('/api/alertas-saldos', { cache: 'no-store' });
      const json: APIResponse = await res.json();
      if (json.error) throw new Error(json.error);
      setData(json.data);
      setResumo(json.resumo);
      setPeriodo(json.periodo);
      setSheetName(json.sheetName || FLOW_NAME);
      setUpdatedAt(json.updatedAt ?? null);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  async function triggerN8n() {
    setN8nStatus('loading');
    try {
      const res  = await fetch('/api/n8n-trigger-saldos', { method: 'POST' });
      const json = await res.json();
      if (!res.ok || json.error) setN8nStatus('error');
      else {
        setN8nStatus('ok');
        setTimeout(() => setN8nStatus('idle'), 4000);
        setTimeout(() => fetchData(), 3500);
      }
    } catch { setN8nStatus('error'); }
  }

  const filtered = data.filter(item => {
    const matchFilter = !filter || item.status === filter;
    const matchSearch = item.cliente.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const hora = updatedAt
    ? new Date(updatedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    : null;

  const subtitle = `Fonte: Google Sheets · aba "${sheetName}"${hora ? ` · atualizado às ${hora}` : ''}`;

  const semOrcamento = resumo?.semOrc ?? 0;

  return (
    <DashboardLayout>
      <div className="flex flex-col h-screen overflow-hidden">
        <PageHeader
          icon={Bell}
          iconColor="from-orange-500 to-red-600"
          title={FLOW_NAME}
          subtitle={subtitle}
        />

        <div className="flex-1 p-6 lg:p-10 overflow-y-auto">

          {/* Summary cards */}
          {resumo && !loading && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
              <SummaryCard
                label="CRÍTICO"
                value={resumo.criticos}
                color="text-red-400"
                bg="bg-red-900/20 border-red-600/30"
                icon={<AlertCircle size={18} className="text-red-400" />}
                active={filter === 'CRÍTICO'}
                onClick={() => setFilter(filter === 'CRÍTICO' ? null : 'CRÍTICO')}
              />
              <SummaryCard
                label="ATENÇÃO"
                value={resumo.atencao}
                color="text-yellow-400"
                bg="bg-yellow-900/20 border-yellow-600/30"
                icon={<AlertTriangle size={18} className="text-yellow-400" />}
                active={filter === 'ATENÇÃO'}
                onClick={() => setFilter(filter === 'ATENÇÃO' ? null : 'ATENÇÃO')}
              />
              <SummaryCard
                label="OK"
                value={resumo.ok}
                color="text-green-400"
                bg="bg-green-900/10 border-green-600/20"
                icon={<CheckCircle size={18} className="text-green-400" />}
                active={filter === 'OK'}
                onClick={() => setFilter(filter === 'OK' ? null : 'OK')}
              />
              <SummaryCard
                label="Sem orçamento"
                value={semOrcamento}
                color="text-[#6B7280]"
                bg="bg-[#181C25] border-[#2A2F3A]"
                icon={<HelpCircle size={18} className="text-[#6B7280]" />}
                active={filter === 'Sem orçamento'}
                onClick={() => setFilter(filter === 'Sem orçamento' ? null : 'Sem orçamento')}
              />
            </div>
          )}

          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <input
              type="text"
              placeholder="Buscar cliente..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="px-4 py-2 bg-[#181C25] border border-[#2A2F3A] rounded-lg text-white placeholder-[#6B7280] text-sm focus:outline-none focus:border-[#EF4444] w-52"
            />
            <div className="flex gap-2 sm:ml-auto">
              <button
                onClick={fetchData}
                disabled={loading}
                className="p-2 rounded-lg bg-[#181C25] border border-[#2A2F3A] text-[#A1A1AA] hover:text-white hover:bg-white/5 transition-all disabled:opacity-40"
                title="Atualizar"
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

          {/* Skeleton */}
          {loading && (
            <div className="grid gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="p-5 rounded-xl border border-[#2A2F3A] bg-[#181C25] animate-pulse h-24" />
              ))}
            </div>
          )}

          {/* Client cards */}
          {!loading && filtered.length > 0 && (
            <div className="grid gap-3">
              {filtered.map((item, idx) => {
                const cfg  = STATUS_CONFIG[item.status];
                const Icon = cfg.icon;
                const moeda = item.eur ? '€' : 'R$';

                return (
                  <div key={idx} className={`p-5 rounded-xl border ${cfg.bg} ${cfg.border}`}>
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <Icon size={18} className={`flex-shrink-0 ${cfg.text}`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold text-white">{item.cliente}</h3>
                            <span className={`px-2 py-0.5 text-xs rounded-full border font-bold ${cfg.pill} ${cfg.text}`}>
                              {item.status}
                            </span>
                            <span className="text-xs text-[#6B7280] capitalize">{item.plataformas}</span>
                          </div>
                          {item.account_name && (
                            <p className="text-xs text-[#6B7280] mt-1">{item.account_name}</p>
                          )}
                        </div>
                      </div>

                      {/* Spend / Balance numbers */}
                      <div className="flex gap-4 flex-wrap text-right">
                        {item.orcamento > 0 ? (
                          <>
                            <Stat label="Orçamento" value={`${moeda}${item.orcamento.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} />
                            <Stat label="Gasto"     value={`${moeda}${item.gasto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} />
                            <Stat
                              label="Saldo"
                              value={`${moeda}${item.saldo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                              highlight={item.status === 'CRÍTICO' ? 'red' : item.status === 'ATENÇÃO' ? 'yellow' : 'green'}
                            />
                          </>
                        ) : (
                          <>
                            <Stat label="Gasto mês" value={`${moeda}${item.gasto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} />
                            <Stat label="Orçamento" value="-" dimmed />
                          </>
                        )}
                      </div>
                    </div>

                    {/* Progress bar */}
                    {item.orcamento > 0 && (
                      <div className="mt-4">
                        <div className="flex justify-between text-[10px] text-[#6B7280] mb-1.5">
                          <span>Verba consumida: {item.pct_gasto}%</span>
                          <span>
                            {item.g_spend > 0 && `Google ${moeda}${item.g_spend.toFixed(2)}`}
                            {item.g_spend > 0 && item.m_spend > 0 && ' · '}
                            {item.m_spend > 0 && `Meta ${moeda}${item.m_spend.toFixed(2)}`}
                          </span>
                        </div>
                        <div className="h-1.5 rounded-full bg-black/30 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${cfg.bar}`}
                            style={{ width: `${Math.min(item.pct_gasto, 100)}%` }}
                          />
                        </div>
                      </div>
                    )}
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
                {data.length === 0 ? 'Aguardando o n8n gravar a aba do Google Sheets' : 'Ajuste os filtros'}
              </p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

function SummaryCard({
  label, value, color, bg, icon, active, onClick,
}: {
  label: string; value: number; color: string; bg: string;
  icon: React.ReactNode; active: boolean; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`p-4 rounded-xl border text-left transition-all hover:scale-[1.02] ${bg} ${active ? 'ring-2 ring-white/20' : ''}`}
    >
      <div className="flex items-center justify-between mb-2">
        {icon}
        {active && <div className="w-1.5 h-1.5 rounded-full bg-white/40" />}
      </div>
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
      <div className="text-xs text-[#6B7280] mt-0.5">{label}</div>
    </button>
  );
}

function Stat({
  label, value, highlight, dimmed,
}: {
  label: string; value: string; highlight?: 'red' | 'yellow' | 'green'; dimmed?: boolean;
}) {
  const valColor = highlight === 'red'    ? 'text-red-400'
    : highlight === 'yellow' ? 'text-yellow-400'
    : highlight === 'green'  ? 'text-green-400'
    : dimmed ? 'text-[#6B7280]'
    : 'text-white';

  return (
    <div>
      <div className="text-[10px] text-[#6B7280] uppercase tracking-wider">{label}</div>
      <div className={`text-sm font-semibold mt-0.5 ${valColor}`}>{value}</div>
    </div>
  );
}
