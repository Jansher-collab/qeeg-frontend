import Link from "next/link";
import { ShieldCheck, MapPin, Lock, Trash2, ArrowRight } from "lucide-react";

export default function PrivacySection() {
  const securityFacts = [
    {
      icon: MapPin,
      title: "Hosted in Sydney",
      description:
        "Everything runs on Australian infrastructure — nothing crosses a border to be processed.",
      badge: "Local Data Sovereignty",
    },
    {
      icon: Lock,
      title: "Encrypted end to end",
      description:
        "In transit and at rest, for as long as anything exists on the platform at all.",
      badge: "AES-256 & TLS 1.3",
    },
    {
      icon: Trash2,
      title: "Purged the moment you download",
      description:
        "QEEG, TOVA, checklist, and report — all deleted the instant your download completes. No fixed retention window.",
      badge: "Zero Retention Policy",
    },
  ];

  return (
    <section id="privacy" className="py-20 bg-[#F3F6F8] border-t border-slate-200 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Column: Heading & Description */}
          <div className="lg:col-span-5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-white border border-slate-200 text-xs font-semibold text-[#16233B] uppercase tracking-wider mb-3">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Data handling</span>
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-[#16233B] tracking-tight leading-snug">
              Your client&apos;s data doesn&apos;t sit around waiting to be a liability
            </h2>

            <p className="mt-4 text-slate-600 text-sm sm:text-base leading-relaxed">
              Most platforms store what you send them indefinitely. This one doesn&apos;t — because the fewer places sensitive clinical data lives, the fewer things you and your clients need to worry about.
            </p>

            <div className="mt-6">
              <Link
                href="#data-policy"
                className="inline-flex items-center gap-2 px-4.5 py-2.5 text-xs font-semibold text-[#16233B] bg-white hover:bg-slate-50 rounded-xl border border-slate-300 shadow-2xs transition-all"
              >
                <span>Read the full data policy</span>
                <ArrowRight className="w-3.5 h-3.5 text-emerald-600" />
              </Link>
            </div>
          </div>

          {/* Right Column: 3 Security Fact Cards / Rows */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            {securityFacts.map((fact, index) => {
              const Icon = fact.icon;
              return (
                <div
                  key={index}
                  className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-start gap-4"
                >
                  <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0">
                    <Icon className="w-5.5 h-5.5 text-emerald-600" />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h3 className="text-base font-semibold text-[#16233B]">
                        {fact.title}
                      </h3>
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-[10px] font-medium text-slate-600 border border-slate-200 uppercase tracking-wider">
                        {fact.badge}
                      </span>
                    </div>

                    <p className="text-slate-600 text-xs leading-relaxed">
                      {fact.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
