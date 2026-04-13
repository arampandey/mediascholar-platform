import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const papers = await prisma.submission.findMany({
      where: { status: "PUBLISHED" },
      select: { id: true, publishedAt: true, updatedAt: true },
      orderBy: { publishedAt: "desc" },
    });

    const urls = papers.map((p) => {
      const lastmod = (p.publishedAt || p.updatedAt).toISOString().split("T")[0];
      return `  <url>
    <loc>https://mediascholar.in/paper/${p.id}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`;
    }).join("\n");

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
  } catch {
    return new NextResponse("Error generating sitemap", { status: 500 });
  }
}
