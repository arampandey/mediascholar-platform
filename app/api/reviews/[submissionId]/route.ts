import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  sendReviewSubmitted,
  sendReviewThankYou,
  sendBothReviewersAccepted,
  sendBothReviewersRejected,
  sendConflictingReviews,
  sendSubEditorReviewAlert,
} from "@/lib/email";

// Decisions considered as POSITIVE (accept/minor revision)
const POSITIVE = ["ACCEPT", "MINOR_REVISION"];
// Decisions considered as NEGATIVE (reject/major revision)
const NEGATIVE = ["REJECT", "MAJOR_REVISION"];

function isPositive(decision: string) { return POSITIVE.includes(decision); }
function isNegative(decision: string) { return NEGATIVE.includes(decision); }

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

  // Destructure only valid Review fields — never pass reviewId or other non-schema keys to Prisma
  const { reviewId, clarityScore, methodologyScore, relevanceScore, originalityScore, remarks, decision } = body;
  const reviewData = { clarityScore, methodologyScore, relevanceScore, originalityScore, remarks, decision };

  // Save the review
  const review = await prisma.review.upsert({
    where: { id: reviewId || "nonexistent" },
    update: { ...reviewData, submittedAt: new Date() },
    create: { submissionId, reviewerId, ...reviewData, submittedAt: new Date() },
  });

  const submission = await prisma.submission.findUnique({
    where: { id: submissionId },
    include: { author: { select: { name: true, email: true } } },
  });
  const reviewer = await prisma.user.findUnique({ where: { id: reviewerId } });
  const editors = await prisma.user.findMany({ where: { role: "EDITOR" }, select: { email: true, name: true } });

  if (submission && reviewer) {
    // Thank the reviewer
    await sendReviewThankYou(reviewer.email, reviewer.name, submission.title);

    // Notify editor a review was submitted
    for (const ed of editors) {
      await sendReviewSubmitted(ed.email, reviewer.name, submission.title, body.decision || "N/A");
    }

    // If reviewer REJECTED — notify all sub-editors immediately
    if (body.decision === "REJECT") {
      const subEditors = await prisma.user.findMany({
        where: { role: "SUB_EDITOR" },
        select: { name: true, email: true },
      });
      for (const se of subEditors) {
        await sendSubEditorReviewAlert(
          se.email,
          se.name,
          reviewer.name,
          submission.title,
          body.remarks || ""
        );
      }
    }

    // Check if both reviewers have now submitted
    const allReviews = await prisma.review.findMany({
      where: { submissionId, submittedAt: { not: null } },
    });

    // Get total assigned reviewers (not retracted)
    const assignedReviewers = await prisma.submissionReviewer.findMany({
      where: { submissionId, retractedAt: null },
    });

    if (allReviews.length >= 2 && assignedReviewers.length >= 2) {
      const decisions = allReviews.map(r => r.decision).filter(Boolean) as string[];

      if (decisions.length >= 2) {
        const d1 = decisions[0];
        const d2 = decisions[1];

        // Case 1: Both positive (Accept or Minor Revision) → email author
        if (isPositive(d1) && isPositive(d2)) {
          if (submission.author) {
            await sendBothReviewersAccepted(
              submission.author.email,
              submission.author.name,
              submission.title
            );
          }
          await prisma.submission.update({
            where: { id: submissionId },
            data: { status: "ACCEPTED" },
          });
        }

        // Case 2: Both negative (Reject or Major Revision) → email author with rejection
        else if (isNegative(d1) && isNegative(d2)) {
          const remarks = allReviews
            .map(r => r.remarks)
            .filter(Boolean)
            .join(" | ");
          if (submission.author) {
            await sendBothReviewersRejected(
              submission.author.email,
              submission.author.name,
              submission.title,
              remarks
            );
          }
          await prisma.submission.update({
            where: { id: submissionId },
            data: { status: "REJECTED" },
          });
        }

        // Case 3: Conflicting (one positive, one negative) → email editor for decision
        else {
          for (const ed of editors) {
            await sendConflictingReviews(ed.email, submission.title, d1, d2);
          }
          // Keep status as UNDER_REVIEW — editor must decide
        }
      }
    }
  }

  return NextResponse.json({ review });
}
