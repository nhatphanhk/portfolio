/** Horizontal "label — bar — value" row used by the admin dashboards. */
export function MiniBar({
  label,
  value,
  max,
  color = 'bg-primary/60',
  labelClassName = 'w-24',
}: {
  label: string;
  value: number;
  max: number;
  color?: string;
  labelClassName?: string;
}) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="flex items-center gap-3" title={`${label}: ${value}`}>
      <span className={`text-xs text-muted-foreground shrink-0 truncate ${labelClassName}`}>{label}</span>
      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-medium text-foreground w-10 text-right tabular-nums">{value.toLocaleString('vi-VN')}</span>
    </div>
  );
}
