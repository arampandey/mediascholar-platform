import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { v2 as cloudinary } from "cloudinary";
import CloudConvert from "cloudconvert";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Supported input formats → converted to PDF automatically
const SUPPORTED_TYPES: Record<string, string> = {
  "application/pdf": "pdf",
  "application/msword": "doc",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
  "application/vnd.oasis.opendocument.text": "odt",
  "application/rtf": "rtf",
  "text/rtf": "rtf",
};

const SUPPORTED_EXTENSIONS = [".pdf", ".doc", ".docx", ".odt", ".rtf"];

function isPdf(buf: Buffer): boolean {
  return buf[0] === 0x25 && buf[1] === 0x50 && buf[2] === 0x44 && buf[3] === 0x46; // %PDF
}

function detectFormat(file: File, buf: Buffer): string | null {
  // Magic bytes check for PDF
  if (isPdf(buf)) return "pdf";

  // MIME type check
  const mimeFormat = SUPPORTED_TYPES[file.type];
  if (mimeFormat) return mimeFormat;

  // Extension check (fallback — browsers sometimes send wrong MIME)
  const ext = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
  if (ext === ".doc") return "doc";
  if (ext === ".docx") return "docx";
  if (ext === ".odt") return "odt";
  if (ext === ".rtf") return "rtf";

  return null;
}

async function convertToPdf(buffer: Buffer, filename: string, inputFormat: string): Promise<Buffer> {
  const apiKey = process.env.CLOUDCONVERT_API_KEY;
  if (!apiKey) {
    throw new Error(
      "CLOUDCONVERT_API_KEY is not configured. Please add it to your Vercel environment variables."
    );
  }

  const cloudConvert = new CloudConvert(apiKey);

  // Create a job: upload → convert → export
  const job = await cloudConvert.jobs.create({
    tasks: {
      "upload-file": {
        operation: "import/upload",
      },
      "convert-to-pdf": {
        operation: "convert",
        input: ["upload-file"],
        input_format: inputFormat,
        output_format: "pdf",
      },
      "export-pdf": {
        operation: "export/url",
        input: ["convert-to-pdf"],
      },
    },
  });

  // Upload the source file
  const uploadTask = job.tasks.find((t: any) => t.name === "upload-file");
  if (!uploadTask) throw new Error("CloudConvert: upload task not found");

  await cloudConvert.tasks.upload(uploadTask as any, buffer as any, filename, buffer.length);

  // Wait for completion (polls until done or throws on failure)
  const finished = await cloudConvert.jobs.wait(job.id);

  // Get the download URL
  const exportTask = finished.tasks.find(
    (t: any) => t.name === "export-pdf" && t.status === "finished"
  );
  if (!exportTask || !(exportTask as any).result?.files?.[0]?.url) {
    throw new Error("CloudConvert: conversion failed or export URL not available");
  }

  const pdfUrl = (exportTask as any).result.files[0].url;
  const pdfResponse = await fetch(pdfUrl);
  if (!pdfResponse.ok) throw new Error("CloudConvert: failed to download converted PDF");

  return Buffer.from(await pdfResponse.arrayBuffer());
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

    if (file.size > 20 * 1024 * 1024) {
      return NextResponse.json({ error: "File size must not exceed 20MB" }, { status: 400 });
    }

    const rawBuffer = Buffer.from(await file.arrayBuffer());
    const inputFormat = detectFormat(file, rawBuffer);

    if (!inputFormat) {
      return NextResponse.json(
        {
          error: `Unsupported file format. Please upload a PDF, Word (.doc/.docx), ODT, or RTF file.`,
        },
        { status: 400 }
      );
    }

    // Convert to PDF if not already PDF
    let pdfBuffer: Buffer;
    if (inputFormat === "pdf") {
      pdfBuffer = rawBuffer;
    } else {
      pdfBuffer = await convertToPdf(rawBuffer, file.name, inputFormat);
    }

    // Build a clean filename with .pdf extension
    const timestamp = Date.now();
    const baseName = file.name.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9._-]/g, "_");
    const filename = `${timestamp}-${baseName}.pdf`;

    // Upload PDF to Cloudinary
    const fileUrl = await new Promise<string>((resolve, reject) => {
      const publicId = `mediascholar/papers/${filename.replace(/\.pdf$/, "")}`;
      const uploadStream = cloudinary.uploader.upload_stream(
        { resource_type: "raw", public_id: publicId, overwrite: true, access_mode: "public" },
        (error, result) => {
          if (error) return reject(error);
          resolve(result!.secure_url);
        }
      );
      uploadStream.end(pdfBuffer);
    });

    return NextResponse.json({ fileUrl });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: error.message || "Upload failed" }, { status: 500 });
  }
}
