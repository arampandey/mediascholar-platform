import Navbar from "@/components/Navbar";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Call for Papers — Vol. 4, Issue 1 (2026) | Media Scholar",
  description: "Media Scholar invites original research papers for Vol. 4, Issue 1 (2026). Submission deadline: 30 April 2026. Open access, peer-reviewed, bilingual journal. ISSN: 3048-5029.",
  alternates: { canonical: "https://mediascholar.in/call-for-papers" },
};

export default function CallForPapersPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      {/* Hero */}
      <div style={{ background: "linear-gradient(135deg, #1a2744 0%, #2d4a8a 100%)" }} className="py-12 px-4 text-white text-center">
        <span className="inline-block bg-yellow-400 text-yellow-900 text-xs font-extrabold uppercase tracking-widest px-3 py-1 rounded-full mb-4">Now Open</span>
        <h1 className="text-3xl sm:text-4xl font-extrabold mb-3">Call for Papers</h1>
        <p className="text-blue-200 text-lg max-w-2xl mx-auto">
          Volume 4, Issue 1 — 2026
        </p>
        <p className="text-blue-300 text-sm mt-2">Media Scholar — Journal of Media Studies and Humanities | ISSN: 3048-5029</p>
        <div className="mt-6 inline-flex items-center gap-2 bg-red-500 text-white font-bold px-5 py-2.5 rounded-xl text-sm">
          🗓 Submission Deadline: <span className="underline">30 April 2026</span>
        </div>
      </div>

      <main className="flex-1 max-w-4xl mx-auto px-4 py-12 w-full space-y-8">

        {/* Invitation */}
        <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
          <h2 className="text-xl font-extrabold text-gray-900 mb-4">Invitation to Authors</h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            <strong>Media Scholar — Journal of Media Studies and Humanities</strong> invites original, unpublished research papers for its forthcoming <strong>Volume 4, Issue 1 (2026)</strong>. We welcome submissions from faculty members, research scholars, PhD students, and media professionals across India and internationally.
          </p>
          <p className="text-gray-600 leading-relaxed">
            Media Scholar is a double-blind peer-reviewed, open-access bilingual journal (Hindi & English) committed to advancing scholarly discourse in media studies, journalism, and allied humanities. There are <strong>no submission fees or publication charges</strong>.
          </p>
        </div>

        {/* Key Details */}
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { icon: "📅", label: "Submission Deadline", value: "30 April 2026" },
            { icon: "📖", label: "Issue", value: "Volume 4, Issue 1 (2026)" },
            { icon: "🌐", label: "Access", value: "Open Access — Free for readers & authors" },
            { icon: "🔍", label: "Review Process", value: "Double-Blind Peer Review" },
            { icon: "🗣", label: "Languages", value: "Hindi & English" },
            { icon: "📋", label: "ISSN", value: "3048-5029" },
          ].map(d => (
            <div key={d.label} className="bg-white rounded-xl border border-gray-200 p-5 flex items-start gap-3">
              <span className="text-2xl shrink-0">{d.icon}</span>
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-0.5">{d.label}</p>
                <p className="text-sm font-semibold text-gray-900">{d.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Thematic Areas */}
        <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
          <h2 className="text-xl font-extrabold text-gray-900 mb-5">Thematic Areas</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              "Mass Communication & Media Studies",
              "Journalism & News Media",
              "Digital Media & New Technologies",
              "Film & Cinema Studies",
              "Political Communication",
              "Folk & Cultural Communication",
              "Media Law & Policy",
              "Media Education & Research Methods",
              "Gender, Identity & Representation",
              "Development Communication",
              "OTT Platforms & Streaming Media",
              "AI & Media",
            ].map(area => (
              <div key={area} className="flex items-center gap-2 text-sm text-gray-700">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                {area}
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-500 mt-4 italic">Submissions on other relevant topics in media studies and humanities are also welcome.</p>
        </div>

        {/* Submission Requirements */}
        <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
          <h2 className="text-xl font-extrabold text-gray-900 mb-5">Submission Requirements</h2>
          <div className="space-y-4">
            {[
              { title: "Article Types", desc: "Original Research Articles (4,000–8,000 words), Review Articles (3,000–5,000 words), Conceptual/Theoretical Papers (3,000–6,000 words)" },
              { title: "Abstract", desc: "200–300 words with 5–8 keywords" },
              { title: "Formatting", desc: "Times New Roman 12pt, double spacing, 1-inch margins, APA 7th edition citations" },
              { title: "File Format", desc: "PDF or Microsoft Word (.doc/.docx)" },
              { title: "Blind Review", desc: "Do not include author names or institutional affiliations in the manuscript" },
              { title: "Originality", desc: "Manuscripts must be original and not under review elsewhere. Similarity index must be below 20%" },
            ].map(r => (
              <div key={r.title} className="flex gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 shrink-0" />
                <p className="text-sm text-gray-600"><strong className="text-gray-900">{r.title}:</strong> {r.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-5">
            <Link href="/guidelines" className="text-sm text-indigo-700 font-semibold hover:underline">
              Read full submission guidelines →
            </Link>
          </div>
        </div>

        {/* How to Submit */}
        <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-8">
          <h2 className="text-xl font-extrabold text-gray-900 mb-4">How to Submit</h2>
          <div className="space-y-3 mb-6">
            {[
              "Register as an author at mediascholar.in/register",
              "Log in to your author dashboard",
              "Click \"Submit New Paper\" and fill in the details",
              "Upload your manuscript (PDF or Word)",
              "Submit — you'll receive a confirmation email",
            ].map((step, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-indigo-700 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                <p className="text-sm text-gray-700">{step}</p>
              </div>
            ))}
          </div>
          <div className="flex gap-3 flex-wrap">
            <Link href="/register" className="px-6 py-2.5 bg-indigo-700 text-white font-bold rounded-xl hover:bg-indigo-800 transition-colors text-sm">
              Register & Submit
            </Link>
            <a href="mailto:editor@mediascholar.in" className="px-6 py-2.5 border-2 border-indigo-700 text-indigo-700 font-bold rounded-xl hover:bg-indigo-700 hover:text-white transition-colors text-sm">
              Email Us
            </a>
          </div>
        </div>

        {/* Important Note */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 text-sm text-amber-800">
          <strong>Important:</strong> The submission deadline is <strong>30 April 2026</strong>. Papers submitted after this date will be considered for the next issue. For queries, contact <a href="mailto:editor@mediascholar.in" className="underline font-semibold">editor@mediascholar.in</a>.
        </div>

      </main>

      <footer style={{ backgroundColor: "#1a2744" }} className="text-white text-center py-6 text-sm mt-8">
        <p>© {new Date().getFullYear()} Media Scholar — Journal of Media Studies and Humanities. ISSN: 3048-5029</p>
      </footer>
    </div>
  );
}
