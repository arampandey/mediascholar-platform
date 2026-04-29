"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "", institution: "", designation: "", mobile: "" });
  const [error, setError] = useState("");
  const [alreadyExists, setAlreadyExists] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.password !== form.confirmPassword) { setError("Passwords do not match"); return; }
    if (form.password.length < 8) { setError("Password must be at least 8 characters"); return; }
    setLoading(true); setError(""); setAlreadyExists(false);
    const res = await fetch("/api/auth/register", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: form.name, email: form.email, password: form.password, institution: form.institution, designation: form.designation, mobile: form.mobile || undefined }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      if (data.error?.includes("already registered")) {
        setAlreadyExists(true);
      } else {
        setError(data.error || "Registration failed");
      }
      return;
    }
    router.push(`/verify-email?email=${encodeURIComponent(form.email)}`);
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Author Registration</h1>
            <p className="text-sm text-gray-500">Create your account to submit research papers to Media Scholar</p>
          </div>

          {/* Toggle */}
          <div className="flex rounded-lg border border-gray-200 p-1 mb-6 bg-gray-50">
            <span className="flex-1 text-center py-2 text-sm font-semibold rounded-md bg-white shadow-sm text-indigo-700">
              Author
            </span>
            <Link href="/register-reviewer" className="flex-1 text-center py-2 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors">
              Reviewer
            </Link>
          </div>

          {alreadyExists && (
            <div className="bg-amber-50 border border-amber-300 text-amber-800 text-sm px-4 py-3 rounded-lg mb-4">
              <p className="font-semibold mb-1">This email is already registered.</p>
              <p>Please <Link href="/login" className="underline font-bold hover:text-amber-900">sign in</Link> to your existing account, or use <Link href="/forgot-password" className="underline font-bold hover:text-amber-900">Forgot Password</Link> if you don&apos;t remember your password.</p>
            </div>
          )}
          {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2 rounded-lg mb-4">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Full Name <span className="text-red-500">*</span></label>
              <input type="text" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required
                placeholder="Dr. / Prof. / Mr. / Ms."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Email Address <span className="text-red-500">*</span></label>
              <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required
                placeholder="your@email.com"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Institution / University <span className="text-red-500">*</span></label>
              <input type="text" value={form.institution} onChange={e => setForm(p => ({ ...p, institution: e.target.value }))} required
                placeholder="e.g. Galgotias University, Greater Noida"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Designation <span className="text-red-500">*</span></label>
              <input type="text" value={form.designation} onChange={e => setForm(p => ({ ...p, designation: e.target.value }))} required
                placeholder="e.g. Research Scholar, Assistant Professor"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Mobile Number <span className="text-gray-400 font-normal">(optional)</span></label>
              <input type="tel" value={form.mobile} onChange={e => setForm(p => ({ ...p, mobile: e.target.value }))}
                placeholder="e.g. +91 98765 43210"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Password <span className="text-red-500">*</span></label>
              <input type="password" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} required
                placeholder="Minimum 8 characters"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Confirm Password <span className="text-red-500">*</span></label>
              <input type="password" value={form.confirmPassword} onChange={e => setForm(p => ({ ...p, confirmPassword: e.target.value }))} required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <button type="submit" disabled={loading} style={{ backgroundColor: "#1a2744" }}
              className="w-full text-white py-2.5 rounded-lg font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50">
              {loading ? "Creating account…" : "Register as Author"}
            </button>
          </form>
          <p className="text-sm text-center text-gray-500 mt-4">
            Already registered? <Link href="/login" className="text-indigo-700 font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </main>
    </div>
  );
}
