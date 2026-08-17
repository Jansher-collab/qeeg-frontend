"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ChevronDown,
  Mail,
  FileCheck,
  Trash2,
  Database,
  ArrowRight,
} from "lucide-react";

interface FaqItem {
  question: string;
  answer: React.ReactNode;
}

export default function FaqPage() {
  // First item open by default as required
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const faqItems: FaqItem[] = [
    {
      question: "Is this a diagnosis?",
      answer: (
        <p>
          No. QEEG and TOVA data cannot themselves produce a diagnosis. The report describes research correlations only, for your own clinical consideration.
        </p>
      ),
    },
    {
      question: "Is the report reviewed by a person before I get it?",
      answer: (
        <p>
          No — every report is AI-generated and delivered directly, with a clear disclaimer stating this. Please check the findings yourself before relying on them.
        </p>
      ),
    },
    {
      question: "What happens if my QEEG's reliability is below 0.80?",
      answer: (
        <p>
          Your browser checks this before anything uploads. Below 0.80, nothing is sent, you&apos;re not charged, and you&apos;re asked to resubmit a QEEG that meets the threshold.
        </p>
      ),
    },
    {
      question: "What if I never download a ready report?",
      answer: (
        <p>
          Reports have a backstop retention period if never downloaded, after which they&apos;re automatically purged with a reminder beforehand. Download promptly once notified.
        </p>
      ),
    },
    {
      question: "Can I get a report re-sent if I lose the download?",
      answer: (
        <p>
          No — download is a one-time action, and the report is purged from our servers the instant it completes. Save it somewhere safe on your own systems immediately.
        </p>
      ),
    },
    {
      question: "What QEEG format do you accept?",
      answer: (
        <p>
          NeuroGuide .tdt exports specifically — the correlation engine and its normative-database reasoning are built around this format and won&apos;t give meaningful results for QEEG data from a different system.
        </p>
      ),
    },
    {
      question: "Do you accept submissions from outside Australia?",
      answer: (
        <p>
          The platform is built around Australian hosting, Australian privacy law, and the NeuroGuide QEEG ecosystem specifically. If you&apos;re practising outside Australia, email us before submitting anything.
        </p>
      ),
    },
    {
      question: "How is my client's data kept private if I don't send their name?",
      answer: (
        <p>
          Your browser strips identity before anything uploads — see{" "}
          <Link
            href="/#privacy"
            className="text-[#16233B] underline font-semibold hover:text-slate-700 transition-colors"
          >
            our privacy page
          </Link>{" "}
          for the full detail. You confirm identity yourself, locally, only when you download the finished report.
        </p>
      ),
    },
  ];

  return (
    <div className="bg-slate-50 text-slate-900 font-sans animate-fadeIn">
      {/* 1. Page Hero Section */}
      <section className="relative pt-32 pb-16 md:pt-40 md:pb-24 overflow-hidden bg-[#16233B] text-white border-b border-slate-800">
        {/* Background Subtle Glows */}
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-[#1C2F4A]/40 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 -right-32 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-left">
          {/* Eyebrow */}
          <div className="inline-flex items-center px-3.5 py-1.5 rounded-full bg-slate-800/90 border border-slate-700/80 text-[11px] font-semibold tracking-[0.22em] text-slate-300 uppercase mb-6 font-sans">
            <span>FAQ</span>
          </div>

          {/* Main Heading in Lora Serif */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[52px] font-serif font-normal text-white leading-[1.2] tracking-tight">
            Common questions
          </h1>
        </div>
      </section>

      {/* 2. Main FAQ Accordion Section */}
      <section className="py-16 sm:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Accordion List */}
          <div className="space-y-4">
            {faqItems.map((item, index) => {
              const isOpen = openIndex === index;
              return (
                <div
                  key={index}
                  className={`rounded-2xl transition-all duration-300 border ${
                    isOpen
                      ? "bg-white border-slate-300 shadow-sm"
                      : "bg-white/90 hover:bg-white border-slate-200/90 shadow-2xs hover:border-slate-300 hover:-translate-y-0.5"
                  }`}
                >
                  <button
                    onClick={() => toggleAccordion(index)}
                    className="w-full px-6 py-5 sm:py-6 text-left flex items-center justify-between gap-4 cursor-pointer focus:outline-none"
                    aria-expanded={isOpen}
                  >
                    <span className="text-base sm:text-lg font-serif font-normal text-[#16233B] tracking-tight leading-snug">
                      {item.question}
                    </span>
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-transform duration-300 ${
                        isOpen
                          ? "bg-slate-100 text-[#16233B] rotate-180"
                          : "bg-slate-50 text-slate-400 group-hover:text-slate-600"
                      }`}
                    >
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-6 pb-6 pt-1 text-sm sm:text-base text-slate-600 font-normal leading-relaxed border-t border-slate-100 animate-fadeIn">
                      {item.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Quick Summary Reference Card Panel */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs hover:shadow-sm hover:-translate-y-0.5 transition-all duration-300 flex flex-col gap-2">
              <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-[#16233B]">
                <FileCheck className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-semibold text-[#16233B] uppercase tracking-wider">
                Reliability Gate ≥ 0.80
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed font-normal">
                Submissions below 0.80 are rejected client-side with zero fee.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs hover:shadow-sm hover:-translate-y-0.5 transition-all duration-300 flex flex-col gap-2">
              <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-[#16233B]">
                <Trash2 className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-semibold text-[#16233B] uppercase tracking-wider">
                Instant Server Purge
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed font-normal">
                Files and reports are permanently deleted upon completed download.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs hover:shadow-sm hover:-translate-y-0.5 transition-all duration-300 flex flex-col gap-2">
              <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-[#16233B]">
                <Database className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-semibold text-[#16233B] uppercase tracking-wider">
                NeuroGuide .tdt Native
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed font-normal">
                Optimized for Australian clinical standard NeuroGuide normative exports.
              </p>
            </div>
          </div>

          {/* 3. Final Call to Action Section */}
          <div className="bg-[#16233B] rounded-3xl p-8 sm:p-12 text-white border border-slate-800 shadow-xl text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-8 hover:border-slate-700 transition-colors">
            <div className="space-y-2 max-w-lg">
              <h3 className="text-2xl sm:text-3xl font-serif font-normal text-white tracking-tight leading-snug">
                Still have a question?
              </h3>
              <p className="text-slate-300 text-sm sm:text-base font-normal">
                Email{" "}
                <a
                  href="mailto:reception@adhd.com.au"
                  className="font-medium text-white underline decoration-slate-400 hover:decoration-white transition-colors"
                >
                  reception@adhd.com.au
                </a>
                .
              </p>
            </div>

            <a
              href="mailto:reception@adhd.com.au"
              className="px-6 py-3.5 text-sm font-semibold text-[#16233B] bg-white hover:bg-slate-100 rounded-xl shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 flex items-center gap-2 shrink-0 group"
            >
              <Mail className="w-4 h-4 text-[#16233B]" />
              <span>Contact Support</span>
              <ArrowRight className="w-4 h-4 text-[#16233B] group-hover:translate-x-1 transition-transform duration-200" />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
