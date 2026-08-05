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
  // Match internationalized pathnames and gateway routes
  matcher: ['/', '/(en|es)/:path*', '/join', '/app', '/handout']
};
