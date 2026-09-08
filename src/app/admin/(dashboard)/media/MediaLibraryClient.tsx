'use client';

import { useState, useCallback, useRef } from 'react';
import Image from 'next/image';
import { Images, Trash2, Copy, Check, Upload, Loader2, X } from 'lucide-react';
import { deleteMedia } from '@/lib/actions/media';
import { DeleteDialog } from '@/components/admin/DeleteDialog';
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

  return (
    <main className="flex flex-1 gap-0 overflow-hidden h-full">
      {/* ── Grid panel ── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Media Library</h1>
            <p className="text-sm text-muted-foreground">{items.length} files</p>
          </div>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-foreground text-background rounded-lg text-sm font-medium hover:bg-foreground/90 disabled:opacity-60 transition-colors"
          >
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
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

        {/* Drop zone overlay hint */}
        <div
          className="flex-1 overflow-y-auto p-6"
          onDrop={handleDrop}
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
        >
          {dragging && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm pointer-events-none">
              <div className="flex flex-col items-center gap-3 p-10 border-2 border-dashed border-primary rounded-2xl">
                <Upload className="w-10 h-10 text-primary" />
                <p className="text-lg font-medium text-primary">Drop to upload</p>
              </div>
            </div>
          )}

          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground">
              <Images className="w-16 h-16 opacity-20" />
              <p className="text-lg font-medium">No media uploaded yet</p>
              <p className="text-sm">Upload images to use them in your blog posts</p>
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="mt-2 px-4 py-2 border border-border rounded-lg text-sm hover:bg-muted transition-colors"
              >
                Upload first image
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
              {items.map(item => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedItem(item)}
                  className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all group ${
                    selectedItem?.id === item.id
                      ? 'border-primary ring-2 ring-primary/30'
                      : 'border-transparent hover:border-border'
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
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Detail sidebar ── */}
      {selectedItem && (
        <aside className="w-72 shrink-0 border-l border-border flex flex-col overflow-y-auto bg-card">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <h2 className="text-sm font-medium text-foreground">Details</h2>
            <button
              type="button"
              onClick={() => setSelectedItem(null)}
              className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="relative aspect-video w-full border-b border-border">
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
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Filename</p>
              <p className="text-sm text-foreground break-all">{selectedItem.filename}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Type</p>
                <p className="text-xs text-foreground">{selectedItem.mimetype ?? '—'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Size</p>
                <p className="text-xs text-foreground">{formatBytes(selectedItem.size)}</p>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Uploaded</p>
              <p className="text-xs text-foreground">
                {new Date(selectedItem.createdAt).toLocaleDateString('en-US', {
                  month: 'short', day: 'numeric', year: 'numeric',
                })}
              </p>
            </div>

            {/* URL copy */}
            <div className="space-y-1">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">URL</p>
              <div className="flex items-center gap-1">
                <input
                  readOnly
                  value={selectedItem.url}
                  className="flex-1 min-w-0 text-xs px-2 py-1.5 border border-border rounded-md bg-muted text-muted-foreground truncate"
                />
                <button
                  type="button"
                  onClick={() => copyUrl(selectedItem)}
                  className="shrink-0 p-1.5 rounded-md border border-border hover:bg-muted transition-colors"
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
                className="w-full flex items-center justify-center gap-2 px-3 py-2 border border-border rounded-lg text-sm hover:bg-muted transition-colors"
              >
                <Copy className="w-3.5 h-3.5" />
                Copy URL
              </button>
              <button
                type="button"
                onClick={() => setDeleteTarget(selectedItem)}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 text-destructive border border-destructive/30 rounded-lg text-sm hover:bg-destructive/10 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete
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
