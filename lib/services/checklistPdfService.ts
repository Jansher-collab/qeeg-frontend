import { PDFDocument, rgb, StandardFonts, type PDFFont, type PDFPage } from 'pdf-lib';
import { Encodings } from '@pdf-lib/standard-fonts';

/**
 * Fallback fee only — used when no live fee is passed in. The portal always
 * passes the active admin-configured fee fetched from /api/config so the
 * printed checklist can never disagree with what is actually charged.
 */
export const DEFAULT_REPORT_FEE_AUD = 65;

/**
 * Fee placeholder used in the active checklist definition's copy. It is
 * substituted with the live fee at render time so the printed amount always
 * matches what is charged. Kept identical to the backend token in
 * `checklistDefinition.ts`.
 */
const REPORT_FEE_TOKEN = '{{REPORT_FEE}}';

export interface PractitionerChecklistDetails {
  fullName: string;
  professionalTitle?: string;
  profession?: string;
  providerNumber?: string;
  clinicName?: string;
  practiceAddress?: string;
  phone?: string;
  practiceEmail?: string;
  email?: string;
}

export interface ChecklistDomain {
  num: number;
  key: string;
  page: number;
  title: string;
  desc: string;
}

export interface ChecklistSectionField {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'checkbox' | 'date' | 'select';
  required?: boolean;
  readonly?: boolean;
  locked?: boolean;
  source?: string;
  placeholder?: string;
  detail?: string;
  options?: { value: string; label: string }[];
}

export interface ChecklistSection {
  key: string;
  title: string;
  kind?: 'fields' | 'domains' | 'static';
  readonly?: boolean;
  locked?: boolean;
  required?: boolean;
  insight?: string;
  domainPage?: number;
  lines?: string[];
  fields?: ChecklistSectionField[];
}

/**
 * Options used to complete the checklist with the exact same data captured in
 * the live HTML form (one Case Reference shared across QEEG, TOVA & checklist).
 *
 * The generator is fully schema-driven: it enumerates `sections` in order and
 * renders every field in `section.fields`. Values are read from `fieldValues`
 * (keyed by field key) first, then from the source bindings below, so any
 * custom field authored in the admin Form Builder is rendered with its value
 * without a code change.
 */
export interface CompletedChecklistPdfOptions {
  caseReference: string;
  age?: string | number | null;
  gender?: string | null;
  handedness?: string | null;
  reliabilityScore?: string | number | null;
  checklistScores?: Record<string, number>;
  domains?: ChecklistDomain[];
  likert?: Record<string, string>;
  /** Active checklist definition sections, rendered from first to last. */
  sections?: ChecklistSection[];
  /**
   * Generic value map keyed by field key. Checkboxes carry booleans; every
   * text/textarea/date/select field carries its string value. This is the
   * primary, schema-agnostic channel that lets admin-authored custom fields
   * reach the PDF.
   */
  fieldValues?: Record<string, string | boolean>;
  /** QEEG recording condition: 'EC' | 'EO' | 'TOVA'. */
  recordingCondition?: string | null;
  /**
   * Raw case-bound data keyed by the source suffix (e.g. `newCaseData`), so a
   * custom field bound to an arbitrary `case.<key>` source resolves without a
   * hardcoded allow-list. Explicit named fields below remain as fallbacks.
   */
  caseData?: Record<string, unknown>;
  /** Recording-quality declaration checkbox flags (keyed quality_1..quality_4). */
  qualityChecks?: Record<string, boolean>;
  /** Additional clinical notes & medications captured in the live HTML form. */
  additionalNotes?: string;
  /** Gates recorded agreement ack boxes alongside `submittedAt`. */
  serviceAgreementAcknowledged?: boolean;
  paymentAuthorisationAcknowledged?: boolean;
  /** Typed practitioner signature (overrides the authenticated name default). */
  signature?: string;
  /** Sign-off date, YYYY-MM-DD or DD/MM/YYYY. */
  dateSigned?: string;
  /** Present once the report has been submitted; gates recorded agreement ack boxes. */
  submittedAt?: string;
}

const DEFAULT_LIKERT_LABELS = ['Absent', 'Mild', 'Mod', 'Marked', 'Severe'];

const DEFAULT_DOMAINS: ChecklistDomain[] = [
  { num: 1, key: 'domain_1', page: 2, title: '1. Inattention', desc: 'Sustained focus deficit, distractibility, carelessness, task persistence failure' },
  { num: 2, key: 'domain_2', page: 2, title: '2. Hyperactivity / Impulsivity', desc: 'Motor restlessness, impulse delay failure, verbal interruption, psychomotor agitation' },
  { num: 3, key: 'domain_3', page: 2, title: '3. Anxiety', desc: 'Generalized worry, autonomic hyperarousal, panic episodes, somatic muscle tension' },
  { num: 4, key: 'domain_4', page: 2, title: '4. Mood / Depression', desc: 'Persistent low mood, anhedonia, emotional lability, motivational withdrawal' },
  { num: 5, key: 'domain_5', page: 2, title: '5. Rumination', desc: 'Repetitive negative thinking, cognitive hyper-fixation, perseveration, intrusive thoughts' },
  { num: 6, key: 'domain_6', page: 3, title: '6. Emotional Regulation', desc: 'Affective volatility, low frustration tolerance, explosive dysregulation, mood reactivity' },
  { num: 7, key: 'domain_7', page: 3, title: '7. Sleep Difficulties', desc: 'Sleep onset latency > 45m, frequent nocturnal waking, non-restorative sleep, diurnal fatigue' },
  { num: 8, key: 'domain_8', page: 3, title: '8. Executive Function / Organisation', desc: 'Working memory deficit, mental flexibility, sequencing slowing, planning friction' },
  { num: 9, key: 'domain_9', page: 3, title: '9. Oppositional / Behavioural Difficulties', desc: 'Defiance, rule-testing, reactivity, behavioral impulse control deficit, conduct friction' },
  { num: 10, key: 'domain_10', page: 3, title: '10. Social Difficulties', desc: 'Pragmatic language friction, social cue interpretation delay, interpersonal withdrawal' },
  { num: 11, key: 'domain_11', page: 3, title: '11. Sensory Processing', desc: 'Auditory / visual / tactile hypersensitivity, photophobia, sensory overload gating delay' },
];

