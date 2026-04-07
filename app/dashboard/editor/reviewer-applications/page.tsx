"use client";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Link from "next/link";

export default function ReviewerApplicationsPage() {
  const [apps, setApps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  function load() { fetch("/api/reviewer-applications").then(r => r.json()).then(d => setApps(d.applications || [])).finally(() => setLoading(false)); }
  useEffect(() => { load(); }, []);

  async function decide(id: string, status: string) {
    await fetch(`/api/reviewer-applications/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
    load();
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-4xl mx-auto px-4 py-10 w-full">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Reviewer Applications</h1>
          <Link href="/dashboard/editor" className="text-sm text-indigo-700 hover:underline">← Editor Dashboard</Link>
        </div>
        {loading ? <div className="text-center py-20 text-gray-400">Loading…</div> : apps.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border border-gray-200"><p className="font-semibold text-gray-500">No applications yet</p></div>
        ) : (
          <div className="space-y-3">
            {apps.map(a => (
              <div key={a.id} className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div>
                    <p className="font-bold text-gray-900">{a.user.name}</p>
                    <p className="text-sm text-gray-500">{a.user.email} · {a.user.institution || "—"}</p>
                    {a.note && <p className="text-sm text-gray-600 mt-1 italic">"{a.note}"</p>}
                    <p className="text-xs text-gray-400 mt-1">{new Date(a.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</p>
                  </div>
                  <div>
                    {a.status === "PENDING" ? (
                      <div className="flex gap-2">
                        <button onClick={() => decide(a.id, "APPROVED")} className="px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg font-semibold hover:bg-green-700">Approve</button>
                        <button onClick={() => decide(a.id, "REJECTED")} className="px-3 py-1.5 bg-red-500 text-white text-sm rounded-lg font-semibold hover:bg-red-600">Reject</button>
                      </div>
                    ) : (
                      <span className={`text-sm font-bold px-3 py-1 rounded-full ${a.status === "APPROVED" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>{a.status}</span>
                    )}
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
