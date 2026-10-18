import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();
  if ((session?.user as { role?: string } | undefined)?.role !== "EDITOR") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const templates = await prisma.emailTemplate.findMany({
    select: { key: true, subject: true, updatedAt: true },
    orderBy: { updatedAt: "desc" },
    take: 5,
  });
  return NextResponse.json({ count: templates.length, templates });
}
