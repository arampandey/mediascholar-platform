import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { v2 as cloudinary } from "cloudinary";
import { depositToZenodo } from "@/lib/zenodo";
import { sendPaperPublished } from "@/lib/email";
import { recalcIssuePageNumbers } from "@/lib/pageNumbers";
import { fetchFileBuffer } from "@/lib/pdfFetch";
import { stampPdf } from "@/lib/pdfStamp";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || (session.user as any).role !== "EDITOR") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const { issueId, doi } = await req.json();

  let submission = await prisma.submission.update({
    where: { id },
    data: { status: "PUBLISHED", publishedAt: new Date(), issueId, doi },
    include: {
      author: { select: { name: true, email: true } },
      issue: { include: { volume: true } },
    },
  });

  // 📄 Assign sequential page numbers across the whole issue (Paper 1: 1–n,
  // Paper 2: n+1–m, ...). Recalculated for the full issue every time a new
  // paper is published into it, in publish order.
  if (issueId) {
    try {
      await recalcIssuePageNumbers(issueId);
      submission = await prisma.submission.findUniqueOrThrow({
        where: { id },
        include: {
          author: { select: { name: true, email: true } },
          issue: { include: { volume: true } },
        },
      });
    } catch (e) {
      console.error("[pageNumbers] recalc failed for issue", issueId, e);
    }
  }

  const paperUrl = `https://mediascholar.in/paper/${submission.id}`;

  // 🏷️ Stamp a consistent letterhead (Journal name + ISSN on top, page
  // number + URL on bottom) onto every page — same font/size/spacing for
  // every paper regardless of how the author formatted their manuscript.
  if (submission.issue && submission.pageStart) {
    try {
      const originalBytes = await fetchFileBuffer(submission.fileUrl);
      const magic = originalBytes.slice(0, 4).toString("hex");
      if (magic === "25504446") {
        // Only stamp real PDFs (magic bytes %PDF) — skip anything else defensively
        const stamped = await stampPdf(originalBytes, {
          volume: submission.issue.volume.number,
          year: submission.issue.volume.year,
          issueNumber: submission.issue.number,
          pageStart: submission.pageStart,
          paperUrl,
        });
        const publicId = `mediascholar/papers/${Date.now()}-${submission.id}-stamped`;
        const uploadResult: any = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { resource_type: "raw", public_id: publicId, overwrite: true, access_mode: "public" },
            (err, res) => (err ? reject(err) : resolve(res))
          );
          stream.end(stamped);
        });
        submission = await prisma.submission.update({
          where: { id },
          data: { fileUrl: uploadResult.secure_url },
          include: {
            author: { select: { name: true, email: true } },
            issue: { include: { volume: true } },
          },
        });
      }
    } catch (e) {
      console.error("[pdfStamp] failed to stamp submission", id, e);
    }
  }

  // 📧 Notify the author their paper is now live, with the correct Volume/Issue/DOI
  if (submission.author?.email && submission.issue) {
    const issueLabel = `Vol. ${submission.issue.volume.number} (${submission.issue.volume.year}), ${submission.issue.title || `Issue ${submission.issue.number}`}`;
    void sendPaperPublished(submission.author.email, submission.author.name, submission.title, issueLabel, doi || null, paperUrl).catch((e) =>
      console.error("[email] paper_published send failed:", e)
    );
  }

  // 🗄️ Auto Zenodo archive (fires in background — won't block publish)
  const baseUrl = (process.env.NEXTAUTH_URL || "https://mediascholar.in").trim();
  void (async () => {
    try {
      if (!submission.zenodoRecordId) {
        const zenodoResult = await depositToZenodo(submission);
        if (zenodoResult) {
          await prisma.submission.update({
            where: { id: submission.id },
            data: { zenodoRecordId: zenodoResult.recordId, zenodoUrl: zenodoResult.url },
          });
        }
      }
    } catch (e) {
      console.error("[zenodo] background deposit error:", e);
    }
  })();

  // 🔁 Auto social media post (fires in background — won't block publish)
  try {
    const issueLabel = submission.issue
      ? `Vol. ${submission.issue.volume.number} (${submission.issue.volume.year}), Issue ${submission.issue.number}`
      : undefined;

    // Fire-and-forget — don't await so publish isn't delayed
    fetch(`${baseUrl}/api/social`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: req.headers.get("cookie") || "" },
      body: JSON.stringify({
        title: submission.title,
        authorName: submission.author?.name || "Unknown",
        doi: doi || undefined,
        fileUrl: submission.fileUrl || undefined,
        issueLabel,
      }),
    }).catch(() => {}); // silently ignore if social post fails
  } catch {}

  return NextResponse.json({ submission });
}
