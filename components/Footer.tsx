import Link from "next/link";
import { Mail, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#16233B] text-slate-300 pt-16 pb-12 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 4-Column Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 pb-10 border-b border-slate-700/60">
          {/* Column 1: Brand & Nav Links */}
          <div className="flex flex-col gap-3.5">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-xl font-serif font-normal text-white tracking-tight">
                QEEG.com.au
              </span>
            </Link>

            <p className="text-xs text-slate-400 leading-relaxed font-normal">
              Evidence-linked QEEG, TOVA, and clinical symptom correlation reports for referring Australian practitioners.
            </p>

            <nav className="flex flex-col gap-2 pt-2 text-xs font-normal">
              <Link href="#how-it-works" className="hover:text-white transition-colors">
                How it works
              </Link>
              <Link href="#pricing" className="hover:text-white transition-colors">
                Pricing
              </Link>
              <Link href="#privacy" className="hover:text-white transition-colors">
                Privacy and data handling
              </Link>
            </nav>
          </div>

          {/* Column 2: Account Links */}
          <div className="flex flex-col gap-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
              Account
            </h3>
            <ul className="flex flex-col gap-2 text-xs text-slate-400 font-normal">
              <li>
                <Link href="#login" className="hover:text-white transition-colors">
                  Log in
                </Link>
              </li>
              <li>
                <Link href="#signup" className="hover:text-white transition-colors">
                  Create free account
                </Link>
              </li>
              <li>
                <Link href="#support" className="hover:text-white transition-colors">
                  Referrer Support Portal
                </Link>
              </li>
              <li>
                <Link href="#reliability-policy" className="hover:text-white transition-colors">
                  0.80 Reliability Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Legal */}
          <div className="flex flex-col gap-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
              Legal
            </h3>
            <ul className="flex flex-col gap-2 text-xs text-slate-400 font-normal">
              <li>
                <Link href="#service-agreement" className="hover:text-white transition-colors">
                  Service agreement
                </Link>
              </li>
              <li>
                <Link href="#privacy-policy" className="hover:text-white transition-colors">
                  Privacy policy
                </Link>
              </li>
              <li>
                <Link href="#ahpra-compliance" className="hover:text-white transition-colors">
                  AHPRA Scope Alignment
                </Link>
              </li>
              <li>
                <Link href="#data-sovereignty" className="hover:text-white transition-colors">
                  Australian Data Sovereignty
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Applied Neurosciences Pty Ltd Contact */}
          <div className="flex flex-col gap-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
              Applied Neurosciences Pty Ltd
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed font-normal">
              Operating clinical correlation and neurotechnology support services across Australia.
            </p>

            <div className="flex flex-col gap-2 pt-1 text-xs">
              <a
                href="mailto:reception@adhd.com.au"
                className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors font-normal"
              >
                <Mail className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                <span>reception@adhd.com.au</span>
              </a>

              <div className="flex items-center gap-2 text-slate-400 font-normal">
                <MapPin className="w-3.5 h-3.5 shrink-0 text-slate-500" />
                <span>Sydney Infrastructure and Review Desk</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center text-xs text-slate-400 font-normal">
          © {new Date().getFullYear()} Applied Neurosciences Pty Ltd (QEEG.com.au). All rights reserved.
        </div>
      </div>
    </footer>
  );
}
