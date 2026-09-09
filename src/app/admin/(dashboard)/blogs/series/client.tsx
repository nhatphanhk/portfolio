'use client';

import { useState, useMemo } from 'react';
import { Layers, Plus, Pencil, Trash2, BookOpen, Search, ArrowUpDown, Link as LinkIcon, ChevronDown } from 'lucide-react';
import { SeriesDialog } from '@/components/admin/SeriesDialog';
import { DeleteDialog } from '@/components/admin/DeleteDialog';
import { PaginationControl } from '@/components/ui/PaginationControl';
import { deleteSeries } from '@/lib/actions/series';
import { useRouter } from 'next/navigation';

type Series = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  coverUrl: string | null;
  createdAt: Date;
  _count: {
    blogs: number;
  };
};

const ITEMS_PER_PAGE = 8;

interface Props {
  initialSeries: Series[];
}

export function AdminSeriesClient({ initialSeries }: Props) {
  const router = useRouter();
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Series | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Series | null>(null);

  const [search, setSearch] = useState('');
  const [slugFilter, setSlugFilter] = useState('');
  const [sortBy, setSortBy] = useState<'NEWEST' | 'COUNT' | 'TITLE'>('NEWEST');
  const [currentPage, setCurrentPage] = useState(1);

  // Extract all unique slugs for selection
  const allSlugs = useMemo(() => {
    return Array.from(new Set(initialSeries.map(s => s.slug).filter(Boolean))).sort();
  }, [initialSeries]);

  const handleSuccess = () => {
    router.refresh();
  };

  const filtered = useMemo(() => {
    const list = initialSeries.filter(s => {
      if (slugFilter && s.slug !== slugFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const matchTitle = s.title.toLowerCase().includes(q);
        const matchSlug = s.slug.toLowerCase().includes(q);
        const matchDesc = (s.description ?? '').toLowerCase().includes(q);
        if (!matchTitle && !matchSlug && !matchDesc) return false;
      }
      return true;
    });

    return list.sort((a, b) => {
      if (sortBy === 'COUNT') return b._count.blogs - a._count.blogs;
      if (sortBy === 'TITLE') return a.title.localeCompare(b.title);
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [initialSeries, slugFilter, search, sortBy]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE) || 1;
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filtered.slice(start, start + ITEMS_PER_PAGE);
  }, [filtered, currentPage]);

  return (
    <main className="flex flex-1 flex-col gap-6 p-6 w-full max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Blog Series</h1>
          <p className="text-sm text-muted-foreground">
            Organize related blog articles into sequential reading series ({initialSeries.length} series)
          </p>
        </div>
        <button
          type="button"
          onClick={() => setCreateOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-foreground text-background rounded-lg text-sm font-medium hover:bg-foreground/90 transition-colors shadow-xs self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          New Series
        </button>
      </div>

      {/* Search & Sort Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        {/* Search input with clean white background */}
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            placeholder="Search series by title, slug, or description..."
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

        <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border bg-white shadow-xs text-xs text-muted-foreground w-full sm:w-auto">
          <ArrowUpDown className="h-3.5 w-3.5" />
          <span className="font-medium">Sort:</span>
          <select
            value={sortBy}
            onChange={e => {
              setSortBy(e.target.value as any);
              setCurrentPage(1);
            }}
            className="bg-transparent text-foreground outline-none font-medium cursor-pointer"
          >
            <option value="NEWEST">Newest</option>
            <option value="COUNT">Most Articles</option>
            <option value="TITLE">Title A-Z</option>
          </select>
        </div>
      </div>

      {/* Table Container */}
      <div className="rounded-xl border border-border overflow-hidden bg-card shadow-xs">
        {paginated.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground bg-card">
            <Layers className="h-10 w-10 mb-3 opacity-30" />
            <p className="font-medium text-foreground">No series found</p>
            <p className="text-sm opacity-60 mt-1">
              {search || slugFilter
                ? 'Try adjusting your search or slug filter'
                : 'Click "New Series" to create a multi-part article series'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/60 border-b border-border">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Series</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Slug</th>
                  <th className="text-center px-4 py-3 font-medium text-muted-foreground">Articles</th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-card">
                {paginated.map(s => (
                  <tr key={s.id} className="hover:bg-muted/40 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium text-foreground">{s.title}</div>
                      {s.description && (
                        <div className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{s.description}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                      /blog?series={s.slug}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                        <BookOpen className="w-3 h-3" />
                        {s._count.blogs}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => setEditTarget(s)}
                          className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition"
                          title="Edit Series"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(s)}
                          className="p-1.5 text-muted-foreground hover:text-destructive rounded-lg hover:bg-destructive/10 transition"
                          title="Delete Series"
                        >
                          <Trash2 className="h-4 w-4" />
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

      <SeriesDialog
        mode="create"
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSuccess={handleSuccess}
      />

      {editTarget && (
        <SeriesDialog
          mode="edit"
          open={!!editTarget}
          onOpenChange={open => !open && setEditTarget(null)}
          initialData={{
            id: editTarget.id,
            title: editTarget.title,
            slug: editTarget.slug,
            description: editTarget.description ?? undefined,
            coverUrl: editTarget.coverUrl ?? undefined,
          }}
          onSuccess={handleSuccess}
        />
      )}

      {deleteTarget && (
        <DeleteDialog
          open={!!deleteTarget}
          onOpenChange={open => !open && setDeleteTarget(null)}
          title="Delete Series"
          description={`Are you sure you want to delete "${deleteTarget.title}"? Articles in this series will not be deleted, but they will be unlinked from the series.`}
          onConfirm={async () => {
            const res = await deleteSeries(deleteTarget.id);
            if (res.ok) {
              setDeleteTarget(null);
              handleSuccess();
            }
            return res;
          }}
        />
      )}
    </main>
  );
}
