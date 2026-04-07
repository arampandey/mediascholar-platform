import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as any).id;
  const assignments = await prisma.submissionReviewer.findMany({
    where: { userId },
    include: { submission: { include: { author: { select: { name:true } } } } },
    orderBy: { assignedAt: "desc" },
  });
  return NextResponse.json({ assignments });
}
