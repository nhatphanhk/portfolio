import type { ReactNode } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { ADMIN_PAGE_CLASS } from '@/components/admin/AdminPageHeader';
import { cn } from '@/lib/utils';

/**
 * Building blocks for the admin `loading.tsx` files, all made from the shadcn `Skeleton`.
 * Each block mirrors the spacing of the real component it stands in for, so the page
 * swaps in without a layout jump. Keep them in sync when the real layouts change.
 */

const range = (n: number) => Array.from({ length: n }, (_, i) => i);

/** Row-varying widths so a list of skeleton rows doesn't look like a barcode. */
const LINE_WIDTHS = ['w-3/4', 'w-1/2', 'w-2/3', 'w-5/6', 'w-3/5'];
const lineWidth = (i: number) => LINE_WIDTHS[i % LINE_WIDTHS.length];

/** Root of every admin loading state: one "busy" announcement, shapes are decorative. */
export function AdminSkeletonPage({
  children,
  className = ADMIN_PAGE_CLASS,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <main className={className} aria-busy="true" aria-live="polite">
      <span className="sr-only">Đang tải…</span>
      {children}
    </main>
  );
}

/** Stand-in for `AdminPageHeader`: title + description, optional action buttons. */
export function PageHeaderSkeleton({
  actions = 1,
  titleWidth = 'w-40',
}: {
  actions?: number;
  titleWidth?: string;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4" aria-hidden="true">
      <div className="space-y-2">
        <Skeleton className={cn('h-7', titleWidth)} />
        <Skeleton className="h-4 w-28" />
      </div>
      {actions > 0 && (
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          {range(actions).map(i => (
            <Skeleton key={i} className={cn('h-9 rounded-lg', i === actions - 1 ? 'w-36' : 'w-28')} />
          ))}
        </div>
      )}
    </div>
  );
}

/** Search input + optional select dropdowns + filter chips, as on every list page. */
export function FilterBarSkeleton({ selects = 0, chips = 1 }: { selects?: number; chips?: number }) {
  return (
    <div className="flex flex-col sm:flex-row items-center gap-3" aria-hidden="true">
      <Skeleton className="h-9.5 w-full flex-1 rounded-xl" />
      {range(selects).map(i => (
        <Skeleton key={`s${i}`} className="h-9.5 w-full sm:w-56 rounded-xl" />
      ))}
      {range(chips).map(i => (
        <Skeleton key={`c${i}`} className="h-9.5 w-full sm:w-36 rounded-xl" />
      ))}
    </div>
  );
}

export type SkeletonCell = 'title' | 'avatar' | 'text' | 'tags' | 'badge' | 'number' | 'actions';

export interface SkeletonColumn {
  /** Real column header — rendered as text, since it is known before the data arrives. */
  label: string;
  cell: SkeletonCell;
  /** Same responsive class as the real `<th>`, e.g. `hidden md:table-cell`. */
  hide?: string;
  align?: 'left' | 'center' | 'right';
}

function CellSkeleton({ kind, row }: { kind: SkeletonCell; row: number }) {
  switch (kind) {
    case 'title':
      return (
        <div className="space-y-1.5 min-w-40">
          <Skeleton className={cn('h-4', lineWidth(row))} />
          <Skeleton className="h-3 w-24" />
        </div>
      );
    case 'avatar':
      return (
        <div className="flex items-center gap-2.5 min-w-40">
          <Skeleton className="h-8 w-8 shrink-0 rounded-full" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className={cn('h-4', lineWidth(row))} />
            <Skeleton className="h-3 w-32" />
          </div>
        </div>
      );
    case 'tags':
      return (
        <div className="flex gap-1">
          <Skeleton className="h-5 w-14 rounded-md" />
          {row % 3 !== 2 && <Skeleton className="h-5 w-12 rounded-md" />}
        </div>
      );
    case 'badge':
      return <Skeleton className="h-5 w-20 rounded-full" />;
    case 'number':
      return <Skeleton className="h-4 w-8 mx-auto" />;
    case 'actions':
      return (
        <div className="flex items-center justify-end gap-1">
          {range(3).map(i => (
            <Skeleton key={i} className="h-7 w-7 rounded-md" />
          ))}
        </div>
      );
    default:
      return <Skeleton className={cn('h-4', row % 2 ? 'w-20' : 'w-24')} />;
  }
}

