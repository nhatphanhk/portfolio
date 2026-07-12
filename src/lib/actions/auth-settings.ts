'use server';

import { z } from 'zod';
import { prisma } from '@/lib/db';
import { auth } from '@/auth';
import bcrypt from 'bcryptjs';

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
});

export async function changePassword(prevState: any, formData: FormData) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return { error: 'Not authenticated' };
    }

    const adminEmail = process.env.ADMIN_EMAIL;
    if (session.user.email !== adminEmail) {
      return { error: 'Unauthorized email' };
    }

    const currentPassword = formData.get('currentPassword') as string;
    const newPassword = formData.get('newPassword') as string;

    const parsed = changePasswordSchema.safeParse({
      currentPassword,
      newPassword,
    });
    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message || 'Validation failed' };
    }

    // Determine current valid hash
    let dbUser = await prisma.user.findUnique({ where: { email: adminEmail } });
    let currentHash = dbUser?.password || process.env.ADMIN_PASSWORD_HASH;

    if (!currentHash) {
      return { error: 'Server configuration error: No password hash found' };
    }

    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, currentHash);
    if (!isValid) {
      return { error: 'Incorrect current password' };
    }

    // Hash the new password
    const newHash = await bcrypt.hash(newPassword, 12);

    // Save to database
    if (dbUser) {
      await prisma.user.update({
        where: { email: adminEmail },
        data: { password: newHash },
      });
    } else {
      // First time overriding ENV, create the user in DB
      await prisma.user.create({
        data: {
          email: adminEmail,
          password: newHash,
          name: 'Administrator',
          role: 'ADMIN',
        },
      });
    }

    return { success: true };
  } catch (error) {
    console.error('Failed to change password:', error);
    return { error: 'Internal server error' };
  }
}
