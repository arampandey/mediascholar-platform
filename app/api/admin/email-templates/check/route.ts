import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const templates = await prisma.emailTemplate.findMany({
    select: { key: true, subject: true, updatedAt: true },
    orderBy: { updatedAt: "desc" },
    take: 5,
  });
  return NextResponse.json({ count: templates.length, templates });
}
