"use client";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import StatusBadge from "@/components/StatusBadge";
import Link from "next/link";

export default function SubEditorDashboard() {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/submissions/all").then(r => r.json()).then(d => setSubmissions(d.submissions || [])).finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-7xl mx-auto px-4 py-10 w-full">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Sub-Editor Dashboard</h1>
        {loading ? <div className="text-center py-20 text-gray-400">Loading…</div> : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead><tr className="bg-gray-50 border-b"><th className="text-left px-4 py-3 font-semibold text-gray-600">Title</th><th className="text-left px-4 py-3 font-semibold text-gray-600">Author</th><th className="text-left px-4 py-3 font-semibold text-gray-600">Status</th><th className="px-4 py-3"></th></tr></thead>
              <tbody className="divide-y divide-gray-100">
                {submissions.map((s: any) => (
                  <tr key={s.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900 max-w-[280px] truncate">{s.title}</td>
                    <td className="px-4 py-3 text-xs text-gray-500">{s.author?.name}</td>
                    <td className="px-4 py-3"><StatusBadge status={s.status} /></td>
                    <td className="px-4 py-3"><Link href={`/dashboard/editor/submission/${s.id}`} className="text-indigo-700 text-xs hover:underline">View →</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
