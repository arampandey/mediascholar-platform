import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendSubmissionConfirmation, sendNewSubmissionEditor } from "@/lib/email";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as any).id;
  const submissions = await prisma.submission.findMany({
    where: { authorId: userId },
    orderBy: { createdAt: "desc" },
    include: { issue: { include: { volume: true } } },
  });
  return NextResponse.json({ submissions });
}

async function uploadToCloudinary(filename: string, buffer: Buffer, mimeType: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const publicId = `mediascholar/papers/${filename.replace(/\.[^/.]+$/, "")}`;
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: "raw",
        public_id: publicId,
        overwrite: true,
        use_filename: false,
        format: mimeType === "application/pdf" ? "pdf" : undefined,
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result!.secure_url);
      }
    );
    uploadStream.end(buffer);
  });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as any).id;

  try {
    const formData = await req.formData();
    const title = formData.get("title") as string;
    const abstract = formData.get("abstract") as string;
    const keywordsRaw = formData.get("keywords") as string;
    const language = formData.get("language") as string;
    const coAuthorsRaw = formData.get("coAuthors") as string;
    const file = formData.get("file") as File;

    if (!title || !abstract || !file) {
      return NextResponse.json({ error: "Title, abstract and file are required" }, { status: 400 });
    }

    const keywords = keywordsRaw ? keywordsRaw.split(",").map(k => k.trim()).filter(Boolean) : [];
    const coAuthors = coAuthorsRaw ? coAuthorsRaw.split("\n").map(c => c.trim()).filter(Boolean) : [];

    // Upload to Cloudinary
    const timestamp = Date.now();
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const filename = `${timestamp}-${safeName}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    const fileUrl = await uploadToCloudinary(filename, buffer, file.type);

    // Save submission to DB
    const submission = await prisma.submission.create({
      data: { title, abstract, keywords, language, fileUrl, coAuthors, authorId: userId },
    });

    // Send emails: confirmation to author + alert to all editors
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user) {
      await sendSubmissionConfirmation(user.email, user.name, title);

      const editors = await prisma.user.findMany({
        where: { role: { in: ["EDITOR", "SUB_EDITOR"] } },
        select: { email: true },
      });
      for (const ed of editors) {
        await sendNewSubmissionEditor(ed.email, user.name, user.email, title);
      }
    }

    return NextResponse.json({ submission });
  } catch (error: any) {
    console.error("Submission error:", error);
    return NextResponse.json({ error: error.message || "Submission failed. Please try again." }, { status: 500 });
  }
}
