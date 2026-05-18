'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Edit3, Check, Plus, Trash2, Send, Clock,
  Calendar, User, ChevronDown, Archive,
  CheckSquare, Square, MessageSquare, History, Copy,
  FileText, AlertCircle,
} from 'lucide-react';
import {
  Demanda, STATUS_CONFIG, PRIORIDADE_CONFIG,
  DemandaStatus, DemandaPrioridade,
} from '@/types/demandas';
import StatusBadge, { STATUS_ICONS } from './StatusBadge';
import { useDemandasStore } from '@/store/useDemandasStore';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const TAB_ITEMS = [
  { id: 'checklist', label: 'Checklist', icon: CheckSquare },
  { id: 'comentarios', label: 'Comentários', icon: MessageSquare },
  { id: 'historico', label: 'Histórico', icon: History },
] as const;

type DrawerTab = typeof TAB_ITEMS[number]['id'];

// Função para retornar o ícone e cor baseado no tipo de histórico
function getHistoricoIcon(tipo: string) {
  const iconMap: Record<string, { Icon: any; color: string; bgColor: string }> = {
    criacao: { Icon: FileText, color: 'text-emerald-400', bgColor: 'bg-emerald-500/10' },
    edicao: { Icon: Edit3, color: 'text-blue-400', bgColor: 'bg-blue-500/10' },
    status: { Icon: AlertCircle, color: 'text-amber-400', bgColor: 'bg-amber-500/10' },
    comentario: { Icon: MessageSquare, color: 'text-purple-400', bgColor: 'bg-purple-500/10' },
    checklist: { Icon: CheckSquare, color: 'text-cyan-400', bgColor: 'bg-cyan-500/10' },
    checklist_deletado: { Icon: Trash2, color: 'text-red-400', bgColor: 'bg-red-500/10' },
    arquivo: { Icon: Archive, color: 'text-zinc-400', bgColor: 'bg-zinc-500/10' },
  };
  return iconMap[tipo] || { Icon: FileText, color: 'text-[#A1A1AA]', bgColor: 'bg-[#2A2F3A]' };
}