/**
 * Built-in definition used only when no active schema is supplied (e.g. the
 * checklist config fetch failed). Mirrors backend/config/checklist-definition.json
 * so a blank PDF still renders with the correct structure.
 */
const DEFAULT_SECTIONS: ChecklistSection[] = [
  {
    key: 'referring_practitioner',
    title: '1. Referring Practitioner Details (authenticated pre-fill)',
    kind: 'fields',
    readonly: true,
    required: true,
    fields: [
      { key: 'practitioner_full_name', label: 'Practitioner Full Name *', type: 'text', required: true, source: 'profile.fullName' },
      { key: 'practitioner_email', label: 'Login & Notification Email *', type: 'text', required: true, source: 'profile.notificationEmail' },
      { key: 'professional_title', label: 'Professional Title / Credentials *', type: 'text', required: true, source: 'profile.professionalTitle' },
      { key: 'profession', label: 'Profession / Registration Type *', type: 'text', required: true, source: 'profile.profession' },
      { key: 'provider_number', label: 'Registration / Provider Number *', type: 'text', required: true, source: 'profile.providerNumber' },
      { key: 'clinic_name', label: 'Practice / Clinic Name *', type: 'text', required: true, source: 'profile.clinicName' },
      { key: 'phone', label: 'Practice Contact Phone *', type: 'text', required: true, source: 'profile.phone' },
      { key: 'practice_address', label: 'Practice Address *', type: 'text', required: true, source: 'profile.practiceAddress' },
    ],
  },
  {
    key: 'case_reference_demographics',
    title: '2. Case Reference & Client Demographics (zero-PII policy)',
    kind: 'fields',
    required: true,
    insight: 'Do NOT enter patient full names or birthdates. Use Case Reference and Age/Gender metrics only.',
    fields: [
      { key: 'case_reference', label: 'Case Reference (populated at reliability gate) *', type: 'text', required: true, readonly: true, source: 'case.reference' },
      { key: 'age', label: 'Client Age (Years) *', type: 'text', required: true, source: 'case.age' },
      { key: 'gender', label: 'Biological Gender *', type: 'select', required: true, source: 'case.gender', options: [ { value: 'MALE', label: 'Male' }, { value: 'FEMALE', label: 'Female' }, { value: 'OTHER', label: 'Other / Intersex' } ] },
      { key: 'handedness', label: 'Dominant Handedness *', type: 'select', required: true, source: 'case.handedness', options: [ { value: 'RIGHT', label: 'Right' }, { value: 'LEFT', label: 'Left' }, { value: 'AMBIDEXTROUS', label: 'Ambidextrous' } ] },
      { key: 'recording_condition', label: 'QEEG Recording Condition *', type: 'select', required: true, options: [ { value: 'EC', label: 'Eyes Closed (EC)' }, { value: 'EO', label: 'Eyes Open (EO)' }, { value: 'TOVA', label: 'Continuous Task (TOVA)' } ] },
    ],
  },
  {
    key: 'recording_quality',
    title: '3. QEEG Recording Quality & Artifact Declaration',
    kind: 'fields',
    required: false,
    fields: [
      { key: 'quality_1', label: '10-20 System Placement Verification', detail: 'Standard 19-channel electrode placement verified.', type: 'checkbox', required: false },
      { key: 'quality_2', label: 'Client Cooperation & Protocol Compliance', detail: 'Client maintained quiet wakefulness during recording.', type: 'checkbox', required: false },
      { key: 'quality_3', label: 'Artifact Control & Filter', detail: 'Ocular blinks, EMG muscle tension removed; Test/Retest reliability >= 0.80.', type: 'checkbox', required: false },
      { key: 'quality_4', label: 'Medication & Neuromodulator Status Disclosed', detail: 'Psychoactive medications recorded in observations.', type: 'checkbox', required: false },
    ],
  },
  { key: 'domains_page_2', title: '4. Clinical Symptom Domains (1 of 2: Domains 1 - 5)', kind: 'domains', domainPage: 2, required: true },
  { key: 'domains_page_3', title: '5. Clinical Symptom Domains (2 of 2: Domains 6 - 11)', kind: 'domains', domainPage: 3, required: true },
  {
    key: 'clinical_notes',
    title: '6. Additional Clinical Notes & Medications (optional)',
    kind: 'fields',
    required: false,
    fields: [
      { key: 'additional_notes', label: 'Record psychoactive medications, previous neurofeedback protocols, or relevant clinical observations:', type: 'textarea', required: false },
    ],
  },
  {
    key: 'ai_notice',
    title: '7. Clinical Decision Support & Automated Synthesis Notice',
    kind: 'static',
    lines: [
      'EXPLICIT MEDICAL & AI SYNTHESIS DISCLAIMER:',
      '• QEEG.com.au correlation reports are automated, evidence-linked literature synthesis documents mapping QEEG spectral power deviations against peer-reviewed neuroimaging literature.',
      '• These reports DO NOT constitute human-reviewed medical advice, psychiatric diagnosis, or treatment prescriptions.',
      '• The referring practitioner retains sole clinical responsibility for patient assessment, protocol selection, and medical diagnostic decisions under Australian healthcare regulations.',
    ],
  },
  {
    key: 'agreement_payment',
    title: '8. Statutory Service Agreement & Payment Authorisation',
    kind: 'fields',
    required: true,
    fields: [
      { key: 'service_agreement_ack', label: 'Statutory Service Agreement Acknowledgement *', detail: 'I confirm acceptance of QEEG.com.au Terms of Service, Zero-PII data retention policy, and Sydney sovereign server infrastructure compliance under the Australian Privacy Act 1988.', type: 'checkbox', required: true },
      { key: 'payment_auth_ack', label: 'PayPal {{REPORT_FEE}} AUD Fee Authorisation Hold *', detail: 'I authorize a {{REPORT_FEE}} AUD fee hold per report submission via PayPal. Funds are captured strictly upon successful generation and verification.', type: 'checkbox', required: true },
    ],
  },
  {
    key: 'signoff',
    title: '9. Referring Practitioner Sign-off',
    kind: 'fields',
    required: true,
    insight: 'Typed practitioner signature and sign-off date are legally binding under the Electronic Transactions Act 1999.',
    fields: [
      { key: 'signature', label: 'Practitioner Digital Signature (Typed Name) *', type: 'text', required: true, placeholder: 'Type your full name to sign' },
      { key: 'date_signed', label: 'Date Signed (DD/MM/YYYY) *', type: 'date', required: true },
    ],
  },
];

