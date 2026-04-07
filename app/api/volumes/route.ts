import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const volumes = await prisma.volume.findMany({
    orderBy: { number: "desc" },
    include: { issues: { orderBy: { number: "asc" }, include: { _count: { select: { submissions: true } } } } },
  });
  return NextResponse.json({ volumes });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || (session.user as any).role !== "EDITOR") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { number, year } = await req.json();
  const volume = await prisma.volume.create({ data: { number, year } });
  return NextResponse.json({ volume });
}
