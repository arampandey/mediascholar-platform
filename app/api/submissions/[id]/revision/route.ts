import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendRevisionRequest } from "@/lib/email";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const body = await req.json();
  const role = (session.user as any).role;

  if (body.type === "request") {
    // Only editors/sub-editors can request a revision
    if (![ "EDITOR", "SUB_EDITOR" ].includes(role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    await prisma.submission.update({ where: { id }, data: { status: "REVISION_REQUESTED" } });
    const sub = await prisma.submission.findUnique({ where: { id }, include: { author: true } });
    if (sub?.author) await sendRevisionRequest(sub.author.email, sub.author.name, sub.title, body.notes || "");
    return NextResponse.json({ success: true });
  }

  // Author resubmission
  const { fileUrl, notes } = body;
  await prisma.revision.create({ data: { submissionId: id, fileUrl, notes } });
  await prisma.submission.update({ where: { id }, data: { status: "RESUBMITTED", fileUrl } });
  return NextResponse.json({ success: true });
}
