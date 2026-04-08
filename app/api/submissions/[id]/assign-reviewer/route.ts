import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendReviewerAssignment2 } from "@/lib/email";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || !["EDITOR", "SUB_EDITOR"].includes((session.user as any).role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const { reviewerId, isReplacement = false } = await req.json();

  // Check max 2 active reviewers
  const existing = await prisma.submissionReviewer.findMany({
    where: { submissionId: id, retractedAt: null },
  });

  const alreadyAssigned = existing.find(r => r.userId === reviewerId);
  if (alreadyAssigned) return NextResponse.json({ error: "Already assigned" }, { status: 400 });

  if (!isReplacement && existing.length >= 2) {
    return NextResponse.json({ error: "Maximum 2 reviewers already assigned" }, { status: 400 });
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
