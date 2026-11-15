import {
  AdminSkeletonPage,
  FilterBarSkeleton,
  PageHeaderSkeleton,
  TableSkeleton,
} from '@/components/admin/AdminSkeletons';

export default function ProjectsLoading() {
  return (
    <AdminSkeletonPage>
      <PageHeaderSkeleton titleWidth="w-28" />
      <FilterBarSkeleton chips={2} />
      <TableSkeleton
        columns={[
          { label: 'Tên dự án', cell: 'title' },
          { label: 'Thẻ', cell: 'tags', hide: 'hidden md:table-cell' },
          { label: 'Trạng thái', cell: 'badge' },
          { label: 'Thao tác', cell: 'actions', align: 'right' },
        ]}
      />
    </AdminSkeletonPage>
  );
}
