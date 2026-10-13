"use client";

import { useCallback, useEffect, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  ClipboardList,
  Clock,
  Loader2,
  Plus,
  RefreshCw,
  RotateCcw,
  Save,
  Sparkles,
  Trash2,
  Trash,
  ArrowUp,
  ArrowDown,
  Lock,
  Zap,
} from "lucide-react";

type FieldType = "text" | "textarea" | "checkbox" | "date" | "select";
type SectionKind = "fields" | "domains" | "static";

const FIELD_TYPES: FieldType[] = ["text", "textarea", "checkbox", "date", "select"];
const SECTION_KINDS: SectionKind[] = ["fields", "domains", "static"];
const LIKERT_KEYS = ["0", "1", "2", "3", "4"];

interface Domain {
  num: number;
  key: string;
  page: number;
  title: string;
  desc: string;
}

interface FieldOption {
  value: string;
  label: string;
}

interface Field {
  key: string;
  label: string;
  type: FieldType;
  required?: boolean;
  readonly?: boolean;
  locked?: boolean;
  source?: string;
  placeholder?: string;
  detail?: string;
  options?: FieldOption[];
}

interface Section {
  key: string;
  title: string;
  kind?: SectionKind;
  readonly?: boolean;
  locked?: boolean;
  required?: boolean;
  insight?: string;
  domainPage?: number;
  lines?: string[];
  fields?: Field[];
}

interface Definition {
  version: number;
  description?: string;
  likert: Record<string, string>;
  domains: Domain[];
  sections?: Section[];
}

