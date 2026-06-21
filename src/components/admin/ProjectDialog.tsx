'use client';

import { useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { createProject, updateProject, type ProjectFormData } from '@/lib/actions/project';

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

  const { register, handleSubmit, setValue, formState: { errors }, reset } = useForm<FormData>({
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
              <input {...register('title')} onBlur={onTitleBlur} placeholder="My Project" className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              {errors.title && <p className="text-xs text-destructive mt-1">{errors.title.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Slug *</label>
              <input {...register('slug')} placeholder="my-project" className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              {errors.slug && <p className="text-xs text-destructive mt-1">{errors.slug.message}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea {...register('description')} rows={3} placeholder="Short description..." className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Content (Markdown)</label>
            <textarea {...register('content')} rows={8} placeholder="# Project Details&#10;&#10;Describe the project in detail..." className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring resize-y" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Demo URL</label>
              <input {...register('demoUrl')} placeholder="https://demo.example.com" className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              {errors.demoUrl && <p className="text-xs text-destructive mt-1">{errors.demoUrl.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Repo URL</label>
              <input {...register('repoUrl')} placeholder="https://github.com/..." className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              {errors.repoUrl && <p className="text-xs text-destructive mt-1">{errors.repoUrl.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Tags</label>
              <input {...register('tags')} placeholder="react, nextjs, typescript" className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              <p className="text-xs text-muted-foreground mt-0.5">Comma-separated</p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select {...register('status')} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring">
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
