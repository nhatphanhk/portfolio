'use client';

import { useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { createSkill, updateSkill, type SkillFormData } from '@/lib/actions/skill';

const schema = z.object({
  name: z.string().min(1).max(100),
  category: z.enum([
    'FRONTEND', 'BACKEND', 'DEVOPS', 'TOOLS', 'OTHER', 
    'LANGUAGE', 'FRAMEWORK', 'DATABASE', 'CLOUD', 'IAC', 
    'MONITORING', 'VERSION_CONTROL'
  ]),
  level: z.number().int().min(1).max(5),
  iconUrl: z.string().url().optional().or(z.literal('')),
  order: z.number().int().min(0),
});

type FormData = z.infer<typeof schema>;

const CATEGORY_LABELS: Record<string, string> = {
  LANGUAGE: 'Language',
  FRAMEWORK: 'Framework',
  FRONTEND: 'Frontend',
  BACKEND: 'Backend',
  DATABASE: 'Database',
  CLOUD: 'Cloud',
  DEVOPS: 'DevOps',
  IAC: 'IaC',
  MONITORING: 'Monitoring',
  VERSION_CONTROL: 'Version Control',
  TOOLS: 'Tools',
  OTHER: 'Other',
};

const LEVEL_LABELS: Record<number, string> = {
  1: 'Beginner',
  2: 'Elementary',
  3: 'Intermediate',
  4: 'Advanced',
  5: 'Expert',
};

interface SkillDialogProps {
  mode: 'create' | 'edit';
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: Partial<FormData> & { id?: string };
}

export function SkillDialog({ mode, open, onOpenChange, initialData }: SkillDialogProps) {
  const [isPending, startTransition] = useTransition();

  const { register, handleSubmit, watch, formState: { errors }, reset } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: initialData?.name ?? '',
      category: initialData?.category ?? 'FRONTEND',
      level: initialData?.level ?? 3,
      iconUrl: initialData?.iconUrl ?? '',
      order: initialData?.order ?? 0,
    },
  });

  const level = watch('level');

  const onSubmit = (data: FormData) => {
    startTransition(async () => {
      const payload: SkillFormData = { ...data };
      const result = mode === 'create'
        ? await createSkill(payload)
        : await updateSkill(initialData!.id!, payload);

      if (result.ok) {
        toast.success(mode === 'create' ? 'Skill added!' : 'Skill updated!');
        reset();
        onOpenChange(false);
      } else {
        toast.error('Something went wrong.');
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? 'Add Skill' : 'Edit Skill'}</DialogTitle>
        </DialogHeader>

        <form id="skill-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          <div>
            <label className="block text-sm font-medium mb-1">Name *</label>
            <input {...register('name')} placeholder="React, TypeScript, Docker..." className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            {errors.name && <p className="text-xs text-destructive mt-1">{errors.name.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <select {...register('category')} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                {Object.entries(CATEGORY_LABELS).map(([val, label]) => (
                  <option key={val} value={val}>{label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Display Order</label>
              <input
              type="number"
              {...register('order', { valueAsNumber: true })}
              min={0}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
            </div>
          </div>

          {/* Level slider */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium">Proficiency Level</label>
              <span className="text-sm font-medium text-primary">{LEVEL_LABELS[Number(level)] ?? ''}</span>
            </div>
            <input
              type="range"
              {...register('level', { valueAsNumber: true })}
              min={1}
              max={5}
              step={1}
              className="w-full accent-foreground"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              {Object.values(LEVEL_LABELS).map(l => <span key={l}>{l.slice(0, 3)}</span>)}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Icon URL</label>
            <input {...register('iconUrl')} placeholder="https://..." className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            {errors.iconUrl && <p className="text-xs text-destructive mt-1">{errors.iconUrl.message}</p>}
          </div>
        </form>

        <DialogFooter>
          <button type="button" onClick={() => onOpenChange(false)} className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground">Cancel</button>
          <button type="submit" form="skill-form" disabled={isPending} className="px-4 py-2 bg-foreground text-background rounded-lg text-sm font-medium hover:bg-foreground/90 disabled:opacity-60 transition-colors">
            {isPending ? 'Saving…' : mode === 'create' ? 'Add Skill' : 'Save Changes'}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
