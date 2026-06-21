'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const skillSchema = z.object({
  name: z.string().min(1).max(100),
  category: z.enum(['FRONTEND', 'BACKEND', 'DEVOPS', 'TOOLS', 'OTHER']),
  level: z.number().int().min(1).max(5),
  iconUrl: z.string().url().optional().or(z.literal('')),
  order: z.number().int().min(0).default(0),
});

export type SkillFormData = z.infer<typeof skillSchema>;

export async function createSkill(formData: SkillFormData) {
  const parsed = skillSchema.safeParse(formData);
  if (!parsed.success) return { ok: false, error: parsed.error.flatten().fieldErrors };

  const { iconUrl, ...rest } = parsed.data;
  await prisma.skill.create({
    data: { ...rest, iconUrl: iconUrl || undefined },
  });

  revalidatePath('/admin/skills');
  revalidatePath('/skills');
  return { ok: true };
}

export async function updateSkill(id: string, formData: SkillFormData) {
  const parsed = skillSchema.safeParse(formData);
  if (!parsed.success) return { ok: false, error: parsed.error.flatten().fieldErrors };

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
  await prisma.skill.delete({ where: { id } });
  revalidatePath('/admin/skills');
  revalidatePath('/skills');
  return { ok: true };
}

export async function getAllSkillsFromDb() {
  return prisma.skill.findMany({ orderBy: [{ category: 'asc' }, { order: 'asc' }] });
}
