import Link from "next/link";
import {
  Activity,
  CheckCircle2,
  Database,
  Search,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  Plus,
  Layers,
  FileCheck,
  AlertCircle,
  FileText,
} from "lucide-react";

export default function TheSciencePage() {
  const waveBands = [
    {
      name: "Delta",
      freq: "0.5 – 4 Hz",
      desc: "Slow-wave & deep sleep",
      color: "bg-slate-800/90 text-slate-200 border-slate-700/80",
    },
    {
      name: "Theta",
      freq: "4 – 8 Hz",
      desc: "Drowsiness & memory",
      color: "bg-[#1C2F4A] text-slate-200 border-slate-700/80",
    },
    {
      name: "Alpha",
      freq: "8 – 12 Hz",
      desc: "Relaxed alert wakefulness",
      color: "bg-[#223554] text-slate-100 border-slate-600/80",
    },
    {
      name: "Beta",
      freq: "12 – 30 Hz",
      desc: "Active focus & cognition",
      color: "bg-[#2A4365] text-white border-slate-500/80",
    },
  ];

  return (
    <div className="bg-slate-50 text-slate-900 font-sans animate-fadeIn">
      {/* 1. Hero Section (with Brain Wave Band Strip) */}
      <section className="relative pt-28 pb-14 md:pt-36 md:pb-20 overflow-hidden bg-[#16233B] text-white border-b border-slate-800 text-center">
        {/* Background Subtle Glows */}
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-[#1C2F4A]/40 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 -right-32 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Eyebrow */}
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-slate-800/90 border border-slate-700/80 text-[11px] font-semibold tracking-[0.2em] text-slate-300 uppercase mb-4 font-sans">
            <span>The Science</span>
          </div>

          {/* Main Heading in Lora Serif */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-normal text-white leading-[1.18] tracking-tight mb-4 max-w-3xl mx-auto">
            How QEEG, TOVA, and symptom data get matched to published research
          </h1>

          {/* Lede Paragraph */}
          <p className="text-sm sm:text-base md:text-lg text-slate-300 font-normal max-w-2xl mx-auto leading-relaxed mb-8">
            Every report starts with three inputs from your client and ends with citations from the published literature. Here&apos;s exactly what happens in between — and what it never does.
          </p>

          {/* Hero Band Element: Wave Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-w-2xl mx-auto text-left">
            {waveBands.map((band) => (
              <div
                key={band.name}
                className={`p-3 rounded-xl border ${band.color} shadow-xs backdrop-blur-xs hover:border-slate-400 transition-colors`}
              >
                <div className="text-xs font-semibold uppercase tracking-wider">{band.name}</div>
                <div className="text-[11px] font-mono text-slate-300 mt-0.5">{band.freq}</div>
                <div className="text-[10px] text-slate-400 mt-1 font-normal leading-tight">
                  {band.desc}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Body Wrap with Compact, Balanced Spacing */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-12 sm:space-y-16">
        {/* 2. Step 1 Section — The Three Inputs (id="inputs") */}
        <section id="inputs" className="space-y-6 scroll-mt-24">
          <div className="text-center sm:text-left">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-widest text-slate-500 uppercase font-sans mb-1.5">
              <span>Step 1 — the three inputs</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-normal text-[#16233B] tracking-tight leading-snug">
              Every correlation starts from the same three sources
            </h2>
            <p className="text-sm sm:text-base text-slate-600 font-normal leading-relaxed mt-2 max-w-3xl">
              Nothing is inferred from QEEG alone. A finding only becomes part of a report when it&apos;s grounded in the actual pattern across all three.
            </p>
          </div>

          {/* 3-Card Row with Compact Gaps */}
          <div className="flex flex-col lg:flex-row items-stretch gap-4 sm:gap-5">
            {/* Card 1: QEEG */}
            <div className="flex-1 bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-2xs hover:shadow-sm hover:border-slate-300 transition-all duration-200 flex flex-col justify-between">
              <div className="space-y-2.5">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-xs font-semibold text-[#16233B]">
                  <span>01 · QEEG</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 font-normal leading-relaxed">
                  Z-scored and raw interhemispheric asymmetry at F7–F8, F3–F4, and C3–C4, across delta, theta, and alpha — read directly from the .tdt export.
                </p>
              </div>
            </div>

            {/* Plus separator */}
            <div className="flex items-center justify-center shrink-0 my-1 lg:my-0">
              <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-xs shadow-2xs">
                <Plus className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Card 2: TOVA */}
            <div className="flex-1 bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-2xs hover:shadow-sm hover:border-slate-300 transition-all duration-200 flex flex-col justify-between">
              <div className="space-y-2.5">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-xs font-semibold text-[#16233B]">
                  <span>02 · TOVA</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 font-normal leading-relaxed">
                  Commission errors, omission errors, and response-time variability — an objective, task-based measure alongside the QEEG.
                </p>
              </div>
            </div>

            {/* Plus separator */}
            <div className="flex items-center justify-center shrink-0 my-1 lg:my-0">
              <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-xs shadow-2xs">
                <Plus className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Card 3: Symptom Checklist */}
            <div className="flex-1 bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-2xs hover:shadow-sm hover:border-slate-300 transition-all duration-200 flex flex-col justify-between">
              <div className="space-y-2.5">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-xs font-semibold text-[#16233B]">
                  <span>03 · Symptom Checklist</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 font-normal leading-relaxed">
                  11 symptom domains, scored 0–4 by the referring practitioner — what&apos;s actually presenting clinically, not just what the instruments show.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Step 2 Section — The Matching Engine */}
        <section className="space-y-6">
          <div className="text-center sm:text-left">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-widest text-slate-500 uppercase font-sans mb-1.5">
              <span>Step 2 — the matching engine</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-normal text-[#16233B] tracking-tight leading-snug">
              Matched against a curated library, then checked against current research
            </h2>
          </div>

          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-2xs grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-center">
            {/* Column 1 */}
            <div className="space-y-3.5">
              <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <Layers className="w-4 h-4 text-[#16233B]" />
                <span>Two sources, never one</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 font-normal leading-relaxed">
                A hand-curated library of literature, reviewed and tagged to specific QEEG/TOVA/symptom patterns, is checked first. Live queries to published research databases then supplement it — never replace it — for anything current the curated library doesn&apos;t cover yet.
              </p>
            </div>

            {/* Column 2: Sources */}
            <div className="space-y-2.5 border-t lg:border-t-0 lg:border-l border-slate-200/80 pt-6 lg:pt-0 lg:pl-6">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition-colors">
                <div className="text-xs font-semibold text-[#16233B]">Curated knowledge base</div>
                <p className="text-xs text-slate-500 mt-1 font-normal leading-relaxed">
                  Reviewed and tagged in advance, spanning neuroscience, psychological, and lifestyle literature — not just EEG studies.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition-colors">
                <div className="text-xs font-semibold text-[#16233B]">PubMed</div>
                <p className="text-xs text-slate-500 mt-1 font-normal leading-relaxed">
                  Primary source for current clinical and biomedical literature.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition-colors">
                <div className="text-xs font-semibold text-[#16233B]">Semantic Scholar</div>
                <p className="text-xs text-slate-500 mt-1 font-normal leading-relaxed">
                  Supplementary — catches psychology and allied-health research PubMed indexes less completely.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 4. Step 3 Section — Worked Example (id="example") */}
        <section id="example" className="space-y-6 scroll-mt-24">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-widest text-slate-500 uppercase font-sans mb-1.5">
              <span>Step 3 — what comes out</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-normal text-[#16233B] tracking-tight leading-snug">
              A worked example, start to finish
            </h2>
            <p className="text-xs text-slate-500 italic mt-1.5">
              Illustrative only — a constructed example to show the process, not a real case or a real client&apos;s data.
            </p>
          </div>

          {/* 4-Step Flow Sequence with Compact Gaps */}
          <div className="space-y-3.5">
            {/* Step 1 */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-2xs hover:shadow-sm transition-all duration-200 flex items-start gap-4">
              <div className="w-7 h-7 rounded-full bg-[#16233B] text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                1
              </div>
              <div className="space-y-1">
                <h3 className="text-xs sm:text-sm font-semibold text-[#16233B]">
                  QEEG finding: Elevated frontal theta/beta ratio
                </h3>
                <p className="text-xs text-slate-600 font-normal leading-relaxed">
                  Z-scored theta/beta ratio above threshold at frontal sites.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-2xs hover:shadow-sm transition-all duration-200 flex items-start gap-4">
              <div className="w-7 h-7 rounded-full bg-[#16233B] text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                2
              </div>
              <div className="space-y-1">
                <h3 className="text-xs sm:text-sm font-semibold text-[#16233B]">
                  Checklist finding: Inattention domain scored high
                </h3>
                <p className="text-xs text-slate-600 font-normal leading-relaxed">
                  Symptom checklist shows elevated inattention-domain responses from the referring practitioner.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-2xs hover:shadow-sm transition-all duration-200 flex items-start gap-4">
              <div className="w-7 h-7 rounded-full bg-[#16233B] text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                3
              </div>
              <div className="space-y-1">
                <h3 className="text-xs sm:text-sm font-semibold text-[#16233B]">
                  Literature match: Cross-checked against the theta/beta ratio literature
                </h3>
                <p className="text-xs text-slate-600 font-normal leading-relaxed">
                  The knowledge base and live search surface the substantial body of research on frontal theta/beta ratio as a QEEG correlate of attentional presentations. (e.g. Arns, Conners, &amp; Kraemer (2013), a meta-analysis of a decade of theta/beta ratio research in ADHD)
                </p>
              </div>
            </div>

            {/* Step 4 (Output Box) */}
            <div className="bg-[#16233B] text-white rounded-2xl p-5 sm:p-7 border border-slate-800 shadow-md flex items-start gap-4">
              <div className="w-7 h-7 rounded-full bg-white text-[#16233B] flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                4
              </div>
              <div className="space-y-2 flex-1">
                <h3 className="text-sm sm:text-base font-serif font-normal text-white">
                  What the report says: A correlation, not a diagnosis
                </h3>
                <p className="text-xs text-slate-200 font-normal leading-relaxed italic bg-slate-800/90 p-4 rounded-xl border border-slate-700/80">
                  &ldquo;The elevated frontal theta/beta ratio observed is consistent with patterns reported in the attention literature. This finding, alongside the checklist&apos;s inattention-domain result, may be relevant to the referring practitioner&apos;s clinical picture.&rdquo;
                </p>
                <p className="text-xs text-slate-400 font-normal">
                  The report stops there — it does not diagnose ADHD or recommend a treatment.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 5. "What this means for you" Rigour Grid (id="rigour") */}
        <section id="rigour" className="space-y-6 scroll-mt-24">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-widest text-slate-500 uppercase font-sans mb-1.5">
              <span>What this means for you</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-normal text-[#16233B] tracking-tight leading-snug">
              Three things that are true of every report, without exception
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
            {/* Card 01 */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-2xs hover:shadow-sm hover:border-slate-300 hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between">
              <div className="space-y-2.5">
                <span className="text-xs font-mono font-bold text-slate-400 block">01</span>
                <h3 className="text-sm sm:text-base font-serif font-normal text-[#16233B]">
                  Every citation traces to a real source
                </h3>
                <p className="text-xs text-slate-600 font-normal leading-relaxed">
                  PubMed ID, DOI, or a curated library entry — never a summary invented to fit the finding.
                </p>
              </div>
            </div>

            {/* Card 02 */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-2xs hover:shadow-sm hover:border-slate-300 hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between">
              <div className="space-y-2.5">
                <span className="text-xs font-mono font-bold text-slate-400 block">02</span>
                <h3 className="text-sm sm:text-base font-serif font-normal text-[#16233B]">
                  Findings, not diagnoses
                </h3>
                <p className="text-xs text-slate-600 font-normal leading-relaxed">
                  QEEG and TOVA cannot themselves produce a diagnosis. The report states what the research associates with the pattern and leaves the clinical decision to you.
                </p>
              </div>
            </div>

            {/* Card 03 */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-2xs hover:shadow-sm hover:border-slate-300 hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between">
              <div className="space-y-2.5">
                <span className="text-xs font-mono font-bold text-slate-400 block">03</span>
                <h3 className="text-sm sm:text-base font-serif font-normal text-[#16233B]">
                  AI-generated, and we say so
                </h3>
                <p className="text-xs text-slate-600 font-normal leading-relaxed">
                  The report is generated by correlating your data against the research — no person reviews each one before delivery. AI-generated content can be wrong: check the findings before relying on them.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 6. Final Call to Action Section */}
        <section className="pt-2">
          <div className="bg-[#16233B] rounded-2xl p-6 sm:p-10 text-white border border-slate-800 shadow-lg text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6 hover:border-slate-700 transition-colors">
            <div className="space-y-1.5 max-w-lg">
              <h3 className="text-xl sm:text-2xl font-serif font-normal text-white tracking-tight leading-snug">
                See it applied to your own client&apos;s data
              </h3>
              <p className="text-slate-300 text-xs sm:text-sm font-normal">
                Free to sign up. You only pay when a report is actually produced.
              </p>
            </div>

            <Link
              href="/signup"
              className="px-6 py-3.5 text-xs sm:text-sm font-semibold text-[#16233B] bg-white hover:bg-slate-100 rounded-xl shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 flex items-center gap-2 shrink-0 group"
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
