import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ submissionId: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const reviewerId = (session.user as any).id;
  const { submissionId } = await params;

  // Find this reviewer's specific review for this submission
  let review = await prisma.review.findFirst({
    where: { submissionId, reviewerId },
  });

  // If no review record exists yet, create one
  if (!review) {
    // Verify they are actually assigned
    const assignment = await prisma.submissionReviewer.findFirst({
      where: { submissionId, userId: reviewerId, retractedAt: null },
    });
    if (!assignment) return NextResponse.json({ review: null });

    review = await prisma.review.create({
      data: { submissionId, reviewerId },
    });
  }

  return NextResponse.json({ review });
}
