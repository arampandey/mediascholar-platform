import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Editor / sub-editor moves a paper to an issue (e.g. a paper that was submitted while no volume existed).
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const role = (session?.user as any)?.role;
  if (!session || !["EDITOR", "SUB_EDITOR"].includes(role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { id } = await params;
  const { issueId } = await req.json().catch(() => ({}));
  if (!issueId || typeof issueId !== "string") {
    return NextResponse.json({ error: "Choose an issue." }, { status: 400 });
  }

  const sub = await prisma.submission.findUnique({ where: { id }, select: { status: true } });
  if (!sub) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (sub.status === "PUBLISHED") {
    return NextResponse.json({ error: "A published paper cannot be moved to another issue here." }, { status: 400 });
  }
  const issue = await prisma.issue.findUnique({ where: { id: issueId }, include: { volume: true } });
  if (!issue) return NextResponse.json({ error: "Issue not found." }, { status: 404 });

  await prisma.submission.update({ where: { id }, data: { issueId } });
  return NextResponse.json({ success: true, issue: { id: issue.id, number: issue.number, volume: issue.volume.number } });
}
