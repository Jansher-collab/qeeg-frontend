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
  Layers,
  Sparkles,
} from "lucide-react";

export default function HowItWorksPage() {
  const phase1Steps = [
    {
      number: "01",
      location: "Your browser",
      isBrowser: true,
      icon: UserPlus,
      title: "Create account & checklist",
      description:
        "Free account setup with practitioner details saved once. Start a new report request and download a symptom checklist PDF pre-filled with your clinical details.",
    },
    {
      number: "02",
      location: "Your browser",
      isBrowser: true,
      icon: FileUp,
      title: "Select the QEEG export",
      description:
        "Your browser inspects the NeuroGuide .tdt file locally. Zero bytes are transmitted to any server at this stage.",
    },
    {
      number: "03",
      location: "Your browser",
      isBrowser: true,
      icon: CheckCircle2,
      title: "Reliability gate (≥ 0.80)",
      description:
        "Test/Retest reliability is checked client-side against a 0.80 threshold. Files below 0.80 are rejected locally with zero fee or upload.",
    },
  ];

  const phase2Steps = [
    {
      number: "04",
      location: "Your browser",
      isBrowser: true,
      icon: FileLock2,
      title: "In-browser de-identification",
      description:
        "Name, date of birth, and all date fields are stripped locally. Only age and gender remain with an opaque case reference.",
    },
    {
      number: "05",
      location: "Sydney server",
      isBrowser: false,
      icon: ShieldCheck,
      title: "Independent verification",
      description:
        "We never trust a client-side check alone. Reliability figures and file integrity are re-verified independently server-side.",
    },
    {
      number: "06",
      location: "Sydney server",
      isBrowser: false,
      icon: BookOpen,
      title: "Literature matching engine",
      description:
        "Queried against a hand-curated library, then PubMed and Semantic Scholar for medical, psychological, and lifestyle literature.",
    },
    {
      number: "07",
      location: "Sydney server",
      isBrowser: false,
      icon: Cpu,
      title: "AI report synthesis",
      description:
        "Synthesizes correlations without human review, addressing your client only by age and gender. Only now is your payment captured.",
    },
  ];

  const phase3Steps = [
    {
      number: "08",
      location: "Your browser",
      isBrowser: true,
      icon: DownloadCloud,
      title: "Local re-identification",
      description:
        "You confirm the patient's identity yourself on your own device: the only point where clinical findings and patient identity ever meet.",
    },
    {
      number: "09",
      location: "Sydney server",
      isBrowser: false,
      icon: Trash2,
      title: "Instant server purge",
      description:
        "The exact millisecond your download finishes, raw data, checklist scores, and generated reports are permanently destroyed from our server.",
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
            <span>Workflow & Architecture</span>
          </div>

          {/* Main Heading in Lora Serif */}
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-[42px] font-serif font-normal text-white leading-[1.2] tracking-tight mb-4 max-w-3xl">
            Every step, and exactly where it happens
          </h1>

          {/* Lede Paragraph */}
          <p className="text-sm sm:text-base md:text-[17px] text-slate-300 font-normal max-w-3xl leading-relaxed">
            Some steps happen securely inside your browser before anything leaves your machine. The rest execute on our sovereign Australian server.
          </p>
        </div>
      </section>

      {/* 2. Main Structured Workflow Grid */}
      <section className="py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Execution Environment Legend Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs text-xs text-slate-600">
            <span className="font-semibold text-[#16233B]">Environment Indicators:</span>
            <div className="flex items-center gap-3 sm:gap-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-100 text-slate-800 border border-slate-300 font-medium">
                <Laptop className="w-3.5 h-3.5 text-slate-700" />
                <span>Your Browser (Client-Side)</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#16233B] text-white border border-slate-800 font-medium">
                <Server className="w-3.5 h-3.5 text-sky-400" />
                <span>Sydney Sovereign Server</span>
              </span>
            </div>
          </div>

          {/* Phase 1: Local Preparation & Gate */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md bg-slate-200 text-slate-800 text-xs font-semibold uppercase tracking-wider font-mono">
                Phase 1
              </span>
              <h2 className="text-lg sm:text-xl font-serif font-normal text-[#16233B] tracking-tight">
                Local Extraction &amp; Reliability Gating (Your Machine)
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {phase1Steps.map((step, idx) => {
                const Icon = step.icon;
                return (
                  <div
                    key={idx}
                    className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs hover:shadow-md hover:border-slate-300 hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between group"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-[#16233B] group-hover:scale-105 transition-transform">
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-semibold text-slate-700 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full uppercase">
                            Client-side
                          </span>
                          <span className="font-mono text-xs font-bold text-slate-400">
                            {step.number}
                          </span>
                        </div>
                      </div>

                      <h3 className="text-base font-serif font-normal text-[#16233B] tracking-tight group-hover:text-slate-900 transition-colors">
                        {step.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-600 font-normal leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Phase 2: Processing & Research Synthesis */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md bg-[#16233B] text-white text-xs font-semibold uppercase tracking-wider font-mono">
                Phase 2
              </span>
              <h2 className="text-lg sm:text-xl font-serif font-normal text-[#16233B] tracking-tight">
                De-identification, Research Matching &amp; Synthesis
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {phase2Steps.map((step, idx) => {
                const Icon = step.icon;
                return (
                  <div
                    key={idx}
                    className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs hover:shadow-md hover:border-slate-300 hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between group"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-[#16233B] group-hover:scale-105 transition-transform">
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase ${
                              step.isBrowser
                                ? "text-slate-700 bg-slate-100 border border-slate-200"
                                : "text-white bg-[#16233B]"
                            }`}
                          >
                            {step.isBrowser ? "Browser" : "Server"}
                          </span>
                          <span className="font-mono text-xs font-bold text-slate-400">
                            {step.number}
                          </span>
                        </div>
                      </div>

                      <h3 className="text-base font-serif font-normal text-[#16233B] tracking-tight group-hover:text-slate-900 transition-colors">
                        {step.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-600 font-normal leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Phase 3: Immediate Purge & Local Delivery */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md bg-slate-200 text-slate-800 text-xs font-semibold uppercase tracking-wider font-mono">
                Phase 3
              </span>
              <h2 className="text-lg sm:text-xl font-serif font-normal text-[#16233B] tracking-tight">
                Download, Local Re-identification &amp; Instant Destruction
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {phase3Steps.map((step, idx) => {
                const Icon = step.icon;
                return (
                  <div
                    key={idx}
                    className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs hover:shadow-md hover:border-slate-300 hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between group"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-[#16233B] group-hover:scale-105 transition-transform">
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase ${
                              step.isBrowser
                                ? "text-slate-700 bg-slate-100 border border-slate-200"
                                : "text-white bg-[#16233B]"
                            }`}
                          >
                            {step.isBrowser ? "Client-Side" : "Server-Side"}
                          </span>
                          <span className="font-mono text-xs font-bold text-slate-400">
                            {step.number}
                          </span>
                        </div>
                      </div>

                      <h3 className="text-base sm:text-lg font-serif font-normal text-[#16233B] tracking-tight group-hover:text-slate-900 transition-colors">
                        {step.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-600 font-normal leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3. Cautionary Guidance Box */}
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
