import Link from "next/link";
import { Check, ShieldCheck, ArrowRight } from "lucide-react";

export default function PricingSection() {
  const features = [
    "No monthly subscription or setup fees",
    "Pay only when report is compiled & approved",
    "Server-side >= 0.80 reliability check included",
    "PubMed & Semantic Scholar literature correlation",
    "Clinical Neuroscientist verification queue",
    "Purge-on-download security protocol",
  ];

  return (
    <section id="pricing" className="py-20 bg-white border-t border-slate-200 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#F3F6F8] border border-slate-200 text-xs font-semibold text-[#16233B] uppercase tracking-wider mb-3">
            <span>Pricing</span>
          </div>

          <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-[#16233B] tracking-tight">
            One price, no subscription
          </h2>
        </div>

        {/* Centered Clean White Pricing Card */}
        <div className="mt-12 max-w-lg mx-auto">
          <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm relative">
            {/* Badge */}
            <div className="absolute top-6 right-6">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold">
                <span>Zero Risk Guarantee</span>
              </span>
            </div>

            <div className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">
              Pay-Per-Report
            </div>

            {/* Price Display */}
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-4xl sm:text-5xl font-bold tracking-tight text-[#16233B] font-sans">
                $65
              </span>
              <span className="text-lg font-bold text-slate-700">AUD</span>
              <span className="text-slate-500 font-medium text-xs">/ report</span>
            </div>

            {/* Description */}
            <p className="mt-3 text-slate-600 text-xs leading-relaxed border-b border-slate-100 pb-5">
              You&apos;re only charged once your report clears review and is ready — never for a submission that doesn&apos;t meet the reliability threshold.
            </p>

            {/* Feature Checklist */}
            <div className="py-5 flex flex-col gap-3">
              {features.map((feature, idx) => (
                <div key={idx} className="flex items-center gap-2.5 text-xs text-slate-700 font-medium">
                  <div className="w-4 h-4 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                    <Check className="w-2.5 h-2.5 text-emerald-700" />
                  </div>
                  <span>{feature}</span>
                </div>
              ))}
            </div>

            {/* CTA Button */}
            <div className="mt-3 pt-3 border-t border-slate-100">
              <Link
                href="#signup"
                className="w-full py-3.5 px-5 text-sm font-semibold text-white bg-emerald-500 hover:bg-emerald-600 rounded-xl shadow-xs transition-all flex items-center justify-center gap-2"
              >
                <span>Create your free account</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <div className="mt-3 text-center text-xs text-slate-500 flex items-center justify-center gap-1.5 font-medium">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Free registration · Instant portal access</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
