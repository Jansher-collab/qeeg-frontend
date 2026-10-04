/**
 * Field-level FORMAT validation for the practitioner Signup / Register form.
 *
 * SCOPE: this module is used by `app/signup/page.tsx` ONLY. It is deliberately
 * not shared with the portal report-request checklist, the practitioner
 * profile form, or anything in the payment/billing path.
 *
 * Rules are duplicated from `backend/lib/services/formValidation.ts`
 * (`validateSignupFieldFormats`). The two repositories cannot import from each
 * other, so the rules must be kept in sync manually - the backend tests lock
 * the server-side copy.
 */

/** Per-field validation messages, keyed by form field name. */
export type FieldErrors = Record<string, string>;

/** The submit-time shape of the signup form. */
export interface SignupFormValues {
  fullName: string;
  professionalTitle: string;
  profession: string;
  providerNumber: string;
  clinicName: string;
  practiceAddress: string;
  phone: string;
  email: string;
  password: string;
}

/**
 * Every field below is mandatory. All of them are rendered into the generated
 * report header, and `professionalTitle` is additionally required by
 * `checklist-definition.json`, so a blank permanently blocks case submission.
 */
export const REQUIRED_FIELD_LABELS: Record<keyof SignupFormValues, string> = {
  fullName: "Full Name & Post-Nominals",
  professionalTitle: "Professional Title / Credentials",
  profession: "Profession / Registration Type",
  providerNumber: "Registration / Provider Number",
  clinicName: "Practice / Clinic Name",
  practiceAddress: "Practice Address",
  phone: "Practice Contact Phone",
  email: "Login & Notification Email",
  password: "Password",
};

/** Minimum acceptable password length. */
export const MIN_PASSWORD_LENGTH = 8;

/** Minimum number of digits a plausible phone number must contain. */
const MIN_PHONE_DIGITS = 7;

/**
 * Phone: digits, spaces, +, - and parentheses ONLY. Letters are rejected
 * explicitly (with their own message) because "abc" in a phone field is a
 * common typo the browser's `type="tel"` will happily accept.
 */
const PHONE_ALLOWED = /^[0-9+()\-\s]+$/;
const PHONE_HAS_LETTER = /[A-Za-z]/;

/**
 * Provider number: alphanumeric, plus space / hyphen / slash. Letters are
 * explicitly ALLOWED here (AHPRA registrations such as MED0001234567, or the
 * "PR-88921-VIC / PSY000123" format) - only stray symbols are rejected.
 */
const PROVIDER_NUMBER_ALLOWED = /^[A-Za-z0-9\s\-\/]+$/;

/**
 * Email: local@domain.tld. Deliberately stricter than the server's historical
 * check - a double dot or a leading dot in the local part is always a typo,
 * and this account is the login identity, so it is worth catching up front.
 */
const EMAIL_SHAPE = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}$/;
const EMAIL_HAS_BAD_LOCAL_DOTS =
  /^\.|\.$|\.\./;

/** Validates the phone number's character set and digit count. */
export function validatePhone(raw: string): string | null {
  const value = raw.trim();
  if (value === "") return null; // absence is reported as "required" elsewhere
  if (PHONE_HAS_LETTER.test(value)) {
    return "Please enter a valid phone number without letters.";
  }
  if (!PHONE_ALLOWED.test(value)) {
    return "Please enter a valid phone number (digits, spaces, +, - and parentheses only).";
  }
  if (value.replace(/\D/g, "").length < MIN_PHONE_DIGITS) {
    return `Practice Contact Phone must contain at least ${MIN_PHONE_DIGITS} digits.`;
  }
  return null;
}

/** Validates the registration / provider number's character set. */
export function validateProviderNumber(raw: string): string | null {
  const value = raw.trim();
  if (value === "") return null; // absence is reported as "required" elsewhere
  if (!PROVIDER_NUMBER_ALLOWED.test(value)) {
    return "Please use letters, numbers, spaces, hyphens or slashes only (e.g. MED0001234567).";
  }
  return null;
}

/** Validates the email address shape. */
export function validateEmail(raw: string): string | null {
  const value = raw.trim();
  if (value === "") return null; // absence is reported as "required" elsewhere
  if (EMAIL_HAS_BAD_LOCAL_DOTS.test(value.split("@")[0] ?? "")) {
    return "Please enter a valid email address (e.g. practitioner@clinic.com.au).";
  }
  if (!EMAIL_SHAPE.test(value)) {
    return "Please enter a valid email address (e.g. practitioner@clinic.com.au).";
  }
  return null;
}

/** Validates the minimum password length. */
export function validatePassword(raw: string): string | null {
  if (raw === "") return null; // absence is reported as "required" elsewhere
  if (raw.length < MIN_PASSWORD_LENGTH) {
    return `Password must be at least ${MIN_PASSWORD_LENGTH} characters long.`;
  }
  return null;
}

/**
 * Runs every signup rule and returns the complete set of field-level errors.
 *
 * All errors are collected in one pass so the practitioner sees every problem
 * at once, rather than fixing them one submit cycle at a time.
 *
 * @param values        current form values
 * @param agreements    the two mandatory legal acceptances
 */
export function validateSignupForm(
  values: SignupFormValues,
  agreements: { dpa: boolean; eula: boolean }
): FieldErrors {
  const errors: FieldErrors = {};

  // 1. Mandatory presence.
  for (const [key, label] of Object.entries(REQUIRED_FIELD_LABELS) as [
    keyof SignupFormValues,
    string,
  ][]) {
    if (values[key].trim() === "") {
      errors[key] = `${label} is required.`;
    }
  }

  // 2. Field-specific formats - only for fields that are actually present, so
  //    an empty field never reports both "required" AND a format complaint.
  if (!errors.phone) {
    const phoneError = validatePhone(values.phone);
    if (phoneError) errors.phone = phoneError;
  }
  if (!errors.providerNumber) {
    const providerError = validateProviderNumber(values.providerNumber);
    if (providerError) errors.providerNumber = providerError;
  }
  if (!errors.email) {
    const emailError = validateEmail(values.email);
    if (emailError) errors.email = emailError;
  }
  if (!errors.password) {
    const passwordError = validatePassword(values.password);
    if (passwordError) errors.password = passwordError;
  }

  // 3. Statutory agreements - mandatory, and must be affirmatively ticked.
  if (!agreements.dpa) {
    errors.dpa = "You must accept the Data Processing Agreement to continue.";
  }
  if (!agreements.eula) {
    errors.eula = "You must accept the End User Licence Agreement to continue.";
  }

  return errors;
}

/**
 * Order in which invalid fields are focused after a failed submit, so the
 * practitioner lands on the first thing that needs fixing.
 */
export const FIELD_FOCUS_ORDER: (keyof SignupFormValues | "dpa" | "eula")[] = [
  "fullName",
  "professionalTitle",
  "profession",
  "providerNumber",
  "clinicName",
  "practiceAddress",
  "phone",
  "email",
  "password",
  "dpa",
  "eula",
];

/** The first invalid field in focus order, or null when the form is valid. */
export function firstInvalidField(errors: FieldErrors): string | null {
  for (const key of FIELD_FOCUS_ORDER) {
    if (errors[key]) return key;
  }
  return null;
}
