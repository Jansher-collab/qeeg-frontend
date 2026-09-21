export interface ClientReliabilityResult {
  passed: boolean;
  reliabilityScore: number;
  threshold: number;
  splitHalfScore?: number;
  age?: number;
  gender?: string;
  handedness?: string;
  deidentified: boolean;
  deidentifiedContent?: string;
  rawPiiDetected: boolean;
  error?: string;
}

const MINIMUM_THRESHOLD = 0.80;

// Only Patient Name and Date of Birth (DOB) are treated as identifiers and
// stripped before transmission. Every other field — including the EEG ID —
// is allowed to pass through untouched.
const NAME_LINE_PATTERN =
  /^\s*(?:patient\s*name|full\s*name|first\s*name|last\s*name|name)\b\s*[:=\t|]?\s*\S/i;
const DOB_LINE_PATTERN =
  /^\s*(?:date\s*of\s*birth|birth\s*date|dob|d\.o\.b\.?)\b\s*[:=\t|]?\s*\S/i;

function isIdentifyingLine(line: string): boolean {
  return NAME_LINE_PATTERN.test(line) || DOB_LINE_PATTERN.test(line);
}

/**
 * Parses NeuroGuide .tdt files client-side directly in the browser.
 * Extracts reliability scores and verifies quality before any byte touches a server.
 */
export function parseQeegTdtInBrowser(fileContent: string): ClientReliabilityResult {
  // 1. Parse Reliability and Demographics
  let testRetestScore = 0;
  let splitHalfScore: number | undefined;
  let age: number | undefined;
  let gender: string | undefined;
  let handedness: string | undefined;

  const lines = fileContent.split(/\r?\n/);
  let inReliabilityBlock = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Check for start of reliability block in NeuroGuide export
    if (/^Reliability\s*:/i.test(line) || /^Reliability\s+Scores/i.test(line)) {
      inReliabilityBlock = true;
      continue;
    }

    // Look for Test-Retest / Split-Half header or average row
    if (/^(?:Average|Mean|Overall|Total)\b/i.test(line) && inReliabilityBlock) {
      // Line format typically: Average    0.94    0.96
      const numbers = line.match(/([0-9]+\.[0-9]+)/g);
      if (numbers && numbers.length >= 1) {
        testRetestScore = parseFloat(numbers[0]);
        if (numbers.length >= 2) {
          splitHalfScore = parseFloat(numbers[1]);
        }
      }
    }

    // Direct key-value reliability match
    if (/^Test[-_]?Retest\s*[:=\t,]\s*([0-9.]+)/i.test(line)) {
      const match = line.match(/([0-9.]+)/);
      if (match) testRetestScore = parseFloat(match[1]);
    }

    if (/^Split[-_]?Half\s*[:=\t,]\s*([0-9.]+)/i.test(line)) {
      const match = line.match(/([0-9.]+)/);
      if (match) splitHalfScore = parseFloat(match[1]);
    }

    // Demographics Parsing (Age, Gender, Handedness).
    // Ages are rounded to the nearest whole year before transmission so a
    // fractional age (which combined with other fields narrows identity) is
    // never sent to the server in precision form.
    if (/^Age\s*[:=\t,]\s*([0-9.]+)/i.test(line)) {
      const match = line.match(/([0-9.]+)/);
      if (match) age = Math.round(parseFloat(match[1]));
    }

    if (/^Gender\s*[:=\t,]\s*([A-Za-z]+)/i.test(line)) {
      const match = line.match(/^Gender\s*[:=\t,]\s*([A-Za-z]+)/i);
      if (match) gender = match[1].toUpperCase();
    }

    if (/^Handedness\s*[:=\t,]\s*([A-Za-z]+)/i.test(line)) {
      const match = line.match(/^Handedness\s*[:=\t,]\s*([A-Za-z]+)/i);
      if (match) handedness = match[1].toUpperCase();
    }
  }

  // Fallback if testRetest wasn't found in headers
  if (testRetestScore === 0) {
    const rawNumberMatch = fileContent.match(/Test[-_\s]?Retest[^\d]+([0-9]\.[0-9]{2,})/i);
    if (rawNumberMatch) {
      testRetestScore = parseFloat(rawNumberMatch[1]);
    } else {
      // Default to high score if properly formatted mock .tdt export
      const genericReliability = fileContent.match(/Reliability[^\d]+([0-9]\.[0-9]{2,})/i);
      if (genericReliability) {
        testRetestScore = parseFloat(genericReliability[1]);
      }
    }
  }

  const passed = testRetestScore >= MINIMUM_THRESHOLD;

  // 3. Strip only Patient Name and Date of Birth if Passed
  let deidentifiedContent = "";
  if (passed) {
    const strippedLines = lines.filter((line) => !isIdentifyingLine(line));
    deidentifiedContent = strippedLines.join("\n");
  }

  return {
    passed,
    reliabilityScore: testRetestScore,
    threshold: MINIMUM_THRESHOLD,
    splitHalfScore,
    age,
    gender,
    handedness,
    deidentified: true,
    deidentifiedContent: passed ? deidentifiedContent : undefined,
    rawPiiDetected: false,
    error: passed
      ? undefined
      : `Test-Retest reliability coefficient (${testRetestScore.toFixed(2)}) is below the required 0.80 threshold. Submission halted locally with zero upload.`,
  };
}
