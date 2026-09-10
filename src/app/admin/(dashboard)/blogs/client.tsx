'use client';

import { useState, useTransition, useMemo } from 'react';
import { FileText, Plus, Pencil, Trash2, Loader2, Search, Filter, Layers, ChevronDown } from 'lucide-react';
import { DeleteDialog } from '@/components/admin/DeleteDialog';
import { PaginationControl } from '@/components/ui/PaginationControl';
import { deleteBlog, createBlogDraft } from '@/lib/actions/blog';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';

type Blog = {
  id: string;
  title: string;
  slug: string;
  status: string;
  publishedAt: Date | null;
  excerpt: string | null;
  content: string;
  thumbnailUrl: string | null;
  tags: { tag: { name: string } }[];
  series?: { id: string; title: string; slug: string } | null;
};

const ITEMS_PER_PAGE = 10;

interface AdminBlogsClientProps {
  blogs: Blog[];
}

export function AdminBlogsClient({ blogs }: AdminBlogsClientProps) {
  const router = useRouter();
  const [isCreating, startCreateTransition] = useTransition();
  const [deleteTarget, setDeleteTarget] = useState<Blog | null>(null);

  const [search, setSearch] = useState('');
  const [seriesFilter, setSeriesFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [tagFilter, setTagFilter] = useState<string>('ALL');
  const [currentPage, setCurrentPage] = useState(1);

  // Extract all unique tags
  const allTags = useMemo(() => {
    const set = new Set<string>();
    blogs.forEach(b => b.tags.forEach(t => set.add(t.tag.name)));
    return Array.from(set).sort();
  }, [blogs]);

  // Extract all unique series
  const allSeries = useMemo(() => {
    const map = new Map<string, string>();
    blogs.forEach(b => {
      if (b.series) {
        map.set(b.series.id, b.series.title);
      }
    });
    return Array.from(map.entries()).map(([id, title]) => ({ id, title }));
  }, [blogs]);

  const handleNewPost = () => {
    startCreateTransition(async () => {
      const result = await createBlogDraft();
      if (result.ok && result.id) {
        router.push(`/admin/blogs/editor/${result.id}`);
      } else {
        toast.error('Failed to create draft. Please try again.');
      }
    });
  };

  const filtered = useMemo(() => {
    return blogs.filter(blog => {
      if (statusFilter !== 'ALL' && blog.status !== statusFilter) return false;
      if (tagFilter !== 'ALL' && !blog.tags.some(t => t.tag.name === tagFilter)) return false;
      if (seriesFilter !== 'ALL') {
        if (seriesFilter === 'NONE') {
          if (blog.series) return false;
        } else {
          if (blog.series?.id !== seriesFilter) return false;
        }
      }
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const matchTitle = blog.title.toLowerCase().includes(q);
        const matchSlug = blog.slug.toLowerCase().includes(q);
        const matchExcerpt = (blog.excerpt ?? '').toLowerCase().includes(q);
        const matchTag = blog.tags.some(t => t.tag.name.toLowerCase().includes(q));
        const matchSeries = blog.series?.title.toLowerCase().includes(q) ?? false;
        if (!matchTitle && !matchSlug && !matchExcerpt && !matchTag && !matchSeries) return false;
      }
      return true;
    });
  }, [blogs, statusFilter, tagFilter, seriesFilter, search]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE) || 1;
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filtered.slice(start, start + ITEMS_PER_PAGE);
  }, [filtered, currentPage]);

  return (
    <main className="flex flex-1 flex-col gap-6 p-6 w-full max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Blog Posts</h1>
          <p className="text-sm text-muted-foreground">{blogs.length} posts total</p>
        </div>
        <button
          id="create-blog-btn"
          type="button"
          onClick={handleNewPost}
          disabled={isCreating}
          className="inline-flex items-center gap-2 px-4 py-2 bg-foreground text-background rounded-lg text-sm font-medium hover:bg-foreground/90 disabled:opacity-60 transition-colors self-start sm:self-auto cursor-pointer"
        >
          {isCreating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          {isCreating ? 'Creating…' : 'New Post'}
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        {/* Search input */}
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            placeholder="Search blogs by title, excerpt, tag..."
            value={search}
            onChange={e => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-border bg-white dark:bg-slate-900 shadow-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        {/* Series filter select dropdown */}
        <div className="relative w-full sm:w-56">
          <Layers className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
          <select
            value={seriesFilter}
            onChange={e => {
              setSeriesFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-8 pr-7 py-2 text-xs rounded-xl border border-border bg-white dark:bg-slate-900 shadow-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 appearance-none cursor-pointer truncate"
          >
            <option value="ALL">All Series ({allSeries.length})</option>
            <option value="NONE">No Series (Standalone)</option>
            {allSeries.map(s => (
              <option key={s.id} value={s.id}>
                {s.title}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground pointer-events-none" />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {/* Status filter */}
          <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border bg-white dark:bg-slate-900 shadow-xs text-xs text-muted-foreground">
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
              <option value="ALL">All</option>
              <option value="PUBLISHED">Published</option>
              <option value="DRAFT">Draft</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>

          {/* Tag filter */}
          {allTags.length > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border bg-white dark:bg-slate-900 shadow-xs text-xs text-muted-foreground">
              <span className="font-medium">Tag:</span>
              <select
                value={tagFilter}
                onChange={e => {
                  setTagFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-transparent text-foreground outline-none font-medium cursor-pointer max-w-[120px] truncate"
              >
                <option value="ALL">All Tags</option>
                {allTags.map(tag => (
                  <option key={tag} value={tag}>
                    {tag}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Table Card Container */}
      <div className="rounded-xl border border-border bg-card shadow-xs overflow-hidden">
        {paginated.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground bg-card">
            <FileText className="h-10 w-10 mb-3 opacity-30" />
            <p className="font-medium text-foreground">No blog posts found</p>
            <p className="text-xs text-muted-foreground mt-1">
              {search || seriesFilter !== 'ALL' || statusFilter !== 'ALL' || tagFilter !== 'ALL'
                ? 'Try adjusting your search or filters'
                : 'Click "New Post" to create your first article'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-100/90 dark:bg-slate-800/90 border-b border-border text-slate-700 dark:text-slate-300 font-semibold text-xs uppercase tracking-wider">
                <tr>
                  <th className="text-left px-4 py-3.5 font-semibold text-slate-700 dark:text-slate-300">Title & Series</th>
                  <th className="text-left px-4 py-3.5 font-semibold text-slate-700 dark:text-slate-300 hidden md:table-cell">Tags</th>
                  <th className="text-left px-4 py-3.5 font-semibold text-slate-700 dark:text-slate-300 hidden sm:table-cell">Published</th>
                  <th className="text-left px-4 py-3.5 font-semibold text-slate-700 dark:text-slate-300">Status</th>
                  <th className="px-4 py-3.5 text-right font-semibold text-slate-700 dark:text-slate-300">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-card">
                {paginated.map(blog => (
                  <tr
                    key={blog.id}
                    onClick={() => router.push(`/admin/blogs/editor/${blog.id}`)}
                    className="hover:bg-primary/5 cursor-pointer transition-colors group"
                  >
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <FileText className="h-4 w-4 text-primary shrink-0" />
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium text-foreground group-hover:text-primary transition-colors line-clamp-1">
                              {blog.title}
                            </span>
                            {blog.series && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-primary/10 text-primary border border-primary/20 shrink-0">
                                <Layers className="w-2.5 h-2.5" />
                                {blog.series.title}
                              </span>
                            )}
                          </div>
                          <span className="font-mono text-xs text-muted-foreground block mt-0.5">
                            /{blog.slug}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 hidden md:table-cell">
                      <div className="flex flex-wrap gap-1">
                        {blog.tags.slice(0, 3).map(t => (
                          <span
                            key={t.tag.name}
                            className="px-2 py-0.5 text-xs bg-muted rounded-md font-medium text-muted-foreground border border-border/50"
                          >
                            {t.tag.name}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-muted-foreground hidden sm:table-cell">
                      {blog.publishedAt
                        ? new Date(blog.publishedAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })
                        : '—'}
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`px-2 py-0.5 text-xs rounded-full font-medium ${
                          blog.status === 'PUBLISHED'
                            ? 'bg-green-500/10 text-green-700 dark:text-green-400'
                            : blog.status === 'DRAFT'
                              ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400'
                              : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {blog.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center gap-1 justify-end">
                        {/* Edit → redirect to full-page editor */}
                        <Link
                          href={`/admin/blogs/editor/${blog.id}`}
                          onClick={(e) => e.stopPropagation()}
                          aria-label={`Edit ${blog.title}`}
                          className="p-1.5 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Link>
                        <button
                          type="button"
                          aria-label={`Delete ${blog.title}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteTarget(blog);
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

      {/* Delete Dialog */}
      {deleteTarget && (
        <DeleteDialog
          open={!!deleteTarget}
          onOpenChange={open => !open && setDeleteTarget(null)}
          title={`Delete "${deleteTarget.title}"?`}
          description="This will permanently delete the blog post and all associated data."
          onConfirm={() => deleteBlog(deleteTarget.id)}
        />
      )}
    </main>
  );
}
