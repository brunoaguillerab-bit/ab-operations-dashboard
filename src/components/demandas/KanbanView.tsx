'use client';

import { useMemo } from 'react';
import { ClienteDemanda, DemandaClienteStatus } from '@/types/demandasCentral';
import { DndContext, DragOverlay, closestCorners, KeyboardSensor, PointerSensor, useSensor, useSensors, DragStartEvent, DragOverEvent, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, arrayMove, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { MessageSquare, Calendar, User, MoreHorizontal, Edit2 } from 'lucide-react';
import { STATUS_CENTRAL_CONFIG } from './StatusBadgeCentral';

interface KanbanViewProps {
  items: ClienteDemanda[];
  onMoveTask: (taskId: string, targetStatus: DemandaClienteStatus, newIndex?: number) => void;
  onOpenTask: (task: ClienteDemanda) => void;
  onEdit: (task: ClienteDemanda) => void;
  activeDragId: string | null;
  setActiveDragId: (id: string | null) => void;
}

const KANBAN_COLUMNS: DemandaClienteStatus[] = [
  'A fazer', 'Em andamento', 'Aguardando cliente', 'Aguardando pagamento', 'Feito'
];

export function KanbanView({ items, onMoveTask, onOpenTask, onEdit, activeDragId, setActiveDragId }: KanbanViewProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const columnsData = useMemo(() => {
    const map: Record<string, ClienteDemanda[]> = {};
    KANBAN_COLUMNS.forEach(col => {
      map[col] = items.filter(i => i.status === col);
    });
    return map;
  }, [items]);

  const activeTask = items.find(i => i.id === activeDragId);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveDragId(event.active.id as string);
  };

  const handleDragOver = (event: DragOverEvent) => {
    // optional logic during drag
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveDragId(null);
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeTask = items.find(i => i.id === activeId);
    if (!activeTask) return;

    // Check if dropped on a column
    if (KANBAN_COLUMNS.includes(overId as DemandaClienteStatus)) {
      if (activeTask.status !== overId) {
        onMoveTask(activeId, overId as DemandaClienteStatus);
      }
      return;
    }

    // Check if dropped on another task
    const overTask = items.find(i => i.id === overId);
    if (overTask) {
      if (activeTask.status !== overTask.status) {
        onMoveTask(activeId, overTask.status);
      } else {
        // Same column reorder
        // We will just call onMoveTask to trigger order save if implemented
        onMoveTask(activeId, activeTask.status, items.indexOf(overTask));
      }
    }
  };

  return (
    <DndContext 
      sensors={sensors} 
      collisionDetection={closestCorners} 
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-6 h-[calc(100vh-220px)] hide-scrollbar items-start">
        {KANBAN_COLUMNS.map(colId => (
          <KanbanColumn 
            key={colId} 
            id={colId} 
            title={colId} 
            tasks={columnsData[colId] || []} 
            onOpenTask={onOpenTask}
            onEdit={onEdit}
          />
        ))}
      </div>

      <DragOverlay dropAnimation={{ duration: 200, easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)' }}>
        {activeTask ? <TaskCard task={activeTask} isOverlay /> : null}
      </DragOverlay>
    </DndContext>
  );
}

function KanbanColumn({ id, title, tasks, onOpenTask, onEdit }: { id: DemandaClienteStatus, title: string, tasks: ClienteDemanda[], onOpenTask: (t: ClienteDemanda) => void, onEdit: (t: ClienteDemanda) => void }) {
  const { setNodeRef } = useSortable({ id, data: { type: 'Column' } });

  return (
    <div className="flex flex-col w-[320px] flex-shrink-0">
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          {(() => {
            const cfg = STATUS_CENTRAL_CONFIG[id];
            const Icon = cfg.icon;
            return (
              <span className={`w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 ${cfg.bg}`}>
                <Icon size={13} className={cfg.text} />
              </span>
            );
          })()}
          <h3 className="text-[#F3F4F6] font-medium text-sm">{title}</h3>
          <span className="text-xs text-[#94A3B8] bg-white/5 px-1.5 py-0.5 rounded-full">{tasks.length}</span>
        </div>
        <button className="text-[#94A3B8] hover:text-white hover:bg-white/10 p-1 rounded transition-colors">
          <MoreHorizontal size={16} />
        </button>
      </div>

      <div 
        ref={setNodeRef}
        className="flex-1 bg-[#0B1020]/50 border border-white/5 rounded-2xl p-2 min-h-[150px] flex flex-col gap-2"
      >
        <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map(task => (
            <SortableTaskCard key={task.id} task={task} onOpenTask={onOpenTask} onEdit={onEdit} />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}

function SortableTaskCard({ task, onOpenTask, onEdit }: { task: ClienteDemanda, onOpenTask: (t: ClienteDemanda) => void, onEdit: (t: ClienteDemanda) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id, data: { type: 'Task', task } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <TaskCard task={task} onOpenTask={() => onOpenTask(task)} onEdit={() => onEdit(task)} isDragging={isDragging} />
    </div>
  );
}

function TaskCard({ task, onOpenTask, onEdit, isOverlay, isDragging }: { task: ClienteDemanda, onOpenTask?: () => void, onEdit?: () => void, isOverlay?: boolean, isDragging?: boolean }) {
  return (
    <div 
      className={`group bg-[#121826] border border-white/10 rounded-xl p-3.5 shadow-sm transition-all hover:border-[#3B82F6]/50 hover:shadow-md cursor-grab active:cursor-grabbing ${isOverlay ? 'shadow-2xl ring-2 ring-[#3B82F6] rotate-2' : ''}`}
    >
      <div className="flex items-start justify-between mb-2">
        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded flex items-center ${getPriorityColor(task.prioridade)}`}>
          {task.prioridade}
        </span>
        {onEdit && (
          <button 
            onClick={(e) => { e.stopPropagation(); onEdit(); }} 
            className="opacity-0 group-hover:opacity-100 p-1 text-[#94A3B8] hover:text-white hover:bg-white/10 rounded transition-all"
          >
            <Edit2 size={12} />
          </button>
        )}
      </div>

      <h4 
        onClick={(e) => { e.stopPropagation(); onOpenTask?.(); }}
        className="text-[#F3F4F6] text-sm font-medium leading-snug mb-1.5 hover:text-[#3B82F6] transition-colors"
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


function getPriorityColor(priority: string) {
  const styles: Record<string, string> = {
    'Baixa': 'bg-[#1E293B] text-[#94A3B8]',
    'Media': 'bg-blue-500/10 text-blue-400',
    'Alta': 'bg-orange-500/10 text-orange-400',
    'Urgente': 'bg-red-500/10 text-red-400',
  };
  return styles[priority] || 'bg-[#1E293B] text-[#94A3B8]';
}
