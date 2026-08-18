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
        "Your file is rejected before it is even uploaded: nothing is sent, and there is no charge at all. Resubmit with a QEEG that meets the threshold.",
      icon: ShieldCheck,
    },
    {
      title: "Report generated successfully?",
      description:
        "That is the moment your $65 authorisation is captured, not before, and not for a rejected submission.",
      icon: CheckCircle2,
    },
    {
      title: "Need to resubmit corrected data?",
      description:
        "A reiteration is a new report request from scratch: a new upload, a new reliability check, and (if it succeeds) a new $65 charge.",
      icon: RotateCcw,
    },
    {
      title: "How you're charged",
      description:
        "Via PayPal, authorised at upload and only captured on success: you can see the authorisation before anything is taken.",
      icon: CreditCard,
    },
  ];

  return (
    <div className="bg-slate-50 text-slate-900 font-sans animate-fadeIn">
      {/* 1. Page Hero Section (Centered Layout) */}
      <section className="relative pt-28 pb-16 md:pt-32 md:pb-24 overflow-hidden bg-[#16233B] text-white border-b border-slate-800 text-center">
        {/* Background Subtle Glows */}
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-[#1C2F4A]/40 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 -right-32 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Eyebrow */}
          <div className="inline-flex items-center px-3.5 py-1.5 rounded-full bg-slate-800/90 border border-slate-700/80 text-[11px] font-semibold tracking-[0.2em] text-slate-300 uppercase mb-5 font-sans">
            <span>Pricing</span>
          </div>

          {/* Main Heading in Lora Serif */}
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-[42px] font-serif font-normal text-white leading-[1.2] tracking-tight mb-4">
            One price, no subscription
          </h1>

          {/* Lede Paragraph */}
          <p className="text-sm sm:text-base md:text-[17px] text-slate-300 font-normal max-w-2xl mx-auto leading-relaxed">
            You&apos;re only ever charged for a report that&apos;s actually produced.
          </p>
        </div>
      </section>

      {/* 2. Pricing Card Hero Section */}
      <section className="py-14 sm:py-18 -mt-10 sm:-mt-14 relative z-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl p-8 sm:p-11 border border-slate-200 shadow-xl hover:shadow-2xl hover:border-slate-300 transition-all duration-300 text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-semibold text-[#16233B] uppercase tracking-wider mb-5">
              <span>Pay-Per-Report</span>
            </div>

            {/* Price Display */}
            <div className="flex items-baseline justify-center gap-2 mb-3.5">
              <span className="text-4xl sm:text-5xl md:text-6xl font-serif font-normal text-[#16233B] tracking-tight">
                $65
              </span>
              <span className="text-lg sm:text-xl text-slate-500 font-medium font-sans">
                AUD / report
              </span>
            </div>

            {/* Price Lede */}
            <p className="text-slate-600 text-sm sm:text-base font-normal max-w-md mx-auto mb-8 leading-relaxed">
              Charged once generated. No subscription, no monthly fee, no commitment.
            </p>

            {/* Action CTA */}
            <div className="flex flex-col items-center gap-4">
              <Link
                href="/signup"
                className="w-full sm:w-auto px-8 py-4 text-sm font-semibold text-white bg-[#16233B] hover:bg-slate-800 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 flex items-center justify-center gap-2 group"
              >
                <span>Create free account</span>
                <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-1 transition-transform duration-200" />
              </Link>

              <span className="text-xs text-slate-500 font-normal">
                Free to register. You only pay when a report is produced.
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. 4-Card Billing Mechanics Grid */}
      <section className="py-12 sm:py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-xl sm:text-2xl lg:text-[30px] font-serif font-normal text-[#16233B] tracking-tight leading-snug">
              Clear rules on when you pay and when you don&apos;t
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {billingCards.map((card, index) => {
              const Icon = card.icon;
              return (
                <div
                  key={index}
                  className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xs hover:shadow-sm hover:border-slate-300 hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    <div className="w-10 h-10 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center text-[#16233B] mb-5 shadow-2xs">
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
      <section className="pb-16 sm:pb-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#16233B] rounded-3xl p-8 sm:p-12 text-white border border-slate-800 shadow-xl text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-8 hover:border-slate-700 transition-colors">
            <div className="space-y-2 max-w-lg">
              <h3 className="text-2xl sm:text-3xl font-serif font-normal text-white tracking-tight leading-snug">
                Ready to submit your first case?
              </h3>
              <p className="text-slate-300 text-sm sm:text-base font-normal">
                Sign up free. Check your QEEG reliability locally before any upload occurs.
              </p>
            </div>

            <Link
              href="/signup"
              className="px-6 py-3.5 text-sm font-semibold text-[#16233B] bg-white hover:bg-slate-100 rounded-xl shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 flex items-center gap-2 shrink-0 group"
            >
              <span>Get started</span>
              <ArrowRight className="w-4 h-4 text-[#16233B] group-hover:translate-x-1 transition-transform duration-200" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
