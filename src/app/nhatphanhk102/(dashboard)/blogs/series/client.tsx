'use client';

import { useState, useMemo, useEffect } from 'react';
import { Layers, Plus, Pencil, Trash2, BookOpen, Search, ArrowUpDown, Tag, ChevronDown } from 'lucide-react';
import { SeriesDialog } from '@/components/admin/SeriesDialog';
import { DeleteDialog } from '@/components/admin/DeleteDialog';
import { AdminPageHeader, ADMIN_PAGE_CLASS } from '@/components/admin/AdminPageHeader';
import { PaginationControl } from '@/components/ui/PaginationControl';
import { deleteSeries } from '@/lib/actions/series';
import { useRouter } from 'next/navigation';

type Series = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  coverUrl: string | null;
  tags?: string | null;
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
  const [tagFilter, setTagFilter] = useState('');
  const [sortBy, setSortBy] = useState<'NEWEST' | 'COUNT' | 'TITLE'>('NEWEST');
  const [currentPage, setCurrentPage] = useState(1);

  // Extract all unique tags for selection
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    initialSeries.forEach(s => {
      if (s.tags) {
        s.tags.split(',').forEach(t => {
          const trimmed = t.trim();
          if (trimmed) tagSet.add(trimmed);
        });
      }
    });
    return Array.from(tagSet).sort();
  }, [initialSeries]);

  const handleSuccess = () => {
    router.refresh();
  };

  const filtered = useMemo(() => {
    const list = initialSeries.filter(s => {
      if (tagFilter) {
        if (!s.tags) return false;
        const sTags = s.tags.split(',').map(t => t.trim().toLowerCase());
        if (!sTags.includes(tagFilter.toLowerCase())) return false;
      }
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const matchTitle = s.title.toLowerCase().includes(q);
        const matchDesc = (s.description ?? '').toLowerCase().includes(q);
        const matchTags = (s.tags ?? '').toLowerCase().includes(q);
        if (!matchTitle && !matchDesc && !matchTags) return false;
      }
      return true;
    });

    return list.sort((a, b) => {
      if (sortBy === 'COUNT') return b._count.blogs - a._count.blogs;
      if (sortBy === 'TITLE') return a.title.localeCompare(b.title);
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [initialSeries, tagFilter, search, sortBy]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE) || 1;
  // Keep the page in range when rows are deleted or filters shrink the list
  useEffect(() => {
    setCurrentPage(p => Math.min(p, totalPages));
  }, [totalPages]);
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filtered.slice(start, start + ITEMS_PER_PAGE);
  }, [filtered, currentPage]);

  return (
    <main className={ADMIN_PAGE_CLASS}>
      <AdminPageHeader
        title="Series bài viết"
        description={`${initialSeries.length} series — nhóm các bài viết liên quan theo thứ tự đọc`}
        actions={
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-foreground text-background rounded-lg text-sm font-medium hover:bg-foreground/90 transition-colors shadow-xs cursor-pointer"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Thêm series
          </button>
        }
      />

      {/* Search & Sort Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        {/* Search input with unified card background */}
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            placeholder="Tìm theo tiêu đề, thẻ hoặc mô tả…"
            aria-label="Tìm series"
            value={search}
            onChange={e => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-border bg-card shadow-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-colors"
          />
        </div>

        {/* Tag filter select dropdown */}
        <div className="relative w-full sm:w-52">
          <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
          <select
            value={tagFilter}
            aria-label="Lọc theo thẻ"
            onChange={e => {
              setTagFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-8 pr-7 py-2 text-xs rounded-xl border border-border bg-card shadow-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 appearance-none cursor-pointer truncate transition-colors"
          >
            <option value="">Tất cả thẻ ({allTags.length})</option>
            {allTags.map(tag => (
              <option key={tag} value={tag}>
                #{tag}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground pointer-events-none" />
        </div>

        <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border bg-card shadow-xs text-xs text-muted-foreground w-full sm:w-auto transition-colors">
          <ArrowUpDown className="h-3.5 w-3.5" />
          <span className="font-medium">Sắp xếp:</span>
          <select
            value={sortBy}
            aria-label="Sắp xếp series"
            onChange={e => {
              setSortBy(e.target.value as typeof sortBy);
              setCurrentPage(1);
            }}
            className="bg-transparent text-foreground outline-none font-medium cursor-pointer"
          >
            <option value="NEWEST">Mới nhất</option>
            <option value="COUNT">Nhiều bài nhất</option>
            <option value="TITLE">Tiêu đề A-Z</option>
          </select>
        </div>
      </div>

      {/* Table Container */}
      <div className="rounded-xl border border-border overflow-hidden bg-card shadow-xs">
        {paginated.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground bg-card">
            <Layers className="h-10 w-10 mb-3 opacity-30" />
            <p className="font-medium text-foreground">Không có series nào</p>
            <p className="text-xs text-muted-foreground mt-1">
              {search || tagFilter
                ? 'Thử đổi từ khóa hoặc bộ lọc'
                : 'Nhấn "Thêm series" để tạo series nhiều phần'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/60 border-b border-border text-foreground/80 font-semibold text-xs uppercase tracking-wider">
                <tr>
                  <th className="text-left px-4 py-3.5 font-semibold">Series</th>
                  <th className="text-left px-4 py-3.5 font-semibold hidden md:table-cell">Thẻ</th>
                  <th className="text-center px-4 py-3.5 font-semibold">Số bài</th>
                  <th className="text-right px-4 py-3.5 font-semibold">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-card">
                {paginated.map(s => (
                  <tr
                    key={s.id}
                    onClick={() => setEditTarget(s)}
                    className="hover:bg-primary/5 cursor-pointer transition-colors group"
                  >
                    <td className="px-4 py-3.5">
                      <div className="font-medium text-foreground group-hover:text-primary transition-colors">
                        {s.title}
                      </div>
                      {s.description && (
                        <div className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{s.description}</div>
                      )}
                    </td>
                    <td className="px-4 py-3.5 hidden md:table-cell">
                      {s.tags ? (
                        <div className="flex flex-wrap gap-1">
                          {s.tags.split(',').map((t, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground border border-border"
                            >
                              #{t.trim()}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground/60 italic">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                        <BookOpen className="w-3 h-3" aria-hidden="true" />
                        {s._count.blogs}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditTarget(s);
                          }}
                          className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition cursor-pointer"
                          aria-label={`Sửa series ${s.title}`}
                        >
                          <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteTarget(s);
                          }}
                          className="p-1.5 text-muted-foreground hover:text-destructive rounded-lg hover:bg-destructive/10 transition cursor-pointer"
                          aria-label={`Xóa series ${s.title}`}
                        >
                          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
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
            tags: editTarget.tags ?? undefined,
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
          title={`Xóa series "${deleteTarget.title}"?`}
          description="Các bài viết trong series sẽ không bị xóa, chỉ bị gỡ khỏi series."
          successMessage="Đã xóa series."
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
