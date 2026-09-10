import { MainLayout } from '@/components';
import { notFound } from 'next/navigation';
import { getPublicBlogBySlug, getBlogTranslations } from '@/lib/actions/blog';
import { BlogPostDetailClient } from '@/components/blog/BlogPostDetailClient';
import { UserBreadcrumb } from '@/components/UserBreadcrumb';
import type { Metadata } from 'next';

export const revalidate = 300;

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublicBlogBySlug(slug);

  if (!post) {
    return { title: 'Post Not Found' };
  }

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      publishedTime: post.publishedAt,
      authors: ['Phan Hoàng Nhật'],
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPublicBlogBySlug(slug);

  if (!post) notFound();

  // Fetch pre-saved translations from DB (0 ms wait on language switch!)
  const translations = await getBlogTranslations(post.id);

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
