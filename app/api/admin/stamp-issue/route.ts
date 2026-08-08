import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { v2 as cloudinary } from "cloudinary";
import { fetchFileBuffer } from "@/lib/pdfFetch";
import { stampPdf } from "@/lib/pdfStamp";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * ONE-TIME ADMIN FIX — retroactively stamps every already-published paper
 * in a given issue with the consistent letterhead (Journal name + ISSN
 * top, page number + URL bottom). Meant to be run once per issue that
 * predates the auto-stamp-on-publish feature, then the route deleted.
 *
 * Protected by CRON_SECRET (reused, not a new secret).
 */
export async function POST(req: NextRequest) {
  const { secret, issueId } = await req.json().catch(() => ({}));
  if (!secret || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (!issueId) {
    return NextResponse.json({ error: "issueId required" }, { status: 400 });
  }

  const issue = await prisma.issue.findUnique({
    where: { id: issueId },
    include: { volume: true },
  });
  if (!issue) return NextResponse.json({ error: "Issue not found" }, { status: 404 });

  const papers = await prisma.submission.findMany({
    where: { issueId, status: "PUBLISHED" },
    orderBy: { pageStart: "asc" },
    select: { id: true, title: true, fileUrl: true, pageStart: true },
  });

  const results: any[] = [];

  for (const paper of papers) {
    try {
      if (!paper.pageStart) {
        results.push({ id: paper.id, title: paper.title, status: "skipped-no-page-number" });
        continue;
      }
      const originalBytes = await fetchFileBuffer(paper.fileUrl);
      const magic = originalBytes.slice(0, 4).toString("hex");
      if (magic !== "25504446") {
        results.push({ id: paper.id, title: paper.title, status: "skipped-not-pdf" });
        continue;
      }

      const paperUrl = `https://mediascholar.in/paper/${paper.id}`;
      const stamped = await stampPdf(originalBytes, {
        volume: issue.volume.number,
        year: issue.volume.year,
        issueNumber: issue.number,
        pageStart: paper.pageStart,
        paperUrl,
      });

      const publicId = `mediascholar/papers/${Date.now()}-${paper.id}-stamped`;
      const uploadResult: any = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { resource_type: "raw", public_id: publicId, overwrite: true, access_mode: "public" },
          (err, res) => (err ? reject(err) : resolve(res))
        );
        stream.end(stamped);
      });

      await prisma.submission.update({ where: { id: paper.id }, data: { fileUrl: uploadResult.secure_url } });
      results.push({ id: paper.id, title: paper.title, status: "stamped", newUrl: uploadResult.secure_url });
    } catch (e: any) {
      results.push({ id: paper.id, title: paper.title, status: "error", error: e.message });
    }
  }

  return NextResponse.json({ success: true, issue: `Vol. ${issue.volume.number}, Issue ${issue.number}`, results });
}
