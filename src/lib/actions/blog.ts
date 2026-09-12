'use server';
import { cache } from 'react';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import { ensureAdmin } from '@/lib/auth-utils';
import { smartReorderSeriesBlogs, compactSeriesOrders } from '@/lib/actions/series';
import { slugify } from '@/lib/utils';

const blogSchema = z.object({
  title: z.string().min(3).max(255),
  slug: z
    .string()
    .min(3)
    .max(255)
    .regex(
      /^[a-z0-9-]+$/,
      'Slug must be lowercase letters, numbers, and hyphens only'
    ),
  excerpt: z.string().max(500).optional(),
  content: z.string().min(1),
  thumbnailUrl: z.string().url().optional().or(z.literal('')),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']),
  tags: z.string().optional(), // comma-separated tag names
  seriesId: z.string().optional().nullable(),
  seriesOrder: z.coerce.number().optional().nullable(),
});

export type BlogFormData = z.infer<typeof blogSchema>;

// Hardcoded author ID — in production, get from session
const ADMIN_AUTHOR_ID = 'admin-seed';

/** Ensure a seed admin user exists for blog/project authorship */
async function ensureAdminUser(): Promise<string> {
  const existing = await prisma.user.findFirst({
    where: { role: 'ADMIN' },
    select: { id: true },
  });
  if (existing) return existing.id;

  const created = await prisma.user.create({
    data: {
      id: ADMIN_AUTHOR_ID,
      email: process.env.ADMIN_EMAIL ?? 'admin@portfolio.dev',
      password: process.env.ADMIN_PASSWORD_HASH ?? '',
      name: 'Administrator',
      role: 'ADMIN',
    },
  });
  return created.id;
}

/** Get or create tags by name, return their IDs */
async function syncTags(tagNames: string[]): Promise<string[]> {
  const ids: string[] = [];
  for (const name of tagNames) {
    const trimmed = name.trim();
    if (!trimmed) continue;
    const slug = slugify(trimmed);
    const tag = await prisma.tag.upsert({
      where: { slug },
      create: { name: trimmed, slug },
      update: {},
    });
    ids.push(tag.id);
  }
  return ids;
}

export async function createBlog(formData: BlogFormData) {
  await ensureAdmin();
  const parsed = blogSchema.safeParse(formData);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.flatten().fieldErrors };
  }

  const { tags, thumbnailUrl, seriesId, seriesOrder, ...rest } = parsed.data;
  const authorId = await ensureAdminUser();
  const tagNames = tags
    ? tags
        .split(',')
        .map(t => t.trim())
        .filter(Boolean)
    : [];
  const tagIds = await syncTags(tagNames);

  const parsedSeriesOrder =
    seriesOrder != null && Number(seriesOrder) > 0 ? Number(seriesOrder) : null;
  const targetSeriesId = seriesId || null;

  const newBlog = await prisma.blog.create({
    data: {
      ...rest,
      seriesId: targetSeriesId,
      seriesOrder: parsedSeriesOrder,
      thumbnailUrl: thumbnailUrl || undefined,
      authorId,
      publishedAt: rest.status === 'PUBLISHED' ? new Date() : undefined,
      tags: {
        create: tagIds.map(tagId => ({ tagId })),
      },
    },
  });

  if (targetSeriesId) {
    await smartReorderSeriesBlogs({
      seriesId: targetSeriesId,
      targetBlogId: newBlog.id,
      desiredOrder: parsedSeriesOrder,
    });
  }

  revalidatePath('/nhatphanhk102/blogs');
  revalidatePath('/blog');
  revalidatePath('/blog/series');
  revalidatePath('/');
  return { ok: true };
}

export async function updateBlog(id: string, formData: BlogFormData) {
  await ensureAdmin();
  const parsed = blogSchema.safeParse(formData);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.flatten().fieldErrors };
  }

  const { tags, thumbnailUrl, seriesId, seriesOrder, ...rest } = parsed.data;
  const tagNames = tags
    ? tags
        .split(',')
        .map(t => t.trim())
        .filter(Boolean)
    : [];
  const tagIds = await syncTags(tagNames);

  const oldBlog = await prisma.blog.findUnique({
    where: { id },
    select: { seriesId: true, seriesOrder: true, slug: true },
  });

  const parsedSeriesOrder =
    seriesOrder != null && Number(seriesOrder) > 0 ? Number(seriesOrder) : null;
  const targetSeriesId = seriesId || null;

  await prisma.blog.update({
    where: { id },
    data: {
      ...rest,
      seriesId: targetSeriesId,
      seriesOrder: parsedSeriesOrder,
      thumbnailUrl: thumbnailUrl || undefined,
      publishedAt:
        rest.status === 'PUBLISHED'
          ? ((
              await prisma.blog.findUnique({
                where: { id },
                select: { publishedAt: true },
              })
            )?.publishedAt ?? new Date())
          : null,
      tags: {
        deleteMany: {},
        create: tagIds.map(tagId => ({ tagId })),
      },
    },
  });

  // Smart series insertion & reordering
  if (targetSeriesId || oldBlog?.seriesId) {
    await smartReorderSeriesBlogs({
      seriesId: targetSeriesId,
      targetBlogId: id,
      desiredOrder: parsedSeriesOrder,
      previousSeriesId: oldBlog?.seriesId,
    });
  }

  revalidatePath('/nhatphanhk102/blogs');
  revalidatePath('/blog');
  revalidatePath('/blog/series');
  revalidatePath(`/blog/${rest.slug}`);
  revalidatePath('/');
  return { ok: true };
}

