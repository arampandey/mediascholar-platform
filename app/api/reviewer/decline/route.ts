import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendReviewerDeclined } from "@/lib/email";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as any).id;
  const reviewerName = (session.user as any).name || "Reviewer";
  const reviewerEmail = (session.user as any).email || "";

  const { submissionId, reason } = await req.json();
  if (!submissionId) return NextResponse.json({ error: "submissionId required" }, { status: 400 });

  // Find the assignment
  const assignment = await prisma.submissionReviewer.findUnique({
    where: { submissionId_userId: { submissionId, userId } },
    include: { submission: true },
  });

  if (!assignment) return NextResponse.json({ error: "Assignment not found" }, { status: 404 });
  if (assignment.retractedAt) return NextResponse.json({ error: "Assignment already retracted" }, { status: 400 });
  if (assignment.declinedAt) return NextResponse.json({ error: "Already declined" }, { status: 400 });

  // Mark as declined
  await prisma.submissionReviewer.update({
    where: { id: assignment.id },
    data: {
      declinedAt: new Date(),
      declineReason: reason || null,
    },
  });

  // Delete the associated Review record (if empty / unsubmitted)
  await prisma.review.deleteMany({
    where: {
      submissionId,
      reviewerId: userId,
      submittedAt: null,
    },
  });

  // Notify editor
  const editors = await prisma.user.findMany({
    where: { role: { in: ["EDITOR", "SUB_EDITOR"] } },
    select: { email: true },
  });

  for (const editor of editors) {
    await sendReviewerDeclined(
      editor.email,
      reviewerName,
      reviewerEmail,
      assignment.submission.title,
      reason || "No reason provided"
    );
  }

  return NextResponse.json({ success: true });
}
