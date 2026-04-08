import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as any).id;

  // Get all assignments (not retracted)
  const assignments = await prisma.submissionReviewer.findMany({
    where: { userId, retractedAt: null },
    include: {
      submission: {
        include: {
          author: { select: { name: true } },
        },
      },
    },
    orderBy: { assignedAt: "desc" },
  });

  // Ensure a review record exists for each assignment
  for (const a of assignments) {
    const existing = await prisma.review.findFirst({
      where: { submissionId: a.submissionId, reviewerId: userId },
    });
    if (!existing) {
      await prisma.review.create({
        data: { submissionId: a.submissionId, reviewerId: userId },
      });
    }
  }

  return NextResponse.json({ assignments });
}
