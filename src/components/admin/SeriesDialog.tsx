'use client';

import { useCallback, useState, useEffect, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import {
  createSeries,
  updateSeries,
  previewTranslateSeriesAction,
  saveSeriesTranslationAction,
  getSeriesTranslations,
} from '@/lib/actions/series';
import { Sparkles, Languages, CheckCircle2, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { slugify } from '@/lib/utils';

const schema = z.object({
  title: z.string().min(2, 'Title required').max(255),
  tags: z.string().optional(),
  slug: z.string().optional(),
  description: z.string().max(1000).optional(),
  coverUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
});

type FormData = z.infer<typeof schema>;

interface SeriesDialogProps {
  mode: 'create' | 'edit';
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: Partial<FormData> & { id?: string };
  onSuccess?: () => void;
}

export function SeriesDialog({ mode, open, onOpenChange, initialData, onSuccess }: SeriesDialogProps) {
  const [isPending, startTransition] = useTransition();

  // Translation states
  const [isTranslating, setIsTranslating] = useState(false);
  const [isSavingTrans, setIsSavingTrans] = useState(false);
  const [hasTranslation, setHasTranslation] = useState(false);
  const [showTransPreview, setShowTransPreview] = useState(false);
  const [transData, setTransData] = useState<{ title: string; description: string }>({
    title: '',
    description: '',
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: initialData?.title ?? '',
      tags: initialData?.tags ?? '',
      slug: initialData?.slug ?? '',
      description: initialData?.description ?? '',
      coverUrl: initialData?.coverUrl ?? '',
    },
  });

  useEffect(() => {
    if (open && initialData?.id) {
      getSeriesTranslations(initialData.id).then(list => {
        const en = list.find(t => t.locale === 'en');
        if (en) {
          setHasTranslation(true);
          setTransData({
            title: en.title || '',
            description: en.description || '',
          });
        } else {
          setHasTranslation(false);
        }
      });
    }
  }, [open, initialData?.id]);

  const handleGenerateTranslation = async () => {
    if (!initialData?.id) {
      toast.error('Vui lòng lưu series trước khi tạo bản dịch AI.');
      return;
    }
    const currentTitle = watch('title');
    if (!currentTitle) {
      toast.error('Series cần có tiêu đề để dịch.');
      return;
    }

    setIsTranslating(true);
    try {
      let resData: { title: string; description: string } | null = null;
      let errorMsg: string | null = null;

      // 1. Try REST API endpoint first
      try {
        const apiRes = await fetch('/api/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            entityType: 'series',
            entityId: initialData.id,
            action: 'preview',
            title: currentTitle,
            description: watch('description'),
            targetLocale: 'en',
          }),
        });
        const json = await apiRes.json();
        if (json.ok && json.data) {
          resData = json.data;
        } else {
          errorMsg = json.error;
        }
      } catch {
        // Fallback
      }

      // 2. Fallback to Server Action
      if (!resData) {
        const res = await previewTranslateSeriesAction(initialData.id, 'en', {
          title: currentTitle,
          description: watch('description'),
        });
        if (res.ok && res.data) {
          resData = res.data;
        } else {
          errorMsg = res.error || errorMsg;
        }
      }

      if (resData) {
        setTransData(resData);
        setShowTransPreview(true);
        toast.success('Bản dịch AI cho Series đã sẵn sàng!');
      } else {
        toast.error(errorMsg || 'Dịch thất bại');
      }
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi gọi AI dịch');
    } finally {
      setIsTranslating(false);
    }
  };

  const handleSaveTranslation = async () => {
    if (!initialData?.id) return;
    setIsSavingTrans(true);
    try {
      // 1. Try REST API first
      try {
        const apiRes = await fetch('/api/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            entityType: 'series',
            entityId: initialData.id,
            action: 'save',
            ...transData,
            targetLocale: 'en',
          }),
        });
        const json = await apiRes.json();
        if (json.ok) {
          setHasTranslation(true);
          toast.success('Đã lưu bản dịch Series (EN) thành công!');
          onSuccess?.();
          return;
        }
      } catch {}

      // 2. Fallback to server action
      const res = await saveSeriesTranslationAction(initialData.id, transData, 'en');
      if (res.ok) {
        setHasTranslation(true);
        toast.success('Đã lưu bản dịch Series (EN) thành công!');
        onSuccess?.();
      } else {
        toast.error(res.error || 'Lỗi khi lưu bản dịch');
      }
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi lưu bản dịch');
    } finally {
      setIsSavingTrans(false);
    }
  };

  const onTitleBlur = useCallback(
    (e: React.FocusEvent<HTMLInputElement>) => {
      if (!initialData?.slug) {
        const slug = slugify(e.target.value);
        setValue('slug', slug, { shouldValidate: true });
      }
    },
    [initialData?.slug, setValue]
  );

  const onSubmit = (data: FormData) => {
    startTransition(async () => {
      const finalSlug = data.slug?.trim() || slugify(data.title);

      const payload = {
        ...data,
        slug: finalSlug,
      };

      const result =
        mode === 'create'
          ? await createSeries(payload)
          : await updateSeries(initialData!.id!, payload);

      if (result.ok) {
        toast.success(mode === 'create' ? 'Series created!' : 'Series updated!');
        reset();
        onOpenChange(false);
        onSuccess?.();
      } else {
        toast.error(typeof result.error === 'string' ? result.error : 'Failed to save series');
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? 'New Blog Series' : 'Edit Blog Series'}</DialogTitle>
        </DialogHeader>

        <form id="series-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          <div>
            <label className="block text-sm font-medium mb-1">Title *</label>
            <input
              {...register('title')}
              onBlur={onTitleBlur}
              placeholder="Full-Stack Web Development Series"
              className="w-full px-3 py-2 rounded-lg border border-border bg-card text-foreground shadow-xs text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
            {errors.title && <p className="text-xs text-destructive mt-1">{errors.title.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Tags / Topics</label>
            <input
              {...register('tags')}
              placeholder="React, Next.js, Architecture (comma separated)"
              className="w-full px-3 py-2 rounded-lg border border-border bg-card text-foreground shadow-xs text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <p className="text-[11px] text-muted-foreground mt-1">
              Used for organizing and filtering series by technology or topic.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              {...register('description')}
              rows={3}
              placeholder="A comprehensive guide to building modern full-stack web applications..."
              className="w-full px-3 py-2 rounded-lg border border-border bg-card text-foreground shadow-xs text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
            {errors.description && (
              <p className="text-xs text-destructive mt-1">{errors.description.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Cover Image URL</label>
            <input
              {...register('coverUrl')}
              placeholder="https://..."
              className="w-full px-3 py-2 rounded-lg border border-border bg-card text-foreground shadow-xs text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
            {errors.coverUrl && (
              <p className="text-xs text-destructive mt-1">{errors.coverUrl.message}</p>
            )}
          </div>

          {/* AI Translation Section */}
          {mode === 'edit' && initialData?.id && (
            <div className="pt-4 border-t border-border/80 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Languages className="w-4 h-4 text-primary" />
                  <span className="text-sm font-semibold text-foreground">Bản dịch Tiếng Anh (EN)</span>
                  {hasTranslation ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20">
                      <CheckCircle2 className="w-3 h-3" /> Đã có bản dịch
                    </span>
                  ) : (
                    <span className="text-[11px] text-muted-foreground">Chưa có bản dịch</span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={isTranslating}
                    onClick={handleGenerateTranslation}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-60 transition-all shadow-xs cursor-pointer"
                  >
                    {isTranslating ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Đang dịch...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>{hasTranslation ? 'Dịch lại AI (EN)' : 'Dịch AI (EN)'}</span>
                      </>
                    )}
                  </button>

                  {(hasTranslation || showTransPreview) && (
                    <button
                      type="button"
                      onClick={() => setShowTransPreview(!showTransPreview)}
                      className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted"
                      title={showTransPreview ? 'Thu gọn' : 'Xem bản dịch'}
                    >
                      {showTransPreview ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  )}
                </div>
              </div>

              {/* Translation Preview / Edit Panel */}
              {showTransPreview && (
                <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">
                      Tên Series Tiếng Anh (English Title)
                    </label>
                    <input
                      type="text"
                      value={transData.title}
                      onChange={e => setTransData({ ...transData, title: e.target.value })}
                      placeholder="English Series Title"
                      className="w-full px-3 py-2 rounded-lg border border-border bg-card text-foreground text-sm shadow-xs focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">
                      Mô tả Series Tiếng Anh (English Description)
                    </label>
                    <textarea
                      rows={2}
                      value={transData.description}
                      onChange={e => setTransData({ ...transData, description: e.target.value })}
                      placeholder="English Series Description"
                      className="w-full px-3 py-2 rounded-lg border border-border bg-card text-foreground text-sm shadow-xs focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                    />
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      type="button"
                      disabled={isSavingTrans || !transData.title}
                      onClick={handleSaveTranslation}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 transition-colors shadow-xs cursor-pointer"
                    >
                      {isSavingTrans ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                      <span>Lưu bản dịch Series EN</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </form>

        <DialogFooter>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="series-form"
            disabled={isPending}
            className="px-4 py-2 bg-foreground text-background rounded-lg text-sm font-medium hover:bg-foreground/90 disabled:opacity-60 transition-colors"
          >
            {isPending ? 'Saving...' : mode === 'create' ? 'Create Series' : 'Save Changes'}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
