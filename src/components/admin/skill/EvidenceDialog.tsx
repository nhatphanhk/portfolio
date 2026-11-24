'use client';

import { useRef, useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { FileText, Loader2, Upload, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { createEvidence, updateEvidence } from '@/lib/actions/skill';
import { uploadBlogImage } from '@/lib/upload';
import { EVIDENCE_TYPE_VALUES, EVIDENCE_TYPE_ADMIN_LABELS, type EvidenceTypeValue } from '@/lib/skill-constants';

const schema = z.object({
  type: z.enum(EVIDENCE_TYPE_VALUES),
  title: z.string().min(1, 'Vui lòng nhập tiêu đề').max(255, 'Tối đa 255 ký tự'),
  capabilityId: z.string().optional().or(z.literal('')),
  url: z
    .string()
    .regex(/^https?:\/\/\S+$/i, 'URL phải bắt đầu bằng http:// hoặc https://')
    .optional()
    .or(z.literal('')),
  fileUrl: z.string().optional().or(z.literal('')),
  provider: z.string().max(255).optional().or(z.literal('')),
  issuedAt: z.string().optional().or(z.literal('')),
  description: z.string().max(2000, 'Tối đa 2000 ký tự').optional().or(z.literal('')),
  certificationId: z.string().optional().or(z.literal('')),
});

export type EvidenceDialogData = z.infer<typeof schema> & { id?: string };

export interface CertificationOption {
  id: string;
  name: string;
  issuer: string;
  issueDate: string;
  credentialUrl: string | null;
}

const INPUT = 'w-full px-3 py-2 rounded-lg border border-border bg-card text-foreground shadow-xs text-sm focus:outline-none focus:ring-2 focus:ring-ring';

/** Which inputs each evidence type shows. */
const FIELDS: Record<EvidenceTypeValue, { url: boolean; file: boolean; provider: boolean; cert: boolean; urlLabel: string; providerLabel: string }> = {
  COURSE: { url: true, file: true, provider: true, cert: false, urlLabel: 'Link khóa học', providerLabel: 'Nền tảng / đơn vị (Coursera, Udemy…)' },
  CERTIFICATE: { url: true, file: true, provider: true, cert: true, urlLabel: 'Link xác minh', providerLabel: 'Đơn vị cấp' },
  IMAGE: { url: false, file: true, provider: false, cert: false, urlLabel: '', providerLabel: '' },
  LINK: { url: true, file: false, provider: true, cert: false, urlLabel: 'Đường dẫn', providerLabel: 'Nguồn (YouTube, GitHub…)' },
  DOCUMENT: { url: true, file: true, provider: true, cert: false, urlLabel: 'Hoặc link tài liệu', providerLabel: 'Nguồn' },
  PROJECT: { url: true, file: true, provider: false, cert: false, urlLabel: 'Link sản phẩm', providerLabel: '' },
};

interface EvidenceDialogProps {
  skillId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  capabilities: { id: string; statement: string }[];
  certifications: CertificationOption[];
  initialData?: EvidenceDialogData;
}

export function EvidenceDialog({ skillId, open, onOpenChange, capabilities, certifications, initialData }: EvidenceDialogProps) {
  const [isPending, startTransition] = useTransition();
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const isEdit = !!initialData?.id;

  const { register, handleSubmit, watch, setValue, formState: { errors }, reset } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      type: initialData?.type ?? 'COURSE',
      title: initialData?.title ?? '',
      capabilityId: initialData?.capabilityId ?? '',
      url: initialData?.url ?? '',
      fileUrl: initialData?.fileUrl ?? '',
      provider: initialData?.provider ?? '',
      issuedAt: initialData?.issuedAt ?? '',
      description: initialData?.description ?? '',
      certificationId: initialData?.certificationId ?? '',
    },
  });

  const type = watch('type');
  const fileUrl = watch('fileUrl');
  const fields = FIELDS[type];

  const pickCertification = (id: string) => {
    setValue('certificationId', id);
    const cert = certifications.find(c => c.id === id);
    if (!cert) return;
    // Pre-fill from the linked certificate; the admin can still override
    if (!watch('title')) setValue('title', cert.name);
    if (!watch('provider')) setValue('provider', cert.issuer);
    if (!watch('issuedAt')) setValue('issuedAt', cert.issueDate.slice(0, 10));
  };

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setUploading(true);
    try {
      const res = await uploadBlogImage(file, 'skill');
      setValue('fileUrl', res.url, { shouldDirty: true });
      if (!watch('title')) setValue('title', file.name.replace(/\.[^.]+$/, ''));
      toast.success('Đã tải tệp lên.');
    } catch (err) {
      toast.error(`Tải tệp thất bại: ${err instanceof Error ? err.message : 'Vui lòng thử lại.'}`);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const onSubmit = (data: z.infer<typeof schema>) => {
    // Drop values of inputs hidden for this type so they don't linger in the DB
    const payload = {
      ...data,
      url: fields.url ? data.url : '',
      fileUrl: fields.file ? data.fileUrl : '',
      provider: fields.provider ? data.provider : '',
      certificationId: fields.cert ? data.certificationId : '',
    };
    startTransition(async () => {
      const result = isEdit ? await updateEvidence(initialData!.id!, payload) : await createEvidence(skillId, payload);
      if (result.ok) {
        toast.success(isEdit ? 'Đã lưu bằng chứng.' : 'Đã thêm bằng chứng.');
        reset();
        onOpenChange(false);
        router.refresh();
      } else {
        const err = result.error;
        const msg =
          typeof err === 'string'
            ? err
            : Object.values(err ?? {}).flat().filter(Boolean)[0] ?? 'Vui lòng kiểm tra lại dữ liệu.';
        toast.error(`Không thể lưu bằng chứng: ${msg}`);
      }
    });
  };

  const isImage = !!fileUrl && /\.(jpe?g|png|gif|webp|avif)(\?|$)/i.test(fileUrl);

  return (
    <Dialog open={open} onOpenChange={o => !uploading && onOpenChange(o)}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Sửa bằng chứng' : 'Thêm bằng chứng'}</DialogTitle>
        </DialogHeader>

        <form id="evidence-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="ev-type" className="block text-sm font-medium mb-1">Loại</label>
              <select id="ev-type" {...register('type')} className={INPUT}>
                {EVIDENCE_TYPE_VALUES.map(v => (
                  <option key={v} value={v}>{EVIDENCE_TYPE_ADMIN_LABELS[v]}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="ev-cap" className="block text-sm font-medium mb-1">Chứng minh cho</label>
              <select id="ev-cap" {...register('capabilityId')} className={INPUT}>
                <option value="">Cả kỹ năng</option>
                {capabilities.map(c => (
                  <option key={c.id} value={c.id}>{c.statement}</option>
                ))}
              </select>
            </div>
          </div>

          {fields.cert && (
            <div>
              <label htmlFor="ev-cert" className="block text-sm font-medium mb-1">Chứng chỉ có sẵn</label>
              <select
                id="ev-cert"
                value={watch('certificationId') ?? ''}
                onChange={e => pickCertification(e.target.value)}
                className={INPUT}
              >
                <option value="">— Không liên kết —</option>
                {certifications.map(c => (
                  <option key={c.id} value={c.id}>{c.name} · {c.issuer}</option>
                ))}
              </select>
              {errors.certificationId && <p className="text-xs text-destructive mt-1">{errors.certificationId.message}</p>}
              {certifications.length === 0 && (
                <p className="text-xs text-muted-foreground mt-1">Chưa có chứng chỉ nào — thêm ở mục Chứng chỉ, hoặc nhập link/tệp bên dưới.</p>
              )}
            </div>
          )}

          <div>
            <label htmlFor="ev-title" className="block text-sm font-medium mb-1">Tiêu đề *</label>
            <input id="ev-title" {...register('title')} placeholder="VD: Hoàn thành khóa JLPT N3" className={INPUT} />
            {errors.title && <p className="text-xs text-destructive mt-1">{errors.title.message}</p>}
          </div>

          {fields.file && (
            <div>
              <span className="block text-sm font-medium mb-1">Tệp (ảnh hoặc PDF)</span>
              {fileUrl ? (
                <div className="flex items-center gap-3 p-2 rounded-lg border border-border bg-muted/30">
                  {isImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={fileUrl} alt="" className="h-14 w-14 rounded object-cover" />
                  ) : (
                    <FileText className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
                  )}
                  <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="flex-1 min-w-0 truncate text-xs text-primary hover:underline">
                    {fileUrl.split('/').pop()}
                  </a>
                  <button
                    type="button"
                    aria-label="Gỡ tệp"
                    onClick={() => setValue('fileUrl', '', { shouldDirty: true })}
                    className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-destructive"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  disabled={uploading}
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex items-center justify-center gap-2 py-4 rounded-lg border border-dashed border-border text-sm text-muted-foreground hover:border-primary/40 hover:text-foreground disabled:opacity-60"
                >
                  {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                  {uploading ? 'Đang tải lên…' : 'Chọn ảnh / PDF (tối đa 10MB ảnh, 15MB PDF)'}
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp,image/avif,application/pdf"
                className="hidden"
                onChange={e => handleFile(e.target.files?.[0])}
              />
              {errors.fileUrl && <p className="text-xs text-destructive mt-1">{errors.fileUrl.message}</p>}
            </div>
          )}

          {fields.url && (
            <div>
              <label htmlFor="ev-url" className="block text-sm font-medium mb-1">{fields.urlLabel}</label>
              <input id="ev-url" {...register('url')} placeholder="https://..." className={INPUT} />
              {errors.url && <p className="text-xs text-destructive mt-1">{errors.url.message}</p>}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {fields.provider && (
              <div>
                <label htmlFor="ev-provider" className="block text-sm font-medium mb-1">{fields.providerLabel}</label>
                <input id="ev-provider" {...register('provider')} className={INPUT} />
              </div>
            )}
            <div>
              <label htmlFor="ev-date" className="block text-sm font-medium mb-1">Ngày</label>
              <input id="ev-date" type="date" {...register('issuedAt')} className={INPUT} />
            </div>
          </div>

          <div>
            <label htmlFor="ev-desc" className="block text-sm font-medium mb-1">Ghi chú</label>
            <textarea id="ev-desc" rows={2} {...register('description')} className={INPUT} />
            {errors.description && <p className="text-xs text-destructive mt-1">{errors.description.message}</p>}
          </div>
        </form>

        <DialogFooter>
          <button type="button" onClick={() => onOpenChange(false)} disabled={uploading} className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground">
            Hủy
          </button>
          <button
            type="submit"
            form="evidence-form"
            disabled={isPending || uploading}
            className="px-4 py-2 bg-foreground text-background rounded-lg text-sm font-medium hover:bg-foreground/90 disabled:opacity-60 transition-colors"
          >
            {isPending ? 'Đang lưu…' : isEdit ? 'Lưu thay đổi' : 'Thêm bằng chứng'}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
