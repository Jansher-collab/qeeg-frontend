import Link from "next/link";
import { Mail, BookOpen, ArrowRight } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="bg-slate-50 text-slate-900 font-sans animate-fadeIn">
      {/* 1. Page Hero Section */}
      <section className="relative pt-28 pb-14 md:pt-32 md:pb-20 overflow-hidden bg-[#16233B] text-white border-b border-slate-800">
        {/* Background Subtle Glows */}
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-[#1C2F4A]/40 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 -right-32 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-left">
          {/* Eyebrow */}
          <div className="inline-flex items-center px-3.5 py-1.5 rounded-full bg-slate-800/90 border border-slate-700/80 text-[11px] font-semibold tracking-[0.2em] text-slate-300 uppercase mb-5 font-sans">
            <span>About</span>
          </div>

          {/* Main Heading in Lora Serif */}
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-[42px] font-serif font-normal text-white leading-[1.2] tracking-tight">
            Built on a curated literature base, not a black box
          </h1>

          {/* Lede Paragraph */}
          <p className="mt-5 text-sm sm:text-base md:text-[17px] text-slate-300 leading-relaxed font-normal max-w-3xl">
            QEEG.com.au is operated by Applied Neurosciences Pty Ltd, an Australian company focused on QEEG interpretation grounded in published research.
          </p>
        </div>
      </section>

      {/* 2. Main Body Content (Narrow Wrap Layout) */}
      <section className="py-14 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14 sm:space-y-18">
          {/* Section: What we do */}
          <div className="space-y-5">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-slate-200/80 text-[11px] font-semibold tracking-[0.2em] text-slate-700 uppercase font-sans">
              What we do
            </div>

            <h2 className="text-xl sm:text-2xl lg:text-[30px] font-serif font-normal text-[#16233B] tracking-tight leading-snug">
              A correlation service, not a diagnostic one
            </h2>

            <div className="space-y-4 text-slate-700 text-sm sm:text-base leading-relaxed font-normal">
              <p>
                QEEG.com.au takes QEEG, TOVA, and symptom checklist data and correlates it against a curated, continually checked body of published research spanning medical, psychological, nutritional, lifestyle, and neurofeedback literature. What comes back describes what the research associates with the observed pattern. It is never a diagnosis, and never a treatment recommendation, because QEEG and TOVA data cannot themselves produce either, and the report is built specifically to stop short of that line.
              </p>
              <p>
                Every report is AI-generated and clearly disclosed as such, with no human review before delivery. That is a deliberate design choice, not an oversight: it is stated plainly wherever a report appears, alongside a reminder to check the findings before relying on them.
              </p>
            </div>
          </div>

          {/* Callout Box: Honest Limits */}
          <div className="rounded-2xl bg-slate-100/90 border border-slate-300/80 p-6 sm:p-8 relative overflow-hidden shadow-2xs hover:shadow-sm hover:border-slate-400/80 transition-all duration-300">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                <BookOpen className="w-5 h-5 text-[#16233B]" />
              </div>
              <div className="space-y-2">
                <h3 className="text-base sm:text-lg font-serif font-normal text-[#16233B] tracking-tight">
                  Where we&apos;re honest about the limits of this
                </h3>
                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed font-normal">
                  Some correlations, particularly around neurofeedback, carry a disclosed conflict of interest, since this knowledge base draws on a background in neurofeedback research and practice. Where that applies, the report says so directly rather than leaving it for you to wonder about.
                </p>
              </div>
            </div>
          </div>

          {/* Section: Where we operate */}
          <div className="space-y-5">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-slate-200/80 text-[11px] font-semibold tracking-[0.2em] text-slate-700 uppercase font-sans">
              Where we operate
            </div>

            <h2 className="text-xl sm:text-2xl lg:text-[30px] font-serif font-normal text-[#16233B] tracking-tight leading-snug">
              Built for the Australian QEEG ecosystem specifically
            </h2>

            <div className="space-y-4 text-slate-700 text-sm sm:text-base leading-relaxed font-normal">
              <p>
                The correlation engine is built around NeuroGuide QEEG exports and their normative database specifically, as not every QEEG system in use internationally maps onto the same normative distribution. Hosting, and the compliance posture behind it, is built around the Australian Privacy Act 1988 and the Health Records Act 2001 (Vic).
              </p>
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