// ---------------------------------------------------------------------------
// WinAnsi text sanitisation (shared with the correlation report generator).
// ---------------------------------------------------------------------------

const winAnsiEncoding = Encodings.WinAnsi;

/**
 * Reverse of the Windows-1252 mapping for code points 0x80-0x9F. Used to undo
 * "mojibake": text that was UTF-8 encoded but later decoded as Windows-1252,
 * turning a single "•" (U+2022) into a three-character sequence.
 */
const CP1252_REVERSE: Record<number, number> = {
  0x20ac: 0x80, 0x201a: 0x82, 0x0192: 0x83, 0x201e: 0x84, 0x2026: 0x85,
  0x2020: 0x86, 0x2021: 0x87, 0x02c6: 0x88, 0x2030: 0x89, 0x0160: 0x8a,
  0x2039: 0x8b, 0x0152: 0x8c, 0x017d: 0x8e, 0x2018: 0x91, 0x2019: 0x92,
  0x201c: 0x93, 0x201d: 0x94, 0x2022: 0x95, 0x2013: 0x96, 0x2014: 0x97,
  0x02dc: 0x98, 0x2122: 0x99, 0x0161: 0x9a, 0x203a: 0x9b, 0x0153: 0x9c,
  0x017e: 0x9e, 0x0178: 0x9f,
};

/**
 * Repairs UTF-8-as-Windows-1252 mojibake by mapping every character back to the
 * single byte it originated from and re-decoding the byte sequence as UTF-8.
 * Returns the input untouched when it is not pure mojibake (e.g. it contains a
 * genuine multi-byte character, or the bytes are not valid UTF-8), so correctly
 * encoded text is never damaged.
 */
function repairMojibake(text: string): string {
  // Fast bail: mojibake runs always contain a lead byte rendered as â/Â/Ã.
  if (!/[\u00c2\u00c3\u00e2]/.test(text)) return text;
  const bytes: number[] = [];
  for (const ch of text) {
    const cp = ch.codePointAt(0);
    if (cp === undefined) return text;
    if (cp <= 0xff) bytes.push(cp);
    else if (CP1252_REVERSE[cp] !== undefined) bytes.push(CP1252_REVERSE[cp]);
    else return text;
  }
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(Uint8Array.from(bytes));
  } catch {
    return text;
  }
}

const WIN_ANSI_SAFE_REPLACEMENTS: Record<string, string> = {
  '\u2190': '<-', // ←
  '\u2191': '^', // ↑
  '\u2192': '->', // →
  '\u2193': 'v', // ↓
  '\u2194': '<->', // ↔
  '\u2195': '<->', // ↕
  '\u21A6': '->', // ↦
  '\u21D0': '<=', // ⇐
  '\u21D2': '=>', // ⇒
  '\u21D4': '<=>', // ⇔
  '\u2713': 'v', // ✓
  '\u2714': 'v', // ✔
  '\u2717': 'x', // ✗
  '\u2718': 'x', // ✘
};

