'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db';
import { ensureAdmin } from '@/lib/auth-utils';
import { cache } from 'react';
import { z } from 'zod';

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const seriesSchema = z.object({
  title: z.string().min(2, 'Title required').max(255),
  slug: z.string().optional(),
  description: z.string().max(1000).optional(),
  coverUrl: z.string().url().optional().or(z.literal('')),
  tags: z.string().optional(),
});

export type SeriesFormData = z.infer<typeof seriesSchema>;

export async function createSeries(data: SeriesFormData) {
  await ensureAdmin();
  const parsed = seriesSchema.safeParse(data);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.flatten().fieldErrors };
  }

  const slug = parsed.data.slug?.trim() || slugify(parsed.data.title);

  try {
    await prisma.blogSeries.create({
      data: {
        title: parsed.data.title,
        slug,
        description: parsed.data.description,
        coverUrl: parsed.data.coverUrl || null,
        tags: parsed.data.tags?.trim() || null,
      },
    });

    revalidatePath('/admin/blogs/series');
    revalidatePath('/blog');
    revalidatePath('/blog/series');
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

  const slug = parsed.data.slug?.trim() || slugify(parsed.data.title);

  try {
    await prisma.blogSeries.update({
      where: { id },
      data: {
        title: parsed.data.title,
        slug,
        description: parsed.data.description,
        coverUrl: parsed.data.coverUrl || null,
        tags: parsed.data.tags?.trim() || null,
      },
    });

    revalidatePath('/admin/blogs/series');
    revalidatePath('/blog');
    revalidatePath('/blog/series');
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
        blogs: {
          select: {
            id: true,
            title: true,
            slug: true,
            seriesOrder: true,
            createdAt: true,
          },
          orderBy: [
            { seriesOrder: { sort: 'asc', nulls: 'last' } },
            { createdAt: 'asc' },
          ],
        },
      },
    });
  } catch (error) {
    console.error('Error fetching all series:', error);
    return [];
  }
}

export const getPublicSeries = cache(async (locale: 'vi' | 'en' = 'vi') => {
  try {
    const seriesList = await prisma.blogSeries.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        blogs: {
          where: { status: 'PUBLISHED' },
          select: { id: true, title: true, slug: true, seriesOrder: true },
          orderBy: [
            { seriesOrder: { sort: 'asc', nulls: 'last' } },
            { publishedAt: { sort: 'asc', nulls: 'last' } },
            { createdAt: 'asc' },
          ],
        },
      },
    });

    const { getBatchEntityTranslationsFromDb } = await import('@/lib/gemini-translate');
    const translationMap = await getBatchEntityTranslationsFromDb(
      'series',
      seriesList.map(s => s.id),
      'en'
    );

    const isEn = locale === 'en';
    return seriesList.map(s => {
      const trans = translationMap.get(s.id);
      return {
        ...s,
        title: isEn && trans?.title ? trans.title : s.title,
        description: isEn && trans?.description !== undefined ? trans.description : s.description,
        translations: trans ? {
          en: {
            title: trans.title || undefined,
            description: trans.description ?? undefined,
          },
        } : undefined,
      };
    });
  } catch (error) {
    console.error('Error fetching public series:', error);
    return [];
  }
});

