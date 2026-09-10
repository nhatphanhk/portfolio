'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Sparkles,
  Check,
  Database,
  Eye,
  Code,
  Languages,
  Loader2,
  Split,
  Edit3,
} from 'lucide-react';

export interface TranslatedData {
  title: string;
  excerpt: string;
  content: string;
}

interface TranslationPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  original: {
    title: string;
    excerpt?: string | null;
    content: string;
  };
  translated: TranslatedData | null;
  targetLocale?: 'vi' | 'en';
  onApplyToEditor: (data: TranslatedData) => void;
  onSaveToDb: (data: TranslatedData) => Promise<void>;
  onApplyAndSave: (data: TranslatedData) => Promise<void>;
}

export function TranslationPreviewDialog({
  open,
  onOpenChange,
  original,
  translated,
  targetLocale = 'vi',
  onApplyToEditor,
  onSaveToDb,
  onApplyAndSave,
}: TranslationPreviewDialogProps) {
  const [editedData, setEditedData] = useState<TranslatedData>({
    title: '',
    excerpt: '',
    content: '',
  });

  const [activeTab, setActiveTab] = useState<'preview' | 'html' | 'compare'>('preview');
  const [isSavingDb, setIsSavingDb] = useState(false);
  const [isApplyingAndSaving, setIsApplyingAndSaving] = useState(false);

  useEffect(() => {
    if (translated) {
      setEditedData({
        title: translated.title || '',
        excerpt: translated.excerpt || '',
        content: translated.content || '',
      });
    }
  }, [translated]);

  if (!translated) return null;

  const targetLangLabel = targetLocale === 'vi' ? 'Tiếng Việt (vi)' : 'English (en)';

  const handleSaveDb = async () => {
    setIsSavingDb(true);
    try {
      await onSaveToDb(editedData);
      onOpenChange(false);
    } finally {
      setIsSavingDb(false);
    }
  };

  const handleApplyAndSave = async () => {
    setIsApplyingAndSaving(true);
    try {
      await onApplyAndSave(editedData);
      onOpenChange(false);
    } finally {
      setIsApplyingAndSaving(false);
    }
  };

  const handleApplyOnly = () => {
    onApplyToEditor(editedData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[92vh] flex flex-col p-0 gap-0 overflow-hidden bg-card border-border shadow-2xl">
        {/* Header */}
        <DialogHeader className="px-6 py-4 border-b border-border bg-muted/30 shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold text-foreground flex items-center gap-2">
                  Bản xem trước bản dịch AI (AI Translation Preview)
                </DialogTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Xem lại, tinh chỉnh bản dịch trước khi áp dụng vào bài viết hoặc lưu vào CSDL song ngữ.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/20">
                <Languages className="w-3.5 h-3.5" />
                {targetLangLabel}
              </span>
            </div>
          </div>
        </DialogHeader>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-background">
          {/* Title Section */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Edit3 className="w-3.5 h-3.5 text-primary" />
                Tiêu đề bài viết (Title)
              </label>
              <span className="text-[11px] text-muted-foreground italic">
                Gốc: <span className="text-foreground font-medium">{original.title}</span>
              </span>
            </div>
            <input
              type="text"
              value={editedData.title}
              onChange={e => setEditedData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-card text-foreground font-semibold text-base shadow-2xs focus:outline-none focus:ring-2 focus:ring-primary/30"
              placeholder="Tiêu đề sau khi dịch..."
            />
          </div>

          {/* Excerpt Section */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Edit3 className="w-3.5 h-3.5 text-primary" />
                Tóm tắt (Excerpt)
              </label>
              {original.excerpt && (
                <span className="text-[11px] text-muted-foreground truncate max-w-sm italic">
                  Gốc: {original.excerpt}
                </span>
              )}
            </div>
            <textarea
              rows={2}
              value={editedData.excerpt}
              onChange={e => setEditedData(prev => ({ ...prev, excerpt: e.target.value }))}
              className="w-full px-3.5 py-2 rounded-xl border border-border bg-card text-foreground text-sm shadow-2xs focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
              placeholder="Tóm tắt ngắn gọn sau khi dịch..."
            />
          </div>

          {/* Content Section & Tabs */}
          <div className="space-y-2.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Nội dung chi tiết (Content)
              </label>

              {/* View Switcher Tabs */}
              <div className="flex items-center gap-1 p-1 rounded-xl bg-muted/60 border border-border">
                <button
                  type="button"
                  onClick={() => setActiveTab('preview')}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    activeTab === 'preview'
                      ? 'bg-card text-foreground shadow-2xs font-semibold'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  Giao diện đọc
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('compare')}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    activeTab === 'compare'
                      ? 'bg-card text-foreground shadow-2xs font-semibold'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Split className="w-3.5 h-3.5" />
                  So sánh song ngữ
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('html')}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    activeTab === 'html'
                      ? 'bg-card text-foreground shadow-2xs font-semibold'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Code className="w-3.5 h-3.5" />
                  Mã HTML
                </button>
              </div>
            </div>

            {/* Tab View Container */}
            <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-2xs min-h-[280px]">
              {activeTab === 'preview' && (
                <div className="p-6 max-h-[420px] overflow-y-auto">
                  <div
                    className="prose prose-slate dark:prose-invert max-w-none text-foreground prose-headings:font-bold prose-headings:tracking-tight prose-a:text-primary prose-pre:bg-muted prose-pre:border prose-pre:border-border"
                    dangerouslySetInnerHTML={{ __html: editedData.content }}
                  />
                </div>
              )}

              {activeTab === 'compare' && (
                <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border max-h-[420px] overflow-y-auto">
                  {/* Original */}
                  <div className="p-4 space-y-2 bg-muted/10">
                    <div className="flex items-center justify-between pb-2 border-b border-border">
                      <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Bản gốc (Original)
                      </span>
                    </div>
                    <div
                      className="prose prose-sm prose-slate dark:prose-invert max-w-none text-muted-foreground opacity-90"
                      dangerouslySetInnerHTML={{ __html: original.content }}
                    />
                  </div>

                  {/* Translated */}
                  <div className="p-4 space-y-2 bg-card">
                    <div className="flex items-center justify-between pb-2 border-b border-border">
                      <span className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                        Bản dịch (Translated)
                      </span>
                    </div>
                    <div
                      className="prose prose-sm prose-slate dark:prose-invert max-w-none text-foreground"
                      dangerouslySetInnerHTML={{ __html: editedData.content }}
                    />
                  </div>
                </div>
              )}

              {activeTab === 'html' && (
                <div className="p-2">
                  <textarea
                    rows={14}
                    value={editedData.content}
                    onChange={e => setEditedData(prev => ({ ...prev, content: e.target.value }))}
                    className="w-full p-4 font-mono text-xs rounded-xl bg-muted/40 text-foreground border border-border/80 focus:outline-none focus:ring-2 focus:ring-primary/30"
                    placeholder="Mã nguồn HTML sau khi dịch..."
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <DialogFooter className="px-6 py-4 border-t border-border bg-muted/30 flex-col sm:flex-row gap-2.5 sm:justify-between items-center shrink-0">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="px-4 py-2 text-xs font-medium text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-colors cursor-pointer w-full sm:w-auto"
          >
            Đóng
          </button>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
            {/* Option 1: Apply to Editor only */}
            <button
              type="button"
              onClick={handleApplyOnly}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border border-border bg-card hover:bg-muted text-foreground transition-colors shadow-2xs cursor-pointer"
              title="Điền nội dung đã dịch vào các trường của trình soạn thảo hiện tại"
            >
              <Check className="w-3.5 h-3.5 text-green-600" />
              Áp dụng vào Trình soạn thảo
            </button>

            {/* Option 2: Save to DB as translation cache */}
            <button
              type="button"
              onClick={handleSaveDb}
              disabled={isSavingDb || isApplyingAndSaving}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border border-purple-500/30 bg-purple-500/10 hover:bg-purple-500/20 text-purple-700 dark:text-purple-300 transition-colors shadow-2xs cursor-pointer disabled:opacity-60"
              title="Lưu bản dịch vào CSDL để người đọc web có thể chuyển ngữ tức thì"
            >
              {isSavingDb ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Database className="w-3.5 h-3.5 text-purple-600" />}
              Lưu bản dịch vào CSDL
            </button>

            {/* Option 3: Both Apply & Save */}
            <button
              type="button"
              onClick={handleApplyAndSave}
              disabled={isSavingDb || isApplyingAndSaving}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-foreground text-background hover:bg-foreground/90 transition-colors shadow-xs cursor-pointer disabled:opacity-60"
              title="Vừa thay thế nội dung trong trình soạn thảo, vừa lưu vào CSDL"
            >
              {isApplyingAndSaving ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Sparkles className="w-3.5 h-3.5" />
              )}
              Áp dụng & Lưu vào CSDL
            </button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
