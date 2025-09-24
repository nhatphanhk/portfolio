import { MainLayout } from '@/components';
import Link from 'next/link';

// Sample blog posts data (this would typically come from a CMS or database)
const blogPosts = [
  {
    id: '1',
    title: 'Getting Started with Next.js 15 and TypeScript',
    slug: 'getting-started-nextjs-typescript',
    excerpt:
      'Learn how to build modern web applications with the latest Next.js features and TypeScript.',
    publishedAt: '2025-01-15',
    readTime: '8 min read',
    tags: ['Next.js', 'TypeScript', 'React'],
  },
  {
    id: '2',
    title: 'Mastering Tailwind CSS for Modern UI Design',
    slug: 'mastering-tailwind-css-ui-design',
    excerpt:
      'Discover advanced Tailwind CSS techniques for creating beautiful and responsive user interfaces.',
    publishedAt: '2025-01-10',
    readTime: '6 min read',
    tags: ['Tailwind CSS', 'CSS', 'UI Design'],
  },
  {
    id: '3',
    title: 'Building Scalable React Applications',
    slug: 'building-scalable-react-applications',
    excerpt:
      'Learn architectural patterns and best practices for building large-scale React applications.',
    publishedAt: '2025-01-05',
    readTime: '10 min read',
    tags: ['React', 'JavaScript', 'Architecture'],
  },
  {
    id: '4',
    title: 'Modern JavaScript ES2024 Features',
    slug: 'modern-javascript-es2024-features',
    excerpt:
      'Explore the latest JavaScript features and how they can improve your development workflow.',
    publishedAt: '2024-12-28',
    readTime: '7 min read',
    tags: ['JavaScript', 'ES2024', 'Web Development'],
  },
  {
    id: '5',
    title: 'Understanding Server Components in Next.js',
    slug: 'understanding-server-components-nextjs',
    excerpt:
      'Deep dive into React Server Components and how they work in Next.js applications.',
    publishedAt: '2024-12-20',
    readTime: '12 min read',
    tags: ['Next.js', 'React', 'Server Components'],
  },
  {
    id: '6',
    title: 'CSS Grid vs Flexbox: When to Use Which',
    slug: 'css-grid-vs-flexbox-when-to-use',
    excerpt:
      'A comprehensive comparison of CSS Grid and Flexbox with practical examples and use cases.',
    publishedAt: '2024-12-15',
    readTime: '9 min read',
    tags: ['CSS', 'Layout', 'Web Development'],
  },
];

export default function BlogPage() {
  return (
    <MainLayout>
      <div className="col-span-full">
        <div className="py-12">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Blog
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Welcome to my blog where I share insights about web development,
              technology trends, and programming best practices.
            </p>
          </div>

          {/* Featured Post */}
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
              Featured Post
            </h2>
            <Link href={`/blog/${blogPosts[0].slug}`} className="block group">
              <article className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="md:flex">
                  <div className="md:w-1/2">
                    <div className="h-64 md:h-full bg-gradient-to-br from-blue-500 to-purple-600"></div>
                  </div>
                  <div className="md:w-1/2 p-8">
                    <div className="flex flex-wrap gap-2 mb-4">
                      {blogPosts[0].tags.map(tag => (
                        <span
                          key={tag}
                          className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {blogPosts[0].title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6 line-clamp-3">
                      {blogPosts[0].excerpt}
                    </p>
                    <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                      <span>
                        {new Date(blogPosts[0].publishedAt).toLocaleDateString(
                          'en-US',
                          {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          }
                        )}
                      </span>
                      <span>{blogPosts[0].readTime}</span>
                    </div>
                  </div>
                </div>
              </article>
            </Link>
          </div>

          {/* All Posts Grid */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
              All Posts
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {blogPosts.map(post => (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className="block group"
                >
                  <article className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                    <div className="h-48 bg-gradient-to-br from-blue-500 to-purple-600"></div>
                    <div className="p-6">
                      <div className="flex flex-wrap gap-2 mb-3">
                        {post.tags.slice(0, 2).map(tag => (
                          <span
                            key={tag}
                            className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                        {post.tags.length > 2 && (
                          <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded-full">
                            +{post.tags.length - 2}
                          </span>
                        )}
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                        {post.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                        {post.excerpt}
                      </p>
                      <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                        <span>
                          {new Date(post.publishedAt).toLocaleDateString(
                            'en-US',
                            {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            }
                          )}
                        </span>
                        <span>{post.readTime}</span>
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          </div>

          {/* Load More Button */}
          <div className="text-center mt-12">
            <button className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
              Load More Posts
            </button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
