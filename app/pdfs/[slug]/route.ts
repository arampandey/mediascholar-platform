/**
 * Clean PDF endpoint for Google Scholar citation_pdf_url.
 *
 * URL pattern: /pdfs/<paper-id>.pdf  OR  /pdfs/<paper-id>
 *
 * Returns the paper PDF directly (200, Content-Type: application/pdf).
 * No redirects, no auth, no JS. Googlebot-friendly.
 */
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  // Strip .pdf extension if present
  const paperId = slug.endsWith(".pdf") ? slug.slice(0, -4) : slug;

  const paper = await prisma.submission.findUnique({
    where: { id: paperId, status: "PUBLISHED" },
    select: { fileUrl: true, title: true },
  });

  if (!paper?.fileUrl) {
    return new NextResponse("PDF not found", { status: 404 });
  }

  let fileUrl = paper.fileUrl;
  if (fileUrl.startsWith("/")) {
    fileUrl = `https://mediascholar.in${fileUrl}`;
  }

  try {
    const upstream = await fetch(fileUrl, {
      headers: { Accept: "application/pdf, application/octet-stream, */*" },
    });

    if (!upstream.ok) {
      console.error(`[pdfs] upstream ${upstream.status} for ${fileUrl}`);
      return new NextResponse("PDF unavailable", { status: 502 });
    }

    const body = await upstream.arrayBuffer();

    const slug_clean = (paper.title || paperId)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .slice(0, 80);

    return new NextResponse(body, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${slug_clean}.pdf"`,
        // Public caching — Google Scholar and Googlebot must be able to access this
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=3600",
        "X-Robots-Tag": "index",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (err) {
    console.error("[pdfs] fetch error:", err);
    return new NextResponse("Failed to load PDF", { status: 502 });
  }
}
