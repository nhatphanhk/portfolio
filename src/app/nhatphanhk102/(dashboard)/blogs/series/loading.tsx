import {
  AdminSkeletonPage,
  FilterBarSkeleton,
  PageHeaderSkeleton,
  TableSkeleton,
} from '@/components/admin/AdminSkeletons';

export default function SeriesLoading() {
  return (
    <AdminSkeletonPage>
      <PageHeaderSkeleton titleWidth="w-36" />
      <FilterBarSkeleton />
      <TableSkeleton
        columns={[
          { label: 'Series', cell: 'title' },
          { label: 'Thẻ', cell: 'tags', hide: 'hidden md:table-cell' },
          { label: 'Số bài', cell: 'number', align: 'center' },
          { label: 'Thao tác', cell: 'actions', align: 'right' },
        ]}
      />
    </AdminSkeletonPage>
  );
}
