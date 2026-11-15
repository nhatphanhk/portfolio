import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'node:crypto';
import { prisma } from '@/lib/db';
import { auth } from '@/auth';
import { checkRateLimit, getClientIp, RATE_LIMIT_PRESETS } from '@/lib/rate-limit';

interface Params {
  params: Promise<{ id: string }>;
}

const VISITOR_COOKIE = 'blog_visitor_id';
const sha256 = (value: string) => createHash('sha256').update(value).digest('hex').slice(0, 32);

export async function POST(req: NextRequest, { params }: Params) {
  try {
    const ip = getClientIp(req);

    // Rate limit: 15 view tracking requests per minute per IP
    if (!checkRateLimit(`view:${ip}`, RATE_LIMIT_PRESETS.VIEW_TRACKING.limit, RATE_LIMIT_PRESETS.VIEW_TRACKING.windowMs)) {
      return NextResponse.json({ ok: false, error: 'Rate limit exceeded' }, { status: 429 });
    }

    const { id: blogId } = await params;
    if (!blogId) {
      return NextResponse.json({ ok: false, error: 'Missing blogId' }, { status: 400 });
    }

    // Only published posts collect views (drafts would otherwise be countable by id)
    const blog = await prisma.blog.findUnique({ where: { id: blogId }, select: { status: true } });
    if (!blog || blog.status !== 'PUBLISHED') {
      return NextResponse.json({ ok: false, error: 'Blog post not found' }, { status: 404 });
    }

    // 1. Exclude admin views from inflating metrics
    const session = await auth();
    const userRole = (session?.user as { role?: string } | undefined)?.role?.toUpperCase();
    if (userRole === 'ADMIN' || userRole === 'SUPER_ADMIN') {
      return NextResponse.json({ ok: true, isAdmin: true, counted: false });
    }

    // 2. Identify the visitor. Signed-in users by id; anonymous visitors by their cookie, or,
    //    without one, by a daily hash of IP + user agent so that dropping the cookie does not
    //    mint a fresh view on every request. Raw IPs are never stored.
    const userAgent = req.headers.get('user-agent') || '';
    const day = new Date().toISOString().slice(0, 10);
    const fingerprint = `anon:${sha256(`${ip}|${userAgent}|${day}`)}`;

    let identifier = session?.user?.id || session?.user?.email;
    let newVisitorId = '';
    if (!identifier) {
      const visitorCookie = req.cookies.get(VISITOR_COOKIE)?.value?.trim();
      if (visitorCookie) {
        identifier = visitorCookie;
      } else {
        identifier = fingerprint;
        newVisitorId = crypto.randomUUID();
      }
    }

    // 3. Already counted for this identifier (or this device today)?
    const existing = await prisma.blogView.findFirst({
      where: { blogId, identifier: { in: newVisitorId ? [identifier, fingerprint] : [identifier] } },
      select: { id: true },
    });

    const res = NextResponse.json({ ok: true, isNewView: !existing, counted: !existing });
    if (newVisitorId) {
      res.cookies.set(VISITOR_COOKIE, newVisitorId, {
        path: '/',
        maxAge: 60 * 60 * 24 * 365, // 1 year
        sameSite: 'lax',
        httpOnly: true,
      });
    }
    if (existing) return res;

    // 4. Record the view and atomically increment blog.viewCount. A brand-new visitor gets both
    //    the fingerprint row and the cookie row so the next request (now carrying the cookie)
    //    is not counted a second time.
    const rows = [{ blogId, identifier, ipAddress: sha256(ip), userAgent: userAgent.slice(0, 255) || undefined }];
    if (newVisitorId) rows.push({ ...rows[0], identifier: newVisitorId });

    const [, updatedBlog] = await prisma.$transaction([
      prisma.blogView.createMany({ data: rows, skipDuplicates: true }),
      prisma.blog.update({
        where: { id: blogId },
        data: { viewCount: { increment: 1 } },
        select: { viewCount: true },
      }),
    ]);

    return NextResponse.json(
      { ok: true, isNewView: true, counted: true, viewCount: updatedBlog.viewCount },
      { headers: res.headers }
    );
  } catch (error: unknown) {
    const code = (error as { code?: string } | null)?.code;
    // Concurrent unique-constraint collision: the view is already recorded
    if (code === 'P2002') {
      return NextResponse.json({ ok: true, isNewView: false, counted: false });
    }
    if (code === 'P2025') {
      return NextResponse.json({ ok: false, error: 'Blog post not found' }, { status: 404 });
    }
    console.error('Error tracking blog view:', error);
    return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 });
  }
}
