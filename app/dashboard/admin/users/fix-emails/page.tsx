"use client";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Link from "next/link";

type Row = { id: string; name: string; email: string; institution: string | null; submissions: { title: string; status: string }[] };

export default function FixEmailsPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [paste, setPaste] = useState("");

  function load() {
    fetch("/api/admin/users/placeholders").then(r => r.json()).then(d => setRows(d.users || [])).finally(() => setLoading(false));
  }
  useEffect(() => { load(); }, []);

  function applyPaste() {
    // Lines: "name or current placeholder email , correct email"
    const next = { ...draft };
    let hit = 0, miss = 0;
    for (const line of paste.split(/\r?\n/)) {
      const parts = line.split(/[,\t]/).map(s => s.trim().replace(/^"|"$/g, ""));
      if (parts.length < 2 || !parts[1].includes("@")) continue;
      const key = parts[0].toLowerCase();
      const r = rows.find(x => x.email.toLowerCase() === key || x.name.toLowerCase() === key);
      if (r) { next[r.id] = parts[1]; hit++; } else miss++;
    }
    setDraft(next);
    setMsg(`Filled ${hit} row(s)${miss ? `, ${miss} line(s) did not match any name or placeholder email` : ""}. Review below, then click Save.`);
  }

  async function saveAll() {
    const updates = rows.filter(r => (draft[r.id] || "").trim()).map(r => ({ id: r.id, email: draft[r.id].trim() }));
    if (!updates.length) { setMsg("Type at least one correct email first."); return; }
    setBusy(true); setMsg(""); setErrors({});
    try {
      const res = await fetch("/api/admin/users/bulk-email", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ updates }) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setMsg(`❌ ${data.error || "Save failed"}`); }
      else {
        const errs: Record<string, string> = {};
        let ok = 0;
        for (const r of data.results) { if (r.ok) ok++; else errs[r.id] = r.error; }
        setErrors(errs);
        setDraft(d => Object.fromEntries(Object.entries(d).filter(([id]) => errs[id])));
        setMsg(`✅ ${ok} email(s) updated${Object.keys(errs).length ? `, ${Object.keys(errs).length} need attention (shown in red)` : ""}.`);
        load();
      }
    } catch { setMsg("❌ Network error — please try again."); }
    setBusy(false);
  }

  const filled = rows.filter(r => (draft[r.id] || "").trim()).length;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-6xl mx-auto px-4 py-10 w-full">
        <Link href="/dashboard/admin/users" className="text-sm text-indigo-600 font-medium">← User Management</Link>
        <h1 className="text-2xl font-bold text-gray-900 mt-2">Fix placeholder emails</h1>
        <p className="text-sm text-gray-500 mb-4">{rows.length} author(s) still have an auto-generated address. Enter each person&apos;s real email, or paste a list, then save.</p>

        {msg && <div className="mb-4 text-sm font-medium px-4 py-2 rounded-lg bg-blue-50 border border-blue-200 text-blue-800 sticky top-2 z-10">{msg}</div>}

        <details className="mb-5 bg-gray-50 border border-gray-200 rounded-xl p-4">
          <summary className="text-sm font-semibold text-gray-700 cursor-pointer">Paste a list instead (from Excel)</summary>
          <p className="text-xs text-gray-500 mt-2">One per line: <code>author name, correct email</code> (or <code>current placeholder email, correct email</code>). Tab or comma separated.</p>
          <textarea value={paste} onChange={e => setPaste(e.target.value)} rows={5} className="mt-2 w-full border border-gray-300 rounded-lg px-3 py-2 text-xs font-mono" placeholder={"Dr. A Sharma, a.sharma@university.edu\nRohit Kumar, rohit@example.com"} />
          <button onClick={applyPaste} className="mt-2 px-3 py-1.5 text-sm border border-indigo-300 text-indigo-700 rounded-lg hover:bg-indigo-50">Fill table from list</button>
        </details>

        {loading ? <div className="text-center py-20 text-gray-400">Loading…</div> : rows.length === 0 ? (
          <div className="text-center py-16 text-green-700 font-semibold">🎉 No placeholder emails left.</div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="bg-gray-50 border-b border-gray-200 text-left text-gray-600">
                <th className="px-4 py-3 font-semibold">Author</th>
                <th className="px-4 py-3 font-semibold">Paper(s)</th>
                <th className="px-4 py-3 font-semibold">Current (placeholder)</th>
                <th className="px-4 py-3 font-semibold">Correct email</th>
              </tr></thead>
              <tbody className="divide-y divide-gray-100">
                {rows.map(r => (
                  <tr key={r.id} className="align-top">
                    <td className="px-4 py-3 font-medium text-gray-900">{r.name}<span className="block text-xs text-gray-400 font-normal">{r.institution || ""}</span></td>
                    <td className="px-4 py-3 text-xs text-gray-600 max-w-xs">{r.submissions.length ? r.submissions.map((s, i) => <span key={i} className="block truncate" title={s.title}>{s.title}</span>) : "—"}</td>
                    <td className="px-4 py-3 text-xs text-orange-600 break-all">{r.email}</td>
                    <td className="px-4 py-3">
                      <input
                        type="email"
                        value={draft[r.id] || ""}
                        onChange={e => setDraft({ ...draft, [r.id]: e.target.value })}
                        onKeyDown={e => { if (e.key === "Enter") saveAll(); }}
                        placeholder="name@example.com"
                        className={`w-64 border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${errors[r.id] ? "border-red-400" : "border-gray-300"}`}
                      />
                      {errors[r.id] && <span className="block text-xs text-red-600 mt-1">{errors[r.id]}</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {rows.length > 0 && (
          <div className="mt-5 flex items-center gap-3">
            <button onClick={saveAll} disabled={busy || filled === 0} className="px-5 py-2.5 bg-indigo-700 text-white rounded-lg text-sm font-bold hover:bg-indigo-800 disabled:opacity-40">{busy ? "Saving…" : `Save ${filled} email(s)`}</button>
            <span className="text-xs text-gray-500">Only rows you fill in are changed. No emails are sent to authors by this page.</span>
          </div>
        )}
      </main>
    </div>
  );
}
