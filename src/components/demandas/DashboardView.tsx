'use client';

import { ClienteDemanda } from '@/types/demandasCentral';
import { BarChart3, TrendingUp, Clock, CheckCircle2, AlertCircle, Users, Activity } from 'lucide-react';

interface DashboardViewProps {
  items: ClienteDemanda[];
  stats: { total: number; pendentes: number; andamento: number; concluidas: number; atraso: number };
}

export function DashboardView({ items, stats }: DashboardViewProps) {
  // Mock data for visual appeal, based on items where possible
  const responsaveis = Array.from(new Set(items.map(i => i.responsavel).filter(Boolean)));
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        <StatCard title="Total Tarefas" value={stats.total} icon={BarChart3} />
        <StatCard title="Pendentes" value={stats.pendentes} icon={AlertCircle} tone="warning" />
        <StatCard title="Em Andamento" value={stats.andamento} icon={Activity} tone="info" />
        <StatCard title="Concluídas" value={stats.concluidas} icon={CheckCircle2} tone="success" />
        <StatCard title="Atrasadas" value={stats.atraso} icon={Clock} tone="danger" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Main Chart Area Mockup */}
          <div className="bg-[#121826] border border-white/10 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-[#F3F4F6] font-semibold text-lg">Performance Semanal</h3>
                <p className="text-[#94A3B8] text-sm">Tarefas concluídas x Criadas</p>
              </div>
              <select className="bg-[#0B1020] border border-white/10 rounded-lg px-3 py-1.5 text-sm text-[#F3F4F6]">
                <option>Últimos 7 dias</option>
                <option>Últimos 30 dias</option>
              </select>
            </div>
            <div className="h-[240px] flex items-end justify-between gap-2 px-2">
              {[40, 60, 35, 80, 55, 90, 45].map((h, i) => (
                <div key={i} className="w-full flex flex-col justify-end gap-1 group">
                  <div className="w-full bg-[#3B82F6]/20 rounded-t-sm" style={{ height: `${h * 0.7}%` }}></div>
                  <div className="w-full bg-[#3B82F6] rounded-t-sm" style={{ height: `${h}%` }}></div>
                  <span className="text-[10px] text-[#94A3B8] text-center mt-2 group-hover:text-white transition-colors">
                    {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'][i]}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* SLA & Time */}
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-[#121826] border border-white/10 rounded-2xl p-6 flex flex-col justify-between">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                  <TrendingUp size={20} />
                </div>
                <div>
                  <h4 className="text-[#F3F4F6] font-medium">SLA de Entrega</h4>
                  <p className="text-[11px] text-[#94A3B8]">Dentro do prazo</p>
                </div>
              </div>
              <div>
                <span className="text-4xl font-bold text-white">94%</span>
                <span className="text-emerald-400 text-sm ml-2">+2.4%</span>
              </div>
              <div className="w-full h-1.5 bg-[#0B1020] rounded-full mt-4 overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: '94%' }}></div>
              </div>
            </div>

            <div className="bg-[#121826] border border-white/10 rounded-2xl p-6 flex flex-col justify-between">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
                  <Clock size={20} />
                </div>
                <div>
                  <h4 className="text-[#F3F4F6] font-medium">Tempo Médio</h4>
                  <p className="text-[11px] text-[#94A3B8]">Por tarefa</p>
                </div>
              </div>
              <div>
                <span className="text-4xl font-bold text-white">2.4</span>
                <span className="text-[#94A3B8] text-sm ml-1">dias</span>
              </div>
              <p className="text-xs text-[#94A3B8] mt-4 flex items-center gap-1">
                <TrendingUp size={12} className="text-emerald-400" /> 12% mais rápido que a média
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Team Performance */}
          <div className="bg-[#121826] border border-white/10 rounded-2xl p-6">
            <h3 className="text-[#F3F4F6] font-semibold text-lg mb-6 flex items-center gap-2">
              <Users size={18} className="text-[#8B5CF6]" /> Produtividade da Equipe
            </h3>
            <div className="space-y-5">
              {responsaveis.slice(0, 5).map((user, i) => {
                const userTasks = items.filter(t => t.responsavel === user);
                const percent = Math.min(100, (userTasks.length / items.length) * 100 * 3); // mock calculation
                return (
                  <div key={i} className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#3B82F6] to-[#8B5CF6] flex items-center justify-center text-xs font-bold text-white">
                      {user.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium text-[#F3F4F6]">{user}</span>
                        <span className="text-xs text-[#94A3B8]">{userTasks.length} tarefas</span>
                      </div>
                      <div className="w-full h-1.5 bg-[#0B1020] rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6]" style={{ width: `${percent}%` }}></div>
                      </div>
                    </div>
                  </div>
                );
              })}
              {responsaveis.length === 0 && (
                <p className="text-sm text-[#94A3B8] text-center">Sem dados de equipe.</p>
              )}
            </div>
          </div>

          {/* Heatmap Mockup */}
          <div className="bg-[#121826] border border-white/10 rounded-2xl p-6">
            <h3 className="text-[#F3F4F6] font-semibold text-lg mb-4 flex items-center gap-2">
              <Activity size={18} className="text-[#EC4899]" /> Heatmap de Atividade
            </h3>
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: 28 }).map((_, i) => (
                <div 
                  key={i} 
                  className={`aspect-square rounded-sm ${
                    i % 7 === 0 || i % 7 === 6 ? 'bg-[#0B1020]' : 
                    Math.random() > 0.7 ? 'bg-emerald-500/80' : 
                    Math.random() > 0.4 ? 'bg-emerald-500/40' : 'bg-[#1A2235]'
                  }`} 
                  title="Atividade diária"
                />
              ))}
            </div>
            <div className="flex justify-between items-center mt-3 text-[10px] text-[#94A3B8]">
              <span>Menos</span>
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-sm bg-[#1A2235]"></div>
                <div className="w-2 h-2 rounded-sm bg-emerald-500/40"></div>
                <div className="w-2 h-2 rounded-sm bg-emerald-500/80"></div>
              </div>
              <span>Mais</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, tone = 'default' }: { title: string, value: number, icon: any, tone?: 'default' | 'success' | 'warning' | 'danger' | 'info' }) {
  const toneStyles = {
    default: 'text-white bg-white/5 text-[#94A3B8]',
    success: 'text-emerald-400 bg-emerald-500/10 text-emerald-500',
    warning: 'text-orange-400 bg-orange-500/10 text-orange-500',
    danger: 'text-red-400 bg-red-500/10 text-red-500',
    info: 'text-blue-400 bg-blue-500/10 text-blue-500',
  };
  
  return (
    <div className="bg-[#121826] border border-white/10 rounded-2xl p-5 relative overflow-hidden group hover:border-white/20 transition-colors">
      <div className={`absolute -right-4 -top-4 w-16 h-16 rounded-full blur-2xl opacity-20 ${toneStyles[tone].split(' ')[1]}`}></div>
      <div className="flex justify-between items-start mb-4">
        <p className="text-sm font-medium text-[#94A3B8]">{title}</p>
        <div className={`p-2 rounded-lg ${toneStyles[tone].split(' ')[1]}`}>
          <Icon size={16} className={toneStyles[tone].split(' ')[2]} />
        </div>
      </div>
      <div className="flex items-baseline gap-2">
        <h3 className={`text-3xl font-bold ${toneStyles[tone].split(' ')[0]}`}>{value}</h3>
      </div>
    </div>
  );
}
