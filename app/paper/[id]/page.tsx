export const dynamic = "force-dynamic";

import Navbar from "@/components/Navbar";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import PaperClient from "./PaperClient";

async function getPaper(id: string) {
  try {
    return await prisma.submission.findUnique({
      where: { id, status: "PUBLISHED" },
      include: {
        author: { select: { id: true, name: true, institution: true, email: true } },
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

  const highwire: Record<string, string> = {
    citation_title: paper.title,
    citation_author: paper.author?.name || "",
    citation_journal_title: "Media Scholar — Journal of Media Studies and Humanities",
    citation_issn: "3048-5029",
    citation_publication_date: pubDate,
    ...(vol ? { citation_volume: String(vol.number) } : {}),
    ...(iss ? { citation_issue: String(iss.number) } : {}),
    ...(paper.doi ? { citation_doi: paper.doi } : {}),
    ...(paper.fileUrl ? { citation_pdf_url: paper.fileUrl.startsWith("http") ? paper.fileUrl : `https://mediascholar.in${paper.fileUrl}` } : {}),
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

  // JSON-LD ScholarlyArticle schema for Google
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ScholarlyArticle",
    "headline": paper.title,
    "name": paper.title,
    "abstract": paper.abstract || "",
    "keywords": paper.keywords?.join(", ") || "",
    "author": {
      "@type": "Person",
      "name": paper.author?.name || "Unknown Author",
      ...(paper.author?.institution ? { "affiliation": { "@type": "Organization", "name": paper.author.institution } } : {}),
    },
    "publisher": {
      "@type": "Organization",
      "name": "Media Scholar — Journal of Media Studies and Humanities",
      "url": "https://mediascholar.in",
    },
    "isPartOf": {
      "@type": "Periodical",
      "name": "Media Scholar — Journal of Media Studies and Humanities",
      "issn": "3048-5029",
      ...(vol ? { "volumeNumber": String(vol.number) } : {}),
      ...(iss ? { "issueNumber": String(iss.number) } : {}),
    },
    ...(paper.publishedAt ? { "datePublished": new Date(paper.publishedAt).toISOString().split("T")[0] } : {}),
    ...(paper.doi ? { "identifier": { "@type": "PropertyValue", "propertyID": "DOI", "value": paper.doi } } : {}),
    ...(paper.fileUrl ? { "url": paper.fileUrl.startsWith("http") ? paper.fileUrl : `https://mediascholar.in${paper.fileUrl}` } : {}),
    "inLanguage": paper.language === "hi" ? "hi" : "en",
    "license": "https://creativecommons.org/licenses/by/4.0/",
    "isAccessibleForFree": true,
  };

  // Citation strings
  const authorName = paper.author?.name || "Unknown Author";
  const year = vol?.year || new Date(paper.publishedAt || Date.now()).getFullYear();
  const journalShort = "Media Scholar";
  const volIss = `${vol ? `Vol. ${vol.number}` : ""}${iss ? `, Issue ${iss.number}` : ""}`;
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
    citations,
    pageUrl,
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      {/* JSON-LD ScholarlyArticle Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <PaperClient paper={paperData} />

      <footer style={{ backgroundColor: "#1a2744" }} className="text-white text-center py-6 text-sm mt-8">
        <p>© {new Date().getFullYear()} Media Scholar — Journal of Media Studies and Humanities. ISSN: 3048-5029</p>
      </footer>
    </div>
  );
}
