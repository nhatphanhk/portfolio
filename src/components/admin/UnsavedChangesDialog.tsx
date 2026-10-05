'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { AlertTriangle } from 'lucide-react';

interface UnsavedChangesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirmLeave: () => void;
}

export function UnsavedChangesDialog({
  open,
  onOpenChange,
  onConfirmLeave,
}: UnsavedChangesDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 p-2.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <DialogTitle className="text-base font-bold text-foreground">
              Có thay đổi chưa lưu
            </DialogTitle>
          </div>
        </DialogHeader>

        <DialogDescription className="text-sm text-muted-foreground leading-relaxed pt-1">
          Nội dung bạn đang chỉnh sửa chưa được lưu lại. Nếu thoát khỏi trang lúc này, toàn bộ thay
          đổi vừa nhập sẽ bị mất vĩnh viễn. Bạn có chắc chắn muốn rời đi?
        </DialogDescription>

        <DialogFooter className="gap-2 sm:gap-0 pt-3">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="px-4 py-2 text-xs font-semibold rounded-lg border border-border text-foreground hover:bg-muted transition-colors cursor-pointer"
          >
            Tiếp tục chỉnh sửa
          </button>
          <button
            type="button"
            onClick={() => {
              onOpenChange(false);
              onConfirmLeave();
            }}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors cursor-pointer"
          >
            Rời khỏi (Không lưu)
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
