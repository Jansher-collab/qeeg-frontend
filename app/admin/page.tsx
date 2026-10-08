"use client";

import { useEffect, useState, useCallback, useRef, Suspense } from "react";
import { useRouter } from "next/navigation";
import { clearSessionStateClientSide } from "@/lib/clearSession";
import {
  CheckCircle2,
  AlertCircle,
  XCircle,
  ShieldCheck,
  Loader2,
  DollarSign,
  Menu,
  X,
  LogOut,
  Receipt,
  UserCheck,
  FileText,
  Settings,
  UploadCloud,
  Download,
  Save,
  RefreshCw,
  History,
  FileUp,
  ExternalLink,
  Database,
  Clock,
} from "lucide-react";

interface PractitionerProfile {
  fullName: string | null;
  clinicName: string | null;
}

interface User {
  email: string;
  practitionerProfile: PractitionerProfile | null;
}

interface Report {
  id: string;
  caseReference: string;
  status: string;
  feeAmount: number;
  createdAt: string;
  updatedAt: string;
  reviewedAt: string | null;
  paypalAuthorizationId: string | null;
  paypalCaptureId: string | null;
  paymentStatus: string;
  downloadedAt: string | null;
  purgedAt: string | null;
  submittingPractitioner: User;
}

interface CurrentUser {
  id: string;
  email: string;
  role: string;
}

interface LegalCurrentDoc {
  documentType: string;
  version: string;
  fileName: string;
  sizeBytes: number;
  sha256?: string | null;
  uploadedAt: string;
  pdfUrl: string;
}

interface LegalDocument {
  id: string;
  documentType: string;
  version: string;
  fileName: string;
  sizeBytes: number;
  isActive: boolean;
  uploadedAt: string;
  uploadedBy: { email: string } | null;
}

interface AdminSettings {
  reportFeeAUD: number;
  reportRetentionDays: number;
  minReliabilityThreshold: number;
  currency: string;
  hostingRegion: string;
}

interface KnowledgeSourcePdf {
  id: string;
  originalFileName: string;
  fileName: string;
  sizeBytes: number;
  title: string | null;
  status: string;
  error: string | null;
  entryCount: number;
  uploadedBy: { email: string } | null;
  uploadedAt: string;
}

interface KnowledgeEntry {
  id: string;
  sourcePdfId: string;
  title: string;
  authors: string[];
  journal: string | null;
  year: number | null;
  abstract: string | null;
  url: string;
  doi: string | null;
  keywords: string[];
  createdAt: string;
  sourcePdf: { id: string; originalFileName: string; status: string } | null;
}