interface Outline {
  id: string;
  version: number;
  status: "DRAFT" | "PUBLISHED";
  isActive: boolean;
  description: string | null;
  createdByUserId: string | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

interface SchemaResponse {
  active: Outline | null;
  activeDefinition: Definition;
  versions: Outline[];
}

function deepClone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function numOr(value: string, fallback: number): number {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function parseOptions(text: string): FieldOption[] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((line) => {
      const idx = line.indexOf("=");
      if (idx === -1) return { value: line, label: line };
      const value = line.slice(0, idx).trim();
      const label = line.slice(idx + 1).trim();
      return { value: value || label, label: label || value };
    });
}

function formatOptions(options?: FieldOption[]): string {
  if (!options) return "";
  return options.map((o) => `${o.value} = ${o.label}`).join("\n");
}

export default function ChecklistFormBuilder() {
  const [active, setActive] = useState<Outline | null>(null);
  const [versions, setVersions] = useState<Outline[]>([]);
  const [definition, setDefinition] = useState<Definition | null>(null);
  const [description, setDescription] = useState("");
  const [draftId, setDraftId] = useState<string | null>(null);
  const [draftVersion, setDraftVersion] = useState<number | null>(null);

  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/checklist-schema", { credentials: "include" });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: unknown };
        throw new Error(typeof data.error === "string" ? data.error : "Failed to load checklist schema.");
      }
      const data = (await res.json()) as SchemaResponse;
      setActive(data.active ?? null);
      setVersions(data.versions ?? []);
      setDefinition(deepClone(data.activeDefinition));
      setDescription(data.activeDefinition.description ?? data.active?.description ?? "");
      setDraftId(null);
      setDraftVersion(null);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load checklist schema.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void (async () => {
      await load();
    })();
  }, [load]);

  const postJson = useCallback(
    async (path: string, body: unknown) => {
      const res = await fetch(path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });
      let data: Record<string, unknown> = {};
      try {
        data = (await res.json()) as Record<string, unknown>;
      } catch {
        data = {};
      }
      return { ok: res.ok, status: res.status, data };
    },
    []
  );

  const extractError = (data: Record<string, unknown>, fallback: string): string =>
    typeof data.error === "string" ? data.error : fallback;

  const messageOf = (data: Record<string, unknown>, fallback: string): string =>
    typeof data.message === "string" ? data.message : fallback;

  const update = (mutator: (draft: Definition) => void) => {
    setDefinition((prev) => {
      if (!prev) return prev;
      const next = deepClone(prev);
      mutator(next);
      return next;
    });
  };

  const handleSave = async () => {
    if (!definition) return;
    setBusy("save");
    setError(null);
    setMessage(null);
    try {
      const { ok, data } = await postJson("/api/admin/checklist-schema/save", {
        definition,
        description: description || undefined,
        version: draftVersion ?? undefined,
      });
      if (!ok) {
        setError(extractError(data, "Failed to save checklist draft."));
        return;
      }
      const draft = data.draft as Outline | undefined;
      if (draft) {
        setDraftId(draft.id);
        setDraftVersion(draft.version);
      }
      setMessage(messageOf(data, "Draft saved."));
      await load();
    } catch {
      setError("Checklist schema service is unavailable.");
    } finally {
      setBusy(null);
    }
  };

  const handlePublish = async (id: string) => {
    setBusy(`publish:${id}`);
    setError(null);
    setMessage(null);
    try {
      const { ok, data } = await postJson("/api/admin/checklist-schema/publish", { id });
      if (!ok) {
        setError(extractError(data, "Failed to publish checklist version."));
        return;
      }
      setMessage(messageOf(data, "Version published."));
      await load();
    } catch {
      setError("Checklist schema service is unavailable.");
    } finally {
      setBusy(null);
    }
  };

  const handleActivate = async (id: string) => {
    setBusy(`activate:${id}`);
    setError(null);
    setMessage(null);
    try {
      const { ok, data } = await postJson("/api/admin/checklist-schema/activate", { id });
      if (!ok) {
        setError(extractError(data, "Failed to activate checklist version."));
        return;
      }
      setMessage(messageOf(data, "Version is now live."));
      await load();
    } catch {
      setError("Checklist schema service is unavailable.");
    } finally {
      setBusy(null);
    }
  };

  const handleSaveAndActivate = async () => {
    if (!definition) return;
    setBusy("save-activate");
    setError(null);
    setMessage(null);
    try {
      const saveRes = await postJson("/api/admin/checklist-schema/save", {
        definition,
        description: description || undefined,
        version: draftVersion ?? undefined,
      });
      if (!saveRes.ok) {
        setError(extractError(saveRes.data, "Failed to save checklist draft."));
        return;
      }
      const draft = saveRes.data.draft as Outline | undefined;
      if (!draft) {
        setError("Draft was saved but the server did not return its version.");
        return;
      }
      const publishRes = await postJson("/api/admin/checklist-schema/publish", { id: draft.id });
      if (!publishRes.ok) {
        setError(extractError(publishRes.data, "Draft saved, but publishing failed."));
        await load();
        return;
      }
      const activateRes = await postJson("/api/admin/checklist-schema/activate", { id: draft.id });
      if (!activateRes.ok) {
        setError(extractError(activateRes.data, "Published, but activation failed."));
        await load();
        return;
      }
      setMessage(messageOf(activateRes.data, `Version ${draft.version} is now live.`));
      await load();
    } catch {
      setError("Checklist schema service is unavailable.");
    } finally {
      setBusy(null);
    }
  };

  const handleReset = async () => {
    setBusy("reset");
    setError(null);
    setMessage(null);
    try {
      const { ok, data } = await postJson("/api/admin/checklist-schema/reset", {});
      if (!ok) {
        setError(extractError(data, "Failed to reset checklist schema."));
        return;
      }
      setMessage(messageOf(data, "Built-in seed restored as a draft."));
      await load();
    } catch {
      setError("Checklist schema service is unavailable.");
    } finally {
      setBusy(null);
    }
  };

  const startNewDraft = () => {
    if (!active) return;
    setDraftId(null);
    setDraftVersion(null);
    setMessage("Started a new draft from the active scheme. Save it to assign a version.");
    setError(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-slate-500 gap-2">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span className="text-sm">Loading checklist schema…</span>
      </div>
    );
  }

  if (!definition) {
    return (
      <div className="flex items-start gap-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl px-4 py-3 text-sm">
        <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
        <span>{error || "Checklist schema could not be loaded."}</span>
      </div>
    );
  }

  const dirtyLabel = draftVersion ? `Editing draft v${draftVersion}` : "New unsaved draft";

  return (
    <div className="space-y-6">
      {error && (
        <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {message && (
        <div className="flex items-start gap-2.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl px-4 py-3 text-sm">
          <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
          <span className="flex-1">{message}</span>
          <button
            type="button"
            onClick={() => setMessage(null)}
            className="text-emerald-600 hover:text-emerald-800 text-xs font-semibold cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#16233B]/5 border border-[#16233B]/10 text-[#16233B] flex items-center justify-center shrink-0">
            <ClipboardList className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-serif text-[#16233B]">Dynamic Form Builder</h3>
            <p className="text-[11px] text-slate-500">
              {dirtyLabel}. Changes stay in a draft until you publish and activate them.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={startNewDraft}
            disabled={busy !== null}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 disabled:opacity-50 transition-all cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            New draft from active
          </button>
          <button
            type="button"
            onClick={handleReset}
            disabled={busy !== null}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-amber-300 text-amber-700 text-xs font-semibold hover:bg-amber-50 disabled:opacity-50 transition-all cursor-pointer"
          >
            {busy === "reset" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RotateCcw className="w-3.5 h-3.5" />}
            Restore built-in seed
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={busy !== null}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-[#16233B]/30 text-[#16233B] text-xs font-semibold hover:bg-[#16233B]/5 disabled:opacity-50 transition-all cursor-pointer"
          >
            {busy === "save" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            Save draft
          </button>
          <button
            type="button"
            onClick={handleSaveAndActivate}
            disabled={busy !== null}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-[#16233B] hover:bg-[#0F172A] text-white text-xs font-semibold shadow-xs disabled:opacity-50 transition-all cursor-pointer"
          >
            {busy === "save-activate" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
            Save, publish &amp; activate
          </button>
        </div>
      </div>

      {/* Version registry */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#16233B]/5 border border-[#16233B]/10 text-[#16233B] flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-serif text-[#16233B]">Version registry</h3>
            <p className="text-[11px] text-slate-500">
              Activate any version to make it live instantly across the portal, validator, and PDFs.
            </p>
          </div>
        </div>
        <div className="divide-y divide-slate-100">
          {versions.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500">No versions stored yet.</div>
          ) : (
            versions.map((v) => (
              <div key={v.id} className="p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="inline-flex items-center justify-center min-w-11 h-8 px-2 rounded-lg bg-[#16233B]/5 border border-[#16233B]/10 text-[#16233B] text-xs font-semibold">
                    v{v.version}
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                          v.status === "PUBLISHED"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-slate-100 text-slate-600 border border-slate-200"
                        }`}
                      >
                        {v.status}
                      </span>
                      {v.isActive && (
                        <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200">
                          Live
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 truncate mt-1">
                      {v.description || "No description."}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {v.status === "DRAFT" && (
                    <button
                      type="button"
                      onClick={() => handlePublish(v.id)}
                      disabled={busy !== null}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#16233B]/30 text-[#16233B] text-[11px] font-semibold hover:bg-[#16233B]/5 disabled:opacity-50 transition-all cursor-pointer"
                    >
                      {busy === `publish:${v.id}` ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                      Publish
                    </button>
                  )}
                  {!v.isActive && (
                    <button
                      type="button"
                      onClick={() => handleActivate(v.id)}
                      disabled={busy !== null}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#16233B] hover:bg-[#0F172A] text-white text-[11px] font-semibold disabled:opacity-50 transition-all cursor-pointer"
                    >
                      {busy === `activate:${v.id}` ? <Loader2 className="w-3 h-3 animate-spin" /> : <Zap className="w-3 h-3" />}
                      Activate
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Scheme metadata */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-slate-100">
          <h3 className="text-base font-serif text-[#16233B]">Scheme details</h3>
        </div>
        <div className="p-5 sm:p-6 space-y-5">
          <div>
            <label htmlFor="schema-description" className="block text-xs font-semibold text-slate-700 mb-1.5">
              Description
            </label>
            <textarea
              id="schema-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#16233B]/20 focus:border-[#16233B]"
              placeholder="Short description of this checklist scheme version"
            />
          </div>
          <div>
            <span className="block text-xs font-semibold text-slate-700 mb-1.5">Likert scale labels</span>
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
              {LIKERT_KEYS.map((k) => (
                <div key={k}>
                  <label htmlFor={`likert-${k}`} className="block text-[10px] uppercase tracking-wider text-slate-400 mb-1">
                    Rating {k}
                  </label>
                  <input
                    id={`likert-${k}`}
                    type="text"
                    value={definition.likert?.[k] ?? ""}
                    onChange={(e) =>
                      update((d) => {
                        d.likert = { ...d.likert, [k]: e.target.value };
                      })
                    }
                    className="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#16233B]/20 focus:border-[#16233B]"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Domains */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-slate-100">
          <h3 className="text-base font-serif text-[#16233B]">Clinician domains</h3>
          <p className="text-[11px] text-slate-500 mt-1">
            The checklist is fixed at 11 QEEG domains to preserve the PDF layout and clinical mapping.
            Edit titles, descriptions, page placement, and order only. Domain keys are locked.
          </p>
        </div>
        <div className="p-5 sm:p-6 space-y-4">
          {definition.domains.map((domain, idx) => (
            <div key={domain.key} className="rounded-xl border border-slate-200 p-4">
              <div className="flex items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-[#16233B] text-white text-xs font-semibold">
                    {domain.num}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] text-slate-500">
                    <Lock className="w-3 h-3" />
                    {domain.key}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <label htmlFor={`domain-num-${domain.key}`} className="text-[10px] uppercase tracking-wider text-slate-400">
                    Order
                  </label>
                  <input
                    id={`domain-num-${domain.key}`}
                    type="number"
                    min={1}
                    max={11}
                    value={domain.num}
                    onChange={(e) =>
                      update((d) => {
                        d.domains[idx].num = numOr(e.target.value, d.domains[idx].num);
                      })
                    }
                    className="w-16 rounded-lg border border-slate-300 px-2 py-1 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#16233B]/20 focus:border-[#16233B]"
                  />
                  <select
                    aria-label={`Page for ${domain.key}`}
                    value={domain.page}
                    onChange={(e) =>
                      update((d) => {
                        d.domains[idx].page = numOr(e.target.value, d.domains[idx].page);
                      })
                    }
                    className="rounded-lg border border-slate-300 px-2 py-1 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#16233B]/20 focus:border-[#16233B]"
                  >
                    <option value={2}>Page 2</option>
                    <option value={3}>Page 3</option>
                  </select>
                </div>
              </div>
              <div className="space-y-3">
                <input
                  type="text"
                  aria-label={`Title for ${domain.key}`}
                  value={domain.title}
                  onChange={(e) =>
                    update((d) => {
                      d.domains[idx].title = e.target.value;
                    })
                  }
                  placeholder="Domain title"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#16233B]/20 focus:border-[#16233B]"
                />
                <textarea
                  aria-label={`Description for ${domain.key}`}
                  value={domain.desc}
                  onChange={(e) =>
                    update((d) => {
                      d.domains[idx].desc = e.target.value;
                    })
                  }
                  rows={2}
                  placeholder="Domain description"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#16233B]/20 focus:border-[#16233B]"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sections */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h3 className="text-base font-serif text-[#16233B]">Form sections</h3>
            <p className="text-[11px] text-slate-500 mt-1">
              Ordered blocks rendered on the portal. Field keys must be globally unique.
            </p>
          </div>
          <button
            type="button"
            onClick={() =>
              update((d) => {
                if (!d.sections) d.sections = [];
                d.sections.push({
                  key: `section_${d.sections.length + 1}`,
                  title: "New section",
                  kind: "fields",
                  fields: [{ key: `field_${Date.now()}`, label: "New field", type: "text" }],
                });
              })
            }
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-[#16233B] hover:bg-[#0F172A] text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Add section
          </button>
        </div>
        <div className="p-5 sm:p-6 space-y-5">
          {(definition.sections ?? []).map((section, sIdx) => {
            const kind: SectionKind = section.kind ?? "fields";
            const setSection = (patch: Partial<Section>) =>
              update((d) => {
                if (!d.sections) return;
                d.sections[sIdx] = { ...d.sections[sIdx], ...patch };
              });
            return (
              <div key={sIdx} className="rounded-xl border border-slate-200 p-4 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1">
                    <div>
                      <label htmlFor={`section-title-${sIdx}`} className="block text-[10px] uppercase tracking-wider text-slate-400 mb-1">
                        Title
                      </label>
                      <input
                        id={`section-title-${sIdx}`}
                        type="text"
                        value={section.title}
                        onChange={(e) => setSection({ title: e.target.value })}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#16233B]/20 focus:border-[#16233B]"
                      />
                    </div>
                    <div>
                      <label htmlFor={`section-key-${sIdx}`} className="block text-[10px] uppercase tracking-wider text-slate-400 mb-1">
                        Key
                      </label>
                      <input
                        id={`section-key-${sIdx}`}
                        type="text"
                        value={section.key}
                        onChange={(e) => setSection({ key: e.target.value })}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-mono text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#16233B]/20 focus:border-[#16233B]"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-1 pt-5">
                    <button
                      type="button"
                      aria-label="Move section up"
                      disabled={sIdx === 0}
                      onClick={() =>
                        update((d) => {
                          if (!d.sections || sIdx === 0) return;
                          const arr = d.sections;
                          [arr[sIdx - 1], arr[sIdx]] = [arr[sIdx], arr[sIdx - 1]];
                        })
                      }
                      className="p-1.5 rounded-lg text-slate-400 hover:text-[#16233B] hover:bg-slate-100 disabled:opacity-30 transition-colors cursor-pointer"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      aria-label="Move section down"
                      disabled={sIdx === (definition.sections?.length ?? 1) - 1}
                      onClick={() =>
                        update((d) => {
                          if (!d.sections || sIdx >= d.sections.length - 1) return;
                          const arr = d.sections;
                          [arr[sIdx + 1], arr[sIdx]] = [arr[sIdx], arr[sIdx + 1]];
                        })
                      }
                      className="p-1.5 rounded-lg text-slate-400 hover:text-[#16233B] hover:bg-slate-100 disabled:opacity-30 transition-colors cursor-pointer"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      aria-label="Remove section"
                      onClick={() =>
                        update((d) => {
                          if (!d.sections) return;
                          d.sections.splice(sIdx, 1);
                        })
                      }
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label htmlFor={`section-kind-${sIdx}`} className="block text-[10px] uppercase tracking-wider text-slate-400 mb-1">
                      Kind
                    </label>
                    <select
                      id={`section-kind-${sIdx}`}
                      value={kind}
                      onChange={(e) => {
                        const next = e.target.value as SectionKind;
                        if (next === "domains") {
                          setSection({ kind: next, domainPage: section.domainPage ?? 2 });
                        } else if (next === "static") {
                          setSection({ kind: next, lines: section.lines ?? [""] });
                        } else {
                          setSection({
                            kind: next,
                            fields: section.fields ?? [{ key: `field_${Date.now()}`, label: "New field", type: "text" }],
                          });
                        }
                      }}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#16233B]/20 focus:border-[#16233B]"
                    >
                      {SECTION_KINDS.map((k) => (
                        <option key={k} value={k}>
                          {k}
                        </option>
                      ))}
                    </select>
                  </div>
                  {kind === "domains" && (
                    <div>
                      <label htmlFor={`section-domainpage-${sIdx}`} className="block text-[10px] uppercase tracking-wider text-slate-400 mb-1">
                        Domain page
                      </label>
                      <select
                        id={`section-domainpage-${sIdx}`}
                        value={section.domainPage ?? 2}
                        onChange={(e) => setSection({ domainPage: numOr(e.target.value, 2) })}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#16233B]/20 focus:border-[#16233B]"
                      >
                        <option value={2}>Page 2</option>
                        <option value={3}>Page 3</option>
                      </select>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-4">
                  <label className="inline-flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={section.readonly ?? false}
                      onChange={(e) => setSection({ readonly: e.target.checked })}
                      className="rounded border-slate-300 text-[#16233B] focus:ring-[#16233B]/30"
                    />
                    Locked (read-only at runtime)
                  </label>
                  <label className="inline-flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={section.required ?? false}
                      onChange={(e) => setSection({ required: e.target.checked })}
                      className="rounded border-slate-300 text-[#16233B] focus:ring-[#16233B]/30"
                    />
                    Required
                  </label>
                </div>

                <div>
                  <label htmlFor={`section-insight-${sIdx}`} className="block text-[10px] uppercase tracking-wider text-slate-400 mb-1">
                    Insight (helper text)
                  </label>
                  <input
                    id={`section-insight-${sIdx}`}
                    type="text"
                    value={section.insight ?? ""}
                    onChange={(e) => setSection({ insight: e.target.value || undefined })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#16233B]/20 focus:border-[#16233B]"
                  />
                </div>

                {kind === "static" && (
                  <div>
                    <label htmlFor={`section-lines-${sIdx}`} className="block text-[10px] uppercase tracking-wider text-slate-400 mb-1">
                      Lines (one per row)
                    </label>
                    <textarea
                      id={`section-lines-${sIdx}`}
                      value={(section.lines ?? []).join("\n")}
                      onChange={(e) => setSection({ lines: e.target.value.split("\n") })}
                      rows={3}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#16233B]/20 focus:border-[#16233B]"
                    />
                  </div>
                )}

                {kind === "fields" && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase tracking-wider text-slate-400">Fields</span>
                      <button
                        type="button"
                        onClick={() =>
                          setSection({
                            fields: [
                              ...(section.fields ?? []),
                              { key: `field_${Date.now()}`, label: "New field", type: "text" },
                            ],
                          })
                        }
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-300 text-slate-700 text-[11px] font-semibold hover:bg-slate-50 transition-all cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                        Add field
                      </button>
                    </div>
                    {(section.fields ?? []).map((field, fIdx) => {
                      const setField = (patch: Partial<Field>) =>
                        update((d) => {
                          const f = d.sections?.[sIdx].fields?.[fIdx];
                          if (!f) return;
                          d.sections![sIdx].fields![fIdx] = { ...f, ...patch };
                        });
                      return (
                        <div key={fIdx} className="rounded-lg border border-slate-200 bg-slate-50/50 p-3 space-y-3">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label htmlFor={`field-label-${sIdx}-${fIdx}`} className="block text-[10px] uppercase tracking-wider text-slate-400 mb-1">
                                Label
                              </label>
                              <input
                                id={`field-label-${sIdx}-${fIdx}`}
                                type="text"
                                value={field.label}
                                onChange={(e) => setField({ label: e.target.value })}
                                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#16233B]/20 focus:border-[#16233B]"
                              />
                            </div>
                            <div>
                              <label htmlFor={`field-key-${sIdx}-${fIdx}`} className="block text-[10px] uppercase tracking-wider text-slate-400 mb-1">
                                Key
                              </label>
                              <input
                                id={`field-key-${sIdx}-${fIdx}`}
                                type="text"
                                value={field.key}
                                onChange={(e) => setField({ key: e.target.value })}
                                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-mono text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#16233B]/20 focus:border-[#16233B]"
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div>
                              <label htmlFor={`field-type-${sIdx}-${fIdx}`} className="block text-[10px] uppercase tracking-wider text-slate-400 mb-1">
                                Type
                              </label>
                              <select
                                id={`field-type-${sIdx}-${fIdx}`}
                                value={field.type}
                                onChange={(e) => {
                                  const next = e.target.value as FieldType;
                                  setField({
                                    type: next,
                                    options: next === "select" ? field.options ?? [{ value: "option_1", label: "Option 1" }] : field.options,
                                  });
                                }}
                                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#16233B]/20 focus:border-[#16233B]"
                              >
                                {FIELD_TYPES.map((t) => (
                                  <option key={t} value={t}>
                                    {t}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div className="sm:col-span-2">
                              <label htmlFor={`field-placeholder-${sIdx}-${fIdx}`} className="block text-[10px] uppercase tracking-wider text-slate-400 mb-1">
                                Placeholder
                              </label>
                              <input
                                id={`field-placeholder-${sIdx}-${fIdx}`}
                                type="text"
                                value={field.placeholder ?? ""}
                                onChange={(e) => setField({ placeholder: e.target.value || undefined })}
                                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#16233B]/20 focus:border-[#16233B]"
                              />
                            </div>
                          </div>
                          <div className="flex flex-wrap items-center gap-4">
                            <label className="inline-flex items-center gap-2 text-[11px] text-slate-700 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={field.required ?? false}
                                onChange={(e) => setField({ required: e.target.checked })}
                                className="rounded border-slate-300 text-[#16233B] focus:ring-[#16233B]/30"
                              />
                              Required
                            </label>
                            <label className="inline-flex items-center gap-2 text-[11px] text-slate-700 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={field.readonly ?? false}
                                onChange={(e) => setField({ readonly: e.target.checked })}
                                className="rounded border-slate-300 text-[#16233B] focus:ring-[#16233B]/30"
                              />
                              Locked (read-only)
                            </label>
                            <button
                              type="button"
                              onClick={() =>
                                update((d) => {
                                  d.sections?.[sIdx].fields?.splice(fIdx, 1);
                                })
                              }
                              className="ml-auto inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                            >
                              <Trash className="w-3 h-3" />
                              Remove
                            </button>
                          </div>
                          {field.type === "select" && (
                            <div>
                              <label htmlFor={`field-options-${sIdx}-${fIdx}`} className="block text-[10px] uppercase tracking-wider text-slate-400 mb-1">
                                Options (value = label, one per row)
                              </label>
                              <textarea
                                id={`field-options-${sIdx}-${fIdx}`}
                                value={formatOptions(field.options)}
                                onChange={(e) => setField({ options: parseOptions(e.target.value) })}
                                rows={3}
                                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-mono text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#16233B]/20 focus:border-[#16233B]"
                              />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
          {(definition.sections ?? []).length === 0 && (
            <div className="p-8 text-center text-xs text-slate-500">
              This scheme has no sections. Add a section to build the portal form.
            </div>
          )}
        </div>
      </div>

      {/* Draft publish shortcut */}
      {draftId && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <p className="text-xs text-slate-600">
              Draft v{draftVersion} is saved. Publish it, then activate it to go live.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handlePublish(draftId)}
              disabled={busy !== null}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-[#16233B]/30 text-[#16233B] text-xs font-semibold hover:bg-[#16233B]/5 disabled:opacity-50 transition-all cursor-pointer"
            >
              {busy === `publish:${draftId}` ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              Publish draft
            </button>
            <button
              type="button"
              onClick={() => handleActivate(draftId)}
              disabled={busy !== null}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-[#16233B] hover:bg-[#0F172A] text-white text-xs font-semibold disabled:opacity-50 transition-all cursor-pointer"
            >
              {busy === `activate:${draftId}` ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
              Activate draft
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
