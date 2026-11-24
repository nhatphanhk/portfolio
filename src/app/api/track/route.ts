import { NextRequest, NextResponse, after, userAgent } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { auth } from '@/auth';
import { checkRateLimit, getClientIp, RATE_LIMIT_PRESETS } from '@/lib/rate-limit';

/**
 * First-party page-view beacon, sent by <PageViewTracker /> on every public page.
 *
 * Privacy: no cookies, no raw IP. The visitor is a daily-rotating hash of
 * ip + user agent + UTC day + TRACKING_SALT, so visits can be counted per day but not linked
 * across days or reversed. Bots, signed-in admins and admin/API paths are not recorded.
 */

const trackSchema = z.object({
  path: z.string().min(1).max(512).startsWith('/'),
  // Long referrers are truncated rather than rejected, so the view itself is still counted.
  referrer: z.string().nullish().transform(r => r?.slice(0, 2048)),
});

/** Paths that are never public pages. */
const EXCLUDED_PATH = /^\/(nhatphanhk102|admin|api|api-doc)(\/|$)/;

const RETENTION_DAYS = 365;
const NO_CONTENT = () => new NextResponse(null, { status: 204 });

async function hashVisitor(ip: string, ua: string, day: string): Promise<string> {
  const salt = process.env.TRACKING_SALT || process.env.AUTH_SECRET || '';
  const data = new TextEncoder().encode(`${ip}|${ua}|${day}|${salt}`);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest), b => b.toString(16).padStart(2, '0')).join('');
}

function toReferrerHost(referrer: string | null | undefined, selfHost: string): string | null {
  if (!referrer) return null;
  try {
    const host = new URL(referrer).hostname.replace(/^www\./, '').toLowerCase();
    if (!host || host === selfHost) return null;
    return host.slice(0, 255);
  } catch {
    return null;
  }
}

function toDevice(type: string | undefined): string {
  if (!type) return 'desktop';
  if (type === 'mobile' || type === 'tablet') return type;
  return 'other';
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  if (!checkRateLimit(`track:${ip}`, RATE_LIMIT_PRESETS.PAGE_VIEW.limit, RATE_LIMIT_PRESETS.PAGE_VIEW.windowMs)) {
    return new NextResponse(null, { status: 429 });
  }

  const ua = userAgent(req);
  if (ua.isBot) return NO_CONTENT();

  const body = await req.json().catch(() => null);
  const parsed = trackSchema.safeParse(body);
  if (!parsed.success) return new NextResponse(null, { status: 400 });

  const path = parsed.data.path.split(/[?#]/)[0] || '/';
  if (EXCLUDED_PATH.test(path)) return NO_CONTENT();

  // The site owner's own browsing would skew the numbers.
  const session = await auth().catch(() => null);
  if (session?.user) return NO_CONTENT();

  const selfHost = req.nextUrl.hostname.replace(/^www\./, '').toLowerCase();
  const referrerHost = toReferrerHost(parsed.data.referrer, selfHost);
  const country = req.headers.get('x-vercel-ip-country')?.slice(0, 2).toUpperCase() || null;
  const device = toDevice(ua.device.type);
  const browser = ua.browser.name?.slice(0, 64) || null;
  const uaString = req.headers.get('user-agent') ?? '';
  const day = new Date().toISOString().slice(0, 10);

  after(async () => {
    try {
      const visitorHash = await hashVisitor(ip, uaString, day);
      await prisma.pageView.create({
        data: { path, referrerHost, country, device, browser, visitorHash },
      });
      // Opportunistic retention cleanup (~1% of requests) instead of a cron job.
      if (Math.random() < 0.01) {
        await prisma.pageView.deleteMany({
          where: { createdAt: { lt: new Date(Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000) } },
        });
      }
    } catch (error) {
      console.error('Page view tracking error:', error);
    }
  });

  return NO_CONTENT();
}
