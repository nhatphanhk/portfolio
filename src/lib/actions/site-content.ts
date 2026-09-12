'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db';
import { ensureAdmin } from '@/lib/auth-utils';
import { cache } from 'react';

import {
  DEFAULT_SITE_CONTENT,
  DEFAULT_VI_SITE_CONTENT,
  TRANSLATABLE_SITE_CONTENT_KEYS,
  type SiteContentItem,
} from '@/lib/site-content-defaults';
export type { SiteContentItem };

export interface SiteContentBundle {
  en: Record<string, string>;
  vi: Record<string, string>;
}

/**
 * Get site content bundle for both English and Vietnamese
 */
export const getSiteContentBundle = cache(async (): Promise<SiteContentBundle> => {
  try {
    const [items, viTranslation, enTranslation] = await Promise.all([
      prisma.siteContent.findMany(),
      prisma.contentTranslation.findUnique({
        where: {
          entityType_entityId_locale: {
            entityType: 'site_content',
            entityId: 'landing',
            locale: 'vi',
          },
        },
      }),
      prisma.contentTranslation.findUnique({
        where: {
          entityType_entityId_locale: {
            entityType: 'site_content',
            entityId: 'landing',
            locale: 'en',
          },
        },
      }),
    ]);

    // Build English map
    const enMap: Record<string, string> = {};
    for (const def of DEFAULT_SITE_CONTENT) {
      enMap[def.key] = def.value;
    }
    for (const item of items) {
      enMap[item.key] = item.value;
    }
    if (enTranslation?.content) {
      try {
        const parsed = JSON.parse(enTranslation.content);
        Object.assign(enMap, parsed);
      } catch (e) {
        console.warn('Failed to parse en site_content translations:', e);
      }
    }

    // Build Vietnamese map
    const viMap: Record<string, string> = { ...enMap, ...DEFAULT_VI_SITE_CONTENT };
    // Non-translatable fields (image URLs, numbers) stay synchronized with DB
    for (const item of items) {
      if (!TRANSLATABLE_SITE_CONTENT_KEYS.includes(item.key as any)) {
        viMap[item.key] = item.value;
      }
    }
    if (viTranslation?.content) {
      try {
        const parsed = JSON.parse(viTranslation.content);
        Object.assign(viMap, parsed);
      } catch (e) {
        console.warn('Failed to parse vi site_content translations:', e);
      }
    }

    return { en: enMap, vi: viMap };
  } catch (error) {
    console.warn('Error fetching site content bundle from DB, using defaults:', error);
    const enMap: Record<string, string> = {};
    for (const def of DEFAULT_SITE_CONTENT) {
      enMap[def.key] = def.value;
    }
    const viMap: Record<string, string> = { ...enMap, ...DEFAULT_VI_SITE_CONTENT };
    return { en: enMap, vi: viMap };
  }
});

export type LocalizedSiteContentRecord = Record<string, string> & {
  en?: Record<string, string>;
  vi?: Record<string, string>;
};

/**
 * Get all site content as a key-value record for easy lookups,
 * automatically applying the requested locale and attaching bundle references.
 */
export const getSiteContentRecord = cache(async (locale?: string): Promise<LocalizedSiteContentRecord> => {
  const bundle = await getSiteContentBundle();
  const base = locale === 'vi' ? { ...bundle.vi } : { ...bundle.en };
  return Object.assign(base, { en: bundle.en, vi: bundle.vi });
});

/**
 * Get all site content items for the admin editor
 */
export async function getAllSiteContent(): Promise<SiteContentItem[]> {
  try {
    const items = await prisma.siteContent.findMany({
      orderBy: [{ grp: 'asc' }, { key: 'asc' }],
    });

    if (items.length === 0) {
      // Auto seed defaults into database
      const created: SiteContentItem[] = [];
      for (const def of DEFAULT_SITE_CONTENT) {
        try {
          const item = await prisma.siteContent.create({
            data: {
              key: def.key,
              value: def.value,
              type: def.type,
              label: def.label,
              grp: def.grp,
            },
          });
          created.push(item);
        } catch {
          // If concurrent or already exists, skip
        }
      }
      return created.length > 0 ? created : (DEFAULT_SITE_CONTENT as unknown as SiteContentItem[]);
    }

    return items;
  } catch (error) {
    console.error('Error in getAllSiteContent:', error);
    return DEFAULT_SITE_CONTENT.map((d, i) => ({
      id: `default-${i}`,
      key: d.key,
      value: d.value,
      type: d.type,
      label: d.label,
      grp: d.grp,
    }));
  }
}

/**
 * Update multiple site content items at once
 */
export async function updateSiteContentBatch(updates: Array<{ key: string; value: string }>) {
  await ensureAdmin();

  try {
    for (const { key, value } of updates) {
      const def = DEFAULT_SITE_CONTENT.find(d => d.key === key);
      await prisma.siteContent.upsert({
        where: { key },
        update: { value },
        create: {
          key,
          value,
          type: def?.type ?? 'text',
          label: def?.label ?? key,
          grp: def?.grp ?? 'general',
        },
      });
    }

    revalidatePath('/');
    revalidatePath('/nhatphanhk102/landing');
    return { ok: true };
  } catch (error) {
    console.error('Error updating site content batch:', error);
    return { ok: false, error: 'Failed to update site content' };
  }
}

/**
 * Save both English and Vietnamese landing page content bundles at once
 */
export async function saveSiteContentBundle(bundle: {
  en: Record<string, string>;
  vi: Record<string, string>;
}) {
  await ensureAdmin();

  try {
    // 1. Update/Upsert base SiteContent in DB (primary English values)
    const entries = Object.entries(bundle.en);
    for (const [key, value] of entries) {
      const def = DEFAULT_SITE_CONTENT.find(d => d.key === key);
      await prisma.siteContent.upsert({
        where: { key },
        update: { value },
        create: {
          key,
          value,
          type: def?.type ?? 'text',
          label: def?.label ?? key,
          grp: def?.grp ?? 'general',
        },
      });
    }

    // 2. Save Vietnamese translations to content_translations
    await prisma.contentTranslation.upsert({
      where: {
        entityType_entityId_locale: {
          entityType: 'site_content',
          entityId: 'landing',
          locale: 'vi',
        },
      },
      create: {
        entityType: 'site_content',
        entityId: 'landing',
        locale: 'vi',
        content: JSON.stringify(bundle.vi),
      },
      update: {
        content: JSON.stringify(bundle.vi),
        updatedAt: new Date(),
      },
    });

    // 3. Save English translations to content_translations
    await prisma.contentTranslation.upsert({
      where: {
        entityType_entityId_locale: {
          entityType: 'site_content',
          entityId: 'landing',
          locale: 'en',
        },
      },
      create: {
        entityType: 'site_content',
        entityId: 'landing',
        locale: 'en',
        content: JSON.stringify(bundle.en),
      },
      update: {
        content: JSON.stringify(bundle.en),
        updatedAt: new Date(),
      },
    });

    revalidatePath('/');
    revalidatePath('/nhatphanhk102/landing');
    return { ok: true };
  } catch (error) {
    console.error('Error saving site content bundle:', error);
    return { ok: false, error: 'Failed to save site content bundle' };
  }
}

