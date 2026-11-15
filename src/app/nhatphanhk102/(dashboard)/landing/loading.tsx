import { Skeleton } from '@/components/ui/skeleton';
import { AdminSkeletonPage, PageHeaderSkeleton } from '@/components/admin/AdminSkeletons';

/** Field layout per section card; `true` = full-width (multiline) field. */
const SECTIONS: boolean[][] = [
  [false, false, true, false],
  [true, false, false],
  [false, false, false, false],
];

export default function LandingLoading() {
  return (
    <AdminSkeletonPage>
      <PageHeaderSkeleton actions={2} titleWidth="w-56" />

      {/* Language tabs */}
      <div
        className="flex items-center justify-between p-1.5 rounded-2xl bg-muted/70 border border-border"
        aria-hidden="true"
      >
        <div className="flex items-center gap-1.5">
          <Skeleton className="h-9 w-44 rounded-xl bg-card" />
          <Skeleton className="h-9 w-44 rounded-xl" />
        </div>
        <Skeleton className="hidden sm:block h-4 w-52 mr-3" />
      </div>

      <div className="space-y-6" aria-hidden="true">
        {SECTIONS.map((fields, s) => (
          <div key={s} className="p-6 rounded-2xl border border-border bg-card shadow-xs">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-border/60">
              <div className="flex items-center gap-3">
                <Skeleton className="h-9 w-9 rounded-lg" />
                <div className="space-y-1.5">
                  <Skeleton className="h-5 w-36" />
                  <Skeleton className="h-3 w-52" />
                </div>
              </div>
              <Skeleton className="h-6 w-28 rounded-md" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {fields.map((wide, f) => (
                <div key={f} className={wide ? 'md:col-span-2 space-y-1.5' : 'space-y-1.5'}>
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className={wide ? 'h-16 w-full rounded-lg' : 'h-9.5 w-full rounded-lg'} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </AdminSkeletonPage>
  );
}
