import 'server-only';
import { prisma } from '@/lib/db';

// These helpers write to the database without their own auth check: they are only ever called
// from server actions that have already run ensureAdmin(). They live here, outside any
// 'use server' module, so they can never be exposed as callable server actions.

/**
 * Smartly manages series order when a blog is assigned or reordered in a series:
 * 1. If desiredOrder is null or <= 0:
 *    Blog has NO order required -> marked with seriesOrder = null (sorted after all ordered blogs).
 *    Any existing ordered blogs in this series are compacted into contiguous 1..N.
 * 2. If desiredOrder >= 1:
 *    Inserts the blog at desiredOrder position.
 *    Existing blogs at >= desiredOrder are shifted by +1, and all are normalized to 1, 2, 3...
 * 3. If previousSeriesId is specified and differs:
 *    The old series is compacted so no gaps remain.
 */
export async function smartReorderSeriesBlogs({
  seriesId,
  targetBlogId,
  desiredOrder,
  previousSeriesId,
}: {
  seriesId: string | null;
  targetBlogId: string;
  desiredOrder: number | null | undefined;
  previousSeriesId?: string | null;
}) {
  // 1. Compact previous series if changed
  if (previousSeriesId && previousSeriesId !== seriesId) {
    await compactSeriesOrders(previousSeriesId, targetBlogId);
  }

  // 2. If target has no series, ensure its seriesOrder is null
  if (!seriesId) {
    await prisma.blog.update({
      where: { id: targetBlogId },
      data: { seriesOrder: null, seriesId: null },
    });
    return;
  }

  // 3. Fetch all other blogs in this series
  const existingBlogs = await prisma.blog.findMany({
    where: {
      seriesId,
      id: { not: targetBlogId },
    },
    select: {
      id: true,
      seriesOrder: true,
      createdAt: true,
    },
    orderBy: [
      { seriesOrder: { sort: 'asc', nulls: 'last' } },
      { createdAt: 'asc' },
    ],
  });

  // Separate into ordered vs unordered
  const orderedBlogs = existingBlogs
    .filter(b => b.seriesOrder != null && b.seriesOrder > 0)
    .sort((a, b) => (a.seriesOrder ?? 0) - (b.seriesOrder ?? 0));

  if (desiredOrder != null && desiredOrder > 0) {
    // 1-based index insertion: e.g. desiredOrder 1 -> insert at index 0
    const insertIndex = Math.max(0, Math.min(desiredOrder - 1, orderedBlogs.length));

    // Insert target blog into ordered list
    orderedBlogs.splice(insertIndex, 0, {
      id: targetBlogId,
      seriesOrder: desiredOrder,
      createdAt: new Date(),
    });

    // Normalize and batch update all affected blogs to 1, 2, 3...
    const updates: Promise<unknown>[] = [];
    orderedBlogs.forEach((blog, idx) => {
      const newOrder = idx + 1;
      if (blog.id === targetBlogId || blog.seriesOrder !== newOrder) {
        updates.push(
          prisma.blog.update({
            where: { id: blog.id },
            data: { seriesOrder: newOrder },
          })
        );
      }
    });

    await Promise.all(updates);
  } else {
    // No specific order requested -> seriesOrder = null (places it at the end)
    const updates: Promise<unknown>[] = [
      prisma.blog.update({
        where: { id: targetBlogId },
        data: { seriesOrder: null },
      }),
    ];

    // Compact remaining ordered blogs
    orderedBlogs.forEach((blog, idx) => {
      const newOrder = idx + 1;
      if (blog.seriesOrder !== newOrder) {
        updates.push(
          prisma.blog.update({
            where: { id: blog.id },
            data: { seriesOrder: newOrder },
          })
        );
      }
    });

    await Promise.all(updates);
  }
}

/**
 * Compacts a series so that ordered blogs are sequentially numbered 1, 2, 3...
 */
export async function compactSeriesOrders(seriesId: string, excludeBlogId?: string) {
  const blogs = await prisma.blog.findMany({
    where: {
      seriesId,
      id: excludeBlogId ? { not: excludeBlogId } : undefined,
      seriesOrder: { not: null },
    },
    select: { id: true, seriesOrder: true },
    orderBy: { seriesOrder: 'asc' },
  });

  const updates: Promise<unknown>[] = [];
  blogs.forEach((blog, idx) => {
    const expectedOrder = idx + 1;
    if (blog.seriesOrder !== expectedOrder) {
      updates.push(
        prisma.blog.update({
          where: { id: blog.id },
          data: { seriesOrder: expectedOrder },
        })
      );
    }
  });

  if (updates.length > 0) {
    await Promise.all(updates);
  }
}
