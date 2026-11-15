import { Skeleton } from '@/components/ui/skeleton';
import {
  AdminSkeletonPage,
  BarRowsSkeleton,
  ColumnChartSkeleton,
  ListRowsSkeleton,
  PageHeaderSkeleton,
  PanelSkeleton,
  StatCardsSkeleton,
  TableSkeleton,
} from '@/components/admin/AdminSkeletons';

export default function BlogStatsLoading() {
  return (
    <AdminSkeletonPage>
      <PageHeaderSkeleton titleWidth="w-48" />
      <StatCardsSkeleton count={5} className="grid-cols-2 md:grid-cols-3 lg:grid-cols-5" />

      {/* Top viewed posts */}
      <PanelSkeleton titleWidth="w-56">
        <div className="space-y-3.5">
          {Array.from({ length: 5 }, (_, i) => (
            <div key={i} className="p-3.5 rounded-lg border border-border/80 space-y-2">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 flex-1 min-w-0">
                  <Skeleton className="h-6 w-6 shrink-0 rounded-full" />
                  <Skeleton className={i % 2 ? 'h-4 w-1/2' : 'h-4 w-2/3'} />
                </div>
                <Skeleton className="h-6 w-28 shrink-0 rounded-md" />
              </div>
              <Skeleton className="h-2 w-full rounded-full" />
            </div>
          ))}
        </div>
      </PanelSkeleton>

      <div className="grid md:grid-cols-2 gap-6">
        <PanelSkeleton titleWidth="w-44">
          <ColumnChartSkeleton />
        </PanelSkeleton>
        <PanelSkeleton titleWidth="w-32">
          <BarRowsSkeleton rows={6} />
        </PanelSkeleton>
      </div>

      <TableSkeleton
        rows={5}
        columns={[
          { label: '#', cell: 'text' },
          { label: 'Bài viết', cell: 'title' },
          { label: 'Trạng thái', cell: 'badge' },
          { label: 'Lượt xem (Unique)', cell: 'text' },
          { label: '% Đóng góp', cell: 'text' },
          { label: 'Ngày đăng', cell: 'text', hide: 'hidden md:table-cell' },
          { label: 'Hành động', cell: 'actions', align: 'right' },
        ]}
      />

      <div className="grid md:grid-cols-2 gap-6">
        <PanelSkeleton titleWidth="w-36" icon={false}>
          <BarRowsSkeleton rows={3} />
        </PanelSkeleton>
        <PanelSkeleton titleWidth="w-40" icon={false}>
          <ListRowsSkeleton rows={4} />
        </PanelSkeleton>
      </div>
    </AdminSkeletonPage>
  );
}
