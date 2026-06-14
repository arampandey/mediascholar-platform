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
    // Generate a signed delivery URL using the SDK — signed URLs bypass CDN
    // delivery restrictions on free plans (no Basic auth hack needed).
    const signedUrl = cloudinary.url(publicId, {
      resource_type: "raw",
      type: "upload",
      sign_url: true,
      secure: true,
    });

    const response = await fetch(signedUrl);

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
