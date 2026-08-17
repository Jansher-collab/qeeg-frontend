import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "The Science | QEEG.com.au — Literature Correlation & Matching Engine",
  description:
    "Explore how QEEG, TOVA, and symptom data get matched to published research literature via curated knowledge bases and live PubMed cross-referencing.",
};

export default function TheScienceLayout({
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
