import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Pricing | QEEG.com.au - One Price, No Subscription",
  description:
    "Transparent pricing of $65 AUD per successfully generated report. Zero subscription fees, zero charges for files under 0.80 reliability.",
};

export default function PricingLayout({
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
