import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const { secret, action } = await req.json();
  if (secret !== "mediascholar-migrate-2026") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    if (action === "fix-emails") {
      // Update editor login email to real Gmail
      await prisma.$executeRaw`UPDATE "User" SET email = 'mediascholarjournal@gmail.com' WHERE email = 'editor@mediascholar.in'`;
      // Update sub-editor email (keep a real email)
      await prisma.$executeRaw`UPDATE "User" SET email = 'apoorva.smcs@galgotiasuniversity.edu.in' WHERE email = 'subeditor@mediascholar.in'`;
      // Make sure all editors/sub-editors route notifications to Gmail
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
