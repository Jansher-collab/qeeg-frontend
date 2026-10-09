import Link from "next/link";
import Image from "next/image";
import { Mail, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#16233B] text-slate-300 pt-16 pb-12 text-sm border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 4-Column Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-slate-800">
          {/* Column 1: Brand & Nav Links */}
          <div className="flex flex-col gap-3.5">
            <Link href="/" className="flex items-center">
              <Image
                src="/logo.png"
                alt="QEEG.com.au"
                width={1600}
                height={1194}
                className="h-16 sm:h-20 w-auto object-contain"
              />
            </Link>

            <p className="text-xs text-slate-400 leading-relaxed font-normal">
              Evidence-linked QEEG, TOVA, and clinical symptom correlation reports for referring Australian practitioners.
            </p>

            <nav className="flex flex-col gap-2 pt-2 text-xs font-normal">
              <Link href="/about" className="hover:text-white transition-colors">
                About us
              </Link>
              <Link href="/how-it-works" className="hover:text-white transition-colors">
                How it works
              </Link>
              <Link href="/faq" className="hover:text-white transition-colors">
                FAQ
              </Link>
              <Link href="/the-science" className="hover:text-white transition-colors">
                The Science
              </Link>
              <Link href="/privacy" className="hover:text-white transition-colors">
                Privacy &amp; Data handling
              </Link>
              <Link href="/pricing" className="hover:text-white transition-colors">
                Pricing
              </Link>
            </nav>
          </div>

          {/* Column 2: Account Links */}
          <div className="flex flex-col gap-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-200 font-sans">
              Account
            </h3>
            <ul className="flex flex-col gap-2 text-xs text-slate-400 font-normal">
              <li>
                <Link href="/login" className="hover:text-white transition-colors">
                  Log in
                </Link>
              </li>
              <li>
                <Link href="/signup" className="hover:text-white transition-colors">
                  Create free account
                </Link>
              </li>
              <li>
                <Link href="/portal" className="hover:text-white transition-colors">
                  Practitioner Portal
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="hover:text-white transition-colors">
                  Reliability Gate Policy (≥ 0.80)
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Legal */}
          <div className="flex flex-col gap-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-200 font-sans">
              Legal
            </h3>
            <ul className="flex flex-col gap-2 text-xs text-slate-400 font-normal">
              <li>
                <Link href="/terms" className="hover:text-white transition-colors">
                  Terms of service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-white transition-colors">
                  Privacy &amp; Data handling
                </Link>
              </li>
              <li>
                <Link href="/#why-us" className="hover:text-white transition-colors">
                  AHPRA Scope Alignment
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-white transition-colors">
                  Australian Data Sovereignty
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Applied Neurosciences Pty Ltd Contact */}
          <div className="flex flex-col gap-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-200 font-sans">
              Applied Neurosciences Pty Ltd
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed font-normal">
              Operating clinical correlation and neurotechnology support services across Australia.
            </p>

            <div className="flex flex-col gap-2 pt-1 text-xs">
              <a
                href="mailto:admin@qeeg.com.au"
                className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors font-normal"
              >
                <Mail className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                <span>admin@qeeg.com.au</span>
              </a>

              <div className="flex items-center gap-2 text-slate-400 font-normal">
                <MapPin className="w-3.5 h-3.5 shrink-0 text-slate-500" />
                <span>Sydney Infrastructure Desk, Australia</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Copyright & Location */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500 font-normal">
          <span>
            &copy; {new Date().getFullYear()} Applied Neurosciences Pty Ltd (QEEG.com.au). All rights reserved.
          </span>
          <span className="text-[11px]">
            Sydney, Australia &middot; Sovereign Cloud Infrastructure
          </span>
        </div>
      </div>
    </footer>
  );
}
