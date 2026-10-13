"use client";

import { type MutableRefObject, useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  Ban,
  CheckCircle2,
  Download,
  ExternalLink,
  FileText,
  Folder,
  FolderPlus,
  Loader2,
  Quote,
  RefreshCw,
  RotateCcw,
  Save,
  ShieldCheck,
  SlidersHorizontal,
  Trash2,
  UploadCloud,
  X,
  XCircle,
} from "lucide-react";

interface SourceDoc {
  id: string;
  originalFileName: string;
  fileName: string;
  format: string;
  sizeBytes: number;
  pageCount: number | null;
  status: string;
  error: string | null;
  entryCount: number;
  folderId: string | null;
  folder: { id: string; name: string } | null;
  removedAt: string | null;
  textPath: string | null;
  uploadedAt: string;
}

interface Folder {
  id: string;
  name: string;
  parentId: string | null;
  fileCount: number;
  childCount?: number;
}

interface Entry {
  id: string;
  sourcePdfId: string;
  title: string;
  topicTitle: string | null;
  authors: string[];
  journal: string | null;
  year: number | null;
  abstract: string | null;
  doi: string | null;
  findingSummary: string | null;
  keyUnderlyingCitations: string[];
  relevantDomains: string[];
  relevantQeegPatterns: string[];
  evidenceGrade: string | null;
  notes: string | null;
  attribution: string | null;
  sourceDocument: string | null;
  supportingQuotes: string[];
  quotesVerified: boolean;
  quoteOverrideReason?: string | null;
  quoteOverriddenAt?: string | null;
  quoteOverriddenBy?: string | null;
  status: string;
  reviewedBy: string | null;
  sourcePdf: { id: string; originalFileName: string; status: string } | null;
}

interface ReindexSummary {
  added: number;
  removed: number;
  unchanged: number;
  errors: number;
  scannedDir?: string;
  vocabulary?: { domains: number; qeegPatterns: number };
}

type Tab = "library" | "review" | "tools";

interface ConfirmOptions {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "danger" | "default";
}

const TAB_LABELS: Record<Tab, string> = {
  library: "Folders & Files",
  review: "Review & Approval",
  tools: "System Tools",
};

const STATUS_STYLES: Record<string, string> = {
  draft: "bg-amber-100 text-amber-800 border-amber-200",
  live: "bg-emerald-100 text-emerald-800 border-emerald-200",
  rejected: "bg-rose-100 text-rose-800 border-rose-200",
  inactive: "bg-slate-100 text-slate-600 border-slate-200",
  removed: "bg-slate-200 text-slate-700 border-slate-300",
};

