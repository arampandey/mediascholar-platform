import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const { secret, action } = await req.json();
  if (secret !== "mediascholar-migrate-2026") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    if (action === "fix-github-urls") {
      // Replace raw.githubusercontent.com PDF URLs with /uploads/ relative paths
      const papers = await prisma.submission.findMany({
        where: { fileUrl: { contains: "github" } },
        select: { id: true, fileUrl: true },
      });
      let fixed = 0;
      for (const p of papers) {
        // Extract filename from GitHub URL e.g. .../paper_abc.pdf → /uploads/paper_abc.pdf
        const match = p.fileUrl?.match(/([^/]+\.pdf)$/);
        if (match) {
          await prisma.submission.update({
            where: { id: p.id },
            data: { fileUrl: `/uploads/${match[1]}` },
          });
          fixed++;
        }
      }
      return NextResponse.json({ success: true, message: `Fixed ${fixed} GitHub PDF URLs`, total: papers.length });
    }

    if (action === "fix-emails") {
      await prisma.$executeRaw`UPDATE "User" SET email = 'mediascholarjournal@gmail.com' WHERE email = 'editor@mediascholar.in'`;
      await prisma.$executeRaw`UPDATE "User" SET email = 'apoorvaagnihotri8@gmail.com' WHERE email = 'subeditor@mediascholar.in' OR email = 'apoorva.smcs@galgotiasuniversity.edu.in'`;
      return NextResponse.json({ success: true, message: "Editor emails updated" });
    }

    // Default: schema migration
    await prisma.$executeRaw`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "emailVerified" BOOLEAN NOT NULL DEFAULT true`;
    await prisma.$executeRaw`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "verifyToken" TEXT`;
    await prisma.$executeRaw`UPDATE "User" SET "emailVerified" = true WHERE "emailVerified" IS NULL`;
    return NextResponse.json({ success: true, message: "Migration complete" });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
