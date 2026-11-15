import {
  AdminSkeletonPage,
  FilterBarSkeleton,
  PageHeaderSkeleton,
  TableSkeleton,
} from '@/components/admin/AdminSkeletons';

export default function CertificationsLoading() {
  return (
    <AdminSkeletonPage>
      <PageHeaderSkeleton titleWidth="w-32" />
      <FilterBarSkeleton />
      <TableSkeleton
        columns={[
          { label: 'Chứng chỉ', cell: 'title' },
          { label: 'Thời gian', cell: 'text', hide: 'hidden sm:table-cell' },
          { label: 'Mã chứng chỉ', cell: 'text', hide: 'hidden md:table-cell' },
          { label: 'Trạng thái', cell: 'badge' },
          { label: 'Thao tác', cell: 'actions', align: 'right' },
        ]}
      />
    </AdminSkeletonPage>
  );
}
