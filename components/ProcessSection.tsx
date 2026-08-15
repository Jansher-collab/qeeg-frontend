import Link from "next/link";
import { UserPlus, UploadCloud, SearchCheck, Download, ArrowRight, ShieldCheck } from "lucide-react";

export default function ProcessSection() {
  const steps = [
    {
      number: "1",
      icon: UserPlus,
      title: "Create your account",
      description:
        "Free, and your referring details pre-fill every checklist after that.",
      badge: "Registration",
    },
    {
      number: "2",
      icon: UploadCloud,
      title: "Upload the files",
      description:
        "QEEG, TOVA, and the completed symptom checklist, through your secure portal.",
      badge: "File Submitting",
    },
    {
      number: "3",
      icon: SearchCheck,
      title: "We review it",
      description:
        "Checked against the literature, then confirmed by a Clinical Neuroscientist.",
      badge: "EEG Analysis",
    },
    {
      number: "4",
      icon: Download,
      title: "Download your report",
      description:
        "A secure link, ready when it's approved. One download — save it, it won't sit on our servers.",
      badge: "Final Report",
    },
  ];

  return (
    <section id="how-it-works" className="py-20 bg-[#F3F6F8] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-white border border-slate-200 text-xs font-semibold text-[#16233B] uppercase tracking-wider mb-3">
            <span>The process</span>
          </div>

          <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-[#16233B] tracking-tight">
            Four steps, from account to report
          </h2>

          <p className="mt-3 text-slate-600 text-sm sm:text-base leading-relaxed">
            The full process has a few more checks behind the scenes — a reliability gate, a review queue — but this is what it looks like from your side.
          </p>
        </div>

        {/* 4-Step Grid Cards (Inspired by Reference Screenshot 2: Clean white rounded cards, steps 1,2,3,4, clean SVG line icons) */}
        <div className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-9 h-9 rounded-full bg-[#16233B] text-white font-bold flex items-center justify-center text-sm">
                      {step.number}
                    </div>
                    <span className="px-2.5 py-0.5 rounded-md bg-slate-100 text-[11px] font-medium text-slate-600 border border-slate-200">
                      {step.badge}
                    </span>
                  </div>

                  <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center mb-4">
                    <Icon className="w-5.5 h-5.5 text-emerald-600" />
                  </div>

                  <h3 className="text-lg font-semibold text-[#16233B] tracking-tight mb-2">
                    {step.title}
                  </h3>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center text-xs text-slate-400 font-medium">
                  <span>Step {step.number} of 4</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Reliability Check Callout Banner */}
        <div className="mt-12 max-w-4xl mx-auto rounded-2xl bg-white border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-5 text-center sm:text-left">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5.5 h-5.5 text-emerald-600" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-[#16233B]">
                Reliability Gate Protection
              </h4>
              <p className="text-xs text-slate-600 mt-0.5 max-w-xl leading-relaxed">
                Every uploaded QEEG file undergoes server-side Test/Retest reliability verification against the <strong>&gt;= 0.80</strong> threshold before proceeding to review. Low reliability files are voided with zero fee charged.
              </p>
            </div>
          </div>

          <Link
            href="#reliability-policy"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl border border-emerald-300 transition-all shrink-0"
          >
            <span>Read the full process, including the 0.80 check</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
