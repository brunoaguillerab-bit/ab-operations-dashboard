'use client';

import { motion } from 'framer-motion';
import { DemandaStats, DemandaFilters } from '@/types/demandas';
import { useDemandasStore } from '@/store/useDemandasStore';

interface KPICard {
  label: string;
  value: number;
  color: string;
  filterKey: keyof DemandaFilters;
  filterValue: DemandaFilters[keyof DemandaFilters];
  active?: boolean;
}

interface Props {
  stats: DemandaStats;
}

export default function DemandasKPICards({ stats }: Props) {
  const { filters, setFilter, clearFilters } = useDemandasStore();

  const cards: KPICard[] = [
    { label: 'Total',           value: stats.total,           color: 'text-white',        filterKey: 'status',     filterValue: 'todas' },
    { label: 'Abertas',         value: stats.abertas,         color: 'text-blue-400',     filterKey: 'status',     filterValue: 'aberta' },
    { label: 'Em Andamento',    value: stats.emAndamento,     color: 'text-amber-400',    filterKey: 'status',     filterValue: 'em_andamento' },
    { label: 'Aguard. Cliente', value: stats.aguardandoCliente, color: 'text-orange-400', filterKey: 'status',     filterValue: 'aguardando_cliente' },
    { label: 'Concluídas',      value: stats.concluidas,      color: 'text-emerald-400',  filterKey: 'status',     filterValue: 'concluida' },
    { label: 'Urgentes',        value: stats.urgentes,        color: 'text-red-400',      filterKey: 'prioridade', filterValue: 'urgente' },
    { label: 'Vencidas',        value: stats.vencidas,        color: 'text-red-400',      filterKey: 'vencidas',   filterValue: true },
    { label: 'Prazo Hoje',      value: stats.prazoHoje,       color: 'text-yellow-400',   filterKey: 'prazoHoje',  filterValue: true },
  ];

  const handleClick = (card: KPICard) => {
    if (card.filterKey === 'status' && card.filterValue === 'todas') {
      clearFilters();
      return;
    }

    // Toggle: if already active, clear
    const isActive = filters[card.filterKey] === card.filterValue;
    if (isActive) {
      setFilter(card.filterKey, card.filterKey === 'status' ? 'todas' : card.filterKey === 'prioridade' ? 'todas' : false);
    } else {
      clearFilters();
      setFilter(card.filterKey, card.filterValue);
    }
  };

  const isActive = (card: KPICard) => {
    if (card.filterKey === 'status' && card.filterValue === 'todas') {
      return filters.status === 'todas' && filters.prioridade === 'todas' && !filters.vencidas && !filters.prazoHoje;
    }
    return filters[card.filterKey] === card.filterValue;
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
      {cards.map((card, i) => (
        <motion.button
          key={card.label}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.04 }}
          onClick={() => handleClick(card)}
          className={`relative bg-[#181C25] border rounded-xl p-4 text-center transition-all hover:border-[#3A3F4A] cursor-pointer ${
            isActive(card)
              ? 'border-[#EF4444]/40 bg-[#EF4444]/5 ring-1 ring-[#EF4444]/20'
              : 'border-[#2A2F3A]'
          }`}
        >
          <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
          <p className="text-[#A1A1AA] text-[10px] mt-1 font-medium leading-tight">{card.label}</p>
          {isActive(card) && (
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-[#EF4444] rounded-full" />
          )}
        </motion.button>
      ))}
    </div>
  );
}
