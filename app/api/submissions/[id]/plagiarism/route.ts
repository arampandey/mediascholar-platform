import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendPlagiarismFailed, sendPlagiarismPassed } from "@/lib/email";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || !["EDITOR", "SUB_EDITOR"].includes((session.user as any).role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const { plagiarismScore, plagiarismReport } = await req.json();
  const score = parseFloat(plagiarismScore);

  // Determine new status based on score
  const newStatus = score > 20 ? "REJECTED" : "PLAGIARISM_CHECK";

  const submission = await prisma.submission.update({
    where: { id },
    data: {
      plagiarismScore: score,
      plagiarismReport: plagiarismReport || null,
      status: newStatus,
      // If rejected due to plagiarism, record it
      ...(score > 20 ? { editorDecision: "REJECT", decisionNotes: `High similarity score: ${score}%. Exceeds the 20% threshold.`, decisionAt: new Date() } : {}),
    },
    include: {
      author: { select: { name: true, email: true } },
    },
  });

  // Get editor emails for notification
  const editors = await prisma.user.findMany({
    where: { role: "EDITOR" },
    select: { email: true },
  });

  if (submission.author) {
    if (score > 20) {
      // Notify author: manuscript not considered
      await sendPlagiarismFailed(
        submission.author.email,
        submission.author.name,
        submission.title,
        score
      );
    } else {
      // Notify editor: ready for reviewer assignment
      for (const ed of editors) {
        await sendPlagiarismPassed(
          ed.email,
          submission.author.name,
          submission.title,
          score
        );
      }
    }
  }

  return NextResponse.json({
    submission,
    action: score > 20 ? "rejected_plagiarism" : "ready_for_review",
  });
}
