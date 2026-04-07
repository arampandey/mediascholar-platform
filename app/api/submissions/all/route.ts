import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const role = (session.user as any).role;
  if (!["EDITOR","SUB_EDITOR"].includes(role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const submissions = await prisma.submission.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      author: { select: { name: true, email: true, institution: true } },
      issue: { include: { volume: true } },
      reviewers: { include: { user: { select: { name: true, email: true } } } },
      _count: { select: { reviews: { where: { submittedAt: { not: null } } } } },
    },
  });
  return NextResponse.json({ submissions });
}
