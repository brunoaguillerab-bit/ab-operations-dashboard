'use client';

import { useState, useRef, useEffect } from 'react';
import { Briefcase, Target, UserCheck, CheckCircle2 } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { ClienteCategoria } from '@/types/demandasCentral';

interface CategoriaCfg {
  icon: LucideIcon;
  bg: string;
  text: string;
  label: string;
}

export const CATEGORIA_CONFIG: Record<ClienteCategoria, CategoriaCfg> = {
  'Workana': { icon: Briefcase, bg: 'bg-blue-500/15', text: 'text-blue-400', label: 'Workana' },
  'AB Tracking': { icon: Target, bg: 'bg-emerald-500/15', text: 'text-emerald-400', label: 'AB Tracking' },
  'Pontuais': { icon: UserCheck, bg: 'bg-purple-500/15', text: 'text-purple-400', label: 'Clientes Pontuais' },
};

const ALL_CATEGORIAS: ClienteCategoria[] = ['Workana', 'AB Tracking', 'Pontuais'];

interface CategoriaBadgeProps {
  categoria: ClienteCategoria;
  onChange?: (categoria: ClienteCategoria) => void;
  size?: 'sm' | 'md';
  fullWidth?: boolean;
}

export function CategoriaBadgeCentral({
  categoria,
  onChange,
  size = 'sm',
  fullWidth = false,
}: CategoriaBadgeProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const cfg = CATEGORIA_CONFIG[categoria] ?? CATEGORIA_CONFIG['Workana'];
  const Icon = cfg.icon;

  const iconSize = size === 'sm' ? 12 : 14;
  const textClass = size === 'sm' ? 'text-[13px]' : 'text-sm';
  const padding = size === 'sm' ? 'px-3 py-1.5' : 'px-3.5 py-2';

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div ref={containerRef} className={`relative inline-flex ${fullWidth ? 'w-full justify-center' : ''}`}>
      <div
        onClick={() => onChange && setIsOpen(!isOpen)}
        className={`
          inline-flex items-center gap-1.5 font-semibold rounded-md select-none
          transition-all duration-200
          ${cfg.bg} ${cfg.text} ${textClass} ${padding}
          ${fullWidth ? 'w-full justify-center' : ''}
          ${onChange ? 'cursor-pointer hover:brightness-125' : ''}
          ${isOpen ? 'ring-2 ring-[#3B82F6]/50' : ''}
        `}
      >
        <Icon size={iconSize} />
        {cfg.label}
      </div>

      {isOpen && onChange && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[220px] bg-[#0F1523] border border-white/10 rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.5)] py-1.5 z-[9999] flex flex-col backdrop-blur-xl">
          <div className="px-3 py-1.5 border-b border-white/5 mb-1">
            <span className="text-[11px] font-semibold tracking-wider text-[#94A3B8] uppercase">Alterar Origem</span>
          </div>
          {ALL_CATEGORIAS.map(c => {
            const OptionIcon = CATEGORIA_CONFIG[c].icon;
            const isActive = c === categoria;
            return (
              <button
                key={c}
                onClick={() => {
                  onChange(c);
                  setIsOpen(false);
                }}
                className={`
                  flex items-center gap-3 px-3 py-2 text-[13px] text-left transition-colors mx-1.5 rounded-md
                  ${isActive ? 'bg-[#3B82F6]/10 text-white' : 'text-[#94A3B8] hover:bg-white/5 hover:text-white'}
                `}
              >
                <div className={`flex items-center justify-center w-5 h-5 rounded-md ${CATEGORIA_CONFIG[c].bg} ${CATEGORIA_CONFIG[c].text}`}>
                  <OptionIcon size={12} />
                </div>
                <span className="flex-1 font-medium">{CATEGORIA_CONFIG[c].label}</span>
                {isActive && <CheckCircle2 size={14} className="text-[#3B82F6]" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
