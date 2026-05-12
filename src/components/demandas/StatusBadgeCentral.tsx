'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Clock, Play, MessageCircle, CreditCard,
  CheckCircle2, RefreshCw, PauseCircle, XCircle,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { DemandaClienteStatus } from '@/types/demandasCentral';

// ─── Config ─────────────────────────────────────────────────────────────────

interface StatusCfg {
  icon: LucideIcon;
  bg: string;        // tailwind bg
  text: string;      // tailwind text
  dot: string;       // solid color for dot fallbacks
}

export const STATUS_CENTRAL_CONFIG: Record<DemandaClienteStatus, StatusCfg> = {
  'A fazer':              { icon: Clock,         bg: 'bg-yellow-400/15',  text: 'text-yellow-300',   dot: 'bg-yellow-400'  },
  'Em andamento':         { icon: Play,          bg: 'bg-emerald-500/15', text: 'text-emerald-400',  dot: 'bg-emerald-500' },
  'Aguardando cliente':   { icon: MessageCircle, bg: 'bg-orange-500/15',  text: 'text-orange-400',   dot: 'bg-orange-500'  },
  'Aguardando pagamento': { icon: CreditCard,    bg: 'bg-purple-500/15',  text: 'text-purple-400',   dot: 'bg-purple-500'  },
  'Feito':                { icon: CheckCircle2,  bg: 'bg-emerald-600/20', text: 'text-emerald-300',  dot: 'bg-emerald-600' },
  'Recorrente':           { icon: RefreshCw,     bg: 'bg-blue-500/15',    text: 'text-blue-400',     dot: 'bg-blue-500'    },
  'Pausado':              { icon: PauseCircle,   bg: 'bg-stone-500/15',   text: 'text-stone-400',    dot: 'bg-stone-500'   },
  'Cancelado':            { icon: XCircle,       bg: 'bg-red-500/15',     text: 'text-red-400',      dot: 'bg-red-500'     },
};

const ALL_STATUS_OPTIONS: DemandaClienteStatus[] = [
  'A fazer', 'Em andamento', 'Aguardando cliente', 'Aguardando pagamento',
  'Feito', 'Recorrente', 'Pausado', 'Cancelado',
];

// ─── Component ──────────────────────────────────────────────────────────────

interface StatusBadgeCentralProps {
  status: DemandaClienteStatus;
  onChange?: (status: DemandaClienteStatus) => void;
  size?: 'sm' | 'md';
  fullWidth?: boolean;
}

export function StatusBadgeCentral({
  status,
  onChange,
  size = 'sm',
  fullWidth = false,
}: StatusBadgeCentralProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const cfg  = STATUS_CENTRAL_CONFIG[status] ?? STATUS_CENTRAL_CONFIG['A fazer'];
  const Icon = cfg.icon;

  const iconSize  = size === 'sm' ? 12 : 14;
  const textClass = size === 'sm' ? 'text-[13px]' : 'text-sm';
  const padding   = size === 'sm' ? 'px-3 py-1.5' : 'px-3.5 py-2';

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
      {/* Visible badge */}
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
        {status}
      </div>

      {/* Custom Dropdown Overlay */}
      {isOpen && onChange && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[220px] bg-[#0F1523] border border-white/10 rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.5)] py-1.5 z-[9999] flex flex-col backdrop-blur-xl">
          <div className="px-3 py-1.5 border-b border-white/5 mb-1">
            <span className="text-[11px] font-semibold tracking-wider text-[#94A3B8] uppercase">Alterar Status</span>
          </div>
          {ALL_STATUS_OPTIONS.map(s => {
            const OptionIcon = STATUS_CENTRAL_CONFIG[s].icon;
            const isActive = s === status;
            return (
              <button
                key={s}
                onClick={() => {
                  onChange(s);
                  setIsOpen(false);
                }}
                className={`
                  flex items-center gap-3 px-3 py-2 text-[13px] text-left transition-colors mx-1.5 rounded-md
                  ${isActive ? 'bg-[#3B82F6]/10 text-white' : 'text-[#94A3B8] hover:bg-white/5 hover:text-white'}
                `}
              >
                <div className={`flex items-center justify-center w-5 h-5 rounded-md ${STATUS_CENTRAL_CONFIG[s].bg} ${STATUS_CENTRAL_CONFIG[s].text}`}>
                  <OptionIcon size={12} />
                </div>
                <span className="flex-1 font-medium">{s}</span>
                {isActive && <CheckCircle2 size={14} className="text-[#3B82F6]" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
