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

  // For Cloudinary URLs, generate a signed URL and proxy
  if (fileUrl.includes("cloudinary.com")) {
    try {
      // Extract public_id from URL
      const match = fileUrl.match(/\/upload\/(?:v\d+\/)?(.+)$/);
      if (!match) throw new Error("Cannot parse Cloudinary URL");

      const fullPublicId = match[1]; // includes extension e.g. mediascholar/papers/xxx.pdf
      const publicIdNoExt = fullPublicId.replace(/\.[^/.]+$/, "");
      const ext = fullPublicId.split(".").pop() || "pdf";

      // Generate signed download URL (valid 1 hour)
      const signedUrl = cloudinary.utils.private_download_url(publicIdNoExt, ext, {
        resource_type: "raw",
        expires_at: Math.floor(Date.now() / 1000) + 3600,
        attachment: true,
      });

      // Fetch and proxy the file
      const response = await fetch(signedUrl);
      if (!response.ok) throw new Error(`Cloudinary returned ${response.status}`);

      const buffer = await response.arrayBuffer();
      const filename = `${submission.title.slice(0, 60).replace(/[^a-zA-Z0-9 ]/g, "").trim()}.${ext}`;
      const contentType = ext === "pdf" ? "application/pdf" : "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

      return new NextResponse(buffer, {
        headers: {
          "Content-Type": contentType,
          "Content-Disposition": `attachment; filename="${filename}"`,
          "Cache-Control": "private, max-age=3600",
        },
      });
    } catch (e: any) {
      console.error("Download error:", e);
      return NextResponse.json({ error: "File download failed" }, { status: 500 });
    }
  }

  // For non-Cloudinary URLs (relative /uploads/ or external), redirect directly
  if (fileUrl.startsWith("/")) {
    return NextResponse.redirect(`https://mediascholar.in${fileUrl}`);
  }
  return NextResponse.redirect(fileUrl);
}
