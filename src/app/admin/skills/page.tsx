import { getSkillsByCategory, SKILL_CATEGORY_LABELS } from '@/data/skills';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Skills — Admin' };

const LEVEL_LABEL: Record<number, string> = {
  1: 'Beginner', 2: 'Elementary', 3: 'Intermediate', 4: 'Advanced', 5: 'Expert',
};

export default function AdminSkillsPage() {
  const skillsByCategory = getSkillsByCategory();
  const allSkills = Object.values(skillsByCategory).flat();

  return (
    <main className="flex flex-1 flex-col gap-6 p-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Skills</h1>
          <p className="text-sm text-muted-foreground">{allSkills.length} skills tracked</p>
        </div>
        <button type="button" className="inline-flex items-center gap-2 px-4 py-2 bg-foreground text-background rounded-lg text-sm font-medium hover:bg-foreground/90 transition-colors">
          <Plus className="h-4 w-4" />
          Add Skill
        </button>
      </div>

      {(Object.keys(skillsByCategory) as Array<keyof typeof skillsByCategory>).map(cat => (
        <section key={cat}>
          <h2 className="text-sm font-semibold uppercase tracking-widest text-primary mb-4">
            {SKILL_CATEGORY_LABELS[cat]}
          </h2>
          <div className="rounded-xl border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Name</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Level</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">Order</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {skillsByCategory[cat].map(skill => (
                  <tr key={skill.id} className="bg-card hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 font-medium text-foreground">{skill.name}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className={`w-2 h-2 rounded-full ${i < (skill.level ?? 0) ? 'bg-foreground' : 'bg-border'}`} />
                          ))}
                        </div>
                        <span className="text-xs text-muted-foreground">{LEVEL_LABEL[skill.level ?? 0]}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{skill.order}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 justify-end">
                        <button type="button" aria-label={`Edit ${skill.name}`} className="p-1.5 text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-muted">
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button type="button" aria-label={`Delete ${skill.name}`} className="p-1.5 text-muted-foreground hover:text-destructive transition-colors rounded-md hover:bg-destructive/10">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ))}
    </main>
  );
}