function useAutoDismiss(value: unknown, onClear: () => void, delayMs = 4500) {
  const onClearRef = useRef(onClear);
  onClearRef.current = onClear;
  useEffect(() => {
    if (!value) return;
    const timer = setTimeout(() => onClearRef.current(), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);
}

function AdminDashboardContent() {
  const router = useRouter();

  const [user, setUser] = useState<CurrentUser | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [historyReports, setHistoryReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [historyError, setHistoryError] = useState<string | null>(null);

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [currentView, setCurrentView] = useState<"pending" | "history" | "legal" | "settings" | "knowledge">("pending");

  // Legal Documents management (DPA / EULA)
  const [legalDocs, setLegalDocs] = useState<LegalDocument[]>([]);
  const [legalCurrent, setLegalCurrent] = useState<Record<string, LegalCurrentDoc>>({});
  const [legalLoaded, setLegalLoaded] = useState(false);
  const [legalLoading, setLegalLoading] = useState(false);
  const [legalBusy, setLegalBusy] = useState(false);
  const [legalMessage, setLegalMessage] = useState<string | null>(null);
  const [legalError, setLegalError] = useState<string | null>(null);
  const [legalUploadFiles, setLegalUploadFiles] = useState<Record<string, File | null>>({});

  // Settings
  const [settings, setSettings] = useState<AdminSettings | null>(null);
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [feeSaving, setFeeSaving] = useState(false);
  const [retentionSaving, setRetentionSaving] = useState(false);
  const [settingsMessage, setSettingsMessage] = useState<string | null>(null);
  const [settingsError, setSettingsError] = useState<string | null>(null);
  const [feeInput, setFeeInput] = useState<string>("65");
  const [retentionInput, setRetentionInput] = useState<string>("30");

  // Knowledge Base (research PDF ingestion)
  const [knowledgeSourcePdfs, setKnowledgeSourcePdfs] = useState<KnowledgeSourcePdf[]>([]);
  const [knowledgeEntries, setKnowledgeEntries] = useState<KnowledgeEntry[]>([]);
  const [knowledgeLoaded, setKnowledgeLoaded] = useState(false);
  const [knowledgeLoading, setKnowledgeLoading] = useState(false);
  const [knowledgeUploadFiles, setKnowledgeUploadFiles] = useState<File[]>([]);
  const [knowledgeUploading, setKnowledgeUploading] = useState(false);
  const [knowledgeBusyId, setKnowledgeBusyId] = useState<string | null>(null);
  const [knowledgeMessage, setKnowledgeMessage] = useState<string | null>(null);
  const [knowledgeError, setKnowledgeError] = useState<string | null>(null);

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/auth/me");
        if (!res.ok) {
          // Invalid/revoked session: strip stale auth state before redirecting
          // so we never bounce around a broken admin/practitioner loop.
          clearSessionStateClientSide();
          router.push("/login");
          return;
        }
        const data = await res.json();
        if (data.user?.role !== "ADMIN") {
          router.push("/portal");
          return;
        }
        setUser(data.user);
      } catch (err) {
        clearSessionStateClientSide();
        router.push("/login");
      } finally {
        setAuthLoading(false);
      }
    }
    checkAuth();
  }, [router]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/reports", {
        credentials: "include"
      });
      if (!res.ok) {
        throw new Error("Failed to fetch pipeline reports.");
      }
      const data = await res.json();
      setReports(data.reports || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ----------------------------------------------------------
  // Legal Documents management
  // ----------------------------------------------------------
  const fetchLegalDocuments = async () => {
    try {
      setLegalLoading(true);
      setLegalError(null);
      const res = await fetch("/api/admin/legal/documents", { credentials: "include" });
      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.error || "Failed to load legal documents.");
      }
      const data = await res.json();
      setLegalDocs(data.documents || []);
      const currentMap: Record<string, LegalCurrentDoc> = {};
      (data.current || []).forEach((doc: LegalCurrentDoc) => {
        currentMap[doc.documentType] = doc;
      });
      setLegalCurrent(currentMap);
      setLegalLoaded(true);
    } catch (err: any) {
      setLegalError(err.message);
    } finally {
      setLegalLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && user?.role === "ADMIN" && currentView === "legal" && !legalLoaded) {
      fetchLegalDocuments();
    }
  }, [authLoading, user, currentView, legalLoaded]);

  const fileToBase64 = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error("Failed to read the file."));
      reader.onload = () => {
        const result = typeof reader.result === "string" ? reader.result : "";
        const base64 = result.includes(",") ? result.split(",")[1] : result;
        resolve(base64);
      };
      reader.readAsDataURL(file);
    });

  const handleLegalFileSelect = (type: string, file: File | null) => {
    setLegalMessage(null);
    setLegalError(null);
    setLegalUploadFiles((prev) => ({ ...prev, [type]: file }));
  };

  const handlePublishLegalDocument = async (type: string) => {
    const file = legalUploadFiles[type];
    if (!file) {
      setLegalError(`Select a replacement ${type} PDF first.`);
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      setLegalError("The selected PDF exceeds the 20 MB limit.");
      return;
    }
    try {
      setLegalBusy(true);
      setLegalMessage(null);
      setLegalError(null);
      const base64 = await fileToBase64(file);
      const res = await fetch("/api/admin/legal/documents", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentType: type,
          fileName: file.name,
          base64,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to publish the document.");
      }
      setLegalMessage(`New ${type} version ${data.document?.version || ""} published. Practitioners on the signup page now see the latest version.`);
      setLegalUploadFiles((prev) => ({ ...prev, [type]: null }));
      await fetchLegalDocuments();
    } catch (err: any) {
      setLegalError(err.message);
    } finally {
      setLegalBusy(false);
    }
  };

  const legalTypeLabel = (type: string) =>
    type === "DPA" ? "Data Processing Agreement" : type === "EULA" ? "End User Licence Agreement" : type;

  // ----------------------------------------------------------
  // Settings
  // ----------------------------------------------------------
  const fetchSettings = async () => {
    try {
      setSettingsLoading(true);
      setSettingsError(null);
      const res = await fetch("/api/admin/settings", { credentials: "include" });
      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.error || "Failed to load settings.");
      }
      const data = await res.json();
      setSettings(data.settings || null);
      setFeeInput(String(data.settings?.reportFeeAUD ?? 65));
      setRetentionInput(String(data.settings?.reportRetentionDays ?? 30));
      setSettingsLoaded(true);
    } catch (err: any) {
      setSettingsError(err.message);
    } finally {
      setSettingsLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && user?.role === "ADMIN" && currentView === "settings" && !settingsLoaded) {
      fetchSettings();
    }
  }, [authLoading, user, currentView, settingsLoaded]);

  const handleSaveFee = async () => {
    const fee = parseFloat(feeInput);
    if (Number.isNaN(fee) || fee < 10 || fee > 500) {
      setSettingsError("Report fee must be between 10 and 500 AUD.");
      return;
    }
    try {
      setFeeSaving(true);
      setSettingsMessage(null);
      setSettingsError(null);
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportFeeAUD: fee }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to save report fee.");
      }
      setSettings(data.settings || null);
      setSettingsMessage(`Report fee saved — it is now $${data.settings?.reportFeeAUD ?? fee} AUD.`);
    } catch (err: any) {
      setSettingsError(err.message);
    } finally {
      setFeeSaving(false);
    }
  };

  const handleSaveRetention = async () => {
    const retention = parseInt(retentionInput, 10);
    if (Number.isNaN(retention) || retention < 1 || retention > 365) {
      setSettingsError("Global report retention must be a whole number of days between 1 and 365.");
      return;
    }
    try {
      setRetentionSaving(true);
      setSettingsMessage(null);
      setSettingsError(null);
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportRetentionDays: retention }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to save report retention.");
      }
      setSettings(data.settings || null);
      setSettingsMessage(`Global report retention saved — new reports now default to ${data.settings?.reportRetentionDays ?? retention} days.`);
    } catch (err: any) {
      setSettingsError(err.message);
    } finally {
      setRetentionSaving(false);
    }
  };

  useAutoDismiss(error, () => setError(null));
  useAutoDismiss(historyError, () => setHistoryError(null));
  useAutoDismiss(legalMessage, () => setLegalMessage(null));
  useAutoDismiss(legalError, () => setLegalError(null));
  useAutoDismiss(knowledgeMessage, () => setKnowledgeMessage(null));
  useAutoDismiss(knowledgeError, () => setKnowledgeError(null));
  useAutoDismiss(settingsMessage, () => setSettingsMessage(null));
  useAutoDismiss(settingsError, () => setSettingsError(null));

  useEffect(() => {
    if (!authLoading && user?.role === "ADMIN") {
      fetchReports();
    }
  }, [authLoading, user]);

  const fetchHistory = useCallback(async () => {
    try {
      setHistoryLoading(true);
      setHistoryError(null);
      const res = await fetch("/api/admin/reports/history", {
        credentials: "include"
      });
      if (!res.ok) {
        throw new Error("Failed to fetch report history.");
      }
      const data = await res.json();
      setHistoryReports(data.reports || []);
      setHistoryLoaded(true);
    } catch (err: any) {
      setHistoryError(err.message);
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  // Preload history in background after auth so it's ready when tab is clicked
  useEffect(() => {
    if (!authLoading && user?.role === "ADMIN" && !historyLoaded) {
      // Small delay to not block initial render
      const timer = setTimeout(() => {
        fetchHistory();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [authLoading, user, historyLoaded, fetchHistory]);

  // Auto-refresh while any report is in a transitional state via the background worker
  // pipeline so status transitions (GENERATING -> COMPLETED, etc.) are picked up without
  // a manual refresh.
  useEffect(() => {
    // Refresh while any report is in a transitional state — including COMPLETED,
    // so the COMPLETED -> DOWNLOADED_AND_PURGED transition appears live without
    // a manual refresh.
    const isTransitional = (r: Report) =>
      r.status === "GENERATING" ||
      r.status === "PENDING_ADMIN_APPROVAL" ||
      r.status === "PAYMENT_AUTHORISED" ||
      r.status === "PENDING_RELIABILITY" ||
      r.status === "COMPLETED";
    const anyTransitional =
      reports.some(isTransitional) || historyReports.some(isTransitional);
    if (!authLoading && user?.role === "ADMIN" && anyTransitional) {
      const timer = setInterval(() => {
        fetchReports();
        fetchHistory();
      }, 4000);
      return () => clearInterval(timer);
    }
  }, [authLoading, user, reports, historyReports, fetchHistory]);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    } catch {
      // Ignore network errors; still clear everything locally below.
    } finally {
      // Aggressively strip all session cookies and storage, then force a full
      // reload so no stale auth state survives in memory.
      clearSessionStateClientSide();
      window.location.href = "/login";
    }
  };

  const handleDecline = async (reportId: string) => {
    if (!confirm("Are you sure you want to decline this case? The payment authorization will be voided.")) {
      return;
    }
    try {
      setActionLoadingId(reportId);
      setError(null);
      const res = await fetch(`/api/admin/reports/${reportId}/decline`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Decline failed.");
      }
      await fetchReports();
      if (historyLoaded) {
        await fetchHistory();
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoadingId(null);
    }
  };

  // ----------------------------------------------------------
  // Knowledge Base (research PDF ingestion)
  // ----------------------------------------------------------
  const fetchKnowledge = async () => {
    try {
      setKnowledgeLoading(true);
      setKnowledgeError(null);
      const [sourcesRes, entriesRes] = await Promise.all([
        fetch("/api/admin/knowledge/source-pdfs", { credentials: "include" }),
        fetch("/api/admin/knowledge/entries", { credentials: "include" }),
      ]);
      const sourcesData = await sourcesRes.json().catch(() => null);
      if (!sourcesRes.ok) {
        throw new Error(sourcesData?.error || "Failed to load knowledge source PDFs.");
      }
      setKnowledgeSourcePdfs(sourcesData?.sourcePdfs || []);
      const entriesData = entriesRes.ok ? await entriesRes.json().catch(() => null) : null;
      setKnowledgeEntries(entriesData?.entries || []);
      setKnowledgeLoaded(true);
    } catch (err: any) {
      setKnowledgeError(err.message);
    } finally {
      setKnowledgeLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && user?.role === "ADMIN" && currentView === "knowledge" && !knowledgeLoaded) {
      fetchKnowledge();
    }
  }, [authLoading, user, currentView, knowledgeLoaded]);

  const handleKnowledgeFileSelect = (files: FileList | null) => {
    setKnowledgeMessage(null);
    setKnowledgeError(null);
    setKnowledgeUploadFiles(files ? Array.from(files) : []);
  };

  const handleUploadKnowledgePdf = async () => {
    if (knowledgeUploadFiles.length === 0) {
      setKnowledgeError("Choose at least one research PDF to upload first.");
      return;
    }
    const oversized = knowledgeUploadFiles.find((f) => f.size > 25 * 1024 * 1024);
    if (oversized) {
      setKnowledgeError(`"${oversized.name}" exceeds the 25 MB limit. No files were uploaded.`);
      return;
    }
    try {
      setKnowledgeUploading(true);
      setKnowledgeMessage(null);
      setKnowledgeError(null);
      const batch = [];
      for (const file of knowledgeUploadFiles) {
        batch.push({ fileName: file.name, contentType: file.type || "application/pdf", base64: await fileToBase64(file) });
      }
      const res = await fetch("/api/admin/knowledge/source-pdfs", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ files: batch }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to upload the source PDFs.");
      }
      const results = Array.isArray(data.results) ? data.results : [];
      const okList = results.filter((r: any) => r.ok);
      const failedList = results.filter((r: any) => !r.ok);
      const okCount = okList.length;
      const totalEntries = okList.reduce((sum: number, r: any) => sum + (r.ingested ?? 0), 0);
      if (failedList.length === 0) {
        setKnowledgeMessage(
          `${okCount} ${okCount === 1 ? "research PDF" : "research PDFs"} ingested successfully — ${totalEntries} structured research ${totalEntries === 1 ? "entry" : "entries"} extracted.`
        );
      } else if (okCount === 0) {
        setKnowledgeError(
          `Upload failed: ${failedList.map((f: any) => `"${f.fileName}" (${f.error})`).join("; ")}`
        );
      } else {
        setKnowledgeMessage(
          `${okCount} ${okCount === 1 ? "research PDF" : "research PDFs"} ingested (${totalEntries} entries); ${failedList.length} failed: ${failedList.map((f: any) => `"${f.fileName}" (${f.error})`).join("; ")}`
        );
      }
      setKnowledgeUploadFiles([]);
      if (okCount > 0) {
        await fetchKnowledge();
      }
    } catch (err: any) {
      setKnowledgeError(err.message);
    } finally {
      setKnowledgeUploading(false);
    }
  };

  const handleReingestKnowledgePdf = async (id: string) => {
    try {
      setKnowledgeBusyId(id);
      setKnowledgeMessage(null);
      setKnowledgeError(null);
      const res = await fetch(`/api/admin/knowledge/source-pdfs/${id}/ingest`, {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to re-run ingestion.");
      }
      setKnowledgeMessage(`Ingestion re-run complete — ${data.ingested ?? 0} entries extracted.`);
      await fetchKnowledge();
    } catch (err: any) {
      setKnowledgeError(err.message);
    } finally {
      setKnowledgeBusyId(null);
    }
  };

  const handleRetractKnowledgePdf = async (source: KnowledgeSourcePdf) => {
    if (
      !confirm(
        `Remove "${source.originalFileName}" and its ${source.entryCount} extracted entr${source.entryCount === 1 ? "y" : "ies"} from the Knowledge Base? This cannot be undone.`
      )
    ) {
      return;
    }
    try {
      setKnowledgeBusyId(source.id);
      setKnowledgeMessage(null);
      setKnowledgeError(null);
      const res = await fetch(`/api/admin/knowledge/source-pdfs/${source.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to remove the source PDF.");
      }
      setKnowledgeMessage(`"${source.originalFileName}" and its extracted entries have been removed.`);
      await fetchKnowledge();
    } catch (err: any) {
      setKnowledgeError(err.message);
    } finally {
      setKnowledgeBusyId(null);
    }
  };

  const knowledgeStatusBadge = (status: string) => {
    if (status === "INGESTED")
      return { label: "Ingested", className: "bg-emerald-50 text-emerald-700 border-emerald-200", dotColor: "bg-emerald-500" };
    if (status === "INGESTING")
      return { label: "Ingesting", className: "bg-sky-50 text-sky-700 border-sky-200", dotColor: "bg-sky-500" };
    if (status === "FAILED")
      return { label: "Failed", className: "bg-rose-50 text-rose-700 border-rose-200", dotColor: "bg-rose-500" };
    if (status === "PENDING_INGESTION")
      return { label: "Pending", className: "bg-amber-50 text-amber-700 border-amber-200", dotColor: "bg-amber-500" };
    return { label: status.replace(/_/g, " "), className: "bg-slate-100 text-slate-600 border-slate-200", dotColor: "bg-slate-400" };
  };

  const getStatusBadge = (status: string) => {
    const s = status;
    if (s === "COMPLETED")
      return { label: "Completed", className: "bg-emerald-50 text-emerald-700 border-emerald-200", dotColor: "bg-emerald-500" };
    if (s === "DOWNLOADED_AND_PURGED")
      return { label: "Downloaded & Purged", className: "bg-slate-100 text-slate-600 border-slate-200", dotColor: "bg-slate-400" };
    if (s === "RELIABILITY_REJECTED")
      return { label: "Declined", className: "bg-rose-50 text-rose-700 border-rose-200", dotColor: "bg-rose-500" };
    if (s === "PENDING_ADMIN_APPROVAL")
      return { label: "Pending Approval", className: "bg-amber-50 text-amber-700 border-amber-200", dotColor: "bg-amber-500" };
    if (s === "PAYMENT_AUTHORISED")
      return { label: "Payment Authorised", className: "bg-amber-50 text-amber-700 border-amber-200", dotColor: "bg-amber-500" };
    if (s === "GENERATING")
      return { label: "Generating", className: "bg-sky-50 text-sky-700 border-sky-200", dotColor: "bg-sky-500" };
    if (s === "IN_NEUROSCIENTIST_REVIEW")
      return { label: "In Review", className: "bg-sky-50 text-sky-700 border-sky-200", dotColor: "bg-sky-500" };
    return { label: s.replace(/_/g, " "), className: "bg-slate-100 text-slate-600 border-slate-200", dotColor: "bg-slate-400" };
  };

  const getPaymentBadge = (paymentStatus: string) => {
    switch (paymentStatus) {
      case "CAPTURED":
        return { label: "Captured", className: "bg-emerald-50 text-emerald-700 border-emerald-200", dotColor: "bg-emerald-500" };
      case "AUTHORISED":
        return { label: "Authorized", className: "bg-amber-50 text-amber-700 border-amber-200", dotColor: "bg-amber-500" };
      case "VOIDED":
        return { label: "Voided", className: "bg-rose-50 text-rose-700 border-rose-200", dotColor: "bg-rose-500" };
      case "FAILED":
        return { label: "Failed", className: "bg-rose-50 text-rose-700 border-rose-200", dotColor: "bg-rose-500" };
      default:
        return { label: "Not Started", className: "bg-slate-100 text-slate-600 border-slate-200", dotColor: "bg-slate-400" };
    }
  };

  const formatDateTime = (value: string | null | undefined) => {
    if (!value) return "—";
    try {
      return new Date(value).toLocaleString("en-AU", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      });
    } catch {
      return "—";
    }
  };

  const getDownloadBadge = (
    status: string,
    downloadedAt: string | null,
    purgedAt: string | null
  ) => {
    if (status === "DOWNLOADED_AND_PURGED" || downloadedAt) {
      return {
        label: "Downloaded",
        className: "bg-emerald-50 text-emerald-700 border-emerald-200",
        dotColor: "bg-emerald-500",
        title: purgedAt
          ? `One-time download completed; data purged ${formatDateTime(purgedAt)}`
          : downloadedAt
            ? `Downloaded ${formatDateTime(downloadedAt)}`
            : "One-time download completed and data purged",
      };
    }
    if (status === "COMPLETED") {
      return {
        label: "Not downloaded",
        className: "bg-amber-50 text-amber-700 border-amber-200",
        dotColor: "bg-amber-500",
        title: "Report prepared but never downloaded — zero-retention backstop purge applies",
      };
    }
    return {
      label: "Pending",
      className: "bg-slate-100 text-slate-500 border-slate-200",
      dotColor: "bg-slate-400",
      title: "Report must reach Completed before it can be downloaded",
    };
  };

  const formatBytes = (bytes: number) => {
    if (!bytes && bytes !== 0) return "—";
    if (bytes < 1024) return `${bytes} B`;
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    return `${(kb / 1024).toFixed(2)} MB`;
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#F3F6F8] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-slate-300 border-t-[#16233B] animate-spin" />
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Loading Admin Panel...
          </span>
        </div>
      </div>
    );
  }

  if (!user || user.role !== "ADMIN") return null;

  return (
    <div className="min-h-screen bg-[#F3F6F8] flex flex-col lg:flex-row selection:bg-[#16233B] selection:text-white">
      {/* Mobile Top Header */}
      <header className="lg:hidden bg-[#16233B] text-white px-4 py-3.5 flex items-center justify-between border-b border-slate-800 sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-rose-500" />
          <span className="text-xl font-serif font-normal text-white tracking-tight">Admin</span>
        </div>
        <button
          onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
        >
          {mobileSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* Dark Navy Fixed Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#16233B] text-slate-300 flex flex-col justify-between transition-transform duration-300 ease-in-out border-r border-slate-800 lg:translate-x-0 ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          }`}
      >
        <div className="flex flex-col h-full justify-between">
          <div>
            {/* Sidebar Brand Header */}
            <div className="p-6 border-b border-slate-800/80">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-serif font-normal text-white tracking-tight">
                  QEEG.com.au
                </span>
              </div>
              <div className="mt-1.5 flex items-center gap-1.5 text-[10px] font-semibold tracking-wider text-rose-400 uppercase">
                <ShieldCheck className="w-3 h-3 text-rose-400" />
                <span>Admin Control Panel</span>
              </div>
            </div>

            {/* Navigation Menu Items */}
            <nav className="p-4 space-y-1.5">
              <button
                onClick={() => { setCurrentView("pending"); setMobileSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all ${currentView === "pending"
                    ? "bg-[#223554] text-white font-semibold shadow-xs"
                    : "text-slate-300 hover:text-white hover:bg-[#1B2B46]"
                  }`}
              >
                <UserCheck className={`w-4 h-4 ${currentView === "pending" ? "text-white" : "text-slate-400"}`} />
                <span>Pending Requests</span>
              </button>

              <button
                onClick={() => { setCurrentView("history"); setMobileSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all ${currentView === "history"
                    ? "bg-[#223554] text-white font-semibold shadow-xs"
                    : "text-slate-300 hover:text-white hover:bg-[#1B2B46]"
                  }`}
              >
                <Receipt className={`w-4 h-4 ${currentView === "history" ? "text-white" : "text-slate-400"}`} />
                <span>Billing / History</span>
              </button>

              <button
                onClick={() => { setCurrentView("legal"); setMobileSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all ${currentView === "legal"
                    ? "bg-[#223554] text-white font-semibold shadow-xs"
                    : "text-slate-300 hover:text-white hover:bg-[#1B2B46]"
                  }`}
              >
                <FileText className={`w-4 h-4 ${currentView === "legal" ? "text-white" : "text-slate-400"}`} />
                <span>Legal Documents</span>
              </button>

              <button
                onClick={() => { setCurrentView("knowledge"); setMobileSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all ${currentView === "knowledge"
                    ? "bg-[#223554] text-white font-semibold shadow-xs"
                    : "text-slate-300 hover:text-white hover:bg-[#1B2B46]"
                  }`}
              >
                <Database className={`w-4 h-4 ${currentView === "knowledge" ? "text-white" : "text-slate-400"}`} />
                <span>Knowledge Base</span>
              </button>

              <button
                onClick={() => { setCurrentView("settings"); setMobileSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all ${currentView === "settings"
                    ? "bg-[#223554] text-white font-semibold shadow-xs"
                    : "text-slate-300 hover:text-white hover:bg-[#1B2B46]"
                  }`}
              >
                <Settings className={`w-4 h-4 ${currentView === "settings" ? "text-white" : "text-slate-400"}`} />
                <span>Settings</span>
              </button>
            </nav>
          </div>

          <div className="p-3 border-t border-slate-800/80 bg-[#131F33]">
            <div className="p-3 rounded-2xl bg-[#1A2942] border border-slate-700/50 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-400 font-semibold text-xs flex items-center justify-center shrink-0">
                  AD
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-semibold text-white block truncate">
                    System Admin
                  </span>
                  <span className="text-[10px] text-slate-400 block truncate">
                    {user.email}
                  </span>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors shrink-0 cursor-pointer"
                title="Log out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Backdrop for mobile drawer */}
      {mobileSidebarOpen && (
        <div
          onClick={() => setMobileSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Main Content Shell */}
      <div className="flex-1 min-w-0 lg:pl-64 flex flex-col min-h-screen">
        <main className="flex-1 max-w-[1440px] mx-auto w-full px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-16 py-8">
          <div className="w-full space-y-8 animate-fadeIn">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[11px] font-semibold text-rose-500 uppercase tracking-widest font-sans">
                    Admin Access
                  </span>
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-rose-500" />
                  <span className="text-[11px] text-rose-700 font-medium">Restricted Workspace</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-serif font-normal text-[#16233B] tracking-tight">
                  {currentView === "pending"
                    ? "Live Pipeline Monitoring"
                    : currentView === "history"
                    ? "Billing & Action History"
                    : currentView === "legal"
                    ? "Legal Documents"
                    : currentView === "knowledge"
                    ? "Knowledge Base Ingestion"
                    : "Settings"}
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 mt-1 font-normal">
                  {currentView === "pending"
                    ? "Monitor in-flight, completed, and purged cases. Completed reports stay downloadable until their retention window lapses; declining a pending case voids the PayPal hold."
                    : currentView === "history"
                    ? "Log of all processed, declined, and completed reports."
                    : currentView === "legal"
                    ? "Publish the DPA / EULA PDFs shown to new practitioners on the signup page. New documents go live immediately — no code change."
                    : currentView === "knowledge"
                    ? "Upload research PDFs; the AI pipeline extracts structured literature entries, keeps them linked to their source, and makes them searchable by the report-generation and correlation engine."
                    : "Configure the default report fee charged to practitioners per completed report."}
                </p>
              </div>
            </div>

            {error && (
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-3 animate-fadeIn">
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {currentView === "pending" ? (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between gap-3 flex-wrap">
                  <h2 className="text-lg font-serif text-[#16233B]">Active Pipeline ({reports.length})</h2>
                  <button
                    onClick={fetchReports}
                    disabled={loading}
                    className="text-sm font-medium text-[#16233B] hover:text-[#0F172A] transition-colors"
                  >
                    {loading ? "Refreshing..." : "Refresh List"}
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[880px] text-left text-sm">
                    <thead>
                      <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                        <th className="py-3.5 px-5">Case Reference</th>
                        <th className="py-3.5 px-4">Practitioner</th>
                        <th className="py-3.5 px-4">Status</th>
                        <th className="py-3.5 px-4">Submitted</th>
                        <th className="py-3.5 px-4">Authorized Fee</th>
                        <th className="py-3.5 px-4">Download</th>
                        <th className="py-3.5 px-5 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {loading && reports.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-12 text-center text-slate-400">
                            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-slate-300" />
                            Loading pipeline cases...
                          </td>
                        </tr>
                      ) : reports.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-12 text-center text-slate-400">
                            Pipeline is clear — no active cases.
                          </td>
                        </tr>
                      ) : (
                        reports.map((report) => {
                          const statusBadge = getStatusBadge(report.status);
                          const downloadBadge = getDownloadBadge(report.status, report.downloadedAt, report.purgedAt);
                          const canAction = report.status === "PENDING_ADMIN_APPROVAL";
                          return (
                          <tr key={report.id} className="hover:bg-slate-50/70 transition-colors">
                            <td className="py-4 px-5 font-semibold text-[#16233B] font-mono">
                              {report.caseReference}
                            </td>
                            <td className="py-4 px-4">
                              <div className="flex flex-col">
                                <span className="font-medium text-slate-800">
                                  {report.submittingPractitioner?.practitionerProfile?.fullName || report.submittingPractitioner?.email}
                                </span>
                                <span className="text-[11px] text-slate-500">
                                  {report.submittingPractitioner?.practitionerProfile?.clinicName || "No clinic specified"}
                                </span>
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <span
                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${statusBadge.className}`}
                              >
                                <span className={`w-1.5 h-1.5 rounded-full ${statusBadge.dotColor}`} />
                                {statusBadge.label}
                              </span>
                            </td>
                            <td className="py-4 px-4 text-slate-500 text-xs">
                              {new Date(report.createdAt).toLocaleString("en-AU")}
                            </td>
                            <td className="py-4 px-4">
                              <span className="inline-flex items-center gap-1 text-amber-700 font-medium bg-amber-50 px-2 py-1 rounded-md text-xs border border-amber-200">
                                <DollarSign className="w-3 h-3" />
                                ${report.feeAmount.toFixed(2)} AUD Held
                              </span>
                            </td>
                            <td className="py-4 px-4">
                              <span
                                title={downloadBadge.title}
                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${downloadBadge.className}`}
                              >
                                <span className={`w-1.5 h-1.5 rounded-full ${downloadBadge.dotColor}`} />
                                {downloadBadge.label}
                              </span>
                            </td>
                            <td className="py-4 px-5 text-right whitespace-nowrap">
                              {canAction ? (
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => handleDecline(report.id)}
                                  disabled={actionLoadingId === report.id}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 disabled:opacity-50 text-xs font-semibold transition-all cursor-pointer"
                                >
                                  {actionLoadingId === report.id ? (
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                  ) : (
                                    <>
                                      <XCircle className="w-3.5 h-3.5" />
                                      Decline
                                    </>
                                  )}
                                </button>
                              </div>
                              ) : (
                                <span className="text-xs text-slate-400 italic">{statusBadge.label.toLowerCase()}</span>
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
            ) : currentView === "history" ? (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-serif text-[#16233B]">
                      All Billing &amp; Cases ({historyReports.length})
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                      Every case across pending, approved, declined, and completed states with PayPal transaction references.
                    </p>
                  </div>
                  <button
                    onClick={fetchHistory}
                    disabled={historyLoading}
                    className="text-sm font-medium text-[#16233B] hover:text-[#0F172A] transition-colors shrink-0"
                  >
                    {historyLoading ? "Refreshing..." : "Refresh History"}
                  </button>
                </div>

                {historyError && (
                  <div className="p-4 bg-rose-50 border-b border-rose-200 text-rose-800 text-sm flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                    <span>{historyError}</span>
                  </div>
                )}

                <div className="overflow-x-auto">
                  <table className="w-full min-w-[1100px] text-left text-sm">
                    <thead>
                      <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                        <th className="py-3.5 px-5">Case Reference</th>
                        <th className="py-3.5 px-4">Practitioner</th>
                        <th className="py-3.5 px-4">Status</th>
                        <th className="py-3.5 px-4">Payment</th>
                        <th className="py-3.5 px-4 normal-case">Paid Amount</th>
                        <th className="py-3.5 px-4">Auth ID</th>
                        <th className="py-3.5 px-4">Capture ID</th>
                        <th className="py-3.5 px-4">Download</th>
                        <th className="py-3.5 px-4">Submitted</th>
                        <th className="py-3.5 px-4">Updated</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {historyLoading && historyReports.length === 0 ? (
                        <tr>
                          <td colSpan={10} className="py-12 text-center text-slate-400">
                            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-slate-300" />
                            Loading billing history...
                          </td>
                        </tr>
                      ) : historyReports.length === 0 ? (
                        <tr>
                          <td colSpan={10} className="py-12 text-center text-slate-400">
                            No cases found in billing history yet.
                          </td>
                        </tr>
                      ) : (
                        historyReports.map((report) => {
                          const statusBadge = getStatusBadge(report.status);
                          const paymentBadge = getPaymentBadge(report.paymentStatus);
                          const downloadBadge = getDownloadBadge(report.status, report.downloadedAt, report.purgedAt);
                          return (
                            <tr key={report.id} className="hover:bg-slate-50/70 transition-colors">
                              <td className="py-4 px-5 font-semibold text-[#16233B] font-mono">
                                {report.caseReference}
                              </td>
                              <td className="py-4 px-4">
                                <span className="block font-medium text-slate-800">
                                  {report.submittingPractitioner?.practitionerProfile?.fullName ||
                                    report.submittingPractitioner?.email}
                                </span>
                                {report.submittingPractitioner?.practitionerProfile?.clinicName && (
                                  <span className="block text-[11px] text-slate-500">
                                    {report.submittingPractitioner.practitionerProfile.clinicName}
                                  </span>
                                )}
                              </td>
                              <td className="py-4 px-4">
                                <span
                                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${statusBadge.className}`}
                                >
                                  <span className={`w-1.5 h-1.5 rounded-full ${statusBadge.dotColor}`} />
                                  {statusBadge.label}
                                </span>
                              </td>
                              <td className="py-4 px-4">
                                <span
                                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${paymentBadge.className}`}
                                >
                                  <span className={`w-1.5 h-1.5 rounded-full ${paymentBadge.dotColor}`} />
                                  {paymentBadge.label}
                                </span>
                              </td>
                              <td className="py-4 px-4 text-slate-800 font-medium">
                                {report.feeAmount != null ? `$${report.feeAmount.toFixed(2)}` : "—"}
                              </td>
                              <td className="py-4 px-4 font-mono text-xs text-slate-600 break-all">
                                {report.paypalAuthorizationId || "—"}
                              </td>
                              <td className="py-4 px-4 font-mono text-xs text-slate-600 break-all">
                                {report.paypalCaptureId || "—"}
                              </td>
                              <td className="py-4 px-4">
                                <span
                                  title={downloadBadge.title}
                                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${downloadBadge.className}`}
                                >
                                  <span className={`w-1.5 h-1.5 rounded-full ${downloadBadge.dotColor}`} />
                                  {downloadBadge.label}
                                </span>
                              </td>
                              <td className="py-4 px-4 text-xs text-slate-500 whitespace-nowrap">
                                {formatDateTime(report.createdAt)}
                              </td>
                              <td className="py-4 px-4 text-xs text-slate-500 whitespace-nowrap">
                                {formatDateTime(report.updatedAt)}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : currentView === "legal" ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {["DPA", "EULA"].map((type) => {
                    const current = legalCurrent[type];
                    return (
                      <div key={type} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-[#16233B]/5 border border-[#16233B]/10 text-[#16233B] flex items-center justify-center">
                              <FileText className="w-5 h-5" />
                            </div>
                            <div>
                              <h3 className="text-base font-serif text-[#16233B]">{legalTypeLabel(type)}</h3>
                              <p className="text-[11px] text-slate-500">Served to new practitioners on signup</p>
                            </div>
                          </div>
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                            current
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-amber-50 text-amber-700 border-amber-200"
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${current ? "bg-emerald-500" : "bg-amber-500"}`} />
                            {current ? "Published" : "No version yet"}
                          </span>
                        </div>

                        <div className="p-5 sm:p-6 flex-1 space-y-4">
                          {current ? (
                            <dl className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2 text-xs">
                              <div className="flex items-center justify-between gap-2">
                                <dt className="text-slate-500 font-sans">Version</dt>
                                <dd className="font-mono font-semibold text-[#16233B]">{current.version}</dd>
                              </div>
                              <div className="flex items-center justify-between gap-2">
                                <dt className="text-slate-500 font-sans">File</dt>
                                <dd className="text-slate-700 truncate">{current.fileName}</dd>
                              </div>
                              <div className="flex items-center justify-between gap-2">
                                <dt className="text-slate-500 font-sans">Size</dt>
                                <dd className="text-slate-700">{formatBytes(current.sizeBytes)}</dd>
                              </div>
                              <div className="flex items-center justify-between gap-2">
                                <dt className="text-slate-500 font-sans">Published</dt>
                                <dd className="text-slate-700">{formatDateTime(current.uploadedAt)}</dd>
                              </div>
                              {current.sha256 && (
                                <div className="flex items-center justify-between gap-2">
                                  <dt className="text-slate-500 font-sans">SHA-256</dt>
                                  <dd className="text-slate-500 font-mono text-[10px] truncate">{current.sha256}</dd>
                                </div>
                              )}
                            </dl>
                          ) : (
                            <p className="text-xs text-slate-500">
                              No {type} has been published yet. Upload the first PDF below to make it live on the signup page.
                            </p>
                          )}

                          <div className="flex flex-wrap gap-2">
                            <a
                              href={`/legal/${type.toLowerCase()}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#16233B] hover:bg-[#0F172A] text-white text-xs font-semibold shadow-xs transition-all"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                              View agreement
                            </a>
                            {current && (
                              <a
                                href={`/api/legal/${type.toLowerCase()}/pdf?v=${encodeURIComponent(current.version)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white border border-slate-300 hover:border-[#16233B] text-[#16233B] text-xs font-semibold transition-all"
                              >
                                <Download className="w-3.5 h-3.5" />
                                Download v{current.version}
                              </a>
                            )}
                          </div>

                          <div className="border-t border-slate-100 pt-4">
                            <p className="text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-2">
                              Publish new {type} version — no code change
                            </p>
                            <input
                              type="file"
                              accept="application/pdf,.pdf"
                              id={`legal-upload-${type}`}
                              className="hidden"
                              onChange={(e) => handleLegalFileSelect(type, e.target.files?.[0] || null)}
                            />
                            <div className="flex flex-col sm:flex-row gap-2">
                              <label
                                htmlFor={`legal-upload-${type}`}
                                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-dashed text-xs font-semibold transition-all cursor-pointer ${
                                  legalUploadFiles[type]
                                    ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                                    : "border-slate-300 bg-slate-50 text-slate-600 hover:border-[#16233B] hover:bg-white"
                                }`}
                              >
                                <FileUp className="w-4 h-4" />
                                {legalUploadFiles[type] ? legalUploadFiles[type].name : "Choose replacement PDF"}
                              </label>
                              <button
                                type="button"
                                onClick={() => handlePublishLegalDocument(type)}
                                disabled={!legalUploadFiles[type] || legalBusy}
                                className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#16233B] hover:bg-[#0F172A] disabled:opacity-50 text-white text-xs font-semibold shadow-xs transition-all"
                              >
                                {legalBusy ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
                                Publish
                              </button>
                            </div>
                            <p className="text-[11px] text-slate-400 mt-2">
                              Max 20 MB · versions are {new Date().toISOString().slice(0, 10)} (appended -2, -3 on same-day re-uploads).
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {legalError && (
                  <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                    <span>{legalError}</span>
                  </div>
                )}
                {legalMessage && (
                  <div className="flex items-start gap-2.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl px-4 py-3 text-sm">
                    <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
                    <span>{legalMessage}</span>
                  </div>
                )}

                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#16233B]/5 border border-[#16233B]/10 text-[#16233B] flex items-center justify-center">
                        <History className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-base font-serif text-[#16233B]">Version history & acceptance tracking</h3>
                        <p className="text-[11px] text-slate-500">
                          The version each practitioner accepted is recorded on their profile as acceptanceType + version + time.
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={fetchLegalDocuments}
                      disabled={legalLoading}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-slate-300 hover:border-[#16233B] text-[#16233B] text-xs font-semibold transition-all disabled:opacity-50"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${legalLoading ? "animate-spin" : ""}`} />
                      Refresh
                    </button>
                  </div>
                    {legalDocs.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full min-w-[720px] text-left">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-100">
                            <th className="py-3 px-4 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Type</th>
                            <th className="py-3 px-4 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Version</th>
                            <th className="py-3 px-4 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">File</th>
                            <th className="py-3 px-4 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Uploaded by</th>
                            <th className="py-3 px-4 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">When</th>
                            <th className="py-3 px-4 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {legalDocs.map((doc) => (
                            <tr key={doc.id} className="hover:bg-slate-50/50">
                              <td className="py-3.5 px-4 text-xs font-sans font-semibold text-[#16233B]">{doc.documentType}</td>
                              <td className="py-3.5 px-4 text-xs font-mono text-slate-700">{doc.version}</td>
                              <td className="py-3.5 px-4 text-xs text-slate-500">{doc.fileName}</td>
                              <td className="py-3.5 px-4 text-xs text-slate-500">{doc.uploadedBy?.email || "—"}</td>
                              <td className="py-3.5 px-4 text-xs text-slate-500 whitespace-nowrap">{formatDateTime(doc.uploadedAt)}</td>
                              <td className="py-3.5 px-4">
                                {doc.isActive ? (
                                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                    Active
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-100 text-slate-500 border border-slate-200">
                                    Superseded
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="p-8 text-center text-xs text-slate-500">
                      <History className="w-6 h-6 mx-auto text-slate-300 mb-2" />
                      No versions published yet. Upload the first DPA and EULA PDFs above.
                    </div>
                  )}
                </div>
              </div>
            ) : currentView === "knowledge" ? (
              <div className="space-y-6">
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#16233B]/5 border border-[#16233B]/10 text-[#16233B] flex items-center justify-center">
                      <Database className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-serif text-[#16233B]">Upload research PDF</h3>
                      <p className="text-[11px] text-slate-500">
                        The AI pipeline reads the PDF, extracts structured literature entries, and keeps every entry linked back to its source document.
                      </p>
                    </div>
                  </div>
                  <div className="p-5 sm:p-6 space-y-3">
                    <input
                      type="file"
                      accept="application/pdf,.pdf"
                      multiple
                      id="kb-upload"
                      className="hidden"
                      onChange={(e) => handleKnowledgeFileSelect(e.target.files)}
                    />
                    <div className="flex flex-col sm:flex-row gap-2">
                      <label
                        htmlFor="kb-upload"
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-dashed text-xs font-semibold transition-all cursor-pointer ${
                          knowledgeUploadFiles.length > 0
                            ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                            : "border-slate-300 bg-slate-50 text-slate-600 hover:border-[#16233B] hover:bg-white"
                        }`}
                      >
                        <FileUp className="w-4 h-4" />
                        {knowledgeUploadFiles.length > 0
                          ? `${knowledgeUploadFiles.length} ${knowledgeUploadFiles.length === 1 ? "research PDF" : "research PDFs"} selected`
                          : "Choose research PDFs"}
                      </label>
                      <button
                        type="button"
                        onClick={handleUploadKnowledgePdf}
                        disabled={knowledgeUploadFiles.length === 0 || knowledgeUploading}
                        className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#16233B] hover:bg-[#0F172A] disabled:opacity-50 text-white text-xs font-semibold shadow-xs transition-all"
                      >
                        {knowledgeUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
                        {knowledgeUploading
                          ? `Ingesting ${knowledgeUploadFiles.length} ${knowledgeUploadFiles.length === 1 ? "PDF" : "PDFs"}…`
                          : "Upload & ingest"}
                      </button>
                    </div>
                    {knowledgeUploadFiles.length > 0 && (
                      <ul className="flex flex-wrap gap-1.5">
                        {knowledgeUploadFiles.map((file) => (
                          <li
                            key={file.name + file.size}
                            className="inline-flex items-center gap-1 rounded-full bg-slate-100 text-slate-600 text-[11px] px-2.5 py-1 max-w-full"
                          >
                            <span className="truncate">{file.name}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                    <p className="text-[11px] text-slate-400">
                      PDF only · max 25 MB per file · up to 10 at once · text-based documents (scanned image-only PDFs cannot be extracted).
                    </p>

                    {knowledgeError && (
                      <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
                        <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                        <span>{knowledgeError}</span>
                      </div>
                    )}
                    {knowledgeMessage && (
                      <div className="flex items-start gap-2.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl px-4 py-3 text-sm">
                        <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
                        <span>{knowledgeMessage}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between gap-3 flex-wrap">
                    <div>
                      <h2 className="text-lg font-serif text-[#16233B]">Source PDFs ({knowledgeSourcePdfs.length})</h2>
                      <p className="text-xs text-slate-500 mt-1">
                        Uploaded research documents and their ingestion status. Removing a source also removes every entry extracted from it.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={fetchKnowledge}
                      disabled={knowledgeLoading}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-slate-300 hover:border-[#16233B] text-[#16233B] text-xs font-semibold transition-all disabled:opacity-50"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${knowledgeLoading ? "animate-spin" : ""}`} />
                      Refresh
                    </button>
                  </div>
                    {knowledgeSourcePdfs.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full min-w-[640px] text-left">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-100">
                            <th className="py-3 px-4 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Document</th>
                            <th className="py-3 px-4 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                            <th className="py-3 px-4 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Entries</th>
                            <th className="py-3 px-4 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Uploaded</th>
                            <th className="py-3 px-4 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {knowledgeSourcePdfs.map((source) => {
                            const badge = knowledgeStatusBadge(source.status);
                            const busy = knowledgeBusyId === source.id;
                            return (
                              <tr key={source.id} className="hover:bg-slate-50/50 align-top">
                                <td className="py-3.5 px-4">
                                  <span className="text-xs font-semibold text-[#16233B] block">{source.title || source.originalFileName}</span>
                                  <span className="text-[11px] text-slate-400 block mt-0.5">{source.originalFileName} · {formatBytes(source.sizeBytes)}</span>
                                  {source.status === "FAILED" && source.error && (
                                    <span className="text-[11px] text-rose-600 block mt-1">{source.error}</span>
                                  )}
                                </td>
                                <td className="py-3.5 px-4">
                                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${badge.className}`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${badge.dotColor}`} />
                                    {badge.label}
                                  </span>
                                </td>
                                <td className="py-3.5 px-4 text-xs text-slate-700">{source.entryCount}</td>
                                <td className="py-3.5 px-4 text-xs text-slate-500 whitespace-nowrap">
                                  {formatDateTime(source.uploadedAt)}
                                  <span className="block text-[11px] text-slate-400">{source.uploadedBy?.email || "—"}</span>
                                </td>
                                <td className="py-3.5 px-4">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <a
                                      href={`/api/admin/knowledge/source-pdfs/${source.id}/pdf`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#16233B] hover:underline"
                                    >
                                      <ExternalLink className="w-3.5 h-3.5" />
                                      Preview
                                    </a>
                                    <button
                                      type="button"
                                      onClick={() => handleReingestKnowledgePdf(source.id)}
                                      disabled={busy}
                                      className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-600 hover:text-[#16233B] disabled:opacity-50"
                                    >
                                      {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                                      Re-ingest
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleRetractKnowledgePdf(source)}
                                      disabled={busy}
                                      className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-rose-600 hover:text-rose-800 disabled:opacity-50"
                                    >
                                      <XCircle className="w-3.5 h-3.5" />
                                      Remove
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="p-8 text-center text-xs text-slate-500">
                      <Database className="w-6 h-6 mx-auto text-slate-300 mb-2" />
                      No source PDFs yet. Upload a research PDF above to build the curated Knowledge Base.
                    </div>
                  )}
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="p-5 sm:p-6 border-b border-slate-100">
                    <h2 className="text-lg font-serif text-[#16233B]">Extracted entries ({knowledgeEntries.length})</h2>
                    <p className="text-xs text-slate-500 mt-1">
                      Structured research entries made available to the report-generation and correlation engine for search and matching.
                    </p>
                  </div>
                    {knowledgeEntries.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full min-w-[880px] text-left">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-100">
                            <th className="py-3 px-4 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Title</th>
                            <th className="py-3 px-4 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Authors</th>
                            <th className="py-3 px-4 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Year</th>
                            <th className="py-3 px-4 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Keywords</th>
                            <th className="py-3 px-4 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Source PDF</th>
                            <th className="py-3 px-4 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Reference</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {knowledgeEntries.map((entry) => (
                            <tr key={entry.id} className="hover:bg-slate-50/50 align-top">
                              <td className="py-3.5 px-4 text-xs font-medium text-[#16233B] max-w-xs">{entry.title}</td>
                              <td className="py-3.5 px-4 text-xs text-slate-500 max-w-xs">
                                {entry.authors && entry.authors.length > 0 ? entry.authors.join(", ") : "—"}
                              </td>
                              <td className="py-3.5 px-4 text-xs text-slate-700">{entry.year ?? "—"}</td>
                              <td className="py-3.5 px-4">
                                <div className="flex flex-wrap gap-1">
                                  {(entry.keywords || []).slice(0, 5).map((k) => (
                                    <span key={k} className="px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-[10px] text-slate-600">{k}</span>
                                  ))}
                                </div>
                              </td>
                              <td className="py-3.5 px-4 text-xs">
                                {entry.sourcePdf ? (
                                  <a
                                    href={`/api/admin/knowledge/source-pdfs/${entry.sourcePdfId}/pdf`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 text-[#16233B] hover:underline"
                                  >
                                    <FileText className="w-3.5 h-3.5" />
                                    {entry.sourcePdf.originalFileName}
                                  </a>
                                ) : (
                                  <span className="text-slate-400">Source removed</span>
                                )}
                              </td>
                              <td className="py-3.5 px-4 text-xs">
                                {entry.url && entry.url.startsWith("http") ? (
                                  <a href={entry.url} target="_blank" rel="noopener noreferrer" className="text-sky-700 underline">
                                    {entry.doi ? "DOI" : "Link"}
                                  </a>
                                ) : (
                                  <span className="text-slate-400">—</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="p-8 text-center text-xs text-slate-500">
                      No structured entries yet. Upload and ingest a source PDF to populate the Knowledge Base.
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {settingsError && (
                  <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                    <span>{settingsError}</span>
                  </div>
                )}
                {settingsMessage && (
                  <div className="flex items-start gap-2.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl px-4 py-3 text-sm">
                    <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
                    <span>{settingsMessage}</span>
                  </div>
                )}

                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#16233B]/5 border border-[#16233B]/10 text-[#16233B] flex items-center justify-center">
                      <Receipt className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-serif text-[#16233B]">Report Fee Configuration</h3>
                      <p className="text-[11px] text-slate-500">Billing</p>
                    </div>
                  </div>
                  <div className="p-5 sm:p-6 space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-[170px_1fr] gap-4 items-end">
                      <div>
                        <label htmlFor="report-fee" className="block text-xs font-semibold text-slate-700 mb-1.5">
                          Report fee (AUD)
                        </label>
                        <input
                          id="report-fee"
                          type="number"
                          min={10}
                          max={500}
                          value={feeInput}
                          onChange={(e) => { setFeeInput(e.target.value); setSettingsMessage(null); setSettingsError(null); }}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-[#16233B] focus:ring-2 focus:ring-[#16233B]/10 outline-none text-sm font-semibold text-[#16233B]"
                        />
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        Base fee charged to practitioners per completed report (branded &quot;reportFeeAUD&quot;
                        in the platform billing settings). Saving here only updates the fee — the retention
                        setting is left untouched.
                      </p>
                    </div>

                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={handleSaveFee}
                        disabled={feeSaving}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#16233B] hover:bg-[#0F172A] disabled:opacity-50 text-white text-xs font-semibold shadow-xs transition-all"
                      >
                        {feeSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Save Report Fee
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#16233B]/5 border border-[#16233B]/10 text-[#16233B] flex items-center justify-center">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-serif text-[#16233B]">Global Report Retention Configuration</h3>
                      <p className="text-[11px] text-slate-500">Retention</p>
                    </div>
                  </div>
                  <div className="p-5 sm:p-6 space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-[170px_1fr] gap-4 items-end">
                      <div>
                        <label htmlFor="report-retention" className="block text-xs font-semibold text-slate-700 mb-1.5">
                          Global report retention (days)
                        </label>
                        <input
                          id="report-retention"
                          type="number"
                          min={1}
                          max={365}
                          value={retentionInput}
                          onChange={(e) => { setRetentionInput(e.target.value); setSettingsMessage(null); setSettingsError(null); }}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-[#16233B] focus:ring-2 focus:ring-[#16233B]/10 outline-none text-sm font-semibold text-[#16233B]"
                        />
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        Default days a completed report may sit un-downloaded before the zero-retention
                        backstop purge deletes it. The value is snapshotted onto each new report at
                        submission; changing it later only affects newly created cases — existing reports
                        keep the retention they were created with. Saving here only updates retention —
                        the report fee is left untouched.
                      </p>
                    </div>

                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={handleSaveRetention}
                        disabled={retentionSaving}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#16233B] hover:bg-[#0F172A] disabled:opacity-50 text-white text-xs font-semibold shadow-xs transition-all"
                      >
                        {retentionSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Save Retention
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#16233B]/5 border border-[#16233B]/10 text-[#16233B] flex items-center justify-center">
                        <Settings className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-base font-serif text-[#16233B]">Current platform configuration</h3>
                        <p className="text-[11px] text-slate-500">Read-only summary of live settings</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={fetchSettings}
                      disabled={settingsLoading}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-slate-300 hover:border-[#16233B] text-[#16233B] text-xs font-semibold transition-all disabled:opacity-50"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${settingsLoading ? "animate-spin" : ""}`} />
                      Refresh
                    </button>
                  </div>
                  <div className="p-5 sm:p-6">
                    {settings ? (
                      <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                          <dt className="text-slate-500 mb-1">Report fee</dt>
                          <dd className="text-sm font-semibold text-[#16233B]">${settings.reportFeeAUD} AUD</dd>
                        </div>
                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                          <dt className="text-slate-500 mb-1">Global report retention</dt>
                          <dd className="text-sm font-semibold text-[#16233B]">{settings.reportRetentionDays} days</dd>
                        </div>
                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                          <dt className="text-slate-500 mb-1">Min reliability threshold</dt>
                          <dd className="text-sm font-semibold text-[#16233B]">{Math.round(settings.minReliabilityThreshold * 100)}%</dd>
                        </div>
                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                          <dt className="text-slate-500 mb-1">Currency</dt>
                          <dd className="text-sm font-semibold text-[#16233B]">{settings.currency}</dd>
                        </div>
                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                          <dt className="text-slate-500 mb-1">Hosting region</dt>
                          <dd className="text-sm font-semibold text-[#16233B]">{settings.hostingRegion}</dd>
                        </div>
                      </dl>
                    ) : settingsLoading ? (
                      <p className="text-xs text-slate-400 text-center py-6">Loading settings…</p>
                    ) : (
                      <p className="text-xs text-slate-400 text-center py-6">Could not load settings.</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>

        <footer className="bg-white border-t border-slate-200 py-4 text-xs text-slate-500">
          <div className="max-w-[1440px] mx-auto w-full px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-16 flex flex-col sm:flex-row items-center justify-between gap-2">
            <span>QEEG.com.au Admin Control Panel · Sydney VPS Hosted</span>
            <span>Australian Infrastructure</span>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default function AdminPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F3F6F8] flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-slate-300 border-t-[#16233B] animate-spin" />
        </div>
      }
    >
      <AdminDashboardContent />
    </Suspense>
  );
}
