/**
 * Migrates all existing paper files to Cloudinary.
 * Downloads from current URL (GitHub raw or /uploads/ or FTP) and re-uploads to Cloudinary.
 * Updates DB with new Cloudinary URL.
 *
 * Run: node scripts/migrate-to-cloudinary.mjs
 */

import { PrismaClient } from "@prisma/client";
import { v2 as cloudinary } from "cloudinary";
import https from "https";
import http from "http";

const prisma = new PrismaClient();

cloudinary.config({
  cloud_name: "dzewzfak6",
  api_key: "113345153332292",
  api_secret: "N0PrtVi6vq6yrUIqzJ0Ik69GFGo",
});

function fetchBuffer(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith("https") ? https : http;
    client.get(url, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302 || res.statusCode === 308) {
        return fetchBuffer(res.headers.location).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`HTTP ${res.statusCode} for ${url}`));
      }
      const chunks = [];
      res.on("data", (chunk) => chunks.push(chunk));
      res.on("end", () => resolve(Buffer.concat(chunks)));
      res.on("error", reject);
    }).on("error", reject);
  });
}

function uploadToCloudinary(buffer, publicId) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { resource_type: "raw", public_id: publicId, overwrite: true },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );
    stream.end(buffer);
  });
}

function resolveUrl(fileUrl) {
  if (!fileUrl) return null;
  if (fileUrl.startsWith("http")) return fileUrl;
  if (fileUrl.startsWith("/")) return `https://mediascholar.in${fileUrl}`;
  return null;
}

async function main() {
  const submissions = await prisma.submission.findMany({
    select: { id: true, title: true, fileUrl: true },
    orderBy: { createdAt: "asc" },
  });

  console.log(`\nFound ${submissions.length} total submissions\n`);

  let migrated = 0;
  let skipped = 0;
  let failed = 0;

  for (const sub of submissions) {
    const { id, title, fileUrl } = sub;

    // Skip already on Cloudinary
    if (fileUrl && fileUrl.includes("cloudinary.com")) {
      console.log(`⏭  SKIP (already Cloudinary): ${title.slice(0, 50)}`);
      skipped++;
      continue;
    }

    const url = resolveUrl(fileUrl);
    if (!url) {
      console.log(`⚠  SKIP (no URL): ${title.slice(0, 50)}`);
      skipped++;
      continue;
    }

    // Extract filename from URL
    const rawFilename = url.split("/").pop().split("?")[0];
    const ext = rawFilename.includes(".") ? rawFilename.split(".").pop().toLowerCase() : "pdf";
    const publicId = `mediascholar/papers/${id}.${ext}`;

    process.stdout.write(`⬆  Uploading: ${title.slice(0, 50)}... `);

    try {
      const buffer = await fetchBuffer(url);
      const newUrl = await uploadToCloudinary(buffer, publicId);
      await prisma.submission.update({ where: { id }, data: { fileUrl: newUrl } });
      console.log(`✓`);
      migrated++;
    } catch (err) {
      console.log(`✗ FAILED: ${err.message}`);
      failed++;
    }

    // Small delay to avoid rate limits
    await new Promise(r => setTimeout(r, 300));
  }

  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`✅ Migrated:  ${migrated}`);
  console.log(`⏭  Skipped:   ${skipped}`);
  console.log(`❌ Failed:    ${failed}`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
