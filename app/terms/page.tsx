import Link from "next/link";
import { AlertTriangle, FileText, ArrowRight, ShieldCheck, Mail, Scale, CheckCircle2 } from "lucide-react";

export default function TermsPage() {
  const sections = [
    {
      id: "section-1",
      title: "1. What this service is",
      content: (
        <p>
          QEEG.com.au, operated by Applied Neurosciences Pty Ltd (&ldquo;we&rdquo;, &ldquo;us&rdquo;), generates AI-produced reports correlating QEEG, TOVA, and symptom checklist data against published research literature. Reports describe research correlations only. They are not a diagnosis and do not constitute a clinical recommendation.
        </p>
      ),
    },
    {
      id: "section-2",
      title: "2. No human review",
      content: (
        <p>
          Reports are generated automatically with no human review before delivery. You are responsible for independently checking a report&apos;s findings before relying on them or sharing them further with clients or allied health professionals.
        </p>
      ),
    },
    {
      id: "section-3",
      title: "3. Your responsibilities as the referring practitioner",
      content: (
        <ul className="space-y-2 list-disc pl-5 text-slate-600 marker:text-slate-400">
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
      ),
    },
    {
      id: "section-4",
      title: "4. Data handling",
      content: (
        <p>
          See our{" "}
          <Link
            href="/privacy"
            className="text-[#16233B] font-semibold underline hover:text-slate-900 transition-colors"
          >
            Privacy &amp; Data Handling page
          </Link>{" "}
          for the full detail. In summary: identifying data is stripped in your browser before upload, and all data for a submission is purged from our servers the moment you download the finished report.
        </p>
      ),
    },
    {
      id: "section-5",
      title: "5. Fees",
      content: (
        <p>
          The current fee is AU$65 per successfully generated report, charged only once a report is produced. Rejected submissions (failing the reliability threshold) are never charged. A resubmission is treated as a new report and charged in full if successful.
        </p>
      ),
    },
    {
      id: "section-6",
      title: "6. Scope",
      content: (
        <p>
          This service is built around NeuroGuide QEEG exports and Australian data-handling law. It is not represented as suitable for QEEG data from other systems or for practitioners operating outside Australia.
        </p>
      ),
    },
    {
      id: "section-7",
      title: "7. Limitation of liability",
      content: (
        <p>
          To the maximum extent permitted by law, Applied Neurosciences Pty Ltd is not liable for clinical decisions made in reliance on a generated report. This service provides research correlations for your own consideration, not clinical advice.
        </p>
      ),
    },
    {
      id: "section-8",
      title: "8. Changes to these terms",
      content: (
        <p>
          We may update these terms from time to time. Continued use of the service after a change constitutes acceptance of the updated terms.
        </p>
      ),
    },
  ];

  return (
    <div className="bg-slate-50 text-slate-900 font-sans animate-fadeIn">
      {/* 1. Page Hero Section */}
      <section className="relative pt-28 pb-14 md:pt-32 md:pb-20 overflow-hidden bg-[#16233B] text-white border-b border-slate-800 text-left">
        {/* Background Subtle Glows */}
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-[#1C2F4A]/40 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 -right-32 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Eyebrow */}
          <div className="inline-flex items-center px-3.5 py-1.5 rounded-full bg-slate-800/90 border border-slate-700/80 text-[11px] font-semibold tracking-[0.2em] text-slate-300 uppercase mb-5 font-sans">
            <span>Legal Framework</span>
          </div>

          {/* Main Heading in Lora Serif */}
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-[42px] font-serif font-normal text-white leading-[1.2] tracking-tight mb-4 max-w-3xl">
            Terms of Service
          </h1>

          {/* Lede Paragraph */}
          <p className="text-sm sm:text-base md:text-[17px] text-slate-300 font-normal max-w-3xl leading-relaxed">
            Clear parameters governing practitioner responsibilities, correlation boundaries, and data destruction.
          </p>
        </div>
      </section>

      {/* 2. Main Two-Column Legal Container */}
      <section className="py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* Left Column: TOC & Status (4 cols) */}
            <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-28">
              {/* Draft Status Banner */}
              <div className="rounded-2xl p-5 bg-amber-50/90 border border-amber-200/90 shadow-2xs space-y-2">
                <div className="flex items-center gap-2 text-amber-950 font-semibold text-xs uppercase tracking-wider">
                  <AlertTriangle className="w-4 h-4 text-amber-800" />
                  <span>Draft Notice</span>
                </div>
                <p className="text-xs text-amber-950/90 leading-relaxed font-normal">
                  Draft for review, not yet confirmed by legal counsel. Last edited August 2026.
                </p>
              </div>

              {/* Quick Navigation Card */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-2">
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2 px-1">
                  Table of Contents
                </div>
                <div className="flex flex-col gap-1 text-xs text-slate-700 font-medium">
                  {sections.map((sec) => (
                    <a
                      key={sec.id}
                      href={`#${sec.id}`}
                      className="px-3 py-2 rounded-xl hover:bg-slate-100 hover:text-slate-950 transition-colors flex items-center justify-between"
                    >
                      <span>{sec.title}</span>
                      <ArrowRight className="w-3 h-3 text-slate-400" />
                    </a>
                  ))}
                </div>
              </div>

              {/* Legal Support Card */}
              <div className="bg-[#16233B] text-white rounded-2xl p-5 border border-slate-800 shadow-md space-y-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  <Scale className="w-4 h-4 text-sky-400" />
                  <span>Jurisdiction</span>
                </div>
                <p className="text-xs text-slate-300 font-normal leading-relaxed">
                  Governed by the laws of Victoria, Australia. Built in alignment with the Privacy Act 1988.
                </p>
              </div>
            </div>

            {/* Right Column: Legal Clauses (8 cols) */}
            <div className="lg:col-span-8 space-y-6">
              <div className="bg-white rounded-3xl p-7 sm:p-10 border border-slate-200 shadow-2xs space-y-8 text-slate-700 text-sm sm:text-base leading-relaxed font-normal">
                {sections.map((sec, index) => (
                  <div key={sec.id} id={sec.id} className="space-y-2.5 scroll-mt-28">
                    <h2 className="text-base sm:text-lg font-serif font-normal text-[#16233B] tracking-tight flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#16233B] shrink-0" />
                      <span>{sec.title}</span>
                    </h2>
                    <div className="text-xs sm:text-sm text-slate-600 font-normal leading-relaxed pl-3.5 border-l-2 border-slate-100">
                      {sec.content}
                    </div>
                    {index < sections.length - 1 && (
                      <hr className="border-slate-100 mt-6" />
                    )}
                  </div>
                ))}
              </div>

              {/* Bottom Security Assurance Banner */}
              <div className="p-6 rounded-3xl bg-[#16233B] text-white border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-5 h-5 text-sky-400 shrink-0" />
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
          </div>
        </div>
      </section>
    </div>
  );
}
