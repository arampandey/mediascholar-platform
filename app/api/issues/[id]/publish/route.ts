import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || (session.user as any).role !== "EDITOR") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await params;
  await prisma.issue.update({ where: { id }, data: { publishedAt: new Date() } });
  await prisma.submission.updateMany({ where: { issueId: id, status: "ACCEPTED" }, data: { status: "PUBLISHED", publishedAt: new Date() } });
  return NextResponse.json({ success: true });
}
