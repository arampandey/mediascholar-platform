/**
 * Auto Social Media Post API
 * Called automatically when a new paper is PUBLISHED
 *
 * TO ACTIVATE:
 * Add these to .env.local when accounts are ready:
 *   TWITTER_API_KEY=...
 *   TWITTER_API_SECRET=...
 *   TWITTER_ACCESS_TOKEN=...
 *   TWITTER_ACCESS_SECRET=...
 *   LINKEDIN_ACCESS_TOKEN=...
 *   LINKEDIN_ORG_ID=...         (your LinkedIn Page ID)
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

interface PostPayload {
  title: string;
  authorName: string;
  doi?: string;
  fileUrl?: string;
  issueLabel?: string;
}

function buildPostText({ title, authorName, doi, issueLabel }: PostPayload): string {
  let text = `📄 New Research Published!\n\n"${title}"\n\nAuthor: ${authorName}`;
  if (issueLabel) text += `\nIssue: ${issueLabel}`;
  if (doi) text += `\nDOI: ${doi}`;
  text += `\n\n#MediaScholar #MediaStudies #Research #OpenAccess #Journalism`;
  return text;
}

async function postToTwitter(text: string, url: string) {
  const { TWITTER_API_KEY, TWITTER_API_SECRET, TWITTER_ACCESS_TOKEN, TWITTER_ACCESS_SECRET } = process.env;
  if (!TWITTER_API_KEY || !TWITTER_ACCESS_TOKEN) {
    return { skipped: true, reason: "Twitter credentials not configured" };
  }
  // Uses Twitter API v2 — OAuth 1.0a
  // Install: npm install twitter-api-v2
  // const { TwitterApi } = require("twitter-api-v2");
  // const client = new TwitterApi({ appKey: TWITTER_API_KEY, appSecret: TWITTER_API_SECRET, accessToken: TWITTER_ACCESS_TOKEN, accessSecret: TWITTER_ACCESS_SECRET });
  // await client.v2.tweet(`${text}\n${url}`);
  return { skipped: true, reason: "Twitter posting not yet activated — add credentials to .env.local" };
}

async function postToLinkedIn(text: string, url: string) {
  const { LINKEDIN_ACCESS_TOKEN, LINKEDIN_ORG_ID } = process.env;
  if (!LINKEDIN_ACCESS_TOKEN || !LINKEDIN_ORG_ID) {
    return { skipped: true, reason: "LinkedIn credentials not configured" };
  }
  const body = {
    author: `urn:li:organization:${LINKEDIN_ORG_ID}`,
    lifecycleState: "PUBLISHED",
    specificContent: {
      "com.linkedin.ugc.ShareContent": {
        shareCommentary: { text: `${text}\n${url}` },
        shareMediaCategory: "ARTICLE",
        media: [{ status: "READY", originalUrl: url }],
      },
    },
    visibility: { "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC" },
  };
  const res = await fetch("https://api.linkedin.com/v2/ugcPosts", {
    method: "POST",
    headers: { Authorization: `Bearer ${LINKEDIN_ACCESS_TOKEN}`, "Content-Type": "application/json", "X-Restli-Protocol-Version": "2.0.0" },
    body: JSON.stringify(body),
  });
  if (!res.ok) return { skipped: false, error: await res.text() };
  return { skipped: false, success: true };
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || (session.user as any).role !== "EDITOR") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const payload: PostPayload = await req.json();
  const { title, authorName, doi, fileUrl, issueLabel } = payload;

  if (!title || !authorName) {
    return NextResponse.json({ error: "title and authorName required" }, { status: 400 });
  }

  const text = buildPostText(payload);
  const url = fileUrl || "https://mediascholar.in";

  const [twitterResult, linkedinResult] = await Promise.all([
    postToTwitter(text, url),
    postToLinkedIn(text, url),
  ]);

  return NextResponse.json({
    text,
    twitter: twitterResult,
    linkedin: linkedinResult,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(text + "\n" + url)}`,
  });
}
