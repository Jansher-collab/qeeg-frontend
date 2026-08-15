"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Activity, Menu, X, ArrowRight, ShieldCheck } from "lucide-react";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 bg-white border-b ${
        scrolled ? "border-slate-200 shadow-sm py-3" : "border-slate-150 py-4"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Brand Logo */}
          <Link
            href="/"
            className="flex items-center gap-2.5 group focus:outline-none"
          >
            <div className="w-9 h-9 rounded-lg bg-[#16233B] flex items-center justify-center text-white shadow-xs">
              <Activity className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight text-[#16233B] flex items-center gap-0.5">
                QEEG<span className="text-emerald-600 font-semibold">.com.au</span>
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 -mt-1">
                Referrer Portal
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <Link
              href="#how-it-works"
              className="hover:text-[#16233B] transition-colors duration-150"
            >
              How it works
            </Link>
            <Link
              href="#why-us"
              className="hover:text-[#16233B] transition-colors duration-150"
            >
              Why us
            </Link>
            <Link
              href="#privacy"
              className="hover:text-[#16233B] transition-colors duration-150 flex items-center gap-1.5"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Privacy
            </Link>
            <Link
              href="#pricing"
              className="hover:text-[#16233B] transition-colors duration-150"
            >
              Pricing
            </Link>
          </nav>

          {/* Action Buttons (Desktop) */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="#login"
              className="px-4 py-2 text-sm font-medium text-emerald-700 bg-white hover:bg-emerald-50/60 border border-emerald-400 rounded-xl transition-all"
            >
              Log in
            </Link>
            <Link
              href="#signup"
              className="px-4.5 py-2 text-sm font-semibold text-white bg-emerald-500 hover:bg-emerald-600 rounded-xl shadow-xs transition-all flex items-center gap-1.5"
            >
              <span>Create free account</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-slate-700 hover:bg-slate-100 focus:outline-none"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Sliding Navigation Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-4 pb-6 shadow-lg">
          <div className="flex flex-col gap-3 text-base font-medium">
            <Link
              href="#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 text-slate-700 hover:bg-slate-50 rounded-lg"
            >
              How it works
            </Link>
            <Link
              href="#why-us"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 text-slate-700 hover:bg-slate-50 rounded-lg"
            >
              Why us
            </Link>
            <Link
              href="#privacy"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 text-slate-700 hover:bg-slate-50 rounded-lg flex items-center gap-2"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Privacy & Data Handling
            </Link>
            <Link
              href="#pricing"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 text-slate-700 hover:bg-slate-50 rounded-lg"
            >
              Pricing
            </Link>
            <div className="pt-3 border-t border-slate-200 flex flex-col gap-2.5">
              <Link
                href="#login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 text-sm font-medium text-emerald-700 bg-white border border-emerald-400 rounded-xl"
              >
                Log in
              </Link>
              <Link
                href="#signup"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 text-sm font-semibold text-white bg-emerald-500 hover:bg-emerald-600 rounded-xl shadow-xs flex items-center justify-center gap-2"
              >
                <span>Create free account</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
