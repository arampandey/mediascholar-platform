import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// CrossRef DOI Registration API
// Docs: https://www.crossref.org/documentation/register-maintain-records/register-dois/

const CROSSREF_LOGIN = process.env.CROSSREF_LOGIN || "";
const CROSSREF_PASSWORD = process.env.CROSSREF_PASSWORD || "";
const CROSSREF_DEPOSITOR_NAME = process.env.CROSSREF_DEPOSITOR_NAME || "Media Scholar";
const CROSSREF_DEPOSITOR_EMAIL = process.env.CROSSREF_DEPOSITOR_EMAIL || "mediascholarjournal@gmail.com";
const CROSSREF_REGISTRANT = process.env.CROSSREF_REGISTRANT || "Media Scholar Journal";
const DOI_PREFIX = process.env.DOI_PREFIX || "10.XXXXX"; // Replace with real prefix after CrossRef approval

function generateDoiSuffix(submissionId: string): string {
  // e.g. ms.2026.001 style — use last 6 chars of ID for uniqueness
  const short = submissionId.slice(-6);
  const year = new Date().getFullYear();
  return `ms.${year}.${short}`;
}

function buildCrossrefXml(params: {
  doi: string;
  url: string;
  title: string;
  authorName: string;
  authorInstitution?: string | null;
  journalTitle: string;
  issn: string;
  volume: string;
  issue: string;
  year: string;
  month: string;
  abstract?: string | null;
  language: string;
  submissionId: string;
}): string {
  const timestamp = Date.now();
  const batchId = `ms-deposit-${timestamp}`;

  // Escape XML special chars
  const esc = (s: string) => s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

  const abstractXml = params.abstract
    ? `<jats:abstract><jats:p>${esc(params.abstract.slice(0, 500))}</jats:p></jats:abstract>`
    : "";

  return `<?xml version="1.0" encoding="UTF-8"?>
<doi_batch version="5.3.1" xmlns="http://www.crossref.org/schema/5.3.1"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xmlns:jats="http://www.ncbi.nlm.nih.gov/JATS1"
  xsi:schemaLocation="http://www.crossref.org/schema/5.3.1 https://www.crossref.org/schemas/crossref5.3.1.xsd">
  <head>
    <doi_batch_id>${batchId}</doi_batch_id>
    <timestamp>${timestamp}</timestamp>
    <depositor>
      <depositor_name>${esc(CROSSREF_DEPOSITOR_NAME)}</depositor_name>
      <email_address>${esc(CROSSREF_DEPOSITOR_EMAIL)}</email_address>
    </depositor>
    <registrant>${esc(CROSSREF_REGISTRANT)}</registrant>
  </head>
  <body>
    <journal>
      <journal_metadata language="${params.language === "hi" ? "hi" : "en"}">
        <full_title>${esc(params.journalTitle)}</full_title>
        <issn media_type="electronic">${esc(params.issn)}</issn>
      </journal_metadata>
      <journal_issue>
        <publication_date media_type="online">
          <month>${params.month}</month>
          <year>${params.year}</year>
        </publication_date>
        <journal_volume>
          <volume>${esc(params.volume)}</volume>
        </journal_volume>
        <issue>${esc(params.issue)}</issue>
      </journal_issue>
      <journal_article publication_type="full_text" language="${params.language === "hi" ? "hi" : "en"}">
        <titles>
          <title>${esc(params.title)}</title>
        </titles>
        <contributors>
          <person_name sequence="first" contributor_role="author">
            <surname>${esc(params.authorName.split(" ").slice(-1)[0] || params.authorName)}</surname>
            <given_name>${esc(params.authorName.split(" ").slice(0, -1).join(" ") || "")}</given_name>
            ${params.authorInstitution ? `<affiliation>${esc(params.authorInstitution)}</affiliation>` : ""}
          </person_name>
        </contributors>
        ${abstractXml}
        <publication_date media_type="online">
          <month>${params.month}</month>
          <year>${params.year}</year>
        </publication_date>
        <doi_data>
          <doi>${esc(params.doi)}</doi>
          <resource>${esc(params.url)}</resource>
        </doi_data>
      </journal_article>
    </journal>
  </body>
</doi_batch>`;
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || (session.user as any).role !== "EDITOR") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { submissionId, preview } = await req.json();

  if (!submissionId) {
    return NextResponse.json({ error: "submissionId required" }, { status: 400 });
  }

  const paper = await prisma.submission.findUnique({
    where: { id: submissionId },
    include: {
      author: { select: { name: true, institution: true } },
      issue: { include: { volume: true } },
    },
  });

  if (!paper) return NextResponse.json({ error: "Paper not found" }, { status: 404 });
  if (paper.status !== "PUBLISHED") return NextResponse.json({ error: "Paper must be published before registering DOI" }, { status: 400 });

  // Generate DOI if not already set
  const suffix = generateDoiSuffix(submissionId);
  const doi = paper.doi || `${DOI_PREFIX}/${suffix}`;
  const pageUrl = `https://mediascholar.in/paper/${submissionId}`;

  const vol = paper.issue?.volume;
  const iss = paper.issue;
  const pubDate = paper.publishedAt || new Date();
  const year = String(vol?.year || pubDate.getFullYear());
  const month = String(pubDate.getMonth() + 1).padStart(2, "0");

  const xml = buildCrossrefXml({
    doi,
    url: pageUrl,
    title: paper.title,
    authorName: paper.author?.name || "Unknown Author",
    authorInstitution: paper.author?.institution,
    journalTitle: "Media Scholar — Journal of Media Studies and Humanities",
    issn: "3048-5029",
    volume: String(vol?.number || ""),
    issue: String(iss?.number || ""),
    year,
    month,
    abstract: paper.abstract,
    language: paper.language || "en",
    submissionId,
  });

  // Preview mode — just return the XML and proposed DOI without depositing
  if (preview) {
    return NextResponse.json({ doi, xml, pageUrl });
  }

  // Check CrossRef credentials are configured
  if (!CROSSREF_LOGIN || CROSSREF_LOGIN === "" || DOI_PREFIX === "10.XXXXX") {
    return NextResponse.json({
      error: "CrossRef credentials not configured. Add CROSSREF_LOGIN, CROSSREF_PASSWORD, and DOI_PREFIX to environment variables.",
      doi,
      xml,
    }, { status: 503 });
  }

  // Deposit with CrossRef
  try {
    const formData = new FormData();
    formData.append("login_id", CROSSREF_LOGIN);
    formData.append("login_passwd", CROSSREF_PASSWORD);
    formData.append("operation", "doMDUpload");
    formData.append("fname", new Blob([xml], { type: "application/xml" }), "deposit.xml");

    const crossrefRes = await fetch("https://doi.crossref.org/servlet/deposit", {
      method: "POST",
      body: formData,
    });

    const responseText = await crossrefRes.text();

    if (!crossrefRes.ok || responseText.includes("ERROR")) {
      return NextResponse.json({
        error: "CrossRef deposit failed",
        details: responseText.slice(0, 500),
        doi,
      }, { status: 500 });
    }

    // Save DOI to DB
    await prisma.submission.update({
      where: { id: submissionId },
      data: { doi },
    });

    return NextResponse.json({
      success: true,
      doi,
      message: `DOI ${doi} registered successfully with CrossRef`,
      crossrefResponse: responseText.slice(0, 200),
    });

  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
