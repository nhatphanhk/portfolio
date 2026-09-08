'use client';

import React, { useState, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  FileUp,
  FileText,
  Download,
  Trash2,
  ExternalLink,
  Copy,
  Check,
  Loader2,
  Eye,
  Link2,
  UploadCloud,
  FileCheck2,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';

interface ResumePdfDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentResumeUrl?: string | null;
  onSavePdfUrl: (url: string | null) => Promise<void> | void;
  onOpenConvertDialog?: () => void;
}

export function ResumePdfDialog({
  open,
  onOpenChange,
  currentResumeUrl,
  onSavePdfUrl,
  onOpenConvertDialog,
}: ResumePdfDialogProps) {
  const [tab, setTab] = useState<'upload' | 'url' | 'preview'>('upload');
  const [isUploading, setIsUploading] = useState(false);
  const [customUrl, setCustomUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Extract a readable file name from URL
  const getDisplayFilename = (url: string) => {
    try {
      const parts = url.split('/');
      const last = parts[parts.length - 1];
      // remove timestamp prefix if any (e.g., 1741400000000-filename.pdf)
      return decodeURIComponent(last.replace(/^\d+-/, ''));
    } catch {
      return url;
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    if (!file.type.includes('pdf') && !file.name.toLowerCase().endsWith('.pdf')) {
      toast.error('Vui lòng chọn tệp định dạng PDF (.pdf)');
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      toast.error('Kích thước tệp vượt quá giới hạn 15MB');
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Lỗi khi tải file lên');
      }

      await onSavePdfUrl(data.url);
      toast.success('Đã tải lên và đính kèm file PDF Resume thành công!');
      onOpenChange(false);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Không thể tải tệp lên');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleSaveCustomUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = customUrl.trim();
    if (!trimmed) {
      toast.error('Vui lòng nhập đường dẫn URL file PDF');
      return;
    }

    try {
      new URL(trimmed);
    } catch {
      toast.error('Đường dẫn URL không hợp lệ (cần bắt đầu bằng http:// hoặc https://)');
      return;
    }

    try {
      await onSavePdfUrl(trimmed);
      toast.success('Đã cập nhật liên kết file PDF Resume!');
      setCustomUrl('');
      onOpenChange(false);
    } catch (_err: any) {
      toast.error('Lỗi khi lưu liên kết PDF');
    }
  };

  const handleRemovePdf = async () => {
    if (!confirm('Bạn có chắc chắn muốn xóa liên kết file PDF này khỏi Resume?')) return;
    try {
      await onSavePdfUrl(null);
      toast.success('Đã gỡ bỏ file PDF Resume');
    } catch (_err) {
      toast.error('Lỗi khi gỡ file PDF');
    }
  };

  const handleCopyLink = () => {
    if (!currentResumeUrl) return;
    const fullUrl = currentResumeUrl.startsWith('http')
      ? currentResumeUrl
      : `${window.location.origin}${currentResumeUrl}`;
    navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    toast.success('Đã sao chép liên kết PDF');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <FileUp className="w-5 h-5" />
            </div>
            <span>Quản Lý & Import File PDF Resume</span>
          </DialogTitle>
          <DialogDescription className="text-xs">
            Đính kèm bản CV định dạng PDF để khách truy cập và nhà tuyển dụng có thể tải về trực tiếp từ trang công khai.
          </DialogDescription>
        </DialogHeader>

        {/* Existing PDF Status Banner */}
        {currentResumeUrl ? (
          <div className="p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 flex flex-col gap-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 shrink-0">
                  <FileCheck2 className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-foreground truncate">
                    {getDisplayFilename(currentResumeUrl)}
                  </div>
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                    Đã đính kèm tệp PDF thành công
                  </span>
                </div>
              </div>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleRemovePdf}
                className="text-xs text-red-500 hover:text-red-600 hover:bg-red-500/10 h-8 px-2 shrink-0 gap-1"
                title="Gỡ bỏ tệp PDF này"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Gỡ bỏ</span>
              </Button>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-emerald-500/20 text-xs">
              <a
                href={currentResumeUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-card hover:bg-muted text-foreground border border-border/80 font-medium transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5 text-primary" />
                <span>Mở tab mới</span>
              </a>

              <a
                href={currentResumeUrl}
                download
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-card hover:bg-muted text-foreground border border-border/80 font-medium transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-primary" />
                <span>Tải về máy</span>
              </a>

              <button
                type="button"
                onClick={handleCopyLink}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-card hover:bg-muted text-foreground border border-border/80 font-medium transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-muted-foreground" />}
                <span>{copied ? 'Đã sao chép' : 'Sao chép link'}</span>
              </button>

              {onOpenConvertDialog && (
                <button
                  type="button"
                  onClick={() => {
                    onOpenChange(false);
                    onOpenConvertDialog();
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-700 dark:text-amber-300 border border-amber-500/30 font-semibold transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Chuyển đổi thành bản CV</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setTab(tab === 'preview' ? 'upload' : 'preview')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/15 hover:bg-primary/25 text-primary font-medium transition-colors ml-auto"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>{tab === 'preview' ? 'Đóng xem trước' : 'Xem trước PDF'}</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="p-3 rounded-xl border border-dashed border-border bg-muted/30 flex items-center gap-2.5 text-xs text-muted-foreground">
            <FileText className="w-4 h-4 text-muted-foreground/70 shrink-0" />
            <span>Chưa có file PDF nào được đính kèm. Vui lòng tải file hoặc nhập liên kết bên dưới.</span>
          </div>
        )}

        {/* Embedded PDF Preview Mode */}
        {tab === 'preview' && currentResumeUrl && (
          <div className="rounded-xl border border-border overflow-hidden bg-muted/20">
            <div className="p-2 border-b border-border bg-card flex items-center justify-between text-xs">
              <span className="font-semibold text-muted-foreground">Khung Xem Trước PDF</span>
              <button
                type="button"
                onClick={() => setTab('upload')}
                className="text-[11px] text-primary hover:underline"
              >
                Thu gọn
              </button>
            </div>
            <div className="h-[380px] w-full bg-slate-900/10">
              <iframe
                src={`${currentResumeUrl}#toolbar=0`}
                className="w-full h-full border-none"
                title="PDF Preview"
              />
            </div>
          </div>
        )}

        {/* Tabs: Upload / Direct Link */}
        {tab !== 'preview' && (
          <div className="space-y-4 pt-2">
            <div className="flex rounded-xl bg-muted/80 p-1 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setTab('upload')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg transition-all ${
                  tab === 'upload'
                    ? 'bg-card text-foreground shadow-xs font-bold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <UploadCloud className="w-3.5 h-3.5" />
                <span>Tải tệp từ máy tính</span>
              </button>
              <button
                type="button"
                onClick={() => setTab('url')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg transition-all ${
                  tab === 'url'
                    ? 'bg-card text-foreground shadow-xs font-bold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Link2 className="w-3.5 h-3.5" />
                <span>Nhập liên kết PDF</span>
              </button>
            </div>

            {/* Tab: Upload file */}
            {tab === 'upload' && (
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf,.pdf"
                  className="hidden"
                  onChange={e => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileUpload(e.target.files[0]);
                    }
                  }}
                />

                <div
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => !isUploading && fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                    dragActive
                      ? 'border-primary bg-primary/10 scale-[0.99]'
                      : 'border-border/80 hover:border-primary/60 hover:bg-muted/30 bg-card/40'
                  }`}
                >
                  {isUploading ? (
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="w-8 h-8 text-primary animate-spin" />
                      <span className="text-xs font-semibold text-foreground">
                        Đang tải và lưu trữ tệp PDF...
                      </span>
                      <span className="text-[11px] text-muted-foreground">
                        Vui lòng chờ trong giây lát
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2.5">
                      <div className="p-3.5 rounded-2xl bg-primary/10 text-primary shadow-xs">
                        <UploadCloud className="w-7 h-7" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-foreground">
                          Nhấp để tải file hoặc kéo thả file vào đây
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          Hỗ trợ định dạng PDF (.pdf) dung lượng tối đa 15MB
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        className="mt-2 text-xs h-8 gap-1.5 pointer-events-none"
                      >
                        <FileUp className="w-3.5 h-3.5" />
                        <span>Chọn file từ máy tính</span>
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tab: Direct URL */}
            {tab === 'url' && (
              <form onSubmit={handleSaveCustomUrl} className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">
                    Đường dẫn trực tiếp tới file PDF:
                  </label>
                  <Input
                    type="url"
                    placeholder="https://example.com/my-resume.pdf"
                    value={customUrl}
                    onChange={e => setCustomUrl(e.target.value)}
                    className="text-xs h-9"
                    required
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Ví dụ: liên kết Google Drive trực tiếp, Cloudinary, AWS S3, hoặc link lưu trữ ngoài.
                  </p>
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => onOpenChange(false)}
                    className="text-xs h-8"
                  >
                    Hủy
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    className="text-xs h-8 gap-1.5 bg-primary text-primary-foreground font-bold"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Lưu liên kết PDF</span>
                  </Button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Quick link to Convert PDF to CV Studio */}
        {onOpenConvertDialog && (
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-between gap-3 text-xs mt-2">
            <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300">
              <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
              <span>Muốn tự động bóc tách thông tin từ file PDF để điền vào CV?</span>
            </div>
            <button
              type="button"
              onClick={() => {
                onOpenChange(false);
                onOpenConvertDialog();
              }}
              className="font-bold text-amber-600 dark:text-amber-400 hover:underline shrink-0 text-[11px]"
            >
              Chuyển PDF sang CV →
            </button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
