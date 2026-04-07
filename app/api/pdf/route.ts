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
    // Generate signed download URL valid for 2 hours
    const signedUrl = cloudinary.utils.private_download_url(publicId, "", {
      resource_type: "raw",
      expires_at: Math.floor(Date.now() / 1000) + 7200,
      attachment: true,
    });

    return NextResponse.redirect(signedUrl, { status: 302 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
