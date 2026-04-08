import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const { secret } = await req.json();
  if (secret !== "mediascholar-migrate-2026") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  
  try {
    // Add emailVerified and verifyToken columns if they don't exist
    await prisma.$executeRaw`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "emailVerified" BOOLEAN NOT NULL DEFAULT true`;
    await prisma.$executeRaw`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "verifyToken" TEXT`;
    // Set all existing users as verified
    await prisma.$executeRaw`UPDATE "User" SET "emailVerified" = true WHERE "emailVerified" IS NULL`;
    return NextResponse.json({ success: true, message: "Migration complete" });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