function winAnsiSafe(text: unknown): string {
  const repaired = repairMojibake(String(text ?? ''));
  let out = '';
  for (const ch of repaired) {
    // Whitespace controls are not WinAnsi-encodable glyphs; collapse them to a
    // space so paragraph layout never renders stray "?" characters.
    if (ch === '\n' || ch === '\r' || ch === '\t') {
      out += ' ';
      continue;
    }
    const codePoint = ch.codePointAt(0);
    if (codePoint !== undefined && winAnsiEncoding.canEncodeUnicodeCodePoint(codePoint)) {
      out += ch;
    } else {
      out += WIN_ANSI_SAFE_REPLACEMENTS[ch] ?? '?';
    }
  }
  return out;
}

export function sanitizePdfStrings(value: unknown): unknown {
  if (typeof value === 'string') return winAnsiSafe(value);
  if (Array.isArray(value)) return value.map((item) => sanitizePdfStrings(item));
  if (value !== null && typeof value === 'object') {
    const result: Record<string, unknown> = {};
    for (const [key, item] of Object.entries(value)) {
      result[key] = sanitizePdfStrings(item);
    }
    return result;
  }
  return value;
}

// ---------------------------------------------------------------------------
// Report prose cleaning: strips raw markdown syntax, CSV/TSV rows and
// unparsed data blobs so excerpts and citations render as clean, readable
// prose inside the PDF rather than as raw code/markdown.
// ---------------------------------------------------------------------------

