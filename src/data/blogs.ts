// src/data/blogs.ts
// Static blog posts data — replace with DB data in production

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  publishedAt: string;
  readTime: string;
  tags: string[];
  thumbnailUrl?: string;
  status: 'PUBLISHED' | 'DRAFT';
}

export const BLOG_POSTS: BlogPost[] = [
  {
    id: '1',
    title: 'Getting Started with Next.js 15 and TypeScript',
    slug: 'getting-started-nextjs-typescript',
    excerpt:
      'Learn how to set up a modern web development stack with Next.js 15 and TypeScript for building scalable applications.',
    publishedAt: '2025-01-15',
    readTime: '5 min read',
    tags: ['Next.js', 'TypeScript', 'Web Development'],
    status: 'PUBLISHED',
    content: `
      <h2>Introduction</h2>
      <p>Next.js has become one of the most popular React frameworks for building modern web applications. Combined with TypeScript, it provides an excellent developer experience with type safety and powerful features out of the box.</p>
      
      <h2>Why Choose Next.js?</h2>
      <p>Next.js offers several compelling advantages:</p>
      <ul>
        <li><strong>Server-Side Rendering (SSR)</strong>: Improves SEO and initial page load performance</li>
        <li><strong>Static Site Generation (SSG)</strong>: Pre-renders pages at build time for optimal performance</li>
        <li><strong>API Routes</strong>: Build full-stack applications with built-in API endpoints</li>
        <li><strong>File-based routing</strong>: Intuitive routing system based on file structure</li>
        <li><strong>Image optimization</strong>: Automatic image optimization and lazy loading</li>
      </ul>
      
      <h2>Setting Up Your Project</h2>
      <p>To get started with Next.js and TypeScript, run the following command:</p>
      <pre><code>npx create-next-app@latest my-app --typescript --tailwind --app</code></pre>
      
      <h2>TypeScript Benefits</h2>
      <p>TypeScript adds static type checking to JavaScript, which helps:</p>
      <ul>
        <li>Catch errors early in development</li>
        <li>Improve code maintainability</li>
        <li>Enhance IDE support with better autocomplete</li>
        <li>Make refactoring safer and more efficient</li>
      </ul>
      
      <h2>Conclusion</h2>
      <p>Next.js and TypeScript form a powerful combination for modern web development. The type safety combined with Next.js performance makes it an excellent choice for projects of any size.</p>
    `,
  },
  {
    id: '2',
    title: 'Tailwind CSS Best Practices for Modern UI Design',
    slug: 'tailwind-css-best-practices',
    excerpt:
      'Discover essential Tailwind CSS patterns and practices for creating beautiful, maintainable user interfaces.',
    publishedAt: '2025-01-10',
    readTime: '7 min read',
    tags: ['Tailwind CSS', 'CSS', 'UI Design'],
    status: 'PUBLISHED',
    content: `
      <h2>Why Tailwind CSS?</h2>
      <p>Tailwind CSS is a utility-first CSS framework that provides low-level utility classes to build custom designs without writing CSS. It's gained massive popularity due to its flexibility and developer experience.</p>
      
      <h2>Key Benefits</h2>
      <ul>
        <li><strong>Rapid Development</strong>: Build interfaces quickly with pre-built utility classes</li>
        <li><strong>Consistent Design</strong>: Built-in design system ensures consistency</li>
        <li><strong>Responsive Design</strong>: Mobile-first responsive utilities</li>
        <li><strong>Dark Mode</strong>: Built-in dark mode support</li>
      </ul>
      
      <h2>Best Practices</h2>
      <h3>1. Extract Components for Repeated Patterns</h3>
      <p>For frequently used patterns, extract them into React components or use the <code>@apply</code> directive in CSS.</p>
      
      <h3>2. Use Responsive Prefixes</h3>
      <p>Design mobile-first and use responsive prefixes: <code>sm:</code>, <code>md:</code>, <code>lg:</code>, <code>xl:</code></p>
      
      <h2>Conclusion</h2>
      <p>Tailwind CSS offers a powerful approach to styling that prioritizes utility and flexibility.</p>
    `,
  },
  {
    id: '3',
    title: 'Building Responsive Layouts with CSS Grid and Flexbox',
    slug: 'building-responsive-layouts',
    excerpt:
      'Master modern CSS layout techniques to create fluid, responsive designs that work across all devices.',
    publishedAt: '2025-01-05',
    readTime: '8 min read',
    tags: ['CSS', 'Responsive Design', 'Layout'],
    status: 'PUBLISHED',
    content: `
      <h2>CSS Grid vs Flexbox</h2>
      <p>CSS Grid and Flexbox are two powerful layout systems that have revolutionized how we build responsive web layouts.</p>
      
      <h2>When to Use CSS Grid</h2>
      <p>Use Grid for two-dimensional layouts where you need control over both rows and columns simultaneously.</p>
      
      <h2>When to Use Flexbox</h2>
      <p>Flexbox is ideal for one-dimensional layouts — either a row or a column of items.</p>
      
      <h2>Combining Both</h2>
      <p>The real power comes from using both: Grid for page layout, Flexbox for component-level layout.</p>
    `,
  },
  {
    id: '4',
    title: 'Understanding React Server Components',
    slug: 'understanding-react-server-components',
    excerpt:
      'Deep dive into React Server Components and how they fundamentally change the way we build React applications.',
    publishedAt: '2024-12-20',
    readTime: '10 min read',
    tags: ['React', 'Next.js', 'Server Components'],
    status: 'PUBLISHED',
    content: `
      <h2>What are Server Components?</h2>
      <p>React Server Components (RSC) are a new paradigm that allows components to run exclusively on the server, enabling direct database access, reduced client bundle size, and better performance.</p>
      
      <h2>Key Differences from Client Components</h2>
      <ul>
        <li>No useState or useEffect</li>
        <li>Direct async data fetching</li>
        <li>Zero client-side JavaScript by default</li>
        <li>Full access to Node.js APIs</li>
      </ul>
      
      <h2>When to Use Each</h2>
      <p>Use Server Components for data fetching and static rendering. Use Client Components for interactivity, browser APIs, and state management.</p>
    `,
  },
  {
    id: '5',
    title: 'PostgreSQL Performance Optimization Tips',
    slug: 'postgresql-performance-tips',
    excerpt:
      'Practical techniques to dramatically improve PostgreSQL query performance through indexing, query planning, and schema design.',
    publishedAt: '2024-12-10',
    readTime: '12 min read',
    tags: ['PostgreSQL', 'Database', 'Performance'],
    status: 'PUBLISHED',
    content: `
      <h2>Why Performance Matters</h2>
      <p>Database performance is often the bottleneck in web applications. Proper optimization can reduce response times from seconds to milliseconds.</p>
      
      <h2>Indexing Strategies</h2>
      <ul>
        <li>Index frequently queried columns</li>
        <li>Use composite indexes for multi-column queries</li>
        <li>Avoid over-indexing — each index slows writes</li>
      </ul>
      
      <h2>Query Optimization</h2>
      <p>Use <code>EXPLAIN ANALYZE</code> to understand query execution plans and identify bottlenecks.</p>
    `,
  },
  {
    id: '6',
    title: 'Mastering TypeScript Generics',
    slug: 'mastering-typescript-generics',
    excerpt:
      'A comprehensive guide to TypeScript generics — from basic usage to advanced patterns like conditional types and mapped types.',
    publishedAt: '2024-11-25',
    readTime: '9 min read',
    tags: ['TypeScript', 'JavaScript', 'Programming'],
    status: 'PUBLISHED',
    content: `
      <h2>Introduction to Generics</h2>
      <p>Generics allow you to write reusable, type-safe code that works with multiple types rather than a single one.</p>
      
      <h2>Basic Generic Functions</h2>
      <pre><code>function identity&lt;T&gt;(arg: T): T {
  return arg;
}</code></pre>
      
      <h2>Generic Constraints</h2>
      <p>Use constraints to limit what types can be passed to a generic function using the <code>extends</code> keyword.</p>
      
      <h2>Advanced Patterns</h2>
      <p>Conditional types, mapped types, and template literal types unlock extremely powerful type transformations.</p>
    `,
  },
];

/**
 * Returns all published blog posts sorted by date (most recent first).
 */
export function getAllBlogPosts(): BlogPost[] {
  return [...BLOG_POSTS]
    .filter(p => p.status === 'PUBLISHED')
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
}

export function getBlogPostBySlug(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find(p => p.slug === slug);
}

export function getFeaturedBlogPosts(): BlogPost[] {
  return getAllBlogPosts().slice(0, 3);
}

export function getBlogPostsByTag(tag: string): BlogPost[] {
  return getAllBlogPosts().filter(p => p.tags.includes(tag));
}

export function getAllTags(): string[] {
  const tagSet = new Set<string>();
  BLOG_POSTS.forEach(p => p.tags.forEach(t => tagSet.add(t)));
  return Array.from(tagSet).sort();
}
