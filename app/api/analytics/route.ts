import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session || !["EDITOR","SUB_EDITOR"].includes((session.user as any).role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const [totalSubmissions, submissionsByStatus, totalUsers, usersByRole, totalReviews, recentSubmissions] = await Promise.all([
    prisma.submission.count(),
    prisma.submission.groupBy({ by: ["status"], _count: { id: true } }),
    prisma.user.count(),
    prisma.user.groupBy({ by: ["role"], _count: { id: true } }),
    prisma.review.count({ where: { submittedAt: { not: null } } }),
    prisma.submission.findMany({ orderBy: { createdAt: "desc" }, take: 6, select: { id:true, title:true, status:true, createdAt:true, author: { select: { name:true } } } }),
  ]);
  const sixMonthsAgo = new Date(); sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5); sixMonthsAgo.setDate(1);
  const submissionsRaw = await prisma.submission.findMany({ where: { createdAt: { gte: sixMonthsAgo } }, select: { createdAt: true } });
  const monthMap: Record<string, number> = {};
  submissionsRaw.forEach(s => { const k = s.createdAt.toISOString().slice(0,7); monthMap[k] = (monthMap[k]||0)+1; });
  const months = []; for (let i=5;i>=0;i--) { const d=new Date(); d.setMonth(d.getMonth()-i); const k=d.toISOString().slice(0,7); months.push({month:k,count:monthMap[k]||0}); }
  return NextResponse.json({ totalSubmissions, submissionsByStatus, totalUsers, usersByRole, totalReviews, recentSubmissions, submissionsPerMonth: months });
}
