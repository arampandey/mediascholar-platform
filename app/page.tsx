import Navbar from "@/components/Navbar";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

async function getLatestIssue() {
  try {
    // Get the most recently published issue
    const latestIssue = await prisma.issue.findFirst({
      where: {
        publishedAt: { not: null },
        submissions: { some: { status: "PUBLISHED" } }, // only issues that actually have published papers
      },
      orderBy: { publishedAt: "desc" },
      include: {
        volume: true,
        submissions: {
          where: { status: "PUBLISHED" },
          orderBy: { publishedAt: "desc" },
          include: { author: { select: { name: true, institution: true } } },
        },
      },
    });
    return latestIssue;
  } catch { return null; }
}

export default async function HomePage() {
  const latestIssue = await getLatestIssue();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero */}
      <div style={{ background: "linear-gradient(135deg, #1a2744 0%, #2d4a8a 100%)" }} className="py-16 px-4 text-white text-center">
        <p className="text-3xl sm:text-4xl font-extrabold text-blue-200 mb-2 tracking-wide">मीडिया स्कॉलर</p>
        <h1 className="text-4xl sm:text-6xl font-extrabold mb-2 tracking-tight">
          Media <span className="text-blue-300">Scholar</span>
        </h1>
        <p className="text-lg sm:text-xl font-medium text-blue-200 mb-2">Journal of Media Studies and Humanities</p>
        <p className="text-sm text-blue-300 mb-8">ISSN: 3048-5029 | Bi-Annual | Open Access | Hindi & English</p>
        <div className="flex gap-3 justify-center flex-wrap">
          <Link href="/register" className="px-6 py-2.5 bg-white text-indigo-900 font-bold rounded-xl hover:bg-blue-50 transition-colors text-sm">Submit Research</Link>
          <Link href="/journal" className="px-6 py-2.5 border-2 border-white text-white font-bold rounded-xl hover:bg-white hover:text-indigo-900 transition-colors text-sm">Browse All Articles</Link>
        </div>
      </div>

      <main className="flex-1 max-w-5xl mx-auto px-4 py-12 w-full space-y-12">

        {/* Latest Issue */}
        {latestIssue ? (
          <section>
            <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">Latest Issue</span>
                <h2 className="text-2xl font-extrabold text-gray-900 mt-2">
                  Volume {latestIssue.volume.number}, Issue {latestIssue.number}

                </h2>
              </div>
              <Link href="/archive" className="text-sm text-indigo-700 font-semibold hover:underline">Archive →</Link>
            </div>

            {latestIssue.submissions.length === 0 ? (
              <p className="text-gray-400 italic text-sm">No papers in this issue yet.</p>
            ) : (
              <div className="space-y-4">
                {latestIssue.submissions.map((paper) => (
                  <div key={paper.id} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-sm transition-shadow">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div className="flex-1 min-w-0">
                        <Link href={`/paper/${paper.id}`} className="text-lg font-bold text-indigo-800 hover:text-indigo-600 hover:underline transition-colors leading-snug block">{paper.title}</Link>
                        <p className="text-sm text-gray-500 mt-1">
                          {paper.author?.name}
                          {paper.author?.institution ? ` — ${paper.author.institution}` : ""}
                        </p>

                        {paper.keywords?.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-3">
                            {paper.keywords.slice(0, 5).map((k: string) => (
                              <span key={k} className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{k}</span>
                            ))}
                          </div>
                        )}
                        <div className="flex items-center gap-4 mt-3 text-xs text-gray-400 flex-wrap">
                          {paper.doi && <span>DOI: <span className="font-medium text-gray-600">{paper.doi}</span></span>}
                          {paper.publishedAt && (
                            <span>{new Date(paper.publishedAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</span>
                          )}
                          <span className={`px-2 py-0.5 rounded-full font-semibold ${paper.language === "hi" ? "bg-orange-100 text-orange-700" : "bg-blue-100 text-blue-700"}`}>
                            {paper.language === "hi" ? "हिंदी" : "English"}
                          </span>
                        </div>
                      </div>
                      <div className="shrink-0 flex flex-col items-end gap-2">
                        <Link href={`/paper/${paper.id}`} className="px-4 py-2 bg-indigo-700 text-white text-sm font-semibold rounded-lg hover:bg-indigo-800 transition-colors">Read →</Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        ) : (
          <section className="text-center py-16 bg-white rounded-xl border border-gray-200">
            <div className="text-5xl mb-4">📚</div>
            <p className="text-lg font-semibold text-gray-600">First issue coming soon</p>
            <p className="text-sm text-gray-400 mt-2">Published articles will appear here once the first issue is released.</p>
          </section>
        )}

        {/* About */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">About the Journal</h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            <strong>Media Scholar — Journal of Media Studies and Humanities</strong> is an open-access, peer-reviewed bilingual journal publishing research in Hindi and English. We cover media studies, mass communication, journalism, and related fields.
          </p>
          <p className="text-gray-600 leading-relaxed mb-6">
            Established in January 2023 as a tri-annual journal, Media Scholar became bi-annual in 2024. We serve students, faculty members, and professionals by providing a rigorous platform for scholarly discourse in the global south.
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
        </section>

      </main>

      <footer style={{ backgroundColor: "#1a2744" }} className="text-white text-center py-8 px-4">
        <p className="font-bold text-lg mb-0.5">मीडिया स्कॉलर | Media Scholar</p>
        <p className="text-sm text-blue-200 mb-1">Journal of Media Studies and Humanities</p>
        <p className="text-sm text-blue-300">ISSN: 3048-5029</p>
        <p className="text-sm text-blue-300 mt-2">editor@mediascholar.in | +91 9911893074</p>
        <p className="text-xs text-blue-400 mt-3">© {new Date().getFullYear()} Media Scholar. All rights reserved.</p>
      </footer>
    </div>
  );
}
