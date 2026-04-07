import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const { plagiarismScore, plagiarismReport } = await req.json();
  const submission = await prisma.submission.update({ where: { id }, data: { plagiarismScore, plagiarismReport, status: "PLAGIARISM_CHECK" } });
  return NextResponse.json({ submission });
}
