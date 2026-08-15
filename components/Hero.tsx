import Link from "next/link";
import { Play, CheckCircle2, FileText, Activity } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative pt-28 pb-16 md:pt-36 md:pb-24 overflow-hidden bg-gradient-to-r from-[#e0f7fa]/70 via-[#e0f2fe]/60 to-[#dbeafe]/50 border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Copy & Actions */}
          <div className="lg:col-span-7 flex flex-col items-start">
            {/* Clean Professional Eyebrow Text Tag (No glowing AI badge) */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-white/90 border border-slate-200 text-xs font-semibold tracking-wide text-[#16233B] shadow-2xs mb-6">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>QEEG · TOVA · Literature Correlation</span>
            </div>

            {/* Main Heading: Lighter, Refined Font Weight in Deep Navy */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight text-[#16233B] leading-[1.18]">
              Turn QEEG and TOVA data into{" "}
              <span className="font-bold relative inline-block text-[#16233B]">
                evidence-linked answers.
                <span className="absolute bottom-1.5 left-0 right-0 h-2.5 bg-emerald-200/70 -z-10 rounded-xs" />
              </span>
            </h1>

            {/* Lede / Description */}
            <p className="mt-6 text-base sm:text-lg text-slate-700 leading-relaxed font-normal max-w-2xl">
              Upload your client&apos;s QEEG, TOVA, and symptom checklist. A{" "}
              <strong className="text-[#16233B] font-semibold">
                neuroscientist-reviewed report
              </strong>{" "}
              comes back describing what the published research actually
              associates with the pattern — correlations, not recommendations.
            </p>

            {/* Call to Action Buttons (Matching Screenshot Layout) */}
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href="#signup"
                className="px-6 py-3.5 text-sm font-semibold text-[#16233B] bg-white hover:bg-slate-50 border border-slate-300 rounded-xl shadow-xs hover:shadow-md transition-all flex items-center gap-2"
              >
                <FileText className="w-4.5 h-4.5 text-emerald-600" />
                <span>Create your free account</span>
              </Link>

              <Link
                href="#how-it-works"
                className="px-5 py-3 text-sm font-medium text-[#16233B] hover:text-emerald-700 flex items-center gap-3 transition-colors group"
              >
                <div className="w-9 h-9 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                </div>
                <span>See how it works</span>
              </Link>
            </div>

            {/* Quick Security & Compliance Markers */}
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-medium text-slate-600">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>AHPRA-conscious reporting</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>No monthly subscription fee</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Purged upon download</span>
              </div>
            </div>
          </div>

          {/* Right Column: Professional Medical Vector Brain Illustration (Matching reference screenshot) */}
          <div className="lg:col-span-5 flex justify-center items-center">
            <div className="relative w-full max-w-md p-6 bg-white/85 rounded-3xl border border-slate-200/90 shadow-md">
              {/* SVG Clinical Medical Illustration */}
              <div className="relative w-full aspect-square flex items-center justify-center p-4">
                <svg
                  viewBox="0 0 400 400"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-full h-full max-h-[340px]"
                >
                  {/* Outer circle accent */}
                  <circle cx="200" cy="200" r="160" stroke="#CBD5E1" strokeWidth="2" strokeDasharray="6 6" />

                  {/* Stethoscope Tubing Outer Loop */}
                  <path
                    d="M 120 180 C 70 230 70 330 180 340 C 290 330 330 250 280 180"
                    stroke="#475569"
                    strokeWidth="5"
                    strokeLinecap="round"
                  />

                  {/* Left Brain Hemisphere (Blue Spectrum) */}
                  <path
                    d="M 195 100 C 140 100 100 135 100 180 C 100 210 115 235 130 255 C 145 275 170 285 195 285 Z"
                    fill="#0284C7"
                    opacity="0.9"
                  />
                  <path
                    d="M 195 100 C 160 115 125 150 125 185 C 125 220 155 250 195 285 Z"
                    fill="#38BDF8"
                    opacity="0.7"
                  />

                  {/* Right Brain Hemisphere (Orange/Gold Spectrum) */}
                  <path
                    d="M 205 100 C 260 100 300 135 300 180 C 300 210 285 235 270 255 C 255 275 230 285 205 285 Z"
                    fill="#EA580C"
                    opacity="0.9"
                  />
                  <path
                    d="M 205 100 C 240 115 275 150 275 185 C 275 220 245 250 205 285 Z"
                    fill="#F97316"
                    opacity="0.7"
                  />

                  {/* Center Division Line */}
                  <line x1="200" y1="95" x2="200" y2="290" stroke="#16233B" strokeWidth="4" strokeLinecap="round" />

                  {/* Stethoscope Chest Piece / Ear Piece */}
                  <circle cx="200" cy="200" r="22" fill="#FFFFFF" stroke="#16233B" strokeWidth="4" />
                  <circle cx="200" cy="200" r="14" fill="#0EA5E9" />
                  <circle cx="200" cy="200" r="6" fill="#FFFFFF" />

                  {/* Electrode Mapping Dots */}
                  <circle cx="145" cy="140" r="6" fill="#FFFFFF" stroke="#0284C7" strokeWidth="3" />
                  <circle cx="130" cy="190" r="6" fill="#FFFFFF" stroke="#0284C7" strokeWidth="3" />
                  <circle cx="160" cy="235" r="6" fill="#FFFFFF" stroke="#0284C7" strokeWidth="3" />

                  <circle cx="255" cy="140" r="6" fill="#FFFFFF" stroke="#EA580C" strokeWidth="3" />
                  <circle cx="270" cy="190" r="6" fill="#FFFFFF" stroke="#EA580C" strokeWidth="3" />
                  <circle cx="240" cy="235" r="6" fill="#FFFFFF" stroke="#EA580C" strokeWidth="3" />

                  {/* Minimal Line Graphics around Brain (Glasses, Pen, Chart, Notes) */}
                  {/* Glasses top left */}
                  <circle cx="85" cy="115" r="12" stroke="#475569" strokeWidth="2.5" />
                  <circle cx="115" cy="115" r="12" stroke="#475569" strokeWidth="2.5" />
                  <line x1="97" y1="115" x2="103" y2="115" stroke="#475569" strokeWidth="2.5" />

                  {/* Pen top right */}
                  <path d="M 290 100 L 320 70 M 310 60 L 330 80" stroke="#475569" strokeWidth="2.5" strokeLinecap="round" />

                  {/* Chart bottom right */}
                  <rect x="290" y="290" width="40" height="30" rx="4" stroke="#475569" strokeWidth="2.5" fill="#FFFFFF" />
                  <path d="M 298 312 L 308 302 L 316 308 L 324 298" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" />
                </svg>

                {/* Overlay Badge */}
                <div className="absolute bottom-3 left-4 bg-white/95 px-3 py-1.5 rounded-lg border border-slate-200 shadow-xs flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-600" />
                  <span className="text-[11px] font-semibold text-[#16233B]">
                    EEG & TOVA Correlation System
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Hero Footer Band: Multi-band Brainwave Spectrum */}
        <div className="mt-14 pt-6 border-t border-slate-200/80">
          <div className="text-center text-xs font-semibold tracking-widest uppercase text-slate-500 mb-3">
            Brainwave Frequency Spectrum Band
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {/* Delta Band */}
            <div className="bg-white border border-slate-200 rounded-xl p-3 flex flex-col items-center justify-center text-center shadow-2xs">
              <div className="text-xs font-semibold text-slate-800">
                Delta Band (0.5 – 4 Hz)
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
                <div className="bg-sky-500 h-full w-[45%]" />
              </div>
            </div>

            {/* Theta Band */}
            <div className="bg-white border border-slate-200 rounded-xl p-3 flex flex-col items-center justify-center text-center shadow-2xs">
              <div className="text-xs font-semibold text-slate-800">
                Theta Band (4 – 8 Hz)
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
                <div className="bg-emerald-500 h-full w-[78%]" />
              </div>
            </div>

            {/* Alpha Band */}
            <div className="bg-white border border-slate-200 rounded-xl p-3 flex flex-col items-center justify-center text-center shadow-2xs">
              <div className="text-xs font-semibold text-slate-800">
                Alpha Band (8 – 12 Hz)
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
                <div className="bg-amber-500 h-full w-[62%]" />
              </div>
            </div>

            {/* Beta Band */}
            <div className="bg-white border border-slate-200 rounded-xl p-3 flex flex-col items-center justify-center text-center shadow-2xs">
              <div className="text-xs font-semibold text-slate-800">
                Beta Band (12 – 30 Hz)
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
                <div className="bg-indigo-500 h-full w-[52%]" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
