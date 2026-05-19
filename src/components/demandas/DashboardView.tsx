'use client';

import { useMemo, useState } from 'react';
import {
  BarChart3, Clock, CheckCircle2, AlertCircle,
  Users, Activity, DollarSign, Zap, Target, ArrowUpRight,
  ArrowDownRight, ChevronRight,
} from 'lucide-react';
import { ClienteDemanda } from '@/types/demandasCentral';

// ─── Types ───────────────────────────────────────────────────────────────────

interface DashboardViewProps {
  items: ClienteDemanda[];
  stats: { total: number; pendentes: number; andamento: number; concluidas: number; atraso: number };
  onGoToQuadro?: (statusFilter?: string) => void;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const fmt = (v: number | null | undefined) =>
  v == null ? '—' : `R$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const fmtShort = (v: number) => {
  if (v >= 1000) return `R$ ${(v / 1000).toFixed(1)}k`;
  return `R$ ${v.toFixed(0)}`;
};

function getLast7Days(): Array<{ key: string; label: string; short: string }> {
  const days: Array<{ key: string; label: string; short: string }> = [];
  const labels = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    days.push({ key, label: labels[d.getDay()], short: `${d.getDate()}/${d.getMonth() + 1}` });
  }
  return days;
}

function getLast28Days(): Array<{ key: string; date: Date }> {
  const days: Array<{ key: string; date: Date }> = [];
  for (let i = 27; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    days.push({ key, date: new Date(d) });
  }
  return days;
}

function heatColor(count: number, max: number) {
  if (count === 0) return 'bg-[#1A2235]';
  const ratio = count / Math.max(max, 1);
  if (ratio < 0.25) return 'bg-emerald-500/25';
  if (ratio < 0.5) return 'bg-emerald-500/50';
  if (ratio < 0.75) return 'bg-emerald-500/70';
  return 'bg-emerald-500';
}

// ─── Main Component ──────────────────────────────────────────────────────────

export function DashboardView({ items, stats, onGoToQuadro }: DashboardViewProps) {
  const [chartPeriod, setChartPeriod] = useState<7 | 30>(7);
  const [hoveredHeat, setHoveredHeat] = useState<string | null>(null);
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);

  // ── Financial Totals ──────────────────────────────────────────────────────
  const financials = useMemo(() => {
    let google = 0, meta = 0, googleCount = 0, metaCount = 0, semSaldo = 0;
    items.forEach(r => {
      if (r.saldoContaGoogleAds != null && r.saldoContaGoogleAds > 0) { google += r.saldoContaGoogleAds; googleCount++; }
      if (r.saldoContaMetaAds != null && r.saldoContaMetaAds > 0) { meta += r.saldoContaMetaAds; metaCount++; }
      if ((r.saldoContaGoogleAds == null || r.saldoContaGoogleAds === 0) && (r.saldoContaMetaAds == null || r.saldoContaMetaAds === 0)) semSaldo++;
    });
    return { google, meta, googleCount, metaCount, semSaldo };
  }, [items]);

  // ── Weekly/Monthly Chart ──────────────────────────────────────────────────
  const chartData = useMemo(() => {
    const days = chartPeriod === 7 ? getLast7Days() : (() => {
      const out = [];
      const labels = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
      for (let i = 29; i >= 0; i--) {
        const d = new Date(); d.setDate(d.getDate() - i);
        out.push({ key: d.toISOString().slice(0, 10), label: labels[d.getDay()], short: `${d.getDate()}/${d.getMonth() + 1}` });
      }
      return out;
    })();

    const countMap: Record<string, { total: number; done: number; overdue: number }> = {};
    days.forEach(d => { countMap[d.key] = { total: 0, done: 0, overdue: 0 }; });

    items.forEach(r => {
      if (!r.prazoEntrega) return;
      const key = r.prazoEntrega.slice(0, 10);
      if (!countMap[key]) return;
      countMap[key].total++;
      if (r.status === 'Feito') countMap[key].done++;
      else if (new Date(r.prazoEntrega) < new Date()) countMap[key].overdue++;
    });

    const maxVal = Math.max(1, ...days.map(d => countMap[d.key]?.total || 0));
    return days.map(d => ({ ...d, ...countMap[d.key], maxVal }));
  }, [items, chartPeriod]);

  // ── Team Productivity ─────────────────────────────────────────────────────
  const team = useMemo(() => {
    const map: Record<string, { name: string; total: number; done: number; overdue: number }> = {};
    items.forEach(r => {
      const name = r.responsavel || '(Sem responsável)';
      if (!map[name]) map[name] = { name, total: 0, done: 0, overdue: 0 };
      map[name].total++;
      if (r.status === 'Feito') map[name].done++;
      if (r.prazoEntrega && new Date(r.prazoEntrega) < new Date() && r.status !== 'Feito') map[name].overdue++;
    });
    return Object.values(map).sort((a, b) => b.total - a.total);
  }, [items]);

  // ── Heatmap ───────────────────────────────────────────────────────────────
  const heatmap = useMemo(() => {
    const days28 = getLast28Days();
    const countMap: Record<string, number> = {};
    days28.forEach(d => { countMap[d.key] = 0; });
    items.forEach(r => {
      if (!r.prazoEntrega) return;
      const key = r.prazoEntrega.slice(0, 10);
      if (countMap[key] !== undefined) countMap[key]++;
    });
    const maxCount = Math.max(1, ...Object.values(countMap));
    return days28.map(d => ({ ...d, count: countMap[d.key] || 0, maxCount }));
  }, [items]);

  // ── Status distribution (pie-like) ────────────────────────────────────────
  const statusDist = useMemo(() => {
    const s: Record<string, number> = {
      'A fazer': 0, 'Em andamento': 0, 'Aguardando cliente': 0,
      'Aguardando pagamento': 0, 'Feito': 0, 'Outros': 0,
    };
    items.forEach(r => {
      if (r.status in s) s[r.status]++;
      else s['Outros']++;
    });
    const total = items.length || 1;
    return Object.entries(s)
      .filter(([, v]) => v > 0)
      .map(([label, count]) => ({
        label, count,
        pct: Math.round((count / total) * 100),
        color: ({
          'A fazer': '#3B82F6', 'Em andamento': '#F59E0B',
          'Aguardando cliente': '#8B5CF6', 'Aguardando pagamento': '#EC4899',
          'Feito': '#10B981', 'Outros': '#6B7280',
        } as Record<string, string>)[label] || '#6B7280',
      }))
      .sort((a, b) => b.count - a.count);
  }, [items]);

  const maxBarH = 160; // px

  return (
    <div className="space-y-5 pb-6">

      {/* ── Row 1: Stat Cards ────────────────────────────────────────────── */}
      <div className="grid grid-cols-5 gap-3">
        {[
          { label: 'Total',        value: stats.total,     color: 'text-white',         bg: 'bg-white/5',          border: 'border-white/10',           icon: BarChart3,    filter: undefined },
          { label: 'Pendentes',    value: stats.pendentes, color: 'text-blue-400',      bg: 'bg-blue-500/8',       border: 'border-blue-500/20',        icon: AlertCircle,  filter: 'pendente' },
          { label: 'Em Andamento', value: stats.andamento, color: 'text-amber-400',     bg: 'bg-amber-500/8',      border: 'border-amber-500/20',       icon: Activity,     filter: 'andamento' },
          { label: 'Concluídas',   value: stats.concluidas,color: 'text-emerald-400',   bg: 'bg-emerald-500/8',    border: 'border-emerald-500/20',     icon: CheckCircle2, filter: 'feito' },
          { label: 'Atrasadas',    value: stats.atraso,    color: stats.atraso > 0 ? 'text-red-400' : 'text-[#94A3B8]', bg: stats.atraso > 0 ? 'bg-red-500/8' : 'bg-white/[0.02]', border: stats.atraso > 0 ? 'border-red-500/25' : 'border-white/8', icon: Clock, filter: 'atraso' },
        ].map((card) => (
          <button
            key={card.label}
            onClick={() => onGoToQuadro?.(card.filter)}
            className={`group relative bg-[#111827] border ${card.border} rounded-2xl p-4 text-left transition-all hover:scale-[1.02] hover:border-opacity-50 hover:shadow-lg active:scale-100 ${onGoToQuadro ? 'cursor-pointer' : 'cursor-default'}`}
          >
            <div className="flex items-start justify-between mb-3">
              <span className="text-[11px] font-medium text-[#6B7280] uppercase tracking-wider">{card.label}</span>
              <div className={`p-1.5 rounded-lg ${card.bg}`}>
                <card.icon size={13} className={card.color} />
              </div>
            </div>
            <p className={`text-3xl font-bold leading-none ${card.color}`}>{card.value}</p>
            {onGoToQuadro && (
              <div className="flex items-center gap-1 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-[10px] text-[#6B7280]">Ver tarefas</span>
                <ChevronRight size={10} className="text-[#6B7280]" />
              </div>
            )}
          </button>
        ))}
      </div>

      {/* ── Row 2: Financial Cards ───────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-3">
        <FinancialCard
          title="Saldo Google Ads"
          value={financials.google}
          count={financials.googleCount}
          icon={Target}
          color="#4285F4"
          bg="rgba(66,133,244,0.08)"
          border="rgba(66,133,244,0.2)"
        />
        <FinancialCard
          title="Saldo Meta Ads"
          value={financials.meta}
          count={financials.metaCount}
          icon={Zap}
          color="#0668E1"
          bg="rgba(6,104,225,0.08)"
          border="rgba(6,104,225,0.2)"
        />
        <div className="bg-[#111827] border border-white/8 rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-medium text-[#6B7280] uppercase tracking-wider">Saldo Total</span>
            <div className="p-1.5 rounded-lg bg-emerald-500/10">
              <DollarSign size={13} className="text-emerald-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-emerald-400 leading-none">{fmtShort(financials.google + financials.meta)}</p>
          <p className="text-[11px] text-[#6B7280] mt-2">
            {financials.googleCount + financials.metaCount} contas ativas
            {financials.semSaldo > 0 && ` · ${financials.semSaldo} sem saldo`}
          </p>
        </div>
      </div>

      {/* ── Row 3: Chart + Team ──────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-4">

        {/* Performance Chart */}
        <div className="col-span-2 bg-[#111827] border border-white/8 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-[#F3F4F6] font-semibold text-[15px]">Performance por Prazo</h3>
              <p className="text-[#6B7280] text-[11px] mt-0.5">Tarefas com prazo x concluídas no período</p>
            </div>
            <div className="flex gap-1 p-1 bg-[#0B1120] rounded-lg border border-white/5">
              {([7, 30] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setChartPeriod(p)}
                  className={`px-3 py-1 rounded text-[11px] font-medium transition-all ${chartPeriod === p ? 'bg-[#1E293B] text-white' : 'text-[#6B7280] hover:text-white'}`}
                >
                  {p}d
                </button>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="flex gap-4 mb-4">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm bg-[#3B82F6]/60"></div>
              <span className="text-[10px] text-[#6B7280]">Com prazo</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm bg-emerald-500"></div>
              <span className="text-[10px] text-[#6B7280]">Concluídas</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm bg-red-500/60"></div>
              <span className="text-[10px] text-[#6B7280]">Atrasadas</span>
            </div>
          </div>

          {/* Bars */}
          <div
            className="flex items-end gap-1.5"
            style={{ height: `${maxBarH + 24}px` }}
          >
            {chartData.map((d, i) => {
              const totalH = Math.max(2, (d.total / d.maxVal) * maxBarH);
              const doneH = d.total > 0 ? (d.done / d.total) * totalH : 0;
              const overdueH = d.total > 0 ? (d.overdue / d.total) * totalH : 0;
              const isHovered = hoveredBar === i;

              return (
                <div
                  key={d.key}
                  className="relative flex-1 flex flex-col items-center gap-0"
                  onMouseEnter={() => setHoveredBar(i)}
                  onMouseLeave={() => setHoveredBar(null)}
                >
                  {/* Tooltip */}
                  {isHovered && d.total > 0 && (
                    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 z-20 bg-[#0D1525] border border-white/10 rounded-lg px-2.5 py-2 text-[10px] text-white shadow-xl pointer-events-none whitespace-nowrap">
                      <p className="font-semibold mb-1">{d.short} ({d.label})</p>
                      <p className="text-[#94A3B8]">Com prazo: <span className="text-white">{d.total}</span></p>
                      <p className="text-emerald-400">Concluídas: {d.done}</p>
                      {d.overdue > 0 && <p className="text-red-400">Atrasadas: {d.overdue}</p>}
                    </div>
                  )}

                  {/* Bar stack */}
                  <div
                    className="w-full relative rounded-t-sm overflow-hidden cursor-pointer"
                    style={{ height: `${totalH}px` }}
                  >
                    <div className="absolute inset-0 bg-[#3B82F6]/30"></div>
                    <div className="absolute bottom-0 left-0 right-0 bg-emerald-500/90 transition-all" style={{ height: `${doneH}px` }}></div>
                    <div className="absolute bottom-0 left-0 right-0 bg-red-500/60 transition-all" style={{ height: `${overdueH}px` }}></div>
                  </div>

                  {/* Label */}
                  <span className={`text-[9px] mt-1.5 text-center leading-none transition-colors ${isHovered ? 'text-white' : 'text-[#4B5563]'}`}>
                    {chartPeriod === 7 ? d.label : d.short}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Team Productivity */}
        <div className="bg-[#111827] border border-white/8 rounded-2xl p-5 flex flex-col">
          <h3 className="text-[#F3F4F6] font-semibold text-[15px] mb-1 flex items-center gap-2">
            <Users size={16} className="text-[#8B5CF6]" /> Equipe
          </h3>
          <p className="text-[#6B7280] text-[11px] mb-4">Produtividade por responsável</p>

          <div className="flex-1 space-y-3 overflow-y-auto pr-1">
            {team.length === 0 && (
              <p className="text-sm text-[#94A3B8] text-center py-4">Sem dados de equipe.</p>
            )}
            {team.map((u) => {
              const donePct = u.total > 0 ? Math.round((u.done / u.total) * 100) : 0;
              const initials = u.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
              const gradients = [
                'from-[#3B82F6] to-[#8B5CF6]',
                'from-[#10B981] to-[#3B82F6]',
                'from-[#F59E0B] to-[#EF4444]',
                'from-[#EC4899] to-[#8B5CF6]',
                'from-[#14B8A6] to-[#3B82F6]',
              ];
              const grad = gradients[team.indexOf(u) % gradients.length];

              return (
                <div key={u.name} className="flex items-center gap-3 group">
                  <div className={`w-8 h-8 rounded-full bg-gradient-to-tr ${grad} flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0`}>
                    {initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[12px] font-medium text-[#E2E8F0] truncate">{u.name}</span>
                      <span className="text-[10px] text-[#6B7280] ml-2 flex-shrink-0">
                        {u.done}/{u.total}
                        {u.overdue > 0 && <span className="text-red-400 ml-1">+{u.overdue}⚠</span>}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-[#0B1120] rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r ${grad} transition-all duration-700`}
                        style={{ width: `${donePct}%` }}
                      ></div>
                    </div>
                  </div>
                  <span className="text-[10px] text-[#6B7280] w-7 text-right flex-shrink-0">{donePct}%</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Row 4: Heatmap + Status Distribution ─────────────────────────── */}
      <div className="grid grid-cols-5 gap-4">

        {/* Heatmap */}
        <div className="col-span-3 bg-[#111827] border border-white/8 rounded-2xl p-5">
          <h3 className="text-[#F3F4F6] font-semibold text-[15px] mb-1 flex items-center gap-2">
            <Activity size={16} className="text-[#EC4899]" /> Heatmap de Atividade
          </h3>
          <p className="text-[#6B7280] text-[11px] mb-4">Intensidade de prazos — últimos 28 dias</p>

          <div className="grid gap-1" style={{ gridTemplateColumns: 'repeat(7, 1fr)' }}>
            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(d => (
              <div key={d} className="text-[9px] text-[#4B5563] text-center pb-1">{d}</div>
            ))}
            {heatmap.map((day) => (
              <div
                key={day.key}
                className={`aspect-square rounded-md cursor-pointer transition-all hover:ring-1 hover:ring-white/20 relative ${heatColor(day.count, day.maxCount)}`}
                onMouseEnter={() => setHoveredHeat(day.key)}
                onMouseLeave={() => setHoveredHeat(null)}
              >
                {hoveredHeat === day.key && (
                  <div className="absolute z-20 bottom-full mb-1.5 left-1/2 -translate-x-1/2 bg-[#0D1525] border border-white/10 rounded-lg px-2.5 py-1.5 text-[10px] text-white shadow-xl pointer-events-none whitespace-nowrap">
                    <p className="font-semibold">{day.date.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' })}</p>
                    <p className="text-[#94A3B8]">{day.count} tarefa{day.count !== 1 ? 's' : ''} com prazo</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center mt-3">
            <span className="text-[10px] text-[#4B5563]">Menos</span>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-sm bg-[#1A2235]"></div>
              <div className="w-3 h-3 rounded-sm bg-emerald-500/25"></div>
              <div className="w-3 h-3 rounded-sm bg-emerald-500/50"></div>
              <div className="w-3 h-3 rounded-sm bg-emerald-500/70"></div>
              <div className="w-3 h-3 rounded-sm bg-emerald-500"></div>
            </div>
            <span className="text-[10px] text-[#4B5563]">Mais</span>
          </div>
        </div>

        {/* Status Distribution */}
        <div className="col-span-2 bg-[#111827] border border-white/8 rounded-2xl p-5">
          <h3 className="text-[#F3F4F6] font-semibold text-[15px] mb-1 flex items-center gap-2">
            <BarChart3 size={16} className="text-[#3B82F6]" /> Distribuição de Status
          </h3>
          <p className="text-[#6B7280] text-[11px] mb-4">{items.length} tarefas no período selecionado</p>

          <div className="space-y-2.5">
            {statusDist.map((s) => (
              <div key={s.label}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[11px] font-medium text-[#D1D5DB]">{s.label}</span>
                  <span className="text-[11px] text-[#6B7280]">{s.count} · {s.pct}%</span>
                </div>
                <div className="w-full h-2 bg-[#0B1120] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${s.pct}%`, background: s.color }}
                  ></div>
                </div>
              </div>
            ))}
            {statusDist.length === 0 && (
              <p className="text-sm text-[#94A3B8] text-center py-4">Sem dados.</p>
            )}
          </div>

          {/* Quick KPIs */}
          {items.length > 0 && (
            <div className="mt-5 pt-4 border-t border-white/5 grid grid-cols-2 gap-3">
              <div>
                <p className="text-[10px] text-[#6B7280] uppercase tracking-wider mb-1">Taxa Conclusão</p>
                <p className="text-xl font-bold text-emerald-400">
                  {Math.round((stats.concluidas / items.length) * 100)}%
                </p>
              </div>
              <div>
                <p className="text-[10px] text-[#6B7280] uppercase tracking-wider mb-1">Em Risco</p>
                <p className={`text-xl font-bold ${stats.atraso > 0 ? 'text-red-400' : 'text-[#94A3B8]'}`}>
                  {stats.atraso > 0 ? stats.atraso : '0'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Financial Card ───────────────────────────────────────────────────────────

function FinancialCard({
  title, value, count, icon: Icon, color, bg, border,
}: {
  title: string;
  value: number;
  count: number;
  icon: React.ElementType;
  color: string;
  bg: string;
  border: string;
}) {
  const isLow = value > 0 && value < 500;
  return (
    <div
      className="bg-[#111827] rounded-2xl p-4 flex flex-col justify-between"
      style={{ border: `1px solid ${border}` }}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] font-medium text-[#6B7280] uppercase tracking-wider">{title}</span>
        <div className="p-1.5 rounded-lg" style={{ background: bg }}>
          <Icon size={13} style={{ color }} />
        </div>
      </div>
      <div className="flex items-end gap-2">
        <p className="text-2xl font-bold leading-none" style={{ color: isLow ? '#EF4444' : color }}>
          {value === 0 ? <span className="text-[#6B7280]">—</span> : fmtShort(value)}
        </p>
        {isLow && (
          <span className="text-[10px] text-red-400 flex items-center gap-0.5 mb-0.5">
            <ArrowDownRight size={10} /> Baixo
          </span>
        )}
        {value > 500 && (
          <span className="text-[10px] text-emerald-400 flex items-center gap-0.5 mb-0.5">
            <ArrowUpRight size={10} /> OK
          </span>
        )}
      </div>
      <p className="text-[11px] text-[#6B7280] mt-2">{count} conta{count !== 1 ? 's' : ''} · {fmt(value > 0 ? value / Math.max(count, 1) : null)}/conta</p>
    </div>
  );
}
