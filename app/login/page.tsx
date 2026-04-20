"use client";
import { useState, useEffect, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Link from "next/link";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [unverified, setUnverified] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendDone, setResendDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    // NextAuth redirects back with ?error=CredentialsSignin when authorize() returns null
    if (searchParams.get("error") === "CredentialsSignin") {
      setError("Sign-in failed. Please check your email and password, or verify your email first.");
    }
  }, [searchParams]);

  async function handleResend() {
    setResendLoading(true);
    try {
      await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setResendDone(true);
    } finally {
      setResendLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setUnverified(false);
    setResendDone(false);

    // First verify credentials against our own API
    const check = await fetch("/api/auth/signin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!check.ok) {
      const data = await check.json();
      if (data.error === "EMAIL_NOT_VERIFIED") {
        setUnverified(true);
      } else {
        setError("Invalid email or password.");
      }
      setLoading(false);
      return;
    }

    // Credentials valid — now sign in with NextAuth
    const result = await signIn("credentials", {
      email: email.toLowerCase(),
      password,
      callbackUrl: "/dashboard",
      redirect: true,
    });
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Sign In</h1>
          <p className="text-sm text-gray-500 mb-6">Media Scholar Journal Platform</p>
          {unverified && !resendDone && (
            <div className="bg-amber-50 border border-amber-300 text-amber-800 text-sm px-4 py-3 rounded-lg mb-4">
              <p className="font-semibold mb-1">Email not verified yet.</p>
              <p className="mb-2">Please check your inbox (and spam folder) for the verification email. Without verifying, you cannot log in.</p>
              <button onClick={handleResend} disabled={resendLoading}
                className="underline font-bold hover:text-amber-900 disabled:opacity-50">
                {resendLoading ? "Sending…" : "Resend verification email"}
              </button>
            </div>
          )}
          {unverified && resendDone && (
            <div className="bg-green-50 border border-green-300 text-green-800 text-sm px-4 py-3 rounded-lg mb-4">
              ✅ Verification email resent. Please check your inbox.
            </div>
          )}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2 rounded-lg mb-4">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Email</label>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)} required
                autoComplete="email"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Password</label>
              <input
                type="password" value={password} onChange={e => setPassword(e.target.value)} required
                autoComplete="current-password"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <button
              type="submit" disabled={loading}
              style={{ backgroundColor: "#1a2744" }}
              className="w-full text-white py-2.5 rounded-lg font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>
          <div className="mt-4 space-y-2 text-center text-sm">
            <div>
              <Link href="/forgot-password" className="text-indigo-700 font-medium hover:underline">Forgot your password?</Link>
            </div>
            <div className="text-gray-500">No account? <Link href="/register" className="text-indigo-700 font-medium hover:underline">Register</Link></div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
