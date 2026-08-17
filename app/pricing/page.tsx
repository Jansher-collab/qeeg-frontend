import Link from "next/link";
import {
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  RotateCcw,
  FileCheck,
  Lock,
} from "lucide-react";

export default function PricingPage() {
  const billingCards = [
    {
      title: "Reliability below 0.80?",
      description:
        "Your file is rejected before it's even uploaded — nothing is sent, and there's no charge at all. Resubmit with a QEEG that meets the threshold.",
      icon: ShieldCheck,
    },
    {
      title: "Report generated successfully?",
      description:
        "That's the moment your $65 authorisation is captured — not before, and not for a rejected submission.",
      icon: CheckCircle2,
    },
    {
      title: "Need to resubmit corrected data?",
      description:
        "A reiteration is a new report request from scratch — a new upload, a new reliability check, and (if it succeeds) a new $65 charge. No discount for the earlier attempt.",
      icon: RotateCcw,
    },
    {
      title: "How you're charged",
      description:
        "Via PayPal, authorised at upload and only captured on success — you can see the authorisation before anything is taken.",
      icon: CreditCard,
    },
  ];

  return (
    <div className="bg-slate-50 text-slate-900 font-sans animate-fadeIn">
      {/* 1. Page Hero Section (Centered Layout) */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden bg-[#16233B] text-white border-b border-slate-800 text-center">
        {/* Background Subtle Glows */}
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-[#1C2F4A]/40 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 -right-32 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Eyebrow */}
          <div className="inline-flex items-center px-3.5 py-1.5 rounded-full bg-slate-800/90 border border-slate-700/80 text-[11px] font-semibold tracking-[0.22em] text-slate-300 uppercase mb-6 font-sans">
            <span>Pricing</span>
          </div>

          {/* Main Heading in Lora Serif */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[54px] font-serif font-normal text-white leading-[1.15] tracking-tight mb-6">
            One price, no subscription
          </h1>

          {/* Lede Paragraph */}
          <p className="text-base sm:text-lg md:text-xl text-slate-300 font-normal max-w-2xl mx-auto leading-relaxed">
            You&apos;re only ever charged for a report that&apos;s actually produced.
          </p>
        </div>
      </section>

      {/* 2. Pricing Card Hero Section */}
      <section className="py-16 sm:py-20 -mt-10 sm:-mt-14 relative z-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-xl hover:shadow-2xl hover:border-slate-300 transition-all duration-300 text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-semibold text-[#16233B] uppercase tracking-wider mb-6">
              <span>Pay-Per-Report</span>
            </div>

            {/* Price Display */}
            <div className="flex items-baseline justify-center gap-2 mb-4">
              <span className="text-5xl sm:text-6xl md:text-7xl font-serif font-normal text-[#16233B] tracking-tight">
                $65
              </span>
              <span className="text-lg sm:text-xl text-slate-500 font-medium font-sans">
                AUD / report
              </span>
            </div>

            {/* Description */}
            <p className="text-sm sm:text-base text-slate-600 font-normal max-w-md mx-auto mb-8 leading-relaxed">
              Charged once your report is successfully generated.
            </p>

            {/* Value Guarantees */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 max-w-lg mx-auto mb-10 text-left">
              <div className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-[#16233B] shrink-0 mt-0.5" />
                <span>Zero monthly subscription or hidden fees</span>
              </div>
              <div className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-[#16233B] shrink-0 mt-0.5" />
                <span>Zero charge if reliability &lt; 0.80</span>
              </div>
              <div className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-[#16233B] shrink-0 mt-0.5" />
                <span>NeuroGuide .tdt & TOVA correlation</span>
              </div>
              <div className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-[#16233B] shrink-0 mt-0.5" />
                <span>Full peer-reviewed PubMed citations</span>
              </div>
            </div>

            {/* Action Button */}
            <div className="max-w-md mx-auto">
              <Link
                href="/signup"
                className="w-full py-4 px-8 text-base font-semibold text-white bg-[#182638] hover:bg-[#111A27] rounded-2xl shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 flex items-center justify-center gap-2 group"
              >
                <span>Create your free account</span>
                <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-1 transition-transform duration-200" />
              </Link>
              <span className="text-xs text-slate-400 font-normal mt-3 block">
                No credit card required to register · Sydney Sovereign Infrastructure
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. "How billing actually works" Section (2-Column Grid of Cards) */}
      <section className="py-12 sm:py-20 border-t border-slate-200/80 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest block mb-2 font-sans">
              Rules & Mechanics
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-normal text-[#16233B] tracking-tight">
              How billing actually works
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {billingCards.map((card, index) => {
              const Icon = card.icon;
              return (
                <div
                  key={index}
                  className="bg-slate-50/70 hover:bg-slate-50 rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-2xs hover:shadow-sm hover:border-slate-300 hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    <div className="w-10 h-10 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-[#16233B] mb-5 shadow-2xs">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-serif font-normal text-[#16233B] tracking-tight mb-3">
                      {card.title}
                    </h3>
                    <p className="text-sm text-slate-600 font-normal leading-relaxed">
                      {card.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. Final Call to Action Section */}
      <section className="py-16 sm:py-24 bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#16233B] rounded-3xl p-8 sm:p-14 text-white border border-slate-800 shadow-xl text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-8 hover:border-slate-700 transition-colors">
            <div className="space-y-2 max-w-lg">
              <h3 className="text-2xl sm:text-3xl md:text-4xl font-serif font-normal text-white tracking-tight leading-snug">
                Ready to get started?
              </h3>
              <p className="text-slate-300 text-sm sm:text-base font-normal">
                Free to sign up. Pay only when a report is produced.
              </p>
            </div>

            <Link
              href="/signup"
              className="px-7 py-4 text-sm font-semibold text-[#16233B] bg-white hover:bg-slate-100 rounded-xl shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 flex items-center gap-2 shrink-0 group"
            >
              <span>Create your free account</span>
              <ArrowRight className="w-4 h-4 text-[#16233B] group-hover:translate-x-1 transition-transform duration-200" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
