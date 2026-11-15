import { Skeleton } from '@/components/ui/skeleton';

const range = (n: number) => Array.from({ length: n }, (_, i) => i);

/** Toolbar + section sidebar + A4 canvas, as rendered by `AdminResumeClient`. */
export default function ResumeLoading() {
  return (
    <div
      className="h-full flex-1 flex flex-col min-h-0 overflow-hidden bg-muted/20"
      aria-busy="true"
      aria-live="polite"
    >
      <span className="sr-only">Đang tải hồ sơ…</span>

      {/* Toolbar */}
      <div
        className="w-full bg-card/95 border-b border-border shadow-2xs px-4 py-2.5 shrink-0"
        aria-hidden="true"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center flex-wrap gap-2.5">
            <Skeleton className="h-8 w-8 rounded-lg" />
            <Skeleton className="h-9 w-44 rounded-xl" />
            <Skeleton className="h-9 w-40 rounded-xl" />
          </div>
          <div className="flex items-center flex-wrap gap-2.5">
            <Skeleton className="hidden sm:block h-7 w-28 rounded-lg" />
            <Skeleton className="h-8 w-24 rounded-lg" />
            <Skeleton className="h-8 w-28 rounded-lg" />
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0 flex overflow-hidden" aria-hidden="true">
        {/* Section sidebar */}
        <aside className="w-72 sm:w-80 shrink-0 border-r border-border bg-card/95 flex flex-col h-full">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-7 w-7 rounded-lg" />
          </div>
          <div className="flex-1 overflow-hidden p-3 space-y-2">
            {range(8).map(i => (
              <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl border border-border/60">
                <Skeleton className="h-8 w-8 shrink-0 rounded-lg" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className={i % 2 ? 'h-4 w-20' : 'h-4 w-28'} />
                  <Skeleton className="h-3 w-12" />
                </div>
                <Skeleton className="h-6 w-6 shrink-0 rounded-md" />
              </div>
            ))}
          </div>
        </aside>

        {/* A4 canvas */}
        <div className="flex-1 overflow-hidden px-4 sm:px-8 py-6 flex flex-col items-center bg-muted/30">
          <div className="w-full max-w-5xl">
            <div className="mx-auto w-full max-w-[210mm] aspect-[210/297] bg-card rounded-sm border border-border shadow-md p-8 sm:p-12 space-y-8">
              <div className="flex flex-col items-center gap-2.5">
                <Skeleton className="h-8 w-56" />
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-72 max-w-full" />
              </div>
              {range(3).map(s => (
                <div key={s} className="space-y-3">
                  <Skeleton className="h-4 w-32" />
                  <div className="h-px bg-border" />
                  {range(2).map(e => (
                    <div key={e} className="space-y-2">
                      <div className="flex justify-between gap-4">
                        <Skeleton className="h-4 w-48" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-3 w-5/6" />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
