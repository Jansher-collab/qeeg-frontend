import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import {
  sanitizePdfStrings,
  cleanReportProse,
  cleanReportText,
} from './checklistPdfService';

export { sanitizePdfStrings, cleanReportProse, cleanReportText };
export {
  DEFAULT_REPORT_FEE_AUD,
  generatePreFilledChecklistPDF,
} from './checklistPdfService';
export type {
  PractitionerChecklistDetails,
  ChecklistDomain,
  ChecklistSectionField,
  ChecklistSection,
  CompletedChecklistPdfOptions,
} from './checklistPdfService';

export interface ReportCitation {
  id?: string;
  title: string;
  authors?: string[];
  journal?: string | null;
  year?: number | null;
  abstract?: string | null;
  url?: string | null;
  source?: string | null;
  doi?: string | null;
  relevanceScore?: number | null;
}

export interface ReportDomainFinding {
  domain: string;
  summary: string;
  keyIndicators?: string[];
  recommendations?: string[];
  conflictOfInterestDisclosure?: string;
  literatureCitations?: ReportCitation[];
}

export interface ReportKnowledgeBaseAnswer {
  answer?: string;
  grounded?: boolean;
  sourceChunks?: { sourceFile?: string; title?: string; excerpt?: string }[];
}

export interface ReportIdentityStamp {
  patientName?: string;
  stampedLocallyAt?: string;
  notice?: string;
}

export interface CorrelationReportFindings {
  caseReference?: string;
  confidenceScore?: number;
  reliabilityScore?: number;
  overallSummary?: string;
  demographics?: {
    age?: number | null;
    gender?: string | null;
    handedness?: string | null;
  };
  domains?: ReportDomainFinding[];
  aiDisclaimer?: string;
  knowledgeBase?: ReportKnowledgeBaseAnswer;
  compiledAt?: string;
  clientSideIdentityStamp?: ReportIdentityStamp;
}

const CITATION_SOURCE_LABELS: Record<string, string> = {
  CURATED: 'Knowledge Base (curated)',
  PubMed: 'PubMed',
  SemanticScholar: 'Semantic Scholar',
};

function formatCitationAuthors(authors?: string[]): string {
  if (!authors || authors.length === 0) return 'Authors not specified';
  if (authors.length <= 4) return authors.join(', ');
  return `${authors.slice(0, 3).join(', ')}, et al.`;
}

function citationSourceLabel(source?: string | null): string {
  if (!source) return 'Reference';
  return CITATION_SOURCE_LABELS[source] || source;
}

/** Strips markdown/CSV noise from a citation's text fields before rendering. */
function cleanCitation(citation: ReportCitation): ReportCitation {
  return {
    ...citation,
    title: cleanReportText(citation.title),
    authors: Array.isArray(citation.authors)
      ? citation.authors.map((author) => cleanReportText(author)).filter((author) => author.length > 0)
      : citation.authors,
    journal: citation.journal != null ? cleanReportText(citation.journal) : citation.journal,
    abstract: citation.abstract != null ? cleanReportProse(citation.abstract) : citation.abstract,
    url: citation.url != null ? cleanReportText(citation.url) : citation.url,
    doi: citation.doi != null ? cleanReportText(citation.doi) : citation.doi,
  };
}

/**
 * Cleans all free-text prose in the findings tree (summaries, KB answers,
 * source excerpts, domain text, disclaimers) so authored data renders as
 * readable prose instead of raw markdown, CSV rows or unparsed blobs.
 */
