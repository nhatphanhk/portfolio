import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const createAdminSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1).default('Administrator'),
});

/**
 * @swagger
 * /api/admin/create:
 *   post:
 *     summary: Create an admin account
 *     description: Creates a new admin account. Protected by an API key.
 *     tags:
 *       - Admin
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 6
 *               name:
 *                 type: string
 *                 default: Administrator
 *     responses:
 *       201:
 *         description: Admin account created successfully
 *       400:
 *         description: Invalid request payload
 *       401:
 *         description: Unauthorized (Invalid or missing API key)
 *       409:
 *         description: Email already in use
 *       500:
 *         description: Internal server error
 */
export async function POST(req: Request) {
  try {
    const apiKey = req.headers.get('x-api-key');
    const expectedKey = process.env.ADMIN_SETUP_KEY;

    if (!expectedKey) {
      return NextResponse.json(
        { error: 'Server configuration error: Setup key not configured.' },
        { status: 500 }
      );
    }

    if (apiKey !== expectedKey) {
      return NextResponse.json({ error: 'Unauthorized: Invalid API key.' }, { status: 401 });
    }

    const body = await req.json();
    const parsed = createAdminSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    const { email, password, name } = parsed.data;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ error: 'Email already in use.' }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: 'ADMIN',
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ message: 'Admin account created', user: newUser }, { status: 201 });
  } catch (error) {
    console.error('Failed to create admin:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
