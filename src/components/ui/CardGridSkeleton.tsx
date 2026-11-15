import { Skeleton } from '@/components/ui/skeleton';

/**
 * Suspense fallback for the public list pages (search bar + card grid).
 * Used instead of a route `loading.tsx` — see docs/KNOWN_ISSUES.md #1.
 */
export function CardGridSkeleton({ cards = 6 }: { cards?: number }) {
  return (
    <div aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading…</span>
      <Skeleton className="h-11 w-full rounded-2xl mb-8" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: cards }, (_, i) => (
          <div key={i} className="rounded-2xl border border-border/70 p-6 space-y-4">
            <Skeleton className="h-40 w-full rounded-xl" />
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        ))}
      </div>
    </div>
  );
}
