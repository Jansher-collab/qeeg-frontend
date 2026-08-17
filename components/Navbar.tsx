"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, User, ArrowRight } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
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

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [mobileMenuOpen]);

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "How it works", href: "/how-it-works" },
    { label: "The Science", href: "/the-science" },
    { label: "Privacy", href: "/privacy" },
    { label: "Pricing", href: "/pricing" },
    { label: "About", href: "/about" },
    { label: "FAQ", href: "/faq" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-[#16233B]/95 backdrop-blur-md border-b ${
        scrolled ? "border-slate-800 shadow-lg py-3" : "border-slate-800/80 py-4"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          {/* Brand Logo with Lora Serif */}
          <Link
            href="/"
            className="flex items-center group focus:outline-none shrink-0"
          >
            <span className="text-xl sm:text-2xl font-serif font-normal tracking-tight text-white group-hover:text-slate-200 transition-colors">
              QEEG.com.au
            </span>
          </Link>

          {/* Desktop / Laptop Navigation Links (Visible on lg and larger) */}
          <nav className="hidden lg:flex items-center gap-4 xl:gap-6 text-xs lg:text-[13px] xl:text-sm font-medium text-slate-300">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  className={`transition-colors duration-200 relative py-1 hover:text-white ${
                    isActive ? "text-white font-semibold" : "text-slate-300"
                  } after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-white ${
                    isActive ? "after:scale-x-100" : "after:scale-x-0 hover:after:scale-x-100"
                  } after:transition-transform after:duration-200`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Action Buttons (Desktop / Laptop) */}
          <div className="hidden lg:flex items-center gap-2.5 xl:gap-3.5 shrink-0">
            {user ? (
              <Link
                href="/portal"
                className="px-4 py-2 text-xs lg:text-sm font-semibold text-[#16233B] bg-white hover:bg-slate-100 rounded-lg shadow-sm hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 flex items-center gap-2"
              >
                <User className="w-4 h-4 text-[#16233B]" />
                <span>Practitioner Portal</span>
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-3.5 py-1.5 xl:px-4 xl:py-2 text-xs lg:text-sm font-medium text-slate-300 hover:text-white bg-transparent hover:bg-slate-800/80 border border-slate-700 hover:border-slate-500 rounded-lg hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
                >
                  Log in
                </Link>
                <Link
                  href="/signup"
                  className="px-3.5 py-1.5 xl:px-4.5 xl:py-2 text-xs lg:text-sm font-semibold text-[#16233B] bg-white hover:bg-slate-100 rounded-lg shadow-sm hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 flex items-center gap-1.5"
                >
                  <span>Create free account</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#16233B]" />
                </Link>
              </>
            )}
          </div>

          {/* Mobile & Tablet Menu Hamburger Button (Visible below lg) */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/80 focus:outline-none transition-colors"
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile & Tablet Drawer Menu */}
      {mobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 top-[60px] sm:top-[68px] z-40 bg-slate-950/70 backdrop-blur-xs lg:hidden animate-fadeIn"
          />

          {/* Drawer Content */}
          <div className="lg:hidden bg-[#16233B] border-b border-slate-800 px-5 pt-3 pb-6 shadow-2xl relative z-50 animate-fadeIn max-h-[calc(100vh-70px)] overflow-y-auto">
            <div className="flex flex-col gap-1.5 text-base font-medium">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.label}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`px-4 py-2.5 rounded-xl transition-colors flex items-center justify-between ${
                      isActive
                        ? "bg-[#1C2F4A] text-white font-semibold"
                        : "text-slate-200 hover:bg-slate-800/80 hover:text-white"
                    }`}
                  >
                    <span>{link.label}</span>
                    {isActive && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </Link>
                );
              })}

              {/* Action Buttons in Mobile/Tablet Drawer */}
              <div className="pt-4 mt-2 border-t border-slate-800 flex flex-col gap-3">
                {user ? (
                  <Link
                    href="/portal"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center py-3 text-sm font-semibold text-[#16233B] bg-white hover:bg-slate-100 rounded-xl shadow-sm flex items-center justify-center gap-2"
                  >
                    <User className="w-4 h-4 text-[#16233B]" />
                    <span>Practitioner Portal</span>
                  </Link>
                ) : (
                  <>
                    <Link
                      href="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full text-center py-2.5 text-sm font-medium text-slate-200 bg-slate-800/90 hover:bg-slate-800 border border-slate-700 rounded-xl transition-colors"
                    >
                      Log in
                    </Link>
                    <Link
                      href="/signup"
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full text-center py-3 text-sm font-semibold text-[#16233B] bg-white hover:bg-slate-100 rounded-xl shadow-md flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <span>Create free account</span>
                      <ArrowRight className="w-4 h-4 text-[#16233B]" />
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </header>
  );
}
