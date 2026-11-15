'use server';

import { z } from 'zod';
import { prisma } from '@/lib/db';
import { ensureAdmin } from '@/lib/auth-utils';
import bcrypt from 'bcryptjs';

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Vui lòng nhập mật khẩu hiện tại'),
  newPassword: z.string().min(8, 'Mật khẩu mới phải có ít nhất 8 ký tự').max(128),
});

/**
 * Changes the password of the signed-in admin (any admin, not only ADMIN_EMAIL).
 * The ENV-hash fallback account (see src/auth.ts) is materialised as a DB user on first change.
 */
export async function changePassword(prevState: unknown, formData: FormData) {
  try {
    let email: string | null | undefined;
    try {
      email = (await ensureAdmin()).email;
    } catch {
      return { error: 'Bạn không có quyền thực hiện thao tác này' };
    }
    if (!email) return { error: 'Không xác định được tài khoản' };

    const parsed = changePasswordSchema.safeParse({
      currentPassword: formData.get('currentPassword'),
      newPassword: formData.get('newPassword'),
    });
    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message || 'Dữ liệu không hợp lệ' };
    }
    const { currentPassword, newPassword } = parsed.data;
    if (currentPassword === newPassword) {
      return { error: 'Mật khẩu mới phải khác mật khẩu hiện tại' };
    }

    // The current hash is the user's own row, or the ENV hash for the fallback admin account
    const dbUser = await prisma.user.findUnique({ where: { email } });
    const isEnvAdmin = !dbUser && email === process.env.ADMIN_EMAIL;
    const currentHash = dbUser?.password || (isEnvAdmin ? process.env.ADMIN_PASSWORD_HASH : undefined);
    if (!currentHash) {
      return { error: 'Không tìm thấy mật khẩu hiện tại cho tài khoản này' };
    }

    if (!(await bcrypt.compare(currentPassword, currentHash))) {
      return { error: 'Mật khẩu hiện tại không đúng' };
    }

    const newHash = await bcrypt.hash(newPassword, 12);
    if (dbUser) {
      await prisma.user.update({ where: { id: dbUser.id }, data: { password: newHash } });
    } else {
      await prisma.user.create({
        data: { email, password: newHash, name: 'Administrator', role: 'ADMIN' },
      });
    }

    return { success: true };
  } catch (error) {
    console.error('Failed to change password:', error);
    return { error: 'Đã xảy ra lỗi, vui lòng thử lại' };
  }
}
