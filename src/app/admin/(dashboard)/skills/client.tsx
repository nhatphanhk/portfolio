'use client';

import { useState, useMemo } from 'react';
import { Layers, Plus, Pencil, Trash2, Search, Filter } from 'lucide-react';
import { SkillDialog } from '@/components/admin/SkillDialog';
import { DeleteDialog } from '@/components/admin/DeleteDialog';
import { PaginationControl } from '@/components/ui/PaginationControl';
import { deleteSkill } from '@/lib/actions/skill';

type Skill = {
  id: string;
  name: string;
  category: string;
  level: number | null;
  iconUrl: string | null;
  order: number;
};

const ITEMS_PER_PAGE = 10;

export function AdminSkillsClient({ skills }: { skills: Skill[] }) {
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Skill | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Skill | null>(null);

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);

  const categories = useMemo(() => {
    return Array.from(new Set(skills.map(s => s.category)));
  }, [skills]);

  const filtered = useMemo(() => {
    return skills.filter(skill => {
      if (categoryFilter !== 'ALL' && skill.category !== categoryFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        if (!skill.name.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [skills, categoryFilter, search]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE) || 1;
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filtered.slice(start, start + ITEMS_PER_PAGE);
  }, [filtered, currentPage]);

  return (
    <main className="flex flex-1 flex-col gap-6 p-6 w-full max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Skills</h1>
          <p className="text-sm text-muted-foreground">{skills.length} skills total</p>
        </div>
        <button
          id="create-skill-btn"
          type="button"
          onClick={() => setCreateOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-foreground text-background rounded-lg text-sm font-medium hover:bg-foreground/90 transition-colors self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          Add Skill
        </button>
      </div>

      {/* Search & Category Filter */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            placeholder="Search skills by name..."
            value={search}
            onChange={e => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-border bg-background shadow-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-colors"
          />
        </div>

        <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border bg-background shadow-xs text-xs text-muted-foreground w-full sm:w-auto transition-colors">
          <Filter className="h-3.5 w-3.5" />
          <span className="font-medium">Category:</span>
          <select
            value={categoryFilter}
            onChange={e => {
              setCategoryFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-transparent text-foreground outline-none font-medium cursor-pointer"
          >
            <option value="ALL">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table Container */}
      <div className="rounded-xl border border-border bg-card shadow-xs overflow-hidden">
        {paginated.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground bg-card">
            <Layers className="h-10 w-10 mb-3 opacity-30" />
            <p className="font-medium text-foreground">No skills found</p>
            <p className="text-xs text-muted-foreground mt-1">
              {search || categoryFilter !== 'ALL'
                ? 'Try adjusting your search or category filter'
                : 'Add your first skill to showcase your technology stack'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-100/90 dark:bg-slate-800/90 border-b border-border text-slate-700 dark:text-slate-300 font-semibold text-xs uppercase tracking-wider">
                <tr>
                  <th className="text-left px-4 py-3.5 font-semibold text-slate-700 dark:text-slate-300">Name</th>
                  <th className="text-left px-4 py-3.5 font-semibold text-slate-700 dark:text-slate-300">Category</th>
                  <th className="text-left px-4 py-3.5 font-semibold text-slate-700 dark:text-slate-300 hidden md:table-cell">Order</th>
                  <th className="px-4 py-3.5 text-right font-semibold text-slate-700 dark:text-slate-300">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-card">
                {paginated.map(skill => (
                  <tr
                    key={skill.id}
                    onClick={() => setEditTarget(skill)}
                    className="hover:bg-primary/5 cursor-pointer transition-colors group"
                  >
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2.5">
                        {skill.iconUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={skill.iconUrl} alt={skill.name} className="h-5 w-5 object-contain" />
                        ) : (
                          <div className="h-6 w-6 rounded bg-muted flex items-center justify-center">
                            <Layers className="h-3.5 w-3.5 text-muted-foreground" />
                          </div>
                        )}
                        <span className="font-medium text-foreground group-hover:text-primary transition-colors">{skill.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="px-2 py-0.5 text-xs bg-muted/80 rounded-md font-medium text-muted-foreground border border-border/50">
                        {skill.category}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 hidden md:table-cell text-muted-foreground">{skill.order}</td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center gap-1 justify-end">
                        <button
                          type="button"
                          aria-label={`Edit ${skill.name}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditTarget(skill);
                          }}
                          className="p-1.5 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted cursor-pointer"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          aria-label={`Delete ${skill.name}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteTarget(skill);
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
