"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Navbar from "@/components/Navbar";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", institution: "", designation: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError("");
    const res = await fetch("/api/auth/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    const data = await res.json();
    if (!res.ok) { setError(data.error || "Registration failed"); setLoading(false); return; }
    await signIn("credentials", { email: form.email, password: form.password, redirect: false });
    router.push("/dashboard");
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Create Account</h1>
          <p className="text-sm text-gray-500 mb-6">Join MediaScholar as an Author</p>
          {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2 rounded-lg mb-4">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            {[{ key: "name", label: "Full Name", type: "text" }, { key: "email", label: "Email", type: "email" }, { key: "password", label: "Password", type: "password" }, { key: "institution", label: "Institution / University", type: "text" }, { key: "designation", label: "Designation (e.g. PhD Scholar, Professor)", type: "text" }].map(f => (
              <div key={f.key}>
                <label className="text-sm font-medium text-gray-700 block mb-1">{f.label}</label>
                <input type={f.type} value={(form as any)[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} required={["name","email","password"].includes(f.key)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
            ))}
            <button type="submit" disabled={loading}
              style={{ backgroundColor: "#1a2744" }} className="w-full text-white py-2.5 rounded-lg font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50">
              {loading ? "Creating account…" : "Register"}
            </button>
          </form>
          <p className="text-sm text-center text-gray-500 mt-4">Already registered? <Link href="/login" className="text-indigo-700 font-medium hover:underline">Sign in</Link></p>
        </div>
      </main>
    </div>
  );
}