export async function deleteBlog(id: string) {
  try {
    await ensureAdmin();
    const blog = await prisma.blog.findUnique({
      where: { id },
      select: { slug: true, seriesId: true },
    });
    if (!blog) {
      revalidatePath('/nhatphanhk102/blogs');
      revalidatePath('/blog');
      revalidatePath('/blog/series');
      return { ok: true };
    }

    if (blog.seriesId) {
      await compactSeriesOrders(blog.seriesId, id);
    }

    await prisma.blog.delete({ where: { id } });
    revalidatePath('/nhatphanhk102/blogs');
    revalidatePath('/blog');
    revalidatePath('/blog/series');
    revalidatePath(`/blog/${blog.slug}`);
    revalidatePath('/');
    return { ok: true };
  } catch (error) {
    console.error('Error deleting blog:', error);
    return { ok: false, error: 'Failed to delete blog' };
  }
}

export async function getAllBlogsFromDb() {
  try {
    return await prisma.blog.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        tags: { include: { tag: true } },
        author: { select: { name: true } },
        series: { select: { id: true, title: true, slug: true } },
      },
    });
  } catch (error) {
    console.error('Error fetching blogs from db:', error);
    return [];
  }
}

export async function getPublicBlogs(locale: 'vi' | 'en' = 'vi') {
  try {
    const blogs = await prisma.blog.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: { publishedAt: 'desc' },
      include: {
        tags: { include: { tag: true } },
        series: { select: { id: true, title: true, slug: true } },
      },
    });

    let translationMap = new Map<string, any>();
    if (locale === 'en') {
      const { getBatchEntityTranslationsFromDb } = await import('@/lib/gemini-translate');
      translationMap = await getBatchEntityTranslationsFromDb(
        'blog',
        blogs.map(b => b.id),
        'en'
      );
    }

    return blogs.map(b => {
      const trans = translationMap.get(b.id);
      const isEn = locale === 'en';
      return {
        id: b.id,
        title: isEn && trans?.title ? trans.title : b.title,
        slug: b.slug,
        excerpt: isEn && trans?.excerpt !== undefined ? trans.excerpt : (b.excerpt || ''),
        content: isEn && trans?.content ? trans.content : b.content,
        publishedAt: (b.publishedAt || b.createdAt).toISOString(),
        readTime: Math.max(1, Math.ceil(b.content.split(/\s+/).length / 200)) + ' min read',
        tags: b.tags.map(t => t.tag.name),
        thumbnailUrl: b.thumbnailUrl || undefined,
        status: b.status,
        seriesId: b.seriesId || undefined,
        seriesOrder: b.seriesOrder ?? 0,
        series: b.series ? { id: b.series.id, title: b.series.title, slug: b.series.slug } : undefined,
      };
    });
  } catch (error) {
    console.error('Error fetching public blogs from db:', error);
    return [];
  }
}

export const getPublicBlogBySlug = cache(async (slug: string) => {
  try {
    const b = await prisma.blog.findUnique({
      where: { slug },
      include: {
        tags: { include: { tag: true } },
        series: { select: { id: true, title: true, slug: true } },
      },
    });
    if (!b || b.status !== 'PUBLISHED') return null;
    return {
      id: b.id,
      title: b.title,
      slug: b.slug,
      excerpt: b.excerpt || '',
      content: b.content,
      publishedAt: (b.publishedAt || b.createdAt).toISOString(),
      readTime: Math.max(1, Math.ceil(b.content.split(/\s+/).length / 200)) + ' min read',
      tags: b.tags.map(t => t.tag.name),
      thumbnailUrl: b.thumbnailUrl || undefined,
      status: b.status,
      seriesId: b.seriesId || undefined,
      seriesOrder: b.seriesOrder ?? 0,
      series: b.series ? { id: b.series.id, title: b.series.title, slug: b.series.slug } : undefined,
    };
  } catch (error) {
    console.error('Error fetching blog by slug from db:', error);
    return null;
  }
});

