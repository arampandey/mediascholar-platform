import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

const JOURNAL_NAME = "Media Scholar — Journal of Media Studies and Humanities";
const ISSN = "ISSN: 3048-5029";

export interface StampOptions {
  volume: number;
  year: number;
  issueNumber: number;
  pageStart: number;
  paperUrl: string;
}

/**
 * Stamp a consistent header (Journal name + ISSN, centered) and footer
 * (page number left, URL right) on every page of a PDF, using the same
 * font/size/spacing for every paper so the letterhead looks identical
 * across the whole issue regardless of how the author formatted their
 * manuscript.
 *
 * Does not alter the original manuscript content — only adds a thin
 * margin band at the very top and bottom of each page.
 */
export async function stampPdf(pdfBytes: Buffer, opts: StampOptions): Promise<Buffer> {
  const doc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);

  const pages = doc.getPages();
  const headerFontSize = 8;
  const footerFontSize = 8;
  const textColor = rgb(0.15, 0.16, 0.27); // matches site's #1a2744 navy

  pages.forEach((page, idx) => {
    const { width, height } = page.getSize();
    const pageNum = opts.pageStart + idx;

    // ── Header: Journal name + ISSN, centered ──
    const headerLine = `${JOURNAL_NAME}  ·  ${ISSN}`;
    const headerWidth = fontBold.widthOfTextAtSize(headerLine, headerFontSize);
    page.drawText(headerLine, {
      x: (width - headerWidth) / 2,
      y: height - 24,
      size: headerFontSize,
      font: fontBold,
      color: textColor,
    });
    // Thin rule under header
    page.drawLine({
      start: { x: 40, y: height - 30 },
      end: { x: width - 40, y: height - 30 },
      thickness: 0.5,
      color: rgb(0.7, 0.7, 0.75),
    });

    // ── Footer: page number (left) + URL (right) ──
    const pageLabel = `Vol. ${opts.volume} (${opts.year}), Issue ${opts.issueNumber}  ·  p. ${pageNum}`;
    page.drawLine({
      start: { x: 40, y: 32 },
      end: { x: width - 40, y: 32 },
      thickness: 0.5,
      color: rgb(0.7, 0.7, 0.75),
    });
    page.drawText(pageLabel, {
      x: 40,
      y: 20,
      size: footerFontSize,
      font,
      color: textColor,
    });
    const urlWidth = font.widthOfTextAtSize(opts.paperUrl, footerFontSize);
    page.drawText(opts.paperUrl, {
      x: width - 40 - urlWidth,
      y: 20,
      size: footerFontSize,
      font,
      color: textColor,
    });
  });

  const stampedBytes = await doc.save();
  return Buffer.from(stampedBytes);
}
