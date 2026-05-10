/**
 * Fetches citation counts for published papers from Semantic Scholar (free, no API key).
 * Called by the analytics dashboard. Returns top papers with citationCount.
 */
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

async function fetchCitationCount(title: string, doi?: string | null): Promise<number> {
  try {
    // Prefer DOI lookup (more accurate)
    if (doi) {
      const res = await fetch(
        `https://api.semanticscholar.org/graph/v1/paper/DOI:${encodeURIComponent(doi)}?fields=citationCount`,
        { headers: { "User-Agent": "MediaScholar/1.0 (mediascholarjournal@gmail.com)" }, signal: AbortSignal.timeout(5000) }
      );
      if (res.ok) {
        const data = await res.json();
        if (typeof data.citationCount === "number") return data.citationCount;
      }
    }

    // Fallback: title search
    const res = await fetch(
      `https://api.semanticscholar.org/graph/v1/paper/search?query=${encodeURIComponent(title)}&fields=title,citationCount&limit=1`,
      { headers: { "User-Agent": "MediaScholar/1.0 (mediascholarjournal@gmail.com)" }, signal: AbortSignal.timeout(5000) }
    );
    if (!res.ok) return 0;
    const data = await res.json();
    const match = data.data?.[0];
    if (!match) return 0;

    // Basic title similarity check to avoid wrong paper
    const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (normalize(match.title || "").includes(normalize(title).slice(0, 20))) {
      return match.citationCount ?? 0;
    }
    return 0;
  } catch {
    return 0;
  }
}

export async function GET() {
  const session = await auth();
  if (!session || !["EDITOR", "SUB_EDITOR"].includes((session.user as any).role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Fetch all published papers
  const papers = await prisma.submission.findMany({
    where: { status: "PUBLISHED" },
    select: { id: true, title: true, doi: true },
    orderBy: { publishedAt: "desc" },
  });

  // Fetch citations in parallel (batch of 5 at a time to respect rate limits)
  const results: { id: string; title: string; citationCount: number }[] = [];
  const batchSize = 5;
  for (let i = 0; i < papers.length; i += batchSize) {
    const batch = papers.slice(i, i + batchSize);
    const counts = await Promise.all(
      batch.map((p) => fetchCitationCount(p.title, p.doi))
    );
    batch.forEach((p, j) => results.push({ id: p.id, title: p.title, citationCount: counts[j] }));
    // Small delay between batches to be polite to the API
    if (i + batchSize < papers.length) await new Promise((r) => setTimeout(r, 300));
  }

  const totalCitations = results.reduce((sum, r) => sum + r.citationCount, 0);
  const topCited = [...results].sort((a, b) => b.citationCount - a.citationCount).slice(0, 10);

  return NextResponse.json({ totalCitations, topCited, total: papers.length });
}
