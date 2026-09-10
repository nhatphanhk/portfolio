'use client';

import { useCallback, useTransition } from 'react';
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
import { createSeries, updateSeries } from '@/lib/actions/series';

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

  const {
    register,
    handleSubmit,
    setValue,
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

  const onTitleBlur = useCallback(
    (e: React.FocusEvent<HTMLInputElement>) => {
      if (!initialData?.slug) {
        const slug = e.target.value
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '');
        setValue('slug', slug, { shouldValidate: true });
      }
    },
    [initialData?.slug, setValue]
  );

  const onSubmit = (data: FormData) => {
    startTransition(async () => {
      const finalSlug =
        data.slug?.trim() ||
        data.title
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '');

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
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground shadow-xs text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
            {errors.title && <p className="text-xs text-destructive mt-1">{errors.title.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Tags / Topics</label>
            <input
              {...register('tags')}
              placeholder="React, Next.js, Architecture (comma separated)"
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground shadow-xs text-sm focus:outline-none focus:ring-2 focus:ring-ring"
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
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground shadow-xs text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
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
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground shadow-xs text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
            {errors.coverUrl && (
              <p className="text-xs text-destructive mt-1">{errors.coverUrl.message}</p>
            )}
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
