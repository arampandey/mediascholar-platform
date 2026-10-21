import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Body: { updates: [{ id, email }] }. Each row is validated independently; valid rows are saved.
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || (session.user as any).role !== "EDITOR") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { updates } = await req.json().catch(() => ({}));
  if (!Array.isArray(updates) || updates.length === 0 || updates.length > 200) return NextResponse.json({ error: "Provide 1–200 updates." }, { status: 400 });

  const results: { id: string; ok: boolean; error?: string }[] = [];
  const seen = new Set<string>();
  for (const u of updates) {
    const id = String(u?.id ?? "");
    const email = String(u?.email ?? "").trim().toLowerCase();
    if (!id) { results.push({ id, ok: false, error: "Missing user" }); continue; }
    if (!/^\S+@\S+\.\S+$/.test(email)) { results.push({ id, ok: false, error: "Invalid email address" }); continue; }
    if (email.endsWith("@mediascholar.in")) { results.push({ id, ok: false, error: "Still a placeholder (@mediascholar.in) address" }); continue; }
    if (seen.has(email)) { results.push({ id, ok: false, error: "Same email used twice in this list" }); continue; }
    seen.add(email);
    const clash = await prisma.user.findFirst({ where: { email, id: { not: id } }, select: { name: true } });
    if (clash) { results.push({ id, ok: false, error: `Already used by another account (${clash.name})` }); continue; }
    try {
      await prisma.user.update({ where: { id }, data: { email } });
      results.push({ id, ok: true });
    } catch (e: any) {
      results.push({ id, ok: false, error: e.code === "P2025" ? "User not found" : "Could not save" });
    }
  }
  return NextResponse.json({ results });
}
