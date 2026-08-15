"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

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
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-white/95 backdrop-blur-md border-b ${
        scrolled ? "border-slate-200/90 shadow-xs py-3.5" : "border-slate-200/70 py-4.5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Brand Logo */}
          <Link
            href="/"
            className="flex items-center group focus:outline-none"
          >
            <span className="text-xl sm:text-2xl font-serif font-normal tracking-tight text-[#16233B] group-hover:text-slate-900 transition-colors">
              QEEG.com.au
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <Link
              href="#how-it-works"
              className="hover:text-[#16233B] transition-colors duration-200 relative py-1 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#16233B] after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:duration-200"
            >
              How it works
            </Link>
            <Link
              href="#why-us"
              className="hover:text-[#16233B] transition-colors duration-200 relative py-1 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#16233B] after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:duration-200"
            >
              Why us
            </Link>
            <Link
              href="#privacy"
              className="hover:text-[#16233B] transition-colors duration-200 relative py-1 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#16233B] after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:duration-200"
            >
              Privacy
            </Link>
            <Link
              href="#pricing"
              className="hover:text-[#16233B] transition-colors duration-200 relative py-1 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#16233B] after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:duration-200"
            >
              Pricing
            </Link>
          </nav>

          {/* Action Buttons */}
          <div className="hidden md:flex items-center gap-3.5">
            <Link
              href="#login"
              className="px-5 py-2 text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 hover:text-slate-900 border border-slate-300 rounded-lg hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
            >
              Log in
            </Link>
            <Link
              href="#signup"
              className="px-5 py-2.5 text-sm font-medium text-white bg-[#182638] hover:bg-[#111A27] rounded-lg shadow-2xs hover:shadow-sm hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
            >
              Create free account
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-slate-700 hover:bg-slate-100 focus:outline-none transition-colors"
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

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-4 pb-6 shadow-lg animate-fadeIn">
          <div className="flex flex-col gap-3 text-base font-medium">
            <Link
              href="#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
            >
              How it works
            </Link>
            <Link
              href="#why-us"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
            >
              Why us
            </Link>
            <Link
              href="#privacy"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
            >
              Privacy
            </Link>
            <Link
              href="#pricing"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
            >
              Pricing
            </Link>
            <div className="pt-3 border-t border-slate-200 flex flex-col gap-2.5">
              <Link
                href="#login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg"
              >
                Log in
              </Link>
              <Link
                href="#signup"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 text-sm font-medium text-white bg-[#182638] hover:bg-[#111A27] rounded-lg shadow-xs"
              >
                Create free account
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
