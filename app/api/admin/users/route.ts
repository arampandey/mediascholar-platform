import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session || (session.user as any).role !== "EDITOR") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const users = await prisma.user.findMany({ orderBy: { createdAt: "desc" }, select: { id:true, name:true, email:true, role:true, institution:true, designation:true, createdAt:true, _count: { select: { submissions:true, reviews:true } } } });
  return NextResponse.json({ users });
}
