/**
 * Re-uploads all papers from public/uploads/ to Cloudinary with access_mode: "public".
 * Matches each file to its DB record by paper ID embedded in filename.
 */
import { PrismaClient } from "@prisma/client";
import { v2 as cloudinary } from "cloudinary";
import { readFileSync, readdirSync } from "fs";
import { join } from "path";

const prisma = new PrismaClient();

cloudinary.config({
  cloud_name: "dzewzfak6",
  api_key: "113345153332292",
  api_secret: "N0PrtVi6vq6yrUIqzJ0Ik69GFGo",
});

function uploadPublic(buffer, publicId) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { resource_type: "raw", public_id: publicId, overwrite: true, access_mode: "public", type: "upload" },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );
    stream.end(buffer);
  });
}

async function main() {
  const uploadsDir = "/Users/arampandey/Projects/mediascholar-platform/public/uploads";
  const files = readdirSync(uploadsDir);

  // Get all submissions with Cloudinary URLs so we can match by paper ID in URL
  const submissions = await prisma.submission.findMany({
    where: { fileUrl: { contains: "cloudinary.com" } },
    select: { id: true, fileUrl: true, title: true },
  });

  console.log(`\nFound ${submissions.length} Cloudinary submissions, ${files.length} local files\n`);

  let fixed = 0, skipped = 0, failed = 0;

  for (const sub of submissions) {
    // Extract paper ID from Cloudinary URL: .../mediascholar/papers/<id>.ext
    const match = sub.fileUrl.match(/mediascholar\/papers\/([^.]+)/);
    if (!match) { console.log(`⚠ Can't parse ID from: ${sub.fileUrl}`); skipped++; continue; }
    const paperId = match[1];

    // Find matching local file (filename contains the paper ID suffix)
    // DB id like cmnoar4fg002h7wb62lspzrqn → file paper_b62lspzrqn.pdf (last 10 chars)
    const idSuffix = paperId.slice(-10);
    const localFile = files.find(f => f.includes(idSuffix) || f.includes(paperId));

    if (!localFile) {
      // Try matching by full paper ID
      const altFile = files.find(f => f.includes(sub.id));
      if (!altFile) {
        console.log(`⚠ No local file for: ${sub.title.slice(0, 50)} (id: ${paperId})`);
        skipped++;
        continue;
      }
    }

    const filename = localFile || files.find(f => f.includes(sub.id));
    const ext = filename.split(".").pop().toLowerCase();
    const publicId = `mediascholar/papers/${sub.id}.${ext}`;
    const buffer = readFileSync(join(uploadsDir, filename));

    process.stdout.write(`⬆  ${sub.title.slice(0, 50)}... `);
    try {
      const newUrl = await uploadPublic(buffer, publicId);
      if (newUrl !== sub.fileUrl) {
        await prisma.submission.update({ where: { id: sub.id }, data: { fileUrl: newUrl } });
      }
      console.log("✓");
      fixed++;
    } catch (err) {
      console.log(`✗ ${err.message}`);
      failed++;
    }
    await new Promise(r => setTimeout(r, 300));
  }

  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`✅ Fixed:   ${fixed}`);
  console.log(`⏭  Skipped: ${skipped}`);
  console.log(`❌ Failed:  ${failed}`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
