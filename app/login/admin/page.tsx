"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { clearSessionStateClientSide } from "@/lib/clearSession";
import { getBrowserTimeZone } from "@/lib/getBrowserTimeZone";
import PasswordInput from "@/components/PasswordInput";
import { AlertCircle, ArrowRight, ShieldCheck, CheckCircle2, Shield } from "lucide-react";

/**
 * Administrator sign-in.
 *
 * Deliberately password-only: admins never see a TOTP/backup-code step, and the
 * backend issues a session only when the credentials belong to an ADMIN account
 * (POST /api/auth/login/admin). The practitioner flow at /login and
 * /login/practitioner is untouched and keeps its 2FA challenge.
 */
function AdminLoginForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  // Drop any stale practitioner session before showing the admin form so an old
  // cookie can never resurrect a broken session later.
  useEffect(() => {
    clearSessionStateClientSide();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login/admin", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          timeZone: getBrowserTimeZone(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Invalid login credentials.");
      }

      // Defence in depth: never trust the form alone — only an ADMIN session
      // may enter the admin portal.
      if (data.user?.role !== "ADMIN") {
        throw new Error("This account does not have administrator access.");
      }

      window.location.href = "/admin";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to log in.");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full mx-auto space-y-6">
      {/* Minimal Brand Header */}
      <div className="text-center">
        <Link href="/" className="inline-block group focus:outline-none">
          <span className="text-2xl sm:text-3xl font-serif font-normal text-[#16233B] tracking-tight group-hover:text-slate-700 transition-colors">
            QEEG.com.au
          </span>
        </Link>
      </div>

      {/* Centered Authentication Card */}
      <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300">
        {/* Card Title & Subtitle */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-[#16233B] mb-4">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif text-[#16233B] font-normal tracking-tight">
            Admin log in
          </h1>
          <p className="mt-2 text-sm text-slate-500 font-normal">
            Administrator access to the QEEG admin portal.
          </p>
          <p className="mt-1 text-xs text-slate-400 font-normal">
            Email and password only — no two-factor code required.
          </p>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-800 text-xs animate-fadeIn">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 font-sans">
              Email
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="admin@qeeq.com.au"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:border-[#16233B] focus:ring-1 focus:ring-[#16233B] outline-none transition-all placeholder:text-slate-400 font-sans"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 font-sans">
              Password
            </label>
            <PasswordInput
              value={formData.password}
              onChange={(password) => setFormData({ ...formData, password })}
              required
              autoComplete="current-password"
              aria-label="Password"
              placeholder="••••••••"
              className="px-4 py-2.5"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-6 text-sm font-semibold text-white bg-[#182638] hover:bg-[#111A27] disabled:opacity-60 rounded-xl shadow-xs hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <span>Logging in...</span>
              ) : (
                <>
                  <span>Log in to admin portal</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Switch Link Footer */}
        <div className="mt-8 pt-6 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-600 font-normal">
            Referring practitioner?{" "}
            <Link
              href="/login/practitioner"
              className="font-semibold text-[#16233B] hover:text-slate-700 underline transition-colors"
            >
              Log in as a practitioner
            </Link>
          </p>
        </div>
      </div>

      {/* Security & Sovereign Infrastructure Note */}
      <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-slate-500 font-normal">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-slate-600" />
          <span>Sydney Sovereign Hosting</span>
        </div>
        <div className="flex items-center gap-1.5">
          <CheckCircle2 className="w-4 h-4 text-slate-600" />
          <span>TLS 1.3 Encrypted Session</span>
        </div>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-[#F3F6F8] py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-center items-center animate-fadeIn">
      <AdminLoginForm />
    </div>
  );
}
