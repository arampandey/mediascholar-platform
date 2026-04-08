/**
 * Automated Review Reminder & Retraction Cron Job
 * Called daily by Vercel Cron (configured in vercel.json)
 *
 * Schedule:
 * - Day 15: Send reminder to reviewer
 * - Day 21: Retract assignment + notify reviewer + notify editor to assign replacement
 * - Day 28 (replacement): Send reminder to replacement reviewer
 * - Day 35 (replacement): Final retraction
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendReviewReminder, sendReviewRetraction } from "@/lib/email";

const CRON_SECRET = process.env.CRON_SECRET || "mediascholar-cron-2026";

export async function GET(req: NextRequest) {
  // Verify cron secret
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  let reminders = 0, retractions = 0;

  // Get all active reviewer assignments (not retracted, review not submitted)
  const assignments = await prisma.submissionReviewer.findMany({
    where: { retractedAt: null },
    include: {
      user: { select: { id: true, name: true, email: true } },
      submission: { select: { id: true, title: true } },
    },
  });

  for (const a of assignments) {
    if (!a.deadlineAt) continue;

    // Check if review already submitted
    const review = await prisma.review.findFirst({
      where: { submissionId: a.submissionId, reviewerId: a.userId, submittedAt: { not: null } },
    });
    if (review) continue; // Already done

    const assignedAt = a.assignedAt;
    const daysSinceAssigned = Math.floor((now.getTime() - assignedAt.getTime()) / (1000 * 60 * 60 * 24));
    const deadlineDays = a.isReplacement ? 7 : 15;
    const retractionDays = a.isReplacement ? 14 : 21;

    // Send reminder at deadline day (day 15 for normal, day 7 for replacement)
    if (daysSinceAssigned >= deadlineDays && !a.reminderSentAt) {
      const daysLeft = retractionDays - daysSinceAssigned;
      if (daysLeft > 0) {
        await sendReviewReminder(a.user.email, a.user.name, a.submission.title, daysLeft);
        await prisma.submissionReviewer.update({
          where: { id: a.id },
          data: { reminderSentAt: now },
        });
        console.log(`Reminder sent: ${a.user.name} for ${a.submission.title}`);
        reminders++;
      }
    }

    // Retract at day 21 (normal) or day 14 (replacement)
    if (daysSinceAssigned >= retractionDays) {
      await sendReviewRetraction(a.user.email, a.user.name, a.submission.title);
      await prisma.submissionReviewer.update({
        where: { id: a.id },
        data: { retractedAt: now },
      });

      // Notify editors to assign replacement
      const editors = await prisma.user.findMany({ where: { role: "EDITOR" }, select: { email: true, name: true } });
      const nodemailer = (await import("nodemailer")).default;
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD },
      });
      for (const ed of editors) {
        await transporter.sendMail({
          from: `"Media Scholar" <${process.env.GMAIL_USER}>`,
          to: ed.email,
          subject: `Action Required: Assign Replacement Reviewer — ${a.submission.title}`,
          html: `<p>Dear ${ed.name},</p><p>The review assignment for <strong>${a.submission.title}</strong> by <strong>${a.user.name}</strong> has been retracted due to non-submission after ${retractionDays} days.</p><p>Please log in to the editor dashboard and assign a replacement reviewer. The replacement reviewer will have <strong>7 days</strong> to complete the review.</p><p><a href="https://mediascholar.in/dashboard/editor/submission/${a.submission.id}" style="background:#1a2744;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;display:inline-block;margin-top:8px;">Assign Replacement →</a></p>`,
        });
      }

      console.log(`Retracted: ${a.user.name} for ${a.submission.title}`);
      retractions++;
    }
  }

  return NextResponse.json({
    success: true,
    processed: assignments.length,
    reminders,
    retractions,
    timestamp: now.toISOString(),
  });
}
