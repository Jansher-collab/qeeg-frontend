export interface TovaSession {
  sessionLabel?: string;
  testDate?: string;
  age?: number;
  dPrime?: number;
  adhdScore?: number;
  responseTimeMs?: number;
  variabilityMs?: number;
  commissionErrors?: number;
  omissionErrors?: number;
}

export interface TovaParseResult {
  passed: boolean;
  selectedSession?: TovaSession;
  sessions: TovaSession[];
  rawPiiDetected: boolean;
  error?: string;
}

const PII_REGEX_PATTERNS = [
  /patient\s*name/i,
  /first\s*name/i,
  /last\s*name/i,
  /\bclient\s*id\b/i,
  /\bsubject\s*id\b/i,
  /\bEEG\s*id\b/i,
  /\bpatient\s*:?/i,
  /date\s*of\s*birth/i,
  /\bdob\s*[:=]/i,
  /social\s*security/i,
  /\bmedicare\s*no/i,
  /\bmrn\s*[:=]/i,
];

const MAX_TOVA_VALUE = 1000000;

type NumericTovaKey =
  | "age"
  | "dPrime"
  | "adhdScore"
  | "responseTimeMs"
  | "variabilityMs"
  | "commissionErrors"
  | "omissionErrors";

interface MetricDef {
  key: NumericTovaKey;
  pattern: RegExp;
  numeric: boolean;
}

const METRIC_DEFS: MetricDef[] = [
  { key: "dPrime", pattern: /(?:D['’]?|D\s*[Pp]rime)\s*[:=]?\s*([-0-9][0-9.]+)/, numeric: true },
  { key: "adhdScore", pattern: /ADHD\s*(?:Index|Score)?\s*[:=]?\s*([-0-9][0-9.]+)/, numeric: true },
  { key: "responseTimeMs", pattern: /(?:Response\s*Time|RT)[^\S\r\n]{0,3}(?:Mean)?\s*[:=]?\s*([0-9][0-9.]*)/, numeric: true },
  { key: "variabilityMs", pattern: /(?:Response\s*Time\s*)?Variability\s*[:=]?\s*([0-9][0-9.]*)/, numeric: true },
  { key: "commissionErrors", pattern: /Commission\s*Errors?\s*[:=]?\s*([0-9]+)/, numeric: true },
  { key: "omissionErrors", pattern: /Omission\s*Errors?\s*[:=]?\s*([0-9]+)/, numeric: true },
  { key: "age", pattern: /^\s*Age\s*[:=]?\s*([0-9.]+)/, numeric: true },
];

const SESSION_HEADER = /^\s*(?:Session|Test\s*Session|Administration[s]?|Trial)\s*[:#]?\s*([0-9]+|[A-Za-z]+)/i;
const TEST_DATE = /^Test\s*(?:Date|Session\s*Date)\s*[:=]?\s*([0-9]{1,2}[/-][0-9]{1,2}[/-][0-9]{2,4})/i;

function parseNumber(raw: string | undefined, max = MAX_TOVA_VALUE): number | undefined {
  if (raw === undefined) return undefined;
  const n = Number(raw);
  if (Number.isNaN(n) || !Number.isFinite(n)) return undefined;
  if (Math.abs(n) > max) return undefined;
  return n;
}

// T.O.V.A. >= 8 CSV export column bases. Each tabulated metric appears for the
// seven blocks Q1..Q4, H1, H2 and T, e.g. DPRIMEQ1..DPRIMET, plus flat columns
// such as ACS, AGE, TDATE, SESNUM.
const TOVA_CSV_COLUMN_BASES = [
  "SUBNUM",
  "DOB",
  "AGE",
  "GENDER",
  "SESNUM",
  "TDATE",
  "TTIME",
  "CORRSP",
  "CORTGT",
  "CORNON",
  "COMERR",
  "COMPER",
  "COMPST",
  "OMERR",
  "OMPER",
  "DPRIME",
  "BETA",
  "RTMEAN",
  "RTVAR",
  "PCRTM",
  "PCRTV",
  "CERTM",
  "CERTV",
  "ACS",
  "NRMST",
  "SESSVAL",
  "BLKVAL",
];

const TOVA_CSV_METRIC_BASES = ["DPRIME", "RTMEAN", "RTVAR", "COMERR", "OMERR", "ACS"];

// Prefer the full-session "Total" block, then halves, then quarters.
const CSV_SUFFIX_PREFERENCE = ["T", "H2", "H1", "Q4", "Q3", "Q2", "Q1"];

function splitDelimitedLine(line: string, delimiter: string): string[] {
  const cells: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        current += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === delimiter) {
      cells.push(current.trim());
      current = "";
    } else {
      current += ch;
    }
  }
  cells.push(current.trim());
  return cells;
}

function guessDelimiter(line: string): string {
  const commas = (line.match(/,/g) || []).length;
  const tabs = (line.match(/\t/g) || []).length;
  return tabs > commas ? "\t" : ",";
}

function firstNonEmptyLine(lines: string[]): number {
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim()) return i;
  }
  return -1;
}

