"use client";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Link from "next/link";

export default function DoiManagementPage() {
  const [papers, setPapers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState<string | null>(null);
  const [results, setResults] = useState<Record<string, any>>({});

  useEffect(() => {
    fetch("/api/submissions/all")
      .then(r => r.json())
      .then(d => {
        const published = (d.submissions || []).filter((s: any) => s.status === "PUBLISHED");
        setPapers(published);
        setLoading(false);
      });
  }, []);

  async function registerDoi(submissionId: string, preview = false) {
    setRegistering(submissionId);
    const res = await fetch("/api/doi/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ submissionId, preview }),
    });
    const data = await res.json();
    setResults(prev => ({ ...prev, [submissionId]: data }));
    if (data.success) {
      setPapers(prev => prev.map(p => p.id === submissionId ? { ...p, doi: data.doi } : p));
    }
    setRegistering(null);
  }

  async function registerAll() {
    const unregistered = papers.filter(p => !p.doi);
    for (const paper of unregistered) {
      await registerDoi(paper.id);
    }
  }

  const withDoi = papers.filter(p => p.doi);
  const withoutDoi = papers.filter(p => !p.doi);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1 max-w-5xl mx-auto px-4 py-10 w-full">
        <Link href="/dashboard/editor" className="text-sm text-indigo-700 hover:underline">← Editor Dashboard</Link>

        <div className="mt-6 mb-8 flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">DOI Management</h1>
            <p className="text-sm text-gray-500 mt-1">Register permanent DOIs for published papers via CrossRef</p>
          </div>
          <div className="flex gap-3 items-center flex-wrap">
            <div className="text-sm text-gray-500">
              <span className="font-bold text-green-700">{withDoi.length}</span> registered ·{" "}
              <span className="font-bold text-orange-600">{withoutDoi.length}</span> pending
            </div>
            {withoutDoi.length > 0 && (
              <button
                onClick={registerAll}
                disabled={!!registering}
                className="px-4 py-2 bg-indigo-700 text-white rounded-lg text-sm font-bold hover:bg-indigo-800 disabled:opacity-40"
              >
                {registering ? "Registering…" : `Register All ${withoutDoi.length} DOIs`}
              </button>
            )}
          </div>
        </div>

        {/* Status banner */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-4 mb-6 text-sm text-amber-800">
          <p className="font-semibold mb-1">⏳ Awaiting CrossRef Membership</p>
          <p>Once CrossRef approves your membership and provides a DOI prefix, add these to Vercel environment variables:</p>
          <code className="block mt-2 text-xs bg-amber-100 rounded p-2 font-mono">
            CROSSREF_LOGIN · CROSSREF_PASSWORD · DOI_PREFIX
          </code>
          <p className="mt-2">You can preview DOIs now — registration will go live automatically once credentials are set.</p>
        </div>

        {loading ? (
          <div className="text-center text-gray-400 py-20">Loading papers…</div>
        ) : (
          <div className="space-y-3">
            {papers.map(paper => {
              const result = results[paper.id];
              const isRegistering = registering === paper.id;

              return (
                <div key={paper.id} className="bg-white rounded-xl border border-gray-200 p-5">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex-1 min-w-0">
                      <Link href={`/dashboard/editor/submission/${paper.id}`}
                        className="text-sm font-bold text-indigo-800 hover:underline leading-snug block">
                        {paper.title}
                      </Link>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {paper.author?.name || "Unknown"} ·{" "}
                        {paper.issue ? `Vol. ${paper.issue.volume?.number}, Issue ${paper.issue.number}` : "No issue"}
                      </p>
                      {paper.doi && (
                        <a href={`https://doi.org/${paper.doi}`} target="_blank" rel="noopener noreferrer"
                          className="text-xs font-mono text-green-700 hover:underline mt-1 block">
                          https://doi.org/{paper.doi}
                        </a>
                      )}
                      {result && (
                        <div className={`mt-2 text-xs px-3 py-2 rounded-lg ${
                          result.success ? "bg-green-50 text-green-700" :
                          result.doi ? "bg-blue-50 text-blue-700" :
                          "bg-red-50 text-red-700"
                        }`}>
                          {result.success && `✅ ${result.message}`}
                          {result.doi && !result.success && `📋 Preview DOI: ${result.doi}${result.error ? ` — ${result.error}` : ""}`}
                          {!result.doi && result.error && `❌ ${result.error}`}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2 shrink-0">
                      {paper.doi ? (
                        <span className="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-xs font-semibold">✅ DOI Registered</span>
                      ) : (
                        <>
                          <button
                            onClick={() => registerDoi(paper.id, true)}
                            disabled={!!registering}
                            className="px-3 py-1.5 border border-gray-300 text-gray-600 rounded-lg text-xs font-semibold hover:bg-gray-50 disabled:opacity-40"
                          >
                            Preview
                          </button>
                          <button
                            onClick={() => registerDoi(paper.id)}
                            disabled={!!registering}
                            className="px-3 py-1.5 bg-indigo-700 text-white rounded-lg text-xs font-bold hover:bg-indigo-800 disabled:opacity-40"
                          >
                            {isRegistering ? "Registering…" : "Register DOI"}
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
