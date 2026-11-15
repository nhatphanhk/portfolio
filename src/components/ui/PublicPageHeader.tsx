import type { ComponentType, ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface PublicPageHeaderProps {
  title: string;
  subtitle?: ReactNode;
  /** Small pill above the title. */
  badge?: { label: string; icon?: ComponentType<{ className?: string }> };
  /** Right-aligned slot (stats, download button…); stacks below the text on phones. */
  actions?: ReactNode;
  /** Extra content under the subtitle (e.g. stat pills). */
  children?: ReactNode;
  className?: string;
}

/** Title block shared by every public list page (blog, series, projects, skills, certifications, contact, resume). */
export function PublicPageHeader({ title, subtitle, badge, actions, children, className }: PublicPageHeaderProps) {
  const BadgeIcon = badge?.icon;
  return (
    <header className={cn('mb-10', className)}>
      {badge && (
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-3 bg-primary/10 text-primary border border-primary/20">
          {BadgeIcon && <BadgeIcon className="w-3.5 h-3.5" aria-hidden="true" />}
          <span>{badge.label}</span>
        </div>
      )}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-4xl md:text-5xl font-extrabold text-foreground tracking-tight mb-3 break-words">
            {title}
          </h1>
          {subtitle && (
            <p className="text-base md:text-lg text-muted-foreground max-w-3xl leading-relaxed">{subtitle}</p>
          )}
        </div>
        {actions && <div className="flex items-center gap-4 shrink-0">{actions}</div>}
      </div>
      {children && <div className="mt-6">{children}</div>}
    </header>
  );
}
