'use client';

import React from 'react';
import { useLanguage } from '@/lib/i18n/context';
import { PublicPageHeader } from '@/components/ui/PublicPageHeader';
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
} from 'lucide-react';

interface SkillItem {
  id: string;
  name: string;
  iconUrl?: string | null;
  level?: number | null;
  category: string;
  order: number;
}

interface SkillsClientProps {
  skillsByCategory: Record<string, SkillItem[]>;
}

const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
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
};

export default function SkillsClient({ skillsByCategory }: SkillsClientProps) {
  const { t } = useLanguage();
  const categories = Object.keys(skillsByCategory) as Array<keyof typeof skillsByCategory>;
  const totalSkills = Object.values(skillsByCategory).flat().length;

  const getCategoryLabel = (cat: string): string => {
    const translated = t(`skills.categories.${cat}`);
    if (translated && !translated.startsWith('skills.categories.')) {
      return translated;
    }
    return cat;
  };

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
                <p className="text-2xl font-black text-primary">{totalSkills}</p>
                <p className="text-xs font-semibold text-muted-foreground">{t('skills.tracked')}</p>
              </div>
              <div className="w-px h-8 bg-border" aria-hidden="true" />
              <div className="text-center">
                <p className="text-2xl font-black text-foreground">{categories.length}</p>
                <p className="text-xs font-semibold text-muted-foreground">{t('skills.categories.label')}</p>
              </div>
            </>
          )
        }
      />

      {totalSkills === 0 && (
        <div className="py-20 text-center rounded-2xl border border-dashed border-border/70">
          <Layers className="w-10 h-10 mx-auto mb-3 text-muted-foreground/40" aria-hidden="true" />
          <p className="text-muted-foreground">{t('skills.empty')}</p>
        </div>
      )}

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 min-w-0">
        {categories.map(cat => {
          const skills = skillsByCategory[cat] ?? [];
          if (skills.length === 0) return null;

          const Icon = CATEGORY_ICONS[cat as string] || Code2;
          const label = getCategoryLabel(cat as string);

          return (
            <section
              key={cat as string}
              aria-labelledby={`${cat}-heading`}
              className="p-6 rounded-2xl bg-card border border-border/70 shadow-sm transition-all duration-300 hover:shadow-md hover:border-primary/30 flex flex-col gap-4"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/15 flex items-center justify-center">
                    <Icon className="w-4 h-4" aria-hidden="true" />
                  </div>
                  <div>
                    <h2 id={`${cat}-heading`} className="text-sm font-bold text-foreground leading-tight">
                      {label}
                    </h2>
                    <span className="text-[11px] font-semibold text-muted-foreground">
                      {skills.length}{' '}
                      {skills.length === 1 ? t('common.technology') : t('common.technologies')}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {skills.map(skill => (
                  <div
                    key={skill.id}
                    className="group flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-border/60 bg-muted/30 hover:bg-muted/70 hover:border-primary/25 transition-all duration-200"
                  >
                    {skill.iconUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={skill.iconUrl}
                        alt=""
                        className="w-4 h-4 object-contain shrink-0 transition-transform group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-4 h-4 rounded-md bg-muted flex items-center justify-center shrink-0">
                        <Layers className="w-2.5 h-2.5 text-muted-foreground" aria-hidden="true" />
                      </div>
                    )}
                    <span className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">
                      {skill.name}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </>
  );
}
