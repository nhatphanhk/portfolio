'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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
  Maximize2,
  Minimize2,
  Copy,
  Link2,
  Unlink,
  Search,
  BookOpen,
} from 'lucide-react';
import { toast } from 'sonner';

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

  const [activeTab, setActiveTab] = useState<'preview' | 'compare' | 'html'>('preview');
  const [isMaximized, setIsMaximized] = useState(false);
  const [syncScroll, setSyncScroll] = useState(true);
  const [copiedHtml, setCopiedHtml] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [isSavingDb, setIsSavingDb] = useState(false);
  const [isApplyingAndSaving, setIsApplyingAndSaving] = useState(false);

  // Sync refs for side-by-side compare scrolling
  const origRef = useRef<HTMLDivElement>(null);
  const transRef = useRef<HTMLDivElement>(null);
  const isScrollingRef = useRef<'orig' | 'trans' | null>(null);

  useEffect(() => {
    if (translated) {
      setEditedData({
        title: translated.title || '',
        excerpt: translated.excerpt || '',
        content: translated.content || '',
      });
    }
  }, [translated]);

  // Synchronized scroll handlers
  const handleScrollOrig = useCallback(() => {
    if (!syncScroll || isScrollingRef.current === 'trans') return;
    const orig = origRef.current;
    const trans = transRef.current;
    if (!orig || !trans) return;

    isScrollingRef.current = 'orig';
    const scrollMaxOrig = orig.scrollHeight - orig.clientHeight;
    const scrollMaxTrans = trans.scrollHeight - trans.clientHeight;
    if (scrollMaxOrig > 0) {
      const ratio = orig.scrollTop / scrollMaxOrig;
      trans.scrollTop = ratio * scrollMaxTrans;
    }
    setTimeout(() => {
      if (isScrollingRef.current === 'orig') isScrollingRef.current = null;
    }, 50);
  }, [syncScroll]);

  const handleScrollTrans = useCallback(() => {
    if (!syncScroll || isScrollingRef.current === 'orig') return;
    const orig = origRef.current;
    const trans = transRef.current;
    if (!orig || !trans) return;

    isScrollingRef.current = 'trans';
    const scrollMaxOrig = orig.scrollHeight - orig.clientHeight;
    const scrollMaxTrans = trans.scrollHeight - trans.clientHeight;
    if (scrollMaxTrans > 0) {
      const ratio = trans.scrollTop / scrollMaxTrans;
      orig.scrollTop = ratio * scrollMaxOrig;
    }
    setTimeout(() => {
      if (isScrollingRef.current === 'trans') isScrollingRef.current = null;
    }, 50);
  }, [syncScroll]);

  // Content metrics calculation
  const stats = useMemo(() => {
    const origText = (original.content || '').replace(/<[^>]*>/g, ' ').trim();
    const transText = (editedData.content || '').replace(/<[^>]*>/g, ' ').trim();

    const origWords = origText ? origText.split(/\s+/).length : 0;
    const transWords = transText ? transText.split(/\s+/).length : 0;

    const origReadMin = Math.max(1, Math.ceil(origWords / 200));
    const transReadMin = Math.max(1, Math.ceil(transWords / 200));

    const htmlLines = editedData.content ? editedData.content.split('\n').length : 1;

    return {
      origWords,
      transWords,
      origChars: origText.length,
      transChars: transText.length,
      origReadMin,
      transReadMin,
      htmlLines,
    };
  }, [original.content, editedData.content]);

  if (!translated) return null;

  const targetLangLabel = targetLocale === 'vi' ? 'Tiếng Việt (VI)' : 'English (EN)';

  const handleCopyHtml = async () => {
    try {
      await navigator.clipboard.writeText(editedData.content);
      setCopiedHtml(true);
      toast.success('Đã sao chép mã nguồn HTML vào clipboard!');
      setTimeout(() => setCopiedHtml(false), 2000);
    } catch {
      toast.error('Không thể sao chép');
    }
  };

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

  // Content height class dynamically adapting to window size and maximize mode
  const contentHeightClass = isMaximized
    ? 'h-[calc(96vh-240px)]'
    : 'h-[calc(88vh-260px)] min-h-[440px]';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={`flex flex-col p-0 gap-0 overflow-hidden bg-card border-border shadow-2xl transition-all duration-200 ${
          isMaximized
            ? 'w-[98vw] max-w-[98vw] h-[96vh] max-h-[96vh] rounded-xl'
            : 'max-w-5xl max-h-[92vh] w-[95vw] rounded-2xl'
        }`}
      >
        {/* Header */}
        <DialogHeader className="px-5 py-3.5 border-b border-border bg-muted/40 shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400 shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <DialogTitle className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2 truncate">
                  <span>Bản xem trước bản dịch AI</span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/20 shrink-0">
                    <Languages className="w-3 h-3 inline mr-1" />
                    {targetLangLabel}
                  </span>
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground truncate">
                  Tối ưu cho bài viết dài • Đối chiếu song ngữ, tinh chỉnh và áp dụng trực tiếp
                </DialogDescription>
              </div>
            </div>

            {/* Top Toolbar Stats & Maximize */}
            <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
              {/* Content Length & Reading Time Badge */}
              <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-background/80 border border-border text-[11px] font-medium text-muted-foreground shadow-2xs">
                <BookOpen className="w-3.5 h-3.5 text-primary" />
                <span>
                  Gốc: <strong className="text-foreground">{stats.origWords}</strong> từ (~{stats.origReadMin}p)
                </span>
                <span className="text-border">|</span>
                <span>
                  Dịch: <strong className="text-purple-600 dark:text-purple-400">{stats.transWords}</strong> từ (~{stats.transReadMin}p)
                </span>
              </div>

              {/* Fullscreen / Expand Toggle */}
              <button
                type="button"
                onClick={() => setIsMaximized(prev => !prev)}
                className="p-1.5 rounded-lg border border-border bg-background hover:bg-muted text-muted-foreground hover:text-foreground transition-colors shadow-2xs cursor-pointer"
                title={isMaximized ? 'Thu nhỏ cửa sổ' : 'Phóng to toàn màn hình'}
                aria-label="Toggle Fullscreen"
              >
                {isMaximized ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </DialogHeader>

        {/* Scrollable Body Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-background">
          {/* Metadata Bar (Title & Excerpt) in Accordion-Style Compact Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 p-3 rounded-xl bg-card border border-border/80 shadow-2xs">
            {/* Title */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                  <Edit3 className="w-3 h-3 text-primary" />
                  Tiêu đề (Title)
                </label>
                <span className="text-[10px] text-muted-foreground truncate max-w-[180px] italic">
                  Gốc: {original.title}
                </span>
              </div>
              <input
                type="text"
                value={editedData.title}
                onChange={e => setEditedData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-1.5 rounded-lg border border-border bg-background text-foreground font-semibold text-sm shadow-2xs focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="Tiêu đề sau khi dịch..."
              />
            </div>

            {/* Excerpt */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                  <Edit3 className="w-3 h-3 text-primary" />
                  Tóm tắt (Excerpt)
                </label>
                {original.excerpt && (
                  <span className="text-[10px] text-muted-foreground truncate max-w-[180px] italic">
                    Gốc: {original.excerpt}
                  </span>
                )}
              </div>
              <input
                type="text"
                value={editedData.excerpt}
                onChange={e => setEditedData(prev => ({ ...prev, excerpt: e.target.value }))}
                className="w-full px-3 py-1.5 rounded-lg border border-border bg-background text-foreground text-sm shadow-2xs focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="Tóm tắt ngắn sau khi dịch..."
              />
            </div>
          </div>

          {/* Main Content Workspace */}
          <div className="space-y-2">
            {/* Toolbar: Tabs & Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-1 p-0.5 rounded-xl bg-muted/60 border border-border shrink-0">
                <button
                  type="button"
                  onClick={() => setActiveTab('preview')}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
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
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
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
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    activeTab === 'html'
                      ? 'bg-card text-foreground shadow-2xs font-semibold'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Code className="w-3.5 h-3.5" />
                  Mã nguồn HTML
                </button>
              </div>

              {/* Tab-Specific Control Options */}
              <div className="flex items-center gap-2">
                {activeTab === 'compare' && (
                  <button
                    type="button"
                    onClick={() => setSyncScroll(prev => !prev)}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                      syncScroll
                        ? 'bg-primary/10 text-primary border-primary/30 font-semibold'
                        : 'bg-muted/60 text-muted-foreground border-border'
                    }`}
                    title="Khi bật, cuộn bên trái sẽ tự động cuộn bên phải tương ứng"
                  >
                    {syncScroll ? <Link2 className="w-3 h-3" /> : <Unlink className="w-3 h-3" />}
                    {syncScroll ? 'Đồng bộ cuộn: Bật' : 'Đồng bộ cuộn: Tắt'}
                  </button>
                )}

                {activeTab === 'html' && (
                  <button
                    type="button"
                    onClick={handleCopyHtml}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border border-border bg-card hover:bg-muted text-foreground transition-colors cursor-pointer shadow-2xs"
                  >
                    {copiedHtml ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3" />}
                    {copiedHtml ? 'Đã chép' : 'Sao chép HTML'}
                  </button>
                )}

                {/* Quick in-modal Search */}
                <div className="relative hidden sm:block">
                  <Search className="w-3 h-3 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Tìm từ khóa..."
                    className="w-36 lg:w-44 pl-7 pr-2 py-1 text-xs rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-2xs transition-colors"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground hover:text-foreground"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Viewport Container (Optimized for long reading without scroll-trap) */}
            <div className={`rounded-xl border border-border bg-card overflow-hidden shadow-2xs ${contentHeightClass}`}>
              {/* Tab 1: Visual Reading Preview */}
              {activeTab === 'preview' && (
                <div className="h-full overflow-y-auto p-6 lg:p-8">
                  <div className="max-w-3xl mx-auto">
                    <div
                      className="prose prose-slate dark:prose-invert max-w-none text-foreground prose-headings:font-bold prose-headings:tracking-tight prose-a:text-primary prose-pre:bg-muted prose-pre:border prose-pre:border-border leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: editedData.content }}
                    />
                  </div>
                </div>
              )}

              {/* Tab 2: Synchronized Side-by-Side Compare */}
              {activeTab === 'compare' && (
                <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border h-full overflow-hidden">
                  {/* Left: Original */}
                  <div
                    ref={origRef}
                    onScroll={handleScrollOrig}
                    className="h-full overflow-y-auto p-5 space-y-2 bg-muted/15"
                  >
                    <div className="sticky top-0 z-10 flex items-center justify-between pb-2 bg-muted/95 backdrop-blur-xs border-b border-border/80">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                        Bản gốc (Original) • {stats.origWords} từ
                      </span>
                    </div>
                    <div
                      className="prose prose-sm prose-slate dark:prose-invert max-w-none text-muted-foreground/90 leading-relaxed pt-2"
                      dangerouslySetInnerHTML={{ __html: original.content }}
                    />
                  </div>

                  {/* Right: Translated */}
                  <div
                    ref={transRef}
                    onScroll={handleScrollTrans}
                    className="h-full overflow-y-auto p-5 space-y-2 bg-card"
                  >
                    <div className="sticky top-0 z-10 flex items-center justify-between pb-2 bg-card/95 backdrop-blur-xs border-b border-border/80">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                        Bản dịch (Translated) • {stats.transWords} từ
                      </span>
                    </div>
                    <div
                      className="prose prose-sm prose-slate dark:prose-invert max-w-none text-foreground leading-relaxed pt-2"
                      dangerouslySetInnerHTML={{ __html: editedData.content }}
                    />
                  </div>
                </div>
              )}

              {/* Tab 3: Full Height HTML Source Editor */}
              {activeTab === 'html' && (
                <div className="h-full flex flex-col p-2 bg-muted/20">
                  <textarea
                    value={editedData.content}
                    onChange={e => setEditedData(prev => ({ ...prev, content: e.target.value }))}
                    className="flex-1 w-full p-4 font-mono text-xs rounded-lg bg-card text-foreground border border-border/80 focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none leading-relaxed"
                    placeholder="Mã nguồn HTML sau khi dịch..."
                  />
                  <div className="flex items-center justify-between px-3 py-1.5 text-[11px] text-muted-foreground border-t border-border/50">
                    <span>
                      Dòng: <strong className="text-foreground">{stats.htmlLines}</strong> | Ký tự: <strong className="text-foreground">{stats.transChars}</strong>
                    </span>
                    <span className="italic">
                      Tip: Bạn có thể chỉnh sửa trực tiếp các thẻ HTML hoặc nội dung văn bản ở đây trước khi áp dụng.
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sticky Footer Actions */}
        <DialogFooter className="px-5 py-3.5 border-t border-border bg-muted/40 flex-col sm:flex-row gap-2.5 sm:justify-between items-center shrink-0">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>
              Tổng dung lượng dịch: <strong className="text-foreground">{stats.transWords} từ</strong>
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="px-3.5 py-2 text-xs font-medium text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-colors cursor-pointer"
            >
              Đóng
            </button>

            {/* Option 1: Apply to Editor only */}
            <button
              type="button"
              onClick={handleApplyOnly}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border border-border bg-card hover:bg-muted text-foreground transition-colors shadow-2xs cursor-pointer"
              title="Điền nội dung đã dịch vào trình soạn thảo hiện tại"
            >
              <Check className="w-3.5 h-3.5 text-green-600" />
              Áp dụng vào Editor
            </button>

            {/* Option 2: Save to DB as translation cache */}
            <button
              type="button"
              onClick={handleSaveDb}
              disabled={isSavingDb || isApplyingAndSaving}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border border-purple-500/30 bg-purple-500/10 hover:bg-purple-500/20 text-purple-700 dark:text-purple-300 transition-colors shadow-2xs cursor-pointer disabled:opacity-60"
              title="Lưu bản dịch vào CSDL PostgreSQL để độc giả website xem tức thì"
            >
              {isSavingDb ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Database className="w-3.5 h-3.5 text-purple-600" />}
              Lưu vào CSDL
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
              Áp dụng & Lưu CSDL
            </button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
