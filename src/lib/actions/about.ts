'use server';
import { cache } from 'react';

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

export const getProfile = cache(async (locale: 'vi' | 'en' = 'vi') => {
  let dbProfile = null;
  try {
    dbProfile = await prisma.profile.findFirst();
  } catch (error) {
    console.error('Error fetching profile from db:', error);
  }
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

  const { getEntityTranslationFromDb } = await import('@/lib/gemini-translate');
  const trans = await getEntityTranslationFromDb('profile', dbProfile.id, 'en');

  const isEn = locale === 'en';
  const title = isEn && trans?.title ? trans.title : dbProfile.title;
  const tagline = dbProfile.tagline ?? PROFILE.tagline;
  const bio = isEn && trans?.description ? trans.description : (dbProfile.bio ?? PROFILE.bio);
  const careerObjective = isEn && trans?.content ? trans.content : dbProfile.careerObjective;
  const softSkills = isEn && trans?.excerpt ? trans.excerpt : dbProfile.softSkills;

  return {
    id: dbProfile.id,
    name: dbProfile.name,
    handle: dbProfile.handle ?? PROFILE.handle,
    title,
    tagline,
    bio,
    bio2: dbProfile.bio2 ?? PROFILE.bio2,
    careerObjective,
    location: dbProfile.location ?? PROFILE.location,
    email: dbProfile.email ?? PROFILE.email,
    phone: dbProfile.phone,
    resumeUrl: dbProfile.resumeUrl ?? PROFILE.resumeUrl,
    avatarUrl: dbProfile.avatarUrl ?? PROFILE.avatarUrl,
    softSkills,
    interests: dbProfile.interests,
    fromDb: true as const,
    translations: trans ? {
      en: {
        title: trans.title || undefined,
        bio: trans.description || undefined,
        careerObjective: trans.content || undefined,
        softSkills: trans.excerpt || undefined,
      },
    } : undefined,
  };
});

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

export const getSocialLinks = cache(async () => {
  try {
    const links = await prisma.socialLink.findMany({ orderBy: { order: 'asc' } });
    if (links.length > 0) return links;
  } catch (error) {
    console.error('Error fetching social links from db:', error);
  }
  return PROFILE.socialLinks.map((l, i) => ({
    id: `static-${i}`,
    platform: l.platform,
    url: l.url,
    iconName: l.iconName as string | null,
    order: i,
    createdAt: new Date(),
    updatedAt: new Date(),
  }));
});

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

export async function getExperiences(locale: 'vi' | 'en' = 'vi') {
  try {
    const exps = await prisma.experience.findMany({ orderBy: { order: 'asc' } });
    if (exps.length > 0) {
      const { getBatchEntityTranslationsFromDb } = await import('@/lib/gemini-translate');
      const translationMap = await getBatchEntityTranslationsFromDb(
        'experience',
        exps.map(e => e.id),
        'en'
      );

      const isEn = locale === 'en';
      return exps.map(e => {
        const trans = translationMap.get(e.id);
        return {
          ...e,
          position: isEn && trans?.title ? trans.title : e.position,
          description: isEn && trans?.description !== undefined ? trans.description : e.description,
          achievements: isEn && trans?.content !== undefined ? trans.content : e.achievements,
          translations: trans ? {
            en: {
              position: trans.title || undefined,
              description: trans.description ?? undefined,
              achievements: trans.content ?? undefined,
            },
          } : undefined,
        };
      });
    }
  } catch (error) {
    console.error('Error fetching experiences from db:', error);
  }
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
  try {
    return await prisma.education.findMany({ orderBy: { order: 'asc' } });
  } catch (error) {
    console.error('Error fetching education from db:', error);
    return [];
  }
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
  try {
    return await prisma.achievement.findMany({ orderBy: { order: 'asc' } });
  } catch (error) {
    console.error('Error fetching achievements from db:', error);
    return [];
  }
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
  try {
    return await prisma.spokenLanguage.findMany({ orderBy: { order: 'asc' } });
  } catch (error) {
    console.error('Error fetching spoken languages from db:', error);
    return [];
  }
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
  try {
    return await prisma.activity.findMany({ orderBy: { order: 'asc' } });
  } catch (error) {
    console.error('Error fetching activities from db:', error);
    return [];
  }
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
  try {
    const skills = await prisma.skill.findMany({
      orderBy: [{ category: 'asc' }, { order: 'asc' }],
    });
    const grouped = skills.reduce<Record<string, typeof skills>>((acc, s) => {
      if (!acc[s.category]) acc[s.category] = [];
      acc[s.category].push(s);
      return acc;
    }, {});
    return grouped;
  } catch (error) {
    console.error('Error fetching skills from db:', error);
    return {};
  }
}

// ─── Profile & Resume Translations ───────────────────────────────────────────

