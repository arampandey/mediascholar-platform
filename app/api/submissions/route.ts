import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendSubmissionConfirmation } from "@/lib/email";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

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

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as any).id;

  const formData = await req.formData();
  const title = formData.get("title") as string;
  const abstract = formData.get("abstract") as string;
  const keywordsRaw = formData.get("keywords") as string;
  const language = formData.get("language") as string;
  const coAuthorsRaw = formData.get("coAuthors") as string;
  const file = formData.get("file") as File;

  if (!title || !abstract || !file) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  const keywords = keywordsRaw ? keywordsRaw.split(",").map(k => k.trim()).filter(Boolean) : [];
  const coAuthors = coAuthorsRaw ? coAuthorsRaw.split("\n").map(c => c.trim()).filter(Boolean) : [];

  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadDir, { recursive: true });
  const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
  const filepath = path.join(uploadDir, filename);
  await writeFile(filepath, Buffer.from(await file.arrayBuffer()));

  const submission = await prisma.submission.create({
    data: { title, abstract, keywords, language, fileUrl: `/uploads/${filename}`, coAuthors, authorId: userId },
  });

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (user) await sendSubmissionConfirmation(user.email, user.name, title);

  return NextResponse.json({ submission });
}