export default function TaskDrawer() {
  const {
    selectedId, isDrawerOpen, closeDrawer,
    getById, update, updateStatus, updatePrioridade, archive, restore, duplicate,
    addChecklistItem, toggleChecklistItem, deleteChecklistItem,
    addComment, deleteComment,
    openModal,
  } = useDemandasStore();

  const demanda = selectedId ? getById(selectedId) : undefined;
  const [tab, setTab] = useState<DrawerTab>('checklist');
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState('');
  const [editingDesc, setEditingDesc] = useState(false);
  const [descDraft, setDescDraft] = useState('');
  const [newCheckItem, setNewCheckItem] = useState('');
  const [commentDraft, setCommentDraft] = useState('');
  const titleRef = useRef<HTMLInputElement>(null);
  const commentRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (demanda) {
      setTitleDraft(demanda.titulo);
      setDescDraft(demanda.descricao);
    }
  }, [demanda?.id]);

  useEffect(() => {
    if (editingTitle && titleRef.current) titleRef.current.focus();
  }, [editingTitle]);

  if (!isDrawerOpen || !demanda) return null;

  const sc = STATUS_CONFIG[demanda.status];
  const pc = PRIORIDADE_CONFIG[demanda.prioridade];
  const isOverdue = new Date(demanda.prazo) < new Date() && demanda.status !== 'concluida';
  const checkDone = demanda.checklist.filter(c => c.concluido).length;
  const checkTotal = demanda.checklist.length;
  const checkPct = checkTotal > 0 ? Math.round((checkDone / checkTotal) * 100) : 0;

  const saveTitle = () => {
    if (titleDraft.trim() && titleDraft !== demanda.titulo) {
      update(demanda.id, { titulo: titleDraft.trim() }, 'titulo');
    }
    setEditingTitle(false);
  };

  const saveDesc = () => {
    update(demanda.id, { descricao: descDraft }, 'descricao');
    setEditingDesc(false);
  };

  const submitComment = () => {
    if (!commentDraft.trim()) return;
    addComment(demanda.id, commentDraft.trim());
    setCommentDraft('');
  };

  const addItem = () => {
    if (!newCheckItem.trim()) return;
    addChecklistItem(demanda.id, newCheckItem.trim());
    setNewCheckItem('');
  };

  return (
    <AnimatePresence>
      {isDrawerOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeDrawer}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className="fixed right-0 top-0 h-screen w-full max-w-xl bg-[#0F1117] border-l border-[#2A2F3A] z-50 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-[#2A2F3A] flex items-center gap-3 flex-shrink-0">
              {/* Status badge */}
              <StatusBadge status={demanda.status} size="md" />

              <div className="flex-1" />

              {/* Actions */}
              <button onClick={() => { duplicate(demanda.id); }} className="p-1.5 text-[#A1A1AA] hover:text-white hover:bg-white/5 rounded-lg transition" title="Duplicar">
                <Copy size={15} />
              </button>
              <button onClick={() => { openModal(demanda.id); closeDrawer(); }} className="p-1.5 text-[#A1A1AA] hover:text-white hover:bg-white/5 rounded-lg transition" title="Editar">
                <Edit3 size={15} />
              </button>
              <button
                onClick={() => demanda.arquivada ? restore(demanda.id) : archive(demanda.id)}
                className="p-1.5 text-[#A1A1AA] hover:text-white hover:bg-white/5 rounded-lg transition"
                title={demanda.arquivada ? 'Restaurar' : 'Arquivar'}
              >
                <Archive size={15} />
              </button>
              <button onClick={closeDrawer} className="p-1.5 text-[#A1A1AA] hover:text-white hover:bg-white/5 rounded-lg transition">
                <X size={16} />
              </button>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto">
              <div className="px-6 py-5 space-y-5">
                {/* Title */}
                <div>
                  {editingTitle ? (
                    <div className="flex gap-2">
                      <input
                        ref={titleRef}
                        value={titleDraft}
                        onChange={e => setTitleDraft(e.target.value)}
                        onBlur={saveTitle}
                        onKeyDown={e => { if (e.key === 'Enter') saveTitle(); if (e.key === 'Escape') setEditingTitle(false); }}
                        className="flex-1 bg-[#181C25] border border-red-500/40 rounded-lg px-3 py-2 text-white font-bold text-lg focus:outline-none"
                      />
                      <button onClick={saveTitle} className="p-2 text-emerald-400 hover:bg-emerald-500/10 rounded-lg">
                        <Check size={16} />
                      </button>
                    </div>
                  ) : (
                    <h2
                      onClick={() => setEditingTitle(true)}
                      className="text-xl font-bold text-white cursor-text hover:bg-white/5 rounded-lg px-2 py-1 -mx-2 -my-1 transition group flex items-start gap-2"
                    >
                      {demanda.titulo}
                      <Edit3 size={13} className="text-[#A1A1AA] opacity-0 group-hover:opacity-100 mt-1.5 flex-shrink-0" />
                    </h2>
                  )}
                </div>

                {/* Meta fields grid */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Status */}
                  <div>
                    <p className="text-[10px] font-semibold text-[#A1A1AA] uppercase tracking-wide mb-1.5">Status</p>
                    <div className={`flex items-center gap-0 bg-[#181C25] border border-[#2A2F3A] rounded-lg overflow-hidden focus-within:border-red-500/50 transition`}>
                      {(() => {
                        const Icon = STATUS_ICONS[demanda.status];
                        return (
                          <div className={`w-9 h-full flex items-center justify-center flex-shrink-0 ${sc.bg} border-r border-[#2A2F3A]`}>
                            <Icon size={13} className={sc.color} />
                          </div>
                        );
                      })()}
                      <select
                        value={demanda.status}
                        onChange={e => updateStatus(demanda.id, e.target.value as DemandaStatus)}
                        className={`flex-1 bg-transparent px-2 py-2 text-sm font-medium focus:outline-none ${sc.color}`}
                      >
                        {(Object.keys(STATUS_CONFIG) as DemandaStatus[]).map(s => (
                          <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Priority */}
                  <div>
                    <p className="text-[10px] font-semibold text-[#A1A1AA] uppercase tracking-wide mb-1.5">Prioridade</p>
                    <select
                      value={demanda.prioridade}
                      onChange={e => updatePrioridade(demanda.id, e.target.value as DemandaPrioridade)}
                      className={`w-full bg-[#181C25] border border-[#2A2F3A] rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus:border-red-500/50 ${pc.color}`}
                    >
                      {(Object.keys(PRIORIDADE_CONFIG) as DemandaPrioridade[]).map(p => (
                        <option key={p} value={p}>{PRIORIDADE_CONFIG[p].label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Client */}
                  <div>
                    <p className="text-[10px] font-semibold text-[#A1A1AA] uppercase tracking-wide mb-1.5">Cliente</p>
                    <div className="flex items-center gap-2 bg-[#181C25] border border-[#2A2F3A] rounded-lg px-3 py-2">
                      <User size={13} className="text-[#A1A1AA]" />
                      <span className="text-sm text-white">{demanda.clienteNome}</span>
                    </div>
                  </div>

                  {/* Responsible */}
                  <div>
                    <p className="text-[10px] font-semibold text-[#A1A1AA] uppercase tracking-wide mb-1.5">Responsável</p>
                    <div className="flex items-center gap-2 bg-[#181C25] border border-[#2A2F3A] rounded-lg px-3 py-2">
                      <div className="w-5 h-5 rounded-full bg-red-600 flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0">
                        {demanda.responsavel.slice(0, 2).toUpperCase()}
                      </div>
                      <span className="text-sm text-white">{demanda.responsavel}</span>
                    </div>
                  </div>

                  {/* Deadline */}
                  <div>
                    <p className="text-[10px] font-semibold text-[#A1A1AA] uppercase tracking-wide mb-1.5">Prazo</p>
                    <div className={`flex items-center gap-2 bg-[#181C25] border rounded-lg px-3 py-2 ${isOverdue ? 'border-red-500/40' : 'border-[#2A2F3A]'}`}>
                      <Calendar size={13} className={isOverdue ? 'text-red-400' : 'text-[#A1A1AA]'} />
                      <input
                        type="date"
                        value={demanda.prazo}
                        onChange={e => update(demanda.id, { prazo: e.target.value }, 'prazo')}
                        className={`bg-transparent text-sm focus:outline-none ${isOverdue ? 'text-red-400' : 'text-white'}`}
                      />
                    </div>
                  </div>

                  {/* Dates */}
                  <div>
                    <p className="text-[10px] font-semibold text-[#A1A1AA] uppercase tracking-wide mb-1.5">Criada em</p>
                    <div className="flex items-center gap-2 bg-[#181C25] border border-[#2A2F3A] rounded-lg px-3 py-2">
                      <Clock size={13} className="text-[#A1A1AA]" />
                      <span className="text-sm text-[#A1A1AA]">
                        {format(new Date(demanda.criadaEm), "dd/MM/yy 'às' HH:mm", { locale: ptBR })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Tags */}
                {demanda.tags.length > 0 && (
                  <div>
                    <p className="text-[10px] font-semibold text-[#A1A1AA] uppercase tracking-wide mb-2">Tags</p>
                    <div className="flex flex-wrap gap-1.5">
                      {demanda.tags.map(tag => (
                        <span key={tag} className="text-xs px-2.5 py-1 rounded-full bg-white/5 text-[#A1A1AA] border border-[#2A2F3A]">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Description */}
                <div>
                  <p className="text-[10px] font-semibold text-[#A1A1AA] uppercase tracking-wide mb-2">Descrição</p>
                  {editingDesc ? (
                    <div className="space-y-2">
                      <textarea
                        value={descDraft}
                        onChange={e => setDescDraft(e.target.value)}
                        rows={5}
                        className="w-full bg-[#181C25] border border-red-500/40 rounded-lg px-3 py-2 text-sm text-white focus:outline-none resize-none"
                        autoFocus
                      />
                      <div className="flex gap-2">
                        <button onClick={saveDesc} className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold">
                          Salvar
                        </button>
                        <button onClick={() => setEditingDesc(false)} className="px-3 py-1.5 rounded-lg bg-[#2A2F3A] text-[#A1A1AA] text-xs">
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={() => { setDescDraft(demanda.descricao); setEditingDesc(true); }}
                      className="text-sm text-[#A1A1AA] bg-[#181C25] border border-[#2A2F3A] rounded-lg px-3 py-2.5 cursor-text hover:border-[#3A3F4A] transition min-h-[60px] whitespace-pre-wrap"
                    >
                      {demanda.descricao || <span className="italic text-[#555]">Clique para adicionar descrição...</span>}
                    </div>
                  )}
                </div>

                {/* Checklist progress bar */}
                {checkTotal > 0 && (
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="text-[#A1A1AA]">Progresso</span>
                      <span className={checkPct === 100 ? 'text-emerald-400 font-semibold' : 'text-[#A1A1AA]'}>
                        {checkDone}/{checkTotal} ({checkPct}%)
                      </span>
                    </div>
                    <div className="h-1.5 bg-[#2A2F3A] rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${checkPct}%` }}
                        className={`h-full rounded-full ${checkPct === 100 ? 'bg-emerald-500' : 'bg-red-500'}`}
                      />
                    </div>
                  </div>
                )}

                {/* Tabs */}
                <div>
                  <div className="flex gap-1 border-b border-[#2A2F3A] mb-4">
                    {TAB_ITEMS.map(t => (
                      <button
                        key={t.id}
                        onClick={() => setTab(t.id)}
                        className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium border-b-2 transition-all -mb-px ${
                          tab === t.id
                            ? 'border-red-500 text-red-400'
                            : 'border-transparent text-[#A1A1AA] hover:text-white'
                        }`}
                      >
                        <t.icon size={13} />
                        {t.label}
                        {t.id === 'comentarios' && demanda.comentarios.length > 0 && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-red-500/10 text-red-400">
                            {demanda.comentarios.length}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>

                  {/* ─── Checklist tab ──────────────────────────────────── */}
                  {tab === 'checklist' && (
                    <div className="space-y-2">
                      {demanda.checklist.map(item => (
                        <div key={item.id} className="flex items-center gap-3 group">
                          <button
                            onClick={() => toggleChecklistItem(demanda.id, item.id)}
                            className={`flex-shrink-0 transition ${item.concluido ? 'text-emerald-400' : 'text-[#A1A1AA] hover:text-white'}`}
                          >
                            {item.concluido
                              ? <CheckSquare size={16} />
                              : <Square size={16} />
                            }
                          </button>
                          <span className={`flex-1 text-sm ${item.concluido ? 'line-through text-[#A1A1AA]' : 'text-white'}`}>
                            {item.texto}
                          </span>
                          <button
                            onClick={() => deleteChecklistItem(demanda.id, item.id)}
                            className="text-[#A1A1AA] hover:text-red-400 transition opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      ))}

                      {/* Add item */}
                      <div className="flex gap-2 mt-3">
                        <input
                          type="text"
                          placeholder="Adicionar item..."
                          value={newCheckItem}
                          onChange={e => setNewCheckItem(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && addItem()}
                          className="flex-1 bg-[#181C25] border border-[#2A2F3A] rounded-lg px-3 py-2 text-sm text-white placeholder:text-[#A1A1AA] focus:outline-none focus:border-red-500/50"
                        />
                        <button
                          onClick={addItem}
                          className="px-3 py-2 rounded-lg bg-[#2A2F3A] text-[#A1A1AA] hover:text-white transition"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* ─── Comments tab ───────────────────────────────────── */}
                  {tab === 'comentarios' && (
                    <div className="space-y-4">
                      {demanda.comentarios.length === 0 && (
                        <p className="text-sm text-[#A1A1AA] text-center py-6">Nenhum comentário ainda.</p>
                      )}
                      {demanda.comentarios.map(c => (
                        <div key={c.id} className="flex gap-3 group">
                          <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                            {c.avatar}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-semibold text-white">{c.autor}</span>
                              <span className="text-xs text-[#A1A1AA]">
                                {format(new Date(c.criadoEm), "dd/MM 'às' HH:mm", { locale: ptBR })}
                              </span>
                            </div>
                            <p className="text-sm text-[#A1A1AA] whitespace-pre-wrap">{c.texto}</p>
                          </div>
                          <button
                            onClick={() => deleteComment(demanda.id, c.id)}
                            className="text-[#A1A1AA] hover:text-red-400 transition opacity-0 group-hover:opacity-100 flex-shrink-0"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      ))}

                      {/* Comment input */}
                      <div className="flex gap-2 pt-2 border-t border-[#2A2F3A]">
                        <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                          BR
                        </div>
                        <div className="flex-1 flex gap-2">
                          <textarea
                            ref={commentRef}
                            value={commentDraft}
                            onChange={e => setCommentDraft(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submitComment(); } }}
                            placeholder="Escrever comentário... (Enter para enviar)"
                            rows={2}
                            className="flex-1 bg-[#181C25] border border-[#2A2F3A] rounded-lg px-3 py-2 text-sm text-white placeholder:text-[#A1A1AA] focus:outline-none focus:border-red-500/50 resize-none"
                          />
                          <button
                            onClick={submitComment}
                            className="px-3 py-2 rounded-lg bg-red-600 text-white hover:bg-red-500 transition self-end"
                          >
                            <Send size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ─── History tab ────────────────────────────────────── */}
                  {tab === 'historico' && (
                    <div className="space-y-3">
                      {demanda.historico.length === 0 && (
                        <p className="text-sm text-[#A1A1AA] text-center py-6">Sem histórico.</p>
                      )}
                      {[...demanda.historico].reverse().map(h => {
                        const { Icon, color, bgColor } = getHistoricoIcon(h.tipo);
                        return (
                          <div key={h.id} className="flex gap-3">
                            <div className={`w-6 h-6 rounded-full ${bgColor} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                              <Icon size={12} className={color} />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm text-[#A1A1AA]">
                                <span className="text-white font-medium">{h.autor}</span>{' '}
                                {h.descricao}
                              </p>
                              <p className="text-[10px] text-[#555] mt-0.5">
                                {format(new Date(h.criadoEm), "dd/MM/yy 'às' HH:mm", { locale: ptBR })}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
