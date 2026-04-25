"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Link from "next/link";

const DECISIONS = ["ACCEPT", "MINOR_REVISION", "MAJOR_REVISION", "REJECT"];

export default function ReviewPage() {
  const { id } = useParams();
  const router = useRouter();
  const [sub, setSub] = useState<any>(null);
  const [review, setReview] = useState<any>({});
  const [form, setForm] = useState({ clarityScore: "", methodologyScore: "", relevanceScore: "", originalityScore: "", remarks: "", decision: "" });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [showDecline, setShowDecline] = useState(false);
  const [declineReason, setDeclineReason] = useState("");
  const [declining, setDeclining] = useState(false);
  const [declineError, setDeclineError] = useState("");

  useEffect(() => {
    fetch(`/api/submissions/${id}`).then(r => r.json()).then(d => setSub(d.submission));
    // Fetch MY review specifically (not all reviews)
    fetch(`/api/reviewer/my-review/${id}`).then(r => r.json()).then(d => {
      const r = d.review;
      if (r) { setReview(r); if (r.submittedAt) setDone(true); setForm({ clarityScore: r.clarityScore||"", methodologyScore: r.methodologyScore||"", relevanceScore: r.relevanceScore||"", originalityScore: r.originalityScore||"", remarks: r.remarks||"", decision: r.decision||"" }); }
    });
  }, [id]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    await fetch(`/api/reviews/${id}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, clarityScore: +form.clarityScore, methodologyScore: +form.methodologyScore, relevanceScore: +form.relevanceScore, originalityScore: +form.originalityScore, reviewId: review?.id }) });
    setSubmitting(false);
    setDone(true);
  }

  async function handleDecline() {
    if (!declineReason.trim()) { setDeclineError("Please provide a reason for declining."); return; }
    setDeclining(true); setDeclineError("");
    const res = await fetch("/api/reviewer/decline", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ submissionId: id, reason: declineReason }),
    });
    setDeclining(false);
    if (res.ok) {
      router.push("/dashboard/reviewer");
    } else {
      const d = await res.json();
      setDeclineError(d.error || "Failed to decline. Please try again.");
    }
  }

  if (!sub) return <div className="min-h-screen flex flex-col"><Navbar /><div className="flex-1 flex items-center justify-center text-gray-400">Loading…</div></div>;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-2xl mx-auto px-4 py-10 w-full space-y-5">
        <div className="flex items-center justify-between">
          <Link href="/dashboard/reviewer" className="text-sm text-indigo-700 hover:underline">← My Assignments</Link>
          {!done && (
            <button onClick={() => setShowDecline(true)}
              className="text-sm text-red-600 hover:text-red-800 font-medium border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors">
              Decline Assignment
            </button>
          )}
        </div>

        {/* Decline Modal */}
        {showDecline && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
              <h2 className="font-bold text-gray-900 text-lg mb-1">Decline Assignment</h2>
              <p className="text-sm text-gray-500 mb-4">Please tell us why you cannot review this paper. The editor will be notified and will assign a replacement reviewer.</p>
              <textarea
                value={declineReason}
                onChange={e => setDeclineReason(e.target.value)}
                rows={4}
                placeholder="e.g. The subject matter is outside my area of expertise in media studies…"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 mb-3"
              />
              {declineError && <p className="text-sm text-red-600 mb-3">{declineError}</p>}
              <div className="flex gap-3">
                <button onClick={handleDecline} disabled={declining}
                  className="flex-1 bg-red-600 text-white py-2.5 rounded-lg font-semibold text-sm hover:bg-red-700 transition-colors disabled:opacity-50">
                  {declining ? "Declining…" : "Confirm Decline"}
                </button>
                <button onClick={() => { setShowDecline(false); setDeclineError(""); setDeclineReason(""); }}
                  className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-lg font-semibold text-sm hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h1 className="font-bold text-gray-900 text-lg mb-2">{sub.title}</h1>
          <p className="text-sm text-gray-600 mb-2">{sub.abstract?.slice(0, 400)}…</p>
          {sub.fileUrl ? (
            <a
              href={`/api/download?id=${id}`}
              target="_blank" rel="noopener noreferrer"
              className="text-sm text-indigo-700 hover:underline"
            >📄 Download Full Paper</a>
          ) : (
            <span className="text-sm text-red-500">⚠ File not available</span>
          )}
        </div>
        {done ? (
          <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
            <div className="text-3xl mb-2">✅</div>
            <p className="font-bold text-green-800">Review Submitted</p>
            <p className="text-sm text-green-600 mt-1">Thank you for your contribution.</p>
          </div>
        ) : (
          <form onSubmit={submit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
            <h2 className="font-bold text-gray-900">Review Form</h2>
            <div className="grid grid-cols-2 gap-4">
              {[{ key: "clarityScore", label: "Clarity" }, { key: "methodologyScore", label: "Methodology" }, { key: "relevanceScore", label: "Relevance" }, { key: "originalityScore", label: "Originality" }].map(c => (
                <div key={c.key}>
                  <label className="text-sm font-semibold text-gray-800 block mb-1">{c.label} (0–10)</label>
                  <input type="number" min="0" max="10" step="0.5" value={(form as any)[c.key]} onChange={e => setForm(p => ({...p, [c.key]: e.target.value}))} required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-base text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
              ))}
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-800 block mb-1">Decision</label>
              <select value={form.decision} onChange={e => setForm(p => ({...p, decision: e.target.value}))} required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-base text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="">Select decision…</option>
                {DECISIONS.map(d => <option key={d} value={d}>{d.replace(/_/g," ")}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-800 block mb-1">Remarks / Feedback</label>
              <textarea value={form.remarks} onChange={e => setForm(p => ({...p, remarks: e.target.value}))} rows={4}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-base text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-gray-400" placeholder="Detailed feedback for the author…" />
            </div>
            <button type="submit" disabled={submitting} style={{ backgroundColor: "#1a2744" }} className="w-full text-white py-2.5 rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50">
              {submitting ? "Submitting…" : "Submit Review"}
            </button>
          </form>
        )}
      </main>
    </div>
  );
}
