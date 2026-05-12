'use client';

export type UrgencyLevel = 'overdue' | 'urgent' | 'soon' | 'ok' | 'none';

const URGENCY_CONFIG: Record<UrgencyLevel, { bar: string; dot: string; label: (d: number) => string }> = {
  overdue: {
    bar: 'bg-red-500',
    dot: 'bg-red-500',
    label: (d) => `Vencido há ${Math.abs(d)} dia${Math.abs(d) !== 1 ? 's' : ''}`,
  },
  urgent: {
    bar: 'bg-orange-500',
    dot: 'bg-orange-500',
    label: (d) => (d === 0 ? 'Vence hoje!' : `Vence em ${d} dia${d !== 1 ? 's' : ''}`),
  },
  soon: {
    bar: 'bg-yellow-400',
    dot: 'bg-yellow-400',
    label: (d) => `Vence em ${d} dias`,
  },
  ok: {
    bar: 'bg-emerald-500',
    dot: 'bg-emerald-500',
    label: (d) => `Vence em ${d} dias`,
  },
  none: {
    bar: 'bg-transparent',
    dot: 'bg-transparent',
    label: () => 'Sem prazo definido',
  },
};

export function getUrgency(prazoEntrega: string): { level: UrgencyLevel; days: number } {
  if (!prazoEntrega) return { level: 'none', days: 0 };

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  // Parse as local date to avoid timezone shifts
  const [y, m, d] = prazoEntrega.split('-').map(Number);
  const deadline = new Date(y, m - 1, d);
  const diffMs = deadline.getTime() - today.getTime();
  const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (days < 0) return { level: 'overdue', days };
  if (days <= 3) return { level: 'urgent', days };
  if (days <= 7) return { level: 'soon', days };
  return { level: 'ok', days };
}

interface UrgencyBarProps {
  /** ISO date 'YYYY-MM-DD' or empty string */
  prazoEntrega: string;
}

/**
 * Barra vertical colorida (4 px) com tooltip.
 * Deve ser colocada dentro de um <td className="p-0 w-[4px]">.
 */
export function UrgencyBar({ prazoEntrega }: UrgencyBarProps) {
  const { level, days } = getUrgency(prazoEntrega);
  const cfg = URGENCY_CONFIG[level];
  const tooltip = cfg.label(days);

  return (
    <div className="group/urgency relative w-[4px] min-h-[44px] h-full">
      {/* Barra colorida */}
      <div
        className={`absolute inset-0 ${cfg.bar} transition-opacity duration-200 group-hover/urgency:opacity-70`}
      />

      {/* Tooltip — aparece à direita da barra */}
      <div
        className={`
          pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-3 z-[60]
          opacity-0 group-hover/urgency:opacity-100 transition-opacity duration-150
          bg-[#0B1020] border border-white/10 text-white text-xs font-medium
          rounded-lg px-2.5 py-1.5 whitespace-nowrap shadow-xl
          flex items-center gap-2
        `}
      >
        {level !== 'none' && (
          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${cfg.dot}`} />
        )}
        {tooltip}
      </div>
    </div>
  );
}
