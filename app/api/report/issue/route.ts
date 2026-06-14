export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const role = (session.user as any).role;
  if (!["EDITOR", "SUB_EDITOR"].includes(role))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const issueId = new URL(req.url).searchParams.get("issueId");
  if (!issueId) return NextResponse.json({ error: "Missing issueId" }, { status: 400 });

  const submissions = await prisma.submission.findMany({
    where: { issueId },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      title: true,
      status: true,
      coAuthors: true,
      author: { select: { name: true, email: true } },
      reviewers: {
        where: { retractedAt: null },
        select: {
          declinedAt: true,
          user: { select: { id: true, name: true, email: true } },
        },
      },
      reviews: {
        select: {
          reviewerId: true,
          submittedAt: true,
          decision: true,
        },
      },
    },
  });

  // Merge each reviewer record with their corresponding review record
  const report = submissions.map(s => ({
    id: s.id,
    title: s.title,
    status: s.status,
    author: s.author,
    coAuthors: s.coAuthors,
    reviewers: s.reviewers.map(r => {
      const review = s.reviews.find(rv => rv.reviewerId === r.user.id);
      return {
        name: r.user.name,
        email: r.user.email,
        declinedAt: r.declinedAt,
        reviewSubmittedAt: review?.submittedAt ?? null,
        reviewDecision: review?.decision ?? null,
      };
    }),
  }));

  return NextResponse.json({ report });
}
