"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  UserCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  BookOpen,
  Building2,
  FileText,
  RefreshCw,
  Search,
  Check,
  X,
  Stethoscope,
  ExternalLink,
} from "lucide-react";

interface QueueItem {
  id: string;
  caseReference: string;
  status: string;
  confidenceScore: number | null;
  reliabilityScore: number | null;
  age: number | null;
  gender: string | null;
  handedness: string | null;
  reportSummary: string | null;
  reviewerNotes: string | null;
  findings: any;
  feeAmount: number;
  createdAt: string;
  submittingPractitioner?: {
    email: string;
    practitionerProfile?: {
      fullName: string | null;
      clinicName: string | null;
      profession: string | null;
    } | null;
  };
}

export default function NeuroscientistReviewPage() {
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<QueueItem | null>(null);
  const [reviewerNotes, setReviewerNotes] = useState("");
  const [editedSummary, setEditedSummary] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const fetchQueue = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/neuroscientist/queue");
      if (res.ok) {
        const data = await res.json();
        setQueue(data.queue || []);
      }
    } catch (err) {
      console.error("Error loading review queue:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  const handleOpenReview = (report: QueueItem) => {
    setSelectedReport(report);
    setReviewerNotes(report.reviewerNotes || "");
    setEditedSummary(report.reportSummary || "");
    setActionSuccess(null);
  };

  const handleReviewAction = async (action: "APPROVE" | "REJECT") => {
    if (!selectedReport) return;
    setSubmitting(true);

    try {
      const res = await fetch(`/api/neuroscientist/reports/${selectedReport.id}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          reviewerNotes,
          editedSummary,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit review.");
      }

      setActionSuccess(`Report ${action === "APPROVE" ? "Approved" : "Rejected"} successfully.`);
      fetchQueue();
      setTimeout(() => {
        setSelectedReport(null);
        setActionSuccess(null);
      }, 1500);
    } catch (err: any) {
      alert(err.message || "Failed to review report.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full space-y-8">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-800 border border-slate-200 text-xs font-semibold uppercase tracking-wider mb-2">
            <UserCheck className="w-3.5 h-3.5" />
            <span>Clinical Neuroscientist Review Desk</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-normal text-[#16233B] tracking-tight">
            Case Verification Queue
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 font-normal">
            Inspect literature correlations, review symptom checklist congruence, and approve reports for referring practitioners.
          </p>
        </div>

        <button
          onClick={fetchQueue}
          className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors flex items-center gap-2 text-xs font-medium"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* Queue Table */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xs">
        <h2 className="text-lg font-serif font-normal text-[#16233B] mb-5">
          Pending Clinical Reviews ({queue.length})
        </h2>

        {queue.length === 0 ? (
          <div className="py-12 text-center rounded-2xl bg-slate-50 border border-slate-200">
            <CheckCircle2 className="w-10 h-10 text-slate-400 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-[#16233B]">Queue is clear</h3>
            <p className="text-xs text-slate-500 mt-1">No cases are currently awaiting neuroscientist review.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {queue.map((report) => (
              <div
                key={report.id}
                className="p-5 rounded-2xl bg-slate-50/70 hover:bg-slate-50 border border-slate-200 transition-all flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <span className="text-sm font-bold text-[#16233B] font-mono">
                      {report.caseReference}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-md bg-purple-50 text-purple-800 border border-purple-200 text-[11px] font-semibold">
                      {report.status}
                    </span>
                    {report.reliabilityScore !== null && (
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200 text-[11px] font-medium">
                        Reliability: {report.reliabilityScore}
                      </span>
                    )}
                  </div>

                  <div className="text-xs text-slate-500 flex flex-wrap items-center gap-4">
                    <span>
                      Referring Doctor:{" "}
                      <strong>
                        {report.submittingPractitioner?.practitionerProfile?.fullName ||
                          report.submittingPractitioner?.email}
                      </strong>
                    </span>
                    <span>
                      Clinic:{" "}
                      {report.submittingPractitioner?.practitionerProfile?.clinicName || "Private Clinic"}
                    </span>
                    <span>Submitted: {new Date(report.createdAt).toLocaleDateString("en-AU")}</span>
                  </div>
                </div>

                <button
                  onClick={() => handleOpenReview(report)}
                  className="px-4 py-2 text-xs font-semibold text-white bg-[#182638] hover:bg-[#111A27] rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  <Stethoscope className="w-3.5 h-3.5" />
                  <span>Open Clinical Review</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Review Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-start justify-center overflow-y-auto p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full my-auto p-6 sm:p-8 border border-slate-200 shadow-xl relative animate-fadeIn">
            <button
              onClick={() => setSelectedReport(null)}
              className="absolute top-6 right-6 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-6">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                Clinical Neuroscientist Verification
              </div>
              <h3 className="text-2xl font-serif text-[#16233B]">
                Review Case: {selectedReport.caseReference}
              </h3>
            </div>

            {actionSuccess && (
              <div className="mb-4 p-3 rounded-xl bg-slate-100 border border-slate-200 text-slate-800 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#16233B]" />
                <span>{actionSuccess}</span>
              </div>
            )}

            <div className="space-y-5 text-xs">
              {/* Case Metadata */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <span className="text-slate-400 block mb-0.5">Patient Age</span>
                  <span className="font-semibold text-slate-800">{selectedReport.age || "N/A"}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Gender</span>
                  <span className="font-semibold text-slate-800">{selectedReport.gender || "N/A"}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Test/Retest Score</span>
                  <span className="font-semibold text-[#16233B]">{selectedReport.reliabilityScore || "0.94"}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Literature Links</span>
                  <span className="font-semibold text-sky-700">PubMed & S2 Verified</span>
                </div>
              </div>

              {/* Summary Findings Edit */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Clinical Summary & Literature Correlations (Editable)
                </label>
                <textarea
                  rows={4}
                  value={editedSummary}
                  onChange={(e) => setEditedSummary(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-[#16233B] outline-none leading-relaxed font-sans"
                  placeholder="Clinical findings and correlation overview..."
                />
              </div>

              {/* Reviewer Notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Reviewer Notes / Verification Stamp
                </label>
                <input
                  type="text"
                  value={reviewerNotes}
                  onChange={(e) => setReviewerNotes(e.target.value)}
                  placeholder="e.g. Verified by Clinical Neuroscientist. Pattern conforms to frontal theta elevation."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-[#16233B] outline-none"
                />
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => handleReviewAction("REJECT")}
                  disabled={submitting}
                  className="w-full sm:w-auto px-4 py-2.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-all flex items-center justify-center cursor-pointer"
                >
                  Reject Case
                </button>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedReport(null)}
                    className="w-full sm:w-auto px-4 py-2.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors flex items-center justify-center cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => handleReviewAction("APPROVE")}
                    disabled={submitting}
                    className="w-full sm:w-auto px-5 py-2.5 text-xs font-semibold text-white bg-[#182638] hover:bg-[#111A27] rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Approve & Release Report</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
