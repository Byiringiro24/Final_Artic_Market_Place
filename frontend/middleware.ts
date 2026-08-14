import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  matcher: [
    // Match all pathnames except internal Next.js files and static assets
    '/((?!_next|_vercel|.*\\..*).*)',
    '/',
  ],
};
