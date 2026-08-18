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
} from "lucide-react";

export default function PrivacyPage() {
  const infraCards = [
    {
      title: "Hosted in Sydney",
      description:
        "All infrastructure (application, database, file storage) runs on a single Australian server. Nothing crosses a border to be processed.",
      icon: Server,
    },
    {
      title: "Encrypted end to end",
      description:
        "In transit and at rest, for as long as anything exists on the platform at all, which, by design, is not long.",
      icon: Lock,
    },
    {
      title: "Purged the moment you download",
      description:
        "QEEG, TOVA, checklist, and report are all deleted the instant your download completes. No fixed retention window, and no scheduled cleanup job you have to trust.",
      icon: Trash2,
    },
    {
      title: "Re-identification happens on your machine",
      description:
        "At download, you confirm the patient's identity yourself. That is the only point identity and clinical content ever meet, and it never touches our servers.",
      icon: Cpu,
    },
  ];

  return (
    <div className="bg-slate-50 text-slate-900 font-sans animate-fadeIn">
      {/* 1. Page Hero Section */}
      <section className="relative pt-28 pb-14 md:pt-32 md:pb-20 overflow-hidden bg-[#16233B] text-white border-b border-slate-800 text-left">
        {/* Background Subtle Glows */}
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-[#1C2F4A]/40 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 -right-32 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Eyebrow */}
          <div className="inline-flex items-center px-3.5 py-1.5 rounded-full bg-slate-800/90 border border-slate-700/80 text-[11px] font-semibold tracking-[0.2em] text-slate-300 uppercase mb-5 font-sans">
            <span>Privacy & Data Handling</span>
          </div>

          {/* Main Heading in Lora Serif */}
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-[42px] font-serif font-normal text-white leading-[1.2] tracking-tight mb-4 max-w-3xl">
            The fewer places sensitive data lives, the fewer things to worry about
          </h1>

          {/* Lede Paragraph */}
          <p className="text-sm sm:text-base md:text-[17px] text-slate-300 font-normal max-w-3xl leading-relaxed">
            Most platforms store what you send them indefinitely. This one is built specifically not to, down to where identity ever exists at all.
          </p>
        </div>
      </section>

      {/* Main Body Wrap with responsive full container width */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-10 sm:space-y-12">
        {/* 2. Core Design Section */}
        <section className="space-y-5">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-widest text-slate-500 uppercase font-sans mb-2">
              <span>The core design</span>
            </div>
            <h2 className="text-xl sm:text-2xl lg:text-[28px] font-serif font-normal text-[#16233B] tracking-tight leading-snug">
              Your server never receives a patient&apos;s identity: not even briefly
            </h2>
            <p className="text-sm sm:text-base text-slate-600 font-normal leading-relaxed mt-2.5 max-w-3xl">
              This isn&apos;t a retention policy layered on top of a normal upload. Identity is stripped in your browser before the first byte is ever sent.
            </p>
          </div>

          {/* Callout Box matching Screenshot 2 (Pale sage tint background and clean typography) */}
          <div className="rounded-2xl p-6 sm:p-7 bg-[#EAF4EF] border border-[#BBDED3] shadow-2xs space-y-2 w-full">
            <h3 className="text-sm sm:text-base font-bold text-[#16233B]">
              What&apos;s stripped, before anything uploads
            </h3>
            <p className="text-xs sm:text-sm text-slate-700 font-normal leading-relaxed">
              Name, date of birth, date of test, time of test: every date field, not just the obvious ones. Only age and gender remain, plus an opaque case reference that is never linked to a patient name anywhere on our servers.
            </p>
          </div>
        </section>

        {/* 3. 4-Card Infrastructure & Security Grid stretching cleanly */}
        <section className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 w-full">
            {infraCards.map((card, index) => {
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
        </section>

        {/* 4. Trade-off Callout Box (Amber/Neutral Theme) */}
        <section className="w-full">
          <div className="rounded-2xl p-6 sm:p-7 bg-amber-50/70 border border-amber-200/90 shadow-2xs space-y-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-800 shrink-0" />
              <h3 className="text-sm sm:text-base font-serif font-normal text-amber-950">
                What we can&apos;t do, as a result
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-amber-900 font-normal leading-relaxed">
              Because we never hold the identity mapping, we can&apos;t recover it if you lose track of a case reference, and we can&apos;t verify what you enter at download time. That trade-off is the whole point: the alternative is us holding data we do not need to.
            </p>
          </div>
        </section>

        {/* 5. Reports Section */}
        <section className="space-y-3 w-full">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-widest text-slate-500 uppercase font-sans mb-1">
              <span>Reports themselves</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-serif font-normal text-[#16233B] tracking-tight leading-snug">
              Even the report addresses your client only by age and gender
            </h2>
            <p className="text-sm sm:text-base text-slate-600 font-normal leading-relaxed mt-2 max-w-3xl">
              &ldquo;The client is a 39-year-old female.&rdquo; That is the extent of it: nothing else identifying ever appears in a generated report.
            </p>
          </div>
        </section>

        {/* 6. Final Call to Action Section */}
        <section className="w-full pt-2">
          <div className="bg-[#16233B] rounded-3xl p-7 sm:p-10 text-white border border-slate-800 shadow-xl text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6 hover:border-slate-700 transition-colors">
            <div className="space-y-1.5 max-w-lg">
              <h3 className="text-xl sm:text-2xl font-serif font-normal text-white tracking-tight leading-snug">
                Questions about how your data is handled?
              </h3>
              <p className="text-slate-300 text-xs sm:text-sm font-normal">
                Check the{" "}
                <Link
                  href="/faq"
                  className="font-medium text-white underline decoration-slate-400 hover:decoration-white transition-colors"
                >
                  FAQ
                </Link>{" "}
                or read our full legal terms.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <Link
                href="/terms"
                className="px-5 py-3 text-xs sm:text-sm font-semibold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 flex items-center gap-2 group"
              >
                <FileText className="w-4 h-4 text-slate-300" />
                <span>Terms of Service</span>
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:translate-x-1 transition-transform duration-200" />
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
