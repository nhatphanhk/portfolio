import {
  AdminSkeletonPage,
  FilterBarSkeleton,
  PageHeaderSkeleton,
  TableSkeleton,
} from '@/components/admin/AdminSkeletons';

export default function BlogsLoading() {
  return (
    <AdminSkeletonPage>
      <PageHeaderSkeleton titleWidth="w-32" />
      <FilterBarSkeleton selects={1} chips={2} />
      <TableSkeleton
        columns={[
          { label: 'Tiêu đề & series', cell: 'title' },
          { label: 'Thẻ', cell: 'tags', hide: 'hidden md:table-cell' },
          { label: 'Ngày xuất bản', cell: 'text', hide: 'hidden sm:table-cell' },
          { label: 'Lượt xem', cell: 'text', hide: 'hidden lg:table-cell' },
          { label: 'Trạng thái', cell: 'badge' },
          { label: 'Thao tác', cell: 'actions', align: 'right' },
        ]}
      />
    </AdminSkeletonPage>
  );
}
