'use client';

import { useEffect, useMemo, useState } from 'react';
import {  BarChart3, Calendar, Kanban, LayoutList, Plus, Search, Table, Timer, X, Filter } from 'lucide-react';
import { ClienteCategoria, ClienteDemanda, DemandaClienteStatus, FiltrosPorColuna, SortState } from '@/types/demandasCentral';
import { DashboardFiltersPayload, listDemandasCentral, loadDemandasFilters, saveDemandasFilters, updateDemandaCentral } from '@/services/demandasCentralService';
import { canTransitionToStatus } from '@/data/statusRules';
import DemandaCreateWizardModal from '@/components/demandas/DemandaCreateWizardModal';
import { TableView } from './TableView';
import { KanbanView } from './KanbanView';
import { DashboardView } from './DashboardView';
import { TaskSidebar } from './TaskSidebar';

interface Props { data: ClienteDemanda[]; }
type TabKey = 'Todos' | ClienteCategoria;
type MainView = 'quadro' | 'kanban' | 'calendario' | 'timeline' | 'dashboard' | 'lista';
type ToastType = 'success' | 'error';
type ToastItem = { id: string; type: ToastType; message: string };
type ActivityItem = { id: string; text: string; at: string; user?: string };

const topViews: Array<{ id: MainView; label: string; icon: React.ElementType }> = [
  { id: 'quadro', label: 'Quadro Principal', icon: Table },
  { id: 'kanban', label: 'Kanban', icon: Kanban },
  { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
];

const toDate = (v: string) => (v ? new Date(v) : null);
const csvEscape = (v: string) => `"${String(v ?? '').replaceAll('"', '""')}"`;

const getUserKey = () => {
  if (typeof window === 'undefined') return 'server';
  const k = localStorage.getItem('ab_tracking_user_key');
  if (k) return k;
  const fresh = crypto.randomUUID();
  localStorage.setItem('ab_tracking_user_key', fresh);
  return fresh;
};

export default function DemandasCentral({ data }: Props) {
  const [rows, setRows] = useState<ClienteDemanda[]>(data);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabKey>('Todos');
  const [globalSearch, setGlobalSearch] = useState('');
  const [sort, setSort] = useState<SortState>({ column: 'nomeCliente', direction: 'asc' });
  const [view, setView] = useState<MainView>('quadro');
  const [openCreate, setOpenCreate] = useState(false);
  const [editRow, setEditRow] = useState<ClienteDemanda | null>(null);
  const [selectedTask, setSelectedTask] = useState<ClienteDemanda | null>(null);
  const [activities, setActivities] = useState<Record<string, ActivityItem[]>>({});
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [error, setError] = useState('');
  const [activeDragId, setActiveDragId] = useState<string | null>(null);

  const pushToast = (type: ToastType, message: string) => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3000);
  };

  const appendActivity = (taskId: string, text: string) => {
    const item: ActivityItem = { id: crypto.randomUUID(), text, at: new Date().toISOString(), user: 'Bruno' };
    setActivities((prev) => ({ ...prev, [taskId]: [item, ...(prev[taskId] || [])] }));
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [dbRows, saved] = await Promise.all([listDemandasCentral(), loadDemandasFilters(getUserKey())]);
        if (!mounted) return;
        if (dbRows.length > 0) setRows(dbRows);
        if (saved) {
          setActiveTab(saved.activeTab);
          setGlobalSearch(saved.globalSearch);
        }
      } catch {
        if (mounted) setError('Conexão instável. Usando dados locais.');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const filtered = useMemo(() => {
    let out = rows.filter((item) => {
      if (activeTab !== 'Todos' && item.categoria !== activeTab) return false;
      if (globalSearch.trim()) {
        const q = globalSearch.toLowerCase();
        const text = [item.nomeCliente, item.empresa, item.midia, item.status, item.tarefaDemanda, item.responsavel, item.tags.join(' ')].join(' ').toLowerCase();
        if (!text.includes(q)) return false;
      }
      return true;
    });

    if (sort.column) {
      out = [...out].sort((a, b) => {
        const valA = (a as any)[sort.column] || '';
        const valB = (b as any)[sort.column] || '';
        if (valA < valB) return sort.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sort.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return out;
  }, [rows, activeTab, globalSearch, sort]);

  const stats = useMemo(() => {
    const total = filtered.length;
    const pendentes = filtered.filter((r) => ['A fazer', 'Aguardando cliente', 'Aguardando pagamento'].includes(r.status)).length;
    const andamento = filtered.filter((r) => r.status === 'Em andamento').length;
    const concluidas = filtered.filter((r) => r.status === 'Feito').length;
    const atraso = filtered.filter((r) => toDate(r.prazoEntrega) && toDate(r.prazoEntrega)! < new Date() && r.status !== 'Feito').length;
    return { total, pendentes, andamento, concluidas, atraso };
  }, [filtered]);

  const persistPatch = async (id: string, patch: Partial<ClienteDemanda>) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
    if (selectedTask?.id === id) {
      setSelectedTask((prev) => prev ? { ...prev, ...patch } : null);
    }
    try {
      await updateDemandaCentral(id, patch);
    } catch {
      pushToast('error', 'Erro ao salvar alteração.');
    }
  };

  const updateStatus = async (row: ClienteDemanda, status: DemandaClienteStatus) => {
    const check = canTransitionToStatus(row, status);
    if (!check.ok) {
      pushToast('error', check.reason || 'Transição de status inválida.');
      return;
    }
    await persistPatch(row.id, { status });
    appendActivity(row.id, `Status alterado para ${status}`);
    pushToast('success', 'Status atualizado com sucesso.');
  };

  const handleReorderTable = (newOrder: ClienteDemanda[]) => {
    // Reorder logic for table view
    setRows((prev) => {
      const untouched = prev.filter(p => !newOrder.find(n => n.id === p.id));
      return [...newOrder, ...untouched];
    });
  };

  const handleDelete = (task: ClienteDemanda) => {
    setRows((prev) => prev.filter(r => r.id !== task.id));
    if (selectedTask?.id === task.id) {
      setSelectedTask(null);
    }
    pushToast('success', `"${task.nomeCliente}" foi deletado com sucesso.`);
    appendActivity(task.id, 'Tarefa deletada');
  };

  const exportCsv = () => {
    const keys: Array<keyof ClienteDemanda> = ['nomeCliente', 'empresa', 'categoria', 'midia', 'status', 'prazoEntrega', 'valorMensalidade', 'responsavel', 'prioridade', 'tarefaDemanda'];
    const header = keys.map((k) => csvEscape(String(k))).join(',');
    const lines = filtered.map((r) => keys.map((k) => csvEscape(Array.isArray(r[k]) ? (r[k] as string[]).join(' | ') : String(r[k] ?? ''))).join(','));
    const blob = new Blob([[header, ...lines].join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'demandas-export.csv';
    a.click();
    URL.revokeObjectURL(url);
    pushToast('success', 'CSV exportado com sucesso.');
  };

  if (loading) return (
    <div className="flex h-[400px] items-center justify-center">
      <div className="w-8 h-8 border-4 border-[#3B82F6] border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="flex flex-col flex-1 min-h-0 space-y-6 text-[#F3F4F6]">
      {/* Toast Notifications */}
      <div className="fixed right-4 bottom-4 z-[100] space-y-2 pointer-events-none">
        {toasts.map((t) => (
          <div key={t.id} className={`rounded-xl px-4 py-3 shadow-2xl backdrop-blur-md pointer-events-auto flex items-center gap-2 transform transition-all ${t.type === 'success' ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-200' : 'bg-red-500/20 border border-red-500/40 text-red-200'}`}>
            <span className="font-medium text-sm">{t.message}</span>
          </div>
        ))}
      </div>

      {/* Top Bar Navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-1 p-1 bg-[#050505] border border-white/5 rounded-xl w-fit">
          {topViews.map((v) => (
            <button 
              key={v.id} 
              onClick={() => setView(v.id)} 
              className={`px-4 py-2 text-[13px] font-medium rounded-lg inline-flex items-center gap-2 transition-all ${view === v.id ? 'bg-[#2A2A2A] text-white shadow-[0_0_10px_rgba(0,0,0,0.5)] border border-white/10' : 'text-[#A1A1AA] hover:text-[#F3F4F6] hover:bg-white/[0.04]'}`}
            >
              <v.icon size={16} />
              {v.label}
            </button>
          ))}
        </div>
        
        {/* Categoria Filters (Cards) */}
        <div className="flex items-center gap-2 flex-1 mx-2 overflow-x-auto no-scrollbar">
          {['Todos', 'Workana', 'AB Tracking', 'Pontuais'].map((cat) => {
            const isActive = activeTab === cat;
            const label = cat === 'Pontuais' ? 'Clientes Pontuais' : cat;
            return (
              <button
                key={cat}
                onClick={() => setActiveTab(cat as TabKey)}
                className={`
                  relative px-4 py-2 rounded-xl text-[13px] font-medium whitespace-nowrap border transition-all duration-200 overflow-hidden
                  ${isActive 
                    ? 'bg-[#141414] border-white/10 text-white shadow-xl' 
                    : 'bg-transparent border-transparent text-[#A1A1AA] hover:bg-white/5 hover:text-white'}
                `}
              >
                {label}
                {isActive && <div className="absolute bottom-0 left-0 h-[2px] w-full bg-[#EF4444]" />}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A1A1AA] group-focus-within:text-white transition-colors" />
            <input 
              value={globalSearch} 
              onChange={(e) => setGlobalSearch(e.target.value)} 
              placeholder="Buscar (Ctrl+K)" 
              className="w-[280px] rounded-xl bg-[#0A0A0A] border border-white/10 pl-10 pr-4 py-2 text-[13px] text-[#F3F4F6] focus:border-white/20 focus:ring-1 focus:ring-white/10 focus:outline-none transition-all placeholder:text-[#6B7280]" 
            />
          </div>
          <button className="p-2 rounded-xl bg-[#0A0A0A] border border-white/10 text-[#A1A1AA] hover:text-white hover:bg-white/5 transition-colors" title="Filtros avançados">
            <Filter size={16} />
          </button>
          <button onClick={() => setOpenCreate(true)} className="px-4 py-2 rounded-xl bg-[#EF4444] hover:bg-[#DC2626] text-[13px] font-semibold text-white inline-flex items-center gap-2 shadow-[0_0_15px_rgba(239,68,68,0.3)] transition-all active:scale-95">
            <Plus size={16} /> Nova Tarefa
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 min-h-0 flex flex-col">
        {view === 'quadro' && (
          <TableView
            items={filtered}
            onReorder={handleReorderTable}
            onOpenTask={setSelectedTask}
            onUpdateStatus={updateStatus}
            onEdit={setEditRow}
            onDelete={handleDelete}
            onUpdateTask={async (task, patch) => {
              await persistPatch(task.id, patch);
              const keyChanged = Object.keys(patch)[0];
              appendActivity(task.id, `${keyChanged} atualizado via tabela`);
            }}
            sortState={sort}
            onSort={(column) => {
              setSort(prev => ({
                column,
                direction: prev.column === column && prev.direction === 'asc' ? 'desc' : 'asc'
              }));
            }}
          />
        )}
        {view === 'kanban' && (
          <KanbanView
            items={filtered}
            onMoveTask={async (id, status) => {
              const task = rows.find(r => r.id === id);
              if (task) await updateStatus(task, status);
            }}
            onOpenTask={setSelectedTask}
            onEdit={setEditRow}
            activeDragId={activeDragId}
            setActiveDragId={setActiveDragId}
          />
        )}
        {view === 'dashboard' && (
          <DashboardView 
            items={filtered}
            stats={stats}
          />
        )}
      </div>

      {/* Modals and Sidebars */}
      {openCreate && (
        <DemandaCreateWizardModal 
          mode="create" 
          onClose={() => setOpenCreate(false)} 
          onSaved={(created) => { 
            setRows((prev) => [created, ...prev]); 
            setOpenCreate(false); 
            appendActivity(created.id, 'Tarefa criada'); 
            pushToast('success', 'Tarefa criada com sucesso!');
          }} 
          onToast={pushToast} 
        />
      )}

      {editRow && (
        <DemandaCreateWizardModal 
          mode="edit" 
          initialData={editRow} 
          onClose={() => setEditRow(null)} 
          onSaved={(updated) => { 
            setRows((prev) => prev.map((r) => r.id === updated.id ? updated : r)); 
            setEditRow(null); 
            appendActivity(updated.id, 'Tarefa atualizada'); 
            pushToast('success', 'Alterações salvas.');
          }} 
          onToast={pushToast} 
        />
      )}

      {selectedTask && (
        <TaskSidebar
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          activities={activities[selectedTask.id] || []}
          onUpdate={async (patch, label) => { 
            await persistPatch(selectedTask.id, patch); 
            appendActivity(selectedTask.id, label); 
          }}
        />
      )}
    </div>
  );
}