/** Action to preview/translate profile details using Gemini AI */
export async function previewTranslateProfileAction(
  profileId: string,
  targetLocale: 'vi' | 'en' = 'en',
  currentContent?: {
    title?: string | null;
    tagline?: string | null;
    bio?: string | null;
    careerObjective?: string | null;
    softSkills?: string | null;
  },
  customApiKey?: string
): Promise<{ ok: boolean; data?: any; error?: string }> {
  await ensureAdmin();
  try {
    let sourceData = currentContent;
    if (!sourceData) {
      const p = await prisma.profile.findUnique({
        where: { id: profileId },
      });
      if (!p) return { ok: false, error: 'Profile not found' };
      sourceData = p;
    }

    const { generateProfileTranslationWithDetails } = await import('@/lib/gemini-translate');
    const result = await generateProfileTranslationWithDetails(sourceData, targetLocale, customApiKey);
    if (!result.ok || !result.data) {
      return { ok: false, error: result.error || 'Profile translation failed' };
    }

    return { ok: true, data: result.data };
  } catch (err: any) {
    console.error('previewTranslateProfileAction error:', err);
    return { ok: false, error: err?.message || 'Error translating profile' };
  }
}

/** Action to save profile translation to PostgreSQL DB */
export async function saveProfileTranslationAction(
  profileId: string,
  data: {
    title?: string | null;
    tagline?: string | null;
    bio?: string | null;
    careerObjective?: string | null;
    softSkills?: string | null;
  },
  targetLocale: 'vi' | 'en' = 'en'
): Promise<{ ok: boolean; error?: string }> {
  await ensureAdmin();
  try {
    const { saveEntityTranslationToDb } = await import('@/lib/gemini-translate');
    // Map: title -> title, bio -> description, careerObjective -> content, softSkills -> excerpt
    const success = await saveEntityTranslationToDb(
      'profile',
      profileId,
      {
        title: data.title,
        description: data.bio,
        content: data.careerObjective,
        excerpt: data.softSkills,
      },
      targetLocale
    );

    if (!success) return { ok: false, error: 'Failed to save profile translation' };

    REVALIDATE();
    return { ok: true };
  } catch (err: any) {
    console.error('saveProfileTranslationAction error:', err);
    return { ok: false, error: 'Failed to save profile translation' };
  }
}

/** Get all saved translations for profile */
export async function getProfileTranslations(profileId: string) {
  try {
    return await prisma.contentTranslation.findMany({
      where: { entityType: 'profile', entityId: profileId },
    });
  } catch (err) {
    console.error('getProfileTranslations error:', err);
    return [];
  }
}

/** Action to preview/translate an experience entry using Gemini AI */
export async function previewTranslateExperienceAction(
  experienceId: string,
  targetLocale: 'vi' | 'en' = 'en',
  currentContent?: {
    position: string;
    description?: string | null;
    achievements?: string | null;
  },
  customApiKey?: string
): Promise<{ ok: boolean; data?: any; error?: string }> {
  await ensureAdmin();
  try {
    let sourceData = currentContent;
    if (!sourceData || !sourceData.position) {
      const exp = await prisma.experience.findUnique({
        where: { id: experienceId },
      });
      if (!exp) return { ok: false, error: 'Experience not found' };
      sourceData = exp;
    }

    const { generateExperienceTranslationWithDetails } = await import('@/lib/gemini-translate');
    const result = await generateExperienceTranslationWithDetails(sourceData, targetLocale, customApiKey);
    if (!result.ok || !result.data) {
      return { ok: false, error: result.error || 'Experience translation failed' };
    }

    return { ok: true, data: result.data };
  } catch (err: any) {
    console.error('previewTranslateExperienceAction error:', err);
    return { ok: false, error: err?.message || 'Error translating experience' };
  }
}

/** Action to save experience translation to PostgreSQL DB */
export async function saveExperienceTranslationAction(
  experienceId: string,
  data: {
    position: string;
    description?: string | null;
    achievements?: string | null;
  },
  targetLocale: 'vi' | 'en' = 'en'
): Promise<{ ok: boolean; error?: string }> {
  await ensureAdmin();
  try {
    const { saveEntityTranslationToDb } = await import('@/lib/gemini-translate');
    // Map: position -> title, description -> description, achievements -> content
    const success = await saveEntityTranslationToDb(
      'experience',
      experienceId,
      {
        title: data.position,
        description: data.description,
        content: data.achievements,
      },
      targetLocale
    );

    if (!success) return { ok: false, error: 'Failed to save experience translation' };

    REVALIDATE();
    return { ok: true };
  } catch (err: any) {
    console.error('saveExperienceTranslationAction error:', err);
    return { ok: false, error: 'Failed to save experience translation' };
  }
}

/** Get all saved translations for an experience */
export async function getExperienceTranslations(experienceId: string) {
  try {
    return await prisma.contentTranslation.findMany({
      where: { entityType: 'experience', entityId: experienceId },
    });
  } catch (err) {
    console.error('getExperienceTranslations error:', err);
    return [];
  }
}

