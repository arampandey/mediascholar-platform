import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Editor/Sub-editor can manually add or update a reviewer's remarks
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ submissionId: string }> }) {
  const session = await auth();
  if (!session || !["EDITOR", "SUB_EDITOR"].includes((session.user as any).role))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { submissionId } = await params;
  const { reviewId, remarks } = await req.json();

  if (!reviewId) return NextResponse.json({ error: "reviewId required" }, { status: 400 });

  const review = await prisma.review.update({
    where: { id: reviewId },
    data: { remarks },
  });

  return NextResponse.json({ review });
}
