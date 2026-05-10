import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { depositToZenodo } from "@/lib/zenodo";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || (session.user as any).role !== "EDITOR") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await params;
  await prisma.issue.update({ where: { id }, data: { publishedAt: new Date() } });
  await prisma.submission.updateMany({ where: { issueId: id, status: "ACCEPTED" }, data: { status: "PUBLISHED", publishedAt: new Date() } });

  // 🗄️ Archive newly published papers to Zenodo in background
  void (async () => {
    try {
      const papers = await prisma.submission.findMany({
        where: { issueId: id, status: "PUBLISHED", zenodoRecordId: null },
        include: {
          author: { select: { name: true, institution: true } },
          issue: { include: { volume: true } },
        },
      });
      for (const paper of papers) {
        try {
          const result = await depositToZenodo(paper);
          if (result) {
            await prisma.submission.update({
              where: { id: paper.id },
              data: { zenodoRecordId: result.recordId, zenodoUrl: result.url },
            });
          }
        } catch (e) {
          console.error(`[zenodo] deposit failed for ${paper.id}:`, e);
        }
      }
    } catch (e) {
      console.error("[zenodo] bulk deposit error:", e);
    }
  })();

  return NextResponse.json({ success: true });
}
