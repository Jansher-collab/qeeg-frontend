import Link from "next/link";
import {
  Laptop,
  Server,
  ShieldAlert,
  ArrowRight,
  UserPlus,
  FileUp,
  CheckCircle2,
  FileLock2,
  ShieldCheck,
  BookOpen,
  Cpu,
  DownloadCloud,
  Trash2,
  AlertTriangle,
} from "lucide-react";

export default function HowItWorksPage() {
  const steps = [
    {
      number: "01",
      location: "Your browser",
      isBrowser: true,
      icon: UserPlus,
      title: "Create your account & download the checklist",
      description:
        "Free account, referring details saved once. Start a new report request and download a symptom checklist PDF, pre-filled with your details.",
    },
    {
      number: "02",
      location: "Your browser",
      isBrowser: true,
      icon: FileUp,
      title: "Select the QEEG file",
      description:
        "Your browser reads the file locally: nothing has been sent anywhere yet.",
    },
    {
      number: "03",
      location: "Your browser",
      isBrowser: true,
      icon: CheckCircle2,
      title: "Reliability checked, locally",
      description:
        "The Test/Retest reliability figure is checked against a 0.80 threshold before anything uploads. Below that, nothing is sent: you are asked to resubmit, and there is no charge.",
    },
    {
      number: "04",
      location: "Your browser",
      isBrowser: true,
      icon: FileLock2,
      title: "De-identified before it ever leaves your machine",
      description:
        "Name, date of birth, and every date field are stripped. Only age and gender remain, plus a case reference that is never linked to a patient name on our end: that mapping stays entirely with you.",
    },
    {
      number: "05",
      location: "Our server",
      isBrowser: false,
      icon: ShieldCheck,
      title: "Reliability re-checked, independently",
      description:
        "We never trust a client-side check alone: the figure is re-verified server-side before anything proceeds.",
    },
    {
      number: "06",
      location: "Our server",
      isBrowser: false,
      icon: BookOpen,
      title: "Matched against the literature",
      description:
        "Checked against a curated knowledge base, then PubMed and Semantic Scholar for current research spanning medical, psychological, nutritional, lifestyle, and neurofeedback correlates.",
    },
    {
      number: "07",
      location: "Our server",
      isBrowser: false,
      icon: Cpu,
      title: "Report generated without human review",
      description:
        "The report is generated directly, addressing your client only by age and gender, with an AI-generation disclaimer appended automatically. Only now is your payment captured.",
    },
    {
      number: "08",
      location: "Your browser",
      isBrowser: true,
      icon: DownloadCloud,
      title: "Download, and confirm the identity yourself",
      description:
        "You are prompted to confirm the patient identity for that case reference: the only place identity and clinical content ever meet, and it happens on your own machine.",
    },
    {
      number: "09",
      location: "Our server",
      isBrowser: false,
      icon: Trash2,
      title: "Everything purged, immediately",
      description:
        "The instant your download completes, the QEEG, TOVA, checklist, and report are deleted from our servers. Nothing identifiable was ever there to begin with.",
    },
  ];

  return (
    <div className="bg-slate-50 text-slate-900 font-sans">
      {/* 1. Page Hero Section */}
      <section className="relative pt-28 pb-14 md:pt-32 md:pb-20 overflow-hidden bg-[#16233B] text-white border-b border-slate-800">
        {/* Background Subtle Glows */}
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-[#1C2F4A]/40 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 -right-32 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-left">
          {/* Eyebrow */}
          <div className="inline-flex items-center px-3.5 py-1.5 rounded-full bg-slate-800/90 border border-slate-700/80 text-[11px] font-semibold tracking-[0.2em] text-slate-300 uppercase mb-5 font-sans">
            <span>How it works</span>
          </div>

          {/* Main Heading in Lora Serif */}
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-[42px] font-serif font-normal text-white leading-[1.2] tracking-tight max-w-3xl">
            Every step, and exactly where it happens
          </h1>

          {/* Lede Paragraph */}
          <p className="mt-5 text-sm sm:text-base md:text-[17px] text-slate-300 leading-relaxed font-normal max-w-3xl">
            Some of this happens in your own browser before anything is sent anywhere. The rest happens on our server. Both are labelled below.
          </p>
        </div>
      </section>

      {/* 2. 9-Step Process Section */}
      <section className="py-14 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Legend / Info Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs text-xs text-slate-600">
            <span className="font-medium text-[#16233B]">Execution Environments:</span>
            <div className="flex items-center gap-4">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-slate-800 border border-slate-300 font-semibold">
                <Laptop className="w-3.5 h-3.5 text-slate-700" />
                <span>Your browser (Client-side)</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#16233B] text-white border border-slate-800 font-semibold">
                <Server className="w-3.5 h-3.5 text-sky-400" />
                <span>Our server (Sydney, AU)</span>
              </span>
            </div>
          </div>

          {/* Step Cards List */}
          <div className="space-y-4">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div
                  key={index}
                  className="p-6 sm:p-7 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-slate-300 hover:-translate-y-0.5 transition-all duration-300 group flex flex-col sm:flex-row items-start gap-5 sm:gap-6"
                >
                  {/* Step Number & Icon Container */}
                  <div className="flex items-center sm:flex-col items-start gap-3 sm:gap-2 shrink-0">
                    <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-[#16233B] group-hover:scale-105 group-hover:bg-slate-200/70 transition-all duration-300">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="font-mono text-xs font-bold text-slate-400">
                      {step.number}
                    </span>
                  </div>

                  {/* Content & Environment Badge */}
                  <div className="flex-1 space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h2 className="text-lg sm:text-xl font-serif font-normal text-[#16233B] tracking-tight group-hover:text-slate-900 transition-colors">
                        {step.title}
                      </h2>
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide uppercase font-sans ${
                          step.isBrowser
                            ? "bg-slate-100 text-slate-700 border border-slate-300"
                            : "bg-[#16233B] text-slate-200 border border-slate-700"
                        }`}
                      >
                        {step.isBrowser ? (
                          <Laptop className="w-3 h-3 text-slate-600" />
                        ) : (
                          <Server className="w-3 h-3 text-sky-400" />
                        )}
                        <span>{step.location}</span>
                      </span>
                    </div>

                    <p className="text-slate-600 text-sm sm:text-base leading-relaxed font-normal">
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 3. Callout Box (Amber/Neutral Theme) */}
          <div className="rounded-3xl bg-amber-50/70 border border-amber-200/90 p-7 sm:p-9 relative overflow-hidden shadow-2xs">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center shrink-0 mt-0.5">
                <AlertTriangle className="w-5 h-5 text-amber-800" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg sm:text-xl font-serif font-normal text-amber-950 tracking-tight">
                  Read the findings before you rely on them
                </h3>
                <p className="text-amber-900/90 text-sm sm:text-base leading-relaxed font-normal">
                  Every report is AI-generated, with no human review before delivery. It states research correlations, never a recommendation: but AI-generated content can be wrong, and checking it is part of the process, not an afterthought.
                </p>
              </div>
            </div>
          </div>

          {/* 4. Final Call to Action Section */}
          <div className="bg-[#16233B] rounded-3xl p-8 sm:p-12 text-white border border-slate-800 shadow-xl text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-8">
            <div className="space-y-2 max-w-lg">
              <h3 className="text-2xl sm:text-3xl font-serif font-normal text-white tracking-tight leading-snug">
                Ready to submit your first report?
              </h3>
              <p className="text-slate-300 text-sm sm:text-base font-normal">
                Free to sign up. Zero charge if reliability is under 0.80.
              </p>
            </div>

            <Link
              href="/signup"
              className="px-6 py-3.5 text-sm font-semibold text-[#16233B] bg-white hover:bg-slate-100 rounded-xl shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 flex items-center gap-2 shrink-0 group"
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
