'use server';

import { revalidatePath, revalidateTag, unstable_cache } from 'next/cache';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import { ensureAdmin } from '@/lib/auth-utils';
import { slugify } from '@/lib/utils';
import {
  SKILL_CATEGORY_VALUES,
  SKILL_STATUS_VALUES,
  EVIDENCE_TYPE_VALUES,
  type SkillCategoryValue,
  type SkillStatusValue,
  type EvidenceTypeValue,
} from '@/lib/skill-constants';

type ActionResult = { ok: boolean; id?: string; error?: string | Record<string, string[] | undefined> };

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** '' / undefined → null so optional form fields clear the column on update. */
const emptyToNull = (v?: string | null) => (v && v.trim() ? v.trim() : null);
const toDate = (v?: string | null) => (v && v.trim() ? new Date(v) : null);

function revalidateSkills(slug?: string | null) {
  revalidateTag('skills', 'max');
  revalidatePath('/nhatphanhk102/skills', 'layout');
  revalidatePath('/skills');
  if (slug) revalidatePath(`/skills/${slug}`);
  revalidatePath('/');
}

/** Unique slug from the name; appends -2, -3… when another skill already uses it. */
async function uniqueSkillSlug(name: string, excludeId?: string) {
  const base = slugify(name) || 'skill';
  let slug = base;
  for (let i = 2; ; i++) {
    const clash = await prisma.skill.findFirst({
      where: { slug, ...(excludeId ? { NOT: { id: excludeId } } : {}) },
      select: { id: true },
    });
    if (!clash) return slug;
    slug = `${base}-${i}`;
  }
}

async function skillSlugOf(skillId: string) {
  return (await prisma.skill.findUnique({ where: { id: skillId }, select: { slug: true } }))?.slug ?? null;
}

/** http(s) only: these URLs are rendered as public links, so `javascript:` etc. must not pass. */
const optionalUrl = z
  .string()
  .regex(/^https?:\/\/\S+$/i, 'URL phải bắt đầu bằng http:// hoặc https://')
  .max(2048)
  .optional()
  .or(z.literal(''));
/** Uploaded file: an absolute http(s) URL (Vercel Blob) or a local /uploads/ path in dev. */
const optionalFileUrl = z
  .string()
  .regex(/^(https?:\/\/\S+|\/uploads\/[\w.-]+)$/i, 'Tệp không hợp lệ')
  .max(2048)
  .optional()
  .or(z.literal(''));
const optionalDate = z.string().optional().or(z.literal(''));

// ─── Skill ────────────────────────────────────────────────────────────────────

const skillSchema = z.object({
  name: z.string().min(1).max(100),
  category: z.enum(SKILL_CATEGORY_VALUES),
  summary: z.string().max(500).optional().or(z.literal('')),
  status: z.enum(SKILL_STATUS_VALUES).optional(),
  startedAt: optionalDate,
  achievedAt: optionalDate,
  featured: z.boolean().optional(),
  iconUrl: optionalUrl,
  order: z.number().int().optional(),
});

export type SkillFormData = z.input<typeof skillSchema>;

function skillData(d: z.infer<typeof skillSchema>) {
  return {
    name: d.name.trim(),
    category: d.category,
    summary: emptyToNull(d.summary),
    status: d.status ?? 'ACHIEVED',
    startedAt: toDate(d.startedAt),
    achievedAt: toDate(d.achievedAt),
    featured: d.featured ?? false,
    iconUrl: emptyToNull(d.iconUrl),
    order: d.order ?? 0,
  };
}

export async function createSkill(formData: SkillFormData): Promise<ActionResult> {
  await ensureAdmin();
  const parsed = skillSchema.safeParse(formData);
  if (!parsed.success) return { ok: false, error: parsed.error.flatten().fieldErrors };

  const slug = await uniqueSkillSlug(parsed.data.name);
  const created = await prisma.skill.create({ data: { ...skillData(parsed.data), slug } });

  revalidateSkills(slug);
  return { ok: true, id: created.id };
}

