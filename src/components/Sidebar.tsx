'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ChevronLeft,
  Users,
  CheckSquare,
  Zap,
  Settings,
  LogOut,
  Menu,
  Grid2x2,
  Radio,
  Search,
  TrendingUp,
  Bell,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const GoogleLogo = ({ size = 16, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

const MetaLogo = ({ size = 16, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 36 36" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M30.68 15.35c-3.15-2.45-6.84-2.86-9.5-1.07-1.55 1.04-2.9 2.92-3.8 4.41-.83-1.48-2.09-3.26-3.51-4.32-2.64-1.97-6.55-1.74-9.84.66-4.59 3.33-5.22 10.1-.81 13.9 3.14 2.68 6.91 3.1 9.61 1.35 1.57-1.01 2.9-2.85 3.73-4.33.82 1.48 2.07 3.25 3.5 4.33 2.65 1.99 6.55 1.76 9.87-.66 4.54-3.32 5.15-10.13.75-14.27zm-1.89 10.97c-2.15 1.58-4.66 1.45-6.24.27-.85-.63-1.66-1.74-2.58-3.41 1.02-1.78 2-3.19 2.98-3.88 1.58-1.12 3.94-1 6.07.56 2.88 2.11 2.45 5.09-.23 6.46zm-17.78-.17c-1.63 1.05-3.93.93-5.94-.52-2.9-2.11-2.45-6.31.25-8.29 2.13-1.57 4.63-1.42 6.2.29.84.62 1.63 1.7 2.52 3.32-1 1.71-1.97 3.09-2.92 3.82z" fill="#0668E1"/>
  </svg>
);

const menuItems = [
  { icon: Users, label: 'Clientes', href: '/clientes' },
  { icon: CheckSquare, label: 'Demandas', href: '/demandas' },
  { icon: Grid2x2, label: 'AB Overview', href: '/ab-overview' },
  { icon: TrendingUp, label: 'Análise Diária de Desempenho', href: '/ab-tracking' },
  { icon: Bell, label: 'Alertas de Saldos', href: '/alertas-saldos' },
  { icon: MetaLogo, label: 'Meta Ads', href: '/meta-ads' },
  { icon: GoogleLogo, label: 'Google Ads', href: '/google-ads' },
  { icon: Zap, label: 'Automacao IA', href: '/automacao' },
];

const ROLE_LABEL: Record<string, string> = {
  admin:  'Admin',
  editor: 'Editor',
  viewer: 'Viewer',
};

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  return (
    <motion.div
      initial={{ width: 280 }}
      animate={{ width: isCollapsed ? 80 : 280 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="h-screen bg-[#050505] border-r border-white/5 flex flex-col z-40 flex-shrink-0"
    >
      <div className="p-6 pb-8 border-b border-white/5 flex items-center justify-between">
        {!isCollapsed && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#EF4444]/10 border border-[#EF4444]/20 flex items-center justify-center shadow-[0_0_15px_rgba(239,68,68,0.2)]">
              <span className="text-[#EF4444] font-bold text-xs tracking-wider">AB</span>
            </div>
            <div className="flex flex-col">
              <span className="text-white font-semibold text-[13px] tracking-wide">AB Track</span>
              <span className="text-[10px] text-[#A1A1AA] uppercase tracking-widest font-medium">Premium</span>
            </div>
          </div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 hover:bg-white/5 rounded-lg transition-colors text-[#A1A1AA] hover:text-white"
        >
          {isCollapsed ? <Menu size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-300 group relative overflow-hidden ${
                active
                  ? 'bg-[#EF4444]/[0.08] text-white border border-[#EF4444]/20 shadow-[inset_0_0_20px_rgba(239,68,68,0.05)]'
                  : 'text-[#A1A1AA] hover:bg-white/[0.04] hover:text-white border border-transparent'
              }`}
            >
              <item.icon size={18} className={`flex-shrink-0 transition-colors ${active ? 'text-[#EF4444]' : 'group-hover:text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]'}`} />
              {!isCollapsed && (
                <>
                  <span className={`text-[13px] flex-1 truncate transition-colors ${active ? 'font-semibold' : 'font-medium'}`}>{item.label}</span>
                </>
              )}
              {isCollapsed && active && (
                <div className="absolute -right-0.5 top-1/2 -translate-y-1/2 w-1 h-6 bg-[#EF4444] rounded-l-full shadow-[0_0_8px_#EF4444]" />
              )}
              {isCollapsed && (
                <div className="absolute left-full ml-3 px-3 py-1.5 bg-[#0A0A0A] border border-white/10 rounded-lg text-xs font-medium text-white whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 shadow-2xl">
                  {item.label}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/5 space-y-1">
        {/* User badge */}
        {user && !isCollapsed && (
          <div className="flex items-center gap-2.5 px-3 py-2.5 mb-2 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors cursor-pointer">
            <div className="w-7 h-7 rounded-full bg-[#EF4444]/20 border border-[#EF4444]/30 flex items-center justify-center flex-shrink-0">
              <span className="text-[#EF4444] text-[11px] font-bold uppercase">
                {user.username.charAt(0)}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-medium truncate">{user.username}</p>
              <p className="text-[#6B7280] text-[10px]">{ROLE_LABEL[user.role] ?? user.role}</p>
            </div>
          </div>
        )}

        <Link
          href="/configuracoes"
          className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all text-[13px] font-medium group relative ${
            isActive('/configuracoes')
              ? 'bg-[#EF4444]/[0.08] text-white border border-[#EF4444]/20 shadow-[inset_0_0_20px_rgba(239,68,68,0.05)]'
              : 'text-[#A1A1AA] hover:bg-white/[0.04] hover:text-white border border-transparent'
          }`}
        >
          <Settings size={16} className={`flex-shrink-0 ${isActive('/configuracoes') ? 'text-[#EF4444]' : 'group-hover:text-white'}`} />
          {!isCollapsed && <span>Configurações</span>}
          {isCollapsed && (
            <div className="absolute left-full ml-3 px-3 py-1.5 bg-[#0A0A0A] border border-white/10 rounded-lg text-xs text-white whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 shadow-2xl">
              Configurações
            </div>
          )}
        </Link>
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[#A1A1AA] hover:bg-red-500/10 hover:text-red-400 border border-transparent transition-all text-[13px] font-medium group relative"
        >
          <LogOut size={16} className="flex-shrink-0" />
          {!isCollapsed && <span>Sair</span>}
          {isCollapsed && (
            <div className="absolute left-full ml-3 px-3 py-1.5 bg-[#0A0A0A] border border-white/10 rounded-lg text-xs text-white whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 shadow-2xl">
              Sair
            </div>
          )}
        </button>
      </div>
    </motion.div>
  );
}