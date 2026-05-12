'use client';

import { motion } from 'framer-motion';
import { Client } from '@/data/mockClients';
import {
  AlertTriangle,
  TrendingDown,
  Clock,
  Zap,
  CheckCircle2,
  Users,
} from 'lucide-react';

interface InsightsPanelProps {
  clients: Client[];
}

export default function InsightsPanel({ clients }: InsightsPanelProps) {
  // Insights
  const clientsWithoutRecentOptimization = clients.filter(c => {
    const lastOptimization = new Date(c.ultimaOtimizacao);
    const daysAgo = Math.floor(
      (new Date().getTime() - lastOptimization.getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysAgo > 7;
  });

  const clientsWithLowBalance = clients.filter(
    c => (c.saldoGoogle > 0 && c.saldoGoogle < 500) || (c.saldoMeta > 0 && c.saldoMeta < 500)
  );

  const overdueTasks = clients.filter(c => {
    const deadline = new Date(c.prazoEntrega);
    return deadline < new Date() && c.status !== 'feito';
  });

  const pendingTasks = clients.filter(c => c.status === 'a_fazer');
  const awaitingClients = clients.filter(c => c.status === 'cliente');
  const completedToday = clients.filter(c => {
    const today = new Date().toLocaleDateString('pt-BR');
    return c.ultimoRelatorio === today;
  });

  const insights = [
    {
      icon: AlertTriangle,
      label: 'Saldos Baixos',
      value: clientsWithLowBalance.length,
      color: 'from-orange-600 to-orange-700',
      textColor: 'text-orange-400',
      description: 'Clientes com saldo < R$ 500',
    },
    {
      icon: Clock,
      label: 'Sem Otimização',
      value: clientsWithoutRecentOptimization.length,
      color: 'from-amber-600 to-amber-700',
      textColor: 'text-amber-400',
      description: 'Não otimizados há 7+ dias',
    },
    {
      icon: Zap,
      label: 'Demandas Atrasadas',
      value: overdueTasks.length,
      color: 'from-red-600 to-red-700',
      textColor: 'text-red-400',
      description: 'Tarefas com prazo vencido',
    },
    {
      icon: CheckCircle2,
      label: 'Pendentes',
      value: pendingTasks.length,
      color: 'from-blue-600 to-blue-700',
      textColor: 'text-blue-400',
      description: 'Tarefas aguardando execução',
    },
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-white px-6 pt-6">
        📊 Insights & Alertas
      </h3>

      <div className="px-6 space-y-3 pb-6">
        {insights.map((insight, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="group relative overflow-hidden rounded-lg bg-[#181C25] border border-[#2A2F3A] p-4 hover:border-[#3A3F4A] transition-all cursor-pointer"
          >
            {/* Gradient Background */}
            <div
              className={`absolute inset-0 opacity-5 bg-gradient-to-br ${insight.color} group-hover:opacity-10 transition-opacity`}
            />

            {/* Content */}
            <div className="relative z-10 flex items-start gap-3">
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${insight.textColor}`}
              >
                <insight.icon size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-white">
                    {insight.label}
                  </p>
                  <span
                    className={`text-lg font-bold ${insight.textColor}`}
                  >
                    {insight.value}
                  </span>
                </div>
                <p className="text-xs text-[#A1A1AA] mt-1">
                  {insight.description}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Divider */}
      <div className="border-t border-[#2A2F3A]" />

      {/* Summary */}
      <div className="px-6 py-4 space-y-3">
        <h4 className="text-sm font-bold text-white uppercase tracking-wider">
          Resumo Financeiro
        </h4>
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-[#A1A1AA]">Receita Total</span>
            <span className="font-bold text-emerald-400">
              R$ {clients.reduce((sum, c) => sum + c.valorMensal, 0).toFixed(2)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[#A1A1AA]">Saldo Google Ads</span>
            <span className="font-bold text-cyan-400">
              R$ {clients.reduce((sum, c) => sum + c.saldoGoogle, 0).toFixed(2)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[#A1A1AA]">Saldo Meta Ads</span>
            <span className="font-bold text-blue-400">
              R$ {clients.reduce((sum, c) => sum + c.saldoMeta, 0).toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Clients Waiting */}
      {awaitingClients.length > 0 && (
        <>
          <div className="border-t border-[#2A2F3A]" />
          <div className="px-6 py-4">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-3">
              Aguardando Cliente ({awaitingClients.length})
            </h4>
            <div className="space-y-2">
              {awaitingClients.slice(0, 3).map(client => (
                <div
                  key={client.id}
                  className="flex items-center gap-2 p-2 rounded bg-orange-500/10 border border-orange-500/20"
                >
                  <div className="w-2 h-2 rounded-full bg-orange-500 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-white truncate">
                      {client.name}
                    </p>
                    <p className="text-xs text-[#A1A1AA] truncate">
                      {client.company}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
