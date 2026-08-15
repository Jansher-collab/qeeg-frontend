import Link from "next/link";
import { UserPlus, UploadCloud, SearchCheck, Download, ShieldCheck } from "lucide-react";

export default function ProcessSection() {
  const steps = [
    {
      number: "1",
      icon: UserPlus,
      title: "Create your account",
      description:
        "Free registration, and your referring details pre-fill every checklist after that.",
      iconBg: "bg-orange-50 text-orange-500 border-orange-100 group-hover:bg-orange-100/80",
    },
    {
      number: "2",
      icon: UploadCloud,
      title: "Upload the files",
      description:
        "QEEG, TOVA, and the completed symptom checklist, through your secure portal.",
      iconBg: "bg-blue-50 text-blue-500 border-blue-100 group-hover:bg-blue-100/80",
    },
    {
      number: "3",
      icon: SearchCheck,
      title: "We review it",
      description:
        "Checked against the literature, then confirmed by a Clinical Neuroscientist.",
      iconBg: "bg-emerald-50 text-emerald-600 border-emerald-100 group-hover:bg-emerald-100/80",
    },
    {
      number: "4",
      icon: Download,
      title: "Download your report",
      description:
        "A secure link, ready when approved. Save your download, as files are purged from our servers.",
      iconBg: "bg-rose-50 text-rose-500 border-rose-100 group-hover:bg-rose-100/80",
    },
  ];

  return (
    <section id="how-it-works" className="py-16 sm:py-24 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="max-w-3xl mb-14">
          <div className="text-[11px] font-semibold tracking-[0.22em] text-slate-500 uppercase mb-3 font-sans">
            THE PROCESS
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-[40px] font-serif font-normal text-[#16233B] leading-tight tracking-tight">
            Four steps, from account to report
          </h2>

          <p className="mt-4 text-slate-600 text-sm sm:text-base leading-relaxed max-w-2xl font-normal">
            The full process includes a reliability gate and review queue, providing a seamless workflow from your side.
          </p>
        </div>

        {/* 4-Step Grid Cards with Modern Micro-Interactions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-3xl p-7 sm:p-8 border border-slate-200 shadow-sm hover:shadow-xl hover:border-slate-300 transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1.5 relative overflow-hidden"
              >
                <div>
                  {/* Top row with step number and circular pastel icon badge */}
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-3xl sm:text-4xl font-serif font-light text-slate-300 group-hover:text-[#16233B] transition-colors duration-300">
                      {step.number}
                    </span>

                    <div className={`w-12 h-12 rounded-2xl ${step.iconBg} border flex items-center justify-center shadow-2xs group-hover:scale-110 transition-all duration-300`}>
                      <Icon className="w-6 h-6" />
                    </div>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-lg font-semibold text-[#16233B] tracking-tight mb-2.5 group-hover:text-slate-900 transition-colors">
                    {step.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                    {step.description}
                  </p>
                </div>

                <div className="mt-6 pt-3 border-t border-slate-100 flex items-center text-xs text-slate-400 font-medium">
                  <span>Step {step.number} of 4</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Link */}
        <div className="mt-12 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <Link
            href="#reliability-policy"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#16233B] hover:text-emerald-700 transition-colors group"
          >
            <span>Read the full process, including the 0.80 reliability check</span>
            <span className="text-emerald-600 group-hover:translate-x-1.5 transition-transform duration-200">
              →
            </span>
          </Link>
        </div>

        {/* Reliability Gate Protection Box */}
        <div className="mt-12 rounded-2xl bg-slate-50/80 hover:bg-slate-50 border border-slate-200 p-5 sm:p-6 shadow-2xs transition-all duration-200 flex flex-col sm:flex-row items-center justify-between gap-5 text-center sm:text-left">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-100/80 border border-emerald-200 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5 text-emerald-700" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-[#16233B]">
                Reliability Gate Protection
              </h4>
              <p className="text-xs text-slate-600 mt-0.5 max-w-2xl leading-relaxed">
                Every uploaded QEEG file undergoes server-side Test and Retest reliability verification against the <strong>&gt;= 0.80</strong> threshold before proceeding to review. Low reliability files are voided with zero fee charged.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
