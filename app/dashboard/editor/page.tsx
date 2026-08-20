"use client";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import StatusBadge from "@/components/StatusBadge";
import Link from "next/link";
import { formatIssueLabel } from "@/lib/format";

type ViewMode = "flat" | "issue";

const STATUS_LABELS: Record<string, string> = {
  SUBMITTED: "Submitted",
  PLAGIARISM_CHECK: "Plagiarism Check",
  UNDER_REVIEW: "Under Review",
  REVISION_REQUESTED: "Revision Requested",
  RESUBMITTED: "Resubmitted",
  ACCEPTED: "Accepted",
  REJECTED: "Rejected",
  PUBLISHED: "Published",
};

const DECISION_LABELS: Record<string, string> = {
  ACCEPT: "Accept",
  MINOR_REVISION: "Minor Revision",
  MAJOR_REVISION: "Major Revision",
  REJECT: "Reject",
};

// ── helpers ─────────────────────────────────────────────────────────────────

function daysFromNow(date: string | null): number | null {
  if (!date) return null;
  const diff = new Date(date).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function daysAgo(date: string): number {
  const diff = Date.now() - new Date(date).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

/** Next action the editor should take, based on current state */
function actionHint(s: any): { label: string; color: string } | null {
  switch (s.status) {
    case "SUBMITTED":
      return { label: "⚠️ Run plagiarism check", color: "text-yellow-700 bg-yellow-50 border-yellow-200" };
    case "PLAGIARISM_CHECK":
      if (s.plagiarismScore != null && s.plagiarismScore <= 20)
        return { label: "✅ Plagiarism cleared — assign 2 reviewers", color: "text-blue-700 bg-blue-50 border-blue-200" };
      return null;
    case "UNDER_REVIEW": {
      const active = (s.reviewers || []).filter((r: any) => !r.declinedAt);
      if (active.length < 2)
        return { label: "⚠️ Need another reviewer", color: "text-orange-700 bg-orange-50 border-orange-200" };
      const pendingReviewers = active.filter(
        (r: any) => !(s.reviews || []).some((rv: any) => rv.reviewerId === r.user.id)
      );
      if (pendingReviewers.length === 0)
        return { label: "📋 Both reviews in — make final decision", color: "text-indigo-700 bg-indigo-50 border-indigo-200" };
      return null; // reviewer deadlines shown below
    }
    case "REVISION_REQUESTED":
      return { label: "⏳ Waiting for author to submit revision", color: "text-orange-600 bg-orange-50 border-orange-200" };
    case "RESUBMITTED":
      return { label: "📩 Revised paper received — make final decision", color: "text-indigo-700 bg-indigo-50 border-indigo-200" };
    case "ACCEPTED":
      return { label: "🌐 Ready to publish — assign to an issue", color: "text-emerald-700 bg-emerald-50 border-emerald-200" };
    default:
      return null;
  }
}

/** Per-reviewer deadline pill */
function ReviewerChip({ reviewer, reviews }: { reviewer: any; reviews: any[] }) {
  const submitted = reviews.some((rv: any) => rv.reviewerId === reviewer.user.id);
  const decision = submitted
    ? reviews.find((rv: any) => rv.reviewerId === reviewer.user.id)?.decision
    : null;

  if (reviewer.declinedAt)
    return (
      <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border bg-red-50 text-red-600 border-red-200 font-medium">
        ❌ {reviewer.user.name} — Declined
      </span>
    );

  if (submitted)
    return (
      <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border bg-green-50 text-green-700 border-green-200 font-medium">
        ✅ {reviewer.user.name}{decision ? ` · ${DECISION_LABELS[decision] || decision}` : ""}
      </span>
    );

  const days = daysFromNow(reviewer.deadlineAt);
  let deadlineClass = "bg-gray-50 text-gray-600 border-gray-200";
  let deadlineLabel = reviewer.deadlineAt
    ? days != null && days < 0
      ? `Overdue by ${Math.abs(days)}d`
      : days != null && days === 0
      ? "Due today"
      : `${days}d left`
    : "No deadline";
  if (days != null && days <= 0) deadlineClass = "bg-red-50 text-red-700 border-red-200";
  else if (days != null && days <= 3) deadlineClass = "bg-orange-50 text-orange-700 border-orange-200";
  else if (days != null && days <= 7) deadlineClass = "bg-yellow-50 text-yellow-700 border-yellow-200";

  return (
    <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border font-medium ${deadlineClass}`}>
      ⏳ {reviewer.user.name} — {deadlineLabel}
    </span>
  );
}

/** Rich submission row card */
function SubmissionRow({ s }: { s: any }) {
  const hint = actionHint(s);
  const activeReviewers = (s.reviewers || []).filter((r: any) => !r.retractedAt);
  const submitted = daysAgo(s.createdAt);

  return (
    <tr className="hover:bg-gray-50 border-b border-gray-100 align-top">
      {/* Title + submitted date */}
      <td className="px-4 py-3 max-w-[260px]">
        <p className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2">{s.title}</p>
        <p className="text-xs text-gray-400 mt-0.5">
          {submitted === 0 ? "Today" : submitted === 1 ? "Yesterday" : `${submitted}d ago`}
        </p>
      </td>

      {/* Author */}
      <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
        {s.author?.name}
        {s.author?.institution && (
          <div className="text-gray-400 truncate max-w-[140px]">{s.author.institution}</div>
        )}
      </td>

      {/* Status + action hint */}
      <td className="px-4 py-3">
        <StatusBadge status={s.status} />
        {hint && (
          <div className={`mt-1.5 text-xs px-2 py-0.5 rounded-full border font-medium inline-block ${hint.color}`}>
            {hint.label}
          </div>
        )}
      </td>

      {/* Reviewer deadlines */}
      <td className="px-4 py-3">
        {activeReviewers.length === 0 ? (
          <span className="text-xs text-gray-300 italic">—</span>
        ) : (
          <div className="flex flex-col gap-1">
            {activeReviewers.map((r: any) => (
              <ReviewerChip key={r.id} reviewer={r} reviews={s.reviews || []} />
            ))}
          </div>
        )}
      </td>

      {/* View link */}
      <td className="px-4 py-3 text-right whitespace-nowrap">
        <Link href={`/dashboard/editor/submission/${s.id}`}
          className="text-indigo-700 text-xs font-semibold hover:underline">
          Open →
        </Link>
      </td>
    </tr>
  );
}

function SubmissionsTable({ items }: { items: any[] }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            <th className="text-left px-4 py-2.5 font-semibold text-gray-500 text-xs">Title</th>
            <th className="text-left px-4 py-2.5 font-semibold text-gray-500 text-xs">Author</th>
            <th className="text-left px-4 py-2.5 font-semibold text-gray-500 text-xs">Status / Next Action</th>
            <th className="text-left px-4 py-2.5 font-semibold text-gray-500 text-xs">Reviewers & Deadlines</th>
            <th className="px-4 py-2.5"></th>
          </tr>
        </thead>
        <tbody>
          {items.map((s: any) => <SubmissionRow key={s.id} s={s} />)}
        </tbody>
      </table>
    </div>
  );
}

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
  return Object.values(groups).sort((a, b) => {
    if (a.issueId === null) return 1;
    if (b.issueId === null) return -1;
    return a.label < b.label ? 1 : -1;
  });
}

export default function EditorDashboard() {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"submissions" | "applications" | "volumes" | "report">("submissions");
  const [volumes, setVolumes] = useState<any[]>([]);
  const [selectedIssueId, setSelectedIssueId] = useState("");
  const [report, setReport] = useState<any[]>([]);
  const [reportLoading, setReportLoading] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("issue");
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set(["__all__"]));
  const [applications, setApplications] = useState<any[]>([]);
  const [appsLoading, setAppsLoading] = useState(false);
  const [appsLoaded, setAppsLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/reviewer-applications").then(r => r.json()).then(d => {
      setApplications(d.applications || []);
      setAppsLoaded(true);
    }).catch(() => setAppsLoaded(true));
  }, []);

  function loadApplications() {
    setAppsLoading(true);
    fetch("/api/reviewer-applications").then(r => r.json()).then(d => {
      setApplications(d.applications || []);
    }).finally(() => setAppsLoading(false));
  }

  async function decideApplication(id: string, status: string) {
    await fetch(`/api/reviewer-applications/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
    loadApplications();
  }

  useEffect(() => {
    fetch("/api/volumes").then(r => r.json()).then(d => setVolumes(d.volumes || []));
  }, []);

  useEffect(() => {
    if (!selectedIssueId) { setReport([]); return; }
    setReportLoading(true);
    fetch(`/api/report/issue?issueId=${selectedIssueId}`)
      .then(r => r.json())
      .then(d => setReport(d.report || []))
      .finally(() => setReportLoading(false));
  }, [selectedIssueId]);

  useEffect(() => {
    fetch("/api/submissions/all").then(r => r.json()).then(d => {
      const subs = d.submissions || [];
      setSubmissions(subs);
      const groups = groupByIssue(subs);
      if (groups.length > 1) {
        setCollapsedGroups(new Set(groups.slice(1).map(g => g.label)));
      } else {
        setCollapsedGroups(new Set());
      }
    }).finally(() => setLoading(false));
  }, []);

  const counts: Record<string, number> = submissions.reduce((acc: any, s: any) => {
    acc[s.status] = (acc[s.status] || 0) + 1;
    return acc;
  }, {});
  const pendingAppsCount = applications.filter(a => a.status === "PENDING").length;
  const issueGroups = groupByIssue(submissions);

  // Attention-needed count: papers that need editor action
  const needsAction = submissions.filter(s =>
    ["SUBMITTED", "RESUBMITTED", "ACCEPTED"].includes(s.status) ||
    (s.status === "PLAGIARISM_CHECK" && s.plagiarismScore != null && s.plagiarismScore <= 20) ||
    (s.status === "UNDER_REVIEW" && (s.reviewers || []).filter((r: any) => !r.declinedAt).length < 2)
  ).length;

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
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Editor Dashboard</h1>
            {needsAction > 0 && (
              <p className="text-sm text-orange-600 font-medium mt-0.5">
                ⚠️ {needsAction} paper{needsAction > 1 ? "s" : ""} need{needsAction === 1 ? "s" : ""} your attention
              </p>
            )}
          </div>
          <div className="flex gap-2 flex-wrap">
            <Link href="/dashboard/admin" className="px-3 py-2 text-sm border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50">📊 Analytics</Link>
            <Link href="/dashboard/admin/users" className="px-3 py-2 text-sm border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50">👥 Users</Link>
            <Link href="/dashboard/editor/email-templates" className="px-3 py-2 text-sm border border-indigo-300 rounded-lg text-indigo-700 hover:bg-indigo-50 font-medium">✉️ Email Templates</Link>
            <Link href="/dashboard/editor/doi" className="px-3 py-2 text-sm border border-purple-300 rounded-lg text-purple-700 hover:bg-purple-50 font-medium">🔖 DOI Management</Link>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
          {[
            { label: "Total", val: submissions.length, color: "bg-blue-50 text-blue-700" },
            { label: "Need Action", val: needsAction, color: needsAction > 0 ? "bg-orange-50 text-orange-700" : "bg-gray-50 text-gray-400" },
            { label: "Under Review", val: counts["UNDER_REVIEW"] || 0, color: "bg-purple-50 text-purple-700" },
            { label: "Accepted", val: counts["ACCEPTED"] || 0, color: "bg-green-50 text-green-700" },
            { label: "Published", val: counts["PUBLISHED"] || 0, color: "bg-emerald-50 text-emerald-700" },
          ].map(s => (
            <div key={s.label} className={`rounded-xl p-4 text-center ${s.color}`}>
              <div className="text-3xl font-extrabold">{s.val}</div>
              <div className="text-xs font-semibold mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-5 flex-wrap">
          <button onClick={() => setTab("submissions")} className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${tab === "submissions" ? "bg-indigo-700 text-white" : "border border-gray-300 text-gray-600 hover:bg-gray-50"}`}>
            Submissions
          </button>
          <button onClick={() => { setTab("applications"); loadApplications(); }} className={`relative px-4 py-2 text-sm font-medium rounded-lg transition-colors ${tab === "applications" ? "bg-indigo-700 text-white" : "border border-gray-300 text-gray-600 hover:bg-gray-50"}`}>
            Reviewer Applications
            {appsLoaded && pendingAppsCount > 0 && (
              <span className={`ml-2 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold rounded-full ${tab === "applications" ? "bg-white text-indigo-700" : "bg-red-500 text-white"}`}>
                {pendingAppsCount}
              </span>
            )}
          </button>
          <button onClick={() => setTab("volumes")} className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${tab === "volumes" ? "bg-indigo-700 text-white" : "border border-gray-300 text-gray-600 hover:bg-gray-50"}`}>
            Volumes
          </button>
          <button onClick={() => setTab("report")} className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${tab === "report" ? "bg-indigo-700 text-white" : "border border-gray-300 text-gray-600 hover:bg-gray-50"}`}>
            📋 Report
          </button>
        </div>

        {/* ── Submissions tab ── */}
        {tab === "submissions" && (
          loading ? <div className="text-center py-20 text-gray-400">Loading…</div> : (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 font-medium">View:</span>
                <button onClick={() => setViewMode("issue")} className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${viewMode === "issue" ? "bg-indigo-700 text-white" : "border border-gray-300 text-gray-500 hover:bg-gray-50"}`}>📂 Issue-wise</button>
                <button onClick={() => setViewMode("flat")} className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${viewMode === "flat" ? "bg-indigo-700 text-white" : "border border-gray-300 text-gray-500 hover:bg-gray-50"}`}>📝 All ({submissions.length})</button>
              </div>

              {viewMode === "flat" && <SubmissionsTable items={submissions} />}

              {viewMode === "issue" && issueGroups.map(group => {
                const key = group.label;
                const collapsed = collapsedGroups.has(key);
                const groupNeedsAction = group.items.filter(s => actionHint(s) !== null).length;
                return (
                  <div key={key} className="rounded-xl border border-gray-200 overflow-hidden">
                    <button
                      onClick={() => toggleGroup(key)}
                      className="w-full flex items-center justify-between px-5 py-3 bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="text-sm font-bold text-gray-800">{group.label}</span>
                        <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-semibold">
                          {group.items.length} paper{group.items.length !== 1 ? "s" : ""}
                        </span>
                        {groupNeedsAction > 0 && (
                          <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-semibold">
                            ⚠️ {groupNeedsAction} need action
                          </span>
                        )}
                      </div>
                      <span className="text-gray-400 text-xs">{collapsed ? "▶ Show" : "▼ Hide"}</span>
                    </button>
                    {!collapsed && (
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-gray-100 bg-gray-50">
                            <th className="text-left px-4 py-2 font-semibold text-gray-500 text-xs">Title</th>
                            <th className="text-left px-4 py-2 font-semibold text-gray-500 text-xs">Author</th>
                            <th className="text-left px-4 py-2 font-semibold text-gray-500 text-xs">Status / Next Action</th>
                            <th className="text-left px-4 py-2 font-semibold text-gray-500 text-xs">Reviewers & Deadlines</th>
                            <th className="px-4 py-2"></th>
                          </tr>
                        </thead>
                        <tbody>
                          {group.items.map((s: any) => <SubmissionRow key={s.id} s={s} />)}
                        </tbody>
                      </table>
                    )}
                  </div>
                );
              })}
            </div>
          )
        )}

        {/* ── Applications tab ── */}
        {tab === "applications" && (
          <div>
            {appsLoading ? (
              <div className="text-center py-20 text-gray-400">Loading…</div>
            ) : applications.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-xl border border-gray-200">
                <p className="font-semibold text-gray-500">No reviewer applications yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {applications.map(a => (
                  <div key={a.id} className="bg-white rounded-xl border border-gray-200 p-5">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div>
                        <p className="font-bold text-gray-900">{a.user.name}</p>
                        <p className="text-sm text-gray-500">{a.user.email} · {a.user.institution || "—"} · {a.user.designation || "—"}</p>
                        {a.note && <p className="text-sm text-indigo-700 mt-1 font-medium">{a.note}</p>}
                        <p className="text-xs text-gray-400 mt-1">Applied {new Date(a.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        {a.status === "PENDING" ? (
                          <div className="flex gap-2">
                            <button onClick={() => decideApplication(a.id, "APPROVED")} className="px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg font-semibold hover:bg-green-700">✓ Approve</button>
                            <button onClick={() => decideApplication(a.id, "REJECTED")} className="px-3 py-1.5 bg-red-500 text-white text-sm rounded-lg font-semibold hover:bg-red-600">✗ Reject</button>
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
          </div>
        )}

        {/* ── Volumes tab ── */}
        {tab === "volumes" && (
          <div className="text-center py-10">
            <Link href="/dashboard/editor/volumes" className="px-5 py-2.5 bg-indigo-700 text-white rounded-lg font-semibold hover:bg-indigo-800">Manage Volumes & Issues →</Link>
          </div>
        )}

        {/* ── Report tab ── */}
        {tab === "report" && (
          <div className="space-y-5">
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Select Issue</label>
              <select
                value={selectedIssueId}
                onChange={e => setSelectedIssueId(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 min-w-[280px]"
              >
                <option value="">— Choose an issue —</option>
                {volumes.flatMap(v =>
                  (v.issues || []).map((iss: any) => (
                    <option key={iss.id} value={iss.id}>
                      Vol. {v.number} ({v.year}) — {formatIssueLabel(iss.number, iss.title)}
                    </option>
                  ))
                )}
              </select>
            </div>

            {!selectedIssueId && (
              <div className="text-center py-16 text-gray-400 text-sm">Select an issue above to generate the report.</div>
            )}
            {selectedIssueId && reportLoading && (
              <div className="text-center py-16 text-gray-400">Loading report…</div>
            )}
            {selectedIssueId && !reportLoading && report.length === 0 && (
              <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
                <p className="font-semibold text-gray-500">No papers found for this issue.</p>
              </div>
            )}
            {selectedIssueId && !reportLoading && report.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
                <table className="w-full text-sm min-w-[720px]">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200 text-left">
                      <th className="px-4 py-3 font-semibold text-gray-600 w-8">#</th>
                      <th className="px-4 py-3 font-semibold text-gray-600">Paper Title</th>
                      <th className="px-4 py-3 font-semibold text-gray-600">Author(s)</th>
                      <th className="px-4 py-3 font-semibold text-gray-600">Paper Status</th>
                      <th className="px-4 py-3 font-semibold text-gray-600">Assigned Reviewers</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {report.map((paper: any, idx: number) => {
                      const allAuthors = [paper.author?.name, ...(paper.coAuthors || [])].filter(Boolean).join(", ");
                      return (
                        <tr key={paper.id} className="hover:bg-gray-50 align-top">
                          <td className="px-4 py-3 text-gray-400 text-xs">{idx + 1}</td>
                          <td className="px-4 py-3 font-medium text-gray-900 max-w-[240px]">
                            <Link href={`/dashboard/editor/submission/${paper.id}`} className="hover:text-indigo-700 hover:underline">{paper.title}</Link>
                          </td>
                          <td className="px-4 py-3 text-gray-600 text-xs max-w-[160px]">{allAuthors}</td>
                          <td className="px-4 py-3"><StatusBadge status={paper.status} /></td>
                          <td className="px-4 py-3">
                            {paper.status === "PUBLISHED" ? (
                              <span className="text-xs px-2 py-0.5 rounded-full border font-medium bg-emerald-50 text-emerald-700 border-emerald-200">✅ Reviewed</span>
                            ) : paper.reviewers.length === 0 ? (
                              <span className="text-xs text-gray-400 italic">Not assigned</span>
                            ) : (
                              <div className="space-y-1.5">
                                {paper.reviewers.map((r: any, ri: number) => {
                                  let badge = "";
                                  let badgeClass = "";
                                  if (r.declinedAt) { badge = "❌ Declined"; badgeClass = "bg-red-50 text-red-600 border-red-200"; }
                                  else if (r.reviewSubmittedAt) {
                                    const dec = r.reviewDecision ? ` · ${DECISION_LABELS[r.reviewDecision] || r.reviewDecision}` : "";
                                    badge = `✅ Submitted${dec}`; badgeClass = "bg-green-50 text-green-700 border-green-200";
                                  } else { badge = "⏳ Pending"; badgeClass = "bg-yellow-50 text-yellow-700 border-yellow-200"; }
                                  return (
                                    <div key={ri} className="flex items-center gap-2">
                                      <span className="text-xs text-gray-700 font-medium">{r.name}</span>
                                      <span className={`text-xs px-2 py-0.5 rounded-full border font-medium whitespace-nowrap ${badgeClass}`}>{badge}</span>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                <div className="px-4 py-3 border-t border-gray-100 text-xs text-gray-400">
                  {report.length} paper{report.length !== 1 ? "s" : ""} in this issue
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
