import 'server-only';
import { unstable_cache } from 'next/cache';
import { prisma } from '@/lib/db';

/**
 * Public growth timeline (/journey): learning-journal entries, capabilities and skills reached,
 * certificates, published posts and projects merged into one dated feed, plus per-day activity
 * for the heatmap. Dates are UTC day keys, matching formatDate(), which renders in UTC.
 */

export const JOURNEY_EVENT_TYPES = ['log', 'capability', 'skill-achieved', 'skill-started', 'certification', 'post', 'project'] as const;
export type JourneyEventType = (typeof JOURNEY_EVENT_TYPES)[number];

export interface JourneyEvent {
  id: string;
  type: JourneyEventType;
  /** ISO timestamp */
  date: string;
  title: string;
  /** Skill name, issuer… */
  subtitle?: string;
  note?: string;
  href?: string;
  hours?: number;
}

export interface JourneyDay {
  count: number;
  hours: number;
}

export interface JourneyData {
  /** Newest first. */
  events: JourneyEvent[];
  /** YYYY-MM-DD → activity on that day. */
  activity: Record<string, JourneyDay>;
  years: number[];
  stats: {
    totalHours: number;
    journalEntries: number;
    capabilitiesAchieved: number;
    activeDays: number;
    currentStreak: number;
    longestStreak: number;
  };
}

const DAY_MS = 24 * 60 * 60 * 1000;
const dayKey = (d: Date | string) => new Date(d).toISOString().slice(0, 10);

function streaks(days: string[], today: string): { current: number; longest: number } {
  const set = new Set(days);
  const sorted = [...set].sort();
  let longest = 0;
  let run = 0;
  let prev: number | null = null;
  for (const d of sorted) {
    const t = Date.parse(d);
    run = prev !== null && t - prev === DAY_MS ? run + 1 : 1;
    longest = Math.max(longest, run);
    prev = t;
  }
  // The current streak may end today or yesterday (today isn't over yet).
  let cursor = Date.parse(today);
  if (!set.has(today)) cursor -= DAY_MS;
  let current = 0;
  while (set.has(new Date(cursor).toISOString().slice(0, 10))) {
    current++;
    cursor -= DAY_MS;
  }
  return { current, longest };
}

