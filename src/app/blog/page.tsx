import { MainLayout } from '@/components';
import { getPublicBlogs } from '@/lib/actions/blog';
import { getPublicSeries } from '@/lib/actions/series';
import { BlogListClient } from '@/components/blog/BlogListClient';
import { UserBreadcrumb } from '@/components/UserBreadcrumb';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blog',
  description:
    'Articles on web development, TypeScript, React, Next.js, system design, and engineering best practices.',
};

export const revalidate = 300;

export default async function BlogPage() {
  const [posts, seriesList] = await Promise.all([
    getPublicBlogs(),
    getPublicSeries(),
  ]);

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 pt-32">
        {/* Breadcrumb aligned with Header */}
        <UserBreadcrumb items={[{ label: 'Blog' }]} className="mb-6" />

        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 tracking-tight">Blog</h1>
          <p className="text-lg text-muted-foreground max-w-3xl">
            Thoughts on web development, engineering practices, and lessons learned from building
            real-world applications.
          </p>
        </div>

        {/* Interactive Blog List with Search, Tag Filter & Pagination */}
        <BlogListClient posts={posts} seriesList={seriesList} />
      </div>
    </MainLayout>
  );
}
