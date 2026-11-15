'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { Upload, Images, X, Check, Loader2, ImagePlus } from 'lucide-react';
import Image from 'next/image';
import { getMediaLibrary } from '@/lib/actions/media';
import { uploadBlogImage } from '@/lib/upload';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

type MediaItem = {
  id: string;
  url: string;
  filename: string;
  mimetype: string | null;
  size: number | null;
  createdAt: Date;
  altText: string | null;
};

interface ImageUploadModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (url: string, alt?: string) => void;
}

/** Mirrors MAX_IMAGE_BYTES in /api/upload so oversized files fail before the request. */
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

export function ImageUploadModal({ open, onClose, onSelect }: ImageUploadModalProps) {
  const [tab, setTab] = useState<'upload' | 'library'>('upload');
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<{ url: string; file: File } | null>(null);
  const [altText, setAltText] = useState('');
  const [library, setLibrary] = useState<MediaItem[]>([]);
  const [loadingLibrary, setLoadingLibrary] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load library when switching to library tab
  useEffect(() => {
    if (tab === 'library' && open) {
      setLoadingLibrary(true);
      getMediaLibrary('blog')
        .then(items => setLibrary(items as MediaItem[]))
        .catch(() => toast.error('Không thể tải thư viện ảnh.'))
        .finally(() => setLoadingLibrary(false));
    }
  }, [tab, open]);

  // Free the blob URL whenever the preview is replaced or cleared
  useEffect(() => {
    if (!preview) return;
    return () => URL.revokeObjectURL(preview.url);
  }, [preview]);

  // Reset state when modal closes
  useEffect(() => {
    if (!open) {
      setPreview(null);
      setAltText('');
      setSelectedMedia(null);
      setTab('upload');
    }
  }, [open]);

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files?.length) return;
    const file = files[0];
    if (!file.type.startsWith('image/') || file.type === 'image/svg+xml') {
      toast.error('Vui lòng chọn tệp ảnh PNG, JPG, GIF hoặc WebP.');
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      toast.error('Ảnh vượt quá 10MB.');
      return;
    }
    setPreview({ url: URL.createObjectURL(file), file });
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  const handleUploadAndInsert = useCallback(async () => {
    if (!preview) return;

    setUploading(true);
    try {
      const data = await uploadBlogImage(preview.file, 'blog');
      onSelect(data.url, altText || preview.file.name.replace(/\.[^.]+$/, ''));
      onClose();
    } catch (err) {
      const message = err instanceof Error ? err.message : '';
      toast.error(`Không thể tải ảnh lên: ${message || 'Vui lòng thử lại.'}`);
    } finally {
      setUploading(false);
    }
  }, [preview, altText, onSelect, onClose]);

  const handleLibrarySelect = useCallback(() => {
    if (!selectedMedia) return;
    onSelect(selectedMedia.url, selectedMedia.altText ?? selectedMedia.filename);
    onClose();
  }, [selectedMedia, onSelect, onClose]);

  const tabClass = (active: boolean) =>
    `flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors border-b-2 -mb-px ${
      active ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
    }`;

  return (
    <Dialog open={open} onOpenChange={o => !o && !uploading && onClose()}>
      <DialogContent className="max-w-2xl p-0 gap-0 overflow-hidden bg-card max-h-[90vh] overflow-y-auto">
        <DialogHeader className="px-6 py-4 border-b border-border">
          <DialogTitle className="flex items-center gap-2 text-base">
            <ImagePlus className="w-5 h-5 text-primary" aria-hidden="true" />
            Chèn ảnh
          </DialogTitle>
          <DialogDescription className="sr-only">Tải ảnh mới lên hoặc chọn từ thư viện ảnh.</DialogDescription>
        </DialogHeader>

        {/* Tabs */}
        <div className="flex border-b border-border" role="tablist" aria-label="Nguồn ảnh">
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'upload'}
            onClick={() => setTab('upload')}
            className={tabClass(tab === 'upload')}
          >
            <Upload className="w-4 h-4" aria-hidden="true" />
            Tải ảnh mới
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'library'}
            onClick={() => setTab('library')}
            className={tabClass(tab === 'library')}
          >
            <Images className="w-4 h-4" aria-hidden="true" />
            Thư viện ảnh
          </button>
        </div>

        {/* Tab content */}
        <div className="p-6" role="tabpanel">
          {tab === 'upload' && (
            <div className="space-y-4">
              {!preview ? (
                /* Drop zone */
                <div
                  role="button"
                  tabIndex={0}
                  aria-label="Chọn ảnh để tải lên"
                  onDrop={handleDrop}
                  onDragOver={e => {
                    e.preventDefault();
                    setDragging(true);
                  }}
                  onDragLeave={() => setDragging(false)}
                  onClick={() => inputRef.current?.click()}
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      inputRef.current?.click();
                    }
                  }}
                  className={`flex flex-col items-center justify-center gap-3 h-52 border-2 border-dashed rounded-xl cursor-pointer transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                    dragging ? 'border-primary bg-primary/10 scale-[1.01]' : 'border-border hover:border-primary/50 hover:bg-muted/40'
                  }`}
                >
                  <div className="p-3 rounded-full bg-primary/10">
                    <Upload className="w-6 h-6 text-primary" aria-hidden="true" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-foreground">Kéo thả hoặc bấm để chọn ảnh</p>
                    <p className="text-xs text-muted-foreground mt-1">PNG, JPG, GIF, WebP — tối đa 10MB</p>
                  </div>
                  <input
                    ref={inputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/gif,image/webp"
                    className="hidden"
                    tabIndex={-1}
                    onChange={e => {
                      handleFiles(e.target.files);
                      e.target.value = '';
                    }}
                  />
                </div>
              ) : (
                /* Preview */
                <div className="space-y-3">
                  <div className="relative w-full h-52 rounded-xl overflow-hidden bg-muted border border-border">
                    <Image src={preview.url} alt="Ảnh xem trước" fill className="object-contain" unoptimized />
                    <button
                      type="button"
                      onClick={() => setPreview(null)}
                      aria-label="Bỏ ảnh đã chọn"
                      className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black/80 rounded-full text-white transition-colors"
                    >
                      <X className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                  </div>
                  <label htmlFor="image-alt-text" className="sr-only">
                    Mô tả ảnh (alt)
                  </label>
                  <input
                    id="image-alt-text"
                    type="text"
                    value={altText}
                    onChange={e => setAltText(e.target.value)}
                    placeholder="Mô tả ảnh (alt, không bắt buộc — giúp người dùng trình đọc màn hình)"
                    className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              )}

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={uploading}
                  className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleUploadAndInsert}
                  disabled={!preview || uploading}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {uploading ? (
                    <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                  ) : (
                    <Upload className="w-4 h-4" aria-hidden="true" />
                  )}
                  {uploading ? 'Đang tải lên…' : 'Tải lên & chèn'}
                </button>
              </div>
            </div>
          )}

          {tab === 'library' && (
            <div className="space-y-4">
              {loadingLibrary ? (
                <div className="flex items-center justify-center h-52" role="status" aria-label="Đang tải thư viện ảnh">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" aria-hidden="true" />
                </div>
              ) : library.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-52 gap-2 text-muted-foreground">
                  <Images className="w-10 h-10 opacity-30" aria-hidden="true" />
                  <p className="text-sm">Chưa có ảnh nào</p>
                  <button type="button" onClick={() => setTab('upload')} className="text-sm text-primary hover:underline">
                    Tải ảnh đầu tiên
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-64 overflow-y-auto pr-1">
                  {library.map(item => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSelectedMedia(item)}
                      aria-label={item.altText ?? item.filename}
                      aria-pressed={selectedMedia?.id === item.id}
                      className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                        selectedMedia?.id === item.id ? 'border-primary ring-2 ring-primary/30' : 'border-transparent hover:border-border'
                      }`}
                    >
                      <Image src={item.url} alt="" fill className="object-cover" unoptimized />
                      {selectedMedia?.id === item.id && (
                        <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                          <Check className="w-5 h-5 text-primary" aria-hidden="true" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}

              {selectedMedia && (
                <p className="text-xs text-muted-foreground truncate">
                  Đã chọn: <span className="text-foreground font-medium">{selectedMedia.filename}</span>
                </p>
              )}

              <div className="flex justify-end gap-2">
                <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleLibrarySelect}
                  disabled={!selectedMedia}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Check className="w-4 h-4" aria-hidden="true" />
                  Chèn ảnh đã chọn
                </button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
