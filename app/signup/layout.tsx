import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Account | QEEG.com.au - Referring Practitioner Portal",
  description:
    "Create your free referring practitioner account on QEEG.com.au. No cost to sign up: zero fee if reliability is under 0.80.",
};

export default function SignupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#F3F6F8] text-slate-900 selection:bg-[#16233B] selection:text-white">
      {children}
    </div>
  );
}
