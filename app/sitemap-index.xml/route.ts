import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>https://mediascholar.in/sitemap.xml</loc>
  </sitemap>
  <sitemap>
    <loc>https://mediascholar.in/sitemap-papers.xml</loc>
  </sitemap>
</sitemapindex>`;

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
