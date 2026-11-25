import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  // "Last modified" for the listing pages = when a paper was last published or changed (not simply today)
  let latest = "2026-11-01";
  try {
    const m = await prisma.submission.aggregate({ _max: { updatedAt: true }, where: { status: "PUBLISHED" } });
    if (m._max.updatedAt) latest = m._max.updatedAt.toISOString().split("T")[0];
  } catch {}
  const today = latest;

  const staticPages = [
    { loc: "https://mediascholar.in", priority: "1.0", changefreq: "weekly", lastmod: today },
    { loc: "https://mediascholar.in/journal", priority: "0.9", changefreq: "weekly", lastmod: today },
    { loc: "https://mediascholar.in/archive", priority: "0.9", changefreq: "weekly", lastmod: today },
    { loc: "https://mediascholar.in/editorial-board", priority: "0.7", changefreq: "monthly", lastmod: "2026-01-01" },
    { loc: "https://mediascholar.in/aims-and-scope", priority: "0.8", changefreq: "monthly", lastmod: "2026-01-01" },
    { loc: "https://mediascholar.in/publication-ethics", priority: "0.6", changefreq: "monthly", lastmod: "2026-11-04" },
    { loc: "https://mediascholar.in/guidelines", priority: "0.6", changefreq: "monthly", lastmod: "2026-01-01" },
    { loc: "https://mediascholar.in/call-for-papers", priority: "0.9", changefreq: "weekly", lastmod: "2026-11-05" },
    { loc: "https://mediascholar.in/contact", priority: "0.5", changefreq: "yearly", lastmod: "2026-01-01" },
  ];

  const urls = staticPages.map((p) => `  <url>
    <loc>${p.loc}</loc>
    <lastmod>${p.lastmod}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`).join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
