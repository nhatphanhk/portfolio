import { MainLayout } from '@/components';
import { getPublicSkillsByCategory } from '@/lib/actions/skill';
import { SKILL_CATEGORY_LABELS } from '@/data/skills';
import { UserBreadcrumb } from '@/components/UserBreadcrumb';
import {
  Code2,
  Server,
  Terminal,
  Layers,
  Sparkles,
} from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Skills',
  description:
    'Comprehensive overview of technical skills, frameworks, languages, and tools I use in full-stack engineering.',
};

export const revalidate = 300;

const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  FRONTEND: Code2,
  BACKEND: Server,
  DEVOPS: Terminal,
  TOOLS: Sparkles,
  OTHER: Sparkles,
};

export default async function SkillsPage() {
  const skillsByCategory = await getPublicSkillsByCategory();
  const categories = Object.keys(skillsByCategory) as Array<keyof typeof skillsByCategory>;
  const totalSkills = Object.values(skillsByCategory).flat().length;

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 pt-32">
        {/* Breadcrumb aligned with Header */}
        <UserBreadcrumb items={[{ label: 'Skills' }]} className="mb-6" />

        {/* Header */}
        <div className="mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-4 bg-primary/10 text-primary border border-primary/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Tech Stack & Competencies</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-foreground tracking-tight mb-4">
            Technical Skills
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-3xl leading-relaxed">
            A comprehensive directory of technologies, languages, frameworks, and developer tools
            I leverage to build robust, scalable web applications ({totalSkills} skills tracked).
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid md:grid-cols-2 gap-8">
          {categories.map(cat => {
            const skills = skillsByCategory[cat] ?? [];
            if (skills.length === 0) return null;

            const Icon = CATEGORY_ICONS[cat as string] || Code2;
            const label = SKILL_CATEGORY_LABELS[cat as keyof typeof SKILL_CATEGORY_LABELS] ?? cat;

            return (
              <section
                key={cat}
                aria-labelledby={`${cat}-heading`}
                className="p-6 sm:p-8 rounded-3xl bg-card border border-border/80 shadow-md shadow-slate-900/5 transition-all duration-300 hover:shadow-xl hover:border-primary/40 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-4 mb-6 pb-4 border-b border-border/60">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-2xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center shadow-xs">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h2 id={`${cat}-heading`} className="text-xl font-bold text-foreground">
                          {label}
                        </h2>
                        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          {skills.length} {skills.length === 1 ? 'Technology' : 'Technologies'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {skills.map(skill => (
                      <div
                        key={skill.id}
                        className="group relative flex items-center gap-2.5 p-2.5 rounded-xl border border-border/60 bg-muted/20 hover:bg-muted/60 hover:border-primary/30 transition-all duration-200"
                      >
                        {skill.iconUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={skill.iconUrl}
                            alt={skill.name}
                            className="w-5 h-5 object-contain shrink-0 transition-transform group-hover:scale-110"
                          />
                        ) : (
                          <div className="w-5 h-5 rounded-md bg-muted flex items-center justify-center shrink-0">
                            <Layers className="w-3 h-3 text-muted-foreground" />
                          </div>
                        )}
                        <span className="text-xs font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                          {skill.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </MainLayout>
  );
}
