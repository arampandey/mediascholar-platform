"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Link from "next/link";

const AREAS = [
  "Mass Communication", "Journalism", "Media Studies", "Digital Media",
  "Film Studies", "Advertising & PR", "Development Communication",
  "Health Communication", "Political Communication", "Media Law & Ethics",
  "New Media & Technology", "Hindi Media", "Regional Media", "Other",
];

export default function ReviewerRegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "", email: "", password: "", confirmPassword: "",
    institution: "", designation: "", expertise: "", orcid: "", bio: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.password !== form.confirmPassword) { setError("Passwords do not match"); return; }
    if (form.password.length < 8) { setError("Password must be at least 8 characters"); return; }
    setLoading(true); setError("");

    // Step 1: Register the user
    const res = await fetch("/api/auth/register", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name, email: form.email, password: form.password,
        institution: form.institution, designation: form.designation,
        bio: form.bio, orcid: form.orcid,
      }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error || "Registration failed"); setLoading(false); return; }

    // Step 2: Auto-submit reviewer application
    // (Will be processed after email verification and login)
    router.push(`/verify-email?email=${encodeURIComponent(form.email)}&reviewer=true`);
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Reviewer Registration</h1>
            <p className="text-sm text-gray-500">Apply to join the reviewer panel of Media Scholar</p>
          </div>

          {/* Toggle */}
          <div className="flex rounded-lg border border-gray-200 p-1 mb-6 bg-gray-50">
            <Link href="/register" className="flex-1 text-center py-2 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors">
              Author
            </Link>
            <span className="flex-1 text-center py-2 text-sm font-semibold rounded-md bg-white shadow-sm text-indigo-700">
              Reviewer
            </span>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 mb-5 text-sm text-blue-800">
            Your application will be reviewed by the editorial team. You will be notified by email once approved.
          </div>

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
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Institution / University <span className="text-red-500">*</span></label>
              <input type="text" value={form.institution} onChange={e => setForm(p => ({ ...p, institution: e.target.value }))} required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Designation <span className="text-red-500">*</span></label>
              <input type="text" value={form.designation} onChange={e => setForm(p => ({ ...p, designation: e.target.value }))} required
                placeholder="e.g. Associate Professor, PhD Scholar"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Area of Expertise <span className="text-red-500">*</span></label>
              <select value={form.expertise} onChange={e => setForm(p => ({ ...p, expertise: e.target.value }))} required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="">Select your primary area…</option>
                {AREAS.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Brief Bio / Research Interests</label>
              <textarea value={form.bio} onChange={e => setForm(p => ({ ...p, bio: e.target.value }))} rows={3}
                placeholder="Briefly describe your research background and areas of interest…"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">ORCID ID (optional)</label>
              <input type="text" value={form.orcid} onChange={e => setForm(p => ({ ...p, orcid: e.target.value }))}
                placeholder="e.g. 0000-0002-1234-5678"
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
              {loading ? "Submitting application…" : "Apply as Reviewer"}
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
