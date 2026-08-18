import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Privacy & Data Handling | QEEG.com.au - Sovereign Australian Infrastructure",
  description:
    "Patient identity is stripped in your browser before upload. Hosted exclusively on Australian sovereign infrastructure in Sydney and purged immediately upon download.",
};

export default function PrivacyLayout({
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
