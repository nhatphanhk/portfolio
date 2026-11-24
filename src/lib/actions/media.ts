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
  if (!media) return { ok: false, error: 'Không tìm thấy tệp' };

  // Refuse to delete a file that live content still points at
  const url = media.url;
  const [blogRefs, projectRefs, profileRefs, seriesRefs, siteRefs, evidenceRefs] = await Promise.all([
    prisma.blog.count({ where: { OR: [{ thumbnailUrl: url }, { content: { contains: url } }] } }),
    prisma.project.count({ where: { OR: [{ thumbnailUrl: url }, { content: { contains: url } }] } }),
    prisma.profile.count({ where: { OR: [{ avatarUrl: url }, { resumeUrl: url }] } }),
    prisma.blogSeries.count({ where: { coverUrl: url } }),
    prisma.siteContent.count({ where: { value: url } }),
    prisma.skillEvidence.count({ where: { OR: [{ fileUrl: url }, { url }] } }),
  ]);
  const refs = blogRefs + projectRefs + profileRefs + seriesRefs + siteRefs + evidenceRefs;
  if (refs > 0) {
    return {
      ok: false,
      error: `Tệp đang được dùng ở ${refs} nơi (bài viết, dự án, hồ sơ, trang chủ hoặc bằng chứng kỹ năng). Hãy gỡ liên kết trước khi xóa.`,
    };
  }

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
