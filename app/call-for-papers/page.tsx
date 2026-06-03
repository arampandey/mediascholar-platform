import Navbar from "@/components/Navbar";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Call for Papers — Vol. 4, Issue 2 (2026) | Media Scholar",
  description: "Media Scholar invites original research papers for Vol. 4, Issue 2 (2026). Submission deadline: 31 October 2026. Open access, peer-reviewed, bilingual journal. ISSN: 3048-5029.",
  alternates: { canonical: "https://mediascholar.in/call-for-papers" },
};

export default function CallForPapersPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-1 max-w-3xl mx-auto px-4 py-12 w-full space-y-6">

        {/* Header */}
        <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm text-center">
          <span className="inline-block bg-yellow-400 text-yellow-900 text-xs font-extrabold uppercase tracking-widest px-3 py-1 rounded-full mb-4">Now Open</span>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Call for Papers</h1>
          <p className="text-indigo-700 font-semibold text-lg mb-1">Volume 4, Issue 2 — 2026</p>
          <p className="text-gray-500 text-sm mb-6">Media Scholar — Journal of Media Studies and Humanities | ISSN: 3048-5029</p>
          <div className="inline-flex items-center gap-2 bg-red-500 text-white font-bold px-5 py-2.5 rounded-xl text-sm mb-6">
            🗓 Submission Deadline: <span className="underline">31 October 2026</span>
          </div>
          <p className="text-gray-600 text-sm leading-relaxed">
            <strong>Media Scholar</strong> invites original, unpublished research papers for Vol. 4, Issue 2 (2026) from faculty members, research scholars, PhD students, and media professionals. The journal is double-blind peer-reviewed, open-access, and bilingual (Hindi & English). <strong>No submission fees.</strong>
          </p>
        </div>

        {/* Key Details */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-base font-bold text-gray-900 mb-4">Key Details</h2>
          <div className="space-y-3 text-sm text-gray-700">
            <div className="flex justify-between"><span className="text-gray-500 font-medium">Issue</span><span className="font-semibold">Volume 4, Issue 2 (May–Oct 2026)</span></div>
            <div className="flex justify-between"><span className="text-gray-500 font-medium">Submission Window</span><span className="font-semibold">4 May – 31 October 2026</span></div>
            <div className="flex justify-between"><span className="text-gray-500 font-medium">Review Process</span><span className="font-semibold">Double-Blind Peer Review</span></div>
            <div className="flex justify-between"><span className="text-gray-500 font-medium">Languages</span><span className="font-semibold">Hindi & English</span></div>
            <div className="flex justify-between"><span className="text-gray-500 font-medium">Access</span><span className="font-semibold">Open Access — Free</span></div>
            <div className="flex justify-between"><span className="text-gray-500 font-medium">ISSN</span><span className="font-semibold">3048-5029</span></div>
          </div>
        </div>

        {/* How to Submit */}
        <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6">
          <h2 className="text-base font-bold text-gray-900 mb-4">How to Submit</h2>
          <div className="space-y-2 mb-5">
            {[
              "Register as an author at mediascholar.in/register",
              "Log in and click "Submit New Paper"",
              "Fill in details and upload your manuscript (PDF or Word)",
              "You'll receive a confirmation email on submission",
            ].map((step, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-indigo-700 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                <p className="text-sm text-gray-700">{step}</p>
              </div>
            ))}
          </div>
          <div className="flex gap-3 flex-wrap">
            <Link href="/register" className="px-5 py-2.5 bg-indigo-700 text-white font-bold rounded-xl hover:bg-indigo-800 transition-colors text-sm">Register & Submit</Link>
            <a href="mailto:editor@mediascholar.in" className="px-5 py-2.5 border-2 border-indigo-700 text-indigo-700 font-bold rounded-xl hover:bg-indigo-700 hover:text-white transition-colors text-sm">Email Us</a>
          </div>
        </div>

        {/* Note */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
          Papers submitted after <strong>31 October 2026</strong> will be assigned to Vol. 5, Issue 1 (2027). For queries: <a href="mailto:editor@mediascholar.in" className="underline font-semibold">editor@mediascholar.in</a>
        </div>

      </main>

      <footer style={{ backgroundColor: "#1a2744" }} className="text-white text-center py-6 text-sm mt-8">
        <p>© {new Date().getFullYear()} Media Scholar — Journal of Media Studies and Humanities. ISSN: 3048-5029</p>
      </footer>
    </div>
  );
}
