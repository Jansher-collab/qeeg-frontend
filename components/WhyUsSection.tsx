import { Clock, BookOpen, ShieldCheck } from "lucide-react";

export default function WhyUsSection() {
  const cards = [
    {
      icon: Clock,
      title: "Fast turnaround",
      description:
        "Your report moves through a dedicated review queue rather than a general clinic waitlist, preventing delays from unrelated appointments.",
      highlights: [
        "Dedicated clinical queue",
        "No clinic appointment delays",
        "Real-time processing status",
      ],
    },
    {
      icon: BookOpen,
      title: "Curated, published correlations",
      description:
        "Every correlation traces directly to peer-reviewed literature in PubMed, Semantic Scholar, and our curated library, not unverified web content.",
      highlights: [
        "Direct PubMed and S2 paper links",
        "Peer-reviewed citation mapping",
        "5 clinical domain coverage",
      ],
    },
    {
      icon: ShieldCheck,
      title: "AHPRA-conscious reporting",
      description:
        "Reports state what the published research shows without clinical recommendations, fitting naturally within your own scope-of-practice obligations.",
      highlights: [
        "Correlations, not diagnoses",
        "Strict scope-of-practice alignment",
        "Referrer decision support tool",
      ],
    },
  ];

  return (
    <section id="why-us" className="py-16 sm:py-24 bg-[#F3F6F8] border-t border-slate-200 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-14">
          <div className="text-[11px] font-semibold tracking-[0.22em] text-slate-500 uppercase mb-3 font-sans">
            WHY PRACTITIONERS CHOOSE US
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-[40px] font-serif font-normal text-[#16233B] leading-tight tracking-tight">
            Built for referrers who need the evidence, not just the reading list
          </h2>
        </div>

        {/* 3 Clean White Cards with Refined Hover Interactions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {cards.map((card, index) => {
            const Icon = card.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm hover:shadow-xl hover:border-slate-300 hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center mb-6 group-hover:scale-105 group-hover:bg-slate-100 transition-all duration-300">
                    <Icon className="w-6 h-6 text-[#16233B]" />
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
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400 group-hover:bg-slate-700 transition-colors shrink-0" />
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
