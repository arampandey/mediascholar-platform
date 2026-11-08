import { prisma } from "@/lib/prisma";

// Citation counts per paper.
//  - "manual": entered by the editor (e.g. read from Google Scholar, which has no public API)
//  - "auto":   looked up from OpenAlex using the paper's DOI (Zenodo DOI)
// Manual counts live in their OWN table, created on first use, so the Submission table is never altered.

let ready: Promise<void> | null = null;

export function ensureCitationTable(): Promise<void> {
  if (!ready) {
    ready = prisma
      .$executeRawUnsafe(
        `CREATE TABLE IF NOT EXISTS "PaperCitation" (
          "submissionId" TEXT PRIMARY KEY,
          "count" INTEGER NOT NULL DEFAULT 0,
          "source" TEXT,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
        )`
      )
      .then(() => undefined)
      .catch((e) => {
        ready = null;
        console.error("[citations] could not ensure table:", e);
      });
  }
  return ready;
}

export async function getManualCounts(): Promise<Map<string, number>> {
  const out = new Map<string, number>();
  try {
    await ensureCitationTable();
    const rows = (await prisma.$queryRawUnsafe(`SELECT "submissionId", "count" FROM "PaperCitation"`)) as { submissionId: string; count: number }[];
    for (const r of rows) out.set(r.submissionId, Number(r.count));
  } catch (e) {
    console.error("[citations] read failed:", e);
  }
  return out;
}

export async function getManualCount(submissionId: string): Promise<number | null> {
  try {
    await ensureCitationTable();
    const rows = (await prisma.$queryRawUnsafe(`SELECT "count" FROM "PaperCitation" WHERE "submissionId" = $1`, submissionId)) as { count: number }[];
    return rows.length ? Number(rows[0].count) : null;
  } catch (e) {
    console.error("[citations] read failed:", e);
    return null;
  }
}

export async function setManualCount(submissionId: string, count: number, source = "Google Scholar"): Promise<void> {
  await ensureCitationTable();
  await prisma.$executeRawUnsafe(
    `INSERT INTO "PaperCitation" ("submissionId", "count", "source", "updatedAt") VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
     ON CONFLICT ("submissionId") DO UPDATE SET "count" = EXCLUDED."count", "source" = EXCLUDED."source", "updatedAt" = CURRENT_TIMESTAMP`,
    submissionId, count, source
  );
}

/** Citation count for a DOI from OpenAlex (free). Returns null if the DOI is unknown or the service is unreachable. */
export async function openAlexCount(doi: string | null | undefined): Promise<number | null> {
  if (!doi) return null;
  try {
    const res = await fetch(
      `https://api.openalex.org/works/doi:${encodeURIComponent(doi)}?select=cited_by_count&mailto=editor@mediascholar.in`,
      { signal: AbortSignal.timeout(5000), next: { revalidate: 86400 } } as RequestInit
    );
    if (!res.ok) return null;
    const data = await res.json();
    return typeof data.cited_by_count === "number" ? data.cited_by_count : null;
  } catch {
    return null;
  }
}

/** Best known count: the higher of the manual and automatic numbers. */
export async function bestCount(submissionId: string, doi: string | null | undefined): Promise<{ count: number; source: string } | null> {
  const manual = await getManualCount(submissionId);
  const auto = await openAlexCount(doi);
  if (manual === null && auto === null) return null;
  if ((manual ?? -1) >= (auto ?? -1)) return { count: manual as number, source: "Google Scholar (editor entry)" };
  return { count: auto as number, source: "OpenAlex" };
}
