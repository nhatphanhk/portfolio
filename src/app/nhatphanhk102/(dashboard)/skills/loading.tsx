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
      <FilterBarSkeleton selects={2} chips={0} />
      <TableSkeleton
        columns={[
          { label: 'Tên', cell: 'title' },
          { label: 'Nhóm', cell: 'text', hide: 'hidden md:table-cell' },
          { label: 'Trạng thái', cell: 'badge' },
          { label: 'Năng lực · Bằng chứng · Nhật ký', cell: 'number', hide: 'hidden lg:table-cell' },
          { label: 'Thao tác', cell: 'actions', align: 'right' },
        ]}
      />
    </AdminSkeletonPage>
  );
}
