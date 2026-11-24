'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/lib/i18n/context';
import { PublicPageHeader } from '@/components/ui/PublicPageHeader';
import { cn } from '@/lib/utils';
import { isLifeSkillCategory } from '@/lib/skill-constants';
import type { PublicSkillSummary } from '@/lib/actions/skill';
import {
  Code2,
  Server,
  Terminal,
  Layers,
  Sparkles,
  Cpu,
  Database,
  Cloud,
  FileCode,
  Activity,
  GitBranch,
  Users,
  Languages,
  Palette,
  Music,
  Dumbbell,
  HeartHandshake,
  Briefcase,
  CheckCircle2,
  Paperclip,
  Star,
  ChevronRight,
} from 'lucide-react';

interface SkillsClientProps {
  skillsByCategory: Record<string, PublicSkillSummary[]>;
}

export const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  FRONTEND: Code2,
  BACKEND: Server,
  DEVOPS: Terminal,
  TOOLS: Sparkles,
  LANGUAGE: FileCode,
  FRAMEWORK: Cpu,
  DATABASE: Database,
  CLOUD: Cloud,
  IAC: Terminal,
  MONITORING: Activity,
  VERSION_CONTROL: GitBranch,
  OTHER: Sparkles,
  SOFT_SKILL: Users,
  FOREIGN_LANGUAGE: Languages,
  DESIGN_ART: Palette,
  MUSIC: Music,
  SPORTS_HEALTH: Dumbbell,
  LIFE_SKILL: HeartHandshake,
  BUSINESS: Briefcase,
};

export const STATUS_STYLES: Record<string, string> = {
  ACHIEVED: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20',
  LEARNING: 'bg-blue-500/10 text-blue-700 border-blue-500/20',
  PAUSED: 'bg-muted text-muted-foreground border-border',
};

type FilterKey = 'all' | 'work' | 'life' | 'learning';

