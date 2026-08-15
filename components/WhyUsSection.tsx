import { Clock, BookOpen, ShieldCheck, Check } from "lucide-react";

export default function WhyUsSection() {
  const cards = [
    {
      icon: Clock,
      title: "Fast turnaround",
      description:
        "Your report moves through a dedicated review queue — not a general clinic waitlist — so it isn't left behind unrelated appointments.",
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
        "Every correlation traces to peer-reviewed literature — PubMed, Semantic Scholar, and a hand-curated library — not general web content.",
      highlights: [
        "Direct PubMed & S2 paper links",
        "Peer-reviewed citation mapping",
        "5 clinical domain coverage",
      ],
    },
    {
      icon: ShieldCheck,
      title: "AHPRA-conscious reporting",
      description:
        "Reports state what the research shows and stop there — no clinical recommendations — so using QEEG.com.au sits comfortably within your own scope-of-practice obligations.",
      highlights: [
        "Correlations, not diagnoses",
        "Strict scope-of-practice alignment",
        "Referrer decision support tool",
      ],
    },
  ];

  return (
    <section id="why-us" className="py-20 bg-white border-t border-slate-200 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#F3F6F8] border border-slate-200 text-xs font-semibold text-[#16233B] uppercase tracking-wider mb-3">
            <span>Why practitioners choose us</span>
          </div>

          <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-[#16233B] tracking-tight">
            Built for referrers who need the evidence, not just the reading list
          </h2>
        </div>

        {/* 3 Clean White Cards */}
        <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-8">
          {cards.map((card, index) => {
            const Icon = card.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-2xl p-7 border border-slate-200 shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center mb-5">
                    <Icon className="w-6 h-6 text-emerald-600" />
                  </div>

                  <h3 className="text-xl font-semibold text-[#16233B] tracking-tight mb-2.5">
                    {card.title}
                  </h3>

                  <p className="text-slate-600 text-sm leading-relaxed mb-6">
                    {card.description}
                  </p>
                </div>

                <div className="pt-5 border-t border-slate-100 flex flex-col gap-2">
                  {card.highlights.map((h, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs font-medium text-slate-700">
                      <div className="w-4 h-4 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                        <Check className="w-2.5 h-2.5 text-emerald-700" />
                      </div>
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
