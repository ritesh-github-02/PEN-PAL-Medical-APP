import createMiddleware from 'next-intl/middleware';
import { NextRequest } from 'next/server';
import { routing } from './routing';

const intlMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest) {
  const response = intlMiddleware(request);
  response.headers.set(
    'X-Robots-Tag',
    'noindex, nofollow, noarchive, nosnippet, noimageindex'
  );
  return response;
}

export const config = {
  // Match all request paths (including /intervention, /control, /admin, /join) except:
  // - API routes (/api/*)
  // - Static files (/images/*, favicon.ico, robots.txt, etc.)
  // - Next.js internal files (/_next/*, /_vercel/*)
  matcher: ['/((?!api|_next|_vercel|images|.*\\..*).*)']
};
