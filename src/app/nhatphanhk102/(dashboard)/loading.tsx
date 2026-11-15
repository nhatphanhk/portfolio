import { Skeleton } from '@/components/ui/skeleton';
import { ADMIN_PAGE_CLASS } from '@/components/admin/AdminPageHeader';

/**
 * Admin-only loading UI. Safe despite KNOWN_ISSUES #1: the only `notFound()` below this
 * segment is the blog editor, which sits behind auth and is never crawled, so a streamed
 * 404 answering with HTTP 200 (+ `noindex`) has no SEO cost there.
 */
export default function AdminLoading() {
  return (
    <main className={ADMIN_PAGE_CLASS} aria-busy="true" aria-label="Đang tải">
      <div className="space-y-2">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-72" />
      </div>
      <div className="flex flex-col sm:flex-row gap-3">
        <Skeleton className="h-9 flex-1 rounded-xl" />
        <Skeleton className="h-9 w-full sm:w-48 rounded-xl" />
      </div>
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <Skeleton className="h-11 w-full rounded-none" />
        <div className="divide-y divide-border">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="flex items-center gap-4 px-4 py-4">
              <Skeleton className="h-4 w-4 shrink-0" />
              <Skeleton className="h-4 flex-1" />
              <Skeleton className="h-4 w-20 hidden sm:block" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
