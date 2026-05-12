import { OperationalTask } from '@/types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { MoreHorizontal, Edit2, Trash2 } from 'lucide-react';
import { useDeleteTask, useUpdateTaskStatus } from '@/hooks/useTasks';
import { useTaskStore } from '@/store/useTaskStore';

const statusConfig: Record<string, { label: string; color: string; border: string; dot: string }> = {
  a_fazer: { label: 'A Fazer', color: 'bg-[#F59E0B]/10 text-[#F59E0B]', border: 'border-[#F59E0B]/20', dot: 'bg-[#F59E0B]' },
  em_andamento: { label: 'Em Andamento', color: 'bg-[#3B82F6]/10 text-[#3B82F6]', border: 'border-[#3B82F6]/20', dot: 'bg-[#3B82F6]' },
  aguardando_cliente: { label: 'Aguardando', color: 'bg-[#F97316]/10 text-[#F97316]', border: 'border-[#F97316]/20', dot: 'bg-[#F97316]' },
  feito: { label: 'Feito', color: 'bg-[#10B981]/10 text-[#10B981]', border: 'border-[#10B981]/20', dot: 'bg-[#10B981]' },
  urgente: { label: 'Urgente', color: 'bg-[#EF4444]/10 text-[#EF4444]', border: 'border-[#EF4444]/20', dot: 'bg-[#EF4444]' },
  pausado: { label: 'Pausado', color: 'bg-[#A1A1AA]/10 text-[#A1A1AA]', border: 'border-[#A1A1AA]/20', dot: 'bg-[#A1A1AA]' },
};

export default function TaskTable({ tasks }: { tasks: OperationalTask[] }) {
  const { setTaskModalOpen, setEditingTaskId } = useTaskStore();
  const deleteTask = useDeleteTask();

  const handleEdit = (id: string) => {
    setEditingTaskId(id);
    setTaskModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta demanda?')) {
      await deleteTask.mutateAsync(id);
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '—';
    return format(new Date(dateStr), 'dd/MM/yyyy', { locale: ptBR });
  };

  const formatCurrency = (val: number | null) => {
    if (val == null) return '—';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center glass-panel rounded-2xl border border-white/5">
        <p className="text-zinc-400 text-lg">Nenhuma demanda encontrada.</p>
        <p className="text-zinc-600 text-sm mt-2">Ajuste os filtros ou crie uma nova.</p>
      </div>
    );
  }

  return (
    <div className="glass-panel rounded-2xl border border-white/5 overflow-hidden">
      <div className="overflow-x-auto scrollbar-hide">
        <table className="w-full text-left border-collapse min-w-[1200px]">
          <thead>
            <tr className="border-b border-white/10 bg-white/[0.02]">
              <th className="p-4 text-xs font-bold uppercase tracking-wider text-zinc-500 whitespace-nowrap">Cliente</th>
              <th className="p-4 text-xs font-bold uppercase tracking-wider text-zinc-500 whitespace-nowrap">Mídia</th>
              <th className="p-4 text-xs font-bold uppercase tracking-wider text-zinc-500 whitespace-nowrap">Demanda</th>
              <th className="p-4 text-xs font-bold uppercase tracking-wider text-zinc-500 whitespace-nowrap">Status</th>
              <th className="p-4 text-xs font-bold uppercase tracking-wider text-zinc-500 whitespace-nowrap">Prazo</th>
              <th className="p-4 text-xs font-bold uppercase tracking-wider text-zinc-500 whitespace-nowrap">Responsável</th>
              <th className="p-4 text-xs font-bold uppercase tracking-wider text-zinc-500 whitespace-nowrap">Saldo Google</th>
              <th className="p-4 text-xs font-bold uppercase tracking-wider text-zinc-500 whitespace-nowrap">Saldo Meta</th>
              <th className="p-4 text-xs font-bold uppercase tracking-wider text-zinc-500 whitespace-nowrap text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {tasks.map(task => {
              const status = statusConfig[task.status || 'a_fazer'];
              
              return (
                <tr key={task.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="p-4">
                    <div className="font-semibold text-sm text-white">{task.clients?.name || 'Sem Cliente'}</div>
                    <div className="text-xs text-zinc-500">{task.clients?.company}</div>
                  </td>
                  <td className="p-4">
                    <span className="inline-flex px-2 py-1 rounded bg-white/5 border border-white/10 text-xs font-medium text-zinc-300">
                      {task.tipo_de_midia || '—'}
                    </span>
                  </td>
                  <td className="p-4 max-w-[300px]">
                    <div className="font-medium text-sm text-zinc-200 truncate" title={task.demanda}>{task.demanda}</div>
                    <div className="text-xs text-zinc-500 truncate mt-0.5">{task.descricao || 'Sem descrição'}</div>
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${status.color} ${status.border}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`}></span>
                      {status.label}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="font-mono text-xs text-zinc-400 bg-black/20 px-2 py-1 rounded w-fit">
                      {formatDate(task.prazo)}
                    </div>
                  </td>
                  <td className="p-4 text-sm text-zinc-300">
                    {task.responsavel || '—'}
                  </td>
                  <td className="p-4 text-sm font-semibold text-zinc-300">
                    {formatCurrency(task.clients?.saldo_google || 0)}
                  </td>
                  <td className="p-4 text-sm font-semibold text-zinc-300">
                    {formatCurrency(task.clients?.saldo_meta || 0)}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleEdit(task.id)} className="p-1.5 text-zinc-400 hover:text-white hover:bg-white/10 rounded transition">
                        <Edit2 size={14} />
                      </button>
                      <button onClick={() => handleDelete(task.id)} className="p-1.5 text-zinc-400 hover:text-red-500 hover:bg-red-500/10 rounded transition">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