function formatBytes(n: number): string {
  if (!n) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(n) / Math.log(1024));
  return `${(n / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

function docStatus(doc: SourceDoc): string {
  if (doc.removedAt || doc.status === "REMOVED" || doc.status === "RETRACTED") return "removed";
  if (doc.status === "INGESTED") return "live";
  return "draft";
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || "");
      const comma = result.indexOf(",");
      resolve(comma >= 0 ? result.slice(comma + 1) : result);
    };
    reader.onerror = () => reject(new Error("Could not read the selected file."));
    reader.readAsDataURL(file);
  });
}

export default function KnowledgeBasePage() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [booting, setBooting] = useState(true);

  const [tab, setTab] = useState<Tab>("library");
  const [docs, setDocs] = useState<SourceDoc[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [statusFilter, setStatusFilter] = useState("draft");
  const [selected, setSelected] = useState<Entry | null>(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [uploadFolder, setUploadFolder] = useState<string>("root");
  const [folderName, setFolderName] = useState("");
  const [showRemoved, setShowRemoved] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [reindexSummary, setReindexSummary] = useState<ReindexSummary | null>(null);
  const [sourceText, setSourceText] = useState<{ title: string; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // editable drafts keyed by entry id
  const [drafts, setDrafts] = useState<Record<string, Partial<Entry>>>({});

  const flash = useCallback((kind: "ok" | "err", text: string) => setNotice({ kind, text }), []);

  const [confirmState, setConfirmState] = useState<
    (ConfirmOptions & { resolve: (value: boolean) => void }) | null
  >(null);
  const confirm = useCallback(
    (options: ConfirmOptions) =>
      new Promise<boolean>((resolve) => setConfirmState({ ...options, resolve })),
    []
  );

  const loadEntries = useCallback(
    async (status: string) => {
      const res = await fetch(`/api/admin/knowledge/entries?status=${encodeURIComponent(status)}`, {
        credentials: "include",
      });
      if (res.status === 401) {
        router.push("/login");
        return;
      }
      const data = await res.json().catch(() => ({ entries: [] }));
      setEntries(Array.isArray(data.entries) ? data.entries : []);
    },
    [router]
  );

  const loadDocs = useCallback(async () => {
    const res = await fetch("/api/admin/knowledge/source-pdfs", { credentials: "include" });
    if (res.status === 401) {
      router.push("/login");
      return;
    }
    const data = await res.json().catch(() => ({ sourcePdfs: [] }));
    setDocs(Array.isArray(data.sourcePdfs) ? data.sourcePdfs : []);
  }, [router]);

  const loadFolders = useCallback(async () => {
    const res = await fetch("/api/admin/knowledge/folders", { credentials: "include" });
    const data = await res.json().catch(() => ({ folders: [] }));
    setFolders(Array.isArray(data.folders) ? data.folders : []);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/auth/me", { credentials: "include" });
        if (!res.ok) {
          router.push("/login");
          return;
        }
        const data = await res.json().catch(() => ({}));
        const user = data.user || data;
        if (user.role !== "ADMIN" && user.isAdmin !== true) {
          router.push("/portal");
          return;
        }
        setAuthorized(true);
      } catch {
        router.push("/login");
      } finally {
        setBooting(false);
      }
    })();
  }, [router]);

  useEffect(() => {
    if (!authorized) return;
    loadDocs();
    loadFolders();
  }, [authorized, loadDocs, loadFolders]);

  useEffect(() => {
    if (!authorized) return;
    loadEntries(statusFilter);
    setSelected(null);
  }, [authorized, statusFilter, loadEntries]);

  const activeFolderName = uploadFolder === "root"
    ? "Root"
    : folders.find((f) => f.id === uploadFolder)?.name || "Root";

  async function createFolder() {
    if (!folderName.trim()) return;
    setBusy(true);
    try {
      const res = await fetch("/api/admin/knowledge/folders", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: folderName.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Failed to create folder.");
      setFolderName("");
      await loadFolders();
      flash("ok", "Folder created.");
    } catch (e) {
      flash("err", e instanceof Error ? e.message : "Failed to create folder.");
    } finally {
      setBusy(false);
    }
  }

  async function deleteFolder(folder: Folder) {
    const ok = await confirm({
      title: "Delete folder?",
      message:
        folder.fileCount > 0
          ? `"${folder.name}" contains ${folder.fileCount} document(s). They will be moved to the Root folder — no documents are deleted.`
          : `"${folder.name}" is empty. This cannot be undone.`,
      confirmLabel: "Delete folder",
      tone: "danger",
    });
    if (!ok) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/knowledge/folders/${folder.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Failed to delete folder.");
      if (uploadFolder === folder.id) setUploadFolder("root");
      await Promise.all([loadFolders(), loadDocs()]);
      flash("ok", data.message || "Folder removed.");
    } catch (e) {
      flash("err", e instanceof Error ? e.message : "Failed to delete folder.");
    } finally {
      setBusy(false);
    }
  }

  async function handleFiles(files: FileList | File[] | null) {
    const list = files ? Array.from(files) : [];
    if (list.length === 0) return;
    setBusy(true);
    try {
      const payload = await Promise.all(
        list.map(async (file) => ({
          fileName: file.name,
          contentType: file.type,
          base64: await fileToBase64(file),
        }))
      );
      const res = await fetch("/api/admin/knowledge/source-pdfs", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          files: payload,
          folderId: uploadFolder === "root" ? null : uploadFolder,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok && !Array.isArray(data.results)) {
        throw new Error(data.error || "Upload failed.");
      }
      const results: { ok: boolean; error?: string }[] = Array.isArray(data.results) ? data.results : [];
      const okCount = results.filter((r) => r.ok).length;
      const failed = results.filter((r) => !r.ok);
      await Promise.all([loadDocs(), loadFolders(), loadEntries(statusFilter)]);
      if (failed.length === 0) {
        flash("ok", `Uploaded and ingested ${okCount} file(s) into “${activeFolderName}”.`);
      } else {
        flash(
          "err",
          `${okCount} file(s) uploaded; ${failed.length} failed — first error: ${failed[0]?.error || "unknown"}.`
        );
      }
    } catch (e) {
      flash("err", e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setBusy(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function reIngestDoc(id: string) {
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/knowledge/source-pdfs/${id}/ingest`, {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Re-ingestion failed.");
      await Promise.all([loadDocs(), loadEntries(statusFilter)]);
      flash("ok", `Re-ingested — ${data.ingested ?? 0} entr${data.ingested === 1 ? "y" : "ies"}.`);
    } catch (e) {
      flash("err", e instanceof Error ? e.message : "Re-ingestion failed.");
    } finally {
      setBusy(false);
    }
  }

  async function retractDoc(doc: SourceDoc) {
    const ok = await confirm({
      title: "Retract document?",
      message: `"${doc.originalFileName}" has ${doc.entryCount} entr${
        doc.entryCount === 1 ? "y" : "ies"
      }. They will go inactive and stop influencing reports. The document is kept in the Removed store and can be restored later.`,
      confirmLabel: "Retract",
      tone: "danger",
    });
    if (!ok) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/knowledge/source-pdfs/${doc.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Failed to retract document.");
      await Promise.all([loadDocs(), loadEntries(statusFilter)]);
      flash("ok", "Document retracted. It can be restored from the Removed list.");
    } catch (e) {
      flash("err", e instanceof Error ? e.message : "Failed to retract document.");
    } finally {
      setBusy(false);
    }
  }

  async function restoreDoc(doc: SourceDoc) {
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/knowledge/source-pdfs/${doc.id}/restore`, {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Failed to restore document.");
      await Promise.all([loadDocs(), loadEntries(statusFilter)]);
      flash("ok", `Restored — ${data.ingested ?? 0} entr${data.ingested === 1 ? "y" : "ies"} returned to review.`);
    } catch (e) {
      flash("err", e instanceof Error ? e.message : "Failed to restore document.");
    } finally {
      setBusy(false);
    }
  }

  async function viewSourceText(entry: Entry) {
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/knowledge/source-pdfs/${entry.sourcePdfId}/content`, {
        credentials: "include",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Failed to load extracted text.");
      const src = data.source || data.sourcePdf || {};
      setSourceText({
        title: src.originalFileName || entry.sourcePdf?.originalFileName || entry.title,
        text: src.extractedText || "(No extracted text cached for this document.)",
      });
    } catch (e) {
      flash("err", e instanceof Error ? e.message : "Failed to load extracted text.");
    } finally {
      setBusy(false);
    }
  }

  async function approve(entry: Entry, overrideReason?: string) {
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/knowledge/entries/${entry.id}/approve`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(overrideReason ? { overrideReason } : {}),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Failed to approve entry.");
      await loadEntries(statusFilter);
      flash(
        "ok",
        overrideReason
          ? "Entry approved with a recorded quote-check override."
          : "Entry approved and now live."
      );
    } catch (e) {
      flash("err", e instanceof Error ? e.message : "Failed to approve entry.");
    } finally {
      setBusy(false);
    }
  }

  async function reject(entry: Entry) {
    const ok = await confirm({
      title: "Reject entry?",
      message: `"${entry.title}" will be marked rejected and will not be used to ground reports. You can re-review it later from the Rejected filter.`,
      confirmLabel: "Reject entry",
      tone: "danger",
    });
    if (!ok) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/knowledge/entries/${entry.id}/reject`, {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Failed to reject entry.");
      await loadEntries(statusFilter);
      flash("ok", "Entry rejected.");
    } catch (e) {
      flash("err", e instanceof Error ? e.message : "Failed to reject entry.");
    } finally {
      setBusy(false);
    }
  }

  async function bulkApprove() {
    setBusy(true);
    try {
      const res = await fetch("/api/admin/knowledge/entries/bulk-approve", {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Bulk approval failed.");
      await loadEntries(statusFilter);
      flash("ok", data.message || "Bulk approval complete.");
    } catch (e) {
      flash("err", e instanceof Error ? e.message : "Bulk approval failed.");
    } finally {
      setBusy(false);
    }
  }

  async function saveEntry(entry: Entry) {
    const patch = drafts[entry.id];
    if (!patch) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/knowledge/entries/${entry.id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Failed to save entry.");
      setDrafts((prev) => {
        const next = { ...prev };
        delete next[entry.id];
        return next;
      });
      await loadEntries(statusFilter);
      setSelected(data.entry || null);
      flash("ok", "Entry saved. Quote verification refreshed.");
    } catch (e) {
      flash("err", e instanceof Error ? e.message : "Failed to save entry.");
    } finally {
      setBusy(false);
    }
  }

  async function exportJson() {
    setBusy(true);
    try {
      const res = await fetch("/api/admin/knowledge/export", { credentials: "include" });
      if (!res.ok) throw new Error("Export failed.");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `knowledge-base-export-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      flash("ok", "Export downloaded.");
    } catch (e) {
      flash("err", e instanceof Error ? e.message : "Export failed.");
    } finally {
      setBusy(false);
    }
  }

  async function reindex() {
    setBusy(true);
    try {
      const res = await fetch("/api/admin/knowledge/reindex", {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Re-index failed.");
      await Promise.all([loadDocs(), loadFolders(), loadEntries(statusFilter)]);
      const summary: ReindexSummary = data.summary || {};
      setReindexSummary(summary);
      flash("ok", data.message || "Re-index complete.");
    } catch (e) {
      flash("err", e instanceof Error ? e.message : "Re-index failed.");
    } finally {
      setBusy(false);
    }
  }

  function editField(entry: Entry, field: keyof Entry, value: unknown) {
    setDrafts((prev) => ({ ...prev, [entry.id]: { ...prev[entry.id], [field]: value } }));
  }

  function draftValue<T>(entry: Entry, field: keyof Entry): T {
    const d = drafts[entry.id];
    if (d && field in d) return d[field] as T;
    return entry[field] as unknown as T;
  }

  if (booting) {
    return (
      <div className="min-h-screen bg-[#F3F6F8] flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-[#16233B]" />
      </div>
    );
  }

  if (!authorized) return null;

  return (
    <div className="min-h-screen bg-[#F3F6F8] pb-16">
      <header className="bg-[#16233B] text-white px-4 sm:px-6 py-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => router.push("/admin")}
            className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-[#223554] shrink-0"
            aria-label="Back to admin"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl font-serif tracking-tight">Knowledge Base</h1>
            <p className="text-xs text-slate-400 truncate">
              Folders, review &amp; approval, and re-index tools.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={exportJson}
            disabled={busy}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#223554] hover:bg-[#2b4166] text-xs font-medium disabled:opacity-50"
          >
            <Download className="w-4 h-4" /> <span className="hidden sm:inline">Download JSON</span>
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        {notice && (
          <div
            role="status"
            className={`mb-4 flex items-center gap-2 rounded-xl border px-4 py-3 text-sm ${
              notice.kind === "ok"
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : "bg-rose-50 border-rose-200 text-rose-800"
            }`}
          >
            {notice.kind === "ok" ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span className="flex-1 min-w-0 break-words">{notice.text}</span>
            <button onClick={() => setNotice(null)} className="text-xs opacity-70 hover:opacity-100 shrink-0">
              dismiss
            </button>
          </div>
        )}

        <div className="flex flex-wrap gap-1 mb-5 bg-white rounded-xl p-1 border border-slate-200 w-fit">
          {(Object.keys(TAB_LABELS) as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                tab === t ? "bg-[#223554] text-white" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {TAB_LABELS[t]}
            </button>
          ))}
        </div>

        {tab === "library" && (
          <LibraryTab
            docs={docs}
            folders={folders}
            uploadFolder={uploadFolder}
            setUploadFolder={setUploadFolder}
            activeFolderName={activeFolderName}
            folderName={folderName}
            setFolderName={setFolderName}
            onCreateFolder={createFolder}
            onDeleteFolder={deleteFolder}
            onPickFiles={() => fileInputRef.current?.click()}
            onFiles={handleFiles}
            fileInputRef={fileInputRef}
            onReIngest={reIngestDoc}
            onRetract={retractDoc}
            onRestore={restoreDoc}
            showRemoved={showRemoved}
            setShowRemoved={setShowRemoved}
            dragActive={dragActive}
            setDragActive={setDragActive}
            busy={busy}
          />
        )}

        {tab === "review" && (
          <ReviewTab
            entries={entries}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            selected={selected}
            setSelected={setSelected}
            drafts={drafts}
            editField={editField}
            draftValue={draftValue}
            onApprove={approve}
            onReject={reject}
            onSave={saveEntry}
            onBulkApprove={bulkApprove}
            onViewSource={viewSourceText}
            busy={busy}
          />
        )}

        {tab === "tools" && (
          <ToolsTab
            onExport={exportJson}
            onReindex={reindex}
            summary={reindexSummary}
            busy={busy}
          />
        )}
      </main>

      {sourceText && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          onClick={() => setSourceText(null)}
        >
          <div
            className="bg-white rounded-xl max-w-3xl w-full max-h-[80vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-5 py-3">
              <div className="min-w-0">
                <h3 className="font-semibold text-slate-800 truncate">Extracted source text</h3>
                <p className="text-xs text-slate-500 truncate">{sourceText.title}</p>
              </div>
              <button
                onClick={() => setSourceText(null)}
                className="p-2 rounded-lg text-slate-500 hover:bg-slate-100"
                aria-label="Close"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <pre className="flex-1 overflow-auto px-5 py-4 text-xs text-slate-700 whitespace-pre-wrap break-words font-mono">
              {sourceText.text}
            </pre>
          </div>
        </div>
      )}

      {confirmState && (
        <ConfirmDialog
          options={confirmState}
          onResolve={(value) => {
            confirmState.resolve(value);
            setConfirmState(null);
          }}
        />
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
        STATUS_STYLES[status] || STATUS_STYLES.inactive
      }`}
    >
      {status}
    </span>
  );
}

function ConfirmDialog({
  options,
  onResolve,
}: {
  options: ConfirmOptions;
  onResolve: (value: boolean) => void;
}) {
  const danger = options.tone !== "default";

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onResolve(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onResolve]);

  return (
    <div
      className="fixed inset-0 z-[60] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      onClick={() => onResolve(false)}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 pt-5 pb-4 flex items-start gap-3">
          <span
            className={`p-2 rounded-full shrink-0 ${
              danger ? "bg-rose-100 text-rose-600" : "bg-slate-100 text-[#223554]"
            }`}
          >
            <AlertTriangle className="w-5 h-5" />
          </span>
          <div className="min-w-0">
            <h3 className="font-semibold text-slate-800">{options.title}</h3>
            <p className="text-sm text-slate-600 mt-1 whitespace-pre-line break-words">
              {options.message}
            </p>
          </div>
        </div>
        <div className="px-5 py-3 bg-slate-50 flex flex-wrap justify-end gap-2">
          <button
            type="button"
            onClick={() => onResolve(false)}
            className="px-4 py-2 rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            {options.cancelLabel || "Cancel"}
          </button>
          <button
            type="button"
            autoFocus
            onClick={() => onResolve(true)}
            className={`px-4 py-2 rounded-lg text-sm font-medium text-white shadow-sm ${
              danger ? "bg-rose-600 hover:bg-rose-700" : "bg-[#223554] hover:bg-[#2b4166]"
            }`}
          >
            {options.confirmLabel || "Confirm"}
          </button>
        </div>
      </div>
    </div>
  );
}