function SkillCard({ skill }: { skill: PublicSkillSummary }) {
  const { t } = useLanguage();
  const body = (
    <>
      <div className="flex items-start gap-2.5">
        {skill.iconUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={skill.iconUrl} alt="" className="w-5 h-5 object-contain shrink-0 mt-0.5" />
        ) : (
          <div className="w-5 h-5 rounded-md bg-muted flex items-center justify-center shrink-0 mt-0.5">
            <Layers className="w-3 h-3 text-muted-foreground" aria-hidden="true" />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors truncate">
              {skill.name}
            </span>
            {skill.featured && <Star className="w-3 h-3 fill-amber-400 text-amber-400 shrink-0" aria-hidden="true" />}
          </div>
          {skill.summary && <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{skill.summary}</p>}
        </div>
        {skill.slug && (
          <ChevronRight className="w-4 h-4 text-muted-foreground/50 group-hover:text-primary shrink-0 mt-0.5 transition-colors" aria-hidden="true" />
        )}
      </div>
      <div className="flex flex-wrap items-center gap-2 mt-2.5 pl-7">
        <span className={cn('text-[10px] font-semibold px-1.5 py-0.5 rounded-full border', STATUS_STYLES[skill.status])}>
          {t(`skills.status.${skill.status}`)}
        </span>
        {skill.capabilityCount > 0 && (
          <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
            <CheckCircle2 className="w-3 h-3" aria-hidden="true" />
            {skill.capabilityCount} {t('skills.capabilities')}
          </span>
        )}
        {skill.evidenceCount > 0 && (
          <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
            <Paperclip className="w-3 h-3" aria-hidden="true" />
            {skill.evidenceCount} {t('skills.proofs')}
          </span>
        )}
      </div>
    </>
  );

  const cls =
    'group block p-3 rounded-xl border border-border/60 bg-muted/20 hover:bg-muted/50 hover:border-primary/25 transition-all duration-200';
  return skill.slug ? (
    <Link href={`/skills/${skill.slug}`} className={cls}>
      {body}
    </Link>
  ) : (
    <div className={cls}>{body}</div>
  );
}

export default function SkillsClient({ skillsByCategory }: SkillsClientProps) {
  const { t } = useLanguage();
  const [filter, setFilter] = useState<FilterKey>('all');

  const allSkills = useMemo(() => Object.values(skillsByCategory).flat(), [skillsByCategory]);
  const totalSkills = allSkills.length;
  const achieved = allSkills.filter(s => s.status === 'ACHIEVED').length;
  const learning = allSkills.filter(s => s.status === 'LEARNING').length;
  const evidence = allSkills.reduce((sum, s) => sum + s.evidenceCount, 0);
  const hasLife = allSkills.some(s => isLifeSkillCategory(s.category));

  const visible = useMemo(() => {
    const keep = (s: PublicSkillSummary) => {
      if (filter === 'work') return !isLifeSkillCategory(s.category);
      if (filter === 'life') return isLifeSkillCategory(s.category);
      if (filter === 'learning') return s.status === 'LEARNING';
      return true;
    };
    return Object.entries(skillsByCategory)
      .map(([cat, skills]) => [cat, skills.filter(keep)] as const)
      .filter(([, skills]) => skills.length > 0);
  }, [skillsByCategory, filter]);

  const getCategoryLabel = (cat: string): string => {
    const translated = t(`skills.categories.${cat}`);
    return translated && !translated.startsWith('skills.categories.') ? translated : cat;
  };

  const filters: { key: FilterKey; label: string; show: boolean }[] = [
    { key: 'all', label: t('skills.filters.all'), show: true },
    { key: 'work', label: t('skills.filters.work'), show: hasLife },
    { key: 'life', label: t('skills.filters.life'), show: hasLife },
    { key: 'learning', label: t('skills.filters.learning'), show: learning > 0 },
  ];

  return (
    <>
      <PublicPageHeader
        badge={{ label: t('skills.badge'), icon: Sparkles }}
        title={t('skills.title')}
        subtitle={t('skills.subtitle')}
        actions={
          totalSkills > 0 && (
            <>
              <div className="text-center">
                <p className="text-2xl font-black text-primary">{achieved}</p>
                <p className="text-xs font-semibold text-muted-foreground">{t('skills.achieved')}</p>
              </div>
              <div className="w-px h-8 bg-border" aria-hidden="true" />
              <div className="text-center">
                <p className="text-2xl font-black text-foreground">{learning}</p>
                <p className="text-xs font-semibold text-muted-foreground">{t('skills.learning')}</p>
              </div>
              <div className="w-px h-8 bg-border" aria-hidden="true" />
              <div className="text-center">
                <p className="text-2xl font-black text-foreground">{evidence}</p>
                <p className="text-xs font-semibold text-muted-foreground">{t('skills.evidence')}</p>
              </div>
            </>
          )
        }
      />

      {totalSkills === 0 ? (
        <div className="py-20 text-center rounded-2xl border border-dashed border-border/70">
          <Layers className="w-10 h-10 mx-auto mb-3 text-muted-foreground/40" aria-hidden="true" />
          <p className="text-muted-foreground">{t('skills.empty')}</p>
        </div>
      ) : (
        <>
          {filters.filter(f => f.show).length > 1 && (
            <div className="flex flex-wrap gap-2 mb-6" role="group" aria-label={t('skills.categories.label')}>
              {filters
                .filter(f => f.show)
                .map(f => (
                  <button
                    key={f.key}
                    type="button"
                    aria-pressed={filter === f.key}
                    onClick={() => setFilter(f.key)}
                    className={cn(
                      'px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-colors',
                      filter === f.key
                        ? 'bg-foreground text-background border-foreground'
                        : 'bg-card text-muted-foreground border-border hover:text-foreground hover:border-foreground/30'
                    )}
                  >
                    {f.label}
                  </button>
                ))}
            </div>
          )}

          {visible.length === 0 && (
            <div className="py-16 text-center rounded-2xl border border-dashed border-border/70">
              <p className="text-muted-foreground">{t('skills.emptyFilter')}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 min-w-0">
            {visible.map(([cat, skills]) => {
              const Icon = CATEGORY_ICONS[cat] || Code2;
              return (
                <section
                  key={cat}
                  aria-labelledby={`${cat}-heading`}
                  className="p-5 rounded-2xl bg-card border border-border/70 shadow-sm transition-all duration-300 hover:shadow-md hover:border-primary/30 flex flex-col gap-4"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/15 flex items-center justify-center">
                      <Icon className="w-4 h-4" aria-hidden="true" />
                    </div>
                    <div>
                      <h2 id={`${cat}-heading`} className="text-sm font-bold text-foreground leading-tight">
                        {getCategoryLabel(cat)}
                      </h2>
                      <span className="text-[11px] font-semibold text-muted-foreground">
                        {skills.length} {t('skills.tracked')}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    {skills.map(skill => (
                      <SkillCard key={skill.id} skill={skill} />
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        </>
      )}
    </>
  );
}
