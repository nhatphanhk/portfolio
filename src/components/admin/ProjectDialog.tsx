'use client';

import { useState, useEffect, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import {
  createProject,
  updateProject,
  previewTranslateProjectAction,
  saveProjectTranslationAction,
  getProjectTranslations,
  type ProjectFormData,
} from '@/lib/actions/project';
import { TipTapEditor } from '@/components/admin/editor/TipTapEditor';
import { Sparkles, Languages, CheckCircle2, Loader2, ChevronDown, ChevronUp } from 'lucide-react';

const schema = z.object({
  title: z.string().min(3).max(255),
  slug: z.string().min(3).max(255).regex(/^[a-z0-9-]+$/),
  description: z.string().max(1000).optional(),
  content: z.string().optional(),
  thumbnailUrl: z.string().url().optional().or(z.literal('')),
  demoUrl: z.string().url().optional().or(z.literal('')),
  repoUrl: z.string().url().optional().or(z.literal('')),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']),
  featured: z.boolean(),
  tags: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface ProjectDialogProps {
  mode: 'create' | 'edit';
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: Partial<FormData> & { id?: string };
}

export function ProjectDialog({ mode, open, onOpenChange, initialData }: ProjectDialogProps) {
  const [isPending, startTransition] = useTransition();

  // Translation states
  const [isTranslating, setIsTranslating] = useState(false);
  const [isSavingTrans, setIsSavingTrans] = useState(false);
  const [hasTranslation, setHasTranslation] = useState(false);
  const [showTransPreview, setShowTransPreview] = useState(false);
  const [transData, setTransData] = useState<{ title: string; description: string; content: string }>({
    title: '',
    description: '',
    content: '',
  });

  const { register, handleSubmit, setValue, watch, formState: { errors }, reset } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: initialData?.title ?? '',
      slug: initialData?.slug ?? '',
      description: initialData?.description ?? '',
      content: initialData?.content ?? '',
      thumbnailUrl: initialData?.thumbnailUrl ?? '',
      demoUrl: initialData?.demoUrl ?? '',
      repoUrl: initialData?.repoUrl ?? '',
      status: initialData?.status ?? 'DRAFT',
      featured: initialData?.featured ?? false,
      tags: initialData?.tags ?? '',
    },
  });

  useEffect(() => {
    if (open && initialData?.id) {
      getProjectTranslations(initialData.id).then(list => {
        const en = list.find(t => t.locale === 'en');
        if (en) {
          setHasTranslation(true);
          setTransData({
            title: en.title || '',
            description: en.description || '',
            content: en.content || '',
          });
        } else {
          setHasTranslation(false);
        }
      });
    }
  }, [open, initialData?.id]);

  const handleGenerateTranslation = async () => {
    if (!initialData?.id) {
      toast.error('Vui lòng lưu dự án trước khi tạo bản dịch AI.');
      return;
    }
    const currentTitle = watch('title');
    if (!currentTitle) {
      toast.error('Dự án cần có tiêu đề để dịch.');
      return;
    }

    setIsTranslating(true);
    try {
      let resData: { title: string; description: string; content: string } | null = null;
      let errorMsg: string | null = null;

      // 1. Try REST API endpoint first
      try {
        const apiRes = await fetch('/api/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            entityType: 'project',
            entityId: initialData.id,
            action: 'preview',
            title: currentTitle,
            description: watch('description'),
            content: watch('content'),
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
        // Continue to server action fallback
      }

      // 2. Fallback to Server Action
      if (!resData) {
        const res = await previewTranslateProjectAction(initialData.id, 'en', {
          title: currentTitle,
          description: watch('description'),
          content: watch('content'),
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
        toast.success('Bản dịch AI đã sẵn sàng! Xem trước và bấm Lưu bên dưới.');
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
            entityType: 'project',
            entityId: initialData.id,
            action: 'save',
            ...transData,
            targetLocale: 'en',
          }),
        });
        const json = await apiRes.json();
        if (json.ok) {
          setHasTranslation(true);
          toast.success('Đã lưu bản dịch Tiếng Anh (EN) thành công!');
          return;
        }
      } catch {}

      // 2. Fallback to server action
      const res = await saveProjectTranslationAction(initialData.id, transData, 'en');
      if (res.ok) {
        setHasTranslation(true);
        toast.success('Đã lưu bản dịch Tiếng Anh (EN) thành công!');
      } else {
        toast.error(res.error || 'Lỗi khi lưu bản dịch');
      }
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi lưu bản dịch');
    } finally {
      setIsSavingTrans(false);
    }
  };

  const onTitleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    if (!initialData?.slug) {
      const slug = e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      setValue('slug', slug, { shouldValidate: true });
    }
  };

  const onSubmit = (data: FormData) => {
    startTransition(async () => {
      const payload: ProjectFormData = { ...data, content: data.content ?? '', description: data.description ?? '' };
      const result = mode === 'create'
        ? await createProject(payload)
        : await updateProject(initialData!.id!, payload);

      if (result.ok) {
        toast.success(mode === 'create' ? 'Project created!' : 'Project updated!');
        reset();
        onOpenChange(false);
      } else {
        toast.error('Something went wrong.');
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? 'New Project' : 'Edit Project'}</DialogTitle>
        </DialogHeader>

        <form id="project-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Title *</label>
              <input {...register('title')} onBlur={onTitleBlur} placeholder="My Project" className="w-full px-3 py-2 rounded-lg border border-border bg-card text-foreground shadow-xs text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              {errors.title && <p className="text-xs text-destructive mt-1">{errors.title.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Slug *</label>
              <input {...register('slug')} placeholder="my-project" className="w-full px-3 py-2 rounded-lg border border-border bg-card text-foreground shadow-xs text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              {errors.slug && <p className="text-xs text-destructive mt-1">{errors.slug.message}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea {...register('description')} rows={3} placeholder="Short description..." className="w-full px-3 py-2 rounded-lg border border-border bg-card text-foreground shadow-xs text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Content</label>
            <TipTapEditor
              content={watch('content') ?? ''}
              onChange={(html: string) => setValue('content', html, { shouldValidate: true })}
              placeholder="Describe the project in detail..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Demo URL</label>
              <input {...register('demoUrl')} placeholder="https://demo.example.com" className="w-full px-3 py-2 rounded-lg border border-border bg-card text-foreground shadow-xs text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              {errors.demoUrl && <p className="text-xs text-destructive mt-1">{errors.demoUrl.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Repo URL</label>
              <input {...register('repoUrl')} placeholder="https://github.com/..." className="w-full px-3 py-2 rounded-lg border border-border bg-card text-foreground shadow-xs text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              {errors.repoUrl && <p className="text-xs text-destructive mt-1">{errors.repoUrl.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Tags</label>
              <input {...register('tags')} placeholder="react, nextjs, typescript" className="w-full px-3 py-2 rounded-lg border border-border bg-card text-foreground shadow-xs text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              <p className="text-xs text-muted-foreground mt-0.5">Comma-separated</p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select {...register('status')} className="w-full px-3 py-2 rounded-lg border border-border bg-card text-foreground shadow-xs text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                <option value="DRAFT">Draft</option>
                <option value="PUBLISHED">Published</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <input type="checkbox" id="featured-check" {...register('featured')} className="rounded" />
            <label htmlFor="featured-check" className="text-sm font-medium">Featured project</label>
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
                      Tiêu đề Tiếng Anh (English Title)
                    </label>
                    <input
                      type="text"
                      value={transData.title}
                      onChange={e => setTransData({ ...transData, title: e.target.value })}
                      placeholder="English Title"
                      className="w-full px-3 py-2 rounded-lg border border-border bg-card text-foreground text-sm shadow-xs focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">
                      Mô tả ngắn Tiếng Anh (English Description)
                    </label>
                    <textarea
                      rows={2}
                      value={transData.description}
                      onChange={e => setTransData({ ...transData, description: e.target.value })}
                      placeholder="English short description"
                      className="w-full px-3 py-2 rounded-lg border border-border bg-card text-foreground text-sm shadow-xs focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                    />
                  </div>

                  {transData.content && (
                    <div>
                      <label className="block text-xs font-semibold text-foreground mb-1">
                        Nội dung chi tiết Tiếng Anh (English Content HTML)
                      </label>
                      <textarea
                        rows={5}
                        value={transData.content}
                        onChange={e => setTransData({ ...transData, content: e.target.value })}
                        placeholder="English HTML Content"
                        className="w-full px-3 py-2 font-mono text-xs rounded-lg border border-border bg-card text-foreground shadow-xs focus:outline-none focus:ring-2 focus:ring-primary/30 resize-y"
                      />
                    </div>
                  )}

                  <div className="flex justify-end pt-1">
                    <button
                      type="button"
                      disabled={isSavingTrans || !transData.title}
                      onClick={handleSaveTranslation}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 transition-colors shadow-xs cursor-pointer"
                    >
                      {isSavingTrans ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                      <span>Lưu bản dịch EN</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </form>

        <DialogFooter>
          <button type="button" onClick={() => onOpenChange(false)} className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground">Cancel</button>
          <button type="submit" form="project-form" disabled={isPending} className="px-4 py-2 bg-foreground text-background rounded-lg text-sm font-medium hover:bg-foreground/90 disabled:opacity-60 transition-colors">
            {isPending ? 'Saving…' : mode === 'create' ? 'Create Project' : 'Save Changes'}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
