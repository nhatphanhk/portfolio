import { cn } from '@/lib/utils';
import { SKILL_STATUS_ADMIN, type SkillStatusValue } from '@/lib/skill-constants';

export function SkillStatusBadge({ status, className }: { status: string; className?: string }) {
  const config = SKILL_STATUS_ADMIN[status as SkillStatusValue] ?? SKILL_STATUS_ADMIN.PAUSED;
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
