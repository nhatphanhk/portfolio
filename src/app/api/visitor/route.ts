import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import { checkRateLimit, getClientIp, RATE_LIMIT_PRESETS } from '@/lib/rate-limit';

const visitorSchema = z.object({
  name: z.string().min(1).max(255),
  email: z.string().email(),
  reason: z.string().min(1).max(1000),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = visitorSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: 'Invalid data' },
        { status: 400 }
      );
    }

    const ip = getClientIp(req);

    // Rate limit: 5 requests per 10 minutes per IP
    if (!checkRateLimit(`visitor:${ip}`, RATE_LIMIT_PRESETS.FORM_SUBMIT.limit, RATE_LIMIT_PRESETS.FORM_SUBMIT.windowMs)) {
      return NextResponse.json(
        { ok: false, error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    await prisma.contact.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email,
        subject: 'Visitor Log',
        message: parsed.data.reason,
        status: 'UNREAD',
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Visitor log error:', error);
    return NextResponse.json(
      { ok: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
