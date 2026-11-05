import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { blockedReviewers, reviewerStats } from "@/lib/reviewerRules";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const role = (session.user as { role?: string }).role || "";
  if (!["EDITOR", "SUB_EDITOR"].includes(role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const submissionId = searchParams.get("submissionId");

  // Who may not review this paper (own paper, authors in the same issue, already used in the same issue)
  const blocked = submissionId ? await blockedReviewers(submissionId) : new Map();

  const users = await prisma.user.findMany({
    // Sub-editors can also review papers (e.g. a board member who is both reviewer and sub-editor)
    where: { role: { in: ["REVIEWER", "SUB_EDITOR"] } },
    select: { id: true, name: true, email: true, institution: true, role: true },
    orderBy: { name: "asc" },
  });

  const stats = await reviewerStats(users.map(u => u.id));

  // Ranking: highest share of assigned papers actually reviewed first (e.g. 2 of 5), then most reviews. Speed is not considered.
  // Reviewers with no history yet go last (alphabetical).
  const rank = (id: string) => stats.get(id)!;
  const sorted = [...users].sort((a, b) => {
    const ra = rank(a.id), rb = rank(b.id);
    if (ra.rate === null && rb.rate === null) return a.name.localeCompare(b.name);
    if (ra.rate === null) return 1;
    if (rb.rate === null) return -1;
    if (rb.rate !== ra.rate) return rb.rate - ra.rate;
    if (rb.reviewed !== ra.reviewed) return rb.reviewed - ra.reviewed;
    return a.name.localeCompare(b.name);
  });

  const reviewers = sorted.map(u => ({
    ...u,
    stats: stats.get(u.id),
    blockedReason: blocked.get(u.id)?.reason || null,
    blockedHard: blocked.get(u.id)?.hard || false,
  }));

  return NextResponse.json({ reviewers, canOverride: role === "EDITOR" });
}
