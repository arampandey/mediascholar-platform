import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendReviewerAssignment2 } from "@/lib/email";
import { blockedReviewers } from "@/lib/reviewerRules";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || !["EDITOR", "SUB_EDITOR"].includes((session.user as any).role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const { reviewerId, isReplacement = false, override = false } = await req.json();

  // Check max 3 active reviewers (the first two reviews received are used for the decision)
  const existing = await prisma.submissionReviewer.findMany({
    where: { submissionId: id, retractedAt: null },
  });

  const alreadyAssigned = existing.find(r => r.userId === reviewerId);
  if (alreadyAssigned) return NextResponse.json({ error: "Already assigned" }, { status: 400 });

  if (!isReplacement && existing.length >= 3) {
    return NextResponse.json({ error: "Maximum 3 reviewers already assigned" }, { status: 400 });
  }

  // Conflict rules: not the author, not an author or reviewer elsewhere in the same issue.
  // The Editor (not a sub-editor) can override the issue rules; the paper's own author is never allowed.
  const blocked = (await blockedReviewers(id)).get(reviewerId);
  if (blocked) {
    const isEditor = (session.user as any).role === "EDITOR";
    if (blocked.hard || !(override && isEditor)) {
      return NextResponse.json({ error: `Cannot assign this reviewer: ${blocked.reason}.`, blockedReason: blocked.reason, canOverride: isEditor && !blocked.hard }, { status: 409 });
    }
    console.warn(`[reviewer-override] ${(session.user as any).email} assigned reviewer ${reviewerId} to ${id} despite: ${blocked.reason}`);
  }

  // Set deadline: replacement = 7 days, normal = 15 days
  const deadlineDays = isReplacement ? 7 : 15;
  const deadlineAt = new Date(Date.now() + deadlineDays * 24 * 60 * 60 * 1000);

  await prisma.submissionReviewer.create({
    data: {
      submissionId: id,
      userId: reviewerId,
      deadlineAt,
      isReplacement,
    },
  });

  // Create review record
  const existingReview = await prisma.review.findFirst({
    where: { submissionId: id, reviewerId },
  });
  if (!existingReview) {
    await prisma.review.create({ data: { submissionId: id, reviewerId } });
  }

  // Update status to UNDER_REVIEW
  await prisma.submission.update({
    where: { id },
    data: { status: "UNDER_REVIEW" },
  });

  // Send assignment email
  const reviewer = await prisma.user.findUnique({ where: { id: reviewerId } });
  const submission = await prisma.submission.findUnique({ where: { id } });
  if (reviewer && submission) {
    await sendReviewerAssignment2(reviewer.email, reviewer.name, submission.title, deadlineDays, isReplacement);
  }

  return NextResponse.json({ success: true, deadline: deadlineAt });
}
