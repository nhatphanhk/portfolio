'use client';

import { useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { createCapability, updateCapability } from '@/lib/actions/skill';

const schema = z.object({
  statement: z.string().min(1, 'Vui lòng mô tả việc làm được').max(300, 'Tối đa 300 ký tự'),
  description: z.string().max(2000, 'Tối đa 2000 ký tự').optional().or(z.literal('')),
  achievedAt: z.string().optional().or(z.literal('')),
});

export type CapabilityDialogData = z.infer<typeof schema> & { id?: string };

const INPUT = 'w-full px-3 py-2 rounded-lg border border-border bg-card text-foreground shadow-xs text-sm focus:outline-none focus:ring-2 focus:ring-ring';

interface CapabilityDialogProps {
  skillId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: CapabilityDialogData;
}

export function CapabilityDialog({ skillId, open, onOpenChange, initialData }: CapabilityDialogProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const isEdit = !!initialData?.id;

  const { register, handleSubmit, formState: { errors }, reset } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      statement: initialData?.statement ?? '',
      description: initialData?.description ?? '',
      achievedAt: initialData?.achievedAt ?? '',
    },
  });

  const onSubmit = (data: z.infer<typeof schema>) => {
    startTransition(async () => {
      const result = isEdit ? await updateCapability(initialData!.id!, data) : await createCapability(skillId, data);
      if (result.ok) {
        toast.success(isEdit ? 'Đã lưu năng lực.' : 'Đã thêm năng lực.');
        reset();
        onOpenChange(false);
        router.refresh();
      } else {
        toast.error('Không thể lưu năng lực. Vui lòng kiểm tra lại.');
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Sửa năng lực' : 'Thêm năng lực'}</DialogTitle>
        </DialogHeader>
        <form id="capability-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          <div>
            <label htmlFor="cap-statement" className="block text-sm font-medium mb-1">Làm được gì? *</label>
            <input
              id="cap-statement"
              {...register('statement')}
              placeholder="VD: Giao tiếp tiếng Nhật trong cuộc họp hằng ngày"
              className={INPUT}
            />
            {errors.statement && <p className="text-xs text-destructive mt-1">{errors.statement.message}</p>}
          </div>
          <div>
            <label htmlFor="cap-desc" className="block text-sm font-medium mb-1">Chi tiết (không bắt buộc)</label>
            <textarea id="cap-desc" rows={3} {...register('description')} className={INPUT} />
            {errors.description && <p className="text-xs text-destructive mt-1">{errors.description.message}</p>}
          </div>
          <div>
            <label htmlFor="cap-date" className="block text-sm font-medium mb-1">Làm được từ ngày</label>
            <input id="cap-date" type="date" {...register('achievedAt')} className={INPUT} />
          </div>
        </form>
        <DialogFooter>
          <button type="button" onClick={() => onOpenChange(false)} className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground">
            Hủy
          </button>
          <button
            type="submit"
            form="capability-form"
            disabled={isPending}
            className="px-4 py-2 bg-foreground text-background rounded-lg text-sm font-medium hover:bg-foreground/90 disabled:opacity-60 transition-colors"
          >
            {isPending ? 'Đang lưu…' : isEdit ? 'Lưu thay đổi' : 'Thêm năng lực'}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
