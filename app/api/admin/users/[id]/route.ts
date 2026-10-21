import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || (session.user as any).role !== "EDITOR") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await params;
  const { role, institution, designation, email, name } = await req.json();
  const updateData: any = {};
  if (role !== undefined) updateData.role = role;
  if (institution !== undefined) updateData.institution = institution;
  if (designation !== undefined) updateData.designation = designation;
  if (email !== undefined) {
    const e = String(email).trim().toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(e)) return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
    const clash = await prisma.user.findFirst({ where: { email: e, id: { not: id } }, select: { name: true } });
    if (clash) return NextResponse.json({ error: `This email is already used by another account (${clash.name}).` }, { status: 409 });
    updateData.email = e;
  }
  if (name !== undefined) updateData.name = name;
  try {
    const user = await prisma.user.update({ where: { id }, data: updateData });
    return NextResponse.json({ user });
  } catch (e: any) {
    return NextResponse.json({ error: e.code === "P2002" ? "This email is already in use." : e.message || "Update failed" }, { status: e.code === "P2002" ? 409 : 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || (session.user as any).role !== "EDITOR") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await params;
  if (id === (session.user as any).id) return NextResponse.json({ error: "Cannot delete yourself" }, { status: 400 });
  try {
    // Cascade: remove dependent records before deleting user
    await prisma.submissionReviewer.deleteMany({ where: { userId: id } });
    await prisma.review.deleteMany({ where: { reviewerId: id } });
    await prisma.reviewerApplication.deleteMany({ where: { userId: id } });
    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Delete failed" }, { status: 500 });
  }
}
