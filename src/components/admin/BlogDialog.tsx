'use client';

import { useState, useCallback, useTransition, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { createBlog, updateBlog, type BlogFormData } from '@/lib/actions/blog';
import { getAllSeries } from '@/lib/actions/series';
import { TipTapEditor } from '@/components/admin/editor/TipTapEditor';

const schema = z.object({
  title: z.string().min(3, 'Title required').max(255),
  slug: z.string().min(3).max(255).regex(/^[a-z0-9-]+$/, 'Only lowercase letters, numbers, hyphens'),
  excerpt: z.string().max(500).optional(),
  content: z.string().min(1, 'Content required'),
  thumbnailUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']),
  tags: z.string().optional(),
  seriesId: z.string().optional().nullable(),
  seriesOrder: z.number().optional().nullable(),
});

type FormData = z.infer<typeof schema>;

interface BlogDialogProps {
  mode: 'create' | 'edit';
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: Partial<FormData> & { id?: string };
  onSuccess?: () => void;
}

export function BlogDialog({ mode, open, onOpenChange, initialData, onSuccess }: BlogDialogProps) {
  const [isPending, startTransition] = useTransition();
  const [seriesList, setSeriesList] = useState<Array<{ id: string; title: string }>>([]);

  useEffect(() => {
    if (open) {
      getAllSeries().then(data => {
        setSeriesList(data.map((s: { id: string; title: string }) => ({ id: s.id, title: s.title })));
      });
    }
  }, [open]);

  const {
    register, handleSubmit, watch, setValue,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: initialData?.title ?? '',
      slug: initialData?.slug ?? '',
      excerpt: initialData?.excerpt ?? '',
      content: initialData?.content ?? '',
      thumbnailUrl: initialData?.thumbnailUrl ?? '',
      status: initialData?.status ?? 'DRAFT',
      tags: initialData?.tags ?? '',
      seriesId: initialData?.seriesId ?? '',
      seriesOrder: initialData?.seriesOrder ?? 0,
    },
  });

  /** Auto-generate slug from title */
  const onTitleBlur = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    if (!initialData?.slug) {
      const slug = e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      setValue('slug', slug, { shouldValidate: true });
    }
  }, [initialData?.slug, setValue]);

  const onSubmit = (data: FormData) => {
    startTransition(async () => {
      const payload: BlogFormData = {
        ...data,
        content: data.content,
        status: data.status,
      };

      const result = mode === 'create'
        ? await createBlog(payload)
        : await updateBlog(initialData!.id!, payload);

      if (result.ok) {
        toast.success(mode === 'create' ? 'Blog post created!' : 'Blog post updated!');
        reset();
        onOpenChange(false);
        onSuccess?.();
      } else {
        toast.error('Something went wrong. Please try again.');
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? 'New Blog Post' : 'Edit Blog Post'}</DialogTitle>
        </DialogHeader>

        <form id="blog-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          {/* Title */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Title *</label>
              <input
                {...register('title')}
                onBlur={onTitleBlur}
                placeholder="My Awesome Post"
                className="w-full px-3 py-2 rounded-lg border border-border bg-white shadow-xs text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
              {errors.title && <p className="text-xs text-destructive mt-1">{errors.title.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Slug *</label>
              <input
                {...register('slug')}
                placeholder="my-awesome-post"
                className="w-full px-3 py-2 rounded-lg border border-border bg-white shadow-xs text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
              {errors.slug && <p className="text-xs text-destructive mt-1">{errors.slug.message}</p>}
            </div>
          </div>

          {/* Excerpt */}
          <div>
            <label className="block text-sm font-medium mb-1">Excerpt</label>
            <textarea
              {...register('excerpt')}
              rows={2}
              placeholder="Brief summary of the post..."
              className="w-full px-3 py-2 rounded-lg border border-border bg-white shadow-xs text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium mb-1">Content *</label>
            <TipTapEditor
              content={watch('content')}
              onChange={(html: string) => setValue('content', html, { shouldValidate: true })}
              placeholder="Write your content..."
            />
            {errors.content && <p className="text-xs text-destructive mt-1">{errors.content.message}</p>}
          </div>

          {/* Tags + Thumbnail + Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Tags</label>
              <input
                {...register('tags')}
                placeholder="nextjs, typescript, react"
                className="w-full px-3 py-2 rounded-lg border border-border bg-white shadow-xs text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <p className="text-xs text-muted-foreground mt-0.5">Comma-separated</p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select
                {...register('status')}
                className="w-full px-3 py-2 rounded-lg border border-border bg-white shadow-xs text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="DRAFT">Draft</option>
                <option value="PUBLISHED">Published</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Thumbnail URL</label>
            <input
              {...register('thumbnailUrl')}
              placeholder="https://..."
              className="w-full px-3 py-2 rounded-lg border border-border bg-white shadow-xs text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
            {errors.thumbnailUrl && <p className="text-xs text-destructive mt-1">{errors.thumbnailUrl.message}</p>}
          </div>

          {/* Series */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Series (Optional)</label>
              <select
                {...register('seriesId')}
                className="w-full px-3 py-2 rounded-lg border border-border bg-white shadow-xs text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">— None (Standalone) —</option>
                {seriesList.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.title}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Series Order</label>
              <input
                type="number"
                {...register('seriesOrder', { valueAsNumber: true })}
                placeholder="1"
                className="w-full px-3 py-2 rounded-lg border border-border bg-white shadow-xs text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <p className="text-xs text-muted-foreground mt-0.5">Part # in the series</p>
            </div>
          </div>
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
            form="blog-form"
            disabled={isPending}
            className="px-4 py-2 bg-foreground text-background rounded-lg text-sm font-medium hover:bg-foreground/90 disabled:opacity-60 transition-colors"
          >
            {isPending ? 'Saving…' : mode === 'create' ? 'Create Post' : 'Save Changes'}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
