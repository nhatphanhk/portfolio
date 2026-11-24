import { cn } from '@/lib/utils';

export interface DailyColumn {
  /** YYYY-MM-DD */
  day: string;
  value: number;
  /** Extra tooltip lines, e.g. "Khách: 12". */
  details?: string[];
}

const fmtDay = (day: string) => {
  const [, m, d] = day.split('-');
  return `${Number(d)}/${Number(m)}`;
};

/**
 * Single-series daily column chart (no legend: the panel title names the series).
 * Thin columns anchored to the baseline, a recessive max gridline, a CSS hover tooltip per
 * column (hit target = full column height) and a screen-reader table with the same data.
 */
export function DailyColumnChart({
  data,
  label,
  unit,
  className,
  barClassName = 'bg-primary/70 group-hover:bg-primary',
}: {
  data: DailyColumn[];
  /** Accessible name of the series, e.g. "Lượt xem trang". */
  label: string;
  unit: string;
  className?: string;
  barClassName?: string;
}) {
  const max = Math.max(...data.map(d => d.value), 1);
  const labelEvery = data.length <= 14 ? 1 : data.length <= 31 ? 5 : 15;

  return (
    <figure className={cn('w-full', className)}>
      <div className="relative h-40" aria-hidden="true">
        <div className="absolute inset-x-0 top-0 border-t border-dashed border-border" />
        <span className="absolute -top-2 right-0 bg-card pl-1 text-[10px] text-muted-foreground tabular-nums">
          {max.toLocaleString('vi-VN')}
        </span>
        <div className="absolute inset-0 flex items-end gap-px sm:gap-0.5 border-b border-border">
          {data.map(d => {
            const pct = (d.value / max) * 100;
            return (
              <div key={d.day} className="group relative flex-1 h-full flex items-end">
                <div
                  className={cn('w-full rounded-t-[3px] transition-colors', barClassName)}
                  style={{ height: `${d.value > 0 ? Math.max(pct, 2) : 0}%` }}
                />
                <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 hidden -translate-x-1/2 whitespace-nowrap rounded-md border border-border bg-popover px-2 py-1 text-xs text-popover-foreground shadow-md group-hover:block">
                  <p className="font-semibold">{fmtDay(d.day)}</p>
                  <p>
                    {d.value.toLocaleString('vi-VN')} {unit}
                  </p>
                  {d.details?.map(line => (
                    <p key={line} className="text-muted-foreground">
                      {line}
                    </p>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="flex gap-px sm:gap-0.5 mt-1" aria-hidden="true">
        {data.map((d, i) => (
          <span key={d.day} className="flex-1 text-center text-[10px] text-muted-foreground tabular-nums overflow-visible whitespace-nowrap">
            {i % labelEvery === 0 ? fmtDay(d.day) : ''}
          </span>
        ))}
      </div>
      <table className="sr-only">
        <caption>{label}</caption>
        <thead>
          <tr>
            <th scope="col">Ngày</th>
            <th scope="col">{unit}</th>
          </tr>
        </thead>
        <tbody>
          {data.map(d => (
            <tr key={d.day}>
              <td>{d.day}</td>
              <td>{d.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
