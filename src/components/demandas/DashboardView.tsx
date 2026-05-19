'use client';

import { useMemo, useState } from 'react';
import {
  BarChart3, Clock, CheckCircle2, AlertCircle,
  Users, Activity, DollarSign, Zap, Target,
  ArrowUpRight, ArrowDownRight, ChevronRight,
  TrendingUp, CalendarClock, ShieldCheck,
} from 'lucide-react';
import { ClienteDemanda } from '@/types/demandasCentral';

// ─── Types ────────────────────────────────────────────────────────────────────

interface DashboardViewProps {
  items: ClienteDemanda[];
  stats: { total: number; pendentes: number; andamento: number; concluidas: number; atraso: number };
  onGoToQuadro?: (statusFilter?: string) => void;
}

type Period = 7 | 30 | 90;

// ─── Helpers ─────────────────────────────────────────────────────────────────

const fmtShort = (v: number) => {
  if (v >= 1_000_000) return `R$ ${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000)     return `R$ ${(v / 1_000).toFixed(1)}k`;
  return `R$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
};

const fmtFull = (v: number | null | undefined) =>
  v == null ? '—' : `R$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;

function getDays(n: number): Array<{ key: string; label: string; short: string }> {
  const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  return Array.from({ length: n }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (n - 1 - i));
    return {
      key:   d.toISOString().slice(0, 10),
      label: dayNames[d.getDay()],
      short: `${d.getDate()}/${d.getMonth() + 1}`,
    };
  });
}

function heatColor(count: number, max: number) {
  if (count === 0) return '#1A2235';
  const r = count / Math.max(max, 1);
  if (r < 0.25) return 'rgba(16,185,129,0.25)';
  if (r < 0.5)  return 'rgba(16,185,129,0.5)';
  if (r < 0.75) return 'rgba(16,185,129,0.7)';
  return '#10B981';
}

function daysFromNow(dateStr: string) {
  const diff = new Date(dateStr).getTime() - Date.now();
  return Math.ceil(diff / 86_400_000);
}

// ─── KPI Stat Card ────────────────────────────────────────────────────────────

function KPICard({
  label, value, color, bg, border, Icon, onClick,
}: {
  label: string; value: number; color: string; bg: string; border: string;
  Icon: React.ElementType; onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="group relative bg-[#0E1520] rounded-2xl p-4 text-left transition-all hover:scale-[1.02] active:scale-100"
      style={{ border: `1px solid ${border}` }}
    >
      <div className="flex items-start justify-between mb-3">
        <span className="text-[10px] font-semibold text-[#6B7280] uppercase tracking-wider leading-none">{label}</span>
        <div className="p-1.5 rounded-lg" style={{ background: bg }}>
          <Icon size={13} style={{ color }} />
        </div>
      </div>
      <p className="text-[32px] font-black leading-none" style={{ color }}>{value}</p>
      {onClick && (
        <div className="flex items-center gap-1 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="text-[10px] text-[#4B5563]">Ver tarefas</span>
          <ChevronRight size={10} className="text-[#4B5563]" />
        </div>
      )}
    </button>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export function DashboardView({ items, stats, onGoToQuadro }: DashboardViewProps) {
  const [period, setPeriod]         = useState<Period>(7);
  const [respFilter, setRespFilter] = useState('');
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);
  const [hoveredHeat, setHoveredHeat] = useState<string | null>(null);

  // ── Responsaveis list ────────────────────────────────────────────────────
  const responsaveis = useMemo(
    () => Array.from(new Set(items.map(r => r.responsavel).filter(Boolean))).sort(),
    [items],
  );

  // ── Period-filtered items ────────────────────────────────────────────────
  const periodItems = useMemo(() => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - period);
    return items.filter(r => {
      if (respFilter && r.responsavel !== respFilter) return false;
      if (!r.prazoEntrega) return true; // no deadline → always include
      return new Date(r.prazoEntrega) >= cutoff;
    });
  }, [items, period, respFilter]);

  // ── Chart data ───────────────────────────────────────────────────────────
  const chartDays = useMemo(() => getDays(period > 30 ? 30 : period), [period]);
  const chartData = useMemo(() => {
    const map: Record<string, { total: number; done: number; overdue: number }> = {};
    chartDays.forEach(d => { map[d.key] = { total: 0, done: 0, overdue: 0 }; });
    periodItems.forEach(r => {
      if (!r.prazoEntrega) return;
      const key = r.prazoEntrega.slice(0, 10);
      if (!map[key]) return;
      map[key].total++;
      if (r.status === 'Feito') map[key].done++;
      else if (new Date(r.prazoEntrega) < new Date()) map[key].overdue++;
    });
    const maxVal = Math.max(1, ...chartDays.map(d => map[d.key]?.total || 0));
    return chartDays.map(d => ({ ...d, ...map[d.key], maxVal }));
  }, [chartDays, periodItems]);

  // ── SLA ──────────────────────────────────────────────────────────────────
  const sla = useMemo(() => {
    const withDeadline = periodItems.filter(r => r.prazoEntrega);
    if (!withDeadline.length) return { pct: 0, delta: 0, onTime: 0, total: 0 };
    const onTime = withDeadline.filter(r => {
      if (r.status === 'Feito') return true;           // completed = on time
      return new Date(r.prazoEntrega) >= new Date();   // still within deadline
    }).length;
    const pct = Math.round((onTime / withDeadline.length) * 100);
    return { pct, delta: pct >= 80 ? pct - 80 : pct - 80, onTime, total: withDeadline.length };
  }, [periodItems]);

  // ── Avg days ─────────────────────────────────────────────────────────────
  const avgDays = useMemo(() => {
    const active = periodItems.filter(r => r.prazoEntrega && r.status !== 'Feito');
    if (!active.length) return null;
    const diffs = active.map(r => Math.abs(daysFromNow(r.prazoEntrega)));
    return +(diffs.reduce((a, b) => a + b, 0) / diffs.length).toFixed(1);
  }, [periodItems]);

  // ── Team ────────────────────────────────────────────────────────────────
  const team = useMemo(() => {
    const map: Record<string, { name: string; total: number; done: number; overdue: number }> = {};
    periodItems.forEach(r => {
      const name = r.responsavel || '(Sem responsável)';
      if (!map[name]) map[name] = { name, total: 0, done: 0, overdue: 0 };
      map[name].total++;
      if (r.status === 'Feito') map[name].done++;
      if (r.prazoEntrega && new Date(r.prazoEntrega) < new Date() && r.status !== 'Feito') map[name].overdue++;
    });
    return Object.values(map).sort((a, b) => b.done - a.done);
  }, [periodItems]);

  // ── Heatmap (last 28 days) ───────────────────────────────────────────────
  const heatmap = useMemo(() => {
    const days28 = getDays(28);
    const map: Record<string, number> = {};
    days28.forEach(d => { map[d.key] = 0; });
    items.forEach(r => {
      if (!r.prazoEntrega) return;
      const key = r.prazoEntrega.slice(0, 10);
      if (map[key] !== undefined) map[key]++;
    });
    const maxCount = Math.max(1, ...Object.values(map));
    return days28.map(d => ({ ...d, count: map[d.key] || 0, maxCount }));
  }, [items]);

  // ── Financial ────────────────────────────────────────────────────────────
  const fin = useMemo(() => {
    let google = 0, meta = 0, gCount = 0, mCount = 0;
    items.forEach(r => {
      if (r.saldoContaGoogleAds && r.saldoContaGoogleAds > 0) { google += r.saldoContaGoogleAds; gCount++; }
      if (r.saldoContaMetaAds   && r.saldoContaMetaAds   > 0) { meta   += r.saldoContaMetaAds;   mCount++; }
    });
    return { google, meta, gCount, mCount };
  }, [items]);

  // ── Upcoming Deadlines ──────────────────────────────────────────────────
  const upcoming = useMemo(() => {
    const today = new Date();
    return [...items]
      .filter(r => r.prazoEntrega && r.status !== 'Feito' && new Date(r.prazoEntrega) >= today)
      .sort((a, b) => new Date(a.prazoEntrega).getTime() - new Date(b.prazoEntrega).getTime())
      .slice(0, 5);
  }, [items]);

  const GRADIENTS = [
    'from-[#3B82F6] to-[#8B5CF6]', 'from-[#10B981] to-[#3B82F6]',
    'from-[#F59E0B] to-[#EF4444]', 'from-[#EC4899] to-[#8B5CF6]',
    'from-[#14B8A6] to-[#3B82F6]',
  ];

  const BAR_H = 140;

  return (
    <div className="space-y-4 pb-6">

      {/* ── Filter Bar ───────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2 p-3 bg-[#0E1520] border border-white/6 rounded-xl">
        <span className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider mr-1">Período</span>
        {([7, 30, 90] as Period[]).map(p => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${
              period === p
                ? 'bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/30'
                : 'text-[#6B7280] border border-white/6 hover:text-white hover:border-white/15'
            }`}
          >
            {p === 7 ? 'Últ. 7 dias' : p === 30 ? 'Últ. 30 dias' : 'Últ. 90 dias'}
          </button>
        ))}

        {responsaveis.length > 0 && (
          <>
            <div className="w-px h-4 bg-white/10 mx-1" />
            <span className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider">Responsável</span>
            <select
              value={respFilter}
              onChange={e => setRespFilter(e.target.value)}
              className="bg-[#0B1120] border border-white/8 rounded-lg px-2.5 py-1.5 text-[11px] text-[#D1D5DB] focus:outline-none focus:border-white/20"
            >
              <option value="">Todos</option>
              {responsaveis.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </>
        )}

        {(respFilter) && (
          <button
            onClick={() => setRespFilter('')}
            className="ml-auto text-[10px] text-[#6B7280] hover:text-white transition-colors border border-white/8 rounded-lg px-2.5 py-1.5"
          >
            Limpar filtros
          </button>
        )}
      </div>

      {/* ── Row 1: KPI Cards ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-5 gap-3">
        <KPICard label="Total"        value={stats.total}      color="#F3F4F6"  bg="rgba(243,244,246,0.06)" border="rgba(255,255,255,0.08)" Icon={BarChart3}    onClick={() => onGoToQuadro?.()} />
        <KPICard label="Pendentes"    value={stats.pendentes}  color="#60A5FA"  bg="rgba(96,165,250,0.1)"   border="rgba(96,165,250,0.2)"  Icon={AlertCircle}  onClick={() => onGoToQuadro?.('pendente')} />
        <KPICard label="Em Andamento" value={stats.andamento}  color="#34D399"  bg="rgba(52,211,153,0.1)"   border="rgba(52,211,153,0.2)"  Icon={Activity}     onClick={() => onGoToQuadro?.('andamento')} />
        <KPICard label="Concluídas"   value={stats.concluidas} color="#4ADE80"  bg="rgba(74,222,128,0.1)"   border="rgba(74,222,128,0.2)"  Icon={CheckCircle2} onClick={() => onGoToQuadro?.('feito')} />
        <KPICard
          label="Atrasadas"
          value={stats.atraso}
          color={stats.atraso > 0 ? '#F87171' : '#6B7280'}
          bg={stats.atraso > 0 ? 'rgba(248,113,113,0.12)' : 'rgba(255,255,255,0.04)'}
          border={stats.atraso > 0 ? 'rgba(248,113,113,0.3)' : 'rgba(255,255,255,0.07)'}
          Icon={Clock}
          onClick={() => onGoToQuadro?.('atraso')}
        />
      </div>

      {/* ── Row 2: Chart 60% + Team 40% ─────────────────────────────────── */}
      <div className="grid gap-4" style={{ gridTemplateColumns: '3fr 2fr' }}>

        {/* Performance Chart */}
        <div className="bg-[#0E1520] border border-white/7 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-[#F3F4F6] font-semibold text-sm">Performance Semanal</h3>
              <p className="text-[#4B5563] text-[11px] mt-0.5">Prazos × Concluídas por dia</p>
            </div>
            <div className="flex items-center gap-4 text-[10px] text-[#6B7280]">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-[#3B82F6]/50 inline-block"></span>Previsto</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 inline-block"></span>Concluído</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-red-500/60 inline-block"></span>Atrasado</span>
            </div>
          </div>

          <div className="flex items-end gap-1.5" style={{ height: `${BAR_H + 24}px` }}>
            {chartData.map((d, i) => {
              const totalH  = Math.max(2, (d.total / d.maxVal) * BAR_H);
              const doneH   = d.total > 0 ? (d.done    / d.total) * totalH : 0;
              const overdH  = d.total > 0 ? (d.overdue / d.total) * totalH : 0;
              const hover   = hoveredBar === i;

              return (
                <div
                  key={d.key}
                  className="relative flex-1 flex flex-col items-center"
                  onMouseEnter={() => setHoveredBar(i)}
                  onMouseLeave={() => setHoveredBar(null)}
                >
                  {hover && d.total > 0 && (
                    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 z-20 bg-[#0D1525] border border-white/10 rounded-lg px-2.5 py-2 text-[10px] text-white shadow-xl pointer-events-none whitespace-nowrap">
                      <p className="font-bold mb-1">{d.short} · {d.label}</p>
                      <p className="text-[#94A3B8]">Total: <span className="text-white">{d.total}</span></p>
                      <p className="text-emerald-400">Feitas: {d.done}</p>
                      {d.overdue > 0 && <p className="text-red-400">Atrasadas: {d.overdue}</p>}
                    </div>
                  )}
                  <div
                    className="w-full relative rounded-t overflow-hidden cursor-pointer transition-opacity"
                    style={{ height: `${totalH}px`, opacity: hover ? 1 : 0.85 }}
                  >
                    <div className="absolute inset-0 bg-[#3B82F6]/30" />
                    <div className="absolute bottom-0 left-0 right-0 bg-emerald-500" style={{ height: `${doneH}px` }} />
                    <div className="absolute bottom-0 left-0 right-0 bg-red-500/60" style={{ height: `${overdH}px` }} />
                  </div>
                  <span className={`text-[9px] mt-1.5 leading-none transition-colors ${hover ? 'text-white' : 'text-[#374151]'}`}>
                    {period <= 7 ? d.label : d.short}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Summary strip */}
          <div className="flex gap-4 mt-4 pt-4 border-t border-white/5 text-[11px] text-[#6B7280]">
            <span>Total no período: <strong className="text-white">{periodItems.length}</strong></span>
            <span>Concluídas: <strong className="text-emerald-400">{stats.concluidas}</strong></span>
            {stats.atraso > 0 && <span>Atrasadas: <strong className="text-red-400">{stats.atraso}</strong></span>}
          </div>
        </div>

        {/* Team Productivity */}
        <div className="bg-[#0E1520] border border-white/7 rounded-2xl p-5 flex flex-col">
          <div className="flex items-center gap-2 mb-1">
            <Users size={15} className="text-[#8B5CF6]" />
            <h3 className="text-[#F3F4F6] font-semibold text-sm">Produtividade da Equipe</h3>
          </div>
          <p className="text-[#4B5563] text-[11px] mb-4">Feitas / Total atribuídas</p>

          <div className="flex-1 overflow-y-auto space-y-3 pr-0.5">
            {team.length === 0 && (
              <p className="text-sm text-[#4B5563] text-center py-6">Sem responsáveis atribuídos.</p>
            )}
            {team.map((u, idx) => {
              const donePct = u.total > 0 ? Math.round((u.done / u.total) * 100) : 0;
              const initials = u.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
              const grad = GRADIENTS[idx % GRADIENTS.length];
              return (
                <div key={u.name} className="group flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full bg-gradient-to-tr ${grad} flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0`}>
                    {initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[12px] font-medium text-[#D1D5DB] truncate">{u.name}</span>
                      <span className="text-[10px] text-[#4B5563] flex-shrink-0 ml-2">
                        {u.done}/{u.total}
                        {u.overdue > 0 && <span className="text-red-400 ml-1">·{u.overdue}⚠</span>}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-[#0B1120] rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r ${grad} transition-all duration-700`}
                        style={{ width: `${donePct}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold w-8 text-right flex-shrink-0 text-[#6B7280]">
                    {donePct}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Row 3: SLA 30% + Tempo Médio 30% + Heatmap 40% ─────────────── */}
      <div className="grid gap-4" style={{ gridTemplateColumns: '3fr 3fr 4fr' }}>

        {/* SLA */}
        <div className="bg-[#0E1520] border border-white/7 rounded-2xl p-5 flex flex-col">
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck size={15} className="text-emerald-400" />
            <h4 className="text-[#F3F4F6] font-semibold text-sm">SLA de Entrega</h4>
          </div>
          <p className="text-[11px] text-[#4B5563] mb-4">% tarefas dentro do prazo</p>
          <div className="mt-auto">
            <div className="flex items-end gap-2 mb-3">
              <span className="text-[42px] font-black leading-none text-white">{sla.pct}</span>
              <span className="text-xl text-white mb-1.5">%</span>
              <span className={`text-[11px] mb-2 flex items-center gap-0.5 ${sla.pct >= 80 ? 'text-emerald-400' : 'text-red-400'}`}>
                {sla.pct >= 80 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                {sla.pct >= 80 ? 'Saudável' : 'Risco'}
              </span>
            </div>
            <div className="w-full h-2 bg-[#0B1120] rounded-full overflow-hidden mb-2">
              <div
                className={`h-full rounded-full transition-all duration-1000 ${sla.pct >= 80 ? 'bg-emerald-500' : sla.pct >= 60 ? 'bg-amber-500' : 'bg-red-500'}`}
                style={{ width: `${sla.pct}%` }}
              />
            </div>
            <p className="text-[10px] text-[#4B5563]">{sla.onTime} de {sla.total} tarefas no prazo</p>
          </div>
        </div>

        {/* Tempo Médio */}
        <div className="bg-[#0E1520] border border-white/7 rounded-2xl p-5 flex flex-col">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp size={15} className="text-blue-400" />
            <h4 className="text-[#F3F4F6] font-semibold text-sm">Tempo Médio</h4>
          </div>
          <p className="text-[11px] text-[#4B5563] mb-4">Dias restantes (tarefas ativas)</p>
          <div className="mt-auto">
            <div className="flex items-end gap-2 mb-3">
              <span className="text-[42px] font-black leading-none text-white">{avgDays ?? '—'}</span>
              {avgDays != null && <span className="text-base text-[#94A3B8] mb-1.5">dias</span>}
            </div>
            <div className="w-full h-2 bg-[#0B1120] rounded-full overflow-hidden mb-2">
              <div
                className={`h-full rounded-full transition-all duration-1000 ${
                  avgDays == null ? 'bg-[#1A2235]' :
                  avgDays <= 3 ? 'bg-red-500' :
                  avgDays <= 7 ? 'bg-amber-500' : 'bg-blue-500'
                }`}
                style={{ width: avgDays == null ? '0%' : `${Math.min(100, (avgDays / 30) * 100)}%` }}
              />
            </div>
            <p className="text-[10px] text-[#4B5563]">
              {avgDays == null ? 'Sem tarefas ativas com prazo'
               : avgDays <= 3 ? '⚠ Prazos críticos esta semana'
               : avgDays <= 7 ? 'Atenção: prazos próximos'
               : 'Prazos em dia'}
            </p>
          </div>
        </div>

        {/* Heatmap */}
        <div className="bg-[#0E1520] border border-white/7 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-1">
            <Activity size={15} className="text-[#EC4899]" />
            <h3 className="text-[#F3F4F6] font-semibold text-sm">Heatmap de Atividade</h3>
          </div>
          <p className="text-[#4B5563] text-[11px] mb-3">Prazos por dia — últimos 28 dias</p>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 mb-1">
            {['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'].map(d => (
              <div key={d} className="text-[8.5px] text-[#374151] text-center">{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {heatmap.map((day) => (
              <div
                key={day.key}
                className="relative aspect-square rounded cursor-pointer hover:ring-1 hover:ring-white/20 transition-all"
                style={{ background: heatColor(day.count, day.maxCount) }}
                onMouseEnter={() => setHoveredHeat(day.key)}
                onMouseLeave={() => setHoveredHeat(null)}
              >
                {hoveredHeat === day.key && (
                  <div className="absolute bottom-full mb-1.5 left-1/2 -translate-x-1/2 z-20 bg-[#0D1525] border border-white/10 rounded-lg px-2 py-1.5 text-[10px] text-white shadow-xl pointer-events-none whitespace-nowrap">
                    <p className="font-semibold">{new Date(day.key + 'T12:00:00').toLocaleDateString('pt-BR', { weekday:'short', day:'2-digit', month:'short' })}</p>
                    <p className="text-[#94A3B8]">{day.count} tarefa{day.count !== 1 ? 's' : ''}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between mt-3 text-[9.5px] text-[#4B5563]">
            <span>Menos</span>
            <div className="flex gap-1">
              {['#1A2235','rgba(16,185,129,0.25)','rgba(16,185,129,0.5)','rgba(16,185,129,0.7)','#10B981'].map((c, i) => (
                <div key={i} className="w-3 h-3 rounded-sm" style={{ background: c }} />
              ))}
            </div>
            <span>Mais</span>
          </div>
        </div>
      </div>

      {/* ── Row 4: Saldos 50% + Próximos Prazos 50% ─────────────────────── */}
      <div className="grid grid-cols-2 gap-4">

        {/* Saldos */}
        <div className="bg-[#0E1520] border border-white/7 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <DollarSign size={15} className="text-emerald-400" />
            <h3 className="text-[#F3F4F6] font-semibold text-sm">Saldos de Campanhas</h3>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            {/* Google */}
            <div className="bg-[#0B1120] border border-white/6 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded flex items-center justify-center" style={{ background:'rgba(66,133,244,0.15)' }}>
                  <Target size={12} style={{ color:'#4285F4' }} />
                </div>
                <span className="text-[10px] font-semibold text-[#6B7280] uppercase tracking-wider">Google Ads</span>
              </div>
              <p className="text-xl font-bold text-white">{fin.google === 0 ? '—' : fmtShort(fin.google)}</p>
              <p className="text-[10px] text-[#4B5563] mt-1">{fin.gCount} conta{fin.gCount !== 1 ? 's' : ''}</p>
              {fin.google > 0 && (
                <p className="text-[10px] text-[#4B5563]">{fmtFull(fin.google / Math.max(fin.gCount, 1))}/conta</p>
              )}
              {fin.google > 0 && fin.google < 500 && (
                <span className="inline-flex items-center gap-0.5 text-[9px] text-red-400 mt-1.5">
                  <ArrowDownRight size={9} /> Saldo baixo
                </span>
              )}
            </div>

            {/* Meta */}
            <div className="bg-[#0B1120] border border-white/6 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded flex items-center justify-center" style={{ background:'rgba(6,104,225,0.15)' }}>
                  <Zap size={12} style={{ color:'#0668E1' }} />
                </div>
                <span className="text-[10px] font-semibold text-[#6B7280] uppercase tracking-wider">Meta Ads</span>
              </div>
              <p className="text-xl font-bold text-white">{fin.meta === 0 ? '—' : fmtShort(fin.meta)}</p>
              <p className="text-[10px] text-[#4B5563] mt-1">{fin.mCount} conta{fin.mCount !== 1 ? 's' : ''}</p>
              {fin.meta > 0 && (
                <p className="text-[10px] text-[#4B5563]">{fmtFull(fin.meta / Math.max(fin.mCount, 1))}/conta</p>
              )}
              {fin.meta > 0 && fin.meta < 500 && (
                <span className="inline-flex items-center gap-0.5 text-[9px] text-red-400 mt-1.5">
                  <ArrowDownRight size={9} /> Saldo baixo
                </span>
              )}
            </div>
          </div>

          {/* Total row */}
          <div className="flex items-center justify-between bg-[#0B1120] border border-white/6 rounded-xl px-4 py-3">
            <div>
              <p className="text-[10px] text-[#6B7280] font-semibold uppercase tracking-wider mb-0.5">Total Investido (saldo ativo)</p>
              <p className="text-2xl font-black text-emerald-400">
                {fin.google + fin.meta === 0 ? '—' : fmtShort(fin.google + fin.meta)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-[#4B5563]">{fin.gCount + fin.mCount} contas ativas</p>
              {(items.length - fin.gCount - fin.mCount) > 0 && (
                <p className="text-[10px] text-[#F87171]">{items.length - fin.gCount - fin.mCount} sem saldo</p>
              )}
            </div>
          </div>
        </div>

        {/* Próximos Prazos */}
        <div className="bg-[#0E1520] border border-white/7 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <CalendarClock size={15} className="text-amber-400" />
            <h3 className="text-[#F3F4F6] font-semibold text-sm">Próximos Prazos</h3>
            <span className="ml-auto text-[10px] text-[#6B7280]">Top {upcoming.length}</span>
          </div>

          {upcoming.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-[#4B5563]">
              <CheckCircle2 size={24} className="text-emerald-500/50 mb-2" />
              <p className="text-sm">Sem prazos futuros pendentes</p>
            </div>
          ) : (
            <div className="space-y-2">
              {upcoming.map((r) => {
                const days = daysFromNow(r.prazoEntrega);
                const isUrgent = days <= 2;
                const isWarn   = days <= 5;
                return (
                  <div
                    key={r.id}
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all hover:border-white/12 ${
                      isUrgent ? 'bg-red-500/5 border-red-500/20' :
                      isWarn   ? 'bg-amber-500/5 border-amber-500/15' :
                                 'bg-white/[0.02] border-white/6'
                    }`}
                  >
                    {/* Priority dot */}
                    <div
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ background: isUrgent ? '#F87171' : isWarn ? '#FBBF24' : '#6B7280' }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-medium text-[#E2E8F0] truncate">
                        {r.tarefaDemanda || r.nomeCliente}
                      </p>
                      <p className="text-[10px] text-[#4B5563] truncate">
                        {r.nomeCliente}{r.responsavel ? ` · ${r.responsavel}` : ''}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className={`text-[11px] font-bold ${isUrgent ? 'text-red-400' : isWarn ? 'text-amber-400' : 'text-[#6B7280]'}`}>
                        {days === 0 ? 'Hoje' : days === 1 ? 'Amanhã' : `${days}d`}
                      </p>
                      <p className="text-[9px] text-[#374151]">
                        {new Date(r.prazoEntrega).toLocaleDateString('pt-BR', { day:'2-digit', month:'short' })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
