import { notFound } from 'next/navigation';
import MainLayout from '@/components/MainLayout';
import { getBlogPostBySlug, getAllBlogPosts } from '@/types/BlogData';
import Link from 'next/link';

// Define the params type for TypeScript
interface BlogPostPageProps {
  params: Promise<{
    slug: string;
  }>;
}

// Generate static paths for all blog posts
export async function generateStaticParams() {
  const posts = getAllBlogPosts();
  return posts.map(post => ({
    slug: post.slug,
  }));
}

// Generate metadata for SEO
export async function generateMetadata({ params }: BlogPostPageProps) {
  const resolvedParams = await params;
  const post = getBlogPostBySlug(resolvedParams.slug);

  if (!post) {
    return {
      title: 'Post Not Found',
    };
  }

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      publishedTime: post.date,
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const resolvedParams = await params;
  const post = getBlogPostBySlug(resolvedParams.slug);

  if (!post) {
    notFound();
  }

  return (
    <MainLayout>
      {/* Main Content */}
      <article className=" max-w-7xl flex-1 col-span-9 min-w-0 py-6">
        <header className="mb-8">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4 transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Blog
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {post.title}
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-6">
            <time dateTime={post.date}>
              {new Date(post.date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </time>
            <span>•</span>
            <span>{post.readTime}</span>
            <span>•</span>
            <div className="flex gap-2">
              {post.tags.map(tag => (
                <span
                  key={tag}
                  className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-xs"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
            {post.excerpt}
          </p>
        </header>

        <div
          className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-bold prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-code:text-sm prose-pre:bg-gray-100 dark:prose-pre:bg-gray-800"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </article>

      {/* Navigation Sidebar - Right Side */}
      <aside className="hidden col-span-3 lg:block w-64 shrink-0 py-4">
        <nav className="sticky top-8 space-y-6">
          <div>
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
              Table of Contents
            </h2>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              {/* Add dynamic TOC based on post headings */}
            </ul>
          </div>
          <div>
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
              Related Posts
            </h2>
            <ul className="space-y-2 text-sm">{/* Add related posts */}</ul>
          </div>
        </nav>
      </aside>
    </MainLayout>
  );
}
