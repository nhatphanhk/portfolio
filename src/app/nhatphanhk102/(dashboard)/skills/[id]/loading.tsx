import {
  AdminSkeletonPage,
  ListRowsSkeleton,
  PageHeaderSkeleton,
  PanelSkeleton,
} from '@/components/admin/AdminSkeletons';

export default function SkillDetailLoading() {
  return (
    <AdminSkeletonPage>
      <PageHeaderSkeleton actions={2} titleWidth="w-48" />
      <PanelSkeleton>
        <ListRowsSkeleton rows={4} />
      </PanelSkeleton>
    </AdminSkeletonPage>
  );
}
