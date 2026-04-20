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

async function main() {
  const paperId = "cmnoar4e5001n7wb63co94x27";
  const uploadsDir = "/Users/arampandey/Projects/mediascholar-platform/public/uploads";
  
  // Upload all V4I1 files and pick based on order
  const v4i1Files = readdirSync(uploadsDir)
    .filter(f => f.includes("v4i1"))
    .sort();
  
  console.log("V4I1 files found:", v4i1Files);
  
  // The paper is the 20th in the issue listing. 
  // V4I1 has papers 01-06, "Social Media Consumption" is paper_v4i106.docx (last one)
  const targetFile = "paper_v4i106.docx";
  const filePath = join(uploadsDir, targetFile);
  const buffer = readFileSync(filePath);
  
  console.log(`Uploading ${targetFile} (${buffer.length} bytes)...`);
  
  const publicId = `mediascholar/papers/${paperId}`;
  const newUrl = await uploadToCloudinary(buffer, publicId);
  
  console.log("Cloudinary URL:", newUrl);
  
  await prisma.submission.update({
    where: { id: paperId },
    data: { fileUrl: newUrl },
  });
  
  console.log("✅ DB updated for:", paperId);
  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
