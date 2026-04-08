import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { sendEmailVerification } from "@/lib/email";

export async function POST(req: NextRequest) {
  const { name, email, password, institution, designation, role: requestedRole } = await req.json();

  if (!name || !email || !password) {
    return NextResponse.json({ error: "Name, email and password are required" }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (existing) {
    return NextResponse.json({ error: "This email is already registered. Please sign in." }, { status: 400 });
  }

  const hashed = await bcrypt.hash(password, 12);
  const verifyToken = crypto.randomBytes(32).toString("hex");

  // Reviewer applicants register as AUTHOR first, then get upgraded after approval
  const role = requestedRole === "REVIEWER_APPLICANT" ? "AUTHOR" : "AUTHOR";

  const user = await prisma.user.create({
    data: {
      name,
      email: email.toLowerCase(),
      password: hashed,
      role,
      institution,
      designation,
      emailVerified: false,
      verifyToken,
    },
  });

  // Send verification email
  const verifyUrl = `${process.env.NEXTAUTH_URL}/verify-email?token=${verifyToken}`;
  await sendEmailVerification(email.toLowerCase(), name, verifyUrl);

  return NextResponse.json({
    success: true,
    message: "Registration successful. Please check your email to verify your account.",
  });
}
