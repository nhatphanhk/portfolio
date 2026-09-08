'use client';

import { useState } from 'react';
import { Layers, Plus, Pencil, Trash2, BookOpen } from 'lucide-react';
import { SeriesDialog } from '@/components/admin/SeriesDialog';
import { DeleteDialog } from '@/components/admin/DeleteDialog';
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

interface Props {
  initialSeries: Series[];
}

export function AdminSeriesClient({ initialSeries }: Props) {
  const router = useRouter();
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Series | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Series | null>(null);

  const handleSuccess = () => {
    router.refresh();
  };

  return (
    <main className="flex flex-1 flex-col gap-6 p-6 w-full max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Blog Series</h1>
          <p className="text-sm text-muted-foreground">
            Organize related blog articles into sequential reading series
          </p>
        </div>
        <button
          type="button"
          onClick={() => setCreateOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-foreground text-background rounded-lg text-sm font-medium hover:bg-foreground/90 transition-colors shadow-xs"
        >
          <Plus className="h-4 w-4" />
          New Series
        </button>
      </div>

      <div className="rounded-xl border border-border overflow-hidden bg-card">
        {initialSeries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
            <Layers className="h-10 w-10 mb-3 opacity-30" />
            <p className="font-medium text-foreground">No series created yet</p>
            <p className="text-sm opacity-60 mt-1">
              Click &quot;New Series&quot; to create a multi-part article series
            </p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Series</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Slug</th>
                <th className="text-center px-4 py-3 font-medium text-muted-foreground">Articles</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {initialSeries.map(s => (
                <tr key={s.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-medium text-foreground">{s.title}</div>
                    {s.description && (
                      <div className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                        {s.description}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                    /blog?series={s.slug}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary">
                      <BookOpen className="w-3 h-3" />
                      {s._count.blogs}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => setEditTarget(s)}
                        className="p-1.5 text-muted-foreground hover:text-foreground rounded-md hover:bg-muted transition"
                        title="Edit Series"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(s)}
                        className="p-1.5 text-muted-foreground hover:text-destructive rounded-md hover:bg-destructive/10 transition"
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
