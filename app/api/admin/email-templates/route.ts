import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DEFAULT_TEMPLATES } from "@/lib/emailTemplates";

// GET — list all templates (DB overrides merged with defaults)
export async function GET() {
  const session = await auth();
  const role = (session?.user as any)?.role;
  if (!session || !["EDITOR", "SUB_EDITOR"].includes(role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const dbTemplates = await prisma.emailTemplate.findMany();
  const dbMap = Object.fromEntries(dbTemplates.map((t) => [t.key, t]));

  const templates = DEFAULT_TEMPLATES.map((def) => ({
    ...def,
    subject: dbMap[def.key]?.subject ?? def.subject,
    body: dbMap[def.key]?.body ?? def.body,
    customised: !!dbMap[def.key],
    updatedAt: dbMap[def.key]?.updatedAt ?? null,
  }));

  return NextResponse.json({ templates });
}

// POST — seed all defaults into DB (first-time setup)
export async function POST(req: NextRequest) {
  const session = await auth();
  const role = (session?.user as any)?.role;
  if (!session || role !== "EDITOR") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  if (body.action === "seed") {
    let seeded = 0;
    for (const t of DEFAULT_TEMPLATES) {
      const existing = await prisma.emailTemplate.findUnique({ where: { key: t.key } });
      if (!existing) {
        await prisma.emailTemplate.create({
          data: { key: t.key, label: t.label, subject: t.subject, body: t.body, variables: t.variables },
        });
        seeded++;
      }
    }
    return NextResponse.json({ message: `Seeded ${seeded} templates` });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
