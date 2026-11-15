'use client';

import { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import Image from 'next/image';
import { Images, Trash2, Copy, Check, Upload, Loader2, X, Search } from 'lucide-react';
import { deleteMedia } from '@/lib/actions/media';
import { DeleteDialog } from '@/components/admin/DeleteDialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useIsMobile } from '@/hooks/use-mobile';
import { PaginationControl } from '@/components/ui/PaginationControl';
import { toast } from 'sonner';
import { formatDate } from '@/lib/utils';

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
  const isMobile = useIsMobile();

  const copyUrl = useCallback((item: MediaItem) => {
    navigator.clipboard.writeText(item.url).then(() => {
      setCopiedId(item.id);
      setTimeout(() => setCopiedId(null), 2000);
      toast.success('Đã sao chép URL.');
    }, () => toast.error('Không thể sao chép URL.'));
  }, []);

  const uploadFile = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Chỉ hỗ trợ tệp hình ảnh.');
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
        toast.error(`Không thể tải ảnh lên: ${data.error || 'Vui lòng thử lại.'}`);
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
      toast.success('Đã tải ảnh lên.');
    } catch {
      toast.error('Không thể tải ảnh lên. Vui lòng thử lại.');
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
    // The library is an image picker; PDFs (résumé uploads) would render as broken tiles
    const images = items.filter(item => (item.mimetype ?? '').startsWith('image/'));
    if (!search.trim()) return images;
    const q = search.toLowerCase().trim();
    return images.filter(
      item => item.filename.toLowerCase().includes(q) || (item.altText ?? '').toLowerCase().includes(q)
    );
  }, [items, search]);

  const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE) || 1;
  // Keep the page in range when rows are deleted or filters shrink the list
  useEffect(() => {
    setCurrentPage(p => Math.min(p, totalPages));
  }, [totalPages]);
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredItems.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredItems, currentPage]);

  return (
    <main className="flex flex-1 gap-4 p-4 sm:p-6 overflow-hidden h-full max-w-7xl mx-auto w-full">
      {/* ── Grid card panel ── */}
      <div className="flex-1 flex flex-col rounded-xl border border-border bg-card shadow-xs overflow-hidden">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-6 py-4 border-b border-border shrink-0 bg-card">
          <div>
            <h1 className="text-xl font-bold text-foreground">Thư viện ảnh</h1>
            <p className="text-xs text-muted-foreground">
              {filteredItems.length} ảnh
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative flex-1 min-w-0 sm:w-64 sm:flex-none">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                placeholder="Tìm ảnh…"
                aria-label="Tìm ảnh theo tên tệp"
                value={search}
                onChange={e => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-border bg-card shadow-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-colors"
              />
            </div>

            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-foreground text-background rounded-lg text-xs font-medium hover:bg-foreground/90 disabled:opacity-60 transition-colors shrink-0 cursor-pointer"
            >
              {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" /> : <Upload className="h-3.5 w-3.5" aria-hidden="true" />}
              {uploading ? 'Đang tải lên…' : 'Tải ảnh lên'}
            </button>
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              className="hidden"
              aria-label="Chọn ảnh để tải lên"
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
                <p className="text-lg font-medium text-primary">Thả ảnh để tải lên</p>
              </div>
            </div>
          )}

          {paginatedItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground py-16">
              <Images className="w-16 h-16 opacity-20" />
              <p className="text-lg font-medium text-foreground">
                {search.trim() ? 'Không có ảnh phù hợp' : 'Chưa có ảnh nào'}
              </p>
              <p className="text-sm">
                {search.trim()
                  ? 'Thử tìm với tên tệp khác'
                  : 'Tải ảnh lên để dùng trong bài viết và dự án'}
              </p>
              {!search.trim() && (
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  className="mt-2 px-4 py-2 border border-border rounded-lg text-sm hover:bg-muted transition-colors font-medium text-foreground cursor-pointer"
                >
                  Tải ảnh đầu tiên
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
                  aria-label={`Xem chi tiết ${item.filename}`}
                  aria-pressed={selectedItem?.id === item.id}
                  className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all group bg-muted/20 cursor-pointer ${
                    selectedItem?.id === item.id
                      ? 'border-primary ring-2 ring-primary/30'
                      : 'border-border/60 hover:border-border'
                  }`}
                >
                  <Image
                    src={item.url}
                    alt=""
                    fill
                    className="object-cover"
                    unoptimized
                  />
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-1.5 text-[10px] text-white truncate text-left opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity">
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

      {/* ── Detail panel: sidebar on desktop, bottom sheet on phones ── */}
      {selectedItem && !isMobile && (
        <aside className="w-80 shrink-0 rounded-xl border border-border flex flex-col overflow-y-auto bg-card shadow-xs">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
            <h2 className="text-sm font-semibold text-foreground">Chi tiết ảnh</h2>
            <button
              type="button"
              onClick={() => setSelectedItem(null)}
              aria-label="Đóng chi tiết ảnh"
              className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
          {renderDetail(selectedItem)}
        </aside>
      )}
      <Sheet open={!!selectedItem && isMobile} onOpenChange={open => !open && setSelectedItem(null)}>
        <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto p-0">
          <SheetHeader className="border-b border-border">
            <SheetTitle>Chi tiết ảnh</SheetTitle>
          </SheetHeader>
          {selectedItem && renderDetail(selectedItem)}
        </SheetContent>
      </Sheet>

      {/* Delete dialog */}
      {deleteTarget && (
        <DeleteDialog
          open={!!deleteTarget}
          onOpenChange={open => !open && setDeleteTarget(null)}
          title={`Xóa ảnh "${deleteTarget.filename}"?`}
          description="Ảnh sẽ bị xóa vĩnh viễn khỏi bộ lưu trữ và cơ sở dữ liệu."
          successMessage="Đã xóa ảnh."
          onConfirm={async () => {
            const res = await deleteMedia(deleteTarget.id);
            if (!res.ok) return res;
            setItems(prev => prev.filter(i => i.id !== deleteTarget.id));
            if (selectedItem?.id === deleteTarget.id) setSelectedItem(null);
            return { ok: true };
          }}
        />
      )}
    </main>
  );

  function renderDetail(item: MediaItem) {
    return (
      <>
          <div className="relative aspect-video w-full border-b border-border bg-muted/20">
            <Image
              src={item.url}
              alt={item.altText ?? item.filename}
              fill
              className="object-contain p-2"
              unoptimized
            />
          </div>

          <div className="p-4 space-y-4">
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Tên tệp</p>
              <p className="text-sm text-foreground break-all font-medium">{item.filename}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Định dạng</p>
                <p className="text-xs text-foreground">{item.mimetype ?? '—'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Dung lượng</p>
                <p className="text-xs text-foreground">{formatBytes(item.size)}</p>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Ngày tải lên</p>
              <p className="text-xs text-foreground">
                {formatDate(item.createdAt, 'vi')}
              </p>
            </div>

            {/* URL copy */}
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">URL</p>
              <div className="flex items-center gap-1">
                <input
                  readOnly
                  value={item.url}
                  aria-label="URL ảnh"
                  className="flex-1 min-w-0 text-xs px-2.5 py-1.5 border border-border rounded-lg bg-muted text-muted-foreground truncate font-mono"
                />
                <button
                  type="button"
                  onClick={() => copyUrl(item)}
                  aria-label="Sao chép URL"
                  className="shrink-0 p-2 rounded-lg border border-border hover:bg-muted transition-colors"
                >
                  {copiedId === item.id ? (
                    <Check className="w-3.5 h-3.5 text-green-600" aria-hidden="true" />
                  ) : (
                    <Copy className="w-3.5 h-3.5 text-muted-foreground" aria-hidden="true" />
                  )}
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 space-y-2">
              <button
                type="button"
                onClick={() => copyUrl(item)}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 border border-border rounded-lg text-sm hover:bg-muted transition-colors font-medium"
              >
                <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                Sao chép URL ảnh
              </button>
              <button
                type="button"
                onClick={() => setDeleteTarget(item)}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 text-destructive border border-destructive/30 rounded-lg text-sm hover:bg-destructive/10 transition-colors font-medium"
              >
                <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                Xóa ảnh
              </button>
            </div>
          </div>
      </>
    );
  }
}
