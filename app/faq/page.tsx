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
  ShieldCheck,
  Sparkles,
  HelpCircle,
} from "lucide-react";

interface FaqItem {
  id: string;
  tag: string;
  question: string;
  answer: React.ReactNode;
}

export default function FaqPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const faqItems: FaqItem[] = [
    {
      id: "faq-1",
      tag: "Clinical Scope",
      question: "Is this a diagnosis?",
      answer: (
        <p>
          No. QEEG and TOVA data cannot themselves produce a diagnosis. The report describes research correlations only, for your own clinical consideration. It is designed specifically to stop short of diagnosis or treatment recommendations.
        </p>
      ),
    },
    {
      id: "faq-2",
      tag: "Review Protocol",
      question: "Is the report reviewed by a person before I get it?",
      answer: (
        <p>
          No. Every report is AI-generated and delivered directly, with a clear disclosure stating this. That is an intentional design choice for transparency and rapid turnaround. Please check the findings yourself before relying on them in your clinical practice.
        </p>
      ),
    },
    {
      id: "faq-3",
      tag: "Quality Threshold",
      question: "What happens if my QEEG's reliability is below 0.80?",
      answer: (
        <p>
          Your browser automatically checks test-retest and split-half reliability before anything uploads. Below the 0.80 threshold, the file is rejected locally, nothing is transmitted, you are not charged, and you are prompted to export clean artifact-free epochs.
        </p>
      ),
    },
    {
      id: "faq-4",
      tag: "Data Retention",
      question: "What if I never download a ready report?",
      answer: (
        <p>
          Reports have a strict backstop retention window if left uncollected. If never downloaded, they are permanently purged from the Sydney server with automated practitioner reminders sent beforehand.
        </p>
      ),
    },
    {
      id: "faq-5",
      tag: "Data Security",
      question: "Can I get a report re-sent if I lose the download?",
      answer: (
        <p>
          No. Download is a strictly one-time action. Raw data, TOVA scores, and the generated report are permanently destroyed from our servers the exact millisecond your download completes. Please save reports securely in your own local clinical storage.
        </p>
      ),
    },
    {
      id: "faq-6",
      tag: "File Compatibility",
      question: "What QEEG format do you accept?",
      answer: (
        <p>
          NeuroGuide .tdt exports specifically. The correlation engine and its normative-database reasoning are built around NeuroGuide&apos;s normative distributions and will not produce meaningful results for exports from other systems.
        </p>
      ),
    },
    {
      id: "faq-7",
      tag: "Jurisdiction",
      question: "Do you accept submissions from outside Australia?",
      answer: (
        <p>
          The platform is architected around Australian data sovereignty (Sydney hosting), Australian Privacy Principles (APPs), and the Health Records Act 2001 (Vic). If you practise internationally, please contact us before submitting cases.
        </p>
      ),
    },
    {
      id: "faq-8",
      tag: "Client Privacy",
      question: "How is my client's data kept private if I don't send their name?",
      answer: (
        <p>
          Your browser strips all identifying tags (name, full date of birth, test dates, time stamps) locally before upload. Only age and gender remain alongside an opaque case reference. You re-identify the patient on your own computer upon report download. Please see{" "}
          <Link
            href="/privacy"
            className="text-[#16233B] font-semibold underline hover:text-slate-900 transition-colors"
          >
            our privacy page
          </Link>{" "}
          for the full technical detail.
        </p>
      ),
    },
  ];

  return (
    <div className="bg-slate-50 text-slate-900 font-sans animate-fadeIn">
      {/* 1. Page Hero Section */}
      <section className="relative pt-28 pb-14 md:pt-32 md:pb-20 overflow-hidden bg-[#16233B] text-white border-b border-slate-800 text-left">
        {/* Background Subtle Glows */}
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-[#1C2F4A]/40 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 -right-32 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Eyebrow */}
          <div className="inline-flex items-center px-3.5 py-1.5 rounded-full bg-slate-800/90 border border-slate-700/80 text-[11px] font-semibold tracking-[0.2em] text-slate-300 uppercase mb-5 font-sans">
            <span>Frequently Asked Questions</span>
          </div>

          {/* Main Heading in Lora Serif */}
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-[42px] font-serif font-normal text-white leading-[1.2] tracking-tight mb-4 max-w-3xl">
            Everything you need to know about evidence correlation &amp; privacy
          </h1>

          {/* Lede Paragraph */}
          <p className="text-sm sm:text-base md:text-[17px] text-slate-300 font-normal max-w-3xl leading-relaxed">
            Clear answers on clinical scope, automated literature matching, browser-side de-identification, and data destruction guarantees.
          </p>
        </div>
      </section>

      {/* 2. Main Centered FAQ Accordions Container */}
      <section className="py-12 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 sm:space-y-12">
          {/* Accordion List */}
          <div className="space-y-3.5">
            {faqItems.map((item, index) => {
              const isOpen = openIndex === index;
              return (
                <div
                  key={item.id}
                  className={`rounded-2xl transition-all duration-300 border overflow-hidden ${
                    isOpen
                      ? "bg-white border-slate-300 shadow-sm ring-1 ring-slate-900/5"
                      : "bg-white hover:bg-slate-50/70 border-slate-200/90 shadow-2xs hover:border-slate-300 hover:-translate-y-0.5"
                  }`}
                >
                  <button
                    onClick={() => toggleAccordion(index)}
                    className="w-full px-6 py-5 sm:py-5.5 text-left flex items-center justify-between gap-4 cursor-pointer focus:outline-none group"
                    aria-expanded={isOpen}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3.5">
                      <span className="inline-flex items-center self-start sm:self-auto px-2.5 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider bg-slate-100 text-slate-600 border border-slate-200/80 font-mono shrink-0">
                        {item.tag}
                      </span>
                      <span className="text-base sm:text-[17px] font-serif font-normal text-[#16233B] tracking-tight leading-snug group-hover:text-slate-950 transition-colors">
                        {item.question}
                      </span>
                    </div>

                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 ${
                        isOpen
                          ? "bg-[#16233B] text-white rotate-180 shadow-xs"
                          : "bg-slate-100 text-slate-500 group-hover:bg-slate-200/80 group-hover:text-slate-800"
                      }`}
                    >
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-6 pb-6 pt-2 text-sm sm:text-base text-slate-600 font-normal leading-relaxed border-t border-slate-100 animate-fadeIn">
                      {item.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* 3. Core Technical Standards Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs hover:shadow-sm hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-[#16233B] mb-3 shadow-2xs">
                  <FileCheck className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-semibold text-[#16233B] uppercase tracking-wider mb-1">
                  Reliability Gate &ge; 0.80
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed font-normal">
                  Submissions below 0.80 are rejected client-side with zero fee.
                </p>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs hover:shadow-sm hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-[#16233B] mb-3 shadow-2xs">
                  <Trash2 className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-semibold text-[#16233B] uppercase tracking-wider mb-1">
                  Instant Server Purge
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed font-normal">
                  Files and reports are permanently deleted upon completed download.
                </p>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs hover:shadow-sm hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-[#16233B] mb-3 shadow-2xs">
                  <Database className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-semibold text-[#16233B] uppercase tracking-wider mb-1">
                  NeuroGuide .tdt Native
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed font-normal">
                  Optimized for Australian clinical standard NeuroGuide normative exports.
                </p>
              </div>
            </div>
          </div>

          {/* 4. Support Contact CTA Card */}
          <div className="bg-[#16233B] rounded-3xl p-8 sm:p-10 text-white border border-slate-800 shadow-xl text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6 hover:border-slate-700 transition-colors">
            <div className="space-y-1.5 max-w-lg">
              <h3 className="text-xl sm:text-2xl font-serif font-normal text-white tracking-tight leading-snug">
                Still have a question?
              </h3>
              <p className="text-slate-300 text-xs sm:text-sm font-normal">
                Email{" "}
                <a
                  href="mailto:admin@qeeg.com.au"
                  className="font-medium text-white underline decoration-slate-400 hover:decoration-white transition-colors"
                >
                  admin@qeeg.com.au
                </a>{" "}
                with your enquiry or case reference.
              </p>
            </div>

            <a
              href="mailto:admin@qeeg.com.au"
              className="px-6 py-3.5 text-xs sm:text-sm font-semibold text-[#16233B] bg-white hover:bg-slate-100 rounded-xl shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 flex items-center gap-2 shrink-0 group"
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
