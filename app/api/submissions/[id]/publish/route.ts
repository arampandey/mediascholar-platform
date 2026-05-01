import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || (session.user as any).role !== "EDITOR") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const { issueId, doi } = await req.json();

  const submission = await prisma.submission.update({
    where: { id },
    data: { status: "PUBLISHED", publishedAt: new Date(), issueId, doi },
    include: {
      author: { select: { name: true } },
      issue: { include: { volume: true } },
    },
  });

  // 🔁 Auto social media post (fires in background — won't block publish)
  try {
    const issueLabel = submission.issue
      ? `Vol. ${submission.issue.volume.number} (${submission.issue.volume.year}), Issue ${submission.issue.number}`
      : undefined;

    // Fire-and-forget — don't await so publish isn't delayed
    const baseUrl = (process.env.NEXTAUTH_URL || "http://localhost:3000").trim();
    fetch(`${baseUrl}/api/social`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: req.headers.get("cookie") || "" },
      body: JSON.stringify({
        title: submission.title,
        authorName: submission.author?.name || "Unknown",
        doi: doi || undefined,
        fileUrl: submission.fileUrl || undefined,
        issueLabel,
      }),
    }).catch(() => {}); // silently ignore if social post fails
  } catch {}

  return NextResponse.json({ submission });
}
