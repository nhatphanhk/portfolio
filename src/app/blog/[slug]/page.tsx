import { notFound } from 'next/navigation';
import { MainLayout } from '@/components';
import { getPublicBlogBySlug, getPublicBlogs } from '@/lib/actions/blog';
import Link from 'next/link';
import { ArrowLeft, Clock } from 'lucide-react';
import type { Metadata } from 'next';
import { BlogContent, extractHeadings } from '@/components/blog/BlogContent';
import { BlogOutline } from '@/components/blog/BlogOutline';
import { SeriesNav } from '@/components/blog/SeriesNav';

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

// Force per-request rendering: with static params, Next.js caches unmatched
// slugs from notFound() with a 200 status instead of 404.
export const dynamic = 'force-dynamic';

export async function generateStaticParams() {
  try {
    const posts = await getPublicBlogs();
    return posts.map(post => ({ slug: post.slug }));
  } catch (error) {
    console.error('Error generating static params for blogs:', error);
    return [];
  }
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublicBlogBySlug(slug);

  if (!post) return { title: 'Post Not Found' };

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      publishedTime: post.publishedAt,
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await getPublicBlogBySlug(slug);

  if (!post) notFound();

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto px-6 py-24 pt-32">
        {/* Back link */}
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-10 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Blog
        </Link>

        <div className="flex gap-8">
          <article className="flex-1 min-w-0">
            {/* Article header */}
            <header className="mb-10">
              <div className="flex flex-wrap gap-2 mb-4">
                {post.tags.map(tag => (
                  <span
                    key={tag}
                    className="px-2.5 py-0.5 text-xs bg-primary/10 text-primary rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4 leading-tight">
                {post.title}
              </h1>

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <time dateTime={post.publishedAt}>
                  {new Date(post.publishedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </time>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {post.readTime}
                </span>
              </div>

              <p className="mt-6 text-lg text-muted-foreground leading-relaxed">{post.excerpt}</p>
            </header>

            {/* Divider */}
            <hr className="border-border mb-10" />

            {/* Content */}
            <BlogContent html={post.content} />

            {/* Series Navigation */}
            <SeriesNav blogId={post.id} />
          </article>
          
          <aside className="hidden lg:block w-64 shrink-0">
            <BlogOutline headings={extractHeadings(post.content)} />
          </aside>
        </div>

        {/* Footer nav */}
        <div className="mt-16 pt-8 border-t border-border">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            All Posts
          </Link>
        </div>
      </div>
    </MainLayout>
  );
}
