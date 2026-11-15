import {
  AdminSkeletonPage,
  ListRowsSkeleton,
  PageHeaderSkeleton,
  PanelSkeleton,
  StatCardsSkeleton,
} from '@/components/admin/AdminSkeletons';

/**
 * Loading UI for the admin overview, and the fallback for any admin route without its
 * own `loading.tsx`. Safe despite KNOWN_ISSUES #1: the only `notFound()` below this
 * segment is the blog editor, which sits behind auth and is never crawled, so a streamed
 * 404 answering with HTTP 200 (+ `noindex`) has no SEO cost there.
 */
export default function AdminLoading() {
  return (
    <AdminSkeletonPage>
      <PageHeaderSkeleton actions={0} titleWidth="w-32" />
      <StatCardsSkeleton count={6} className="grid-cols-2 md:grid-cols-3" padding="p-6" />
      <div className="grid md:grid-cols-2 gap-6">
        <PanelSkeleton titleWidth="w-32">
          <ListRowsSkeleton />
        </PanelSkeleton>
        <PanelSkeleton titleWidth="w-28">
          <ListRowsSkeleton />
        </PanelSkeleton>
      </div>
    </AdminSkeletonPage>
  );
}
