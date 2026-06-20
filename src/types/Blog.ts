// src/types/Blog.ts
// Type definitions only — data and utility functions are in src/data/blogs.ts

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

export interface BlogPostPageProps {
  params: Promise<{
    slug: string;
  }>;
}
