import { NextResponse, type NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Protect /admin routes
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const token = request.cookies.get('admin-token');

    if (!token) {
      const loginUrl = new URL('/admin/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 2. Identify regional prefixes /en-us and /en-uk
  const match = pathname.match(/^\/(en-us|en-uk)(\/|$)(.*)/i);
  if (match) {
    const locale = match[1].toLowerCase();
    const rest = match[3];

    // Rewrite internally to the normalized route
    const url = new URL('/' + rest, request.url);
    url.searchParams.set('__region', locale === 'en-us' ? 'US' : 'UK');
    
    const response = NextResponse.rewrite(url);
    response.headers.set('x-locale', locale);
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/((?!api|_next|favicon.ico|.*\\..*).*)',
  ],
};
