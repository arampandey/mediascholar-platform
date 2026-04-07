import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendReviewerAssignment } from "@/lib/email";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const { reviewerId } = await req.json();

  const existing = await prisma.submissionReviewer.findUnique({ where: { submissionId_userId: { submissionId: id, userId: reviewerId } } });
  if (existing) return NextResponse.json({ error: "Already assigned" }, { status: 400 });

  await prisma.submissionReviewer.create({ data: { submissionId: id, userId: reviewerId } });
  await prisma.submission.update({ where: { id }, data: { status: "UNDER_REVIEW" } });
  await prisma.review.create({ data: { submissionId: id, reviewerId } });

  const reviewer = await prisma.user.findUnique({ where: { id: reviewerId } });
  const submission = await prisma.submission.findUnique({ where: { id } });
  if (reviewer && submission) await sendReviewerAssignment(reviewer.email, reviewer.name, submission.title);

  return NextResponse.json({ success: true });
}
