import type { Metadata } from "next";
import Link from "next/link";
import { FileText, Scale, ExternalLink } from "lucide-react";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "End User Licence Agreement | QEEG.com.au",
  description:
    "The EULA governing practitioner use of the QEEG.com.au correlation platform and generated reports.",
};

const BACKEND_URL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
const FALLBACK_VERSION = "2026-09-01";

async function getEulaVersion(): Promise<string> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/legal/current`, { cache: "no-store" });
    if (!res.ok) return FALLBACK_VERSION;
    const data = await res.json();
    const doc = (data.documents || []).find((d: any) => d.documentType === "EULA");
    return doc?.version || FALLBACK_VERSION;
  } catch {
    return FALLBACK_VERSION;
  }
}

export default async function EulaPage() {
  const version = await getEulaVersion();
  const pdfSrc = `/api/legal/eula/pdf?v=${encodeURIComponent(version)}`;

  return (
    <div className="bg-slate-50 text-slate-900 font-sans animate-fadeIn">
      <section className="relative pt-28 pb-12 md:pt-32 md:pb-16 overflow-hidden bg-[#16233B] text-white border-b border-slate-800 text-left">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-[#1C2F4A]/40 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 -right-32 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="inline-flex items-center px-3.5 py-1.5 rounded-full bg-slate-800/90 border border-slate-700/80 text-[11px] font-semibold tracking-[0.2em] text-slate-300 uppercase mb-5 font-sans">
            <span>Legal Framework</span>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif font-normal text-white leading-[1.2] tracking-tight mb-4 max-w-3xl">
            End User Licence Agreement
          </h1>
          <p className="text-sm sm:text-base text-slate-300 font-normal max-w-3xl leading-relaxed">
            The EULA governing practitioner use of the QEEG.com.au correlation
            platform and generated reports.
          </p>
        </div>
      </section>

      <section className="py-12 sm:py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xs">
            <iframe
              src={pdfSrc}
              title={`End User Licence Agreement v${version} (PDF)`}
              className="w-full h-[78vh] rounded-2xl border border-slate-200 bg-slate-50"
            />
          </div>

          <div className="p-6 rounded-3xl bg-[#16233B] text-white border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md">
            <div className="flex items-center gap-3">
              <Scale className="w-5 h-5 text-sky-400 shrink-0" />
              <span className="text-xs sm:text-sm font-normal text-slate-200">
                Version {version} · Governed by the laws of Victoria, Australia.
              </span>
            </div>
            <div className="flex items-center gap-4 shrink-0">
              <a
                href={pdfSrc}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-semibold text-white hover:text-slate-300 underline transition-colors flex items-center gap-1.5"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Open PDF full-screen
              </a>
              <Link
                href="/legal/dpa"
                className="text-xs font-semibold text-white hover:text-slate-300 underline transition-colors flex items-center gap-1.5"
              >
                <FileText className="w-3.5 h-3.5" />
                View DPA
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}