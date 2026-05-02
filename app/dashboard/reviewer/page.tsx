"use client";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import StatusBadge from "@/components/StatusBadge";
import Link from "next/link";

export default function ReviewerDashboard() {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Decline modal state
  const [decliningId, setDecliningId] = useState<string | null>(null);
  const [decliningTitle, setDecliningTitle] = useState("");
  const [declineReason, setDeclineReason] = useState("");
  const [declining, setDeclining] = useState(false);
  const [declineError, setDeclineError] = useState("");
  const [msg, setMsg] = useState("");

  function load() {
    fetch("/api/reviewer/assignments")
      .then(r => r.json())
      .then(d => setAssignments(d.assignments || []))
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  async function handleDecline() {
    if (!declineReason.trim()) { setDeclineError("Please provide a reason for declining."); return; }
    setDeclining(true);
    setDeclineError("");
    const res = await fetch("/api/reviewer/decline", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ submissionId: decliningId, reason: declineReason }),
    });
    setDeclining(false);
    if (res.ok) {
      setMsg("✅ Assignment declined. The editor has been notified.");
      setDecliningId(null);
      setDeclineReason("");
      load();
      setTimeout(() => setMsg(""), 5000);
    } else {
      const d = await res.json();
      setDeclineError(d.error || "Failed to decline. Please try again.");
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Decline modal */}
      {decliningId && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h2 className="font-bold text-gray-900 text-lg mb-1">Decline Assignment</h2>
            <p className="text-sm text-gray-500 mb-1">Paper: <span className="font-medium text-gray-700">{decliningTitle}</span></p>
            <p className="text-sm text-gray-500 mb-4">
              Please tell us why you cannot review this paper. The editor will be notified and will assign a replacement reviewer.
            </p>
            <textarea
              value={declineReason}
              onChange={e => setDeclineReason(e.target.value)}
              rows={4}
              placeholder="e.g. This topic is outside my area of expertise…"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 mb-3"
            />
            {declineError && <p className="text-sm text-red-600 mb-3">{declineError}</p>}
            <div className="flex gap-3">
              <button
                onClick={handleDecline}
                disabled={declining}
                className="flex-1 bg-red-600 text-white py-2.5 rounded-lg font-semibold text-sm hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {declining ? "Declining…" : "Confirm Decline"}
              </button>
              <button
                onClick={() => { setDecliningId(null); setDeclineReason(""); setDeclineError(""); }}
                className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-lg font-semibold text-sm hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="flex-1 max-w-5xl mx-auto px-4 py-10 w-full">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Reviewer Dashboard</h1>
        <p className="text-sm text-gray-500 mb-6">Papers assigned to you for review</p>

        {msg && (
          <div className="mb-5 text-sm font-medium px-4 py-3 rounded-lg bg-green-50 border border-green-200 text-green-800">
            {msg}
          </div>
        )}

        {loading ? (
          <div className="text-center py-20 text-gray-400">Loading…</div>
        ) : assignments.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border border-gray-200">
            <p className="font-semibold text-gray-600">No papers assigned yet.</p>
            <p className="text-sm text-gray-400 mt-1">Papers assigned to you will appear here.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {assignments.map((a: any) => (
              <div key={a.id} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-sm transition-shadow">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 leading-snug">{a.submission.title}</h3>
                    <p className="text-xs text-gray-400 mt-1">
                      by {a.submission.author?.name} · Assigned {new Date(a.assignedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                      {a.deadlineAt && (
                        <span className="ml-2 text-orange-600 font-medium">
                          · Deadline: {new Date(a.deadlineAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 flex-wrap">
                    <StatusBadge status={a.submission.status} />
                    <Link
                      href={`/dashboard/reviewer/${a.submissionId}`}
                      className="px-3 py-1.5 bg-indigo-700 text-white text-xs font-semibold rounded-lg hover:bg-indigo-800"
                    >
                      Review →
                    </Link>
                    <button
                      onClick={() => {
                        setDecliningId(a.submissionId);
                        setDecliningTitle(a.submission.title);
                        setDeclineReason("");
                        setDeclineError("");
                      }}
                      className="px-3 py-1.5 border border-red-200 text-red-600 text-xs font-semibold rounded-lg hover:bg-red-50"
                    >
                      Decline
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
