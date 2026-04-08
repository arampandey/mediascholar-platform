import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  if (!token) return NextResponse.json({ error: "Invalid link" }, { status: 400 });

  const user = await prisma.user.findFirst({ where: { verifyToken: token } });
  if (!user) return NextResponse.json({ error: "Invalid or expired verification link" }, { status: 400 });

  await prisma.user.update({
    where: { id: user.id },
    data: { emailVerified: true, verifyToken: null },
  });

  return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/verify-email?success=true`);
}
