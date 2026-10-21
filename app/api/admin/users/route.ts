import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendAccountInvitation } from "@/lib/email";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const ROLE_LABEL: Record<string, string> = { AUTHOR: "Author", REVIEWER: "Reviewer", SUB_EDITOR: "Sub-Editor", EDITOR: "Editor" };

export async function GET() {
  const session = await auth();
  if (!session || (session.user as any).role !== "EDITOR") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const users = await prisma.user.findMany({ orderBy: { createdAt: "desc" }, select: { id:true, name:true, email:true, role:true, institution:true, designation:true, createdAt:true, _count: { select: { submissions:true, reviews:true } } } });
  return NextResponse.json({ users });
}

// Create an account and email the person a link to set their own password (valid 7 days).
export async function POST(req: Request) {
  const session = await auth();
  if (!session || (session.user as any).role !== "EDITOR") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const b = await req.json().catch(() => ({}));
  const name = String(b.name ?? "").trim();
  const email = String(b.email ?? "").trim().toLowerCase();
  const role = String(b.role ?? "");
  if (!name) return NextResponse.json({ error: "Name is required." }, { status: 400 });
  if (!/^\S+@\S+\.\S+$/.test(email)) return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  if (!ROLE_LABEL[role]) return NextResponse.json({ error: "Please choose a role." }, { status: 400 });
  const clash = await prisma.user.findUnique({ where: { email }, select: { name: true } });
  if (clash) return NextResponse.json({ error: `This email is already registered (${clash.name}). Use Edit on that account instead.` }, { status: 409 });

  const token = crypto.randomBytes(32).toString("hex");
  const user = await prisma.user.create({
    data: {
      name, email, role: role as any,
      institution: String(b.institution ?? "").trim() || null,
      designation: String(b.designation ?? "").trim() || null,
      emailVerified: true,
      password: await bcrypt.hash(crypto.randomBytes(24).toString("hex"), 10), // unusable until they set their own
      resetToken: token,
      resetTokenExpiry: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
    select: { id: true, name: true, email: true, role: true },
  });
  const base = process.env.NEXTAUTH_URL || "https://mediascholar.in";
  const setupUrl = `${base}/reset-password?token=${token}`;
  await sendAccountInvitation(email, name, ROLE_LABEL[role], setupUrl);
  // setupUrl is returned so the editor can pass it on manually if the email does not arrive.
  return NextResponse.json({ user, setupUrl });
}
