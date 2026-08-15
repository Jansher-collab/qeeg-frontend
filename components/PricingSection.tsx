import Link from "next/link";
import { ShieldCheck, ArrowRight } from "lucide-react";

export default function PricingSection() {
  const features = [
    "No monthly subscription or setup fees",
    "Pay only when report is compiled and approved",
    "Server-side reliability check included (0.80 threshold)",
    "PubMed and Semantic Scholar literature correlation",
    "Clinical Neuroscientist verification queue",
    "Purge-on-download security protocol",
  ];

  return (
    <section id="pricing" className="py-16 sm:py-24 bg-[#F3F6F8] border-t border-slate-200 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="text-[11px] font-semibold tracking-[0.22em] text-slate-500 uppercase mb-3 font-sans">
            PRICING
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-[40px] font-serif font-normal text-[#16233B] tracking-tight leading-tight">
            One price, no subscription
          </h2>
        </div>

        {/* Centered Clean White Pricing Card with Hover Lift */}
        <div className="max-w-lg mx-auto">
          <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200 shadow-sm hover:shadow-xl hover:border-slate-300 transition-all duration-300 relative group hover:-translate-y-1">
            {/* Badge */}
            <div className="absolute top-7 right-7">
              <span className="inline-flex items-center px-3 py-1 rounded-md bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold">
                Zero Risk Guarantee
              </span>
            </div>

            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Pay-Per-Report
            </div>

            {/* Price Display */}
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-5xl sm:text-6xl font-serif font-normal tracking-tight text-[#16233B]">
                $65
              </span>
              <span className="text-lg font-bold text-slate-700">AUD</span>
              <span className="text-slate-500 font-medium text-xs">/ report</span>
            </div>

            {/* Description */}
            <p className="mt-4 text-slate-600 text-xs sm:text-sm leading-relaxed border-b border-slate-100 pb-6 font-normal">
              You are only charged once your report clears review and is ready, never for a submission that fails the reliability threshold.
            </p>

            {/* Feature Checklist */}
            <div className="py-6 flex flex-col gap-3.5">
              {features.map((feature, idx) => (
                <div key={idx} className="flex items-center gap-3 text-xs sm:text-sm text-slate-700 font-normal">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 group-hover:bg-slate-700 transition-colors shrink-0" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>

            {/* CTA Button with Smooth Hover */}
            <div className="mt-4 pt-4 border-t border-slate-100">
              <Link
                href="#signup"
                className="w-full py-3.5 px-5 text-sm font-semibold text-white bg-[#182638] hover:bg-[#111A27] rounded-xl shadow-xs hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 flex items-center justify-center gap-2 group/btn"
              >
                <span>Create your free account</span>
                <ArrowRight className="w-4 h-4 text-white group-hover/btn:translate-x-1 transition-transform duration-200" />
              </Link>
              <div className="mt-3.5 text-center text-xs text-slate-500 flex items-center justify-center gap-1.5 font-normal">
                <ShieldCheck className="w-4 h-4 text-slate-500" />
                <span>Free registration · Instant portal access</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
