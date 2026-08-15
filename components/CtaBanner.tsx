import Link from "next/link";
import { ArrowRight, CheckCircle2, ShieldCheck } from "lucide-react";

export default function CtaBanner() {
  return (
    <section id="signup" className="py-16 bg-[#F3F6F8] relative overflow-hidden border-t border-slate-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="bg-white rounded-2xl p-8 sm:p-10 text-center border border-slate-200 shadow-2xs">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 uppercase tracking-wider mb-4">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Practitioner Registration</span>
          </div>

          <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-[#16233B] tracking-tight">
            Ready to see what the research says?
          </h2>

          <p className="mt-3 text-slate-600 text-sm sm:text-base max-w-lg mx-auto font-normal">
            Free to sign up. You only pay when a report is actually produced.
          </p>

          <div className="mt-6 flex justify-center">
            <Link
              href="#register"
              className="px-7 py-3.5 text-sm font-semibold text-white bg-emerald-500 hover:bg-emerald-600 rounded-xl shadow-xs transition-all flex items-center gap-2"
            >
              <span>Create your free account</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500 font-medium">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Australian Referrer Portal</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Sydney Hosted Infrastructure</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Instant Purge-On-Download</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
