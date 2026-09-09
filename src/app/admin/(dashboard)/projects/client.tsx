'use client';

import { useState, useMemo } from 'react';
import { Code, Plus, Pencil, Trash2, ExternalLink, Github, Search, Filter, Link as LinkIcon, ChevronDown } from 'lucide-react';
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
  const [slugFilter, setSlugFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Extract all unique slugs for selection
  const allSlugs = useMemo(() => {
    return Array.from(new Set(projects.map(p => p.slug).filter(Boolean))).sort();
  }, [projects]);

  const filtered = useMemo(() => {
    return projects.filter(project => {
      if (statusFilter !== 'ALL' && project.status !== statusFilter) return false;
      if (featuredOnly && !project.featured) return false;
      if (slugFilter && project.slug !== slugFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const matchTitle = project.title.toLowerCase().includes(q);
        const matchSlug = project.slug.toLowerCase().includes(q);
        const matchDesc = (project.description ?? '').toLowerCase().includes(q);
        const matchTags = project.tags.some(t => t.tag.name.toLowerCase().includes(q));
        if (!matchTitle && !matchSlug && !matchDesc && !matchTags) return false;
      }
      return true;
    });
  }, [projects, statusFilter, featuredOnly, slugFilter, search]);

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
          className="inline-flex items-center gap-2 px-4 py-2 bg-foreground text-background rounded-lg text-sm font-medium hover:bg-foreground/90 transition-colors self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          New Project
        </button>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        {/* Search Input (clean white background) */}
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            placeholder="Search projects by title, description, or tag..."
            value={search}
            onChange={e => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-border bg-white shadow-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        {/* Slug filter select dropdown */}
        <div className="relative w-full sm:w-52">
          <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
          <select
            value={slugFilter}
            onChange={e => {
              setSlugFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-8 pr-7 py-2 text-xs rounded-xl border border-border bg-white shadow-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 font-mono appearance-none cursor-pointer truncate"
          >
            <option value="">All Slugs ({allSlugs.length})</option>
            {allSlugs.map(slug => (
              <option key={slug} value={slug}>
                /{slug}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground pointer-events-none" />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border bg-white shadow-xs text-xs text-muted-foreground">
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
            className={`px-3 py-2 rounded-xl border text-xs font-medium transition-all ${
              featuredOnly
                ? 'bg-primary/10 border-primary text-primary font-semibold'
                : 'border-border bg-white text-muted-foreground hover:text-foreground shadow-xs'
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
              {search || slugFilter || statusFilter !== 'ALL' || featuredOnly
                ? 'Try adjusting your search or filter options'
                : 'Add your first project to display your work'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/60 border-b border-border">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Project & Slug</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Tags</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-card">
                {paginated.map(project => (
                  <tr key={project.id} className="hover:bg-muted/40 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <Code className="h-4 w-4 text-primary shrink-0" />
                        <div>
                          <p className="font-medium text-foreground">{project.title}</p>
                          <p className="font-mono text-xs text-muted-foreground">/{project.slug}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            {project.demoUrl && (
                              <a
                                href={project.demoUrl}
                                target="_blank"
                                rel="noopener noreferrer"
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
                                className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
                              >
                                <Github className="h-3 w-3" /> Repo
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
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
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <div className="flex items-center gap-2">
                        {project.featured && (
                          <span className="px-2 py-0.5 text-xs rounded-full bg-primary/10 text-primary font-medium border border-primary/20">
                            ★ Featured
                          </span>
                        )}
                        <span
                          className={`px-2 py-0.5 text-xs rounded-full font-medium ${
                            project.status === 'PUBLISHED'
                              ? 'bg-green-500/10 text-green-700'
                              : project.status === 'DRAFT'
                                ? 'bg-amber-500/10 text-amber-700'
                                : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          {project.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 justify-end">
                        <button
                          type="button"
                          aria-label={`Edit ${project.title}`}
                          onClick={() => setEditTarget(project)}
                          className="p-1.5 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          aria-label={`Delete ${project.title}`}
                          onClick={() => setDeleteTarget(project)}
                          className="p-1.5 text-muted-foreground hover:text-destructive transition-colors rounded-lg hover:bg-destructive/10"
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
          <div className="p-4 bg-card">
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
