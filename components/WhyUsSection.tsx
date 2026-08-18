import { Zap, BookOpen, ShieldCheck, ArrowUpRight } from "lucide-react";

export default function WhyUsSection() {
  const cards = [
    {
      icon: Zap,
      title: "Fast turnaround",
      description:
        "Your report moves through a dedicated processing queue rather than a general clinic waitlist.",
      badge: "Rapid Processing",
      accentColor: "text-slate-700 bg-slate-100 border-slate-200",
      highlights: [
        "Dedicated processing queue",
        "No general clinic waitlists",
        "Fast turnaround times",
      ],
    },
    {
      icon: BookOpen,
      title: "Curated, published correlations",
      description:
        "Every correlation traces to peer-reviewed literature across PubMed, Semantic Scholar, and a hand-curated library.",
      badge: "Peer-Reviewed",
      accentColor: "text-[#16233B] bg-slate-100 border-slate-200",
      highlights: [
        "PubMed & Semantic Scholar links",
        "Hand-curated citation database",
        "Multi-domain correlation mapping",
      ],
    },
    {
      icon: ShieldCheck,
      title: "AHPRA-conscious reporting",
      description:
        "Reports state what the research shows and stop there, providing zero clinical recommendations.",
      badge: "Practitioner-Safe",
      accentColor: "text-slate-700 bg-slate-100 border-slate-200",
      highlights: [
        "Correlations, not recommendations",
        "Strict scope-of-practice boundary",
        "Clinical consideration support",
      ],
    },
  ];

  return (
    <section id="why-us" className="py-20 sm:py-28 bg-[#F8FAFC] border-t border-slate-200 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-200/80 text-[11px] font-semibold tracking-[0.22em] text-slate-700 uppercase mb-4 font-sans">
            WHY PRACTITIONERS CHOOSE US
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-serif font-normal text-[#16233B] leading-tight tracking-tight">
            Built for referrers who need the evidence, not just the reading list
          </h2>
        </div>

        {/* 3 Grid Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {cards.map((card, index) => {
            const Icon = card.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-3xl p-8 sm:p-9 border border-slate-200 shadow-sm hover:shadow-xl hover:border-slate-300 hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className={`w-12 h-12 rounded-2xl ${card.accentColor} border flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200/80">
                      {card.badge}
                    </span>
                  </div>

                  <h3 className="text-xl font-semibold text-[#16233B] tracking-tight mb-3 group-hover:text-slate-900 transition-colors">
                    {card.title}
                  </h3>

                  <p className="text-slate-600 text-sm leading-relaxed mb-6 font-normal">
                    {card.description}
                  </p>
                </div>

                <div className="pt-6 border-t border-slate-100 flex flex-col gap-2.5">
                  {card.highlights.map((h, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs font-medium text-slate-600">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400 group-hover:bg-[#16233B] transition-colors shrink-0" />
                      <span>{h}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
