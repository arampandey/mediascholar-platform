import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const role = (session.user as any).role;
  if (!["EDITOR", "SUB_EDITOR"].includes(role))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  // Papers where at least one reviewer submitted a REJECT decision
  const submissions = await prisma.submission.findMany({
    where: {
      reviews: {
        some: {
          decision: "REJECT",
          submittedAt: { not: null },
        },
      },
    },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      title: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      author: { select: { name: true, institution: true } },
      issue: { select: { number: true, volume: { select: { number: true, year: true } } } },
      reviews: {
        where: { submittedAt: { not: null } },
        select: {
          decision: true,
          remarks: true,
          submittedAt: true,
          reviewer: { select: { name: true } },
        },
      },
      _count: { select: { reviews: { where: { submittedAt: { not: null } } } } },
    },
  });

  return NextResponse.json({ submissions });
}
