"use client";

/**
 * Practitioner sign-in route.
 *
 * Deliberately re-exports the existing practitioner login page so the email +
 * password + 2FA flow (and its dashboard redirect) stays a single, shared
 * implementation — /login and /login/practitioner are the exact same form.
 */
import PractitionerLoginPage from "../page";

export default PractitionerLoginPage;
