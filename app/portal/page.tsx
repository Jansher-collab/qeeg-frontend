"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { parseQeegTdtInBrowser } from "@/lib/reliabilityParser";
import { parseTovaReport, TovaSession } from "@/lib/tovaParser";
import {
  generatePreFilledChecklistPDF,
  generateCorrelationReportPDF,
  PractitionerChecklistDetails,
  CompletedChecklistPdfOptions,
  CorrelationReportFindings,
  DEFAULT_REPORT_FEE_AUD,
} from "@/lib/services/pdfService";
import { generateCaseReference } from "@/lib/caseReference";
import { getPayPalClientId } from "@/lib/paypalConfig";
import { useModalScrollLock } from "@/lib/hooks/useModalScrollLock";
import { usePayPalExceptionGuard } from "@/lib/hooks/usePayPalExceptionGuard";
import TopScrollbar from "@/components/TopScrollbar";
import PayPalErrorBoundary from "@/components/PayPalErrorBoundary";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import {
  PlusCircle,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Download,
  Search,
  X,
  FileCheck,
  Activity,
  Mail,
  ArrowRight,
  Lock,
  Upload,
  AlertTriangle,
  FileUp,
  Check,
  ClipboardList,
  Scale,
  Sparkles,
} from "lucide-react";

/**
 * Formats a fee amount for display, e.g. 65 -> "$65.00".
 *
 * The report fee is always charged in full, once, upfront: there is no
 * installment ladder anywhere in the app, and PayPal's native Pay Later /
 * Pay in 4 is disabled at the SDK layer.
 */
const formatFee = (amount: number): string =>
  `$${(Number.isFinite(amount) ? amount : DEFAULT_REPORT_FEE_AUD).toFixed(2)}`;

interface Report {
  id: string;
  caseReference: string;
  status: string;
  confidenceScore: number | null;
  reliabilityScore: number | null;
  age: number | null;
  gender: string | null;
  handedness: string | null;
  reportSummary: string | null;
  reviewerNotes: string | null;
  feeAmount: number;
  paidAmount: number;
  paymentStatus: string;
  paymentsJson?: PaymentCaptureEntry[] | null;
  createdAt: string;
  updatedAt: string;
  downloadedAt: string | null;
  purgedAt: string | null;
  findings?: any;
  /**
   * Authoritative payment gate, derived server-side by buildPaymentGate().
   * `downloadEligible` requires BOTH a finished analysis and the full fee.
   * Optional so a response predating this field still renders (the local
   * recompute below is the fallback), never trusted over the local check.
   */
  paymentGate?: {
    paidAmount: number;
    feeAmount: number;
    remainingAmount: number;
  fullyPaid: boolean;
    paymentState: "NOT_STARTED" | "PARTIAL" | "PAID";
    analysisComplete: boolean;
    downloadEligible: boolean;
  };
}

/** One captured PayPal payment, as recorded on QeeqReport.paymentsJson. */
interface PaymentCaptureEntry {
  authorizationId?: string;
  captureId: string;
  amount: number;
  capturedAt: string;
}

/**
 * The payment gate, mirroring buildPaymentGate() on the backend.
 *
 * "Has the customer finished paying?" and "is the analysis done?" are two
 * INDEPENDENT facts. Conflating them is what previously let an underpaid case
 * render as "Ready" with an enabled Download & Purge button, because the badge
 * keyed off `status === COMPLETED` alone. Every status badge and action below
 * must consult both.
 */
const isFullyPaid = (r: Report) =>
  (r.paidAmount ?? 0) >= ((r.feeAmount ?? DEFAULT_REPORT_FEE_AUD) - 0.005);

/** Analysis finished AND the fee is settled in full. */
const canDownload = (r: Report) => r.status === "COMPLETED" && isFullyPaid(r);

/** A single billable transaction row rendered in the billing history table. */
interface BillingTransaction {
  key: string;
  reportId: string;
  caseReference: string;
  /** The exact amount captured in THIS transaction (the full fee). */
  amount: number;
  paidAt: string;
  /** The report's full fee, so the table can render amount / fee. */
  feeAmount: number;
}

/**
 * Flattens the cumulative `paidAmount` on each report into ONE row per captured
 * payment so the billing history shows the amount actually taken in that
 * specific transaction rather than implying the full fee was charged when a
 * smaller amount was. Payment is a single full-amount capture; rows are keyed
 * off `paymentsJson` so the real captured amount is always shown. Legacy
 * single-capture rows (paymentsJson null, paidAmount > 0) are reconstructed from
 * the report totals so no transaction is ever hidden. Reports with no capture at
 * all still produce one "authorised / awaiting payment" row so an open case
 * stays visible.
 */
function buildBillingTransactions(reports: Report[]): BillingTransaction[] {
  const rows: BillingTransaction[] = [];

  for (const r of reports) {
    const fee = Math.round((r.feeAmount || DEFAULT_REPORT_FEE_AUD) * 100) / 100;
    const paid = Math.max(0, Math.round((r.paidAmount || 0) * 100) / 100);
    const entries = Array.isArray(r.paymentsJson) ? r.paymentsJson : [];

    if (entries.length > 0) {
      entries.forEach((entry, index) => {
        rows.push({
          key: `${r.id}-${entry.captureId || index}`,
          reportId: r.id,
          caseReference: r.caseReference,
          amount: Math.round((Number(entry.amount) || 0) * 100) / 100,
          paidAt: entry.capturedAt || r.updatedAt || r.createdAt,
          feeAmount: fee,
        });
      });
      continue;
    }

    if (paid > 0) {
      rows.push({
        key: `${r.id}-legacy`,
        reportId: r.id,
        caseReference: r.caseReference,
        amount: paid,
        paidAt: r.updatedAt || r.createdAt,
        feeAmount: fee,
      });
      continue;
    }

    rows.push({
      key: `${r.id}-pending`,
      reportId: r.id,
      caseReference: r.caseReference,
      amount: 0,
      paidAt: r.createdAt,
      feeAmount: fee,
    });
  }

  // Newest transaction first.
  return rows.sort((a, b) => new Date(b.paidAt).getTime() - new Date(a.paidAt).getTime());
}

interface Profile {
  fullName: string | null;
  professionalTitle: string | null;
  profession: string | null;
  providerNumber: string | null;
  clinicName: string | null;
  practiceAddress: string | null;
  phone: string | null;
  practiceEmail: string | null;
  notificationEmail: string | null;
}

interface ChecklistDomain {
  num: number;
  key: string;
  page: number;
  title: string;
  desc: string;
}

interface ChecklistSectionField {
  key: string;
  label: string;
  type: "text" | "textarea" | "checkbox" | "date" | "select";
  required?: boolean;
  readonly?: boolean;
  source?: string;
  placeholder?: string;
  detail?: string;
  options?: { value: string; label: string }[];
}

interface ChecklistSection {
  key: string;
  title: string;
  kind?: "fields" | "domains" | "static";
  readonly?: boolean;
  required?: boolean;
  insight?: string;
  domainPage?: number;
  lines?: string[];
  fields?: ChecklistSectionField[];
}

interface ChecklistConfig {
  version: number;
  likert: Record<string, string>;
  domains: ChecklistDomain[];
  sections?: ChecklistSection[];
}

// Today's calendar date in the practitioner's local timezone as YYYY-MM-DD.
// Deliberately avoids toISOString(), which is UTC and therefore yields
// *yesterday's* date for users east of Greenwich during their morning.
const todayLocalDateString = (): string => {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
};

// Baseline defaults for the fields the resolver reads by name. These values are
// also produced from the live schema below, but keeping them hardcoded means the
// form still initialises correctly before the checklist config has finished
// loading (and if the config fetch ever fails).
const legacyChecklistDefaults = (): Record<string, string | boolean> => ({
  recording_condition: "",
  quality_1: false,
  quality_2: false,
  quality_3: false,
  quality_4: false,
  service_agreement_ack: false,
  payment_auth_ack: false,
  additional_notes: "",
  signature: "",
  date_signed: todayLocalDateString(),
});

// Schema-derived defaults: every field declared in the active definition gets a
// type-appropriate initial value (checkbox -> false, date -> today, else "").
// Driven by the database-backed config so admin-authored fields appear with
// sensible values without any code change.
const defaultChecklistFieldValues = (
  config?: ChecklistConfig | null
): Record<string, string | boolean> => {
  const values = legacyChecklistDefaults();
  for (const section of config?.sections ?? []) {
    for (const field of section.fields ?? []) {
      if (Object.prototype.hasOwnProperty.call(values, field.key)) continue;
      if (field.type === "checkbox") values[field.key] = false;
      else if (field.type === "date") values[field.key] = todayLocalDateString();
      else values[field.key] = "";
    }
  }
  return values;
};

// Robustly normalises any stored value into a strict boolean for checkbox
// fields. Real booleans pass through; the native/HTML string encodings "true",
// "on", "1" and "yes" count as checked, while "false", "off", "0", "no",
// whitespace-only strings, null and undefined count as unchecked. Any other
// non-empty token falls back to JavaScript truthiness, so a checked box can
// never be misread as unchecked.
const isCheckboxChecked = (value: unknown): boolean => {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value !== 0;
  if (value === null || value === undefined) return false;
  const normalised = String(value).trim().toLowerCase();
  if (normalised === "") return false;
  return !["false", "off", "0", "no", "null", "undefined"].includes(normalised);
};

// A required field is complete when it holds a real value: a checked checkbox,
// or a non-empty (trimmed) value for every other input type. Shares the same
// checkbox semantics as the rendered `<input type="checkbox">`, so the visible
// state and the submit gate can never disagree.
const isChecklistFieldFilled = (
  field: ChecklistSectionField,
  resolved: string | boolean
): boolean => {
  if (field.type === "checkbox") return isCheckboxChecked(resolved);
  return String(resolved ?? "").trim() !== "";
};

