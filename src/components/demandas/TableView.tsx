'use client';

import { useState, useRef, useCallback } from 'react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, MessageSquare, Edit2, Trash2, Calendar, Columns, Check, ChevronUp, ChevronDown } from 'lucide-react';
import { ClienteDemanda, DemandaClienteStatus, SortState } from '@/types/demandasCentral';
import { StatusBadgeCentral } from './StatusBadgeCentral';
import { CategoriaBadgeCentral } from './CategoriaBadgeCentral';
import { UrgencyBar } from './UrgencyIndicator';
import { ResponsibleAvatar } from './ResponsibleAvatar';

const CURRENT_USER = 'Bruno';

interface TableViewProps {
  items: ClienteDemanda[];
  onReorder: (newOrder: ClienteDemanda[]) => void;
  onOpenTask: (task: ClienteDemanda) => void;
  onUpdateStatus: (task: ClienteDemanda, status: DemandaClienteStatus) => void;
  onEdit: (task: ClienteDemanda) => void;
  onDelete: (task: ClienteDemanda) => void;
  onUpdateTask?: (task: ClienteDemanda, patch: Partial<ClienteDemanda>) => void;
  sortState?: SortState;
  onSort?: (column: keyof ClienteDemanda) => void;
}

// ─── Editable cells (inalterados) ────────────────────────────────────────────

function EditableDateCell({ value, onSave, showIcon }: { value: string | undefined; onSave: (val: string) => void; showIcon?: boolean }) {
  const [isEditing, setIsEditing] = useState(false);
  const [val, setVal] = useState(value || '');

  const handleBlur = () => {
    setIsEditing(false);
    if (val !== (value || '')) onSave(val);
  };
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleBlur();
    if (e.key === 'Escape') { setVal(value || ''); setIsEditing(false); }
  };

  if (isEditing) {
    return (
      <input type="date" value={val} onChange={e => setVal(e.target.value)} onBlur={handleBlur} onKeyDown={handleKeyDown} autoFocus
        className="bg-[#0B1020] border border-white/10 text-white rounded px-2 py-1 text-sm w-[125px] outline-none focus:border-[#3B82F6]/50" />
    );
  }

  let colorClass = 'text-[#E2E8F0]';
  if (value) {
    const diffHours = (new Date().getTime() - new Date(value).getTime()) / (1000 * 60 * 60);
    if (diffHours > 48) colorClass = 'text-[#EF4444]';
    else if (diffHours >= -24 && diffHours <= 48) colorClass = 'text-[#10B981]';
  }

  return (
    <span onDoubleClick={() => setIsEditing(true)} className={`cursor-pointer font-medium hover:opacity-80 transition-opacity flex items-center gap-1.5 ${colorClass}`} title="Duplo clique para editar">
      {showIcon && value && <Calendar size={13} className="opacity-70" />}
      {value || '-'}
    </span>
  );
}

