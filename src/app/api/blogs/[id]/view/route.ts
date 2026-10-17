import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/auth';
import { checkRateLimit, getClientIp, RATE_LIMIT_PRESETS } from '@/lib/rate-limit';

interface Params {
  params: Promise<{ id: string }>;
}

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

    // 1. Exclude Admin views from inflating metrics
    const session = await auth();
    const userRole = (session?.user as { role?: string } | undefined)?.role;
    const isAdmin =
      userRole === 'ADMIN' ||
      userRole === 'SUPER_ADMIN' ||
      userRole === 'admin';

    if (isAdmin) {
      return NextResponse.json({ ok: true, isAdmin: true, counted: false });
    }

    // 2. Identify user / visitor
    let identifier = session?.user?.id || session?.user?.email;
    let newVisitorId = '';

    if (!identifier) {
      const visitorCookie = req.cookies.get('blog_visitor_id')?.value;
      if (visitorCookie && visitorCookie.trim().length > 0) {
        identifier = visitorCookie.trim();
      } else {
        newVisitorId = crypto.randomUUID();
        identifier = newVisitorId;
      }
    }

    // 3. Check if unique view already logged
    const existing = await prisma.blogView.findUnique({
      where: {
        blogId_identifier: {
          blogId,
          identifier,
        },
      },
    });

    if (existing) {
      const res = NextResponse.json({
        ok: true,
        isNewView: false,
        counted: false,
      });
      if (newVisitorId) {
        res.cookies.set('blog_visitor_id', newVisitorId, {
          path: '/',
          maxAge: 60 * 60 * 24 * 365, // 1 year
          sameSite: 'lax',
          httpOnly: true,
        });
      }
      return res;
    }

    // 4. Create new view record and atomically increment blog.viewCount
    const ipAddress = getClientIp(req);
    const userAgent = req.headers.get('user-agent') || undefined;

    const [, updatedBlog] = await prisma.$transaction([
      prisma.blogView.create({
        data: {
          blogId,
          identifier,
          ipAddress,
          userAgent,
        },
      }),
      prisma.blog.update({
        where: { id: blogId },
        data: { viewCount: { increment: 1 } },
        select: { viewCount: true },
      }),
    ]);

    const res = NextResponse.json({
      ok: true,
      isNewView: true,
      counted: true,
      viewCount: updatedBlog.viewCount,
    });

    if (newVisitorId) {
      res.cookies.set('blog_visitor_id', newVisitorId, {
        path: '/',
        maxAge: 60 * 60 * 24 * 365, // 1 year
        sameSite: 'lax',
        httpOnly: true,
      });
    }

    return res;
  } catch (error: any) {
    // Graceful handling of concurrent unique constraint collision (P2002)
    if (error?.code === 'P2002') {
      return NextResponse.json({ ok: true, isNewView: false, counted: false });
    }
    // If blog record is missing (P2025)
    if (error?.code === 'P2025') {
      return NextResponse.json({ ok: false, error: 'Blog post not found' }, { status: 404 });
    }
    console.error('Error tracking blog view:', error);
    return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 });
  }
}
