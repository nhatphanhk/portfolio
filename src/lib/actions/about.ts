'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import { ensureAdmin } from '@/lib/auth-utils';
import { PROFILE, EXPERIENCES } from '@/data/content';

const REVALIDATE = () => {
  revalidatePath('/admin/resume');
  revalidatePath('/resume');
  revalidatePath('/');
};

// ─── Profile ──────────────────────────────────────────────────────────────────

const profileSchema = z.object({
  name: z.string().min(1).max(255),
  handle: z.string().max(100).optional(),
  title: z.string().min(1).max(255),
  tagline: z.string().max(500).optional(),
  bio: z.string().max(3000).optional(),
  bio2: z.string().max(3000).optional(),
  careerObjective: z.string().max(2000).optional(),
  location: z.string().max(255).optional(),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().max(50).optional(),
  resumeUrl: z.string().max(500).optional(),
  avatarUrl: z.string().max(500).optional(),
  softSkills: z.string().max(2000).optional(),
  interests: z.string().max(2000).optional(),
});

export type ProfileFormData = z.infer<typeof profileSchema>;

export async function getProfile() {
  const dbProfile = await prisma.profile.findFirst();
  const fallback = {
    id: null as null,
    name: PROFILE.name,
    handle: PROFILE.handle,
    title: PROFILE.title,
    tagline: PROFILE.tagline,
    bio: PROFILE.bio,
    bio2: PROFILE.bio2,
    careerObjective: null as null,
    location: PROFILE.location,
    email: PROFILE.email,
    phone: null as null,
    resumeUrl: PROFILE.resumeUrl,
    avatarUrl: PROFILE.avatarUrl,
    softSkills: null as null,
    interests: null as null,
    fromDb: false as const,
  };
  if (!dbProfile) return fallback;
  return {
    id: dbProfile.id,
    name: dbProfile.name,
    handle: dbProfile.handle ?? PROFILE.handle,
    title: dbProfile.title,
    tagline: dbProfile.tagline ?? PROFILE.tagline,
    bio: dbProfile.bio ?? PROFILE.bio,
    bio2: dbProfile.bio2 ?? PROFILE.bio2,
    careerObjective: dbProfile.careerObjective,
    location: dbProfile.location ?? PROFILE.location,
    email: dbProfile.email ?? PROFILE.email,
    phone: dbProfile.phone,
    resumeUrl: dbProfile.resumeUrl ?? PROFILE.resumeUrl,
    avatarUrl: dbProfile.avatarUrl ?? PROFILE.avatarUrl,
    softSkills: dbProfile.softSkills,
    interests: dbProfile.interests,
    fromDb: true as const,
  };
}

export async function updateProfile(formData: ProfileFormData) {
  await ensureAdmin();
  const parsed = profileSchema.safeParse(formData);
  if (!parsed.success)
    return { ok: false, error: parsed.error.flatten().fieldErrors };

  const data = {
    ...parsed.data,
    email: parsed.data.email || null,
    phone: parsed.data.phone || null,
  };

  const existing = await prisma.profile.findFirst();
  if (existing) {
    await prisma.profile.update({ where: { id: existing.id }, data });
  } else {
    await prisma.profile.create({ data });
  }
  REVALIDATE();
  return { ok: true };
}

// ─── Social Links ─────────────────────────────────────────────────────────────

export async function getSocialLinks() {
  const links = await prisma.socialLink.findMany({ orderBy: { order: 'asc' } });
  if (links.length > 0) return links;
  return PROFILE.socialLinks.map((l, i) => ({
    id: `static-${i}`,
    platform: l.platform,
    url: l.url,
    iconName: l.iconName as string | null,
    order: i,
    createdAt: new Date(),
    updatedAt: new Date(),
  }));
}

export async function upsertSocialLink(
  platform: string,
  url: string,
  iconName?: string
) {
  await ensureAdmin();
  const existing = await prisma.socialLink.findFirst({ where: { platform } });
  if (existing) {
    await prisma.socialLink.update({
      where: { id: existing.id },
      data: { url },
    });
  } else {
    const count = await prisma.socialLink.count();
    await prisma.socialLink.create({
      data: { platform, url, iconName, order: count },
    });
  }
  REVALIDATE();
  return { ok: true };
}

// ─── Experience ───────────────────────────────────────────────────────────────

