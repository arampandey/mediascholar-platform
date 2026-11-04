import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Edit an issue's number and/or title (editor only).
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || (session.user as { role?: string }).role !== "EDITOR")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await params;
  const body = await req.json().catch(() => ({}));

  const data: { number?: number; title?: string | null; publishedAt?: null } = {};

  // Unpublish: only allowed while the issue has no published papers (e.g. it was published by mistake while empty)
  if (body.unpublish === true) {
    const published = await prisma.submission.count({ where: { issueId: id, status: "PUBLISHED" } });
    if (published > 0)
      return NextResponse.json({ error: `This issue has ${published} published paper(s) and cannot be unpublished.` }, { status: 400 });
    data.publishedAt = null;
  }
  if (body.number !== undefined) {
    const n = Number(body.number);
    if (!Number.isInteger(n) || n < 1) return NextResponse.json({ error: "Issue number must be a whole number of 1 or more." }, { status: 400 });
    data.number = n;
  }
  if (body.title !== undefined) data.title = String(body.title).trim() || null;

  const current = await prisma.issue.findUnique({ where: { id }, select: { volumeId: true } });
  if (!current) return NextResponse.json({ error: "Issue not found." }, { status: 404 });

  if (data.number !== undefined) {
    const clash = await prisma.issue.findFirst({ where: { volumeId: current.volumeId, number: data.number, id: { not: id } } });
    if (clash) return NextResponse.json({ error: `This volume already has an Issue ${data.number}.` }, { status: 409 });
  }

  try {
    const issue = await prisma.issue.update({ where: { id }, data });
    return NextResponse.json({ issue });
  } catch (e: unknown) {
    const code = (e as { code?: string }).code;
    return NextResponse.json({ error: code === "P2002" ? "This volume already has an issue with that number." : "Update failed." }, { status: code === "P2002" ? 409 : 500 });
  }
}
