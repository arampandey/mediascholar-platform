import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
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
  return NextResponse.json({ submission });
}
