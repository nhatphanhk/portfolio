import { Suspense } from 'react';
import { MainLayout } from '@/components';
import { getPublicBlogs } from '@/lib/actions/blog';
import { getPublicSeries } from '@/lib/actions/series';
import { BlogListClient } from '@/components/blog/BlogListClient';
import { BlogHeaderClient } from '@/components/blog/BlogHeaderClient';
import { UserBreadcrumb } from '@/components/UserBreadcrumb';
import { CardGridSkeleton } from '@/components/ui/CardGridSkeleton';
import type { Metadata } from 'next';
import { buildOpenGraph } from '@/lib/constants';
import { getServerLocale } from '@/lib/i18n/server';

const BLOG_DESCRIPTION =
  'Articles on web development, TypeScript, React, Next.js, system design, and engineering best practices.';

export const metadata: Metadata = {
  title: 'Blogs',
  description: BLOG_DESCRIPTION,
  openGraph: buildOpenGraph({ title: 'Blogs', description: BLOG_DESCRIPTION, path: '/blog' }),
};

export const revalidate = 3600;

export default async function BlogPage() {
  const locale = await getServerLocale();
  const [posts, seriesList] = await Promise.all([getPublicBlogs(locale), getPublicSeries(locale)]);

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 pt-32">
        {/* Breadcrumb aligned with Header */}
        <UserBreadcrumb items={[{ label: 'Blogs' }]} className="mb-6" />

        <BlogHeaderClient />

        {/* Interactive Blog List with Search, Series & Tag Filter & Pagination */}
        <Suspense fallback={<CardGridSkeleton />}>
          <BlogListClient posts={posts} seriesList={seriesList} />
        </Suspense>
      </div>
    </MainLayout>
  );
}