function EditableLinkIcon({ url, platform, onSave }: { url: string | undefined; platform: 'google' | 'meta'; onSave: (val: string) => void }) {
  const [isEditing, setIsEditing] = useState(false);
  const [val, setVal] = useState(url || '');
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const handleBlur = () => { setIsEditing(false); if (val !== (url || '')) onSave(val); };
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleBlur();
    if (e.key === 'Escape') { setVal(url || ''); setIsEditing(false); }
  };

  if (isEditing) {
    return <input type="url" value={val} onChange={e => setVal(e.target.value)} onBlur={handleBlur} onKeyDown={handleKeyDown} autoFocus
      placeholder={platform === 'google' ? 'Google Ads URL' : 'Meta Ads URL'}
      className="bg-[#0B1020] border border-white/10 text-white rounded px-2 py-1 text-xs w-[130px] outline-none focus:border-[#3B82F6]/50" />;
  }

  const GoogleLogo = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );

  const MetaLogo = () => (
    <svg width="15" height="15" viewBox="0 0 36 36" fill="none">
      <path d="M30.68 15.35c-3.15-2.45-6.84-2.86-9.5-1.07-1.55 1.04-2.9 2.92-3.8 4.41-.83-1.48-2.09-3.26-3.51-4.32-2.64-1.97-6.55-1.74-9.84.66-4.59 3.33-5.22 10.1-.81 13.9 3.14 2.68 6.91 3.1 9.61 1.35 1.57-1.01 2.9-2.85 3.73-4.33.82 1.48 2.07 3.25 3.5 4.33 2.65 1.99 6.55 1.76 9.87-.66 4.54-3.32 5.15-10.13.75-14.27zm-1.89 10.97c-2.15 1.58-4.66 1.45-6.24.27-.85-.63-1.66-1.74-2.58-3.41 1.02-1.78 2-3.19 2.98-3.88 1.58-1.12 3.94-1 6.07.56 2.88 2.11 2.45 5.09-.23 6.46zm-17.78-.17c-1.63 1.05-3.93.93-5.94-.52-2.9-2.11-2.45-6.31.25-8.29 2.13-1.57 4.63-1.42 6.2.29.84.62 1.63 1.7 2.52 3.32-1 1.71-1.97 3.09-2.92 3.82z" fill="#0668E1"/>
    </svg>
  );

  if (!url) {
    return (
      <button onClick={() => setIsEditing(true)}
        className={`w-7 h-7 flex items-center justify-center rounded-md bg-[#0B1020] border border-white/5 transition-colors ${platform === 'google' ? 'hover:bg-blue-500/10 hover:border-blue-500/30' : 'hover:bg-indigo-500/10 hover:border-indigo-500/30'}`}
        title={`Adicionar Link ${platform === 'google' ? 'Google' : 'Meta'} Ads`}>
        {platform === 'google' ? <GoogleLogo /> : <MetaLogo />}
      </button>
    );
  }

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (e.detail === 1) { timerRef.current = setTimeout(() => window.open(url, '_blank'), 250); }
    else if (e.detail === 2) { if (timerRef.current) clearTimeout(timerRef.current); setIsEditing(true); }
  };

  return (
    <button onClick={handleClick}
      className={`w-7 h-7 flex items-center justify-center rounded-md bg-[#0B1020] border border-white/5 transition-colors ${platform === 'google' ? 'hover:bg-blue-500/10 hover:border-blue-500/30' : 'hover:bg-indigo-500/10 hover:border-indigo-500/30'}`}
      title={`Abrir ${platform === 'google' ? 'Google' : 'Meta'} Ads (Duplo clique p/ editar)`}>
      {platform === 'google' ? <GoogleLogo /> : <MetaLogo />}
    </button>
  );
}

function EditableTextCell({ value, onSave, onClick, className }: { value: string; onSave: (val: string) => void; onClick?: () => void; className?: string }) {
  const [isEditing, setIsEditing] = useState(false);
  const [val, setVal] = useState(value);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const handleBlur = () => { setIsEditing(false); if (val !== value) onSave(val); };
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleBlur();
    if (e.key === 'Escape') { setVal(value); setIsEditing(false); }
  };

  if (isEditing) {
    return (
      <div className="absolute top-1/2 -translate-y-1/2 -left-2 z-[60] min-w-[calc(100%+16px)] w-64 max-w-[500px]">
        <input type="text" value={val} onChange={e => setVal(e.target.value)} onBlur={handleBlur} onKeyDown={handleKeyDown} autoFocus
          className="bg-[#050505] border border-[#3B82F6] text-white rounded-md px-3 py-1.5 text-sm outline-none w-full shadow-[0_8px_30px_rgba(0,0,0,0.5)]" />
      </div>
    );
  }

  const handleClick = (e: React.MouseEvent) => {
    if (e.detail === 1) { if (onClick) { timerRef.current = setTimeout(() => onClick(), 200); } }
    else if (e.detail === 2) { if (timerRef.current) clearTimeout(timerRef.current); setIsEditing(true); }
  };

  return (
    <span
      onClick={onClick ? handleClick : undefined}
      onDoubleClick={!onClick ? () => setIsEditing(true) : undefined}
      className={`cursor-pointer hover:opacity-80 transition-opacity block truncate ${className || 'w-full'}`}
      title={onClick ? 'Duplo clique para editar, 1 clique para abrir' : 'Duplo clique para editar'}
    >
      {value || '-'}
    </span>
  );
}

