"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { clearSessionStateClientSide } from "@/lib/clearSession";
import { getBrowserTimeZone } from "@/lib/getBrowserTimeZone";
import PasswordInput from "@/components/PasswordInput";
import QRCode from "qrcode";
import {
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Smartphone,
  KeyRound,
} from "lucide-react";

/**
 * Per-field validation messages, keyed by field name. Populated client-side
 * before submit and merged with the server's 422 `fieldErrors` so both layers
 * speak the same shape and the UI has a single place to read from.
 */
type FieldErrors = Record<string, string>;

/**
 * Mandatory practitioner fields. Each is rendered into the generated report
 * header, and `professionalTitle` is additionally required by
 * `checklist-definition.json` — so a blank here permanently blocks case
 * submission rather than merely looking untidy.
 */
const REQUIRED_FIELD_LABELS: Record<string, string> = {
  fullName: "Full Name & Post-Nominals",
  professionalTitle: "Professional Title / Credentials",
  profession: "Profession / Registration Type",
  providerNumber: "Registration / Provider Number",
  clinicName: "Practice / Clinic Name",
  practiceAddress: "Practice Address",
  phone: "Practice Contact Phone",
  email: "Login & Notification Email",
  password: "Password",
};

/** Shared input styling, with an invalid state driven by fieldErrors. */
function fieldClass(invalid: boolean) {
  return `w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-sm text-slate-900 focus:bg-white focus:border-[#16233B] focus:ring-1 focus:ring-[#16233B] outline-none transition-all placeholder:text-slate-400 font-sans ${
    invalid ? "border-rose-400 bg-rose-50/40" : "border-slate-200"
  }`;
}

/** Inline, field-level error text. Rendered directly beneath its input. */
function FieldErrorText({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <span className="block text-[11px] text-rose-600 mt-1 leading-snug" role="alert">
      {message}
    </span>
  );
}

