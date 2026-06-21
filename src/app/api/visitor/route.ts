import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const visitorSchema = z.object({
  name: z.string().min(1).max(255),
  email: z.string().email(),
  reason: z.string().min(1).max(1000),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = visitorSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: 'Invalid data' },
        { status: 400 }
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
