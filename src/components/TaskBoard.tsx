import { OperationalTask, TaskStatus } from '@/types';
import { useUpdateTaskStatus } from '@/hooks/useTasks';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const columns: { id: TaskStatus; title: string; color: string }[] = [
  { id: 'a_fazer', title: 'A Fazer', color: 'border-[#F59E0B]' },
  { id: 'em_andamento', title: 'Em Andamento', color: 'border-[#3B82F6]' },
  { id: 'urgente', title: 'Urgente', color: 'border-[#EF4444]' },
  { id: 'aguardando_cliente', title: 'Aguardando', color: 'border-[#F97316]' },
  { id: 'feito', title: 'Feito', color: 'border-[#10B981]' },
];

export default function TaskBoard({ tasks }: { tasks: OperationalTask[] }) {
  const updateStatus = useUpdateTaskStatus();

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('taskId', id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('taskId');
    if (id) {
      await updateStatus.mutateAsync({ id, status });
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '';
    return format(new Date(dateStr), 'dd/MM', { locale: ptBR });
  };

  return (
    <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
      {columns.map(col => {
        const colTasks = tasks.filter(t => t.status === col.id);
        
        return (
          <div 
            key={col.id} 
            className="flex-shrink-0 w-[300px] flex flex-col bg-black/20 rounded-2xl border border-white/5 p-4"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, col.id)}
          >
            <div className={`flex items-center justify-between mb-4 pb-2 border-b-2 ${col.color}/50`}>
              <h3 className="font-bold text-sm text-white uppercase tracking-wider">{col.title}</h3>
              <span className="text-xs bg-black/40 px-2 py-0.5 rounded text-zinc-400 font-semibold">{colTasks.length}</span>
            </div>
            
            <div className="flex flex-col gap-3 flex-1 min-h-[150px]">
              {colTasks.map(task => (
                <div 
                  key={task.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, task.id)}
                  className="bg-[#181C25] border border-white/10 rounded-xl p-4 shadow-sm hover:border-primary/50 hover:shadow-md hover:-translate-y-0.5 transition-all cursor-grab active:cursor-grabbing"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-semibold text-zinc-400 bg-white/5 px-2 py-0.5 rounded">
                      {task.tipo_de_midia || 'Mídia'}
                    </span>
                    {task.prazo && (
                      <span className="text-[10px] font-mono text-zinc-500 flex items-center gap-1">
                        {formatDate(task.prazo)}
                      </span>
                    )}
                  </div>
                  <h4 className="font-semibold text-sm text-zinc-200 mb-1 leading-snug">{task.demanda}</h4>
                  <p className="text-xs text-zinc-500 mb-3 truncate">{task.clients?.name}</p>
                  
                  <div className="flex items-center justify-between mt-auto pt-3 border-t border-white/5">
                    <div className="text-[10px] font-medium text-zinc-500">
                      {task.responsavel || 'Não atriuído'}
                    </div>
                  </div>
                </div>
              ))}
              
              {colTasks.length === 0 && (
                <div className="flex-1 flex items-center justify-center border-2 border-dashed border-white/5 rounded-xl">
                  <span className="text-xs text-zinc-600 font-medium">Arraste para cá</span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
