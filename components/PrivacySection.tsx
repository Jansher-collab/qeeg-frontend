import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function PrivacySection() {
  const securityFacts = [
    {
      dotColor: "bg-[#0284C7]", // Blue
      title: "Hosted in Sydney",
      description:
        "Everything runs on Australian infrastructure and nothing crosses a border to be processed.",
    },
    {
      dotColor: "bg-[#0D9488]", // Teal
      title: "Encrypted end to end",
      description:
        "In transit and at rest, for as long as anything exists on the platform at all.",
    },
    {
      dotColor: "bg-[#65A30D]", // Green
      title: "Purged the moment you download",
      description:
        "QEEG, TOVA, checklist, and report: all deleted the instant your download completes, with no lingering retention window.",
    },
  ];

  return (
    <section id="privacy" className="py-16 sm:py-24 bg-[#16233B] text-white border-t border-slate-800 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-start">
          {/* Left Column: Eyebrow, Heading, Paragraph & Action Button matching screenshot */}
          <div className="lg:col-span-6 flex flex-col items-start">
            <div className="text-[11px] font-semibold tracking-[0.22em] text-slate-400 uppercase mb-4 font-sans">
              DATA HANDLING
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-serif font-normal text-white tracking-tight leading-tight mb-6">
              Your client&apos;s data doesn&apos;t sit around waiting to be a liability
            </h2>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed font-normal max-w-xl mb-8">
              Most platforms store what you send them indefinitely. This system does not, because fewer clinical data repositories mean fewer risks for you and your clients.
            </p>

            <div>
              <Link
                href="#data-policy"
                className="inline-flex items-center gap-2 px-6 py-3.5 text-sm font-medium text-slate-200 hover:text-white bg-transparent hover:bg-slate-800/70 border border-slate-600/80 hover:border-slate-400 rounded-lg hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 group"
              >
                <span>Read the full data policy</span>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 group-hover:text-white transition-all duration-200" />
              </Link>
            </div>
          </div>

          {/* Right Column: 3 Security Items with Colored Circular Markers matching screenshot */}
          <div className="lg:col-span-6 flex flex-col gap-8 pt-2">
            {securityFacts.map((fact, index) => (
              <div
                key={index}
                className="flex items-start gap-4.5 group"
              >
                <div className={`w-5 h-5 rounded-full ${fact.dotColor} shrink-0 mt-1 shadow-xs group-hover:scale-110 transition-transform duration-200`} />

                <div className="flex-1">
                  <h3 className="text-base sm:text-lg font-semibold text-white tracking-tight mb-1 group-hover:text-slate-100 transition-colors">
                    {fact.title}
                  </h3>

                  <p className="text-slate-300 text-xs sm:text-sm leading-relaxed font-normal">
                    {fact.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
