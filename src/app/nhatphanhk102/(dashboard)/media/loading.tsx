import { Skeleton } from '@/components/ui/skeleton';
import { PaginationSkeleton } from '@/components/admin/AdminSkeletons';

export default function MediaLoading() {
  return (
    <main
      className="flex flex-1 gap-4 p-4 sm:p-6 overflow-hidden h-full max-w-7xl mx-auto w-full"
      aria-busy="true"
      aria-live="polite"
    >
      <span className="sr-only">Đang tải thư viện ảnh…</span>
      <div
        className="flex-1 flex flex-col rounded-xl border border-border bg-card shadow-xs overflow-hidden"
        aria-hidden="true"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-6 py-4 border-b border-border shrink-0">
          <div className="space-y-1.5">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-3 w-14" />
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 flex-1 sm:w-64 sm:flex-none rounded-lg" />
            <Skeleton className="h-8 w-24 shrink-0 rounded-lg" />
          </div>
        </div>
        <div className="flex-1 overflow-hidden p-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {Array.from({ length: 18 }, (_, i) => (
              <Skeleton key={i} className="aspect-square w-full rounded-xl" />
            ))}
          </div>
        </div>
        <PaginationSkeleton className="shrink-0" />
      </div>
    </main>
  );
}