function EditableResponsibleCell({ value, onSave }: { value: string; onSave: (val: string) => void }) {
  const [isEditing, setIsEditing] = useState(false);
  const [val, setVal] = useState(value);

  const handleBlur = () => { setIsEditing(false); if (val !== value) onSave(val); };
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleBlur();
    if (e.key === 'Escape') { setVal(value); setIsEditing(false); }
  };

  if (isEditing) {
    return <input type="text" value={val} onChange={e => setVal(e.target.value)} onBlur={handleBlur} onKeyDown={handleKeyDown} autoFocus
      placeholder="Nome do Responsável"
      className="bg-[#0B1020] border border-white/10 text-white rounded px-2 py-1 text-sm w-[110px] outline-none focus:border-[#3B82F6]/50" />;
  }

  return (
    <div onClick={() => setIsEditing(true)} className="cursor-pointer hover:opacity-80 transition-opacity" title="Clique para editar">
      <ResponsibleAvatar name={value} currentUser={CURRENT_USER} />
    </div>
  );
}

// ─── Column config ────────────────────────────────────────────────────────────

const AVAILABLE_COLUMNS: { id: string; label: string; fixed?: boolean; field?: keyof ClienteDemanda }[] = [
  { id: 'cliente',         label: 'Cliente',          field: 'nomeCliente',       fixed: true },
  { id: 'empresa',         label: 'Empresa',           field: 'empresa',           fixed: true },
  { id: 'origem',          label: 'Origem',            field: 'categoria' },
  { id: 'links',           label: 'Links' },
  { id: 'tarefa',          label: 'Tarefa',            field: 'tarefaDemanda' },
  { id: 'responsavel',     label: 'Responsável',       field: 'responsavel' },
  { id: 'status',          label: 'Status',            field: 'status' },
  { id: 'prazo',           label: 'Prazo',             field: 'prazoEntrega' },
  { id: 'dataRelatorio',   label: 'Data Relatório',    field: 'dataRelatorio' },
  { id: 'dataOtimizacao',  label: 'Data Otimização',   field: 'dataOtimizacao' },
  { id: 'ultMensagem',     label: 'Últ. Mensagem',     field: 'ultimaMensagem' },
  { id: 'saldoGoogle',     label: 'Saldo Google Ads',  field: 'saldoContaGoogleAds' },
  { id: 'saldoMeta',       label: 'Saldo Meta Ads',    field: 'saldoContaMetaAds' },
];

// ─── Sortable Row ─────────────────────────────────────────────────────────────

interface SortableRowProps {
  row: ClienteDemanda;
  colWidths: Record<string, number>;
  visibleCols: string[];
  onOpenTask: (task: ClienteDemanda) => void;
  onUpdateStatus: (task: ClienteDemanda, status: DemandaClienteStatus) => void;
  onEdit: (task: ClienteDemanda) => void;
  onDelete: (task: ClienteDemanda) => void;
  onUpdateTask?: (task: ClienteDemanda, patch: Partial<ClienteDemanda>) => void;
}

