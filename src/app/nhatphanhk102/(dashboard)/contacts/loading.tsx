import {
  AdminSkeletonPage,
  FilterBarSkeleton,
  PageHeaderSkeleton,
  TableSkeleton,
} from '@/components/admin/AdminSkeletons';

export default function ContactsLoading() {
  return (
    <AdminSkeletonPage>
      <PageHeaderSkeleton actions={0} titleWidth="w-28" />
      <FilterBarSkeleton chips={1} />
      <TableSkeleton
        columns={[
          { label: 'Người gửi', cell: 'avatar' },
          { label: 'Nội dung', cell: 'text', hide: 'hidden md:table-cell' },
          { label: 'Ngày gửi', cell: 'text', hide: 'hidden sm:table-cell' },
          { label: 'Trạng thái', cell: 'badge' },
          { label: 'Thao tác', cell: 'actions', align: 'right' },
        ]}
      />
    </AdminSkeletonPage>
  );
}
