"use client";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import StatusBadge from "@/components/StatusBadge";
import Link from "next/link";

type Tab = "review" | "all";

const DECISION_COLORS: Record<string, string> = {
  ACCEPT: "bg-green-100 text-green-700",
  MINOR_REVISION: "bg-blue-100 text-blue-700",
  MAJOR_REVISION: "bg-orange-100 text-orange-700",
  REJECT: "bg-red-100 text-red-700",
};

export default function SubEditorDashboard() {
  const [allSubmissions, setAllSubmissions] = useState<any[]>([]);
  const [reviewSubmissions, setReviewSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("review");

  useEffect(() => {
    Promise.all([
      fetch("/api/submissions/all").then(r => r.json()),
      fetch("/api/submissions/sub-editor-review").then(r => r.json()),
    ]).then(([allData, reviewData]) => {
      setAllSubmissions(allData.submissions || []);
      setReviewSubmissions(reviewData.submissions || []);
    }).finally(() => setLoading(false));
  }, []);

  const pendingCount = reviewSubmissions.filter(s =>
    !["ACCEPTED", "REJECTED", "PUBLISHED"].includes(s.status)
  ).length;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-7xl mx-auto px-4 py-10 w-full">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Sub-Editor Dashboard</h1>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { label: "Total Papers", val: allSubmissions.length, color: "bg-blue-50 text-blue-700" },
            { label: "Needs Review", val: pendingCount, color: pendingCount > 0 ? "bg-red-50 text-red-700" : "bg-gray-50 text-gray-500" },
            { label: "Under Review", val: allSubmissions.filter(s => s.status === "UNDER_REVIEW").length, color: "bg-purple-50 text-purple-700" },
            { label: "Accepted", val: allSubmissions.filter(s => s.status === "ACCEPTED").length, color: "bg-green-50 text-green-700" },
          ].map(s => (
            <div key={s.label} className={`rounded-xl p-4 text-center ${s.color}`}>
              <div className="text-3xl font-extrabold">{s.val}</div>
              <div className="text-xs font-semibold mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-5">
          <button
            onClick={() => setTab("review")}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 ${tab === "review" ? "bg-red-600 text-white" : "border border-gray-300 text-gray-600 hover:bg-gray-50"}`}
          >
            🔍 Pending Review
            {pendingCount > 0 && (
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${tab === "review" ? "bg-red-400 text-white" : "bg-red-100 text-red-700"}`}>
                {pendingCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setTab("all")}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${tab === "all" ? "bg-indigo-700 text-white" : "border border-gray-300 text-gray-600 hover:bg-gray-50"}`}
          >
            📄 All Submissions ({allSubmissions.length})
          </button>
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-400">Loading…</div>
        ) : (
          <>
            {/* ── PENDING REVIEW TAB ── */}
            {tab === "review" && (
              <div className="space-y-4">
                {reviewSubmissions.length === 0 ? (
                  <div className="text-center py-20 text-gray-400">
                    <div className="text-4xl mb-3">✅</div>
                    <p className="font-medium">No papers flagged for review</p>
                    <p className="text-sm mt-1">Papers rejected by any reviewer will appear here.</p>
                  </div>
                ) : (
                  reviewSubmissions.map((s: any) => {
                    const rejectReviews = s.reviews.filter((r: any) => r.decision === "REJECT");
                    const otherReviews = s.reviews.filter((r: any) => r.decision !== "REJECT");
                    const isActioned = ["ACCEPTED", "REJECTED", "PUBLISHED"].includes(s.status);
                    return (
                      <div key={s.id} className={`bg-white rounded-xl border-2 overflow-hidden ${isActioned ? "border-gray-200 opacity-70" : "border-red-200"}`}>
                        {/* Header */}
                        <div className={`px-5 py-3 flex items-start justify-between gap-3 flex-wrap ${isActioned ? "bg-gray-50" : "bg-red-50"}`}>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-gray-900 text-sm leading-snug">{s.title}</h3>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {s.author?.name}{s.author?.institution ? ` — ${s.author.institution}` : ""}
                              {s.issue && (
                                <span className="ml-2 text-indigo-600 font-medium">
                                  Vol. {s.issue.volume.number} Issue {s.issue.number} ({s.issue.volume.year})
                                </span>
                              )}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <StatusBadge status={s.status} />
                            <Link
                              href={`/dashboard/editor/submission/${s.id}`}
                              className="px-3 py-1.5 bg-indigo-700 text-white text-xs font-semibold rounded-lg hover:bg-indigo-800"
                            >
                              Review Paper →
                            </Link>
                          </div>
                        </div>

                        {/* Review decisions */}
                        <div className="px-5 py-3 space-y-2">
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Reviewer Decisions</p>
                          {s.reviews.map((r: any, i: number) => (
                            <div key={i} className={`flex items-start gap-3 p-3 rounded-lg border ${r.decision === "REJECT" ? "border-red-200 bg-red-50" : "border-gray-100 bg-gray-50"}`}>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-xs font-semibold text-gray-700">{r.reviewer?.name}</span>
                                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${DECISION_COLORS[r.decision] || "bg-gray-100 text-gray-600"}`}>
                                    {r.decision?.replace(/_/g, " ")}
                                  </span>
                                  {r.submittedAt && (
                                    <span className="text-xs text-gray-400">
                                      {new Date(r.submittedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                                    </span>
                                  )}
                                </div>
                                {r.remarks && (
                                  <p className="text-xs text-gray-600 mt-1 leading-relaxed italic">"{r.remarks}"</p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Action hint */}
                        {!isActioned && (
                          <div className="px-5 py-3 bg-amber-50 border-t border-amber-100">
                            <p className="text-xs text-amber-800 font-medium">
                              ⚠️ This paper was rejected by a reviewer. Click <strong>Review Paper</strong> to read the manuscript, examine all reviews, and take a final decision (confirm rejection or override).
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* ── ALL SUBMISSIONS TAB ── */}
            {tab === "all" && (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="text-left px-4 py-3 font-semibold text-gray-600">Title</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600">Author</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600">Issue</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600">Status</th>
                      <th className="px-4 py-3"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {allSubmissions.length === 0 && (
                      <tr><td colSpan={5} className="text-center py-10 text-gray-400">No submissions found.</td></tr>
                    )}
                    {allSubmissions.map((s: any) => (
                      <tr key={s.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-900 max-w-[260px] truncate">{s.title}</td>
                        <td className="px-4 py-3 text-xs text-gray-500">{s.author?.name}</td>
                        <td className="px-4 py-3 text-xs text-gray-500">
                          {s.issue ? `Vol. ${s.issue.volume.number} I${s.issue.number}` : "—"}
                        </td>
                        <td className="px-4 py-3"><StatusBadge status={s.status} /></td>
                        <td className="px-4 py-3">
                          <Link href={`/dashboard/editor/submission/${s.id}`} className="text-indigo-700 text-xs hover:underline">View →</Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
