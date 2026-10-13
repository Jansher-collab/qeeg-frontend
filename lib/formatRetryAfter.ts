/**
 * Renders the account rate-limit wait time returned by the backend (429 +
 * `retryAfterSeconds`) into the user-facing "try again in N minutes" wording.
 * Used by the practitioner and admin login forms.
 */
export function formatRetryAfter(seconds: number | null | undefined): string {
  const total = Math.max(0, Math.ceil(seconds || 0));
  if (total <= 0) return "Please try again shortly.";
  if (total < 60) {
    return `Try again in ${total} second${total === 1 ? "" : "s"}.`;
  }
  const minutes = Math.round(total / 60);
  if (minutes < 60) {
    return `Try again in ${minutes} minute${minutes === 1 ? "" : "s"}.`;
  }
  const hours = Math.round(minutes / 60);
  return `Try again in approximately ${hours} hour${hours === 1 ? "" : "s"}.`;
}