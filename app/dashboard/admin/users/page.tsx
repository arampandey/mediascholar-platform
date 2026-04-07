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

  function load() { fetch("/api/admin/users").then(r => r.json()).then(d => setUsers(d.users||[])).finally(() => setLoading(false)); }
  useEffect(() => { load(); }, []);

  async function changeRole(id: string, role: string) {
    setUpdating(id);
    await fetch(`/api/admin/users/${id}`, { method:"PATCH", headers:{"Content-Type":"application/json"}, body: JSON.stringify({role}) });
    setUpdating(null); load();
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

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-7xl mx-auto px-4 py-10 w-full">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div><h1 className="text-2xl font-bold text-gray-900">User Management</h1><p className="text-sm text-gray-500">{users.length} total users</p></div>
          <Link href="/dashboard/admin" className="text-sm text-indigo-700 hover:underline">← Analytics</Link>
        </div>

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
                    <td className="px-4 py-3 text-xs text-gray-500">{u.email}</td>
                    <td className="px-4 py-3 text-xs text-gray-500 max-w-[150px] truncate">{u.institution||"—"}</td>
                    <td className="px-4 py-3">
                      <select value={u.role} onChange={e => changeRole(u.id, e.target.value)} disabled={updating===u.id} className={`text-xs font-semibold px-2 py-1 rounded-full border-0 cursor-pointer focus:outline-none ${ROLE_COLORS[u.role]}`}>
                        {ROLES.map(r => <option key={r} value={r}>{r.replace("_"," ")}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400">{u._count.submissions>0&&<span className="mr-2">📄 {u._count.submissions}</span>}{u._count.reviews>0&&<span>🔍 {u._count.reviews}</span>}{u._count.submissions===0&&u._count.reviews===0&&"—"}</td>
                    <td className="px-4 py-3"><button onClick={() => deleteUser(u.id, u.name)} className="text-xs text-red-400 hover:text-red-600">Delete</button></td>
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
