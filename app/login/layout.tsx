import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Log in | QEEG.com.au - Referring Practitioner Portal",
  description:
    "Log in to your QEEG.com.au practitioner account to submit cases, track reliability reports, and download evidence-linked correlation findings.",
};

export default function LoginLayout({
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
