"use client";
import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Link from "next/link";

function ResetForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) { setError("Passwords do not match"); return; }
    if (password.length < 8) { setError("Password must be at least 8 characters"); return; }
    setLoading(true); setError("");
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });
    const data = await res.json();
    setLoading(false);
    if (res.ok) setDone(true);
    else setError(data.error || "Something went wrong");
  }

  if (!token) return (
    <div className="text-center">
      <div className="text-4xl mb-3">❌</div>
      <p className="font-semibold text-gray-700">Invalid reset link</p>
      <Link href="/forgot-password" className="mt-4 inline-block text-sm text-indigo-700 hover:underline">Request a new one →</Link>
    </div>
  );

  if (done) return (
    <div className="text-center">
      <div className="text-5xl mb-4">✅</div>
      <h1 className="text-xl font-bold text-gray-900 mb-2">Password Reset!</h1>
      <p className="text-sm text-gray-500 mb-6">Your password has been changed successfully.</p>
      <button onClick={() => router.push("/login")} style={{ backgroundColor: "#1a2744" }}
        className="w-full text-white py-2.5 rounded-lg font-semibold text-sm hover:opacity-90">
        Sign In Now →
      </button>
    </div>
  );

  return (
    <>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Set New Password</h1>
      <p className="text-sm text-gray-500 mb-6">Choose a strong password of at least 8 characters.</p>
      {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2 rounded-lg mb-4">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">New Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">Confirm New Password</label>
          <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
        <button type="submit" disabled={loading} style={{ backgroundColor: "#1a2744" }}
          className="w-full text-white py-2.5 rounded-lg font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50">
          {loading ? "Resetting…" : "Reset Password"}
        </button>
      </form>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
          <Suspense fallback={<div className="text-center text-gray-400">Loading…</div>}>
            <ResetForm />
          </Suspense>
        </div>
      </main>
    </div>
  );
}
