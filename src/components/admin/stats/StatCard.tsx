import type { ComponentType } from 'react';
import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

const COLORS = {
  default: 'bg-muted text-muted-foreground',
  green: 'bg-green-500/10 text-green-600 dark:text-green-400',
  yellow: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400',
  blue: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  purple: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
} as const;

export interface StatCardProps {
  title: string;
  value: number | string;
  icon: ComponentType<{ className?: string }>;
  color?: keyof typeof COLORS;
  sub?: string;
  /** Change vs the previous period, in percent; null when there is no baseline. */
  delta?: number | null;
  deltaLabel?: string;
}

/** Admin KPI card (label + icon chip, big number, optional caption and period-over-period change). */
export function StatCard({ title, value, icon: Icon, color = 'default', sub, delta, deltaLabel = 'so với kỳ trước' }: StatCardProps) {
  const DeltaIcon = delta == null || delta === 0 ? Minus : delta > 0 ? ArrowUpRight : ArrowDownRight;
  return (
    <div className="p-5 rounded-xl border border-border bg-card">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <div className={cn('p-2 rounded-lg', COLORS[color])}>
          <Icon className="h-4 w-4" aria-hidden="true" />
        </div>
      </div>
      <p className="text-3xl font-bold text-foreground">{value}</p>
      {delta !== undefined && (
        <p className="text-xs text-muted-foreground mt-1 inline-flex items-center gap-1">
          <DeltaIcon className="h-3.5 w-3.5" aria-hidden="true" />
          {delta == null ? 'Chưa có kỳ trước' : `${delta > 0 ? '+' : ''}${delta}% ${deltaLabel}`}
        </p>
      )}
      {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
    </div>
  );
}

/** Percent change, rounded; null when the previous value is 0. */
export function percentChange(current: number, previous: number): number | null {
  if (previous === 0) return current === 0 ? 0 : null;
  return Math.round(((current - previous) / previous) * 100);
}
