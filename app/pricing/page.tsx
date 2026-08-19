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
  Sparkles,
  Database,
  FileText,
  Check,
} from "lucide-react";

export default function PricingPage() {
  const cardFeatures = [
    "Full QEEG, TOVA & symptom correlation",
    "Evidence mapped to PubMed & curated research",
    "Zero charge if reliability is below 0.80",
    "Instant data purge upon completed download",
  ];

  const inclusions = [
    {
      title: "Complete 3-Source Correlation",
      description:
        "QEEG z-scored asymmetry, objective TOVA attentional metrics, and 11-domain symptom checklist synthesized.",
      icon: Database,
    },
    {
      title: "Live PubMed & Curated Library Match",
      description:
        "Every finding mapped to verified peer-reviewed studies with trace IDs, DOI links, and clear disclosures.",
      icon: Sparkles,
    },
    {
      title: "Instant Server Purge Guarantee",
      description:
        "Data, checklist entries, and final report are permanently deleted the millisecond your download finishes.",
      icon: ShieldCheck,
    },
  ];

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
      {/* 1. Page Hero Section */}
      <section className="relative pt-28 pb-16 md:pt-32 md:pb-24 overflow-hidden bg-[#16233B] text-white border-b border-slate-800 text-left">
        {/* Background Subtle Glows */}
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-[#1C2F4A]/40 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 -right-32 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Eyebrow */}
          <div className="inline-flex items-center px-3.5 py-1.5 rounded-full bg-slate-800/90 border border-slate-700/80 text-[11px] font-semibold tracking-[0.2em] text-slate-300 uppercase mb-5 font-sans">
            <span>Transparent Pricing</span>
          </div>

          {/* Main Heading in Lora Serif */}
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-[42px] font-serif font-normal text-white leading-[1.2] tracking-tight mb-4 max-w-3xl">
            One price, no subscription
          </h1>

          {/* Lede Paragraph */}
          <p className="text-sm sm:text-base md:text-[17px] text-slate-300 font-normal max-w-2xl leading-relaxed">
            You&apos;re only ever charged for a report that&apos;s actually produced.
          </p>
        </div>
      </section>

      {/* 2. Elevated & Smooth Pricing Card Section */}
      <section className="py-14 sm:py-20 -mt-10 sm:-mt-14 relative z-20">
        <div className="max-w-lg mx-auto px-4 sm:px-6">
          <div className="bg-white rounded-[28px] p-8 sm:p-12 sm:py-16 border-2 border-slate-200/90 hover:border-slate-300 transition-all duration-300 text-center flex flex-col justify-between relative overflow-hidden">
            {/* Top Area: Badge & Price */}
            <div>
              {/* Badge */}
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-100 border border-slate-200/80 text-[11px] font-semibold text-[#16233B] uppercase tracking-wider mb-8 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
                <span>Pay-Per-Report</span>
              </div>

              {/* Price Display */}
              <div className="flex items-baseline justify-center gap-2.5 mb-4">
                <span className="text-5xl sm:text-6xl font-serif font-normal text-[#16233B] tracking-tight">
                  $65
                </span>
                <span className="text-base sm:text-lg text-slate-700 font-bold font-sans">
                  AUD
                </span>
                <span className="text-xs text-slate-500 font-medium font-sans">
                  / report
                </span>
              </div>

              {/* Price Lede */}
              <p className="text-slate-600 text-xs sm:text-sm font-normal max-w-xs mx-auto mb-10 leading-relaxed">
                Charged once generated. No subscription, no recurring commitments.
              </p>

              {/* Feature Checklist inside Card */}
              <div className="py-8 border-y border-slate-100 space-y-4 text-left mb-10">
                {cardFeatures.map((feat, idx) => (
                  <div key={idx} className="flex items-center gap-3.5 text-xs sm:text-sm text-slate-700 font-normal">
                    <div className="w-5 h-5 rounded-full bg-slate-100 border border-slate-200/90 flex items-center justify-center shrink-0 text-[#16233B]">
                      <Check className="w-3 h-3 text-[#16233B]" />
                    </div>
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Area: Action CTA */}
            <div className="flex flex-col items-center gap-4">
              <Link
                href="/signup"
                className="w-full py-4 px-8 text-sm font-semibold text-white bg-[#16233B] hover:bg-slate-800 rounded-xl hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 flex items-center justify-center gap-2 group"
              >
                <span>Create free account</span>
                <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-1 transition-transform duration-200" />
              </Link>

              <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-slate-500 font-normal pt-1">
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                <span>Free to register. You only pay when a report is produced.</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Inclusions 3-Card Grid */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-xl sm:text-2xl font-serif font-normal text-[#16233B] tracking-tight">
              What is included in every $65 report
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {inclusions.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs hover:shadow-md hover:border-slate-300 transition-all duration-200 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-[#16233B] shadow-2xs">
                      <Icon className="w-4.5 h-4.5" />
                    </div>
                    <h3 className="text-base font-serif font-normal text-[#16233B] tracking-tight">
                      {item.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 font-normal leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. 4-Card Billing Mechanics Grid */}
      <section className="py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-xl sm:text-2xl lg:text-[28px] font-serif font-normal text-[#16233B] tracking-tight leading-snug">
              Clear rules on when you pay and when you don&apos;t
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
            {billingCards.map((card, index) => {
              const Icon = card.icon;
              return (
                <div
                  key={index}
                  className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 shadow-2xs hover:shadow-sm hover:border-slate-300 hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between"
                >
                  <div>
                    <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-[#16233B] mb-4 shadow-2xs">
                      <Icon className="w-4.5 h-4.5" />
                    </div>
                    <h3 className="text-base sm:text-lg font-serif font-normal text-[#16233B] tracking-tight mb-2">
                      {card.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 font-normal leading-relaxed">
                      {card.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. Final Call to Action Section */}
      <section className="pb-14 sm:pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#16233B] rounded-3xl p-7 sm:p-10 text-white border border-slate-800 shadow-xl text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6 hover:border-slate-700 transition-colors">
            <div className="space-y-1.5 max-w-lg">
              <h3 className="text-xl sm:text-2xl font-serif font-normal text-white tracking-tight leading-snug">
                Ready to submit your first case?
              </h3>
              <p className="text-slate-300 text-xs sm:text-sm font-normal">
                Sign up free. Check your QEEG reliability locally before any upload occurs.
              </p>
            </div>

            <Link
              href="/signup"
              className="px-6 py-3.5 text-xs sm:text-sm font-semibold text-[#16233B] bg-white hover:bg-slate-100 rounded-xl shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 flex items-center gap-2 shrink-0 group"
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
