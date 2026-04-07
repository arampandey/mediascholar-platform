"use client";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Link from "next/link";

export default function VolumesPage() {
  const [volumes, setVolumes] = useState<any[]>([]);
  const [volForm, setVolForm] = useState({ number: "", year: "" });
  const [issueForm, setIssueForm] = useState<Record<string, { number: string; title: string }>>({});

  function load() { fetch("/api/volumes").then(r => r.json()).then(d => setVolumes(d.volumes || [])); }
  useEffect(() => { load(); }, []);

  async function createVol(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/volumes", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ number: +volForm.number, year: +volForm.year }) });
    setVolForm({ number: "", year: "" });
    load();
  }

  async function createIssue(volId: string) {
    const f = issueForm[volId] || { number: "", title: "" };
    if (!f.number) return;
    await fetch(`/api/volumes/${volId}/issues`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ number: +f.number, title: f.title }) });
    setIssueForm(p => ({ ...p, [volId]: { number: "", title: "" } }));
    load();
  }

  async function publishIssue(issueId: string) {
    if (!confirm("Publish this issue? All accepted papers in it will become PUBLISHED.")) return;
    await fetch(`/api/issues/${issueId}/publish`, { method: "POST" });
    load();
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-4xl mx-auto px-4 py-10 w-full space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Volumes & Issues</h1>
          <Link href="/dashboard/editor" className="text-sm text-indigo-700 hover:underline">← Editor Dashboard</Link>
        </div>

        {/* Create Volume */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-bold text-gray-900 mb-3">Create New Volume</h2>
          <form onSubmit={createVol} className="flex gap-3 flex-wrap">
            <input type="number" value={volForm.number} onChange={e => setVolForm(p => ({...p, number: e.target.value}))} placeholder="Volume No." className="w-28 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            <input type="number" value={volForm.year} onChange={e => setVolForm(p => ({...p, year: e.target.value}))} placeholder="Year" className="w-24 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            <button type="submit" className="px-4 py-2 bg-indigo-700 text-white rounded-lg text-sm font-semibold hover:bg-indigo-800">Create</button>
          </form>
        </div>

        {/* Volumes list */}
        {volumes.map(vol => (
          <div key={vol.id} className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="font-bold text-gray-900 mb-3">Volume {vol.number} ({vol.year})</h2>
            {vol.issues.length > 0 && (
              <div className="space-y-2 mb-4">
                {vol.issues.map((iss: any) => (
                  <div key={iss.id} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                    <span className="text-sm font-medium">Issue {iss.number}{iss.title ? ` — ${iss.title}` : ""} <span className="text-xs text-gray-400">({iss._count?.submissions||0} papers)</span></span>
                    {!iss.publishedAt ? (
                      <button onClick={() => publishIssue(iss.id)} className="text-xs px-3 py-1 bg-emerald-600 text-white rounded-full hover:bg-emerald-700">Publish Issue</button>
                    ) : <span className="text-xs text-emerald-600 font-semibold">✅ Published</span>}
                  </div>
                ))}
              </div>
            )}
            <div className="flex gap-2 flex-wrap">
              <input type="number" value={issueForm[vol.id]?.number || ""} onChange={e => setIssueForm(p => ({...p, [vol.id]: {...(p[vol.id]||{title:""}), number: e.target.value}}))} placeholder="Issue No." className="w-24 border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              <input type="text" value={issueForm[vol.id]?.title || ""} onChange={e => setIssueForm(p => ({...p, [vol.id]: {...(p[vol.id]||{number:""}), title: e.target.value}}))} placeholder="Issue title (optional)" className="flex-1 border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              <button onClick={() => createIssue(vol.id)} className="px-3 py-1.5 bg-gray-700 text-white rounded-lg text-sm font-semibold hover:bg-gray-800">+ Issue</button>
            </div>
          </div>
        ))}
      </main>
    </div>
  );
}
