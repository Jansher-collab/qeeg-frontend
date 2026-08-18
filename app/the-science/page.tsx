import Link from "next/link";
import {
  Activity,
  Waves,
  Timer,
  ClipboardCheck,
  Plus,
  Layers,
  BookMarked,
  GraduationCap,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Scale,
  FileCheck2,
  BookOpenCheck,
  ClipboardList,
} from "lucide-react";

export default function TheSciencePage() {
  const bands = [
    {
      name: "Delta",
      range: "0.5 - 4 Hz",
      color: "from-sky-400 to-cyan-500",
      textColor: "text-sky-400",
      borderColor: "border-sky-500/30",
      barWidth: "w-[48%]",
      tag: "Slow Waves",
      desc: "Slow-wave sleep & cortical gating",
    },
    {
      name: "Theta",
      range: "4 - 8 Hz",
      color: "from-teal-400 to-cyan-600",
      textColor: "text-teal-300",
      borderColor: "border-teal-500/30",
      barWidth: "w-[76%]",
      tag: "Memory & Focus",
      desc: "Working memory & attentional control",
    },
    {
      name: "Alpha",
      range: "8 - 12 Hz",
      color: "from-amber-400 to-yellow-500",
      textColor: "text-amber-400",
      borderColor: "border-amber-500/30",
      barWidth: "w-[64%]",
      tag: "Wakeful Rest",
      desc: "Posterior dominant calm alertness",
    },
    {
      name: "Beta",
      range: "12 - 30 Hz",
      color: "from-indigo-400 to-violet-500",
      textColor: "text-indigo-400",
      borderColor: "border-indigo-500/30",
      barWidth: "w-[58%]",
      tag: "Active Focus",
      desc: "Active cognitive processing & focus",
    },
  ];

  return (
    <div className="bg-slate-50 text-slate-900 font-sans animate-fadeIn">
      {/* 1. Hero Section (Matching Landing Page Theme & Elevated Frequency Cards) */}
      <section className="relative pt-28 pb-14 md:pt-32 md:pb-20 overflow-hidden bg-[#16233B] text-white border-b border-slate-800">
        {/* Background Subtle Gradient Glows */}
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-[#1C2F4A]/40 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 -right-32 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-left">
          {/* Eyebrow */}
          <div className="inline-flex items-center px-3.5 py-1.5 rounded-full bg-slate-800/90 border border-slate-700/80 text-[11px] font-semibold tracking-[0.2em] text-slate-300 uppercase mb-5 font-sans">
            <span>The Science</span>
          </div>

          {/* Main Heading in Lora Serif */}
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-[44px] font-serif font-normal text-white leading-[1.2] tracking-tight mb-4 max-w-3xl">
            How QEEG, TOVA, and symptom data get matched to published research
          </h1>

          {/* Lede Paragraph */}
          <p className="text-sm sm:text-base md:text-[17px] text-slate-300 font-normal max-w-2xl leading-relaxed mb-10">
            Every report starts with three inputs from your client and ends with citations from the published literature. Here is exactly what happens in between, and what it never does.
          </p>

          {/* High-Fidelity Frequency Indicator Cards Matching Homepage Visuals */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 text-left w-full">
            {bands.map((b, idx) => (
              <div
                key={idx}
                className={`bg-[#121E30] border ${b.borderColor} hover:border-slate-500 rounded-2xl p-4.5 flex flex-col justify-between shadow-sm hover:-translate-y-1 transition-all duration-300 group cursor-default`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className={`text-base font-bold ${b.textColor} font-sans`}>
                      {b.name}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-md border border-slate-700">
                      {b.range}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 mb-4 font-normal leading-relaxed">
                    {b.desc}
                  </p>
                </div>

                <div>
                  {/* Subtle Gradient Wave Meter */}
                  <div className="w-full bg-slate-800/90 h-1.5 rounded-full overflow-hidden mb-2">
                    <div className={`h-full bg-gradient-to-r ${b.color} ${b.barWidth} rounded-full`} />
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span>Signal Band</span>
                    <span className="text-slate-300 font-medium">{b.tag}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Body Wrap */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20 space-y-14 sm:space-y-20">
        {/* 2. Step 1 Section: The Three Inputs (id="inputs") */}
        <section id="inputs" className="space-y-6 scroll-mt-24">
          <div className="text-center sm:text-left">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-widest text-slate-500 uppercase font-sans mb-1.5">
              <span>Step 1: The Three Inputs</span>
            </div>
            <h2 className="text-xl sm:text-2xl lg:text-[30px] font-serif font-normal text-[#16233B] tracking-tight leading-snug">
              Every correlation starts from the same three sources
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 font-normal leading-relaxed mt-2 max-w-3xl">
              Nothing is inferred from QEEG alone. A finding only becomes part of a report when it is grounded in the actual pattern across all three.
            </p>
          </div>

          {/* 3-Card Row with Elevated Cards & Plus Connectors */}
          <div className="flex flex-col lg:flex-row items-stretch gap-4 sm:gap-5">
            {/* Card 1: QEEG */}
            <div className="flex-1 bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm hover:shadow-xl hover:border-slate-300 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group">
              <div className="space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="w-11 h-11 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-[#16233B] group-hover:scale-105 group-hover:bg-slate-200/70 transition-all duration-300 shadow-2xs">
                    <Activity className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200/80">
                    01 · QEEG
                  </span>
                </div>
                <h3 className="text-base font-semibold text-[#16233B] tracking-tight group-hover:text-slate-900 transition-colors">
                  NeuroGuide QEEG Export
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 font-normal leading-relaxed">
                  Z-scored and raw interhemispheric asymmetry at F7-F8, F3-F4, and C3-C4, across delta, theta, and alpha: read directly from the .tdt export.
                </p>
              </div>
            </div>

            {/* Plus separator */}
            <div className="flex items-center justify-center shrink-0 my-1 lg:my-0">
              <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-xs shadow-2xs">
                <Plus className="w-4 h-4" />
              </div>
            </div>

            {/* Card 2: TOVA */}
            <div className="flex-1 bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm hover:shadow-xl hover:border-slate-300 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group">
              <div className="space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="w-11 h-11 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-[#16233B] group-hover:scale-105 group-hover:bg-slate-200/70 transition-all duration-300 shadow-2xs">
                    <Timer className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200/80">
                    02 · TOVA
                  </span>
                </div>
                <h3 className="text-base font-semibold text-[#16233B] tracking-tight group-hover:text-slate-900 transition-colors">
                  Objective Attention Data
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 font-normal leading-relaxed">
                  Commission errors, omission errors, and response-time variability: an objective, task-based measure alongside the QEEG.
                </p>
              </div>
            </div>

            {/* Plus separator */}
            <div className="flex items-center justify-center shrink-0 my-1 lg:my-0">
              <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-xs shadow-2xs">
                <Plus className="w-4 h-4" />
              </div>
            </div>

            {/* Card 3: Symptom Checklist */}
            <div className="flex-1 bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm hover:shadow-xl hover:border-slate-300 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group">
              <div className="space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="w-11 h-11 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-[#16233B] group-hover:scale-105 group-hover:bg-slate-200/70 transition-all duration-300 shadow-2xs">
                    <ClipboardCheck className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200/80">
                    03 · Checklist
                  </span>
                </div>
                <h3 className="text-base font-semibold text-[#16233B] tracking-tight group-hover:text-slate-900 transition-colors">
                  Clinical Presentation
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 font-normal leading-relaxed">
                  11 symptom domains, scored 0 to 4 by the referring practitioner: what is actually presenting clinically, not just what the instruments show.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Step 2 Section: The Matching Engine */}
        <section className="space-y-6">
          <div className="text-center sm:text-left">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-widest text-slate-500 uppercase font-sans mb-1.5">
              <span>Step 2: The Matching Engine</span>
            </div>
            <h2 className="text-xl sm:text-2xl lg:text-[30px] font-serif font-normal text-[#16233B] tracking-tight leading-snug">
              Matched against a curated library, then checked against current research
            </h2>
          </div>

          <div className="bg-white rounded-3xl p-6 sm:p-9 border border-slate-200 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
            {/* Column 1: Core Engine Architecture */}
            <div className="lg:col-span-5 space-y-4">
              <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-700">
                <Layers className="w-4 h-4 text-[#16233B]" />
                <span>Two sources, never one</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 font-normal leading-relaxed">
                A hand-curated library of literature, reviewed and tagged to specific QEEG, TOVA, and symptom patterns, is checked first. Live queries to published research databases then supplement it, never replacing it, for anything current the curated library does not cover yet.
              </p>
            </div>

            {/* Column 2: Sources with Visual Accents */}
            <div className="lg:col-span-7 space-y-3 border-t lg:border-t-0 lg:border-l border-slate-200/80 pt-6 lg:pt-0 lg:pl-8">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:border-slate-300 hover:bg-white transition-all duration-200 flex items-start gap-3.5 shadow-2xs group">
                <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-[#16233B] shrink-0 mt-0.5 shadow-2xs group-hover:scale-105 transition-transform">
                  <BookMarked className="w-4.5 h-4.5" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-[#16233B]">Curated knowledge base</div>
                  <p className="text-xs text-slate-500 mt-0.5 font-normal leading-relaxed">
                    Reviewed and tagged in advance, spanning neuroscience, psychological, and lifestyle literature: not just EEG studies.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:border-slate-300 hover:bg-white transition-all duration-200 flex items-start gap-3.5 shadow-2xs group">
                <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-[#16233B] shrink-0 mt-0.5 shadow-2xs group-hover:scale-105 transition-transform">
                  <GraduationCap className="w-4.5 h-4.5" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-[#16233B]">PubMed</div>
                  <p className="text-xs text-slate-500 mt-0.5 font-normal leading-relaxed">
                    Primary source for current clinical and biomedical literature.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:border-slate-300 hover:bg-white transition-all duration-200 flex items-start gap-3.5 shadow-2xs group">
                <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-[#16233B] shrink-0 mt-0.5 shadow-2xs group-hover:scale-105 transition-transform">
                  <Sparkles className="w-4.5 h-4.5" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-[#16233B]">Semantic Scholar</div>
                  <p className="text-xs text-slate-500 mt-0.5 font-normal leading-relaxed">
                    Supplementary source catching psychology and allied-health research PubMed indexes less completely.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4. Step 3 Section: Worked Example (id="example") */}
        <section id="example" className="space-y-6 scroll-mt-24">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-widest text-slate-500 uppercase font-sans mb-1.5">
              <span>Step 3: What comes out</span>
            </div>
            <h2 className="text-xl sm:text-2xl lg:text-[30px] font-serif font-normal text-[#16233B] tracking-tight leading-snug">
              A worked example, start to finish
            </h2>
            <p className="text-xs text-slate-500 italic mt-1.5">
              Illustrative only: a constructed example to show the process, not a real case or a real client&apos;s data.
            </p>
          </div>

          {/* 4-Step Sequence with Cards */}
          <div className="space-y-3.5">
            {/* Step 1 */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-2xs hover:shadow-sm hover:border-slate-300 transition-all duration-200 flex items-start gap-4">
              <div className="w-8 h-8 rounded-xl bg-[#16233B] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                <Waves className="w-4 h-4 text-sky-400" />
              </div>
              <div className="space-y-1">
                <div className="text-[11px] font-mono font-semibold text-slate-400">STEP 01</div>
                <h3 className="text-xs sm:text-sm font-semibold text-[#16233B]">
                  QEEG finding: Elevated frontal theta/beta ratio
                </h3>
                <p className="text-xs text-slate-600 font-normal leading-relaxed">
                  Z-scored theta/beta ratio above threshold at frontal sites.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-2xs hover:shadow-sm hover:border-slate-300 transition-all duration-200 flex items-start gap-4">
              <div className="w-8 h-8 rounded-xl bg-[#16233B] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                <ClipboardList className="w-4 h-4 text-sky-400" />
              </div>
              <div className="space-y-1">
                <div className="text-[11px] font-mono font-semibold text-slate-400">STEP 02</div>
                <h3 className="text-xs sm:text-sm font-semibold text-[#16233B]">
                  Checklist finding: Inattention domain scored high
                </h3>
                <p className="text-xs text-slate-600 font-normal leading-relaxed">
                  Symptom checklist shows elevated inattention-domain responses from the referring practitioner.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-2xs hover:shadow-sm hover:border-slate-300 transition-all duration-200 flex items-start gap-4">
              <div className="w-8 h-8 rounded-xl bg-[#16233B] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                <BookOpenCheck className="w-4 h-4 text-sky-400" />
              </div>
              <div className="space-y-1">
                <div className="text-[11px] font-mono font-semibold text-slate-400">STEP 03</div>
                <h3 className="text-xs sm:text-sm font-semibold text-[#16233B]">
                  Literature match: Cross-checked against the theta/beta ratio literature
                </h3>
                <p className="text-xs text-slate-600 font-normal leading-relaxed">
                  The knowledge base and live search surface the substantial body of research on frontal theta/beta ratio as a QEEG correlate of attentional presentations (e.g. Arns, Conners, &amp; Kraemer 2013, a meta-analysis of a decade of theta/beta ratio research in ADHD).
                </p>
              </div>
            </div>

            {/* Step 4 (Output Box) */}
            <div className="bg-[#16233B] text-white rounded-2xl p-5 sm:p-7 border border-slate-800 shadow-lg flex items-start gap-4">
              <div className="w-8 h-8 rounded-xl bg-white text-[#16233B] flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                <FileCheck2 className="w-4 h-4 text-[#16233B]" />
              </div>
              <div className="space-y-2 flex-1">
                <div className="text-[11px] font-mono font-semibold text-slate-300">STEP 04: REPORT OUTPUT</div>
                <h3 className="text-sm sm:text-base font-serif font-normal text-white">
                  What the report says: A correlation, not a diagnosis
                </h3>
                <p className="text-xs text-slate-200 font-normal leading-relaxed italic bg-slate-800/90 p-4 rounded-xl border border-slate-700/80">
                  &ldquo;The elevated frontal theta/beta ratio observed is consistent with patterns reported in the attention literature. This finding, alongside the checklist&apos;s inattention-domain result, may be relevant to the referring practitioner&apos;s clinical picture.&rdquo;
                </p>
                <p className="text-xs text-slate-400 font-normal">
                  The report stops there, as it does not diagnose ADHD or recommend a treatment.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 5. Rigour Grid (id="rigour") */}
        <section id="rigour" className="space-y-6 scroll-mt-24">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-widest text-slate-500 uppercase font-sans mb-1.5">
              <span>What this means for you</span>
            </div>
            <h2 className="text-xl sm:text-2xl lg:text-[30px] font-serif font-normal text-[#16233B] tracking-tight leading-snug">
              Three things that are true of every report, without exception
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
            {/* Card 01 */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm hover:shadow-xl hover:border-slate-300 hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between group">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-[#16233B] group-hover:scale-110 transition-transform duration-300 shadow-2xs">
                    <BookOpenCheck className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-mono font-bold text-slate-400">01</span>
                </div>
                <h3 className="text-base font-serif font-normal text-[#16233B] group-hover:text-slate-900 transition-colors">
                  Every citation traces to a real source
                </h3>
                <p className="text-xs text-slate-600 font-normal leading-relaxed">
                  PubMed ID, DOI, or a curated library entry, never a summary invented to fit the finding.
                </p>
              </div>
            </div>

            {/* Card 02 */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm hover:shadow-xl hover:border-slate-300 hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between group">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-[#16233B] group-hover:scale-110 transition-transform duration-300 shadow-2xs">
                    <Scale className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-mono font-bold text-slate-400">02</span>
                </div>
                <h3 className="text-base font-serif font-normal text-[#16233B] group-hover:text-slate-900 transition-colors">
                  Findings, not diagnoses
                </h3>
                <p className="text-xs text-slate-600 font-normal leading-relaxed">
                  QEEG and TOVA cannot themselves produce a diagnosis. The report states what the research associates with the pattern and leaves the clinical decision to you.
                </p>
              </div>
            </div>

            {/* Card 03 */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm hover:shadow-xl hover:border-slate-300 hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between group">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-[#16233B] group-hover:scale-110 transition-transform duration-300 shadow-2xs">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-mono font-bold text-slate-400">03</span>
                </div>
                <h3 className="text-base font-serif font-normal text-[#16233B] group-hover:text-slate-900 transition-colors">
                  AI-generated, and we say so
                </h3>
                <p className="text-xs text-slate-600 font-normal leading-relaxed">
                  The report is generated by correlating your data against the research without individual human review before delivery. AI-generated content can be wrong: check the findings before relying on them.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 6. Final Call to Action Section (Matching Landing Page Banner Style) */}
        <section className="pt-4">
          <div className="bg-[#16233B] rounded-3xl p-8 sm:p-12 text-white border border-slate-800 shadow-xl text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-8 hover:border-slate-700 transition-colors relative overflow-hidden">
            {/* Subtle glow */}
            <div className="absolute -top-24 -right-24 w-80 h-80 bg-[#1C2F4A]/40 rounded-full blur-3xl pointer-events-none" />

            <div className="space-y-2 max-w-lg relative z-10">
              <h3 className="text-2xl sm:text-3xl font-serif font-normal text-white tracking-tight leading-snug">
                See it applied to your own client&apos;s data
              </h3>
              <p className="text-slate-300 text-sm font-normal">
                Free to sign up. You only pay when a report is actually produced.
              </p>
            </div>

            <Link
              href="/signup"
              className="px-7 py-4 text-sm font-semibold text-[#16233B] bg-white hover:bg-slate-100 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 flex items-center gap-2 shrink-0 group relative z-10"
            >
              <span>Create your free account</span>
              <ArrowRight className="w-4 h-4 text-[#16233B] group-hover:translate-x-1 transition-transform duration-200" />
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
