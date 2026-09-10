'use client';

import { useState, useCallback, useTransition, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { TipTapEditor } from '@/components/admin/editor/TipTapEditor';
import { updateBlog, translateBlogAction } from '@/lib/actions/blog';
import { toast } from 'sonner';
import Link from 'next/link';
import {
  ArrowLeft,
  Save,
  Eye,
  EyeOff,
  Loader2,
  ChevronDown,
  ChevronRight,
  Image as ImageIcon,
  Tag,
  AlignLeft,
  Settings,
  Sparkles,
  Layers,
} from 'lucide-react';

const schema = z.object({
  title: z.string().min(3, 'Title is required').max(255),
  slug: z.string().min(3).max(255).regex(/^[a-z0-9-]+$/, 'Only lowercase letters, numbers, hyphens'),
  excerpt: z.string().max(500).optional(),
  content: z.string().min(1, 'Content is required'),
  thumbnailUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']),
  tags: z.string().optional(),
  seriesId: z.string().optional().nullable(),
  seriesOrder: z.number().optional().nullable(),
});

type FormData = z.infer<typeof schema>;

interface SeriesBlogItem {
  id: string;
  title: string;
  seriesOrder: number | null;
}

interface SeriesItem {
  id: string;
  title: string;
  blogs?: SeriesBlogItem[];
}

interface BlogEditorClientProps {
  blog: FormData & { id: string };
  seriesList: SeriesItem[];
}

function SidebarSection({
  title,
  icon: Icon,
  children,
  defaultOpen = true,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-border last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        <span className="flex items-center gap-2">
          <Icon className="w-3.5 h-3.5" />
          {title}
        </span>
        {open ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
      </button>
      {open && <div className="px-4 pb-4 space-y-3">{children}</div>}
    </div>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

const inputCls =
  'w-full px-3.5 py-2 text-sm rounded-lg border border-border/80 bg-background text-foreground placeholder:text-muted-foreground shadow-2xs hover:border-foreground/30 focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary transition-all';

export function BlogEditorClient({ blog, seriesList }: BlogEditorClientProps) {
  const [isPending, startTransition] = useTransition();
  const [isTranslating, setIsTranslating] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [autoSaveTimer, setAutoSaveTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

  const handleAiTranslate = async () => {
    setIsTranslating(true);
    toast.info('AI is generating translation and saving to DB...');
    try {
      const res = await translateBlogAction(blog.id, 'vi');
      if (res.ok) {
        toast.success('AI translated & saved to DB ✓');
      } else {
        toast.error(res.error || 'Failed to translate');
      }
    } catch {
      toast.error('AI translation error');
    } finally {
      setIsTranslating(false);
    }
  };

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    getValues,
    reset,
    formState: { errors, isDirty },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: blog.title,
      slug: blog.slug,
      excerpt: blog.excerpt ?? '',
      content: blog.content,
      thumbnailUrl: blog.thumbnailUrl ?? '',
      status: blog.status,
      tags: blog.tags,
      seriesId: blog.seriesId ?? '',
      seriesOrder: blog.seriesOrder && blog.seriesOrder > 0 ? blog.seriesOrder : null,
    },
  });

  const watchedTitle = watch('title');
  const watchedStatus = watch('status');
  const watchedSeriesId = watch('seriesId');
  const watchedSeriesOrder = watch('seriesOrder');

  const [orderMode, setOrderMode] = useState<'auto' | 'custom'>(
    blog.seriesOrder && blog.seriesOrder > 0 ? 'custom' : 'auto'
  );

  const activeSeries = useMemo(() => {
    return seriesList.find(s => s.id === watchedSeriesId);
  }, [seriesList, watchedSeriesId]);

  const activeSeriesBlogs = useMemo(() => {
    return activeSeries?.blogs || [];
  }, [activeSeries]);

  // Auto-generate slug from title (only for draft-* slugs i.e. freshly created drafts)
  const onTitleBlur = useCallback(
    (e: React.FocusEvent<HTMLInputElement>) => {
      if (blog.slug.startsWith('draft-')) {
        const slug = e.target.value
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '');
        if (slug) setValue('slug', slug, { shouldValidate: true });
      }
    },
    [blog.slug, setValue]
  );

  const doSave = useCallback(
    (data: FormData) => {
      startTransition(async () => {
        const payload: FormData = {
          ...data,
          seriesId: data.seriesId || null,
          seriesOrder:
            data.seriesId && orderMode === 'custom' && data.seriesOrder && data.seriesOrder > 0
              ? Number(data.seriesOrder)
              : null,
        };
        const result = await updateBlog(blog.id, payload);
        if (result.ok) {
          setLastSaved(new Date());
          reset(payload); // mark form as clean
          toast.success('Saved ✓');
        } else {
          toast.error('Save failed');
        }
      });
    },
    [blog.id, reset, orderMode]
  );

  // Auto-save on content change (debounce 3s)
  const content = watch('content');
  useEffect(() => {
    if (!isDirty) return;
    if (autoSaveTimer) clearTimeout(autoSaveTimer);
    const t = setTimeout(() => {
      handleSubmit(doSave)();
    }, 3000);
    setAutoSaveTimer(t);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content]);

  const statusColors = {
    DRAFT: 'text-yellow-600 dark:text-yellow-400 bg-yellow-500/10',
    PUBLISHED: 'text-green-600 dark:text-green-400 bg-green-500/10',
    ARCHIVED: 'text-muted-foreground bg-muted',
  };

  return (
    <div className="flex h-full overflow-hidden bg-background">
      {/* ── LEFT SIDEBAR: Meta ───────────────────────────────────── */}
      <aside className="w-80 shrink-0 border-r border-border flex flex-col overflow-y-auto bg-card shadow-xs">
        {/* Top bar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <Link
            href="/admin/blogs"
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Posts
          </Link>
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColors[watchedStatus]}`}>
            {watchedStatus}
          </span>
        </div>

        {/* Sections */}
        <form id="meta-form" onSubmit={handleSubmit(doSave)} className="flex-1">
          <SidebarSection title="Document" icon={AlignLeft}>
            <Field label="Title" error={errors.title?.message}>
              <input
                {...register('title')}
                onBlur={onTitleBlur}
                placeholder="My awesome post"
                className={inputCls}
              />
            </Field>
            <Field label="Slug" error={errors.slug?.message}>
              <input {...register('slug')} placeholder="my-awesome-post" className={inputCls} />
            </Field>
            <Field label="Excerpt">
              <textarea
                {...register('excerpt')}
                rows={3}
                placeholder="Brief summary..."
                className={`${inputCls} resize-none`}
              />
            </Field>
          </SidebarSection>

          <SidebarSection title="Tags" icon={Tag} defaultOpen={false}>
            <Field label="Tags (comma-separated)">
              <input {...register('tags')} placeholder="nextjs, typescript" className={inputCls} />
            </Field>
          </SidebarSection>

          <SidebarSection title="Thumbnail" icon={ImageIcon} defaultOpen={false}>
            <Field label="Thumbnail URL" error={errors.thumbnailUrl?.message}>
              <input {...register('thumbnailUrl')} placeholder="https://..." className={inputCls} />
            </Field>
            {watch('thumbnailUrl') && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={watch('thumbnailUrl')}
                alt="thumbnail preview"
                className="w-full rounded-lg border border-border object-cover aspect-video"
                onError={e => (e.currentTarget.style.display = 'none')}
              />
            )}
          </SidebarSection>

          <SidebarSection title="Settings" icon={Settings} defaultOpen={false}>
            <Field label="Status">
              <select {...register('status')} className={inputCls}>
                <option value="DRAFT">Draft</option>
                <option value="PUBLISHED">Published</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </Field>
            <Field label="Series">
              <select {...register('seriesId')} className={inputCls}>
                <option value="">— None (Standalone) —</option>
                {seriesList.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.title} {s.blogs?.length ? `(${s.blogs.length} articles)` : ''}
                  </option>
                ))}
              </select>
            </Field>

            {watchedSeriesId && (
              <div className="space-y-3 p-3 rounded-xl border border-border/80 bg-muted/40">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-primary" />
                    <span>Series Ordering</span>
                  </span>
                  <span className="text-[10px] font-semibold text-primary px-2 py-0.5 rounded-full bg-primary/10">
                    Smart Order
                  </span>
                </div>

                {/* Mode Selector */}
                <div className="grid grid-cols-2 gap-1.5 p-1 rounded-lg bg-background/80 border border-border">
                  <button
                    type="button"
                    onClick={() => {
                      setOrderMode('auto');
                      setValue('seriesOrder', null, { shouldValidate: true });
                    }}
                    className={`px-2.5 py-1.5 rounded-md text-xs font-semibold text-center transition-all cursor-pointer ${
                      orderMode === 'auto'
                        ? 'bg-foreground text-background shadow-xs'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Auto (End)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setOrderMode('custom');
                      const current = getValues('seriesOrder');
                      const defaultPos = current && current > 0 ? current : (activeSeriesBlogs.length + 1);
                      setValue('seriesOrder', defaultPos, { shouldValidate: true });
                    }}
                    className={`px-2.5 py-1.5 rounded-md text-xs font-semibold text-center transition-all cursor-pointer ${
                      orderMode === 'custom'
                        ? 'bg-primary text-primary-foreground shadow-xs'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Custom Order
                  </button>
                </div>

                {orderMode === 'custom' ? (
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center justify-between gap-2">
                      <label className="text-xs font-medium text-muted-foreground">
                        Insert as Part #:
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={99}
                        {...register('seriesOrder', { valueAsNumber: true })}
                        className="w-20 px-2 py-1.5 rounded-lg border border-border bg-card text-foreground font-bold text-center text-xs focus:outline-none focus:ring-2 focus:ring-primary/30"
                      />
                    </div>
                    <div className="p-2 rounded-lg bg-primary/10 border border-primary/20 text-[11px] text-foreground leading-relaxed">
                      ⚡ <strong>Smart Insertion:</strong> This article will be placed at Part #{watchedSeriesOrder || 1}. Any existing articles at this position or higher will automatically shift back (+1).
                    </div>
                  </div>
                ) : (
                  <div className="p-2 rounded-lg bg-card border border-border text-[11px] text-muted-foreground leading-relaxed">
                    💡 <strong>Auto / Unordered:</strong> This article requires no fixed position and will automatically be placed at the end of the series after all ordered articles.
                  </div>
                )}

                {/* Series Articles Preview */}
                {activeSeriesBlogs.length > 0 && (
                  <div className="pt-2 border-t border-border/60">
                    <p className="text-[11px] font-semibold text-muted-foreground mb-1.5">
                      Articles in this series ({activeSeriesBlogs.length}):
                    </p>
                    <div className="max-h-32 overflow-y-auto space-y-1 pr-1">
                      {activeSeriesBlogs.map((b: SeriesBlogItem, idx: number) => {
                        const isCurrentEditing = b.id === blog.id;
                        return (
                          <div
                            key={b.id}
                            className={`flex items-center gap-1.5 px-2 py-1 rounded text-[11px] ${
                              isCurrentEditing
                                ? 'bg-primary/15 text-primary font-bold border border-primary/20'
                                : 'bg-card text-foreground/80'
                            }`}
                          >
                            <span className="w-4 h-4 rounded bg-muted text-muted-foreground flex items-center justify-center text-[10px] shrink-0 font-bold">
                              {b.seriesOrder ?? (idx + 1)}
                            </span>
                            <span className="truncate">{b.title}</span>
                            {isCurrentEditing && (
                              <span className="ml-auto text-[9px] text-primary shrink-0 uppercase tracking-wider font-bold">
                                (Current)
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </SidebarSection>
        </form>

        {/* Footer actions */}
        <div className="p-4 border-t border-border space-y-2">
          {lastSaved && (
            <p className="text-xs text-muted-foreground text-center">
              Last saved {lastSaved.toLocaleTimeString()}
            </p>
          )}
          <button
            type="submit"
            form="meta-form"
            disabled={isPending}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-foreground text-background rounded-lg text-sm font-medium hover:bg-foreground/90 disabled:opacity-60 transition-colors"
          >
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {isPending ? 'Saving…' : 'Save'}
          </button>

          <button
            type="button"
            onClick={handleAiTranslate}
            disabled={isTranslating || isPending}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/30 rounded-lg text-sm font-medium hover:bg-purple-500/20 disabled:opacity-60 transition-colors cursor-pointer"
          >
            {isTranslating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-purple-600" />}
            {isTranslating ? 'Translating & caching…' : 'AI Translate & Save to DB'}
          </button>
          {watchedStatus === 'DRAFT' ? (
            <button
              type="button"
              onClick={() => {
                setValue('status', 'PUBLISHED');
                handleSubmit(doSave)();
              }}
              disabled={isPending}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-60 transition-colors"
            >
              <Eye className="w-4 h-4" />
              Publish
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                setValue('status', 'DRAFT');
                handleSubmit(doSave)();
              }}
              disabled={isPending}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-border text-foreground rounded-lg text-sm font-medium hover:bg-muted disabled:opacity-60 transition-colors"
            >
              <EyeOff className="w-4 h-4" />
              Unpublish
            </button>
          )}
        </div>
      </aside>

      {/* ── MAIN EDITOR ─────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col overflow-hidden bg-muted/40">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-border bg-card shrink-0 shadow-2xs">
          <h1 className="text-sm font-medium text-foreground truncate max-w-xs">
            {watchedTitle || 'Untitled Post'}
          </h1>
          <div className="flex items-center gap-3">
            {isDirty && !isPending && (
              <span className="text-xs text-amber-600 dark:text-amber-400 font-medium italic">Unsaved changes</span>
            )}
            {isPending && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Loader2 className="w-3 h-3 animate-spin" /> Saving…
              </span>
            )}
            {blog.slug && !blog.slug.startsWith('draft-') && watchedStatus === 'PUBLISHED' && (
              <a
                href={`/blog/${blog.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-primary hover:underline font-medium"
              >
                <Eye className="w-3 h-3" />
                Preview
              </a>
            )}
          </div>
        </div>

        {/* Editor area */}
        <div className="flex-1 overflow-y-auto p-6 lg:p-10">
          <div className="max-w-4xl mx-auto">
            <TipTapEditor
              content={watch('content')}
              onChange={html => setValue('content', html, { shouldDirty: true })}
              placeholder="Start writing your article…"
            />
            {errors.content && (
              <p className="text-xs text-destructive mt-2">{errors.content.message}</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
