import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendReviewerApplicationAck } from "@/lib/email";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const role = (session.user as any).role;
  if (!["EDITOR","SUB_EDITOR"].includes(role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const applications = await prisma.reviewerApplication.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: { select: { id: true, name: true, email: true, institution: true, designation: true } } },
  });
  return NextResponse.json({ applications });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as any).id;
  const { note } = await req.json();
  const app = await prisma.reviewerApplication.create({ data: { userId, note } });
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (user) await sendReviewerApplicationAck(user.email, user.name);
  return NextResponse.json({ application: app });
}
