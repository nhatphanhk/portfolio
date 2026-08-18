'use client';

import { useState } from 'react';
import { Code, Plus, Pencil, Trash2, ExternalLink, Github } from 'lucide-react';
import { ProjectDialog } from '@/components/admin/ProjectDialog';
import { DeleteDialog } from '@/components/admin/DeleteDialog';
import { deleteProject } from '@/lib/actions/project';

type Project = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  content: string | null;
  thumbnailUrl: string | null;
  demoUrl: string | null;
  repoUrl: string | null;
  status: string;
  featured: boolean;
  tags: { tag: { name: string } }[];
};

export function AdminProjectsClient({ projects }: { projects: Project[] }) {
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Project | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);

  return (
    <main className="flex flex-1 flex-col gap-6 p-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Projects</h1>
          <p className="text-sm text-muted-foreground">{projects.length} projects total</p>
        </div>
        <button
          id="create-project-btn"
          type="button"
          onClick={() => setCreateOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-foreground text-background rounded-lg text-sm font-medium hover:bg-foreground/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          New Project
        </button>
      </div>

      <div className="rounded-xl border border-border overflow-hidden">
        {projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
            <Code className="h-10 w-10 mb-3 opacity-30" />
            <p>No projects yet</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Project</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Tags</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {projects.map(project => (
                <tr key={project.id} className="bg-card hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Code className="h-4 w-4 text-muted-foreground shrink-0" />
                      <div>
                        <p className="font-medium text-foreground">{project.title}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          {project.demoUrl && (
                            <a href={project.demoUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-muted-foreground hover:text-foreground">
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                          {project.repoUrl && (
                            <a href={project.repoUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-muted-foreground hover:text-foreground">
                              <Github className="h-3 w-3" />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {project.tags.slice(0, 3).map(t => (
                        <span key={t.tag.name} className="px-2 py-0.5 text-xs bg-muted rounded text-muted-foreground">{t.tag.name}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <div className="flex items-center gap-2">
                      {project.featured && (
                        <span className="px-2 py-0.5 text-xs rounded-full bg-primary/10 text-primary">Featured</span>
                      )}
                      <span className={`px-2 py-0.5 text-xs rounded-full ${
                        project.status === 'PUBLISHED' ? 'bg-green-500/10 text-green-600 dark:text-green-400'
                        : project.status === 'DRAFT' ? 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400'
                        : 'bg-muted text-muted-foreground'
                      }`}>{project.status}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 justify-end">
                      <button type="button" aria-label={`Edit ${project.title}`} onClick={() => setEditTarget(project)} className="p-1.5 text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-muted">
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button type="button" aria-label={`Delete ${project.title}`} onClick={() => setDeleteTarget(project)} className="p-1.5 text-muted-foreground hover:text-destructive transition-colors rounded-md hover:bg-destructive/10">
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

      <ProjectDialog mode="create" open={createOpen} onOpenChange={setCreateOpen} />

      {editTarget && (
        <ProjectDialog
          mode="edit"
          open={!!editTarget}
          onOpenChange={open => !open && setEditTarget(null)}
          initialData={{
            id: editTarget.id,
            title: editTarget.title,
            slug: editTarget.slug,
            description: editTarget.description ?? '',
            content: editTarget.content ?? '',
            demoUrl: editTarget.demoUrl ?? '',
            repoUrl: editTarget.repoUrl ?? '',
            thumbnailUrl: editTarget.thumbnailUrl ?? '',
            status: editTarget.status as 'DRAFT' | 'PUBLISHED' | 'ARCHIVED',
            featured: editTarget.featured,
            tags: editTarget.tags.map(t => t.tag.name).join(', '),
          }}
        />
      )}

      {deleteTarget && (
        <DeleteDialog
          open={!!deleteTarget}
          onOpenChange={open => !open && setDeleteTarget(null)}
          title={`Delete "${deleteTarget.title}"?`}
          onConfirm={() => deleteProject(deleteTarget.id)}
        />
      )}
    </main>
  );
}
