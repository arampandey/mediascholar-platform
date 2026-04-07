import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendReviewSubmitted, sendReviewThankYou } from "@/lib/email";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ submissionId: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { submissionId } = await params;
  const reviews = await prisma.review.findMany({
    where: { submissionId },
    include: { reviewer: { select: { name: true, email: true } } },
  });
  return NextResponse.json({ reviews });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ submissionId: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { submissionId } = await params;
  const reviewerId = (session.user as any).id;
  const body = await req.json();

  const review = await prisma.review.upsert({
    where: { id: body.reviewId || "nonexistent" },
    update: { ...body, submittedAt: new Date() },
    create: { submissionId, reviewerId, ...body, submittedAt: new Date() },
  });

  const submission = await prisma.submission.findUnique({ where: { id: submissionId } });
  const reviewer = await prisma.user.findUnique({ where: { id: reviewerId } });
  const editors = await prisma.user.findMany({ where: { role: "EDITOR" }, select: { email: true } });

  if (submission && reviewer) {
    for (const ed of editors) await sendReviewSubmitted(ed.email, reviewer.name, submission.title, body.decision || "N/A");
    await sendReviewThankYou(reviewer.email, reviewer.name, submission.title);
  }
  return NextResponse.json({ review });
}
