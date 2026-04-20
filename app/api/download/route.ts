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

  // For Cloudinary URLs, redirect directly (files are now type=upload, publicly accessible)
  if (fileUrl.includes("cloudinary.com")) {
    return NextResponse.redirect(fileUrl);
  }

  // For non-Cloudinary URLs (relative /uploads/ or external), redirect directly
  if (fileUrl.startsWith("/")) {
    return NextResponse.redirect(`https://mediascholar.in${fileUrl}`);
  }
  return NextResponse.redirect(fileUrl);
}
