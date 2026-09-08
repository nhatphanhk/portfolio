'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { Upload, Images, X, Check, Loader2, ImagePlus } from 'lucide-react';
import Image from 'next/image';
import { getMediaLibrary } from '@/lib/actions/media';
import { toast } from 'sonner';

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
        .catch(() => toast.error('Failed to load media library'))
        .finally(() => setLoadingLibrary(false));
    }
  }, [tab, open]);

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
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    const objectUrl = URL.createObjectURL(file);
    setPreview({ url: objectUrl, file });
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const handleUploadAndInsert = useCallback(async () => {
    if (!preview) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', preview.file);
      formData.append('fileType', 'blog');

      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Upload failed');
        return;
      }

      onSelect(data.url, altText || preview.file.name.replace(/\.[^.]+$/, ''));
      onClose();
    } catch {
      toast.error('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  }, [preview, altText, onSelect, onClose]);

  const handleLibrarySelect = useCallback(() => {
    if (!selectedMedia) return;
    onSelect(selectedMedia.url, selectedMedia.altText ?? selectedMedia.filename);
    onClose();
  }, [selectedMedia, onSelect, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-2xl mx-4 bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <ImagePlus className="w-5 h-5 text-primary" />
            <h2 className="font-semibold text-foreground">Insert Image</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border">
          <button
            type="button"
            onClick={() => setTab('upload')}
            className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors border-b-2 -mb-px ${
              tab === 'upload'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Upload className="w-4 h-4" />
            Upload New
          </button>
          <button
            type="button"
            onClick={() => setTab('library')}
            className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors border-b-2 -mb-px ${
              tab === 'library'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Images className="w-4 h-4" />
            Media Library
          </button>
        </div>

        {/* Tab content */}
        <div className="p-6">
          {tab === 'upload' && (
            <div className="space-y-4">
              {!preview ? (
                /* Drop zone */
                <div
                  onDrop={handleDrop}
                  onDragOver={e => { e.preventDefault(); setDragging(true); }}
                  onDragLeave={() => setDragging(false)}
                  onClick={() => inputRef.current?.click()}
                  className={`flex flex-col items-center justify-center gap-3 h-52 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
                    dragging
                      ? 'border-primary bg-primary/10 scale-[1.01]'
                      : 'border-border hover:border-primary/50 hover:bg-muted/40'
                  }`}
                >
                  <div className="p-3 rounded-full bg-primary/10">
                    <Upload className="w-6 h-6 text-primary" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-foreground">Drag & drop or click to upload</p>
                    <p className="text-xs text-muted-foreground mt-1">PNG, JPG, GIF, WebP — max 10MB</p>
                  </div>
                  <input
                    ref={inputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={e => handleFiles(e.target.files)}
                  />
                </div>
              ) : (
                /* Preview */
                <div className="space-y-3">
                  <div className="relative w-full h-52 rounded-xl overflow-hidden bg-muted border border-border">
                    <Image src={preview.url} alt="Preview" fill className="object-contain" unoptimized />
                    <button
                      type="button"
                      onClick={() => setPreview(null)}
                      className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black/80 rounded-full text-white transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <input
                    type="text"
                    value={altText}
                    onChange={e => setAltText(e.target.value)}
                    placeholder="Alt text (optional, for accessibility)"
                    className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              )}

              <div className="flex justify-end gap-2">
                <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleUploadAndInsert}
                  disabled={!preview || uploading}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  {uploading ? 'Uploading…' : 'Upload & Insert'}
                </button>
              </div>
            </div>
          )}

          {tab === 'library' && (
            <div className="space-y-4">
              {loadingLibrary ? (
                <div className="flex items-center justify-center h-52">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : library.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-52 gap-2 text-muted-foreground">
                  <Images className="w-10 h-10 opacity-30" />
                  <p className="text-sm">No images uploaded yet</p>
                  <button
                    type="button"
                    onClick={() => setTab('upload')}
                    className="text-sm text-primary hover:underline"
                  >
                    Upload your first image
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-4 gap-2 max-h-64 overflow-y-auto pr-1">
                  {library.map(item => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSelectedMedia(item)}
                      className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                        selectedMedia?.id === item.id
                          ? 'border-primary ring-2 ring-primary/30'
                          : 'border-transparent hover:border-border'
                      }`}
                    >
                      <Image src={item.url} alt={item.altText ?? item.filename} fill className="object-cover" unoptimized />
                      {selectedMedia?.id === item.id && (
                        <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                          <Check className="w-5 h-5 text-primary" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}

              {selectedMedia && (
                <p className="text-xs text-muted-foreground truncate">
                  Selected: <span className="text-foreground font-medium">{selectedMedia.filename}</span>
                </p>
              )}

              <div className="flex justify-end gap-2">
                <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleLibrarySelect}
                  disabled={!selectedMedia}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Check className="w-4 h-4" />
                  Insert Selected
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