/** Card-wrapped data table with the real headers, skeleton cells and a pagination footer. */
export function TableSkeleton({ columns, rows = 8 }: { columns: SkeletonColumn[]; rows?: number }) {
  return (
    <div className="rounded-xl border border-border bg-card shadow-xs overflow-hidden" aria-hidden="true">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/60 border-b border-border text-foreground/80 font-semibold text-xs uppercase tracking-wider">
            <tr>
              {columns.map(c => (
                <th
                  key={c.label}
                  className={cn(
                    'px-4 py-3.5 font-semibold',
                    c.align === 'right' ? 'text-right' : c.align === 'center' ? 'text-center' : 'text-left',
                    c.hide,
                  )}
                >
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {range(rows).map(r => (
              <tr key={r}>
                {columns.map(c => (
                  <td key={c.label} className={cn('px-4 py-3.5', c.hide)}>
                    <CellSkeleton kind={c.cell} row={r} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <PaginationSkeleton />
    </div>
  );
}

/** Footer matching `PaginationControl`: result count on the left, page buttons on the right. */
export function PaginationSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'p-4 bg-card border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3',
        className,
      )}
    >
      <Skeleton className="h-4 w-44" />
      <div className="flex items-center gap-1">
        {range(5).map(i => (
          <Skeleton key={i} className="h-8 w-8 rounded-lg" />
        ))}
      </div>
    </div>
  );
}

/** Grid of stat cards (label + icon chip, big number, optional caption). */
export function StatCardsSkeleton({
  count,
  className,
  padding = 'p-5',
  caption = true,
}: {
  count: number;
  /** Grid column classes, copied from the real page. */
  className: string;
  padding?: 'p-5' | 'p-6';
  caption?: boolean;
}) {
  return (
    <div className={cn('grid gap-4', className)} aria-hidden="true">
      {range(count).map(i => (
        <div key={i} className={cn('rounded-xl border border-border bg-card shadow-xs', padding)}>
          <div className={cn('flex items-center justify-between', padding === 'p-6' ? 'mb-4' : 'mb-3')}>
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-8 w-8 rounded-lg" />
          </div>
          <Skeleton className="h-9 w-14" />
          {caption && <Skeleton className="h-3 w-28 mt-2" />}
        </div>
      ))}
    </div>
  );
}

/** Bordered card with a heading row; put one of the body blocks below inside. */
export function PanelSkeleton({
  children,
  titleWidth = 'w-36',
  icon = true,
  className,
}: {
  children: ReactNode;
  titleWidth?: string;
  icon?: boolean;
  className?: string;
}) {
  return (
    <div className={cn('p-6 rounded-xl border border-border bg-card', className)} aria-hidden="true">
      <div className="flex items-center justify-between gap-3 mb-5">
        <Skeleton className={cn('h-5', titleWidth)} />
        {icon && <Skeleton className="h-4 w-4 rounded" />}
      </div>
      {children}
    </div>
  );
}

/** Divided list rows: leading icon, two lines of text, trailing status badge. */
export function ListRowsSkeleton({ rows = 3, badge = true }: { rows?: number; badge?: boolean }) {
  return (
    <div className="divide-y divide-border">
      {range(rows).map(i => (
        <div key={i} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
          <Skeleton className="h-4 w-4 shrink-0 rounded" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className={cn('h-4', lineWidth(i))} />
            <Skeleton className="h-3 w-20" />
          </div>
          {badge && <Skeleton className="h-5 w-20 shrink-0 rounded-full" />}
        </div>
      ))}
    </div>
  );
}

const BAR_WIDTHS = ['w-full', 'w-4/5', 'w-3/5', 'w-1/2', 'w-2/5', 'w-1/3', 'w-1/4', 'w-1/5'];

/** Horizontal "label — bar — value" rows (tag and status breakdowns). */
export function BarRowsSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {range(rows).map(i => (
        <div key={i} className="flex items-center gap-3">
          <Skeleton className="h-3 w-20 shrink-0" />
          <div className="flex-1">
            <Skeleton className={cn('h-2 rounded-full', BAR_WIDTHS[i % BAR_WIDTHS.length])} />
          </div>
          <Skeleton className="h-3 w-6 shrink-0" />
        </div>
      ))}
    </div>
  );
}

const COLUMN_HEIGHTS = ['h-8', 'h-14', 'h-10', 'h-20', 'h-12', 'h-16'];

/** Six-month column chart. */
export function ColumnChartSkeleton() {
  return (
    <div className="flex items-end gap-2 h-32">
      {COLUMN_HEIGHTS.map((h, i) => (
        <div key={i} className="flex-1 flex flex-col items-center justify-end gap-1 h-full">
          <Skeleton className={cn('w-full rounded-b-none', h)} />
          <Skeleton className="h-3 w-5" />
        </div>
      ))}
    </div>
  );
}
