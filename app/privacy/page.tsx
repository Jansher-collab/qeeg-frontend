import Link from "next/link";
import {
  ShieldCheck,
  Lock,
  Trash2,
  Cpu,
  Server,
  FileText,
  AlertTriangle,
  ArrowRight,
  Mail,
  HelpCircle,
  EyeOff,
} from "lucide-react";

export default function PrivacyPage() {
  const infraCards = [
    {
      title: "Hosted in Sydney",
      description:
        "All infrastructure — application, database, file storage — runs on a single Australian server. Nothing crosses a border to be processed.",
      icon: Server,
    },
    {
      title: "Encrypted end to end",
      description:
        "In transit and at rest, for as long as anything exists on the platform at all — which, by design, isn't long.",
      icon: Lock,
    },
    {
      title: "Purged the moment you download",
      description:
        "QEEG, TOVA, checklist, and report — all deleted the instant your download completes. No fixed retention window, no scheduled cleanup job you have to trust.",
      icon: Trash2,
    },
    {
      title: "Re-identification happens on your machine",
      description:
        "At download, you confirm the patient's identity yourself. That's the only point identity and clinical content ever meet — and it never touches our servers.",
      icon: Cpu,
    },
  ];

  return (
    <div className="bg-slate-50 text-slate-900 font-sans animate-fadeIn">
      {/* 1. Page Hero Section */}
      <section className="relative pt-32 pb-16 md:pt-40 md:pb-24 overflow-hidden bg-[#16233B] text-white border-b border-slate-800 text-left">
        {/* Background Subtle Glows */}
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-[#1C2F4A]/40 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 -right-32 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Eyebrow */}
          <div className="inline-flex items-center px-3.5 py-1.5 rounded-full bg-slate-800/90 border border-slate-700/80 text-[11px] font-semibold tracking-[0.22em] text-slate-300 uppercase mb-6 font-sans">
            <span>Privacy & Data Handling</span>
          </div>

          {/* Main Heading in Lora Serif */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[52px] font-serif font-normal text-white leading-[1.15] tracking-tight mb-6">
            The fewer places sensitive data lives, the fewer things to worry about
          </h1>

          {/* Lede Paragraph */}
          <p className="text-base sm:text-lg md:text-xl text-slate-300 font-normal max-w-3xl leading-relaxed">
            Most platforms store what you send them indefinitely. This one is built specifically not to — down to where identity ever exists at all.
          </p>
        </div>
      </section>

      {/* Main Body Wrap */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 space-y-16 sm:space-y-24">
        {/* 2. Core Design Section */}
        <section className="space-y-6">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-widest text-slate-500 uppercase font-sans mb-3">
              <span>The core design</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-normal text-[#16233B] tracking-tight leading-snug">
              Your server never receives a patient&apos;s identity — not even briefly
            </h2>
            <p className="text-base sm:text-lg text-slate-600 font-normal leading-relaxed mt-4">
              This isn&apos;t a retention policy layered on top of a normal upload. Identity is stripped in your browser before the first byte is ever sent.
            </p>
          </div>

          {/* Info Box / Callout */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xs space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-[#16233B]">
                <EyeOff className="w-4 h-4" />
              </div>
              <h3 className="text-base sm:text-lg font-serif font-normal text-[#16233B]">
                What&apos;s stripped, before anything uploads
              </h3>
            </div>
            <p className="text-sm sm:text-base text-slate-600 font-normal leading-relaxed">
              Name, date of birth, date of test, time of test — every date field, not just the obvious ones. Only age and gender remain, plus an opaque case reference that&apos;s never linked to a patient name anywhere on our servers.
            </p>
          </div>
        </section>

        {/* 3. 4-Card Infrastructure & Security Grid */}
        <section className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {infraCards.map((card, index) => {
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
        </section>

        {/* 4. Trade-off Callout Box (Amber/Neutral Theme) */}
        <section>
          <div className="rounded-3xl p-6 sm:p-8 bg-amber-50/70 border border-amber-200/90 shadow-2xs space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-900">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <h3 className="text-base sm:text-lg font-serif font-normal text-amber-950">
                What we can&apos;t do, as a result
              </h3>
            </div>
            <p className="text-sm sm:text-base text-amber-900 font-normal leading-relaxed">
              Because we never hold the identity mapping, we can&apos;t recover it if you lose track of a case reference, and we can&apos;t verify what you enter at download time. That trade-off is the whole point — the alternative is us holding data we don&apos;t need to.
            </p>
          </div>
        </section>

        {/* 5. Reports Section */}
        <section className="space-y-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-widest text-slate-500 uppercase font-sans mb-3">
              <span>Reports themselves</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-normal text-[#16233B] tracking-tight leading-snug">
              Even the report addresses your client only by age and gender
            </h2>
            <p className="text-base sm:text-lg text-slate-600 font-normal leading-relaxed mt-3">
              &ldquo;The client is a 39-year-old female.&rdquo; That&apos;s the extent of it — nothing else identifying ever appears in a generated report.
            </p>
          </div>
        </section>

        {/* 6. Final Call to Action Section */}
        <section>
          <div className="bg-[#16233B] rounded-3xl p-8 sm:p-12 text-white border border-slate-800 shadow-xl text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-8 hover:border-slate-700 transition-colors">
            <div className="space-y-2 max-w-lg">
              <h3 className="text-2xl sm:text-3xl font-serif font-normal text-white tracking-tight leading-snug">
                Questions about how your data is handled?
              </h3>
              <p className="text-slate-300 text-sm sm:text-base font-normal">
                Check the{" "}
                <Link
                  href="/faq"
                  className="font-medium text-white underline decoration-slate-400 hover:decoration-white transition-colors"
                >
                  FAQ
                </Link>{" "}
                or email{" "}
                <a
                  href="mailto:reception@adhd.com.au"
                  className="font-medium text-white underline decoration-slate-400 hover:decoration-white transition-colors"
                >
                  reception@adhd.com.au
                </a>
                .
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
              <Link
                href="/faq"
                className="w-full sm:w-auto px-5 py-3 text-sm font-semibold text-slate-200 hover:text-white bg-slate-800/80 hover:bg-slate-800 rounded-xl border border-slate-700 transition-all flex items-center justify-center gap-2"
              >
                <HelpCircle className="w-4 h-4 text-slate-300" />
                <span>Read the FAQ</span>
              </Link>
              <a
                href="mailto:reception@adhd.com.au"
                className="w-full sm:w-auto px-5 py-3 text-sm font-semibold text-[#16233B] bg-white hover:bg-slate-100 rounded-xl shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 flex items-center justify-center gap-2"
              >
                <Mail className="w-4 h-4 text-[#16233B]" />
                <span>Email Support</span>
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
