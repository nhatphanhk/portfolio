export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  readTime: string;
  tags: string[];
}
export interface BlogPostPageProps {
  params: Promise<{
    slug: string;
  }>;
}

// Sample blog posts data
const blogPosts: BlogPost[] = [
  {
    slug: 'getting-started-nextjs-typescript',
    title: 'Getting Started with Next.js and TypeScript',
    excerpt:
      'Learn how to set up a modern web development stack with Next.js 15 and TypeScript for building scalable applications.',
    date: '2024-01-15',
    readTime: '5 min read',
    tags: ['Next.js', 'TypeScript', 'Web Development'],
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
      <p>Next.js and TypeScript form a powerful combination for modern web development. The type safety of TypeScript combined with the performance and developer experience of Next.js makes it an excellent choice for projects of any size.</p>
    `,
  },
  {
    slug: 'tailwind-css-best-practices',
    title: 'Tailwind CSS Best Practices for Modern UI Design',
    excerpt:
      'Discover essential Tailwind CSS patterns and practices for creating beautiful, maintainable user interfaces.',
    date: '2024-01-12',
    readTime: '7 min read',
    tags: ['Tailwind CSS', 'CSS', 'UI Design'],
    content: `
      <h2>Why Tailwind CSS?</h2>
      <p>Tailwind CSS is a utility-first CSS framework that provides low-level utility classes to build custom designs without writing CSS. It's gained massive popularity due to its flexibility and developer experience.</p>
      
      <h2>Key Benefits</h2>
      <ul>
        <li><strong>Rapid Development</strong>: Build interfaces quickly with pre-built utility classes</li>
        <li><strong>Consistent Design</strong>: Built-in design system ensures consistency</li>
        <li><strong>Responsive Design</strong>: Mobile-first responsive utilities</li>
        <li><strong>Dark Mode</strong>: Built-in dark mode support</li>
        <li><strong>Customization</strong>: Highly customizable through configuration</li>
      </ul>
      
      <h2>Best Practices</h2>
      
      <h3>1. Use Component Classes</h3>
      <p>For frequently used patterns, extract them into component classes:</p>
      <pre><code>@layer components {
  .btn-primary {
    @apply bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded;
  }
}</code></pre>
      
      <h3>2. Organize Your Utilities</h3>
      <p>Group related utilities together for better readability:</p>
      <pre><code>&lt;div className="
  flex items-center justify-center
  w-full h-64
  bg-gray-100 dark:bg-gray-800
  border border-gray-300 dark:border-gray-700
  rounded-lg shadow-md
"&gt;</code></pre>
      
      <h3>3. Use Responsive Prefixes</h3>
      <p>Design mobile-first and use responsive prefixes for larger screens:</p>
      <pre><code>&lt;div className="text-sm md:text-base lg:text-lg xl:text-xl"&gt;</code></pre>
      
      <h2>Dark Mode Implementation</h2>
      <p>Tailwind makes dark mode implementation straightforward:</p>
      <pre><code>&lt;div className="bg-white dark:bg-gray-900 text-black dark:text-white"&gt;</code></pre>
      
      <h2>Conclusion</h2>
      <p>Tailwind CSS offers a powerful approach to styling that prioritizes utility and flexibility. By following these best practices, you can create maintainable and scalable stylesheets for your projects.</p>
    `,
  },
  {
    slug: 'building-responsive-layouts',
    title: 'Building Responsive Layouts with CSS Grid and Flexbox',
    excerpt:
      'Master modern CSS layout techniques to create fluid, responsive designs that work across all devices.',
    date: '2024-01-10',
    readTime: '8 min read',
    tags: ['CSS', 'Responsive Design', 'Layout'],
    content: `
      <h2>Modern CSS Layout: Grid vs Flexbox</h2>
      <p>CSS Grid and Flexbox are two powerful layout systems that have revolutionized how we build responsive web layouts. Understanding when and how to use each is crucial for modern web development.</p>
      
      <h2>CSS Grid: Two-Dimensional Layouts</h2>
      <p>CSS Grid excels at creating two-dimensional layouts where you need control over both rows and columns:</p>
      
      <pre><code>.grid-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  padding: 1rem;
}</code></pre>
      
      <h3>Grid Use Cases</h3>
      <ul>
        <li>Page layouts with header, sidebar, main content, and footer</li>
        <li>Card grids that adapt to screen size</li>
        <li>Complex magazine-style layouts</li>
        <li>Image galleries with varying sizes</li>
      </ul>
      
      <h2>Flexbox: One-Dimensional Layouts</h2>
      <p>Flexbox is perfect for one-dimensional layouts, either in a row or column:</p>
      
      <pre><code>.flex-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}</code></pre>
      
      <h3>Flexbox Use Cases</h3>
      <ul>
        <li>Navigation bars and menus</li>
        <li>Centering content vertically and horizontally</li>
        <li>Equal-height columns</li>
        <li>Distributing space between elements</li>
      </ul>
      
      <h2>Combining Grid and Flexbox</h2>
      <p>The real power comes from combining both techniques:</p>
      
      <pre><code>.layout {
  display: grid;
  grid-template-areas: 
    "header header"
    "sidebar main"
    "footer footer";
  min-height: 100vh;
}

.header {
  grid-area: header;
  display: flex;
  justify-content: space-between;
  align-items: center;
}</code></pre>
      
      <h2>Responsive Design Patterns</h2>
      
      <h3>The Holy Grail Layout</h3>
      <p>A classic three-column layout that's fully responsive:</p>
      
      <pre><code>.holy-grail {
  display: grid;
  grid-template-rows: auto 1fr auto;
  grid-template-columns: auto 1fr auto;
  min-height: 100vh;
}

@media (max-width: 768px) {
  .holy-grail {
    grid-template-columns: 1fr;
  }
}</code></pre>
      
      <h2>Best Practices</h2>
      <ul>
        <li><strong>Mobile First</strong>: Start with mobile layouts and enhance for larger screens</li>
        <li><strong>Use Logical Properties</strong>: Consider using logical properties for better internationalization</li>
        <li><strong>Test Across Devices</strong>: Always test your layouts on various screen sizes</li>
        <li><strong>Performance</strong>: Be mindful of layout shifts and use CSS containment when appropriate</li>
      </ul>
      
      <h2>Conclusion</h2>
      <p>Mastering CSS Grid and Flexbox gives you the tools to create any layout imaginable. By understanding the strengths of each technique and how they complement each other, you can build truly responsive and maintainable designs.</p>
    `,
  },
];

// Utility functions
export function getAllBlogPosts(): BlogPost[] {
  return blogPosts.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export function getBlogPostBySlug(slug: string): BlogPost | undefined {
  return blogPosts.find(post => post.slug === slug);
}

export function getFeaturedPosts(): BlogPost[] {
  return getAllBlogPosts().slice(0, 3);
}
