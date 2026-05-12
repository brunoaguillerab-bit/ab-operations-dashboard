'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Client, ClientGroup, TaskStatus } from '@/data/mockClients';
import {
  ChevronDown,
  Edit2,
  ExternalLink,
  Eye,
  MoreVertical,
  Copy,
} from 'lucide-react';

interface ClientsTableProps {
  clients: Client[];
  onEditClient?: (client: Client) => void;
}

const statusConfig: Record<TaskStatus, { label: string; color: string; bgColor: string; dot: string }> = {
  feito: {
    label: '✓ Feito',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    dot: 'bg-emerald-500',
  },
  a_fazer: {
    label: '○ A Fazer',
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
    dot: 'bg-amber-500',
  },
  cliente: {
    label: '⊗ Cliente',
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/10',
    dot: 'bg-orange-500',
  },
  pausado: {
    label: '∥ Pausado',
    color: 'text-zinc-400',
    bgColor: 'bg-zinc-500/10',
    dot: 'bg-zinc-500',
  },
  urgente: {
    label: '! Urgente',
    color: 'text-red-400',
    bgColor: 'bg-red-500/10',
    dot: 'bg-red-500',
  },
};

const groupLabels: Record<ClientGroup, string> = {
  'Workana': 'Clientes Workana',
  'Recorrentes': 'Contas Recorrentes',
  'Pontuais': 'Projetos Pontuais',
};