export async function updateSkill(id: string, formData: SkillFormData): Promise<ActionResult> {
  await ensureAdmin();
  const parsed = skillSchema.safeParse(formData);
  if (!parsed.success) return { ok: false, error: parsed.error.flatten().fieldErrors };

  const existing = await prisma.skill.findUnique({ where: { id }, select: { slug: true } });
  if (!existing) return { ok: false, error: 'Không tìm thấy kỹ năng' };
  // Keep a published slug stable; only skills created before slugs existed get one here
  const slug = existing.slug ?? (await uniqueSkillSlug(parsed.data.name, id));

  await prisma.skill.update({ where: { id }, data: { ...skillData(parsed.data), slug } });

  revalidateSkills(slug);
  return { ok: true, id };
}

export async function deleteSkill(id: string): Promise<ActionResult> {
  await ensureAdmin();
  const slug = await skillSlugOf(id);
  await prisma.skill.delete({ where: { id } });
  revalidateSkills(slug);
  return { ok: true };
}

export async function getAllSkillsFromDb() {
  await ensureAdmin();
  return prisma.skill.findMany({
    orderBy: [{ category: 'asc' }, { order: 'asc' }, { name: 'asc' }],
    include: { _count: { select: { capabilities: true, evidences: true, logs: true } } },
  });
}

export async function getSkillDetailAdmin(id: string) {
  await ensureAdmin();
  return prisma.skill.findUnique({
    where: { id },
    include: {
      capabilities: { orderBy: [{ order: 'asc' }, { createdAt: 'asc' }] },
      evidences: {
        orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
        include: { certification: { select: { id: true, name: true, issuer: true } } },
      },
      logs: { orderBy: [{ date: 'desc' }, { createdAt: 'desc' }] },
    },
  });
}

// ─── Capabilities ("Làm được gì") ─────────────────────────────────────────────

const capabilitySchema = z.object({
  statement: z.string().min(1).max(300),
  description: z.string().max(2000).optional().or(z.literal('')),
  achievedAt: optionalDate,
  order: z.number().int().optional(),
});

export type CapabilityFormData = z.input<typeof capabilitySchema>;

export async function createCapability(skillId: string, formData: CapabilityFormData): Promise<ActionResult> {
  await ensureAdmin();
  const parsed = capabilitySchema.safeParse(formData);
  if (!parsed.success) return { ok: false, error: parsed.error.flatten().fieldErrors };

  const order = parsed.data.order ?? (await prisma.skillCapability.count({ where: { skillId } }));
  const created = await prisma.skillCapability.create({
    data: {
      skillId,
      statement: parsed.data.statement.trim(),
      description: emptyToNull(parsed.data.description),
      achievedAt: toDate(parsed.data.achievedAt),
      order,
    },
  });
  revalidateSkills(await skillSlugOf(skillId));
  return { ok: true, id: created.id };
}

export async function updateCapability(id: string, formData: CapabilityFormData): Promise<ActionResult> {
  await ensureAdmin();
  const parsed = capabilitySchema.safeParse(formData);
  if (!parsed.success) return { ok: false, error: parsed.error.flatten().fieldErrors };

  const updated = await prisma.skillCapability.update({
    where: { id },
    data: {
      statement: parsed.data.statement.trim(),
      description: emptyToNull(parsed.data.description),
      achievedAt: toDate(parsed.data.achievedAt),
      ...(parsed.data.order !== undefined ? { order: parsed.data.order } : {}),
    },
  });
  revalidateSkills(await skillSlugOf(updated.skillId));
  return { ok: true, id };
}

export async function deleteCapability(id: string): Promise<ActionResult> {
  await ensureAdmin();
  // Evidence attached to this capability stays on the skill (onDelete: SetNull)
  const removed = await prisma.skillCapability.delete({ where: { id } });
  revalidateSkills(await skillSlugOf(removed.skillId));
  return { ok: true };
}

