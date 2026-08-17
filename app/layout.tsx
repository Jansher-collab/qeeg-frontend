import type { Metadata } from "next";
import { Inter, Lora } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const lora = Lora({
  subsets: ["latin"],
  variable: "--font-lora",
  display: "swap",
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "QEEG.com.au | Evidence-Linked QEEG & TOVA Research Correlation Reports",
  description:
    "Turn client QEEG and TOVA data into evidence-linked answers. Fast turnaround, Australian-hosted in Sydney, purged immediately upon download.",
  keywords: [
    "QEEG",
    "TOVA",
    "Neurofeedback",
    "EEG Analysis",
    "Brain Mapping",
    "Clinical Neuroscientist",
    "Australia",
    "AHPRA",
  ],
  authors: [{ name: "Applied Neurosciences Pty Ltd" }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${lora.variable} h-full scroll-smooth antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-[#16233B] selection:text-white">
        {children}
      </body>
    </html>
  );
}
