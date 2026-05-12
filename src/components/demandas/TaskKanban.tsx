'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus } from 'lucide-react';
import { Demanda, DemandaStatus, STATUS_CONFIG, KANBAN_COLUMNS } from '@/types/demandas';
import { useDemandasStore } from '@/store/useDemandasStore';
import TaskCard from './TaskCard';
import { STATUS_ICONS } from './StatusBadge';

interface Props {
  demandas: Demanda[];
}

export default function TaskKanban({ demandas }: Props) {
  const { updateStatus, openModal } = useDemandasStore();
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverCol, setDragOverCol] = useState<DemandaStatus | null>(null);

  const byStatus = (status: DemandaStatus) =>
    demandas.filter(d => d.status === status).sort((a, b) => a.ordem - b.ordem);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('taskId', id);
    e.dataTransfer.effectAllowed = 'move';
    setDraggingId(id);
  };

  const handleDragEnd = () => {
    setDraggingId(null);
    setDragOverCol(null);
  };

  const handleDragOver = (e: React.DragEvent, status: DemandaStatus) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverCol(status);
  };

  const handleDrop = (e: React.DragEvent, status: DemandaStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    if (taskId) updateStatus(taskId, status);
    setDraggingId(null);
    setDragOverCol(null);
  };

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 h-full">
      {KANBAN_COLUMNS.map(colStatus => {
        const cfg = STATUS_CONFIG[colStatus];
        const cards = byStatus(colStatus);
        const isOver = dragOverCol === colStatus;

        return (
          <div
            key={colStatus}
            className="flex-shrink-0 w-72 flex flex-col"
            onDragOver={(e) => handleDragOver(e, colStatus)}
            onDrop={(e) => handleDrop(e, colStatus)}
            onDragLeave={() => setDragOverCol(null)}
          >
            {/* Column header */}
            <div className={`flex items-center justify-between px-3 py-2 mb-3 rounded-xl border ${cfg.bg} ${isOver ? 'border-[#EF4444]/40' : 'border-transparent'}`}>
              <div className="flex items-center gap-2">
                {(() => { const Icon = STATUS_ICONS[colStatus]; return <Icon size={13} className={cfg.color} />; })()}
                <span className={`text-sm font-semibold ${cfg.color}`}>{cfg.label}</span>
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${cfg.bg} ${cfg.color}`}>
                  {cards.length}
                </span>
              </div>
              <button
                onClick={() => openModal()}
                className={`w-6 h-6 rounded-md flex items-center justify-center ${cfg.color} hover:bg-white/10 transition`}
              >
                <Plus size={12} />
              </button>
            </div>

            {/* Drop zone */}
            <div
              className={`flex-1 min-h-[200px] rounded-xl transition-all ${
                isOver ? 'bg-[#EF4444]/5 border-2 border-dashed border-[#EF4444]/30' : 'bg-transparent'
              }`}
            >
              <AnimatePresence>
                <div className="space-y-3 p-1">
                  {cards.map(d => (
                    <div
                      key={d.id}
                      draggable
                      onDragStart={e => handleDragStart(e, d.id)}
                      onDragEnd={handleDragEnd}
                      className={`transition-opacity ${draggingId === d.id ? 'opacity-40' : 'opacity-100'}`}
                    >
                      <TaskCard demanda={d} />
                    </div>
                  ))}

                  {cards.length === 0 && !isOver && (
                    <div className="text-center py-8 text-[#A1A1AA] text-xs">
                      Nenhuma demanda
                    </div>
                  )}
                </div>
              </AnimatePresence>
            </div>
          </div>
        );
      })}
    </div>
  );
}
