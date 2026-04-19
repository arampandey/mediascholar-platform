export const dynamic = "force-dynamic";

import Navbar from "@/components/Navbar";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";

async function getAuthor(id: string) {
  try {
    return await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        institution: true,
        submissions: {
          where: { status: "PUBLISHED" },
          orderBy: { publishedAt: "desc" },
          select: {
            id: true,
            title: true,
            abstract: true,
            keywords: true,
            language: true,
            publishedAt: true,
            doi: true,
            fileUrl: true,
            issue: { include: { volume: true } },
          },
        },
      },
    });
  } catch { return null; }
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const author = await getAuthor(params.id);
  if (!author) return { title: "Author Not Found" };
  return {
    title: `${author.name} — Author Profile | Media Scholar`,
    description: `Published research by ${author.name}${author.institution ? ` from ${author.institution}` : ""} in Media Scholar — Journal of Media Studies and Humanities.`,
  };
}

export default async function AuthorPage({ params }: { params: { id: string } }) {
  const author = await getAuthor(params.id);
  if (!author) notFound();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto px-4 py-10 w-full">

        {/* Breadcrumb */}
        <nav className="text-xs text-gray-400 mb-6 flex items-center gap-1.5">
          <Link href="/" className="hover:text-indigo-600 transition-colors">Home</Link>
          <span>/</span>
          <span className="text-gray-500">Author Profile</span>
        </nav>

        {/* Author card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-8">
          <div style={{ backgroundColor: "#1a2744" }} className="px-8 py-8 text-white">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold text-white shrink-0">
                {author.name?.charAt(0)?.toUpperCase() || "A"}
              </div>
              <div>
                <h1 className="text-2xl font-extrabold">{author.name}</h1>
                {author.institution && <p className="text-blue-200 text-sm mt-1">{author.institution}</p>}
                <p className="text-blue-300 text-xs mt-1">
                  {author.submissions.length} published article{author.submissions.length !== 1 ? "s" : ""} in Media Scholar
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Published papers */}
        <h2 className="text-lg font-bold text-gray-900 mb-4">Published Articles</h2>

        {author.submissions.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <p className="text-gray-500 text-sm">No published articles found for this author yet.</p>
          </div>
        ) : (
        <div className="space-y-4">
          {author.submissions.map((paper) => {
            const vol = paper.issue?.volume;
            const iss = paper.issue;
            return (
              <div key={paper.id} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-sm transition-shadow">
                <Link href={`/paper/${paper.id}`} className="text-lg font-bold text-indigo-800 hover:text-indigo-600 hover:underline transition-colors leading-snug block mb-1">
                  {paper.title}
                </Link>
                {vol && iss && (
                  <p className="text-xs text-indigo-600 font-medium mb-2">
                    Vol. {vol.number} ({vol.year}) · Issue {iss.number}{iss.title ? ` — ${iss.title}` : ""}
                  </p>
                )}
                {paper.abstract && (
                  <p className="text-sm text-gray-600 leading-relaxed line-clamp-3 mb-3">{paper.abstract}</p>
                )}
                <div className="flex items-center gap-3 flex-wrap">
                  {paper.keywords?.slice(0, 4).map((k: string) => (
                    <span key={k} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{k}</span>
                  ))}
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${paper.language === "hi" ? "bg-orange-100 text-orange-700" : "bg-blue-100 text-blue-700"}`}>
                    {paper.language === "hi" ? "हिंदी" : "English"}
                  </span>
                  {paper.publishedAt && (
                    <span className="text-xs text-gray-400">
                      {new Date(paper.publishedAt).toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
                    </span>
                  )}
                </div>
                <div className="mt-4 flex gap-3">
                  <Link href={`/paper/${paper.id}`} className="text-sm text-indigo-700 font-semibold hover:underline">
                    Read Article →
                  </Link>
                  {paper.fileUrl && (
                    <a href={paper.fileUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-gray-500 hover:text-indigo-600 transition-colors">
                      Download PDF
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        )}

        <div className="mt-8 text-sm">
          <Link href="/journal" className="text-indigo-600 hover:underline">← Browse All Articles</Link>
        </div>
      </main>

      <footer style={{ backgroundColor: "#1a2744" }} className="text-white text-center py-6 text-sm mt-8">
        <p>© {new Date().getFullYear()} Media Scholar — Journal of Media Studies and Humanities. ISSN: 3048-5029</p>
      </footer>
    </div>
  );
}
