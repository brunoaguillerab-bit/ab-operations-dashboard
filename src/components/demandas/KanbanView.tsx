'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  arrayMove,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { ClienteDemanda, DemandaClienteStatus } from '@/types/demandasCentral';
import { MessageSquare, Calendar, Edit2, MoreHorizontal } from 'lucide-react';
import { STATUS_CENTRAL_CONFIG } from './StatusBadgeCentral';

// ─── Persistência da ordem no localStorage ────────────────────────────────────

const LS_KANBAN_ORDER_KEY = 'ab-kanban-order';

const lsGetKanbanOrder = (): Record<string, string[]> => {
  try {
    const raw = localStorage.getItem(LS_KANBAN_ORDER_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
};

const lsSaveKanbanOrder = (order: Record<string, string[]>) => {
  try { localStorage.setItem(LS_KANBAN_ORDER_KEY, JSON.stringify(order)); } catch {}
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

const KANBAN_COLUMNS: DemandaClienteStatus[] = [
  'A fazer', 'Em andamento', 'Aguardando cliente', 'Aguardando pagamento', 'Feito',
];

function getPriorityColor(priority: string) {
  const styles: Record<string, string> = {
    Baixa: 'bg-[#1E293B] text-[#94A3B8]',
    Media: 'bg-blue-500/10 text-blue-400',
    Alta: 'bg-orange-500/10 text-orange-400',
    Urgente: 'bg-red-500/10 text-red-400',
  };
  return styles[priority] || 'bg-[#1E293B] text-[#94A3B8]';
}

// Aplica a ordem do localStorage às tasks de uma coluna
function applyColumnOrder(tasks: ClienteDemanda[], savedOrder: string[]): ClienteDemanda[] {
  if (!savedOrder.length) return tasks;
  const orderMap = new Map(savedOrder.map((id, i) => [id, i]));
  return [...tasks].sort((a, b) => {
    const ai = orderMap.has(a.id) ? orderMap.get(a.id)! : Number.MAX_SAFE_INTEGER;
    const bi = orderMap.has(b.id) ? orderMap.get(b.id)! : Number.MAX_SAFE_INTEGER;
    return ai - bi;
  });
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface KanbanViewProps {
  items: ClienteDemanda[];
  onMoveTask: (taskId: string, targetStatus: DemandaClienteStatus) => void;
  onOpenTask: (task: ClienteDemanda) => void;
  onEdit: (task: ClienteDemanda) => void;
  activeDragId: string | null;
  setActiveDragId: (id: string | null) => void;
}

// ─── Card ─────────────────────────────────────────────────────────────────────

function TaskCard({
  task, onOpenTask, onEdit, isOverlay = false,
}: {
  task: ClienteDemanda;
  onOpenTask?: () => void;
  onEdit?: () => void;
  isOverlay?: boolean;
}) {
  return (
    <div className={`group bg-[#121826] border border-white/10 rounded-xl p-3.5 shadow-sm transition-all
      hover:border-[#3B82F6]/50 hover:shadow-md
      ${isOverlay ? 'shadow-2xl ring-2 ring-[#3B82F6]/60 rotate-1 scale-[1.02]' : ''}`}
    >
      <div className="flex items-start justify-between mb-2">
        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${getPriorityColor(task.prioridade)}`}>
          {task.prioridade}
        </span>
        {onEdit && (
          <button
            onClick={e => { e.stopPropagation(); onEdit(); }}
            className="opacity-0 group-hover:opacity-100 p-1 text-[#94A3B8] hover:text-white hover:bg-white/10 rounded transition-all"
          >
            <Edit2 size={12} />
          </button>
        )}
      </div>

      <h4
        onClick={e => { e.stopPropagation(); onOpenTask?.(); }}
        className="text-[#F3F4F6] text-sm font-medium leading-snug mb-1.5 hover:text-[#3B82F6] transition-colors cursor-pointer"
      >
        {task.tarefaDemanda || task.nomeCliente}
      </h4>
      <p className="text-xs text-[#94A3B8] mb-3 line-clamp-1">{task.nomeCliente} • {task.empresa}</p>

      <div className="flex items-center justify-between border-t border-white/5 pt-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-[#1A2235] border border-white/10 flex items-center justify-center text-[10px] font-bold text-[#E2E8F0]" title={task.responsavel}>
            {task.responsavel ? task.responsavel.charAt(0).toUpperCase() : 'S'}
          </div>
          <span className="text-xs text-[#64748B] flex items-center gap-1">
            <MessageSquare size={12} /> 0
          </span>
        </div>
        {task.prazoEntrega && (
          <span className="text-[11px] text-[#94A3B8] flex items-center gap-1 bg-[#1A2235] px-1.5 py-0.5 rounded">
            <Calendar size={10} />
            {new Date(task.prazoEntrega).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
          </span>
        )}
      </div>
    </div>
  );
}

// ─── Sortable card wrapper ────────────────────────────────────────────────────

function SortableCard({
  task, onOpenTask, onEdit,
}: {
  task: ClienteDemanda;
  onOpenTask: () => void;
  onEdit: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    data: { type: 'Task', status: task.status },
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.35 : 1,
    cursor: isDragging ? 'grabbing' : 'grab',
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="touch-none">
      <TaskCard task={task} onOpenTask={onOpenTask} onEdit={onEdit} />
    </div>
  );
}

// ─── Droppable column ─────────────────────────────────────────────────────────

function KanbanColumn({
  id, tasks, onOpenTask, onEdit,
}: {
  id: DemandaClienteStatus;
  tasks: ClienteDemanda[];
  onOpenTask: (t: ClienteDemanda) => void;
  onEdit: (t: ClienteDemanda) => void;
}) {
  // useDroppable (não useSortable) — o correto para containers de drop
  const { setNodeRef, isOver } = useDroppable({ id, data: { type: 'Column' } });
  const cfg = STATUS_CENTRAL_CONFIG[id];
  const Icon = cfg.icon;

  return (
    <div className="flex flex-col w-[300px] flex-shrink-0">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <span className={`w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 ${cfg.bg}`}>
            <Icon size={13} className={cfg.text} />
          </span>
          <h3 className="text-[#F3F4F6] font-medium text-sm">{id}</h3>
          <span className="text-xs text-[#94A3B8] bg-white/5 px-1.5 py-0.5 rounded-full">{tasks.length}</span>
        </div>
        <button className="text-[#94A3B8] hover:text-white hover:bg-white/10 p-1 rounded transition-colors">
          <MoreHorizontal size={16} />
        </button>
      </div>

      {/* Drop zone */}
      <div
        ref={setNodeRef}
        className={`flex-1 rounded-2xl p-2 min-h-[150px] flex flex-col gap-2 border transition-colors
          ${isOver
            ? 'bg-[#1A2235]/80 border-[#3B82F6]/40'
            : 'bg-[#0B1020]/50 border-white/5'
          }`}
      >
        <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map(task => (
            <SortableCard
              key={task.id}
              task={task}
              onOpenTask={() => onOpenTask(task)}
              onEdit={() => onEdit(task)}
            />
          ))}
        </SortableContext>

        {/* Zona de drop vazia visível */}
        {tasks.length === 0 && (
          <div className={`flex-1 flex items-center justify-center rounded-xl border-2 border-dashed min-h-[80px] text-xs transition-colors
            ${isOver ? 'border-[#3B82F6]/60 text-[#3B82F6]' : 'border-white/10 text-[#4B5563]'}`}>
            {isOver ? 'Soltar aqui' : 'Sem tarefas'}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main KanbanView ──────────────────────────────────────────────────────────

export function KanbanView({ items, onMoveTask, onOpenTask, onEdit, activeDragId, setActiveDragId }: KanbanViewProps) {
  // Estado local para animação suave durante o drag (não espera parent re-render)
  const [localItems, setLocalItems] = useState<ClienteDemanda[]>(() => {
    const savedOrder = lsGetKanbanOrder();
    return KANBAN_COLUMNS.reduce<ClienteDemanda[]>((acc, col) => {
      const colTasks = items.filter(i => i.status === col);
      return [...acc, ...applyColumnOrder(colTasks, savedOrder[col] || [])];
    }, []);
  });

  // Sincroniza com o parent quando items mudam externamente (filtros, novos dados)
  useEffect(() => {
    const savedOrder = lsGetKanbanOrder();
    setLocalItems(
      KANBAN_COLUMNS.reduce<ClienteDemanda[]>((acc, col) => {
        const colTasks = items.filter(i => i.status === col);
        return [...acc, ...applyColumnOrder(colTasks, savedOrder[col] || [])];
      }, [])
    );
  }, [items]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  // Agrupa por coluna
  const columnsData = KANBAN_COLUMNS.reduce<Record<string, ClienteDemanda[]>>((acc, col) => {
    acc[col] = localItems.filter(i => i.status === col);
    return acc;
  }, {});

  const activeTask = localItems.find(i => i.id === activeDragId);

  // ── Drag start ──────────────────────────────────────────────────────────────
  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveDragId(String(event.active.id));
  }, [setActiveDragId]);

  // ── Drag over: move o card visualmente entre colunas em tempo real ──────────
  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);
    if (activeId === overId) return;

    const activeTask = localItems.find(i => i.id === activeId);
    if (!activeTask) return;

    // Descobre o status alvo
    let targetStatus: DemandaClienteStatus | null = null;
    if (KANBAN_COLUMNS.includes(overId as DemandaClienteStatus)) {
      targetStatus = overId as DemandaClienteStatus;
    } else {
      const overTask = localItems.find(i => i.id === overId);
      if (overTask) targetStatus = overTask.status;
    }

    if (!targetStatus || activeTask.status === targetStatus) return;

    // Move o card para a nova coluna localmente (animação suave)
    setLocalItems(prev => {
      const overTask = prev.find(i => i.id === overId);
      const newItems = prev.map(i =>
        i.id === activeId ? { ...i, status: targetStatus! } : i
      );
      // Se dropped sobre um card, insere na posição correta
      if (overTask && overTask.status === targetStatus) {
        const oldIndex = newItems.findIndex(i => i.id === activeId);
        const newIndex = newItems.findIndex(i => i.id === overId);
        return arrayMove(newItems, oldIndex, newIndex);
      }
      return newItems;
    });
  }, [localItems]);

  // ── Drag end: persiste no Supabase + localStorage ───────────────────────────
  const handleDragEnd = useCallback((event: DragEndEvent) => {
    setActiveDragId(null);
    const { active, over } = event;
    if (!over) {
      // Drag cancelado — reverte para estado do parent
      const savedOrder = lsGetKanbanOrder();
      setLocalItems(
        KANBAN_COLUMNS.reduce<ClienteDemanda[]>((acc, col) => {
          const colTasks = items.filter(i => i.status === col);
          return [...acc, ...applyColumnOrder(colTasks, savedOrder[col] || [])];
        }, [])
      );
      return;
    }

    const activeId = String(active.id);
    const overId = String(over.id);

    // Reordenamento na mesma coluna
    const activeTaskLocal = localItems.find(i => i.id === activeId);
    const overTaskLocal = localItems.find(i => i.id === overId);

    if (activeTaskLocal && overTaskLocal && activeTaskLocal.status === overTaskLocal.status && activeId !== overId) {
      setLocalItems(prev => {
        const oldIdx = prev.findIndex(i => i.id === activeId);
        const newIdx = prev.findIndex(i => i.id === overId);
        return arrayMove(prev, oldIdx, newIdx);
      });
    }

    // Salva a ordem de TODAS as colunas no localStorage
    setTimeout(() => {
      setLocalItems(current => {
        const newOrder: Record<string, string[]> = {};
        KANBAN_COLUMNS.forEach(col => {
          newOrder[col] = current.filter(i => i.status === col).map(i => i.id);
        });
        lsSaveKanbanOrder(newOrder);
        return current;
      });
    }, 0);

    // Persiste mudança de status no Supabase (se houve mudança de coluna)
    const originalTask = items.find(i => i.id === activeId);
    const finalTask = localItems.find(i => i.id === activeId);
    if (originalTask && finalTask && originalTask.status !== finalTask.status) {
      onMoveTask(activeId, finalTask.status);
    }
  }, [activeDragId, localItems, items, onMoveTask, setActiveDragId]);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-6 h-[calc(100vh-220px)] items-start">
        {KANBAN_COLUMNS.map(col => (
          <KanbanColumn
            key={col}
            id={col}
            tasks={columnsData[col] || []}
            onOpenTask={onOpenTask}
            onEdit={onEdit}
          />
        ))}
      </div>

      <DragOverlay dropAnimation={{ duration: 180, easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)' }}>
        {activeTask ? <TaskCard task={activeTask} isOverlay /> : null}
      </DragOverlay>
    </DndContext>
  );
}
