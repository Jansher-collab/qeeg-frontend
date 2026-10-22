"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import PasswordInput from "@/components/PasswordInput";
import { ArrowRight, AlertCircle, CheckCircle2, ShieldCheck, Shield } from "lucide-react";
import { getBrowserTimeZone } from "@/lib/getBrowserTimeZone";

function AdminResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError("Missing or invalid reset token. Please request a new link.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/admin/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          newPassword: password,
          timeZone: getBrowserTimeZone(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to reset password.");
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/login/admin");
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300">
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-800 text-xs animate-fadeIn">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <span className="leading-relaxed">{error}</span>
        </div>
      )}

      {success ? (
        <div className="space-y-6 text-center">
          <div className="w-12 h-12 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center mx-auto text-[#16233B]">
            <CheckCircle2 className="w-6 h-6" />
          </div>

          <div>
            <h2 className="text-base font-semibold text-[#16233B]">
              Admin password reset successfully
            </h2>
            <p className="mt-2 text-xs text-slate-600 font-normal">
              All other sessions have been revoked. Redirecting to admin login...
            </p>
          </div>

          <div className="pt-2">
            <Link
              href="/login/admin"
              className="w-full py-3.5 px-6 text-sm font-semibold text-white bg-[#182638] hover:bg-[#111A27] rounded-xl shadow-xs hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 flex items-center justify-center gap-2"
            >
              <span>Go to admin login now</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 font-sans">
              New Admin Password <span className="text-rose-500">*</span> (min 8 chars)
            </label>
            <PasswordInput
              value={password}
              onChange={setPassword}
              required
              autoComplete="new-password"
              aria-label="New admin password"
              placeholder="••••••••"
              className="px-4 py-2.5"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 font-sans">
              Confirm New Password <span className="text-rose-500">*</span>
            </label>
            <PasswordInput
              value={confirmPassword}
              onChange={setConfirmPassword}
              required
              autoComplete="new-password"
              aria-label="Confirm new admin password"
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
                <span>Updating password...</span>
              ) : (
                <>
                  <span>Save new admin password</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-600 font-normal">
              Remember your password?{" "}
              <Link
                href="/login/admin"
                className="font-semibold text-[#16233B] hover:text-slate-700 underline transition-colors"
              >
                Back to admin login
              </Link>
            </p>
          </div>
        </form>
      )}
    </div>
  );
}

export default function AdminResetPasswordPage() {
  return (
    <div className="min-h-screen bg-[#F3F6F8] py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-center items-center animate-fadeIn">
      <div className="max-w-md w-full mx-auto space-y-6">
        <div className="text-center">
          <Link href="/" className="inline-block group focus:outline-none">
            <span className="text-2xl sm:text-3xl font-serif font-normal text-[#16233B] tracking-tight group-hover:text-slate-700 transition-colors">
              QEEG.com.au
            </span>
          </Link>
        </div>

        <div className="text-center">
          <div className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-[#16233B] mb-4">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <span className="inline-block px-3 py-1 rounded-full bg-rose-50 text-rose-700 text-[10px] font-bold uppercase tracking-widest mb-3">
            Admin Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif text-[#16233B] font-normal tracking-tight">
            Set new admin password
          </h1>
          <p className="mt-2 text-sm text-slate-500 font-normal">
            Choose a strong password containing at least 8 characters.
          </p>
        </div>

        <Suspense
          fallback={
            <div className="bg-white rounded-3xl p-8 text-center text-xs text-slate-500">
              Loading reset token...
            </div>
          }
        >
          <AdminResetPasswordForm />
        </Suspense>

        <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-slate-500 font-normal">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-slate-600" />
            <span>Restricted Administrator Flow</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-slate-600" />
            <span>bcrypt Hash Protection</span>
          </div>
        </div>
      </div>
    </div>
  );
}
