import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function CtaBanner() {
  return (
    <section id="signup" className="py-16 sm:py-24 bg-white relative overflow-hidden border-t border-slate-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="bg-[#F3F6F8] rounded-3xl p-10 sm:p-14 text-center border border-slate-200 shadow-2xs hover:shadow-sm transition-all duration-300">
          <div className="text-[11px] font-semibold tracking-[0.22em] text-slate-500 uppercase mb-4 font-sans">
            PRACTITIONER REGISTRATION
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-serif font-normal text-[#16233B] tracking-tight leading-tight">
            Ready to see what the research says?
          </h2>

          <p className="mt-4 text-slate-600 text-sm sm:text-base max-w-lg mx-auto font-normal leading-relaxed">
            Free to sign up. You only pay when a report is actually produced.
          </p>

          <div className="mt-8 flex justify-center">
            <Link
              href="#register"
              className="px-8 py-4 text-sm font-semibold text-white bg-[#182638] hover:bg-[#111A27] rounded-xl shadow-xs hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 flex items-center gap-2 group"
            >
              <span>Create your free account</span>
              <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-1.5 transition-transform duration-200" />
            </Link>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-slate-500 font-normal">
            <span>Australian Referrer Portal</span>
            <span>·</span>
            <span>Sydney Hosted Infrastructure</span>
            <span>·</span>
            <span>Instant Purge-on-Download</span>
          </div>
        </div>
      </div>
    </section>
  );
}
