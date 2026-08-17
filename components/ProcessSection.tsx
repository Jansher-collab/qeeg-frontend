import Link from "next/link";
import { UserPlus, UploadCloud, Cpu, Download, ShieldCheck, ArrowRight } from "lucide-react";

export default function ProcessSection() {
  const steps = [
    {
      number: "1",
      icon: UserPlus,
      title: "Create your account",
      description:
        "Free, and your referring details pre-fill every checklist after that.",
      iconBg: "bg-slate-100 text-[#16233B] border border-slate-200",
      stepTag: "Step 01",
    },
    {
      number: "2",
      icon: UploadCloud,
      title: "Upload the files",
      description:
        "QEEG, TOVA, and the completed checklist — de-identified in your browser before anything is sent.",
      iconBg: "bg-slate-100 text-[#16233B] border border-slate-200",
      stepTag: "Step 02",
    },
    {
      number: "3",
      icon: Cpu,
      title: "We generate it",
      description:
        "Checked against the literature by the correlation engine — AI-generated, with a clear notice to verify findings.",
      iconBg: "bg-slate-100 text-[#16233B] border border-slate-200",
      stepTag: "Step 03",
    },
    {
      number: "4",
      icon: Download,
      title: "Download your report",
      description:
        "One download — save it, it won't sit on our servers.",
      iconBg: "bg-slate-100 text-[#16233B] border border-slate-200",
      stepTag: "Step 04",
    },
  ];

  return (
    <section id="how-it-works" className="py-20 sm:py-28 bg-[#F4F7F9]/80 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center">
          {/* Left Column: Heading & Subtitle */}
          <div className="lg:col-span-5 flex flex-col items-start">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-200/80 text-[11px] font-semibold tracking-[0.22em] text-slate-700 uppercase mb-4 font-sans">
              THE PROCESS
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-serif font-normal text-[#16233B] leading-tight tracking-tight mb-5">
              Four steps, from account to report
            </h2>

            <p className="text-slate-600 text-sm sm:text-base leading-relaxed font-normal max-w-md">
              The full process has a few more checks behind the scenes — a reliability gate, a processing step — but this is what it looks like from your side.{" "}
              <Link
                href="#how-it-works"
                className="text-[#16233B] hover:text-slate-700 font-semibold underline underline-offset-4 inline-flex items-center gap-1 group/link mt-2"
              >
                <span>See the full walkthrough</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover/link:translate-x-1 transition-transform duration-200" />
              </Link>
            </p>

            {/* Reliability Gate Verification Box */}
            <div className="mt-8 rounded-2xl bg-white border border-slate-200 p-5 shadow-xs flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 mt-0.5">
                <ShieldCheck className="w-5 h-5 text-[#16233B]" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-[#16233B] uppercase tracking-wider">
                  Automated Reliability Gate
                </h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Every QEEG recording must achieve a Test-Retest reliability coefficient <strong>&ge; 0.80</strong> before correlation generation commences.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: 4 Grid Cards */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6 items-start">
            {/* Column 1: Step 1 & Step 3 */}
            <div className="flex flex-col gap-6">
              {/* Step 1 Card */}
              <div className="bg-white rounded-[24px] p-7 sm:p-8 border border-slate-200 shadow-sm hover:shadow-xl hover:border-slate-300 hover:-translate-y-1.5 transition-all duration-300 flex flex-col items-start text-left group">
                <div className="w-full flex items-center justify-between mb-5">
                  <div className={`w-12 h-12 rounded-xl ${steps[0].iconBg} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                    <UserPlus className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-semibold text-slate-400 font-mono tracking-wider">
                    {steps[0].stepTag}
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-[#16233B] tracking-tight mb-2 group-hover:text-slate-900 transition-colors">
                  1. {steps[0].title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-normal">
                  {steps[0].description}
                </p>
              </div>

              {/* Step 3 Card */}
              <div className="bg-white rounded-[24px] p-7 sm:p-8 border border-slate-200 shadow-sm hover:shadow-xl hover:border-slate-300 hover:-translate-y-1.5 transition-all duration-300 flex flex-col items-start text-left group">
                <div className="w-full flex items-center justify-between mb-5">
                  <div className={`w-12 h-12 rounded-xl ${steps[2].iconBg} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                    <Cpu className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-semibold text-slate-400 font-mono tracking-wider">
                    {steps[2].stepTag}
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-[#16233B] tracking-tight mb-2 group-hover:text-slate-900 transition-colors">
                  3. {steps[2].title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-normal">
                  {steps[2].description}
                </p>
              </div>
            </div>

            {/* Column 2: Step 2 & Step 4 (Staggered Offset on sm/desktop) */}
            <div className="flex flex-col gap-6 sm:translate-y-6">
              {/* Step 2 Card */}
              <div className="bg-white rounded-[24px] p-7 sm:p-8 border border-slate-200 shadow-sm hover:shadow-xl hover:border-slate-300 hover:-translate-y-1.5 transition-all duration-300 flex flex-col items-start text-left group">
                <div className="w-full flex items-center justify-between mb-5">
                  <div className={`w-12 h-12 rounded-xl ${steps[1].iconBg} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-semibold text-slate-400 font-mono tracking-wider">
                    {steps[1].stepTag}
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-[#16233B] tracking-tight mb-2 group-hover:text-slate-900 transition-colors">
                  2. {steps[1].title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-normal">
                  {steps[1].description}
                </p>
              </div>

              {/* Step 4 Card */}
              <div className="bg-white rounded-[24px] p-7 sm:p-8 border border-slate-200 shadow-sm hover:shadow-xl hover:border-slate-300 hover:-translate-y-1.5 transition-all duration-300 flex flex-col items-start text-left group">
                <div className="w-full flex items-center justify-between mb-5">
                  <div className={`w-12 h-12 rounded-xl ${steps[3].iconBg} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                    <Download className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-semibold text-slate-400 font-mono tracking-wider">
                    {steps[3].stepTag}
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-[#16233B] tracking-tight mb-2 group-hover:text-slate-900 transition-colors">
                  4. {steps[3].title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-normal">
                  {steps[3].description}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
