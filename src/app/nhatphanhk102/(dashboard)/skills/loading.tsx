import {
  AdminSkeletonPage,
  FilterBarSkeleton,
  PageHeaderSkeleton,
  TableSkeleton,
} from '@/components/admin/AdminSkeletons';

export default function SkillsLoading() {
  return (
    <AdminSkeletonPage>
      <PageHeaderSkeleton titleWidth="w-28" />
      <FilterBarSkeleton />
      <TableSkeleton
        columns={[
          { label: 'Tên', cell: 'title' },
          { label: 'Nhóm', cell: 'text', hide: 'hidden md:table-cell' },
          { label: 'Thứ tự', cell: 'text' },
          { label: 'Thao tác', cell: 'actions', align: 'right' },
        ]}
      />
    </AdminSkeletonPage>
  );
}
