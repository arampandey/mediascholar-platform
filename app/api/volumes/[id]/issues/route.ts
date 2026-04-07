import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const issues = await prisma.issue.findMany({ where: { volumeId: id }, orderBy: { number: "asc" }, include: { submissions: { where: { status: "ACCEPTED" } } } });
  return NextResponse.json({ issues });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || (session.user as any).role !== "EDITOR") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await params;
  const { number, title } = await req.json();
  const issue = await prisma.issue.create({ data: { number, title, volumeId: id } });
  return NextResponse.json({ issue });
}
