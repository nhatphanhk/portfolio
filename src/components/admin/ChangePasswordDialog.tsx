'use client';

import { useState, useTransition } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { KeyRound, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { changePassword } from '@/lib/actions/auth-settings';

const schema = z.object({
  currentPassword: z.string().min(1, 'Vui lòng nhập mật khẩu hiện tại'),
  // Matches the server-side minimum in changePassword()
  newPassword: z.string().min(8, 'Mật khẩu mới cần ít nhất 8 ký tự'),
  confirmPassword: z.string().min(1, 'Vui lòng nhập lại mật khẩu mới'),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: 'Mật khẩu nhập lại không khớp',
  path: ['confirmPassword'],
});

type FormData = z.infer<typeof schema>;

export function ChangePasswordDialog({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) {
  const [isPending, startTransition] = useTransition();
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = (data: FormData) => {
    startTransition(async () => {
      // Using FormData object for server action
      const fd = new FormData();
      fd.append('currentPassword', data.currentPassword);
      fd.append('newPassword', data.newPassword);
      
      const result = await changePassword(null, fd);
      
      if (result?.error) {
        toast.error(`Không thể đổi mật khẩu: ${result.error}`);
      } else if (result?.success) {
        toast.success('Đã đổi mật khẩu.');
        reset();
        onOpenChange(false);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={(val) => {
      if (!val) reset();
      onOpenChange(val);
    }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <KeyRound className="h-5 w-5 text-primary" aria-hidden="true" />
            Đổi mật khẩu
          </DialogTitle>
          <DialogDescription>
            Cập nhật mật khẩu tài khoản quản trị. Mật khẩu mới được mã hóa trước khi lưu.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div>
            <label htmlFor="pwd-current" className="block text-sm font-medium mb-1">Mật khẩu hiện tại</label>
            <div className="relative">
              <input
                id="pwd-current"
                type={showCurrent ? 'text' : 'password'}
                {...register('currentPassword')}
                autoComplete="current-password"
                className="w-full pl-3 pr-10 py-2 rounded-lg border border-border bg-card text-foreground shadow-xs text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <button type="button" aria-label={showCurrent ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'} onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {showCurrent ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
              </button>
            </div>
            {errors.currentPassword && <p className="text-xs text-destructive mt-1">{errors.currentPassword.message}</p>}
          </div>

          <div>
            <label htmlFor="pwd-new" className="block text-sm font-medium mb-1">Mật khẩu mới</label>
            <div className="relative">
              <input
                id="pwd-new"
                type={showNew ? 'text' : 'password'}
                {...register('newPassword')}
                autoComplete="new-password"
                className="w-full pl-3 pr-10 py-2 rounded-lg border border-border bg-card text-foreground shadow-xs text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <button type="button" aria-label={showNew ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'} onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {showNew ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
              </button>
            </div>
            {errors.newPassword && <p className="text-xs text-destructive mt-1">{errors.newPassword.message}</p>}
          </div>

          <div>
            <label htmlFor="pwd-confirm" className="block text-sm font-medium mb-1">Nhập lại mật khẩu mới</label>
            <input
              id="pwd-confirm"
              type={showNew ? 'text' : 'password'}
              {...register('confirmPassword')}
              autoComplete="new-password"
              className="w-full px-3 py-2 rounded-lg border border-border bg-card text-foreground shadow-xs text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
            {errors.confirmPassword && <p className="text-xs text-destructive mt-1">{errors.confirmPassword.message}</p>}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={() => {
                reset();
                onOpenChange(false);
              }}
              className="px-4 py-2 text-sm font-medium text-foreground bg-muted hover:bg-muted/80 rounded-lg transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-4 py-2 text-sm font-medium text-background bg-foreground hover:bg-foreground/90 disabled:opacity-50 rounded-lg transition-colors"
            >
              {isPending ? 'Đang lưu…' : 'Đổi mật khẩu'}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
