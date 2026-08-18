'use client';

import { useState } from 'react';
import { Layers, Plus, Pencil, Trash2 } from 'lucide-react';
import { SkillDialog } from '@/components/admin/SkillDialog';
import { DeleteDialog } from '@/components/admin/DeleteDialog';
import { deleteSkill } from '@/lib/actions/skill';

type Skill = {
  id: string;
  name: string;
  category: string;
  level: number | null;
  iconUrl: string | null;
  order: number;
};

export function AdminSkillsClient({ skills }: { skills: Skill[] }) {
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Skill | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Skill | null>(null);

  return (
    <main className="flex flex-1 flex-col gap-6 p-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Skills</h1>
          <p className="text-sm text-muted-foreground">{skills.length} skills total</p>
        </div>
        <button
          id="create-skill-btn"
          type="button"
          onClick={() => setCreateOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-foreground text-background rounded-lg text-sm font-medium hover:bg-foreground/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Skill
        </button>
      </div>

      <div className="rounded-xl border border-border overflow-hidden">
        {skills.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
            <Layers className="h-10 w-10 mb-3 opacity-30" />
            <p>No skills yet</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Name</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Category</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Order</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {skills.map(skill => (
                <tr key={skill.id} className="bg-card hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {skill.iconUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={skill.iconUrl} alt={skill.name} className="h-5 w-5 object-contain" />
                      ) : (
                        <div className="h-5 w-5 rounded bg-muted flex items-center justify-center">
                          <Layers className="h-3 w-3 text-muted-foreground" />
                        </div>
                      )}
                      <span className="font-medium text-foreground">{skill.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 text-xs bg-muted rounded text-muted-foreground">
                      {skill.category}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">{skill.order}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 justify-end">
                      <button type="button" aria-label={`Edit ${skill.name}`} onClick={() => setEditTarget(skill)} className="p-1.5 text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-muted">
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button type="button" aria-label={`Delete ${skill.name}`} onClick={() => setDeleteTarget(skill)} className="p-1.5 text-muted-foreground hover:text-destructive transition-colors rounded-md hover:bg-destructive/10">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <SkillDialog mode="create" open={createOpen} onOpenChange={setCreateOpen} />

      {editTarget && (
        <SkillDialog
          mode="edit"
          open={!!editTarget}
          onOpenChange={open => !open && setEditTarget(null)}
          initialData={{
            id: editTarget.id,
            name: editTarget.name,
            category: editTarget.category as 'FRONTEND' | 'BACKEND' | 'DEVOPS' | 'TOOLS' | 'OTHER',
            iconUrl: editTarget.iconUrl ?? '',
            order: editTarget.order,
          }}
        />
      )}

      {deleteTarget && (
        <DeleteDialog
          open={!!deleteTarget}
          onOpenChange={open => !open && setDeleteTarget(null)}
          title={`Delete "${deleteTarget.name}"?`}
          onConfirm={() => deleteSkill(deleteTarget.id)}
        />
      )}
    </main>
  );
}
