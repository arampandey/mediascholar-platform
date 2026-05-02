import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendReviewerAssignment2 } from "@/lib/email";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || (session.user as any).role !== "EDITOR")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;

  const reviewer = await prisma.user.findUnique({ where: { id } });
  if (!reviewer || reviewer.role !== "REVIEWER")
    return NextResponse.json({ error: "Reviewer not found" }, { status: 404 });

  // Find all active assignments for this reviewer
  const assignments = await prisma.submissionReviewer.findMany({
    where: { userId: id, retractedAt: null, declinedAt: null },
    include: { submission: { select: { title: true } } },
  });

  if (assignments.length === 0)
    return NextResponse.json({ error: "No active assignments found" }, { status: 400 });

  let sent = 0;
  for (const a of assignments) {
    const deadlineDays = a.deadlineAt
      ? Math.max(1, Math.ceil((a.deadlineAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
      : 15;
    await sendReviewerAssignment2(reviewer.email, reviewer.name, a.submission.title, deadlineDays, a.isReplacement);
    sent++;
  }

  return NextResponse.json({ success: true, sent, email: reviewer.email });
}
