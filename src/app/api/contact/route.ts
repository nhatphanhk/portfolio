import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { checkRateLimit, getClientIp, RATE_LIMIT_PRESETS } from '@/lib/rate-limit';
import { prisma } from '@/lib/db';

const contactSchema = z.object({
  name: z.string().min(2).max(255),
  email: z.string().email().max(255),
  subject: z.string().min(3).max(255),
  message: z.string().min(10).max(5000),
});

/**
 * POST /api/contact
 * Public endpoint — submit the contact form.
 * Rate limited to 5 submissions per 10 minutes per IP; messages are stored in the contacts table
 * and show up in the admin inbox. Email notification is still a TODO.
 */
export async function POST(req: NextRequest) {
  try {
    // Get client IP for logging and rate limiting
    const ip = getClientIp(req);

    // Rate limit: 5 requests per 10 minutes per IP (enforced before body parsing to prevent DoS)
    if (!checkRateLimit(`contact:${ip}`, RATE_LIMIT_PRESETS.FORM_SUBMIT.limit, RATE_LIMIT_PRESETS.FORM_SUBMIT.windowMs)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: 'Too many requests. Please try again later.',
          },
        },
        { status: 429 }
      );
    }

    const body = await req.json().catch(() => null);
    if (body === null) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_JSON', message: 'Request body must be JSON' } },
        { status: 400 }
      );
    }
    const parsed = contactSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid request data',
            details: parsed.error.flatten().fieldErrors,
          },
        },
        { status: 422 }
      );
    }

    const { name, email, subject, message } = parsed.data;


    await prisma.contact.create({
      data: {
        name,
        email,
        subject,
        message,
        ipAddress: ip !== 'unknown' ? ip : null,
        userAgent: req.headers.get('user-agent') || null,
      },
    });

    // TODO (Phase 2): Send email via Nodemailer/Resend

    return NextResponse.json(
      {
        success: true,
        data: { message: 'Your message has been received. Thank you!' },
      },
      { status: 200 }
    );
  } catch (err) {
    console.error('[Contact API Error]', err);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An unexpected error occurred. Please try again later.',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
