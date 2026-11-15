'use client'; // Error boundaries must be Client Components

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RotateCcw, LayoutDashboard } from 'lucide-react';

/**
 * Keeps admin errors inside the dashboard shell (sidebar + breadcrumb stay usable)
 * instead of falling through to the public root error page.
 */
export default function AdminError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex flex-1 items-center justify-center p-6">
      <div role="alert" className="text-center max-w-md">
        <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
          <AlertTriangle className="h-6 w-6 text-destructive" aria-hidden="true" />
        </div>
        <h1 className="text-xl font-bold text-foreground mb-2">Đã xảy ra lỗi</h1>
        <p className="text-sm text-muted-foreground mb-2">
          Không thể tải trang quản trị này. Hãy thử lại; nếu lỗi vẫn còn, kiểm tra log máy chủ.
        </p>
        {error.digest && (
          <p className="text-xs text-muted-foreground mb-6">
            Mã lỗi: <code className="font-mono">{error.digest}</code>
          </p>
        )}
        <div className="flex flex-col sm:flex-row gap-2 justify-center">
          <button
            type="button"
            onClick={() => retry()}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-foreground text-background rounded-lg text-sm font-medium hover:bg-foreground/90 transition-colors"
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Thử lại
          </button>
          <Link
            href="/nhatphanhk102"
            className="inline-flex items-center justify-center gap-2 px-4 py-2 border border-border rounded-lg text-sm font-medium text-foreground hover:bg-muted transition-colors"
          >
            <LayoutDashboard className="h-4 w-4" aria-hidden="true" />
            Về tổng quan
          </Link>
        </div>
      </div>
    </main>
  );
}
