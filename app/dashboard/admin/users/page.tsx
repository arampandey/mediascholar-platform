"use client";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Link from "next/link";

const ROLES = ["AUTHOR","REVIEWER","SUB_EDITOR","EDITOR"];
const ROLE_COLORS: Record<string,string> = { AUTHOR:"bg-blue-100 text-blue-700", REVIEWER:"bg-purple-100 text-purple-700", SUB_EDITOR:"bg-orange-100 text-orange-700", EDITOR:"bg-green-100 text-green-700" };

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("ALL");
  const [updating, setUpdating] = useState<string|null>(null);
  const [editingEmail, setEditingEmail] = useState<string|null>(null);
  const [emailDraft, setEmailDraft] = useState("");
  const [msg, setMsg] = useState("");

  function load() { fetch("/api/admin/users").then(r => r.json()).then(d => setUsers(d.users||[])).finally(() => setLoading(false)); }
  useEffect(() => { load(); }, []);

  async function changeRole(id: string, role: string) {
    setUpdating(id);
    await fetch(`/api/admin/users/${id}`, { method:"PATCH", headers:{"Content-Type":"application/json"}, body: JSON.stringify({role}) });
    setUpdating(null); load();
  }

  async function saveEmail(id: string) {
    if (!emailDraft.trim() || !emailDraft.includes("@")) return;
    setUpdating(id);
    const res = await fetch(`/api/admin/users/${id}`, { method:"PATCH", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ email: emailDraft.trim() }) });
    if (res.ok) { setMsg("✅ Email updated"); setEditingEmail(null); load(); }
    else setMsg("❌ Failed to update email");
    setUpdating(null);
    setTimeout(() => setMsg(""), 4000);
  }

  async function resendAssignment(id: string, name: string) {
    setUpdating(id);
    const res = await fetch(`/api/admin/users/${id}/resend-assignment`, { method:"POST" });
    const data = await res.json();
    if (res.ok) setMsg(`✅ Assignment email resent to ${data.email} (${data.sent} paper${data.sent>1?"s":""})`);
    else setMsg(`❌ ${data.error || "Failed to resend"}`);
    setUpdating(null);
    setTimeout(() => setMsg(""), 5000);
  }

  async function deleteUser(id: string, name: string) {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    await fetch(`/api/admin/users/${id}`, { method:"DELETE" });
    load();
  }

  const filtered = users.filter(u => {
    const q = search.toLowerCase();
    return (filterRole==="ALL"||u.role===filterRole) && (!q || u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q) || u.institution?.toLowerCase().includes(q));
  });

  const badEmailCount = users.filter(u => u.email?.includes("@mediascholar.in") && u.email !== "archive@mediascholar.in").length;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-7xl mx-auto px-4 py-10 w-full">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
            <p className="text-sm text-gray-500">{users.length} total users</p>
            {badEmailCount > 0 && (
              <div className="mt-1 flex items-center gap-2 text-xs font-semibold text-orange-700 bg-orange-50 border border-orange-200 px-3 py-1.5 rounded-lg">
                ⚠️ {badEmailCount} user{badEmailCount>1?"s have":" has"} placeholder @mediascholar.in email — click ✏️ on any highlighted row to fix.
              </div>
            )}
          </div>
          <Link href="/dashboard/admin" className="text-sm text-indigo-700 hover:underline">← Analytics</Link>
        </div>
        {msg && <div className="mb-4 text-sm font-medium px-4 py-2 rounded-lg bg-blue-50 border border-blue-200 text-blue-800">{msg}</div>}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
          {ROLES.map(r => <div key={r} onClick={() => setFilterRole(filterRole===r?"ALL":r)} className={`rounded-xl p-4 text-center cursor-pointer border-2 transition-all ${filterRole===r?"border-indigo-500 shadow-md":"border-transparent"} ${ROLE_COLORS[r]}`}><div className="text-2xl font-bold">{users.filter(u=>u.role===r).length}</div><div className="text-xs font-semibold mt-0.5">{r.replace("_"," ")}</div></div>)}
        </div>

        <div className="flex gap-3 mb-5">
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, email or institution…" className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          <select value={filterRole} onChange={e => setFilterRole(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none">
            <option value="ALL">All Roles</option>
            {ROLES.map(r => <option key={r} value={r}>{r.replace("_"," ")}</option>)}
          </select>
        </div>

        {loading ? <div className="text-center py-20 text-gray-400">Loading…</div> : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead><tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Name</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Email</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Institution</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Role</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Activity</th>
                <th className="px-4 py-3"></th>
              </tr></thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.length===0 && <tr><td colSpan={6} className="text-center py-10 text-gray-400">No users found.</td></tr>}
                {filtered.map(u => (
                  <tr key={u.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{u.name}</td>
                    <td className="px-4 py-3 text-xs">
                      {editingEmail === u.id ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="email"
                            value={emailDraft}
                            onChange={e => setEmailDraft(e.target.value)}
                            onKeyDown={e => { if (e.key==="Enter") saveEmail(u.id); if (e.key==="Escape") setEditingEmail(null); }}
                            autoFocus
                            className="border border-indigo-300 rounded px-2 py-0.5 text-xs w-48 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          />
                          <button onClick={() => saveEmail(u.id)} disabled={updating===u.id} className="text-green-600 hover:text-green-800 font-bold text-xs">✔</button>
                          <button onClick={() => setEditingEmail(null)} className="text-gray-400 hover:text-gray-600 text-xs">✕</button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1">
                          <span className={u.email?.includes("@mediascholar.in") && u.email !== "archive@mediascholar.in" ? "text-orange-600 font-semibold" : "text-gray-500"}>{u.email}</span>
                          {u.email?.includes("@mediascholar.in") && u.email !== "archive@mediascholar.in" && <span className="text-orange-500" title="Placeholder email — click pencil to fix">⚠️</span>}
                          <button onClick={() => { setEditingEmail(u.id); setEmailDraft(u.email); }} className="ml-1 text-gray-300 hover:text-indigo-500" title="Edit email">✏️</button>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500 max-w-[150px] truncate">{u.institution||"—"}</td>
                    <td className="px-4 py-3">
                      <select value={u.role} onChange={e => changeRole(u.id, e.target.value)} disabled={updating===u.id} className={`text-xs font-semibold px-2 py-1 rounded-full border-0 cursor-pointer focus:outline-none ${ROLE_COLORS[u.role]}`}>
                        {ROLES.map(r => <option key={r} value={r}>{r.replace("_"," ")}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400">{u._count.submissions>0&&<span className="mr-2">📄 {u._count.submissions}</span>}{u._count.reviews>0&&<span>🔍 {u._count.reviews}</span>}{u._count.submissions===0&&u._count.reviews===0&&"—"}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {u.role==="REVIEWER" && (
                          <button
                            onClick={() => resendAssignment(u.id, u.name)}
                            disabled={updating===u.id}
                            title="Resend assignment email"
                            className="text-xs text-indigo-500 hover:text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded-full disabled:opacity-40"
                          >📧 Resend</button>
                        )}
                        <button onClick={() => deleteUser(u.id, u.name)} className="text-xs text-red-400 hover:text-red-600">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="px-4 py-3 bg-gray-50 border-t text-xs text-gray-400">Showing {filtered.length} of {users.length} users</div>
          </div>
        )}
      </main>
    </div>
  );
}
