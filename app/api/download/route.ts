import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { prisma } from "@/lib/prisma";

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

  // Get the submission
  const submission = await prisma.submission.findUnique({
    where: { id: submissionId },
    select: { fileUrl: true, title: true, status: true },
  });

  if (!submission?.fileUrl) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  const fileUrl = submission.fileUrl;

  // For Cloudinary URLs, proxy the file through our server to avoid ACL issues
  if (fileUrl.includes("cloudinary.com")) {
    try {
      // Extract public_id from URL
      // URL format: https://res.cloudinary.com/<cloud>/raw/upload/v<version>/<public_id>
      const urlObj = new URL(fileUrl);
      const pathParts = urlObj.pathname.split("/");
      // Find the index after 'upload' (skip version token like v1234567890)
      const uploadIdx = pathParts.indexOf("upload");
      let publicIdParts = pathParts.slice(uploadIdx + 1);
      // Remove version token if present (starts with 'v' followed by digits)
      if (publicIdParts[0] && /^v\d+$/.test(publicIdParts[0])) {
        publicIdParts = publicIdParts.slice(1);
      }
      const publicId = publicIdParts.join("/");

      // Generate a short-lived signed download URL (1 hour)
      const signedUrl = cloudinary.url(publicId, {
        resource_type: "raw",
        type: "upload",
        sign_url: true,
        expires_at: Math.floor(Date.now() / 1000) + 3600,
      });

      // Proxy: fetch from Cloudinary server-side and stream to client
      const upstream = await fetch(signedUrl);
      if (!upstream.ok) {
        // fallback: try direct redirect anyway
        return NextResponse.redirect(fileUrl);
      }
      const contentType = upstream.headers.get("content-type") || "application/octet-stream";
      const filename = publicId.split("/").pop() || "document.pdf";
      const body = upstream.body;
      return new NextResponse(body as any, {
        status: 200,
        headers: {
          "Content-Type": contentType,
          "Content-Disposition": `attachment; filename="${filename}"`,
          "Cache-Control": "no-store",
        },
      });
    } catch (e) {
      console.error("Cloudinary proxy error:", e);
      // fallback to direct redirect
      return NextResponse.redirect(fileUrl);
    }
  }

  // For non-Cloudinary URLs (relative /uploads/ or external), redirect directly
  if (fileUrl.startsWith("/")) {
    return NextResponse.redirect(`https://mediascholar.in${fileUrl}`);
  }
  return NextResponse.redirect(fileUrl);
}
