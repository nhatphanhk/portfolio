import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
  trustHost: true,
  pages: {
    signIn: '/nhatphanhk102/login',
    error: '/nhatphanhk102/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 60 * 60 * 24, // 24 hours
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isAdminRoute = nextUrl.pathname.startsWith('/nhatphanhk102');
      const isLoginPage = nextUrl.pathname === '/nhatphanhk102/login';

      if (isAdminRoute && !isLoginPage) {
        if (isLoggedIn) return true;
        return false; // redirect to signIn page
      }

      if (isLoginPage && isLoggedIn) {
        return Response.redirect(new URL('/nhatphanhk102', nextUrl));
      }

      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as { role?: string }).role ?? 'user';
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { role?: string; id?: string }).role = token.role as string;
        (session.user as { id?: string }).id = token.id as string;
      }
      return session;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
