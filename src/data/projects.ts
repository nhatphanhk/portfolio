// src/data/projects.ts
// Static projects data — replace with DB data in production

export type ProjectStatus = 'active' | 'archived';

export interface Project {
  id: string;
  title: string;
  slug: string;
  description: string;
  content?: string;
  thumbnailUrl?: string;
  demoUrl?: string;
  repoUrl?: string;
  status: ProjectStatus;
  featured: boolean;
  technologies: string[];
  publishedAt: string;
  startDate?: string;
  endDate?: string;
}

export const PROJECTS: Project[] = [
  {
    id: '1',
    title: 'Personal Portfolio CMS',
    slug: 'personal-portfolio-cms',
    description:
      'A full-featured personal portfolio website with a custom content management system. Built with Next.js, TypeScript, Prisma, and Tailwind CSS.',
    content: `
      <h2>Overview</h2>
      <p>This portfolio CMS is a modern web platform that separates public-facing content from admin management. The public site showcases projects, blog posts, skills, and certifications with a focus on performance and SEO.</p>
      
      <h2>Key Features</h2>
      <ul>
        <li>Responsive design with dark/light mode</li>
        <li>Admin dashboard for content management</li>
        <li>Contact form with email notifications</li>
        <li>SEO-optimized pages with metadata</li>
        <li>Static site generation for performance</li>
      </ul>
      
      <h2>Technical Architecture</h2>
      <p>The system uses Next.js App Router for both the frontend and API routes. Prisma ORM manages the database layer with PostgreSQL. Authentication is handled via NextAuth.js with JWT sessions.</p>
    `,
    thumbnailUrl: undefined,
    demoUrl: 'https://portfolio.example.com',
    repoUrl: 'https://github.com/nhatphanhk102/portfolio',
    status: 'active',
    featured: true,
    technologies: ['Next.js', 'TypeScript', 'Prisma', 'PostgreSQL', 'Tailwind CSS', 'shadcn/ui'],
    publishedAt: '2025-01-15',
    startDate: '2024-12-01',
    endDate: '2025-01-15',
  },
  {
    id: '2',
    title: 'E-Commerce Platform',
    slug: 'ecommerce-platform',
    description:
      'A scalable e-commerce platform with product catalog, cart, checkout, and order management. Supports multi-vendor and real-time inventory tracking.',
    content: `
      <h2>Overview</h2>
      <p>A full-stack e-commerce solution handling thousands of daily transactions. The platform supports multiple vendors, real-time inventory, and automated order fulfillment workflows.</p>
      
      <h2>Challenges Solved</h2>
      <ul>
        <li>Optimized database queries for sub-200ms response times</li>
        <li>Implemented event-driven architecture for real-time updates</li>
        <li>Built robust payment processing with Stripe</li>
        <li>Designed scalable cart and checkout flow</li>
      </ul>
    `,
    thumbnailUrl: undefined,
    demoUrl: 'https://shop.example.com',
    repoUrl: 'https://github.com/nhatphanhk102/ecommerce',
    status: 'active',
    featured: true,
    technologies: ['React', 'Node.js', 'Express', 'PostgreSQL', 'Redis', 'Stripe', 'Docker'],
    publishedAt: '2024-09-20',
    startDate: '2024-06-01',
    endDate: '2024-09-20',
  },
  {
    id: '3',
    title: 'Real-time Collaboration Tool',
    slug: 'realtime-collaboration-tool',
    description:
      'A browser-based collaborative document editor with real-time sync, presence indicators, and version history — similar to Google Docs.',
    content: `
      <h2>Overview</h2>
      <p>Built using operational transformation algorithms, this tool enables multiple users to simultaneously edit documents with automatic conflict resolution and persistent version history.</p>
    `,
    thumbnailUrl: undefined,
    demoUrl: undefined,
    repoUrl: 'https://github.com/nhatphanhk102/collab-tool',
    status: 'active',
    featured: false,
    technologies: ['React', 'WebSocket', 'Node.js', 'MongoDB', 'Socket.io'],
    publishedAt: '2024-05-10',
    startDate: '2024-02-01',
    endDate: '2024-05-10',
  },
  {
    id: '4',
    title: 'Design System Library',
    slug: 'design-system-library',
    description:
      'A comprehensive React component library built with accessibility in mind. Includes 50+ components, dark mode support, and full TypeScript typings.',
    thumbnailUrl: undefined,
    demoUrl: 'https://design-system.example.com',
    repoUrl: 'https://github.com/nhatphanhk102/design-system',
    status: 'active',
    featured: false,
    technologies: ['React', 'TypeScript', 'Storybook', 'Radix UI', 'CSS-in-JS'],
    publishedAt: '2023-11-30',
    startDate: '2023-08-01',
    endDate: '2023-11-30',
  },
  {
    id: '5',
    title: 'DevOps Monitoring Dashboard',
    slug: 'devops-monitoring-dashboard',
    description:
      'An operational dashboard for tracking system health, error rates, and performance metrics across microservices in real time.',
    thumbnailUrl: undefined,
    demoUrl: undefined,
    repoUrl: 'https://github.com/nhatphanhk102/monitoring',
    status: 'archived',
    featured: false,
    technologies: ['Next.js', 'Grafana', 'Prometheus', 'Docker', 'AWS'],
    publishedAt: '2023-07-01',
  },
];

/**
 * Returns all active projects sorted by publishedAt (most recent first).
 */
export function getAllProjects(): Project[] {
  return [...PROJECTS]
    .filter(p => p.status === 'active')
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
}

export function getFeaturedProjects(): Project[] {
  return getAllProjects().filter(p => p.featured);
}

export function getProjectBySlug(slug: string): Project | undefined {
  return PROJECTS.find(p => p.slug === slug);
}