export default function SignupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [step, setStep] = useState<"form" | "2fa">("form");
  const [legalChecked, setLegalChecked] = useState({ dpa: false, eula: false });
  // Opaque server-side handle for the staged (not yet persisted) registration.
  // No account exists in the database until this is exchanged for a valid OTP.
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [qrSvg, setQrSvg] = useState<string | null>(null);
  const [totpCode, setTotpCode] = useState("");
  const [enrollError, setEnrollError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [backupCodes, setBackupCodes] = useState<string[] | null>(null);
  const [backupCodesConfirmed, setBackupCodesConfirmed] = useState(false);

  // Current published legal document versions (loaded live so signup always
  // shows and records the latest DPA / EULA revision, per the admin panel).
  const FALLBACK_LEGAL_VERSION = "2026-09-01";
  const [legalVersions, setLegalVersions] = useState<Record<string, string>>({
    DPA: FALLBACK_LEGAL_VERSION,
    EULA: FALLBACK_LEGAL_VERSION,
  });
  const [legalDocsError, setLegalDocsError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    fullName: "",
    professionalTitle: "",
    profession: "",
    providerNumber: "",
    clinicName: "",
    practiceAddress: "",
    phone: "",
    email: "",
    password: "",
  });

  // Landing on the registration view: purge any stale/malformed session cookie
  // so a previously broken token cannot hijack the form or dashboard later.
  useEffect(() => {
    clearSessionStateClientSide();
  }, []);

  // Load the currently published DPA / EULA versions. Falls back to the last
  // known static versions if the backend is unreachable so the form still works.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/legal/current");
        if (!res.ok) throw new Error("Failed to load legal documents.");
        const data = await res.json();
        if (cancelled) return;
        const next: Record<string, string> = {};
        for (const doc of data.documents || []) {
          next[doc.documentType] = doc.version;
        }
        setLegalVersions((prev) => ({ ...prev, ...next }));
        setLegalDocsError(null);
      } catch (err: any) {
        if (!cancelled) setLegalDocsError(err.message || "Could not load latest agreement versions.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Client-side mandatory-field pass. Every field is checked BEFORE any
    // network call so the practitioner sees all gaps at once, rather than
    // discovering them one round-trip at a time.
    const nextErrors: FieldErrors = {};
    for (const [key, label] of Object.entries(REQUIRED_FIELD_LABELS)) {
      const value = (formData as Record<string, string>)[key];
      if (typeof value !== "string" || value.trim() === "") {
        nextErrors[key] = `${label} is required.`;
      }
    }
    if (!nextErrors.phone && formData.phone.replace(/\D/g, "").length < 7) {
      nextErrors.phone = "Practice Contact Phone must contain at least 7 digits.";
    }
    if (formData.email.trim() !== "" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      nextErrors.email = "Enter a valid email address.";
    }
    if (!nextErrors.password && formData.password.length < 8) {
      nextErrors.password = "Password must be at least 8 characters long.";
    }

    // The two statutory agreements are mandatory and must be affirmatively
    // ticked, so they are enforced as fields in their own right.
    if (!legalChecked.dpa) {
      nextErrors.dpa = "You must accept the Data Processing Agreement to continue.";
    }
    if (!legalChecked.eula) {
      nextErrors.eula = "You must accept the End User Licence Agreement to continue.";
    }

    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      setError(
        `Please complete ${Object.keys(nextErrors).length} required field${
          Object.keys(nextErrors).length === 1 ? "" : "s"
        } before continuing. The missing fields are highlighted below.`
      );
      return;
    }

    setLoading(true);

    try {
      // Stage 1: validate + hold the details server-side. No account is
      // created here — the backend only mints a TOTP secret and returns an
      // otpauth URL plus an opaque pendingId.
      const res = await fetch("/api/auth/signup/pending", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: formData.fullName,
          professionalTitle: formData.professionalTitle,
          profession: formData.profession,
          providerNumber: formData.providerNumber,
          clinicName: formData.clinicName,
          practiceAddress: formData.practiceAddress,
          phone: formData.phone,
          practiceEmail: formData.email,
          email: formData.email,
          password: formData.password,
          role: "PRACTITIONER",
          timeZone: getBrowserTimeZone(),
          legalAcceptances: [
            { type: "DPA", version: legalVersions.DPA || FALLBACK_LEGAL_VERSION },
            { type: "EULA", version: legalVersions.EULA || FALLBACK_LEGAL_VERSION },
          ],
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        // The server re-validates independently. Surface its per-field
        // breakdown so the UI can point at the exact offending inputs instead
        // of showing one opaque message.
        const serverFieldErrors: FieldErrors = {};
        for (const fe of data.fieldErrors || []) {
          if (fe && typeof fe.field === "string" && typeof fe.message === "string") {
            serverFieldErrors[fe.field] = fe.message;
          }
        }
        if (Object.keys(serverFieldErrors).length > 0) {
          setFieldErrors(serverFieldErrors);
        }
        throw new Error(data.error || "Failed to create account.");
      }

      setFieldErrors({});

      setPendingId(data.pendingId);

      const svg = await QRCode.toString(data.otpauthUrl, {
        type: "svg",
        margin: 1,
        width: 200,
        errorCorrectionLevel: "M",
      });
      setQrSvg(svg);
      setStep("2fa");
    } catch (err: any) {
      setError(err.message || "Failed to create account.");
      setStep("form");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmTotp = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnrollError(null);
    setVerifying(true);
    try {
      // Stage 2: the account (and the 2FA secret + 10 backup codes) is only
      // created now, atomically, once the code is verified.
      const res = await fetch("/api/auth/signup/complete", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pendingId, totpCode: totpCode.trim(), timeZone: getBrowserTimeZone() }),
      });
      const data = await res.json();
      if (!res.ok) {
        // The staged registration is gone (expired / too many bad codes), so the
        // user must re-enter their details and start cleanly.
        if (data.restartRequired) {
          resetToForm(data.error || "Your registration session expired. Please start again.");
          return;
        }
        throw new Error(data.error || "Invalid verification code.");
      }
      setBackupCodes(data.backupCodes || []);
    } catch (err: any) {
      setEnrollError(err.message || "Failed to confirm verification code.");
    } finally {
      setVerifying(false);
    }
  };

  // Abandon the staged registration and return to a clean, empty form.
  const resetToForm = (message?: string) => {
    setStep("form");
    setPendingId(null);
    setQrSvg(null);
    setTotpCode("");
    setEnrollError(null);
    setBackupCodes(null);
    setBackupCodesConfirmed(false);
    setError(message ?? null);
  };

  const handleFinish = () => {
    router.push("/portal");
  };

  return (
    <div className="min-h-screen bg-[#F3F6F8] py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-center items-center animate-fadeIn" suppressHydrationWarning>
      <div className="max-w-xl w-full mx-auto space-y-6">
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
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-[11px] font-semibold text-[#16233B] uppercase tracking-wider mb-3">
              <ShieldCheck className="w-3.5 h-3.5 text-sky-600" />
              <span>Australian Practitioner Registration</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif text-[#16233B] font-normal tracking-tight">
              {step === "form" ? "Create your referring account" : "Secure your account with 2FA"}
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-slate-500 font-normal leading-relaxed">
              {step === "form"
                ? "Saved once to automatically pre-fill your client symptom checklists. No subscription fees."
                : "Two-factor authentication is mandatory. Scan the QR code with any TOTP authenticator app to finish enrollment."}
            </p>
          </div>

          {/* Error Banner */}
          {(step === "form" ? error : enrollError) && (
            <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-800 text-xs animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{step === "form" ? error : enrollError}</span>
            </div>
          )}

          {/* Form */}
          {step === "form" ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 font-sans">
                  Full Name &amp; Post-Nominals *
                </label>
                <input
                  type="text"
                  required
                  aria-invalid={!!fieldErrors.fullName}
                  aria-describedby={fieldErrors.fullName ? "err-fullName" : undefined}
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="Dr Jane Smith, PhD"
                  className={fieldClass(!!fieldErrors.fullName)}
                />
                <span id="err-fullName">
                  <FieldErrorText message={fieldErrors.fullName} />
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 font-sans">
                  Professional Title / Credentials *
                </label>
                <input
                  type="text"
                  required
                  aria-invalid={!!fieldErrors.professionalTitle}
                  aria-describedby={fieldErrors.professionalTitle ? "err-professionalTitle" : undefined}
                  value={formData.professionalTitle}
                  onChange={(e) => setFormData({ ...formData, professionalTitle: e.target.value })}
                  placeholder="Senior Clinical Specialist"
                  className={fieldClass(!!fieldErrors.professionalTitle)}
                />
                <span id="err-professionalTitle">
                  <FieldErrorText message={fieldErrors.professionalTitle} />
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 font-sans">
                  Profession / Registration Type *
                </label>
                <input
                  type="text"
                  required
                  aria-invalid={!!fieldErrors.profession}
                  value={formData.profession}
                  onChange={(e) => setFormData({ ...formData, profession: e.target.value })}
                  placeholder="e.g. Psychologist, Neurologist, GP"
                  className={fieldClass(!!fieldErrors.profession)}
                />
                <span>
                  <FieldErrorText message={fieldErrors.profession} />
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 font-sans">
                  Registration / Provider Number *
                </label>
                <input
                  type="text"
                  required
                  aria-invalid={!!fieldErrors.providerNumber}
                  value={formData.providerNumber}
                  onChange={(e) => setFormData({ ...formData, providerNumber: e.target.value })}
                  placeholder="e.g. PR-88921-VIC / PSY000123"
                  className={fieldClass(!!fieldErrors.providerNumber)}
                />
                <span>
                  <FieldErrorText message={fieldErrors.providerNumber} />
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 font-sans">
                  Practice / Clinic Name *
                </label>
                <input
                  type="text"
                  required
                  aria-invalid={!!fieldErrors.clinicName}
                  value={formData.clinicName}
                  onChange={(e) => setFormData({ ...formData, clinicName: e.target.value })}
                  placeholder="Riverside NeuroCare Practice"
                  className={fieldClass(!!fieldErrors.clinicName)}
                />
                <span>
                  <FieldErrorText message={fieldErrors.clinicName} />
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 font-sans">
                  Practice Contact Phone *
                </label>
                <input
                  type="tel"
                  required
                  aria-invalid={!!fieldErrors.phone}
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+61 3 9820 1144"
                  className={fieldClass(!!fieldErrors.phone)}
                />
                <span>
                  <FieldErrorText message={fieldErrors.phone} />
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 font-sans">
                Practice Address *
              </label>
              <input
                type="text"
                required
                aria-invalid={!!fieldErrors.practiceAddress}
                value={formData.practiceAddress}
                onChange={(e) => setFormData({ ...formData, practiceAddress: e.target.value })}
                placeholder="Suite 4B, 120 Collins Street, Melbourne VIC 3000"
                className={fieldClass(!!fieldErrors.practiceAddress)}
              />
              <span>
                <FieldErrorText message={fieldErrors.practiceAddress} />
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 font-sans">
                Login &amp; Notification Email *
              </label>
              <input
                type="email"
                required
                aria-invalid={!!fieldErrors.email}
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="practitioner@clinic.com.au"
                className={fieldClass(!!fieldErrors.email)}
              />
              <span>
                <FieldErrorText message={fieldErrors.email} />
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 font-sans">
                Password *
              </label>
              <PasswordInput
                value={formData.password}
                onChange={(password) => setFormData({ ...formData, password })}
                required
                autoComplete="new-password"
                aria-label="Password"
                aria-invalid={!!fieldErrors.password}
                placeholder="••••••••"
                className="px-4 py-2.5"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Must be at least 8 characters long.
              </span>
              <span>
                <FieldErrorText message={fieldErrors.password} />
              </span>
            </div>

            {/* Mandatory DPA / EULA acceptance (Spec 3.1c / 3.1d) */}
            <div className="pt-2 space-y-3 border-t border-slate-100">
              <p className="text-[11px] font-semibold text-slate-700 uppercase tracking-wider">
                Required Agreements
              </p>
              {legalDocsError && (
                <p className="text-[11px] text-amber-600 leading-relaxed">
                  Could not reach the live agreements service — showing the last published versions. Please refresh before submitting.
                </p>
              )}
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  required
                  checked={legalChecked.dpa}
                  aria-invalid={!!fieldErrors.dpa}
                  onChange={(e) => setLegalChecked({ ...legalChecked, dpa: e.target.checked })}
                  className={`mt-0.5 w-4 h-4 rounded border-slate-300 text-[#16233B] focus:ring-[#16233B] cursor-pointer ${
                    fieldErrors.dpa ? "border-rose-500 ring-1 ring-rose-400" : ""
                  }`}
                />
                <span className="text-xs text-slate-600 leading-relaxed font-normal">
                  I have read and agree to the{" "}
                  <Link
                    href="/legal/dpa"
                    target="_blank"
                    className="font-semibold text-[#16233B] hover:underline"
                  >
                    Data Processing Agreement
                  </Link>{" "}
                  (Version {legalVersions.DPA || FALLBACK_LEGAL_VERSION}).
                  <FieldErrorText message={fieldErrors.dpa} />
                </span>
              </label>
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  required
                  checked={legalChecked.eula}
                  aria-invalid={!!fieldErrors.eula}
                  onChange={(e) => setLegalChecked({ ...legalChecked, eula: e.target.checked })}
                  className={`mt-0.5 w-4 h-4 rounded border-slate-300 text-[#16233B] focus:ring-[#16233B] cursor-pointer ${
                    fieldErrors.eula ? "border-rose-500 ring-1 ring-rose-400" : ""
                  }`}
                />
                <span className="text-xs text-slate-600 leading-relaxed font-normal">
                  I have read and agree to the{" "}
                  <Link
                    href="/legal/eula"
                    target="_blank"
                    className="font-semibold text-[#16233B] hover:underline"
                  >
                    End User Licence Agreement
                  </Link>{" "}
                  (Version {legalVersions.EULA || FALLBACK_LEGAL_VERSION}).
                  <FieldErrorText message={fieldErrors.eula} />
                </span>
              </label>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-6 text-sm font-semibold text-white bg-[#182638] hover:bg-[#111A27] disabled:opacity-60 rounded-xl shadow-xs hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <span>Registering practitioner account...</span>
                ) : (
                  <>
                    <span>Create Practitioner Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
          ) : backupCodes ? (
            <div className="space-y-5">
              {/* Backup codes — shown exactly once */}
              <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <h2 className="text-sm font-semibold text-emerald-900">Two-factor authentication enabled</h2>
                    <p className="text-xs text-emerald-700 mt-1 leading-relaxed">
                      Your single-use backup codes are shown below. Save them somewhere
                      secure (e.g. your password manager) — they are displayed only once
                      and can be regenerated later from your account settings.
                    </p>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {backupCodes.map((code) => (
                    <code
                      key={code}
                      className="px-2.5 py-2 rounded-lg bg-white border border-emerald-200 text-center text-xs font-mono tracking-widest text-emerald-900"
                    >
                      {code}
                    </code>
                  ))}
                </div>
              </div>

              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={backupCodesConfirmed}
                  onChange={(e) => setBackupCodesConfirmed(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-slate-300 text-[#16233B] focus:ring-[#16233B] cursor-pointer"
                />
                <span className="text-xs text-slate-600 leading-relaxed font-normal">
                  I have saved my backup codes in a secure location.
                </span>
              </label>

              <button
                onClick={handleFinish}
                disabled={!backupCodesConfirmed}
                className="w-full py-3.5 px-6 text-sm font-semibold text-white bg-[#182638] hover:bg-[#111A27] disabled:opacity-60 rounded-xl shadow-xs hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Continue to Portal</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="space-y-5">
              {/* QR enrollment step */}
              {qrSvg ? (
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-sky-50 border border-sky-200 text-[11px] font-semibold text-sky-700 mb-4">
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>Step 1 of 2 — Scan the QR code</span>
                  </div>

                  <div className="w-48 h-48 mx-auto rounded-2xl bg-white border border-slate-200 p-2 flex items-center justify-center shadow-sm">
                    <img
                      src={"data:image/svg+xml;charset=utf-8," + encodeURIComponent(qrSvg)}
                      alt="Scan with your authenticator app"
                      className="w-full h-full"
                    />
                  </div>

                  <p className="mt-4 text-xs text-slate-600 leading-relaxed font-normal">
                    Open Google Authenticator (or any compatible TOTP app) and scan
                    this QR code with your phone. The app will start generating
                    6-digit codes tied to your QEEG.com.au account.
                  </p>

                  <p className="mt-3 text-[11px] text-slate-500 leading-relaxed font-normal border-t border-slate-200 pt-3">
                    <strong className="font-semibold text-slate-700">No account has been created yet.</strong>{" "}
                    Your details are held temporarily and are only saved to our
                    database once you successfully enter a valid code. If you close
                    this page, nothing is stored and you simply start again.
                  </p>
                </div>
              ) : (
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center gap-2 text-slate-500">
                    <KeyRound className="w-4 h-4 animate-pulse" />
                    <span className="text-xs font-medium">Preparing your authenticator enrollment...</span>
                  </div>
                </div>
              )}

              <form onSubmit={handleConfirmTotp} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5 font-sans">
                    Verification Code
                  </label>
                  <input
                    type="text"
                    required
                    autoFocus
                    inputMode="numeric"
                    value={totpCode}
                    onChange={(e) => setTotpCode(e.target.value)}
                    placeholder="6-digit code"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:border-[#16233B] focus:ring-1 focus:ring-[#16233B] outline-none transition-all placeholder:text-slate-400 font-sans tracking-widest"
                  />
                  <p className="mt-1.5 text-[11px] text-slate-500 font-normal">
                    Enter the 6-digit code currently shown in your authenticator app.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={verifying || totpCode.trim().length < 6}
                  className="w-full py-3.5 px-6 text-sm font-semibold text-white bg-[#182638] hover:bg-[#111A27] disabled:opacity-60 rounded-xl shadow-xs hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {verifying ? (
                    <span>Verifying...</span>
                  ) : (
                    <>
                      <span>Verify &amp; enable</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              <button
                type="button"
                onClick={() =>
                  resetToForm("Registration cancelled. No account was created — please enter your details to start again.")
                }
                disabled={verifying}
                className="w-full text-xs font-semibold text-slate-500 hover:text-[#16233B] transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancel and start over
              </button>
            </div>
          )}

          {/* Switch Link Footer */}
          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-600 font-normal">
              {"Already registered? "}
              <Link
                href="/login"
                className="font-semibold text-[#16233B] hover:text-slate-700 underline transition-colors"
              >
                Log in to portal
              </Link>
            </p>
          </div>
        </div>

        {/* Security & Sovereign Infrastructure Note */}
        <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-slate-500 font-normal">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-slate-600" />
            <span>Sydney Sovereign Server (ap-southeast-2)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-slate-600" />
            <span>Zero Data Stored Outside Australia</span>
          </div>
        </div>
      </div>
    </div>
  );
}
