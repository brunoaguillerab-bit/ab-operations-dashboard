'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import PageHeader from '@/components/PageHeader';
import { RefreshCw, Play, CheckCircle, XCircle, Clock, AlertTriangle, Zap, Database } from 'lucide-react';

type LogEntry = { time: string; type: 'success' | 'error' | 'info'; msg: string };

export default function SincronizarPage() {
  const [n8nStatus, setN8nStatus]     = useState<'idle' | 'loading' | 'ok' | 'error'>('idle');
  const [windsorStatus, setWindsorStatus] = useState<'idle' | 'loading' | 'ok' | 'error'>('idle');
  const [log, setLog]                 = useState<LogEntry[]>([]);

  const addLog = (type: LogEntry['type'], msg: string) =>
    setLog(prev => [{ time: new Date().toLocaleTimeString('pt-BR'), type, msg }, ...prev].slice(0, 20));

  async function triggerN8n() {
    setN8nStatus('loading');
    addLog('info', 'Disparando workflow n8n...');
    try {
      const res  = await fetch('/api/n8n-trigger', { method: 'POST' });
      const json = await res.json();
      if (!res.ok || json.error) {
        setN8nStatus('error');
        addLog('error', json.error || `HTTP ${res.status}`);
      } else {
        setN8nStatus('ok');
        addLog('success', 'Workflow n8n iniciado com sucesso!');
        setTimeout(() => setN8nStatus('idle'), 5000);
      }
    } catch (e) {
      setN8nStatus('error');
      addLog('error', String(e));
    }
  }

  async function triggerWindsor() {
    setWindsorStatus('loading');
    addLog('info', 'Buscando dados do Windsor.ai...');
    try {
      const res  = await fetch('/api/windsor');
      const json = await res.json();
      if (json.error) {
        setWindsorStatus('error');
        addLog('error', json.error);
      } else {
        setWindsorStatus('ok');
        addLog('success', `Windsor atualizado — ${json.data?.length ?? 0} clientes carregados`);
        setTimeout(() => setWindsorStatus('idle'), 5000);
      }
    } catch (e) {
      setWindsorStatus('error');
      addLog('error', String(e));
    }
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col h-screen overflow-hidden">
        <PageHeader
          icon={RefreshCw}
          iconColor="from-blue-600 to-cyan-600"
          title="Análise Diária de IA"
          subtitle="Atualize os dados manualmente ou dispare o workflow n8n"
        />

        <div className="flex-1 p-8 lg:p-12 overflow-y-auto space-y-8">

          {/* Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* n8n Trigger */}
            <div className="p-6 rounded-xl bg-[#181C25] border border-[#2A2F3A]">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-600 to-orange-700 flex items-center justify-center">
                  <Zap size={18} className="text-white" />
                </div>
                <div>
                  <h2 className="text-white font-semibold">Workflow n8n</h2>
                  <p className="text-[#A1A1AA] text-xs">Executa análise completa + salva no Sheets</p>
                </div>
              </div>

              <p className="text-[#6B7280] text-sm mb-5">
                Roda o workflow de análise 7 dias para todos os 23 clientes via Windsor → GPT → Google Sheets.
                Normalmente executa automaticamente às <span className="text-white">5h seg–sex</span>.
              </p>

              <button
                onClick={triggerN8n}
                disabled={n8nStatus === 'loading'}
                className={`w-full flex items-center justify-center gap-2 py-3 rounded-lg font-medium text-sm transition-all ${
                  n8nStatus === 'loading'  ? 'bg-orange-900/30 text-orange-400 cursor-not-allowed' :
                  n8nStatus === 'ok'       ? 'bg-green-900/30 text-green-400 border border-green-600/40' :
                  n8nStatus === 'error'    ? 'bg-red-900/30 text-red-400 border border-red-600/40' :
                  'bg-orange-600 hover:bg-orange-500 text-white'
                }`}
              >
                {n8nStatus === 'loading' && <RefreshCw size={16} className="animate-spin" />}
                {n8nStatus === 'ok'      && <CheckCircle size={16} />}
                {n8nStatus === 'error'   && <XCircle size={16} />}
                {n8nStatus === 'idle'    && <Play size={16} />}
                {n8nStatus === 'loading' ? 'Executando…' :
                 n8nStatus === 'ok'      ? 'Disparado!'  :
                 n8nStatus === 'error'   ? 'Erro — ver log' :
                 'Executar Agora'}
              </button>

              {/* Webhook setup hint */}
              <div className="mt-4 p-3 bg-yellow-900/10 border border-yellow-600/20 rounded-lg">
                <div className="flex gap-2 items-start">
                  <AlertTriangle size={13} className="text-yellow-500 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-yellow-600">
                    Requer <code className="text-yellow-400">N8N_WEBHOOK_URL</code> no <code className="text-yellow-400">.env.local</code>.
                    Veja instruções abaixo.
                  </p>
                </div>
              </div>
            </div>

            {/* Windsor Refresh */}
            <div className="p-6 rounded-xl bg-[#181C25] border border-[#2A2F3A]">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center">
                  <Database size={18} className="text-white" />
                </div>
                <div>
                  <h2 className="text-white font-semibold">Dados Windsor.ai</h2>
                  <p className="text-[#A1A1AA] text-xs">Busca direto da API — sem aguardar n8n</p>
                </div>
              </div>

              <p className="text-[#6B7280] text-sm mb-5">
                Atualiza os dados da aba <span className="text-white">AB Tracking</span> buscando direto do Windsor.ai
                com classificação automática. Não salva no Sheets.
              </p>

              <button
                onClick={triggerWindsor}
                disabled={windsorStatus === 'loading'}
                className={`w-full flex items-center justify-center gap-2 py-3 rounded-lg font-medium text-sm transition-all ${
                  windsorStatus === 'loading' ? 'bg-blue-900/30 text-blue-400 cursor-not-allowed' :
                  windsorStatus === 'ok'      ? 'bg-green-900/30 text-green-400 border border-green-600/40' :
                  windsorStatus === 'error'   ? 'bg-red-900/30 text-red-400 border border-red-600/40' :
                  'bg-blue-600 hover:bg-blue-500 text-white'
                }`}
              >
                {windsorStatus === 'loading' && <RefreshCw size={16} className="animate-spin" />}
                {windsorStatus === 'ok'      && <CheckCircle size={16} />}
                {windsorStatus === 'error'   && <XCircle size={16} />}
                {windsorStatus === 'idle'    && <RefreshCw size={16} />}
                {windsorStatus === 'loading' ? 'Buscando…'    :
                 windsorStatus === 'ok'      ? 'Atualizado!'  :
                 windsorStatus === 'error'   ? 'Erro — ver log' :
                 'Atualizar Windsor'}
              </button>
            </div>
          </div>

          {/* Schedule info */}
          <div className="p-5 rounded-xl bg-[#181C25] border border-[#2A2F3A] flex items-center gap-4">
            <Clock size={20} className="text-[#A1A1AA] flex-shrink-0" />
            <div>
              <p className="text-white text-sm font-medium">Execução automática agendada</p>
              <p className="text-[#6B7280] text-xs mt-0.5">
                Workflow n8n roda toda <span className="text-[#A1A1AA]">segunda a sexta às 5h00</span> (horário de Brasília) — busca Windsor → GPT-4o-mini → salva no Google Sheets aba "2026"
              </p>
            </div>
          </div>

          {/* Activity Log */}
          {log.length > 0 && (
            <div>
              <h3 className="text-white font-semibold mb-3 text-sm uppercase tracking-wider">Log de Atividade</h3>
              <div className="space-y-2">
                {log.map((entry, i) => (
                  <div key={i} className={`flex gap-3 items-start p-3 rounded-lg text-sm ${
                    entry.type === 'success' ? 'bg-green-900/10 border border-green-600/20' :
                    entry.type === 'error'   ? 'bg-red-900/10 border border-red-600/20'   :
                    'bg-[#181C25] border border-[#2A2F3A]'
                  }`}>
                    {entry.type === 'success' && <CheckCircle size={14} className="text-green-400 mt-0.5 flex-shrink-0" />}
                    {entry.type === 'error'   && <XCircle size={14}     className="text-red-400 mt-0.5 flex-shrink-0" />}
                    {entry.type === 'info'    && <RefreshCw size={14}   className="text-blue-400 mt-0.5 flex-shrink-0" />}
                    <span className={
                      entry.type === 'success' ? 'text-green-300' :
                      entry.type === 'error'   ? 'text-red-300'   : 'text-[#A1A1AA]'
                    }>{entry.msg}</span>
                    <span className="text-[#6B7280] text-xs ml-auto flex-shrink-0">{entry.time}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Setup Instructions */}
          <div className="p-6 rounded-xl bg-[#181C25] border border-[#2A2F3A]">
            <h3 className="text-white font-semibold mb-4">Como configurar o botão n8n</h3>
            <ol className="space-y-4 text-sm text-[#A1A1AA]">
              <li className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-orange-600/20 text-orange-400 text-xs flex items-center justify-center font-bold flex-shrink-0">1</span>
                <div>
                  No n8n, abra o workflow <span className="text-white">AB Tracking - 7 Dias v3</span> e adicione um node <code className="text-orange-400 bg-orange-900/20 px-1 rounded">Webhook</code> como segundo trigger (ao lado do Schedule Trigger).
                </div>
              </li>
              <li className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-orange-600/20 text-orange-400 text-xs flex items-center justify-center font-bold flex-shrink-0">2</span>
                <div>
                  No node Webhook, configure: <code className="text-orange-400 bg-orange-900/20 px-1 rounded">HTTP Method: POST</code>. Copie a <span className="text-white">Production URL</span> exibida (ex: <code className="text-[#6B7280]">http://localhost:5678/webhook/abc123</code>).
                </div>
              </li>
              <li className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-orange-600/20 text-orange-400 text-xs flex items-center justify-center font-bold flex-shrink-0">3</span>
                <div>
                  Abra o arquivo <code className="text-white bg-[#0F1117] px-1 rounded">operations-dashboard/.env.local</code> e adicione:
                  <pre className="mt-2 p-3 bg-[#0F1117] rounded text-orange-400 text-xs overflow-x-auto">N8N_WEBHOOK_URL=http://localhost:5678/webhook/abc123</pre>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-orange-600/20 text-orange-400 text-xs flex items-center justify-center font-bold flex-shrink-0">4</span>
                <div>
                  Reinicie o dashboard (<code className="text-orange-400 bg-orange-900/20 px-1 rounded">npm run dev</code>) e clique em <span className="text-white">Executar Agora</span>.
                </div>
              </li>
            </ol>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}
