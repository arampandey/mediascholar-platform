import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PLACEHOLDER_RE } from "@/lib/placeholderEmail";

export async function GET() {
  const session = await auth();
  if (!session || (session.user as any).role !== "EDITOR") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const users = await prisma.user.findMany({
    where: { email: { startsWith: "author_", endsWith: "@mediascholar.in" } },
    orderBy: { name: "asc" },
    select: { id: true, name: true, email: true, institution: true, submissions: { select: { title: true, status: true }, take: 3 } },
  });
  return NextResponse.json({ users: users.filter(u => PLACEHOLDER_RE.test(u.email)) });
}
