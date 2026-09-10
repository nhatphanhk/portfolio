'use server';
import { cache } from 'react';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import { ensureAdmin } from '@/lib/auth-utils';

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
    const slug = trimmed.toLowerCase().replace(/\s+/g, '-');
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

  await prisma.blog.create({
    data: {
      ...rest,
      seriesId: seriesId || null,
      seriesOrder: seriesOrder != null ? Number(seriesOrder) : null,
      thumbnailUrl: thumbnailUrl || undefined,
      authorId,
      publishedAt: rest.status === 'PUBLISHED' ? new Date() : undefined,
      tags: {
        create: tagIds.map(tagId => ({ tagId })),
      },
    },
  });

  revalidatePath('/admin/blogs');
  revalidatePath('/blog');
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

  await prisma.blog.update({
    where: { id },
    data: {
      ...rest,
      seriesId: seriesId || null,
      seriesOrder: seriesOrder != null ? Number(seriesOrder) : null,
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

  revalidatePath('/admin/blogs');
  revalidatePath('/blog');
  revalidatePath(`/blog/${rest.slug}`);
  return { ok: true };
}

export async function deleteBlog(id: string) {
  try {
    await ensureAdmin();
    const blog = await prisma.blog.findUnique({
      where: { id },
      select: { slug: true },
    });
    if (!blog) {
      revalidatePath('/admin/blogs');
      revalidatePath('/blog');
      return { ok: true };
    }
    await prisma.blog.delete({ where: { id } });
    revalidatePath('/admin/blogs');
    revalidatePath('/blog');
    revalidatePath(`/blog/${blog.slug}`);
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
      },
    });
  } catch (error) {
    console.error('Error fetching blogs from db:', error);
    return [];
  }
}

export async function getPublicBlogs() {
  try {
    const blogs = await prisma.blog.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: { publishedAt: 'desc' },
      include: {
        tags: { include: { tag: true } },
        series: { select: { id: true, title: true, slug: true } },
      },
    });
    return blogs.map(b => ({
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
    }));
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

    revalidatePath('/admin/blogs');
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

/** Action to translate a blog post using Gemini AI and save to PostgreSQL DB */
export async function translateBlogAction(
  blogId: string,
  targetLocale: 'vi' | 'en' = 'vi',
  customApiKey?: string
): Promise<{ ok: boolean; data?: { title: string; excerpt: string; content: string }; error?: string }> {
  await ensureAdmin();
  try {
    const blog = await prisma.blog.findUnique({
      where: { id: blogId },
      select: { title: true, excerpt: true, content: true },
    });

    if (!blog) {
      return { ok: false, error: 'Blog not found' };
    }

    const { translateAndSaveBlogPost } = await import('@/lib/gemini-translate');
    const result = await translateAndSaveBlogPost(blogId, blog, targetLocale, customApiKey);

    if (!result) {
      return { ok: false, error: 'AI translation failed' };
    }

    revalidatePath('/blog');
    revalidatePath(`/admin/blogs/editor/${blogId}`);
    return { ok: true, data: result };
  } catch (error) {
    console.error('translateBlogAction error:', error);
    return { ok: false, error: 'Error during translation' };
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
