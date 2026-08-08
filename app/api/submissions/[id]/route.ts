import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const submission = await prisma.submission.findUnique({
    where: { id },
    include: {
      author: { select: { id: true, name: true, email: true, institution: true } },
      issue: { include: { volume: true } },
      reviews: { include: { reviewer: { select: { name: true } } } },
      reviewers: { include: { user: { select: { id: true, name: true, email: true, institution: true } } } },
      revisions: { orderBy: { createdAt: "desc" } },
    },
  });
  if (!submission) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ submission });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const role = (session?.user as any)?.role;
  if (!session || !["EDITOR", "SUB_EDITOR"].includes(role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { id } = await params;
  const body = await req.json();
  // Only allow safe scalar field updates via this endpoint
  const allowed: Record<string, unknown> = {};
  if (typeof body.fileUrl === "string") allowed.fileUrl = body.fileUrl;
  if (Object.keys(allowed).length === 0) {
    return NextResponse.json({ error: "No updatable fields provided" }, { status: 400 });
  }
  const updated = await prisma.submission.update({ where: { id }, data: allowed });
  return NextResponse.json({ success: true, submission: updated });
}
