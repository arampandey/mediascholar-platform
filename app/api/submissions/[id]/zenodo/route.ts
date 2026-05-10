import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { depositToZenodo } from "@/lib/zenodo";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  const role = (session?.user as any)?.role;
  if (!session || !["EDITOR", "SUB_EDITOR"].includes(role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;

  const submission = await prisma.submission.findUnique({
    where: { id },
    include: {
      author: { select: { name: true, institution: true } },
      issue: { include: { volume: true } },
    },
  });

  if (!submission) {
    return NextResponse.json({ error: "Submission not found" }, { status: 404 });
  }
  if (submission.status !== "PUBLISHED") {
    return NextResponse.json(
      { error: "Only published papers can be archived" },
      { status: 400 }
    );
  }
  if (submission.zenodoRecordId) {
    return NextResponse.json(
      {
        error: "Already archived",
        zenodoUrl: submission.zenodoUrl,
        recordId: submission.zenodoRecordId,
      },
      { status: 409 }
    );
  }

  const result = await depositToZenodo(submission);

  if (!result) {
    return NextResponse.json(
      { error: "Zenodo deposit failed — check server logs or ZENODO_TOKEN env var" },
      { status: 500 }
    );
  }

  await prisma.submission.update({
    where: { id },
    data: { zenodoRecordId: result.recordId, zenodoUrl: result.url },
  });

  return NextResponse.json({ success: true, ...result });
}
