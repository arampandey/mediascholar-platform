import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();
  if ((session?.user as { role?: string } | undefined)?.role !== "EDITOR") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const issues = await prisma.issue.findMany({
    orderBy: [{ volumeId: "asc" }, { number: "asc" }],
    include: { volume: true, _count: { select: { submissions: true } } },
  });
  return NextResponse.json(issues.map(i => ({
    id: i.id,
    vol: i.volume.number,
    year: i.volume.year,
    issue: i.number,
    title: i.title,
    publishedAt: i.publishedAt,
    papers: i._count.submissions,
  })));
}
