'use client';

import { useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { createCertification, updateCertification, type CertificationFormData } from '@/lib/actions/certification';

const schema = z.object({
  name: z.string().min(3).max(255),
  issuer: z.string().min(1).max(255),
  issueDate: z.string().min(1, 'Issue date required'),
  expiryDate: z.string().optional(),
  credentialId: z.string().max(255).optional(),
  credentialUrl: z.string().url().optional().or(z.literal('')),
  description: z.string().max(1000).optional(),
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
        toast.success(mode === 'create' ? 'Certification added!' : 'Certification updated!');
        reset();
        onOpenChange(false);
      } else {
        toast.error('Something went wrong.');
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? 'Add Certification' : 'Edit Certification'}</DialogTitle>
        </DialogHeader>

        <form id="cert-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          <div>
            <label className="block text-sm font-medium mb-1">Certification Name *</label>
            <input {...register('name')} placeholder="AWS Solutions Architect" className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            {errors.name && <p className="text-xs text-destructive mt-1">{errors.name.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Issuer *</label>
              <input {...register('issuer')} placeholder="Amazon Web Services" className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              {errors.issuer && <p className="text-xs text-destructive mt-1">{errors.issuer.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select {...register('status')} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                <option value="ACTIVE">Active</option>
                <option value="EXPIRED">Expired</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Issue Date *</label>
              <input type="date" {...register('issueDate')} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              {errors.issueDate && <p className="text-xs text-destructive mt-1">{errors.issueDate.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Expiry Date</label>
              <input type="date" {...register('expiryDate')} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Credential ID</label>
              <input {...register('credentialId')} placeholder="ABC123" className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Verify URL</label>
              <input {...register('credentialUrl')} placeholder="https://..." className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              {errors.credentialUrl && <p className="text-xs text-destructive mt-1">{errors.credentialUrl.message}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea {...register('description')} rows={3} placeholder="Brief description of the certification..." className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
          </div>
        </form>

        <DialogFooter>
          <button type="button" onClick={() => onOpenChange(false)} className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground">Cancel</button>
          <button type="submit" form="cert-form" disabled={isPending} className="px-4 py-2 bg-foreground text-background rounded-lg text-sm font-medium hover:bg-foreground/90 disabled:opacity-60 transition-colors">
            {isPending ? 'Saving…' : mode === 'create' ? 'Add Certification' : 'Save Changes'}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
