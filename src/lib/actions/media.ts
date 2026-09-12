'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db';
import { ensureAdmin } from '@/lib/auth-utils';
import { del } from '@vercel/blob';

export async function getMediaLibrary(fileType?: string) {
  await ensureAdmin();
  return prisma.media.findMany({
    where: fileType ? { fileType } : undefined,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      url: true,
      filename: true,
      mimetype: true,
      size: true,
      fileType: true,
      altText: true,
      createdAt: true,
    },
  });
}

export async function deleteMedia(id: string) {
  await ensureAdmin();

  const media = await prisma.media.findUnique({ where: { id } });
  if (!media) return { ok: false, error: 'Not found' };

  // Delete from Vercel Blob if it's a blob URL
  if (media.url.includes('blob.vercel-storage.com') || media.url.includes('public.blob.vercel-storage.com')) {
    try {
      await del(media.url);
    } catch (err) {
      console.warn('Blob delete failed (non-fatal):', err);
    }
  }

  await prisma.media.delete({ where: { id } });

  revalidatePath('/nhatphanhk102/media');
  return { ok: true };
}

export async function updateMediaAltText(id: string, altText: string) {
  await ensureAdmin();
  await prisma.media.update({ where: { id }, data: { altText } });
  revalidatePath('/nhatphanhk102/media');
  return { ok: true };
}
