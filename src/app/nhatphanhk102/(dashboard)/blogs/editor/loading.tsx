import { Skeleton } from '@/components/ui/skeleton';

/**
 * Shared by `editor/[id]` and `editor/new`. It sits above `[id]/layout.tsx`, so it brings
 * its own full-height container instead of relying on that layout.
 */
export default function EditorLoading() {
  return (
    <div
      className="flex flex-col lg:flex-row flex-1 min-h-0 overflow-hidden bg-background"
      aria-busy="true"
      aria-live="polite"
    >
      <span className="sr-only">Đang tải trình soạn thảo…</span>

      {/* Meta sidebar */}
      <aside
        className="w-full lg:w-80 shrink-0 max-h-[45vh] lg:max-h-none border-b lg:border-b-0 lg:border-r border-border flex flex-col overflow-hidden bg-card shadow-xs"
        aria-hidden="true"
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>

        <div className="flex-1">
          {/* "Document" section, open */}
          <div className="border-b border-border">
            <div className="flex items-center justify-between px-4 py-3">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3.5 w-3.5 rounded" />
            </div>
            <div className="px-4 pb-4 space-y-3">
              {['w-10', 'w-8', 'w-28'].map((w, i) => (
                <div key={w} className="space-y-1.5">
                  <Skeleton className={`h-3 ${w}`} />
                  <Skeleton className={i === 2 ? 'h-20 w-full rounded-lg' : 'h-9 w-full rounded-lg'} />
                </div>
              ))}
            </div>
          </div>
          {/* Collapsed sections: Tags, Thumbnail, Settings */}
          {['w-14', 'w-24', 'w-20'].map(w => (
            <div key={w} className="flex items-center justify-between px-4 py-3 border-b border-border">
              <Skeleton className={`h-4 ${w}`} />
              <Skeleton className="h-3.5 w-3.5 rounded" />
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-border space-y-2">
          <Skeleton className="h-10 w-full rounded-lg" />
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
      </aside>

      {/* Writing area */}
      <main className="flex-1 flex flex-col overflow-hidden bg-muted/40" aria-hidden="true">
        <div className="flex items-center justify-between px-6 py-3 border-b border-border bg-card shrink-0 shadow-2xs">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-4 w-20" />
        </div>
        <div className="flex-1 overflow-hidden p-6 lg:p-10">
          <div className="max-w-4xl mx-auto rounded-2xl border border-border/80 bg-card overflow-hidden shadow-lg shadow-slate-900/5">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-1 p-2 border-b border-border bg-muted/30">
              {Array.from({ length: 14 }, (_, i) => (
                <Skeleton key={i} className={i % 5 === 4 ? 'h-7 w-px mx-1' : 'h-7 w-7 rounded-md'} />
              ))}
            </div>
            {/* Document body */}
            <div className="p-6 sm:p-8 space-y-4">
              <Skeleton className="h-8 w-2/3" />
              {['w-full', 'w-11/12', 'w-4/5', 'w-full', 'w-3/4'].map((w, i) => (
                <Skeleton key={i} className={`h-4 ${w}`} />
              ))}
              <Skeleton className="h-32 w-full rounded-xl" />
              {['w-full', 'w-5/6', 'w-2/3'].map((w, i) => (
                <Skeleton key={i} className={`h-4 ${w}`} />
              ))}
            </div>
            <div className="flex items-center justify-between gap-3 px-4 py-2 border-t border-border/60 bg-muted/30">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
