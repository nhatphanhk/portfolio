'use client';

import { useState } from 'react';
import { FileText, Plus, Pencil, Trash2 } from 'lucide-react';
import { BlogDialog } from '@/components/admin/BlogDialog';
import { DeleteDialog } from '@/components/admin/DeleteDialog';
import { deleteBlog } from '@/lib/actions/blog';

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
};

interface AdminBlogsClientProps {
  blogs: Blog[];
}

export function AdminBlogsClient({ blogs }: AdminBlogsClientProps) {
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Blog | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Blog | null>(null);

  return (
    <main className="flex flex-1 flex-col gap-6 p-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Blog Posts</h1>
          <p className="text-sm text-muted-foreground">{blogs.length} posts total</p>
        </div>
        <button
          id="create-blog-btn"
          type="button"
          onClick={() => setCreateOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-foreground text-background rounded-lg text-sm font-medium hover:bg-foreground/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          New Post
        </button>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border overflow-hidden">
        {blogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
            <FileText className="h-10 w-10 mb-3 opacity-30" />
            <p>No blog posts yet</p>
            <p className="text-sm opacity-60 mt-1">Click "New Post" to create your first article</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Title</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Tags</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">Published</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {blogs.map(blog => (
                <tr key={blog.id} className="bg-card hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="font-medium text-foreground line-clamp-1">{blog.title}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {blog.tags.slice(0, 3).map(t => (
                        <span key={t.tag.name} className="px-2 py-0.5 text-xs bg-muted rounded text-muted-foreground">
                          {t.tag.name}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">
                    {blog.publishedAt
                      ? new Date(blog.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                      : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 text-xs rounded-full ${
                      blog.status === 'PUBLISHED' ? 'bg-green-500/10 text-green-600 dark:text-green-400'
                      : blog.status === 'DRAFT' ? 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400'
                      : 'bg-muted text-muted-foreground'
                    }`}>
                      {blog.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 justify-end">
                      <button
                        type="button"
                        aria-label={`Edit ${blog.title}`}
                        onClick={() => setEditTarget(blog)}
                        className="p-1.5 text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-muted"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        aria-label={`Delete ${blog.title}`}
                        onClick={() => setDeleteTarget(blog)}
                        className="p-1.5 text-muted-foreground hover:text-destructive transition-colors rounded-md hover:bg-destructive/10"
                      >
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

      {/* Create Dialog */}
      <BlogDialog mode="create" open={createOpen} onOpenChange={setCreateOpen} />

      {/* Edit Dialog */}
      {editTarget && (
        <BlogDialog
          mode="edit"
          open={!!editTarget}
          onOpenChange={open => !open && setEditTarget(null)}
          initialData={{
            id: editTarget.id,
            title: editTarget.title,
            slug: editTarget.slug,
            excerpt: editTarget.excerpt ?? '',
            content: editTarget.content,
            thumbnailUrl: editTarget.thumbnailUrl ?? '',
            status: editTarget.status as 'DRAFT' | 'PUBLISHED' | 'ARCHIVED',
            tags: editTarget.tags.map(t => t.tag.name).join(', '),
          }}
        />
      )}

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
