import { auth } from '@/auth';

export async function ensureAdmin() {
  const session = await auth();
  
  if (!session?.user?.email) {
    throw new Error('Unauthorized');
  }

  const user = session.user as { email: string; role?: string };
  console.log('ensureAdmin check - user object:', user);

  // Accept if:
  // 1. Session role is 'admin' or 'ADMIN' (set by jwt callback for DB users with role=admin)
  // 2. Email matches ADMIN_EMAIL env var (fallback for ENV-based auth)
  const adminEmail = process.env.ADMIN_EMAIL;
  const isAdminByRole = user.role?.toUpperCase() === 'ADMIN';
  const isAdminByEmail = adminEmail && user.email === adminEmail;

  if (!isAdminByRole && !isAdminByEmail) {
    throw new Error('Forbidden');
  }

  return session.user;
}
