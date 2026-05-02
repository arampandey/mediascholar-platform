import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Optional: filter out reviewers already actively assigned to any submission in the same issue
  const { searchParams } = new URL(req.url);
  const submissionId = searchParams.get("submissionId");

  let excludeReviewerIds: string[] = [];

  if (submissionId) {
    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },
      select: { issueId: true },
    });

    if (submission?.issueId) {
      // Get all reviewer IDs actively assigned to any submission in this issue
      const issueAssignments = await prisma.submissionReviewer.findMany({
        where: {
          retractedAt: null,
          declinedAt: null,
          submission: { issueId: submission.issueId },
          // Exclude the current submission itself (those are handled on the frontend)
          submissionId: { not: submissionId },
        },
        select: { userId: true },
      });
      excludeReviewerIds = issueAssignments.map((a) => a.userId);
    }
  }

  const reviewers = await prisma.user.findMany({
    where: {
      role: "REVIEWER",
      ...(excludeReviewerIds.length > 0 ? { id: { notIn: excludeReviewerIds } } : {}),
    },
    select: { id: true, name: true, email: true, institution: true },
    orderBy: { name: "asc" },
  });
  return NextResponse.json({ reviewers });
}
