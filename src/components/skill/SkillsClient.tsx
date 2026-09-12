'use client';

import React from 'react';
import { useLanguage } from '@/lib/i18n/context';
import { SKILL_CATEGORY_LABELS } from '@/data/skills';
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
    return SKILL_CATEGORY_LABELS[cat as keyof typeof SKILL_CATEGORY_LABELS] ?? cat;
  };

  return (
    <>
      {/* Header */}
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-3 bg-primary/10 text-primary border border-primary/20">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{t('skills.badge')}</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-foreground tracking-tight mb-2">
              {t('skills.title')}
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground max-w-2xl leading-relaxed">
              {t('skills.subtitle')}
            </p>
          </div>
          <div className="flex items-center gap-4 shrink-0">
            <div className="text-center">
              <p className="text-2xl font-black text-primary">{totalSkills}</p>
              <p className="text-xs font-semibold text-muted-foreground">{t('skills.tracked')}</p>
            </div>
            <div className="w-px h-8 bg-border" />
            <div className="text-center">
              <p className="text-2xl font-black text-foreground">{categories.length}</p>
              <p className="text-xs font-semibold text-muted-foreground">{t('skills.categories.label') || 'Categories'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {categories.map(cat => {
          const skills = skillsByCategory[cat] ?? [];
          if (skills.length === 0) return null;

          const Icon = CATEGORY_ICONS[cat as string] || Code2;
          const label = getCategoryLabel(cat as string);

          return (
            <section
              key={cat as string}
              aria-labelledby={`${cat}-heading`}
              className="p-5 rounded-2xl bg-card border border-border/70 shadow-sm transition-all duration-300 hover:shadow-md hover:border-primary/30 flex flex-col gap-4"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/15 flex items-center justify-center">
                    <Icon className="w-4 h-4" />
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
                        alt={skill.name}
                        className="w-4 h-4 object-contain shrink-0 transition-transform group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-4 h-4 rounded-md bg-muted flex items-center justify-center shrink-0">
                        <Layers className="w-2.5 h-2.5 text-muted-foreground" />
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
