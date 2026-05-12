'use client';

import { motion } from 'framer-motion';
import { Client } from '@/data/mockClients';
import {
  Users,
  TrendingUp,
  AlertCircle,
  DollarSign,
  CheckCircle2,
  Clock,
} from 'lucide-react';

interface KPICardsABProps {
  clients: Client[];
}

export default function KPICardsAB({ clients }: KPICardsABProps) {
  const totalClients = clients.length;
  const activeClients = clients.filter(c => c.status !== 'pausado').length;
  const pendingTasks = clients.filter(c => c.status === 'a_fazer').length;
  const overdueTasks = clients.filter(c => {
    const deadline = new Date(c.prazoEntrega);
    return deadline < new Date();
  }).length;

  const totalRevenue = clients.reduce((sum, c) => sum + c.valorMensal, 0);
  const totalGoogleBalance = clients.reduce((sum, c) => sum + c.saldoGoogle, 0);
  const totalMetaBalance = clients.reduce((sum, c) => sum + c.saldoMeta, 0);

  const kpis = [
    {
      label: 'Total de Clientes',
      value: totalClients,
      icon: Users,
      color: 'from-blue-600 to-blue-700',
      textColor: 'text-blue-400',
    },
    {
      label: 'Clientes Ativos',
      value: activeClients,
      icon: CheckCircle2,
      color: 'from-emerald-600 to-emerald-700',
      textColor: 'text-emerald-400',
    },
    {
      label: 'Demandas Pendentes',
      value: pendingTasks,
      icon: Clock,
      color: 'from-amber-600 to-amber-700',
      textColor: 'text-amber-400',
    },
    {
      label: 'Tarefas Atrasadas',
      value: overdueTasks,
      icon: AlertCircle,
      color: 'from-red-600 to-red-700',
      textColor: 'text-red-400',
    },
    {
      label: 'Receita Mensal',
      value: `R$ ${totalRevenue.toFixed(2).replace('.', ',')}`,
      icon: DollarSign,
      color: 'from-purple-600 to-purple-700',
      textColor: 'text-purple-400',
    },
    {
      label: 'Saldo Google Ads',
      value: `R$ ${totalGoogleBalance.toFixed(2).replace('.', ',')}`,
      icon: TrendingUp,
      color: 'from-cyan-600 to-cyan-700',
      textColor: 'text-cyan-400',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
      {kpis.map((kpi, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.1 }}
          className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#181C25] to-[#0F1117] border border-[#2A2F3A] p-6 hover:border-[#3A3F4A] transition-all hover:shadow-lg hover:shadow-black/50"
        >
          {/* Gradient Background */}
          <div
            className={`absolute inset-0 opacity-5 bg-gradient-to-br ${kpi.color} group-hover:opacity-10 transition-opacity`}
          />

          {/* Content */}
          <div className="relative z-10 flex items-start justify-between">
            <div className="flex-1">
              <p className="text-[#A1A1AA] text-sm font-medium mb-2">
                {kpi.label}
              </p>
              <h3 className={`text-3xl font-bold ${kpi.textColor}`}>
                {kpi.value}
              </h3>
            </div>
            <div
              className={`w-12 h-12 rounded-xl bg-gradient-to-br ${kpi.color} flex items-center justify-center flex-shrink-0 opacity-20 group-hover:opacity-30 transition-opacity`}
            >
              <kpi.icon size={24} className="text-white" />
            </div>
          </div>

          {/* Accent Border */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br opacity-0 group-hover:opacity-5 rounded-full blur-3xl pointer-events-none" />
        </motion.div>
      ))}
    </div>
  );
}
