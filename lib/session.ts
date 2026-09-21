import type { NextResponse } from "next/server";

export const SESSION_COOKIE_NAME = 'qeeg_session_token';

export const SESSION_COOKIE_NAMES: string[] = [SESSION_COOKIE_NAME];

const SESSION_KEY_PATTERN = /(session|token|auth)/i;

/**
 * Returns true for any key that represents session/auth state so stale
 * session artifacts (cookies, localStorage keys) can be aggressively
 * removed on logout or when a session is rejected by the backend.
 */
export function isSessionLike(key: string): boolean {
  return SESSION_COOKIE_NAMES.includes(key) || SESSION_KEY_PATTERN.test(key);
}

/** 
 * Cookie attributes used to expire the session cookie. Mirrors how the
 * backend issues the cookie so the deletion reliably sticks in both
 * development (insecure) and production (secure).
 */
export function sessionCookieClearOptions() {
  const isProduction = process.env.NODE_ENV === 'production';
  return {
    path: '/',
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: isProduction,
    maxAge: 0,
  };
}

/**
 * Sets a deletion cookie on a NextResponse so the browser automatically
 * strips the session cookie when a route detects an invalid/revoked token.
 * Server-side only; the type-only NextResponse import is erased at build time.
 */
export function clearSessionCookiesOnResponse(
  response: NextResponse
): NextResponse {
  response.cookies.set(SESSION_COOKIE_NAME, "", sessionCookieClearOptions());
  return response;
}