export const getSeriesForBlog = cache(async (blogId: string, locale: 'vi' | 'en' = 'vi') => {
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
              orderBy: [
                { seriesOrder: { sort: 'asc', nulls: 'last' } },
                { publishedAt: { sort: 'asc', nulls: 'last' } },
                { createdAt: 'asc' },
              ],
            },
          },
        },
      },
    });

    if (!blog?.series) return null;

    let seriesTitle = blog.series.title;
    if (locale === 'en' && blog.seriesId) {
      const { getEntityTranslationFromDb } = await import('@/lib/gemini-translate');
      const trans = await getEntityTranslationFromDb('series', blog.seriesId, 'en');
      if (trans?.title) {
        seriesTitle = trans.title;
      }
    }

    return {
      seriesTitle,
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

export const getPublicSeriesBySlug = cache(async (slug: string, locale: 'vi' | 'en' = 'vi') => {
  try {
    const series = await prisma.blogSeries.findUnique({
      where: { slug },
      include: {
        blogs: {
          where: { status: 'PUBLISHED' },
          orderBy: [
            { seriesOrder: { sort: 'asc', nulls: 'last' } },
            { publishedAt: { sort: 'asc', nulls: 'last' } },
            { createdAt: 'asc' },
          ],
          include: {
            tags: { include: { tag: true } },
          },
        },
      },
    });

    if (!series) return null;

    const { getEntityTranslationFromDb } = await import('@/lib/gemini-translate');
    const trans = await getEntityTranslationFromDb('series', series.id, 'en');

    const isEn = locale === 'en';
    const title = isEn && trans?.title ? trans.title : series.title;
    const description = isEn && trans?.description !== undefined ? trans.description : series.description;

    return {
      id: series.id,
      title,
      slug: series.slug,
      description,
      coverUrl: series.coverUrl,
      createdAt: series.createdAt.toISOString(),
      updatedAt: series.updatedAt.toISOString(),
      translations: trans ? {
        en: {
          title: trans.title || undefined,
          description: trans.description ?? undefined,
        },
      } : undefined,
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

/**
 * Smartly manages series order when a blog is assigned or reordered in a series:
 * 1. If desiredOrder is null or <= 0:
 *    Blog has NO order required -> marked with seriesOrder = null (sorted after all ordered blogs).
 *    Any existing ordered blogs in this series are compacted into contiguous 1..N.
 * 2. If desiredOrder >= 1:
 *    Inserts the blog at desiredOrder position.
 *    Existing blogs at >= desiredOrder are shifted by +1, and all are normalized to 1, 2, 3...
 * 3. If previousSeriesId is specified and differs:
 *    The old series is compacted so no gaps remain.
 */
export async function smartReorderSeriesBlogs({
  seriesId,
  targetBlogId,
  desiredOrder,
  previousSeriesId,
}: {
  seriesId: string | null;
  targetBlogId: string;
  desiredOrder: number | null | undefined;
  previousSeriesId?: string | null;
}) {
  // 1. Compact previous series if changed
  if (previousSeriesId && previousSeriesId !== seriesId) {
    await compactSeriesOrders(previousSeriesId, targetBlogId);
  }

  // 2. If target has no series, ensure its seriesOrder is null
  if (!seriesId) {
    await prisma.blog.update({
      where: { id: targetBlogId },
      data: { seriesOrder: null, seriesId: null },
    });
    return;
  }

  // 3. Fetch all other blogs in this series
  const existingBlogs = await prisma.blog.findMany({
    where: {
      seriesId,
      id: { not: targetBlogId },
    },
    select: {
      id: true,
      seriesOrder: true,
      createdAt: true,
    },
    orderBy: [
      { seriesOrder: { sort: 'asc', nulls: 'last' } },
      { createdAt: 'asc' },
    ],
  });

  // Separate into ordered vs unordered
  const orderedBlogs = existingBlogs
    .filter(b => b.seriesOrder != null && b.seriesOrder > 0)
    .sort((a, b) => (a.seriesOrder ?? 0) - (b.seriesOrder ?? 0));

  if (desiredOrder != null && desiredOrder > 0) {
    // 1-based index insertion: e.g. desiredOrder 1 -> insert at index 0
    const insertIndex = Math.max(0, Math.min(desiredOrder - 1, orderedBlogs.length));

    // Insert target blog into ordered list
    orderedBlogs.splice(insertIndex, 0, {
      id: targetBlogId,
      seriesOrder: desiredOrder,
      createdAt: new Date(),
    });

    // Normalize and batch update all affected blogs to 1, 2, 3...
    const updates: Promise<unknown>[] = [];
    orderedBlogs.forEach((blog, idx) => {
      const newOrder = idx + 1;
      if (blog.id === targetBlogId || blog.seriesOrder !== newOrder) {
        updates.push(
          prisma.blog.update({
            where: { id: blog.id },
            data: { seriesOrder: newOrder },
          })
        );
      }
    });

    await Promise.all(updates);
  } else {
    // No specific order requested -> seriesOrder = null (places it at the end)
    const updates: Promise<unknown>[] = [
      prisma.blog.update({
        where: { id: targetBlogId },
        data: { seriesOrder: null },
      }),
    ];

    // Compact remaining ordered blogs
    orderedBlogs.forEach((blog, idx) => {
      const newOrder = idx + 1;
      if (blog.seriesOrder !== newOrder) {
        updates.push(
          prisma.blog.update({
            where: { id: blog.id },
            data: { seriesOrder: newOrder },
          })
        );
      }
    });

    await Promise.all(updates);
  }
}

/**
 * Compacts a series so that ordered blogs are sequentially numbered 1, 2, 3...
 */
export async function compactSeriesOrders(seriesId: string, excludeBlogId?: string) {
  const blogs = await prisma.blog.findMany({
    where: {
      seriesId,
      id: excludeBlogId ? { not: excludeBlogId } : undefined,
      seriesOrder: { not: null },
    },
    select: { id: true, seriesOrder: true },
    orderBy: { seriesOrder: 'asc' },
  });

  const updates: Promise<unknown>[] = [];
  blogs.forEach((blog, idx) => {
    const expectedOrder = idx + 1;
    if (blog.seriesOrder !== expectedOrder) {
      updates.push(
        prisma.blog.update({
          where: { id: blog.id },
          data: { seriesOrder: expectedOrder },
        })
      );
    }
  });

  if (updates.length > 0) {
    await Promise.all(updates);
  }
}

/** Action to preview/translate a series using Gemini AI */
export async function previewTranslateSeriesAction(
  seriesId: string,
  targetLocale: 'vi' | 'en' = 'en',
  currentContent?: { title: string; description?: string | null },
  customApiKey?: string
): Promise<{ ok: boolean; data?: { title: string; description: string }; error?: string }> {
  await ensureAdmin();
  try {
    let sourceData = currentContent;
    if (!sourceData || !sourceData.title) {
      const series = await prisma.blogSeries.findUnique({
        where: { id: seriesId },
        select: { title: true, description: true },
      });
      if (!series) {
        return { ok: false, error: 'Series not found' };
      }
      sourceData = series;
    }

    const { generateSeriesTranslationWithDetails } = await import('@/lib/gemini-translate');
    const result = await generateSeriesTranslationWithDetails(sourceData, targetLocale, customApiKey);

    if (!result.ok || !result.data) {
      return { ok: false, error: result.error || 'Series translation failed' };
    }

    return { ok: true, data: result.data };
  } catch (error: any) {
    console.error('previewTranslateSeriesAction error:', error);
    return { ok: false, error: error?.message || 'Error translating series' };
  }
}

/** Action to save series translation to PostgreSQL DB */
export async function saveSeriesTranslationAction(
  seriesId: string,
  data: { title: string; description?: string },
  targetLocale: 'vi' | 'en' = 'en'
): Promise<{ ok: boolean; error?: string }> {
  await ensureAdmin();
  try {
    const { saveEntityTranslationToDb } = await import('@/lib/gemini-translate');
    const success = await saveEntityTranslationToDb('series', seriesId, data, targetLocale);
    if (!success) {
      return { ok: false, error: 'Failed to save series translation' };
    }

    revalidatePath('/blog/series');
    revalidatePath('/admin/blogs/series');
    return { ok: true };
  } catch (error) {
    console.error('saveSeriesTranslationAction error:', error);
    return { ok: false, error: 'Failed to save series translation' };
  }
}

/** Get all saved translations for a series */
export async function getSeriesTranslations(seriesId: string) {
  try {
    return await prisma.contentTranslation.findMany({
      where: { entityType: 'series', entityId: seriesId },
    });
  } catch (err) {
    console.error('getSeriesTranslations error:', err);
    return [];
  }
}


