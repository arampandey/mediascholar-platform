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
  const [decision, setDecision] = useState("");
  const [decisionNotes, setDecisionNotes] = useState("");
  const [revisionNotes, setRevisionNotes] = useState("");
  const [issues, setIssues] = useState<any[]>([]);
  const [volumes, setVolumes] = useState<any[]>([]);
  const [selIssue, setSelIssue] = useState("");
  const [doi, setDoi] = useState("");
  const [msg, setMsg] = useState("");

  function load() {
    fetch(`/api/submissions/${id}`).then(r => r.json()).then(d => setSub(d.submission));
    fetch("/api/reviewers").then(r => r.json()).then(d => setReviewers(d.reviewers || []));
    fetch("/api/volumes").then(r => r.json()).then(d => {
      setVolumes(d.volumes || []);
      const allIssues = (d.volumes||[]).flatMap((v: any) => v.issues.map((i: any) => ({ ...i, volNum: v.number, volYear: v.year })));
      setIssues(allIssues);
    });
  }

  useEffect(() => { load(); }, [id]);

  async function act(url: string, method: string, body: object) {
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    if (res.ok) { setMsg("✅ Done"); load(); } else setMsg("❌ Error");
    setTimeout(() => setMsg(""), 3000);
  }

  if (!sub) return <div className="min-h-screen flex flex-col"><Navbar /><div className="flex-1 flex items-center justify-center text-gray-400">Loading…</div></div>;

  const assignedIds = sub.reviewers?.map((r: any) => r.user.id) || [];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-3xl mx-auto px-4 py-10 w-full space-y-5">
        <Link href="/dashboard/editor" className="text-sm text-indigo-700 hover:underline">← Editor Dashboard</Link>
        {msg && <div className="bg-blue-50 border border-blue-200 text-blue-800 text-sm px-3 py-2 rounded-lg">{msg}</div>}

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-start justify-between gap-3 flex-wrap mb-3">
            <h1 className="text-xl font-bold text-gray-900">{sub.title}</h1>
            <StatusBadge status={sub.status} />
          </div>
          <p className="text-sm text-gray-600 mb-3">{sub.abstract}</p>
          <div className="text-xs text-gray-400 space-y-1">
            <div>Author: {sub.author?.name} ({sub.author?.institution})</div>
            <div>Language: {sub.language === "hi" ? "Hindi" : "English"}</div>
            <div>Submitted: {new Date(sub.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</div>
            {sub.plagiarismScore !== null && <div>Plagiarism: {sub.plagiarismScore}%</div>}
            {sub.editorDecision && <div>Decision: {sub.editorDecision} — {sub.decisionNotes}</div>}
          </div>
          <div className="mt-3 flex gap-3 flex-wrap">
            <a href={sub.fileUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-indigo-700 hover:underline">📄 Paper</a>
            <select value={sub.status} onChange={e => act(`/api/submissions/${id}/status`, "PATCH", { status: e.target.value })} className="text-xs border rounded px-2 py-1 focus:outline-none">
              {["SUBMITTED","PLAGIARISM_CHECK","UNDER_REVIEW","REVISION_REQUESTED","RESUBMITTED","ACCEPTED","REJECTED","PUBLISHED"].map(s => <option key={s} value={s}>{s.replace(/_/g," ")}</option>)}
            </select>
          </div>
        </div>

        {/* Plagiarism */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-bold text-gray-900 mb-3">Plagiarism Score</h2>
          <div className="flex gap-2 flex-wrap">
            <input type="number" value={plagScore} onChange={e => setPlagScore(e.target.value)} placeholder="Score %" className="border rounded-lg px-3 py-1.5 text-sm w-24 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            <input type="text" value={plagReport} onChange={e => setPlagReport(e.target.value)} placeholder="Report URL (optional)" className="flex-1 border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            <button onClick={() => act(`/api/submissions/${id}/plagiarism`, "PATCH", { plagiarismScore: +plagScore, plagiarismReport: plagReport })} className="px-4 py-1.5 bg-yellow-500 text-white rounded-lg text-sm font-semibold hover:bg-yellow-600">Save</button>
          </div>
        </div>

        {/* Assign Reviewer */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-bold text-gray-900 mb-2">Assigned Reviewers</h2>
          {sub.reviewers?.length > 0 && <div className="flex flex-wrap gap-2 mb-3">{sub.reviewers.map((r: any) => <span key={r.user.id} className="text-xs bg-purple-100 text-purple-700 px-2.5 py-1 rounded-full">{r.user.name}</span>)}</div>}
          <div className="flex gap-2">
            <select value={selectedReviewer} onChange={e => setSelectedReviewer(e.target.value)} className="flex-1 border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option value="">Select reviewer…</option>
              {reviewers.filter(r => !assignedIds.includes(r.id)).map(r => <option key={r.id} value={r.id}>{r.name} — {r.institution || r.email}</option>)}
            </select>
            <button disabled={!selectedReviewer} onClick={() => act(`/api/submissions/${id}/assign-reviewer`, "POST", { reviewerId: selectedReviewer })} className="px-4 py-1.5 bg-purple-600 text-white rounded-lg text-sm font-semibold hover:bg-purple-700 disabled:opacity-40">Assign</button>
          </div>
        </div>

        {/* Reviews */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-bold text-gray-900 mb-3">Reviews</h2>
          <ReviewSummary reviews={sub.reviews || []} />
        </div>

        {/* Revision request */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-bold text-gray-900 mb-3">Request Revision</h2>
          <div className="flex gap-2">
            <textarea value={revisionNotes} onChange={e => setRevisionNotes(e.target.value)} placeholder="Revision notes for author…" rows={2} className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            <button onClick={() => act(`/api/submissions/${id}/revision`, "POST", { type: "request", notes: revisionNotes })} className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-semibold hover:bg-orange-600">Request</button>
          </div>
        </div>

        {/* Final Decision */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-bold text-gray-900 mb-3">Final Decision</h2>
          <div className="space-y-2">
            <select value={decision} onChange={e => setDecision(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option value="">Select decision…</option>
              <option value="ACCEPT">Accept</option>
              <option value="MAJOR_REVISION">Major Revision</option>
              <option value="REJECT">Reject</option>
            </select>
            <textarea value={decisionNotes} onChange={e => setDecisionNotes(e.target.value)} placeholder="Decision notes (visible to author)…" rows={2} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            <button disabled={!decision} onClick={() => act(`/api/submissions/${id}/decision`, "POST", { decision, notes: decisionNotes })} className="px-5 py-2 bg-indigo-700 text-white rounded-lg text-sm font-semibold hover:bg-indigo-800 disabled:opacity-40">Submit Decision</button>
          </div>
        </div>

        {/* Publish */}
        {sub.status === "ACCEPTED" && (
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="font-bold text-gray-900 mb-3">Publish to Issue</h2>
            <div className="flex gap-2 flex-wrap">
              <select value={selIssue} onChange={e => setSelIssue(e.target.value)} className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="">Select issue…</option>
                {issues.map(i => <option key={i.id} value={i.id}>Vol. {i.volNum} ({i.volYear}) — Issue {i.number}{i.title ? `: ${i.title}` : ""}</option>)}
              </select>
              <input type="text" value={doi} onChange={e => setDoi(e.target.value)} placeholder="DOI (optional)" className="w-40 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              <button disabled={!selIssue} onClick={() => act(`/api/submissions/${id}/publish`, "POST", { issueId: selIssue, doi })} className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 disabled:opacity-40">Publish</button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
