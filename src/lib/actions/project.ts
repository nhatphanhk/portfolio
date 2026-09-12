'use server';
import { cache } from 'react';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import { ensureAdmin } from '@/lib/auth-utils';
import { slugify } from '@/lib/utils';

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

  revalidatePath('/nhatphanhk102/projects');
  revalidatePath('/project');
  revalidatePath('/');
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

  revalidatePath('/nhatphanhk102/projects');
  revalidatePath('/project');
  revalidatePath(`/project/${rest.slug}`);
  revalidatePath('/');
  return { ok: true };
}

export async function deleteProject(id: string) {
  try {
    await ensureAdmin();
    const project = await prisma.project.findUnique({
      where: { id },
      select: { slug: true },
    });
    if (!project) {
      revalidatePath('/nhatphanhk102/projects');
      revalidatePath('/project');
      return { ok: true };
    }
    await prisma.project.delete({ where: { id } });
    revalidatePath('/nhatphanhk102/projects');
    revalidatePath('/project');
    revalidatePath(`/project/${project.slug}`);
    revalidatePath('/');
    return { ok: true };
  } catch (error) {
    console.error('Error deleting project:', error);
    return { ok: false, error: 'Failed to delete project' };
  }
}

export async function getAllProjectsFromDb() {
  try {
    return await prisma.project.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        tags: { include: { tag: true } },
      },
    });
  } catch (error) {
    console.error('Error fetching projects from db:', error);
    return [];
  }
}

export async function getPublicProjects(locale: 'vi' | 'en' = 'vi') {
  try {
    const projects = await prisma.project.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: { createdAt: 'desc' },
      include: { tags: { include: { tag: true } } },
    });

    const { getBatchEntityTranslationsFromDb } = await import('@/lib/gemini-translate');
    const translationMap = await getBatchEntityTranslationsFromDb(
      'project',
      projects.map(p => p.id),
      'en'
    );

    return projects.map(p => {
      const trans = translationMap.get(p.id);
      const isEn = locale === 'en';
      return {
        id: p.id,
        title: isEn && trans?.title ? trans.title : p.title,
        slug: p.slug,
        description: isEn && trans?.description !== undefined ? trans.description : p.description,
        content: isEn && trans?.content ? trans.content : p.content ?? '',
        thumbnailUrl: p.thumbnailUrl || undefined,
        demoUrl: p.demoUrl || undefined,
        repoUrl: p.repoUrl || undefined,
        status: p.status === 'PUBLISHED' ? 'active' : 'archived',
        featured: p.featured,
        technologies: p.tags.map(t => t.tag.name),
        publishedAt: p.createdAt.toISOString(),
        translations: trans ? {
          en: {
            title: trans.title || undefined,
            description: trans.description ?? undefined,
            content: trans.content ?? undefined,
          },
        } : undefined,
      };
    });
  } catch (error) {
    console.error('Error fetching public projects from db:', error);
    return [];
  }
}

export const getPublicProjectBySlug = cache(async (slug: string, locale: 'vi' | 'en' = 'vi') => {
  try {
    const p = await prisma.project.findUnique({
      where: { slug },
      include: { tags: { include: { tag: true } } },
    });
    if (!p || p.status !== 'PUBLISHED') return null;

    const { getEntityTranslationFromDb } = await import('@/lib/gemini-translate');
    const trans = await getEntityTranslationFromDb('project', p.id, 'en');

    const isEn = locale === 'en';
    return {
      id: p.id,
      title: isEn && trans?.title ? trans.title : p.title,
      slug: p.slug,
      description: isEn && trans?.description !== undefined ? trans.description : p.description,
      content: isEn && trans?.content ? trans.content : p.content ?? '',
      thumbnailUrl: p.thumbnailUrl || undefined,
      demoUrl: p.demoUrl || undefined,
      repoUrl: p.repoUrl || undefined,
      status: p.status === 'PUBLISHED' ? 'active' : 'archived',
      featured: p.featured,
      technologies: p.tags.map(t => t.tag.name),
      publishedAt: p.createdAt.toISOString(),
      translations: trans ? {
        en: {
          title: trans.title || undefined,
          description: trans.description ?? undefined,
          content: trans.content ?? undefined,
        },
      } : undefined,
    };
  } catch (error) {
    console.error('Error fetching project by slug from db:', error);
    return null;
  }
});

/** Action to preview/translate a project using Gemini AI */
export async function previewTranslateProjectAction(
  projectId: string,
  targetLocale: 'vi' | 'en' = 'en',
  currentContent?: { title: string; description?: string | null; content?: string | null },
  customApiKey?: string
): Promise<{ ok: boolean; data?: { title: string; description: string; content: string }; error?: string }> {
  await ensureAdmin();
  try {
    let sourceData = currentContent;
    if (!sourceData || !sourceData.title) {
      const proj = await prisma.project.findUnique({
        where: { id: projectId },
        select: { title: true, description: true, content: true },
      });
      if (!proj) {
        return { ok: false, error: 'Project not found' };
      }
      sourceData = proj;
    }

    const { generateProjectTranslationWithDetails } = await import('@/lib/gemini-translate');
    const result = await generateProjectTranslationWithDetails(sourceData, targetLocale, customApiKey);

    if (!result.ok || !result.data) {
      return { ok: false, error: result.error || 'Project translation failed' };
    }

    return { ok: true, data: result.data };
  } catch (error: any) {
    console.error('previewTranslateProjectAction error:', error);
    return { ok: false, error: error?.message || 'Error translating project' };
  }
}

/** Action to save project translation to PostgreSQL DB */
export async function saveProjectTranslationAction(
  projectId: string,
  data: { title: string; description?: string; content?: string },
  targetLocale: 'vi' | 'en' = 'en'
): Promise<{ ok: boolean; error?: string }> {
  await ensureAdmin();
  try {
    const { saveEntityTranslationToDb } = await import('@/lib/gemini-translate');
    const success = await saveEntityTranslationToDb('project', projectId, data, targetLocale);
    if (!success) {
      return { ok: false, error: 'Failed to save project translation' };
    }

    revalidatePath('/project');
    revalidatePath('/nhatphanhk102/projects');
    return { ok: true };
  } catch (error) {
    console.error('saveProjectTranslationAction error:', error);
    return { ok: false, error: 'Failed to save project translation' };
  }
}

/** Get all saved translations for a project */
export async function getProjectTranslations(projectId: string) {
  try {
    return await prisma.contentTranslation.findMany({
      where: { entityType: 'project', entityId: projectId },
    });
  } catch (err) {
    console.error('getProjectTranslations error:', err);
    return [];
  }
}


