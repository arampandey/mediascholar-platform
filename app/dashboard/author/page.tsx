"use client";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import StatusBadge from "@/components/StatusBadge";
import Link from "next/link";

export default function AuthorDashboard() {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/submissions").then(r => r.json()).then(d => setSubmissions(d.submissions || [])).finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-5xl mx-auto px-4 py-10 w-full">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Submissions</h1>
            <p className="text-sm text-gray-500 mt-1">Track the status of your research papers</p>
          </div>
          <div className="flex gap-2">
            <Link href="/dashboard/apply-reviewer" className="px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">Apply as Reviewer</Link>
            <Link href="/dashboard/author/submit" style={{ backgroundColor: "#1a2744" }} className="px-4 py-2 text-sm text-white rounded-lg hover:opacity-90 transition-opacity font-semibold">+ New Submission</Link>
          </div>
        </div>
        {loading ? <div className="text-center py-20 text-gray-400">Loading…</div> :
         submissions.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border border-gray-200">
            <div className="text-5xl mb-4">📄</div>
            <p className="text-lg font-semibold text-gray-600">No submissions yet</p>
            <Link href="/dashboard/author/submit" className="inline-block mt-4 px-5 py-2.5 bg-indigo-700 text-white rounded-lg text-sm font-semibold hover:bg-indigo-800">Submit Your First Paper →</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {submissions.map(s => (
              <Link key={s.id} href={`/dashboard/author/submission/${s.id}`} className="block bg-white rounded-xl border border-gray-200 p-5 hover:shadow-sm transition-shadow">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 truncate">{s.title}</h3>
                    <p className="text-xs text-gray-400 mt-1">Submitted {new Date(s.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</p>
                  </div>
                  <StatusBadge status={s.status} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
