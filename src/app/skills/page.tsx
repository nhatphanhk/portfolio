import { MainLayout } from '@/components';
import { SKILL_CATEGORY_LABELS } from '@/data/skills';
import { getPublicSkillsByCategory } from '@/lib/actions/skill';
import { Code2, Sparkles, Layers, Cpu } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Skills',
  description:
    'Technical skills, frameworks, languages, and tools across Frontend, Backend, DevOps, and Database domains.',
};

const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  FRONTEND: Code2,
  BACKEND: Layers,
  DATABASE: Cpu,
  DEVOPS: Sparkles,
  TOOLS: Sparkles,
  OTHER: Sparkles,
};

export default async function SkillsPage() {
  const skillsByCategory = await getPublicSkillsByCategory();
  const categories = Object.keys(skillsByCategory) as Array<keyof typeof skillsByCategory>;
  const totalSkills = Object.values(skillsByCategory).flat().length;

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto px-6 py-24 pt-32">
        {/* Header */}
        <div className="mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-4 bg-primary/10 text-primary border border-primary/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Tech Stack & Competencies</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-foreground tracking-tight mb-4">
            Technical Skills
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl leading-relaxed">
            A comprehensive directory of technologies, languages, frameworks, and developer tools
            I leverage to build robust, scalable web applications.
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
                  {/* Category Header */}
                  <div className="flex items-center justify-between pb-5 mb-6 border-b border-border/70">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-2xl bg-primary/10 text-primary">
                        <Icon className="w-5 h-5" />
                      </div>
                      <h2
                        id={`${cat}-heading`}
                        className="text-lg sm:text-xl font-black text-foreground tracking-tight"
                      >
                        {label}
                      </h2>
                    </div>
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-muted text-muted-foreground">
                      {skills.length} skills
                    </span>
                  </div>

                  {/* Skills Tag Cloud */}
                  <div className="flex flex-wrap gap-2.5">
                    {skills.map(skill => (
                      <span
                        key={skill.id}
                        className="group px-4 py-2 rounded-xl text-sm font-bold tracking-tight bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-800 dark:text-slate-200 shadow-2xs hover:border-primary hover:bg-primary/5 hover:text-primary hover:scale-[1.04] active:scale-[0.98] transition-all duration-200 cursor-default"
                      >
                        {skill.name}
                      </span>
                    ))}
                  </div>
                </div>
              </section>
            );
          })}
        </div>

        {/* Footer Summary */}
        <div className="mt-14 p-6 rounded-2xl bg-gradient-to-r from-amber-500/10 via-blue-500/5 to-transparent border border-amber-500/15 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-600 flex items-center justify-center font-black">
              {totalSkills}
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">Total Mastered Technologies</p>
              <p className="text-xs text-muted-foreground">Continuously expanding & learning modern tools</p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