/** Persists a new display order: ids in the order they should appear. */
export async function reorderCapabilities(skillId: string, orderedIds: string[]): Promise<ActionResult> {
  await ensureAdmin();
  await prisma.$transaction(
    orderedIds.map((id, order) => prisma.skillCapability.update({ where: { id, skillId }, data: { order } }))
  );
  revalidateSkills(await skillSlugOf(skillId));
  return { ok: true };
}

// ─── Evidence ─────────────────────────────────────────────────────────────────

const evidenceSchema = z
  .object({
    type: z.enum(EVIDENCE_TYPE_VALUES),
    title: z.string().min(1).max(255),
    capabilityId: z.string().optional().or(z.literal('')),
    url: optionalUrl,
    fileUrl: optionalFileUrl,
    provider: z.string().max(255).optional().or(z.literal('')),
    issuedAt: optionalDate,
    description: z.string().max(2000).optional().or(z.literal('')),
    certificationId: z.string().optional().or(z.literal('')),
  })
  .refine(d => d.type !== 'CERTIFICATE' || !!d.certificationId || !!d.url || !!d.fileUrl, {
    message: 'Chứng chỉ cần chọn chứng chỉ có sẵn, đường dẫn hoặc tệp',
    path: ['certificationId'],
  })
  .refine(d => !['IMAGE', 'DOCUMENT'].includes(d.type) || !!d.fileUrl || !!d.url, {
    message: 'Cần tải tệp lên hoặc nhập đường dẫn',
    path: ['fileUrl'],
  })
  .refine(d => !['LINK', 'PROJECT', 'COURSE'].includes(d.type) || !!d.url || !!d.fileUrl, {
    message: 'Cần nhập đường dẫn',
    path: ['url'],
  });

export type EvidenceFormData = z.input<typeof evidenceSchema>;

/** The capability (if any) must belong to the same skill. */
async function validCapabilityId(skillId: string, capabilityId?: string | null) {
  if (!capabilityId) return null;
  const cap = await prisma.skillCapability.findFirst({ where: { id: capabilityId, skillId }, select: { id: true } });
  return cap?.id ?? null;
}

function evidenceData(d: z.infer<typeof evidenceSchema>) {
  return {
    type: d.type,
    title: d.title.trim(),
    url: emptyToNull(d.url),
    fileUrl: emptyToNull(d.fileUrl),
    provider: emptyToNull(d.provider),
    issuedAt: toDate(d.issuedAt),
    description: emptyToNull(d.description),
    certificationId: d.type === 'CERTIFICATE' ? emptyToNull(d.certificationId) : null,
  };
}

export async function createEvidence(skillId: string, formData: EvidenceFormData): Promise<ActionResult> {
  await ensureAdmin();
  const parsed = evidenceSchema.safeParse(formData);
  if (!parsed.success) return { ok: false, error: parsed.error.flatten().fieldErrors };

  const order = await prisma.skillEvidence.count({ where: { skillId } });
  const created = await prisma.skillEvidence.create({
    data: {
      skillId,
      capabilityId: await validCapabilityId(skillId, parsed.data.capabilityId),
      ...evidenceData(parsed.data),
      order,
    },
  });
  revalidateTag('certifications', 'max');
  revalidateSkills(await skillSlugOf(skillId));
  return { ok: true, id: created.id };
}

export async function updateEvidence(id: string, formData: EvidenceFormData): Promise<ActionResult> {
  await ensureAdmin();
  const parsed = evidenceSchema.safeParse(formData);
  if (!parsed.success) return { ok: false, error: parsed.error.flatten().fieldErrors };

  const existing = await prisma.skillEvidence.findUnique({ where: { id }, select: { skillId: true } });
  if (!existing) return { ok: false, error: 'Không tìm thấy bằng chứng' };

  await prisma.skillEvidence.update({
    where: { id },
    data: {
      capabilityId: await validCapabilityId(existing.skillId, parsed.data.capabilityId),
      ...evidenceData(parsed.data),
    },
  });
  revalidateTag('certifications', 'max');
  revalidateSkills(await skillSlugOf(existing.skillId));
  return { ok: true, id };
}

