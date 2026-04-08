"use client";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import StatusBadge from "@/components/StatusBadge";
import Link from "next/link";

export default function ReviewerDashboard() {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/reviewer/assignments").then(r => r.json()).then(d => setAssignments(d.assignments || [])).finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-5xl mx-auto px-4 py-10 w-full">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Reviewer Dashboard</h1>
        <p className="text-sm text-gray-500 mb-8">Papers assigned to you for review</p>
        {loading ? <div className="text-center py-20 text-gray-400">Loading…</div> :
         assignments.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border border-gray-200">
            <p className="font-semibold text-gray-600">No papers assigned yet.</p>
            <p className="text-sm text-gray-400 mt-1">Papers assigned to you will appear here.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {assignments.map((a: any) => (
              <Link key={a.id} href={`/dashboard/reviewer/${a.submissionId}`} className="block bg-white rounded-xl border border-gray-200 p-5 hover:shadow-sm transition-shadow">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div>
                    <h3 className="font-bold text-gray-900">{a.submission.title}</h3>
                    <p className="text-xs text-gray-400 mt-1">by {a.submission.author?.name} · Assigned {new Date(a.assignedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</p>
                  </div>
                  <StatusBadge status={a.submission.status} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
