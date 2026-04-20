/**
 * Re-uploads all papers using resource_type:"raw", type:"upload" (public delivery).
 * Matches local files to DB records, uploads fresh, updates DB.
 */
import { PrismaClient } from "@prisma/client";
import { v2 as cloudinary } from "cloudinary";
import { readFileSync, readdirSync } from "fs";
import { join } from "path";

const prisma = new PrismaClient();
cloudinary.config({ cloud_name: "dzewzfak6", api_key: "113345153332292", api_secret: "N0PrtVi6vq6yrUIqzJ0Ik69GFGo" });

const UPLOADS_DIR = "/Users/arampandey/Projects/mediascholar-platform/public/uploads";

function upload(buffer, publicId) {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      { resource_type: "raw", public_id: publicId, type: "upload", overwrite: true, invalidate: true },
      (err, res) => err ? reject(err) : resolve(res.secure_url)
    ).end(buffer);
  });
}

async function main() {
  const files = readdirSync(UPLOADS_DIR);
  const subs = await prisma.submission.findMany({
    select: { id: true, fileUrl: true, title: true },
    orderBy: { createdAt: "asc" },
  });

  console.log(`\n${subs.length} submissions, ${files.length} local files\n`);

  let ok = 0, skipped = 0, failed = 0;

  for (const sub of subs) {
    if (!sub.fileUrl) { skipped++; continue; }

    // Find local file — match by paper ID suffix (last 10 chars of cuid) or full id
    const idSuffix = sub.id.slice(-10);
    const localFile =
      files.find(f => f.includes(idSuffix)) ||
      files.find(f => f.includes(sub.id)) ||
      // fallback: match by descriptive name patterns
      null;

    if (!localFile) {
      console.log(`⚠  No local file: ${sub.title.slice(0, 55)}`);
      skipped++;
      continue;
    }

    const ext = localFile.split(".").pop().toLowerCase();
    const publicId = `mediascholar/papers/${sub.id}`;  // no extension in public_id
    const buffer = readFileSync(join(UPLOADS_DIR, localFile));

    process.stdout.write(`⬆  ${sub.title.slice(0, 55)}... `);
    try {
      const newUrl = await upload(buffer, publicId);
      await prisma.submission.update({ where: { id: sub.id }, data: { fileUrl: newUrl } });
      console.log("✓");
      ok++;
    } catch (e) {
      console.log(`✗ ${e.message}`);
      failed++;
    }
    await new Promise(r => setTimeout(r, 250));
  }

  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`✅ Done:    ${ok}`);
  console.log(`⏭  Skipped: ${skipped}`);
  console.log(`❌ Failed:  ${failed}`);
  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
