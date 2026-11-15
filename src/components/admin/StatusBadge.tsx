import { cn } from '@/lib/utils';

/** Shared colours + Vietnamese labels for the `Status` enum (blogs, projects). */
export const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  DRAFT: { label: 'Bản nháp', className: 'bg-amber-500/10 text-amber-700 border-amber-500/20' },
  PUBLISHED: { label: 'Đã xuất bản', className: 'bg-green-500/10 text-green-700 border-green-500/20' },
  ARCHIVED: { label: 'Lưu trữ', className: 'bg-muted text-muted-foreground border-border' },
};

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const config = STATUS_BADGE[status] ?? { label: status, className: STATUS_BADGE.ARCHIVED.className };
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 text-xs rounded-full font-medium border whitespace-nowrap',
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}
