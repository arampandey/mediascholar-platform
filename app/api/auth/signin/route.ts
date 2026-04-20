import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signIn } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();
  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (!user) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  if (user.emailVerified === false) return NextResponse.json({ error: "EMAIL_NOT_VERIFIED" }, { status: 403 });
  return NextResponse.json({ ok: true, role: user.role, name: user.name });
}
