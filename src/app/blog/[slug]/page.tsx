import { MainLayout } from '@/components';
import { notFound } from 'next/navigation';
import { getPublicBlogBySlug } from '@/lib/actions/blog';
import { BlogContent } from '@/components/blog/BlogContent';
import { BlogOutline } from '@/components/blog/BlogOutline';
import { extractHeadings } from '@/lib/blog-utils';
import { Clock } from 'lucide-react';
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

  const headings = extractHeadings(post.content);

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 pt-32">
        {/* Breadcrumb aligned with Header */}
        <UserBreadcrumb
          items={[
            { label: 'Blog', href: '/blog' },
            { label: post.title },
          ]}
          className="mb-8"
        />

        <div className="flex flex-col lg:flex-row gap-10">
          <article className="flex-1 min-w-0 max-w-4xl">
            {/* Article header */}
            <header className="mb-10">
              <div className="flex flex-wrap gap-2 mb-4">
                {post.tags.map(tag => (
                  <span
                    key={tag}
                    className="px-2.5 py-0.5 text-xs bg-primary/10 text-primary rounded-full font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-foreground mb-3 leading-tight tracking-tight">
                {post.title}
              </h1>

              <p className="font-mono text-xs text-muted-foreground mb-4">
                Slug: <code className="text-foreground">{post.slug}</code>
              </p>

              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <time dateTime={post.publishedAt}>
                  {new Date(post.publishedAt).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </time>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {post.readTime}
                </span>
              </div>

              {post.excerpt && (
                <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
                  {post.excerpt}
                </p>
              )}
            </header>

            {/* Article content */}
            <BlogContent html={post.content} />
          </article>

          {/* Table of contents sidebar */}
          <aside className="hidden lg:block w-72 shrink-0">
            <div className="sticky top-28">
              <BlogOutline headings={headings} />
            </div>
          </aside>
        </div>
      </div>
    </MainLayout>
  );
}
