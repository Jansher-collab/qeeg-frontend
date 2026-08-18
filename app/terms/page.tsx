import Link from "next/link";
import { AlertTriangle, FileText, ArrowRight, ShieldCheck } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="bg-slate-50 text-slate-900 font-sans animate-fadeIn">
      {/* 1. Page Hero Section */}
      <section className="relative pt-28 pb-14 md:pt-32 md:pb-20 overflow-hidden bg-[#16233B] text-white border-b border-slate-800 text-left">
        {/* Background Subtle Glows */}
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-[#1C2F4A]/40 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 -right-32 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Eyebrow */}
          <div className="inline-flex items-center px-3.5 py-1.5 rounded-full bg-slate-800/90 border border-slate-700/80 text-[11px] font-semibold tracking-[0.2em] text-slate-300 uppercase mb-5 font-sans">
            <span>Legal</span>
          </div>

          {/* Main Heading in Lora Serif */}
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-[42px] font-serif font-normal text-white leading-[1.2] tracking-tight">
            Terms of Service
          </h1>
        </div>
      </section>

      {/* 2. Legal Body Content Container (wrap-narrow legal-body) */}
      <section className="py-14 sm:py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          {/* Draft Notice Banner */}
          <div className="rounded-2xl p-4 sm:p-5 bg-amber-50/80 border border-amber-200/90 shadow-2xs flex items-start gap-3.5 text-amber-950 text-xs sm:text-sm font-normal leading-relaxed">
            <AlertTriangle className="w-5 h-5 text-amber-800 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold block text-amber-950 mb-0.5">
                Draft Notice
              </span>
              Draft for review, not yet confirmed by legal counsel. Last edited 11 August 2026.
            </div>
          </div>

          {/* Legal Sections */}
          <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-2xs space-y-10 text-slate-700 text-sm sm:text-base leading-relaxed font-normal">
            {/* Section 1 */}
            <div className="space-y-3">
              <h2 className="text-lg sm:text-xl font-serif font-normal text-[#16233B] tracking-tight">
                1. What this service is
              </h2>
              <p>
                QEEG.com.au, operated by Applied Neurosciences Pty Ltd (&ldquo;we&rdquo;, &ldquo;us&rdquo;), generates AI-produced reports correlating QEEG, TOVA, and symptom checklist data against published research literature. Reports describe research correlations only. They are not a diagnosis and do not constitute a clinical recommendation.
              </p>
            </div>

            <hr className="border-slate-100" />

            {/* Section 2 */}
            <div className="space-y-3">
              <h2 className="text-lg sm:text-xl font-serif font-normal text-[#16233B] tracking-tight">
                2. No human review
              </h2>
              <p>
                Reports are generated automatically with no human review before delivery. You are responsible for independently checking a report&apos;s findings before relying on them or sharing them further.
              </p>
            </div>

            <hr className="border-slate-100" />

            {/* Section 3 */}
            <div className="space-y-3">
              <h2 className="text-lg sm:text-xl font-serif font-normal text-[#16233B] tracking-tight">
                3. Your responsibilities as the referring practitioner
              </h2>
              <ul className="space-y-2.5 list-disc pl-5 text-slate-600 marker:text-slate-400">
                <li>
                  You are responsible for obtaining any consent required from your client before submitting their data.
                </li>
                <li>
                  You are responsible for keeping track of which case reference corresponds to which patient, as we do not hold this mapping and cannot recover it if lost.
                </li>
                <li>
                  You remain responsible for the clinical decisions you make; this service informs, but does not replace, your own clinical judgement.
                </li>
              </ul>
            </div>

            <hr className="border-slate-100" />

            {/* Section 4 */}
            <div className="space-y-3">
              <h2 className="text-lg sm:text-xl font-serif font-normal text-[#16233B] tracking-tight">
                4. Data handling
              </h2>
              <p>
                See our{" "}
                <Link
                  href="/privacy"
                  className="text-[#16233B] font-medium underline hover:text-slate-900 transition-colors"
                >
                  Privacy &amp; Data Handling page
                </Link>{" "}
                for the full detail. In summary: identifying data is stripped in your browser before upload, and all data for a submission is purged from our servers the moment you download the finished report.
              </p>
            </div>

            <hr className="border-slate-100" />

            {/* Section 5 */}
            <div className="space-y-3">
              <h2 className="text-lg sm:text-xl font-serif font-normal text-[#16233B] tracking-tight">
                5. Fees
              </h2>
              <p>
                The current fee is AU$65 per successfully generated report, charged only once a report is produced. Rejected submissions (failing the reliability threshold) are never charged. A resubmission is treated as a new report and charged in full if successful.
              </p>
            </div>

            <hr className="border-slate-100" />

            {/* Section 6 */}
            <div className="space-y-3">
              <h2 className="text-lg sm:text-xl font-serif font-normal text-[#16233B] tracking-tight">
                6. Scope
              </h2>
              <p>
                This service is built around NeuroGuide QEEG exports and Australian data-handling law. It is not represented as suitable for QEEG data from other systems or for practitioners operating outside Australia.
              </p>
            </div>

            <hr className="border-slate-100" />

            {/* Section 7 */}
            <div className="space-y-3">
              <h2 className="text-lg sm:text-xl font-serif font-normal text-[#16233B] tracking-tight">
                7. Limitation of liability
              </h2>
              <p>
                To the maximum extent permitted by law, Applied Neurosciences Pty Ltd is not liable for clinical decisions made in reliance on a generated report. This service provides research correlations for your own consideration, not clinical advice.
              </p>
            </div>

            <hr className="border-slate-100" />

            {/* Section 8 */}
            <div className="space-y-3">
              <h2 className="text-lg sm:text-xl font-serif font-normal text-[#16233B] tracking-tight">
                8. Changes to these terms
              </h2>
              <p>
                We may update these terms from time to time. Continued use of the service after a change constitutes acceptance of the updated terms.
              </p>
            </div>
          </div>

          {/* Bottom Security Assurance */}
          <div className="p-6 rounded-3xl bg-[#16233B] text-white border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-slate-300 shrink-0" />
              <span className="text-xs sm:text-sm font-normal text-slate-200">
                Operating under Australian Privacy Principles (APPs) &amp; Sovereign Hosting
              </span>
            </div>
            <Link
              href="/privacy"
              className="text-xs font-semibold text-white hover:text-slate-300 underline shrink-0 transition-colors"
            >
              Review Data Protocol &rarr;
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
