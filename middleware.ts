import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

interface JwtPayload {
  userId: string;
  email: string;
  role: string;
  exp?: number;
}

function decodeJwtPayload(token: string): JwtPayload | null {
  try {
    if (!token) return null;

    // 1. Standard 3-part JWT (header.payload.signature)
    if (token.includes('.')) {
      const parts = token.split('.');
      if (parts.length >= 2) {
        const payloadJson = atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'));
        const payload = JSON.parse(payloadJson) as JwtPayload;
        if (payload.exp && Date.now() >= payload.exp * 1000) {
          return null;
        }
        return payload;
      }
    }

    // 2. Base64 payload or mock token
    let rawStr = token;
    if (rawStr.startsWith('mock_jwt_')) {
      rawStr = rawStr.replace('mock_jwt_', '');
    }
    const decoded = atob(rawStr);
    const payload = JSON.parse(decoded) as JwtPayload;
    if (payload.exp && Date.now() >= payload.exp * 1000) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get('qeeg_session_token')?.value;
  const user = sessionCookie ? decodeJwtPayload(sessionCookie) : null;

  const isAuthPage =
    pathname === '/login' ||
    pathname === '/signup' ||
    pathname === '/forgot-password' ||
    pathname === '/reset-password';

  const isPortalPage = pathname.startsWith('/portal');
  const isReviewQueue = pathname.startsWith('/portal/review');

  // 1. If user is logged in and visits auth pages, redirect to appropriate dashboard
  if (user && isAuthPage) {
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
    '/signup',
    '/forgot-password',
    '/reset-password',
  ],
};
