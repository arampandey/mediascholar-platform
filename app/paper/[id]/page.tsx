export const dynamic = "force-dynamic";
export const revalidate = 0;

import Navbar from "@/components/Navbar";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import Link from "next/link";
import type { Metadata } from "next";
import PaperClient from "./PaperClient";
import { getApprovedEnglishVersion } from "@/lib/englishVersion";
import { bestCount } from "@/lib/citations";

// Co-authors are typed one per line, usually as "Name, Institution". Google Scholar wants the
// name only (no affiliation or degree), one tag per author.
function parseCoAuthor(raw: string): { name: string; affiliation?: string } {
  const [name, ...rest] = raw.split(",");
  const affiliation = rest.join(",").trim();
  return { name: name.trim(), ...(affiliation ? { affiliation } : {}) };
}

async function getPaper(id: string) {
  try {
    return await prisma.submission.findUnique({
      where: { id, status: "PUBLISHED" },
      include: {
        author: { select: { id: true, name: true, institution: true, email: true } },
        issue: { include: { volume: true } },
      },
      // coAuthors is a scalar field — included automatically
      // zenodoUrl is a scalar field — included automatically
    });
  } catch { return null; }
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const paper = await getPaper(id);
  if (!paper) return { title: "Paper Not Found" };

  const vol = paper.issue?.volume;
  const iss = paper.issue;
  // Google Scholar date format: yyyy/mm/dd (or a year alone)
  const pubDate = paper.publishedAt
    ? new Date(paper.publishedAt).toISOString().split("T")[0].replace(/-/g, "/")
    : vol?.year?.toString() || "";

  // One citation_author tag per author, main author first
  const authorNames = [
    paper.author?.name,
    ...((paper.coAuthors as string[]) || []).map(c => parseCoAuthor(c).name),
  ].filter((n): n is string => !!n && n.trim().length > 0);

  const highwire: Record<string, string | string[]> = {
    citation_title: paper.title,
    citation_author: authorNames.length ? authorNames : "Unknown Author",
    citation_journal_title: "Media Scholar — Journal of Media Studies and Humanities",
    citation_issn: "3048-5029",
    citation_publication_date: pubDate,
    ...(paper.publishedAt ? { citation_online_date: pubDate } : {}),
    ...(paper.keywords?.length ? { citation_keywords: paper.keywords.join("; ") } : {}),
    citation_abstract_html_url: `https://mediascholar.in/paper/${paper.id}`,
    ...(vol ? { citation_volume: String(vol.number) } : {}),
    ...(iss ? { citation_issue: String(iss.number) } : {}),
    ...(paper.pageStart ? { citation_firstpage: String(paper.pageStart) } : {}),
    ...(paper.pageEnd ? { citation_lastpage: String(paper.pageEnd) } : {}),
    ...(paper.doi ? { citation_doi: paper.doi } : {}),
    ...(paper.fileUrl ? { citation_pdf_url: `https://mediascholar.in/paper/${paper.id}.pdf` } : {}),
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
    alternates: { canonical: `https://mediascholar.in/paper/${paper.id}` },
    other: highwire,
  };
}

