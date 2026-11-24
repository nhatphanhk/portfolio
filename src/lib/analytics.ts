import 'server-only';
import { prisma } from '@/lib/db';
import { ensureAdmin } from '@/lib/auth-utils';

/**
 * Admin analytics read model: first-party page views (page_views) plus the data the site
 * already had (unique blog views, visitor-gate sign-ups). Days are bucketed in Vietnam time
 * (UTC+7, no DST).
 */

export const ANALYTICS_RANGES = [7, 30, 90] as const;
export type AnalyticsRange = (typeof ANALYTICS_RANGES)[number];

const TZ = 'Asia/Ho_Chi_Minh';
const TZ_OFFSET_MS = 7 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

export function parseRange(value: string | string[] | undefined): AnalyticsRange {
  const n = Number(Array.isArray(value) ? value[0] : value);
  return (ANALYTICS_RANGES as readonly number[]).includes(n) ? (n as AnalyticsRange) : 30;
}

/** UTC instant of local (UTC+7) midnight, `daysAgo` days before today. */
function localMidnight(daysAgo: number, now = Date.now()): Date {
  const local = new Date(now + TZ_OFFSET_MS);
  const midnightLocal = Date.UTC(local.getUTCFullYear(), local.getUTCMonth(), local.getUTCDate()) - daysAgo * DAY_MS;
  return new Date(midnightLocal - TZ_OFFSET_MS);
}

function dayKeys(start: Date, days: number): string[] {
  return Array.from({ length: days }, (_, i) => new Date(start.getTime() + TZ_OFFSET_MS + i * DAY_MS).toISOString().slice(0, 10));
}

export interface DailyPoint {
  day: string;
  views: number;
  visitors: number;
  blogViews: number;
  signups: number;
}

export interface CountRow {
  label: string;
  count: number;
}

export interface PeriodTotals {
  views: number;
  /** Sum of daily unique visitors (the hash rotates daily). */
  visitors: number;
  blogViews: number;
  signups: number;
}

export interface AnalyticsData {
  range: AnalyticsRange;
  start: string;
  daily: DailyPoint[];
  totals: PeriodTotals;
  previous: PeriodTotals;
  topPages: CountRow[];
  referrers: CountRow[];
  countries: CountRow[];
  devices: CountRow[];
  browsers: CountRow[];
  topPosts: { id: string; title: string; slug: string; views: number }[];
  latestSignups: { id: string; name: string; message: string; createdAt: string }[];
}

type DayCount = { day: string; count: number };

async function pageViewsByDay(from: Date, to: Date) {
  return prisma.$queryRaw<{ day: string; views: number; visitors: number }[]>`
    SELECT to_char(("createdAt" AT TIME ZONE 'UTC') AT TIME ZONE ${TZ}, 'YYYY-MM-DD') AS day,
           COUNT(*)::int AS views,
           COUNT(DISTINCT "visitorHash")::int AS visitors
    FROM "page_views"
    WHERE "createdAt" >= ${from} AND "createdAt" < ${to}
    GROUP BY day`;
}

async function blogViewsByDay(from: Date, to: Date) {
  return prisma.$queryRaw<DayCount[]>`
    SELECT to_char(("createdAt" AT TIME ZONE 'UTC') AT TIME ZONE ${TZ}, 'YYYY-MM-DD') AS day, COUNT(*)::int AS count
    FROM "blog_views"
    WHERE "createdAt" >= ${from} AND "createdAt" < ${to}
    GROUP BY day`;
}

async function signupsByDay(from: Date, to: Date) {
  return prisma.$queryRaw<DayCount[]>`
    SELECT to_char(("createdAt" AT TIME ZONE 'UTC') AT TIME ZONE ${TZ}, 'YYYY-MM-DD') AS day, COUNT(*)::int AS count
    FROM "contacts"
    WHERE "type"::text = 'VISITOR_LOG' AND "createdAt" >= ${from} AND "createdAt" < ${to}
    GROUP BY day`;
}

