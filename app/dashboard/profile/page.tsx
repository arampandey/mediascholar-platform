"use client";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Link from "next/link";

export default function ProfilePage() {
  const [form, setForm] = useState({ name: "", institution: "", designation: "", bio: "", orcid: "" });
  const [pwForm, setPwForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPw, setChangingPw] = useState(false);
  const [msg, setMsg] = useState({ text: "", type: "" });
  const [pwMsg, setPwMsg] = useState({ text: "", type: "" });

  useEffect(() => {
    fetch("/api/profile").then(r => r.json()).then(d => {
      if (d.user) setForm({ name: d.user.name || "", institution: d.user.institution || "", designation: d.user.designation || "", bio: d.user.bio || "", orcid: d.user.orcid || "" });
      setLoading(false);
    });
  }, []);

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await fetch("/api/profile", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setSaving(false);
    if (res.ok) setMsg({ text: "✅ Profile updated successfully", type: "success" });
    else setMsg({ text: "❌ Failed to update profile", type: "error" });
    setTimeout(() => setMsg({ text: "", type: "" }), 4000);
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      setPwMsg({ text: "❌ New passwords do not match", type: "error" }); return;
    }
    if (pwForm.newPassword.length < 8) {
      setPwMsg({ text: "❌ Password must be at least 8 characters", type: "error" }); return;
    }
    setChangingPw(true);
    const res = await fetch("/api/profile", {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword }),
    });
    const data = await res.json();
    setChangingPw(false);
    if (res.ok) {
      setPwMsg({ text: "✅ Password changed successfully", type: "success" });
      setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } else {
      setPwMsg({ text: `❌ ${data.error || "Failed to change password"}`, type: "error" });
    }
    setTimeout(() => setPwMsg({ text: "", type: "" }), 5000);
  }

  if (loading) return <div className="min-h-screen flex flex-col"><Navbar /><div className="flex-1 flex items-center justify-center text-gray-400">Loading…</div></div>;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-lg mx-auto px-4 py-10 w-full space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
          <Link href="/dashboard" className="text-sm text-indigo-700 hover:underline">← Dashboard</Link>
        </div>

        {/* Profile Details */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-800 mb-4">Profile Details</h2>
          {msg.text && (
            <div className={`text-sm px-3 py-2 rounded-lg mb-4 ${msg.type === "success" ? "bg-green-50 border border-green-200 text-green-700" : "bg-red-50 border border-red-200 text-red-700"}`}>
              {msg.text}
            </div>
          )}
          <form onSubmit={saveProfile} className="space-y-4">
            {[
              { k: "name", l: "Full Name", t: "text" },
              { k: "institution", l: "Institution / University", t: "text" },
              { k: "designation", l: "Designation", t: "text" },
              { k: "orcid", l: "ORCID ID", t: "text" },
            ].map(f => (
              <div key={f.k}>
                <label className="text-sm font-medium text-gray-700 block mb-1">{f.l}</label>
                <input type={f.t} value={(form as any)[f.k]} onChange={e => setForm(p => ({ ...p, [f.k]: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
            ))}
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Bio</label>
              <textarea value={form.bio} onChange={e => setForm(p => ({ ...p, bio: e.target.value }))} rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <button type="submit" disabled={saving} style={{ backgroundColor: "#1a2744" }}
              className="w-full text-white py-2.5 rounded-lg font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50">
              {saving ? "Saving…" : "Save Profile"}
            </button>
          </form>
        </div>

        {/* Change Password */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-800 mb-1">Change Password</h2>
          <p className="text-xs text-gray-400 mb-4">Choose a strong password of at least 8 characters</p>
          {pwMsg.text && (
            <div className={`text-sm px-3 py-2 rounded-lg mb-4 ${pwMsg.type === "success" ? "bg-green-50 border border-green-200 text-green-700" : "bg-red-50 border border-red-200 text-red-700"}`}>
              {pwMsg.text}
            </div>
          )}
          <form onSubmit={changePassword} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Current Password</label>
              <input type="password" value={pwForm.currentPassword} onChange={e => setPwForm(p => ({ ...p, currentPassword: e.target.value }))} required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">New Password</label>
              <input type="password" value={pwForm.newPassword} onChange={e => setPwForm(p => ({ ...p, newPassword: e.target.value }))} required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Confirm New Password</label>
              <input type="password" value={pwForm.confirmPassword} onChange={e => setPwForm(p => ({ ...p, confirmPassword: e.target.value }))} required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <button type="submit" disabled={changingPw}
              className="w-full bg-orange-600 text-white py-2.5 rounded-lg font-semibold text-sm hover:bg-orange-700 transition-colors disabled:opacity-50">
              {changingPw ? "Changing…" : "Change Password"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