export default async function PaperPage({ params }: { params: Promise<{ id: string }> }) {
  // Force Vercel edge to never cache individual paper pages
  headers();
  const { id } = await params;
  const paper = await getPaper(id);
  if (!paper) notFound();

  // Fire-and-forget view count increment
  void prisma.submission.update({ where: { id }, data: { viewCount: { increment: 1 } } }).catch(() => {});

  const vol = paper.issue?.volume;
  const iss = paper.issue;
  const english = paper.language === "hi" ? await getApprovedEnglishVersion(id) : null;
  // Citation count (editor entry or OpenAlex); never blocks the page if unavailable
  const citedBy = await bestCount(id, paper.doi || paper.zenodoDoi || (paper.zenodoRecordId ? `10.5281/zenodo.${paper.zenodoRecordId}` : null)).catch(() => null);

  // JSON-LD ScholarlyArticle schema for Google
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ScholarlyArticle",
    "headline": paper.title,
    "name": paper.title,
    ...(english ? { "alternateName": english.titleEn } : {}),
    "abstract": paper.abstract || "",
    "keywords": paper.keywords?.join(", ") || "",
    "author": [
      {
        "@type": "Person",
        "name": paper.author?.name || "Unknown Author",
        ...(paper.author?.institution ? { "affiliation": { "@type": "Organization", "name": paper.author.institution } } : {}),
      },
      ...((paper.coAuthors as string[]) || []).map(parseCoAuthor).filter(c => c.name).map(c => ({
        "@type": "Person",
        "name": c.name,
        ...(c.affiliation ? { "affiliation": { "@type": "Organization", "name": c.affiliation } } : {}),
      })),
    ],
    "publisher": {
      "@type": "Organization",
      "name": "Media Scholar — Journal of Media Studies and Humanities",
      "url": "https://mediascholar.in",
    },
    ...(paper.pageStart ? { "pageStart": String(paper.pageStart) } : {}),
    ...(paper.pageEnd ? { "pageEnd": String(paper.pageEnd) } : {}),
    "isPartOf": {
      "@type": "Periodical",
      "name": "Media Scholar — Journal of Media Studies and Humanities",
      "issn": "3048-5029",
      ...(vol ? { "volumeNumber": String(vol.number) } : {}),
      ...(iss ? { "issueNumber": String(iss.number) } : {}),
    },
    ...(paper.publishedAt ? { "datePublished": new Date(paper.publishedAt).toISOString().split("T")[0] } : {}),
    ...(paper.doi ? { "identifier": { "@type": "PropertyValue", "propertyID": "DOI", "value": paper.doi } } : {}),
    ...(paper.fileUrl ? { "url": `https://mediascholar.in/pdfs/${paper.id}.pdf` } : {}),
    "inLanguage": paper.language === "hi" ? "hi" : "en",
    "license": "https://creativecommons.org/licenses/by/4.0/",
    "isAccessibleForFree": true,
  };

  // Citation strings
  const authorName = paper.author?.name || "Unknown Author";
  const year = vol?.year || (paper.publishedAt ? new Date(paper.publishedAt) : paper.createdAt).getFullYear();
  const journalShort = "Media Scholar";
  const pageRange = paper.pageStart && paper.pageEnd
    ? (paper.pageStart === paper.pageEnd ? `p. ${paper.pageStart}` : `pp. ${paper.pageStart}–${paper.pageEnd}`)
    : "";
  const volIss = `${vol ? `Vol. ${vol.number}` : ""}${iss ? `, Issue ${iss.number}` : ""}${pageRange ? `, ${pageRange}` : ""}`;
  const issn = "ISSN: 3048-5029";
  const pageUrl = `https://mediascholar.in/paper/${paper.id}`;

  const citations = {
    apa: `${authorName} (${year}). ${paper.title}. *Media Scholar — Journal of Media Studies and Humanities*, ${volIss}. ${issn}.`,
    mla: `${authorName}. "${paper.title}." *Media Scholar — Journal of Media Studies and Humanities*, ${volIss}, ${year}. ${issn}.`,
    chicago: `${authorName}. "${paper.title}." *Media Scholar — Journal of Media Studies and Humanities* ${volIss} (${year}). ${issn}.`,
  };

  const paperData = {
    id: paper.id,
    title: paper.title,
    abstract: paper.abstract,
    keywords: paper.keywords,
    doi: paper.doi,
    fileUrl: paper.fileUrl,
    language: paper.language,
    publishedAt: paper.publishedAt?.toISOString() || null,
    author: paper.author,
    vol: vol ? { number: vol.number, year: vol.year } : null,
    iss: iss ? { number: iss.number, title: iss.title } : null,
    pageStart: paper.pageStart ?? null,
    pageEnd: paper.pageEnd ?? null,
    citations,
    pageUrl,
    zenodoUrl: paper.zenodoUrl || null,
    zenodoDoi: paper.zenodoDoi || null,
    // Best-effort file type from URL extension (actual detection happens in /pdfs/ route)
    fileType: ((paper.fileUrl || "").toLowerCase().endsWith(".docx") ? "docx"
            : (paper.fileUrl || "").toLowerCase().endsWith(".doc")  ? "doc"
            : "pdf") as "pdf" | "doc" | "docx",
    coAuthors: (paper.coAuthors as string[]) || [],
    titleEn: english?.titleEn ?? null,
    citedBy: citedBy && citedBy.count > 0 ? citedBy : null,
    abstractEn: english?.abstractEn ?? null,
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      {/* JSON-LD ScholarlyArticle Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />

      <PaperClient paper={paperData} />

      <footer style={{ backgroundColor: "#1a2744" }} className="text-white text-center py-6 text-sm mt-8">
        <p>© {new Date().getFullYear()} Media Scholar — Journal of Media Studies and Humanities. ISSN: 3048-5029</p>
      </footer>
    </div>
  );
}
