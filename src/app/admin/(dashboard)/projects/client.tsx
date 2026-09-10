'use client';

import { useState, useMemo } from 'react';
import { Code, Plus, Pencil, Trash2, ExternalLink, Github, Search, Filter } from 'lucide-react';
import { ProjectDialog } from '@/components/admin/ProjectDialog';
import { DeleteDialog } from '@/components/admin/DeleteDialog';
import { PaginationControl } from '@/components/ui/PaginationControl';
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

const ITEMS_PER_PAGE = 10;

export function AdminProjectsClient({ projects }: { projects: Project[] }) {
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Project | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const filtered = useMemo(() => {
    return projects.filter(project => {
      if (statusFilter !== 'ALL' && project.status !== statusFilter) return false;
      if (featuredOnly && !project.featured) return false;
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const matchTitle = project.title.toLowerCase().includes(q);
        const matchDesc = (project.description ?? '').toLowerCase().includes(q);
        const matchTags = project.tags.some(t => t.tag.name.toLowerCase().includes(q));
        if (!matchTitle && !matchDesc && !matchTags) return false;
      }
      return true;
    });
  }, [projects, statusFilter, featuredOnly, search]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE) || 1;
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filtered.slice(start, start + ITEMS_PER_PAGE);
  }, [filtered, currentPage]);

  return (
    <main className="flex flex-1 flex-col gap-6 p-6 w-full max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Projects</h1>
          <p className="text-sm text-muted-foreground">{projects.length} projects total</p>
        </div>
        <button
          id="create-project-btn"
          type="button"
          onClick={() => setCreateOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-foreground text-background rounded-lg text-sm font-medium hover:bg-foreground/90 transition-colors self-start sm:self-auto cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          New Project
        </button>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        {/* Search Input (by project name) */}
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            placeholder="Search projects by name, description, or tag..."
            value={search}
            onChange={e => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-border bg-background shadow-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-colors"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border bg-background shadow-xs text-xs text-muted-foreground transition-colors">
            <Filter className="h-3.5 w-3.5" />
            <span className="font-medium">Status:</span>
            <select
              value={statusFilter}
              onChange={e => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-transparent text-foreground outline-none font-medium cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="PUBLISHED">Published</option>
              <option value="DRAFT">Draft</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>

          <button
            type="button"
            onClick={() => {
              setFeaturedOnly(!featuredOnly);
              setCurrentPage(1);
            }}
            className={`px-3 py-2 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
              featuredOnly
                ? 'bg-primary/10 border-primary text-primary font-semibold'
                : 'border-border bg-background text-muted-foreground hover:text-foreground shadow-xs'
            }`}
          >
            ★ Featured Only
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="rounded-xl border border-border bg-card shadow-xs overflow-hidden">
        {paginated.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground bg-card">
            <Code className="h-10 w-10 mb-3 opacity-30" />
            <p className="font-medium text-foreground">No projects found</p>
            <p className="text-xs text-muted-foreground mt-1">
              {search || statusFilter !== 'ALL' || featuredOnly
                ? 'Try adjusting your search or filter options'
                : 'Add your first project to display your work'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-100/90 dark:bg-slate-800/90 border-b border-border text-slate-700 dark:text-slate-300 font-semibold text-xs uppercase tracking-wider">
                <tr>
                  <th className="text-left px-4 py-3.5 font-semibold text-slate-700 dark:text-slate-300">Project Name</th>
                  <th className="text-left px-4 py-3.5 font-semibold text-slate-700 dark:text-slate-300 hidden md:table-cell">Tags</th>
                  <th className="text-left px-4 py-3.5 font-semibold text-slate-700 dark:text-slate-300 hidden sm:table-cell">Status</th>
                  <th className="px-4 py-3.5 text-right font-semibold text-slate-700 dark:text-slate-300">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-card">
                {paginated.map(project => (
                  <tr
                    key={project.id}
                    onClick={() => setEditTarget(project)}
                    className="hover:bg-primary/5 cursor-pointer transition-colors group"
                  >
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <Code className="h-4 w-4 text-primary shrink-0" />
                        <div>
                          <p className="font-medium text-foreground group-hover:text-primary transition-colors">{project.title}</p>
                          <p className="font-mono text-xs text-muted-foreground">/{project.slug}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            {project.demoUrl && (
                              <a
                                href={project.demoUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
                              >
                                <ExternalLink className="h-3 w-3" /> Demo
                              </a>
                            )}
                            {project.repoUrl && (
                              <a
                                href={project.repoUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
                              >
                                <Github className="h-3 w-3" /> Repo
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 hidden md:table-cell">
                      <div className="flex flex-wrap gap-1">
                        {project.tags.slice(0, 3).map(t => (
                          <span
                            key={t.tag.name}
                            className="px-2 py-0.5 text-xs bg-muted rounded-md text-muted-foreground border border-border/50"
                          >
                            {t.tag.name}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 hidden sm:table-cell">
                      <div className="flex items-center gap-2">
                        {project.featured && (
                          <span className="px-2 py-0.5 text-xs rounded-full bg-primary/10 text-primary font-medium border border-primary/20">
                            ★ Featured
                          </span>
                        )}
                        <span
                          className={`px-2 py-0.5 text-xs rounded-full font-medium ${
                            project.status === 'PUBLISHED'
                              ? 'bg-green-500/10 text-green-700 dark:text-green-400'
                              : project.status === 'DRAFT'
                                ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400'
                                : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          {project.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center gap-1 justify-end">
                        <button
                          type="button"
                          aria-label={`Edit ${project.title}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditTarget(project);
                          }}
                          className="p-1.5 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted cursor-pointer"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          aria-label={`Delete ${project.title}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteTarget(project);
                          }}
                          className="p-1.5 text-muted-foreground hover:text-destructive transition-colors rounded-lg hover:bg-destructive/10 cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {filtered.length > 0 && (
          <div className="p-4 bg-card border-t border-border">
            <PaginationControl
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filtered.length}
              pageSize={ITEMS_PER_PAGE}
              onPageChange={setCurrentPage}
            />
          </div>
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
