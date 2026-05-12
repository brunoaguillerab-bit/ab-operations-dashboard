'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Trash2, Sparkles, ChevronDown } from 'lucide-react';
import {
  DemandaStatus, DemandaPrioridade, DemandaTipo,
  STATUS_CONFIG, PRIORIDADE_CONFIG, NovaDemanda,
} from '@/types/demandas';
import { useDemandasStore } from '@/store/useDemandasStore';
import { TASK_TEMPLATES } from '@/data/taskTemplates';
import { mockClients } from '@/data/mockClients';

const TIPO_OPTIONS: { value: DemandaTipo; label: string }[] = [
  { value: 'criativo',   label: 'Criativo' },
  { value: 'campanha',   label: 'Campanha' },
  { value: 'relatorio',  label: 'Relatório' },
  { value: 'otimizacao', label: 'Otimização' },
  { value: 'reuniao',    label: 'Reunião' },
  { value: 'pixel',      label: 'Pixel' },
  { value: 'auditoria',  label: 'Auditoria' },
  { value: 'outro',      label: 'Outro' },
];

export default function TaskModal() {
  const { isModalOpen, editingId, closeModal, add, update, getById } = useDemandasStore();
  const isEditing = editingId !== null;
  const existing = isEditing ? getById(editingId!) : undefined;

  // Form state
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [clienteId, setClienteId] = useState('');
  const [clienteNome, setClienteNome] = useState('');
  const [responsavel, setResponsavel] = useState('Bruno');
  const [prioridade, setPrioridade] = useState<DemandaPrioridade>('media');
  const [status, setStatus] = useState<DemandaStatus>('aberta');
  const [tipo, setTipo] = useState<DemandaTipo>('outro');
  const [prazo, setPrazo] = useState('');
  const [tags, setTags] = useState('');
  const [checklistItems, setChecklistItems] = useState<string[]>(['']);
  const [templateOpen, setTemplateOpen] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Populate for edit mode
  useEffect(() => {
    if (isModalOpen && existing) {
      setTitulo(existing.titulo);
      setDescricao(existing.descricao);
      setClienteId(existing.clienteId);
      setClienteNome(existing.clienteNome);
      setResponsavel(existing.responsavel);
      setPrioridade(existing.prioridade);
      setStatus(existing.status);
      setTipo(existing.tipo);
      setPrazo(existing.prazo);
      setTags(existing.tags.join(', '));
      setChecklistItems(existing.checklist.map(c => c.texto).concat(['']));
    } else if (isModalOpen && !existing) {
      resetForm();
    }
  }, [isModalOpen, editingId]);

  const resetForm = () => {
    setTitulo(''); setDescricao(''); setClienteId(''); setClienteNome('');
    setResponsavel('Bruno'); setPrioridade('media'); setStatus('aberta');
    setTipo('outro'); setPrazo(''); setTags(''); setChecklistItems(['']); setErrors({});
  };

  const applyTemplate = (templateId: string) => {
    const tpl = TASK_TEMPLATES.find(t => t.id === templateId);
    if (!tpl) return;
    setTitulo(tpl.nome);
    setDescricao(tpl.descricao);
    setTipo(tpl.tipo);
    setPrioridade(tpl.prioridade);
    setTags(tpl.tags.join(', '));
    setChecklistItems([...tpl.checklistItems, '']);
    setTemplateOpen(false);
  };

  const handleClienteChange = (id: string) => {
    setClienteId(id);
    const client = mockClients.find(c => c.id === id);
    setClienteNome(client?.company ?? '');
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!titulo.trim()) errs.titulo = 'Título obrigatório';
    if (!clienteId) errs.cliente = 'Selecione um cliente';
    if (!prazo) errs.prazo = 'Prazo obrigatório';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    const parsedTags = tags.split(',').map(t => t.trim()).filter(Boolean);
    const validCheckItems = checklistItems.filter(i => i.trim());

    if (isEditing && existing) {
      update(existing.id, {
        titulo: titulo.trim(),
        descricao,
        clienteId,
        clienteNome,
        responsavel,
        prioridade,
        status,
        tipo,
        prazo,
        tags: parsedTags,
      }, 'edição completa');
      // Update checklist separately if changed
    } else {
      const nova: NovaDemanda = {
        titulo: titulo.trim(),
        descricao,
        clienteId,
        clienteNome,
        responsavel,
        prioridade,
        status,
        tipo,
        prazo,
        tags: parsedTags,
        checklist: validCheckItems,
        recorrencia: undefined,
      };
      add(nova);
    }

    closeModal();
    resetForm();
  };

  const updateCheckItem = (i: number, val: string) => {
    const next = [...checklistItems];
    next[i] = val;
    if (val && i === next.length - 1) next.push('');
    setChecklistItems(next);
  };

  const removeCheckItem = (i: number) => {
    setChecklistItems(checklistItems.filter((_, idx) => idx !== i));
  };

  return (
    <AnimatePresence>
      {isModalOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={e => e.stopPropagation()}
          >
            <div className="bg-[#0F1117] border border-[#2A2F3A] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
              {/* Header */}
              <div className="px-6 py-4 border-b border-[#2A2F3A] flex items-center justify-between flex-shrink-0">
                <h2 className="text-lg font-bold text-white">
                  {isEditing ? 'Editar Demanda' : 'Nova Demanda'}
                </h2>
                <div className="flex items-center gap-2">
                  {/* Template picker */}
                  {!isEditing && (
                    <div className="relative">
                      <button
                        onClick={() => setTemplateOpen(!templateOpen)}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#181C25] border border-[#2A2F3A] text-sm text-[#A1A1AA] hover:text-white hover:border-[#3A3F4A] transition"
                      >
                        <Sparkles size={13} />
                        Templates
                        <ChevronDown size={11} className={`transition-transform ${templateOpen ? 'rotate-180' : ''}`} />
                      </button>
                      <AnimatePresence>
                        {templateOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: -4, scale: 0.97 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -4, scale: 0.97 }}
                            className="absolute right-0 top-full mt-2 bg-[#181C25] border border-[#2A2F3A] rounded-xl shadow-xl z-50 w-64 overflow-hidden"
                          >
                            {TASK_TEMPLATES.map(tpl => (
                              <button
                                key={tpl.id}
                                onClick={() => applyTemplate(tpl.id)}
                                className="w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-white/5 transition border-b border-[#2A2F3A] last:border-0"
                              >
                                <span className="text-lg">{tpl.icone}</span>
                                <div>
                                  <p className="text-sm font-medium text-white">{tpl.nome}</p>
                                  <p className="text-xs text-[#A1A1AA] mt-0.5 line-clamp-1">{tpl.descricao}</p>
                                </div>
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                  <button onClick={closeModal} className="p-1.5 text-[#A1A1AA] hover:text-white hover:bg-white/5 rounded-lg transition">
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* Form */}
              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
                {/* Title */}
                <div>
                  <label className="block text-xs font-semibold text-[#A1A1AA] uppercase tracking-wide mb-1.5">
                    Título *
                  </label>
                  <input
                    type="text"
                    value={titulo}
                    onChange={e => { setTitulo(e.target.value); if (errors.titulo) setErrors(p => ({ ...p, titulo: '' })); }}
                    placeholder="Título da demanda..."
                    className={`w-full bg-[#181C25] border rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-[#A1A1AA] focus:outline-none focus:border-red-500/50 ${errors.titulo ? 'border-red-500/50' : 'border-[#2A2F3A]'}`}
                    autoFocus
                  />
                  {errors.titulo && <p className="text-xs text-red-400 mt-1">{errors.titulo}</p>}
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-semibold text-[#A1A1AA] uppercase tracking-wide mb-1.5">
                    Descrição
                  </label>
                  <textarea
                    value={descricao}
                    onChange={e => setDescricao(e.target.value)}
                    placeholder="Detalhes da demanda..."
                    rows={3}
                    className="w-full bg-[#181C25] border border-[#2A2F3A] rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-[#A1A1AA] focus:outline-none focus:border-red-500/50 resize-none"
                  />
                </div>

                {/* Row: Client + Responsible */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#A1A1AA] uppercase tracking-wide mb-1.5">
                      Cliente *
                    </label>
                    <select
                      value={clienteId}
                      onChange={e => { handleClienteChange(e.target.value); if (errors.cliente) setErrors(p => ({ ...p, cliente: '' })); }}
                      className={`w-full bg-[#181C25] border rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-red-500/50 ${errors.cliente ? 'border-red-500/50' : 'border-[#2A2F3A]'}`}
                    >
                      <option value="">Selecione...</option>
                      {mockClients.map(c => (
                        <option key={c.id} value={c.id}>{c.company}</option>
                      ))}
                    </select>
                    {errors.cliente && <p className="text-xs text-red-400 mt-1">{errors.cliente}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#A1A1AA] uppercase tracking-wide mb-1.5">
                      Responsável
                    </label>
                    <input
                      type="text"
                      value={responsavel}
                      onChange={e => setResponsavel(e.target.value)}
                      className="w-full bg-[#181C25] border border-[#2A2F3A] rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-[#A1A1AA] focus:outline-none focus:border-red-500/50"
                    />
                  </div>
                </div>

                {/* Row: Priority + Status + Type */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#A1A1AA] uppercase tracking-wide mb-1.5">Prioridade</label>
                    <select
                      value={prioridade}
                      onChange={e => setPrioridade(e.target.value as DemandaPrioridade)}
                      className="w-full bg-[#181C25] border border-[#2A2F3A] rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-red-500/50"
                    >
                      {(Object.keys(PRIORIDADE_CONFIG) as DemandaPrioridade[]).map(p => (
                        <option key={p} value={p}>{PRIORIDADE_CONFIG[p].label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#A1A1AA] uppercase tracking-wide mb-1.5">Status</label>
                    <select
                      value={status}
                      onChange={e => setStatus(e.target.value as DemandaStatus)}
                      className="w-full bg-[#181C25] border border-[#2A2F3A] rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-red-500/50"
                    >
                      {(Object.keys(STATUS_CONFIG) as DemandaStatus[]).filter(s => s !== 'arquivada').map(s => (
                        <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#A1A1AA] uppercase tracking-wide mb-1.5">Tipo</label>
                    <select
                      value={tipo}
                      onChange={e => setTipo(e.target.value as DemandaTipo)}
                      className="w-full bg-[#181C25] border border-[#2A2F3A] rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-red-500/50"
                    >
                      {TIPO_OPTIONS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                  </div>
                </div>

                {/* Row: Deadline + Tags */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#A1A1AA] uppercase tracking-wide mb-1.5">Prazo *</label>
                    <input
                      type="date"
                      value={prazo}
                      onChange={e => { setPrazo(e.target.value); if (errors.prazo) setErrors(p => ({ ...p, prazo: '' })); }}
                      className={`w-full bg-[#181C25] border rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-red-500/50 ${errors.prazo ? 'border-red-500/50' : 'border-[#2A2F3A]'}`}
                    />
                    {errors.prazo && <p className="text-xs text-red-400 mt-1">{errors.prazo}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#A1A1AA] uppercase tracking-wide mb-1.5">Tags</label>
                    <input
                      type="text"
                      value={tags}
                      onChange={e => setTags(e.target.value)}
                      placeholder="meta-ads, campanha..."
                      className="w-full bg-[#181C25] border border-[#2A2F3A] rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-[#A1A1AA] focus:outline-none focus:border-red-500/50"
                    />
                  </div>
                </div>

                {/* Checklist */}
                <div>
                  <label className="block text-xs font-semibold text-[#A1A1AA] uppercase tracking-wide mb-2">
                    Checklist
                  </label>
                  <div className="space-y-2">
                    {checklistItems.map((item, i) => (
                      <div key={i} className="flex gap-2">
                        <input
                          type="text"
                          value={item}
                          onChange={e => updateCheckItem(i, e.target.value)}
                          placeholder={i === checklistItems.length - 1 ? 'Adicionar item...' : `Item ${i + 1}`}
                          className="flex-1 bg-[#181C25] border border-[#2A2F3A] rounded-lg px-3 py-2 text-sm text-white placeholder:text-[#A1A1AA] focus:outline-none focus:border-red-500/50"
                        />
                        {i < checklistItems.length - 1 && (
                          <button
                            type="button"
                            onClick={() => removeCheckItem(i)}
                            className="p-2 text-[#A1A1AA] hover:text-red-400 hover:bg-red-500/10 rounded-lg transition"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-[#2A2F3A] flex items-center justify-end gap-3 flex-shrink-0">
                <button
                  onClick={closeModal}
                  className="px-5 py-2.5 rounded-xl bg-[#181C25] border border-[#2A2F3A] text-sm font-medium text-[#A1A1AA] hover:text-white hover:border-[#3A3F4A] transition"
                >
                  Cancelar
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSubmit}
                  className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-sm font-bold text-white transition shadow-lg shadow-red-500/20"
                >
                  {isEditing ? 'Salvar Alterações' : 'Criar Demanda'}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
