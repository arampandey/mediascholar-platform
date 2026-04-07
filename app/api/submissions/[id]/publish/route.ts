import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || (session.user as any).role !== "EDITOR") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await params;
  const { issueId, doi } = await req.json();
  const submission = await prisma.submission.update({ where: { id }, data: { status: "PUBLISHED", publishedAt: new Date(), issueId, doi } });
  return NextResponse.json({ submission });
}
