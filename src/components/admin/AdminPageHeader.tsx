import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface AdminPageHeaderProps {
  title: string;
  /** Subtitle or item count, e.g. "12 bài viết". */
  description?: ReactNode;
  /** Primary actions, rendered on the right (stacked below on phones). */
  actions?: ReactNode;
  className?: string;
}

/** Page title row shared by every admin list page. */
export function AdminPageHeader({ title, description, actions, className }: AdminPageHeaderProps) {
  return (
    <div className={cn('flex flex-col sm:flex-row sm:items-center justify-between gap-4', className)}>
      <div className="min-w-0">
        <h1 className="text-2xl font-bold text-foreground">{title}</h1>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">{actions}</div>}
    </div>
  );
}

/** Standard admin page container: one width for every list page. */
export const ADMIN_PAGE_CLASS = 'flex flex-1 flex-col gap-6 p-4 sm:p-6 w-full max-w-6xl mx-auto';
