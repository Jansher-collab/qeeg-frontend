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

const PII_REGEX_PATTERNS = [
  /patient\s*name/i,
  /first\s*name/i,
  /last\s*name/i,
  /date\s*of\s*birth/i,
  /\bdob\s*[:=]/i,
  /street\s*address/i,
  /medicare\s*no/i,
  /\bmrn\s*[:=]/i,
  /social\s*security/i,
];

/**
 * Parses NeuroGuide .tdt files client-side directly in the browser.
 * Extracts reliability scores and verifies quality before any byte touches a server.
 */
export function parseQeegTdtInBrowser(fileContent: string): ClientReliabilityResult {
  // 1. Client-Side PII Check
  let rawPiiDetected = false;
  for (const pattern of PII_REGEX_PATTERNS) {
    if (pattern.test(fileContent)) {
      rawPiiDetected = true;
      return {
        passed: false,
        reliabilityScore: 0,
        threshold: MINIMUM_THRESHOLD,
        deidentified: false,
        rawPiiDetected: true,
        error: `Personal Identifiable Information (${pattern.source}) detected in raw QEEG export. Please de-identify your file before submission.`,
      };
    }
  }

  // 2. Parse Reliability and Demographics
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

    // Demographics Parsing (Age, Gender, Handedness)
    if (/^Age\s*[:=\t,]\s*([0-9.]+)/i.test(line)) {
      const match = line.match(/([0-9.]+)/);
      if (match) age = parseFloat(match[1]);
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

  // 3. Strip Identifying Lines if Passed
  let deidentifiedContent = "";
  if (passed) {
    const strippedLines = lines.filter((line) => {
      const lowerLine = line.toLowerCase();
      // Identifying lines to strip:
      if (lowerLine.startsWith("name") ||
          lowerLine.startsWith("subject id") ||
          lowerLine.startsWith("dob") ||
          lowerLine.startsWith("date of test") ||
          lowerLine.startsWith("time of test") ||
          lowerLine.startsWith("patient name") ||
          lowerLine.startsWith("first name") ||
          lowerLine.startsWith("last name")) {
        return false;
      }
      return true;
    });
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
