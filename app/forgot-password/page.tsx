"use client";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError("");
    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setLoading(false);
    if (res.ok) setDone(true);
    else setError("Something went wrong. Please try again.");
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
          {done ? (
            <div className="text-center">
              <div className="text-5xl mb-4">📧</div>
              <h1 className="text-xl font-bold text-gray-900 mb-2">Check your email</h1>
              <p className="text-sm text-gray-500 mb-4">
                We've sent a password reset link to <strong>{email}</strong>. Please check your inbox (and spam folder).
              </p>
              <p className="text-xs text-gray-400">The link expires in 1 hour.</p>
              <Link href="/login" className="inline-block mt-6 text-sm text-indigo-700 font-medium hover:underline">
                ← Back to Login
              </Link>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">Forgot Password?</h1>
              <p className="text-sm text-gray-500 mb-6">Enter your email and we'll send you a reset link.</p>
              {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2 rounded-lg mb-4">{error}</div>}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Email Address</label>
                  <input
                    type="email" value={email} onChange={e => setEmail(e.target.value)} required
                    placeholder="your@email.com"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <button type="submit" disabled={loading} style={{ backgroundColor: "#1a2744" }}
                  className="w-full text-white py-2.5 rounded-lg font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50">
                  {loading ? "Sending…" : "Send Reset Link"}
                </button>
              </form>
              <p className="text-sm text-center text-gray-500 mt-4">
                Remember it? <Link href="/login" className="text-indigo-700 font-medium hover:underline">Sign in</Link>
              </p>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
