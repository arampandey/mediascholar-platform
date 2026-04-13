import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DEFAULT_TEMPLATES } from "@/lib/emailTemplates";

// PATCH — save/update a template
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ key: string }> }) {
  const session = await auth();
  const role = (session?.user as any)?.role;
  if (!session || !["EDITOR", "SUB_EDITOR"].includes(role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { key } = await params;
  const { subject, body } = await req.json();
  const def = DEFAULT_TEMPLATES.find((t) => t.key === key);
  if (!def) return NextResponse.json({ error: `Template not found: ${key}` }, { status: 404 });

  try {
    const template = await prisma.emailTemplate.upsert({
      where: { key },
      update: { subject, body },
      create: { key, label: def.label, subject, body, variables: def.variables },
    });

    return NextResponse.json({
      template: {
        key: template.key,
        label: template.label,
        subject: template.subject,
        body: template.body,
        variables: template.variables,
        updatedAt: template.updatedAt,
      }
    });
  } catch (e: any) {
    console.error("Email template save error:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// DELETE — reset template to default
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ key: string }> }) {
  const session = await auth();
  const role = (session?.user as any)?.role;
  if (!session || role !== "EDITOR") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { key } = await params;
  await prisma.emailTemplate.deleteMany({ where: { key } });
  return NextResponse.json({ message: "Reset to default" });
}
