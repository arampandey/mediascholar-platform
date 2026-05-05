import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const submissionId = searchParams.get("id");

  if (!submissionId) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  // Get the submission
  const submission = await prisma.submission.findUnique({
    where: { id: submissionId },
    select: { fileUrl: true, title: true, status: true },
  });

  if (!submission?.fileUrl) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  let fileUrl = submission.fileUrl;

  // Build absolute URL for relative paths
  if (fileUrl.startsWith("/")) {
    fileUrl = `https://mediascholar.in${fileUrl}`;
  }

  // Proxy the file so the browser always gets correct Content-Type headers
  // (plain redirects to Cloudinary/GitHub can fail in PDF viewers due to missing
  // Content-Type or CORS issues)
  try {
    const upstream = await fetch(fileUrl);
    if (!upstream.ok) {
      return NextResponse.json(
        { error: `Upstream fetch failed: ${upstream.status}` },
        { status: 502 }
      );
    }

    const body = await upstream.arrayBuffer();

    // Derive a safe filename from the URL
    const rawName = fileUrl.split("/").pop()?.split("?")[0] ?? "paper.pdf";
    const filename = decodeURIComponent(rawName);

    return new NextResponse(body, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${filename}"`,
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch (err) {
    console.error("[download] fetch error:", err);
    return NextResponse.json({ error: "Failed to fetch file" }, { status: 502 });
  }
}
