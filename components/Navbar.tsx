"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, User, ArrowRight } from "lucide-react";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<{ email: string; role: string; fullName?: string } | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);

    // Check auth status
    async function checkAuth() {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated && data.user) {
            setUser(data.user);
          }
        }
      } catch {
        // Not logged in
      }
    }
    checkAuth();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-[#16233B]/90 backdrop-blur-md border-b ${
        scrolled ? "border-slate-800 shadow-lg py-3.5" : "border-slate-800/80 py-4.5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Brand Logo with Lora Serif */}
          <Link
            href="/"
            className="flex items-center group focus:outline-none"
          >
            <span className="text-xl sm:text-2xl font-serif font-normal tracking-tight text-white group-hover:text-slate-200 transition-colors">
              QEEG.com.au
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
            <Link
              href="/how-it-works"
              className="hover:text-white transition-colors duration-200 relative py-1 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-white after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:duration-200"
            >
              How it works
            </Link>
            <Link
              href="/#why-us"
              className="hover:text-white transition-colors duration-200 relative py-1 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-white after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:duration-200"
            >
              Why us
            </Link>
            <Link
              href="/#privacy"
              className="hover:text-white transition-colors duration-200 relative py-1 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-white after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:duration-200"
            >
              Data handling
            </Link>
            <Link
              href="/#pricing"
              className="hover:text-white transition-colors duration-200 relative py-1 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-white after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:duration-200"
            >
              Pricing
            </Link>
            <Link
              href="/about"
              className="hover:text-white transition-colors duration-200 relative py-1 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-white after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:duration-200"
            >
              About
            </Link>
            <Link
              href="/faq"
              className="hover:text-white transition-colors duration-200 relative py-1 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-white after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:duration-200"
            >
              FAQ
            </Link>
          </nav>

          {/* Action Buttons */}
          <div className="hidden md:flex items-center gap-3.5">
            {user ? (
              <Link
                href="/portal"
                className="px-4.5 py-2 text-sm font-semibold text-[#16233B] bg-white hover:bg-slate-100 rounded-lg shadow-sm hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 flex items-center gap-2"
              >
                <User className="w-4 h-4 text-[#16233B]" />
                <span>Practitioner Portal</span>
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-4.5 py-2 text-sm font-medium text-slate-300 hover:text-white bg-transparent hover:bg-slate-800/80 border border-slate-700 hover:border-slate-500 rounded-lg hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
                >
                  Log in
                </Link>
                <Link
                  href="/signup"
                  className="px-4.5 py-2 text-sm font-semibold text-[#16233B] bg-white hover:bg-slate-100 rounded-lg shadow-sm hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 flex items-center gap-1.5"
                >
                  <span>Create free account</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#16233B]" />
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 focus:outline-none transition-colors"
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
        <div className="md:hidden bg-[#16233B] border-b border-slate-800 px-4 pt-4 pb-6 shadow-2xl">
          <div className="flex flex-col gap-3 text-base font-medium">
            <Link
              href="/how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 text-slate-200 hover:bg-slate-800/80 rounded-lg transition-colors"
            >
              How it works
            </Link>
            <Link
              href="/#why-us"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 text-slate-200 hover:bg-slate-800/80 rounded-lg transition-colors"
            >
              Why us
            </Link>
            <Link
              href="/#privacy"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 text-slate-200 hover:bg-slate-800/80 rounded-lg transition-colors"
            >
              Data handling
            </Link>
            <Link
              href="/#pricing"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 text-slate-200 hover:bg-slate-800/80 rounded-lg transition-colors"
            >
              Pricing
            </Link>
            <Link
              href="/about"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 text-slate-200 hover:bg-slate-800/80 rounded-lg transition-colors"
            >
              About
            </Link>
            <Link
              href="/faq"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 text-slate-200 hover:bg-slate-800/80 rounded-lg transition-colors"
            >
              FAQ
            </Link>
            <div className="pt-3 border-t border-slate-800 flex flex-col gap-2.5">
              {user ? (
                <Link
                  href="/portal"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 text-sm font-semibold text-[#16233B] bg-white hover:bg-slate-100 rounded-lg shadow-sm"
                >
                  Practitioner Portal
                </Link>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center py-2.5 text-sm font-medium text-slate-300 bg-slate-800 border border-slate-700 rounded-lg"
                  >
                    Log in
                  </Link>
                  <Link
                    href="/signup"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center py-2.5 text-sm font-semibold text-[#16233B] bg-white hover:bg-slate-100 rounded-lg shadow-sm"
                  >
                    Create free account
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
