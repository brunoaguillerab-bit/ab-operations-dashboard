'use client';

// Paleta de gradientes — cor consistente por nome (hash)
const GRADIENTS: [string, string][] = [
  ['#3B82F6', '#1D4ED8'], // blue
  ['#8B5CF6', '#6D28D9'], // purple
  ['#10B981', '#047857'], // emerald
  ['#F59E0B', '#B45309'], // amber
  ['#EF4444', '#B91C1C'], // red
  ['#EC4899', '#BE185D'], // pink
  ['#06B6D4', '#0E7490'], // cyan
  ['#F97316', '#C2410C'], // orange
  ['#6366F1', '#4338CA'], // indigo
  ['#14B8A6', '#0F766E'], // teal
];

function hashName(name: string): number {
  let h = 0;
  for (let i = 0; i < name.length; i++) {
    h = name.charCodeAt(i) + ((h << 5) - h);
  }
  return Math.abs(h);
}

function getGradient(name: string): [string, string] {
  return GRADIENTS[hashName(name) % GRADIENTS.length];
}

function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

interface ResponsibleAvatarProps {
  /** Nome do responsável */
  name: string;
  /** Email exibido no tooltip (opcional) */
  email?: string;
  /** Nome do usuário atual — se bater com name, exibe badge "Você" */
  currentUser?: string;
  /** sm = 24px · md = 32px */
  size?: 'sm' | 'md';
}

export function ResponsibleAvatar({
  name,
  email,
  currentUser,
  size = 'md',
}: ResponsibleAvatarProps) {
  if (!name) return <span className="text-[#64748B] text-sm">—</span>;

  const [from, to] = getGradient(name);
  const initials = getInitials(name);
  const isYou = !!currentUser && name.toLowerCase() === currentUser.toLowerCase();

  const dim = size === 'sm' ? 'w-6 h-6 text-[10px]' : 'w-8 h-8 text-[11px]';
  const tooltipText = email
    ? `${name} · ${email}`
    : `Responsável: ${name}${isYou ? ' (você)' : ''}`;

  return (
    <div className="group/avatar relative inline-flex items-center gap-2 min-w-0">
      {/* Avatar */}
      <div
        className={`${dim} rounded-full flex-shrink-0 flex items-center justify-center font-bold text-white shadow-sm ring-2 ring-white/5`}
        style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
      >
        {initials}
      </div>

      {/* Nome + badge Você */}
      <div className="flex items-center gap-1.5 min-w-0">
        <span className="text-sm text-[#E2E8F0] truncate">{name}</span>
        {isYou && (
          <span className="flex-shrink-0 text-[10px] font-semibold px-1.5 py-px rounded-full bg-[#3B82F6]/15 text-[#60A5FA] border border-[#3B82F6]/25 leading-tight">
            Você
          </span>
        )}
      </div>

      {/* Tooltip */}
      <div
        className="
          pointer-events-none
          absolute bottom-full left-0 mb-2 z-[70]
          opacity-0 group-hover/avatar:opacity-100
          transition-opacity duration-150
          bg-[#0B1020] border border-white/10 text-white text-xs font-medium
          rounded-lg px-3 py-2 whitespace-nowrap shadow-2xl
          flex items-center gap-2
        "
      >
        <div
          className="w-2 h-2 rounded-full flex-shrink-0"
          style={{ background: from }}
        />
        {tooltipText}
      </div>
    </div>
  );
}
