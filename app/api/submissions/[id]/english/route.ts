import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PLACEHOLDER_RE } from "@/lib/placeholderEmail";
import { getEnglishVersion, saveProposal, setAuthorResponse } from "@/lib/englishVersion";
import { sendEnglishVersionForApproval, sendEnglishVersionResponse } from "@/lib/email";

type Ctx = { params: Promise<{ id: string }> };

async function loadSubmission(id: string) {
  return prisma.submission.findUnique({
    where: { id },
    select: { id: true, title: true, language: true, authorId: true, author: { select: { name: true, email: true } } },
  });
}

// GET: the English version, for the paper's author and for editors / sub-editors.
export async function GET(_req: NextRequest, { params }: Ctx) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const user = session.user as { id?: string; role?: string };
  const sub = await loadSubmission(id);
  if (!sub) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const isEditorial = ["EDITOR", "SUB_EDITOR"].includes(user.role || "");
  if (!isEditorial && sub.authorId !== user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  try {
    return NextResponse.json({ english: await getEnglishVersion(id) });
  } catch {
    return NextResponse.json({ error: "Could not load the English version." }, { status: 500 });
  }
}

// POST: an editor / sub-editor writes the English title + abstract and sends it to the author for approval.
export async function POST(req: NextRequest, { params }: Ctx) {
  const session = await auth();
  const user = session?.user as { id?: string; role?: string } | undefined;
  if (!session || !["EDITOR", "SUB_EDITOR"].includes(user?.role || ""))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const titleEn = String(body.titleEn ?? "").trim();
  const abstractEn = String(body.abstractEn ?? "").trim();
  if (titleEn.length < 3 || titleEn.length > 300)
    return NextResponse.json({ error: "Please enter the English title (3 to 300 characters)." }, { status: 400 });
  if (abstractEn.length < 30 || abstractEn.length > 3000)
    return NextResponse.json({ error: "Please enter the English abstract (30 to 3000 characters)." }, { status: 400 });

  const sub = await loadSubmission(id);
  if (!sub) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (sub.language !== "hi")
    return NextResponse.json({ error: "An English version is only needed for Hindi papers." }, { status: 400 });

  try {
    await saveProposal(id, titleEn, abstractEn, user!.id || "");
  } catch {
    return NextResponse.json({ error: "Could not save. Please try again." }, { status: 500 });
  }

  let emailed = false;
  if (sub.author?.email && !PLACEHOLDER_RE.test(sub.author.email)) {
    await sendEnglishVersionForApproval(sub.author.email, sub.author.name, sub.title, titleEn, abstractEn, id);
    emailed = true;
  }
  return NextResponse.json({ success: true, emailed });
}

// PATCH: the paper's author approves the English version, or asks for changes.
export async function PATCH(req: NextRequest, { params }: Ctx) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const user = session.user as { id?: string };
  const body = await req.json().catch(() => ({}));
  const action = body.action;
  if (action !== "approve" && action !== "changes")
    return NextResponse.json({ error: "Invalid action." }, { status: 400 });
  const note = String(body.note ?? "").trim();
  if (action === "changes" && (note.length < 3 || note.length > 2000))
    return NextResponse.json({ error: "Please describe the changes you would like." }, { status: 400 });

  const sub = await loadSubmission(id);
  if (!sub) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (sub.authorId !== user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  let current;
  try {
    current = await getEnglishVersion(id);
  } catch {
    return NextResponse.json({ error: "Could not load the English version." }, { status: 500 });
  }
  if (!current || current.status !== "PENDING_APPROVAL")
    return NextResponse.json({ error: "There is nothing waiting for your approval." }, { status: 409 });

  try {
    await setAuthorResponse(id, action === "approve", action === "changes" ? note : null);
  } catch {
    return NextResponse.json({ error: "Could not save. Please try again." }, { status: 500 });
  }

  const editorial = await prisma.user.findMany({
    where: { role: { in: ["EDITOR", "SUB_EDITOR"] } },
    select: { name: true, email: true },
  });
  for (const e of editorial) {
    await sendEnglishVersionResponse(e.email, e.name, sub.title, sub.author?.name || "The author", action === "approve", note, id);
  }
  return NextResponse.json({ success: true });
}
