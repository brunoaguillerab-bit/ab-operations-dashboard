import { useState, useEffect } from 'react';
import { useTaskStore } from '@/store/useTaskStore';
import { useCreateTask, useUpdateTaskStatus, useTasks } from '@/hooks/useTasks'; // I would need full update task here, but simplifying for now
import { X, Save } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { OperationalTask } from '@/types';

export default function TaskModal() {
  const { isTaskModalOpen, setTaskModalOpen, editingTaskId, setEditingTaskId } = useTaskStore();
  const { data: tasks } = useTasks();
  const createTask = useCreateTask();

  const [formData, setFormData] = useState<Partial<OperationalTask>>({
    demanda: '',
    descricao: '',
    tipo_de_midia: 'Google Ads',
    status: 'a_fazer',
    prioridade: 'media',
    responsavel: '',
    prazo: ''
  });

  useEffect(() => {
    if (editingTaskId && tasks) {
      const task = tasks.find(t => t.id === editingTaskId);
      if (task) setFormData(task);
    } else {
      setFormData({
        demanda: '',
        descricao: '',
        tipo_de_midia: 'Google Ads',
        status: 'a_fazer',
        prioridade: 'media',
        responsavel: '',
        prazo: ''
      });
    }
  }, [editingTaskId, tasks, isTaskModalOpen]);

  if (!isTaskModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTaskId) {
      // In a full implementation, we'd have a useUpdateTask hook.
      await supabase.from('operational_tasks').update(formData as OperationalTask).eq('id', editingTaskId);
    } else {
      await createTask.mutateAsync(formData as OperationalTask);
    }
    setTaskModalOpen(false);
    setEditingTaskId(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#0F1117] border border-white/10 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        <div className="p-6 border-b border-white/5 flex justify-between items-center">
          <h2 className="text-xl font-bold">{editingTaskId ? 'Editar Demanda' : 'Nova Demanda'}</h2>
          <button 
            onClick={() => { setTaskModalOpen(false); setEditingTaskId(null); }}
            className="p-2 text-zinc-400 hover:text-white transition rounded-lg hover:bg-white/5"
          >
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5 overflow-y-auto max-h-[80vh]">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-zinc-400">Título da Demanda *</label>
            <input 
              required
              value={formData.demanda || ''}
              onChange={e => setFormData({ ...formData, demanda: e.target.value })}
              className="bg-[#181C25] border border-white/10 rounded-lg p-3 text-sm text-white outline-none focus:border-primary transition"
              placeholder="Ex: Subir campanha de Black Friday"
            />
          </div>

          <div className="grid grid-cols-2 gap-5">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-zinc-400">Tipo de Mídia</label>
              <select 
                value={formData.tipo_de_midia || ''}
                onChange={e => setFormData({ ...formData, tipo_de_midia: e.target.value })}
                className="bg-[#181C25] border border-white/10 rounded-lg p-3 text-sm text-white outline-none focus:border-primary transition"
              >
                <option value="Google Ads">Google Ads</option>
                <option value="Meta Ads">Meta Ads</option>
                <option value="Google + Meta">Google + Meta</option>
                <option value="Outros">Outros</option>
              </select>
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-zinc-400">Status</label>
              <select 
                value={formData.status || ''}
                onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                className="bg-[#181C25] border border-white/10 rounded-lg p-3 text-sm text-white outline-none focus:border-primary transition"
              >
                <option value="a_fazer">A Fazer</option>
                <option value="em_andamento">Em Andamento</option>
                <option value="aguardando_cliente">Aguardando Cliente</option>
                <option value="feito">Feito</option>
                <option value="urgente">Urgente</option>
                <option value="pausado">Pausado</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-5">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-zinc-400">Prazo</label>
              <input 
                type="date"
                value={formData.prazo || ''}
                onChange={e => setFormData({ ...formData, prazo: e.target.value })}
                className="bg-[#181C25] border border-white/10 rounded-lg p-3 text-sm text-white outline-none focus:border-primary transition"
              />
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-zinc-400">Responsável</label>
              <input 
                value={formData.responsavel || ''}
                onChange={e => setFormData({ ...formData, responsavel: e.target.value })}
                className="bg-[#181C25] border border-white/10 rounded-lg p-3 text-sm text-white outline-none focus:border-primary transition"
                placeholder="Ex: Bruno"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-zinc-400">Descrição / Observações</label>
            <textarea 
              value={formData.descricao || ''}
              onChange={e => setFormData({ ...formData, descricao: e.target.value })}
              className="bg-[#181C25] border border-white/10 rounded-lg p-3 text-sm text-white outline-none focus:border-primary transition min-h-[100px]"
              placeholder="Detalhes da demanda..."
            />
          </div>

          <div className="pt-4 mt-2 border-t border-white/5 flex justify-end gap-3">
            <button 
              type="button"
              onClick={() => { setTaskModalOpen(false); setEditingTaskId(null); }}
              className="px-5 py-2.5 rounded-lg text-sm font-semibold text-zinc-300 hover:bg-white/5 transition"
            >
              Cancelar
            </button>
            <button 
              type="submit"
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-white text-sm font-bold shadow-lg shadow-primary/20 hover:brightness-110 transition"
            >
              <Save size={16} />
              {editingTaskId ? 'Salvar Alterações' : 'Criar Demanda'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
