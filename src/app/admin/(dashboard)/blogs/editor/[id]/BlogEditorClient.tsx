'use client';

import { useState, useCallback, useTransition, useEffect } from 'react';
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

interface BlogEditorClientProps {
  blog: FormData & { id: string };
  seriesList: { id: string; title: string }[];
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
    watch,
    setValue,
    formState: { errors, isDirty },
    reset,
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
      seriesOrder: blog.seriesOrder ?? 0,
    },
  });

  const watchedTitle = watch('title');
  const watchedStatus = watch('status');

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
        const result = await updateBlog(blog.id, data);
        if (result.ok) {
          setLastSaved(new Date());
          reset(data); // mark form as clean
          toast.success('Saved ✓');
        } else {
          toast.error('Save failed');
        }
      });
    },
    [blog.id, reset]
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
                <option value="">— None —</option>
                {seriesList.map(s => (
                  <option key={s.id} value={s.id}>{s.title}</option>
                ))}
              </select>
            </Field>
            <Field label="Series Order">
              <input
                type="number"
                {...register('seriesOrder', { valueAsNumber: true })}
                placeholder="1"
                className={inputCls}
              />
            </Field>
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