function useAutoDismiss(value: unknown, onClear: () => void, delayMs = 4500) {
  const onClearRef = useRef(onClear);
  onClearRef.current = onClear;
  useEffect(() => {
    if (!value) return;
    const timer = setTimeout(() => onClearRef.current(), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);
}

function PortalDashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentView = searchParams.get("view") || "dashboard";

  const [reports, setReports] = useState<Report[]>([]);
  const [billingReports, setBillingReports] = useState<Report[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Modals state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  // Live admin-configured fee, fetched from /api/config. Drives every amount
  // shown in the checkout, the PayPal modal and the billing copy so the portal
  // always reflects the active price. The whole fee is charged in one payment.
  const [reportFee, setReportFee] = useState<number>(DEFAULT_REPORT_FEE_AUD);
  //
  // Guards against PayPal firing onApprove twice for the SAME approved order
  // (postrobot/iframe edge cases). Re-authorising a used order id returns
  // PayPal INVALID_RESOURCE_ID, so each order may be submitted exactly once.
  const handledPayPalOrderIds = useRef<Set<string>>(new Set());
  const [selectedReportForDownload, setSelectedReportForDownload] = useState<Report | null>(null);
  const [showIdentityModal, setShowIdentityModal] = useState(false);
  const [patientNameInput, setPatientNameInput] = useState("");
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [downloadConfirmed, setDownloadConfirmed] = useState(false);
  const [collectionToken, setCollectionToken] = useState<string | null>(null);
  const [collectionHandled, setCollectionHandled] = useState(false);

  // Profile Edit State
  const [profileFormData, setProfileFormData] = useState<Partial<Profile>>({});
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSaveSuccess, setProfileSaveSuccess] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  // File Input References
  const qeegFileInputRef = useRef<HTMLInputElement>(null);
  const tovaFileInputRef = useRef<HTMLInputElement>(null);

  // New Case Multi-Step Form State
  const [qeegFileSelected, setQeegFileSelected] = useState(false);
  const [qeegFileName, setQeegFileName] = useState("");
  const [qeegFileSize, setQeegFileSize] = useState("");
  const [qeegReliabilityPassed, setQeegReliabilityPassed] = useState(false);
  const [rawTdtText, setRawTdtText] = useState<string>("");
  const [reliabilityCheckMessage, setReliabilityCheckMessage] = useState<string | null>(null);
  const [reliabilityError, setReliabilityError] = useState<string | null>(null);
  const [tovaFileSelected, setTovaFileSelected] = useState(false);
  const [tovaFileName, setTovaFileName] = useState("");
  const [tovaData, setTovaData] = useState<TovaSession | null>(null);
  const [tovaParseMessage, setTovaParseMessage] = useState<string | null>(null);
  const [tovaError, setTovaError] = useState<string | null>(null);
  const [checklistConfig, setChecklistConfig] = useState<ChecklistConfig | null>(null);
  const [checklistScores, setChecklistScores] = useState<Record<string, number>>({});
  const [checklistFieldValues, setChecklistFieldValues] = useState<Record<string, string | boolean>>(
    () => defaultChecklistFieldValues()
  );
  const [checklistReviewed, setChecklistReviewed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<{
    caseReference: string;
    generatedAt: string;
    message?: string;
  } | null>(null);
  const [activeNewTab, setActiveNewTab] = useState<1 | 2>(1);
  const [checklistPdfBusy, setChecklistPdfBusy] = useState(false);

  // Legal acceptance barrier (DPA / EULA)
  const [legalPending, setLegalPending] = useState<string[]>([]);
  const [legalLoading, setLegalLoading] = useState(true);
  const [legalAccepting, setLegalAccepting] = useState(false);
  const [legalError, setLegalError] = useState<string | null>(null);
  const [legalChecked, setLegalChecked] = useState<Record<string, boolean>>({});
  const [legalCurrent, setLegalCurrent] = useState<Record<string, string>>({});

  // While ANY portal modal is open, lock the background scroll and stabilise
  // the layout (no reflow/jitter when the scrollbar hides). See the hook.
  const isAnyModalOpen = Boolean(
    paymentError ||
      showPaymentModal ||
      (showIdentityModal && selectedReportForDownload) ||
      (!legalLoading && legalPending.length > 0)
  );
  useModalScrollLock(isAnyModalOpen);

  // Swallow PayPal's SDK-internal "paypal_js_sdk_v5_unhandled_exception"
  // rejections while the payment modal is on screen so they never reach the
  // global error handler or spam the console after a successful authorisation.
  usePayPalExceptionGuard(showPaymentModal);

  // Bring the payment modal into view the instant it opens, even if the user
  // clicked "Pay" while scrolled deep into the dashboard or billing table.
  useEffect(() => {
    if (showPaymentModal) window.scrollTo({ top: 0, behavior: "instant" });
  }, [showPaymentModal]);

  useAutoDismiss(submitSuccess, () => setSubmitSuccess(null));
  useAutoDismiss(profileSaveSuccess, () => setProfileSaveSuccess(false));
  useAutoDismiss(legalError, () => setLegalError(null));

  // Parsed QEEG reliability details (real split-half when available)
  const [qeegSplitHalf, setQeegSplitHalf] = useState<number>(0.96);

  const [newCaseData, setNewCaseData] = useState({
    caseReference: "",
    age: "34",
    gender: "MALE",
    handedness: "RIGHT",
    reliabilityScore: "0.94",
  });

  // TOVA is considered "uploaded and verified" only when a file was accepted
  // AND the last parse attempt produced no error. `tovaData` alone is not a
  // reliable signal: handleTovaFileUploaded stores `result.selectedSession ||
  // null`, so a successful parse can legitimately yield a null session while
  // the file itself is still valid.
  const tovaVerified = tovaFileSelected && !tovaError;

  // Both Tab 1 uploads must be complete and verified before the practitioner
  // can advance to the Symptom Checklist. Drives the trailing "Continue to
  // Checklist" action and the Tab 2 tab gate alike, so the step cannot be
  // bypassed by clicking the tab directly.
  const filesReadyToContinue = qeegReliabilityPassed && tovaVerified;

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [reportsRes, profileRes] = await Promise.all([
        fetch("/api/practitioner/reports", { credentials: "include" }),
        fetch("/api/practitioner/profile", { credentials: "include" }),
      ]);

      if (reportsRes.ok) {
        const reportsData = await reportsRes.json();
        setReports(reportsData.reports || []);
      }

      if (profileRes.ok) {
        const profileData = await profileRes.json();
        const prof = profileData.profile || null;
        setProfile(prof);
        setProfileFormData(prof || {});
      }
    } catch (err) {
      console.error("Error loading dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchBillingHistory = async () => {
    try {
      const res = await fetch("/api/practitioner/billing", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setBillingReports(data.reports || []);
      } else {
        console.error("Failed to fetch billing history:", await res.text());
        setBillingReports([]);
      }
    } catch (err) {
      console.error("Error loading billing history:", err);
      setBillingReports([]);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Fetch billing history when billing view is active
  useEffect(() => {
    if (currentView === "billing") {
      fetchBillingHistory();
    }
  }, [currentView]);

  // Load the config-driven checklist definition (single source of truth shared
  // with the printable PDF) and the DPA/EULA acceptance status.
  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const [configRes, legalRes, legalCurrentRes, billingConfigRes] = await Promise.all([
          fetch("/api/checklist-config", { credentials: "include", cache: "no-store" }),
          fetch("/api/legal/status", { credentials: "include" }),
          fetch("/api/legal/current", { credentials: "include" }),
          fetch("/api/config", { credentials: "include" }),
        ]);

        if (active && billingConfigRes.ok) {
          const billingConfigData = await billingConfigRes.json();
          const liveFee = Number(billingConfigData.config?.reportFeeAUD);
          if (Number.isFinite(liveFee) && liveFee > 0) {
            setReportFee(liveFee);
          }
        }

        if (active && configRes.ok) {
          const configData = await configRes.json();
          if (configData.config) {
            setChecklistConfig(configData.config);
            // Seed schema-derived defaults for any admin-authored fields while
            // preserving anything the practitioner has already entered.
            setChecklistFieldValues((prev) => ({
              ...defaultChecklistFieldValues(configData.config),
              ...prev,
            }));
          }
        }

        if (active && legalRes.ok) {
          const legalData = await legalRes.json();
          setLegalPending(legalData.pending || []);
        }

        if (active && legalCurrentRes.ok) {
          const legalCurrentData = await legalCurrentRes.json();
          const versions: Record<string, string> = {};
          for (const doc of legalCurrentData.documents || []) {
            versions[doc.documentType] = doc.version;
          }
          setLegalCurrent(versions);
        }
      } catch (err) {
        console.error("Failed to load portal resources:", err);
      } finally {
        if (active) setLegalLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  // Auto-refresh while any report is generating via the background worker so
  // the GENERATING -> COMPLETED transition appears without a manual refresh.
  useEffect(() => {
    const isGenerating = (r: { status: string }) => r.status === "GENERATING";
    if (reports.some(isGenerating)) {
      const timer = setInterval(fetchDashboardData, 4000);
      return () => clearInterval(timer);
    }
  }, [reports]);

  // Auto-open the report collection view when arriving via an email link that
  // carries a reportId (and optionally a collection token). Runs only once after
  // the dashboard data has loaded so the report is already present in state.
  const reportIdParam = searchParams.get("reportId");
  const tokenParam = searchParams.get("token");
  useEffect(() => {
    if (!reportIdParam || collectionHandled || loading) return;

    const target = reports.find((r) => r.id === reportIdParam);
    // Defer the state updates so the effect stays pure (avoids synchronous
    // setState within the effect body).
    const timer = setTimeout(() => {
      setCollectionHandled(true);
      if (target) {
        setCollectionToken(tokenParam);
        setSelectedReportForDownload(target);
        setDownloadConfirmed(false);
        setShowIdentityModal(true);
      } else {
        // Report not found in the practitioner's list (e.g. already purged).
        setShowIdentityModal(false);
        alert(
          "This report is no longer available in your portal. In accordance with our zero-retention policy, reports are permanently purged immediately after download."
        );
      }
    }, 0);

    return () => clearTimeout(timer);
  }, [reportIdParam, reports, loading, tokenParam, collectionHandled]);

  // ------------------------------------------------------------------
  // Completed Symptom Checklist PDF (Tab 2): generated in-browser from the
  // exact live-form data + Case Reference. No separate PDF upload required.
  // ------------------------------------------------------------------
  const resolveChecklistPdfInputs = (
    overrides?: {
      caseReference?: string;
      scores?: Record<string, number>;
      config?: ChecklistConfig | null;
      age?: string;
      gender?: string;
      handedness?: string;
    }
  ): { details: PractitionerChecklistDetails; options: CompletedChecklistPdfOptions } => {
    const config = overrides?.config ?? checklistConfig;
    const scoreMap = overrides?.scores ?? checklistScores;
    const details: PractitionerChecklistDetails = {
      fullName: profileFormData.fullName || "",
      professionalTitle: profileFormData.professionalTitle || "",
      profession: profileFormData.profession || "",
      providerNumber: profileFormData.providerNumber || "",
      clinicName: profileFormData.clinicName || "",
      practiceAddress: profileFormData.practiceAddress || "",
      phone: profileFormData.phone || "",
      practiceEmail: profileFormData.practiceEmail || "",
      email: profileFormData.notificationEmail || "",
    };

    // Generic, schema-agnostic value map: every field in every section is keyed
    // by its field key so the PDF generator can render admin-authored custom
    // fields without any code change.
    const fieldValues: Record<string, string | boolean> = {};
    for (const section of config?.sections ?? []) {
      for (const field of section.fields ?? []) {
        fieldValues[field.key] = resolveChecklistFieldValue(field);
      }
    }

    const options: CompletedChecklistPdfOptions = {
      caseReference: overrides?.caseReference ?? newCaseData.caseReference,
      age: overrides?.age ?? newCaseData.age,
      gender: overrides?.gender ?? newCaseData.gender,
      handedness: overrides?.handedness ?? newCaseData.handedness,
      reliabilityScore: newCaseData.reliabilityScore,
      checklistScores: scoreMap,
      domains: config?.domains ?? [],
      likert: config?.likert,
      sections: config?.sections ?? [],
      fieldValues,
      // Raw case store so a custom field bound to an arbitrary `case.*` source
      // resolves in the PDF even if it is not one of the canonical fields.
      caseData: newCaseData as unknown as Record<string, unknown>,
      recordingCondition:
        typeof checklistFieldValues.recording_condition === "string"
          ? checklistFieldValues.recording_condition
          : null,
      qualityChecks: {
        quality_1: !!checklistFieldValues.quality_1,
        quality_2: !!checklistFieldValues.quality_2,
        quality_3: !!checklistFieldValues.quality_3,
        quality_4: !!checklistFieldValues.quality_4,
      },
      additionalNotes:
        typeof checklistFieldValues.additional_notes === "string"
          ? checklistFieldValues.additional_notes
          : "",
      serviceAgreementAcknowledged: !!checklistFieldValues.service_agreement_ack,
      paymentAuthorisationAcknowledged: !!checklistFieldValues.payment_auth_ack,
      signature:
        typeof checklistFieldValues.signature === "string" && checklistFieldValues.signature.trim()
          ? checklistFieldValues.signature
          : undefined,
      dateSigned:
        typeof checklistFieldValues.date_signed === "string" ? checklistFieldValues.date_signed : undefined,
    };
    return { details, options };
  };

  const setChecklistField = (key: string, value: string | boolean) => {
    setChecklistFieldValues((prev) => ({ ...prev, [key]: value }));
    setChecklistReviewed(false);
  };

  // Routes a config field's input to the correct store: case-bound fields
  // (client age, gender, handedness) live in newCaseData where the QEEG/TOVA
  // summary, PDF generator and submit payload all read them; everything else
  // lives in checklistFieldValues. Gender/handedness are normalised to
  // uppercase so 'Female' vs 'FEMALE' resolve to the same select option.
  const setCaseBoundFieldValue = (field: ChecklistSectionField, value: string | boolean) => {
    if (typeof value === "string" && field.source?.startsWith("case.")) {
      const caseKey = field.source.slice("case.".length);
      if (caseKey && caseKey !== "reference") {
        const next =
          caseKey === "gender" || caseKey === "handedness" ? value.toUpperCase() : value;
        setNewCaseData((prev) => ({ ...prev, [caseKey]: next }));
        setChecklistReviewed(false);
        return;
      }
    }
    setChecklistField(field.key, value);
  };

  const rateChecklistDomain = (key: string, value: number) => {
    setChecklistScores((prev) => ({ ...prev, [key]: value }));
    // Any questionnaire change re-locks submission until the PDF is re-reviewed.
    setChecklistReviewed(false);
  };

  const resetChecklistInputs = () => {
    setChecklistFieldValues(defaultChecklistFieldValues(checklistConfig));
    setChecklistReviewed(false);
  };

  // Resolves a config-driven field's current value: profile/case fields bind to
  // account + upload data; everything else lives in checklistFieldValues. The
  // result is normalised per input type so checkbox and select state is read
  // consistently by the renderer, the PDF generator and the submit gate.
  const resolveChecklistFieldValue = (field: ChecklistSectionField): string | boolean => {
    let raw: string | boolean;
    switch (field.source) {
      case "profile.fullName":
        raw = profileFormData.fullName || "";
        break;
      case "profile.notificationEmail":
        raw = profileFormData.notificationEmail || "";
        break;
      case "profile.professionalTitle":
        raw = profileFormData.professionalTitle || "";
        break;
      case "profile.profession":
        raw = profileFormData.profession || "";
        break;
      case "profile.providerNumber":
        raw = profileFormData.providerNumber || "";
        break;
      case "profile.clinicName":
        raw = profileFormData.clinicName || "";
        break;
      case "profile.phone":
        raw = profileFormData.phone || "";
        break;
      case "profile.practiceAddress":
        raw = profileFormData.practiceAddress || "";
        break;
      case "case.reference":
        raw = newCaseData.caseReference;
        break;
      case "case.age":
        raw = newCaseData.age;
        break;
      case "case.gender":
        raw = newCaseData.gender;
        break;
      case "case.handedness":
        raw = newCaseData.handedness;
        break;
      default:
        // Mirror setCaseBoundFieldValue: any (including future) `case.*` source
        // is written to newCaseData, so it must be read from there too, not
        // from checklistFieldValues. Otherwise a custom case-bound field would
        // always resolve empty and be falsely reported as missing.
        if (field.source?.startsWith("case.")) {
          const caseKey = field.source.slice("case.".length);
          if (caseKey && caseKey !== "reference") {
            raw = (newCaseData as unknown as Record<string, string | undefined>)[caseKey] ?? "";
            break;
          }
        }
        raw = Object.prototype.hasOwnProperty.call(checklistFieldValues, field.key)
          ? checklistFieldValues[field.key] ?? ""
          : "";
        break;
    }

    if (field.type === "checkbox") {
      return isCheckboxChecked(raw);
    }

    if (field.type === "select") {
      const trimmed = (typeof raw === "string" ? raw : raw ? String(raw) : "").trim();
      if (trimmed === "") return "";
      // Canonicalise to the matched option's value (case-insensitive) so
      // "female" / "FEMALE" / "Female" all resolve to the same selection.
      const match = (field.options || []).find(
        (o) => o.value.toLowerCase() === trimmed.toLowerCase()
      );
      return match ? match.value : trimmed;
    }

    if (typeof raw === "boolean") return raw ? "true" : "";
    return raw;
  };

  // Every required section and field, from the first to the last, must be
  // complete before a PDF can be generated and before payment can be
  // authorised. Returns human-readable descriptors of what is still missing.
  const missingChecklistFields = (): string[] => {
    if (!checklistConfig) return [];
    const missing: string[] = [];
    for (const section of checklistConfig.sections ?? []) {
      const kind = section.kind ?? "fields";
      if (kind === "domains") {
        if (section.required === false) continue;
        const unrated = checklistConfig.domains
          .filter((d) => d.page === section.domainPage && checklistScores[d.key] === undefined)
          .map((d) => d.num);
        if (unrated.length > 0) {
          missing.push(`${section.title}: domains ${unrated.join(", ")}`);
        }
      } else if (kind === "fields" && Array.isArray(section.fields)) {
        if (section.required === false) continue;
        for (const f of section.fields) {
          if (!f.required) continue;
          const resolved = resolveChecklistFieldValue(f);
          if (!isChecklistFieldFilled(f, resolved)) {
            missing.push(f.label);
          }
        }
      }
    }
    return missing;
  };

  // The validation banner is fully persistent: it must NEVER auto-dismiss on a
  // timer, because the submission gates it reports (missing QEEG/TOVA file,
  // incomplete checklist sections/domains, unreviewed checklist PDF) can take
  // the practitioner well past 4.5s to resolve. It disappears automatically
  // only when 100% of the required fields and sections are complete.
  const allRequiredComplete =
    qeegReliabilityPassed &&
    !!newCaseData.caseReference &&
    filesReadyToContinue &&
    !!checklistConfig &&
    checklistReviewed &&
    missingChecklistFields().length === 0;

  useEffect(() => {
    if (allRequiredComplete) setSubmitError(null);
  }, [allRequiredComplete]);

  const checklistPdfFilename = (caseReference: string) =>
    `QEEG_Symptom_Checklist_Completed_${caseReference}.pdf`;

  const handlePreviewChecklistPdf = async () => {
    if (!qeegReliabilityPassed || !newCaseData.caseReference) {
      setSubmitError("Upload a passing QEEG file first — the Case Reference is generated at the reliability gate.");
      return;
    }
    const missing = missingChecklistFields();
    if (missing.length > 0) {
      setSubmitError(
        `Complete every required checklist section from first to last before generating the PDF. Missing: ${missing.join("; ")}.`
      );
      return;
    }
    try {
      setChecklistPdfBusy(true);
      const { details, options } = resolveChecklistPdfInputs();
      const bytes = await generatePreFilledChecklistPDF(details, options, reportFee);
      const blob = new Blob([bytes as BlobPart], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      window.open(url, "_blank");
      // Keep the object URL alive until the viewer tab has loaded.
      setTimeout(() => window.URL.revokeObjectURL(url), 120000);
      setChecklistReviewed(true);
    } catch (err: any) {
      alert(err?.message || "Failed to generate checklist PDF.");
    } finally {
      setChecklistPdfBusy(false);
    }
  };

  const handleDownloadChecklistPdfCompleted = async () => {
    if (!qeegReliabilityPassed || !newCaseData.caseReference) {
      setSubmitError("Upload a passing QEEG file first — the Case Reference is generated at the reliability gate.");
      return;
    }
    const missing = missingChecklistFields();
    if (missing.length > 0) {
      setSubmitError(
        `Complete every required checklist section from first to last before generating the PDF. Missing: ${missing.join("; ")}.`
      );
      return;
    }
    try {
      setChecklistPdfBusy(true);
      const { details, options } = resolveChecklistPdfInputs();
      const bytes = await generatePreFilledChecklistPDF(details, options, reportFee);
      const blob = new Blob([bytes as BlobPart], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = checklistPdfFilename(newCaseData.caseReference);
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
      setChecklistReviewed(true);
    } catch (err: any) {
      alert(err?.message || "Failed to generate checklist PDF.");
    } finally {
      setChecklistPdfBusy(false);
    }
  };

  // Client-Side QEEG File Selection, Verification & De-Identification
  const handleQeegFileUploaded = (file: File) => {
    setReliabilityError(null);
    setReliabilityCheckMessage(null);
    setSubmitError(null);

    const sizeFormatted = (file.size / 1024).toFixed(1) + " KB";
    setQeegFileSize(sizeFormatted);

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = (e.target?.result as string) || "";

      // In-browser quality gate check
      const parseResult = parseQeegTdtInBrowser(text);

      if (!parseResult.passed) {
        setQeegFileSelected(false);
        setQeegReliabilityPassed(false);
        setReliabilityError(
          parseResult.error ||
          "Quality gate failed: Test/Retest reliability score is below the 0.80 threshold. Submission halted in browser with zero server upload and zero fee."
        );
        return;
      }

      setQeegFileName(file.name || `QEEG-Record-${newCaseData.caseReference}.tdt`);
      setQeegFileSelected(true);
      setQeegReliabilityPassed(true);
      // Tab 1: reliability >= 0.80 => automatically generate ONE unique Case
      // Reference shared by the QEEG, the TOVA file and the Symptom Checklist.
      const caseReference = generateCaseReference();
      setReliabilityCheckMessage(
        `✓ Quality Gate Verified: Test/Retest Reliability is ${parseResult.reliabilityScore.toFixed(2)} (≥ 0.80). De-identified in browser.`
      );

      // New case => fresh checklist session: all sections/fields reset to
      // defaults and submission stays locked until the checklist PDF is reviewed.
      resetChecklistInputs();

      if (parseResult.deidentifiedContent) {
        setRawTdtText(parseResult.deidentifiedContent);
      } else {
        setRawTdtText(text);
      }

      // Keep the real split-half coefficient (from the de-identified QEEG)
      // so the report's reliability block reflects the actual export.
      if (parseResult.splitHalfScore !== undefined) {
        setQeegSplitHalf(parseResult.splitHalfScore);
      }

      // Auto-populate parsed demographics + the fresh, unique Case Reference
      setNewCaseData((prev) => ({
        ...prev,
        caseReference,
        age: parseResult.age ? String(parseResult.age) : prev.age,
        gender: parseResult.gender || prev.gender,
        handedness: parseResult.handedness || prev.handedness,
        reliabilityScore: parseResult.reliabilityScore.toFixed(2),
      }));
    };

    reader.readAsText(file);
  };

  // Client-Side TOVA Parsing: extracts structured metrics in-browser and strips
  // any PHI before submission. Multi-session files resolve to the most recent
  // applicable session locally; only the selected session's metrics are sent.
  const handleTovaFileUploaded = (file: File) => {
    setTovaError(null);
    setTovaParseMessage(null);
    setSubmitError(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = (e.target?.result as string) || "";
      const result = parseTovaReport(text, parseFloat(newCaseData.age) || undefined);

      if (!result.passed) {
        setTovaFileSelected(false);
        setTovaFileName("");
        setTovaData(null);
        setTovaError(result.error || "TOVA file could not be parsed.");
        return;
      }

      setTovaFileName(file.name);
      setTovaFileSelected(true);
      setTovaData(result.selectedSession || null);
      setTovaParseMessage(
        result.sessions.length > 1
          ? `✓ Parsed ${result.sessions.length} TOVA session(s); selected the most recent applicable session${result.selectedSession?.sessionLabel ? ` (${result.selectedSession.sessionLabel})` : ""}.`
          : "✓ TOVA metrics parsed and de-identified in the browser."
      );
    };
    reader.readAsText(file);
  };

  // Submit De-Identified Payload to Server
  const handleCreateCase = async (paypalOrderId?: string) => {
    if (!qeegReliabilityPassed || !newCaseData.caseReference) {
      setSubmitError("Please upload a valid QEEG .tdt file that passes the 0.80 reliability threshold first.");
      return;
    }
    // TOVA supporting-test data is mandatory and is re-validated server-side.
    if (!filesReadyToContinue) {
      setSubmitError(
        "Please upload and verify both the QEEG .tdt file and the TOVA report before submitting."
      );
      return;
    }
    if (!checklistConfig) {
      setSubmitError("Symptom checklist definition is still loading. Please wait a moment and retry.");
      return;
    }
    // Workflow order: the full checklist must be reviewed/downloaded as a PDF
    // before the $65 AUD hold can be authorised and the payload submitted.
    if (!checklistReviewed) {
      setSubmitError(
        "Complete and review the Symptom Checklist PDF first (Tab 2 → Preview/Download Checklist PDF). Payment and submission are only unlocked after the full checklist has been reviewed."
      );
      return;
    }
    const missingFields = missingChecklistFields();
    if (missingFields.length > 0) {
      setSubmitError(`Please complete every required checklist section and domain before submitting. Missing: ${missingFields.join("; ")}.`);
      return;
    }

    setSubmitError(null);
    setSubmitting(true);

    console.info("[PAYPAL] handleCreateCase called with paypalOrderId:", paypalOrderId ?? "(none)");

    try {
      const tdtPayload =
        rawTdtText ||
        `[PATIENT_INFO]\nAge=${newCaseData.age}\nGender=${newCaseData.gender}\nHandedness=${newCaseData.handedness}\n\n[RELIABILITY_BLOCK]\nSplitHalf=${qeegSplitHalf}\nTestRetest=${newCaseData.reliabilityScore}\nChannels=19\n`;

      // Config-driven checklist payload built from the live definition,
      // including every section captured in the HTML form (recording quality,
      // recording condition, clinical notes, agreement/payment ack, sign-off).
      //
      // Generic, schema-agnostic field map: EVERY field in the active schema is
      // serialised by its exact `field.key` (the same identifier the UI writes
      // into state and resolveChecklistFieldValue reads), so admin-authored
      // custom fields reach the server validator, the report payload and both
      // PDF engines with no code change. The legacy aliases below are kept for
      // backward compatibility with older consumers.
      const checklistFieldPayload: Record<string, string | boolean> = {};
      for (const section of checklistConfig.sections ?? []) {
        for (const field of section.fields ?? []) {
          checklistFieldPayload[field.key] = resolveChecklistFieldValue(field);
        }
      }

      const checklistData = {
        version: checklistConfig.version,
        domains: checklistConfig.domains.map((d) => ({
          key: d.key,
          num: d.num,
          title: d.title,
          score: checklistScores[d.key],
        })),
        severityScore: checklistConfig.domains.reduce((sum, d) => sum + (checklistScores[d.key] || 0), 0),
        symptoms: checklistConfig.domains
          .filter((d) => (checklistScores[d.key] || 0) >= 3)
          .map((d) => d.title),
        recordingCondition:
          typeof checklistFieldValues.recording_condition === "string"
            ? checklistFieldValues.recording_condition
            : "",
        recordingQuality: {
          quality_1: !!checklistFieldValues.quality_1,
          quality_2: !!checklistFieldValues.quality_2,
          quality_3: !!checklistFieldValues.quality_3,
          quality_4: !!checklistFieldValues.quality_4,
        },
        additionalNotes:
          typeof checklistFieldValues.additional_notes === "string"
            ? checklistFieldValues.additional_notes
            : "",
        serviceAgreementAcknowledged: !!checklistFieldValues.service_agreement_ack,
        paymentAuthorisationAcknowledged: !!checklistFieldValues.payment_auth_ack,
        signature: typeof checklistFieldValues.signature === "string" ? checklistFieldValues.signature : "",
        dateSigned: typeof checklistFieldValues.date_signed === "string" ? checklistFieldValues.date_signed : "",
        // Generic per-field map consumed by the server validator / report
        // pipeline. Keyed by field.key so custom fields require no changes.
        fields: checklistFieldPayload,
      };

      const submitPayload: Record<string, unknown> = {
        caseReference: newCaseData.caseReference,
        age: parseFloat(newCaseData.age),
        gender: newCaseData.gender,
        handedness: newCaseData.handedness,
        reliabilityScore: parseFloat(newCaseData.reliabilityScore),
        tdtContent: tdtPayload,
        reliabilityBlock: {
          testRetest: parseFloat(newCaseData.reliabilityScore),
          splitHalf: qeegSplitHalf,
          overallReliability: parseFloat(newCaseData.reliabilityScore),
        },
        checklistData,
        // TOVA is mandatory: only the de-identified, parsed metrics are ever
        // transmitted (never the raw file), and the server re-validates them.
        tovaData,
        // The single, one-time full payment: the backend authorises and then
        // captures the ENTIRE fee for this approved order. The amount is
        // derived server-side from the configured fee, never sent by the client.
        paypalOrderId,
      };

      const submitRes = await fetch("/api/reports/submit", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submitPayload),
      });

      const text = await submitRes.text();
      const data = text ? JSON.parse(text) : {};

      if (!submitRes.ok) {
        // Payment-authorisation failure: the account/wallet could not be
        // validated for funds, so the case is blocked. Surface a dedicated
        // popup (with the logged-in username) instead of a generic banner.
        // Any payment refusal (insufficient funds, instrument declined, etc.)
        // is surfaced via the dedicated payment-error popup. The backend maps
        // the raw PayPal failure to a stable errorCode + friendly message.
        const PAYMENT_ERROR_CODES = [
          "PAYMENT_FAILED",
          "INSUFFICIENT_FUNDS",
          "INSTRUMENT_DECLINED",
          "FUNDING_SOURCE_LIMIT",
          "PAYER_ACCOUNT_LOCKED",
        ];
        if (data.errorCode && PAYMENT_ERROR_CODES.includes(data.errorCode)) {
          setShowPaymentModal(false);
          setSubmitting(false);
          setPaymentError(
            data.error ||
              "Your payment could not be authorised. Please check your payment method or account funds and try again."
          );
          return;
        }
        // Mandatory-field rejection (422). The server validates every field
        // independently of the browser, so this is the authoritative list of
        // what is still missing. Close the payment modal and show the specific
        // field labels rather than a generic failure.
        if (submitRes.status === 422 && Array.isArray(data.fieldErrors)) {
          setShowPaymentModal(false);
          setSubmitting(false);
          setPaymentError(null);
          const labels = data.fieldErrors
            .map((fe: { label?: string; field?: string }) => fe?.label || fe?.field)
            .filter(Boolean);
          setSubmitError(
            `Please complete every required field before submitting. Missing: ${labels.join("; ")}.`
          );
          return;
        }

        throw new Error(data.error || "Submission failed.");
      }

      // Tab 2: on successful submission, automatically generate the completed
      // checklist PDF (same data + Case Reference) with zero additional upload.
      // The server is authoritative for the Case Reference (it regenerates on
      // a rare collision), so use the value it returns.
      const serverCaseReference =
        typeof data.caseReference === "string" && data.caseReference
          ? data.caseReference
          : newCaseData.caseReference;
      const captured = {
        caseReference: serverCaseReference,
        scores: { ...checklistScores },
        config: checklistConfig,
        age: newCaseData.age,
        gender: newCaseData.gender,
        handedness: newCaseData.handedness,
      };
      const generatedAt = new Date().toISOString();
      // No automatic file download: the report stays securely on the server and
      // is only ever downloaded when the practitioner explicitly clicks the
      // manual one-time Download action in their dashboard/history list.
      setSubmitSuccess({ caseReference: captured.caseReference, generatedAt });

      // Reset new report state
      setShowPaymentModal(false);
      setQeegFileSelected(false);
      setQeegReliabilityPassed(false);
      setTovaFileSelected(false);
      setTovaFileName("");
      setTovaData(null);
      setTovaParseMessage(null);
      setTovaError(null);
      setChecklistScores({});
      setRawTdtText("");
      setReliabilityCheckMessage(null);
      setReliabilityError(null);
      setQeegSplitHalf(0.96);
      resetChecklistInputs();
      setNewCaseData({
        caseReference: "",
        age: "34",
        gender: "MALE",
        handedness: "RIGHT",
        reliabilityScore: "0.94",
      });
      setActiveNewTab(1);

      router.push("/portal");
      fetchDashboardData();
    } catch (err: any) {
      setSubmitError(err.message || "Failed to submit case.");
    } finally {
      setSubmitting(false);
    }
  };

  // Record one-time legal acceptance (DPA / EULA). The portal is gated behind
// these until every pending document is accepted with an explicit version.
  const handleAcceptLegal = async () => {
    const allChecked = legalPending.length > 0 && legalPending.every((t) => legalChecked[t]);
    if (!allChecked) {
      setLegalError("Please read and accept each document before continuing.");
      return;
    }
    setLegalAccepting(true);
    setLegalError(null);
    try {
      for (const acceptanceType of legalPending) {
        const res = await fetch("/api/legal/accept", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ acceptanceType, version: legalCurrent[acceptanceType] || "2026-09-01" }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || `Failed to record ${acceptanceType} acceptance.`);
      }
      setLegalPending([]);
    } catch (err: any) {
      setLegalError(err.message || "Failed to record acceptance.");
    } finally {
      setLegalAccepting(false);
    }
  };

  // Execute Local Report Download with Identity Stamping & Immediate Purge
  const handleExecuteDownload = async () => {
    if (!selectedReportForDownload) return;
    const report = selectedReportForDownload;

    if (!downloadConfirmed) {
      alert("Please confirm that you understand this is a one-time, irreversible download.");
      return;
    }

    try {
      setDownloadingId(report.id);
      const tokenQuery = collectionToken ? `?token=${encodeURIComponent(collectionToken)}` : "";

      // Phase 1: fetch the report findings WITHOUT purging. The server holds a
      // short-lived claim for this caller, so a retry after a render failure is
      // served instantly, while a second concurrent downloader is rejected 409
      // and an already-purged report returns 410 with its real message.
      const res = await fetch(`/api/reports/${report.id}/download${tokenQuery}`, {
        credentials: "include",
      });
      if (!res.ok) {
        let message = "Failed to download report.";
        try {
          const errData = await res.json();
          if (errData?.error) message = errData.error;
        } catch {
          // keep the default message
        }
        throw new Error(message);
      }

      const reportJson = (await res.json()) as CorrelationReportFindings;

      // Stamp patient identity locally in browser only
      const stampedFindings: CorrelationReportFindings = {
        ...reportJson,
        clientSideIdentityStamp: {
          patientName: patientNameInput.trim() || "Confidential Patient",
          stampedLocallyAt: new Date().toISOString(),
          notice: "Identity attached locally in browser. Zero patient names stored on QEEG.com.au servers.",
        },
      };

      // Render the correlation report to PDF in-browser with every curated
      // literature citation rendered inline; the identity stamp never leaves
      // the practitioner's machine.
      const pdfBytes = await generateCorrelationReportPDF(stampedFindings);
      const blob = new Blob([pdfBytes as BlobPart], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `QEEG-Correlation-Report-${report.caseReference}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();

      // Phase 2: the PDF has been rendered and saved locally, so finalise the
      // zero-retention purge NOW that the full report content has left the
      // server. The endpoint is idempotent; a transient network failure is
      // retried once so a lost response cannot strand the report as COMPLETED.
      const finalise = (): Promise<Response> =>
        fetch(`/api/reports/${report.id}/download/complete${tokenQuery}`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        });
      let completeRes = await finalise();
      if (!completeRes.ok) {
        await new Promise((resolve) => setTimeout(resolve, 1200));
        completeRes = await finalise();
      }
      if (!completeRes.ok) {
        let message = "";
        try {
          const errData = await completeRes.json();
          if (errData?.error) message = errData.error;
        } catch {
          // keep the default message
        }
        alert(
          message
            ? `Your PDF downloaded but the server could not confirm the final purge: ${message}`
            : "Your PDF downloaded but the server could not confirm the final purge. The report will be finalised on your next download or automatically."
        );
      }

      // Close modals
      setShowIdentityModal(false);
      setSelectedReportForDownload(null);
      setPatientNameInput("");
      setDownloadConfirmed(false);
      setCollectionToken(null);

      // Refresh list to reflect purged status
      fetchDashboardData();
    } catch (err: any) {
      alert(err.message || "Download failed.");
    } finally {
      setDownloadingId(null);
    }
  };

  const profileFieldClass = "w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:border-[#16233B] outline-none transition-all";

  /** Profile fields that feed the report header; all mandatory. */
  const REQUIRED_PROFILE_KEYS = [
    "fullName",
    "professionalTitle",
    "profession",
    "providerNumber",
    "clinicName",
    "practiceAddress",
    "phone",
  ] as const;

const handleSaveProfile = async (e: React.FormEvent) => {
  e.preventDefault();
    setProfileSaving(true);
    setProfileSaveSuccess(false);

    // Mandatory-field pass before the request. These all feed the generated
    // report header, and a blank here would block case submission later.
    const missing = REQUIRED_PROFILE_KEYS.filter(
      (key) => String(profileFormData[key] ?? "").trim() === ""
    );
    if (missing.length > 0) {
      setProfileSaving(false);
      setProfileError(
        `Please complete every required field: ${missing.join(", ")}.`
      );
 return;
    }

    setProfileError(null);

 try {
      const res = await fetch("/api/practitioner/profile", {
      method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(profileFormData),
      });

      if (!res.ok) {
        // Surface the server's per-field breakdown when it provides one.
        const data = await res.json().catch(() => null);
   if (data?.fieldErrors?.length) {
  setProfileError(
            `Please complete: ${data.fieldErrors.map((f: any) => f.label ?? f.field).join(", ")}.`
          );
        } else {
          setProfileError(data?.error || "Failed to update profile.");
        }
        return;
      }

      setProfileSaveSuccess(true);
      fetchDashboardData();
    } catch (err: any) {
      setProfileError(err.message || "Update failed.");
    } finally {
      setProfileSaving(false);
    }
  };

  // Status mapping
const getStatusBadge = (report: Report) => {
    // Analysis completion does not imply entitlement. A report that finished
    // correlation while still owing money is "Processing / Payment Hold", never
    // "Ready", and its download action stays disabled.
    if (report.status === "COMPLETED" && !isFullyPaid(report)) {
      return {
        label: "Payment Hold",
        className: "bg-amber-50 text-amber-800 border-amber-200",
        dotColor: "bg-amber-500",
      };
    }

    switch (report.status) {
      case "COMPLETED":
      return {
        label: "Ready",
          className: "bg-emerald-50 text-emerald-800 border-emerald-200",
          dotColor: "bg-emerald-500",
        };
      case "GENERATING":
      case "PENDING_RELIABILITY":
      case "IN_NEUROSCIENTIST_REVIEW":
   case "PAYMENT_AUTHORISED":
     return {
          label: "Processing",
          className: "bg-sky-50 text-sky-800 border-sky-200",
          dotColor: "bg-sky-500",
    };
      case "PENDING_ADMIN_APPROVAL":
        return {
          label: "Awaiting Admin Review",
          className: "bg-amber-50 text-amber-800 border-amber-200",
          dotColor: "bg-amber-500",
        };
      case "DOWNLOADED_AND_PURGED":
        return {
          label: "Downloaded & purged",
          className: "bg-slate-100 text-slate-600 border-slate-200",
          dotColor: "bg-slate-400",
        };
      case "RELIABILITY_REJECTED":
        return {
          label: "Rejected & deleted",
          className: "bg-rose-50 text-rose-800 border-rose-200",
          dotColor: "bg-rose-500",
        };
      default:
        return {
          label: "Processing",
          className: "bg-slate-100 text-slate-700 border-slate-200",
          dotColor: "bg-slate-400",
        };
    }
  };

  // Metrics
  const reportsThisMonthCount = reports.length;
  // A report only counts as "awaiting download" once it is BOTH generated and
  // fully paid (paidAmount >= feeAmount) - a partially paid case stays locked.
  const awaitingDownloadCount = reports.filter((r) => canDownload(r)).length;
  const inProcessingCount = reports.filter(
    (r) =>
      r.status === "GENERATING" ||
      r.status === "PENDING_RELIABILITY" ||
      r.status === "IN_NEUROSCIENTIST_REVIEW" ||
      r.status === "PAYMENT_AUTHORISED" ||
      r.status === "PENDING_ADMIN_APPROVAL"
  ).length;
  // Sum the ACTUAL amounts captured across every case rather than assuming the
  // full fee was charged.
  const totalSpentAmount = reports.reduce(
    (sum, r) => sum + Math.max(0, Math.round((r.paidAmount || 0) * 100) / 100),
    0
  );
  const totalSpentFormatted = `$${totalSpentAmount.toFixed(0)}`;

  // Billing history renders one row per captured transaction (see
  // buildBillingTransactions) so each payment shows its real amount.
  const billingTransactions = buildBillingTransactions(billingReports);
  const billingById = new Map(billingReports.map((r) => [r.id, r]));

  const filteredReports = reports.filter((r) => {
    const matchesSearch = r.caseReference.toLowerCase().includes(searchTerm.toLowerCase());
    if (statusFilter === "ALL") return matchesSearch;
    if (statusFilter === "READY") return matchesSearch && canDownload(r);
    if (statusFilter === "PROCESSING")
      return (
        matchesSearch &&
        (r.status === "GENERATING" ||
          r.status === "PENDING_RELIABILITY" ||
          r.status === "IN_NEUROSCIENTIST_REVIEW" ||
          r.status === "PAYMENT_AUTHORISED" ||
          r.status === "PENDING_ADMIN_APPROVAL")
      );
    if (statusFilter === "PURGED") return matchesSearch && r.status === "DOWNLOADED_AND_PURGED";
    return matchesSearch;
  });

  return (
    <div className="w-full space-y-8 animate-fadeIn">
      {/* Top Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest font-sans">
              Applied Neurosciences Portal
            </span>
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="text-[11px] text-emerald-700 font-medium">Sydney VPS Active</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-normal text-[#16233B] tracking-tight">
            {currentView === "dashboard" && "Dashboard"}
            {currentView === "new" && "New Report Request"}
            {currentView === "billing" && "Billing History"}
            {currentView === "account" && "Account Settings"}
            {currentView === "support" && "Clinical & Technical Support"}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-normal">
            Welcome back, {profileFormData.fullName || "Referring Practitioner"} · Referring Practitioner
          </p>
        </div>

        {currentView !== "new" && (
          <Link
            href="/portal?view=new"
            className="px-5 py-2.5 text-sm font-semibold text-white bg-[#16233B] hover:bg-[#0F172A] rounded-xl shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center gap-2 cursor-pointer shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Report</span>
          </Link>
        )}
      </div>

      {/* ==================================================== */}
      {/* 1. DASHBOARD VIEW */}
      {/* ==================================================== */}
      {currentView === "dashboard" && (
        <div className="space-y-8">
          {/* Summary Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs hover:shadow-md transition-all">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest block mb-2 font-sans">
                Reports this month
              </span>
              <div className="text-3xl sm:text-4xl font-serif font-normal text-[#16233B]">
                {reportsThisMonthCount}
              </div>
              <span className="text-xs text-slate-500 font-medium block mt-2">
                vs. 6 previous period
              </span>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs hover:shadow-md transition-all">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest block mb-2 font-sans">
                Awaiting your download
              </span>
              <div className="text-3xl sm:text-4xl font-serif font-normal text-emerald-700">
                {awaitingDownloadCount}
              </div>
              <span className="text-xs text-emerald-600 font-medium block mt-2">
                {awaitingDownloadCount > 0 ? "Ready for identity stamp" : "All reports downloaded"}
              </span>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs hover:shadow-md transition-all">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest block mb-2 font-sans">
                In Processing
              </span>
              <div className="text-3xl sm:text-4xl font-serif font-normal text-sky-700">
                {inProcessingCount}
              </div>
              <span className="text-xs text-slate-500 block mt-2">
                Under correlation &amp; review
              </span>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs hover:shadow-md transition-all">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest block mb-2 font-sans">
                Total spent (AUD)
              </span>
              <div className="text-3xl sm:text-4xl font-serif font-normal text-[#16233B]">
                {totalSpentFormatted}
              </div>
              <span className="text-xs text-slate-500 block mt-2">
                Flat {formatFee(reportFee)} AUD · Zero subscription
              </span>
            </div>
          </div>

          {/* Reports Table Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            {/* AI-generated report notice (Spec 3.1b / platform transparency): shown
                whenever the practitioner views generated correlation reports, so the
                AI provenance + clinician-review duty is always visible. */}
            {reports.length > 0 && (
              <div className="px-5 sm:px-6 pt-4">
                <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 flex items-start gap-3">
                  <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" aria-hidden="true" />
                  <p className="text-[11px] text-amber-800 leading-relaxed font-normal">
                    <span className="font-semibold">AI-generated report notice: </span>
                    Every correlation report is synthesized by an AI engine from
                    evidence-linked literature and delivered without human review. AI-generated
                    content can be wrong — the referring practitioner must review the report and
                    verify its findings before any clinical reliance.
                  </p>
                </div>
              </div>
            )}

            {/* Search & Filter Bar */}
            <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by case reference (e.g. CASE-88291)..."
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:border-[#16233B] outline-none transition-all placeholder:text-slate-400 font-sans"
                />
              </div>

              <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
                {["ALL", "READY", "PROCESSING", "PURGED"].map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setStatusFilter(filter)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer whitespace-nowrap ${statusFilter === filter
                      ? "bg-[#16233B] text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                  >
                    {filter === "ALL" && "All Cases"}
                    {filter === "READY" && "Ready"}
                    {filter === "PROCESSING" && "Processing"}
                    {filter === "PURGED" && "Purged"}
                  </button>
                ))}
              </div>
            </div>

              {/* Table Content */}
              <TopScrollbar />
              <div className="overflow-x-auto">
                <table className="w-full min-w-[820px] text-left text-xs sm:text-sm">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    <th className="py-3.5 px-5">Case Reference</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Reliability</th>
                    <th className="py-3.5 px-4">Submitted</th>
                    <th className="py-3.5 px-4">Summary Findings</th>
                    <th className="py-3.5 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredReports.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400 text-sm">
                        No cases found matching your search criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredReports.map((report) => {
const badge = getStatusBadge(report);
             const isReady = canDownload(report);
              const isPurged = report.status === "DOWNLOADED_AND_PURGED";

                      return (
                        <tr key={report.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-4 px-5 font-semibold text-[#16233B] font-mono">
                            {report.caseReference}
                          </td>
                          <td className="py-4 px-4">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${badge.className}`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${badge.dotColor}`} />
                              <span>{badge.label}</span>
                            </span>
                          </td>
                          <td className="py-4 px-4 font-mono font-medium text-slate-700">
                            {report.reliabilityScore ? report.reliabilityScore.toFixed(2) : "—"}
                          </td>
                          <td className="py-4 px-4 text-slate-500 text-xs">
                            {new Date(report.createdAt).toLocaleDateString("en-AU", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </td>
                          <td className="py-4 px-4 text-slate-600 max-w-xs truncate text-xs">
                            {report.reportSummary || "Literature correlation synthesized."}
                          </td>
                          <td className="py-4 px-5 text-right whitespace-nowrap">
                            {isReady ? (
                              <button
                                onClick={() => {
                                  setSelectedReportForDownload(report);
                                  setDownloadConfirmed(false);
                                  setCollectionToken(null);
                                  setShowIdentityModal(true);
                                }}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#16233B] hover:bg-[#0F172A] text-white text-xs font-semibold shadow-2xs hover:shadow-xs transition-all cursor-pointer"
                              >
                                <Download className="w-3.5 h-3.5" />
                                <span>Download &amp; Purge</span>
                              </button>
                            ) : isPurged ? (
                              <span className="inline-flex items-center gap-1 text-slate-400 text-xs font-medium">
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Purged</span>
                              </span>
                            ) : (
                              <span className="text-xs text-slate-400 italic">Processing</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* 2. NEW REPORT REQUEST WORKFLOW (2-Tab Layout: Files & Case Reference / Symptom Checklist & PDF) */}
      {/* ==================================================== */}
      {currentView === "new" && (
        <div className="w-full space-y-8 animate-fadeIn">
          {/* Workflow Tabs: Tab 1 = Files & Case Reference, Tab 2 = Live Symptom Checklist & PDF */}
          <div className="bg-white rounded-2xl p-3 border border-slate-200 shadow-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {/* Tab 1 */}
              <button
                type="button"
                onClick={() => setActiveNewTab(1)}
                className={`px-4 py-3 rounded-xl text-left transition-all border cursor-pointer ${activeNewTab === 1
                  ? "bg-[#16233B] border-[#16233B] text-white shadow-sm"
                  : "bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-100"
                  }`}
              >
                <span
                  className={`flex items-center gap-2 text-xs font-semibold uppercase tracking-wider ${activeNewTab === 1 ? "text-sky-400" : "text-slate-500"
                    }`}
                >
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${activeNewTab === 1 ? "bg-sky-500 text-white" : "bg-slate-200 text-slate-600"
                      }`}
                  >
                    1
                  </span>
                  Tab 1 · Files &amp; Case Reference
                </span>
                <span className={`text-[11px] block mt-1 ${activeNewTab === 1 ? "text-slate-300" : "text-slate-400"}`}>
                  QEEG reliability ≥ 0.80 · unique CASE-XXXXX · browser de-identification
                </span>
              </button>

              {/* Tab 2 */}
              <button
                type="button"
                onClick={() => setActiveNewTab(2)}
                disabled={!filesReadyToContinue}
                className={`px-4 py-3 rounded-xl text-left transition-all border cursor-pointer ${activeNewTab === 2
                  ? "bg-[#16233B] border-[#16233B] text-white shadow-sm"
                  : filesReadyToContinue
                    ? "bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-100"
                    : "bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed opacity-70"
                  }`}
              >
                <span
                  className={`flex items-center gap-2 text-xs font-semibold uppercase tracking-wider ${activeNewTab === 2
                    ? "text-sky-400"
                    : filesReadyToContinue
                      ? "text-slate-500"
                      : "text-slate-400"
                    }`}
                >
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${activeNewTab === 2
                      ? "bg-sky-500 text-white"
                      : "bg-slate-200 text-slate-600"
                      }`}
                  >
                    2
                  </span>
                  Tab 2 · Symptom Checklist &amp; PDF
                </span>
                <span className={`text-[11px] block mt-1 ${activeNewTab === 2 ? "text-slate-300" : "text-slate-400"}`}>
                  {filesReadyToContinue
                    ? "Live config-driven form · auto PDF with Case Reference"
                    : "Locked · upload both the QEEG .tdt and TOVA report to unlock"}
                </span>
              </button>
            </div>

            {/* Case Reference status strip shared across both tabs */}
            <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 flex flex-wrap items-center justify-between gap-2">
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">
                Report Case Reference
              </span>
              <span className="font-mono font-semibold text-sm text-[#16233B]">
                {newCaseData.caseReference || "Generated when QEEG reliability passes (≥ 0.80)"}
              </span>
              <span className="text-[11px] text-slate-500">
                Shared across QEEG · TOVA · Symptom Checklist
              </span>
            </div>
          </div>

          {/* Post-submission success banner */}
          {submitSuccess && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex flex-wrap items-center justify-between gap-3 animate-fadeIn">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold block">
                    Report submitted for case <span className="font-mono">{submitSuccess.caseReference}</span>.
                  </span>
                  <span className="text-emerald-700 block leading-relaxed mt-0.5">
                    {submitSuccess.message ||
                      "Your payment has been authorised and the correlation analysis is now running. The completed report will be available for secure, one-time download from your dashboard once ready."}
                  </span>
                </div>
              </div>
              <span className="font-mono text-[10px] text-emerald-600">
                {new Date(submitSuccess.generatedAt).toLocaleTimeString("en-AU")} AEST
              </span>
            </div>
          )}

          {/* ===================== TAB 1 · FILES & CASE REFERENCE ===================== */}
          <div className={activeNewTab === 1 ? "space-y-6 animate-fadeIn" : "hidden"}>
            {/* QEEG upload card (Tab 1) */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-[11px] font-semibold text-[#16233B] uppercase tracking-wider mb-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Tab 1 · Browser-Side De-Identification &amp; Quality Gate</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-serif text-[#16233B] font-normal tracking-tight">
                  Upload QEEG file (.tdt)
                </h2>
                <p className="mt-1 text-xs sm:text-sm text-slate-500 font-normal leading-relaxed">
                  NeuroGuide tabular `.tdt` export. Our in-browser parser checks Test/Retest reliability score (≥ 0.80) and strips all personal identifiers before any network transmission. Passing files automatically generate one unique Case Reference shared by the QEEG, the TOVA and the Symptom Checklist.
                </p>
              </div>

            {/* Hidden File Input */}
            <input
              type="file"
              ref={qeegFileInputRef}
              accept=".tdt,.txt"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleQeegFileUploaded(file);
              }}
            />

            {/* Dropzone Area */}
            <div
              onClick={() => qeegFileInputRef.current?.click()}
              className={`p-8 border-2 border-dashed rounded-2xl text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3 ${qeegReliabilityPassed
                ? "border-emerald-300 bg-emerald-50/40 hover:bg-emerald-50/70"
                : reliabilityError
                  ? "border-rose-300 bg-rose-50/40 hover:bg-rose-50/70"
                  : "border-slate-300 bg-slate-50/60 hover:bg-slate-100/80 hover:border-slate-400"
                }`}
            >
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center ${qeegReliabilityPassed
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-slate-200/80 text-slate-600"
                  }`}
              >
                {qeegReliabilityPassed ? <FileCheck className="w-6 h-6" /> : <Upload className="w-6 h-6" />}
              </div>

              <div>
                <span className="text-sm font-semibold text-slate-800 block">
                  {qeegFileSelected ? qeegFileName : "Drop NeuroGuide .tdt file here, or browse"}
                </span>
                <span className="text-xs text-slate-400 mt-1 block">
                  {qeegFileSelected
                    ? `File Size: ${qeegFileSize} · De-identified in browser`
                    : "NeuroGuide 19-Channel FFT Tabular Export (.tdt)"}
                </span>
              </div>
            </div>

            {/* Reliability Passed Badge */}
            {reliabilityCheckMessage && (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-3 animate-fadeIn">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div className="space-y-1 flex-1">
                  <span className="font-semibold block">{reliabilityCheckMessage}</span>
                  <span className="text-emerald-700 block">
                    Case Reference: <span className="font-mono font-semibold">{newCaseData.caseReference}</span> · Age: {newCaseData.age} · Gender: {newCaseData.gender} · Handedness: {newCaseData.handedness} · Reliability: {newCaseData.reliabilityScore}
                  </span>
                  <span className="text-emerald-600 block">
                    De-identified in browser — patient-identifying lines stripped before any server transmission.
                  </span>
                </div>
              </div>
            )}

            {/* Reliability Error Alert */}
            {reliabilityError && (
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-3 animate-fadeIn">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold block">Quality Gate Threshold Failed:</span>
                  <span className="leading-relaxed block mt-0.5">{reliabilityError}</span>
                </div>
              </div>
            )}
          </div>

          {/* TOVA upload card (Tab 1) */}
          <div
            className={`bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6 transition-all ${qeegReliabilityPassed ? "opacity-100" : "opacity-60 pointer-events-none"
              }`}
          >
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-[11px] font-semibold text-[#16233B] uppercase tracking-wider mb-2">
                <FileUp className="w-3.5 h-3.5 text-sky-600" />
                <span>Tab 1 · Supporting Test Data (TOVA)</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-serif text-[#16233B] font-normal tracking-tight">
                Upload TOVA results
              </h2>
                <p className="mt-1 text-xs sm:text-sm text-slate-500 font-normal leading-relaxed">
                  Attach the continuous visual attention performance file. Metrics are parsed and de-identified in the browser and linked to the report&apos;s Case Reference. Both this file and the QEEG `.tdt` export must be uploaded and verified before you can continue to the Symptom Checklist.
                </p>
            </div>

            {/* Case Reference banner shared by QEEG / TOVA / checklist */}
            <div className="rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="text-[10px] font-semibold text-sky-700 uppercase tracking-widest block">
                  Linked to this Case Reference
                </span>
                <span className="font-mono font-semibold text-base text-[#16233B]">
                  {newCaseData.caseReference || "Waiting for QEEG reliability ≥ 0.80…"}
                </span>
              </div>
              <span className="text-[11px] text-slate-500 text-right">
                One reference shared across<br />QEEG · TOVA · Symptom Checklist
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* TOVA File Input Card */}
              <input
                type="file"
                ref={tovaFileInputRef}
                accept=".pdf,.txt,.csv,.json"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleTovaFileUploaded(file);
                  e.target.value = "";
                }}
              />

              <div
                onClick={() => tovaFileInputRef.current?.click()}
                className="p-5 border border-slate-200 rounded-xl bg-slate-50 hover:bg-slate-100/80 cursor-pointer transition-all flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-slate-200 text-slate-700 flex items-center justify-center shrink-0">
                    <Activity className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-semibold text-slate-800 block truncate">
                      {tovaFileSelected ? tovaFileName : "Attach TOVA Report (required)"}
                    </span>
                    <span className="text-[11px] text-slate-400 block truncate">
                      {tovaFileSelected
                        ? `Metrics parsed in browser · linked to ${newCaseData.caseReference}`
                        : "TXT or CSV · parsed locally"}
                    </span>
                  </div>
                </div>

                {tovaFileSelected ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <Upload className="w-4 h-4 text-slate-400 shrink-0" />
                )}
              </div>

              {/* TOVA parse feedback */}
              <div className="space-y-2">
                {tovaParseMessage && (
                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-3 animate-fadeIn">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{tovaParseMessage}</span>
                  </div>
                )}
                {tovaError && (
                  <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-3 animate-fadeIn">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{tovaError}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

            {/* Trailing "Continue to Checklist" action. Hidden by default and
                rendered only once BOTH the QEEG .tdt file and the TOVA report
                have been uploaded and verified, so it always appears below both
                upload blocks rather than attached to the .tdt card. */}
            {filesReadyToContinue && (
              <div className="rounded-2xl border border-slate-200 bg-white shadow-xs p-6 sm:p-8 animate-fadeIn">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm sm:text-base font-serif text-[#16233B] font-normal tracking-tight">
                        Both files uploaded and verified
                      </h3>
                      <p className="text-xs text-slate-500 leading-relaxed mt-0.5 break-words">
                        Case Reference <span className="font-mono font-semibold">{newCaseData.caseReference}</span> · QEEG reliability {newCaseData.reliabilityScore} · TOVA <span className="font-mono">{tovaFileName}</span>
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveNewTab(2)}
                    className="shrink-0 w-full sm:w-auto px-5 py-3 bg-[#16233B] hover:bg-[#0F172A] text-white text-sm font-semibold rounded-xl shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    Continue to Checklist
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ===================== TAB 2 · LIVE SYMPTOM CHECKLIST & PDF ===================== */}
          <div className={activeNewTab === 2 ? "space-y-6 animate-fadeIn" : "hidden"}>

            {/* Live HTML Symptom Checklist card (config-driven, no PDF upload) */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-5">
              <div className="rounded-xl border border-[#16233B]/20 bg-[#F8FAFC] px-4 py-3 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest block">
                    Current Report Case Reference
                  </span>
                  <span className="font-mono font-semibold text-lg text-[#16233B]">
                    {newCaseData.caseReference || "Waiting for QEEG reliability ≥ 0.80…"}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 text-right">
                  <span className="block">This signature is automatically carried into the completed</span>
                  <span className="block">Symptom Checklist PDF at generation time.</span>
                </div>
              </div>

              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-[11px] font-semibold text-[#16233B] uppercase tracking-wider mb-2">
                  <ClipboardList className="w-3.5 h-3.5 text-sky-600" />
                  <span>Tab 2 · Live Config-Driven Checklist (checklist-definition.json)</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-serif text-[#16233B] font-normal tracking-tight">
                  Live symptom checklist
                </h2>
                <p className="mt-1 text-xs sm:text-sm text-slate-500 font-normal leading-relaxed">
                  Fields load dynamically from the checklist definition. Completing this form replaces any PDF checklist upload — the same data is submitted to the server and used to generate your downloadable PDF automatically.
                </p>
              </div>

              <div className="border border-slate-200 rounded-xl bg-slate-50 p-4 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <ClipboardList className="w-5 h-5 text-sky-600" />
                    <span className="text-xs font-semibold text-slate-800">
                      Symptom Checklist{" "}
                      <span className="text-slate-400 font-normal">(config v{checklistConfig?.version ?? "—"})</span>
                    </span>
                  </div>
                  {checklistConfig && missingChecklistFields().length === 0 && (
                    <div className="flex items-center gap-1.5 text-emerald-700 text-[11px] font-semibold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>All sections complete</span>
                    </div>
                  )}
                </div>

                {!checklistConfig ? (
                  <p className="text-xs text-slate-500">Loading checklist definition...</p>
                ) : checklistConfig.sections && checklistConfig.sections.length > 0 ? (
                  <div className="space-y-3 max-h-[820px] overflow-y-auto pr-1">
                     {checklistConfig.sections.map((section, sIdx) => {
                      const kind = section.kind ?? "fields";

                      if (kind === "static") {
                        return (
                          <div
                            key={`${sIdx}-${section.key}`}
                            className="bg-white border border-amber-200 rounded-lg p-3"
                          >
                            <span className="text-[11px] font-semibold text-[#16233B] uppercase tracking-wider block mb-2">
                              {section.title}
                            </span>
                            <ul className="space-y-1">
                              {(section.lines || []).map((line, i) => (
                                <li key={i} className="text-[10px] text-slate-500 leading-relaxed">
                                  {line}
                                </li>
                              ))}
                            </ul>
                          </div>
                        );
                      }

                      if (kind === "domains") {
                        const pageDomains = checklistConfig.domains
                          .filter((d) => d.page === section.domainPage)
                          .sort((a, b) => a.num - b.num);
                        const pageRated = pageDomains.filter(
                          (d) => checklistScores[d.key] !== undefined
                        ).length;
                        return (
                          <div key={`${sIdx}-${section.key}`} className="bg-white border border-slate-200 rounded-lg p-3 space-y-2">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-[11px] font-semibold text-[#16233B]">
                                {section.title}
                              </span>
                              <span
                                className={`text-[10px] font-semibold ${
                                  pageRated === pageDomains.length
                                    ? "text-emerald-600"
                                    : "text-slate-400"
                                }`}
                              >
                                {pageRated}/{pageDomains.length} rated
                              </span>
                            </div>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
                              {pageDomains.map((d) => (
                                <div key={d.key} className="bg-slate-50 border border-slate-200 rounded-lg p-2.5">
                                  <span className="text-[11px] font-semibold text-slate-700 leading-tight block mb-1">
                                    {d.title}
                                  </span>
                                  <p className="text-[10px] text-slate-400 leading-relaxed mb-2">
                                    {d.desc}
                                  </p>
                                  <div className="flex items-center justify-between gap-1">
                                    {["0", "1", "2", "3", "4"].map((value) => {
                                      const selected = checklistScores[d.key] === Number(value);
                                      return (
                                        <button
                                          key={value}
                                          type="button"
                                          onClick={() =>
                                            rateChecklistDomain(d.key, Number(value))
                                          }
                                          className={`flex-1 py-1.5 text-[10px] font-semibold rounded-lg border transition-all cursor-pointer ${
                                            selected
                                              ? "bg-[#16233B] border-[#16233B] text-white"
                                              : "bg-white border-slate-200 text-slate-500 hover:border-[#16233B]"
                                          }`}
                                        >
                                          {value}
                                          <span className="block text-[9px] font-normal opacity-80">
                                            {checklistConfig.likert[value]}
                                          </span>
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      }

                      return (
                        <div key={`${sIdx}-${section.key}`} className="bg-white border border-slate-200 rounded-lg p-3 space-y-3">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[11px] font-semibold text-[#16233B]">
                              {section.title}
                            </span>
                            {section.required !== false && (
                              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                                Required
                              </span>
                            )}
                          </div>
                          {section.insight && (
                            <p className="text-[10px] text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-2 leading-relaxed">
                              {section.insight}
                            </p>
                          )}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {(section.fields || []).map((field, fIdx) => {
                              const value = resolveChecklistFieldValue(field);
                              const isLocked = field.readonly || section.readonly;
                              const isMissingText =
                                field.required && String(value ?? "").trim() === "" && !isLocked;
                              const isMissingCheck =
                                field.required && field.type === "checkbox" && !value;
const isMissingSelect =
                                field.required && field.type === "select" && String(value ?? "").trim() === "";
                              // HTML5 `required` is driven by the SAME `required`
                              // flag as the custom missing-field validation, so the
                              // two layers can never disagree. Locked/readonly fields
                              // render as static text rather than inputs, so `required`
                              // is omitted (an attribute on a div would be meaningless)
                              // and they are validated separately in
                              // missingChecklistFields().
                              const htmlRequired = !!field.required && !isLocked;
                              const baseInput =
  "w-full px-3 py-2 bg-slate-50 border rounded-lg text-xs text-slate-900 focus:bg-white focus:border-[#16233B] outline-none transition-all";

                              if (field.type === "checkbox") {
                                return (
                                  <label
                                    key={`${sIdx}-${fIdx}-${field.key}`}
                                    className="flex items-start gap-3 cursor-pointer select-none sm:col-span-2"
                                  >
<input
   type="checkbox"
    required={htmlRequired}
  name={field.key}
   checked={!!value}
         onChange={(e) => setCaseBoundFieldValue(field, e.target.checked)}
  className={`mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 text-[#16233B] focus:ring-[#16233B] ${
          isMissingCheck ? "border-rose-400 ring-1 ring-rose-300" : ""
                                          }`}
    />
                                    <span className="min-w-0 flex-1 text-[11px] leading-snug break-words">
                                      <span
                                        className={`font-semibold ${
                                          isMissingCheck ? "text-rose-600" : "text-slate-800"
                                        }`}
                                      >
                                        {field.label}
                                      </span>
                                      {field.detail && (
                                        <span className="block text-[10px] text-slate-500 mt-0.5">
                                          {field.detail}
                                        </span>
                                      )}
                                    </span>
                                  </label>
                                );
                              }

                              if (field.type === "select") {
                                // Resolve the stored value to the ACTUAL matched
                                // option (case-insensitively) and bind the select
                                // to that option's real value. Uppercasing the
                                // value broke any option whose value was not
                                // already uppercase (e.g. a custom "Primary
                                // Clinical Focus" option "Attention"), since it no
                                // longer matched any <option> and rendered blank.
                                const rawSelect = String(value ?? "").trim();
                                const matchedOption = (field.options || []).find(
                                  (o) => o.value.toUpperCase() === rawSelect.toUpperCase()
                                );
                                return (
                                  <div key={`${sIdx}-${fIdx}-${field.key}`}>
                                    <label className="block text-[10px] font-semibold text-slate-600 mb-1">
                                      {field.label}
                                    </label>
                                    {isLocked ? (
                                      <div className={`${baseInput} bg-slate-100 text-slate-600`}>
                                        {String(value ?? "")}
                                      </div>
                                    ) : (
<select
    required={htmlRequired}
            name={field.key}
  aria-invalid={isMissingSelect}
                                        value={matchedOption ? matchedOption.value : ""}
    onChange={(e) => setCaseBoundFieldValue(field, e.target.value)}
        className={`${baseInput} ${
            isMissingSelect ? "border-rose-400 bg-rose-50/40" : "border-slate-200"
             }`}
  >
                                        <option value="">Select…</option>
                                        {(field.options || []).map((o) => (
                                          <option key={o.value} value={o.value}>
                                            {o.label}
                                          </option>
                                        ))}
                                      </select>
                                    )}
                                  </div>
                                );
                              }

                              if (field.type === "textarea") {
                                return (
                                  <div key={`${sIdx}-${fIdx}-${field.key}`} className="sm:col-span-2">
                                    <label className="block text-[10px] font-semibold text-slate-600 mb-1">
                                      {field.label}
                                    </label>
<textarea
        required={htmlRequired}
  name={field.key}
      aria-invalid={isMissingText}
value={String(value ?? "")}
   onChange={(e) => setCaseBoundFieldValue(field, e.target.value)}
      rows={3}
   placeholder={field.placeholder}
className={`${baseInput} resize-y ${
      isMissingText ? "border-rose-400 bg-rose-50/40" : "border-slate-200"
          }`}
   />
                                  </div>
                                );
                              }

                              if (field.type === "date") {
                                // "Date Signed" is legally binding: it must be the exact day the
                                // practitioner completes the form, so pin it to today by setting
                                // min === max (which disables every other day in the native
                                // picker) and refuse any other value from manual entry.
                                const isDateSigned = field.key === "date_signed";
                                const today = isDateSigned ? todayLocalDateString() : null;
                                const rawValue = String(value ?? "");
                                const lockedValue = today !== null && rawValue !== today ? today : rawValue;
                                return (
                                  <div key={`${sIdx}-${fIdx}-${field.key}`}>
                                    <label className="block text-[10px] font-semibold text-slate-600 mb-1">
                                      {field.label}
                                    </label>
<input
    type="date"
            required={htmlRequired}
 name={field.key}
        aria-invalid={isMissingText}
value={lockedValue}
           min={today ?? undefined}
       max={today ?? undefined}
       onChange={(e) => {
   const next = e.target.value;
      setCaseBoundFieldValue(field, today !== null && next !== today ? today : next);
            }}
        className={`${baseInput} ${
          isMissingText ? "border-rose-400 bg-rose-50/40" : "border-slate-200"
          }`}
            />
                                  </div>
                                );
                              }

                              return (
                                <div key={`${sIdx}-${fIdx}-${field.key}`}>
                                  <label className="block text-[10px] font-semibold text-slate-600 mb-1">
                                    {field.label}
                                  </label>
                                  {isLocked ? (
                                    <div className={`${baseInput} bg-slate-100 cursor-not-allowed`}>
                                      {field.key === "case_reference" ? (
                                        <span className="font-mono">
                                          {String(value ?? "") ||
                                            "Generated when QEEG reliability passes (≥ 0.80)"}
                                        </span>
                                      ) : (
                                        String(value ?? "")
                                      )}
                                    </div>
                                  ) : (
<input
  type="text"
          required={htmlRequired}
      name={field.key}
        aria-invalid={isMissingText}
  value={String(value ?? "")}
    onChange={(e) => setCaseBoundFieldValue(field, e.target.value)}
placeholder={field.placeholder}
className={`${baseInput} ${
          isMissingText ? "border-rose-400 bg-rose-50/40" : "border-slate-200"
        }`}
   />
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="space-y-2.5 max-h-[520px] overflow-y-auto pr-1">
                    {checklistConfig.domains.map((d) => (
                      <div key={d.key} className="bg-white border border-slate-200 rounded-lg p-2.5">
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <span className="text-[11px] font-semibold text-slate-700 leading-tight">
                            {d.title}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 leading-relaxed mb-2">{d.desc}</p>
                        <div className="flex items-center justify-between gap-1">
                          {["0", "1", "2", "3", "4"].map((value) => {
                            const selected = checklistScores[d.key] === Number(value);
                            return (
                              <button
                                key={value}
                                type="button"
                                onClick={() => rateChecklistDomain(d.key, Number(value))}
                                className={`flex-1 py-1.5 text-[10px] font-semibold rounded-lg border transition-all cursor-pointer ${
                                  selected
                                    ? "bg-[#16233B] border-[#16233B] text-white"
                                    : "bg-white border-slate-200 text-slate-500 hover:border-[#16233B]"
                                }`}
                              >
                                {value}
                                <span className="block text-[9px] font-normal opacity-80">
                                  {checklistConfig.likert[value]}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* PDF generation without a separate upload */}
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={handlePreviewChecklistPdf}
                  disabled={!qeegReliabilityPassed || checklistPdfBusy || missingChecklistFields().length > 0}
                  className="px-5 py-3 bg-white border border-slate-300 hover:border-[#16233B] hover:bg-slate-50 disabled:opacity-50 text-[#16233B] text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer"
                >
                  <FileCheck className="w-4 h-4" />
                  <span>
                    {checklistPdfBusy ? "Generating…" : "Preview Completed Checklist PDF"}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadChecklistPdfCompleted}
                  disabled={!qeegReliabilityPassed || checklistPdfBusy || missingChecklistFields().length > 0}
                  className="px-5 py-3 bg-[#16233B] hover:bg-[#0F172A] disabled:opacity-50 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Checklist PDF</span>
                </button>

                <div className="flex items-center gap-2 text-xs text-slate-500 font-normal">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    Generated in-browser from the exact form data + Case Reference{" "}
                    <span className="font-mono">{newCaseData.caseReference}</span> — no separate PDF upload.
                  </span>
                </div>
              </div>

              {submitError && (
                <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-3">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{submitError}</span>
                </div>
              )}

              {checklistReviewed ? (
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    Checklist PDF reviewed — you can now Authorize {formatFee(reportFee)} AUD &amp; Submit (Step 3).
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-semibold">
                  <Lock className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>
                    Review/download the completed checklist PDF above to unlock payment &amp; submission.
                  </span>
                </div>
              )}
            </div>

            {/* STEP 3 & SUBMIT BAR */}
          <div className="bg-[#16233B] text-white rounded-2xl p-6 sm:p-8 border border-slate-800 shadow-md flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-semibold text-sky-400 uppercase tracking-widest font-sans">
                  Step 3 · Submission &amp; Hold
                </span>
              </div>
              <div className="text-xl sm:text-2xl font-serif font-normal text-white">
                Submit de-identified payload
              </div>
              <p className="text-xs text-slate-300 mt-1 font-normal max-w-lg leading-relaxed">
                {formatFee(reportFee)} AUD payment hold placed on submission. Funds captured strictly when the report is successfully generated and verified. Unlocked once the completed Symptom Checklist PDF has been reviewed/downloaded (Tab 2).
              </p>
            </div>

            <div className="flex flex-col sm:items-end gap-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  if (!checklistReviewed) {
                    setSubmitError(
                      "Complete, preview and download the Symptom Checklist PDF first (Tab 2 → Preview/Download Checklist PDF). The full checklist must be reviewed before payment can be authorised and the payload submitted."
                    );
                    return;
                  }
                  setShowPaymentModal(true);
                  handledPayPalOrderIds.current.clear();
                }}
                disabled={!allRequiredComplete || submitting}
                className="w-full sm:w-auto px-8 py-3.5 bg-white hover:bg-slate-100 disabled:opacity-50 text-[#16233B] text-sm font-semibold rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {submitting ? (
                  <span>Processing correlation...</span>
                ) : (
                  <>
                    {checklistReviewed ? (
                      <Lock className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Lock className="w-4 h-4 text-slate-400" />
                    )}
                    <span>
                      {checklistReviewed
                        ? `Authorize ${formatFee(reportFee)} AUD & Submit`
                        : "Locked until checklist PDF reviewed"}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <span className="text-[11px] text-slate-400 text-center sm:text-right">
                Sydney Sovereign VPS · Purged on download
              </span>
            </div>
          </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* 3. BILLING HISTORY VIEW (Matching exact design) */}
      {/* ==================================================== */}
      {currentView === "billing" && (
        <div className="w-full space-y-6 animate-fadeIn">
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
            {/* Header */}
            <div className="p-6 sm:p-8 pb-5">
              <h2 className="text-xl sm:text-2xl font-serif text-[#16233B] font-normal tracking-tight">
                Billing history
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 font-normal mt-1.5 leading-relaxed">
                {formatFee(reportFee)} AUD per successfully generated report, charged in full, upfront. Each row below is
                one captured transaction. Never charged for a rejected submission.
              </p>
            </div>

              {/* Table */}
              <TopScrollbar />
              <div className="overflow-x-auto">
                <table className="w-full min-w-[560px] text-left">
                <thead>
                  <tr className="border-y border-slate-100 bg-[#F8FAFC]/80 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-6 sm:px-8 font-sans font-semibold">DATE</th>
                    <th className="py-3 px-6 font-sans font-semibold">CASE REFERENCE</th>
                    <th className="py-3 px-6 font-sans font-semibold normal-case">Paid Amount</th>
                    <th className="py-3 px-6 font-sans font-semibold">CASE TOTAL</th>
                    <th className="py-3 px-6 sm:px-8 font-sans font-semibold">STATUS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {/* billingReports already filtered by paymentStatus !== NOT_STARTED on backend */}
                  {billingTransactions.length > 0 ? (
                    billingTransactions.map((txn) => {
                      const r = billingById.get(txn.reportId)!;
                      const getPaymentStatusLabel = (status: string) => {
                        switch (status) {
                          case "CAPTURED":
                            return "Charged";
                          case "AUTHORISED":
                            return txn.amount > 0 ? "Partially Paid (legacy)" : "Authorised (Awaiting Payment)";
                          case "VOIDED":
                            return "Voided";
                          case "FAILED":
                            return "Failed";
                          default:
                            return "Pending";
                        }
                      };
                      const billingFee = r.feeAmount || reportFee;
                      const billingPaid = Math.max(0, Math.round((r.paidAmount || 0) * 100) / 100);
                      const billingRemaining = Math.max(0, Math.round((billingFee - billingPaid) * 100) / 100);
                      // Download stays locked until the case is fully paid AND generated.
                      const rowCanDownload = canDownload(r);

                      return (
                        <tr key={txn.key} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-4.5 px-6 sm:px-8 text-slate-900 font-normal">
                            {new Date(txn.paidAt).toLocaleDateString("en-GB", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </td>
                          <td className="py-4.5 px-6">
                            <span className="text-[#2563EB] hover:text-[#1D4ED8] hover:underline font-mono text-sm cursor-pointer">
                              {txn.caseReference}
                            </span>
                          </td>
                          {/* The amount actually captured in THIS transaction. */}
                          <td className="py-4.5 px-6 text-slate-900 font-normal">
                            {txn.amount > 0 ? (
                              <span className="font-semibold">${txn.amount.toFixed(2)}</span>
                            ) : (
                              <span className="font-semibold text-slate-400">&mdash;</span>
                            )}
                          </td>
                          <td className="py-4.5 px-6 text-slate-600 font-normal">
                            <span className="font-mono text-xs">
                              ${billingPaid.toFixed(2)}
                            </span>
                            <span className="text-slate-400 mx-1">/</span>
                            <span className="font-mono text-xs">${billingFee.toFixed(2)}</span>
                            {billingRemaining > 0 && (
                              <span className="block text-[10px] text-amber-600 font-semibold mt-0.5">
                                ${billingRemaining.toFixed(2)} outstanding
                              </span>
                            )}
                          </td>
                          <td className="py-4.5 px-6 sm:px-8">
                            <span className="text-slate-900 font-normal">
                              {getPaymentStatusLabel(r.paymentStatus)}
                            </span>
                            {!rowCanDownload && r.status !== "DOWNLOADED_AND_PURGED" && (
                              <span className="block text-[11px] text-slate-400 font-normal">
                                {billingRemaining > 0
                                  ? `Download locked — ${billingRemaining.toFixed(2)} AUD outstanding`
                                  : "Report processing"}
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-10 text-center text-sm text-slate-500">
                        No billing history yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* 4. ACCOUNT SETTINGS VIEW */}
      {/* ==================================================== */}
      {currentView === "account" && (
        <div className="w-full space-y-6 animate-fadeIn">
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-serif text-[#16233B] font-normal tracking-tight">
                Practitioner Registration &amp; Clinic Details
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 font-normal">
                These credentials automatically pre-fill your downloaded symptom checklists and report routing.
              </p>
            </div>

{profileSaveSuccess && (
       <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
      <span>Practitioner profile successfully updated and saved to sovereign database.</span>
        </div>
    )}
      {profileError && (
  <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs leading-relaxed" role="alert">
            {profileError}
  </div>
   )}

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
<div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Full Name &amp; Post-Nominals *
                  </label>
                  <input
type="text"
 required
   value={profileFormData.fullName || ""}
   onChange={(e) =>
    setProfileFormData({ ...profileFormData, fullName: e.target.value })
     }
    className={profileFieldClass}
          />
            </div>

    <div>
       <label className="block text-xs font-semibold text-slate-700 mb-1.5">
        Professional Title / Credentials *
   </label>
                  {/* This field is required by the symptom checklist and was
        previously read but never editable here, so a practitioner who skipped
    it at signup could never complete a case. */}
      <input
       type="text"
      required
                    value={profileFormData.professionalTitle || ""}
   onChange={(e) =>
        setProfileFormData({ ...profileFormData, professionalTitle: e.target.value })
  }
          className={profileFieldClass}
  />
          </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
Provider Number / Reg No *
                  </label>
   <input
  type="text"
                    required
     value={profileFormData.providerNumber || ""}
                    onChange={(e) =>
  setProfileFormData({ ...profileFormData, providerNumber: e.target.value })
          }
          className={`${profileFieldClass} font-mono`}
  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
Clinic / Practice Name *
     </label>
   <input
type="text"
    required
           value={profileFormData.clinicName || ""}
           onChange={(e) =>
 setProfileFormData({ ...profileFormData, clinicName: e.target.value })
    }
            className={profileFieldClass}
              />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
Practice Address *
         </label>
         <input
         type="text"
  required
        value={profileFormData.practiceAddress || ""}
        onChange={(e) =>
     setProfileFormData({ ...profileFormData, practiceAddress: e.target.value })
            }
   className={profileFieldClass}
   />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
Practice Contact Phone *
     </label>
             <input
      type="tel"
          required
   value={profileFormData.phone || ""}
            onChange={(e) =>
         setProfileFormData({ ...profileFormData, phone: e.target.value })
     }
    className={profileFieldClass}
        />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Report Notification Email (SES Sydney)
                  </label>
                  <input
                    type="email"
                    value={profileFormData.notificationEmail || ""}
                    onChange={(e) =>
                      setProfileFormData({ ...profileFormData, notificationEmail: e.target.value })
                    }
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:border-[#16233B] outline-none transition-all"
                  />
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={profileSaving}
                  className="px-6 py-3 bg-[#16233B] hover:bg-[#0F172A] disabled:opacity-60 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-all cursor-pointer"
                >
                  {profileSaving ? "Saving changes..." : "Save Profile Details"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* 5. SUPPORT VIEW */}
      {/* ==================================================== */}
      {currentView === "support" && (
        <div className="w-full space-y-6 animate-fadeIn">
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-serif text-[#16233B] font-normal tracking-tight">
                Clinical &amp; Technical Support
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 font-normal">
                Direct access to our Sydney neuroscientist team for file questions, reliability interpretation, or literature methodology.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center gap-2 text-slate-700 font-semibold text-xs uppercase tracking-wider">
                  <Mail className="w-4 h-4 text-sky-600" />
                  <span>Clinical Inquiries</span>
                </div>
                <p className="text-xs text-slate-500 font-normal">
                  Direct neuroscientist response within 2 hours during business hours (AEST).
                </p>
                <span className="text-xs font-semibold text-[#16233B] block">
                  support@qeeg.com.au
                </span>
              </div>

              <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center gap-2 text-slate-700 font-semibold text-xs uppercase tracking-wider">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Data Sovereignty &amp; Privacy</span>
                </div>
                <p className="text-xs text-slate-500 font-normal">
                  Australian Privacy Act 1988 officer and instant server purge compliance.
                </p>
                <span className="text-xs font-semibold text-[#16233B] block">
                  privacy@qeeg.com.au
                </span>
              </div>
            </div>

            <div className="p-5 rounded-xl bg-[#16233B] text-white space-y-2">
              <span className="text-xs font-semibold text-sky-400 uppercase tracking-widest block font-sans">
                Operating Hours
              </span>
              <span className="text-sm font-serif font-normal block">
                Monday to Friday: 8:30 AM – 6:00 PM AEST / AEDT
              </span>
              <span className="text-xs text-slate-300 block font-normal">
                Emergency case escalations processed via online portal queue 24/7.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* IDENTITY STAMPING DOWNLOAD MODAL */}
      {/* ==================================================== */}
      {typeof document !== "undefined" &&
        showIdentityModal &&
        selectedReportForDownload &&
        createPortal(
          <div className="fixed inset-0 z-[9999] bg-slate-900/60 backdrop-blur-sm flex items-start justify-center overflow-y-auto overscroll-contain p-4 sm:p-6">
          <div className="bg-white rounded-3xl max-w-md w-full my-auto p-6 sm:p-8 shadow-2xl ring-1 ring-slate-900/5 border border-slate-200 space-y-5 animate-fadeIn">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Client-Side Identity Stamping
                </span>
              </div>
              <button
                onClick={() => {
                  setShowIdentityModal(false);
                  setDownloadConfirmed(false);
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <h3 className="text-xl font-serif text-[#16233B] font-normal">
                Attach Patient Name Locally
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                In accordance with our zero-retention architecture, this report will be permanently purged from our Sydney servers upon download. Enter the client name below to stamp it directly into your local copy.
              </p>
            </div>

            {/* AI-generated report warning: prominent, shown at the exact moment
                the practitioner is about to view/obtain the compiled report. */}
            <div className="rounded-xl border border-sky-200 bg-sky-50 p-4">
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-sky-700 shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <p className="text-xs font-semibold text-sky-900">
                    AI-generated, evidence-linked report — review required
                  </p>
                  <p className="text-[11px] text-sky-800 mt-1 leading-relaxed">
                    This report was synthesized by an AI correlation engine from cited
                    literature and delivered without human review. It must be reviewed and
                    validated by the referring practitioner for clinical accuracy before any
                    reliance on its findings.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-amber-300 bg-amber-50 p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-amber-800">
                    One-time, irreversible download
                  </p>
                  <p className="text-[11px] text-amber-700 mt-1 leading-relaxed">
                    This is a strictly <strong>one-time</strong> action. The moment your download completes, all source files (QEEG, TOVA, checklist) and the compiled report are <strong>permanently destroyed on our Sydney servers</strong>. The report <strong>cannot be re-downloaded</strong>. Save it securely to your practice records.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Client Name / Identifier (Browser Local Only)
              </label>
              <input
                type="text"
                value={patientNameInput}
                onChange={(e) => setPatientNameInput(e.target.value)}
                placeholder="e.g. John Doe / Client #992"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:border-[#16233B] outline-none transition-all"
              />
            </div>

            <label className="flex items-start gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={downloadConfirmed}
                onChange={(e) => setDownloadConfirmed(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#16233B] focus:ring-[#16233B]"
              />
              <span className="text-xs text-slate-600 leading-relaxed">
                I understand this is a <strong>one-time, irreversible download</strong> and that all
                data is <strong>permanently purged</strong> upon completion and cannot be retrieved again.
              </span>
            </label>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowIdentityModal(false);
                  setDownloadConfirmed(false);
                }}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleExecuteDownload}
                disabled={downloadingId !== null || !downloadConfirmed}
                className={`px-5 py-2.5 text-xs font-semibold text-white rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer ${
                  downloadConfirmed && downloadingId === null
                    ? "bg-[#16233B] hover:bg-[#0F172A]"
                    : "bg-slate-300 cursor-not-allowed"
                }`}
              >
                {downloadingId ? (
                  <span>Downloading &amp; finalizing...</span>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5" />
                    <span>Stamp &amp; Download Report</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ==================================================== */}
      {/* INTERACTIVE MOCK PAYPAL MODAL */}
      {/* ==================================================== */}
      {typeof document !== "undefined" &&
        showPaymentModal &&
        createPortal(
          (() => {
          // The report fee is always charged in full, once. There is no
          // installment ladder, so the amount due is simply the live fee.
          const feeAmt = reportFee;
          const amountDue = Math.round(feeAmt * 100) / 100;
          return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 sm:p-6 overflow-y-auto overscroll-contain">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl ring-1 ring-slate-900/5 border border-slate-200 p-6 sm:p-8 space-y-6 animate-fadeIn overflow-hidden max-h-[85vh] overflow-y-auto">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#003087]" />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-[#003087] rounded flex items-center justify-center text-white font-serif font-bold italic">
                  P
                </div>
                <span className="text-sm font-semibold text-[#003087] font-sans">
                  PayPal Checkout
                </span>
              </div>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                disabled={submitting}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-center py-4">
              <span className="text-sm text-slate-500 block mb-1">Amount due</span>
              <span className="text-4xl font-light text-slate-800 block">
                {amountDue.toFixed(2)} <span className="text-lg text-slate-400">AUD</span>
              </span>
              <span className="block text-xs text-slate-500 mt-1.5">
                One-time payment in full
              </span>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-600">
              <div className="flex justify-between mb-2 pb-2 border-b border-slate-200">
                <span>Merchant</span>
                <span className="font-semibold">QEEG.com.au</span>
              </div>
              <div className="flex justify-between">
                <span>Case Reference</span>
                <span className="font-mono">{newCaseData.caseReference}</span>
              </div>
              <p className="mt-4 text-slate-500 text-[11px] leading-relaxed">
                <Lock className="w-3 h-3 inline-block mr-1 -mt-0.5" />
                This is a secure authorization hold. The full {formatFee(feeAmt)} AUD fee is
                captured once, in a single payment, as soon as the report is accepted.
              </p>
            </div>

            <div className="pt-2 flex flex-col gap-3 min-h-[150px]">
              <PayPalErrorBoundary
                fallback={
                  <p className="text-xs text-red-700 bg-red-50 border border-red-100 rounded-lg p-3 leading-relaxed">
                    The PayPal checkout failed to load. Please close this dialog and try again.
                  </p>
                }
                onError={(error) =>
                  console.warn("[PAYPAL] Button rendering failed:", error?.message)
                }
              >
              <PayPalButtons
                style={{ layout: "vertical", shape: "pill", color: "gold" }}
                createOrder={async () => {
                  // Every attempt — including every retry — fetches a BRAND-NEW
                  // order from the backend (/api/payments/orders). Never reuse a
                  // previous order id: approving/re-authorising a stale or used
                  // order returns PayPal INVALID_RESOURCE_ID.
                  const activeCaseRef = newCaseData.caseReference;
                  if (!activeCaseRef) {
                    throw new Error(
                      "Case reference is missing — payment cannot be started. Please re-upload the QEEG file."
                    );
                  }
                  console.info(
                    "[PAYPAL] Requesting a fresh order from /api/payments/orders for case",
                    activeCaseRef
                  );
                  // Same-origin by design: app/api/payments/orders proxies to the
                  // backend so the httpOnly session cookie is forwarded. Calling
                  // the backend host directly would 404/drop the session.
                  let res: Response;
                  try {
                    res = await fetch("/api/payments/orders", {
                      method: "POST",
                      credentials: "include",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ caseReference: newCaseData.caseReference }),
                    });
                  } catch (networkError: unknown) {
                    // fetch() only rejects on a transport failure (backend down,
                    // DNS, offline). Surface it instead of the generic message.
                    console.error("[PAYPAL] Payment order request failed to reach the server:", networkError);
                    throw new Error(
                      `Could not reach the payment service (${
                        networkError instanceof Error ? networkError.message : "network error"
                      }). Please check your connection and try again.`
                    );
                  }

                  // Parse defensively: a proxy/HTML error page would make
                  // res.json() throw and hide the real status from the user.
                  const rawBody = await res.text();
                  let data: { orderId?: string; error?: string; errorCode?: string } = {};
                  if (rawBody) {
                    try {
                      data = JSON.parse(rawBody);
                    } catch {
                      console.error(
                        "[PAYPAL] Payment order response was not JSON:",
                        res.status,
                        rawBody.slice(0, 200)
                      );
                    }
                  }

                  if (!res.ok) {
                    const reason =
                      typeof data?.error === "string" && data.error.trim()
                        ? data.error.trim()
                        : `The payment service could not create an order (HTTP ${res.status}${
                            res.statusText ? ` ${res.statusText}` : ""
                          }). Please try again.`;
                    console.error(
                      "[PAYPAL] Payment order creation rejected:",
                      res.status,
                      data?.errorCode || "(no errorCode)",
                      reason
                    );
                    throw new Error(reason);
                  }
                  if (!data?.orderId) {
                    throw new Error("Payment order was created without a valid order id.");
                  }
                  console.info("[PAYPAL] Fresh order issued by backend:", data.orderId);
                  return data.orderId as string;
                }}
                onApprove={async (data) => {
                  // CRITICAL: do NOT call actions.order.authorize()/capture()
                  // here. For intent AUTHORIZE that call drives PayPal's
                  // address-verification step over a postrobot message bridge,
                  // and the SDK popup closes the bridge prematurely when the
                  // order is finalised — yielding "Window closed for
                  // postrobot_method before response". Instead, hand the
                  // approved order id to the backend, which authorises it
                  // server-side, and only close the modal after that returns.
                  const orderId = data.orderID;
                  console.info("[PAYPAL] onApprove fired with order id:", orderId);
                  if (!orderId) {
                    setShowPaymentModal(false);
                    setPaymentError(
                      "PayPal order ID not found in the approval response. The payment could not be authorised."
                    );
                    setSubmitting(false);
                    return;
                  }
                  // Re-entry guard: PayPal may fire onApprove more than once
                  // for the same approved order. Submitting the same order id
                  // twice re-authorises a used order and yields
                  // INVALID_RESOURCE_ID, so process each order exactly once.
                  if (submitting || handledPayPalOrderIds.current.has(orderId)) {
                    console.info(
                      "[PAYPAL] Ignoring duplicate approval for order",
                      orderId,
                      "(submitting =",
                      submitting,
                      ")"
                    );
                    return;
                  }
                  handledPayPalOrderIds.current.add(orderId);
                  setSubmitting(true);
                  try {
                    console.info(
                      "[PAYPAL] Submitting approved order",
                      orderId,
                      "to /api/reports/submit"
                    );
                    await handleCreateCase(orderId);
                  } catch (err: any) {
                    setShowPaymentModal(false);
                    setPaymentError(
                      err?.message ||
                        "Failed to process PayPal payment. Your payment could not be authorised — please try again later."
                    );
                    setSubmitting(false);
                  }
                }}
                onCancel={() => {
                  try {
                    setShowPaymentModal(false);
                    setSubmitting(false);
                  } catch (callbackError) {
                    console.warn("[PAYPAL] onCancel handler failed:", callbackError);
                  }
                }}
                onError={(err) => {
                  try {
                    setShowPaymentModal(false);
                    setPaymentError(
                      `PayPal Checkout error: ${
                        (err as any)?.message ||
                        (err as any)?.name ||
                        "Payment could not be processed. Please try again."
                      }`
                    );
                    setSubmitting(false);
                  } catch (callbackError) {
                    console.warn("[PAYPAL] onError handler failed:", callbackError);
                  }
                }}
              />
              </PayPalErrorBoundary>
              <button
                type="button"
                onClick={() => setShowPaymentModal(false)}
                disabled={submitting}
                className="w-full py-2.5 text-xs font-semibold text-slate-500 hover:text-slate-700 transition-colors"
              >
                Cancel and return to QEEG.com.au
              </button>
            </div>
          </div>
        </div>
      );
        })(),
        document.body
      )}

      {/* ==================================================== */}
      {/* PAYMENT AUTHORISATION FAILURE POPUP */}
      {/* ==================================================== */}
      {typeof document !== "undefined" &&
        paymentError &&
        createPortal(
          <div className="fixed inset-0 z-[9999] bg-slate-900/60 backdrop-blur-sm flex items-start justify-center overflow-y-auto overscroll-contain p-4 sm:p-6">
          <div className="bg-white rounded-3xl max-w-md w-full my-auto p-6 sm:p-8 shadow-2xl ring-1 ring-slate-900/5 border border-slate-200 space-y-5 animate-fadeIn relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-red-500" />
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 shrink-0 bg-red-50 border border-red-200 rounded-2xl flex items-center justify-center text-red-600">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-serif text-[#16233B] font-normal leading-tight">
                  Payment could not be authorised
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Hi {profileFormData.fullName || "Referring Practitioner"}, we could not validate a valid
                  payment or available funds on your account for this submission.
                </p>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-600 leading-relaxed">
              <p className="font-semibold text-slate-700 mb-1">What this means</p>
              <ul className="list-disc pl-4 space-y-1">
                <li>
                  Your case <span className="font-mono">{newCaseData.caseReference || "—"}</span> has{" "}
                  <strong>not</strong> been sent for processing.
                </li>
                <li>
                  <strong>No funds</strong> were captured from your account, card, or wallet.
                </li>
                <li>
                  You can retry payment at any time once the payment issue is resolved.
                </li>
              </ul>
              {paymentError && <p className="mt-3 text-xs text-red-700 bg-red-50 border border-red-100 rounded-lg p-2.5">{paymentError}</p>}
            </div>

            <div className="flex flex-col gap-2.5">
              <button
                type="button"
onClick={() => {
 setPaymentError(null);
        setShowPaymentModal(true);
        handledPayPalOrderIds.current.clear();
     }}
                className="w-full py-3 text-sm font-semibold text-white bg-[#16233B] hover:bg-[#0F172A] rounded-xl shadow-sm transition-all cursor-pointer"
              >
                Try payment again
              </button>
              <button
                type="button"
                onClick={() => setPaymentError(null)}
                className="w-full py-2.5 text-xs font-semibold text-slate-500 hover:text-slate-700 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ==================================================== */}
      {/* LEGAL ACCEPTANCE BARRIER (DPA / EULA) */}
      {/* ==================================================== */}
      {typeof document !== "undefined" &&
        !legalLoading &&
        legalPending.length > 0 &&
        createPortal(
          <div className="fixed inset-0 z-[9999] bg-slate-900/60 backdrop-blur-sm flex items-start justify-center overflow-y-auto overscroll-contain p-4 sm:p-6">
          <div className="bg-white rounded-3xl max-w-lg w-full my-auto p-6 sm:p-8 shadow-2xl ring-1 ring-slate-900/5 border border-slate-200 space-y-5 animate-fadeIn">
            <div className="flex items-center gap-2">
              <Scale className="w-5 h-5 text-[#16233B]" />
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Compliance · Privacy &amp; Data Agreement
              </span>
            </div>

            <div>
              <h3 className="text-xl font-serif text-[#16233B] font-normal">
                Accept documents to continue
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Australia-wide legal compliance requires you to acknowledge the following documents.
                Each acceptance is versioned and recorded permanently against your practitioner account.
              </p>
            </div>

            <div className="space-y-3">
              {legalPending.map((type) => (
                <label
                  key={type}
                  className="flex items-start gap-3 p-4 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer select-none hover:border-slate-300 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={!!legalChecked[type]}
                    onChange={(e) =>
                      setLegalChecked((prev) => ({ ...prev, [type]: e.target.checked }))
                    }
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#16233B] focus:ring-[#16233B]"
                  />
                  <div>
                    <span className="text-xs font-semibold text-slate-800 block">
                      {type === "DPA"
                        ? "Data Processing Agreement (DPA)"
                        : type === "EULA"
                        ? "End User Licence Agreement (EULA)"
                        : type}
                    </span>
                    <span className="text-[11px] text-slate-500 block mt-0.5">
                      Version {legalCurrent[type] || "2026-09-01"} ·{" "}
                      <Link
                        href={type === "DPA" ? "/legal/dpa" : "/legal/eula"}
                        target="_blank"
                        className="text-sky-700 underline hover:text-sky-900"
                      >
                        Open document (PDF)
                      </Link>
                    </span>
                  </div>
                </label>
              ))}
            </div>

            {legalError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2 text-rose-800 text-xs">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{legalError}</span>
              </div>
            )}

            <div className="pt-1 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => router.push("/")}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
              >
                Sign out
              </button>
              <button
                type="button"
                onClick={handleAcceptLegal}
                disabled={legalAccepting}
                className="px-5 py-2.5 text-xs font-semibold text-white bg-[#16233B] hover:bg-[#0F172A] disabled:opacity-60 rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer"
              >
                {legalAccepting ? (
                  <span>Recording...</span>
                ) : (
                  <>
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Accept &amp; Continue</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

export default function PortalPage() {
  const initialOptions = {
    clientId: getPayPalClientId(),
    currency: "AUD",
    intent: "authorize",
    // Structural disallow of Pay Later / Pay in 4 / PayPal Credit. Each report
    // is paid for in ONE full, upfront payment, so PayPal must never split the
    // fee into sub-payments on its side. Enforced on the backend too, which
    // rejects CAPTURE-intent orders (authorize only).
    "disable-funding": "paylater,credit",
  };

  return (
    <PayPalScriptProvider options={initialOptions}>
      <Suspense
        fallback={
          <div className="min-h-screen bg-[#F3F6F8] flex items-center justify-center">
            <div className="w-8 h-8 rounded-full border-2 border-slate-300 border-t-[#16233B] animate-spin" />
          </div>
        }
      >
        <PortalDashboardContent />
      </Suspense>
    </PayPalScriptProvider>
  );
}
