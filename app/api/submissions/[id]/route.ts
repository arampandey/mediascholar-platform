import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isSafeFileUrl } from "@/lib/fileUrl";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const userId = (session.user as any).id;
  const role = (session.user as any).role;

  const submission = await prisma.submission.findUnique({
    where: { id },
    include: {
      author: { select: { id: true, name: true, email: true, institution: true } },
      issue: { include: { volume: true } },
      reviews: { include: { reviewer: { select: { name: true } } } },
      reviewers: { include: { user: { select: { id: true, name: true, email: true, institution: true } } } },
      revisions: { orderBy: { createdAt: "desc" } },
    },
  });
  if (!submission) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const isEditorial = ["EDITOR", "SUB_EDITOR"].includes(role);
  const isOwner = submission.authorId === userId;

  // Editors/sub-editors get the full record, including reviewer identities,
  // plagiarism score, and editor decision notes.
  if (isEditorial) {
    return NextResponse.json({ submission });
  }

  // Authors get their own paper, but reviewer identities are stripped to
  // preserve double-blind review anonymity.
  if (isOwner) {
    const { reviewers, ...rest } = submission;
    return NextResponse.json({
      submission: {
        ...rest,
        reviews: submission.reviews.map(({ reviewer, reviewerId, ...r }) => r),
      },
    });
  }

  // A reviewer currently assigned to this submission gets only the minimal
  // fields they need to do the review — no other reviewer's identity, no
  // plagiarism score, no editor decision notes.
  const isAssignedReviewer = submission.reviewers.some(
    (r) => r.userId === userId && !r.retractedAt && !r.declinedAt
  );
  if (isAssignedReviewer) {
    return NextResponse.json({
      submission: {
        id: submission.id,
        title: submission.title,
        abstract: submission.abstract,
        keywords: submission.keywords,
        language: submission.language,
        fileUrl: submission.fileUrl,
        status: submission.status,
        coAuthors: submission.coAuthors,
      },
    });
  }

  // Any other logged-in user has no business viewing this submission.
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const role = (session?.user as any)?.role;
  if (!session || !["EDITOR", "SUB_EDITOR"].includes(role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { id } = await params;
  const body = await req.json();
  // Only allow safe scalar field updates via this endpoint
  const allowed: Record<string, unknown> = {};
  if (body.fileUrl !== undefined) {
    if (!isSafeFileUrl(body.fileUrl)) return NextResponse.json({ error: "Invalid file URL" }, { status: 400 });
    allowed.fileUrl = body.fileUrl;
  }
  if (Object.keys(allowed).length === 0) {
    return NextResponse.json({ error: "No updatable fields provided" }, { status: 400 });
  }
  const updated = await prisma.submission.update({ where: { id }, data: allowed });
  return NextResponse.json({ success: true, submission: updated });
}
