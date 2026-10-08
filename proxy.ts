import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { SESSION_COOKIE_NAME, sessionCookieClearOptions } from './lib/session';

interface JwtPayload {
  userId: string;
  email: string;
  role: string;
  exp?: number;
}

function decodeJwtPayload(token: string): JwtPayload | null {
  try {
    if (!token) return null;

    // Only accept standard 3-part JWT (header.payload.signature)
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const payloadJson = atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'));
    const payload = JSON.parse(payloadJson) as JwtPayload;
    if (payload.exp && Date.now() >= payload.exp * 1000) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  const isAuthPage =
    pathname === '/login' ||
    pathname === '/login/admin' ||
    pathname === '/login/practitioner' ||
    pathname === '/signup' ||
    pathname === '/forgot-password' ||
    pathname === '/reset-password';

  const isPortalPage = pathname.startsWith('/portal');
  const isReviewQueue = pathname.startsWith('/portal/review');

  // Decode the session token strictly. A malformed, expired, or mock token
  // is treated as no session at all and is explicitly evicted so old cookies
  // never leak through to a dashboard or trap a user on an auth page.
  const tokenPayload = sessionCookie ? decodeJwtPayload(sessionCookie) : null;
  const hasStaleCookie = !!sessionCookie && tokenPayload === null;

  if (hasStaleCookie && isPortalPage) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    const redirect = NextResponse.redirect(loginUrl);
    redirect.cookies.set(SESSION_COOKIE_NAME, '', sessionCookieClearOptions());
    return redirect;
  }

  if (hasStaleCookie) {
    // Auth pages (and everywhere else): evict the stale cookie and keep going.
    const response = NextResponse.next();
    response.cookies.set(SESSION_COOKIE_NAME, '', sessionCookieClearOptions());
    return response;
  }

  const user = tokenPayload;

  // 1. If user is logged in and visits auth pages, redirect to appropriate dashboard
  if (user && isAuthPage) {
    // An ADMIN who is already signed in and lands on the admin login goes
    // straight to the admin portal rather than the review queue.
    if (pathname === '/login/admin' && user.role === 'ADMIN') {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
    if (user.role === 'NEUROSCIENTIST' || user.role === 'ADMIN') {
      return NextResponse.redirect(new URL('/portal/review', request.url));
    }
    return NextResponse.redirect(new URL('/portal', request.url));
  }

  // 2. If user is not logged in and tries to access portal routes, redirect to login
  if (!user && isPortalPage) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 3. If practitioner tries to access the neuroscientist review queue, redirect to practitioner portal
  if (user && isReviewQueue) {
    if (user.role !== 'NEUROSCIENTIST' && user.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/portal', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/portal/:path*',
    '/login',
    '/login/admin',
    '/login/practitioner',
    '/signup',
    '/forgot-password',
    '/reset-password',
  ],
};
