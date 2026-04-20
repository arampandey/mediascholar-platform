/**
 * Sets all Cloudinary raw assets in mediascholar/papers/ to public access.
 * Run: DATABASE_URL=... node scripts/fix-cloudinary-access.mjs
 */
import { PrismaClient } from "@prisma/client";
import { v2 as cloudinary } from "cloudinary";

const prisma = new PrismaClient();

cloudinary.config({
  cloud_name: "dzewzfak6",
  api_key: "113345153332292",
  api_secret: "N0PrtVi6vq6yrUIqzJ0Ik69GFGo",
});

async function main() {
  // Get all Cloudinary URLs from DB
  const submissions = await prisma.submission.findMany({
    where: { fileUrl: { contains: "cloudinary.com" } },
    select: { id: true, fileUrl: true, title: true },
  });

  console.log(`\nFound ${submissions.length} Cloudinary files to fix\n`);

  let fixed = 0;
  let failed = 0;

  for (const sub of submissions) {
    // Extract public_id from URL
    // URL format: https://res.cloudinary.com/dzewzfak6/raw/upload/v.../mediascholar/papers/xxx.pdf
    const match = sub.fileUrl.match(/\/upload\/(?:v\d+\/)?(.+)$/);
    if (!match) { console.log(`⚠ Can't parse: ${sub.fileUrl}`); failed++; continue; }
    const publicId = match[1].replace(/\.[^/.]+$/, ""); // remove extension for public_id

    process.stdout.write(`🔓 ${sub.title.slice(0, 50)}... `);
    try {
      await cloudinary.api.update(publicId, {
        resource_type: "raw",
        access_mode: "public",
      });
      console.log("✓");
      fixed++;
    } catch (err) {
      console.log(`✗ ${err.message}`);
      failed++;
    }
    await new Promise(r => setTimeout(r, 200));
  }

  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`✅ Fixed: ${fixed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
