"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { clearSessionStateClientSide } from "@/lib/clearSession";
import { getBrowserTimeZone } from "@/lib/getBrowserTimeZone";
import PasswordInput from "@/components/PasswordInput";
import { AlertCircle, ArrowRight, ShieldCheck, CheckCircle2, Check } from "lucide-react";

function LoginForm() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [registeredNotice, setRegisteredNotice] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [requires2FA, setRequires2FA] = useState(false);
  const [totpCode, setTotpCode] = useState("");
  const [useBackupCode, setUseBackupCode] = useState(false);

  // If we reached the login view with a stale/malformed session cookie lurking
  // in the browser, purge it now so the auth form is shown cleanly and no old
  // token can resurrect a broken session later.
  useEffect(() => {
    clearSessionStateClientSide();
  }, []);

  useEffect(() => {
    if (searchParams.get("registered") === "true") {
      setRegisteredNotice(true);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          timeZone: getBrowserTimeZone(),
          ...(requires2FA ? { totpCode: totpCode.trim() } : {}),
        }),
      });

      const data = await res.json();

      // Two-factor challenge: the backend verified credentials but requires a
      // TOTP/backup code before issuing a session token.
      if (res.status === 428 || data.code === "TOTP_REQUIRED") {
        setRequires2FA(true);
        return;
      }

      if (!res.ok) {
        throw new Error(data.error || "Invalid login credentials.");
      }

      // Strict portal boundary (defence in depth — the backend already refuses
      // an ADMIN on this endpoint): this flow is for practitioner accounts
      // only, so an admin session must never be established from here.
      if (data.user?.role === "ADMIN") {
        throw new Error(data.error || "Admins must use the admin login page.");
      }

      // If the user arrived from a report collection link (e.g. via the
      // portal's logged-out redirect), continue to that destination after login.
      const redirectParam = searchParams.get("redirect");
      if (redirectParam) {
        window.location.href = redirectParam;
        return;
      }

      // Role-based routing with immediate session sync
      const targetPath =
        data.user?.role === "ADMIN"
          ? "/admin"
          : data.user?.role === "NEUROSCIENTIST"
          ? "/portal/review"
          : "/portal";

      window.location.href = targetPath;
    } catch (err: any) {
      setError(err.message || "Failed to log in.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full mx-auto space-y-6">
      {/* Minimal Brand Header */}
      <div className="text-center">
        <Link
          href="/"
          className="inline-block group focus:outline-none"
        >
          <span className="text-2xl sm:text-3xl font-serif font-normal text-[#16233B] tracking-tight group-hover:text-slate-700 transition-colors">
            QEEG.com.au
          </span>
        </Link>
      </div>

      {/* Centered Authentication Card */}
      <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300">
        {/* Card Title & Subtitle */}
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-serif text-[#16233B] font-normal tracking-tight">
            Log in
          </h1>
          <p className="mt-2 text-sm text-slate-500 font-normal">
            Welcome back to the practitioner portal.
          </p>
        </div>

        {/* Registered Success Notice */}
        {registeredNotice && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-3 text-emerald-800 text-xs animate-fadeIn">
            <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span className="leading-relaxed font-medium">
              Account created successfully. Please enter your credentials to log in.
            </span>
          </div>
        )}

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
              placeholder="you@practice.com.au"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:border-[#16233B] focus:ring-1 focus:ring-[#16233B] outline-none transition-all placeholder:text-slate-400 font-sans"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-700 font-sans">
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-xs font-medium text-slate-500 hover:text-[#16233B] transition-colors"
              >
                Forgot password?
              </Link>
            </div>
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

          {requires2FA && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700 font-sans">
                  {useBackupCode ? "Backup Code" : "Two-Factor Authentication Code"}
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setUseBackupCode((prev) => !prev);
                    setTotpCode("");
                  }}
                  className="text-xs font-medium text-slate-500 hover:text-[#16233B] transition-colors"
                >
                  {useBackupCode
                    ? "Use authenticator code instead"
                    : "Use a backup code instead"}
                </button>
              </div>
              <input
                type="text"
                required
                autoFocus
                inputMode={useBackupCode ? "text" : "numeric"}
                maxLength={useBackupCode ? 11 : undefined}
                autoCapitalize={useBackupCode ? "characters" : undefined}
                autoComplete={useBackupCode ? "off" : undefined}
                value={totpCode}
                onChange={(e) => setTotpCode(e.target.value)}
                placeholder={useBackupCode ? "e.g. F699A-53903" : "6-digit code"}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:border-[#16233B] focus:ring-1 focus:ring-[#16233B] outline-none transition-all placeholder:text-slate-400 font-sans tracking-widest"
              />
              <p className="mt-1.5 text-[11px] text-slate-500 font-normal">
                {useBackupCode
                  ? "Enter one of the single-use backup codes you saved when you enabled two-factor authentication."
                  : "Enter the 6-digit code from your authenticator app."}
              </p>
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-6 text-sm font-semibold text-white bg-[#182638] hover:bg-[#111A27] disabled:opacity-60 rounded-xl shadow-xs hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <span>{requires2FA ? "Verifying..." : "Logging in..."}</span>
              ) : (
                <>
                  <span>{requires2FA ? "Verify code" : "Log in"}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Switch Link Footer */}
        <div className="mt-8 pt-6 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-600 font-normal">
            New here?{" "}
            <Link
              href="/signup"
              className="font-semibold text-[#16233B] hover:text-slate-700 underline transition-colors"
            >
              Create a free account
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

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#F3F6F8] py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-center items-center animate-fadeIn">
      <Suspense fallback={<div className="text-sm text-slate-400">Loading login...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
