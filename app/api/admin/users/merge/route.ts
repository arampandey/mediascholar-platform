import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Merge a duplicate account (mergeId) into the account to keep (keepId):
// papers, reviews, reviewer assignments and applications move to keepId, then the duplicate is deleted.
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || (session.user as any).role !== "EDITOR") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { keepId, mergeId } = await req.json().catch(() => ({}));
  if (!keepId || !mergeId || keepId === mergeId) return NextResponse.json({ error: "Choose two different accounts." }, { status: 400 });
  if (mergeId === (session.user as any).id) return NextResponse.json({ error: "You cannot merge your own account away." }, { status: 400 });

  const pick = { id: true, name: true, email: true, role: true, institution: true, designation: true, bio: true, orcid: true } as const;
  const [keep, dup] = await Promise.all([
    prisma.user.findUnique({ where: { id: keepId }, select: pick }),
    prisma.user.findUnique({ where: { id: mergeId }, select: pick }),
  ]);
  if (!keep || !dup) return NextResponse.json({ error: "Account not found." }, { status: 404 });

  try {
    const moved = await prisma.$transaction(async (tx) => {
      // Reviewer assignments: drop the duplicate's rows where the kept account is already assigned to the same paper.
      const keepAssigned = await tx.submissionReviewer.findMany({ where: { userId: keepId }, select: { submissionId: true } });
      const keepReviewed = await tx.review.findMany({ where: { reviewerId: keepId }, select: { submissionId: true } });
      await tx.submissionReviewer.deleteMany({ where: { userId: mergeId, submissionId: { in: keepAssigned.map(r => r.submissionId) } } });
      await tx.review.deleteMany({ where: { reviewerId: mergeId, submissionId: { in: keepReviewed.map(r => r.submissionId) } } });

      const subs = await tx.submission.updateMany({ where: { authorId: mergeId }, data: { authorId: keepId } });
      const reviews = await tx.review.updateMany({ where: { reviewerId: mergeId }, data: { reviewerId: keepId } });
      const assigned = await tx.submissionReviewer.updateMany({ where: { userId: mergeId }, data: { userId: keepId } });
      await tx.submissionReviewer.updateMany({ where: { replacedById: mergeId }, data: { replacedById: keepId } });
      const apps = await tx.reviewerApplication.updateMany({ where: { userId: mergeId }, data: { userId: keepId } });

      // Fill any blank profile details on the kept account from the duplicate.
      const fill: Record<string, string> = {};
      for (const k of ["institution", "designation", "bio", "orcid"] as const) if (!keep[k] && dup[k]) fill[k] = dup[k] as string;
      if (Object.keys(fill).length) await tx.user.update({ where: { id: keepId }, data: fill, select: { id: true } });

      await tx.user.delete({ where: { id: mergeId }, select: { id: true } });
      return { papers: subs.count, reviews: reviews.count, assignments: assigned.count, applications: apps.count };
    });
    return NextResponse.json({ success: true, kept: { name: keep.name, email: keep.email }, moved });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Merge failed" }, { status: 500 });
  }
}
