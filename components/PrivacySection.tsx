import Link from "next/link";
import { ArrowRight, Server, Shield, Trash2, CheckCircle2 } from "lucide-react";

export default function PrivacySection() {
  const securityFacts = [
    {
      icon: Server,
      dotColor: "bg-slate-800 text-sky-400 border-slate-700",
      title: "Hosted in Sydney",
      description: "Everything runs on Australian infrastructure.",
    },
    {
      icon: Shield,
      dotColor: "bg-slate-800 text-slate-300 border-slate-700",
      title: "De-identified before upload",
      description: "Only age and gender — no names, no dates, ever transmitted.",
    },
    {
      icon: Trash2,
      dotColor: "bg-slate-800 text-amber-400 border-slate-700",
      title: "Purged the moment you download",
      description: "No fixed retention window.",
    },
  ];

  return (
    <section id="privacy" className="py-20 sm:py-28 bg-[#16233B] text-white border-t border-slate-800 relative overflow-hidden">
      {/* Background Subtle Gradient Glow */}
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-[#1C2F4A]/40 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column: Eyebrow, Heading, Paragraph & Action Link */}
          <div className="lg:col-span-6 flex flex-col items-start">
            <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-slate-800/80 border border-slate-700/80 text-[11px] font-semibold tracking-[0.22em] text-slate-300 uppercase mb-5 font-sans">
              <span>DATA HANDLING</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-serif font-normal text-white tracking-tight leading-tight mb-6">
              Your client&apos;s data doesn&apos;t sit around waiting to be a liability
            </h2>

            <p className="text-slate-300 text-base sm:text-lg leading-relaxed font-normal max-w-xl mb-8">
              De-identified in your browser before anything is sent. Purged from our servers the moment you download.
            </p>

            <div>
              <Link
                href="#privacy"
                className="inline-flex items-center gap-2 px-6 py-3.5 text-sm font-semibold text-white bg-slate-800/80 hover:bg-slate-700/90 border border-slate-600/80 hover:border-slate-500 rounded-xl hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 group"
              >
                <span>Read the full data policy</span>
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:translate-x-1.5 group-hover:text-white transition-all duration-200" />
              </Link>
            </div>
          </div>

          {/* Right Column: 3 Security Highlight Points */}
          <div className="lg:col-span-6 flex flex-col gap-5">
            {securityFacts.map((fact, index) => {
              const Icon = fact.icon;
              return (
                <div
                  key={index}
                  className="bg-[#142033] border border-slate-700/80 hover:border-slate-600 rounded-2xl p-6 transition-all duration-300 group hover:-translate-y-0.5 flex items-start gap-4.5"
                >
                  <div className={`w-11 h-11 rounded-xl border flex items-center justify-center shrink-0 ${fact.dotColor} group-hover:scale-105 transition-transform duration-200`}>
                    <Icon className="w-5 h-5" />
                  </div>

                  <div className="flex-1">
                    <h3 className="text-base sm:text-lg font-semibold text-white tracking-tight mb-1 group-hover:text-slate-200 transition-colors">
                      {fact.title}
                    </h3>

                    <p className="text-slate-300 text-xs sm:text-sm leading-relaxed font-normal">
                      {fact.description}
                    </p>
                  </div>
                </div>
              );
            })}

            {/* Zero Retention Micro-Banner */}
            <div className="mt-2 p-4 rounded-xl bg-[#1C2F4A] border border-slate-700 flex items-center gap-3 text-xs text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" />
              <span>Zero client identifiable records retained post-download. Complete cryptographic purge.</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