export async function deleteEvidence(id: string): Promise<ActionResult> {
  await ensureAdmin();
  const removed = await prisma.skillEvidence.delete({ where: { id } });
  revalidateTag('certifications', 'max');
  revalidateSkills(await skillSlugOf(removed.skillId));
  return { ok: true };
}

// ─── Learning journal ─────────────────────────────────────────────────────────

const logSchema = z.object({
  date: z.string().min(1),
  title: z.string().min(1).max(255),
  note: z.string().max(2000).optional().or(z.literal('')),
  hours: z.number().min(0).max(1000).optional().nullable(),
});

export type SkillLogFormData = z.input<typeof logSchema>;

export async function createSkillLog(skillId: string, formData: SkillLogFormData): Promise<ActionResult> {
  await ensureAdmin();
  const parsed = logSchema.safeParse(formData);
  if (!parsed.success) return { ok: false, error: parsed.error.flatten().fieldErrors };

  const created = await prisma.skillLog.create({
    data: {
      skillId,
      date: new Date(parsed.data.date),
      title: parsed.data.title.trim(),
      note: emptyToNull(parsed.data.note),
      hours: parsed.data.hours ?? null,
    },
  });
  revalidateSkills(await skillSlugOf(skillId));
  return { ok: true, id: created.id };
}

export async function updateSkillLog(id: string, formData: SkillLogFormData): Promise<ActionResult> {
  await ensureAdmin();
  const parsed = logSchema.safeParse(formData);
  if (!parsed.success) return { ok: false, error: parsed.error.flatten().fieldErrors };

  const updated = await prisma.skillLog.update({
    where: { id },
    data: {
      date: new Date(parsed.data.date),
      title: parsed.data.title.trim(),
      note: emptyToNull(parsed.data.note),
      hours: parsed.data.hours ?? null,
    },
  });
  revalidateSkills(await skillSlugOf(updated.skillId));
  return { ok: true, id };
}

export async function deleteSkillLog(id: string): Promise<ActionResult> {
  await ensureAdmin();
  const removed = await prisma.skillLog.delete({ where: { id } });
  revalidateSkills(await skillSlugOf(removed.skillId));
  return { ok: true };
}

// ─── Public reads ─────────────────────────────────────────────────────────────

export interface PublicSkillSummary {
  id: string;
  name: string;
  slug: string | null;
  summary?: string;
  category: SkillCategoryValue;
  status: SkillStatusValue;
  iconUrl?: string;
  featured: boolean;
  order: number;
  capabilityCount: number;
  evidenceCount: number;
  startedAt?: string;
  achievedAt?: string;
}

export async function getPublicSkillsByCategory(): Promise<Record<string, PublicSkillSummary[]>> {
  return unstable_cache(
    async () => {
      try {
        const skills = await prisma.skill.findMany({
          orderBy: [{ category: 'asc' }, { featured: 'desc' }, { order: 'asc' }, { name: 'asc' }],
          include: { _count: { select: { capabilities: true, evidences: true } } },
        });
        const grouped: Record<string, PublicSkillSummary[]> = {};
        for (const s of skills) {
          (grouped[s.category] ??= []).push({
            id: s.id,
            name: s.name,
            slug: s.slug,
            summary: s.summary || undefined,
            category: s.category,
            status: s.status,
            iconUrl: s.iconUrl || undefined,
            featured: s.featured,
            order: s.order,
            capabilityCount: s._count.capabilities,
            evidenceCount: s._count.evidences,
            startedAt: s.startedAt?.toISOString(),
            achievedAt: s.achievedAt?.toISOString(),
          });
        }
        return grouped;
      } catch (error) {
        console.error('Error fetching public skills from db:', error);
        return {};
      }
    },
    ['public-skills-category-v2'],
    { revalidate: 3600, tags: ['skills'] }
  )();
}

