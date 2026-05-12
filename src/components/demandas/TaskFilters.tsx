'use client';

import { useState } from 'react';
import { Search, X, SlidersHorizontal, ChevronDown } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { DemandaStatus, DemandaPrioridade, DemandaTipo, STATUS_CONFIG, PRIORIDADE_CONFIG } from '@/types/demandas';
import { useDemandasStore } from '@/store/useDemandasStore';
import { mockClients } from '@/data/mockClients';

const TIPOS: { value: DemandaTipo | 'todos'; label: string }[] = [
  { value: 'todos', label: 'Todos os tipos' },
  { value: 'criativo', label: 'Criativo' },
  { value: 'campanha', label: 'Campanha' },
  { value: 'relatorio', label: 'Relatório' },
  { value: 'otimizacao', label: 'Otimização' },
  { value: 'reuniao', label: 'Reunião' },
  { value: 'pixel', label: 'Pixel' },
  { value: 'auditoria', label: 'Auditoria' },
  { value: 'outro', label: 'Outro' },
];

export default function TaskFilters() {
  const { filters, setFilter, clearFilters } = useDemandasStore();
  const [expanded, setExpanded] = useState(false);

  const hasActiveFilters =
    filters.search !== '' ||
    filters.status !== 'todas' ||
    filters.prioridade !== 'todas' ||
    filters.tipo !== 'todos' ||
    filters.clienteId !== '' ||
    filters.responsavel !== '' ||
    filters.vencidas ||
    filters.prazoHoje ||
    filters.mostrarArquivadas;

  const clienteOptions = [
    { id: '', nome: 'Todos os clientes' },
    ...mockClients.map(c => ({ id: c.id, nome: c.company })),
  ];

  return (
    <div className="space-y-3 mb-5">
      {/* Search + toggle */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A1A1AA]" />
          <input
            type="text"
            placeholder="Buscar demanda, cliente ou tag..."
            value={filters.search}
            onChange={e => setFilter('search', e.target.value)}
            className="w-full bg-[#181C25] border border-[#2A2F3A] rounded-xl py-2.5 pl-9 pr-4 text-sm text-white placeholder:text-[#A1A1AA] focus:outline-none focus:border-red-500/50"
          />
          {filters.search && (
            <button onClick={() => setFilter('search', '')} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A1A1AA] hover:text-white">
              <X size={12} />
            </button>
          )}
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition ${
            expanded || hasActiveFilters
              ? 'bg-red-500/10 border-red-500/30 text-red-400'
              : 'bg-[#181C25] border-[#2A2F3A] text-[#A1A1AA] hover:border-[#3A3F4A]'
          }`}
        >
          <SlidersHorizontal size={13} />
          Filtros
          {hasActiveFilters && (
            <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
          )}
          <ChevronDown size={12} className={`transition-transform ${expanded ? 'rotate-180' : ''}`} />
        </button>

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-[#2A2F3A] text-sm text-[#A1A1AA] hover:text-white hover:border-[#3A3F4A] transition"
          >
            <X size={13} />
            Limpar
          </button>
        )}
      </div>

      {/* Expanded filters */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 pt-1">
              {/* Status */}
              <select
                value={filters.status}
                onChange={e => setFilter('status', e.target.value as DemandaStatus | 'todas')}
                className="bg-[#181C25] border border-[#2A2F3A] rounded-xl px-3 py-2.5 text-sm text-[#A1A1AA] focus:outline-none focus:border-red-500/50"
              >
                <option value="todas">Todos os status</option>
                {(Object.keys(STATUS_CONFIG) as DemandaStatus[]).map(s => (
                  <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>
                ))}
              </select>

              {/* Prioridade */}
              <select
                value={filters.prioridade}
                onChange={e => setFilter('prioridade', e.target.value as DemandaPrioridade | 'todas')}
                className="bg-[#181C25] border border-[#2A2F3A] rounded-xl px-3 py-2.5 text-sm text-[#A1A1AA] focus:outline-none focus:border-red-500/50"
              >
                <option value="todas">Todas as prioridades</option>
                {(Object.keys(PRIORIDADE_CONFIG) as DemandaPrioridade[]).map(p => (
                  <option key={p} value={p}>{PRIORIDADE_CONFIG[p].label}</option>
                ))}
              </select>

              {/* Tipo */}
              <select
                value={filters.tipo}
                onChange={e => setFilter('tipo', e.target.value as DemandaTipo | 'todos')}
                className="bg-[#181C25] border border-[#2A2F3A] rounded-xl px-3 py-2.5 text-sm text-[#A1A1AA] focus:outline-none focus:border-red-500/50"
              >
                {TIPOS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>

              {/* Cliente */}
              <select
                value={filters.clienteId}
                onChange={e => setFilter('clienteId', e.target.value)}
                className="bg-[#181C25] border border-[#2A2F3A] rounded-xl px-3 py-2.5 text-sm text-[#A1A1AA] focus:outline-none focus:border-red-500/50"
              >
                {clienteOptions.map(c => (
                  <option key={c.id} value={c.id}>{c.nome}</option>
                ))}
              </select>

              {/* Checkboxes */}
              <label className="flex items-center gap-2 text-sm text-[#A1A1AA] cursor-pointer hover:text-white transition px-3 py-2.5 bg-[#181C25] border border-[#2A2F3A] rounded-xl">
                <input
                  type="checkbox"
                  checked={filters.vencidas}
                  onChange={e => setFilter('vencidas', e.target.checked)}
                  className="accent-red-500"
                />
                Vencidas
              </label>

              <label className="flex items-center gap-2 text-sm text-[#A1A1AA] cursor-pointer hover:text-white transition px-3 py-2.5 bg-[#181C25] border border-[#2A2F3A] rounded-xl">
                <input
                  type="checkbox"
                  checked={filters.prazoHoje}
                  onChange={e => setFilter('prazoHoje', e.target.checked)}
                  className="accent-red-500"
                />
                Prazo Hoje
              </label>

              <label className="flex items-center gap-2 text-sm text-[#A1A1AA] cursor-pointer hover:text-white transition px-3 py-2.5 bg-[#181C25] border border-[#2A2F3A] rounded-xl">
                <input
                  type="checkbox"
                  checked={filters.mostrarArquivadas}
                  onChange={e => setFilter('mostrarArquivadas', e.target.checked)}
                  className="accent-red-500"
                />
                Arquivadas
              </label>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
