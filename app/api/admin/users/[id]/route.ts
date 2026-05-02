import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || (session.user as any).role !== "EDITOR") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await params;
  const { role, institution, designation, email, name } = await req.json();
  const updateData: any = { role, institution, designation };
  if (email !== undefined) updateData.email = email;
  if (name !== undefined) updateData.name = name;
  const user = await prisma.user.update({ where: { id }, data: updateData });
  return NextResponse.json({ user });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || (session.user as any).role !== "EDITOR") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await params;
  if (id === (session.user as any).id) return NextResponse.json({ error: "Cannot delete yourself" }, { status: 400 });
  await prisma.user.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
