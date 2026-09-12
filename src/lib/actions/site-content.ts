'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db';
import { ensureAdmin } from '@/lib/auth-utils';
import { cache } from 'react';

import { DEFAULT_SITE_CONTENT, type SiteContentItem } from '@/lib/site-content-defaults';
export type { SiteContentItem };

/**
 * Get all site content as a key-value record for easy lookups
 */
export const getSiteContentRecord = cache(async (): Promise<Record<string, string>> => {
  try {
    const items = await prisma.siteContent.findMany();
    const map: Record<string, string> = {};

    // First fill with defaults
    for (const def of DEFAULT_SITE_CONTENT) {
      map[def.key] = def.value;
    }

    // Override with DB values
    for (const item of items) {
      map[item.key] = item.value;
    }

    return map;
  } catch (error) {
    console.warn('Error fetching site content from DB, using defaults:', error);
    const map: Record<string, string> = {};
    for (const def of DEFAULT_SITE_CONTENT) {
      map[def.key] = def.value;
    }
    return map;
  }
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
