'use client';

import { useState, useCallback, useRef, useMemo } from 'react';
import Image from 'next/image';
import { Images, Trash2, Copy, Check, Upload, Loader2, X, Search } from 'lucide-react';
import { deleteMedia } from '@/lib/actions/media';
import { DeleteDialog } from '@/components/admin/DeleteDialog';
import { PaginationControl } from '@/components/ui/PaginationControl';
import { toast } from 'sonner';

type MediaItem = {
  id: string;
  url: string;
  filename: string;
  mimetype: string | null;
  size: number | null;
  fileType: string | null;
  altText: string | null;
  createdAt: Date;
};

const ITEMS_PER_PAGE = 18;

function formatBytes(bytes: number | null): string {
  if (!bytes) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

interface MediaLibraryClientProps {
  media: MediaItem[];
}

export function MediaLibraryClient({ media: initialMedia }: MediaLibraryClientProps) {
  const [items, setItems] = useState<MediaItem[]>(initialMedia);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<MediaItem | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const copyUrl = useCallback((item: MediaItem) => {
    navigator.clipboard.writeText(item.url).then(() => {
      setCopiedId(item.id);
      setTimeout(() => setCopiedId(null), 2000);
      toast.success('URL copied to clipboard');
    });
  }, []);

  const uploadFile = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Only image files are supported');
      return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('fileType', 'blog');
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Upload failed');
        return;
      }
      // Prepend new item optimistically
      const newItem: MediaItem = {
        id: data.id ?? crypto.randomUUID(),
        url: data.url,
        filename: data.filename,
        mimetype: data.type,
        size: data.size,
        fileType: 'blog',
        altText: null,
        createdAt: new Date(),
      };
      setItems(prev => [newItem, ...prev]);
      toast.success('Image uploaded');
    } catch {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) uploadFile(file);
  }, [uploadFile]);

  const filteredItems = useMemo(() => {
    if (!search.trim()) return items;
    const q = search.toLowerCase().trim();
    return items.filter(
      item => item.filename.toLowerCase().includes(q) || (item.altText ?? '').toLowerCase().includes(q)
    );
  }, [items, search]);

  const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE) || 1;
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredItems.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredItems, currentPage]);

  return (
    <main className="flex flex-1 gap-4 p-6 overflow-hidden h-full max-w-7xl mx-auto w-full">
      {/* ── Grid card panel ── */}
      <div className="flex-1 flex flex-col rounded-xl border border-border bg-card shadow-xs overflow-hidden">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-6 py-4 border-b border-border shrink-0 bg-card">
          <div>
            <h1 className="text-xl font-bold text-foreground">Media Library</h1>
            <p className="text-xs text-muted-foreground">
              {filteredItems.length} of {items.length} files
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative w-48 sm:w-64">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                placeholder="Search images..."
                value={search}
                onChange={e => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-border bg-white dark:bg-slate-900 shadow-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>

            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-foreground text-background rounded-lg text-xs font-medium hover:bg-foreground/90 disabled:opacity-60 transition-colors shrink-0 cursor-pointer"
            >
              {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
              {uploading ? 'Uploading…' : 'Upload Image'}
            </button>
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={e => e.target.files?.[0] && uploadFile(e.target.files[0])}
            />
          </div>
        </div>

        {/* Drop zone overlay hint */}
        <div
          className="flex-1 overflow-y-auto p-6 bg-card"
          onDrop={handleDrop}
          onDragOver={e => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
        >
          {dragging && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm pointer-events-none">
              <div className="flex flex-col items-center gap-3 p-10 border-2 border-dashed border-primary rounded-2xl bg-card shadow-lg">
                <Upload className="w-10 h-10 text-primary" />
                <p className="text-lg font-medium text-primary">Drop to upload</p>
              </div>
            </div>
          )}

          {paginatedItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground py-16">
              <Images className="w-16 h-16 opacity-20" />
              <p className="text-lg font-medium text-foreground">
                {items.length === 0 ? 'No media uploaded yet' : 'No images match your search'}
              </p>
              <p className="text-sm">
                {items.length === 0
                  ? 'Upload images to use them in your blog posts and portfolio'
                  : 'Try searching for a different filename'}
              </p>
              {items.length === 0 && (
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  className="mt-2 px-4 py-2 border border-border rounded-lg text-sm hover:bg-muted transition-colors font-medium text-foreground cursor-pointer"
                >
                  Upload first image
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
              {paginatedItems.map(item => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedItem(item)}
                  className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all group bg-muted/20 cursor-pointer ${
                    selectedItem?.id === item.id
                      ? 'border-primary ring-2 ring-primary/30'
                      : 'border-border/60 hover:border-border'
                  }`}
                >
                  <Image
                    src={item.url}
                    alt={item.altText ?? item.filename}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <Copy className="w-4 h-4 text-white" />
                  </div>
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-1.5 text-[10px] text-white truncate text-left opacity-0 group-hover:opacity-100 transition-opacity">
                    {item.filename}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Pagination in footer */}
        {filteredItems.length > 0 && (
          <div className="p-4 bg-card border-t border-border shrink-0">
            <PaginationControl
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredItems.length}
              pageSize={ITEMS_PER_PAGE}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>

      {/* ── Detail sidebar ── */}
      {selectedItem && (
        <aside className="w-80 shrink-0 rounded-xl border border-border flex flex-col overflow-y-auto bg-card shadow-xs">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
            <h2 className="text-sm font-semibold text-foreground">Image Details</h2>
            <button
              type="button"
              onClick={() => setSelectedItem(null)}
              className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="relative aspect-video w-full border-b border-border bg-muted/20">
            <Image
              src={selectedItem.url}
              alt={selectedItem.altText ?? selectedItem.filename}
              fill
              className="object-contain p-2"
              unoptimized
            />
          </div>

          <div className="p-4 space-y-4">
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Filename</p>
              <p className="text-sm text-foreground break-all font-medium">{selectedItem.filename}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Type</p>
                <p className="text-xs text-foreground">{selectedItem.mimetype ?? '—'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Size</p>
                <p className="text-xs text-foreground">{formatBytes(selectedItem.size)}</p>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Uploaded</p>
              <p className="text-xs text-foreground">
                {new Date(selectedItem.createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </p>
            </div>

            {/* URL copy */}
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">URL</p>
              <div className="flex items-center gap-1">
                <input
                  readOnly
                  value={selectedItem.url}
                  className="flex-1 min-w-0 text-xs px-2.5 py-1.5 border border-border rounded-lg bg-muted text-muted-foreground truncate font-mono"
                />
                <button
                  type="button"
                  onClick={() => copyUrl(selectedItem)}
                  className="shrink-0 p-2 rounded-lg border border-border hover:bg-muted transition-colors"
                >
                  {copiedId === selectedItem.id ? (
                    <Check className="w-3.5 h-3.5 text-green-500" />
                  ) : (
                    <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                  )}
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 space-y-2">
              <button
                type="button"
                onClick={() => copyUrl(selectedItem)}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 border border-border rounded-lg text-sm hover:bg-muted transition-colors font-medium"
              >
                <Copy className="w-3.5 h-3.5" />
                Copy Image URL
              </button>
              <button
                type="button"
                onClick={() => setDeleteTarget(selectedItem)}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 text-destructive border border-destructive/30 rounded-lg text-sm hover:bg-destructive/10 transition-colors font-medium"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete Image
              </button>
            </div>
          </div>
        </aside>
      )}

      {/* Delete dialog */}
      {deleteTarget && (
        <DeleteDialog
          open={!!deleteTarget}
          onOpenChange={open => !open && setDeleteTarget(null)}
          title={`Delete "${deleteTarget.filename}"?`}
          description="This will permanently delete the image from storage and the database."
          onConfirm={async () => {
            await deleteMedia(deleteTarget.id);
            setItems(prev => prev.filter(i => i.id !== deleteTarget.id));
            if (selectedItem?.id === deleteTarget.id) setSelectedItem(null);
            toast.success('Image deleted');
            return { ok: true };
          }}
        />
      )}
    </main>
  );
}
