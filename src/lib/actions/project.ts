'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import { ensureAdmin } from '@/lib/auth-utils';

const projectSchema = z.object({
  title: z.string().min(3).max(255),
  slug: z
    .string()
    .min(3)
    .max(255)
    .regex(
      /^[a-z0-9-]+$/,
      'Slug must be lowercase letters, numbers, and hyphens only'
    ),
  description: z.string().max(1000).optional(),
  content: z.string().optional(),
  thumbnailUrl: z.string().url().optional().or(z.literal('')),
  demoUrl: z.string().url().optional().or(z.literal('')),
  repoUrl: z.string().url().optional().or(z.literal('')),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']),
  featured: z.boolean().default(false),
  tags: z.string().optional(), // comma-separated tag names
});

export type ProjectFormData = z.infer<typeof projectSchema>;

async function ensureAdminUser(): Promise<string> {
  const existing = await prisma.user.findFirst({
    where: { role: 'ADMIN' },
    select: { id: true },
  });
  if (existing) return existing.id;

  const created = await prisma.user.create({
    data: {
      id: 'admin-seed',
      email: process.env.ADMIN_EMAIL ?? 'admin@portfolio.dev',
      password: process.env.ADMIN_PASSWORD_HASH ?? '',
      name: 'Administrator',
      role: 'ADMIN',
    },
  });
  return created.id;
}

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

export async function createProject(formData: ProjectFormData) {
  await ensureAdmin();
  const parsed = projectSchema.safeParse(formData);
  if (!parsed.success)
    return { ok: false, error: parsed.error.flatten().fieldErrors };

  const { tags, thumbnailUrl, demoUrl, repoUrl, ...rest } = parsed.data;
  const authorId = await ensureAdminUser();
  const tagIds = await syncTags(tags ? tags.split(',') : []);

  await prisma.project.create({
    data: {
      ...rest,
      thumbnailUrl: thumbnailUrl || undefined,
      demoUrl: demoUrl || undefined,
      repoUrl: repoUrl || undefined,
      authorId,
      publishedAt: rest.status === 'PUBLISHED' ? new Date() : undefined,
      tags: { create: tagIds.map(tagId => ({ tagId })) },
    },
  });

  revalidatePath('/admin/projects');
  revalidatePath('/project');
  return { ok: true };
}

export async function updateProject(id: string, formData: ProjectFormData) {
  await ensureAdmin();
  const parsed = projectSchema.safeParse(formData);
  if (!parsed.success)
    return { ok: false, error: parsed.error.flatten().fieldErrors };

  const { tags, thumbnailUrl, demoUrl, repoUrl, ...rest } = parsed.data;
  const tagIds = await syncTags(tags ? tags.split(',') : []);

  await prisma.project.update({
    where: { id },
    data: {
      ...rest,
      thumbnailUrl: thumbnailUrl || undefined,
      demoUrl: demoUrl || undefined,
      repoUrl: repoUrl || undefined,
      tags: { deleteMany: {}, create: tagIds.map(tagId => ({ tagId })) },
    },
  });

  revalidatePath('/admin/projects');
  revalidatePath('/project');
  revalidatePath(`/project/${rest.slug}`);
  return { ok: true };
}

export async function deleteProject(id: string) {
  await ensureAdmin();
  const project = await prisma.project.delete({ where: { id } });
  revalidatePath('/admin/projects');
  revalidatePath('/project');
  revalidatePath(`/project/${project.slug}`);
  return { ok: true };
}

export async function getAllProjectsFromDb() {
  return prisma.project.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      tags: { include: { tag: true } },
    },
  });
}

export async function getPublicProjects() {
  const projects = await prisma.project.findMany({
    where: { status: 'PUBLISHED' },
    orderBy: { createdAt: 'desc' },
    include: { tags: { include: { tag: true } } },
  });
  return projects.map(p => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    description: p.description,
    content: p.content || '',
    thumbnailUrl: p.thumbnailUrl || undefined,
    demoUrl: p.demoUrl || undefined,
    repoUrl: p.repoUrl || undefined,
    status: p.status === 'PUBLISHED' ? 'active' : 'archived',
    featured: p.featured,
    technologies: p.tags.map(t => t.tag.name),
    publishedAt: p.createdAt.toISOString(),
  }));
}

export async function getPublicProjectBySlug(slug: string) {
  const p = await prisma.project.findUnique({
    where: { slug },
    include: { tags: { include: { tag: true } } },
  });
  if (!p || p.status !== 'PUBLISHED') return null;
  return {
    id: p.id,
    title: p.title,
    slug: p.slug,
    description: p.description,
    content: p.content || '',
    thumbnailUrl: p.thumbnailUrl || undefined,
    demoUrl: p.demoUrl || undefined,
    repoUrl: p.repoUrl || undefined,
    status: p.status === 'PUBLISHED' ? 'active' : 'archived',
    featured: p.featured,
    technologies: p.tags.map(t => t.tag.name),
    publishedAt: p.createdAt.toISOString(),
  };
}

