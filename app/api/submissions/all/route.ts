import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const role = (session.user as any).role;
  if (!["EDITOR","SUB_EDITOR"].includes(role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const submissions = await prisma.submission.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        status: true,
        createdAt: true,
        plagiarismScore: true,
        author: { select: { name: true, email: true, institution: true } },
        issue: { select: { number: true, volume: { select: { number: true, year: true } } } },
        reviewers: {
          select: {
            id: true,
            assignedAt: true,
            deadlineAt: true,
            retractedAt: true,
            declinedAt: true,
            declineReason: true,
            user: { select: { id: true, name: true, email: true } },
          },
        },
        _count: { select: { reviews: { where: { submittedAt: { not: null } } } } },
      },
    });
    return NextResponse.json({ submissions });
  } catch (e: any) {
    console.error("submissions/all error:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
