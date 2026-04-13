"use client";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import StatusBadge from "@/components/StatusBadge";
import Link from "next/link";

export default function EditorDashboard() {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"submissions"|"applications"|"volumes">("submissions");

  useEffect(() => {
    fetch("/api/submissions/all").then(r => r.json()).then(d => setSubmissions(d.submissions || [])).finally(() => setLoading(false));
  }, []);

  const counts: Record<string, number> = submissions.reduce((acc: any, s: any) => { acc[s.status] = (acc[s.status]||0)+1; return acc; }, {});

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-7xl mx-auto px-4 py-10 w-full">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <h1 className="text-2xl font-bold text-gray-900">Editor Dashboard</h1>
          <div className="flex gap-2 flex-wrap">
            <Link href="/dashboard/admin" className="px-3 py-2 text-sm border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50">📊 Analytics</Link>
            <Link href="/dashboard/admin/users" className="px-3 py-2 text-sm border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50">👥 Users</Link>
            <Link href="/dashboard/editor/email-templates" className="px-3 py-2 text-sm border border-indigo-300 rounded-lg text-indigo-700 hover:bg-indigo-50 font-medium">✉️ Email Templates</Link>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[{ label: "Total", val: submissions.length, color: "bg-blue-50 text-blue-700" }, { label: "Under Review", val: counts["UNDER_REVIEW"]||0, color: "bg-purple-50 text-purple-700" }, { label: "Accepted", val: counts["ACCEPTED"]||0, color: "bg-green-50 text-green-700" }, { label: "Published", val: counts["PUBLISHED"]||0, color: "bg-emerald-50 text-emerald-700" }].map(s => (
            <div key={s.label} className={`rounded-xl p-4 text-center ${s.color}`}>
              <div className="text-3xl font-extrabold">{s.val}</div>
              <div className="text-xs font-semibold mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-5 flex-wrap">
          {(["submissions", "applications", "volumes"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${tab === t ? "bg-indigo-700 text-white" : "border border-gray-300 text-gray-600 hover:bg-gray-50"}`}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {tab === "submissions" && (
          loading ? <div className="text-center py-20 text-gray-400">Loading…</div> : (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <table className="w-full text-sm">
                <thead><tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Title</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Author</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Status</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Reviews</th>
                  <th className="px-4 py-3"></th>
                </tr></thead>
                <tbody className="divide-y divide-gray-100">
                  {submissions.map((s: any) => (
                    <tr key={s.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900 max-w-[280px] truncate">{s.title}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{s.author?.name}</td>
                      <td className="px-4 py-3"><StatusBadge status={s.status} /></td>
                      <td className="px-4 py-3 text-xs text-gray-400">{s._count?.reviews || 0} done</td>
                      <td className="px-4 py-3"><Link href={`/dashboard/editor/submission/${s.id}`} className="text-indigo-700 text-xs hover:underline">View →</Link></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}
        {tab === "applications" && (
          <div className="text-center py-10">
            <Link href="/dashboard/editor/reviewer-applications" className="px-5 py-2.5 bg-indigo-700 text-white rounded-lg font-semibold hover:bg-indigo-800">Manage Reviewer Applications →</Link>
          </div>
        )}
        {tab === "volumes" && (
          <div className="text-center py-10">
            <Link href="/dashboard/editor/volumes" className="px-5 py-2.5 bg-indigo-700 text-white rounded-lg font-semibold hover:bg-indigo-800">Manage Volumes & Issues →</Link>
          </div>
        )}
      </main>
    </div>
  );
}
