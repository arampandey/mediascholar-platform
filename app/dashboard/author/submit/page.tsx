"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Link from "next/link";

export default function SubmitPage() {
  const router = useRouter();
  const [form, setForm] = useState({ title: "", abstract: "", keywords: "", language: "en", coAuthors: "" });
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) { setError("Please attach your paper file"); return; }
    setLoading(true); setError("");
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    fd.append("file", file);
    const res = await fetch("/api/submissions", { method: "POST", body: fd });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error || "Submission failed"); return; }
    router.push("/dashboard/author");
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-2xl mx-auto px-4 py-10 w-full">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/dashboard/author" className="text-sm text-indigo-700 hover:underline">← My Submissions</Link>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Submit Research Paper</h1>
        {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2 rounded-lg mb-4">{error}</div>}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-1">Paper Title *</label>
            <input type="text" value={form.title} onChange={e => setForm(p => ({...p, title: e.target.value}))} required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Full title of your research paper" />
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-1">Abstract *</label>
            <textarea value={form.abstract} onChange={e => setForm(p => ({...p, abstract: e.target.value}))} required rows={5}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Summarise your research (200-500 words)" />
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-1">Keywords</label>
            <input type="text" value={form.keywords} onChange={e => setForm(p => ({...p, keywords: e.target.value}))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Comma-separated: media, journalism, digital communication" />
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-1">Language *</label>
            <select value={form.language} onChange={e => setForm(p => ({...p, language: e.target.value}))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option value="en">English</option>
              <option value="hi">Hindi (हिंदी)</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-1">Co-Authors (one per line)</label>
            <textarea value={form.coAuthors} onChange={e => setForm(p => ({...p, coAuthors: e.target.value}))} rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Dr. Jane Smith, XYZ University" />
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-1">Paper File (PDF/Word) *</label>
            <input type="file" accept=".pdf,.doc,.docx" onChange={e => setFile(e.target.files?.[0] || null)} required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            <p className="text-xs text-gray-400 mt-1">Max file size: 20MB. Accepted: PDF, DOC, DOCX</p>
          </div>
          <button type="submit" disabled={loading} style={{ backgroundColor: "#1a2744" }}
            className="w-full text-white py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50">
            {loading ? "Submitting…" : "Submit Paper"}
          </button>
        </form>
      </main>
    </div>
  );
}
