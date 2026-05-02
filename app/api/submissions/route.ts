import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendSubmissionConfirmation } from "@/lib/email";
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
        access_mode: "public",
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

    // Server-side file validation
    const allowedTypes = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
    if (!allowedTypes.includes(file.type) && !file.name.match(/\.(pdf|doc|docx)$/i)) {
      return NextResponse.json({ error: "Only PDF and Word documents are allowed" }, { status: 400 });
    }
    if (file.size > 20 * 1024 * 1024) {
      return NextResponse.json({ error: "File size must not exceed 20MB" }, { status: 400 });
    }

    const keywords = keywordsRaw ? keywordsRaw.split(",").map(k => k.trim()).filter(Boolean) : [];
    const coAuthors = coAuthorsRaw ? coAuthorsRaw.split("\n").map(c => c.trim()).filter(Boolean) : [];

    // Upload to Cloudinary
    const timestamp = Date.now();
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const filename = `${timestamp}-${safeName}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    const fileUrl = await uploadToCloudinary(filename, buffer, file.type);

    // Auto-assign to the correct issue based on submission date and journal policy:
    // Jan 1 – May 3  → Issue 1 of the current year's volume
    // May 4 – Oct 31 → Issue 2 of the current year's volume
    // Nov 1 – Dec 31 → Issue 1 of the NEXT year's volume
    async function resolveIssue(): Promise<string | null> {
      const now = new Date();
      const month = now.getMonth() + 1; // 1-12
      const day = now.getDate();
      const year = now.getFullYear();

      let targetYear = year;
      let targetIssue = 1;

      if (month > 10 || (month === 10 && day > 31)) {
        // Nov 1 – Dec 31: next year Issue 1
        targetYear = year + 1;
        targetIssue = 1;
      } else if (month > 5 || (month === 5 && day >= 4)) {
        // May 4 – Oct 31: current year Issue 2
        targetIssue = 2;
      } else {
        // Jan 1 – May 3: current year Issue 1
        targetIssue = 1;
      }

      // Find the volume for the target year
      const volume = await prisma.volume.findFirst({ where: { year: targetYear } });
      if (!volume) return null;

      // Find (or create) the issue
      let issue = await prisma.issue.findUnique({
        where: { volumeId_number: { volumeId: volume.id, number: targetIssue } },
      });
      if (!issue) {
        const label = targetIssue === 1
          ? `Issue 1 (Jan–May ${targetYear})`
          : `Issue 2 (May–Oct ${targetYear})`;
        issue = await prisma.issue.create({
          data: { number: targetIssue, title: label, volumeId: volume.id },
        });
      }
      return issue.id;
    }

    const autoIssueId = await resolveIssue();

    // Save submission to DB
    const submission = await prisma.submission.create({
      data: { title, abstract, keywords, language, fileUrl, coAuthors, authorId: userId, issueId: autoIssueId },
    });

    // Send confirmation email to author
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user) {
      await sendSubmissionConfirmation(user.email, user.name, title);
    }

    return NextResponse.json({ submission });
  } catch (error: any) {
    console.error("Submission error:", error);
    return NextResponse.json({ error: error.message || "Submission failed. Please try again." }, { status: 500 });
  }
}
