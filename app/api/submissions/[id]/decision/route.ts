import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendFinalDecision } from "@/lib/email";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const role = (session?.user as any)?.role;
  if (!session || !([ "EDITOR", "SUB_EDITOR" ].includes(role)))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const { decision, notes } = await req.json();

  const status = decision === "ACCEPT" ? "ACCEPTED" : decision === "REJECT" ? "REJECTED" : "REVISION_REQUESTED";
  const submission = await prisma.submission.update({
    where: { id },
    data: { editorDecision: decision, decisionNotes: notes, decisionAt: new Date(), status },
    include: { author: true },
  });
  if (submission.author) await sendFinalDecision(submission.author.email, submission.author.name, submission.title, decision, notes || "");
  return NextResponse.json({ submission });
}