function sumTotals(
  pv: { views: number; visitors: number }[],
  bv: DayCount[],
  su: DayCount[]
): PeriodTotals {
  return {
    views: pv.reduce((n, r) => n + r.views, 0),
    visitors: pv.reduce((n, r) => n + r.visitors, 0),
    blogViews: bv.reduce((n, r) => n + r.count, 0),
    signups: su.reduce((n, r) => n + r.count, 0),
  };
}

export async function getAnalytics(range: AnalyticsRange): Promise<AnalyticsData> {
  await ensureAdmin();

  const now = Date.now();
  const start = localMidnight(range - 1, now);
  const end = new Date(now + 60 * 1000);
  const prevStart = new Date(start.getTime() - range * DAY_MS);
  const where = { createdAt: { gte: start } };

  const top = async (by: 'path' | 'referrerHost' | 'country' | 'device' | 'browser') => {
    const rows = await prisma.pageView.groupBy({
      by: [by],
      // Only nullable columns take a `not: null` filter; Prisma rejects it on required ones (path, device).
      where: by === 'path' || by === 'device' ? where : { ...where, [by]: { not: null } },
      _count: { _all: true },
      orderBy: { _count: { [by]: 'desc' } },
      take: 10,
    });
    return rows.map(r => ({ label: String(r[by]), count: r._count._all }));
  };

  const [pv, bv, su, prevPv, prevBv, prevSu, topPages, referrers, countries, devices, browsers, postGroups, latest] =
    await Promise.all([
      pageViewsByDay(start, end),
      blogViewsByDay(start, end),
      signupsByDay(start, end),
      pageViewsByDay(prevStart, start),
      blogViewsByDay(prevStart, start),
      signupsByDay(prevStart, start),
      top('path'),
      top('referrerHost'),
      top('country'),
      top('device'),
      top('browser'),
      prisma.blogView.groupBy({
        by: ['blogId'],
        where,
        _count: { _all: true },
        orderBy: { _count: { blogId: 'desc' } },
        take: 5,
      }),
      prisma.contact.findMany({
        where: { type: 'VISITOR_LOG', ...where },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: { id: true, name: true, message: true, createdAt: true },
      }),
    ]);

  const posts = postGroups.length
    ? await prisma.blog.findMany({
        where: { id: { in: postGroups.map(g => g.blogId) } },
        select: { id: true, title: true, slug: true },
      })
    : [];
  const postById = new Map(posts.map(p => [p.id, p]));

  const pvMap = new Map(pv.map(r => [r.day, r]));
  const bvMap = new Map(bv.map(r => [r.day, r.count]));
  const suMap = new Map(su.map(r => [r.day, r.count]));

  return {
    range,
    start: start.toISOString(),
    daily: dayKeys(start, range).map(day => ({
      day,
      views: pvMap.get(day)?.views ?? 0,
      visitors: pvMap.get(day)?.visitors ?? 0,
      blogViews: bvMap.get(day) ?? 0,
      signups: suMap.get(day) ?? 0,
    })),
    totals: sumTotals(pv, bv, su),
    previous: sumTotals(prevPv, prevBv, prevSu),
    topPages,
    referrers,
    countries,
    devices,
    browsers,
    topPosts: postGroups.flatMap(g => {
      const p = postById.get(g.blogId);
      return p ? [{ id: p.id, title: p.title, slug: p.slug, views: g._count._all }] : [];
    }),
    latestSignups: latest.map(c => ({
      id: c.id,
      name: c.name,
      message: c.message,
      createdAt: c.createdAt.toISOString(),
    })),
  };
}

/** Page views and daily-unique visitors over the last `days` days, for the overview cards. */
export async function getRecentTraffic(days = 7): Promise<{ views: number; visitors: number }> {
  await ensureAdmin();
  const rows = await pageViewsByDay(localMidnight(days - 1), new Date(Date.now() + 60 * 1000));
  return {
    views: rows.reduce((n, r) => n + r.views, 0),
    visitors: rows.reduce((n, r) => n + r.visitors, 0),
  };
}
