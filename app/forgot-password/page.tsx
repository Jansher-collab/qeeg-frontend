"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, AlertCircle, CheckCircle2, ShieldCheck, Mail, ArrowLeft } from "lucide-react";
import { getBrowserTimeZone } from "@/lib/getBrowserTimeZone";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [resetUrl, setResetUrl] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, timeZone: getBrowserTimeZone() }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to process request.");
      }

      setSubmitted(true);
      if (data.resetUrl) {
        setResetUrl(data.resetUrl);
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F3F6F8] py-16 px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
      <div className="max-w-md mx-auto w-full">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <span className="text-2xl sm:text-3xl font-serif font-normal text-[#16233B] tracking-tight">
              QEEG.com.au
            </span>
          </Link>
          <div className="mt-2 text-xs font-semibold tracking-widest text-slate-500 uppercase">
            Account Recovery
          </div>
          <h1 className="mt-3 text-2xl sm:text-3xl font-serif text-[#16233B] font-normal tracking-tight">
            Reset your password
          </h1>
          <p className="mt-2 text-sm text-slate-600 font-normal">
            Enter the email address associated with your practitioner or reviewer account.
          </p>
        </div>

        {/* Card Container */}
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200 shadow-sm">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-800 text-sm">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {submitted ? (
            <div className="space-y-6 text-center">
              <div className="w-12 h-12 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center mx-auto text-[#16233B]">
                <CheckCircle2 className="w-6 h-6" />
              </div>

              <div>
                <h2 className="text-base font-semibold text-[#16233B]">
                  Check your inbox
                </h2>
                <p className="mt-2 text-xs text-slate-600 leading-relaxed font-normal">
                  If an account exists for <strong className="text-slate-800">{email}</strong>, a secure password reset link has been dispatched with 1-hour validity.
                </p>
              </div>

              {resetUrl && (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                    Direct Reset Link:
                  </span>
                  <Link
                    href={resetUrl}
                    className="text-xs text-[#16233B] hover:text-slate-700 font-medium break-all underline"
                  >
                    {resetUrl}
                  </Link>
                </div>
              )}

              <div className="pt-2">
                <Link
                  href="/login"
                  className="w-full py-3.5 px-6 text-sm font-semibold text-white bg-[#182638] hover:bg-[#111A27] rounded-xl shadow-xs hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Return to login</span>
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Account Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="practitioner@clinic.com.au"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:border-[#16233B] focus:ring-1 focus:ring-[#16233B] outline-none transition-all"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 px-6 text-sm font-semibold text-white bg-[#182638] hover:bg-[#111A27] disabled:opacity-50 rounded-xl shadow-xs hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {loading ? (
                    <span>Sending instructions...</span>
                  ) : (
                    <>
                      <span>Send password reset link</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                <p className="text-xs text-slate-600 font-normal">
                  Remember your password?{" "}
                  <Link href="/login" className="font-semibold text-[#16233B] hover:text-slate-700 underline transition-colors">
                    Back to login
                  </Link>
                </p>
              </div>
            </form>
          )}
        </div>

        {/* Security & Infrastructure Note */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs text-slate-500 font-normal">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-slate-600" />
            <span>Sydney VPS Hosted</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-slate-600" />
            <span>Encrypted Token Exchange</span>
          </div>
        </div>
      </div>
    </div>
  );
}
