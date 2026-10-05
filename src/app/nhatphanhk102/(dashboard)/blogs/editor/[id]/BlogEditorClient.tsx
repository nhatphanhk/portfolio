'use client';

import { useState, useCallback, useTransition, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { TipTapEditor } from '@/components/admin/editor/TipTapEditor';
import {
  createBlog,
  updateBlog,
  previewTranslateBlogAction,
  saveBlogTranslationAction,
} from '@/lib/actions/blog';
import { TranslationPreviewDialog, TranslatedData } from '@/components/admin/TranslationPreviewDialog';
import { UnsavedChangesDialog } from '@/components/admin/UnsavedChangesDialog';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
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
  Languages,
} from 'lucide-react';
import { slugify } from '@/lib/utils';

const schema = z.object({
  title: z.string().min(3, 'Tiêu đề bắt buộc (tối thiểu 3 ký tự)').max(255),
  slug: z
    .string()
    .min(3, 'Slug bắt buộc (tối thiểu 3 ký tự)')
    .max(255)
    .regex(/^[a-z0-9-]+$/, 'Slug chỉ gồm chữ thường không dấu, số và dấu gạch nối'),
  excerpt: z.string().max(500, 'Tóm tắt không quá 500 ký tự').optional(),
  content: z.string(),
  thumbnailUrl: z.string().url('URL ảnh không hợp lệ').optional().or(z.literal('')),
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
  isOpen,
  onToggle,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border-b border-border last:border-b-0">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
      >
        <span className="flex items-center gap-2">
          <Icon className="w-3.5 h-3.5" />
          {title}
        </span>
        {isOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
      </button>
      {isOpen && <div className="px-4 pb-4 space-y-3">{children}</div>}
    </div>
  );
}

function Field({
  label,
  error,
  required = false,
  children,
}: {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wide">
        {label} {required && <span className="text-destructive font-bold">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

const inputCls =
  'editor-input w-full px-3.5 py-2 text-sm rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground/70 shadow-2xs hover:border-foreground/30 focus:bg-card focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all';

const selectCls = `${inputCls} editor-select appearance-none pr-9 cursor-pointer`;

export function BlogEditorClient({ blog, seriesList }: BlogEditorClientProps) {
  const router = useRouter();
  const [currentBlogId, setCurrentBlogId] = useState<string>(blog.id);
  const isNew = !currentBlogId;

  const [isPending, startTransition] = useTransition();
  const [isTranslating, setIsTranslating] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);
  const [translatedResult, setTranslatedResult] = useState<TranslatedData | null>(null);
  const [targetLocale, setTargetLocale] = useState<'vi' | 'en'>('vi');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Accordion state management so validation errors can expand the missing section
  const [docOpen, setDocOpen] = useState(true);
  const [tagsOpen, setTagsOpen] = useState(true);
  const [thumbOpen, setThumbOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    getValues,
    setError,
    clearErrors,
    reset,
    formState: { errors, isDirty },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: blog.title,
      slug: blog.slug,
      excerpt: blog.excerpt ?? '',
      content: blog.content ?? '',
      thumbnailUrl: blog.thumbnailUrl ?? '',
      status: blog.status,
      tags: blog.tags,
      seriesId: blog.seriesId ?? '',
      seriesOrder: blog.seriesOrder && blog.seriesOrder > 0 ? blog.seriesOrder : null,
    },
  });

  const watchedTitle = watch('title');
  const watchedSlug = watch('slug');
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

  // Protect against accidental browser tab close or reload when changes exist
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  // Handle navigation back to blog list with confirmation modal if dirty
  const handleBackClick = () => {
    if (isDirty) {
      setShowLeaveDialog(true);
    } else {
      router.push('/nhatphanhk102/blogs');
    }
  };

  // Auto-generate slug from title (if slug is empty, temporary draft slug, or new post)
  const onTitleBlur = useCallback(
    (e: React.FocusEvent<HTMLInputElement>) => {
      const val = e.target.value.trim();
      if (!val) return;
      const currentSlug = getValues('slug') || '';
      if (!currentSlug || currentSlug.startsWith('draft-') || isNew) {
        const slug = slugify(val);
        if (slug) setValue('slug', slug, { shouldValidate: true, shouldDirty: true });
      }
    },
    [isNew, getValues, setValue]
  );

  // Validate all strict requirements before publishing
  const validateForPublish = useCallback((data: FormData) => {
    const missing: string[] = [];
    const fieldErrors: Partial<Record<keyof FormData, string>> = {};

    const title = (data.title || '').trim();
    if (!title || title.length < 3 || title.toLowerCase() === 'untitled post') {
      fieldErrors.title = 'Tiêu đề bắt buộc (tối thiểu 3 ký tự) và không được là "Untitled Post"';
      missing.push('Tiêu đề');
    }

    const slug = (data.slug || '').trim();
    if (!slug || slug.length < 3 || !/^[a-z0-9-]+$/.test(slug) || slug.startsWith('draft-')) {
      fieldErrors.slug = 'Slug hợp lệ bắt buộc (không được để slug nháp tạm thời)';
      missing.push('Slug');
    }

    const excerpt = (data.excerpt || '').trim();
    if (!excerpt || excerpt.length < 10) {
      fieldErrors.excerpt = 'Tóm tắt bài viết bắt buộc (tối thiểu 10 ký tự)';
      missing.push('Tóm tắt ngắn (Excerpt)');
    }

    const textContent = (data.content || '').replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
    if (!textContent || textContent.length < 20) {
      fieldErrors.content = 'Nội dung bài viết chưa đủ dài để xuất bản (tối thiểu 20 ký tự)';
      missing.push('Nội dung bài viết');
    }

    const tags = (data.tags || '').trim();
    if (!tags) {
      fieldErrors.tags = 'Vui lòng nhập ít nhất 1 thẻ phân loại (Tags)';
      missing.push('Thẻ phân loại (Tags)');
    }

    if (data.thumbnailUrl && data.thumbnailUrl.trim() !== '') {
      try {
        new URL(data.thumbnailUrl);
      } catch {
        fieldErrors.thumbnailUrl = 'URL ảnh đại diện không hợp lệ';
        missing.push('Ảnh đại diện hợp lệ');
      }
    }

    return {
      valid: missing.length === 0,
      fieldErrors,
      missing,
    };
  }, []);

  const doSave = useCallback(
    (data: FormData) => {
      if (data.content && (data.content.includes('src="data:image/') || data.content.includes('src="blob:'))) {
        toast.warning('Ảnh đang được tải lên máy chủ. Vui lòng chờ vài giây trước khi lưu!');
        return;
      }

      startTransition(async () => {
        const payload: FormData = {
          ...data,
          content: data.content ?? '',
          seriesId: data.seriesId || null,
          seriesOrder:
            data.seriesId && orderMode === 'custom' && data.seriesOrder && data.seriesOrder > 0
              ? Number(data.seriesOrder)
              : null,
        };

        if (!currentBlogId) {
          // Creating brand new post
          const result = await createBlog(payload as any);
          if (result.ok && (result as any).id) {
            const newId = (result as any).id;
            setCurrentBlogId(newId);
            window.history.replaceState(null, '', `/nhatphanhk102/blogs/editor/${newId}`);
            setLastSaved(new Date());
            reset(payload);
            toast.success(payload.status === 'PUBLISHED' ? 'Đã xuất bản bài viết thành công ✓' : 'Đã lưu bản nháp thành công ✓');
          } else {
            const err = typeof (result as any).error === 'string' ? (result as any).error : 'Lưu bài viết thất bại';
            toast.error(err);
          }
        } else {
          // Updating existing post
          const result = await updateBlog(currentBlogId, payload as any);
          if (result.ok) {
            setLastSaved(new Date());
            reset(payload);
            toast.success(payload.status === 'PUBLISHED' ? 'Đã xuất bản bài viết thành công ✓' : 'Đã lưu thay đổi thành công ✓');
          } else {
            toast.error('Lưu bài viết thất bại');
          }
        }
      });
    },
    [currentBlogId, reset, orderMode]
  );

  const handleManualSave = handleSubmit((data: FormData) => {
    // If currently PUBLISHED, validate all fields before saving
    if (data.status === 'PUBLISHED') {
      const validation = validateForPublish(data);
      if (!validation.valid) {
        Object.entries(validation.fieldErrors).forEach(([field, msg]) => {
          setError(field as any, { type: 'manual', message: msg });
        });
        if (validation.fieldErrors.title || validation.fieldErrors.slug || validation.fieldErrors.excerpt) {
          setDocOpen(true);
        }
        if (validation.fieldErrors.tags) setTagsOpen(true);
        if (validation.fieldErrors.thumbnailUrl) setThumbOpen(true);
        toast.error(`Bài viết đang ở trạng thái Publish. Vui lòng hoàn thành: ${validation.missing.join(', ')}`);
        return;
      }
    } else {
      // If saving as Draft and slug is empty, generate from title
      if (!data.slug && data.title) {
        const genSlug = slugify(data.title);
        data.slug = genSlug;
        setValue('slug', genSlug);
      }
    }
    doSave(data);
  });

  const handlePublish = () => {
    const currentValues = getValues();
    const payloadToPublish: FormData = {
      ...currentValues,
      status: 'PUBLISHED',
    };

    const validation = validateForPublish(payloadToPublish);
    if (!validation.valid) {
      Object.entries(validation.fieldErrors).forEach(([field, msg]) => {
        setError(field as any, { type: 'manual', message: msg });
      });
      if (validation.fieldErrors.title || validation.fieldErrors.slug || validation.fieldErrors.excerpt) {
        setDocOpen(true);
      }
      if (validation.fieldErrors.tags) setTagsOpen(true);
      if (validation.fieldErrors.thumbnailUrl) setThumbOpen(true);

      toast.error(
        `Không thể xuất bản! Vui lòng hoàn thành các trường bắt buộc:\n• ${validation.missing.join('\n• ')}`,
        { duration: 5000 }
      );
      return;
    }

    clearErrors();
    setValue('status', 'PUBLISHED', { shouldDirty: true });
    doSave(payloadToPublish);
  };

  const handleUnpublish = () => {
    setValue('status', 'DRAFT', { shouldDirty: true });
    const currentValues = getValues();
    doSave({ ...currentValues, status: 'DRAFT' });
  };

  const handleAiTranslate = async (localeToUse: 'vi' | 'en' = targetLocale) => {
    setIsTranslating(true);
    const targetLabel = localeToUse === 'vi' ? 'Tiếng Việt' : 'Tiếng Anh';
    const contentLen = (getValues('content') || blog.content || '').length;
    if (contentLen > 3000) {
      toast.info(`AI đang phân tích & chuyển ngữ bài viết dài sang ${targetLabel}... Vui lòng đợi trong giây lát (~15-30s).`);
    } else {
      toast.info(`AI đang chuyển ngữ sang ${targetLabel}...`);
    }
    try {
      const currentPayload = {
        title: getValues('title') || blog.title || 'Untitled Post',
        excerpt: getValues('excerpt') || blog.excerpt || '',
        content: getValues('content') || blog.content || '',
      };

      let resData: TranslatedData | null = null;
      let errorMsg: string | null = null;

      try {
        const apiRes = await fetch('/api/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'preview',
            blogId: currentBlogId || undefined,
            ...currentPayload,
            targetLocale: localeToUse,
          }),
        });
        const json = await apiRes.json();
        if (json.ok && json.data) {
          resData = json.data;
        } else {
          errorMsg = json.error;
        }
      } catch (fetchErr: any) {
        if (currentBlogId) {
          const saRes = await previewTranslateBlogAction(currentBlogId, localeToUse, currentPayload);
          if (saRes.ok && saRes.data) {
            resData = saRes.data;
          } else {
            errorMsg = saRes.error || fetchErr.message;
          }
        }
      }

      if (resData) {
        setTranslatedResult(resData);
        setPreviewOpen(true);
        toast.success(`AI đã chuyển ngữ sang ${targetLabel}! Hãy xem trước bản dịch.`);
      } else {
        toast.error(errorMsg || 'Chuyển ngữ AI thất bại');
      }
    } catch (err: any) {
      toast.error('Lỗi khi gọi AI chuyển ngữ: ' + (err?.message || 'Lỗi không xác định'));
    } finally {
      setIsTranslating(false);
    }
  };

  const handleApplyToEditor = (data: TranslatedData) => {
    setValue('title', data.title, { shouldDirty: true });
    setValue('excerpt', data.excerpt, { shouldDirty: true });
    setValue('content', data.content, { shouldDirty: true });
    toast.success('Đã áp dụng bản dịch vào trình soạn thảo!');
  };

  const handleSaveToDb = async (data: TranslatedData) => {
    if (!currentBlogId) {
      toast.warning('Vui lòng bấm Save để lưu bài viết trước khi lưu bản dịch vào CSDL!');
      return;
    }

    try {
      const apiRes = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'save',
          blogId: currentBlogId,
          ...data,
          targetLocale,
        }),
      });
      const json = await apiRes.json();
      if (json.ok) {
        toast.success(`Đã lưu bản dịch (${targetLocale.toUpperCase()}) vào CSDL song ngữ thành công!`);
        return;
      }
    } catch {
      // fallback
    }

    const res = await saveBlogTranslationAction(currentBlogId, data, targetLocale);
    if (res.ok) {
      toast.success(`Đã lưu bản dịch (${targetLocale.toUpperCase()}) vào CSDL song ngữ thành công!`);
    } else {
      toast.error(res.error || 'Lỗi khi lưu bản dịch vào CSDL');
    }
  };

  const handleApplyAndSave = async (data: TranslatedData) => {
    handleApplyToEditor(data);
    await handleSaveToDb(data);
  };

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
          <button
            type="button"
            onClick={handleBackClick}
            className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Posts
          </button>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusColors[watchedStatus]}`}>
            {watchedStatus}
          </span>
        </div>

        {/* Form Sections */}
        <form id="meta-form" onSubmit={handleManualSave} className="flex-1">
          <SidebarSection
            title="Document"
            icon={AlignLeft}
            isOpen={docOpen}
            onToggle={() => setDocOpen(v => !v)}
          >
            <Field label="Title" error={errors.title?.message} required>
              <input
                {...register('title')}
                onBlur={onTitleBlur}
                placeholder="My awesome post"
                className={inputCls}
              />
            </Field>
            <Field label="Slug" error={errors.slug?.message} required>
              <input {...register('slug')} placeholder="my-awesome-post" className={inputCls} />
            </Field>
            <Field label="Excerpt (Tóm tắt)" error={errors.excerpt?.message} required>
              <textarea
                {...register('excerpt')}
                rows={3}
                placeholder="Tóm tắt ngắn gọn nội dung bài viết (bắt buộc khi xuất bản)..."
                className={`${inputCls} resize-none`}
              />
            </Field>
          </SidebarSection>

          <SidebarSection
            title="Tags"
            icon={Tag}
            isOpen={tagsOpen}
            onToggle={() => setTagsOpen(v => !v)}
          >
            <Field label="Tags (phân cách bằng dấu phẩy)" error={errors.tags?.message} required>
              <input {...register('tags')} placeholder="nextjs, typescript, react" className={inputCls} />
            </Field>
          </SidebarSection>

          <SidebarSection
            title="Thumbnail"
            icon={ImageIcon}
            isOpen={thumbOpen}
            onToggle={() => setThumbOpen(v => !v)}
          >
            <Field label="Thumbnail URL (Tùy chọn)" error={errors.thumbnailUrl?.message}>
              <input {...register('thumbnailUrl')} placeholder="https://..." className={inputCls} />
            </Field>
            {watch('thumbnailUrl') && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={watch('thumbnailUrl')}
                alt="thumbnail preview"
                className="w-full rounded-lg border border-border object-cover aspect-video mt-2"
                onError={e => (e.currentTarget.style.display = 'none')}
              />
            )}
          </SidebarSection>

          <SidebarSection
            title="Settings"
            icon={Settings}
            isOpen={settingsOpen}
            onToggle={() => setSettingsOpen(v => !v)}
          >
            <Field label="Status">
              <select {...register('status')} className={selectCls}>
                <option value="DRAFT">Draft (Bản nháp)</option>
                <option value="PUBLISHED">Published (Công khai)</option>
                <option value="ARCHIVED">Archived (Lưu trữ)</option>
              </select>
            </Field>
            <Field label="Series">
              <select {...register('seriesId')} className={selectCls}>
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
                <div className="grid grid-cols-2 gap-1.5 p-1 rounded-lg bg-card border border-border">
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
                      const defaultPos = current && current > 0 ? current : activeSeriesBlogs.length + 1;
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
                        className="editor-input w-20 px-2 py-1.5 rounded-lg border border-border bg-card text-foreground font-bold text-center text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-2xs transition-colors"
                      />
                    </div>
                    <div className="p-2 rounded-lg bg-primary/10 border border-primary/20 text-[11px] text-foreground leading-relaxed">
                      ⚡ <strong>Smart Insertion:</strong> Bài viết này sẽ được đặt ở vị trí #{watchedSeriesOrder || 1}. Các bài viết khác từ vị trí này trở đi sẽ tự động lùi lại (+1).
                    </div>
                  </div>
                ) : (
                  <div className="p-2 rounded-lg bg-card border border-border text-[11px] text-muted-foreground leading-relaxed">
                    💡 <strong>Auto / Unordered:</strong> Bài viết sẽ tự động xếp ở cuối series sau các bài đã có số thứ tự.
                  </div>
                )}

                {/* Series Articles Preview */}
                {activeSeriesBlogs.length > 0 && (
                  <div className="pt-2 border-t border-border/60">
                    <p className="text-[11px] font-semibold text-muted-foreground mb-1.5">
                      Bài viết trong series ({activeSeriesBlogs.length}):
                    </p>
                    <div className="max-h-32 overflow-y-auto space-y-1 pr-1">
                      {activeSeriesBlogs.map((b: SeriesBlogItem, idx: number) => {
                        const isCurrentEditing = b.id === currentBlogId;
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
                              {b.seriesOrder ?? idx + 1}
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
              Lưu lần cuối lúc {lastSaved.toLocaleTimeString()}
            </p>
          )}

          {/* Primary Save Button (Explicit only, no auto-save) */}
          <button
            type="submit"
            form="meta-form"
            disabled={isPending}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-foreground text-background rounded-lg text-sm font-semibold hover:bg-foreground/90 disabled:opacity-60 transition-colors cursor-pointer"
          >
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {isPending ? 'Đang lưu…' : 'Save'}
          </button>

          {/* AI Translation Action with Target Locale Selector */}
          <div className="space-y-1.5 p-2 rounded-xl bg-purple-500/5 border border-purple-500/20">
            <div className="flex items-center justify-between px-1">
              <span className="text-[11px] font-semibold text-purple-700 dark:text-purple-300 flex items-center gap-1">
                <Languages className="w-3.5 h-3.5" />
                Dịch sang:
              </span>
              <div className="flex items-center gap-1 bg-background/80 p-0.5 rounded-lg border border-border">
                <button
                  type="button"
                  onClick={() => setTargetLocale('vi')}
                  className={`px-2 py-0.5 text-[11px] font-medium rounded-md transition-all cursor-pointer ${
                    targetLocale === 'vi'
                      ? 'bg-purple-600 text-white font-bold shadow-2xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  🇻🇳 Tiếng Việt
                </button>
                <button
                  type="button"
                  onClick={() => setTargetLocale('en')}
                  className={`px-2 py-0.5 text-[11px] font-medium rounded-md transition-all cursor-pointer ${
                    targetLocale === 'en'
                      ? 'bg-purple-600 text-white font-bold shadow-2xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  🇬🇧 English
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleAiTranslate(targetLocale)}
              disabled={isTranslating || isPending}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold shadow-xs disabled:opacity-60 transition-colors cursor-pointer"
            >
              {isTranslating ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Sparkles className="w-3.5 h-3.5" />
              )}
              {isTranslating
                ? `AI đang dịch (${targetLocale.toUpperCase()})...`
                : `Dịch AI (${targetLocale === 'vi' ? 'Tiếng Việt' : 'English'})`}
            </button>
          </div>

          {/* Publish / Unpublish Button with strict validation */}
          {watchedStatus === 'DRAFT' ? (
            <button
              type="button"
              onClick={handlePublish}
              disabled={isPending}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 disabled:opacity-60 transition-colors cursor-pointer shadow-xs"
            >
              <Eye className="w-4 h-4" />
              Publish
            </button>
          ) : (
            <button
              type="button"
              onClick={handleUnpublish}
              disabled={isPending}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-border text-foreground rounded-lg text-sm font-medium hover:bg-muted disabled:opacity-60 transition-colors cursor-pointer"
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
            {watchedTitle || (isNew ? 'New Post' : 'Untitled Post')}
          </h1>
          <div className="flex items-center gap-3">
            {isDirty && !isPending && (
              <span className="text-xs text-amber-600 dark:text-amber-400 font-medium italic">
                Chưa lưu thay đổi
              </span>
            )}
            {isPending && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Loader2 className="w-3 h-3 animate-spin" /> Đang lưu…
              </span>
            )}
            {watchedSlug && !watchedSlug.startsWith('draft-') && watchedStatus === 'PUBLISHED' && (
              <a
                href={`/blog/${watchedSlug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-primary hover:underline font-medium"
              >
                <Eye className="w-3 h-3" />
                Xem bài viết
              </a>
            )}
          </div>
        </div>

        {/* Editor area */}
        <div className="flex-1 overflow-y-auto p-6 lg:p-10">
          <div className="max-w-4xl mx-auto">
            <TipTapEditor
              content={watch('content') || ''}
              onChange={html => setValue('content', html, { shouldDirty: true })}
              placeholder="Bắt đầu viết nội dung bài viết tại đây... (Gõ / để mở menu công cụ)"
            />
            {errors.content && (
              <p className="text-xs text-destructive mt-2">{errors.content.message}</p>
            )}
          </div>
        </div>
      </main>

      <TranslationPreviewDialog
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        original={{
          title: getValues('title') || blog.title || '',
          excerpt: getValues('excerpt') || blog.excerpt || '',
          content: getValues('content') || blog.content || '',
        }}
        translated={translatedResult}
        targetLocale={targetLocale}
        onApplyToEditor={handleApplyToEditor}
        onSaveToDb={handleSaveToDb}
        onApplyAndSave={handleApplyAndSave}
      />

      {/* Unsaved changes confirmation dialog */}
      <UnsavedChangesDialog
        open={showLeaveDialog}
        onOpenChange={setShowLeaveDialog}
        onConfirmLeave={() => router.push('/nhatphanhk102/blogs')}
      />
    </div>
  );
}
