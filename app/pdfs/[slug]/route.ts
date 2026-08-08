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
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

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

  // Fire-and-forget download count increment
  void prisma.submission.update({ where: { id: paperId }, data: { downloadCount: { increment: 1 } } }).catch(() => {});

  let fileUrl = paper.fileUrl;
  if (fileUrl.startsWith("/")) {
    fileUrl = `https://mediascholar.in${fileUrl}`;
  }

  try {
    // For Cloudinary raw files, use Admin API download endpoint (SHA1 signature)
    // to bypass free-plan CDN delivery restrictions.
    if (fileUrl.includes("cloudinary.com")) {
      const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
      const apiKey    = process.env.CLOUDINARY_API_KEY;
      const apiSecret = process.env.CLOUDINARY_API_SECRET;
      const publicIdMatch = fileUrl.match(/\/raw\/upload\/(?:v\d+\/)?(.+)$/);
      const publicId = publicIdMatch?.[1];
      if (publicId && cloudName && apiKey && apiSecret) {
        const timestamp = String(Math.floor(Date.now() / 1000));
        const paramsToSign: Record<string, string> = { public_id: publicId, timestamp, type: "upload" };
        const signature = cloudinary.utils.api_sign_request(paramsToSign, apiSecret);
        const qs = new URLSearchParams({ public_id: publicId, type: "upload", timestamp, api_key: apiKey, signature });
        fileUrl = `https://api.cloudinary.com/v1_1/${cloudName}/raw/download?${qs}`;
      }
    }

    const upstream = await fetch(fileUrl, {
      headers: { Accept: "application/pdf, application/octet-stream, */*" },
    });

    if (!upstream.ok) {
      console.error(`[pdfs] upstream ${upstream.status} for ${fileUrl}`);
      return new NextResponse("PDF unavailable", { status: 502 });
    }

    const body = await upstream.arrayBuffer();

    // Detect actual file type from magic bytes — fileUrl extension is unreliable
    const magic = new Uint8Array(body.slice(0, 4));
    const isPDF  = magic[0] === 0x25 && magic[1] === 0x50 && magic[2] === 0x44 && magic[3] === 0x46; // %PDF
    const isDOCX = magic[0] === 0x50 && magic[1] === 0x4B; // PK (ZIP-based Office format)

    const urlLower = (paper.fileUrl || "").toLowerCase();
    let contentType: string;
    let fileExt: string;
    let disposition: string;

    if (isDOCX || urlLower.endsWith(".docx")) {
      contentType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
      fileExt = "docx";
      disposition = "attachment"; // browsers can't render DOCX inline
    } else if (urlLower.endsWith(".doc")) {
      contentType = "application/msword";
      fileExt = "doc";
      disposition = "attachment";
    } else if (isPDF || urlLower.endsWith(".pdf") || !urlLower.split("/").pop()?.includes(".")) {
      contentType = "application/pdf";
      fileExt = "pdf";
      disposition = "inline";
    } else {
      contentType = "application/octet-stream";
      fileExt = "bin";
      disposition = "attachment";
    }

    const slug_clean = (paper.title || paperId)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .slice(0, 80);

    return new NextResponse(body, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `${disposition}; filename="${slug_clean}.${fileExt}"`,
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