interface LibraryTabProps {
  docs: SourceDoc[];
  folders: Folder[];
  uploadFolder: string;
  setUploadFolder: (v: string) => void;
  activeFolderName: string;
  folderName: string;
  setFolderName: (v: string) => void;
  onCreateFolder: () => void;
  onDeleteFolder: (folder: Folder) => void;
  onPickFiles: () => void;
  onFiles: (files: FileList | File[]) => void;
  fileInputRef: MutableRefObject<HTMLInputElement | null>;
  onReIngest: (id: string) => void;
  onRetract: (doc: SourceDoc) => void;
  onRestore: (doc: SourceDoc) => void;
  showRemoved: boolean;
  setShowRemoved: (v: boolean) => void;
  dragActive: boolean;
  setDragActive: (v: boolean) => void;
  busy: boolean;
}

function LibraryTab(props: LibraryTabProps) {
  const {
    docs,
    folders,
    uploadFolder,
    setUploadFolder,
    activeFolderName,
    folderName,
    setFolderName,
    onCreateFolder,
    onDeleteFolder,
    onPickFiles,
    onFiles,
    fileInputRef,
    onReIngest,
    onRetract,
    onRestore,
    showRemoved,
    setShowRemoved,
    dragActive,
    setDragActive,
    busy,
  } = props;

  const isRootSelected = uploadFolder === "root";
  const rootFileCount = docs.filter((d) => !d.folderId).length;
  const visibleDocs = docs.filter((d) => {
    if (!showRemoved && d.removedAt) return false;
    return isRootSelected ? !d.folderId : d.folderId === uploadFolder;
  });
  const totalInView = docs.filter((d) => (showRemoved ? true : !d.removedAt)).length;
  const selectedFolderName = isRootSelected
    ? "Root"
    : folders.find((f) => f.id === uploadFolder)?.name || "Root";

  return (
    <div className="space-y-5">
      <div className="bg-white border border-slate-200 rounded-xl p-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <span className="text-xs font-semibold text-slate-600 uppercase">Active folder</span>
            <select
              value={uploadFolder}
              onChange={(e) => setUploadFolder(e.target.value)}
              className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm"
            >
              <option value="root">Root</option>
              {folders.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name} ({f.fileCount})
                </option>
              ))}
            </select>
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-600 uppercase">New folder</span>
            <div className="mt-1 flex gap-2">
              <input
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                placeholder="Category name"
                className="flex-1 min-w-0 px-3 py-2 rounded-lg border border-slate-200 text-sm"
              />
              <button
                onClick={onCreateFolder}
                disabled={busy || !folderName.trim()}
                className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                <FolderPlus className="w-4 h-4" /> Create New Folder
              </button>
            </div>
          </div>
        </div>

        <div className="mt-4 rounded-lg bg-[#223554] text-white px-4 py-3 flex items-center gap-2">
          <FolderPlus className="w-4 h-4 shrink-0" />
          <span className="text-sm truncate">
            Currently uploading to: <strong className="font-semibold">{activeFolderName}</strong>
          </span>
        </div>

        <div
          onDragOver={(e) => {
            e.preventDefault();
            if (!dragActive) setDragActive(true);
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            setDragActive(false);
          }}
          onDrop={(e) => {
            e.preventDefault();
            setDragActive(false);
            if (e.dataTransfer?.files?.length) onFiles(e.dataTransfer.files);
          }}
          onClick={onPickFiles}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") onPickFiles();
          }}
          className={`mt-4 rounded-xl border-2 border-dashed px-6 py-8 text-center cursor-pointer transition-colors ${
            dragActive ? "border-[#223554] bg-slate-50" : "border-slate-300 hover:border-slate-400"
          }`}
        >
          <UploadCloud className="w-7 h-7 mx-auto text-slate-400" />
          <p className="mt-2 text-sm font-medium text-slate-700">
            Drag &amp; drop files here, or click to browse
          </p>
          <p className="text-xs text-slate-400 mt-1">
            PDF, DOC/DOCX, TXT, MD, CSV — multiple files supported
          </p>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.docx,.doc,.txt,.md,.markdown,.csv"
            className="hidden"
            onChange={(e) => e.target.files && onFiles(e.target.files)}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-5">
        <div className="flex items-center justify-between gap-3 mb-3">
          <h3 className="font-semibold text-slate-800 text-sm">
            Folder management{" "}
            <span className="text-slate-400 font-normal">({folders.length + 1})</span>
          </h3>
          <p className="text-xs text-slate-500">
            Click a folder to open it; use the bin to delete.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <div
            role="button"
            tabIndex={0}
            onClick={() => setUploadFolder("root")}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") setUploadFolder("root");
            }}
            className={`rounded-xl border p-3 cursor-pointer transition-colors ${
              isRootSelected
                ? "border-[#223554] bg-[#223554]/5 ring-1 ring-[#223554]"
                : "border-slate-200 hover:border-slate-300"
            }`}
          >
            <div className="flex items-start gap-2 min-w-0">
              <Folder className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-800 truncate">Root</p>
                <p className="text-xs text-slate-500">
                  {rootFileCount} file{rootFileCount === 1 ? "" : "s"}
                </p>
              </div>
            </div>
          </div>

          {folders.map((f) => {
            const selected = uploadFolder === f.id;
            return (
              <div
                key={f.id}
                role="button"
                tabIndex={0}
                onClick={() => setUploadFolder(f.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") setUploadFolder(f.id);
                }}
                className={`rounded-xl border p-3 cursor-pointer transition-colors ${
                  selected
                    ? "border-[#223554] bg-[#223554]/5 ring-1 ring-[#223554]"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2 min-w-0">
                    <Folder className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate" title={f.name}>
                        {f.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {f.fileCount} file{f.fileCount === 1 ? "" : "s"}
                        {f.childCount
                          ? ` · ${f.childCount} subfolder${f.childCount === 1 ? "" : "s"}`
                          : ""}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteFolder(f);
                    }}
                    disabled={busy}
                    title={`Delete "${f.name}"`}
                    aria-label={`Delete folder ${f.name}`}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 shrink-0 disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-slate-100">
          <h3 className="font-semibold text-slate-800 text-sm">
            Documents in <span className="text-[#223554]">{selectedFolderName}</span>{" "}
            <span className="text-slate-400 font-normal">
              ({visibleDocs.length}
              {visibleDocs.length !== totalInView ? ` of ${totalInView}` : ""})
            </span>
          </h3>
          <label className="flex items-center gap-2 text-xs text-slate-600">
            <input
              type="checkbox"
              checked={showRemoved}
              onChange={(e) => setShowRemoved(e.target.checked)}
            />
            Show removed
          </label>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[640px]">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Document</th>
                <th className="px-4 py-3">Folder</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Entries</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {visibleDocs.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                    No documents{showRemoved ? "" : " uploaded yet"}.
                  </td>
                </tr>
              )}
              {visibleDocs.map((doc) => {
                const removed = Boolean(doc.removedAt);
                return (
                  <tr key={doc.id} className="border-t border-slate-100 align-top">
                    <td className="px-4 py-3 max-w-[320px]">
                      <div className="flex items-start gap-2">
                        <FileText className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                        <div className="min-w-0">
                          <p className="font-medium text-slate-800 break-words">{doc.originalFileName}</p>
                          <p className="text-xs text-slate-400">
                            {doc.format} · {formatBytes(doc.sizeBytes)}
                          </p>
                          {doc.error && <p className="text-xs text-rose-600 mt-1 break-words">{doc.error}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{doc.folder?.name || "Root"}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={docStatus(doc)} />
                    </td>
                    <td className="px-4 py-3 text-slate-600">{doc.entryCount}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        {!removed && (
                          <button
                            onClick={() => onReIngest(doc.id)}
                            disabled={busy}
                            title="Re-ingest"
                            className="p-2 rounded-lg text-slate-500 hover:text-[#223554] hover:bg-slate-100 disabled:opacity-50"
                          >
                            <RefreshCw className="w-4 h-4" />
                          </button>
                        )}
                        {removed ? (
                          <button
                            onClick={() => onRestore(doc)}
                            disabled={busy}
                            title="Restore"
                            className="p-2 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 disabled:opacity-50"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => onRetract(doc)}
                            disabled={busy}
                            title="Retract"
                            className="p-2 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 disabled:opacity-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

interface ReviewTabProps {
  entries: Entry[];
  statusFilter: string;
  setStatusFilter: (s: string) => void;
  selected: Entry | null;
  setSelected: (e: Entry | null) => void;
  drafts: Record<string, Partial<Entry>>;
  editField: (entry: Entry, field: keyof Entry, value: unknown) => void;
  draftValue: <T>(entry: Entry, field: keyof Entry) => T;
  onApprove: (e: Entry, overrideReason?: string) => void;
  onReject: (e: Entry) => void;
  onSave: (e: Entry) => void;
  onBulkApprove: () => void;
  onViewSource: (e: Entry) => void;
  busy: boolean;
}

function ReviewTab(props: ReviewTabProps) {
  const { entries, statusFilter, setStatusFilter, selected, setSelected, busy } = props;
  const unverified = entries.filter((e) => !e.quotesVerified).length;

  const filters: { value: string; label: string }[] = [
    { value: "draft", label: "Draft" },
    { value: "live", label: "Live" },
    { value: "rejected", label: "Rejected" },
    { value: "inactive", label: "Inactive" },
  ];

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
      <aside className="xl:col-span-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-3 shadow-sm">
          <div className="inline-flex w-full rounded-xl bg-slate-100 p-1 mb-3">
            {filters.map((f) => (
              <button
                key={f.value}
                onClick={() => setStatusFilter(f.value)}
                className={`flex-1 px-2 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  statusFilter === f.value
                    ? "bg-white text-[#223554] shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <button
            onClick={props.onBulkApprove}
            disabled={busy || statusFilter !== "draft"}
            title="Approves every draft whose quotes are verified; unverified drafts are skipped"
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold disabled:opacity-50 mb-3"
          >
            <ShieldCheck className="w-4 h-4" /> Approve all verified
          </button>

          {unverified > 0 && statusFilter === "draft" && (
            <p className="flex items-start gap-2 text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 mb-3">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                {unverified} draft{unverified === 1 ? "" : "s"} have <strong>unverified quotes</strong>{" "}
                and will not be bulk-approved — open and fix them manually.
              </span>
            </p>
          )}

          <div className="space-y-2 max-h-[68vh] overflow-y-auto pr-1">
            {entries.length === 0 && (
              <p className="text-sm text-slate-500 bg-slate-50 border border-dashed border-slate-200 rounded-xl px-4 py-8 text-center">
                No entries with status &ldquo;{statusFilter}&rdquo;.
              </p>
            )}
            {entries.map((entry) => {
              const active = selected?.id === entry.id;
              return (
                <button
                  key={entry.id}
                  onClick={() => setSelected(entry)}
                  className={`w-full text-left rounded-xl border px-3.5 py-3 transition-all ${
                    active
                      ? "border-[#223554] bg-[#223554]/5 shadow-sm"
                      : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <StatusBadge status={entry.status} />
                    {entry.quotesVerified ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700">
                        <CheckCircle2 className="w-3.5 h-3.5" /> verified
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700">
                        <XCircle className="w-3.5 h-3.5" /> unverified
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-medium text-slate-800 break-words leading-snug">
                    {entry.title}
                  </p>
                  <p className="text-xs text-slate-400 mt-1.5 truncate">
                    {entry.sourcePdf?.originalFileName || entry.sourceDocument || "—"}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </aside>

      <section className="xl:col-span-8">
        {!selected ? (
          <div className="bg-white border border-dashed border-slate-300 rounded-2xl px-6 py-16 text-center">
            <SlidersHorizontal className="w-8 h-8 mx-auto text-slate-300" />
            <p className="mt-3 text-sm font-medium text-slate-600">Select an entry to review</p>
            <p className="text-xs text-slate-400 mt-1">
              Its extracted details and verbatim supporting quotes appear side-by-side here.
            </p>
          </div>
        ) : (
          <EntryDetail {...props} entry={selected} />
        )}
      </section>
    </div>
  );
}

function EntryDetail(props: ReviewTabProps & { entry: Entry }) {
  const { entry, drafts, editField, draftValue, onApprove, onReject, onSave, onViewSource, busy } = props;
  const dirty = Boolean(drafts[entry.id]);
  const [overrideReason, setOverrideReason] = useState("");

  const textField = (label: string, field: keyof Entry, rows = 3, placeholder = "") => {
    const value = String(draftValue<string | null>(entry, field) ?? "");
    return (
      <label className="block min-w-0">
        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
          {label}
        </span>
        <textarea
          value={value}
          placeholder={placeholder}
          rows={rows}
          onChange={(e) => editField(entry, field, e.target.value)}
          className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 transition focus:outline-none focus:border-[#223554] focus:ring-2 focus:ring-[#223554]/15"
        />
      </label>
    );
  };

  const arrayField = (label: string, field: keyof Entry, placeholder = "") => {
    const raw = draftValue<string[] | null>(entry, field);
    const value = Array.isArray(raw) ? raw.join("\n") : "";
    return (
      <label className="block min-w-0">
        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
          {label}
        </span>
        <textarea
          value={value}
          placeholder={placeholder}
          rows={3}
          onChange={(e) =>
            editField(
              entry,
              field,
              e.target.value
                .split("\n")
                .map((s) => s.trim())
                .filter(Boolean)
            )
          }
          className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-mono text-slate-800 transition focus:outline-none focus:border-[#223554] focus:ring-2 focus:ring-[#223554]/15"
        />
        <span className="text-[11px] text-slate-400">One item per line.</span>
      </label>
    );
  };

  const quotes = draftValue<string[] | null>(entry, "supportingQuotes");
  const quoteList = Array.isArray(quotes) ? quotes.filter(Boolean) : [];

  return (
    <div className="space-y-5">
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <StatusBadge status={entry.status} />
              {entry.quotesVerified ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2 py-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5" /> quotes verified
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded-full px-2 py-0.5">
                  <AlertTriangle className="w-3.5 h-3.5" /> quotes unverified
                </span>
              )}
              {entry.quoteOverrideReason && (
                <span
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5"
                  title={`Override by ${entry.quoteOverriddenBy ?? "admin"}: ${entry.quoteOverrideReason}`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" /> quote override
                </span>
              )}
            </div>
            <h2 className="text-lg sm:text-xl font-semibold text-slate-800 break-words leading-snug">
              {entry.title}
            </h2>
            <p className="text-xs text-slate-500 break-words mt-1">
              {entry.authors?.join(", ") || "Unknown authors"}
              {entry.year ? ` · ${entry.year}` : ""}
              {entry.journal ? ` · ${entry.journal}` : ""}
            </p>
            {entry.doi && (
              <p className="text-xs text-slate-400 mt-0.5 break-words">DOI: {entry.doi}</p>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2 lg:justify-end shrink-0">
            <button
              onClick={() => onViewSource(entry)}
              disabled={busy}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 px-3.5 py-2 text-xs font-semibold transition disabled:opacity-50"
            >
              <FileText className="w-3.5 h-3.5" /> View extracted text
            </button>
            {entry.sourcePdf && (
              <a
                href={`/api/admin/knowledge/source-pdfs/${entry.sourcePdfId}/pdf`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-[#223554] hover:bg-[#2b4166] text-white px-3.5 py-2 text-xs font-semibold transition"
              >
                <ExternalLink className="w-3.5 h-3.5" /> Open source document
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <span className="p-1.5 rounded-lg bg-slate-100 text-[#223554]">
              <SlidersHorizontal className="w-4 h-4" />
            </span>
            <h3 className="text-sm font-semibold text-slate-800">Extracted entry details</h3>
          </div>
          <div className="space-y-3">
            {textField("Topic title", "topicTitle", 1)}
            {textField("Finding summary", "findingSummary", 5)}
            {arrayField("Relevant domains", "relevantDomains", "Medical\nPsychological")}
            {arrayField("QEEG patterns", "relevantQeegPatterns", "elevated theta\nfrontal theta-beta")}
            {textField("Evidence grade", "evidenceGrade", 1)}
            {textField("Attribution", "attribution", 2)}
            {textField("Notes", "notes", 3)}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between gap-2 mb-4">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-slate-100 text-[#223554]">
                <Quote className="w-4 h-4" />
              </span>
              <h3 className="text-sm font-semibold text-slate-800">Verbatim supporting quotes</h3>
            </div>
            {quoteList.length > 0 && (
              <span className="text-[11px] font-medium text-slate-400">
                {quoteList.length} quote{quoteList.length === 1 ? "" : "s"}
              </span>
            )}
          </div>

          {quoteList.length === 0 ? (
            <p className="flex items-start gap-2 text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-xl px-3 py-3">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                No supporting quotes yet. Add exact sentences from the source document — approval is
                blocked until they verify.
              </span>
            </p>
          ) : (
            <ul className="space-y-2.5">
              {quoteList.map((q, i) => (
                <li
                  key={i}
                  className="flex gap-3 rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-3"
                >
                  <span className="shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-white border border-slate-200 text-[11px] font-semibold text-slate-500">
                    {i + 1}
                  </span>
                  <p className="text-sm text-slate-700 leading-relaxed break-words">
                    <span className="text-slate-400">&ldquo;</span>
                    {q}
                    <span className="text-slate-400">&rdquo;</span>
                  </p>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-4">
            {arrayField(
              "Edit quotes (verbatim)",
              "supportingQuotes",
              "Paste exact sentences from the source."
            )}
          </div>
        </div>
      </div>

      {!entry.quotesVerified && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 shadow-sm space-y-2.5">
          <p className="flex items-start gap-2 text-xs font-medium text-amber-900">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>
              Quotes are <strong>unverified</strong>, so approval is blocked by default. To accept the
              entry anyway, record a reason below — the override is logged and stored against the
              entry.
            </span>
          </p>
          {entry.quoteOverrideReason && (
            <p className="text-[11px] text-amber-800 bg-white border border-amber-200 rounded-lg px-3 py-2">
              Previously overridden by {entry.quoteOverriddenBy ?? "admin"}: &ldquo;
              {entry.quoteOverrideReason}&rdquo;
            </p>
          )}
          <textarea
            value={overrideReason}
            onChange={(e) => setOverrideReason(e.target.value)}
            rows={2}
            placeholder="Reason for overriding the failed verbatim quote check…"
            className="w-full rounded-xl border border-amber-200 bg-white px-3 py-2 text-sm text-slate-800 transition focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-300/30"
          />
          <button
            onClick={() => onApprove(entry, overrideReason.trim())}
            disabled={busy || overrideReason.trim().length < 5}
            title={overrideReason.trim().length < 5 ? "Enter a reason (at least 5 characters) to override" : ""}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold disabled:opacity-50"
          >
            <ShieldCheck className="w-4 h-4" /> Override &amp; make live
          </button>
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-wrap items-center gap-2.5">
        <button
          onClick={() => onSave(entry)}
          disabled={busy || !dirty}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#223554] hover:bg-[#2b4166] text-white text-xs font-semibold disabled:opacity-50"
        >
          <Save className="w-4 h-4" /> {dirty ? "Save changes" : "Saved"}
        </button>
        {entry.quotesVerified && (
          <button
            onClick={() => onApprove(entry)}
            disabled={busy}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold disabled:opacity-50"
          >
            <CheckCircle2 className="w-4 h-4" /> Approve / make live
          </button>
        )}
        <button
          onClick={() => onReject(entry)}
          disabled={busy}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold disabled:opacity-50"
        >
          <Ban className="w-4 h-4" /> Reject
        </button>
        {dirty && (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-700">
            <AlertCircle className="w-3.5 h-3.5" /> Unsaved changes
          </span>
        )}
        {entry.reviewedBy && (
          <span className="text-[11px] text-slate-400 ml-auto">reviewed by {entry.reviewedBy}</span>
        )}
      </div>
    </div>
  );
}

function ToolsTab({
  onExport,
  onReindex,
  summary,
  busy,
}: {
  onExport: () => void;
  onReindex: () => void;
  summary: ReindexSummary | null;
  busy: boolean;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      <div className="bg-white border border-slate-200 rounded-xl p-5">
        <h3 className="font-semibold text-slate-800 mb-1">Re-index documents</h3>
        <p className="text-sm text-slate-500 mb-4">
          Re-scan the managed server-side knowledge-base store, ingest new files, and flag removed
          files. Returns a summary of new / removed / unchanged / errored documents.
        </p>
        <button
          onClick={onReindex}
          disabled={busy}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#223554] hover:bg-[#2b4166] text-white text-sm font-medium disabled:opacity-50"
        >
          <RefreshCw className="w-4 h-4" /> Run re-index
        </button>

        {summary && (
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Metric label="New" value={summary.added} tone="emerald" />
            <Metric label="Removed" value={summary.removed} tone="rose" />
            <Metric label="Unchanged" value={summary.unchanged} tone="slate" />
            <Metric label="Errors" value={summary.errors} tone="amber" />
          </div>
        )}
      </div>
      <div className="bg-white border border-slate-200 rounded-xl p-5">
        <h3 className="font-semibold text-slate-800 mb-1">Export approved knowledge base</h3>
        <p className="text-sm text-slate-500 mb-4">
          Download every approved (live) literature entry as a portable JSON document.
        </p>
        <button
          onClick={onExport}
          disabled={busy}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#223554] hover:bg-[#2b4166] text-white text-sm font-medium disabled:opacity-50"
        >
          <Download className="w-4 h-4" /> Download JSON
        </button>
      </div>
    </div>
  );
}

function Metric({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "emerald" | "rose" | "slate" | "amber";
}) {
  const tones: Record<string, string> = {
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-200",
    rose: "bg-rose-50 text-rose-700 border-rose-200",
    slate: "bg-slate-50 text-slate-700 border-slate-200",
    amber: "bg-amber-50 text-amber-700 border-amber-200",
  };
  return (
    <div className={`rounded-lg border px-3 py-2 text-center ${tones[tone]}`}>
      <p className="text-lg font-semibold leading-none">{value}</p>
      <p className="text-[11px] uppercase tracking-wide mt-1">{label}</p>
    </div>
  );
}
