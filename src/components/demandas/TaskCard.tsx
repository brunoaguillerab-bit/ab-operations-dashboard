'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar, User, CheckSquare, MoreVertical, Copy,
  Archive, Trash2, CheckCircle2, Edit2, ChevronDown,
} from 'lucide-react';
import { Demanda, STATUS_CONFIG, PRIORIDADE_CONFIG, DemandaStatus, DemandaPrioridade } from '@/types/demandas';
import { useDemandasStore } from '@/store/useDemandasStore';
import StatusBadge, { STATUS_ICONS } from './StatusBadge';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface TaskCardProps {
  demanda: Demanda;
}

export default function TaskCard({ demanda }: TaskCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [prioridadeOpen, setPrioridadeOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const { openDrawer, openModal, remove, archive, restore, duplicate, complete, updateStatus, updatePrioridade } = useDemandasStore();

  const sc = STATUS_CONFIG[demanda.status];
  const pc = PRIORIDADE_CONFIG[demanda.prioridade];
  const isOverdue = new Date(demanda.prazo) < new Date() && demanda.status !== 'concluida' && demanda.status !== 'arquivada';
  const checkDone = demanda.checklist.filter(c => c.concluido).length;
  const checkTotal = demanda.checklist.length;

  // Close menus on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
        setStatusOpen(false);
        setPrioridadeOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleCardClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('[data-no-open]')) return;
    openDrawer(demanda.id);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      onClick={handleCardClick}
      className={`bg-[#181C25] border rounded-xl p-5 cursor-pointer hover:border-[#3A3F4A] transition-all group relative ${
        demanda.status === 'concluida' ? 'border-emerald-500/20 opacity-70' :
        isOverdue ? 'border-red-500/30' : 'border-[#2A2F3A]'
      }`}
    >
      {/* Top row */}
      <div className="flex items-start gap-3">
        {/* Status icon */}
        {(() => {
          const Icon = STATUS_ICONS[demanda.status];
          return (
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${sc.bg}`}>
              <Icon size={14} className={sc.color} />
            </div>
          );
        })()}

        {/* Title + description */}
        <div className="flex-1 min-w-0">
          <h3 className={`text-sm font-semibold leading-tight ${demanda.status === 'concluida' ? 'line-through text-[#A1A1AA]' : 'text-white'}`}>
            {demanda.titulo}
          </h3>
          {demanda.descricao && (
            <p className="text-xs text-[#A1A1AA] mt-1 line-clamp-2">{demanda.descricao}</p>
          )}
        </div>

        {/* 3-dot menu */}
        <div ref={menuRef} data-no-open className="relative flex-shrink-0">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-[#A1A1AA] hover:bg-white/5 hover:text-white transition opacity-0 group-hover:opacity-100"
          >
            <MoreVertical size={14} />
          </button>

          <AnimatePresence>
            {menuOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -4 }}
                className="absolute right-0 top-8 bg-[#1E2330] border border-[#2A2F3A] rounded-xl shadow-xl z-50 w-48 overflow-hidden"
              >
                {[
                  { icon: Edit2, label: 'Editar', action: () => { openModal(demanda.id); setMenuOpen(false); } },
                  { icon: Copy, label: 'Duplicar', action: () => { duplicate(demanda.id); setMenuOpen(false); } },
                  { icon: CheckCircle2, label: 'Marcar concluída', action: () => { complete(demanda.id); setMenuOpen(false); } },
                  { icon: Archive, label: demanda.arquivada ? 'Restaurar' : 'Arquivar', action: () => { demanda.arquivada ? restore(demanda.id) : archive(demanda.id); setMenuOpen(false); } },
                  { icon: Trash2, label: 'Excluir', action: () => { remove(demanda.id); setMenuOpen(false); }, danger: true },
                ].map(item => (
                  <button
                    key={item.label}
                    onClick={item.action}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition border-b border-[#2A2F3A] last:border-0 ${
                      item.danger ? 'text-red-400 hover:bg-red-500/10' : 'text-[#A1A1AA] hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <item.icon size={13} />
                    {item.label}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Meta row */}
      <div className="flex flex-wrap items-center gap-3 mt-4" data-no-open>
        {/* Status badge (inline editable) */}
        <div className="relative">
          <StatusBadge
            status={demanda.status}
            showChevron
            onClick={() => setStatusOpen(!statusOpen)}
          />
          <AnimatePresence>
            {statusOpen && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
                className="absolute left-0 top-full mt-1 bg-[#1E2330] border border-[#2A2F3A] rounded-xl shadow-xl z-50 w-52 overflow-hidden"
              >
                {(Object.keys(STATUS_CONFIG) as DemandaStatus[]).filter(s => s !== 'arquivada').map(s => {
                  const cfg = STATUS_CONFIG[s];
                  const Icon = STATUS_ICONS[s];
                  const isActive = demanda.status === s;
                  return (
                    <button
                      key={s}
                      onClick={() => { updateStatus(demanda.id, s); setStatusOpen(false); }}
                      className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-xs transition border-b border-[#2A2F3A] last:border-0 ${
                        isActive
                          ? `${cfg.color} font-semibold ${cfg.bg}`
                          : 'text-[#A1A1AA] hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <span className={`w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 ${cfg.bg}`}>
                        <Icon size={12} className={cfg.color} />
                      </span>
                      {cfg.label}
                      {isActive && <span className="ml-auto text-[10px] opacity-60">✓</span>}
                    </button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Priority badge (inline editable) */}
        <div className="relative">
          <button
            onClick={() => setPrioridadeOpen(!prioridadeOpen)}
            className={`flex items-center gap-1 text-xs font-semibold ${pc.color}`}
          >
            {pc.label}
            <ChevronDown size={10} />
          </button>
          <AnimatePresence>
            {prioridadeOpen && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
                className="absolute left-0 top-full mt-1 bg-[#1E2330] border border-[#2A2F3A] rounded-xl shadow-xl z-50 w-36 overflow-hidden"
              >
                {(Object.keys(PRIORIDADE_CONFIG) as DemandaPrioridade[]).map(p => {
                  const cfg = PRIORIDADE_CONFIG[p];
                  return (
                    <button
                      key={p}
                      onClick={() => { updatePrioridade(demanda.id, p); setPrioridadeOpen(false); }}
                      className={`w-full flex items-center gap-2 px-3 py-2 text-xs transition border-b border-[#2A2F3A] last:border-0 ${
                        demanda.prioridade === p ? cfg.color + ' font-semibold' : 'text-[#A1A1AA] hover:bg-white/5'
                      }`}
                    >
                      {cfg.label}
                    </button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Spacer */}
        <span className="flex-1" />

        {/* Checklist progress */}
        {checkTotal > 0 && (
          <span className={`flex items-center gap-1 text-xs ${checkDone === checkTotal ? 'text-emerald-400' : 'text-[#A1A1AA]'}`}>
            <CheckSquare size={11} />
            {checkDone}/{checkTotal}
          </span>
        )}

        {/* Cliente */}
        <span className="flex items-center gap-1 text-xs text-[#A1A1AA]">
          <User size={11} />
          {demanda.clienteNome}
        </span>

        {/* Prazo */}
        <span className={`flex items-center gap-1 text-xs font-medium ${isOverdue ? 'text-red-400' : 'text-[#A1A1AA]'}`}>
          <Calendar size={11} />
          {isOverdue && '⚠ '}
          {new Date(demanda.prazo).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
        </span>
      </div>

      {/* Tags */}
      {demanda.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {demanda.tags.slice(0, 3).map(tag => (
            <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-[#A1A1AA]">
              #{tag}
            </span>
          ))}
          {demanda.tags.length > 3 && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-[#A1A1AA]">
              +{demanda.tags.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Overdue indicator */}
      {isOverdue && (
        <div className="absolute top-0 left-0 w-1 h-full bg-red-500/60 rounded-l-xl" />
      )}
    </motion.div>
  );
}
