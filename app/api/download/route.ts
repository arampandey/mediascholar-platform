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

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const submissionId = searchParams.get("id");

  if (!submissionId) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  const submission = await prisma.submission.findUnique({
    where: { id: submissionId },
    select: { fileUrl: true, title: true },
  });

  if (!submission?.fileUrl) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  // Fire-and-forget download count increment
  void prisma.submission.update({ where: { id: submissionId }, data: { downloadCount: { increment: 1 } } }).catch(() => {});

  let fileUrl = submission.fileUrl;
  if (fileUrl.startsWith("/")) {
    fileUrl = `https://mediascholar.in${fileUrl}`;
  }

  try {
    // For Cloudinary raw files the free plan blocks unauthenticated CDN delivery.
    // Use the Cloudinary SDK to generate a signed URL — signed URLs bypass CDN
    // delivery restrictions regardless of plan, because they carry a cryptographic
    // signature verified by Cloudinary's origin servers.
    if (fileUrl.includes("cloudinary.com")) {
      // Extract public_id from URL: …/raw/upload/(v\d+/)?{public_id}
      const publicIdMatch = fileUrl.match(/\/raw\/upload\/(?:v\d+\/)?(.+)$/);
      const publicId = publicIdMatch?.[1];
      if (publicId) {
        fileUrl = cloudinary.url(publicId, {
          resource_type: "raw",
          type: "upload",
          sign_url: true,
          secure: true,
        });
      }
    }

    const upstream = await fetch(fileUrl, {
      headers: { Accept: "application/pdf, application/octet-stream, */*" },
    });

    if (!upstream.ok) {
      console.error(`[download] upstream ${upstream.status} for ${fileUrl}`);
      return NextResponse.json(
        { error: `Upstream error: ${upstream.status}` },
        { status: 502 }
      );
    }

    const body = await upstream.arrayBuffer();

    // Safe filename derived from title or URL
    const slug = (submission.title || submissionId)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .slice(0, 80);

    return new NextResponse(body, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${slug}.pdf"`,
        // public so Google Scholar / Googlebot can access and cache
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=3600",
        "X-Robots-Tag": "index",
      },
    });
  } catch (err) {
    console.error("[download] fetch error:", err);
    return NextResponse.json({ error: "Failed to fetch file" }, { status: 502 });
  }
}
