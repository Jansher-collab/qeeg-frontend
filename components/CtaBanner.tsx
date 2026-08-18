import Link from "next/link";
import { ArrowRight, ShieldCheck, Lock, Sparkles } from "lucide-react";

export default function CtaBanner() {
  return (
    <section id="signup" className="py-12 sm:py-16 bg-white relative overflow-hidden border-t border-slate-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="bg-[#16233B] rounded-3xl p-10 sm:p-14 text-center text-white border border-slate-800 shadow-2xl relative overflow-hidden">
          {/* Subtle Glow Overlays */}
          <div className="absolute -top-24 -right-24 w-80 h-80 bg-[#1C2F4A]/40 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/90 border border-slate-700/80 text-[11px] font-semibold tracking-[0.22em] text-slate-300 uppercase mb-5 font-sans relative z-10">
            <Sparkles className="w-3 h-3 text-slate-300" />
            <span>PRACTITIONER REGISTRATION</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-serif font-normal text-white tracking-tight leading-tight relative z-10">
            Ready to see what the research says?
          </h2>

          <p className="mt-4 text-slate-300 text-base sm:text-lg max-w-lg mx-auto font-normal leading-relaxed relative z-10">
            Free to sign up. You only pay when a report is actually produced.
          </p>

          <div className="mt-8 flex justify-center relative z-10">
            <Link
              href="/signup"
              className="px-8 py-4 text-sm font-semibold text-[#16233B] bg-white hover:bg-slate-100 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 flex items-center gap-2 group"
            >
              <span>Create your free account</span>
              <ArrowRight className="w-4 h-4 text-[#16233B] group-hover:translate-x-1.5 transition-transform duration-200" />
            </Link>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-slate-400 font-normal relative z-10">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-sky-400" />
              <span>Australian Referrer Portal</span>
            </div>
            <span>·</span>
            <div className="flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-sky-400" />
              <span>Sydney Hosted Infrastructure</span>
            </div>
            <span>·</span>
            <span>Instant Purge-on-Download</span>
          </div>
        </div>
      </div>
    </section>
  );
}
