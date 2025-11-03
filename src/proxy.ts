import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware to protect admin routes
 * This runs before any admin route is accessed
 */
export function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Check if the path starts with /admin (case-insensitive)
  if (path.toLowerCase().startsWith('/admin')) {
    // Check for authentication token in cookies
    const token = request.cookies.get('auth-token')?.value;
    const sessionToken = request.cookies.get('session-token')?.value;

    // If no authentication token exists, redirect to login
    // TODO: Replace this with your actual authentication logic
    if (!token && !sessionToken) {
      // You can redirect to a login page once you implement authentication
      // For now, we'll allow access but you should implement proper auth

      // Uncomment this when you have a login page:
      // return NextResponse.redirect(new URL('/login', request.url));

      // For development, add a warning header
      const response = NextResponse.next();
      response.headers.set(
        'X-Auth-Warning',
        'Admin routes should be protected'
      );
      return response;
    }

    // Optional: Verify token validity here
    // You could make an API call to verify the token
    // or decode a JWT token to check expiration

    // Allow access if authenticated
    return NextResponse.next();
  }

  // Allow all other routes
  return NextResponse.next();
}

/**
 * Configure which paths the middleware should run on
 * This pattern matches all /admin routes and their sub-routes
 */
export const config = {
  matcher: [
    /*
     * Match all request paths starting with /admin
     * - /admin
     * - /admin/blogs
     * - /admin/projects
     * etc.
     */
    '/admin/:path*',
    // You can add more patterns here if needed
  ],
};
