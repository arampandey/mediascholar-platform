import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendReviewerApplicationDecision } from "@/lib/email";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || !["EDITOR","SUB_EDITOR"].includes((session.user as any).role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await params;
  const { status } = await req.json();
  const app = await prisma.reviewerApplication.update({ where: { id }, data: { status }, include: { user: true } });
  if (status === "APPROVED") await prisma.user.update({ where: { id: app.userId }, data: { role: "REVIEWER" } });
  await sendReviewerApplicationDecision(app.user.email, app.user.name, status === "APPROVED");
  return NextResponse.json({ application: app });
}
