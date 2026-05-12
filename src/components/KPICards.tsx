import { OperationalTask } from '@/types';
import { Users, ListTodo, Clock, DollarSign, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

export default function KPICards({ tasks }: { tasks: OperationalTask[] }) {
  const activeClients = new Set(tasks.map(t => t.client_id)).size;
  const pending = tasks.filter(t => ['a_fazer', 'em_andamento', 'urgente'].includes(t.status || '')).length;
  const waiting = tasks.filter(t => t.status === 'aguardando_cliente').length;
  
  // Calculate distinct MRR from clients
  const clientMrrs = new Map();
  tasks.forEach(t => {
    if (t.clients && !clientMrrs.has(t.clients.id)) {
      clientMrrs.set(t.clients.id, Number(t.clients.mrr || 0));
    }
  });
  const mrr = Array.from(clientMrrs.values()).reduce((a, b) => a + b, 0);

  // Score calculation mock
  const total = tasks.length || 1;
  const completed = tasks.filter(t => t.status === 'feito').length;
  const score = Math.min(100, Math.round(((completed + 1) / (total + 1)) * 100) + 20);

  const formatBrl = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8"
    >
      <motion.div variants={item} className="glass-panel p-5 rounded-2xl border border-white/5 relative overflow-hidden group">
        <div className="flex justify-between items-start mb-2">
          <div className="text-zinc-400 text-xs font-semibold uppercase tracking-wider">Total Clientes</div>
          <Users size={16} className="text-zinc-500 group-hover:text-primary transition" />
        </div>
        <div className="text-3xl font-extrabold text-white">{activeClients}</div>
      </motion.div>

      <motion.div variants={item} className="glass-panel p-5 rounded-2xl border border-white/5 relative overflow-hidden group">
        <div className="flex justify-between items-start mb-2">
          <div className="text-zinc-400 text-xs font-semibold uppercase tracking-wider">Demandas Pendentes</div>
          <ListTodo size={16} className="text-zinc-500 group-hover:text-warning transition" />
        </div>
        <div className="text-3xl font-extrabold text-[#F59E0B]">{pending}</div>
      </motion.div>

      <motion.div variants={item} className="glass-panel p-5 rounded-2xl border border-white/5 relative overflow-hidden group">
        <div className="flex justify-between items-start mb-2">
          <div className="text-zinc-400 text-xs font-semibold uppercase tracking-wider">Aguardando Cliente</div>
          <Clock size={16} className="text-zinc-500 group-hover:text-orange-500 transition" />
        </div>
        <div className="text-3xl font-extrabold text-[#F97316]">{waiting}</div>
      </motion.div>

      <motion.div variants={item} className="glass-panel p-5 rounded-2xl border border-white/5 relative overflow-hidden group">
        <div className="flex justify-between items-start mb-2">
          <div className="text-zinc-400 text-xs font-semibold uppercase tracking-wider">Receita Mensal</div>
          <DollarSign size={16} className="text-zinc-500 group-hover:text-emerald-500 transition" />
        </div>
        <div className="text-3xl font-extrabold text-[#10b981]">{formatBrl(mrr)}</div>
      </motion.div>

      <motion.div variants={item} className="glass-panel p-5 rounded-2xl border border-white/5 relative overflow-hidden group">
        <div className="flex justify-between items-start mb-2">
          <div className="text-zinc-400 text-xs font-semibold uppercase tracking-wider">Score Operacional</div>
          <Activity size={16} className="text-zinc-500 group-hover:text-primary transition" />
        </div>
        <div className="text-3xl font-extrabold text-white">{score} <span className="text-sm font-normal text-zinc-500">/ 100</span></div>
        <div className="absolute bottom-0 left-0 w-full h-1 bg-white/5">
          <div className="h-full bg-primary" style={{ width: `${score}%` }}></div>
        </div>
      </motion.div>
    </motion.div>
  );
}
