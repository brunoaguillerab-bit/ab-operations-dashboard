'use client';

import { useState } from 'react';
import { X, Send, Paperclip, Smile, Image as ImageIcon, MessageSquare, Clock, User, Hash, Briefcase, DollarSign, Calendar, Link as LinkIcon, Edit2, AlertCircle } from 'lucide-react';
import { ClienteDemanda } from '@/types/demandasCentral';
import { StatusBadgeCentral } from './StatusBadgeCentral';
import { motion, AnimatePresence } from 'framer-motion';

type SidebarTab = 'atualizacoes' | 'atividades' | 'informacoes' | 'arquivos' | 'historico';
type ActivityItem = { id: string; text: string; at: string; user?: string };

interface TaskSidebarProps {
  task: ClienteDemanda;
  onClose: () => void;
  activities: ActivityItem[];
  onUpdate: (patch: Partial<ClienteDemanda>, label: string) => Promise<void>;
}

export function TaskSidebar({ task, onClose, activities, onUpdate }: TaskSidebarProps) {
  const [tab, setTab] = useState<SidebarTab>('atualizacoes');
  const [comment, setComment] = useState('');

  const tabs: Array<{ id: SidebarTab; label: string }> = [
    { id: 'atualizacoes', label: 'Atualizações' },
    { id: 'informacoes', label: 'Informações' },
    { id: 'atividades', label: 'Atividades' },
    { id: 'arquivos', label: 'Arquivos' },
    { id: 'historico', label: 'Histórico' },
  ];

  const handleAddComment = () => {
    if (!comment.trim()) return;
    onUpdate({}, `Comentou: ${comment}`);
    setComment('');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex justify-end">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />
        
        <motion.div
          initial={{ x: '100%', opacity: 0.5 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: '100%', opacity: 0.5 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="relative w-full max-w-[600px] h-full bg-[#0B1020] border-l border-white/10 shadow-2xl flex flex-col z-10"
        >
          {/* Header */}
          <div className="px-6 py-5 border-b border-white/10 bg-[#121826]">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 pr-4">
                <h2 className="text-xl font-bold text-[#F3F4F6] leading-tight">
                  {task.tarefaDemanda}
                </h2>
                <div className="flex items-center gap-3 mt-2 text-sm text-[#94A3B8]">
                  <span className="flex items-center gap-1.5"><Briefcase size={14} /> {task.nomeCliente}</span>
                  <span className="w-1 h-1 rounded-full bg-white/20" />
                  <span className="flex items-center gap-1.5"><User size={14} /> {task.responsavel}</span>
                  <span className="w-1 h-1 rounded-full bg-white/20" />
                  <StatusBadgeCentral status={task.status} />
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 -mr-2 text-[#94A3B8] hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex gap-1 overflow-x-auto mt-4 hide-scrollbar">
              {tabs.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-all ${
                    tab === t.id 
                      ? 'bg-[#3B82F6]/10 text-[#3B82F6]' 
                      : 'text-[#94A3B8] hover:text-[#F3F4F6] hover:bg-white/5'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 scroll-smooth">
            {tab === 'atualizacoes' && (
              <div className="space-y-6">
                {/* Input Area */}
                <div className="bg-[#121826] border border-white/10 rounded-xl overflow-hidden focus-within:border-[#3B82F6]/50 transition-colors">
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Escreva uma atualização..."
                    className="w-full bg-transparent p-4 text-[#F3F4F6] text-sm resize-none focus:outline-none min-h-[100px]"
                  />
                  <div className="px-4 py-3 bg-[#1A2235]/50 flex items-center justify-between border-t border-white/5">
                    <div className="flex items-center gap-2 text-[#94A3B8]">
                      <button className="p-1.5 hover:bg-white/10 rounded-md transition-colors"><Smile size={16} /></button>
                      <button className="p-1.5 hover:bg-white/10 rounded-md transition-colors"><Paperclip size={16} /></button>
                      <button className="p-1.5 hover:bg-white/10 rounded-md transition-colors"><ImageIcon size={16} /></button>
                    </div>
                    <button 
                      onClick={handleAddComment}
                      className="px-4 py-1.5 bg-[#3B82F6] hover:bg-[#2563EB] text-white text-sm font-medium rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
                      disabled={!comment.trim()}
                    >
                      Atualizar
                    </button>
                  </div>
                </div>

                {/* Feed */}
                <div className="space-y-4">
                  {activities.map((a) => (
                    <div key={a.id} className="flex gap-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#3B82F6] to-[#8B5CF6] flex items-center justify-center text-white font-bold flex-shrink-0">
                        {a.user ? a.user.charAt(0).toUpperCase() : 'S'}
                      </div>
                      <div className="flex-1 bg-[#121826] border border-white/10 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-[#F3F4F6] text-sm">{a.user || 'Sistema'}</span>
                          <span className="text-xs text-[#94A3B8] flex items-center gap-1">
                            <Clock size={12} /> {new Date(a.at).toLocaleString('pt-BR')}
                          </span>
                        </div>
                        <p className="text-sm text-[#DDE3F0] leading-relaxed">
                          {a.text}
                        </p>
                      </div>
                    </div>
                  ))}
                  {activities.length === 0 && (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 rounded-full bg-[#1A2235] flex items-center justify-center mx-auto mb-4">
                        <MessageSquare className="text-[#94A3B8]" size={24} />
                      </div>
                      <h3 className="text-[#F3F4F6] font-medium mb-1">Nenhuma atualização ainda</h3>
                      <p className="text-[#94A3B8] text-sm">Seja o primeiro a deixar um comentário nesta demanda.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {tab === 'informacoes' && (
              <div className="space-y-6">
                <div className="bg-[#121826] border border-white/10 rounded-xl p-5 space-y-5">
                  <h3 className="text-[#F3F4F6] font-medium flex items-center gap-2 mb-4"><Briefcase size={16} className="text-[#3B82F6]" /> Dados do Cliente</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <SidebarField label="Cliente" value={task.nomeCliente} icon={User} onSave={(v) => void onUpdate({ nomeCliente: v }, 'Cliente alterado')} />
                    <SidebarField label="Empresa" value={task.empresa} icon={Briefcase} onSave={(v) => void onUpdate({ empresa: v }, 'Empresa alterada')} />
                    <SidebarField label="Categoria" value={task.categoria} icon={Hash} onSave={(v) => void onUpdate({ categoria: v as any }, 'Categoria alterada')} />
                    <SidebarField label="Mídia" value={task.midia} icon={AlertCircle} onSave={(v) => void onUpdate({ midia: v as any }, 'Mídia alterada')} />
                  </div>
                </div>

                <div className="bg-[#121826] border border-white/10 rounded-xl p-5 space-y-5">
                  <h3 className="text-[#F3F4F6] font-medium flex items-center gap-2 mb-4"><LinkIcon size={16} className="text-[#8B5CF6]" /> Links e Acessos</h3>
                  
                  <SidebarField label="URL Google Ads" value={task.urlGoogleAds} onSave={(v) => void onUpdate({ urlGoogleAds: v }, 'URL Google Ads')} isLink />
                  <SidebarField label="URL Meta Ads" value={task.urlMetaAds} onSave={(v) => void onUpdate({ urlMetaAds: v }, 'URL Meta Ads')} isLink />
                  <SidebarField label="URL Dashboard" value={task.urlDashboard} onSave={(v) => void onUpdate({ urlDashboard: v }, 'URL Dashboard')} isLink />
                </div>

                <div className="bg-[#121826] border border-white/10 rounded-xl p-5 space-y-5">
                  <h3 className="text-[#F3F4F6] font-medium flex items-center gap-2 mb-4"><Calendar size={16} className="text-[#10B981]" /> Prazos e Valores</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <SidebarField label="Prazo Entrega" value={task.prazoEntrega} icon={Calendar} onSave={(v) => void onUpdate({ prazoEntrega: v }, 'Prazo')} />
                    <SidebarField label="Mensalidade" value={task.valorMensalidade ? String(task.valorMensalidade) : ''} icon={DollarSign} onSave={(v) => void onUpdate({ valorMensalidade: Number(v) }, 'Mensalidade')} />
                    
                    <SidebarField label="Data Relatório" value={task.dataRelatorio} icon={Calendar} onSave={(v) => void onUpdate({ dataRelatorio: v }, 'Data Relatório')} />
                    <SidebarField label="Data Otimização" value={task.dataOtimizacao} icon={Calendar} onSave={(v) => void onUpdate({ dataOtimizacao: v }, 'Data Otimização')} />
                    
                    <SidebarField label="Saldo Google Ads" value={task.saldoContaGoogleAds ? String(task.saldoContaGoogleAds) : ''} icon={DollarSign} onSave={(v) => void onUpdate({ saldoContaGoogleAds: Number(v) }, 'Saldo Google')} />
                    <SidebarField label="Saldo Meta Ads" value={task.saldoContaMetaAds ? String(task.saldoContaMetaAds) : ''} icon={DollarSign} onSave={(v) => void onUpdate({ saldoContaMetaAds: Number(v) }, 'Saldo Meta')} />
                  </div>
                  <div className="mt-4">
                    <SidebarField label="Última Mensagem" value={task.ultimaMensagem} icon={MessageSquare} onSave={(v) => void onUpdate({ ultimaMensagem: v }, 'Última Mensagem')} />
                  </div>
                  <div className="mt-4">
                    <label className="text-xs text-[#94A3B8] font-medium mb-1.5 block">Observações Internas</label>
                    <textarea 
                      defaultValue={task.andamentoObservacao}
                      onBlur={(e) => void onUpdate({ andamentoObservacao: e.target.value }, 'Observações')}
                      className="w-full bg-[#0B1020] border border-white/10 rounded-lg px-3 py-2 text-sm text-[#F3F4F6] focus:border-[#3B82F6]/50 focus:outline-none transition-colors min-h-[100px] resize-y"
                    />
                  </div>
                </div>
              </div>
            )}

            {(tab === 'atividades' || tab === 'historico') && (
              <div className="space-y-4">
                <div className="relative pl-4 border-l-2 border-white/10 space-y-6 pb-4">
                  {activities.map((a, idx) => (
                    <div key={a.id} className="relative">
                      <div className="absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full bg-[#3B82F6] ring-4 ring-[#0B1020]" />
                      <div className="bg-[#121826] border border-white/10 rounded-xl p-3 text-sm">
                        <span className="text-[#F3F4F6]">{a.text}</span>
                        <div className="text-xs text-[#94A3B8] mt-1.5 flex items-center gap-1.5">
                          <Clock size={12} /> {new Date(a.at).toLocaleString('pt-BR')}
                        </div>
                      </div>
                    </div>
                  ))}
                  {activities.length === 0 && <p className="text-sm text-[#94A3B8]">Sem histórico ainda.</p>}
                </div>
              </div>
            )}

            {tab === 'arquivos' && (
              <div className="h-full flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-xl bg-[#121826] p-12 text-center hover:bg-white/5 hover:border-white/20 transition-colors cursor-pointer">
                <div className="w-16 h-16 rounded-full bg-[#1A2235] flex items-center justify-center mb-4 text-[#3B82F6]">
                  <Paperclip size={24} />
                </div>
                <h3 className="text-[#F3F4F6] font-medium text-lg mb-2">Arraste seus arquivos aqui</h3>
                <p className="text-[#94A3B8] text-sm max-w-xs">Suporta PDF, Imagens, planilhas e documentos. Tamanho máximo 50MB.</p>
                <button className="mt-6 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm font-medium text-[#F3F4F6] hover:bg-white/10 transition-colors">
                  Procurar arquivos
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

function SidebarField({ label, value, onSave, icon: Icon, isLink }: { label: string; value: string; onSave: (v: string) => void; icon?: any; isLink?: boolean }) {
  return (
    <div className="group relative">
      <label className="text-xs text-[#94A3B8] font-medium mb-1.5 flex items-center gap-1.5">
        {Icon && <Icon size={12} />}
        {label}
      </label>
      <div className="relative flex items-center">
        <input
          defaultValue={value || ''}
          onBlur={(e) => {
            if (e.target.value !== value) onSave(e.target.value);
          }}
          className="w-full bg-[#0B1020] border border-transparent hover:border-white/10 focus:border-[#3B82F6]/50 rounded-lg px-3 py-2 text-sm text-[#F3F4F6] focus:outline-none transition-colors group-hover:bg-[#1A2235]"
          placeholder="Vazio"
        />
        {isLink && value && (
          <a href={value} target="_blank" rel="noreferrer" className="absolute right-2 p-1 text-[#3B82F6] hover:bg-[#3B82F6]/20 rounded transition-colors">
            <LinkIcon size={14} />
          </a>
        )}
        <div className="absolute right-2 opacity-0 group-hover:opacity-100 pointer-events-none text-[#94A3B8] transition-opacity">
          {!isLink && <Edit2 size={12} />}
        </div>
      </div>
    </div>
  );
}

