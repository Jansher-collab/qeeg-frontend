import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Sparkles, Activity } from "lucide-react";

export default function Hero() {
  const bands = [
    {
      name: "Delta",
      range: "0.5 - 4 Hz",
      color: "from-sky-400 to-cyan-500",
      textColor: "text-sky-400",
      borderColor: "border-sky-500/30",
      bgGlow: "bg-sky-500/10",
      barWidth: "w-[48%]",
      desc: "Slow-wave sleep & cortical gating",
    },
    {
      name: "Theta",
      range: "4 - 8 Hz",
      color: "from-teal-400 to-cyan-600",
      textColor: "text-teal-300",
      borderColor: "border-teal-500/30",
      bgGlow: "bg-teal-500/10",
      barWidth: "w-[76%]",
      desc: "Working memory & attentional control",
    },
    {
      name: "Alpha",
      range: "8 - 12 Hz",
      color: "from-amber-400 to-yellow-500",
      textColor: "text-amber-400",
      borderColor: "border-amber-500/30",
      bgGlow: "bg-amber-500/10",
      barWidth: "w-[64%]",
      desc: "Posterior dominant calm alertness",
    },
    {
      name: "Beta",
      range: "12 - 30 Hz",
      color: "from-indigo-400 to-violet-500",
      textColor: "text-indigo-400",
      borderColor: "border-indigo-500/30",
      bgGlow: "bg-indigo-500/10",
      barWidth: "w-[58%]",
      desc: "Active cognitive processing & focus",
    },
  ];

  return (
    <section className="relative pt-28 pb-14 md:pt-32 md:pb-20 overflow-hidden bg-[#16233B] text-white border-b border-slate-800">
      {/* Background Subtle Gradient Glows */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-[#1C2F4A]/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 -right-32 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Left Column: Headline, Copy & Action Buttons */}
          <div className="lg:col-span-7 flex flex-col items-start">
            {/* Clean Uppercase Eyebrow Tag */}
            <div className="inline-flex items-center px-3.5 py-1.5 rounded-full bg-slate-800/90 border border-slate-700/80 text-[11px] font-semibold tracking-[0.2em] text-slate-300 uppercase mb-5 font-sans">
              <span>QEEG · TOVA · Literature Correlation</span>
            </div>

            {/* Elegant Lora Serif Headline */}
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-[44px] font-serif font-normal text-white leading-[1.2] tracking-tight">
              Turn QEEG and TOVA data into evidence-linked answers.
            </h1>

            {/* Exact Lede Paragraph */}
            <p className="mt-5 text-sm sm:text-base md:text-[17px] text-slate-300 leading-relaxed font-normal max-w-xl">
              Upload your client&apos;s QEEG, TOVA, and symptom checklist. An AI-generated report comes back describing what the published research actually associates with the pattern, focusing on correlations rather than recommendations. Every report carries a clear notice: AI-generated content can be wrong, so check the findings.
            </p>

            {/* Action Buttons with Smooth Hover Interactions */}
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href="/signup"
                className="px-6 py-3.5 text-sm font-semibold text-[#16233B] bg-white hover:bg-slate-100 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 flex items-center gap-2 group"
              >
                <span>Create your free account</span>
                <ArrowRight className="w-4 h-4 text-[#16233B] group-hover:translate-x-1 transition-transform duration-200" />
              </Link>

              <Link
                href="/how-it-works"
                className="px-6 py-3.5 text-sm font-medium text-slate-200 hover:text-white bg-slate-800/60 hover:bg-slate-800 border border-slate-700 hover:border-slate-500 rounded-xl hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 flex items-center gap-2 group"
              >
                <span>See how it works</span>
                <span className="text-slate-300 group-hover:translate-x-1 group-hover:text-white transition-transform duration-200">→</span>
              </Link>
            </div>
          </div>

          {/* Right Column: Hero Visual Graphic / Neural Mapping */}
          <div className="lg:col-span-5 flex justify-center items-center">
            <div className="relative w-full max-w-lg rounded-3xl overflow-hidden border border-slate-700/80 shadow-2xl bg-[#142033] group hover:border-slate-600 transition-all duration-500">
              <div className="relative w-full aspect-[4/3] flex items-center justify-center overflow-hidden">
                <Image
                  src="/hero-brain.jpg"
                  alt="QEEG and TOVA Neural Data Mapping"
                  width={640}
                  height={480}
                  priority
                  className="w-full h-full object-cover object-center group-hover:scale-[1.03] transition-transform duration-700 ease-out"
                />

                {/* Vignette & Gradient Overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#142033] via-transparent to-transparent pointer-events-none opacity-90" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#142033]/60 via-transparent to-[#142033]/60 pointer-events-none" />

                {/* Floating Correlation Engine Badge */}
                <div className="absolute top-4 right-4 bg-[#111D30]/90 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-slate-700 shadow-md flex items-center z-10">
                  <span className="text-[11px] font-semibold text-slate-200 tracking-tight">
                    Reliability &gt;= 0.80 Active
                  </span>
                </div>

                {/* Bottom Overlay Card */}
                <div className="absolute bottom-4 left-4 right-4 bg-[#111D30]/90 backdrop-blur-md p-3.5 rounded-2xl border border-slate-700 shadow-lg flex items-center justify-between z-10">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center">
                      <Activity className="w-5 h-5 text-sky-400" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-white tracking-tight flex items-center gap-1.5">
                        <span>AI Correlation Engine</span>
                        <Sparkles className="w-3 h-3 text-slate-300" />
                      </div>
                      <div className="text-[11px] text-slate-400">
                        QEEG · TOVA · Symptoms Mapped
                      </div>
                    </div>
                  </div>
                  <span className="text-[11px] font-medium text-slate-300 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700">
                    AHPRA-Aligned
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Frequency Band Strip Indicators */}
        <div className="mt-16 pt-10 border-t border-slate-800/90">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
            <div className="text-xs font-semibold tracking-widest uppercase text-slate-400 font-sans">
              Frequency Band Strip Indicators
            </div>
            <div className="text-[11px] text-slate-400">
              Correlated across normative EEG databases & published clinical literature
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {bands.map((b, idx) => (
              <div
                key={idx}
                className={`bg-[#121E30] border ${b.borderColor} hover:border-slate-500 rounded-2xl p-4.5 flex flex-col justify-between shadow-sm hover:-translate-y-1 transition-all duration-300 group cursor-default`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={`text-sm font-semibold ${b.textColor} tracking-tight`}>
                      {b.name} Band
                    </span>
                    <span className="text-[11px] font-mono text-slate-400 px-2 py-0.5 rounded bg-slate-800/80 border border-slate-700">
                      {b.range}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-snug">
                    {b.desc}
                  </p>
                </div>

                <div className="w-full bg-slate-800/90 h-2 rounded-full mt-4 overflow-hidden">
                  <div
                    className={`bg-gradient-to-r ${b.color} h-full ${b.barWidth} rounded-full transition-all duration-500 group-hover:brightness-110`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
