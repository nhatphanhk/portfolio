import { MainLayout } from '@/components';
import { getSkillsByCategory, SKILL_CATEGORY_LABELS } from '@/data/skills';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Skills',
  description:
    'Technical skills and proficiency levels — Frontend, Backend, DevOps, and tooling expertise.',
};

const LEVEL_LABEL: Record<number, string> = {
  1: 'Beginner',
  2: 'Elementary',
  3: 'Intermediate',
  4: 'Advanced',
  5: 'Expert',
};

export default function SkillsPage() {
  const skillsByCategory = getSkillsByCategory();

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto px-6 py-24 pt-32">
        {/* Header */}
        <div className="mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Skills</h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            A breakdown of my technical skills, grouped by domain. Proficiency levels reflect
            real-world usage, not just familiarity.
          </p>
        </div>

        {/* Skills Grid */}
        <div className="grid md:grid-cols-2 gap-10">
          {(Object.keys(skillsByCategory) as Array<keyof typeof skillsByCategory>).map(cat => (
            <section key={cat} aria-labelledby={`${cat}-heading`}>
              <h2
                id={`${cat}-heading`}
                className="text-sm font-semibold uppercase tracking-widest text-primary mb-6"
              >
                {SKILL_CATEGORY_LABELS[cat]}
              </h2>

              <div className="space-y-4">
                {skillsByCategory[cat].map(skill => {
                  const pct = ((skill.level ?? 0) / 5) * 100;
                  return (
                    <div key={skill.id}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm font-medium text-foreground">{skill.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {LEVEL_LABEL[skill.level ?? 0]}
                        </span>
                      </div>
                      <div
                        role="progressbar"
                        aria-label={`${skill.name} proficiency`}
                        aria-valuenow={skill.level ?? 0}
                        aria-valuemin={0}
                        aria-valuemax={5}
                        className="h-1.5 w-full bg-border rounded-full overflow-hidden"
                      >
                        <div
                          className="h-full bg-foreground rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>

        {/* Legend */}
        <div className="mt-16 pt-8 border-t border-border">
          <p className="text-xs text-muted-foreground mb-3">Proficiency Scale:</p>
          <div className="flex flex-wrap gap-4">
            {Object.entries(LEVEL_LABEL).map(([lvl, label]) => (
              <div key={lvl} className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div
                      key={i}
                      className={`w-2 h-2 rounded-full ${i < Number(lvl) ? 'bg-foreground' : 'bg-border'}`}
                    />
                  ))}
                </div>
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
