'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import { ensureAdmin } from '@/lib/auth-utils';

const skillSchema = z.object({
  name: z.string().min(1).max(100),
  category: z.enum([
    'FRONTEND',
    'BACKEND',
    'DEVOPS',
    'TOOLS',
    'OTHER',
    'LANGUAGE',
    'FRAMEWORK',
    'DATABASE',
    'CLOUD',
    'IAC',
    'MONITORING',
    'VERSION_CONTROL',
  ]),
  level: z.number().int(),
  iconUrl: z.string().url().optional().or(z.literal('')),
  order: z.number().int(),
});

export type SkillFormData = z.infer<typeof skillSchema>;

export async function createSkill(formData: SkillFormData) {
  await ensureAdmin();
  const parsed = skillSchema.safeParse(formData);
  if (!parsed.success)
    return { ok: false, error: parsed.error.flatten().fieldErrors };

  const { iconUrl, ...rest } = parsed.data;
  await prisma.skill.create({
    data: { ...rest, iconUrl: iconUrl || undefined },
  });

  revalidatePath('/admin/skills');
  revalidatePath('/skills');
  return { ok: true };
}

export async function updateSkill(id: string, formData: SkillFormData) {
  await ensureAdmin();
  const parsed = skillSchema.safeParse(formData);
  if (!parsed.success)
    return { ok: false, error: parsed.error.flatten().fieldErrors };

  const { iconUrl, ...rest } = parsed.data;
  await prisma.skill.update({
    where: { id },
    data: { ...rest, iconUrl: iconUrl || undefined },
  });

  revalidatePath('/admin/skills');
  revalidatePath('/skills');
  return { ok: true };
}

export async function deleteSkill(id: string) {
  await ensureAdmin();
  await prisma.skill.delete({ where: { id } });
  revalidatePath('/admin/skills');
  revalidatePath('/skills');
  return { ok: true };
}

export async function getAllSkillsFromDb() {
  return prisma.skill.findMany({
    orderBy: [{ category: 'asc' }, { order: 'asc' }],
  });
}

export async function getPublicSkillsByCategory() {
  try {
    const skills = await prisma.skill.findMany({
      orderBy: [{ category: 'asc' }, { order: 'asc' }],
    });
    const grouped: Record<string, any[]> = {};
    for (const s of skills) {
      if (!grouped[s.category]) grouped[s.category] = [];
      grouped[s.category].push({
        id: s.id,
        name: s.name,
        category: s.category,
        level: s.level || 0,
        iconUrl: s.iconUrl || undefined,
        order: s.order,
      });
    }
    return grouped;
  } catch (error) {
    console.error('Error fetching public skills from db:', error);
    return {};
  }
}

