import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const reviewers = await prisma.user.findMany({
    where: { role: "REVIEWER" },
    select: { id: true, name: true, email: true, institution: true },
    orderBy: { name: "asc" },
  });
  return NextResponse.json({ reviewers });
}
