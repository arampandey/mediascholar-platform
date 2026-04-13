import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DEFAULT_TEMPLATES } from "@/lib/emailTemplates";

// PATCH — save/update a template
export async function PATCH(req: NextRequest, { params }: { params: { key: string } }) {
  const session = await auth();
  const role = (session?.user as any)?.role;
  if (!session || !["EDITOR", "SUB_EDITOR"].includes(role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { subject, body } = await req.json();
  const def = DEFAULT_TEMPLATES.find((t) => t.key === params.key);
  if (!def) return NextResponse.json({ error: "Template not found" }, { status: 404 });

  const template = await prisma.emailTemplate.upsert({
    where: { key: params.key },
    update: { subject, body },
    create: { key: params.key, label: def.label, subject, body, variables: def.variables },
  });

  return NextResponse.json({ template });
}

// DELETE — reset template to default
export async function DELETE(req: NextRequest, { params }: { params: { key: string } }) {
  const session = await auth();
  const role = (session?.user as any)?.role;
  if (!session || role !== "EDITOR") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await prisma.emailTemplate.deleteMany({ where: { key: params.key } });
  return NextResponse.json({ message: "Reset to default" });
}
