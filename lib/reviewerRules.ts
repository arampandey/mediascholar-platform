import { prisma } from "@/lib/prisma";

/**
 * Reviewer conflict rules for one submission.
 * Returns a map of userId -> reason for everyone who must not review it:
 *  - the author of the paper itself (never overridable)
 *  - anyone who has submitted a paper to the same issue
 *  - anyone already actively assigned to another paper in the same issue
 * Released / retracted / declined assignments do not block a reviewer.
 */
export async function blockedReviewers(submissionId: string): Promise<Map<string, { reason: string; hard: boolean }>> {
  const blocked = new Map<string, { reason: string; hard: boolean }>();
  const sub = await prisma.submission.findUnique({
    where: { id: submissionId },
    select: { authorId: true, issueId: true },
  });
  if (!sub) return blocked;

  blocked.set(sub.authorId, { reason: "Author of this paper", hard: true });

  if (sub.issueId) {
    const issuePapers = await prisma.submission.findMany({
      where: { issueId: sub.issueId, id: { not: submissionId } },
      select: { authorId: true },
    });
    for (const p of issuePapers) {
      if (!blocked.has(p.authorId)) blocked.set(p.authorId, { reason: "Has a paper in this issue", hard: false });
    }

    const used = await prisma.submissionReviewer.findMany({
      where: {
        retractedAt: null,
        declinedAt: null,
        submissionId: { not: submissionId },
        submission: { issueId: sub.issueId },
      },
      select: { userId: true },
    });
    for (const u of used) {
      if (!blocked.has(u.userId)) blocked.set(u.userId, { reason: "Already reviewing another paper in this issue", hard: false });
    }
  }
  return blocked;
}

export type ReviewerStats = {
  completed: number;   // reviews that were due (submitted or missed)
  onTime: number;
  late: number;
  missed: number;      // retracted for not submitting
  avgDays: number | null; // average days from assignment to submission
  rate: number | null;    // onTime / completed
};

/** Timeliness record per reviewer, built from existing assignment and review dates. */
export async function reviewerStats(userIds: string[]): Promise<Map<string, ReviewerStats>> {
  const out = new Map<string, ReviewerStats>();
  if (userIds.length === 0) return out;

  const assignments = await prisma.submissionReviewer.findMany({
    where: { userId: { in: userIds }, declinedAt: null },
    select: { submissionId: true, userId: true, assignedAt: true, deadlineAt: true, retractedAt: true, declineReason: true },
  });
  const reviews = await prisma.review.findMany({
    where: { reviewerId: { in: userIds }, submittedAt: { not: null } },
    select: { submissionId: true, reviewerId: true, submittedAt: true },
  });
  const done = new Map<string, Date>();
  for (const r of reviews) done.set(`${r.submissionId}:${r.reviewerId}`, r.submittedAt as Date);

  const acc = new Map<string, { onTime: number; late: number; missed: number; days: number[] }>();
  for (const a of assignments) {
    // Released because enough reviews had arrived: no fault, not counted.
    if (a.declineReason && a.declineReason.startsWith("RELEASED")) continue;
    const row = acc.get(a.userId) || { onTime: 0, late: 0, missed: 0, days: [] };
    const submittedAt = done.get(`${a.submissionId}:${a.userId}`);
    if (submittedAt) {
      const due = a.deadlineAt ? a.deadlineAt.getTime() : a.assignedAt.getTime() + 15 * 86400000;
      if (submittedAt.getTime() <= due) row.onTime++; else row.late++;
      row.days.push((submittedAt.getTime() - a.assignedAt.getTime()) / 86400000);
    } else if (a.retractedAt) {
      row.missed++;
    } // still pending: not counted yet
    acc.set(a.userId, row);
  }
  for (const id of userIds) {
    const r = acc.get(id) || { onTime: 0, late: 0, missed: 0, days: [] };
    const completed = r.onTime + r.late + r.missed;
    out.set(id, {
      completed,
      onTime: r.onTime,
      late: r.late,
      missed: r.missed,
      avgDays: r.days.length ? Math.round((r.days.reduce((x, y) => x + y, 0) / r.days.length) * 10) / 10 : null,
      rate: completed ? r.onTime / completed : null,
    });
  }
  return out;
}
