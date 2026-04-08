"use client";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Link from "next/link";

function VerifyContent() {
  const searchParams = useSearchParams();
  const success = searchParams.get("success");
  const email = searchParams.get("email");

  if (success) {
    return (
      <div className="text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Email Verified</h1>
        <p className="text-sm text-gray-500 mb-6">Your email address has been verified successfully. You may now sign in.</p>
        <Link href="/login" style={{ backgroundColor: "#1a2744" }}
          className="inline-block text-white px-6 py-2.5 rounded-lg font-semibold text-sm hover:opacity-90 transition-opacity">
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="text-center">
      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Verify Your Email</h1>
      <p className="text-sm text-gray-500 mb-2">
        We have sent a verification link to {email ? <strong>{email}</strong> : "your email address"}.
      </p>
      <p className="text-sm text-gray-500 mb-6">Please check your inbox and click the link to activate your account.</p>
      <p className="text-xs text-gray-400 mb-4">Did not receive the email? Check your spam folder.</p>
      {email && (
        <button onClick={async () => {
          await fetch("/api/auth/resend-verification", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
          alert("Verification email resent. Please check your inbox.");
        }} className="text-sm text-indigo-700 hover:underline">
          Resend verification email
        </button>
      )}
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
          <Suspense fallback={<div className="text-center text-gray-400">Loading…</div>}>
            <VerifyContent />
          </Suspense>
        </div>
      </main>
    </div>
  );
}
