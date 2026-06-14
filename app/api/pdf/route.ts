import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const publicId = searchParams.get("id");
  if (!publicId) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  try {
    // Use Cloudinary Admin API download endpoint with SHA1 signature —
    // bypasses CDN delivery restrictions on free plans.
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey    = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;
    let downloadUrl: string;
    if (cloudName && apiKey && apiSecret) {
      const timestamp = String(Math.floor(Date.now() / 1000));
      const paramsToSign: Record<string, string> = { public_id: publicId, timestamp, type: "upload" };
      const signature = cloudinary.utils.api_sign_request(paramsToSign, apiSecret);
      const qs = new URLSearchParams({ public_id: publicId, type: "upload", timestamp, api_key: apiKey, signature });
      downloadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/raw/download?${qs}`;
    } else {
      downloadUrl = cloudinary.url(publicId, { resource_type: "raw", secure: true });
    }

    const response = await fetch(downloadUrl, { redirect: "follow" });

    if (!response.ok) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const buffer = await response.arrayBuffer();
    const filename = publicId.split("/").pop() || "paper.pdf";

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Error" }, { status: 500 });
  }
}