export interface PublicEvidence {
  id: string;
  type: EvidenceTypeValue;
  title: string;
  url?: string;
  fileUrl?: string;
  provider?: string;
  issuedAt?: string;
  description?: string;
  capabilityId?: string;
  certification?: {
    name: string;
    issuer: string;
    credentialUrl?: string;
    credentialId?: string;
    issueDate: string;
  };
}

export interface PublicSkillDetail extends PublicSkillSummary {
  capabilities: { id: string; statement: string; description?: string; achievedAt?: string; evidences: PublicEvidence[] }[];
  /** Evidence not tied to a specific capability. */
  generalEvidences: PublicEvidence[];
  logs: { id: string; date: string; title: string; note?: string; hours?: number }[];
  totalHours: number;
  updatedAt: string;
}

export async function getPublicSkillBySlug(slug: string): Promise<PublicSkillDetail | null> {
  return unstable_cache(
    async () => {
      try {
        const s = await prisma.skill.findUnique({
          where: { slug },
          include: {
            capabilities: { orderBy: [{ order: 'asc' }, { createdAt: 'asc' }] },
            evidences: {
              orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
              include: { certification: true },
            },
            logs: { orderBy: [{ date: 'desc' }, { createdAt: 'desc' }] },
          },
        });
        if (!s) return null;

        const evidences: PublicEvidence[] = s.evidences.map(e => ({
          id: e.id,
          type: e.type,
          title: e.title,
          url: e.url || e.certification?.credentialUrl || undefined,
          fileUrl: e.fileUrl || undefined,
          provider: e.provider || e.certification?.issuer || undefined,
          issuedAt: (e.issuedAt ?? e.certification?.issueDate)?.toISOString(),
          description: e.description || undefined,
          capabilityId: e.capabilityId || undefined,
          certification: e.certification
            ? {
                name: e.certification.name,
                issuer: e.certification.issuer,
                credentialUrl: e.certification.credentialUrl || undefined,
                credentialId: e.certification.credentialId || undefined,
                issueDate: e.certification.issueDate.toISOString(),
              }
            : undefined,
        }));

        return {
          id: s.id,
          name: s.name,
          slug: s.slug,
          summary: s.summary || undefined,
          category: s.category,
          status: s.status,
          iconUrl: s.iconUrl || undefined,
          featured: s.featured,
          order: s.order,
          capabilityCount: s.capabilities.length,
          evidenceCount: s.evidences.length,
          startedAt: s.startedAt?.toISOString(),
          achievedAt: s.achievedAt?.toISOString(),
          capabilities: s.capabilities.map(c => ({
            id: c.id,
            statement: c.statement,
            description: c.description || undefined,
            achievedAt: c.achievedAt?.toISOString(),
            evidences: evidences.filter(e => e.capabilityId === c.id),
          })),
          generalEvidences: evidences.filter(e => !e.capabilityId),
          logs: s.logs.map(l => ({
            id: l.id,
            date: l.date.toISOString(),
            title: l.title,
            note: l.note || undefined,
            hours: l.hours ?? undefined,
          })),
          totalHours: s.logs.reduce((sum, l) => sum + (l.hours ?? 0), 0),
          updatedAt: s.updatedAt.toISOString(),
        };
      } catch (error) {
        console.error('Error fetching skill by slug from db:', error);
        return null;
      }
    },
    ['public-skill-detail', slug],
    { revalidate: 3600, tags: ['skills'] }
  )();
}

/** Slugs for the sitemap. */
export async function getPublicSkillSlugs() {
  return unstable_cache(
    async () => {
      try {
        return await prisma.skill.findMany({
          where: { slug: { not: null } },
          select: { slug: true, updatedAt: true },
        });
      } catch {
        return [];
      }
    },
    ['public-skill-slugs'],
    { revalidate: 3600, tags: ['skills'] }
  )();
}
