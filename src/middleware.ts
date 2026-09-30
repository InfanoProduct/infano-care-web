import { NextResponse, type NextRequest } from 'next/server';

const US_COUNTRIES = new Set(['US', 'CA', 'UM', 'PR', 'VI', 'GU', 'AS']);
const UK_COUNTRIES = new Set(['GB', 'UK', 'IM', 'JE', 'GG']);
const FR_EU_COUNTRIES = new Set([
  'FR', 'DE', 'IT', 'ES', 'NL', 'BE', 'AT', 'IE', 'PT', 'FI', 
  'GR', 'LU', 'MC', 'AD', 'SM', 'VA', 'EE', 'LV', 'LT', 'SK', 
  'SI', 'CY', 'MT'
]);

function detectCountry(request: NextRequest): string | null {
  const cfCountry = request.headers.get('cf-ipcountry');
  if (cfCountry && cfCountry !== 'XX' && cfCountry !== 'T1') return cfCountry.toUpperCase();

  const vercelCountry = request.headers.get('x-vercel-ip-country');
  if (vercelCountry) return vercelCountry.toUpperCase();

  const customCountry = request.headers.get('x-country-code') || request.headers.get('x-real-ip-country');
  if (customCountry) return customCountry.toUpperCase();

  const cloudfrontCountry = request.headers.get('cloudfront-viewer-country');
  if (cloudfrontCountry) return cloudfrontCountry.toUpperCase();

  const geoCountry = (request as any).geo?.country;
  if (geoCountry) return String(geoCountry).toUpperCase();

  return null;
}

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // 1. Protect /admin routes
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const token = request.cookies.get('admin-token');

    if (!token) {
      const loginUrl = new URL('/admin/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 2. Identify regional prefixes /en-us, /en-uk, /en-fr, and /fr
  const prefixMatch = pathname.match(/^\/(en-us|en-uk|en-fr|fr)(\/|$)(.*)/i);
  if (prefixMatch) {
    const matchedLocale = prefixMatch[1].toLowerCase();
    const rest = prefixMatch[3] || '';

    let regionCode = 'US';
    if (matchedLocale === 'en-uk') {
      regionCode = 'UK';
    } else if (matchedLocale === 'en-fr' || matchedLocale === 'fr') {
      regionCode = 'FR';
    }

    // Rewrite internally to normalized route
    const nextUrl = request.nextUrl.clone();
    nextUrl.pathname = '/' + rest;
    nextUrl.searchParams.set('__region', regionCode);

    const response = NextResponse.rewrite(nextUrl);
    response.headers.set('x-locale', matchedLocale);
    response.headers.set('x-region', regionCode);

    // Persist region cookie if not set or mismatched
    const currentCookie = request.cookies.get('infano_region')?.value?.toUpperCase();
    if (currentCookie !== regionCode) {
      response.cookies.set('infano_region', regionCode, {
        path: '/',
        maxAge: 60 * 60 * 24 * 30, // 30 days
        sameSite: 'lax',
      });
    }

    return response;
  }

  // 3. If visiting unprefixed paths (e.g. root / or /login), check for auto-detection / redirection
  const isMarketingPath = !pathname.startsWith('/admin') && !pathname.startsWith('/api') && !pathname.startsWith('/_next');
  if (isMarketingPath) {
    const host = request.headers.get('host') || '';
    const isLocalhost = host.includes('localhost') || host.includes('127.0.0.1') || host.startsWith('192.168.');

    const country = detectCountry(request);
    const savedRegion = request.cookies.get('infano_region')?.value?.toUpperCase();

    // If GeoIP country is explicitly India (IN), do not redirect to US/UK/FR
    if (country === 'IN') {
      return NextResponse.next();
    }

    // On localhost, only redirect if an international prefix is explicitly in URL or GeoIP header is simulated
    if (isLocalhost && !country) {
      return NextResponse.next();
    }

    // If GeoIP detects international visitor on first visit (or no override)
    if (country) {
      let detectedRegion: 'US' | 'UK' | 'FR' | null = null;
      if (US_COUNTRIES.has(country)) {
        detectedRegion = 'US';
      } else if (UK_COUNTRIES.has(country)) {
        detectedRegion = 'UK';
      } else if (FR_EU_COUNTRIES.has(country)) {
        detectedRegion = 'FR';
      }

      if (detectedRegion) {
        const targetPrefix = detectedRegion === 'US' ? '/en-us' : detectedRegion === 'UK' ? '/en-uk' : '/en-fr';
        const targetPath = `${targetPrefix}${pathname === '/' ? '' : pathname}${search}`;
        const redirectUrl = new URL(targetPath, request.url);
        const response = NextResponse.redirect(redirectUrl, 307);
        response.cookies.set('infano_region', detectedRegion, {
          path: '/',
          maxAge: 60 * 60 * 24 * 30,
          sameSite: 'lax',
        });
        return response;
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/((?!api|_next|favicon.ico|.*\\..*).*)',
  ],
};

