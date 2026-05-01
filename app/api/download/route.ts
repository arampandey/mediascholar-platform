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

  // For Cloudinary URLs, proxy through admin API to bypass CDN delivery restrictions
  if (fileUrl.includes("cloudinary.com")) {
    try {
      // Extract public_id from URL
      // Format: https://res.cloudinary.com/<cloud>/raw/upload/v<version>/<public_id>
      const urlObj = new URL(fileUrl);
      const pathParts = urlObj.pathname.split("/");
      const uploadIdx = pathParts.indexOf("upload");
      let publicIdParts = pathParts.slice(uploadIdx + 1);
      if (publicIdParts[0] && /^v\d+$/.test(publicIdParts[0])) {
        publicIdParts = publicIdParts.slice(1);
      }
      const publicId = decodeURIComponent(publicIdParts.join("/"));
      const filename = publicId.split("/").pop() || "document.pdf";

      // Use Cloudinary Admin API archive download — bypasses CDN delivery restrictions
      const adminDownloadUrl = cloudinary.utils.download_archive_url({
        public_ids: [publicId],
        resource_type: "raw",
        target_format: "zip",
      } as any);

      const zipRes = await fetch(adminDownloadUrl);
      if (!zipRes.ok) {
        console.error("Cloudinary admin download failed:", zipRes.status);
        return NextResponse.json({ error: "File download failed" }, { status: 502 });
      }

      // Unzip in-memory and extract the PDF/DOCX
      const zipBuffer = Buffer.from(await zipRes.arrayBuffer());

      // Parse zip manually (central directory) — find the single file entry
      // Simple approach: find PK\x03\x04 local file header and extract content
      const localSig = Buffer.from([0x50, 0x4b, 0x03, 0x04]);
      const sigIdx = zipBuffer.indexOf(localSig);
      if (sigIdx === -1) throw new Error("Invalid zip");

      // Local file header: offset 26 = filename length, offset 28 = extra length
      const fnLen = zipBuffer.readUInt16LE(sigIdx + 26);
      const extraLen = zipBuffer.readUInt16LE(sigIdx + 28);
      const dataStart = sigIdx + 30 + fnLen + extraLen;

      // Get compressed size from header (offset 18)
      const compSize = zipBuffer.readUInt32LE(sigIdx + 18);
      const compressionMethod = zipBuffer.readUInt16LE(sigIdx + 8);

      let fileData: Buffer;
      if (compressionMethod === 0) {
        // Stored (no compression)
        fileData = zipBuffer.slice(dataStart, dataStart + compSize);
      } else {
        // Deflate — use Node.js zlib
        const { inflateRawSync } = await import("zlib");
        fileData = inflateRawSync(zipBuffer.slice(dataStart, dataStart + compSize));
      }

      const isPdf = filename.toLowerCase().endsWith(".pdf") || fileData.slice(0, 4).toString() === "%PDF";
      const contentType = isPdf ? "application/pdf" : "application/octet-stream";

      return new NextResponse(fileData as any, {
        status: 200,
        headers: {
          "Content-Type": contentType,
          "Content-Disposition": `inline; filename="${filename}"`,
          "Content-Length": String(fileData.length),
          "Cache-Control": "private, max-age=3600",
        },
      });
    } catch (e) {
      console.error("Cloudinary proxy error:", e);
      return NextResponse.json({ error: "File could not be retrieved" }, { status: 502 });
    }
  }

  // For non-Cloudinary URLs (relative /uploads/ or external), redirect directly
  if (fileUrl.startsWith("/")) {
    return NextResponse.redirect(`https://mediascholar.in${fileUrl}`);
  }
  return NextResponse.redirect(fileUrl);
}
