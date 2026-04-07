import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = await prisma.user.findUnique({
    where: { id: (session.user as any).id },
    select: { id:true, name:true, email:true, role:true, institution:true, designation:true, bio:true, orcid:true, createdAt:true }
  });
  return NextResponse.json({ user });
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const { name, institution, designation, bio, orcid, currentPassword, newPassword } = body;

  // Handle password change
  if (newPassword) {
    if (!currentPassword) return NextResponse.json({ error: "Current password is required" }, { status: 400 });
    if (newPassword.length < 8) return NextResponse.json({ error: "New password must be at least 8 characters" }, { status: 400 });

    const user = await prisma.user.findUnique({ where: { id: (session.user as any).id } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });

    const hashed = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({ where: { id: user.id }, data: { password: hashed } });
    return NextResponse.json({ success: true, message: "Password changed successfully" });
  }

  // Handle profile update
  const user = await prisma.user.update({
    where: { id: (session.user as any).id },
    data: { name, institution, designation, bio, orcid }
  });
  return NextResponse.json({ user });
}
