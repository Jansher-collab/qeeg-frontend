import { UserCheck, BookOpen, Building2, ShieldAlert, CheckCircle2 } from "lucide-react";

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
    <section className="bg-[#F3F6F8] border-y border-slate-200 py-6 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {highlights.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className="flex items-center gap-3.5 p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs"
              >
                <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-emerald-600" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-[#16233B] tracking-tight flex items-center gap-1">
                    <span>{item.title}</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  </span>
                  <span className="text-xs text-slate-500 mt-0.5 leading-snug">
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
