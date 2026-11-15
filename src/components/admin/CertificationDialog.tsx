'use client';

import { useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { createCertification, updateCertification, type CertificationFormData } from '@/lib/actions/certification';

const schema = z.object({
  name: z.string().min(3, 'Tên cần ít nhất 3 ký tự').max(255, 'Tên tối đa 255 ký tự'),
  issuer: z.string().min(1, 'Vui lòng nhập đơn vị cấp').max(255, 'Tối đa 255 ký tự'),
  issueDate: z.string().min(1, 'Vui lòng chọn ngày cấp'),
  expiryDate: z.string().optional(),
  credentialId: z.string().max(255, 'Tối đa 255 ký tự').optional(),
  credentialUrl: z.string().url('URL không hợp lệ').optional().or(z.literal('')),
  description: z.string().max(1000, 'Mô tả tối đa 1000 ký tự').optional(),
  status: z.enum(['ACTIVE', 'EXPIRED']),
});

type FormData = z.infer<typeof schema>;

interface CertDialogProps {
  mode: 'create' | 'edit';
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: Partial<FormData> & { id?: string };
}

export function CertificationDialog({ mode, open, onOpenChange, initialData }: CertDialogProps) {
  const [isPending, startTransition] = useTransition();

  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: initialData?.name ?? '',
      issuer: initialData?.issuer ?? '',
      issueDate: initialData?.issueDate ?? '',
      expiryDate: initialData?.expiryDate ?? '',
      credentialId: initialData?.credentialId ?? '',
      credentialUrl: initialData?.credentialUrl ?? '',
      description: initialData?.description ?? '',
      status: initialData?.status ?? 'ACTIVE',
    },
  });

  const onSubmit = (data: FormData) => {
    startTransition(async () => {
      const payload: CertificationFormData = { ...data };
      const result = mode === 'create'
        ? await createCertification(payload)
        : await updateCertification(initialData!.id!, payload);

      if (result.ok) {
        toast.success(mode === 'create' ? 'Đã thêm chứng chỉ.' : 'Đã lưu chứng chỉ.');
        reset();
        onOpenChange(false);
      } else {
        const err = (result as { error?: unknown }).error;
        toast.error(`Không thể lưu chứng chỉ: ${typeof err === 'string' ? err : 'Vui lòng thử lại.'}`);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? 'Thêm chứng chỉ' : 'Sửa chứng chỉ'}</DialogTitle>
        </DialogHeader>

        <form id="cert-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          <div>
            <label htmlFor="cert-name" className="block text-sm font-medium mb-1">Tên chứng chỉ *</label>
            <input id="cert-name" {...register('name')} placeholder="AWS Solutions Architect" className="w-full px-3 py-2 rounded-lg border border-border bg-card text-foreground shadow-xs text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            {errors.name && <p className="text-xs text-destructive mt-1">{errors.name.message}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="cert-issuer" className="block text-sm font-medium mb-1">Đơn vị cấp *</label>
              <input id="cert-issuer" {...register('issuer')} placeholder="Amazon Web Services" className="w-full px-3 py-2 rounded-lg border border-border bg-card text-foreground shadow-xs text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              {errors.issuer && <p className="text-xs text-destructive mt-1">{errors.issuer.message}</p>}
            </div>
            <div>
              <label htmlFor="cert-status" className="block text-sm font-medium mb-1">Trạng thái</label>
              <select id="cert-status" {...register('status')} className="w-full px-3 py-2 rounded-lg border border-border bg-card text-foreground shadow-xs text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                <option value="ACTIVE">Còn hiệu lực</option>
                <option value="EXPIRED">Hết hạn</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="cert-issue-date" className="block text-sm font-medium mb-1">Ngày cấp *</label>
              <input id="cert-issue-date" type="date" {...register('issueDate')} className="w-full px-3 py-2 rounded-lg border border-border bg-card text-foreground shadow-xs text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              {errors.issueDate && <p className="text-xs text-destructive mt-1">{errors.issueDate.message}</p>}
            </div>
            <div>
              <label htmlFor="cert-expiry-date" className="block text-sm font-medium mb-1">Ngày hết hạn</label>
              <input id="cert-expiry-date" type="date" {...register('expiryDate')} className="w-full px-3 py-2 rounded-lg border border-border bg-card text-foreground shadow-xs text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="cert-credential-id" className="block text-sm font-medium mb-1">Mã chứng chỉ</label>
              <input id="cert-credential-id" {...register('credentialId')} placeholder="ABC123" className="w-full px-3 py-2 rounded-lg border border-border bg-card text-foreground shadow-xs text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div>
              <label htmlFor="cert-credential-url" className="block text-sm font-medium mb-1">URL xác minh</label>
              <input id="cert-credential-url" {...register('credentialUrl')} placeholder="https://..." className="w-full px-3 py-2 rounded-lg border border-border bg-card text-foreground shadow-xs text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              {errors.credentialUrl && <p className="text-xs text-destructive mt-1">{errors.credentialUrl.message}</p>}
            </div>
          </div>

          <div>
            <label htmlFor="cert-description" className="block text-sm font-medium mb-1">Mô tả</label>
            <textarea id="cert-description" {...register('description')} rows={3} placeholder="Mô tả ngắn về chứng chỉ…" className="w-full px-3 py-2 rounded-lg border border-border bg-card text-foreground shadow-xs text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
          </div>
        </form>

        <DialogFooter>
          <button type="button" onClick={() => onOpenChange(false)} className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground">Hủy</button>
          <button type="submit" form="cert-form" disabled={isPending} className="px-4 py-2 bg-foreground text-background rounded-lg text-sm font-medium hover:bg-foreground/90 disabled:opacity-60 transition-colors">
            {isPending ? 'Đang lưu…' : mode === 'create' ? 'Thêm chứng chỉ' : 'Lưu thay đổi'}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