/** Create an empty draft and return its id so the editor can redirect immediately */
export async function createBlogDraft(): Promise<{ ok: boolean; id?: string; error?: string }> {
  await ensureAdmin();

  const authorId = await ensureAdminUser();

  // Generate a temporary unique slug
  const tempSlug = `draft-${Date.now()}`;

  try {
    const blog = await prisma.blog.create({
      data: {
        title: 'Untitled Post',
        slug: tempSlug,
        content: '',
        status: 'DRAFT',
        authorId,
      },
    });

    revalidatePath('/nhatphanhk102/blogs');
    return { ok: true, id: blog.id };
  } catch (err) {
    console.error('createBlogDraft error:', err);
    return { ok: false, error: 'Failed to create draft' };
  }
}

/** Load a single blog by id for the full-page editor (admin only) */
export async function getBlogById(id: string) {
  await ensureAdmin();
  return prisma.blog.findUnique({
    where: { id },
    include: {
      tags: { include: { tag: true } },
      series: { select: { id: true, title: true } },
    },
  });
}

/** Action to translate a blog post using Gemini AI and return translated content for preview */
export async function previewTranslateBlogAction(
  blogId: string,
  targetLocale: 'vi' | 'en' = 'vi',
  currentContent?: { title: string; excerpt?: string | null; content: string },
  customApiKey?: string
): Promise<{ ok: boolean; data?: { title: string; excerpt: string; content: string }; error?: string }> {
  await ensureAdmin();
  try {
    let sourceData = currentContent;
    if (!sourceData || !sourceData.title) {
      const blog = await prisma.blog.findUnique({
        where: { id: blogId },
        select: { title: true, excerpt: true, content: true },
      });
      if (!blog) {
        return { ok: false, error: 'Blog not found' };
      }
      sourceData = blog;
    }

    const { generateBlogTranslationWithDetails } = await import('@/lib/gemini-translate');
    const result = await generateBlogTranslationWithDetails(sourceData, targetLocale, customApiKey);

    if (!result.ok || !result.data) {
      return { ok: false, error: result.error || 'AI translation failed' };
    }

    return { ok: true, data: result.data };
  } catch (error: any) {
    console.error('previewTranslateBlogAction error:', error);
    return { ok: false, error: error?.message || 'Error during translation' };
  }
}

/** Action to save an approved translation to PostgreSQL DB */
export async function saveBlogTranslationAction(
  blogId: string,
  data: { title: string; excerpt: string; content: string },
  targetLocale: 'vi' | 'en' = 'vi'
): Promise<{ ok: boolean; error?: string }> {
  await ensureAdmin();
  try {
    const { saveBlogTranslationToDb } = await import('@/lib/gemini-translate');
    const success = await saveBlogTranslationToDb(blogId, data, targetLocale);
    if (!success) {
      return { ok: false, error: 'Failed to save translation to database' };
    }

    revalidatePath('/blog');
    revalidatePath(`/nhatphanhk102/blogs/editor/${blogId}`);
    return { ok: true };
  } catch (error) {
    console.error('saveBlogTranslationAction error:', error);
    return { ok: false, error: 'Failed to save translation' };
  }
}

/** Action to translate a blog post using Gemini AI and save to PostgreSQL DB */
export async function translateBlogAction(
  blogId: string,
  targetLocale: 'vi' | 'en' = 'vi',
  customApiKey?: string,
  currentContent?: { title: string; excerpt?: string | null; content: string }
): Promise<{ ok: boolean; data?: { title: string; excerpt: string; content: string }; error?: string }> {
  await ensureAdmin();
  try {
    let sourceData = currentContent;
    if (!sourceData || !sourceData.title) {
      const blog = await prisma.blog.findUnique({
        where: { id: blogId },
        select: { title: true, excerpt: true, content: true },
      });
      if (!blog) {
        return { ok: false, error: 'Blog not found' };
      }
      sourceData = blog;
    }

    const { generateBlogTranslationWithDetails, saveBlogTranslationToDb } = await import('@/lib/gemini-translate');
    const result = await generateBlogTranslationWithDetails(sourceData, targetLocale, customApiKey);

    if (!result.ok || !result.data) {
      return { ok: false, error: result.error || 'AI translation failed' };
    }

    await saveBlogTranslationToDb(blogId, result.data, targetLocale);

    revalidatePath('/blog');
    revalidatePath(`/nhatphanhk102/blogs/editor/${blogId}`);
    return { ok: true, data: result.data };
  } catch (error: any) {
    console.error('translateBlogAction error:', error);
    return { ok: false, error: error?.message || 'Error during translation' };
  }
}

/** Get all saved translations for a blog */
export async function getBlogTranslations(blogId: string) {
  try {
    return await prisma.contentTranslation.findMany({
      where: { entityType: 'blog', entityId: blogId },
    });
  } catch (err) {
    console.error('getBlogTranslations error:', err);
    return [];
  }
}
