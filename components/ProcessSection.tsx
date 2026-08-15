import { UserPlus, UploadCloud, SearchCheck, Download, ShieldCheck } from "lucide-react";

export default function ProcessSection() {
  const steps = [
    {
      number: "1",
      icon: UserPlus,
      title: "Create your account",
      description:
        "Free registration, and your referring details pre-fill every checklist after that.",
      iconBg: "bg-orange-50 text-orange-500 border border-orange-100",
    },
    {
      number: "2",
      icon: UploadCloud,
      title: "Upload the files",
      description:
        "QEEG, TOVA, and the completed symptom checklist, through your secure portal.",
      iconBg: "bg-emerald-50 text-emerald-600 border border-emerald-100",
    },
    {
      number: "3",
      icon: SearchCheck,
      title: "We review it",
      description:
        "Checked against the literature, then confirmed by a Clinical Neuroscientist.",
      iconBg: "bg-sky-50 text-sky-500 border border-sky-100",
    },
    {
      number: "4",
      icon: Download,
      title: "Download your report",
      description:
        "A secure link, ready when approved. Save your download, as files are purged from our servers.",
      iconBg: "bg-rose-50 text-rose-500 border border-rose-100",
    },
  ];

  return (
    <section id="how-it-works" className="py-20 sm:py-28 bg-[#F4F7F9]/60 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center">
          {/* Left Column: Heading & Description matching screenshot */}
          <div className="lg:col-span-5 flex flex-col items-start">
            <div className="text-[11px] font-semibold tracking-[0.22em] text-slate-500 uppercase mb-3 font-sans">
              THE PROCESS
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-serif font-normal text-[#16233B] leading-tight tracking-tight mb-5">
              Four steps, from account to report
            </h2>

            <p className="text-slate-600 text-sm sm:text-base leading-relaxed font-normal max-w-md">
              The full process includes a reliability gate and review queue, providing a seamless workflow from your side.
            </p>

            {/* Clean Reliability Gate Protection Box */}
            <div className="mt-8 rounded-2xl bg-white border border-slate-200 p-5 shadow-xs flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0 mt-0.5">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-[#16233B] uppercase tracking-wider">
                  Reliability Gate Included
                </h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Server-side Test and Retest reliability verification ensures each file satisfies the <strong>&gt;= 0.80</strong> threshold before clinical review.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: 2x2 Staggered Floating Cards Grid matching screenshot */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6 items-start">
            {/* Column 1: Step 1 & Step 3 */}
            <div className="flex flex-col gap-6">
              {/* Step 1 Card */}
              <div className="bg-white rounded-[28px] p-7 sm:p-8 border border-slate-200/90 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col items-center text-center group">
                <div className={`w-14 h-14 rounded-full ${steps[0].iconBg} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                  <UserPlus className="w-6 h-6" />
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-[#16233B] tracking-tight mb-2 group-hover:text-slate-900 transition-colors">
                  {steps[0].title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-normal">
                  {steps[0].description}
                </p>
              </div>

              {/* Step 3 Card */}
              <div className="bg-white rounded-[28px] p-7 sm:p-8 border border-slate-200/90 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col items-center text-center group">
                <div className={`w-14 h-14 rounded-full ${steps[2].iconBg} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                  <SearchCheck className="w-6 h-6" />
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-[#16233B] tracking-tight mb-2 group-hover:text-slate-900 transition-colors">
                  {steps[2].title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-normal">
                  {steps[2].description}
                </p>
              </div>
            </div>

            {/* Column 2: Step 2 & Step 4 (Staggered Offset on tablet/desktop) */}
            <div className="flex flex-col gap-6 sm:translate-y-8">
              {/* Step 2 Card */}
              <div className="bg-white rounded-[28px] p-7 sm:p-8 border border-slate-200/90 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col items-center text-center group">
                <div className={`w-14 h-14 rounded-full ${steps[1].iconBg} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                  <UploadCloud className="w-6 h-6" />
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-[#16233B] tracking-tight mb-2 group-hover:text-slate-900 transition-colors">
                  {steps[1].title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-normal">
                  {steps[1].description}
                </p>
              </div>

              {/* Step 4 Card */}
              <div className="bg-white rounded-[28px] p-7 sm:p-8 border border-slate-200/90 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col items-center text-center group">
                <div className={`w-14 h-14 rounded-full ${steps[3].iconBg} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                  <Download className="w-6 h-6" />
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-[#16233B] tracking-tight mb-2 group-hover:text-slate-900 transition-colors">
                  {steps[3].title}
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
