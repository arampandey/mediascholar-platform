import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const role = (session?.user as any)?.role;
  // Only editors/sub-editors may change a submission's status directly.
  // (Authors must go through /revision or plagiarism/review flows.)
  if (!session || !["EDITOR", "SUB_EDITOR"].includes(role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { id } = await params;
  const { status } = await req.json();
  const submission = await prisma.submission.update({ where: { id }, data: { status } });
  return NextResponse.json({ submission });
}
