import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth();
  if (!session) redirect("/login");
  const role = (session.user as any).role;
  if (role === "EDITOR") redirect("/dashboard/editor");
  if (role === "SUB_EDITOR") redirect("/dashboard/sub-editor");
  if (role === "REVIEWER") redirect("/dashboard/reviewer");
  redirect("/dashboard/author");
}
