import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { timingSafeEqual } from "crypto";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  const { secret, action } = body;
  // Fail closed: this is a powerful admin endpoint (raw SQL, email verification bypass,
  // reviewer seeding). It must never fall back to a hardcoded default — that default
  // was sitting in this file in a PUBLIC GitHub repo, so anyone could read it.
  const MIGRATE_SECRET = process.env.MIGRATE_SECRET;
  if (!MIGRATE_SECRET) {
    return NextResponse.json({ error: "MIGRATE_SECRET not configured on server" }, { status: 500 });
  }
  const a = Buffer.from(String(secret ?? ""));
  const b = Buffer.from(MIGRATE_SECRET);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    // NOTE (2026-08-09): removed several one-time data-fix actions that had
    // hardcoded submission IDs / emails baked in (sync-keywords, fix-github-urls,
    // fix-all-verified, fix-emails). They already ran successfully and their
    // hardcoded data has no further use — keeping them around only expanded
    // this endpoint's attack surface for no benefit. If a similar one-off bulk
    // fix is ever needed again, add a fresh scoped action here and remove it
    // once it's done running.

    if (action === "check-user") {
      const { email } = body;
      const user = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
        select: { id: true, name: true, email: true, role: true, emailVerified: true, verifyToken: true },
      });
      return NextResponse.json({ success: true, user });
    }

    if (action === "verify-user") {
      const { email } = body;
      const user = await prisma.user.update({
        where: { email: email.toLowerCase() },
        data: { emailVerified: true, verifyToken: null },
        select: { id: true, name: true, email: true, emailVerified: true },
      });
      return NextResponse.json({ success: true, user });
    }

    if (action === "list-fileurls") {
      const limit = body.limit || 100;
      const rows = await prisma.submission.findMany({
        orderBy: { createdAt: "desc" },
        take: limit,
        select: { id: true, title: true, fileUrl: true, status: true, createdAt: true },
      });
      return NextResponse.json({ success: true, rows });
    }

    if (action === "sync-schema") {
      // Add any missing columns to keep schema in sync with Prisma models
      await prisma.$executeRaw`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "emailVerified" BOOLEAN NOT NULL DEFAULT true`;
      await prisma.$executeRaw`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "verifyToken" TEXT`;
      await prisma.$executeRaw`UPDATE "User" SET "emailVerified" = true WHERE "emailVerified" IS NULL`;
      await prisma.$executeRaw`ALTER TABLE "SubmissionReviewer" ADD COLUMN IF NOT EXISTS "declinedAt" TIMESTAMP`;
      await prisma.$executeRaw`ALTER TABLE "SubmissionReviewer" ADD COLUMN IF NOT EXISTS "declineReason" TEXT`;
      await prisma.$executeRaw`ALTER TABLE "SubmissionReviewer" ADD COLUMN IF NOT EXISTS "retractedAt" TIMESTAMP`;
      await prisma.$executeRaw`ALTER TABLE "SubmissionReviewer" ADD COLUMN IF NOT EXISTS "reminderSentAt" TIMESTAMP`;
      await prisma.$executeRaw`ALTER TABLE "SubmissionReviewer" ADD COLUMN IF NOT EXISTS "deadlineAt" TIMESTAMP`;
      await prisma.$executeRaw`ALTER TABLE "SubmissionReviewer" ADD COLUMN IF NOT EXISTS "isReplacement" BOOLEAN NOT NULL DEFAULT false`;
      await prisma.$executeRaw`ALTER TABLE "SubmissionReviewer" ADD COLUMN IF NOT EXISTS "replacedById" TEXT`;
      await prisma.$executeRaw`ALTER TABLE "Submission" ADD COLUMN IF NOT EXISTS "doi" TEXT`;
      await prisma.$executeRaw`ALTER TABLE "Submission" ADD COLUMN IF NOT EXISTS "publishedAt" TIMESTAMP`;
      await prisma.$executeRaw`ALTER TABLE "Submission" ADD COLUMN IF NOT EXISTS "editorDecision" TEXT`;
      await prisma.$executeRaw`ALTER TABLE "Submission" ADD COLUMN IF NOT EXISTS "decisionNotes" TEXT`;
      await prisma.$executeRaw`ALTER TABLE "Submission" ADD COLUMN IF NOT EXISTS "decisionAt" TIMESTAMP`;
      await prisma.$executeRaw`ALTER TABLE "Submission" ADD COLUMN IF NOT EXISTS "plagiarismReport" TEXT`;
      await prisma.$executeRaw`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "bio" TEXT`;
      await prisma.$executeRaw`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "orcid" TEXT`;
      await prisma.$executeRaw`ALTER TABLE "Submission" ADD COLUMN IF NOT EXISTS "zenodoRecordId" TEXT`;
      await prisma.$executeRaw`ALTER TABLE "Submission" ADD COLUMN IF NOT EXISTS "zenodoUrl" TEXT`;
      await prisma.$executeRaw`ALTER TABLE "Submission" ADD COLUMN IF NOT EXISTS "downloadCount" INTEGER NOT NULL DEFAULT 0`;
      await prisma.$executeRaw`ALTER TABLE "Submission" ADD COLUMN IF NOT EXISTS "viewCount" INTEGER NOT NULL DEFAULT 0`;
      return NextResponse.json({ success: true, message: "Schema sync complete" });
    }

    if (action === "seed-editorial-board") {
      const BOARD = [
        { name: "Jatin Srivastava", email: "srivastj@ohio.edu", institution: "Ohio University, Athens, Ohio, USA", designation: "Professor, Associate Director for Graduate Studies" },
        { name: "Rajesh Kumar", email: "rkdoon@gmail.com", institution: "Doon University, Dehradun, Uttarakhand", designation: "Professor" },
        { name: "Raghavendra Mishra", email: "rmishra@igntu.ac.in", institution: "Indira Gandhi National Tribal University, Amarkantak, MP", designation: "Professor" },
        { name: "Amitabh Srivastava", email: "amitabh.srivastava@curaj.ac.in", institution: "Central University of Rajasthan, Ajmer, Rajasthan", designation: "Professor & Head" },
        { name: "Harish Kumar", email: "harish.kumar@sxuk.edu.in", institution: "St. Xavier's University, Newtown, Kolkata, West Bengal", designation: "Professor & Head" },
        { name: "Tasha Singh Parihar", email: "tasha.singh@galgotiasuniversity.edu.in", institution: "Galgotias University, Greater Noida, Uttar Pradesh", designation: "Professor, School of Media and Communication Studies" },
        { name: "Alessandro Martinisi", email: "a.martinisi@fus.edu", institution: "Franklin University Switzerland, Sorengo (Lugano), Switzerland", designation: "Assistant Professor of Media and Communication Studies" },
        { name: "Bhawani Shankar", email: "bhawani.shankar@galgotiasuniversity.edu.in", institution: "Galgotias University, Greater Noida, Uttar Pradesh", designation: "Assistant Professor, School of Media and Communication Studies" },
        { name: "Sunil Mishra", email: "sunil.mishra@vips.edu", institution: "VIPS, Guru Gobind Singh Indraprastha University, New Delhi", designation: "Associate Professor" },
        { name: "Gajendra Pratap Singh", email: "gajendra.pratap@galgotiasuniversity.edu.in", institution: "Galgotias University, Greater Noida, Uttar Pradesh", designation: "Assistant Professor, School of Media and Communication Studies" },
        { name: "Kumari Pallavi", email: "kumari.pallavi@galgotiasuniversity.edu.in", institution: "Galgotias University, Greater Noida, Uttar Pradesh", designation: "Assistant Professor, School of Media and Communication Studies" },
        { name: "Pramod Kumar Pandey", email: "pramod.pandey@galgotiasuniversity.edu.in", institution: "Galgotias University, Greater Noida, Uttar Pradesh", designation: "Assistant Professor, School of Media and Communication Studies" },
        { name: "Mehak Pandit", email: "mehak.pandit@galgotiasuniversity.edu.in", institution: "Galgotias University, Greater Noida, Uttar Pradesh", designation: "Assistant Professor & Research Coordinator, School of Media and Communication Studies" },
      ];

      // No built-in default: a shared known password is a liability.
      const defaultPassword = body.password;
      if (typeof defaultPassword !== "string" || defaultPassword.length < 12) {
        return NextResponse.json({ error: "Provide a `password` of at least 12 characters" }, { status: 400 });
      }
      const hashed = await bcrypt.hash(defaultPassword, 12);

      const results: { email: string; status: string }[] = [];
      for (const member of BOARD) {
        const existing = await prisma.user.findUnique({ where: { email: member.email.toLowerCase() } });
        if (existing) {
          // Already exists — upgrade role to REVIEWER if they're AUTHOR, otherwise leave
          if (existing.role === "AUTHOR") {
            await prisma.user.update({ where: { email: member.email.toLowerCase() }, data: { role: "REVIEWER", emailVerified: true } });
            results.push({ email: member.email, status: "upgraded to REVIEWER" });
          } else {
            results.push({ email: member.email, status: `skipped (already ${existing.role})` });
          }
        } else {
          await prisma.user.create({
            data: {
              name: member.name,
              email: member.email.toLowerCase(),
              password: hashed,
              role: "REVIEWER",
              institution: member.institution,
              designation: member.designation,
              emailVerified: true,
            },
          });
          results.push({ email: member.email, status: "created" });
        }
      }
      return NextResponse.json({ success: true, results });
    }

    // Default: schema migration
    await prisma.$executeRaw`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "emailVerified" BOOLEAN NOT NULL DEFAULT true`;
    await prisma.$executeRaw`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "verifyToken" TEXT`;
    await prisma.$executeRaw`UPDATE "User" SET "emailVerified" = true WHERE "emailVerified" IS NULL`;
    return NextResponse.json({ success: true, message: "Migration complete" });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
