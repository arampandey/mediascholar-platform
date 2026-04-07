"use client";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import Link from "next/link";

export default function ApplyReviewerPage() {
  const [note, setNote] = useState("");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await fetch("/api/reviewer-applications", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ note }) });
    setLoading(false); setDone(true);
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-lg mx-auto px-4 py-12 w-full">
        <Link href="/dashboard" className="text-sm text-indigo-700 hover:underline mb-6 inline-block">← Dashboard</Link>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Apply as Reviewer</h1>
        <p className="text-sm text-gray-500 mb-6">Join the MediaScholar reviewer panel and contribute to academic publishing.</p>
        {done ? (
          <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
            <div className="text-3xl mb-2">✅</div>
            <p className="font-bold text-green-800">Application Submitted</p>
            <p className="text-sm text-green-600 mt-1">We'll review your application and notify you by email.</p>
          </div>
        ) : (
          <form onSubmit={submit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-1">Why do you want to be a reviewer? (optional)</label>
              <textarea value={note} onChange={e => setNote(e.target.value)} rows={4} placeholder="Briefly describe your expertise and motivation…"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <button type="submit" disabled={loading} style={{ backgroundColor: "#1a2744" }} className="w-full text-white py-2.5 rounded-lg font-semibold text-sm hover:opacity-90 disabled:opacity-50">
              {loading ? "Submitting…" : "Submit Application"}
            </button>
          </form>
        )}
      </main>
    </div>
  );
}
