'use client';

import { ElementType } from 'react';

interface PageHeaderProps {
  icon: ElementType | any;
  iconColor?: string;
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

/**
 * PageHeader — consistent header used across all dashboard pages.
 */
export default function PageHeader({
  icon: Icon,
  iconColor = 'from-[#EF4444] to-[#DC2626]',
  title,
  subtitle,
  actions,
}: PageHeaderProps) {
  return (
    <div className="px-8 lg:px-12 py-6 border-b border-white/5 bg-[#050505] flex items-center justify-between flex-shrink-0 z-10 sticky top-0">
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-[14px] bg-gradient-to-br ${iconColor} flex items-center justify-center flex-shrink-0 shadow-[0_4px_16px_rgba(0,0,0,0.4)] border border-white/10`}>
          <Icon size={22} className="text-white drop-shadow-md" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">{title}</h1>
          {subtitle && (
            <p className="text-[#A1A1AA] text-sm mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>
      {actions && (
        <div className="flex items-center gap-3">{actions}</div>
      )}
    </div>
  );
}
