/**
 * Citation counts for all published papers.
 *  - manual: entered by the editor (Google Scholar has no public API)
 *  - auto: OpenAlex lookup through the paper's Zenodo/other DOI
 * The count shown is the higher of the two.
 */
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getManualCounts, openAlexCount, setManualCount } from "@/lib/citations";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();
  if (!session || !["EDITOR", "SUB_EDITOR"].includes((session.user as any).role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const papers = await prisma.submission.findMany({
    where: { status: "PUBLISHED" },
    select: { id: true, title: true, doi: true, zenodoDoi: true, zenodoRecordId: true },
    orderBy: { publishedAt: "desc" },
  });
  const manual = await getManualCounts();

  const rows: { id: string; title: string; manual: number | null; auto: number | null; citationCount: number; hasDoi: boolean }[] = [];
  const batchSize = 5;
  for (let i = 0; i < papers.length; i += batchSize) {
    const batch = papers.slice(i, i + batchSize);
    const autos = await Promise.all(batch.map((p) => openAlexCount(p.doi || p.zenodoDoi || (p.zenodoRecordId ? `10.5281/zenodo.${p.zenodoRecordId}` : null))));
    batch.forEach((p, j) => {
      const m = manual.has(p.id) ? (manual.get(p.id) as number) : null;
      const a = autos[j];
      rows.push({ id: p.id, title: p.title, manual: m, auto: a, citationCount: Math.max(m ?? 0, a ?? 0), hasDoi: !!(p.doi || p.zenodoDoi || p.zenodoRecordId) });
    });
    if (i + batchSize < papers.length) await new Promise((r) => setTimeout(r, 200));
  }

  const totalCitations = rows.reduce((sum, r) => sum + r.citationCount, 0);
  const topCited = [...rows].sort((a, b) => b.citationCount - a.citationCount);
  return NextResponse.json({ totalCitations, topCited, total: papers.length });
}

// Save a manual citation count for one paper
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || !["EDITOR", "SUB_EDITOR"].includes((session.user as any).role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { id, count } = await req.json().catch(() => ({}));
  const n = Number(count);
  if (!id || typeof id !== "string" || !Number.isInteger(n) || n < 0 || n > 100000) {
    return NextResponse.json({ error: "Enter a whole number, 0 or more." }, { status: 400 });
  }
  const exists = await prisma.submission.findUnique({ where: { id }, select: { id: true } });
  if (!exists) return NextResponse.json({ error: "Paper not found." }, { status: 404 });
  await setManualCount(id, n);
  return NextResponse.json({ success: true });
}
