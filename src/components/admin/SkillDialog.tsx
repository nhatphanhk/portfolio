'use client';

import { useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { createSkill, updateSkill } from '@/lib/actions/skill';
import {
  SKILL_CATEGORY_VALUES,
  SKILL_STATUS_VALUES,
  SKILL_CATEGORY_ADMIN_LABELS,
  SKILL_STATUS_ADMIN,
  WORK_SKILL_CATEGORIES,
  LIFE_SKILL_CATEGORIES,
} from '@/lib/skill-constants';

export { SKILL_CATEGORY_ADMIN_LABELS };

const schema = z.object({
  name: z.string().min(1, 'Vui lòng nhập tên kỹ năng').max(100, 'Tên tối đa 100 ký tự'),
  category: z.enum(SKILL_CATEGORY_VALUES),
  summary: z.string().max(500, 'Tối đa 500 ký tự').optional().or(z.literal('')),
  status: z.enum(SKILL_STATUS_VALUES),
  startedAt: z.string().optional().or(z.literal('')),
  achievedAt: z.string().optional().or(z.literal('')),
  featured: z.boolean(),
  iconUrl: z.string().url('URL không hợp lệ').optional().or(z.literal('')),
  order: z.number({ message: 'Vui lòng nhập số' }).int('Thứ tự phải là số nguyên'),
});

export type SkillDialogFormData = z.infer<typeof schema>;

interface SkillDialogProps {
  mode: 'create' | 'edit';
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: Partial<SkillDialogFormData> & { id?: string };
  /** After creating, jump to the detail page so capabilities/evidence can be added right away. */
  openDetailAfterCreate?: boolean;
}

const INPUT = 'w-full px-3 py-2 rounded-lg border border-border bg-card text-foreground shadow-xs text-sm focus:outline-none focus:ring-2 focus:ring-ring';

export function SkillDialog({ mode, open, onOpenChange, initialData, openDetailAfterCreate = true }: SkillDialogProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
  } = useForm<SkillDialogFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: initialData?.name ?? '',
      category: initialData?.category ?? 'FRONTEND',
      summary: initialData?.summary ?? '',
      status: initialData?.status ?? 'ACHIEVED',
      startedAt: initialData?.startedAt ?? '',
      achievedAt: initialData?.achievedAt ?? '',
      featured: initialData?.featured ?? false,
      iconUrl: initialData?.iconUrl ?? '',
      order: initialData?.order ?? 0,
    },
  });
  const status = watch('status');

  const onSubmit = (data: SkillDialogFormData) => {
    startTransition(async () => {
      const result =
        mode === 'create' ? await createSkill(data) : await updateSkill(initialData!.id!, data);

      if (result.ok) {
        toast.success(mode === 'create' ? 'Đã thêm kỹ năng.' : 'Đã lưu kỹ năng.');
        reset();
        onOpenChange(false);
        if (mode === 'create' && openDetailAfterCreate && result.id) {
          router.push(`/nhatphanhk102/skills/${result.id}`);
        } else {
          router.refresh();
        }
      } else {
        toast.error(`Không thể lưu kỹ năng: ${typeof result.error === 'string' ? result.error : 'Vui lòng kiểm tra lại dữ liệu.'}`);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? 'Thêm kỹ năng' : 'Sửa kỹ năng'}</DialogTitle>
        </DialogHeader>

        <form id="skill-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          <div>
            <label htmlFor="skill-name" className="block text-sm font-medium mb-1">Tên *</label>
            <input id="skill-name" {...register('name')} placeholder="React, Tiếng Nhật, Guitar, Nấu ăn..." className={INPUT} />
            {errors.name && <p className="text-xs text-destructive mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label htmlFor="skill-summary" className="block text-sm font-medium mb-1">Tóm tắt (làm được gì)</label>
            <textarea
              id="skill-summary"
              rows={2}
              {...register('summary')}
              placeholder="VD: Xây dựng SPA hoàn chỉnh với React + TypeScript"
              className={INPUT}
            />
            {errors.summary && <p className="text-xs text-destructive mt-1">{errors.summary.message}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="skill-category" className="block text-sm font-medium mb-1">Nhóm</label>
              <select id="skill-category" {...register('category')} className={INPUT}>
                <optgroup label="Công việc">
                  {WORK_SKILL_CATEGORIES.map(val => (
                    <option key={val} value={val}>{SKILL_CATEGORY_ADMIN_LABELS[val]}</option>
                  ))}
                </optgroup>
                <optgroup label="Ngoài công việc">
                  {LIFE_SKILL_CATEGORIES.map(val => (
                    <option key={val} value={val}>{SKILL_CATEGORY_ADMIN_LABELS[val]}</option>
                  ))}
                </optgroup>
              </select>
            </div>
            <div>
              <label htmlFor="skill-status" className="block text-sm font-medium mb-1">Trạng thái</label>
              <select id="skill-status" {...register('status')} className={INPUT}>
                {SKILL_STATUS_VALUES.map(val => (
                  <option key={val} value={val}>{SKILL_STATUS_ADMIN[val].label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="skill-started" className="block text-sm font-medium mb-1">Bắt đầu học</label>
              <input id="skill-started" type="date" {...register('startedAt')} className={INPUT} />
            </div>
            <div>
              <label htmlFor="skill-achieved" className="block text-sm font-medium mb-1">Làm được từ</label>
              <input
                id="skill-achieved"
                type="date"
                {...register('achievedAt')}
                disabled={status === 'LEARNING'}
                className={INPUT + ' disabled:opacity-50'}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="skill-order" className="block text-sm font-medium mb-1">Thứ tự hiển thị</label>
              <input id="skill-order" type="number" {...register('order', { valueAsNumber: true })} min={0} className={INPUT} />
              {errors.order && <p className="text-xs text-destructive mt-1">{errors.order.message}</p>}
            </div>
            <label className="flex items-center gap-2 text-sm font-medium sm:pt-6 cursor-pointer">
              <input type="checkbox" {...register('featured')} className="h-4 w-4 accent-primary" />
              Nổi bật
            </label>
          </div>

          <div>
            <label htmlFor="skill-icon" className="block text-sm font-medium mb-1">URL biểu tượng (không bắt buộc)</label>
            <input id="skill-icon" {...register('iconUrl')} placeholder="https://..." className={INPUT} />
            {errors.iconUrl && <p className="text-xs text-destructive mt-1">{errors.iconUrl.message}</p>}
          </div>
        </form>

        <DialogFooter>
          <button type="button" onClick={() => onOpenChange(false)} className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground">
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