function cleanFindings(findings: CorrelationReportFindings): CorrelationReportFindings {
  const cleaned: CorrelationReportFindings = {
    ...findings,
    overallSummary: findings.overallSummary
      ? cleanReportProse(findings.overallSummary)
      : findings.overallSummary,
    aiDisclaimer: findings.aiDisclaimer
      ? cleanReportProse(findings.aiDisclaimer)
      : findings.aiDisclaimer,
  };

  if (findings.domains) {
    cleaned.domains = findings.domains.map((domain) => ({
      ...domain,
      summary: domain.summary ? cleanReportProse(domain.summary) : domain.summary,
      keyIndicators: domain.keyIndicators
        ? domain.keyIndicators.map((item) => cleanReportText(item)).filter((item) => item.length > 0)
        : domain.keyIndicators,
      recommendations: domain.recommendations
        ? domain.recommendations.map((item) => cleanReportText(item)).filter((item) => item.length > 0)
        : domain.recommendations,
      conflictOfInterestDisclosure: domain.conflictOfInterestDisclosure
        ? cleanReportProse(domain.conflictOfInterestDisclosure)
        : domain.conflictOfInterestDisclosure,
      literatureCitations: domain.literatureCitations
        ? domain.literatureCitations.map(cleanCitation)
        : domain.literatureCitations,
    }));
  }

  if (findings.knowledgeBase) {
    cleaned.knowledgeBase = {
      ...findings.knowledgeBase,
      answer: findings.knowledgeBase.answer
        ? cleanReportProse(findings.knowledgeBase.answer)
        : findings.knowledgeBase.answer,
      sourceChunks: findings.knowledgeBase.sourceChunks
        ? findings.knowledgeBase.sourceChunks.map((chunk) => ({
            ...chunk,
            title: chunk.title ? cleanReportText(chunk.title) : chunk.title,
            sourceFile: chunk.sourceFile ? cleanReportText(chunk.sourceFile) : chunk.sourceFile,
            excerpt: chunk.excerpt ? cleanReportProse(chunk.excerpt) : chunk.excerpt,
          }))
        : findings.knowledgeBase.sourceChunks,
    };
  }

  if (findings.clientSideIdentityStamp) {
    cleaned.clientSideIdentityStamp = {
      ...findings.clientSideIdentityStamp,
      patientName: findings.clientSideIdentityStamp.patientName
        ? cleanReportText(findings.clientSideIdentityStamp.patientName)
        : findings.clientSideIdentityStamp.patientName,
      notice: findings.clientSideIdentityStamp.notice
        ? cleanReportProse(findings.clientSideIdentityStamp.notice)
        : findings.clientSideIdentityStamp.notice,
    };
  }

  return cleaned;
}

/**
 * Renders the compiled correlation findings as a multi-page A4 PDF with every
 * domain's literature citations (including admin-curated Knowledge Base
 * references) rendered inline, plus a consolidated curated-reference index.
 * Generated in-browser so the locally-attached patient identity never leaves
 * the practitioner's machine.
 */
