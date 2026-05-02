"use client";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import StatusBadge from "@/components/StatusBadge";
import Link from "next/link";

type ViewMode = "flat" | "issue";

function groupByIssue(submissions: any[]) {
  const groups: Record<string, { label: string; issueId: string | null; items: any[] }> = {};
  for (const s of submissions) {
    const key = s.issue
      ? `vol${s.issue.volume.number}-issue${s.issue.number}`
      : "unassigned";
    if (!groups[key]) {
      groups[key] = {
        label: s.issue
          ? `Vol. ${s.issue.volume.number} (${s.issue.volume.year}) — Issue ${s.issue.number}`
          : "📥 Unassigned (No Issue)",
        issueId: s.issue ? s.issueId : null,
        items: [],
      };
    }
    groups[key].items.push(s);
  }
  // Sort: assigned issues first (by vol desc, issue desc), unassigned last
  return Object.values(groups).sort((a, b) => {
    if (a.issueId === null) return 1;
    if (b.issueId === null) return -1;
    return a.label < b.label ? 1 : -1;
  });
}

function SubmissionsTable({ items }: { items: any[] }) {
  return (
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
          {items.map((s: any) => (
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
  );
}

export default function EditorDashboard() {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"submissions"|"applications"|"volumes">("submissions");
  const [viewMode, setViewMode] = useState<ViewMode>("issue");
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetch("/api/submissions/all").then(r => r.json()).then(d => setSubmissions(d.submissions || [])).finally(() => setLoading(false));
  }, []);

  const counts: Record<string, number> = submissions.reduce((acc: any, s: any) => { acc[s.status] = (acc[s.status]||0)+1; return acc; }, {});
  const issueGroups = groupByIssue(submissions);

  function toggleGroup(key: string) {
    setCollapsedGroups(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  }

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
            <Link href="/dashboard/editor/doi" className="px-3 py-2 text-sm border border-purple-300 rounded-lg text-purple-700 hover:bg-purple-50 font-medium">🔖 DOI Management</Link>
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
            <div className="space-y-4">
              {/* View mode toggle */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 font-medium">View:</span>
                <button onClick={() => setViewMode("issue")} className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${viewMode==="issue" ? "bg-indigo-700 text-white" : "border border-gray-300 text-gray-500 hover:bg-gray-50"}`}>📂 Issue-wise</button>
                <button onClick={() => setViewMode("flat")} className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${viewMode==="flat" ? "bg-indigo-700 text-white" : "border border-gray-300 text-gray-500 hover:bg-gray-50"}`}>📝 All ({submissions.length})</button>
              </div>

              {viewMode === "flat" && <SubmissionsTable items={submissions} />}

              {viewMode === "issue" && issueGroups.map(group => {
                const key = group.label;
                const collapsed = collapsedGroups.has(key);
                return (
                  <div key={key} className="rounded-xl border border-gray-200 overflow-hidden">
                    <button
                      onClick={() => toggleGroup(key)}
                      className="w-full flex items-center justify-between px-5 py-3 bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-gray-800">{group.label}</span>
                        <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-semibold">{group.items.length} paper{group.items.length!==1?"s":""}</span>
                        <div className="flex gap-1">
                          {Object.entries(
                            group.items.reduce((acc: any, s: any) => { acc[s.status]=(acc[s.status]||0)+1; return acc; }, {})
                          ).map(([status, count]) => (
                            <span key={status} className="text-xs text-gray-400">{String(count)} {status.toLowerCase().replace(/_/g," ")}</span>
                          )).slice(0,3)}
                        </div>
                      </div>
                      <span className="text-gray-400 text-xs">{collapsed ? "▶ Show" : "▼ Hide"}</span>
                    </button>
                    {!collapsed && (
                      <table className="w-full text-sm">
                        <thead><tr className="border-b border-gray-100">
                          <th className="text-left px-4 py-2 font-semibold text-gray-500 text-xs">Title</th>
                          <th className="text-left px-4 py-2 font-semibold text-gray-500 text-xs">Author</th>
                          <th className="text-left px-4 py-2 font-semibold text-gray-500 text-xs">Status</th>
                          <th className="text-left px-4 py-2 font-semibold text-gray-500 text-xs">Reviews</th>
                          <th className="px-4 py-2"></th>
                        </tr></thead>
                        <tbody className="divide-y divide-gray-50">
                          {group.items.map((s: any) => (
                            <tr key={s.id} className="hover:bg-gray-50">
                              <td className="px-4 py-2.5 font-medium text-gray-900 max-w-[260px] truncate">{s.title}</td>
                              <td className="px-4 py-2.5 text-gray-500 text-xs">{s.author?.name}</td>
                              <td className="px-4 py-2.5"><StatusBadge status={s.status} /></td>
                              <td className="px-4 py-2.5 text-xs text-gray-400">{s._count?.reviews || 0} done</td>
                              <td className="px-4 py-2.5"><Link href={`/dashboard/editor/submission/${s.id}`} className="text-indigo-700 text-xs hover:underline">View →</Link></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                );
              })}
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
