import { MainLayout } from '@/components';
import { notFound } from 'next/navigation';
import { auth } from '@/auth';
import { getPublicBlogBySlug, getBlogTranslations } from '@/lib/actions/blog';
import { getSeriesForBlog } from '@/lib/actions/series';
import { BlogPostDetailClient } from '@/components/blog/BlogPostDetailClient';
import { UserBreadcrumb } from '@/components/UserBreadcrumb';
import type { Metadata } from 'next';
import { buildOpenGraph } from '@/lib/constants';
import { getServerLocale } from '@/lib/i18n/server';

export const revalidate = 3600;

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const locale = await getServerLocale();
  const post = await getPublicBlogBySlug(slug, locale);

  if (!post) {
    return { title: 'Post Not Found' };
  }

  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `/blog/${slug}` },
    openGraph: buildOpenGraph({
      title: post.title,
      description: post.excerpt,
      path: `/blog/${slug}`,
      locale,
      type: 'article',
      images: post.thumbnailUrl ? [post.thumbnailUrl] : undefined,
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      authors: ['Phan Hoàng Nhật'],
    }),
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const locale = await getServerLocale();
  const post = await getPublicBlogBySlug(slug, locale);

  if (!post) notFound();

  // Fetch session, pre-saved translations, and series data in parallel
  const [session, translations, seriesData] = await Promise.all([
    auth(),
    getBlogTranslations(post.id),
    post.seriesId ? getSeriesForBlog(post.id, locale) : Promise.resolve(null),
  ]);

  const isAdmin = (session?.user as { role?: string } | undefined)?.role === 'ADMIN';

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 pt-32">
        {/* Breadcrumb aligned with Header */}
        <UserBreadcrumb
          items={[
            { label: 'Blogs', href: '/blog' },
            { label: post.title },
          ]}
          className="mb-8"
        />

        <BlogPostDetailClient
          post={post}
          seriesData={seriesData}
          isAdmin={isAdmin}
          initialTranslations={translations.map(t => ({
            locale: t.locale,
            title: t.title,
            excerpt: t.excerpt,
            content: t.content,
          }))}
        />
      </div>
    </MainLayout>
  );
}
