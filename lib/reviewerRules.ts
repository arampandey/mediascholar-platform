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
  assigned: number;   // times asked to review and either reviewed or closed without a review (declined, released and still-open assignments are not counted)
  reviewed: number;   // reviews actually submitted
  rate: number | null; // reviewed / assigned
};

/** Review record per reviewer ("reviewed 2 of 5 assigned"). Speed is deliberately not considered. */
export async function reviewerStats(userIds: string[]): Promise<Map<string, ReviewerStats>> {
  const out = new Map<string, ReviewerStats>();
  if (userIds.length === 0) return out;

  const assignments = await prisma.submissionReviewer.findMany({
    where: { userId: { in: userIds }, declinedAt: null },
    select: { submissionId: true, userId: true, retractedAt: true, declineReason: true },
  });
  const reviews = await prisma.review.findMany({
    where: { reviewerId: { in: userIds }, submittedAt: { not: null } },
    select: { submissionId: true, reviewerId: true },
  });

  const reviewed = new Map<string, Set<string>>();
  const notReviewed = new Map<string, Set<string>>();
  const add = (m: Map<string, Set<string>>, user: string, sub: string) => {
    let set = m.get(user);
    if (!set) { set = new Set(); m.set(user, set); }
    set.add(sub);
  };

  // Every submitted review counts, even if the assignment row is missing (older papers).
  for (const rv of reviews) add(reviewed, rv.reviewerId, rv.submissionId);

  // Assignment closed without a review (retracted). Released-because-enough-reviews and still-open ones are not counted.
  for (const a of assignments) {
    if (a.declineReason && a.declineReason.startsWith("RELEASED")) continue;
    if (reviewed.get(a.userId)?.has(a.submissionId)) continue;
    if (a.retractedAt) add(notReviewed, a.userId, a.submissionId);
  }

  for (const id of userIds) {
    const r = reviewed.get(id)?.size || 0;
    const n = notReviewed.get(id)?.size || 0;
    out.set(id, { assigned: r + n, reviewed: r, rate: r + n ? r / (r + n) : null });
  }
  return out;
}
