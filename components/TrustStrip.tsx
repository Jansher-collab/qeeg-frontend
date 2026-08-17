import { Bot, BookOpen, MapPin, Trash2 } from "lucide-react";

export default function TrustStrip() {
  const highlights = [
    {
      icon: Bot,
      bullet: "AI-generated, disclosed clearly",
      detail: "Transparency first — every finding flagged for clinical verification.",
    },
    {
      icon: BookOpen,
      bullet: "Published-literature correlations",
      detail: "Evidence mapped to PubMed, Semantic Scholar & peer-reviewed sources.",
    },
    {
      icon: MapPin,
      bullet: "Australian-hosted, Sydney",
      detail: "Zero offshore hops — strictly compliant with Australian privacy laws.",
    },
    {
      icon: Trash2,
      bullet: "Purged after you download",
      detail: "Instant deletion protocol ensures zero lingering data liability.",
    },
  ];

  return (
    <section className="bg-[#F8FAFC] border-y border-slate-200 py-16 sm:py-20 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Left-Aligned Section Header */}
        <div className="max-w-3xl mb-10 text-left">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-slate-200/80 text-[11px] font-semibold tracking-[0.22em] text-slate-700 uppercase mb-3 font-sans">
            CLINICAL INTEGRITY & TRUST
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-normal text-[#16233B] tracking-tight leading-tight">
            Built on transparency, evidence, and sovereign data security
          </h2>
          <p className="text-slate-600 text-sm sm:text-base mt-3 leading-relaxed font-normal">
            Four core standards applied to every submission and correlation report generated on QEEG.com.au.
          </p>
        </div>

        {/* Value Banner Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {highlights.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className="flex items-start gap-4 p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-slate-300 hover:-translate-y-1 transition-all duration-300 group cursor-default"
              >
                <div className="w-11 h-11 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 group-hover:scale-105 group-hover:bg-slate-200/70 transition-all duration-300">
                  <Icon className="w-5 h-5 text-[#16233B]" />
                </div>
                <div className="flex flex-col">
                  <h3 className="text-sm font-semibold text-[#16233B] tracking-tight group-hover:text-slate-900 transition-colors">
                    {item.bullet}
                  </h3>
                  <span className="text-xs text-slate-500 mt-1 leading-relaxed">
                    {item.detail}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
