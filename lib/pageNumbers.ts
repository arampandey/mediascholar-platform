import { PDFDocument } from "pdf-lib";
import { prisma } from "@/lib/prisma";
import { fetchFileBuffer } from "@/lib/pdfFetch";

/** Count pages in a PDF file. Returns null if the file can't be read as a PDF. */
export async function countPdfPages(fileUrl: string): Promise<number | null> {
  try {
    const buffer = await fetchFileBuffer(fileUrl);
    const doc = await PDFDocument.load(buffer, { ignoreEncryption: true });
    return doc.getPageCount();
  } catch (e) {
    console.error("[pageNumbers] failed to count pages for", fileUrl, e);
    return null;
  }
}

/**
 * Recalculate sequential page numbers (pageStart/pageEnd) for every PUBLISHED
 * paper in an issue, in publish order (oldest publishedAt first).
 *
 * Paper 1: pages 1–n, Paper 2: pages n+1–m, etc. — continuous numbering
 * across the whole issue, matching standard academic journal convention.
 *
 * Papers whose PDF page count can't be determined are left with pageStart/
 * pageEnd = null (not guessed) and do NOT advance the cursor, so every paper
 * whose length IS known still gets a correct, non-overlapping page range.
 * Guessing a fake "1 page" length here would silently corrupt the numbering
 * for every subsequent paper in the issue, which is worse than leaving one
 * paper temporarily unnumbered.
 *
 * Returns the ids of any papers whose page count could not be determined,
 * so the caller can surface a warning to the editor.
 */
export async function recalcIssuePageNumbers(issueId: string): Promise<{ failedIds: string[] }> {
  const papers = await prisma.submission.findMany({
    where: { issueId, status: "PUBLISHED" },
    orderBy: [{ publishedAt: "asc" }, { createdAt: "asc" }],
    select: { id: true, fileUrl: true, pageStart: true, pageEnd: true },
  });

  let cursor = 1;
  const failedIds: string[] = [];
  for (const paper of papers) {
    const pageCount = await countPdfPages(paper.fileUrl);
    if (pageCount == null || pageCount < 1) {
      console.error(`[pageNumbers] could not determine page count for submission ${paper.id} — leaving pageStart/pageEnd unset. Fix the file and re-run recalcIssuePageNumbers for issue ${issueId}.`);
      await prisma.submission.update({
        where: { id: paper.id },
        data: { pageStart: null, pageEnd: null },
      });
      failedIds.push(paper.id);
      continue;
    }
    const start = cursor;
    const end = cursor + pageCount - 1;
    await prisma.submission.update({
      where: { id: paper.id },
      data: { pageStart: start, pageEnd: end },
    });
    cursor = end + 1;
  }
  return { failedIds };
}
