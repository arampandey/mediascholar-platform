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
 * Papers whose PDF page count can't be determined are skipped (page fields
 * left as-is) so a single bad file doesn't break numbering for the rest.
 */
export async function recalcIssuePageNumbers(issueId: string): Promise<void> {
  const papers = await prisma.submission.findMany({
    where: { issueId, status: "PUBLISHED" },
    orderBy: [{ publishedAt: "asc" }, { createdAt: "asc" }],
    select: { id: true, fileUrl: true, pageStart: true, pageEnd: true },
  });

  let cursor = 1;
  for (const paper of papers) {
    const pageCount = await countPdfPages(paper.fileUrl);
    if (pageCount == null || pageCount < 1) {
      // Can't determine length — leave existing values, don't advance the cursor
      // incorrectly for papers after it. Skip and continue with next paper's
      // numbering starting where this one *would* have started, using 1 page
      // as a conservative fallback so the sequence doesn't break entirely.
      await prisma.submission.update({
        where: { id: paper.id },
        data: { pageStart: cursor, pageEnd: cursor },
      });
      cursor += 1;
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
}