async function buildJourney(locale: 'vi' | 'en'): Promise<JourneyData> {
  const [logs, capabilities, skills, certifications, blogs, projects] = await Promise.all([
    prisma.skillLog.findMany({
      orderBy: { date: 'desc' },
      include: { skill: { select: { name: true, slug: true } } },
    }),
    prisma.skillCapability.findMany({
      where: { achievedAt: { not: null } },
      include: { skill: { select: { name: true, slug: true } } },
    }),
    prisma.skill.findMany({
      where: { OR: [{ startedAt: { not: null } }, { achievedAt: { not: null } }] },
      select: { id: true, name: true, slug: true, status: true, startedAt: true, achievedAt: true },
    }),
    prisma.certification.findMany({
      select: { id: true, name: true, issuer: true, issueDate: true },
    }),
    prisma.blog.findMany({
      where: { status: 'PUBLISHED' },
      select: { id: true, title: true, slug: true, excerpt: true, publishedAt: true, createdAt: true },
    }),
    prisma.project.findMany({
      where: { status: 'PUBLISHED' },
      select: { id: true, title: true, slug: true, description: true, publishedAt: true, createdAt: true },
    }),
  ]);

  // Posts and projects are authored in Vietnamese; use the stored English translations when asked.
  let blogTrans = new Map<string, { title?: string | null; excerpt?: string | null; description?: string | null }>();
  let projectTrans = new Map<string, { title?: string | null; excerpt?: string | null; description?: string | null }>();
  if (locale === 'en') {
    const { getBatchEntityTranslationsFromDb } = await import('@/lib/gemini-translate');
    [blogTrans, projectTrans] = await Promise.all([
      getBatchEntityTranslationsFromDb('blog', blogs.map(b => b.id), 'en'),
      getBatchEntityTranslationsFromDb('project', projects.map(p => p.id), 'en'),
    ]);
  }

  const skillHref = (slug: string | null) => (slug ? `/skills/${slug}` : '/skills');
  const events: JourneyEvent[] = [];

  for (const l of logs) {
    events.push({
      id: `log-${l.id}`,
      type: 'log',
      date: l.date.toISOString(),
      title: l.title,
      subtitle: l.skill.name,
      note: l.note || undefined,
      href: skillHref(l.skill.slug),
      hours: l.hours ?? undefined,
    });
  }
  for (const c of capabilities) {
    events.push({
      id: `cap-${c.id}`,
      type: 'capability',
      date: c.achievedAt!.toISOString(),
      title: c.statement,
      subtitle: c.skill.name,
      note: c.description || undefined,
      href: skillHref(c.skill.slug),
    });
  }
  for (const s of skills) {
    if (s.startedAt) {
      events.push({ id: `start-${s.id}`, type: 'skill-started', date: s.startedAt.toISOString(), title: s.name, href: skillHref(s.slug) });
    }
    if (s.status === 'ACHIEVED' && s.achievedAt) {
      events.push({ id: `done-${s.id}`, type: 'skill-achieved', date: s.achievedAt.toISOString(), title: s.name, href: skillHref(s.slug) });
    }
  }
  for (const c of certifications) {
    events.push({
      id: `cert-${c.id}`,
      type: 'certification',
      date: c.issueDate.toISOString(),
      title: c.name,
      subtitle: c.issuer,
      href: '/certifications',
    });
  }
  for (const b of blogs) {
    const t = blogTrans.get(b.id);
    events.push({
      id: `post-${b.id}`,
      type: 'post',
      date: (b.publishedAt ?? b.createdAt).toISOString(),
      title: (locale === 'en' && t?.title) || b.title,
      note: ((locale === 'en' && t?.excerpt) || b.excerpt) || undefined,
      href: `/blog/${b.slug}`,
    });
  }
  for (const p of projects) {
    const t = projectTrans.get(p.id);
    events.push({
      id: `project-${p.id}`,
      type: 'project',
      date: (p.publishedAt ?? p.createdAt).toISOString(),
      title: (locale === 'en' && t?.title) || p.title,
      note: ((locale === 'en' && t?.description) || p.description) || undefined,
      href: `/project/${p.slug}`,
    });
  }

  events.sort((a, b) => b.date.localeCompare(a.date));

  const activity: Record<string, JourneyDay> = {};
  for (const e of events) {
    const day = (activity[dayKey(e.date)] ??= { count: 0, hours: 0 });
    day.count++;
    day.hours += e.hours ?? 0;
  }

  const today = dayKey(new Date());
  const { current, longest } = streaks(Object.keys(activity).filter(d => d <= today), today);
  const years = [...new Set(events.map(e => Number(e.date.slice(0, 4))).concat(new Date().getUTCFullYear()))].sort((a, b) => b - a);

  return {
    events,
    activity,
    years,
    stats: {
      totalHours: Math.round(logs.reduce((n, l) => n + (l.hours ?? 0), 0) * 10) / 10,
      journalEntries: logs.length,
      capabilitiesAchieved: capabilities.length,
      activeDays: Object.keys(activity).length,
      currentStreak: current,
      longestStreak: longest,
    },
  };
}

export async function getPublicJourney(locale: 'vi' | 'en' = 'en'): Promise<JourneyData> {
  return unstable_cache(
    async () => {
      try {
        return await buildJourney(locale);
      } catch (error) {
        console.error('Error building journey:', error);
        return {
          events: [],
          activity: {},
          years: [new Date().getUTCFullYear()],
          stats: { totalHours: 0, journalEntries: 0, capabilitiesAchieved: 0, activeDays: 0, currentStreak: 0, longestStreak: 0 },
        };
      }
    },
    ['public-journey', locale],
    { revalidate: 3600, tags: ['skills', 'blogs', 'projects', 'certifications'] }
  )();
}
