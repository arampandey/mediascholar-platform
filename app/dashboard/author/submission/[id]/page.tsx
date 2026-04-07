"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import StatusBadge from "@/components/StatusBadge";
import ReviewSummary from "@/components/ReviewSummary";
import Link from "next/link";

export default function AuthorSubmissionPage() {
  const { id } = useParams();
  const [sub, setSub] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [revFile, setRevFile] = useState<File | null>(null);
  const [revNotes, setRevNotes] = useState("");
  const [resubmitting, setResubmitting] = useState(false);

  useEffect(() => {
    fetch(`/api/submissions/${id}`).then(r => r.json()).then(d => setSub(d.submission));
    fetch(`/api/reviews/${id}`).then(r => r.json()).then(d => setReviews(d.reviews || []));
  }, [id]);

  async function resubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!revFile) return;
    setResubmitting(true);
    const fd = new FormData();
    fd.append("file", revFile);
    const uploadRes = await fetch("/api/submissions", { method: "POST", body: fd });
    const fileUrl = `/uploads/${revFile.name}`;
    await fetch(`/api/submissions/${id}/revision`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "resubmit", fileUrl, notes: revNotes }),
    });
    setResubmitting(false);
    window.location.reload();
  }

  if (!sub) return <div className="min-h-screen flex flex-col"><Navbar /><div className="flex-1 flex items-center justify-center text-gray-400">Loading…</div></div>;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-3xl mx-auto px-4 py-10 w-full space-y-6">
        <Link href="/dashboard/author" className="text-sm text-indigo-700 hover:underline">← My Submissions</Link>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-start justify-between gap-3 flex-wrap mb-4">
            <h1 className="text-xl font-bold text-gray-900">{sub.title}</h1>
            <StatusBadge status={sub.status} />
          </div>
          <p className="text-sm text-gray-600 mb-3">{sub.abstract}</p>
          <div className="flex flex-wrap gap-1.5 mb-3">
            {sub.keywords?.map((k: string) => <span key={k} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{k}</span>)}
          </div>
          <div className="text-xs text-gray-400 space-y-1">
            <div>Submitted: {new Date(sub.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</div>
            <div>Language: {sub.language === "hi" ? "Hindi" : "English"}</div>
            {sub.plagiarismScore !== null && <div>Plagiarism Score: {sub.plagiarismScore}%</div>}
            {sub.editorDecision && <div className="mt-2 font-medium">Editor Decision: {sub.editorDecision.replace("_"," ")} {sub.decisionNotes ? `— ${sub.decisionNotes}` : ""}</div>}
          </div>
          <div className="mt-4 flex gap-3">
            <a href={sub.fileUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-indigo-700 hover:underline">📄 View Paper</a>
          </div>
        </div>

        {reviews.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-bold text-gray-900 mb-4">Review Summary</h2>
            <ReviewSummary reviews={reviews} />
          </div>
        )}

        {sub.status === "REVISION_REQUESTED" && (
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-6">
            <h2 className="font-bold text-orange-800 mb-3">Revision Requested</h2>
            <p className="text-sm text-orange-700 mb-4">Please submit your revised paper below.</p>
            <form onSubmit={resubmit} className="space-y-3">
              <input type="file" accept=".pdf,.doc,.docx" onChange={e => setRevFile(e.target.files?.[0] || null)} required className="w-full text-sm" />
              <textarea value={revNotes} onChange={e => setRevNotes(e.target.value)} placeholder="Notes about revisions made…" rows={3}
                className="w-full border border-orange-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
              <button type="submit" disabled={resubmitting} className="px-5 py-2 bg-orange-600 text-white rounded-lg text-sm font-semibold hover:bg-orange-700 disabled:opacity-50">
                {resubmitting ? "Uploading…" : "Submit Revision"}
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
