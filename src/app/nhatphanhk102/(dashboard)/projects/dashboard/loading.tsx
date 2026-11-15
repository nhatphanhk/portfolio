import {
  AdminSkeletonPage,
  BarRowsSkeleton,
  ColumnChartSkeleton,
  ListRowsSkeleton,
  PageHeaderSkeleton,
  PanelSkeleton,
  StatCardsSkeleton,
} from '@/components/admin/AdminSkeletons';

export default function ProjectStatsLoading() {
  return (
    <AdminSkeletonPage>
      <PageHeaderSkeleton titleWidth="w-44" />
      <StatCardsSkeleton count={6} className="grid-cols-2 md:grid-cols-3 lg:grid-cols-6" />

      <div className="grid md:grid-cols-2 gap-6">
        <PanelSkeleton titleWidth="w-36">
          <ColumnChartSkeleton />
        </PanelSkeleton>
        <PanelSkeleton titleWidth="w-40">
          <BarRowsSkeleton rows={6} />
        </PanelSkeleton>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <PanelSkeleton titleWidth="w-36" icon={false}>
          <BarRowsSkeleton rows={4} />
        </PanelSkeleton>
        <PanelSkeleton titleWidth="w-32">
          <ListRowsSkeleton rows={3} badge={false} />
        </PanelSkeleton>
      </div>

      <PanelSkeleton titleWidth="w-36" icon={false}>
        <ListRowsSkeleton rows={5} />
      </PanelSkeleton>
    </AdminSkeletonPage>
  );
}