/** Removes markdown syntax from a single line of text. */
function stripMarkdownInline(line: string, bulletListItems: boolean): string {
  let out = line;
  // Images and links: keep the visible label, drop the URL.
  out = out.replace(/!\[[^\]]*\]\([^)]*\)/g, '');
  out = out.replace(/\[([^\]]+)\]\([^)]*\)/g, '$1');
  // Leading heading hashes and blockquote markers.
  out = out.replace(/^\s*#{1,6}\s*/, '');
  out = out.replace(/^\s*>\s?/, '');
  // List markers.
  out = out.replace(/^\s*[-*+]\s+/, bulletListItems ? '\u2022 ' : '');
  out = out.replace(/^\s*\d+[.)]\s+/, bulletListItems ? '\u2022 ' : '');
  // Emphasis and inline code.
  out = out.replace(/\*\*\*(.+?)\*\*\*/g, '$1');
  out = out.replace(/\*\*(.+?)\*\*/g, '$1');
  out = out.replace(/__(.+?)__/g, '$1');
  out = out.replace(/\*(.+?)\*/g, '$1');
  out = out.replace(/`([^`]+)`/g, '$1');
  // Trailing heading hashes.
  out = out.replace(/\s+#+\s*$/, '');
  return out;
}

/** True when a line looks like a raw CSV/TSV record or header row. */
function looksLikeDelimitedRow(line: string): boolean {
  const hasTab = line.includes('\t');
  const delimiter = hasTab ? '\t' : ',';
  const rawFields = line.split(delimiter);
  if (rawFields.length < 3 && !(hasTab && rawFields.length >= 2)) return false;
  const fields = rawFields.map((f) => f.trim().replace(/^"(.*)"$/, '$1'));
  // Real prose contains sentence punctuation; tabular cells do not.
  if (fields.some((f) => /[;:!?]/.test(f))) return false;
  // A non-numeric full stop mid-row means prose, not a cell value.
  if (
    fields.some(
      (f, i) => i < fields.length - 1 && f.includes('.') && !/^-?\d+(\.\d+)?$/.test(f)
    )
  ) {
    return false;
  }
  const numericCount = fields.filter((f) => /^-?\d+(\.\d+)?$/.test(f)).length;
  const allSingleToken = fields.every((f) => f.length > 0 && !/\s/.test(f));
  // A wide row of single tokens is a header; a mostly-numeric row is data.
  if (allSingleToken && fields.length >= 4) return true;
  if (numericCount >= 2 && numericCount / fields.length >= 0.5) return true;
  if (hasTab) return true;
  return false;
}

/**
 * Cleans multi-line report prose (summaries, KB answers, source excerpts):
 * drops fenced code blocks, horizontal rules, table separators, CSV/TSV rows
 * and JSON blobs, then strips markdown from every remaining line.
 */
export function cleanReportProse(input: unknown): string {
  const text = String(input ?? '').replace(/\r\n?/g, '\n');
  if (!text.trim()) return '';
  const withoutCode = text
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/~~~[\s\S]*?~~~/g, ' ');
  const lines: string[] = [];
  for (const rawLine of withoutCode.split('\n')) {
    const trimmed = rawLine.trim();
    if (!trimmed) {
      lines.push('');
      continue;
    }
    // Horizontal rules and table separator rows.
    if (/^([-*_]\s*){3,}$/.test(trimmed)) continue;
    if (/^\|?[\s:|-]*\|[\s:|-]*$/.test(trimmed)) continue;
    // Raw CSV/TSV data (incl. header rows).
    if (looksLikeDelimitedRow(trimmed)) continue;
    // Unparsed JSON / stringified-object blobs.
    if (trimmed === '[object Object]') continue;
    if (/^\s*[{[][\s\S]*[}\]]\s*$/.test(trimmed) && /"[^"]*"\s*:/.test(trimmed)) continue;
    const cleaned = stripMarkdownInline(trimmed, true).replace(/[ \t]+/g, ' ').trim();
    if (cleaned) lines.push(cleaned);
  }
  return lines.join('\n').replace(/\n{3,}/g, '\n\n').trim();
}

/**
 * Cleans a single-line report label (citation title, author, journal, head
 * line). Strips markdown and flattens newlines but never drops content, so a
 * title that merely contains commas is preserved.
 */
export function cleanReportText(input: unknown): string {
  return String(input ?? '')
    .replace(/\r\n?/g, ' ')
    .split('\n')
    .map((line) => stripMarkdownInline(line, false))
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Greedy word-wrap for pdf-lib `drawText`, which draws a single unwrapped line.
 * Returns the lines that fit within `maxWidth` at `size`.
 */
function wrapPdfText(
  text: string,
  font: { widthOfTextAtSize: (text: string, size: number) => number },
  size: number,
  maxWidth: number
): string[] {
  const words = String(text ?? '')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .filter(Boolean);
  if (words.length === 0) return [''];
  const lines: string[] = [];
  let current = '';
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (font.widthOfTextAtSize(candidate, size) <= maxWidth) {
      current = candidate;
    } else {
      if (current) lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function formatDateDisplay(value: string): string {
  const trimmed = value.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    const [yr, mo, da] = trimmed.split('-');
    return `${da}/${mo}/${yr}`;
  }
  return trimmed;
}

/**
 * Generates the completed Symptom Checklist as a fillable multi-page AcroForm
 * PDF. The document is driven entirely by the active checklist schema carried
 * in `options.sections`: every section and every field is enumerated in order,
 * and values are mapped by field key. The two clinical domain pages keep their
 * precise, unchanged card/likert layout; all other sections flow with automatic
 * page breaks so admin-authored custom fields can never be dropped.
 */
export async function generatePreFilledChecklistPDF(
  details: PractitionerChecklistDetails,
  options?: CompletedChecklistPdfOptions,
  reportFeeAUD: number = DEFAULT_REPORT_FEE_AUD
): Promise<Uint8Array> {
  details = sanitizePdfStrings(details) as PractitionerChecklistDetails;
  if (options) options = sanitizePdfStrings(options) as CompletedChecklistPdfOptions;

  const activeFee = reportFeeAUD > 0 ? reportFeeAUD : DEFAULT_REPORT_FEE_AUD;
  const feeLabel = `$${activeFee.toFixed(2)} AUD`;
  const feeText = `$${activeFee.toFixed(2)}`;
  const resolveFeeText = (text: string | undefined): string | undefined =>
    typeof text === 'string' && text.includes(REPORT_FEE_TOKEN)
      ? text.split(REPORT_FEE_TOKEN).join(feeText)
      : text;

  const pdfDoc = await PDFDocument.create();
  const form = pdfDoc.getForm();

  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontOblique = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

  const darkNavy = rgb(0.086, 0.137, 0.231);
  const slateText = rgb(0.1, 0.15, 0.25);
  const slateLabel = rgb(0.3, 0.38, 0.47);
  const borderGray = rgb(0.886, 0.91, 0.941);
  const cardBg = rgb(0.973, 0.98, 0.988);
  const inputBg = rgb(1, 1, 1);
  const warnBg = rgb(0.99, 0.985, 0.96);
  const warnBorder = rgb(0.92, 0.86, 0.75);
  const warnText = rgb(0.55, 0.28, 0.05);

  const pageSize: [number, number] = [595.28, 841.89];
  const PAGE_W = pageSize[0];
  const PAGE_H = pageSize[1];
  const MARGIN = 36;
  const CONTENT_W = PAGE_W - MARGIN * 2;
  const INNER_X = MARGIN + 12;
  const INNER_W = CONTENT_W - 24;
  const CONTENT_TOP = PAGE_H - 105;
  const CONTENT_BOTTOM = 62;

  let likert: Record<string, string> = options?.likert ?? {};
  const likertText = (rating: number): string =>
    likert[String(rating)] ?? DEFAULT_LIKERT_LABELS[rating] ?? String(rating);
  const likertLegend = (): string =>
    `Likert Scale: 0 = ${likertText(0)}   1 = ${likertText(1)}   2 = ${likertText(2)}   3 = ${likertText(3)}   4 = ${likertText(4)}`;

  // --- Generic value resolution (schema-agnostic) --------------------------
  const resolveValue = (field: ChecklistSectionField): string | boolean => {
    const map = options?.fieldValues;
    if (map && Object.prototype.hasOwnProperty.call(map, field.key)) {
      return map[field.key];
    }
    switch (field.key) {
      case 'recording_condition':
        return options?.recordingCondition ?? '';
      case 'quality_1':
        return !!options?.qualityChecks?.quality_1;
      case 'quality_2':
        return !!options?.qualityChecks?.quality_2;
      case 'quality_3':
        return !!options?.qualityChecks?.quality_3;
      case 'quality_4':
        return !!options?.qualityChecks?.quality_4;
      case 'additional_notes':
        return options?.additionalNotes ?? '';
      case 'service_agreement_ack':
        return !!options?.serviceAgreementAcknowledged;
      case 'payment_auth_ack':
        return !!options?.paymentAuthorisationAcknowledged;
      case 'signature':
        return options?.signature ?? details.fullName ?? '';
      case 'date_signed':
        return options?.dateSigned ?? '';
    }
    // Source-bound fields. Resolved generically for `case.*` / `profile.*` so a
    // custom field authored in the admin Form Builder can never render empty
    // just because it is not in a hardcoded allow-list.
    if (field.source) {
      const dot = field.source.indexOf('.');
      const scope = dot === -1 ? field.source : field.source.slice(0, dot);
      const sourceKey = dot === -1 ? '' : field.source.slice(dot + 1);

      if (scope === 'case') {
        const fromCase = options?.caseData?.[sourceKey];
        if (fromCase !== undefined && fromCase !== null) {
          return typeof fromCase === 'boolean' ? fromCase : String(fromCase);
        }
        if (sourceKey === 'reference') return options?.caseReference ?? '';
        if (sourceKey === 'age') return options?.age != null ? String(options.age) : '';
        if (sourceKey === 'gender') return options?.gender ?? '';
        if (sourceKey === 'handedness') return options?.handedness ?? '';
        return field.type === 'checkbox' ? false : '';
      }

      if (scope === 'profile') {
        const profileMap: Record<string, string | undefined> = {
          fullName: details.fullName,
          notificationEmail: details.email || details.practiceEmail,
          professionalTitle: details.professionalTitle,
          profession: details.profession,
          providerNumber: details.providerNumber,
          clinicName: details.clinicName,
          phone: details.phone,
          practiceAddress: details.practiceAddress,
        };
        return profileMap[sourceKey] ?? '';
      }
    }
    return field.type === 'checkbox' ? false : '';
  };

  const displayValue = (field: ChecklistSectionField, value: string | boolean): string => {
    const raw = typeof value === 'boolean' ? (value ? 'Yes' : '') : String(value ?? '');
    if (field.type === 'date') return formatDateDisplay(raw);
    if (field.type === 'select' && field.options && field.options.length > 0) {
      const match = field.options.find(
        (o) => o.value === raw || o.value.toUpperCase() === raw.toUpperCase()
      );
      return match ? match.label : raw;
    }
    return raw;
  };

  // --- Page flow engine ----------------------------------------------------
  const pages: PDFPage[] = [];
  const pageTitles: string[] = [];
  let page = pdfDoc.addPage(pageSize);
  pages.push(page);
  pageTitles.push('Clinical Symptom Checklist');
  let cursorY = CONTENT_TOP;

  const startPage = (title: string): void => {
    page = pdfDoc.addPage(pageSize);
    pages.push(page);
    pageTitles.push(title || 'Clinical Symptom Checklist');
    cursorY = CONTENT_TOP;
  };
  const ensure = (height: number, title: string): void => {
    if (cursorY - height < CONTENT_BOTTOM) startPage(title);
  };

  const lineHeight = (size: number): number => size + 3;

  const measureWrapped = (
    text: string,
    size: number,
    font: PDFFont,
    maxWidth: number
  ): number => wrapPdfText(text, font, size, maxWidth).length * lineHeight(size);

  const drawWrapped = (
    text: string,
    x: number,
    startY: number,
    size: number,
    font: PDFFont,
    color: ReturnType<typeof rgb>,
    maxWidth: number
  ): number => {
    const lines = wrapPdfText(text, font, size, maxWidth);
    const lh = lineHeight(size);
    for (let i = 0; i < lines.length; i++) {
      page.drawText(lines[i], { x, y: startY - i * lh, size, font, color });
    }
    return startY - lines.length * lh;
  };

  // --- Field rows ----------------------------------------------------------
  const checkboxRowHeight = (field: ChecklistSectionField): number => {
    const labelH = measureWrapped(field.label, 8, fontBold, INNER_W - 22);
    const detailH = field.detail ? measureWrapped(field.detail, 7.5, fontRegular, INNER_W - 22) : 0;
    return Math.max(16, labelH + detailH) + 10;
  };
  const inputRowHeight = (field: ChecklistSectionField): number => {
    const labelH = measureWrapped(field.label, 8, fontBold, INNER_W);
    const boxH = field.type === 'textarea' ? 54 : 18;
    return labelH + boxH + 14;
  };
  const fieldRowHeight = (field: ChecklistSectionField): number =>
    field.type === 'checkbox' ? checkboxRowHeight(field) : inputRowHeight(field);

  const renderCheckboxRow = (field: ChecklistSectionField, value: boolean): void => {
    const top = cursorY;
    const cb = form.createCheckBox(`field_${field.key}`);
    cb.addToPage(page, { x: INNER_X, y: top - 14, width: 12, height: 12 });
    if (value) cb.check();
    if (field.required) cb.enableRequired();
    const textX = INNER_X + 20;
    let ty = top - 2;
    ty = drawWrapped(`${field.label}`, textX, ty, 8, fontBold, slateText, INNER_W - 20);
    if (field.detail) {
      drawWrapped(field.detail, textX, ty - 1, 7.5, fontRegular, slateLabel, INNER_W - 20);
    }
    cursorY = top - checkboxRowHeight(field);
  };

  const renderInputRow = (field: ChecklistSectionField, value: string | boolean): void => {
    const top = cursorY;
    let ty = drawWrapped(field.label, INNER_X, top - 2, 8, fontBold, slateLabel, INNER_W);
    const boxH = field.type === 'textarea' ? 54 : 18;
    const boxTop = ty - 3;
    page.drawRectangle({
      x: INNER_X,
      y: boxTop - boxH,
      width: INNER_W,
      height: boxH,
      color: inputBg,
      borderColor: borderGray,
      borderWidth: 1,
    });
    const tf = form.createTextField(`field_${field.key}`);
    tf.setText(displayValue(field, value));
    if (field.type === 'textarea') tf.enableMultiline();
    tf.addToPage(page, { x: INNER_X + 4, y: boxTop - boxH + 3, width: INNER_W - 8, height: boxH - 6 });
    tf.setFontSize(8.5);
    if (field.required) tf.enableRequired();
    cursorY = top - inputRowHeight(field);
  };

  // --- Section renderers ---------------------------------------------------
  const renderFieldsSection = (section: ChecklistSection): void => {
    const fields = section.fields ?? [];
    if (fields.length === 0) return;
    const title = section.title || section.key;
    const titleH = measureWrapped(title, 9, fontBold, INNER_W);
    const insightH = section.insight ? measureWrapped(section.insight, 7.5, fontRegular, INNER_W) + 4 : 0;

    let index = 0;
    let first = true;
    while (index < fields.length) {
      const headerH = first
        ? 16 + titleH + insightH + 6
        : 16 + measureWrapped(`${title} (continued)`, 9, fontBold, INNER_W) + 6;
      ensure(headerH + fieldRowHeight(fields[index]) + 12, title);

      const available = cursorY - CONTENT_BOTTOM - headerH - 12;
      let count = 0;
      let used = 0;
      while (index + count < fields.length && used + fieldRowHeight(fields[index + count]) <= available) {
        used += fieldRowHeight(fields[index + count]);
        count++;
      }
      if (count === 0) {
        count = 1;
        used = fieldRowHeight(fields[index]);
      }

      const cardH = headerH + used + 6;
      const cardTop = cursorY;
      page.drawRectangle({
        x: MARGIN,
        y: cardTop - cardH,
        width: CONTENT_W,
        height: cardH,
        color: cardBg,
        borderColor: borderGray,
        borderWidth: 1,
      });

      let ty = cardTop - 14;
      const headerTitle = first ? title : `${title} (continued)`;
      ty = drawWrapped(headerTitle, INNER_X, ty, 9, fontBold, darkNavy, INNER_W);
      if (first && section.insight) {
        drawWrapped(section.insight, INNER_X, ty - 3, 7.5, fontRegular, warnText, INNER_W);
      }

      cursorY = cardTop - headerH;
      for (let k = 0; k < count; k++) {
        const field = fields[index + k];
        const value = resolveValue(field);
        if (field.type === 'checkbox') {
          renderCheckboxRow(field, !!value);
        } else {
          renderInputRow(field, value);
        }
      }

      cursorY = cardTop - cardH - 10;
      index += count;
      first = false;
    }
  };

  const renderStaticSection = (section: ChecklistSection): void => {
    const lines = section.lines ?? [];
    const title = section.title || section.key;
    const titleH = measureWrapped(title, 9, fontBold, INNER_W);
    let bodyH = 0;
    for (let i = 0; i < lines.length; i++) {
      const size = i === 0 ? 8 : 7.5;
      const font = i === 0 ? fontBold : fontRegular;
      bodyH += measureWrapped(lines[i], size, font, INNER_W) + (i > 0 ? 2 : 0);
    }
    const cardH = 16 + titleH + 6 + bodyH + 12;
    ensure(cardH + 10, title);
    const cardTop = cursorY;
    page.drawRectangle({
      x: MARGIN,
      y: cardTop - cardH,
      width: CONTENT_W,
      height: cardH,
      color: warnBg,
      borderColor: warnBorder,
      borderWidth: 1,
    });
    let ty = drawWrapped(title, INNER_X, cardTop - 14, 9, fontBold, warnText, INNER_W);
    for (let i = 0; i < lines.length; i++) {
      const size = i === 0 ? 8 : 7.5;
      const font = i === 0 ? fontBold : fontRegular;
      const color = i === 0 ? darkNavy : slateText;
      ty = drawWrapped(lines[i], INNER_X, ty - 3, size, font, color, INNER_W);
    }
    cursorY = cardTop - cardH - 10;
  };

  const renderDomainsSection = (section: ChecklistSection): void => {
    const domains = (options?.domains && options.domains.length > 0 ? options.domains : DEFAULT_DOMAINS)
      .filter((d) => d.page === section.domainPage)
      .sort((a, b) => a.num - b.num);
    if (domains.length === 0) return;
    const title = section.title || section.key;

    ensure(56, title);
    let ty = drawWrapped(title, INNER_X, cursorY - 4, 9, fontBold, darkNavy, INNER_W);
    ty = drawWrapped(likertLegend(), INNER_X, ty - 4, 7.5, fontRegular, slateLabel, INNER_W);
    cursorY = ty - 8;

    const cardH = 78;
    for (const d of domains) {
      ensure(cardH + 10, `${title} (continued)`);
      const cardTop = cursorY;
      page.drawRectangle({
        x: INNER_X,
        y: cardTop - cardH,
        width: INNER_W,
        height: cardH,
        color: cardBg,
        borderColor: borderGray,
        borderWidth: 1,
      });
      page.drawText(d.title, { x: INNER_X + 10, y: cardTop - 16, size: 8.5, font: fontBold, color: darkNavy });
      page.drawText(d.desc, { x: INNER_X + 10, y: cardTop - 28, size: 7.5, font: fontRegular, color: slateLabel });
      page.drawText('Selected Rating (0 - 4) *:', { x: INNER_X + 10, y: cardTop - 48, size: 7.5, font: fontBold, color: darkNavy });
      for (let rating = 0; rating <= 4; rating++) {
        const cb = form.createCheckBox(`${d.key}_${rating}`);
        const xOffset = INNER_X + 132 + rating * 72;
        cb.addToPage(page, { x: xOffset, y: cardTop - 52, width: 12, height: 12 });
        if (options?.checklistScores?.[d.key] === rating) cb.check();
        page.drawText(`${rating} - ${likertText(rating)}`, {
          x: xOffset + 16,
          y: cardTop - 50,
          size: 7.5,
          font: fontRegular,
          color: slateText,
        });
      }
      cursorY = cardTop - cardH - 10;
    }
  };

  // --- Introductory compliance notice (static, not schema-driven) ----------
  const renderIntroNotice = (): void => {
    const heading = 'CHECKLIST INSTRUCTIONS & COMPLIANCE RULES:';
    const bullets = [
      '• Pages containing the clinical domains require mandatory 0–4 Likert scale ratings (no blank domains accepted).',
      `• Complete the Quality Verification, Statutory Service Agreement and PayPal ${feeLabel} Hold Authorisation.`,
    ];
    let bodyH = measureWrapped(heading, 7.5, fontBold, INNER_W) + 2;
    for (const b of bullets) bodyH += measureWrapped(b, 7, fontRegular, INNER_W) + 2;
    const cardH = 24 + bodyH + 10;
    ensure(cardH, 'Clinical Symptom Checklist');
    const cardTop = cursorY;
    page.drawRectangle({
      x: MARGIN,
      y: cardTop - cardH,
      width: CONTENT_W,
      height: cardH,
      color: inputBg,
      borderColor: borderGray,
      borderWidth: 1,
    });
    let ty = drawWrapped(heading, INNER_X, cardTop - 16, 7.5, fontBold, darkNavy, INNER_W);
    for (const b of bullets) ty = drawWrapped(b, INNER_X, ty - 4, 7, fontRegular, slateText, INNER_W);
    cursorY = cardTop - cardH - 10;
  };

  renderIntroNotice();

  const sections: ChecklistSection[] =
    options?.sections && options.sections.length > 0 ? options.sections : DEFAULT_SECTIONS;

  // Substitute the live fee into any `{{REPORT_FEE}}` placeholder in the copy
  // (title, insight, static lines, field label/detail/placeholder) so the
  // printed amount can never disagree with what is charged.
  const resolvedSections: ChecklistSection[] = sections.map((section) => ({
    ...section,
    title: resolveFeeText(section.title) ?? section.title,
    insight: resolveFeeText(section.insight),
    lines: section.lines?.map((line) => resolveFeeText(line) ?? line),
    fields: section.fields?.map((field) => ({
      ...field,
      label: resolveFeeText(field.label) ?? field.label,
      detail: resolveFeeText(field.detail),
      placeholder: resolveFeeText(field.placeholder),
    })),
  }));

  for (const section of resolvedSections) {
    const kind = section.kind ?? 'fields';
    if (kind === 'domains') {
      renderDomainsSection(section);
    } else if (kind === 'static') {
      renderStaticSection(section);
    } else {
      renderFieldsSection(section);
    }
  }

  // --- Header + footer pass (page count is only known now) -----------------
  const totalPages = pages.length;
  const brand = 'QEEG.COM.AU';
  pages.forEach((pg, i) => {
    const { width, height } = pg.getSize();
    pg.drawRectangle({ x: MARGIN, y: height - 85, width: width - MARGIN * 2, height: 52, color: darkNavy });
    pg.drawText(brand, { x: 48, y: height - 56, size: 13, font: fontBold, color: rgb(1, 1, 1) });
    const brandRight = 48 + fontBold.widthOfTextAtSize(brand, 13);
    let title = (pageTitles[i] ?? 'Clinical Symptom Checklist').toUpperCase();
    const maxTitleW = width - brandRight - 120;
    while (title.length > 3 && fontBold.widthOfTextAtSize(`  |  ${title}`, 10) > maxTitleW) {
      title = title.slice(0, -1);
    }
    pg.drawText(`  |  ${title}`, {
      x: brandRight + 14,
      y: height - 56,
      size: 10,
      font: fontBold,
      color: rgb(0.9, 0.94, 0.98),
    });
    pg.drawText(
      `Case Reference: ${options?.caseReference || '—'}  •  Clinical Intake Payload (Sections 3.1, 3.2 & 4.3)`,
      { x: 48, y: height - 72, size: 7.5, font: fontRegular, color: rgb(0.75, 0.85, 0.95) }
    );
    pg.drawText(`Page ${i + 1} of ${totalPages}`, {
      x: width - 96,
      y: height - 56,
      size: 8.5,
      font: fontBold,
      color: rgb(1, 1, 1),
    });
    pg.drawText(
      `QEEG.com.au Clinical Intake Payload  •  Page ${i + 1} of ${totalPages}  •  Applied Neurosciences Pty Ltd  •  Sydney Sovereign Server (ap-southeast-2)`,
      { x: MARGIN, y: 28, size: 7, font: fontRegular, color: slateLabel }
    );
  });

  return await pdfDoc.save();
}
