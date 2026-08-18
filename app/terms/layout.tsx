import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Terms of Service | QEEG.com.au - Legal & Operational Scope",
  description:
    "Terms of Service governing the use of QEEG.com.au AI-generated research correlation reports operated by Applied Neurosciences Pty Ltd.",
};

export default function TermsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900 selection:bg-[#16233B] selection:text-white">
      <Navbar />
      <main className="flex-grow">{children}</main>
      <Footer />
    </div>
  );
}