function SortableRow({ row, colWidths, visibleCols, onOpenTask, onUpdateStatus, onEdit, onDelete, onUpdateTask }: SortableRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: row.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    position: 'relative',
    zIndex: isDragging ? 999 : undefined,
  };

  const getColWidth = (colId: string) => {
    if (colWidths[colId]) return colWidths[colId];
    if (colId === 'tarefa') return 350;
    if (colId === 'cliente') return 200;
    if (colId === 'links') return 100;
    if (colId === 'responsavel' || colId === 'saldoGoogle' || colId === 'saldoMeta') return 140;
    return 160;
  };

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={`group border-b border-white/5 transition-colors duration-200 cursor-default relative hover:z-[1] ${isDragging ? 'bg-[#1A2235] shadow-xl' : 'hover:bg-white/[0.02]'}`}
    >
      {/* Urgency bar */}
      <td className="p-0 w-[4px] overflow-visible">
        <UrgencyBar prazoEntrega={row.prazoEntrega} />
      </td>

      {/* Drag handle — vinculado aos listeners do dnd-kit */}
      <td className="px-3 py-3 text-center w-10">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-white/10 touch-none"
          title="Arrastar para reordenar"
        >
          <GripVertical size={16} className="text-[#94A3B8] hover:text-white" />
        </button>
      </td>

      {AVAILABLE_COLUMNS.map(col => {
        if (!visibleCols.includes(col.id)) return null;

        const w = getColWidth(col.id);
        let stickyClass = '';
        if (col.id === 'cliente') stickyClass = 'sticky left-0 bg-[#050505] group-hover:bg-[#0A0A0A] z-10 border-r border-white/5 transition-colors';

        switch (col.id) {
          case 'cliente':
            return (
              <td key={col.id} style={{ width: w, minWidth: w, maxWidth: w }} className={`px-4 py-3 border-r border-white/5 ${stickyClass}`}>
                <EditableTextCell value={row.nomeCliente} onSave={val => onUpdateTask?.(row, { nomeCliente: val })} className="text-white font-semibold tracking-wide" />
              </td>
            );
          case 'empresa':
            return (
              <td key={col.id} style={{ width: w, minWidth: w, maxWidth: w }} className="px-4 py-3 border-r border-white/5 relative group">
                <EditableTextCell value={row.empresa} onSave={val => onUpdateTask?.(row, { empresa: val })} className="text-[#E2E8F0]" />
              </td>
            );
          case 'origem':
            return (
              <td key={col.id} style={{ width: w, minWidth: w, maxWidth: w }} className="px-3 py-2.5 border-r border-white/5">
                <CategoriaBadgeCentral categoria={row.categoria} onChange={c => onUpdateTask?.(row, { categoria: c })} fullWidth />
              </td>
            );
          case 'links':
            return (
              <td key={col.id} style={{ width: w, minWidth: w, maxWidth: w }} className="px-4 py-3 border-r border-white/5">
                <div className="flex items-center gap-3">
                  <EditableLinkIcon url={row.urlGoogleAds} platform="google" onSave={val => onUpdateTask?.(row, { urlGoogleAds: val })} />
                  <EditableLinkIcon url={row.urlMetaAds} platform="meta" onSave={val => onUpdateTask?.(row, { urlMetaAds: val })} />
                </div>
              </td>
            );
          case 'tarefa':
            return (
              <td key={col.id} style={{ width: w, minWidth: w, maxWidth: w }} className="px-4 py-3 border-r border-white/5 transition-colors relative group">
                <div className="flex items-center gap-3">
                  <EditableTextCell value={row.tarefaDemanda || row.nomeCliente} onSave={val => onUpdateTask?.(row, { tarefaDemanda: val })} onClick={() => onOpenTask(row)} className="font-medium text-[#F3F4F6] flex-1 truncate" />
                  <button onClick={() => onOpenTask(row)} className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-white/10 rounded-md text-[#94A3B8] hover:text-white transition-all flex-shrink-0"><MessageSquare size={14} /></button>
                </div>
              </td>
            );
          case 'responsavel':
            return (
              <td key={col.id} style={{ width: w, minWidth: w, maxWidth: w }} className="px-4 py-3 border-r border-white/5 relative group">
                <EditableResponsibleCell value={row.responsavel} onSave={val => onUpdateTask?.(row, { responsavel: val })} />
              </td>
            );
          case 'status':
            return <td key={col.id} style={{ width: w, minWidth: w, maxWidth: w }} className="px-3 py-2.5 border-r border-white/5 relative"><StatusBadgeCentral status={row.status} onChange={s => onUpdateStatus(row, s)} fullWidth /></td>;
          case 'prazo':
            return <td key={col.id} style={{ width: w, minWidth: w, maxWidth: w }} className="px-4 py-3 border-r border-white/5 relative group"><EditableDateCell value={row.prazoEntrega} onSave={val => onUpdateTask?.(row, { prazoEntrega: val })} showIcon /></td>;
          case 'dataRelatorio':
            return <td key={col.id} style={{ width: w, minWidth: w, maxWidth: w }} className="px-4 py-3 border-r border-white/5 relative group"><EditableDateCell value={row.dataRelatorio} onSave={val => onUpdateTask?.(row, { dataRelatorio: val })} /></td>;
          case 'dataOtimizacao':
            return <td key={col.id} style={{ width: w, minWidth: w, maxWidth: w }} className="px-4 py-3 border-r border-white/5 relative group"><EditableDateCell value={row.dataOtimizacao} onSave={val => onUpdateTask?.(row, { dataOtimizacao: val })} /></td>;
          case 'ultMensagem':
            return <td key={col.id} style={{ width: w, minWidth: w, maxWidth: w }} className="px-4 py-3 border-r border-white/5 relative group"><EditableDateCell value={row.ultimaMensagem} onSave={val => onUpdateTask?.(row, { ultimaMensagem: val })} /></td>;
          case 'saldoGoogle':
            return <td key={col.id} style={{ width: w, minWidth: w, maxWidth: w }} className="px-4 py-3 border-r border-white/5 text-[#E2E8F0] relative">{row.saldoContaGoogleAds ? `R$ ${row.saldoContaGoogleAds.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '-'}</td>;
          case 'saldoMeta':
            return <td key={col.id} style={{ width: w, minWidth: w, maxWidth: w }} className="px-4 py-3 border-r border-white/5 text-[#E2E8F0] relative">{row.saldoContaMetaAds ? `R$ ${row.saldoContaMetaAds.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '-'}</td>;
          default:
            return null;
        }
      })}

      {/* Actions */}
      <td className="px-4 py-3 text-right sticky right-0 bg-[#050505] group-hover:bg-white/[0.02] z-10 transition-colors shadow-[-10px_0_15px_-5px_rgba(0,0,0,0.3)] border-l border-white/5">
        <div className="flex items-center justify-end gap-1">
          <button onClick={() => onEdit(row)} className="p-1.5 text-[#A1A1AA] hover:text-[#3B82F6] hover:bg-[#3B82F6]/10 rounded-md transition-colors" title="Editar">
            <Edit2 size={16} />
          </button>
          <button onClick={() => onDelete(row)} className="p-1.5 text-[#A1A1AA] hover:text-[#EF4444] hover:bg-[#EF4444]/10 rounded-md transition-colors" title="Deletar">
            <Trash2 size={16} />
          </button>
        </div>
      </td>
    </tr>
  );
}

