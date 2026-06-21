import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

/**
 * @swagger
 * /api/admin/login-test:
 *   post:
 *     summary: Verify admin credentials
 *     description: Verify if the email and password are correct. This is only for testing purposes via Swagger and does not set a session cookie. To actually log in, use the UI at /admin/login.
 *     tags:
 *       - Admin
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
 *     responses:
 *       200:
 *         description: Credentials are valid
 *       400:
 *         description: Invalid request payload
 *       401:
 *         description: Unauthorized (Invalid email or password)
 *       500:
 *         description: Internal server error
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    const { email, password } = parsed.data;

    let targetHash = null;

    // Check DB first
    const dbUser = await prisma.user.findUnique({
      where: { email },
    });

    if (dbUser && dbUser.password) {
      targetHash = dbUser.password;
    } else {
      // Fallback to ENV
      const adminEmail = process.env.ADMIN_EMAIL;
      if (adminEmail && email === adminEmail) {
        targetHash = process.env.ADMIN_PASSWORD_HASH || null;
      }
    }

    if (!targetHash) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const isValid = await bcrypt.compare(password, targetHash);

    if (!isValid) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Credentials are valid! You can log in via /admin/login' 
    }, { status: 200 });

  } catch (error) {
    console.error('Failed to verify login:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
