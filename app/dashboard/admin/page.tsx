"use client";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Link from "next/link";

const STATUS_COLORS: Record<string, string> = { SUBMITTED:"bg-blue-500", PLAGIARISM_CHECK:"bg-yellow-500", UNDER_REVIEW:"bg-purple-500", REVISION_REQUESTED:"bg-orange-500", RESUBMITTED:"bg-cyan-500", ACCEPTED:"bg-green-500", REJECTED:"bg-red-500", PUBLISHED:"bg-emerald-500" };
const STATUS_LABELS: Record<string, string> = { SUBMITTED:"Submitted", PLAGIARISM_CHECK:"Plagiarism Check", UNDER_REVIEW:"Under Review", REVISION_REQUESTED:"Revision Requested", RESUBMITTED:"Resubmitted", ACCEPTED:"Accepted", REJECTED:"Rejected", PUBLISHED:"Published" };

export default function AdminAnalytics() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetch("/api/analytics").then(r => r.json()).then(setData).finally(() => setLoading(false)); }, []);

  if (loading) return <div className="min-h-screen flex flex-col"><Navbar /><div className="flex-1 flex items-center justify-center text-gray-400">Loading…</div></div>;

  const maxMonth = Math.max(...(data?.submissionsPerMonth?.map((m: any) => m.count) || [1]), 1);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-7xl mx-auto px-4 py-10 w-full space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div><h1 className="text-2xl font-bold text-gray-900">Analytics</h1><p className="text-sm text-gray-500 mt-1">Journal statistics overview</p></div>
          <div className="flex gap-2">
            <Link href="/dashboard/admin/users" className="px-4 py-2 bg-indigo-700 text-white text-sm font-semibold rounded-lg hover:bg-indigo-800">Manage Users →</Link>
            <Link href="/dashboard/editor" className="px-4 py-2 border border-gray-300 text-gray-600 text-sm rounded-lg hover:bg-gray-50">← Editor</Link>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[{ label:"Total Submissions", value:data.totalSubmissions, icon:"📄", color:"bg-blue-50 border-blue-200 text-blue-700" }, { label:"Total Users", value:data.totalUsers, icon:"👥", color:"bg-indigo-50 border-indigo-200 text-indigo-700" }, { label:"Reviews Completed", value:data.totalReviews, icon:"🔍", color:"bg-purple-50 border-purple-200 text-purple-700" }, { label:"Published", value:data.submissionsByStatus?.find((s: any) => s.status==="PUBLISHED")?._count?.id||0, icon:"🌐", color:"bg-emerald-50 border-emerald-200 text-emerald-700" }].map(s => (
            <div key={s.label} className={`rounded-xl border p-5 ${s.color}`}><div className="text-3xl mb-1">{s.icon}</div><div className="text-3xl font-extrabold">{s.value}</div><div className="text-xs font-semibold mt-1 opacity-80">{s.label}</div></div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-bold text-gray-900 mb-4">Submissions by Status</h2>
            <div className="space-y-3">
              {data.submissionsByStatus?.map((s: any) => { const pct = data.totalSubmissions > 0 ? (s._count.id/data.totalSubmissions)*100 : 0; return (
                <div key={s.status}><div className="flex justify-between text-xs text-gray-600 mb-1"><span>{STATUS_LABELS[s.status]||s.status}</span><span className="font-bold">{s._count.id}</span></div>
                <div className="w-full bg-gray-100 rounded-full h-2"><div className={`${STATUS_COLORS[s.status]||"bg-gray-400"} h-2 rounded-full`} style={{width:`${pct}%`}} /></div></div>
              ); })}
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-bold text-gray-900 mb-4">Users by Role</h2>
            <div className="space-y-3">
              {data.usersByRole?.map((r: any) => { const pct = data.totalUsers > 0 ? (r._count.id/data.totalUsers)*100 : 0; const colors: Record<string,string> = { AUTHOR:"bg-blue-500", REVIEWER:"bg-purple-500", SUB_EDITOR:"bg-orange-500", EDITOR:"bg-green-500" }; return (
                <div key={r.role}><div className="flex justify-between text-xs text-gray-600 mb-1"><span>{r.role.replace("_"," ")}</span><span className="font-bold">{r._count.id}</span></div>
                <div className="w-full bg-gray-100 rounded-full h-2"><div className={`${colors[r.role]||"bg-gray-400"} h-2 rounded-full`} style={{width:`${pct}%`}} /></div></div>
              ); })}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-bold text-gray-900 mb-6">Submissions — Last 6 Months</h2>
          <div className="flex items-end gap-3 h-36">
            {data.submissionsPerMonth?.map((m: any) => { const h = maxMonth > 0 ? (m.count/maxMonth)*100 : 0; const [y,mo] = m.month.split("-"); const label = new Date(+y,+mo-1).toLocaleDateString("en-IN",{month:"short"}); return (
              <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-xs font-bold text-gray-700">{m.count||""}</span>
                <div className="w-full flex items-end" style={{height:"100px"}}>
                  <div className="w-full bg-indigo-500 rounded-t-md hover:bg-indigo-600 transition-colors" style={{height:`${Math.max(h, m.count>0?8:0)}%`}} />
                </div>
                <span className="text-xs text-gray-500">{label}</span>
              </div>
            ); })}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-bold text-gray-900 mb-4">Recent Submissions</h2>
          <div className="space-y-2">
            {data.recentSubmissions?.map((s: any) => (
              <div key={s.id} className="flex items-center justify-between gap-3 py-2 border-b border-gray-50 last:border-0">
                <div className="flex-1 min-w-0"><p className="font-medium text-gray-900 text-sm truncate">{s.title}</p><p className="text-xs text-gray-400">by {s.author?.name}</p></div>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ${s.status==="PUBLISHED"?"bg-emerald-100 text-emerald-700":s.status==="ACCEPTED"?"bg-green-100 text-green-700":s.status==="REJECTED"?"bg-red-100 text-red-700":"bg-gray-100 text-gray-600"}`}>{STATUS_LABELS[s.status]||s.status}</span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
