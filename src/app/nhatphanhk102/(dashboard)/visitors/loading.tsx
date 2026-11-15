import {
  AdminSkeletonPage,
  FilterBarSkeleton,
  PageHeaderSkeleton,
  StatCardsSkeleton,
  TableSkeleton,
} from '@/components/admin/AdminSkeletons';

export default function VisitorsLoading() {
  return (
    <AdminSkeletonPage>
      <PageHeaderSkeleton actions={0} titleWidth="w-36" />
      <StatCardsSkeleton count={4} className="grid-cols-2 md:grid-cols-4" caption={false} />
      <FilterBarSkeleton />
      <TableSkeleton
        columns={[
          { label: 'Khách', cell: 'avatar' },
          { label: 'Lý do', cell: 'text', hide: 'hidden md:table-cell' },
          { label: 'Ngày', cell: 'text', hide: 'hidden sm:table-cell' },
          { label: 'Thao tác', cell: 'actions', align: 'right' },
        ]}
      />
    </AdminSkeletonPage>
  );
}
