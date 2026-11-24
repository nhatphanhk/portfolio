'use client';

import { useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { createSkillLog, updateSkillLog } from '@/lib/actions/skill';

const schema = z.object({
  date: z.string().min(1, 'Chọn ngày'),
  title: z.string().min(1, 'Vui lòng nhập nội dung').max(255, 'Tối đa 255 ký tự'),
  note: z.string().max(2000, 'Tối đa 2000 ký tự').optional().or(z.literal('')),
  hours: z.number().min(0, 'Không âm').max(1000).optional().nullable(),
});

export type SkillLogDialogData = z.infer<typeof schema> & { id?: string };

const INPUT = 'w-full px-3 py-2 rounded-lg border border-border bg-card text-foreground shadow-xs text-sm focus:outline-none focus:ring-2 focus:ring-ring';

const today = () => new Date().toISOString().slice(0, 10);

interface SkillLogDialogProps {
  skillId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: SkillLogDialogData;
}

export function SkillLogDialog({ skillId, open, onOpenChange, initialData }: SkillLogDialogProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const isEdit = !!initialData?.id;

  const { register, handleSubmit, formState: { errors }, reset } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      date: initialData?.date ?? today(),
      title: initialData?.title ?? '',
      note: initialData?.note ?? '',
      hours: initialData?.hours ?? null,
    },
  });

  const onSubmit = (data: z.infer<typeof schema>) => {
    const payload = { ...data, hours: data.hours != null && !Number.isNaN(data.hours) ? data.hours : null };
    startTransition(async () => {
      const result = isEdit ? await updateSkillLog(initialData!.id!, payload) : await createSkillLog(skillId, payload);
      if (result.ok) {
        toast.success(isEdit ? 'Đã lưu nhật ký.' : 'Đã ghi nhật ký học.');
        reset({ date: today(), title: '', note: '', hours: null });
        onOpenChange(false);
        router.refresh();
      } else {
        toast.error('Không thể lưu nhật ký. Vui lòng kiểm tra lại.');
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Sửa nhật ký học' : 'Ghi nhật ký học'}</DialogTitle>
        </DialogHeader>
        <form id="skill-log-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="log-date" className="block text-sm font-medium mb-1">Ngày *</label>
              <input id="log-date" type="date" {...register('date')} className={INPUT} />
              {errors.date && <p className="text-xs text-destructive mt-1">{errors.date.message}</p>}
            </div>
            <div>
              <label htmlFor="log-hours" className="block text-sm font-medium mb-1">Số giờ</label>
              <input
                id="log-hours"
                type="number"
                step="0.25"
                min={0}
                {...register('hours', { setValueAs: v => (v === '' || v == null ? null : Number(v)) })}
                className={INPUT}
              />
              {errors.hours && <p className="text-xs text-destructive mt-1">{errors.hours.message}</p>}
            </div>
          </div>
          <div>
            <label htmlFor="log-title" className="block text-sm font-medium mb-1">Đã học / luyện gì? *</label>
            <input id="log-title" {...register('title')} placeholder="VD: Hoàn thành chương 3 — Hooks nâng cao" className={INPUT} />
            {errors.title && <p className="text-xs text-destructive mt-1">{errors.title.message}</p>}
          </div>
          <div>
            <label htmlFor="log-note" className="block text-sm font-medium mb-1">Ghi chú / bài học rút ra</label>
            <textarea id="log-note" rows={3} {...register('note')} className={INPUT} />
            {errors.note && <p className="text-xs text-destructive mt-1">{errors.note.message}</p>}
          </div>
        </form>
        <DialogFooter>
          <button type="button" onClick={() => onOpenChange(false)} className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground">
            Hủy
          </button>
          <button
            type="submit"
            form="skill-log-form"
            disabled={isPending}
            className="px-4 py-2 bg-foreground text-background rounded-lg text-sm font-medium hover:bg-foreground/90 disabled:opacity-60 transition-colors"
          >
            {isPending ? 'Đang lưu…' : isEdit ? 'Lưu thay đổi' : 'Ghi nhật ký'}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
