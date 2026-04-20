/**
 * Re-uploads all Cloudinary files with access_mode: "public" to fix 401 errors.
 * Downloads from current Cloudinary URL using API auth, re-uploads as public.
 */
import { PrismaClient } from "@prisma/client";
import { v2 as cloudinary } from "cloudinary";
import https from "https";

const prisma = new PrismaClient();

cloudinary.config({
  cloud_name: "dzewzfak6",
  api_key: "113345153332292",
  api_secret: "N0PrtVi6vq6yrUIqzJ0Ik69GFGo",
});

// Generate authenticated URL to download from Cloudinary
function getAuthenticatedUrl(publicId, resourceType = "raw") {
  const timestamp = Math.floor(Date.now() / 1000);
  return cloudinary.utils.private_download_url(publicId, "", {
    resource_type: resourceType,
    expires_at: timestamp + 3600,
  });
}

function fetchBuffer(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchBuffer(res.headers.location).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) return reject(new Error(`HTTP ${res.statusCode}`));
      const chunks = [];
      res.on("data", c => chunks.push(c));
      res.on("end", () => resolve(Buffer.concat(chunks)));
      res.on("error", reject);
    }).on("error", reject);
  });
}

function uploadPublic(buffer, publicId) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: "raw",
        public_id: publicId,
        overwrite: true,
        access_mode: "public",
        type: "upload",
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );
    stream.end(buffer);
  });
}

async function main() {
  const submissions = await prisma.submission.findMany({
    where: { fileUrl: { contains: "cloudinary.com" } },
    select: { id: true, fileUrl: true, title: true },
  });

  console.log(`\nRe-uploading ${submissions.length} files as public...\n`);

  let fixed = 0, failed = 0;

  for (const sub of submissions) {
    // Extract public_id from URL
    const match = sub.fileUrl.match(/\/upload\/(?:v\d+\/)?(.+)$/);
    if (!match) { console.log(`⚠ Can't parse: ${sub.fileUrl}`); failed++; continue; }
    
    // Full public_id including extension for raw resources
    const fullPublicId = match[1]; // e.g. mediascholar/papers/xxx.pdf
    const publicIdNoExt = fullPublicId.replace(/\.[^/.]+$/, "");

    process.stdout.write(`⬆  ${sub.title.slice(0, 50)}... `);

    try {
      // Download using signed URL
      const signedUrl = cloudinary.utils.private_download_url(publicIdNoExt, "", {
        resource_type: "raw",
        expires_at: Math.floor(Date.now() / 1000) + 3600,
      });

      const buffer = await fetchBuffer(signedUrl);
      const newUrl = await uploadPublic(buffer, fullPublicId);

      // Update DB only if URL changed
      if (newUrl !== sub.fileUrl) {
        await prisma.submission.update({ where: { id: sub.id }, data: { fileUrl: newUrl } });
      }
      console.log("✓");
      fixed++;
    } catch (err) {
      console.log(`✗ ${err.message}`);
      failed++;
    }

    await new Promise(r => setTimeout(r, 400));
  }

  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`✅ Fixed: ${fixed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
