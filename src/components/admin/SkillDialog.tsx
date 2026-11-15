'use client';

import { useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { createSkill, updateSkill, type SkillFormData } from '@/lib/actions/skill';

const schema = z.object({
  name: z.string().min(1, 'Vui lòng nhập tên kỹ năng').max(100, 'Tên tối đa 100 ký tự'),
  category: z.enum([
    'FRONTEND', 'BACKEND', 'DEVOPS', 'TOOLS', 'OTHER', 
    'LANGUAGE', 'FRAMEWORK', 'DATABASE', 'CLOUD', 'IAC', 
    'MONITORING', 'VERSION_CONTROL'
  ]),
  level: z.number().int().min(1).max(5),
  iconUrl: z.string().url('URL không hợp lệ').optional().or(z.literal('')),
  order: z.number({ message: 'Vui lòng nhập số' }).int('Thứ tự phải là số nguyên'),
});

type FormData = z.infer<typeof schema>;

export const SKILL_CATEGORY_ADMIN_LABELS: Record<string, string> = {
  LANGUAGE: 'Ngôn ngữ lập trình',
  FRAMEWORK: 'Framework',
  FRONTEND: 'Frontend',
  BACKEND: 'Backend',
  DATABASE: 'Cơ sở dữ liệu',
  CLOUD: 'Cloud',
  DEVOPS: 'DevOps',
  IAC: 'IaC',
  MONITORING: 'Giám sát',
  VERSION_CONTROL: 'Quản lý phiên bản',
  TOOLS: 'Công cụ',
  OTHER: 'Khác',
};

interface SkillDialogProps {
  mode: 'create' | 'edit';
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: Partial<FormData> & { id?: string };
}

export function SkillDialog({ mode, open, onOpenChange, initialData }: SkillDialogProps) {
  const [isPending, startTransition] = useTransition();

  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: initialData?.name ?? '',
      category: initialData?.category ?? 'FRONTEND',
      level: initialData?.level ?? 3,
      iconUrl: initialData?.iconUrl ?? '',
      order: initialData?.order ?? 0,
    },
  });

  const onSubmit = (data: FormData) => {
    startTransition(async () => {
      const payload: SkillFormData = { ...data };
      const result = mode === 'create'
        ? await createSkill(payload)
        : await updateSkill(initialData!.id!, payload);

      if (result.ok) {
        toast.success(mode === 'create' ? 'Đã thêm kỹ năng.' : 'Đã lưu kỹ năng.');
        reset();
        onOpenChange(false);
      } else {
        const err = (result as { error?: unknown }).error;
        toast.error(`Không thể lưu kỹ năng: ${typeof err === 'string' ? err : 'Vui lòng thử lại.'}`);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? 'Thêm kỹ năng' : 'Sửa kỹ năng'}</DialogTitle>
        </DialogHeader>

        <form id="skill-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          <div>
            <label htmlFor="skill-name" className="block text-sm font-medium mb-1">Tên *</label>
            <input
              id="skill-name"
              {...register('name')}
              placeholder="React, TypeScript, Docker..."
              className="w-full px-3 py-2 rounded-lg border border-border bg-card text-foreground shadow-xs text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
            {errors.name && <p className="text-xs text-destructive mt-1">{errors.name.message}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="skill-category" className="block text-sm font-medium mb-1">Nhóm</label>
              <select
                id="skill-category"
                {...register('category')}
                className="w-full px-3 py-2 rounded-lg border border-border bg-card text-foreground shadow-xs text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {Object.entries(SKILL_CATEGORY_ADMIN_LABELS).map(([val, label]) => (
                  <option key={val} value={val}>{label}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="skill-order" className="block text-sm font-medium mb-1">Thứ tự hiển thị</label>
              <input
                id="skill-order"
                type="number"
                {...register('order', { valueAsNumber: true })}
                min={0}
                className="w-full px-3 py-2 rounded-lg border border-border bg-card text-foreground shadow-xs text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
              {errors.order && <p className="text-xs text-destructive mt-1">{errors.order.message}</p>}
            </div>
          </div>

          <div>
            <label htmlFor="skill-level" className="block text-sm font-medium mb-1">Mức độ thành thạo (1–5)</label>
            <select
              id="skill-level"
              {...register('level', { valueAsNumber: true })}
              className="w-full px-3 py-2 rounded-lg border border-border bg-card text-foreground shadow-xs text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {[1, 2, 3, 4, 5].map(n => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="skill-icon" className="block text-sm font-medium mb-1">URL biểu tượng (không bắt buộc)</label>
            <input
              id="skill-icon"
              {...register('iconUrl')}
              placeholder="https://..."
              className="w-full px-3 py-2 rounded-lg border border-border bg-card text-foreground shadow-xs text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
            {errors.iconUrl && <p className="text-xs text-destructive mt-1">{errors.iconUrl.message}</p>}
          </div>
        </form>

        <DialogFooter>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground"
          >
            Hủy
          </button>
          <button
            type="submit"
            form="skill-form"
            disabled={isPending}
            className="px-4 py-2 bg-foreground text-background rounded-lg text-sm font-medium hover:bg-foreground/90 disabled:opacity-60 transition-colors"
          >
            {isPending ? 'Đang lưu…' : mode === 'create' ? 'Thêm kỹ năng' : 'Lưu thay đổi'}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
