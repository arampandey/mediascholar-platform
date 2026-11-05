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
  assigned: number;   // times asked to review (declined and released assignments, and reviews still within their deadline, are not counted)
  reviewed: number;   // reviews actually submitted
  onTime: number;     // of the reviewed ones, submitted by the deadline
  late: number;
  missed: number;     // retracted or overdue without a review
  avgDays: number | null; // average days from assignment to submission
  rate: number | null;    // reviewed / assigned
};

/** Review record per reviewer ("reviewed 2 of 5 assigned"), built from assignment and review rows. */
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

  type Row = { reviewed: Set<string>; onTime: number; late: number; missed: number; days: number[]; seen: Set<string> };
  const acc = new Map<string, Row>();
  const get = (id: string) => {
    let r = acc.get(id);
    if (!r) { r = { reviewed: new Set(), onTime: 0, late: 0, missed: 0, days: [], seen: new Set() }; acc.set(id, r); }
    return r;
  };

  const assignmentByKey = new Map<string, (typeof assignments)[number]>();
  for (const a of assignments) assignmentByKey.set(`${a.submissionId}:${a.userId}`, a);

  // Every submitted review counts, even if the assignment row is missing (older papers).
  for (const rv of reviews) {
    const row = get(rv.reviewerId);
    const key = `${rv.submissionId}:${rv.reviewerId}`;
    if (row.seen.has(key)) continue;
    row.seen.add(key);
    row.reviewed.add(rv.submissionId);
    const a = assignmentByKey.get(key);
    const submittedAt = rv.submittedAt as Date;
    if (a) {
      const due = a.deadlineAt ? a.deadlineAt.getTime() : a.assignedAt.getTime() + 15 * 86400000;
      if (submittedAt.getTime() <= due) row.onTime++; else row.late++;
      row.days.push((submittedAt.getTime() - a.assignedAt.getTime()) / 86400000);
    } else {
      row.onTime++; // no deadline on record: not held against the reviewer
    }
  }

  // Assignments without a review: missed if retracted or past the deadline; otherwise still in progress (not counted yet)
  const now = Date.now();
  for (const a of assignments) {
    if (a.declineReason && a.declineReason.startsWith("RELEASED")) continue; // released because enough reviews had arrived
    const key = `${a.submissionId}:${a.userId}`;
    const row = get(a.userId);
    if (row.seen.has(key)) continue;
    const overdue = a.deadlineAt ? a.deadlineAt.getTime() < now : false;
    if (a.retractedAt || overdue) { row.missed++; row.seen.add(key); }
  }

  for (const id of userIds) {
    const r = acc.get(id);
    const reviewed = r ? r.reviewed.size : 0;
    const missed = r ? r.missed : 0;
    const assigned = reviewed + missed;
    out.set(id, {
      assigned,
      reviewed,
      onTime: r ? r.onTime : 0,
      late: r ? r.late : 0,
      missed,
      avgDays: r && r.days.length ? Math.round((r.days.reduce((x, y) => x + y, 0) / r.days.length) * 10) / 10 : null,
      rate: assigned ? reviewed / assigned : null,
    });
  }
  return out;
}