export async function generateCorrelationReportPDF(
  findings: CorrelationReportFindings
): Promise<Uint8Array> {
  // Strip raw markdown/CSV/JSON noise so excerpts and citations read as clean
  // prose first, then make every dynamic string (findings, citations, identity
  // stamp, KB answers) WinAnsi-safe so the StandardFonts never hit an
  // unencodable glyph such as U+2192 "→" (this also repairs any mojibake).
  findings = cleanFindings(findings);
  findings = sanitizePdfStrings(findings) as CorrelationReportFindings;

  const pdfDoc = await PDFDocument.create();

  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontOblique = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

  const pageSize: [number, number] = [595.28, 841.89];
  const margin = 48;
  const contentWidth = pageSize[0] - margin * 2;
  const floorY = 52;

  // Header geometry. `headerHeight` is derived from what the banner actually
  // occupies so the body cursor can never land inside the navy band: the banner
  // spans from HEADER_TOP_OFFSET below the page top down through
  // HEADER_BOX_HEIGHT, and the body then gets HEADER_BODY_GAP of clear space.
  const HEADER_MARGIN_X = 36;
  const HEADER_TOP_OFFSET = 33;
  const HEADER_BOX_HEIGHT = 52;
  const HEADER_BODY_GAP = 14;
  const headerHeight = HEADER_TOP_OFFSET + HEADER_BOX_HEIGHT + HEADER_BODY_GAP; // 99

  // The title x is measured from the rendered brand text rather than hardcoded,
  // so a brand/typography change can never make the title overlap the brand.
  const HEADER_BRAND = 'QEEG.COM.AU';
  const HEADER_BRAND_X = 48;
  const HEADER_BRAND_SIZE = 13;
  const HEADER_TITLE_SIZE = 10;
  const HEADER_TITLE_GUTTER = 14;

  const darkNavy = rgb(0.086, 0.137, 0.231);
  const slateText = rgb(0.1, 0.15, 0.25);
  const slateLabel = rgb(0.3, 0.38, 0.47);
  const borderGray = rgb(0.886, 0.91, 0.941);
  const cardBg = rgb(0.973, 0.98, 0.988);
  const accentBlue = rgb(0.145, 0.388, 0.921);
  const curatedGreen = rgb(0.02, 0.47, 0.34);
  const warnBg = rgb(0.99, 0.985, 0.96);
  const warnBorder = rgb(0.92, 0.86, 0.75);
  const warnText = rgb(0.45, 0.22, 0.05);

  let page = pdfDoc.addPage(pageSize);
  let pageNum = 1;
  let y = 0;

  const drawHeader = () => {
    const { width, height } = page.getSize();
    const boxY = height - HEADER_TOP_OFFSET - HEADER_BOX_HEIGHT;
    page.drawRectangle({
      x: HEADER_MARGIN_X,
      y: boxY,
      width: width - HEADER_MARGIN_X * 2,
      height: HEADER_BOX_HEIGHT,
      color: darkNavy,
    });
    page.drawText(HEADER_BRAND, {
      x: HEADER_BRAND_X,
      y: height - 56,
      size: HEADER_BRAND_SIZE,
      font: fontBold,
      color: rgb(1, 1, 1),
    });
    const brandRight = HEADER_BRAND_X + fontBold.widthOfTextAtSize(HEADER_BRAND, HEADER_BRAND_SIZE);
    page.drawText('|  CORRELATION REPORT', {
      x: brandRight + HEADER_TITLE_GUTTER,
      y: height - 56,
      size: HEADER_TITLE_SIZE,
      font: fontBold,
      color: rgb(0.9, 0.94, 0.98),
    });
    page.drawText(
      `Case ${findings.caseReference || 'N/A'}  •  Compiled ${
        findings.compiledAt ? new Date(findings.compiledAt).toLocaleString('en-AU') : new Date().toLocaleString('en-AU')
      }`,
      { x: HEADER_BRAND_X, y: height - 72, size: 7.5, font: fontRegular, color: rgb(0.75, 0.85, 0.95) }
    );
    page.drawText(`Page ${pageNum}`, {
      x: width - 82,
      y: height - 56,
      size: 8.5,
      font: fontBold,
      color: rgb(1, 1, 1),
    });
  };

  const drawFooter = () => {
    page.drawText(
      'QEEG.com.au Correlation Report  •  Applied Neurosciences Pty Ltd  •  Sydney Sovereign Server (ap-southeast-2)',
      { x: 36, y: 30, size: 7, font: fontRegular, color: slateLabel }
    );
  };

  const startPage = () => {
    drawHeader();
    y = page.getHeight() - headerHeight;
  };

  const addPage = () => {
    drawFooter();
    page = pdfDoc.addPage(pageSize);
    pageNum += 1;
    startPage();
  };

  const ensureSpace = (needed: number) => {
    if (y - needed < floorY) addPage();
  };

  const wrapText = (text: string, font: any, size: number, maxWidth: number): string[] => {
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
  };

  const writeParagraph = (
    text: string,
    opts: { font?: any; size?: number; color?: any; x?: number; width?: number; gap?: number } = {}
  ) => {
    const font = opts.font || fontRegular;
    const size = opts.size ?? 9;
    const color = opts.color || slateText;
    const x = opts.x ?? margin;
    const width = opts.width ?? contentWidth;
    const gap = opts.gap ?? size + 3;
    for (const line of wrapText(text, font, size, width)) {
      ensureSpace(gap);
      page.drawText(line, { x, y, size, font, color });
      y -= gap;
    }
  };

  const writeHeading = (text: string) => {
    ensureSpace(36);
    y -= 6;
    page.drawRectangle({ x: margin, y: y - 16, width: contentWidth, height: 20, color: darkNavy });
    page.drawText(text.toUpperCase(), {
      x: margin + 8,
      y: y - 11,
      size: 9.5,
      font: fontBold,
      color: rgb(1, 1, 1),
    });
    y -= 30;
  };

  const writeSubLabel = (text: string) => {
    ensureSpace(18);
    page.drawText(text, { x: margin, y, size: 8.5, font: fontBold, color: accentBlue });
    y -= 14;
  };

  const writeBullet = (text: string) => {
    const size = 8.5;
    const gap = size + 3;
    const lines = wrapText(text, fontRegular, size, contentWidth - 14);
    lines.forEach((line, i) => {
      ensureSpace(gap);
      page.drawText(i === 0 ? `•  ${line}` : line, {
        x: i === 0 ? margin : margin + 14,
        y,
        size,
        font: fontRegular,
        color: slateText,
      });
      y -= gap;
    });
    y -= 2;
  };

  const writeInfoBox = (lines: { text: string; font: any; size: number }[], padding = 12, gap = 10) => {
    if (lines.length === 0) return;
    const height = padding * 2 + (lines.length - 1) * gap;
    ensureSpace(height + 6);
    page.drawRectangle({
      x: margin,
      y: y - height,
      width: contentWidth,
      height,
      color: warnBg,
      borderColor: warnBorder,
      borderWidth: 1,
    });
    let cy = y - padding - 4;
    for (const line of lines) {
      page.drawText(line.text, { x: margin + 10, y: cy, size: line.size, font: line.font, color: warnText });
      cy -= gap;
    }
    y -= height + 10;
  };

  const renderCitations = (label: string, citations: ReportCitation[]) => {
    writeSubLabel(`Literature citations — ${label}`);
    citations.forEach((c, index) => {
      const title = c.title || 'Untitled reference';
      const metaBits: string[] = [formatCitationAuthors(c.authors)];
      if (c.journal) metaBits.push(c.journal);
      if (c.year) metaBits.push(String(c.year));
      const linkText = c.doi ? `https://doi.org/${c.doi}` : c.url || '';
      const isCurated = (c.source || '').toUpperCase() === 'CURATED';

      const titleLines = wrapText(`[${index + 1}] ${title}`, fontBold, 8.5, contentWidth - 8);
      const metaLines = wrapText(metaBits.join('  •  '), fontOblique, 7.5, contentWidth - 8);
      const linkLines = linkText ? wrapText(linkText, fontRegular, 7, contentWidth - 8) : [];
      const blockHeight =
        titleLines.length * 11 + metaLines.length * 10 + linkLines.length * 9 + (isCurated ? 11 : 0) + 6;
      ensureSpace(blockHeight);

      for (const line of titleLines) {
        page.drawText(line, { x: margin + 6, y, size: 8.5, font: fontBold, color: slateText });
        y -= 11;
      }
      for (const line of metaLines) {
        page.drawText(line, { x: margin + 6, y, size: 7.5, font: fontOblique, color: slateLabel });
        y -= 10;
      }
      if (isCurated) {
        page.drawText(`Source: ${citationSourceLabel(c.source)}`, {
          x: margin + 6,
          y,
          size: 7,
          font: fontBold,
          color: curatedGreen,
        });
        y -= 11;
      }
      for (const line of linkLines) {
        page.drawText(line, { x: margin + 6, y, size: 7, font: fontRegular, color: accentBlue });
        y -= 9;
      }
      y -= 4;
    });
    y -= 2;
  };

  startPage();

  ensureSpace(60);
  page.drawText('QEEG CORRELATION & LITERATURE SYNTHESIS REPORT', {
    x: margin,
    y,
    size: 15,
    font: fontBold,
    color: darkNavy,
  });
  y -= 24;
  writeParagraph(
    findings.overallSummary || `Automated correlation analysis for case ${findings.caseReference || 'N/A'}.`,
    { size: 9.5, color: slateLabel, gap: 13 }
  );
  y -= 8;

  const demo = findings.demographics || {};
  const cardHeight = 74;
  ensureSpace(cardHeight + 12);
  page.drawRectangle({
    x: margin,
    y: y - cardHeight,
    width: contentWidth,
    height: cardHeight,
    color: cardBg,
    borderColor: borderGray,
    borderWidth: 1,
  });
  const cardTop = y - 18;
  page.drawText(`Case Reference: ${findings.caseReference || 'N/A'}`, {
    x: margin + 12,
    y: cardTop,
    size: 9.5,
    font: fontBold,
    color: darkNavy,
  });
  page.drawText(
    `Age: ${demo.age ?? '—'}     Gender: ${demo.gender ?? '—'}     Handedness: ${demo.handedness ?? '—'}`,
    { x: margin + 12, y: cardTop - 20, size: 8.5, font: fontRegular, color: slateText }
  );
  page.drawText(
    `Confidence Score: ${
      typeof findings.confidenceScore === 'number' ? findings.confidenceScore.toFixed(2) : '—'
    }     Reliability Score: ${
      typeof findings.reliabilityScore === 'number' ? findings.reliabilityScore.toFixed(2) : '—'
    }     Compiled: ${findings.compiledAt ? new Date(findings.compiledAt).toLocaleString('en-AU') : '—'}`,
    { x: margin + 12, y: cardTop - 40, size: 8.5, font: fontRegular, color: slateText }
  );
  y -= cardHeight + 14;

  const stamp = findings.clientSideIdentityStamp;
  if (stamp) {
    const identityLine = `Patient identity (attached locally in browser, never stored server-side): ${
      stamp.patientName || 'Confidential Patient'
    }${stamp.stampedLocallyAt ? `   •   ${new Date(stamp.stampedLocallyAt).toLocaleString('en-AU')}` : ''}`;
    const boxLines = wrapText(identityLine, fontOblique, 8, contentWidth - 20).map((line) => ({
      text: line,
      font: fontOblique,
      size: 8,
    }));
    if (stamp.notice) {
      boxLines.push(
        ...wrapText(stamp.notice, fontRegular, 7, contentWidth - 20).map((line) => ({
          text: line,
          font: fontRegular,
          size: 7,
        }))
      );
    }
    writeInfoBox(boxLines);
  }

  const domains = findings.domains || [];
  domains.forEach((d, i) => {
    writeHeading(`Domain ${i + 1}: ${d.domain}`);
    if (d.summary) writeParagraph(d.summary, { size: 9, color: slateText, gap: 12 });
    y -= 4;

    if (d.keyIndicators && d.keyIndicators.length > 0) {
      writeSubLabel('Key indicators');
      d.keyIndicators.forEach(writeBullet);
    }
    if (d.recommendations && d.recommendations.length > 0) {
      writeSubLabel('Recommendations');
      d.recommendations.forEach(writeBullet);
    }
    if (d.conflictOfInterestDisclosure) {
      writeInfoBox(
        wrapText(d.conflictOfInterestDisclosure, fontOblique, 7.5, contentWidth - 20).map((line) => ({
          text: line,
          font: fontOblique,
          size: 7.5,
        }))
      );
    }
    if (d.literatureCitations && d.literatureCitations.length > 0) {
      renderCitations(d.domain, d.literatureCitations);
    }
    y -= 8;
  });

  const kb = findings.knowledgeBase;
  if (kb && (kb.answer || (kb.sourceChunks && kb.sourceChunks.length > 0))) {
    writeHeading('Knowledge base grounding');
    if (kb.answer) writeParagraph(kb.answer, { size: 8.5, color: slateText, gap: 12 });
    if (kb.sourceChunks && kb.sourceChunks.length > 0) {
      writeSubLabel('Source excerpts');
      kb.sourceChunks.forEach((chunk, i) => {
        writeBullet(
          `[Source ${i + 1}] ${chunk.title || 'Untitled'}${chunk.sourceFile ? ` (${chunk.sourceFile})` : ''}`
        );
        if (chunk.excerpt) {
          writeParagraph(chunk.excerpt, {
            size: 7.5,
            color: slateLabel,
            x: margin + 14,
            width: contentWidth - 14,
            gap: 10,
          });
        }
      });
    }
    y -= 4;
  }

  const curatedByTitle = new Map<string, ReportCitation>();
  domains.forEach((d) => {
    (d.literatureCitations || []).forEach((c) => {
      if ((c.source || '').toUpperCase() === 'CURATED') {
        const key = (c.title || '').toLowerCase().trim();
        if (key && !curatedByTitle.has(key)) curatedByTitle.set(key, c);
      }
    });
  });
  const curated = Array.from(curatedByTitle.values());
  if (curated.length > 0) {
    writeHeading('Curated knowledge base references');
    writeParagraph(
      'The following references were curated from practice-uploaded source PDFs and integrated into this report by the correlation engine.',
      { size: 8, color: slateLabel, gap: 11 }
    );
    y -= 2;
    renderCitations('Curated Knowledge Base', curated);
  }

  if (findings.aiDisclaimer) {
    writeHeading('Mandatory disclaimers');
    writeParagraph(findings.aiDisclaimer, { size: 7.5, font: fontOblique, color: slateLabel, gap: 10 });
  }

  drawFooter();

  return await pdfDoc.save();
}