const expSchema = z.object({
  company: z.string().min(1).max(255),
  position: z.string().min(1).max(255),
  description: z.string().max(3000).optional(),
  achievements: z.string().max(3000).optional(),
  techStack: z.string().max(1000).optional(),
  startDate: z.string().min(1),
  endDate: z.string().optional(),
  isCurrent: z.boolean().default(false),
});

export type ExperienceFormData = z.infer<typeof expSchema>;

export async function getExperiences() {
  const exps = await prisma.experience.findMany({ orderBy: { order: 'asc' } });
  if (exps.length > 0) return exps;
  return EXPERIENCES.map(e => ({
    id: e.id,
    company: e.company,
    position: e.position,
    description: e.description ?? null,
    achievements: null as null,
    techStack: null as null,
    logoUrl: null as null,
    startDate: new Date(e.startDate),
    endDate: e.endDate ? new Date(e.endDate) : null,
    isCurrent: e.isCurrent,
    order: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  }));
}

export async function createExperience(formData: ExperienceFormData) {
  await ensureAdmin();
  const parsed = expSchema.safeParse(formData);
  if (!parsed.success)
    return { ok: false, error: parsed.error.flatten().fieldErrors };
  const count = await prisma.experience.count();
  await prisma.experience.create({
    data: {
      ...parsed.data,
      startDate: new Date(parsed.data.startDate),
      endDate: parsed.data.endDate ? new Date(parsed.data.endDate) : null,
      order: count,
    },
  });
  REVALIDATE();
  return { ok: true };
}

export async function updateExperience(
  id: string,
  formData: ExperienceFormData
) {
  await ensureAdmin();
  const parsed = expSchema.safeParse(formData);
  if (!parsed.success)
    return { ok: false, error: parsed.error.flatten().fieldErrors };
  await prisma.experience.update({
    where: { id },
    data: {
      ...parsed.data,
      startDate: new Date(parsed.data.startDate),
      endDate: parsed.data.endDate ? new Date(parsed.data.endDate) : null,
    },
  });
  REVALIDATE();
  return { ok: true };
}

export async function deleteExperience(id: string) {
  await ensureAdmin();
  await prisma.experience.delete({ where: { id } });
  REVALIDATE();
  return { ok: true };
}

// ─── Education ────────────────────────────────────────────────────────────────

const eduSchema = z.object({
  institution: z.string().min(1).max(255),
  degree: z.string().min(1).max(255),
  fieldOfStudy: z.string().max(255).optional(),
  startDate: z.string().min(1),
  endDate: z.string().optional(),
  isCurrent: z.boolean().default(false),
  gpa: z.string().max(20).optional(),
  description: z.string().max(2000).optional(),
});

export type EducationFormData = z.infer<typeof eduSchema>;

export async function getEducation() {
  return prisma.education.findMany({ orderBy: { order: 'asc' } });
}

export async function createEducation(formData: EducationFormData) {
  await ensureAdmin();
  const parsed = eduSchema.safeParse(formData);
  if (!parsed.success)
    return { ok: false, error: parsed.error.flatten().fieldErrors };
  const count = await prisma.education.count();
  await prisma.education.create({
    data: {
      ...parsed.data,
      startDate: new Date(parsed.data.startDate),
      endDate: parsed.data.endDate ? new Date(parsed.data.endDate) : null,
      order: count,
    },
  });
  REVALIDATE();
  return { ok: true };
}

export async function updateEducation(id: string, formData: EducationFormData) {
  await ensureAdmin();
  const parsed = eduSchema.safeParse(formData);
  if (!parsed.success)
    return { ok: false, error: parsed.error.flatten().fieldErrors };
  await prisma.education.update({
    where: { id },
    data: {
      ...parsed.data,
      startDate: new Date(parsed.data.startDate),
      endDate: parsed.data.endDate ? new Date(parsed.data.endDate) : null,
    },
  });
  REVALIDATE();
  return { ok: true };
}

export async function deleteEducation(id: string) {
  await ensureAdmin();
  await prisma.education.delete({ where: { id } });
  REVALIDATE();
  return { ok: true };
}

// ─── Achievement ──────────────────────────────────────────────────────────────

const achSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().max(2000).optional(),
  date: z.string().optional(),
  category: z.string().optional(),
});

export type AchievementFormData = z.infer<typeof achSchema>;

export async function getAchievements() {
  return prisma.achievement.findMany({ orderBy: { order: 'asc' } });
}

