'use client';

import { Clock, Play, MessageCircle, Eye, CheckCircle2, Archive, ChevronDown } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { DemandaStatus, STATUS_CONFIG } from '@/types/demandas';

// ─── Icon map ───────────────────────────────────────────────────────────────

export const STATUS_ICONS: Record<DemandaStatus, LucideIcon> = {
  aberta:             Clock,
  em_andamento:       Play,
  aguardando_cliente: MessageCircle,
  em_revisao:         Eye,
  concluida:          CheckCircle2,
  arquivada:          Archive,
};

// ─── Props ──────────────────────────────────────────────────────────────────

interface StatusBadgeProps {
  status: DemandaStatus;
  /** 'sm' = 11px icon, xs text (cards) | 'md' = 13px icon, sm text (drawer header) */
  size?: 'sm' | 'md';
  /** Show the chevron for dropdown trigger */
  showChevron?: boolean;
  onClick?: (e?: React.MouseEvent) => void;
  className?: string;
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function StatusBadge({
  status,
  size = 'sm',
  showChevron = false,
  onClick,
  className = '',
}: StatusBadgeProps) {
  const cfg  = STATUS_CONFIG[status];
  const Icon = STATUS_ICONS[status];

  const iconSize = size === 'sm' ? 11 : 13;
  const padding  = size === 'sm' ? 'px-2 py-1 text-xs' : 'px-2.5 py-1.5 text-sm';

  const inner = (
    <>
      <Icon size={iconSize} />
      <span>{cfg.label}</span>
      {showChevron && <ChevronDown size={9} className="opacity-60" />}
    </>
  );

  if (onClick) {
    return (
      <button
        onClick={onClick}
        className={`inline-flex items-center gap-1.5 font-medium rounded-md transition-all duration-200 ${cfg.bg} ${cfg.color} ${padding} hover:brightness-110 ${className}`}
      >
        {inner}
      </button>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-md ${cfg.bg} ${cfg.color} ${padding} ${className}`}
    >
      {inner}
    </span>
  );
}
