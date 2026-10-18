import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isSafeFileUrl } from "@/lib/fileUrl";
import { sendRevisionRequest, sendRevisionSubmittedToEditors } from "@/lib/email";

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

  // Author resubmission — verify the logged-in user actually owns this submission
  const existing = await prisma.submission.findUnique({ where: { id }, select: { authorId: true, status: true } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (existing.authorId !== (session.user as any).id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Only a paper the editors sent back for revision can be resubmitted
  if (existing.status !== "REVISION_REQUESTED") {
    return NextResponse.json({ error: "This submission is not awaiting a revision" }, { status: 400 });
  }

  const { fileUrl, notes } = body;
  if (!isSafeFileUrl(fileUrl)) {
    return NextResponse.json({ error: "Invalid file URL" }, { status: 400 });
  }
  await prisma.revision.create({ data: { submissionId: id, fileUrl, notes } });
  await prisma.submission.update({ where: { id }, data: { status: "RESUBMITTED", fileUrl } });

  // Notify all editors and sub-editors that the revised manuscript is ready
  const sub = await prisma.submission.findUnique({
    where: { id },
    include: { author: { select: { name: true } } },
  });
  if (sub) {
    const editorialTeam = await prisma.user.findMany({
      where: { role: { in: ["EDITOR", "SUB_EDITOR"] } },
      select: { email: true, name: true },
    });
    for (const member of editorialTeam) {
      await sendRevisionSubmittedToEditors(
        member.email,
        member.name,
        sub.author?.name ?? "Author",
        sub.title,
        notes || ""
      );
    }
  }

  return NextResponse.json({ success: true });
}
