const CASE_REF_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
const CASE_REF_SUFFIX_LENGTH = 5;

export const CASE_REFERENCE_PATTERN = /^CASE-[A-Z2-9]{5}$/;

function secureRandomIndex(max: number): number {
  if (typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function") {
    const buf = new Uint32Array(1);
    crypto.getRandomValues(buf);
    return buf[0] % max;
  }
  return Math.floor(Math.random() * max);
}

/**
 * Generates a unique, non-identifying Case Reference in the form `CASE-A73K9`.
 * The 5-character suffix uses a visually unambiguous alphabet (no 0/1/I/L/O)
 * and is generated in the browser only when the QEEG reliability gate passes.
 * This single reference is shared across the QEEG, TOVA and Symptom Checklist.
 */
export function generateCaseReference(): string {
  let suffix = "";
  for (let i = 0; i < CASE_REF_SUFFIX_LENGTH; i++) {
    suffix += CASE_REF_ALPHABET[secureRandomIndex(CASE_REF_ALPHABET.length)];
  }
  return `CASE-${suffix}`;
}

export function isCaseReference(value: string): boolean {
  return CASE_REFERENCE_PATTERN.test(value);
}