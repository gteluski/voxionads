import { withAuth } from 'next-auth/middleware';

export default withAuth({
  pages: {
    signIn: '/auth/login',
  },
});

export const config = {
  matcher: [
    // Protect dashboard pages and any sub-routes
    '/dashboard/:path*',
    // Protect api routes that should be restricted to authenticated admins
    '/api/dashboard/:path*',
    '/api/sync/:path*',
  ],
};
