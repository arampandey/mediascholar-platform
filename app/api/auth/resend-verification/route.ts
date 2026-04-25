import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { sendEmailVerification } from "@/lib/email";

export async function POST(req: NextRequest) {
  const { email } = await req.json();
  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (!user || user.emailVerified) return NextResponse.json({ success: true });

  const verifyToken = crypto.randomBytes(32).toString("hex");
  await prisma.user.update({ where: { id: user.id }, data: { verifyToken } });

  const verifyUrl = `${process.env.NEXTAUTH_URL}/api/auth/verify-email?token=${verifyToken}`;
  await sendEmailVerification(user.email, user.name, verifyUrl);

  return NextResponse.json({ success: true });
}
