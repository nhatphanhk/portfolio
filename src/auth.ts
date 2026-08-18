import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '@/lib/db';

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  secret:
    process.env.AUTH_SECRET ||
    process.env.NEXTAUTH_SECRET ||
    '6b4c107144e59046c827c81a2e316a81b37996a60e0a30bc4a5b48bc0a1331ba',
  providers: [
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const parsed = credentialsSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;

        try {
          const dbUser = await prisma.user.findUnique({
            where: { email }
          });
          
          if (dbUser && dbUser.password) {
            const isValid = await bcrypt.compare(password, dbUser.password);
            if (isValid) {
              return {
                id: dbUser.id,
                email: dbUser.email,
                name: dbUser.name,
                role: dbUser.role,
              };
            }
            return null;
          }
        } catch (e) {
          console.warn("DB not reachable or user query failed, falling back to ENV hash.", e);
        }

        const adminEmail = process.env.ADMIN_EMAIL;
        const targetHash = process.env.ADMIN_PASSWORD_HASH;
        
        if (adminEmail && targetHash && email === adminEmail) {
          const isValid = await bcrypt.compare(password, targetHash);
          if (isValid) {
            return {
              id: 'admin',
              email: adminEmail,
              name: 'Administrator',
              role: 'admin',
            };
          }
        }

        return null;
      },
    }),
  ],
});
