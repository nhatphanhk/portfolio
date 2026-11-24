import {
  AdminSkeletonPage,
  BarRowsSkeleton,
  ColumnChartSkeleton,
  PageHeaderSkeleton,
  PanelSkeleton,
  StatCardsSkeleton,
} from '@/components/admin/AdminSkeletons';

export default function AnalyticsLoading() {
  return (
    <AdminSkeletonPage>
      <PageHeaderSkeleton titleWidth="w-48" />
      <StatCardsSkeleton count={5} className="grid-cols-2 lg:grid-cols-5" />
      <PanelSkeleton titleWidth="w-52">
        <ColumnChartSkeleton />
      </PanelSkeleton>
      <div className="grid md:grid-cols-2 gap-6">
        {[0, 1, 2, 3].map(i => (
          <PanelSkeleton key={i} titleWidth="w-40">
            <BarRowsSkeleton rows={5} />
          </PanelSkeleton>
        ))}
      </div>
    </AdminSkeletonPage>
  );
}