// ─── Main TableView ───────────────────────────────────────────────────────────

export function TableView({ items, onReorder, onOpenTask, onUpdateStatus, onEdit, onDelete, onUpdateTask, sortState, onSort }: TableViewProps) {
  const [visibleCols, setVisibleCols] = useState<string[]>(AVAILABLE_COLUMNS.map(c => c.id));
  const [showColMenu, setShowColMenu] = useState(false);
  const [colWidths, setColWidths] = useState<Record<string, number>>({});
  const [activeDragId, setActiveDragId] = useState<string | null>(null);

  // ─── dnd-kit sensors: activa drag apenas após 5px de movimento ───
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveDragId(String(event.active.id));
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    setActiveDragId(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = items.findIndex(r => r.id === active.id);
    const newIndex = items.findIndex(r => r.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const newOrder = arrayMove(items, oldIndex, newIndex);
    onReorder(newOrder);
  }, [items, onReorder]);

  const handleResizeStart = (e: React.MouseEvent, colId: string, currentWidth: number) => {
    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX;
    const handleMouseMove = (me: MouseEvent) => {
      setColWidths(prev => ({ ...prev, [colId]: Math.max(80, currentWidth + (me.clientX - startX)) }));
    };
    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const toggleCol = (id: string) => {
    if (AVAILABLE_COLUMNS.find(c => c.id === id)?.fixed) return;
    setVisibleCols(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]);
  };

  const activeRow = activeDragId ? items.find(r => r.id === activeDragId) : null;

  const getColWidth = (colId: string) => {
    if (colWidths[colId]) return colWidths[colId];
    if (colId === 'tarefa') return 350;
    if (colId === 'cliente') return 200;
    if (colId === 'links') return 100;
    if (colId === 'responsavel' || colId === 'saldoGoogle' || colId === 'saldoMeta') return 140;
    return 160;
  };

  return (
    <div className="rounded-2xl border border-white/5 overflow-hidden bg-[#0A0A0A] shadow-[0_8px_30px_rgba(0,0,0,0.5)] flex flex-col">
      {/* Toolbar */}
      <div className="bg-[#050505] border-b border-white/5 px-4 py-2 flex justify-end">
        <div className="relative">
          <button onClick={() => setShowColMenu(!showColMenu)} className="flex items-center gap-2 text-sm text-[#94A3B8] hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/5 transition-colors">
            <Columns size={16} /> Colunas
          </button>
          {showColMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowColMenu(false)} />
              <div className="absolute right-0 top-full mt-2 w-64 bg-[#1A2235] border border-white/10 rounded-xl shadow-2xl z-50 p-2 py-3 max-h-[300px] overflow-y-auto">
                <p className="text-xs font-semibold text-[#94A3B8] px-3 mb-2">Mostrar/Ocultar Colunas</p>
                {AVAILABLE_COLUMNS.map(col => (
                  <button key={col.id} onClick={() => toggleCol(col.id)} disabled={col.fixed}
                    className={`w-full flex items-center gap-3 px-3 py-2 text-sm text-left rounded-lg transition-colors ${col.fixed ? 'opacity-50 cursor-not-allowed text-[#94A3B8]' : 'hover:bg-white/5 text-[#E2E8F0]'}`}>
                    <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${visibleCols.includes(col.id) ? 'bg-[#EF4444] border-[#EF4444]' : 'border-white/20 bg-transparent'}`}>
                      {visibleCols.includes(col.id) && <Check size={12} className="text-white" />}
                    </div>
                    {col.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="flex-1 min-h-[200px] overflow-auto">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}

          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <table className="w-full text-sm min-w-max">
            <thead className="bg-[#0A0A0A] border-b border-white/5 select-none sticky top-0 z-20">
              <tr>
                <th className="p-0 w-[4px]" />
                <th className="w-10 px-3 py-3" />
                {AVAILABLE_COLUMNS.map(col => {
                  if (!visibleCols.includes(col.id)) return null;
                  const w = getColWidth(col.id);
                  let stickyClass = '';
                  if (col.id === 'cliente') stickyClass = 'sticky left-0 bg-[#0A0A0A] z-10';
                  const isSorted = sortState?.column === col.field;
                  return (
                    <th key={col.id} style={{ width: w, minWidth: w, maxWidth: w }}
                      className={`relative px-4 py-3 text-left text-[#94A3B8] font-medium overflow-hidden ${stickyClass} ${col.field ? 'cursor-pointer hover:bg-white/5 transition-colors group/th select-none' : ''}`}
                      onClick={e => { if ((e.target as HTMLElement).classList.contains('resizer')) return; col.field && onSort?.(col.field); }}
                    >
                      <div className={`flex items-center gap-1.5 ${col.id === 'status' ? 'justify-center' : ''} truncate`}>
                        {col.label}
                        {col.field && (
                          <div className={`flex flex-col opacity-0 group-hover/th:opacity-50 transition-opacity ${isSorted ? '!opacity-100' : ''}`}>
                            <ChevronUp size={10} className={isSorted && sortState?.direction === 'asc' ? 'text-[#EF4444]' : 'text-[#64748B]'} strokeWidth={3} />
                            <ChevronDown size={10} className={`-mt-1 ${isSorted && sortState?.direction === 'desc' ? 'text-[#EF4444]' : 'text-[#64748B]'}`} strokeWidth={3} />
                          </div>
                        )}
                      </div>
                      <div className="resizer absolute right-0 top-0 bottom-0 w-1.5 cursor-col-resize hover:bg-[#EF4444] z-20"
                        onMouseDown={e => handleResizeStart(e, col.id, w)} />
                    </th>
                  );
                })}
                <th className="px-4 py-3 text-right text-[#94A3B8] font-medium sticky right-0 bg-[#0A0A0A] z-10 shadow-[-10px_0_15px_-5px_rgba(0,0,0,0.2)]">Ações</th>
              </tr>
            </thead>

            <SortableContext items={items.map(r => r.id)} strategy={verticalListSortingStrategy}>
              <tbody className="bg-[#050505]">
                {items.map(r => (
                  <SortableRow
                    key={r.id}
                    row={r}
                    colWidths={colWidths}
                    visibleCols={visibleCols}
                    onOpenTask={onOpenTask}
                    onUpdateStatus={onUpdateStatus}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onUpdateTask={onUpdateTask}
                  />
                ))}
                {items.length === 0 && (
                  <tr>
                    <td colSpan={AVAILABLE_COLUMNS.length + 3} className="px-6 py-12 text-center text-[#94A3B8]">
                      Nenhuma tarefa encontrada para esta visualização.
                    </td>
                  </tr>
                )}
              </tbody>
            </SortableContext>
          </table>

          {/* DragOverlay: fantasma simples da linha arrastada */}
          <DragOverlay dropAnimation={null}>
            {activeRow ? (
              <div className="rounded-lg border border-white/20 bg-[#1A2235] shadow-2xl px-4 py-3 flex items-center gap-3 text-sm text-white opacity-90 min-w-[300px]">
                <GripVertical size={16} className="text-[#94A3B8]" />
                <span className="font-semibold truncate">{activeRow.nomeCliente}</span>
                <span className="text-[#94A3B8] truncate">{activeRow.tarefaDemanda}</span>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
}
