import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { checkRateLimit } from '@/lib/rate-limit';

const contactSchema = z.object({
  name: z.string().min(2).max(255),
  email: z.string().email().max(255),
  subject: z.string().min(3).max(255),
  message: z.string().min(10).max(5000),
});

/**
 * POST /api/contact
 * Public endpoint — submit the contact form.
 * Rate limit: enforced via middleware (5 per hour per IP in production).
 *
 * In MVP, logs to console and stores in-memory.
 * In production, integrate with email service (Nodemailer/Resend).
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
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

    // Get client IP for logging and rate limiting
    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
      req.headers.get('x-real-ip') ??
      'unknown';

    // Rate limit: 5 requests per 10 minutes per IP
    if (!checkRateLimit(ip, 5, 10 * 60 * 1000)) {
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

    // In MVP: log the message
    // In production: store in DB + send email notification
    console.log('[Contact Form Submission]', {
      name,
      email,
      subject,
      messagePreview: message.slice(0, 100),
      ip,
      timestamp: new Date().toISOString(),
    });

    // TODO (Phase 2): Send email via Nodemailer/Resend
    // TODO (Phase 2): Save to database via Prisma

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