function isTovaCsvContent(lines: string[]): boolean {
  const headerLineIdx = firstNonEmptyLine(lines);
  if (headerLineIdx === -1) return false;
  const delimiter = guessDelimiter(lines[headerLineIdx]);
  const cells = splitDelimitedLine(lines[headerLineIdx], delimiter);
  if (cells.length < 2) return false;
  let known = 0;
  let metrics = 0;
  for (const cell of cells) {
    const upper = cell.toUpperCase();
    const isKnown = TOVA_CSV_COLUMN_BASES.some((base) => upper === base || upper.startsWith(base));
    if (!isKnown) continue;
    known++;
    if (TOVA_CSV_METRIC_BASES.some((base) => upper === base || upper.startsWith(base))) {
      metrics++;
    }
  }
  return known >= 2 && metrics >= 1;
}

function parseTovaCsv(lines: string[]): TovaSession[] {
  const sessions: TovaSession[] = [];
  const headerLineIdx = firstNonEmptyLine(lines);
  if (headerLineIdx === -1) return sessions;

  const delimiter = guessDelimiter(lines[headerLineIdx]);
  const headers = splitDelimitedLine(lines[headerLineIdx], delimiter)
    .map((h) => h.trim().toUpperCase());
  const columnIndex = new Map<string, number>();
  headers.forEach((h, i) => {
    if (!columnIndex.has(h)) columnIndex.set(h, i);
  });

  const readMetric = (row: string[], base: string, multiplier = 1): number | undefined => {
    const candidates = [...CSV_SUFFIX_PREFERENCE.map((suffix) => base + suffix), base];
    for (const col of candidates) {
      const idx = columnIndex.get(col);
      if (idx === undefined) continue;
      const cell = row[idx];
      if (cell === undefined || cell === "" || cell === '""') continue;
      const n = Number(cell);
      if (Number.isNaN(n) || !Number.isFinite(n)) continue;
      const value = n * multiplier;
      if (Math.abs(value) > MAX_TOVA_VALUE) continue;
      return value;
    }
    return undefined;
  };

  for (let r = headerLineIdx + 1; r < lines.length; r++) {
    if (!lines[r].trim()) continue;
    const row = splitDelimitedLine(lines[r], delimiter);
    const session: TovaSession = {};

    const dPrime = readMetric(row, "DPRIME");
    if (dPrime !== undefined) session.dPrime = dPrime;

    const responseTimeMs = readMetric(row, "RTMEAN", 1000);
    if (responseTimeMs !== undefined) session.responseTimeMs = responseTimeMs;

    const variabilityMs = readMetric(row, "RTVAR", 1000);
    if (variabilityMs !== undefined) session.variabilityMs = variabilityMs;

    const commissionErrors = readMetric(row, "COMERR");
    if (commissionErrors !== undefined) session.commissionErrors = commissionErrors;

    const omissionErrors = readMetric(row, "OMERR");
    if (omissionErrors !== undefined) session.omissionErrors = omissionErrors;

    const acs = readMetric(row, "ACS");
    if (acs !== undefined) session.adhdScore = acs;

    const age = readMetric(row, "AGE");
    if (age !== undefined) session.age = age;

    const dateIdx = columnIndex.get("TDATE");
    const rawDate = dateIdx !== undefined ? row[dateIdx] : undefined;
    if (rawDate !== undefined && rawDate !== "") session.testDate = rawDate;

    const sesIdx = columnIndex.get("SESNUM");
    const rawSes = sesIdx !== undefined ? row[sesIdx] : undefined;
    session.sessionLabel =
      rawSes !== undefined && rawSes !== ""
        ? `Session ${rawSes}`
        : `Session ${r - headerLineIdx}`;

    if (
      session.dPrime !== undefined ||
      session.adhdScore !== undefined ||
      session.responseTimeMs !== undefined ||
      session.commissionErrors !== undefined ||
      session.omissionErrors !== undefined
    ) {
      sessions.push(session);
    }
  }
  return sessions;
}

