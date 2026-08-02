import { MainLayout } from '@/components';
import Link from 'next/link';
import { getPublicBlogs } from '@/lib/actions/blog';
import type { Metadata } from 'next';
import { ArrowRight, Clock } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Blog',
  description:
    'Articles on web development, TypeScript, React, Next.js, system design, and engineering best practices.',
};

export default async function BlogPage() {
  const posts = await getPublicBlogs();
  const tags = Array.from(new Set(posts.flatMap(p => p.tags)));
  const featured = posts[0];
  const rest = posts.slice(1);

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto px-6 py-24 pt-32">
        {/* Header */}
        <div className="mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Blog</h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Thoughts on web development, engineering practices, and lessons learned from building
            real-world applications.
          </p>
        </div>

        {/* Tag filter (display only — filtering would need client component) */}
        <div className="flex flex-wrap gap-2 mb-12">
          {tags.map(tag => (
            <span
              key={tag}
              className="px-3 py-1 text-xs bg-muted rounded-full text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Featured Post */}
        {featured && (
          <div className="mb-16">
            <Link href={`/blog/${featured.slug}`} className="group block">
              <article className="p-8 rounded-2xl border border-border bg-card hover:border-foreground/20 hover:shadow-md transition-all duration-200">
                <div className="flex flex-wrap gap-2 mb-4">
                  {featured.tags.map(tag => (
                    <span
                      key={tag}
                      className="px-2.5 py-0.5 text-xs bg-primary/10 text-primary rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
                  {featured.title}
                </h2>
                <p className="text-muted-foreground mb-6 leading-relaxed">{featured.excerpt}</p>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-4">
                    <span>
                      {new Date(featured.publishedAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {featured.readTime}
                    </span>
                  </div>
                  <span className="inline-flex items-center gap-1 text-foreground font-medium group-hover:gap-2 transition-all">
                    Read article <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
              </article>
            </Link>
          </div>
        )}

        {/* All Posts Grid */}
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-widest text-primary mb-8">
            All Posts
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {rest.map(post => (
              <Link key={post.id} href={`/blog/${post.slug}`} className="group block">
                <article className="h-full p-6 rounded-xl border border-border bg-card hover:border-foreground/20 hover:shadow-sm transition-all duration-200">
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {post.tags.slice(0, 2).map(tag => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 text-xs bg-muted rounded text-muted-foreground"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <h3 className="font-semibold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{post.excerpt}</p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>
                      {new Date(post.publishedAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {post.readTime}
                    </span>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
