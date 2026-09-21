"use client";

import { SESSION_COOKIE_NAME, isSessionLike } from "./session";

/**
 * Aggressively strips every session/auth artifact from the browser:
 * - all session-like cookies in document.cookie (tried with and without the
 *   Secure flag / path so it works from any origin context)
 * - session-like keys from both localStorage and sessionStorage
 *
 * Safe to call anywhere in client code (guarded against non-browser envs).
 */
export function clearSessionStateClientSide(): void {
  if (typeof window === "undefined") return;

  const names = new Set<string>([SESSION_COOKIE_NAME]);

  document.cookie.split(";").forEach((entry) => {
    const name = entry.trim().split("=")[0];
    if (name && isSessionLike(name)) {
      names.add(name);
    }
  });

  names.forEach((name) => {
    document.cookie = `${name}=; Max-Age=0; Path=/; SameSite=Lax`;
    document.cookie = `${name}=; Max-Age=0; Path=/; SameSite=Lax; Secure`;
    document.cookie = `${name}=; Max-Age=0; Path=/`;
  });

  [window.localStorage, window.sessionStorage].forEach((store) => {
    const keys: string[] = [];
    for (let i = 0; i < store.length; i++) {
      const key = store.key(i);
      if (key && isSessionLike(key)) {
        keys.push(key);
      }
    }
    keys.forEach((key) => store.removeItem(key));
  });
}