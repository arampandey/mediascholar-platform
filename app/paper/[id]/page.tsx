import Navbar from "@/components/Navbar";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";

async function getPaper(id: string) {
  try {
    return await prisma.submission.findUnique({
      where: { id, status: "PUBLISHED" },
      include: {
        author: { select: { name: true, institution: true, email: true } },
        issue: { include: { volume: true } },
      },
    });
  } catch { return null; }
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const paper = await getPaper(params.id);
  if (!paper) return { title: "Paper Not Found" };

  const vol = paper.issue?.volume;
  const iss = paper.issue;
  const pubDate = paper.publishedAt
    ? new Date(paper.publishedAt).toISOString().split("T")[0]
    : vol?.year?.toString() || "";

  // Highwire Press meta tags — required for Google Scholar indexing
  const highwire: Record<string, string> = {
    citation_title: paper.title,
    citation_author: paper.author?.name || "",
    citation_journal_title: "Media Scholar — Journal of Media Studies and Humanities",
    citation_issn: "3048-5029",
    citation_publication_date: pubDate,
    ...(vol ? { citation_volume: String(vol.number) } : {}),
    ...(iss ? { citation_issue: String(iss.number) } : {}),
    ...(paper.doi ? { citation_doi: paper.doi } : {}),
    ...(paper.fileUrl ? { citation_pdf_url: paper.fileUrl } : {}),
    citation_fulltext_html_url: `https://mediascholar.in/paper/${paper.id}`,
    citation_language: paper.language === "hi" ? "hi" : "en",
    citation_publisher: "Media Scholar",
  };

  return {
    title: `${paper.title} | Media Scholar`,
    description: paper.abstract?.slice(0, 160) || "",
    keywords: paper.keywords?.join(", "),
    openGraph: {
      title: paper.title,
      description: paper.abstract?.slice(0, 200) || "",
      type: "article",
      publishedTime: paper.publishedAt?.toISOString(),
    },
    other: highwire,
  };
}

export default async function PaperPage({ params }: { params: { id: string } }) {
  const paper = await getPaper(params.id);
  if (!paper) notFound();

  const vol = paper.issue?.volume;
  const iss = paper.issue;
  const citation = `${paper.author?.name || "Unknown Author"} (${vol?.year || ""}). ${paper.title}. *Media Scholar — Journal of Media Studies and Humanities*, ${vol ? `Vol. ${vol.number}` : ""}${iss ? `, Issue ${iss.number}` : ""}. ISSN: 3048-5029.`;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto px-4 py-10 w-full">

        {/* Breadcrumb */}
        <nav className="text-xs text-gray-400 mb-6 flex items-center gap-1.5 flex-wrap">
          <Link href="/" className="hover:text-indigo-600 transition-colors">Home</Link>
          <span>/</span>
          <Link href="/archive" className="hover:text-indigo-600 transition-colors">Archive</Link>
          {vol && <><span>/</span><span className="text-gray-500">Vol. {vol.number} ({vol.year})</span></>}
          {iss && <><span>/</span><span className="text-gray-500">Issue {iss.number}</span></>}
        </nav>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">

          {/* Header */}
          <div style={{ backgroundColor: "#1a2744" }} className="px-8 py-8 text-white">
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              {vol && <span className="text-xs bg-white/20 text-white px-3 py-1 rounded-full font-medium">Vol. {vol.number} ({vol.year})</span>}
              {iss && <span className="text-xs bg-white/20 text-white px-3 py-1 rounded-full font-medium">Issue {iss.number}{iss.title ? ` — ${iss.title}` : ""}</span>}
              <span className={`text-xs px-3 py-1 rounded-full font-medium ${paper.language === "hi" ? "bg-orange-400/80 text-white" : "bg-blue-400/80 text-white"}`}>
                {paper.language === "hi" ? "हिंदी" : "English"}
              </span>
            </div>
            <h1 className="text-2xl font-extrabold leading-tight mb-4">{paper.title}</h1>
            <div className="flex items-center gap-2 text-blue-100 text-sm">
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="font-medium text-white">{paper.author?.name || "Unknown Author"}</span>
              {paper.author?.institution && <span className="text-blue-200">· {paper.author.institution}</span>}
            </div>
            {paper.publishedAt && (
              <p className="text-xs text-blue-200 mt-2">
                Published {new Date(paper.publishedAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
              </p>
            )}
          </div>

          <div className="px-8 py-8">

            {/* Top CTA — View PDF (secondary, smaller) */}
            {paper.fileUrl && (
              <div className="mb-8 p-5 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <p className="text-sm font-semibold text-indigo-900">Full Text Available</p>
                  <p className="text-xs text-indigo-600 mt-0.5">Open-access · Free to read and download</p>
                </div>
                <a
                  href={paper.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-indigo-700 font-semibold rounded-lg border border-indigo-300 hover:bg-indigo-50 transition-colors text-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  View PDF
                </a>
              </div>
            )}

            {/* Abstract */}
            {paper.abstract && (
              <section className="mb-7">
                <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Abstract</h2>
                <p className="text-gray-700 leading-relaxed text-base">{paper.abstract}</p>
              </section>
            )}

            {/* Keywords */}
            {paper.keywords?.length > 0 && (
              <section className="mb-7">
                <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Keywords</h2>
                <div className="flex flex-wrap gap-2">
                  {paper.keywords.map((k: string) => (
                    <span key={k} className="text-sm bg-gray-100 text-gray-700 px-3 py-1 rounded-full">{k}</span>
                  ))}
                </div>
              </section>
            )}

            {/* DOI */}
            {paper.doi && (
              <section className="mb-7">
                <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">DOI</h2>
                <p className="text-sm text-gray-700 font-mono">{paper.doi}</p>
              </section>
            )}

            {/* How to Cite */}
            <section className="mb-7 p-4 bg-gray-50 rounded-xl border border-gray-200">
              <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">How to Cite</h2>
              <p className="text-sm text-gray-600 italic leading-relaxed">{citation}</p>
              <button
                onClick={undefined}
                id="copy-citation"
                className="mt-2 text-xs text-indigo-600 hover:underline"
                // handled via inline script below
              >
              </button>
            </section>


            {/* Bottom Download — primary CTA after reading abstract */}
            {paper.fileUrl && (
              <div className="flex justify-center pt-4">
                <a
                  href={paper.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-8 py-3.5 bg-indigo-700 text-white font-bold rounded-xl hover:bg-indigo-800 transition-colors text-base shadow"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Download Full PDF
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Back link */}
        <div className="mt-6 flex justify-between text-sm">
          <Link href="/archive" className="text-indigo-600 hover:underline">← Back to Archive</Link>
          <Link href="/journal" className="text-indigo-600 hover:underline">Browse All Articles →</Link>
        </div>
      </main>

      <footer style={{ backgroundColor: "#1a2744" }} className="text-white text-center py-6 text-sm mt-8">
        <p>© {new Date().getFullYear()} Media Scholar — Journal of Media Studies and Humanities. ISSN: 3048-5029</p>
      </footer>
    </div>
  );
}
