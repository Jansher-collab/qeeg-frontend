import Link from "next/link";
import Image from "next/image";
import { Activity, ArrowRight } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative pt-28 pb-16 md:pt-36 md:pb-20 overflow-hidden bg-[#16233B] text-white border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center">
          {/* Left Column: Headline, Copy & Action Buttons */}
          <div className="lg:col-span-7 flex flex-col items-start">
            {/* Clean Uppercase Eyebrow Tag */}
            <div className="text-[11px] font-medium tracking-[0.25em] text-slate-400 uppercase mb-5 font-sans">
              QEEG · TOVA · LITERATURE CORRELATION
            </div>

            {/* Elegant Serif Headline */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[54px] font-serif font-normal text-white leading-[1.18] tracking-tight">
              Turn QEEG and TOVA data into{" "}
              <span className="text-white">evidence-linked answers.</span>
            </h1>

            {/* Lede Description */}
            <p className="mt-6 text-base sm:text-lg text-slate-300 leading-relaxed font-normal max-w-xl">
              Upload your client&apos;s QEEG, TOVA, and symptom checklist. A{" "}
              <strong className="text-white font-medium">
                neuroscientist-reviewed report
              </strong>{" "}
              comes back describing what the published research actually
              associates with the pattern: correlations, not recommendations.
            </p>

            {/* Action Buttons with Smooth Hover Interactions */}
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href="#signup"
                className="px-6 py-3.5 text-sm font-semibold text-[#16233B] bg-white hover:bg-slate-100 rounded-lg shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
              >
                Create your free account
              </Link>

              <Link
                href="#how-it-works"
                className="px-6 py-3.5 text-sm font-medium text-slate-200 hover:text-white bg-transparent hover:bg-slate-800/70 border border-slate-600/80 hover:border-slate-400 rounded-lg hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 flex items-center gap-2 group"
              >
                <span>See how it works</span>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 group-hover:text-white transition-all duration-200" />
              </Link>
            </div>
          </div>

          {/* Right Column: Hero Image */}
          <div className="lg:col-span-5 flex justify-center items-center">
            <div className="relative w-full max-w-lg rounded-3xl overflow-hidden border border-slate-700/80 shadow-2xl bg-[#142033] group hover:border-slate-600 transition-colors duration-300">
              <div className="relative w-full aspect-[4/3] flex items-center justify-center overflow-hidden">
                <Image
                  src="/hero-brain.jpg"
                  alt="QEEG and TOVA Neural Data Mapping"
                  width={640}
                  height={480}
                  priority
                  className="w-full h-full object-cover object-center group-hover:scale-[1.04] transition-transform duration-700 ease-out"
                />

                {/* Subtle vignette/gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#142033]/85 via-transparent to-transparent pointer-events-none" />

                {/* Overlay Badge */}
                <div className="absolute bottom-4 left-4 bg-[#111D30]/90 backdrop-blur-sm px-3.5 py-2 rounded-xl border border-slate-700 shadow-md flex items-center gap-2.5 z-10">
                  <Activity className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-semibold text-slate-200 tracking-tight">
                    EEG and TOVA Correlation Engine
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Hero Footer Band: Multi-band Brainwave Frequency Spectrum */}
        <div className="mt-16 pt-8 pb-2 border-t border-slate-800/80">
          <div className="text-center text-xs font-semibold tracking-widest uppercase text-slate-400 mb-5">
            Brainwave Frequency Spectrum Band
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Delta Band */}
            <div className="bg-[#121E30] border border-slate-700/70 hover:border-slate-500 rounded-2xl p-4.5 flex flex-col items-center justify-center text-center shadow-2xs hover:-translate-y-1 transition-all duration-300 group">
              <div className="text-sm font-semibold text-sky-300 group-hover:text-sky-200 transition-colors">
                Delta Band (0.5 to 4 Hz)
              </div>
              <div className="w-full bg-slate-800/90 h-2 rounded-full mt-3 overflow-hidden">
                <div className="bg-sky-400 h-full w-[45%] transition-all duration-500 group-hover:w-[50%]" />
              </div>
            </div>

            {/* Theta Band */}
            <div className="bg-[#121E30] border border-slate-700/70 hover:border-slate-500 rounded-2xl p-4.5 flex flex-col items-center justify-center text-center shadow-2xs hover:-translate-y-1 transition-all duration-300 group">
              <div className="text-sm font-semibold text-teal-300 group-hover:text-teal-200 transition-colors">
                Theta Band (4 to 8 Hz)
              </div>
              <div className="w-full bg-slate-800/90 h-2 rounded-full mt-3 overflow-hidden">
                <div className="bg-teal-400 h-full w-[78%] transition-all duration-500 group-hover:w-[82%]" />
              </div>
            </div>

            {/* Alpha Band */}
            <div className="bg-[#121E30] border border-slate-700/70 hover:border-slate-500 rounded-2xl p-4.5 flex flex-col items-center justify-center text-center shadow-2xs hover:-translate-y-1 transition-all duration-300 group">
              <div className="text-sm font-semibold text-amber-300 group-hover:text-amber-200 transition-colors">
                Alpha Band (8 to 12 Hz)
              </div>
              <div className="w-full bg-slate-800/90 h-2 rounded-full mt-3 overflow-hidden">
                <div className="bg-amber-400 h-full w-[62%] transition-all duration-500 group-hover:w-[66%]" />
              </div>
            </div>

            {/* Beta Band */}
            <div className="bg-[#121E30] border border-slate-700/70 hover:border-slate-500 rounded-2xl p-4.5 flex flex-col items-center justify-center text-center shadow-2xs hover:-translate-y-1 transition-all duration-300 group">
              <div className="text-sm font-semibold text-indigo-300 group-hover:text-indigo-200 transition-colors">
                Beta Band (12 to 30 Hz)
              </div>
              <div className="w-full bg-slate-800/90 h-2 rounded-full mt-3 overflow-hidden">
                <div className="bg-indigo-400 h-full w-[52%] transition-all duration-500 group-hover:w-[56%]" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
