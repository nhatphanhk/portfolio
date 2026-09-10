'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db';
import { ensureAdmin } from '@/lib/auth-utils';
import { cache } from 'react';
import { z } from 'zod';

const seriesSchema = z.object({
  title: z.string().min(2, 'Title required').max(255),
  slug: z.string().min(2).max(255).regex(/^[a-z0-9-]+$/, 'Only lowercase letters, numbers, and hyphens'),
  description: z.string().max(1000).optional(),
  coverUrl: z.string().url().optional().or(z.literal('')),
});

export type SeriesFormData = z.infer<typeof seriesSchema>;

export async function createSeries(data: SeriesFormData) {
  await ensureAdmin();
  const parsed = seriesSchema.safeParse(data);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.flatten().fieldErrors };
  }

  try {
    await prisma.blogSeries.create({
      data: {
        title: parsed.data.title,
        slug: parsed.data.slug,
        description: parsed.data.description,
        coverUrl: parsed.data.coverUrl || null,
      },
    });

    revalidatePath('/admin/blogs/series');
    revalidatePath('/blog');
    return { ok: true };
  } catch (error) {
    console.error('Error creating series:', error);
    return { ok: false, error: 'Series slug must be unique' };
  }
}

export async function updateSeries(id: string, data: SeriesFormData) {
  await ensureAdmin();
  const parsed = seriesSchema.safeParse(data);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.flatten().fieldErrors };
  }

  try {
    await prisma.blogSeries.update({
      where: { id },
      data: {
        title: parsed.data.title,
        slug: parsed.data.slug,
        description: parsed.data.description,
        coverUrl: parsed.data.coverUrl || null,
      },
    });

    revalidatePath('/admin/blogs/series');
    revalidatePath('/blog');
    return { ok: true };
  } catch (error) {
    console.error('Error updating series:', error);
    return { ok: false, error: 'Failed to update series' };
  }
}

export async function deleteSeries(id: string) {
  await ensureAdmin();
  try {
    // Unlink blogs first
    await prisma.blog.updateMany({
      where: { seriesId: id },
      data: { seriesId: null, seriesOrder: null },
    });

    await prisma.blogSeries.delete({
      where: { id },
    });

    revalidatePath('/admin/blogs/series');
    revalidatePath('/blog');
    return { ok: true };
  } catch (error) {
    console.error('Error deleting series:', error);
    return { ok: false, error: 'Failed to delete series' };
  }
}

export async function getAllSeries() {
  try {
    return await prisma.blogSeries.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { blogs: true },
        },
      },
    });
  } catch (error) {
    console.error('Error fetching all series:', error);
    return [];
  }
}

export const getPublicSeries = cache(async () => {
  try {
    return await prisma.blogSeries.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        blogs: {
          where: { status: 'PUBLISHED' },
          select: { id: true, title: true, slug: true, seriesOrder: true },
          orderBy: { seriesOrder: 'asc' },
        },
      },
    });
  } catch (error) {
    console.error('Error fetching public series:', error);
    return [];
  }
});

export const getSeriesForBlog = cache(async (blogId: string) => {
  try {
    const blog = await prisma.blog.findUnique({
      where: { id: blogId },
      select: {
        seriesId: true,
        seriesOrder: true,
        series: {
          include: {
            blogs: {
              where: { status: 'PUBLISHED' },
              select: {
                id: true,
                title: true,
                slug: true,
                seriesOrder: true,
                publishedAt: true,
              },
              orderBy: { seriesOrder: 'asc' },
            },
          },
        },
      },
    });

    if (!blog?.series) return null;

    return {
      seriesTitle: blog.series.title,
      seriesSlug: blog.series.slug,
      currentBlogId: blogId,
      currentIndex: blog.series.blogs.findIndex(b => b.id === blogId),
      totalParts: blog.series.blogs.length,
      posts: blog.series.blogs,
    };
  } catch (error) {
    console.error('Error getting series for blog:', error);
    return null;
  }
});

export const getPublicSeriesBySlug = cache(async (slug: string) => {
  try {
    const series = await prisma.blogSeries.findUnique({
      where: { slug },
      include: {
        blogs: {
          where: { status: 'PUBLISHED' },
          orderBy: { seriesOrder: 'asc' },
          include: {
            tags: { include: { tag: true } },
          },
        },
      },
    });

    if (!series) return null;

    return {
      id: series.id,
      title: series.title,
      slug: series.slug,
      description: series.description,
      coverUrl: series.coverUrl,
      createdAt: series.createdAt.toISOString(),
      updatedAt: series.updatedAt.toISOString(),
      blogs: series.blogs.map(b => ({
        id: b.id,
        title: b.title,
        slug: b.slug,
        excerpt: b.excerpt || '',
        seriesOrder: b.seriesOrder ?? 0,
        publishedAt: (b.publishedAt || b.createdAt).toISOString(),
        readTime: Math.max(1, Math.ceil(b.content.split(/\s+/).length / 200)) + ' min read',
        tags: b.tags.map(t => t.tag.name),
        thumbnailUrl: b.thumbnailUrl || undefined,
      })),
    };
  } catch (error) {
    console.error('Error fetching series by slug:', error);
    return null;
  }
});
