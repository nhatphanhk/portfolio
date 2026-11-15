'use client';

import { useCallback, useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

type ActionResult = { ok: boolean; error?: string };

interface DeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  /** Server action (or any async op). The dialog toasts the result and refreshes the route on success. */
  onConfirm: () => Promise<ActionResult>;
  /** Toast shown on success. Callers own the wording, e.g. "Đã xóa bài viết." */
  successMessage?: string;
  confirmLabel?: string;
}

/** Confirmation for destructive server actions. All admin deletions go through this dialog. */
export function DeleteDialog({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
  successMessage = 'Đã xóa.',
  confirmLabel = 'Xóa',
}: DeleteDialogProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleDelete = () => {
    if (isPending) return;
    startTransition(async () => {
      try {
        const result = await onConfirm();
        if (result?.ok) {
          toast.success(successMessage);
          onOpenChange(false);
          router.refresh();
        } else {
          toast.error(`Không thể xóa: ${result?.error || 'Vui lòng thử lại.'}`);
        }
      } catch (err) {
        console.error('Delete error:', err);
        toast.error('Không thể xóa. Vui lòng thử lại.');
      }
    });
  };

  return (
    <ConfirmDialogView
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description ?? 'Thao tác này không thể hoàn tác. Mục này sẽ bị xóa vĩnh viễn.'}
      confirmLabel={isPending ? 'Đang xóa…' : confirmLabel}
      pending={isPending}
      onConfirm={handleDelete}
    />
  );
}

interface ConfirmDialogViewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  confirmLabel: string;
  cancelLabel?: string;
  pending?: boolean;
  onConfirm: () => void;
}

function ConfirmDialogView({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  cancelLabel = 'Hủy',
  pending = false,
  onConfirm,
}: ConfirmDialogViewProps) {
  return (
    <Dialog open={open} onOpenChange={o => !pending && onOpenChange(o)}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 p-2 rounded-full bg-destructive/10">
              <AlertTriangle className="h-5 w-5 text-destructive" aria-hidden="true" />
            </div>
            <DialogTitle>{title}</DialogTitle>
          </div>
        </DialogHeader>

        {description && (
          <DialogDescription className="text-sm text-muted-foreground">{description}</DialogDescription>
        )}

        <DialogFooter className="gap-2">
          <Button type="button" variant="outline" disabled={pending} onClick={() => onOpenChange(false)}>
            {cancelLabel}
          </Button>
          <Button type="button" variant="destructive" disabled={pending} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

type ConfirmOptions = {
  title: string;
  description?: string;
  confirmLabel?: string;
};

/**
 * Promise-based replacement for `window.confirm` that renders the same dialog as `DeleteDialog`.
 *
 * ```tsx
 * const { confirm, confirmDialog } = useConfirmDialog();
 * if (!(await confirm({ title: 'Xóa mục này?' }))) return;
 * // …render {confirmDialog} once in the component tree
 * ```
 */
export function useConfirmDialog() {
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const resolverRef = useRef<((value: boolean) => void) | null>(null);

  const settle = useCallback((value: boolean) => {
    resolverRef.current?.(value);
    resolverRef.current = null;
    setOptions(null);
  }, []);

  const confirm = useCallback((opts: ConfirmOptions) => {
    // A second request while one is open resolves the first as cancelled.
    resolverRef.current?.(false);
    setOptions(opts);
    return new Promise<boolean>(resolve => {
      resolverRef.current = resolve;
    });
  }, []);

  const confirmDialog = (
    <ConfirmDialogView
      open={options !== null}
      onOpenChange={o => !o && settle(false)}
      title={options?.title ?? ''}
      description={options?.description}
      confirmLabel={options?.confirmLabel ?? 'Xác nhận'}
      onConfirm={() => settle(true)}
    />
  );

  return { confirm, confirmDialog };
}