export async function createAchievement(formData: AchievementFormData) {
  await ensureAdmin();
  const parsed = achSchema.safeParse(formData);
  if (!parsed.success)
    return { ok: false, error: parsed.error.flatten().fieldErrors };
  const count = await prisma.achievement.count();
  await prisma.achievement.create({
    data: {
      ...parsed.data,
      date: parsed.data.date ? new Date(parsed.data.date) : null,
      order: count,
    },
  });
  REVALIDATE();
  return { ok: true };
}

export async function updateAchievement(
  id: string,
  formData: AchievementFormData
) {
  await ensureAdmin();
  const parsed = achSchema.safeParse(formData);
  if (!parsed.success)
    return { ok: false, error: parsed.error.flatten().fieldErrors };
  await prisma.achievement.update({
    where: { id },
    data: {
      ...parsed.data,
      date: parsed.data.date ? new Date(parsed.data.date) : null,
    },
  });
  REVALIDATE();
  return { ok: true };
}

export async function deleteAchievement(id: string) {
  await ensureAdmin();
  await prisma.achievement.delete({ where: { id } });
  REVALIDATE();
  return { ok: true };
}

// ─── SpokenLanguage ───────────────────────────────────────────────────────────

const langSchema = z.object({
  language: z.string().min(1).max(100),
  level: z.string().min(1).max(50),
});

export type SpokenLanguageFormData = z.infer<typeof langSchema>;

export async function getSpokenLanguages() {
  return prisma.spokenLanguage.findMany({ orderBy: { order: 'asc' } });
}

export async function createSpokenLanguage(formData: SpokenLanguageFormData) {
  await ensureAdmin();
  const parsed = langSchema.safeParse(formData);
  if (!parsed.success)
    return { ok: false, error: parsed.error.flatten().fieldErrors };
  const count = await prisma.spokenLanguage.count();
  await prisma.spokenLanguage.create({
    data: { ...parsed.data, order: count },
  });
  REVALIDATE();
  return { ok: true };
}

export async function updateSpokenLanguage(
  id: string,
  formData: SpokenLanguageFormData
) {
  await ensureAdmin();
  const parsed = langSchema.safeParse(formData);
  if (!parsed.success)
    return { ok: false, error: parsed.error.flatten().fieldErrors };
  await prisma.spokenLanguage.update({ where: { id }, data: parsed.data });
  REVALIDATE();
  return { ok: true };
}

export async function deleteSpokenLanguage(id: string) {
  await ensureAdmin();
  await prisma.spokenLanguage.delete({ where: { id } });
  REVALIDATE();
  return { ok: true };
}

// ─── Activity ─────────────────────────────────────────────────────────────────

const actSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().max(2000).optional(),
  type: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export type ActivityFormData = z.infer<typeof actSchema>;

export async function getActivities() {
  return prisma.activity.findMany({ orderBy: { order: 'asc' } });
}

export async function createActivity(formData: ActivityFormData) {
  await ensureAdmin();
  const parsed = actSchema.safeParse(formData);
  if (!parsed.success)
    return { ok: false, error: parsed.error.flatten().fieldErrors };
  const count = await prisma.activity.count();
  await prisma.activity.create({
    data: {
      ...parsed.data,
      startDate: parsed.data.startDate ? new Date(parsed.data.startDate) : null,
      endDate: parsed.data.endDate ? new Date(parsed.data.endDate) : null,
      order: count,
    },
  });
  REVALIDATE();
  return { ok: true };
}

export async function updateActivity(id: string, formData: ActivityFormData) {
  await ensureAdmin();
  const parsed = actSchema.safeParse(formData);
  if (!parsed.success)
    return { ok: false, error: parsed.error.flatten().fieldErrors };
  await prisma.activity.update({
    where: { id },
    data: {
      ...parsed.data,
      startDate: parsed.data.startDate ? new Date(parsed.data.startDate) : null,
      endDate: parsed.data.endDate ? new Date(parsed.data.endDate) : null,
    },
  });
  REVALIDATE();
  return { ok: true };
}

export async function deleteActivity(id: string) {
  await ensureAdmin();
  await prisma.activity.delete({ where: { id } });
  REVALIDATE();
  return { ok: true };
}

// ─── Skills (read-only, grouped by category) ──────────────────────────────────

export async function getSkillsByCategory() {
  const skills = await prisma.skill.findMany({
    orderBy: [{ category: 'asc' }, { order: 'asc' }],
  });
  const grouped = skills.reduce<Record<string, typeof skills>>((acc, s) => {
    if (!acc[s.category]) acc[s.category] = [];
    acc[s.category].push(s);
    return acc;
  }, {});
  return grouped;
}
