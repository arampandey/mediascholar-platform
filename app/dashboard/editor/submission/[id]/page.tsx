"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import StatusBadge from "@/components/StatusBadge";
import ReviewSummary from "@/components/ReviewSummary";
import Link from "next/link";

export default function EditorSubmissionPage() {
  const { id } = useParams();
  const [sub, setSub] = useState<any>(null);
  const [reviewers, setReviewers] = useState<any[]>([]);
  const [selectedReviewer, setSelectedReviewer] = useState("");
  const [plagScore, setPlagScore] = useState("");
  const [plagReport, setPlagReport] = useState("");
  const [plagLoading, setPlagLoading] = useState(false);
  const [plagResult, setPlagResult] = useState<{ action: string } | null>(null);
  const [decision, setDecision] = useState("");
  const [decisionNotes, setDecisionNotes] = useState("");
  const [revisionNotes, setRevisionNotes] = useState("");
  const [issues, setIssues] = useState<any[]>([]);
  const [selIssue, setSelIssue] = useState("");
  const [doi, setDoi] = useState("");
  const [msg, setMsg] = useState("");
  const [doiLoading, setDoiLoading] = useState(false);
  const [doiResult, setDoiResult] = useState<{ success?: boolean; doi?: string; error?: string; message?: string } | null>(null);

  function load() {
    fetch(`/api/submissions/${id}`).then(r => r.json()).then(d => setSub(d.submission));
    fetch("/api/reviewers").then(r => r.json()).then(d => setReviewers(d.reviewers || []));
    fetch("/api/volumes").then(r => r.json()).then(d => {
      const allIssues = (d.volumes || []).flatMap((v: any) =>
        v.issues.map((i: any) => ({ ...i, volNum: v.number, volYear: v.year }))
      );
      setIssues(allIssues);
    });
  }

  useEffect(() => { load(); }, [id]);

  async function act(url: string, method: string, body: object) {
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    if (res.ok) { setMsg("✅ Done"); load(); } else setMsg("❌ Error");
    setTimeout(() => setMsg(""), 4000);
  }

  async function submitPlagiarism() {
    if (!plagScore) return;
    setPlagLoading(true);
    const res = await fetch(`/api/submissions/${id}/plagiarism`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plagiarismScore: +plagScore, plagiarismReport: plagReport }),
    });
    const data = await res.json();
    setPlagResult(data);
    setPlagLoading(false);
    load();
  }

  if (!sub) return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center text-gray-400">Loading…</div>
    </div>
  );

  const assignedIds = sub.reviewers?.map((r: any) => r.user.id) || [];
  const plagPassed = sub.plagiarismScore !== null && sub.plagiarismScore <= 20;
  const plagFailed = sub.plagiarismScore !== null && sub.plagiarismScore > 20;
  const plagDone = sub.plagiarismScore !== null;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-3xl mx-auto px-4 py-10 w-full space-y-5">
        <Link href="/dashboard/editor" className="text-sm text-indigo-700 hover:underline">← Editor Dashboard</Link>
        {msg && <div className="bg-blue-50 border border-blue-200 text-blue-800 text-sm px-3 py-2 rounded-lg">{msg}</div>}

        {/* Paper details */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-start justify-between gap-3 flex-wrap mb-3">
            <h1 className="text-xl font-bold text-gray-900">{sub.title}</h1>
            <StatusBadge status={sub.status} />
          </div>
          <p className="text-sm text-gray-600 mb-3 leading-relaxed">{sub.abstract}</p>
          <div className="text-xs text-gray-400 space-y-1">
            <div>Author: <span className="text-gray-600 font-medium">{sub.author?.name}</span> {sub.author?.institution ? `— ${sub.author.institution}` : ""}</div>
            <div>Language: {sub.language === "hi" ? "Hindi (हिंदी)" : "English"}</div>
            <div>Submitted: {new Date(sub.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</div>
          </div>
          <div className="mt-3 flex gap-4 flex-wrap items-center">
            <a href={sub.fileUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-indigo-700 hover:underline font-medium">📄 Download Paper</a>
            <select value={sub.status} onChange={e => act(`/api/submissions/${id}/status`, "PATCH", { status: e.target.value })}
              className="text-xs border border-gray-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500">
              {["SUBMITTED","PLAGIARISM_CHECK","UNDER_REVIEW","REVISION_REQUESTED","RESUBMITTED","ACCEPTED","REJECTED","PUBLISHED"].map(s =>
                <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
              )}
            </select>
          </div>
        </div>

        {/* ── STEP 1: PLAGIARISM CHECK ── */}
        <div className={`rounded-xl border-2 p-5 ${plagFailed ? "border-red-300 bg-red-50" : plagPassed ? "border-green-300 bg-green-50" : "border-yellow-300 bg-yellow-50"}`}>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">{plagFailed ? "🚫" : plagPassed ? "✅" : "⚠️"}</span>
            <h2 className="font-bold text-gray-900">Step 1 — Plagiarism Check (Turnitin)</h2>
            {plagDone && (
              <span className={`ml-auto text-sm font-bold px-3 py-1 rounded-full ${plagFailed ? "bg-red-200 text-red-800" : "bg-green-200 text-green-800"}`}>
                {sub.plagiarismScore}% similarity
              </span>
            )}
          </div>

          {plagFailed && (
            <div className="bg-red-100 border border-red-300 rounded-lg px-4 py-3 mb-3 text-sm text-red-800">
              <strong>❌ Rejected — High Similarity ({sub.plagiarismScore}%)</strong><br />
              Author has been notified by email that their manuscript is not under consideration and needs revision before resubmission.
            </div>
          )}

          {plagPassed && (
            <div className="bg-green-100 border border-green-300 rounded-lg px-4 py-3 mb-3 text-sm text-green-800">
              <strong>✅ Cleared — {sub.plagiarismScore}% similarity (within 20% limit)</strong><br />
              Editor has been notified to assign a reviewer. Proceed to Step 2 below.
            </div>
          )}

          {!plagDone && (
            <p className="text-sm text-yellow-800 mb-3">
              Run the Turnitin check and enter the similarity score below. The system will automatically notify the author (if rejected) or the editor (if cleared).
            </p>
          )}

          <div className="flex gap-2 flex-wrap items-end">
            <div>
              <label className="text-xs font-semibold text-gray-600 block mb-1">Similarity Score (%)</label>
              <input
                type="number" min="0" max="100" step="0.1"
                value={plagScore}
                onChange={e => setPlagScore(e.target.value)}
                placeholder="e.g. 14"
                className="w-28 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="flex-1 min-w-[160px]">
              <label className="text-xs font-semibold text-gray-600 block mb-1">Turnitin Report URL (optional)</label>
              <input
                type="text"
                value={plagReport}
                onChange={e => setPlagReport(e.target.value)}
                placeholder="https://turnitin.com/report/..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <button
              onClick={submitPlagiarism}
              disabled={!plagScore || plagLoading}
              className="px-4 py-2 bg-yellow-500 text-white rounded-lg text-sm font-bold hover:bg-yellow-600 disabled:opacity-40 transition-colors"
            >
              {plagLoading ? "Saving…" : plagDone ? "Update Score" : "Submit Score"}
            </button>
          </div>

          {plagResult && (
            <div className={`mt-3 text-xs font-semibold px-3 py-2 rounded-lg ${plagResult.action === "rejected_plagiarism" ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
              {plagResult.action === "rejected_plagiarism"
                ? "📧 Author notified — manuscript not considered due to high similarity."
                : "📧 Editor notified — manuscript cleared and ready for reviewer assignment."}
            </div>
          )}
        </div>

        {/* ── STEP 2: ASSIGN REVIEWERS (only show if plagiarism passed) ── */}
        <div className={`rounded-xl border p-5 transition-opacity ${!plagPassed ? "opacity-40 pointer-events-none" : "bg-white border-gray-200"}`}>
          <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-lg">👥</span>
              <h2 className="font-bold text-gray-900">Step 2 — Assign Reviewers</h2>
              {!plagPassed && <span className="ml-2 text-xs text-gray-400 italic">(Complete plagiarism check first)</span>}
            </div>
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
              assignedIds.length >= 2 ? "bg-green-100 text-green-700" : assignedIds.length === 1 ? "bg-yellow-100 text-yellow-700" : "bg-gray-100 text-gray-500"
            }`}>{assignedIds.length}/2 Reviewers Assigned</span>
          </div>

          {/* Current reviewers */}
          {sub.reviewers?.length > 0 && (
            <div className="space-y-2 mb-4">
              {sub.reviewers.map((r: any, i: number) => {
                const deadline = r.deadlineAt ? new Date(r.deadlineAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '15 days';
                const retracted = r.retractedAt;
                return (
                  <div key={r.user.id} className={`flex items-center justify-between gap-3 px-3 py-2 rounded-lg border ${
                    retracted ? 'border-red-200 bg-red-50' : 'border-purple-200 bg-purple-50'
                  }`}>
                    <div>
                      <span className="text-sm font-semibold text-gray-800">Reviewer {i+1}: {r.user.name}</span>
                      {r.isReplacement && <span className="ml-2 text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">Replacement</span>}
                      {retracted && <span className="ml-2 text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">Retracted</span>}
                    </div>
                    <span className="text-xs text-gray-500">Deadline: {deadline}</span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Assign new reviewer */}
          {assignedIds.length < 2 && (
            <>
              <p className="text-xs text-gray-500 mb-2">Each reviewer gets <strong>15 days</strong> to complete the review. Reminders sent at day 15, retraction at day 21.</p>
              <div className="flex gap-2">
                <select value={selectedReviewer} onChange={e => setSelectedReviewer(e.target.value)}
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <option value="">Select reviewer {assignedIds.length + 1}…</option>
                  {reviewers.filter(r => !assignedIds.includes(r.id)).map(r => (
                    <option key={r.id} value={r.id}>{r.name} — {r.institution || r.email}</option>
              ))}
            </select>
            <button
              disabled={!selectedReviewer}
              onClick={() => { act(`/api/submissions/${id}/assign-reviewer`, "POST", { reviewerId: selectedReviewer }); setSelectedReviewer(""); }}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-bold hover:bg-purple-700 disabled:opacity-40"
            >
              Assign
            </button>
          </div>
            </>
          )}
          {assignedIds.length >= 2 && (
            <p className="text-xs text-green-600 font-medium mt-1">✅ Both reviewers assigned. Emails sent with 15-day deadline.</p>
          )}
        </div>

        {/* ── STEP 3: REVIEWS ── */}
        <div className={`rounded-xl border p-5 transition-opacity ${!plagPassed ? "opacity-40 pointer-events-none" : "bg-white border-gray-200"}`}>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">🔍</span>
            <h2 className="font-bold text-gray-900">Step 3 — Review Summary</h2>
          </div>
          <ReviewSummary reviews={sub.reviews || []} />
        </div>

        {/* ── STEP 4: REQUEST REVISION ── */}
        <div className={`rounded-xl border p-5 transition-opacity ${!plagPassed ? "opacity-40 pointer-events-none" : "bg-white border-gray-200"}`}>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">✏️</span>
            <h2 className="font-bold text-gray-900">Step 4 — Request Revision (if needed)</h2>
          </div>
          <div className="flex gap-2">
            <textarea value={revisionNotes} onChange={e => setRevisionNotes(e.target.value)}
              placeholder="Describe the revisions required from the author…" rows={2}
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            <button
              onClick={() => act(`/api/submissions/${id}/revision`, "POST", { type: "request", notes: revisionNotes })}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-bold hover:bg-orange-600"
            >
              Send
            </button>
          </div>
        </div>

        {/* ── STEP 5: FINAL DECISION ── */}
        <div className={`rounded-xl border p-5 transition-opacity ${!plagPassed ? "opacity-40 pointer-events-none" : "bg-white border-gray-200"}`}>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">⚖️</span>
            <h2 className="font-bold text-gray-900">Step 5 — Final Editorial Decision</h2>
            {sub.editorDecision && sub.plagiarismScore <= 20 && (
              <span className={`ml-auto text-xs font-bold px-3 py-1 rounded-full ${sub.editorDecision === "ACCEPT" ? "bg-green-100 text-green-700" : sub.editorDecision === "REJECT" ? "bg-red-100 text-red-700" : "bg-orange-100 text-orange-700"}`}>
                {sub.editorDecision.replace("_", " ")}
              </span>
            )}
          </div>
          <div className="space-y-2">
            <select value={decision} onChange={e => setDecision(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option value="">Select decision…</option>
              <option value="ACCEPT">✅ Accept</option>
              <option value="MAJOR_REVISION">✏️ Major Revision</option>
              <option value="REJECT">❌ Reject</option>
            </select>
            <textarea value={decisionNotes} onChange={e => setDecisionNotes(e.target.value)}
              placeholder="Notes for the author (will be emailed)…" rows={2}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            <button
              disabled={!decision}
              onClick={() => act(`/api/submissions/${id}/decision`, "POST", { decision, notes: decisionNotes })}
              style={{ backgroundColor: "#1a2744" }}
              className="px-5 py-2 text-white rounded-lg text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-40"
            >
              Submit Decision
            </button>
          </div>
        </div>

        {/* ── STEP 6: PUBLISH ── */}
        {sub.status === "ACCEPTED" && (
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">🌐</span>
              <h2 className="font-bold text-gray-900">Step 6 — Publish to Issue</h2>
            </div>
            <div className="flex gap-2 flex-wrap">
              <select value={selIssue} onChange={e => setSelIssue(e.target.value)}
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="">Select issue…</option>
                {issues.map(i => (
                  <option key={i.id} value={i.id}>Vol. {i.volNum} ({i.volYear}) — Issue {i.number}{i.title ? `: ${i.title}` : ""}</option>
                ))}
              </select>
              <input type="text" value={doi} onChange={e => setDoi(e.target.value)} placeholder="DOI (leave blank to auto-generate)"
                className="w-52 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              <button
                disabled={!selIssue}
                onClick={() => act(`/api/submissions/${id}/publish`, "POST", { issueId: selIssue, doi })}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold hover:bg-emerald-700 disabled:opacity-40"
              >
                Publish
              </button>
            </div>
          </div>
        )}

        {/* ── DOI REGISTRATION (CrossRef) ── */}
        {sub.status === "PUBLISHED" && (
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">🔖</span>
              <h2 className="font-bold text-gray-900">DOI Registration — CrossRef</h2>
            </div>
            <p className="text-xs text-gray-500 mb-4">
              Register a permanent DOI for this paper with CrossRef. Requires CrossRef membership credentials in environment variables.
            </p>

            {sub.doi ? (
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex-1 bg-green-50 border border-green-200 rounded-lg px-4 py-3">
                  <p className="text-xs text-green-600 font-semibold mb-0.5">DOI Registered</p>
                  <a href={`https://doi.org/${sub.doi}`} target="_blank" rel="noopener noreferrer"
                    className="text-sm font-mono text-green-800 hover:underline">https://doi.org/{sub.doi}</a>
                </div>
                <button
                  onClick={async () => {
                    setDoiLoading(true);
                    const res = await fetch("/api/doi/register", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ submissionId: id }),
                    });
                    const data = await res.json();
                    setDoiResult(data);
                    setDoiLoading(false);
                    if (data.success) load();
                  }}
                  disabled={doiLoading}
                  className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg text-sm font-semibold hover:bg-indigo-200 disabled:opacity-40"
                >
                  {doiLoading ? "Re-depositing…" : "Re-deposit with CrossRef"}
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={async () => {
                      setDoiLoading(true);
                      const res = await fetch("/api/doi/register", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ submissionId: id, preview: true }),
                      });
                      const data = await res.json();
                      setDoiResult(data);
                      setDoiLoading(false);
                    }}
                    disabled={doiLoading}
                    className="px-4 py-2 border border-indigo-300 text-indigo-700 rounded-lg text-sm font-semibold hover:bg-indigo-50 disabled:opacity-40"
                  >
                    {doiLoading ? "Generating…" : "Preview DOI"}
                  </button>
                  <button
                    onClick={async () => {
                      setDoiLoading(true);
                      const res = await fetch("/api/doi/register", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ submissionId: id }),
                      });
                      const data = await res.json();
                      setDoiResult(data);
                      setDoiLoading(false);
                      if (data.success) load();
                    }}
                    disabled={doiLoading}
                    className="px-4 py-2 bg-indigo-700 text-white rounded-lg text-sm font-bold hover:bg-indigo-800 disabled:opacity-40"
                  >
                    {doiLoading ? "Registering…" : "Register DOI with CrossRef"}
                  </button>
                </div>

                {doiResult && (
                  <div className={`rounded-lg px-4 py-3 text-sm ${
                    doiResult.success ? "bg-green-50 border border-green-200 text-green-800" :
                    doiResult.doi ? "bg-blue-50 border border-blue-200 text-blue-800" :
                    "bg-red-50 border border-red-200 text-red-800"
                  }`}>
                    {doiResult.success && <p className="font-semibold">✅ {doiResult.message}</p>}
                    {doiResult.doi && !doiResult.success && (
                      <div>
                        <p className="font-semibold mb-1">📋 Preview — DOI will be: <span className="font-mono">{doiResult.doi}</span></p>
                        <p className="text-xs opacity-70">Click &quot;Register DOI with CrossRef&quot; to deposit once credentials are configured.</p>
                        {doiResult.error && <p className="mt-1 text-xs">{doiResult.error}</p>}
                      </div>
                    )}
                    {!doiResult.doi && doiResult.error && <p>❌ {doiResult.error}</p>}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

      </main>
    </div>
  );
}