export default function ClientsTable({ clients, onEditClient }: ClientsTableProps) {
  const [expandedGroups, setExpandedGroups] = useState<Record<ClientGroup, boolean>>({
    Workana: true,
    Recorrentes: true,
    Pontuais: true,
  });
  const [editingCell, setEditingCell] = useState<string | null>(null);

  const toggleGroup = (group: ClientGroup) => {
    setExpandedGroups(prev => ({
      ...prev,
      [group]: !prev[group],
    }));
  };

  const groupedClients = {
    Workana: clients.filter(c => c.group === 'Workana'),
    Recorrentes: clients.filter(c => c.group === 'Recorrentes'),
    Pontuais: clients.filter(c => c.group === 'Pontuais'),
  } as const;

  const renderGroup = (groupKey: ClientGroup) => {
    const groupClients = groupedClients[groupKey];
    const isExpanded = expandedGroups[groupKey];

    return (
      <div key={groupKey} className="mb-6">
        {/* Group Header */}
        <button
          onClick={() => toggleGroup(groupKey)}
          className="w-full flex items-center gap-3 px-6 py-4 bg-[#181C25]/50 hover:bg-[#181C25] border-y border-[#2A2F3A] transition-all group"
        >
          <motion.div
            animate={{ rotate: isExpanded ? 0 : -90 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown size={18} className="text-[#A1A1AA]" />
          </motion.div>
          <h3 className="text-sm font-bold text-white">
            {groupLabels[groupKey]}
          </h3>
          <span className="ml-auto text-xs bg-[#2A2F3A] text-[#A1A1AA] px-2.5 py-1 rounded-full font-semibold">
            {groupClients.length}
          </span>
        </button>

        {/* Group Items */}
        <AnimatePresence mode="wait">
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="border-b border-l border-r border-[#2A2F3A] divide-y divide-[#2A2F3A]">
                {/* Table Header */}
                <div className="sticky top-0 bg-[#0F1117] grid grid-cols-[1.2fr_1fr_0.8fr_1fr_0.9fr_0.8fr_0.9fr_1.1fr_0.8fr_auto] gap-4 px-6 py-3 text-xs font-bold text-[#A1A1AA] uppercase tracking-wider">
                  <div>Cliente</div>
                  <div>Empresa</div>
                  <div>Mídia</div>
                  <div>Demanda</div>
                  <div>Andamento</div>
                  <div>Status</div>
                  <div>Prazo</div>
                  <div className="text-right">Saldos</div>
                  <div className="text-right">Valor</div>
                  <div></div>
                </div>

                {/* Table Rows */}
                {groupClients.map((client, idx) => (
                  <motion.div
                    key={client.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.02 }}
                    className="grid grid-cols-[1.2fr_1fr_0.8fr_1fr_0.9fr_0.8fr_0.9fr_1.1fr_0.8fr_auto] gap-4 px-6 py-3 hover:bg-white/[0.02] border-0 group transition-all items-center"
                  >
                    {/* Cliente */}
                    <div className="min-w-0">
                      <div className="font-semibold text-sm text-white truncate">
                        {client.name}
                      </div>
                      <div className="text-xs text-[#A1A1AA] truncate">
                        {client.company}
                      </div>
                    </div>

                    {/* Empresa */}
                    <div className="text-sm text-zinc-300 truncate">
                      {client.company}
                    </div>

                    {/* Mídia */}
                    <div>
                      <span className="inline-block px-2.5 py-1 rounded-lg bg-[#2A2F3A]/50 border border-[#2A2F3A] text-xs font-medium text-[#A1A1AA]">
                        {client.media}
                      </span>
                    </div>

                    {/* Demanda */}
                    <div>
                      {client.dashboardLink ? (
                        <a
                          href={client.dashboardLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 group/link truncate"
                        >
                          <span className="truncate">{client.demanda || '—'}</span>
                          <ExternalLink
                            size={12}
                            className="flex-shrink-0 opacity-0 group-hover/link:opacity-100 transition-opacity"
                          />
                        </a>
                      ) : (
                        <span className="text-xs text-[#A1A1AA]">
                          {client.demanda || '—'}
                        </span>
                      )}
                    </div>

                    {/* Andamento */}
                    <div className="text-xs text-[#A1A1AA] truncate">
                      {client.andamento || '—'}
                    </div>

                    {/* Status */}
                    <div>
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${
                          statusConfig[client.status].color
                        } ${statusConfig[client.status].bgColor}`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            statusConfig[client.status].dot
                          }`}
                        />
                        {statusConfig[client.status].label}
                      </span>
                    </div>

                    {/* Prazo */}
                    <div className="text-xs font-mono text-[#A1A1AA] bg-black/20 px-2 py-1.5 rounded">
                      {client.prazoEntrega}
                    </div>

                    {/* Saldos */}
                    <div className="text-right">
                      <div className="text-xs space-y-0.5">
                        {client.saldoGoogle > 0 && (
                          <div className="font-semibold text-cyan-400">
                            G: R$ {client.saldoGoogle.toFixed(2)}
                          </div>
                        )}
                        {client.saldoMeta > 0 && (
                          <div className="font-semibold text-blue-400">
                            M: R$ {client.saldoMeta.toFixed(2)}
                          </div>
                        )}
                        {client.saldoGoogle === 0 && client.saldoMeta === 0 && (
                          <div className="text-[#A1A1AA]">—</div>
                        )}
                      </div>
                    </div>

                    {/* Valor Mensal */}
                    <div className="text-right">
                      <span
                        className={`text-sm font-bold ${
                          client.valorMensal > 0 ? 'text-emerald-400' : 'text-[#A1A1AA]'
                        }`}
                      >
                        {client.valorMensal > 0
                          ? `R$ ${client.valorMensal.toFixed(2)}`
                          : '—'}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-1.5 hover:bg-white/10 rounded transition text-[#A1A1AA] hover:text-white">
                        <Eye size={14} />
                      </button>
                      <button
                        onClick={() => onEditClient?.(client)}
                        className="p-1.5 hover:bg-blue-500/10 rounded transition text-[#A1A1AA] hover:text-blue-400"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button className="p-1.5 hover:bg-white/10 rounded transition text-[#A1A1AA] hover:text-white">
                        <MoreVertical size={14} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <div className="glass-panel rounded-2xl border border-[#2A2F3A] overflow-hidden">
      {/* Tabs/Filter Info */}
      <div className="px-6 py-4 border-b border-[#2A2F3A] flex items-center justify-between bg-[#0F1117]/50">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-bold text-white">
            Todos os Clientes & Demandas
          </h2>
          <span className="text-xs bg-[#2A2F3A] text-[#A1A1AA] px-3 py-1.5 rounded-full font-semibold">
            {clients.length} total
          </span>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <div className="min-w-max">
          {Object.keys(groupedClients).map(key =>
            renderGroup(key as ClientGroup)
          )}
        </div>
      </div>
    </div>
  );
}
