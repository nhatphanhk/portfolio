import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/constants';
import { getPublicBlogs } from '@/lib/actions/blog';
import { getPublicProjects } from '@/lib/actions/project';
import { getPublicSeries } from '@/lib/actions/series';
import { getPublicSkillSlugs } from '@/lib/actions/skill';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [blogs, projects, seriesList, skills] = await Promise.all([
    getPublicBlogs(),
    getPublicProjects(),
    getPublicSeries(),
    getPublicSkillSlugs(),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    '',
    '/resume',
    '/blog',
    '/blog/series',
    '/project',
    '/skills',
    '/journey',
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
    lastModified: new Date(post.updatedAt),
    changeFrequency: 'monthly',
    priority: 0.6,
  }));

  const projectRoutes: MetadataRoute.Sitemap = projects.map(project => ({
    url: `${SITE_URL}/project/${project.slug}`,
    lastModified: new Date(project.updatedAt),
    changeFrequency: 'monthly',
    priority: 0.6,
  }));

  const seriesRoutes: MetadataRoute.Sitemap = seriesList.map(s => ({
    url: `${SITE_URL}/blog/series/${s.slug}`,
    lastModified: new Date(s.updatedAt || s.createdAt),
    changeFrequency: 'weekly',
    priority: 0.6,
  }));

  const skillRoutes: MetadataRoute.Sitemap = skills.map(s => ({
    url: `${SITE_URL}/skills/${s.slug}`,
    lastModified: new Date(s.updatedAt),
    changeFrequency: 'monthly',
    priority: 0.5,
  }));

  return [...staticRoutes, ...blogRoutes, ...projectRoutes, ...seriesRoutes, ...skillRoutes];
}
