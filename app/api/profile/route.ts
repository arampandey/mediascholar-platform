import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = await prisma.user.findUnique({ where: { id: (session.user as any).id }, select: { id:true, name:true, email:true, role:true, institution:true, designation:true, bio:true, orcid:true, createdAt:true } });
  return NextResponse.json({ user });
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { name, institution, designation, bio, orcid } = await req.json();
  const user = await prisma.user.update({ where: { id: (session.user as any).id }, data: { name, institution, designation, bio, orcid } });
  return NextResponse.json({ user });
}
