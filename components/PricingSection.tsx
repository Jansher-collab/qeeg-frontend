import Link from "next/link";
import { ShieldCheck, ArrowRight, Check } from "lucide-react";

export default function PricingSection() {
  const features = [
    "No subscription or recurring monthly fees",
    "Only charged when report is generated",
    "Server-side reliability check (≥ 0.80 threshold)",
    "PubMed and Semantic Scholar literature correlations",
    "AI-generated correlation engine with transparency notices",
    "Purged immediately upon download",
  ];

  return (
    <section id="pricing" className="py-20 sm:py-28 bg-[#F4F7F9]/80 border-t border-slate-200 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-200/80 text-[11px] font-semibold tracking-[0.22em] text-slate-700 uppercase mb-4 font-sans">
            PRICING
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-serif font-normal text-[#16233B] tracking-tight leading-tight">
            One price, no subscription
          </h2>
        </div>

        {/* Centered Clean Pricing Card */}
        <div className="max-w-lg mx-auto">
          <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200 shadow-lg hover:shadow-2xl hover:border-slate-300 transition-all duration-300 relative group hover:-translate-y-1">
            {/* Top Badge */}
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider font-sans">
                Pay-Per-Report
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-800 border border-slate-200 text-xs font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-[#16233B]" />
                Zero Risk Guarantee
              </span>
            </div>

            {/* Price Display */}
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-5xl sm:text-6xl font-serif font-normal tracking-tight text-[#16233B]">
                $65
              </span>
              <span className="text-lg font-bold text-slate-700 font-sans">AUD</span>
              <span className="text-slate-500 font-medium text-xs">/ report</span>
            </div>

            {/* Exact Description */}
            <p className="mt-4 text-slate-600 text-sm leading-relaxed border-b border-slate-100 pb-6 font-normal">
              You&apos;re only charged once your report is generated, and never for a submission that doesn&apos;t meet the reliability threshold.
            </p>

            {/* Feature Checklist */}
            <div className="py-6 flex flex-col gap-3.5">
              {features.map((feature, idx) => (
                <div key={idx} className="flex items-center gap-3 text-xs sm:text-sm text-slate-700 font-normal">
                  <div className="w-5 h-5 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 text-[#16233B]" />
                  </div>
                  <span>{feature}</span>
                </div>
              ))}
            </div>

            {/* CTA Button */}
            <div className="mt-2 pt-4 border-t border-slate-100">
              <Link
                href="/signup"
                className="w-full py-3.5 px-5 text-sm font-semibold text-white bg-[#182638] hover:bg-[#111A27] rounded-xl shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 flex items-center justify-center gap-2 group/btn"
              >
                <span>Create your free account</span>
                <ArrowRight className="w-4 h-4 text-white group-hover/btn:translate-x-1 transition-transform duration-200" />
              </Link>
              <div className="mt-3.5 text-center text-xs text-slate-500 flex items-center justify-center gap-1.5 font-normal">
                <ShieldCheck className="w-4 h-4 text-slate-600" />
                <span>Free registration · No upfront payment method required</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
