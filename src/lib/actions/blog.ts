'use server';

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

  const { tags, thumbnailUrl, ...rest } = parsed.data;
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

  const { tags, thumbnailUrl, ...rest } = parsed.data;
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
      thumbnailUrl: thumbnailUrl || undefined,
      publishedAt:
        rest.status === 'PUBLISHED'
          ? ((
              await prisma.blog.findUnique({
                where: { id },
                select: { publishedAt: true },
              })
            )?.publishedAt ?? new Date())
          : undefined,
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
  await ensureAdmin();
  const blog = await prisma.blog.delete({ where: { id } });
  revalidatePath('/admin/blogs');
  revalidatePath('/blog');
  revalidatePath(`/blog/${blog.slug}`);
  return { ok: true };
}

export async function getAllBlogsFromDb() {
  return prisma.blog.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      tags: { include: { tag: true } },
      author: { select: { name: true } },
    },
  });
}