function parseSessionBlock(lines: string[], start: number, end: number): TovaSession {
  const session: TovaSession = {};
  let label: string | undefined;

  const head = lines[start];
  if (head) {
    const m = head.match(SESSION_HEADER);
    if (m) label = m[0].trim();
    const dm = head.match(TEST_DATE);
    if (dm) session.testDate = dm[1];
  }

  for (let i = start; i < end; i++) {
    const line = lines[i];
    const dateMatch = line.match(TEST_DATE);
    if (dateMatch) session.testDate = dateMatch[1];

    for (const def of METRIC_DEFS) {
      if (session[def.key] !== undefined) continue;
      const m = def.numeric ? line.match(def.pattern) : null;
      if (m) {
        const value = parseNumber(m[1]);
        if (value !== undefined) session[def.key] = value;
      }
    }
  }

  if (label) session.sessionLabel = label;
  return session;
}

function scoreSession(session: TovaSession, patientAge?: number): number {
  let score = session.dPrime !== undefined ? 10 : 0;
  if (session.adhdScore !== undefined) score += 6;
  if (session.responseTimeMs !== undefined) score += 3;
  if (session.variabilityMs !== undefined) score += 3;
  if (session.commissionErrors !== undefined) score += 2;
  if (session.omissionErrors !== undefined) score += 2;
  if (session.testDate) score += 5;
  if (session.sessionLabel) score += 2;
  if (patientAge !== undefined && session.age !== undefined) {
    score += Math.max(0, 5 - Math.abs(session.age - Math.round(patientAge)));
  }
  return score;
}

export function compareTestDates(a?: string, b?: string): number {
  if (!a && !b) return 0;
  if (!a) return 1;
  if (!b) return -1;
  const pa = a.split(/[/-]/).map(Number).reverse();
  const pb = b.split(/[/-]/).map(Number).reverse();
  if (pa.length !== 3 || pb.length !== 3) return a.localeCompare(b);
  return (pa[2] - pb[2]) * 10000 + (pa[1] - pb[1]) * 100 + (pa[0] - pb[0]);
}

/**
 * Parses TOVA result exports (.csv / .txt / .json) entirely in the browser.
 *
 * - Rejects raw files that still contain PHI.
 * - Splits the export into test-administration blocks so multi-session files
 *   are handled explicitly.
 * - Selects the most recent applicable session (newest test date first,
 *   falling back to the last block, then the highest-data block), preferring
 *   a session whose recorded age matches the patient's QEEG age.
 *
 * No bytes are ever sent to a server with PHI intact.
 */
export function parseTovaReport(
  fileContent: string,
  patientAge?: number
): TovaParseResult {
  for (const pattern of PII_REGEX_PATTERNS) {
    if (pattern.test(fileContent)) {
      return {
        passed: false,
        sessions: [],
        rawPiiDetected: true,
        error: `Personal Identifiable Information (${pattern.source}) detected in the TOVA file. Please de-identify and retry.`,
      };
    }
  }

  const lines = fileContent.split(/\r?\n/);
  let sessions: TovaSession[];
  if (isTovaCsvContent(lines)) {
    sessions = parseTovaCsv(lines);
  } else {
    const blockStarts: number[] = [0];
    for (let i = 0; i < lines.length; i++) {
      if (i === 0) continue;
      if (SESSION_HEADER.test(lines[i]) || TEST_DATE.test(lines[i])) {
        blockStarts.push(i);
      }
    }
    blockStarts.push(lines.length);

    sessions = [];
    for (let b = 0; b < blockStarts.length - 1; b++) {
      const block = parseSessionBlock(lines, blockStarts[b], blockStarts[b + 1]);
      if (
        block.dPrime !== undefined ||
        block.adhdScore !== undefined ||
        block.responseTimeMs !== undefined ||
        block.commissionErrors !== undefined ||
        block.omissionErrors !== undefined
      ) {
        sessions.push(block);
      }
    }
  }

  if (sessions.length === 0) {
    return {
      passed: false,
      sessions: [],
      rawPiiDetected: false,
      error:
        "No TOVA metrics (D', ADHD Score, Response Time, Commission/Omission Errors) could be parsed. Supported: TOVA CSV/TXT exports.",
    };
  }

  const sorted = [...sessions].sort((a, b) => {
    const dateCmp = compareTestDates(a.testDate, b.testDate);
    if (dateCmp !== 0) return dateCmp;
    return scoreSession(b, patientAge) - scoreSession(a, patientAge);
  });

  const selectedSession = sorted[sorted.length - 1];

  return {
    passed: true,
    selectedSession,
    sessions,
    rawPiiDetected: false,
  };
}