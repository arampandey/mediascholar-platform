"use client";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";

export default function ProfilePage() {
  const [form, setForm] = useState({ name: "", institution: "", designation: "", bio: "", orcid: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    fetch("/api/profile").then(r => r.json()).then(d => {
      if (d.user) setForm({ name: d.user.name||"", institution: d.user.institution||"", designation: d.user.designation||"", bio: d.user.bio||"", orcid: d.user.orcid||"" });
      setLoading(false);
    });
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault(); setSaving(true);
    await fetch("/api/profile", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setSaving(false); setMsg("Profile updated!"); setTimeout(() => setMsg(""), 3000);
  }

  if (loading) return <div className="min-h-screen flex flex-col"><Navbar /><div className="flex-1 flex items-center justify-center text-gray-400">Loading…</div></div>;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-lg mx-auto px-4 py-10 w-full">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Profile</h1>
        {msg && <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-3 py-2 rounded-lg mb-4">{msg}</div>}
        <form onSubmit={save} className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          {[{ k: "name", l: "Full Name", t: "text" }, { k: "institution", l: "Institution", t: "text" }, { k: "designation", l: "Designation", t: "text" }, { k: "orcid", l: "ORCID", t: "text" }].map(f => (
            <div key={f.k}>
              <label className="text-sm font-semibold text-gray-700 block mb-1">{f.l}</label>
              <input type={f.t} value={(form as any)[f.k]} onChange={e => setForm(p => ({...p, [f.k]: e.target.value}))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
          ))}
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-1">Bio</label>
            <textarea value={form.bio} onChange={e => setForm(p => ({...p, bio: e.target.value}))} rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <button type="submit" disabled={saving} style={{ backgroundColor: "#1a2744" }} className="w-full text-white py-2.5 rounded-lg font-semibold text-sm hover:opacity-90 disabled:opacity-50">
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </form>
      </main>
    </div>
  );
}
