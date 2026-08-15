import Link from "next/link";
import { Activity, Mail, MapPin, ShieldAlert } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#16233B] text-slate-300 pt-14 pb-10 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 4-Column Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 pb-10 border-b border-slate-700/60">
          {/* Column 1: Brand & Nav Links */}
          <div className="flex flex-col gap-3.5">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-emerald-500 flex items-center justify-center text-white">
                <Activity className="w-4 h-4" />
              </div>
              <span className="text-lg font-bold text-white tracking-tight">
                QEEG<span className="text-emerald-400">.com.au</span>
              </span>
            </Link>

            <p className="text-xs text-slate-400 leading-relaxed font-normal">
              Evidence-linked QEEG, TOVA, and clinical symptom correlation reports for referring Australian practitioners.
            </p>

            <nav className="flex flex-col gap-2 pt-1 text-xs">
              <Link href="#how-it-works" className="hover:text-emerald-400 transition-colors">
                How it works
              </Link>
              <Link href="#pricing" className="hover:text-emerald-400 transition-colors">
                Pricing
              </Link>
              <Link href="#privacy" className="hover:text-emerald-400 transition-colors">
                Privacy & data handling
              </Link>
            </nav>
          </div>

          {/* Column 2: Account Links */}
          <div className="flex flex-col gap-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-white">
              Account
            </h3>
            <ul className="flex flex-col gap-2 text-xs text-slate-400">
              <li>
                <Link href="#login" className="hover:text-emerald-400 transition-colors">
                  Log in
                </Link>
              </li>
              <li>
                <Link href="#signup" className="hover:text-emerald-400 transition-colors">
                  Create free account
                </Link>
              </li>
              <li>
                <Link href="#support" className="hover:text-emerald-400 transition-colors">
                  Referrer Support Portal
                </Link>
              </li>
              <li>
                <Link href="#reliability-policy" className="hover:text-emerald-400 transition-colors">
                  0.80 Reliability Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Legal */}
          <div className="flex flex-col gap-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-white">
              Legal
            </h3>
            <ul className="flex flex-col gap-2 text-xs text-slate-400">
              <li>
                <Link href="#service-agreement" className="hover:text-emerald-400 transition-colors">
                  Service agreement
                </Link>
              </li>
              <li>
                <Link href="#privacy-policy" className="hover:text-emerald-400 transition-colors">
                  Privacy policy
                </Link>
              </li>
              <li>
                <Link href="#ahpra-compliance" className="hover:text-emerald-400 transition-colors">
                  AHPRA Scope Alignment
                </Link>
              </li>
              <li>
                <Link href="#data-sovereignty" className="hover:text-emerald-400 transition-colors">
                  Australian Data Sovereignty
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Applied Neurosciences Pty Ltd Contact */}
          <div className="flex flex-col gap-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-white">
              Applied Neurosciences Pty Ltd
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed font-normal">
              Operating clinical correlation & neurotechnology support services across Australia.
            </p>

            <div className="flex flex-col gap-2 pt-1 text-xs">
              <a
                href="mailto:reception@adhd.com.au"
                className="flex items-center gap-2 text-emerald-400 hover:text-emerald-300 transition-colors font-medium"
              >
                <Mail className="w-3.5 h-3.5 shrink-0" />
                <span>reception@adhd.com.au</span>
              </a>

              <div className="flex items-center gap-2 text-slate-400">
                <MapPin className="w-3.5 h-3.5 shrink-0 text-slate-500" />
                <span>Sydney Infrastructure & Review Desk</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Mandatory Legal Disclaimer Box */}
        <div className="mt-6 pt-2">
          <div className="bg-[#1C2F4A] rounded-xl p-4 border border-slate-700/50 flex items-start gap-3 w-full">
            <ShieldAlert className="w-4.5 h-4.5 text-amber-400 shrink-0 mt-0.5" />
            <p className="text-xs text-slate-300 leading-relaxed font-normal">
              <strong className="text-white font-medium">Clinical Scope Disclaimer:</strong>{" "}
              QEEG.com.au reports present research correlations between QEEG, TOVA, and reported symptoms for the referring practitioner&apos;s own clinical consideration. Reports do not constitute a diagnosis or a clinical recommendation.
            </p>
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-slate-400 font-normal">
          © {new Date().getFullYear()} Applied Neurosciences Pty Ltd (QEEG.com.au). All rights reserved.
        </div>
      </div>
    </footer>
  );
}
