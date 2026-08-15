import { UserCheck, BookOpen, Building2, ShieldAlert } from "lucide-react";

export default function TrustStrip() {
  const highlights = [
    {
      icon: UserCheck,
      title: "Neuroscientist-reviewed",
      subtitle: "Human expertise confirming every pattern",
    },
    {
      icon: BookOpen,
      title: "Published-literature correlations",
      subtitle: "PubMed & Semantic Scholar citation links",
    },
    {
      icon: Building2,
      title: "Australian-hosted, Sydney",
      subtitle: "Strict local data sovereignty compliance",
    },
    {
      icon: ShieldAlert,
      title: "Purged after you download",
      subtitle: "Zero server footprint once delivered",
    },
  ];

  return (
    <section className="bg-[#F3F6F8] border-y border-slate-200 py-14 sm:py-16 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="max-w-3xl mb-10">
          <div className="text-[11px] font-semibold tracking-[0.22em] text-slate-500 uppercase mb-2.5 font-sans">
            CLINICAL INTEGRITY
          </div>

          <h2 className="text-2xl sm:text-3xl font-serif font-normal text-[#16233B] tracking-tight">
            Evidence-based, practitioner-focused reporting
          </h2>

          <p className="mt-2 text-slate-600 text-sm leading-relaxed max-w-2xl font-normal">
            Built specifically to meet the evidentiary and scope requirements of Australian referring practitioners.
          </p>
        </div>

        {/* 4 Cards Grid with Smooth Hover Lift & Elevation */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {highlights.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className="flex items-center gap-4 p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs hover:shadow-md hover:border-slate-300 hover:-translate-y-1 transition-all duration-300 group cursor-default"
              >
                <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0 group-hover:scale-105 group-hover:bg-slate-100 transition-all duration-300">
                  <Icon className="w-6 h-6 text-[#16233B]" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-[#16233B] tracking-tight group-hover:text-slate-900 transition-colors">
                    {item.title}
                  </span>
                  <span className="text-xs text-slate-500 mt-1 leading-snug">
                    {item.subtitle}
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
