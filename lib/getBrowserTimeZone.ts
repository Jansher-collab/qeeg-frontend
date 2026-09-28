"use client";

/**
 * Returns the user's browser IANA timezone, e.g. "Australia/Sydney" or
 * "Asia/Karachi", read from Intl.DateTimeFormat().resolvedOptions().timeZone.
 * Returns "" when the browser exposes none (rare); callers should treat the
 * empty string as "no timezone supplied" so the backend falls back to the
 * business' default zone.
 */
export function getBrowserTimeZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "";
  } catch {
    return "";
  }
}