import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendSubmissionConfirmation } from "@/lib/email";

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

async function uploadToGitHub(filename: string, content: Buffer): Promise<string> {
  const owner = "arampandey";
  const repo = "mediascholar-platform";
  const branch = "main";
  const token = process.env.GITHUB_TOKEN;
  const path = `public/uploads/${filename}`;

  if (!token) throw new Error("GITHUB_TOKEN not configured");

  const base64Content = content.toString("base64");

  // Check if file already exists (to get SHA for update)
  let sha: string | undefined;
  try {
    const checkRes = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
      { headers: { Authorization: `token ${token}`, Accept: "application/vnd.github.v3+json" } }
    );
    if (checkRes.ok) {
      const data = await checkRes.json();
      sha = data.sha;
    }
  } catch {}

  const body: any = {
    message: `Upload manuscript: ${filename}`,
    content: base64Content,
    branch,
  };
  if (sha) body.sha = sha;

  const res = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
    {
      method: "PUT",
      headers: {
        Authorization: `token ${token}`,
        Accept: "application/vnd.github.v3+json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }
  );

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "GitHub upload failed");
  }

  return `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/public/uploads/${filename}`;
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

    // Upload file to GitHub
    const timestamp = Date.now();
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const filename = `${timestamp}-${safeName}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    const fileUrl = await uploadToGitHub(filename, buffer);

    // Save submission to DB
    const submission = await prisma.submission.create({
      data: { title, abstract, keywords, language, fileUrl, coAuthors, authorId: userId },
    });

    // Send confirmation email
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user) await sendSubmissionConfirmation(user.email, user.name, title);

    return NextResponse.json({ submission });
  } catch (error: any) {
    console.error("Submission error:", error);
    return NextResponse.json({ error: error.message || "Submission failed. Please try again." }, { status: 500 });
  }
}
