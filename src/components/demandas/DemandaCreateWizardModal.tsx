'use client';

import { useMemo, useState } from 'react';
import { Loader2, X } from 'lucide-react';
import { ClienteCategoria, ClienteDemanda, DemandaClienteStatus } from '@/types/demandasCentral';
import { upsertDemandaCentral, updateDemandaCentral } from '@/services/demandasCentralService';
import { STATUS_RULES } from '@/data/statusRules';

type CreateType = 'cliente' | 'demanda';
type ToastType = 'success' | 'error';
type Mode = 'create' | 'edit';
type FormErrors = Partial<Record<keyof Omit<ClienteDemanda, 'id'>, string>>;

interface Props {
  mode?: Mode;
  initialData?: ClienteDemanda | null;
  onClose: () => void;
  onSaved: (row: ClienteDemanda) => void;
  onToast?: (type: ToastType, message: string) => void;
}

const statusOptions: DemandaClienteStatus[] = ['A fazer','Em andamento','Aguardando cliente','Aguardando pagamento','Feito','Recorrente','Pausado','Cancelado'];

const baseForm: Omit<ClienteDemanda, 'id'> = {
  categoria: 'AB Tracking', nomeCliente: '', empresa: '', midia: 'Outros',
  urlGoogleAds: '', urlMetaAds: '', urlDashboard: '', tarefaDemanda: '', andamentoObservacao: '',
  status: 'A fazer', prazoEntrega: '', dataRelatorio: '', dataOtimizacao: '', ultimaMensagem: '',
  valorMensalidade: null, saldoContaGoogleAds: null, saldoContaMetaAds: null,
  responsavel: 'Bruno', prioridade: 'Media', tags: [], arquivado: false,
};

const formatBRL = (v: number | null) => v === null ? '' : v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const parseBRL = (raw: string) => { const digits = raw.replace(/\D/g, ''); return digits ? Number(digits) / 100 : null; };
const isValidUrl = (value: string) => { if (!value) return true; try { const u = new URL(value); return u.protocol === 'http:' || u.protocol === 'https:'; } catch { return false; } };

