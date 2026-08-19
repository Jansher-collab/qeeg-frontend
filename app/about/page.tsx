import Link from "next/link";
import {
  Mail,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  Building2,
  Database,
  Scale,
  Sparkles,
  Server,
  Layers,
} from "lucide-react";

export default function AboutPage() {
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
            <span>About Applied Neurosciences</span>
          </div>

          {/* Main Heading in Lora Serif */}
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-[42px] font-serif font-normal text-white leading-[1.2] tracking-tight mb-4 max-w-3xl">
            Built on a curated literature base, not a black box
          </h1>

          {/* Lede Paragraph */}
          <p className="text-sm sm:text-base md:text-[17px] text-slate-300 font-normal max-w-3xl leading-relaxed">
            QEEG.com.au is operated by Applied Neurosciences Pty Ltd, an Australian company focused on QEEG interpretation grounded in published research.
          </p>
        </div>
      </section>

      {/* 2. Main Body Content: Two-Column Architecture */}
      <section className="py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Detailed 2-Column Split */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* Left Sidebar Details (4 cols) */}
            <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-28">
              {/* Entity Overview Card */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-[#16233B]">
                    <Building2 className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Operating Entity
                    </h4>
                    <p className="text-sm font-semibold text-[#16233B]">
                      Applied Neurosciences Pty Ltd
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 space-y-2.5 text-xs text-slate-600">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Jurisdiction:</span>
                    <span className="font-medium text-slate-900">Australia (Victoria)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Primary Standard:</span>
                    <span className="font-medium text-slate-900">NeuroGuide .tdt</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Infrastructure:</span>
                    <span className="font-medium text-slate-900">Sydney Sovereign Server</span>
                  </div>
                </div>
              </div>

              {/* Research Scope Card */}
              <div className="bg-[#16233B] text-white rounded-2xl p-6 border border-slate-800 shadow-md space-y-3">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-300">
                  <Layers className="w-4 h-4 text-sky-400" />
                  <span>Literature Domains</span>
                </div>
                <p className="text-xs text-slate-300 font-normal leading-relaxed">
                  Our correlation engine checks multi-disciplinary literature spanning neurobiology, clinical psychology, nutritional neuroscience, lifestyle interventions, and neurofeedback.
                </p>
              </div>

              {/* Direct Support Micro-Card */}
              <div className="bg-slate-100/80 rounded-2xl p-5 border border-slate-200/90 space-y-2.5 text-xs text-slate-600">
                <div className="flex items-center gap-2 font-semibold text-[#16233B]">
                  <ShieldCheck className="w-4 h-4 text-[#16233B]" />
                  <span>Clinical Questions</span>
                </div>
                <p className="leading-relaxed text-slate-600 font-normal">
                  Have a question regarding how a report was compiled? Email our team with your case reference.
                </p>
              </div>
            </div>

            {/* Right Detailed Sections (8 cols) */}
            <div className="lg:col-span-8 space-y-6">
              {/* Section 1: What we do */}
              <div className="bg-white rounded-3xl p-7 sm:p-9 border border-slate-200 shadow-2xs space-y-4">
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-slate-100 text-[11px] font-semibold tracking-widest text-slate-700 uppercase font-sans">
                  What we do
                </div>
                <h2 className="text-xl sm:text-2xl font-serif font-normal text-[#16233B] tracking-tight leading-snug">
                  A correlation service, not a diagnostic one
                </h2>
                <div className="space-y-3.5 text-slate-600 text-sm sm:text-base leading-relaxed font-normal">
                  <p>
                    QEEG.com.au takes QEEG, TOVA, and symptom checklist data and correlates it against a curated, continually checked body of published research spanning medical, psychological, nutritional, lifestyle, and neurofeedback literature.
                  </p>
                  <p>
                    What comes back describes what the research associates with the observed pattern. It is never a diagnosis, and never a treatment recommendation, because QEEG and TOVA data cannot themselves produce either, and the report is built specifically to stop short of that line.
                  </p>
                  <p>
                    Every report is AI-generated and clearly disclosed as such, with no human review before delivery. That is a deliberate design choice, not an oversight: it is stated plainly wherever a report appears, alongside a reminder to check the findings before relying on them.
                  </p>
                </div>
              </div>

              {/* Section 2: Honest Limits */}
              <div className="rounded-3xl bg-[#EAF4EF] border border-[#BBDED3] p-7 sm:p-9 shadow-2xs space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white border border-[#BBDED3] flex items-center justify-center text-[#16233B] shadow-2xs">
                    <BookOpen className="w-4.5 h-4.5" />
                  </div>
                  <h3 className="text-base sm:text-lg font-serif font-normal text-[#16233B] tracking-tight">
                    Where we&apos;re honest about the limits of this
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-slate-700 font-normal leading-relaxed">
                  Some correlations, particularly around neurofeedback, carry a disclosed conflict of interest, since this knowledge base draws on a background in neurofeedback research and practice. Where that applies, the report says so directly rather than leaving it for you to wonder about.
                </p>
              </div>

              {/* Section 3: Where we operate */}
              <div className="bg-white rounded-3xl p-7 sm:p-9 border border-slate-200 shadow-2xs space-y-4">
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-slate-100 text-[11px] font-semibold tracking-widest text-slate-700 uppercase font-sans">
                  Where we operate
                </div>
                <h2 className="text-xl sm:text-2xl font-serif font-normal text-[#16233B] tracking-tight leading-snug">
                  Built for the Australian QEEG ecosystem specifically
                </h2>
                <p className="text-slate-600 text-sm sm:text-base leading-relaxed font-normal">
                  The correlation engine is built around NeuroGuide QEEG exports and their normative database specifically, as not every QEEG system in use internationally maps onto the same normative distribution. Hosting, and the compliance posture behind it, is built around the Australian Privacy Act 1988 and the Health Records Act 2001 (Vic).
                </p>
              </div>
            </div>
          </div>

          {/* 3. Final Call to Action Section */}
          <div className="bg-[#16233B] rounded-3xl p-8 sm:p-12 text-white border border-slate-800 shadow-xl text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-8 hover:border-slate-700 transition-colors">
            <div className="space-y-2 max-w-lg">
              <h3 className="text-2xl sm:text-3xl font-serif font-normal text-white tracking-tight leading-snug">
                Questions about how a report was generated?
              </h3>
              <p className="text-slate-300 text-sm sm:text-base font-normal">
                Email{" "}
                <a
                  href="mailto:reception@adhd.com.au"
                  className="font-medium text-white underline decoration-slate-400 hover:decoration-white transition-colors"
                >
                  reception@adhd.com.au
                </a>{" "}
                with your case reference.
              </p>
            </div>

            <a
              href="mailto:reception@adhd.com.au"
              className="px-6 py-3.5 text-sm font-semibold text-[#16233B] bg-white hover:bg-slate-100 rounded-xl shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 flex items-center gap-2 shrink-0 group"
            >
              <Mail className="w-4 h-4 text-[#16233B]" />
              <span>Contact Support</span>
              <ArrowRight className="w-4 h-4 text-[#16233B] group-hover:translate-x-1 transition-transform duration-200" />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
