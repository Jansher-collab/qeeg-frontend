import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import TrustStrip from "@/components/TrustStrip";
import ProcessSection from "@/components/ProcessSection";
import WhyUsSection from "@/components/WhyUsSection";
import PrivacySection from "@/components/PrivacySection";
import PricingSection from "@/components/PricingSection";
import CtaBanner from "@/components/CtaBanner";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900 selection:bg-[#16233B] selection:text-white">
      {/* Sticky Header Navigation */}
      <Navbar />

      {/* Main Content Sections */}
      <main className="flex-grow">
        <Hero />
        <TrustStrip />
        <ProcessSection />
        <WhyUsSection />
        <PrivacySection />
        <PricingSection />
        <CtaBanner />
      </main>

      {/* Comprehensive Footer */}
      <Footer />
    </div>
  );
}
