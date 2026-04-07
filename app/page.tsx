import Navbar from "@/components/Navbar";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

async function getStats() {
  try {
    const [submissions, reviewers, published] = await Promise.all([
      prisma.submission.count(),
      prisma.user.count({ where: { role: "REVIEWER" } }),
      prisma.submission.count({ where: { status: "PUBLISHED" } }),
    ]);
    return { submissions, reviewers, published };
  } catch { return { submissions: 0, reviewers: 0, published: 0 }; }
}

export default async function HomePage() {
  const stats = await getStats();
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      {/* Hero */}
      <div style={{ background: "linear-gradient(135deg, #1a2744 0%, #2d4a8a 100%)" }} className="py-16 px-4 text-white text-center">
        <h1 className="text-3xl sm:text-5xl font-extrabold mb-3">MediaScholar</h1>
        <p className="text-xl sm:text-2xl font-medium text-blue-200 mb-2">Journal of Media Scholars</p>
        <p className="text-sm text-blue-300 mb-6">ISSN: 3048-5029 | Bi-Annual | Open Access | Hindi & English</p>
        <div className="flex gap-3 justify-center flex-wrap">
          <Link href="/register" className="px-6 py-2.5 bg-white text-indigo-900 font-bold rounded-xl hover:bg-blue-50 transition-colors text-sm">Submit Research</Link>
          <Link href="/journal" className="px-6 py-2.5 border-2 border-white text-white font-bold rounded-xl hover:bg-white hover:text-indigo-900 transition-colors text-sm">Browse Articles</Link>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-8 grid grid-cols-3 gap-4 text-center">
          {[
            { label: "Total Submissions", value: stats.submissions, icon: "📄" },
            { label: "Expert Reviewers", value: stats.reviewers, icon: "🔍" },
            { label: "Published Articles", value: stats.published, icon: "🌐" },
          ].map(s => (
            <div key={s.label}>
              <div className="text-2xl sm:text-4xl font-extrabold text-indigo-700">{s.icon} {s.value}</div>
              <div className="text-xs sm:text-sm text-gray-500 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* About */}
      <main className="flex-1 max-w-4xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">About the Journal</h2>
        <p className="text-gray-600 leading-relaxed mb-4">
          <strong>MediaScholar — Journal of Media Scholars</strong> is an open-access, peer-reviewed bilingual journal publishing research in Hindi and English. We cover media studies, mass communication, journalism, and related fields.
        </p>
        <p className="text-gray-600 leading-relaxed mb-4">
          Established in January 2023 as a tri-annual journal, MediaScholar became bi-annual in 2024. We serve students, faculty members, and professionals by providing a rigorous platform for scholarly discourse in the global south.
        </p>
        <p className="text-gray-600 leading-relaxed mb-8">
          Our peer review process ensures high academic standards. Papers are evaluated for clarity, methodology, relevance, and originality by domain experts across India.
        </p>
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { icon: "🌐", title: "Open Access", desc: "All articles freely available to readers worldwide" },
            { icon: "🔍", title: "Peer Reviewed", desc: "Double-blind review by academic experts" },
            { icon: "🇮🇳", title: "Bilingual", desc: "Accepts research in both Hindi and English" },
          ].map(f => (
            <div key={f.title} className="bg-white rounded-xl border border-gray-200 p-5 text-center">
              <div className="text-3xl mb-2">{f.icon}</div>
              <div className="font-bold text-gray-900 mb-1">{f.title}</div>
              <div className="text-sm text-gray-500">{f.desc}</div>
            </div>
          ))}
        </div>
      </main>

      <footer style={{ backgroundColor: "#1a2744" }} className="text-white text-center py-8 px-4">
        <p className="font-bold text-lg mb-1">MediaScholar — Journal of Media Scholars</p>
        <p className="text-sm text-blue-200">ISSN: 3048-5029</p>
        <p className="text-sm text-blue-300 mt-2">Galgotias University, Greater Noida</p>
        <p className="text-sm text-blue-300">mediascholarjournal@gmail.com | +91 9911893074</p>
        <p className="text-xs text-blue-400 mt-3">© {new Date().getFullYear()} MediaScholar. All rights reserved.</p>
      </footer>
    </div>
  );
}
