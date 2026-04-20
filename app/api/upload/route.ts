import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

    const timestamp = Date.now();
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const filename = `${timestamp}-${safeName}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const fileUrl = await new Promise<string>((resolve, reject) => {
      const publicId = `mediascholar/papers/${filename.replace(/\.[^/.]+$/, "")}`;
      const uploadStream = cloudinary.uploader.upload_stream(
        { resource_type: "raw", public_id: publicId, overwrite: true },
        (error, result) => {
          if (error) return reject(error);
          resolve(result!.secure_url);
        }
      );
      uploadStream.end(buffer);
    });

    return NextResponse.json({ fileUrl });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: error.message || "Upload failed" }, { status: 500 });
  }
}