export default function DemandaCreateWizardModal({ mode = 'create', initialData, onClose, onSaved, onToast }: Props) {
  const stripId = (row: ClienteDemanda) => { const { id, ...rest } = row; void id; return rest; };
  const initialForm = mode === 'edit' && initialData ? stripId(initialData) : { ...baseForm, ultimaMensagem: new Date().toISOString().slice(0, 10) };
  const [step, setStep] = useState<1 | 2>(1);
  const [createType, setCreateType] = useState<CreateType>(mode === 'edit' ? 'demanda' : 'cliente');
  const [form, setForm] = useState<Omit<ClienteDemanda, 'id'>>(initialForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [mensalidadeInput, setMensalidadeInput] = useState(formatBRL(initialForm.valorMensalidade));
  const [saving, setSaving] = useState(false);
  const [validatingField, setValidatingField] = useState<'urlGoogleAds' | 'urlMetaAds' | 'urlDashboard' | null>(null);

  const dateHints = useMemo(() => STATUS_RULES[form.status].requiredDates, [form.status]);
  const pushToast = (type: ToastType, message: string) => onToast?.(type, message);

  const validateStep1 = () => {
    const next: FormErrors = {};
    if (!form.nomeCliente.trim()) next.nomeCliente = 'Obrigatorio';
    if (!form.empresa.trim()) next.empresa = 'Obrigatorio';
    if (!form.responsavel.trim()) next.responsavel = 'Obrigatorio';
    if (!isValidUrl(form.urlGoogleAds)) next.urlGoogleAds = 'URL invalida';
    if (!isValidUrl(form.urlMetaAds)) next.urlMetaAds = 'URL invalida';
    if (!isValidUrl(form.urlDashboard)) next.urlDashboard = 'URL invalida';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const validateStep2 = () => {
    const next: FormErrors = {};
    if (!form.tarefaDemanda.trim()) next.tarefaDemanda = 'Obrigatorio';
    STATUS_RULES[form.status].requiredDates.forEach((k) => { if (!form[k]) next[k] = 'Obrigatorio para este status'; });
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const save = async () => {
    if (!validateStep2()) { pushToast('error', 'Corrija os campos obrigatorios.'); return; }
    setSaving(true);

    if (mode === 'edit' && initialData) {
      // ── Local-first: atualiza o estado imediatamente ──
      const updated = { ...initialData, ...form };
      onSaved(updated);
      onClose();
      setSaving(false);

      // Sincroniza com Supabase em background (silencioso se não configurado)
      updateDemandaCentral(initialData.id, form).catch((err: unknown) => {
        console.error('[Supabase] updateDemandaCentral falhou:', err);
      });
      return;
    }

    // ── Create mode ──
    try {
      const newRow: ClienteDemanda = { id: crypto.randomUUID(), ...form };

      // Aplica localmente imediatamente
      onSaved(newRow);
      onClose();

      // Persiste em background
      upsertDemandaCentral(newRow).catch((err: unknown) => {
        console.error('[Supabase] upsertDemandaCentral falhou:', err);
      });
    } catch (err) {
      console.error('[Save] Erro inesperado:', err);
      pushToast('error', 'Erro ao criar registro.');
    } finally {
      setSaving(false);
    }
  };

  const handleFieldUrlBlur = async (field: 'urlGoogleAds' | 'urlMetaAds' | 'urlDashboard') => {
    setValidatingField(field);
    await new Promise((r) => setTimeout(r, 250));
    setValidatingField(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl max-h-[90vh] overflow-auto rounded-2xl border border-[#2A2F3A] bg-[#111520] p-5">
        <div className="flex items-center justify-between mb-4"><h3 className="text-lg font-semibold text-white">{mode === 'edit' ? 'Editar Cliente/Demanda' : 'Novo Cliente/Demanda'}</h3><button onClick={onClose} className="text-[#A1A1AA] hover:text-white"><X size={16} /></button></div>
        <div className="mb-4 flex items-center gap-2">{mode === 'create' ? <><button onClick={() => setCreateType('cliente')} className={`px-3 py-1.5 rounded-md text-xs border ${createType === 'cliente' ? 'border-blue-400/40 bg-blue-500/20 text-blue-200' : 'border-[#2A2F3A] text-[#A1A1AA]'}`}>Novo Cliente</button><button onClick={() => setCreateType('demanda')} className={`px-3 py-1.5 rounded-md text-xs border ${createType === 'demanda' ? 'border-fuchsia-400/40 bg-fuchsia-500/20 text-fuchsia-200' : 'border-[#2A2F3A] text-[#A1A1AA]'}`}>Nova Demanda</button></> : null}<div className="ml-auto text-xs text-[#8F98AB]">Etapa {step} de 2</div></div>

        {step === 1 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
            <div><input placeholder="Nome do Cliente *" value={form.nomeCliente} onChange={(e) => setForm((f) => ({ ...f, nomeCliente: e.target.value }))} className="w-full bg-[#0E121B] border border-[#2A2F3A] rounded-lg px-3 py-2 text-white" />{errors.nomeCliente ? <p className="text-xs text-red-300 mt-1">{errors.nomeCliente}</p> : null}</div>
            <div><input placeholder="Empresa *" value={form.empresa} onChange={(e) => setForm((f) => ({ ...f, empresa: e.target.value }))} className="w-full bg-[#0E121B] border border-[#2A2F3A] rounded-lg px-3 py-2 text-white" />{errors.empresa ? <p className="text-xs text-red-300 mt-1">{errors.empresa}</p> : null}</div>
            <select value={form.categoria} onChange={(e) => setForm((f) => ({ ...f, categoria: e.target.value as ClienteCategoria }))} className="bg-[#0E121B] border border-[#2A2F3A] rounded-lg px-3 py-2 text-white"><option>Workana</option><option>AB Tracking</option><option>Pontuais</option></select>
            <select value={form.midia} onChange={(e) => setForm((f) => ({ ...f, midia: e.target.value as ClienteDemanda['midia'] }))} className="bg-[#0E121B] border border-[#2A2F3A] rounded-lg px-3 py-2 text-white"><option>Google Ads</option><option>Meta Ads</option><option>Google e Meta</option><option>LinkedIn Ads</option><option>TikTok Ads</option><option>Outros</option></select>
            <div><input placeholder="Responsavel *" value={form.responsavel} onChange={(e) => setForm((f) => ({ ...f, responsavel: e.target.value }))} className="w-full bg-[#0E121B] border border-[#2A2F3A] rounded-lg px-3 py-2 text-white" />{errors.responsavel ? <p className="text-xs text-red-300 mt-1">{errors.responsavel}</p> : null}</div>
            <div />
            <div className="md:col-span-2"><div className="relative"><input placeholder="URL Google Ads" value={form.urlGoogleAds} onChange={(e) => setForm((f) => ({ ...f, urlGoogleAds: e.target.value }))} onBlur={() => void handleFieldUrlBlur('urlGoogleAds')} className="w-full bg-[#0E121B] border border-[#2A2F3A] rounded-lg px-3 py-2 text-white" />{validatingField === 'urlGoogleAds' ? <Loader2 size={13} className="absolute right-3 top-2.5 animate-spin text-blue-300" /> : null}</div>{errors.urlGoogleAds ? <p className="text-xs text-red-300 mt-1">{errors.urlGoogleAds}</p> : null}</div>
            <div><div className="relative"><input placeholder="URL Meta Ads" value={form.urlMetaAds} onChange={(e) => setForm((f) => ({ ...f, urlMetaAds: e.target.value }))} onBlur={() => void handleFieldUrlBlur('urlMetaAds')} className="w-full bg-[#0E121B] border border-[#2A2F3A] rounded-lg px-3 py-2 text-white" />{validatingField === 'urlMetaAds' ? <Loader2 size={13} className="absolute right-3 top-2.5 animate-spin text-blue-300" /> : null}</div>{errors.urlMetaAds ? <p className="text-xs text-red-300 mt-1">{errors.urlMetaAds}</p> : null}</div>
            <div className="md:col-span-3"><div className="relative"><input placeholder="URL Dashboard/Looker" value={form.urlDashboard} onChange={(e) => setForm((f) => ({ ...f, urlDashboard: e.target.value }))} onBlur={() => void handleFieldUrlBlur('urlDashboard')} className="w-full bg-[#0E121B] border border-[#2A2F3A] rounded-lg px-3 py-2 text-white" />{validatingField === 'urlDashboard' ? <Loader2 size={13} className="absolute right-3 top-2.5 animate-spin text-blue-300" /> : null}</div>{errors.urlDashboard ? <p className="text-xs text-red-300 mt-1">{errors.urlDashboard}</p> : null}</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
            <div className="md:col-span-3"><input placeholder="Tarefa/Demanda *" value={form.tarefaDemanda} onChange={(e) => setForm((f) => ({ ...f, tarefaDemanda: e.target.value }))} className="w-full bg-[#0E121B] border border-[#2A2F3A] rounded-lg px-3 py-2 text-white" />{errors.tarefaDemanda ? <p className="text-xs text-red-300 mt-1">{errors.tarefaDemanda}</p> : null}</div>
            <div className="md:col-span-3"><input placeholder="Andamento/Observacao" value={form.andamentoObservacao} onChange={(e) => setForm((f) => ({ ...f, andamentoObservacao: e.target.value }))} className="w-full bg-[#0E121B] border border-[#2A2F3A] rounded-lg px-3 py-2 text-white" /></div>
            <select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as DemandaClienteStatus }))} className="bg-[#0E121B] border border-[#2A2F3A] rounded-lg px-3 py-2 text-white">{statusOptions.map((s) => <option key={s}>{s}</option>)}</select>
            <select value={form.prioridade} onChange={(e) => setForm((f) => ({ ...f, prioridade: e.target.value as ClienteDemanda['prioridade'] }))} className="bg-[#0E121B] border border-[#2A2F3A] rounded-lg px-3 py-2 text-white"><option>Baixa</option><option>Media</option><option>Alta</option><option>Urgente</option></select>
            <input placeholder="Tags separadas por virgula" value={form.tags.join(', ')} onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value.split(',').map((t) => t.trim()).filter(Boolean) }))} className="bg-[#0E121B] border border-[#2A2F3A] rounded-lg px-3 py-2 text-white" />
            <div><input type="date" value={form.prazoEntrega} onChange={(e) => setForm((f) => ({ ...f, prazoEntrega: e.target.value }))} className="w-full bg-[#0E121B] border border-[#2A2F3A] rounded-lg px-3 py-2 text-white" />{errors.prazoEntrega ? <p className="text-xs text-red-300 mt-1">{errors.prazoEntrega}</p> : null}</div>
            <div><input type="date" value={form.dataRelatorio} onChange={(e) => setForm((f) => ({ ...f, dataRelatorio: e.target.value }))} className="w-full bg-[#0E121B] border border-[#2A2F3A] rounded-lg px-3 py-2 text-white" />{errors.dataRelatorio ? <p className="text-xs text-red-300 mt-1">{errors.dataRelatorio}</p> : null}</div>
            <div><input type="date" value={form.dataOtimizacao} onChange={(e) => setForm((f) => ({ ...f, dataOtimizacao: e.target.value }))} className="w-full bg-[#0E121B] border border-[#2A2F3A] rounded-lg px-3 py-2 text-white" />{errors.dataOtimizacao ? <p className="text-xs text-red-300 mt-1">{errors.dataOtimizacao}</p> : null}</div>
            <div><input type="date" value={form.ultimaMensagem} onChange={(e) => setForm((f) => ({ ...f, ultimaMensagem: e.target.value }))} className="w-full bg-[#0E121B] border border-[#2A2F3A] rounded-lg px-3 py-2 text-white" />{errors.ultimaMensagem ? <p className="text-xs text-red-300 mt-1">{errors.ultimaMensagem}</p> : null}</div>
            <div className="md:col-span-2"><input value={mensalidadeInput} placeholder="Valor Mensalidade (R$)" onChange={(e) => { const parsed = parseBRL(e.target.value); setForm((f) => ({ ...f, valorMensalidade: parsed })); setMensalidadeInput(parsed ? formatBRL(parsed) : ''); }} className="w-full bg-[#0E121B] border border-[#2A2F3A] rounded-lg px-3 py-2 text-white" /></div>
            <div className="md:col-span-3 text-xs text-[#8F98AB]">Datas obrigatorias para o status atual: {dateHints.length ? dateHints.join(', ') : 'nenhuma'}</div>
          </div>
        )}

        <div className="mt-5 flex justify-between gap-2">
          <div>{step === 2 ? <button onClick={() => setStep(1)} className="px-4 py-2 rounded-lg border border-[#2A2F3A] text-sm text-[#A1A1AA]">Voltar</button> : null}</div>
          <div className="flex gap-2">
            <button onClick={onClose} className="px-4 py-2 rounded-lg border border-[#2A2F3A] text-sm text-[#A1A1AA]">Cancelar</button>
            {step === 1 ? <button onClick={() => { if (!validateStep1()) { pushToast('error', 'Corrija os campos da etapa 1.'); return; } if (createType === 'cliente' && !form.tarefaDemanda) setForm((f) => ({ ...f, tarefaDemanda: 'Briefing inicial' })); setStep(2); }} className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-sm font-semibold text-white">Continuar</button> : <button disabled={saving} onClick={() => void save()} className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-sm font-semibold text-white inline-flex items-center gap-2 disabled:opacity-60">{saving ? <Loader2 size={14} className="animate-spin" /> : null}{saving ? 'Salvando...' : mode === 'edit' ? 'Salvar alteracoes' : 'Salvar'}</button>}
          </div>
        </div>
      </div>
    </div>
  );
}
