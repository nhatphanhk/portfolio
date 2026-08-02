import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/constants';
import { getPublicBlogs } from '@/lib/actions/blog';
import { getPublicProjects } from '@/lib/actions/project';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [blogs, projects] = await Promise.all([getPublicBlogs(), getPublicProjects()]);

  const staticRoutes: MetadataRoute.Sitemap = [
    '',
    '/resume',
    '/blog',
    '/project',
    '/skills',
    '/certifications',
    '/contact',
  ].map(path => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency: path === '' ? 'weekly' : 'monthly',
    priority: path === '' ? 1 : 0.7,
  }));

  const blogRoutes: MetadataRoute.Sitemap = blogs.map(post => ({
    url: `${SITE_URL}/blog/${post.slug}`,
    lastModified: new Date(post.publishedAt),
    changeFrequency: 'monthly',
    priority: 0.6,
  }));

  const projectRoutes: MetadataRoute.Sitemap = projects.map(project => ({
    url: `${SITE_URL}/project/${project.slug}`,
    lastModified: new Date(project.publishedAt),
    changeFrequency: 'monthly',
    priority: 0.6,
  }));

  return [...staticRoutes, ...blogRoutes, ...projectRoutes];
}
